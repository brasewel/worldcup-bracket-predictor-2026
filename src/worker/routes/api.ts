import { Env } from '../index';
import { DEADLINE_MS } from '../data/constants';
import { syncLiveScores, syncMatchStats } from '../services/sync';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Password',
} as const;

function json(data: unknown, status = 200): Response {
  return Response.json(data, { status, headers: CORS });
}

export async function handleApi(request: Request, env: Env): Promise<Response | null> {
  const url = new URL(request.url);
  const path = url.pathname;

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: CORS });
  }

  // GET /api/brackets
  if (path === '/api/brackets' && request.method === 'GET') {
    const result = await env.DB.prepare(
      'SELECT email, display_name, locked, updated_at FROM brackets ORDER BY updated_at DESC'
    ).all();
    return json({ brackets: result.results });
  }

  // GET|POST /api/brackets/:email
  const bracketMatch = path.match(/^\/api\/brackets\/(.+)$/);
  if (bracketMatch) {
    const email = decodeURIComponent(bracketMatch[1]);

    if (request.method === 'GET') {
      const row = await env.DB.prepare('SELECT * FROM brackets WHERE email = ?').bind(email).first();
      if (!row) return json({ error: 'Not found' }, 404);
      return json({ bracket: row });
    }

    if (request.method === 'POST') {
      if (Date.now() >= DEADLINE_MS) {
        return json({ error: 'Picks are locked \u2014 the tournament has started.' }, 403);
      }
      const existing = await env.DB.prepare('SELECT locked FROM brackets WHERE email = ?')
        .bind(email).first<{ locked: number }>();
      if (existing?.locked) {
        return json({ error: 'Your bracket is permanently locked.' }, 403);
      }
      const body = await request.json() as { display_name: string; bracket_data: string; lock?: boolean };
      if (!body.display_name || !body.bracket_data) {
        return json({ error: 'Missing display_name or bracket_data.' }, 400);
      }
      const locked = body.lock ? 1 : 0;
      const now = Date.now();
      await env.DB.prepare(
        `INSERT INTO brackets (email, display_name, bracket_data, locked, updated_at)
         VALUES (?, ?, ?, ?, ?)
         ON CONFLICT(email) DO UPDATE SET
           display_name = excluded.display_name,
           bracket_data = excluded.bracket_data,
           locked = excluded.locked,
           updated_at = excluded.updated_at`
      ).bind(email, body.display_name, body.bracket_data, locked, now).run();
      return json({ ok: true, locked: !!locked });
    }
  }

  // POST|GET /api/score-picks/:matchId
  const scorePickMatch = path.match(/^\/api\/score-picks\/(.+)$/);
  if (scorePickMatch) {
    const matchId = scorePickMatch[1];

    if (request.method === 'POST') {
      const body = await request.json() as { email: string; home_score: number; away_score: number };
      if (!body.email || body.home_score === undefined || body.away_score === undefined) {
        return json({ error: 'Missing fields' }, 400);
      }
      await env.DB.prepare(
        `INSERT INTO score_picks (email, match_id, home_score, away_score, picked_at)
         VALUES (?, ?, ?, ?, ?)
         ON CONFLICT(email, match_id) DO UPDATE SET
           home_score = excluded.home_score,
           away_score = excluded.away_score,
           picked_at = excluded.picked_at`
      ).bind(body.email, matchId, body.home_score, body.away_score, Date.now()).run();
      const tally = await env.DB.prepare(
        `SELECT home_score, away_score, COUNT(*) as cnt FROM score_picks WHERE match_id = ? GROUP BY home_score, away_score ORDER BY cnt DESC`
      ).bind(matchId).all();
      return json({ ok: true, myPick: { home_score: body.home_score, away_score: body.away_score }, tally: tally.results });
    }

    if (request.method === 'GET') {
      const email = url.searchParams.get('email');
      if (!email) return json({ error: 'email required' }, 400);
      const myPick = await env.DB.prepare(
        'SELECT home_score, away_score FROM score_picks WHERE match_id = ? AND email = ?'
      ).bind(matchId, email).first<{ home_score: number; away_score: number }>();
      if (!myPick) return json({ myPick: null, tally: null });
      const tally = await env.DB.prepare(
        `SELECT home_score, away_score, COUNT(*) as cnt FROM score_picks WHERE match_id = ? GROUP BY home_score, away_score ORDER BY cnt DESC`
      ).bind(matchId).all();
      return json({ myPick, tally: tally.results });
    }
  }

  // POST|GET /api/live-picks/:matchId
  const livePickMatch = path.match(/^\/api\/live-picks\/(.+)$/);
  if (livePickMatch) {
    const matchId = livePickMatch[1];

    if (request.method === 'POST') {
      const body = await request.json() as { email: string; team: string };
      if (!body.email || !body.team) return json({ error: 'Missing email or team' }, 400);
      await env.DB.prepare(
        `INSERT INTO live_picks (email, match_id, team, picked_at)
         VALUES (?, ?, ?, ?)
         ON CONFLICT(email, match_id) DO UPDATE SET team = excluded.team, picked_at = excluded.picked_at`
      ).bind(body.email, matchId, body.team, Date.now()).run();
      const tally = await env.DB.prepare(
        'SELECT team, COUNT(*) as cnt FROM live_picks WHERE match_id = ? GROUP BY team'
      ).bind(matchId).all();
      return json({ ok: true, tally: tally.results });
    }

    if (request.method === 'GET') {
      const email = url.searchParams.get('email');
      if (!email) return json({ error: 'email required' }, 400);
      const myPick = await env.DB.prepare(
        'SELECT team FROM live_picks WHERE match_id = ? AND email = ?'
      ).bind(matchId, email).first<{ team: string }>();
      if (!myPick) return json({ picked: null, tally: null });
      const tally = await env.DB.prepare(
        'SELECT team, COUNT(*) as cnt FROM live_picks WHERE match_id = ? GROUP BY team'
      ).bind(matchId).all();
      return json({ picked: myPick.team, tally: tally.results });
    }
  }

  // POST /api/golden-boot
  if (path === '/api/golden-boot' && request.method === 'POST') {
    if (Date.now() >= DEADLINE_MS) return json({ error: 'Picks are locked.' }, 403);
    const body = await request.json() as { email: string; player_name: string };
    if (!body.email || !body.player_name) return json({ error: 'Missing fields' }, 400);
    await env.DB.prepare(
      `INSERT INTO golden_boot_picks (email, player_name, picked_at)
       VALUES (?, ?, ?)
       ON CONFLICT(email) DO UPDATE SET player_name = excluded.player_name, picked_at = excluded.picked_at`
    ).bind(body.email, body.player_name, Date.now()).run();
    return json({ ok: true });
  }

  // GET /api/golden-boot
  if (path === '/api/golden-boot' && request.method === 'GET') {
    const email = url.searchParams.get('email');
    if (!email) return json({ error: 'email required' }, 400);
    const row = await env.DB.prepare('SELECT player_name FROM golden_boot_picks WHERE email = ?')
      .bind(email).first<{ player_name: string }>();
    return json({ player_name: row?.player_name ?? null });
  }

  // GET /api/golden-boot-tally
  if (path === '/api/golden-boot-tally' && request.method === 'GET') {
    let actualTopScorer: string | null = null;
    try {
      const sRes = await fetch('https://api.football-data.org/v4/competitions/WC/scorers?season=2026&limit=1', {
        headers: { 'X-Auth-Token': env.FOOTBALL_DATA_TOKEN },
      });
      if (sRes.ok) {
        const sd = await sRes.json() as { scorers: Array<{ player: { name: string } }> };
        if (sd.scorers.length) actualTopScorer = sd.scorers[0].player.name;
      }
    } catch { /* non-fatal */ }
    const picks = await env.DB.prepare(
      'SELECT player_name, COUNT(*) as cnt FROM golden_boot_picks GROUP BY player_name ORDER BY cnt DESC'
    ).all<{ player_name: string; cnt: number }>();
    return json({ tally: picks.results, actual_top_scorer: actualTopScorer });
  }

  // GET /api/consensus
  if (path === '/api/consensus' && request.method === 'GET') {
    const rows = await env.DB.prepare('SELECT bracket_data FROM brackets').all<{ bracket_data: string }>();
    const tallies: Record<string, Record<string, number>> = {};
    let total = 0;
    for (const row of rows.results) {
      total++;
      try {
        const bd = JSON.parse(row.bracket_data);
        const ko = bd.knockout ?? {};
        for (const [key, team] of Object.entries(ko)) {
          if (!tallies[key]) tallies[key] = {};
          tallies[key][team as string] = (tallies[key][team as string] ?? 0) + 1;
        }
      } catch { /* skip */ }
    }
    return json({ total_players: total, picks: tallies });
  }

  // GET /api/leaderboard
  if (path === '/api/leaderboard' && request.method === 'GET') {
    const [matchRows, groupRows, bracketRows, scorePickRows, gbPickRows, gbScorers] = await Promise.all([
      env.DB.prepare(
        'SELECT match_num, home_team, away_team, home_score, away_score, status, winner FROM match_results WHERE status = ? ORDER BY match_num'
      ).bind('FINISHED').all<{ match_num: number; home_team: string; away_team: string; home_score: number | null; away_score: number | null; status: string; winner: string | null }>(),
      env.DB.prepare('SELECT group_letter, position, team_name FROM group_standings ORDER BY group_letter, position')
        .all<{ group_letter: string; position: number; team_name: string }>(),
      env.DB.prepare('SELECT email, display_name, bracket_data FROM brackets')
        .all<{ email: string; display_name: string; bracket_data: string }>(),
      env.DB.prepare('SELECT email, match_id, home_score, away_score FROM score_picks')
        .all<{ email: string; match_id: string; home_score: number; away_score: number }>(),
      env.DB.prepare('SELECT email, player_name FROM golden_boot_picks')
        .all<{ email: string; player_name: string }>(),
      fetch('https://api.football-data.org/v4/competitions/WC/scorers?season=2026&limit=1', {
        headers: { 'X-Auth-Token': env.FOOTBALL_DATA_TOKEN },
      }).then(r => r.ok ? r.json() : { scorers: [] }).catch(() => ({ scorers: [] })) as Promise<{ scorers: Array<{ player: { name: string } }> }>,
    ]);

    const knockoutWinners: Record<number, string> = {};
    const finishedScores: Record<number, { home: number; away: number }> = {};
    for (const m of matchRows.results) {
      if (m.match_num >= 73 && m.winner) knockoutWinners[m.match_num] = m.winner;
      if (m.home_score !== null && m.away_score !== null) {
        finishedScores[m.match_num] = { home: m.home_score, away: m.away_score };
      }
    }

    const scorePicksByEmail: Record<string, Record<string, { home: number; away: number }>> = {};
    for (const sp of scorePickRows.results) {
      if (!scorePicksByEmail[sp.email]) scorePicksByEmail[sp.email] = {};
      scorePicksByEmail[sp.email][sp.match_id] = { home: sp.home_score, away: sp.away_score };
    }

    const gbByEmail: Record<string, string> = {};
    for (const gb of gbPickRows.results) gbByEmail[gb.email] = gb.player_name;
    const actualTopScorer = gbScorers.scorers?.[0]?.player?.name ?? null;

    const groupStandings: Record<string, string[]> = {};
    for (const r of groupRows.results) {
      if (!groupStandings[r.group_letter]) groupStandings[r.group_letter] = [];
      groupStandings[r.group_letter][r.position - 1] = r.team_name;
    }

    const ROUND_POINTS: Array<{ key: string; matchNums: number[]; pts: number }> = [
      { key: 'r32',   matchNums: Array.from({ length: 16 }, (_, i) => 73 + i), pts: 2 },
      { key: 'r16',   matchNums: Array.from({ length: 8 },  (_, i) => 89 + i), pts: 3 },
      { key: 'qf',    matchNums: Array.from({ length: 4 },  (_, i) => 97 + i), pts: 4 },
      { key: 'sf',    matchNums: Array.from({ length: 2 },  (_, i) => 101 + i), pts: 5 },
      { key: 'final', matchNums: [104], pts: 8 },
    ];

    const finishedMatchNums = new Set(matchRows.results.map(m => m.match_num));
    const hasAnyFinished = finishedMatchNums.size > 0;

    const leaderboard = bracketRows.results.map(b => {
      let bd: { groups?: Record<string, string[]>; knockout?: Record<string, string> } = {};
      try { bd = JSON.parse(b.bracket_data); } catch { /* skip */ }
      const knockout = bd.knockout ?? {};
      const groups = bd.groups ?? {};

      let score = 0;
      const picks: Array<{ round: string; matchNum: number; predicted: string; actual: string | null; correct: boolean | null }> = [];

      for (const { key, matchNums, pts } of ROUND_POINTS) {
        matchNums.forEach((matchNum, idx) => {
          const predicted = knockout[`${key}_${idx}`] ?? null;
          const actual = knockoutWinners[matchNum] ?? null;
          const finished = finishedMatchNums.has(matchNum);
          const correct = finished && predicted && actual ? predicted === actual : null;
          if (correct) score += pts;
          if (predicted) picks.push({ round: key, matchNum, predicted, actual, correct });
        });
      }

      let groupScore = 0;
      for (const [letter, actualOrder] of Object.entries(groupStandings)) {
        if (actualOrder.length < 4) continue;
        const predicted = groups[letter] ?? [];
        for (let pos = 0; pos < 4; pos++) {
          if (predicted[pos] && actualOrder[pos] && predicted[pos] === actualOrder[pos]) groupScore++;
        }
      }
      score += groupScore;

      let scorePickScore = 0;
      const myScorePicks = scorePicksByEmail[b.email] ?? {};
      for (const [matchIdStr, predicted] of Object.entries(myScorePicks)) {
        const mn = parseInt(matchIdStr);
        if (isNaN(mn) || mn > 72) continue;
        const actual = finishedScores[mn];
        if (!actual) continue;
        if (predicted.home === actual.home && predicted.away === actual.away) {
          scorePickScore += 3;
        } else {
          const predDir = predicted.home > predicted.away ? 1 : predicted.home < predicted.away ? -1 : 0;
          const actDir  = actual.home > actual.away ? 1 : actual.home < actual.away ? -1 : 0;
          if (predDir === actDir) scorePickScore++;
        }
      }
      score += scorePickScore;

      const myGbPick = gbByEmail[b.email] ?? null;
      let gbScore = 0;
      if (myGbPick && actualTopScorer && myGbPick === actualTopScorer) gbScore = 5;
      score += gbScore;

      return {
        email: b.email, display_name: b.display_name, score,
        correct_knockout: picks.filter(p => p.correct === true).length,
        total_knockout_finished: picks.filter(p => p.correct !== null).length,
        group_score: groupScore, score_pick_score: scorePickScore,
        golden_boot_pick: myGbPick, golden_boot_score: gbScore, picks,
      };
    });

    leaderboard.sort((a, b) => b.score - a.score || b.correct_knockout - a.correct_knockout);
    leaderboard.forEach((e, i) => Object.assign(e, { rank: i + 1 }));

    return json({ leaderboard, has_any_finished: hasAnyFinished, actual_top_scorer: actualTopScorer, updated_at: Date.now() });
  }

  // GET /api/match-events/:matchNum
  const matchEventsMatch = path.match(/^\/api\/match-events\/(\d+)$/);
  if (matchEventsMatch && request.method === 'GET') {
    const mn = parseInt(matchEventsMatch[1]);
    const [events, matchRow, goals, cards] = await Promise.all([
      env.DB.prepare('SELECT home_score, away_score, detected_at FROM score_events WHERE match_num = ? ORDER BY detected_at')
        .bind(mn).all<{ home_score: number; away_score: number; detected_at: number }>(),
      env.DB.prepare(`SELECT home_team, away_team, home_score, away_score, home_score_ht, away_score_ht, status, winner,
         home_possession, away_possession, home_shots_on, away_shots_on,
         home_corners, away_corners, home_yellow, away_yellow, home_red, away_red
         FROM match_results WHERE match_num = ?`)
        .bind(mn).first(),
      env.DB.prepare('SELECT minute, extra_time, scorer_name, team_name, goal_type, assist_name FROM goal_events WHERE match_num = ? ORDER BY minute ASC, extra_time ASC')
        .bind(mn).all<{ minute: number | null; extra_time: number | null; scorer_name: string | null; team_name: string | null; goal_type: string | null; assist_name: string | null }>(),
      env.DB.prepare('SELECT minute, player_name, team_name, card_type FROM card_events WHERE match_num = ? ORDER BY minute ASC')
        .bind(mn).all<{ minute: number | null; player_name: string | null; team_name: string | null; card_type: string | null }>(),
    ]);
    return json({ events: events.results, match: matchRow, goals: goals.results, cards: cards.results });
  }

  // GET /api/match-results
  if (path === '/api/match-results' && request.method === 'GET') {
    const rows = await env.DB.prepare(
      'SELECT match_num, home_team, away_team, home_score, away_score, status, match_minute, match_injury FROM match_results ORDER BY match_num'
    ).all();
    return json({ results: rows.results });
  }

  // POST /api/sync-matches (manual trigger)
  if (path === '/api/sync-matches' && request.method === 'POST') {
    await syncLiveScores(env);
    await syncMatchStats(env);
    return json({ ok: true });
  }

  // DELETE /api/admin/brackets/:email — admin only
  const adminDeleteMatch = path.match(/^\/api\/admin\/brackets\/(.+)$/);
  if (adminDeleteMatch && request.method === 'DELETE') {
    const provided = request.headers.get('X-Admin-Password') ?? '';
    if (!env.ADMIN_PASSWORD || provided !== env.ADMIN_PASSWORD) {
      return json({ error: 'Unauthorized' }, 401);
    }
    const email = decodeURIComponent(adminDeleteMatch[1]);
    await env.DB.prepare('DELETE FROM brackets WHERE email = ?').bind(email).run();
    await env.DB.prepare('DELETE FROM live_picks WHERE email = ?').bind(email).run();
    await env.DB.prepare('DELETE FROM score_picks WHERE email = ?').bind(email).run();
    await env.DB.prepare('DELETE FROM golden_boot_picks WHERE email = ?').bind(email).run();
    return json({ ok: true, deleted: email });
  }

  return null; // not handled here
}
