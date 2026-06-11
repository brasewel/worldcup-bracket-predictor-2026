var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/worker/data/constants.ts
var DEADLINE_ISO = "2026-06-11T19:00:00Z";
var DEADLINE_MS = new Date(DEADLINE_ISO).getTime();
var FD_MATCH_IDS = [537327, 537328, 537333, 537345, 537334, 537339, 537340, 537346, 537351, 537357, 537352, 537358, 537369, 537363, 537370, 537364, 537391, 537392, 537397, 537398, 537403, 537409, 537410, 537404, 537329, 537335, 537336, 537330, 537348, 537342, 537341, 537347, 537359, 537353, 537354, 537360, 537371, 537365, 537372, 537366, 537399, 537393, 537394, 537400, 537405, 537411, 537412, 537406, 537337, 537338, 537344, 537343, 537331, 537332, 537355, 537356, 537361, 537362, 537349, 537350, 537395, 537396, 537373, 537374, 537367, 537368, 537413, 537414, 537407, 537408, 537401, 537402, 537417, 537423, 537415, 537418, 537424, 537416, 537425, 537426, 537422, 537421, 537420, 537419, 537429, 537428, 537427, 537430, 537376, 537375, 537377, 537378, 537379, 537380, 537381, 537382, 537383, 537384, 537385, 537386, 537387, 537388, 537389, 537390];

// src/worker/services/sync.ts
function parseScorers(raw) {
  if (!raw || raw === "null")
    return [];
  const inner = raw.replace(/^\{/, "").replace(/\}$/, "").trim();
  if (!inner)
    return [];
  const parts = inner.split(/[\u201c\u201d"]+/);
  const results = [];
  for (let i = 1; i < parts.length; i += 2) {
    const s = parts[i].trim();
    if (s)
      results.push(s);
  }
  if (!results.length) {
    results.push(...inner.replace(/[\u201c\u201d"]/g, "").split(",").map((s) => s.trim()).filter(Boolean));
  }
  return results;
}
__name(parseScorers, "parseScorers");
function parseScorer(entry) {
  const minuteMatch = entry.match(/(\d+)(?:\+\d+)?['\u2032\u2019]?\s*$/);
  const minute = minuteMatch ? parseInt(minuteMatch[1], 10) : null;
  const name = entry.replace(/\s*\d+(?:\+\d+)?['\u2032\u2019]?\s*$/, "").trim();
  return { name, minute };
}
__name(parseScorer, "parseScorer");
async function syncLiveScores(env) {
  let games;
  try {
    const res = await fetch("https://worldcup26.ir/get/games");
    if (!res.ok)
      return;
    const raw = await res.json();
    games = Array.isArray(raw) ? raw : [];
    if (!games.length)
      return;
  } catch {
    return;
  }
  const now = Date.now();
  const existing = await env.DB.prepare(
    "SELECT match_num, home_score, away_score FROM match_results WHERE home_score IS NOT NULL"
  ).all();
  const prevScores = {};
  for (const r of existing.results) {
    prevScores[r.match_num] = { home: r.home_score, away: r.away_score };
  }
  const matchStmts = [];
  const goalStmts = [];
  const eventStmts = [];
  for (const g of games) {
    const matchNum = parseInt(g.id, 10);
    if (!matchNum || matchNum < 1 || matchNum > 104)
      continue;
    const homeScore = g.home_score ? parseInt(g.home_score, 10) : null;
    const awayScore = g.away_score ? parseInt(g.away_score, 10) : null;
    const elapsed = g.time_elapsed ?? "";
    const isFinished = g.finished === "TRUE" || elapsed === "finished";
    const isLive = !isFinished && elapsed === "live";
    const isHalfTime = !isFinished && (elapsed === "halftime" || elapsed === "half-time");
    const status = isFinished ? "FINISHED" : isLive ? "IN_PLAY" : isHalfTime ? "HALFTIME" : "TIMED";
    const minuteNum = parseInt(elapsed, 10);
    const matchMinute = isLive && !isNaN(minuteNum) ? minuteNum : null;
    let winner = null;
    if (isFinished && homeScore !== null && awayScore !== null) {
      if (homeScore > awayScore)
        winner = g.home_team_name_en ?? null;
      else if (awayScore > homeScore)
        winner = g.away_team_name_en ?? null;
    }
    if (homeScore !== null && awayScore !== null) {
      matchStmts.push(env.DB.prepare(
        `UPDATE match_results
         SET home_score=?, away_score=?, status=?, winner=?, match_minute=?, updated_at=?
         WHERE match_num=?`
      ).bind(homeScore, awayScore, status, winner, matchMinute, now, matchNum));
      const prev = prevScores[matchNum];
      if (!prev || prev.home !== homeScore || prev.away !== awayScore) {
        eventStmts.push(env.DB.prepare(
          `INSERT OR IGNORE INTO score_events (match_num, home_score, away_score, detected_at)
           VALUES (?, ?, ?, ?)`
        ).bind(matchNum, homeScore, awayScore, now));
      }
    } else {
      matchStmts.push(env.DB.prepare(
        `UPDATE match_results SET status=?, match_minute=?, updated_at=? WHERE match_num=?`
      ).bind(status, matchMinute, now, matchNum));
    }
    const homeTeam = g.home_team_name_en ?? null;
    const awayTeam = g.away_team_name_en ?? null;
    for (const entry of parseScorers(g.home_scorers)) {
      const { name, minute } = parseScorer(entry);
      if (name)
        goalStmts.push(env.DB.prepare(
          `INSERT OR IGNORE INTO goal_events (match_num, minute, scorer_name, team_name, goal_type)
         VALUES (?, ?, ?, ?, 'REGULAR')`
        ).bind(matchNum, minute, name, homeTeam));
    }
    for (const entry of parseScorers(g.away_scorers)) {
      const { name, minute } = parseScorer(entry);
      if (name)
        goalStmts.push(env.DB.prepare(
          `INSERT OR IGNORE INTO goal_events (match_num, minute, scorer_name, team_name, goal_type)
         VALUES (?, ?, ?, ?, 'REGULAR')`
        ).bind(matchNum, minute, name, awayTeam));
    }
  }
  for (let i = 0; i < matchStmts.length; i += 20)
    await env.DB.batch(matchStmts.slice(i, i + 20));
  for (let i = 0; i < goalStmts.length; i += 20)
    await env.DB.batch(goalStmts.slice(i, i + 20));
  for (let i = 0; i < eventStmts.length; i += 20)
    await env.DB.batch(eventStmts.slice(i, i + 20));
}
__name(syncLiveScores, "syncLiveScores");
async function syncMatchStats(env) {
  const finishedRows = await env.DB.prepare(
    "SELECT match_num, fd_match_id FROM match_results WHERE status = ?"
  ).bind("FINISHED").all();
  const res = await fetch("https://api.football-data.org/v4/competitions/WC/matches?season=2026", {
    headers: {
      "X-Auth-Token": env.FOOTBALL_DATA_TOKEN,
      "X-Unfold-Goals": "true",
      "X-Unfold-Bookings": "true"
    }
  });
  if (!res.ok)
    return;
  const data = await res.json();
  const now = Date.now();
  const finishedNums = new Set(finishedRows.results.map((r) => r.match_num));
  const seedStmts = data.matches.map((m) => {
    const matchNum = FD_MATCH_IDS.indexOf(m.id) + 1;
    if (!matchNum)
      return null;
    return env.DB.prepare(
      `INSERT OR IGNORE INTO match_results
         (fd_match_id, match_num, home_team, away_team, status, updated_at)
       VALUES (?, ?, ?, ?, 'TIMED', ?)`
    ).bind(m.id, matchNum, m.homeTeam.name ?? null, m.awayTeam.name ?? null, now);
  }).filter((s) => s !== null);
  for (let i = 0; i < seedStmts.length; i += 20)
    await env.DB.batch(seedStmts.slice(i, i + 20));
  const statStmts = [];
  const goalStmts = [];
  const cardStmts = [];
  for (const m of data.matches) {
    const matchNum = FD_MATCH_IDS.indexOf(m.id) + 1;
    if (!matchNum || !finishedNums.has(matchNum))
      continue;
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
      m.score.halfTime.home ?? null,
      m.score.halfTime.away ?? null,
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
      now,
      matchNum
    ));
    for (const g of m.goals ?? []) {
      const scorerName = g.scorer?.name ?? null;
      const teamName = g.team?.name ?? null;
      const goalType = g.type ?? null;
      const minute = g.minute ?? null;
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
        minute,
        g.injuryTime ?? null,
        scorerName,
        teamName,
        goalType,
        g.assist?.name ?? null
      ));
    }
    for (const b of m.bookings ?? []) {
      cardStmts.push(env.DB.prepare(
        `INSERT OR IGNORE INTO card_events (match_num, minute, player_name, team_name, card_type)
         VALUES (?, ?, ?, ?, ?)`
      ).bind(matchNum, b.minute ?? null, b.player?.name ?? null, b.team?.name ?? null, b.card ?? null));
    }
  }
  for (let i = 0; i < statStmts.length; i += 20)
    await env.DB.batch(statStmts.slice(i, i + 20));
  for (let i = 0; i < goalStmts.length; i += 20)
    await env.DB.batch(goalStmts.slice(i, i + 20));
  for (let i = 0; i < cardStmts.length; i += 20)
    await env.DB.batch(cardStmts.slice(i, i + 20));
  await syncGroupStandings(env);
}
__name(syncMatchStats, "syncMatchStats");
async function syncGroupStandings(env) {
  const res = await fetch("https://api.football-data.org/v4/competitions/WC/standings?season=2026", {
    headers: { "X-Auth-Token": env.FOOTBALL_DATA_TOKEN }
  });
  if (!res.ok)
    return;
  const data = await res.json();
  const now = Date.now();
  const stmts = [];
  for (const s of data.standings) {
    if (s.type !== "TOTAL" || !s.group)
      continue;
    const letter = s.group.replace("GROUP_", "");
    for (const row of s.table) {
      stmts.push(env.DB.prepare(
        `INSERT INTO group_standings (group_letter, position, team_name, updated_at)
         VALUES (?, ?, ?, ?)
         ON CONFLICT(group_letter, position) DO UPDATE SET
           team_name = excluded.team_name, updated_at = excluded.updated_at`
      ).bind(letter, row.position, row.team.name, now));
    }
  }
  for (let i = 0; i < stmts.length; i += 20)
    await env.DB.batch(stmts.slice(i, i + 20));
}
__name(syncGroupStandings, "syncGroupStandings");

// src/worker/routes/api.ts
var CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-Admin-Password"
};
function json(data, status = 200) {
  return Response.json(data, { status, headers: CORS });
}
__name(json, "json");
async function handleApi(request, env) {
  const url = new URL(request.url);
  const path = url.pathname;
  if (request.method === "OPTIONS") {
    return new Response(null, { headers: CORS });
  }
  if (path === "/api/brackets" && request.method === "GET") {
    const result = await env.DB.prepare(
      "SELECT email, display_name, locked, updated_at FROM brackets ORDER BY updated_at DESC"
    ).all();
    return json({ brackets: result.results });
  }
  const bracketMatch = path.match(/^\/api\/brackets\/(.+)$/);
  if (bracketMatch) {
    const email = decodeURIComponent(bracketMatch[1]);
    if (request.method === "GET") {
      const row = await env.DB.prepare("SELECT * FROM brackets WHERE email = ?").bind(email).first();
      if (!row)
        return json({ error: "Not found" }, 404);
      return json({ bracket: row });
    }
    if (request.method === "POST") {
      if (Date.now() >= DEADLINE_MS) {
        return json({ error: "Picks are locked \u2014 the tournament has started." }, 403);
      }
      const existing = await env.DB.prepare("SELECT locked FROM brackets WHERE email = ?").bind(email).first();
      if (existing?.locked) {
        return json({ error: "Your bracket is permanently locked." }, 403);
      }
      const body = await request.json();
      if (!body.display_name || !body.bracket_data) {
        return json({ error: "Missing display_name or bracket_data." }, 400);
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
  const scorePickMatch = path.match(/^\/api\/score-picks\/(.+)$/);
  if (scorePickMatch) {
    const matchId = scorePickMatch[1];
    if (request.method === "POST") {
      const body = await request.json();
      if (!body.email || body.home_score === void 0 || body.away_score === void 0) {
        return json({ error: "Missing fields" }, 400);
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
    if (request.method === "GET") {
      const email = url.searchParams.get("email");
      if (!email)
        return json({ error: "email required" }, 400);
      const myPick = await env.DB.prepare(
        "SELECT home_score, away_score FROM score_picks WHERE match_id = ? AND email = ?"
      ).bind(matchId, email).first();
      if (!myPick)
        return json({ myPick: null, tally: null });
      const tally = await env.DB.prepare(
        `SELECT home_score, away_score, COUNT(*) as cnt FROM score_picks WHERE match_id = ? GROUP BY home_score, away_score ORDER BY cnt DESC`
      ).bind(matchId).all();
      return json({ myPick, tally: tally.results });
    }
  }
  const livePickMatch = path.match(/^\/api\/live-picks\/(.+)$/);
  if (livePickMatch) {
    const matchId = livePickMatch[1];
    if (request.method === "POST") {
      const body = await request.json();
      if (!body.email || !body.team)
        return json({ error: "Missing email or team" }, 400);
      await env.DB.prepare(
        `INSERT INTO live_picks (email, match_id, team, picked_at)
         VALUES (?, ?, ?, ?)
         ON CONFLICT(email, match_id) DO UPDATE SET team = excluded.team, picked_at = excluded.picked_at`
      ).bind(body.email, matchId, body.team, Date.now()).run();
      const tally = await env.DB.prepare(
        "SELECT team, COUNT(*) as cnt FROM live_picks WHERE match_id = ? GROUP BY team"
      ).bind(matchId).all();
      return json({ ok: true, tally: tally.results });
    }
    if (request.method === "GET") {
      const email = url.searchParams.get("email");
      if (!email)
        return json({ error: "email required" }, 400);
      const myPick = await env.DB.prepare(
        "SELECT team FROM live_picks WHERE match_id = ? AND email = ?"
      ).bind(matchId, email).first();
      if (!myPick)
        return json({ picked: null, tally: null });
      const tally = await env.DB.prepare(
        "SELECT team, COUNT(*) as cnt FROM live_picks WHERE match_id = ? GROUP BY team"
      ).bind(matchId).all();
      return json({ picked: myPick.team, tally: tally.results });
    }
  }
  if (path === "/api/golden-boot" && request.method === "POST") {
    if (Date.now() >= DEADLINE_MS)
      return json({ error: "Picks are locked." }, 403);
    const body = await request.json();
    if (!body.email || !body.player_name)
      return json({ error: "Missing fields" }, 400);
    await env.DB.prepare(
      `INSERT INTO golden_boot_picks (email, player_name, picked_at)
       VALUES (?, ?, ?)
       ON CONFLICT(email) DO UPDATE SET player_name = excluded.player_name, picked_at = excluded.picked_at`
    ).bind(body.email, body.player_name, Date.now()).run();
    return json({ ok: true });
  }
  if (path === "/api/golden-boot" && request.method === "GET") {
    const email = url.searchParams.get("email");
    if (!email)
      return json({ error: "email required" }, 400);
    const row = await env.DB.prepare("SELECT player_name FROM golden_boot_picks WHERE email = ?").bind(email).first();
    return json({ player_name: row?.player_name ?? null });
  }
  if (path === "/api/golden-boot-tally" && request.method === "GET") {
    let actualTopScorer = null;
    try {
      const sRes = await fetch("https://api.football-data.org/v4/competitions/WC/scorers?season=2026&limit=1", {
        headers: { "X-Auth-Token": env.FOOTBALL_DATA_TOKEN }
      });
      if (sRes.ok) {
        const sd = await sRes.json();
        if (sd.scorers.length)
          actualTopScorer = sd.scorers[0].player.name;
      }
    } catch {
    }
    const picks = await env.DB.prepare(
      "SELECT player_name, COUNT(*) as cnt FROM golden_boot_picks GROUP BY player_name ORDER BY cnt DESC"
    ).all();
    return json({ tally: picks.results, actual_top_scorer: actualTopScorer });
  }
  if (path === "/api/consensus" && request.method === "GET") {
    const rows = await env.DB.prepare("SELECT bracket_data FROM brackets").all();
    const tallies = {};
    let total = 0;
    for (const row of rows.results) {
      total++;
      try {
        const bd = JSON.parse(row.bracket_data);
        const ko = bd.knockout ?? {};
        for (const [key, team] of Object.entries(ko)) {
          if (!tallies[key])
            tallies[key] = {};
          tallies[key][team] = (tallies[key][team] ?? 0) + 1;
        }
      } catch {
      }
    }
    return json({ total_players: total, picks: tallies });
  }
  if (path === "/api/leaderboard" && request.method === "GET") {
    const [matchRows, groupRows, bracketRows, scorePickRows, gbPickRows, gbScorers] = await Promise.all([
      env.DB.prepare(
        "SELECT match_num, home_team, away_team, home_score, away_score, status, winner FROM match_results WHERE status = ? ORDER BY match_num"
      ).bind("FINISHED").all(),
      env.DB.prepare("SELECT group_letter, position, team_name FROM group_standings ORDER BY group_letter, position").all(),
      env.DB.prepare("SELECT email, display_name, bracket_data FROM brackets").all(),
      env.DB.prepare("SELECT email, match_id, home_score, away_score FROM score_picks").all(),
      env.DB.prepare("SELECT email, player_name FROM golden_boot_picks").all(),
      fetch("https://api.football-data.org/v4/competitions/WC/scorers?season=2026&limit=1", {
        headers: { "X-Auth-Token": env.FOOTBALL_DATA_TOKEN }
      }).then((r) => r.ok ? r.json() : { scorers: [] }).catch(() => ({ scorers: [] }))
    ]);
    const knockoutWinners = {};
    const finishedScores = {};
    for (const m of matchRows.results) {
      if (m.match_num >= 73 && m.winner)
        knockoutWinners[m.match_num] = m.winner;
      if (m.home_score !== null && m.away_score !== null) {
        finishedScores[m.match_num] = { home: m.home_score, away: m.away_score };
      }
    }
    const scorePicksByEmail = {};
    for (const sp of scorePickRows.results) {
      if (!scorePicksByEmail[sp.email])
        scorePicksByEmail[sp.email] = {};
      scorePicksByEmail[sp.email][sp.match_id] = { home: sp.home_score, away: sp.away_score };
    }
    const gbByEmail = {};
    for (const gb of gbPickRows.results)
      gbByEmail[gb.email] = gb.player_name;
    const actualTopScorer = gbScorers.scorers?.[0]?.player?.name ?? null;
    const groupStandings = {};
    for (const r of groupRows.results) {
      if (!groupStandings[r.group_letter])
        groupStandings[r.group_letter] = [];
      groupStandings[r.group_letter][r.position - 1] = r.team_name;
    }
    const ROUND_POINTS = [
      { key: "r32", matchNums: Array.from({ length: 16 }, (_, i) => 73 + i), pts: 2 },
      { key: "r16", matchNums: Array.from({ length: 8 }, (_, i) => 89 + i), pts: 3 },
      { key: "qf", matchNums: Array.from({ length: 4 }, (_, i) => 97 + i), pts: 4 },
      { key: "sf", matchNums: Array.from({ length: 2 }, (_, i) => 101 + i), pts: 5 },
      { key: "final", matchNums: [104], pts: 8 }
    ];
    const finishedMatchNums = new Set(matchRows.results.map((m) => m.match_num));
    const hasAnyFinished = finishedMatchNums.size > 0;
    const leaderboard = bracketRows.results.map((b) => {
      let bd = {};
      try {
        bd = JSON.parse(b.bracket_data);
      } catch {
      }
      const knockout = bd.knockout ?? {};
      const groups = bd.groups ?? {};
      let score = 0;
      const picks = [];
      for (const { key, matchNums, pts } of ROUND_POINTS) {
        matchNums.forEach((matchNum, idx) => {
          const predicted = knockout[`${key}_${idx}`] ?? null;
          const actual = knockoutWinners[matchNum] ?? null;
          const finished = finishedMatchNums.has(matchNum);
          const correct = finished && predicted && actual ? predicted === actual : null;
          if (correct)
            score += pts;
          if (predicted)
            picks.push({ round: key, matchNum, predicted, actual, correct });
        });
      }
      let groupScore = 0;
      for (const [letter, actualOrder] of Object.entries(groupStandings)) {
        if (actualOrder.length < 4)
          continue;
        const predicted = groups[letter] ?? [];
        for (let pos = 0; pos < 4; pos++) {
          if (predicted[pos] && actualOrder[pos] && predicted[pos] === actualOrder[pos])
            groupScore++;
        }
      }
      score += groupScore;
      let scorePickScore = 0;
      const myScorePicks = scorePicksByEmail[b.email] ?? {};
      for (const [matchIdStr, predicted] of Object.entries(myScorePicks)) {
        const mn = parseInt(matchIdStr);
        if (isNaN(mn) || mn > 72)
          continue;
        const actual = finishedScores[mn];
        if (!actual)
          continue;
        if (predicted.home === actual.home && predicted.away === actual.away) {
          scorePickScore += 3;
        } else {
          const predDir = predicted.home > predicted.away ? 1 : predicted.home < predicted.away ? -1 : 0;
          const actDir = actual.home > actual.away ? 1 : actual.home < actual.away ? -1 : 0;
          if (predDir === actDir)
            scorePickScore++;
        }
      }
      score += scorePickScore;
      const myGbPick = gbByEmail[b.email] ?? null;
      let gbScore = 0;
      if (myGbPick && actualTopScorer && myGbPick === actualTopScorer)
        gbScore = 5;
      score += gbScore;
      return {
        email: b.email,
        display_name: b.display_name,
        score,
        correct_knockout: picks.filter((p) => p.correct === true).length,
        total_knockout_finished: picks.filter((p) => p.correct !== null).length,
        group_score: groupScore,
        score_pick_score: scorePickScore,
        golden_boot_pick: myGbPick,
        golden_boot_score: gbScore,
        picks
      };
    });
    leaderboard.sort((a, b) => b.score - a.score || b.correct_knockout - a.correct_knockout);
    leaderboard.forEach((e, i) => Object.assign(e, { rank: i + 1 }));
    return json({ leaderboard, has_any_finished: hasAnyFinished, actual_top_scorer: actualTopScorer, updated_at: Date.now() });
  }
  const matchEventsMatch = path.match(/^\/api\/match-events\/(\d+)$/);
  if (matchEventsMatch && request.method === "GET") {
    const mn = parseInt(matchEventsMatch[1]);
    const [events, matchRow, goals, cards] = await Promise.all([
      env.DB.prepare("SELECT home_score, away_score, detected_at FROM score_events WHERE match_num = ? ORDER BY detected_at").bind(mn).all(),
      env.DB.prepare(`SELECT home_team, away_team, home_score, away_score, home_score_ht, away_score_ht, status, winner,
         home_possession, away_possession, home_shots_on, away_shots_on,
         home_corners, away_corners, home_yellow, away_yellow, home_red, away_red
         FROM match_results WHERE match_num = ?`).bind(mn).first(),
      env.DB.prepare("SELECT minute, extra_time, scorer_name, team_name, goal_type, assist_name FROM goal_events WHERE match_num = ? ORDER BY minute ASC, extra_time ASC").bind(mn).all(),
      env.DB.prepare("SELECT minute, player_name, team_name, card_type FROM card_events WHERE match_num = ? ORDER BY minute ASC").bind(mn).all()
    ]);
    return json({ events: events.results, match: matchRow, goals: goals.results, cards: cards.results });
  }
  if (path === "/api/match-results" && request.method === "GET") {
    const rows = await env.DB.prepare(
      "SELECT match_num, home_team, away_team, home_score, away_score, status, match_minute, match_injury FROM match_results ORDER BY match_num"
    ).all();
    return json({ results: rows.results });
  }
  if (path === "/api/sync-matches" && request.method === "POST") {
    await syncLiveScores(env);
    await syncMatchStats(env);
    return json({ ok: true });
  }
  const adminDeleteMatch = path.match(/^\/api\/admin\/brackets\/(.+)$/);
  if (adminDeleteMatch && request.method === "DELETE") {
    const provided = request.headers.get("X-Admin-Password") ?? "";
    if (!env.ADMIN_PASSWORD || provided !== env.ADMIN_PASSWORD) {
      return json({ error: "Unauthorized" }, 401);
    }
    const email = decodeURIComponent(adminDeleteMatch[1]);
    await env.DB.prepare("DELETE FROM brackets WHERE email = ?").bind(email).run();
    await env.DB.prepare("DELETE FROM live_picks WHERE email = ?").bind(email).run();
    await env.DB.prepare("DELETE FROM score_picks WHERE email = ?").bind(email).run();
    await env.DB.prepare("DELETE FROM golden_boot_picks WHERE email = ?").bind(email).run();
    return json({ ok: true, deleted: email });
  }
  return null;
}
__name(handleApi, "handleApi");

// src/worker/routes/html.ts
function serveHtml(html) {
  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" }
  });
}
__name(serveHtml, "serveHtml");

// src/worker/index.ts
var worker_default = {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    if (path.startsWith("/api/")) {
      const res = await handleApi(request, env);
      if (res)
        return res;
      return Response.json({ error: "Not found" }, { status: 404 });
    }
    if (path !== "/" && path !== "") {
      const assetResponse = await env.ASSETS.fetch(request);
      if (assetResponse.status !== 404)
        return assetResponse;
    }
    const htmlResponse = await env.ASSETS.fetch(new Request(new URL("/index.html", url)));
    const html = await htmlResponse.text();
    return serveHtml(html);
  },
  async scheduled(_controller, env, ctx) {
    ctx.waitUntil(syncLiveScores(env).then(() => syncMatchStats(env)));
  }
};
export {
  worker_default as default
};
//# sourceMappingURL=index.js.map
