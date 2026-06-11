import { Env } from '../index';
import { FD_MATCH_IDS } from '../data/constants';

// ── worldcup26.ir community API (real-time live scores) ──────────────────────

interface WC26Game {
  id: string;                   // "1" – "104", maps directly to match_num
  home_team_name_en: string | null;
  away_team_name_en: string | null;
  home_score: string | null;    // "1" or null/"0"
  away_score: string | null;
  home_scorers: string | null;  // PostgreSQL array string: {"Name 9'", "Name2 45'"}
  away_scorers: string | null;
  time_elapsed: string | null;  // "live", "notstarted", "45", "halftime", "finished" etc.
  finished: string | null;      // "TRUE" / "FALSE"
  type: string | null;          // "group" | "knockout"
}

/** Parse PostgreSQL-style array string {"Name 9'","Name2 45'"} → string[] */
function parseScorers(raw: string | null): string[] {
  if (!raw || raw === 'null') return [];
  const inner = raw.replace(/^\{/, '').replace(/\}$/, '');
  if (!inner.trim()) return [];
  const results: string[] = [];
  // Match content between any kind of opening/closing quote (smart or straight)
  // \u201c = " (left double), \u201d = " (right double)
  const re = /[\u201c\u201d\u0022](.*?)[\u201c\u201d\u0022]/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(inner)) !== null) {
    if (match[1].trim()) results.push(match[1].trim());
  }
  // Fallback: strip all quote chars and split on commas
  if (!results.length) {
    const stripped = inner.replace(/[\u201c\u201d\u0022]/g, '');
    results.push(...stripped.split(',').map(s => s.trim()).filter(Boolean));
  }
  return results;
}

/** Parse scorer string like "J. Quiñones 9'" → { name, minute } */
function parseScorer(entry: string): { name: string; minute: number | null } {
  const minuteMatch = entry.match(/(\d+)(?:\+\d+)?['′]?\s*$/);
  const minute = minuteMatch ? parseInt(minuteMatch[1], 10) : null;
  const name = entry.replace(/\s*\d+(?:\+\d+)?['′]?\s*$/, '').trim();
  return { name, minute };
}

export async function syncLiveScores(env: Env): Promise<void> {
  let games: WC26Game[];
  try {
    const res = await fetch('https://worldcup26.ir/get/games');
    if (!res.ok) return;
    const raw = await res.json() as WC26Game[] | unknown;
    games = Array.isArray(raw) ? raw as WC26Game[] : [];
    if (!games.length) return;
  } catch {
    return; // Community API down — fail silently, don't break the main sync
  }

  const now = Date.now();

  // Read existing scores to detect changes for score_events
  const existingScores = await env.DB.prepare(
    'SELECT match_num, home_score, away_score FROM match_results WHERE home_score IS NOT NULL'
  ).all<{ match_num: number; home_score: number; away_score: number }>();
  const existingMap: Record<number, { home: number; away: number }> = {};
  for (const r of existingScores.results) {
    existingMap[r.match_num] = { home: r.home_score, away: r.away_score };
  }

  const matchStmts: D1PreparedStatement[] = [];
  const goalStmts: D1PreparedStatement[] = [];
  const scoreEventStmts: D1PreparedStatement[] = [];

  for (const g of games) {
    const matchNum = parseInt(g.id, 10);
    if (!matchNum || matchNum < 1 || matchNum > 104) continue;

    const homeScore = g.home_score !== null && g.home_score !== '' ? parseInt(g.home_score, 10) : null;
    const awayScore = g.away_score !== null && g.away_score !== '' ? parseInt(g.away_score, 10) : null;

    // The API uses both g.finished === 'TRUE' and g.time_elapsed === 'finished'
    const isFinished = g.finished === 'TRUE' || g.time_elapsed === 'finished';
    const isLive = !isFinished && g.time_elapsed === 'live';
    const isHalfTime = !isFinished && (g.time_elapsed === 'halftime' || g.time_elapsed === 'half-time');

    // Map to our status values
    let status: string;
    if (isFinished) status = 'FINISHED';
    else if (isLive) status = 'IN_PLAY';
    else if (isHalfTime) status = 'HALFTIME';
    else status = 'TIMED';

    // Parse minute from time_elapsed (e.g. "67" → 67)
    const minuteRaw = g.time_elapsed ? parseInt(g.time_elapsed, 10) : NaN;
    const matchMinute = !isNaN(minuteRaw) && isLive ? minuteRaw : null;

    // Winner (only for finished matches)
    let winner: string | null = null;
    if (isFinished && homeScore !== null && awayScore !== null) {
      if (homeScore > awayScore) winner = g.home_team_name_en ?? null;
      else if (awayScore > homeScore) winner = g.away_team_name_en ?? null;
    }

    // Only update score/status/minute — do NOT overwrite rich FD stats (possession etc.)
    // Use match_num as lookup key since this API doesn't have fd_match_id
    if (homeScore !== null && awayScore !== null) {
      matchStmts.push(env.DB.prepare(
        `UPDATE match_results SET
           home_score   = ?, away_score  = ?,
           status       = ?, winner      = ?,
           match_minute = ?, updated_at  = ?
         WHERE match_num = ?`
      ).bind(homeScore, awayScore, status, winner, matchMinute, now, matchNum));
    } else {
      // No score yet — only update status
      matchStmts.push(env.DB.prepare(
        `UPDATE match_results SET status = ?, match_minute = ?, updated_at = ? WHERE match_num = ?`
      ).bind(status, matchMinute, now, matchNum));
    }

    // Detect score change → score_events
    if (homeScore !== null && awayScore !== null) {
      const prev = existingMap[matchNum];
      if (!prev || prev.home !== homeScore || prev.away !== awayScore) {
        scoreEventStmts.push(env.DB.prepare(
          `INSERT OR IGNORE INTO score_events (match_num, home_score, away_score, detected_at) VALUES (?, ?, ?, ?)`
        ).bind(matchNum, homeScore, awayScore, now));
      }
    }

    // Sync scorers from home_scorers / away_scorers strings
    const homeTeam = g.home_team_name_en ?? null;
    const awayTeam = g.away_team_name_en ?? null;

    const homeScorers = parseScorers(g.home_scorers);
    for (const entry of homeScorers) {
      const { name, minute } = parseScorer(entry);
      if (!name) continue;
      goalStmts.push(env.DB.prepare(
        `INSERT OR IGNORE INTO goal_events (match_num, minute, scorer_name, team_name, goal_type)
         VALUES (?, ?, ?, ?, ?)`
      ).bind(matchNum, minute, name, homeTeam, 'REGULAR'));
    }

    const awayScorers = parseScorers(g.away_scorers);
    for (const entry of awayScorers) {
      const { name, minute } = parseScorer(entry);
      if (!name) continue;
      goalStmts.push(env.DB.prepare(
        `INSERT OR IGNORE INTO goal_events (match_num, minute, scorer_name, team_name, goal_type)
         VALUES (?, ?, ?, ?, ?)`
      ).bind(matchNum, minute, name, awayTeam, 'REGULAR'));
    }
  }

  for (let i = 0; i < matchStmts.length; i += 20) {
    await env.DB.batch(matchStmts.slice(i, i + 20));
  }
  for (let i = 0; i < goalStmts.length; i += 20) {
    await env.DB.batch(goalStmts.slice(i, i + 20));
  }
  for (let i = 0; i < scoreEventStmts.length; i += 20) {
    await env.DB.batch(scoreEventStmts.slice(i, i + 20));
  }
}

interface FDGoal {
  minute: number | null;
  injuryTime: number | null;
  type: string; // REGULAR, OWN, PENALTY
  team: { name: string | null };
  scorer: { name: string | null } | null;
  assist: { name: string | null } | null;
}

interface FDBooking {
  minute: number | null;
  card: string; // YELLOW, RED, YELLOW_RED
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

export async function syncMatchResults(env: Env): Promise<void> {
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

  // Read existing scores before upsert so we can detect changes
  const existingScores = await env.DB.prepare(
    'SELECT match_num, home_score, away_score FROM match_results WHERE home_score IS NOT NULL'
  ).all<{ match_num: number; home_score: number; away_score: number }>();
  const existingMap: Record<number, { home: number; away: number }> = {};
  for (const r of existingScores.results) {
    existingMap[r.match_num] = { home: r.home_score, away: r.away_score };
  }

  const stmts = data.matches.map(m => {
    const matchNum = FD_MATCH_IDS.indexOf(m.id) + 1;
    if (matchNum === 0) return null;

    let winner: string | null = null;
    if (m.score.winner === 'HOME_TEAM') winner = m.homeTeam.name ?? null;
    else if (m.score.winner === 'AWAY_TEAM') winner = m.awayTeam.name ?? null;

    const hs = m.homeTeam.statistics ?? null;
    const as_ = m.awayTeam.statistics ?? null;

    // Only store minute for live matches
    const isLive = m.status === 'IN_PLAY' || m.status === 'PAUSED';
    const matchMinute = isLive ? (m.minute ?? null) : null;
    const matchInjury = isLive ? (m.injuryTime ?? null) : null;

    return env.DB.prepare(
      `INSERT INTO match_results (
         fd_match_id, match_num, home_team, away_team,
         home_score, away_score, home_score_ht, away_score_ht,
         status, winner,
         home_possession, away_possession,
         home_shots_on, away_shots_on,
         home_corners, away_corners,
         home_yellow, away_yellow,
         home_red, away_red,
         match_minute, match_injury,
         updated_at
       )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(fd_match_id) DO UPDATE SET
         home_team = excluded.home_team,
         away_team = excluded.away_team,
         -- Only overwrite score/status/winner if FD actually has data; otherwise keep what live sync wrote
         home_score = CASE WHEN excluded.home_score IS NOT NULL THEN excluded.home_score ELSE home_score END,
         away_score = CASE WHEN excluded.away_score IS NOT NULL THEN excluded.away_score ELSE away_score END,
         home_score_ht = excluded.home_score_ht,
         away_score_ht = excluded.away_score_ht,
         status = CASE WHEN excluded.status != 'TIMED' THEN excluded.status ELSE status END,
         winner = CASE WHEN excluded.winner IS NOT NULL THEN excluded.winner ELSE winner END,
         home_possession = excluded.home_possession,
         away_possession = excluded.away_possession,
         home_shots_on = excluded.home_shots_on,
         away_shots_on = excluded.away_shots_on,
         home_corners = excluded.home_corners,
         away_corners = excluded.away_corners,
         home_yellow = excluded.home_yellow,
         away_yellow = excluded.away_yellow,
         home_red = excluded.home_red,
         away_red = excluded.away_red,
         match_minute = CASE WHEN excluded.match_minute IS NOT NULL THEN excluded.match_minute ELSE match_minute END,
         match_injury = excluded.match_injury,
         updated_at = excluded.updated_at`
    ).bind(
      m.id, matchNum,
      m.homeTeam.name ?? null,
      m.awayTeam.name ?? null,
      m.score.fullTime.home ?? null,
      m.score.fullTime.away ?? null,
      m.score.halfTime.home ?? null,
      m.score.halfTime.away ?? null,
      m.status, winner,
      hs?.ball_possession ?? null,
      as_?.ball_possession ?? null,
      hs?.shots_on_goal ?? null,
      as_?.shots_on_goal ?? null,
      hs?.corner_kicks ?? null,
      as_?.corner_kicks ?? null,
      hs?.yellow_cards ?? null,
      as_?.yellow_cards ?? null,
      hs?.red_cards ?? null,
      as_?.red_cards ?? null,
      matchMinute,
      matchInjury,
      now,
    );
  }).filter((s): s is D1PreparedStatement => s !== null);

  for (let i = 0; i < stmts.length; i += 20) {
    await env.DB.batch(stmts.slice(i, i + 20));
  }

  // Detect score changes → insert score_events
  const eventStmts: D1PreparedStatement[] = [];
  for (const m of data.matches) {
    const matchNum = FD_MATCH_IDS.indexOf(m.id) + 1;
    if (matchNum === 0) continue;
    const nh = m.score.fullTime.home;
    const na = m.score.fullTime.away;
    if (nh === null || na === null) continue;
    const prev = existingMap[matchNum];
    if (!prev || prev.home !== nh || prev.away !== na) {
      eventStmts.push(env.DB.prepare(
        `INSERT OR IGNORE INTO score_events (match_num, home_score, away_score, detected_at) VALUES (?, ?, ?, ?)`
      ).bind(matchNum, nh, na, now));
    }
  }
  for (let i = 0; i < eventStmts.length; i += 20) {
    await env.DB.batch(eventStmts.slice(i, i + 20));
  }

  // Sync per-goal scorer data (including assist) for finished and live matches
  const goalStmts: D1PreparedStatement[] = [];
  for (const m of data.matches) {
    if (!m.goals?.length) continue;
    const matchNum = FD_MATCH_IDS.indexOf(m.id) + 1;
    if (matchNum === 0) continue;
    for (const g of m.goals) {
      goalStmts.push(env.DB.prepare(
        `INSERT OR IGNORE INTO goal_events (match_num, minute, extra_time, scorer_name, team_name, goal_type, assist_name)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        matchNum,
        g.minute ?? null,
        g.injuryTime ?? null,
        g.scorer?.name ?? null,
        g.team?.name ?? null,
        g.type ?? null,
        g.assist?.name ?? null,
      ));
    }
  }
  for (let i = 0; i < goalStmts.length; i += 20) {
    await env.DB.batch(goalStmts.slice(i, i + 20));
  }

  // Sync card (booking) data for finished and live matches
  const cardStmts: D1PreparedStatement[] = [];
  for (const m of data.matches) {
    if (!m.bookings?.length) continue;
    const matchNum = FD_MATCH_IDS.indexOf(m.id) + 1;
    if (matchNum === 0) continue;
    for (const b of m.bookings) {
      cardStmts.push(env.DB.prepare(
        `INSERT OR IGNORE INTO card_events (match_num, minute, player_name, team_name, card_type)
         VALUES (?, ?, ?, ?, ?)`
      ).bind(
        matchNum,
        b.minute ?? null,
        b.player?.name ?? null,
        b.team?.name ?? null,
        b.card ?? null,
      ));
    }
  }
  for (let i = 0; i < cardStmts.length; i += 20) {
    await env.DB.batch(cardStmts.slice(i, i + 20));
  }

  await syncGroupStandings(env);
}

async function syncGroupStandings(env: Env): Promise<void> {
  const res = await fetch('https://api.football-data.org/v4/competitions/WC/standings?season=2026', {
    headers: { 'X-Auth-Token': env.FOOTBALL_DATA_TOKEN },
  });
  if (!res.ok) return;

  const data = await res.json() as {
    standings: Array<{
      stage: string;
      type: string;
      group: string | null;
      table: Array<{ position: number; team: { name: string } }>;
    }>;
  };

  const now = Date.now();
  const stmts: D1PreparedStatement[] = [];
  for (const standing of data.standings) {
    if (standing.type !== 'TOTAL' || !standing.group) continue;
    const letter = standing.group.replace('GROUP_', '');
    for (const row of standing.table) {
      stmts.push(env.DB.prepare(
        `INSERT INTO group_standings (group_letter, position, team_name, updated_at)
         VALUES (?, ?, ?, ?)
         ON CONFLICT(group_letter, position) DO UPDATE SET
           team_name = excluded.team_name,
           updated_at = excluded.updated_at`
      ).bind(letter, row.position, row.team.name, now));
    }
  }
  for (let i = 0; i < stmts.length; i += 20) {
    await env.DB.batch(stmts.slice(i, i + 20));
  }
}
