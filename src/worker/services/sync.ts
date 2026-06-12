import { Env } from '../index';
import { FD_MATCH_IDS } from '../data/constants';

// ─────────────────────────────────────────────────────────────────────────────
// SOURCE 1: sportsapipro.com  (real-time live scores — replaces worldcup26.ir)
//
// Uses GET /api/live (V2), filters for FIFA World Cup events only.
// Matches by team name against our match_results rows.
//
// Owns columns: home_score, away_score, status, winner, match_minute, updated_at
// Never touches: stats (possession, shots, corners, cards), assists, HT score
// ─────────────────────────────────────────────────────────────────────────────

interface SALiveEvent {
  id: number;
  slug: string;
  tournament: string;       // "FIFA World Cup, Group A"
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  status: string;           // "1st half" | "2nd half" | "halftime" | "finished" | ...
  startTimestamp: number;
}

interface SAMatchDetail {
  status: { code: number; description: string; type: string };
  homeScore: { current: number; display: number; period1?: number; normaltime?: number };
  awayScore: { current: number; display: number; period1?: number; normaltime?: number };
  time: { currentPeriodStartTimestamp?: number; initial?: number };
  homeTeam: { name: string };
  awayTeam: { name: string };
  incidents?: Array<{
    incidentType: string;  // "goal" | "card" | "substitution"
    incidentClass?: string; // "regular" | "own" | "penalty" | "yellow" | "red" | "yellowRed"
    time: number;
    player?: { name: string };
    playerName?: string;
    assist1?: { name: string };
    isHome: boolean;
  }>;
}

/** Map sportsapipro status string → our DB status value */
function mapSAStatus(s: string): string {
  const l = s.toLowerCase();
  if (l.includes('halftime') || l === 'half time') return 'HALFTIME';
  if (l.includes('1st half') || l.includes('2nd half') || l.includes('extra time') || l === 'inprogress') return 'IN_PLAY';
  if (l.includes('finish') || l.includes('ended') || l.includes('after extra') || l.includes('after pen')) return 'FINISHED';
  return 'TIMED';
}

/** Normalise team names for fuzzy matching (strip accents, lowercase, trim) */
function normTeam(name: string): string {
  return name.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')  // strip diacritics
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * syncLiveScores — runs every cron cycle.
 * Fetches live WC matches from sportsapipro, matches them to our match_nums
 * by team name, and updates scores/status in D1.
 * For each live/finished match, also fetches incidents (goals + cards).
 */
export async function syncLiveScores(env: Env): Promise<void> {
  // 1. Fetch live events, filter for World Cup
  let wcEvents: SALiveEvent[];
  try {
    const res = await fetch('https://v2.football.sportsapipro.com/api/live', {
      headers: { 'x-api-key': env.SPORTSAPI_KEY },
    });
    if (!res.ok) return;
    const data = await res.json() as { events?: SALiveEvent[] };
    wcEvents = (data.events ?? []).filter(e => e.tournament?.includes('World Cup'));
    if (!wcEvents.length) {
      // Nothing live right now — still update any IN_PLAY rows to FINISHED if needed
      // (handled by syncMatchStats from FD). Just return.
      return;
    }
  } catch {
    return;
  }

  // 2. Load all match_results rows so we can match by team name
  const allMatches = await env.DB.prepare(
    'SELECT match_num, home_team, away_team, home_score, away_score, status FROM match_results'
  ).all<{ match_num: number; home_team: string; away_team: string; home_score: number | null; away_score: number | null; status: string }>();

  // Build lookup: normTeam(home)+'|'+normTeam(away) → match_num
  const teamIndex: Record<string, number> = {};
  for (const row of allMatches.results) {
    if (row.home_team && row.away_team) {
      teamIndex[`${normTeam(row.home_team)}|${normTeam(row.away_team)}`] = row.match_num;
    }
  }

  const prevScores: Record<number, { home: number; away: number }> = {};
  for (const row of allMatches.results) {
    if (row.home_score !== null && row.away_score !== null) {
      prevScores[row.match_num] = { home: row.home_score, away: row.away_score };
    }
  }

  const now = Date.now();
  const matchStmts:  D1PreparedStatement[] = [];
  const goalStmts:   D1PreparedStatement[] = [];
  const cardStmts:   D1PreparedStatement[] = [];
  const eventStmts:  D1PreparedStatement[] = [];

  for (const evt of wcEvents) {
    // Resolve match_num via team name
    const key = `${normTeam(evt.homeTeam)}|${normTeam(evt.awayTeam)}`;
    const matchNum = teamIndex[key];
    if (!matchNum) continue;

    const homeScore = evt.homeScore ?? null;
    const awayScore = evt.awayScore ?? null;
    const status = mapSAStatus(evt.status);
    const isFinished = status === 'FINISHED';

    let winner: string | null = null;
    if (isFinished && homeScore !== null && awayScore !== null) {
      if (homeScore > awayScore) winner = evt.homeTeam;
      else if (awayScore > homeScore) winner = evt.awayTeam;
    }

    // Fetch per-match detail for live minute + incidents (goals/cards)
    let matchMinute: number | null = null;
    let incidents: SAMatchDetail['incidents'] = [];
    try {
      const dr = await fetch(`https://v2.football.sportsapipro.com/api/match/${evt.id}`, {
        headers: { 'x-api-key': env.SPORTSAPI_KEY },
      });
      if (dr.ok) {
        const dd = await dr.json() as { match?: SAMatchDetail };
        const m = dd.match;
        if (m) {
          // Calculate live minute from period start timestamp
          const periodStart = m.time?.currentPeriodStartTimestamp;
          const initial = m.time?.initial ?? 0;
          if (periodStart && status === 'IN_PLAY') {
            matchMinute = Math.floor((Date.now() / 1000 - periodStart + initial) / 60);
          }
          incidents = m.incidents ?? [];
        }
      }
    } catch { /* fail silently — score update still proceeds */ }

    // Update match score/status
    matchStmts.push(env.DB.prepare(
      `UPDATE match_results
       SET home_score=?, away_score=?, status=?, winner=?, match_minute=?, updated_at=?
       WHERE match_num=?`
    ).bind(homeScore, awayScore, status, winner, matchMinute, now, matchNum));

    // Score change event
    const prev = prevScores[matchNum];
    if (!prev || prev.home !== homeScore || prev.away !== awayScore) {
      if (homeScore !== null && awayScore !== null) {
        eventStmts.push(env.DB.prepare(
          `INSERT OR IGNORE INTO score_events (match_num, home_score, away_score, detected_at)
           VALUES (?, ?, ?, ?)`
        ).bind(matchNum, homeScore, awayScore, now));
      }
    }

    // Parse incidents → goals + cards
    for (const inc of incidents) {
      if (inc.incidentType === 'goal') {
        const scorerName = inc.player?.name ?? inc.playerName ?? null;
        const assistName = inc.assist1?.name ?? null;
        const teamName = inc.isHome ? evt.homeTeam : evt.awayTeam;
        const goalType = inc.incidentClass === 'own' ? 'OWN'
          : inc.incidentClass === 'penalty' ? 'PENALTY'
          : 'REGULAR';
        if (scorerName) {
          goalStmts.push(env.DB.prepare(
            `INSERT INTO goal_events (match_num, minute, scorer_name, team_name, goal_type, assist_name)
             VALUES (?, ?, ?, ?, ?, ?)
             ON CONFLICT(match_num, minute, scorer_name, goal_type) DO UPDATE SET
               assist_name = excluded.assist_name, team_name = excluded.team_name`
          ).bind(matchNum, inc.time ?? null, scorerName, teamName, goalType, assistName));
        }
      } else if (inc.incidentType === 'card') {
        const playerName = inc.player?.name ?? inc.playerName ?? null;
        const teamName = inc.isHome ? evt.homeTeam : evt.awayTeam;
        const cardType = inc.incidentClass === 'red' ? 'RED'
          : inc.incidentClass === 'yellowRed' ? 'YELLOW_RED'
          : 'YELLOW';
        cardStmts.push(env.DB.prepare(
          `INSERT OR IGNORE INTO card_events (match_num, minute, player_name, team_name, card_type)
           VALUES (?, ?, ?, ?, ?)`
        ).bind(matchNum, inc.time ?? null, playerName, teamName, cardType));
      }
    }
  }

  for (let i = 0; i < matchStmts.length; i += 20) await env.DB.batch(matchStmts.slice(i, i + 20));
  for (let i = 0; i < goalStmts.length;  i += 20) await env.DB.batch(goalStmts.slice(i,  i + 20));
  for (let i = 0; i < cardStmts.length;  i += 20) await env.DB.batch(cardStmts.slice(i,  i + 20));
  for (let i = 0; i < eventStmts.length; i += 20) await env.DB.batch(eventStmts.slice(i, i + 20));
}

// ─────────────────────────────────────────────────────────────────────────────
// SOURCE 2: football-data.org  (post-match stats, assists, cards, standings)
//
// Only processes matches already marked FINISHED in our DB.
// Owns columns: home_score_ht, away_score_ht, home_possession, away_possession,
//               home_shots_on, away_shots_on, home_corners, away_corners,
//               home_yellow, away_yellow, home_red, away_red, match_injury.
// Also populates goal_events (with assists) and card_events.
// Never touches: home_score, away_score, status, winner, match_minute.
// ─────────────────────────────────────────────────────────────────────────────

interface FDGoal {
  minute: number | null;
  injuryTime: number | null;
  type: string;
  team: { name: string | null };
  scorer: { name: string | null } | null;
  assist: { name: string | null } | null;
}

interface FDBooking {
  minute: number | null;
  card: string;
  player: { name: string | null };
  team: { name: string | null };
}

interface FDTeamStats {
  ball_possession: number | null;
  shots_on_goal: number | null;
  corner_kicks: number | null;
  yellow_cards: number | null;
  red_cards: number | null;
}

interface FDMatch {
  id: number;
  status: string;
  minute?: number | null;
  injuryTime?: number | null;
  score: {
    winner: string | null;
    fullTime: { home: number | null; away: number | null };
    halfTime: { home: number | null; away: number | null };
  };
  homeTeam: { name: string | null; statistics?: FDTeamStats | null };
  awayTeam: { name: string | null; statistics?: FDTeamStats | null };
  goals?: FDGoal[];
  bookings?: FDBooking[];
}

/**
 * syncMatchStats — runs every cron cycle after syncLiveScores.
 * Only writes post-match detail (stats, assists, cards, HT score, standings).
 * Skips any match not yet FINISHED in our DB so it never races with live sync.
 */
export async function syncMatchStats(env: Env): Promise<void> {
  // Find match_nums already marked FINISHED so we only enrich those
  const finishedRows = await env.DB.prepare(
    'SELECT match_num, fd_match_id FROM match_results WHERE status = ?'
  ).bind('FINISHED').all<{ match_num: number; fd_match_id: number }>();

  // Also ensure all rows exist (initial seed from FD for matches not yet started)
  const res = await fetch('https://api.football-data.org/v4/competitions/WC/matches?season=2026', {
    headers: {
      'X-Auth-Token': env.FOOTBALL_DATA_TOKEN,
      'X-Unfold-Goals': 'true',
      'X-Unfold-Bookings': 'true',
    },
  });
  if (!res.ok) return;

  const data = await res.json() as { matches: FDMatch[] };
  const now = Date.now();

  // Build set of finished match_nums for quick lookup
  const finishedNums = new Set(finishedRows.results.map(r => r.match_num));

  // ── Step 1: ensure all 104 rows exist (INSERT OR IGNORE — never overwrites) ──
  const seedStmts = data.matches.map(m => {
    const matchNum = FD_MATCH_IDS.indexOf(m.id) + 1;
    if (!matchNum) return null;
    return env.DB.prepare(
      `INSERT OR IGNORE INTO match_results
         (fd_match_id, match_num, home_team, away_team, status, updated_at)
       VALUES (?, ?, ?, ?, 'TIMED', ?)`
    ).bind(m.id, matchNum, m.homeTeam.name ?? null, m.awayTeam.name ?? null, now);
  }).filter((s): s is D1PreparedStatement => s !== null);

  for (let i = 0; i < seedStmts.length; i += 20) await env.DB.batch(seedStmts.slice(i, i + 20));

  // ── Step 2: enrich only FINISHED matches with stats, HT score ──────────────
  const statStmts: D1PreparedStatement[] = [];
  const goalStmts: D1PreparedStatement[] = [];
  const cardStmts: D1PreparedStatement[] = [];

  for (const m of data.matches) {
    const matchNum = FD_MATCH_IDS.indexOf(m.id) + 1;
    if (!matchNum || !finishedNums.has(matchNum)) continue; // skip non-finished

    const hs = m.homeTeam.statistics ?? null;
    const as_ = m.awayTeam.statistics ?? null;

    statStmts.push(env.DB.prepare(
      `UPDATE match_results SET
         home_score_ht   = ?, away_score_ht   = ?,
         home_possession = ?, away_possession = ?,
         home_shots_on   = ?, away_shots_on   = ?,
         home_corners    = ?, away_corners    = ?,
         home_yellow     = ?, away_yellow     = ?,
         home_red        = ?, away_red        = ?,
         updated_at      = ?
       WHERE match_num = ?`
    ).bind(
      m.score.halfTime.home ?? null, m.score.halfTime.away ?? null,
      hs?.ball_possession ?? null,   as_?.ball_possession ?? null,
      hs?.shots_on_goal ?? null,     as_?.shots_on_goal ?? null,
      hs?.corner_kicks ?? null,      as_?.corner_kicks ?? null,
      hs?.yellow_cards ?? null,      as_?.yellow_cards ?? null,
      hs?.red_cards ?? null,         as_?.red_cards ?? null,
      now, matchNum,
    ));

    // Goals with assists — upsert so FD's richer data (extra_time, assist) wins
    // for finished matches. INSERT OR REPLACE would drop the row id; use
    // INSERT OR IGNORE + UPDATE instead to safely backfill assist_name.
    for (const g of m.goals ?? []) {
      const scorerName = g.scorer?.name ?? null;
      const teamName   = g.team?.name ?? null;
      const goalType   = g.type ?? null;
      const minute     = g.minute ?? null;
      goalStmts.push(env.DB.prepare(
        `INSERT INTO goal_events
           (match_num, minute, extra_time, scorer_name, team_name, goal_type, assist_name)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(match_num, minute, scorer_name, goal_type) DO UPDATE SET
           extra_time  = excluded.extra_time,
           assist_name = excluded.assist_name,
           team_name   = excluded.team_name`
      ).bind(
        matchNum,
        minute, g.injuryTime ?? null,
        scorerName, teamName, goalType, g.assist?.name ?? null,
      ));
    }

    // Cards
    for (const b of m.bookings ?? []) {
      cardStmts.push(env.DB.prepare(
        `INSERT OR IGNORE INTO card_events (match_num, minute, player_name, team_name, card_type)
         VALUES (?, ?, ?, ?, ?)`
      ).bind(matchNum, b.minute ?? null, b.player?.name ?? null, b.team?.name ?? null, b.card ?? null));
    }
  }

  for (let i = 0; i < statStmts.length; i += 20) await env.DB.batch(statStmts.slice(i, i + 20));
  for (let i = 0; i < goalStmts.length;  i += 20) await env.DB.batch(goalStmts.slice(i,  i + 20));
  for (let i = 0; i < cardStmts.length;  i += 20) await env.DB.batch(cardStmts.slice(i,  i + 20));

  // ── Step 3: group standings + top scorer (always, not match-dependent) ─────
  await syncGroupStandings(env);
  await syncTopScorer(env);
}

async function syncTopScorer(env: Env): Promise<void> {
  const res = await fetch('https://api.football-data.org/v4/competitions/WC/scorers?season=2026&limit=1', {
    headers: { 'X-Auth-Token': env.FOOTBALL_DATA_TOKEN },
  });
  if (!res.ok) return;
  const data = await res.json() as { scorers?: Array<{ player: { name: string } }> };
  const name = data.scorers?.[0]?.player?.name ?? null;
  if (!name) return;
  await env.DB.prepare(
    `INSERT INTO config (key, value, updated_at) VALUES ('top_scorer', ?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`
  ).bind(name, Date.now()).run();
}

async function syncGroupStandings(env: Env): Promise<void> {
  const res = await fetch('https://api.football-data.org/v4/competitions/WC/standings?season=2026', {
    headers: { 'X-Auth-Token': env.FOOTBALL_DATA_TOKEN },
  });
  if (!res.ok) return;

  const data = await res.json() as {
    standings: Array<{
      type: string;
      group: string | null;
      table: Array<{ position: number; team: { name: string } }>;
    }>;
  };

  const now = Date.now();
  const stmts: D1PreparedStatement[] = [];
  for (const s of data.standings) {
    if (s.type !== 'TOTAL' || !s.group) continue;
    const letter = s.group.replace('GROUP_', '');
    for (const row of s.table) {
      stmts.push(env.DB.prepare(
        `INSERT INTO group_standings (group_letter, position, team_name, updated_at)
         VALUES (?, ?, ?, ?)
         ON CONFLICT(group_letter, position) DO UPDATE SET
           team_name = excluded.team_name, updated_at = excluded.updated_at`
      ).bind(letter, row.position, row.team.name, now));
    }
  }
  for (let i = 0; i < stmts.length; i += 20) await env.DB.batch(stmts.slice(i, i + 20));
}
