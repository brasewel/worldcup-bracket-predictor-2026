import { Env } from '../index';
import { FD_MATCH_IDS } from '../data/constants';

// ─────────────────────────────────────────────────────────────────────────────
// SOURCE 1: worldcup26.ir  (real-time scores, status, scorers)
//
// Owns columns: home_score, away_score, status, winner, match_minute, updated_at
// Never touches: stats (possession, shots, corners, cards), assists, HT score
// ─────────────────────────────────────────────────────────────────────────────

interface WC26Game {
  id: string;                   // "1"–"104", maps directly to match_num
  home_team_name_en: string | null;
  away_team_name_en: string | null;
  home_score: string | null;    // "2" or null
  away_score: string | null;
  home_scorers: string | null;  // PostgreSQL array: {"Name 9'","Name2 45'"}
  away_scorers: string | null;
  time_elapsed: string | null;  // "live" | "halftime" | "finished" | "notstarted" | "67" (minute)
  finished: string | null;      // "TRUE" / "FALSE" (lags behind time_elapsed)
  type: string | null;          // "group" | "knockout"
}

/** Parse PostgreSQL-style array string {"Name 9'","Name2 45'"} → string[]
 *
 * The API uses mixed smart/straight quotes inconsistently — e.g. the second
 * entry in a multi-scorer string can open with \u201d (right smart quote)
 * instead of \u201c (left smart quote).  The strategy here is to split on
 * any run of quote chars and take every odd-indexed token (the content between
 * delimiters), which is robust regardless of which quote flavour is used.
 */
function parseScorers(raw: string | null): string[] {
  if (!raw || raw === 'null') return [];
  const inner = raw.replace(/^\{/, '').replace(/\}$/, '').trim();
  if (!inner) return [];

  // Split on any sequence of smart/straight quotes (the delimiters)
  const parts = inner.split(/[\u201c\u201d"]+/);
  // Odd-indexed parts are the content between quote pairs
  const results: string[] = [];
  for (let i = 1; i < parts.length; i += 2) {
    const s = parts[i].trim();
    if (s) results.push(s);
  }
  // Fallback: strip all quote chars and split on commas
  if (!results.length) {
    results.push(...inner.replace(/[\u201c\u201d"]/g, '').split(',').map(s => s.trim()).filter(Boolean));
  }
  return results;
}

/** Parse scorer string "J. Quiñones 9'" → { name, minute }
 *  Handles straight apostrophe, prime (′), and right single smart quote (').
 */
function parseScorer(entry: string): { name: string; minute: number | null } {
  const minuteMatch = entry.match(/(\d+)(?:\+\d+)?['\u2032\u2019]?\s*$/);
  const minute = minuteMatch ? parseInt(minuteMatch[1], 10) : null;
  const name = entry.replace(/\s*\d+(?:\+\d+)?['\u2032\u2019]?\s*$/, '').trim();
  return { name, minute };
}

/**
 * syncLiveScores — runs every cron cycle.
 * Sole authority on: home_score, away_score, status, winner, match_minute.
 * Also inserts goal_events from scorer strings (with INSERT OR IGNORE dedup).
 * Fails silently if the community API is down.
 */
export async function syncLiveScores(env: Env): Promise<void> {
  let games: WC26Game[];
  try {
    const res = await fetch('https://worldcup26.ir/get/games');
    if (!res.ok) return;
    const raw = await res.json() as unknown;
    // API returns either a bare array or { games: [...] }
    if (Array.isArray(raw)) {
      games = raw as WC26Game[];
    } else if (raw && typeof raw === 'object' && Array.isArray((raw as { games?: unknown }).games)) {
      games = (raw as { games: WC26Game[] }).games;
    } else {
      return;
    }
    if (!games.length) return;
  } catch {
    return;
  }

  const now = Date.now();

  // Snapshot existing scores so we can detect changes → score_events
  const existing = await env.DB.prepare(
    'SELECT match_num, home_score, away_score FROM match_results WHERE home_score IS NOT NULL'
  ).all<{ match_num: number; home_score: number; away_score: number }>();
  const prevScores: Record<number, { home: number; away: number }> = {};
  for (const r of existing.results) {
    prevScores[r.match_num] = { home: r.home_score, away: r.away_score };
  }

  const matchStmts: D1PreparedStatement[] = [];
  const goalStmts: D1PreparedStatement[]  = [];
  const eventStmts: D1PreparedStatement[] = [];

  for (const g of games) {
    const matchNum = parseInt(g.id, 10);
    if (!matchNum || matchNum < 1 || matchNum > 104) continue;

    const homeScore = g.home_score ? parseInt(g.home_score, 10) : null;
    const awayScore = g.away_score ? parseInt(g.away_score, 10) : null;

    // Use time_elapsed as primary signal; finished flag lags behind
    const elapsed = g.time_elapsed ?? '';
    const isFinished = g.finished === 'TRUE' || elapsed === 'finished';
    const isLive     = !isFinished && elapsed === 'live';
    const isHalfTime = !isFinished && (elapsed === 'halftime' || elapsed === 'half-time');

    const status = isFinished ? 'FINISHED'
      : isLive     ? 'IN_PLAY'
      : isHalfTime ? 'HALFTIME'
      : 'TIMED';

    const minuteNum = parseInt(elapsed, 10);
    const matchMinute = isLive && !isNaN(minuteNum) ? minuteNum : null;

    let winner: string | null = null;
    if (isFinished && homeScore !== null && awayScore !== null) {
      if (homeScore > awayScore) winner = g.home_team_name_en ?? null;
      else if (awayScore > homeScore) winner = g.away_team_name_en ?? null;
    }

    if (homeScore !== null && awayScore !== null) {
      matchStmts.push(env.DB.prepare(
        `UPDATE match_results
         SET home_score=?, away_score=?, status=?, winner=?, match_minute=?, updated_at=?
         WHERE match_num=?`
      ).bind(homeScore, awayScore, status, winner, matchMinute, now, matchNum));

      // Emit score_event when score changes
      const prev = prevScores[matchNum];
      if (!prev || prev.home !== homeScore || prev.away !== awayScore) {
        eventStmts.push(env.DB.prepare(
          `INSERT OR IGNORE INTO score_events (match_num, home_score, away_score, detected_at)
           VALUES (?, ?, ?, ?)`
        ).bind(matchNum, homeScore, awayScore, now));
      }
    } else {
      // No score yet — just update status (e.g. TIMED → HALFTIME)
      matchStmts.push(env.DB.prepare(
        `UPDATE match_results SET status=?, match_minute=?, updated_at=? WHERE match_num=?`
      ).bind(status, matchMinute, now, matchNum));
    }

    // Goal events from scorer strings (deduped by unique constraint)
    const homeTeam = g.home_team_name_en ?? null;
    const awayTeam = g.away_team_name_en ?? null;

    for (const entry of parseScorers(g.home_scorers)) {
      const { name, minute } = parseScorer(entry);
      if (name) goalStmts.push(env.DB.prepare(
        `INSERT OR IGNORE INTO goal_events (match_num, minute, scorer_name, team_name, goal_type)
         VALUES (?, ?, ?, ?, 'REGULAR')`
      ).bind(matchNum, minute, name, homeTeam));
    }

    for (const entry of parseScorers(g.away_scorers)) {
      const { name, minute } = parseScorer(entry);
      if (name) goalStmts.push(env.DB.prepare(
        `INSERT OR IGNORE INTO goal_events (match_num, minute, scorer_name, team_name, goal_type)
         VALUES (?, ?, ?, ?, 'REGULAR')`
      ).bind(matchNum, minute, name, awayTeam));
    }
  }

  for (let i = 0; i < matchStmts.length; i += 20) await env.DB.batch(matchStmts.slice(i, i + 20));
  for (let i = 0; i < goalStmts.length;  i += 20) await env.DB.batch(goalStmts.slice(i,  i + 20));
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
