import { Env } from '../index';
import { FD_MATCH_IDS } from '../data/constants';

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
         home_score = excluded.home_score,
         away_score = excluded.away_score,
         home_score_ht = excluded.home_score_ht,
         away_score_ht = excluded.away_score_ht,
         status = excluded.status,
         winner = excluded.winner,
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
         match_minute = excluded.match_minute,
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

  // Sync per-goal scorer data (including assist) for finished matches
  const goalStmts: D1PreparedStatement[] = [];
  for (const m of data.matches) {
    if (m.status !== 'FINISHED' || !m.goals?.length) continue;
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

  // Sync card (booking) data for finished matches
  const cardStmts: D1PreparedStatement[] = [];
  for (const m of data.matches) {
    if (m.status !== 'FINISHED' || !m.bookings?.length) continue;
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
