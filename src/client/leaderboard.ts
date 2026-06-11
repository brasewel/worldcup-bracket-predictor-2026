import { state } from './state';
import { ROUND_LABELS_SHORT, getFlagForTeam } from './data';
import { escHtml, escJs, showToast } from './utils';
import { apiFetch } from './api';
import { gbCurrentPick, updateGbDisplay } from './goldenBoot';

// ── Types for consensus and match results ──────────────────────────────────

interface ConsensusData {
  total_players: number;
  picks: Record<string, Record<string, number>>;
}

interface MatchResult {
  match_num: number;
  home_team: string;
  away_team: string;
  home_score: number | null;
  away_score: number | null;
  status: string;
}

interface LeaderboardEntry {
  email: string;
  display_name: string;
  score: number;
  rank: number;
  correct_knockout: number;
  total_knockout_finished: number;
  group_score: number;
  score_pick_score: number;
  golden_boot_pick: string | null;
  golden_boot_score: number;
  picks: Array<{
    round: string;
    matchNum: number;
    predicted: string;
    actual: string | null;
    correct: boolean | null;
  }>;
}

interface LeaderboardData {
  leaderboard: LeaderboardEntry[];
  has_any_finished: boolean;
  actual_top_scorer: string | null;
  updated_at: number;
}

export let lbData: LeaderboardData | null = null;
let lbPollTimer: ReturnType<typeof setInterval> | undefined;

export async function fetchLeaderboard(): Promise<void> {
  try {
    const [lb, consensus, resultsData] = await Promise.all([
      apiFetch<LeaderboardData>('/api/leaderboard'),
      apiFetch<ConsensusData>('/api/consensus').catch(() => null),
      apiFetch<{ results: MatchResult[] }>('/api/match-results').catch(() => null),
    ]);
    lbData = lb;
    renderLeaderboard();
    // Only show match-result-dependent features once at least one match has finished
    if (lb.has_any_finished) {
      renderScoreGraph();
      if (consensus) renderConsensusInsights(consensus);
      if (consensus && resultsData) checkForUpsets(consensus, resultsData.results);
      // Show Hall of Fame when the Final (match 104) is finished
      if (resultsData) {
        const finalMatch = resultsData.results.find(r => r.match_num === 104 && r.status === 'FINISHED');
        if (finalMatch) renderHallOfFame();
      }
    } else {
      const sg = document.getElementById('score-graph-container');
      const ci = document.getElementById('consensus-insights-container');
      const ua = document.getElementById('upset-alert-container');
      if (sg) sg.innerHTML = '';
      if (ci) ci.innerHTML = '';
      if (ua) ua.innerHTML = '';
    }
  } catch {
    document.getElementById('leaderboard-content')!.innerHTML =
      '<div class="lb-empty">Could not load leaderboard. Try again shortly.</div>';
  }
}

export function startLeaderboard(): void {
  fetchLeaderboard();
  lbPollTimer = setInterval(fetchLeaderboard, 2 * 60 * 1000);
}

export function stopLeaderboard(): void {
  if (lbPollTimer) { clearInterval(lbPollTimer); lbPollTimer = undefined; }
}

const ROUND_PTS_LB: Record<string, number> = { r32: 2, r16: 3, qf: 4, sf: 5, final: 8 };

export function renderLeaderboard(): void {
  const container = document.getElementById('leaderboard-content')!;
  if (!lbData) return;

  const { leaderboard, has_any_finished, updated_at } = lbData;

  // Sync golden boot pick from leaderboard if not already set locally
  const meEntry = leaderboard.find(e => e.email === state.email);
  if (meEntry && meEntry.golden_boot_pick && !gbCurrentPick) {
    // Defer import to avoid circular dependency
    const gbInput = document.getElementById('gb-input') as HTMLInputElement | null;
    if (gbInput) gbInput.value = meEntry.golden_boot_pick;
    updateGbDisplay();
  }

  const ago = Math.round((Date.now() - updated_at) / 60000);
  const agoText = ago < 1 ? 'just now' : ago + ' min ago';

  if (!has_any_finished) {
    container.innerHTML = `
      <div class="lb-meta">
        <span>Updated ${escHtml(agoText)}</span>
        <button class="lb-refresh-btn" onclick="window.__app.fetchLeaderboard()">\u21bb Refresh</button>
      </div>
      <div class="lb-empty">
        \u26BD The tournament is underway!<br>Check back once the first match finishes to see rankings.
      </div>`;
    return;
  }

  const rankIcon = (r: number): string => r === 1 ? '\uD83E\uDD47' : r === 2 ? '\uD83E\uDD48' : r === 3 ? '\uD83E\uDD49' : String(r);
  const meEmail = state.email ?? '';

  const rows = leaderboard.map(e => {
    const isMe = e.email === meEmail;
    const rankClass = e.rank <= 3 ? ` rank-${e.rank}` : '';
    const gbBadge = e.golden_boot_pick ? `<span style="font-size:0.65rem;color:var(--grey)">\u26BD ${escHtml(e.golden_boot_pick)}</span>` : '';
    const compareBtn = !isMe && meEmail
      ? `<button class="btn-h2h" onclick="event.stopPropagation();window.__app.openH2H('${escJs(e.email)}','${escJs(e.display_name)}')" title="Compare brackets">\u2694\uFE0F</button>`
      : '';
    return `<div class="lb-row${isMe ? ' lb-me' : ''}" onclick="window.__app.loadOtherBracketFromEmail('${escJs(e.email)}','${escJs(e.display_name)}')">
      <div class="lb-rank${rankClass}">${rankIcon(e.rank)}</div>
      <div style="flex:1;min-width:0">
        <div class="lb-name">${escHtml(e.display_name)} ${isMe ? '<span class="lb-you-badge">YOU</span>' : ''}</div>
        <div class="lb-detail">${e.correct_knockout} correct knock. picks${e.group_score ? ' \u00b7 ' + e.group_score + ' group pts' : ''}</div>
        ${gbBadge}
      </div>
      <div style="text-align:right;display:flex;flex-direction:column;align-items:flex-end;gap:4px">
        <div class="lb-score">${e.score} pts</div>
        ${compareBtn}
      </div>
    </div>`;
  }).join('');

  let myPicksHtml = '';
  const me = leaderboard.find(e => e.email === meEmail);
  if (me && me.picks.length) {
    const pickRows = me.picks.map(p => {
      const icon = p.correct === true ? '\u2705' : p.correct === false ? '\u274c' : '\u23f3';
      const cls = p.correct === true ? 'pick-correct' : p.correct === false ? 'pick-wrong' : '';
      const actualText = p.correct === false && p.actual ? ` \u2192 actually ${escHtml(getFlagForTeam(p.actual))} ${escHtml(p.actual)}` : '';
      return `<div class="pick-row ${cls}">
        <span class="pick-icon">${icon}</span>
        <span class="pick-round">${escHtml(ROUND_LABELS_SHORT[p.round] ?? p.round)}</span>
        <span class="pick-team">${escHtml(getFlagForTeam(p.predicted))} ${escHtml(p.predicted)}</span>
        <span class="pick-actual">${actualText}</span>
      </div>`;
    }).join('');
    const scorePickLine = me.score_pick_score > 0
      ? `<div class="pick-row pick-correct"><span class="pick-icon">\u2705</span><span class="pick-round">SCORE</span><span class="pick-team">+${me.score_pick_score} pts from score picks</span><span class="pick-actual"></span></div>`
      : '';
    const gbLine = me.golden_boot_pick
      ? `<div class="pick-row ${me.golden_boot_score > 0 ? 'pick-correct' : ''}">
          <span class="pick-icon">${me.golden_boot_score > 0 ? '\u2705' : '\u26BD'}</span>
          <span class="pick-round">GB</span>
          <span class="pick-team">${escHtml(me.golden_boot_pick)} ${me.golden_boot_score > 0 ? '(+5 pts!)' : ''}</span>
          <span class="pick-actual">${lbData!.actual_top_scorer && me.golden_boot_pick !== lbData!.actual_top_scorer ? '\u2192 currently ' + escHtml(lbData!.actual_top_scorer) : ''}</span>
        </div>`
      : '';
    myPicksHtml = `<div class="my-picks-section">
      <div class="my-picks-title">Your picks breakdown</div>
      ${pickRows}
      ${scorePickLine}
      ${gbLine}
    </div>`;
  }

  // Who called it
  let whoCalledHtml = '';
  if (has_any_finished) {
    const matchCallers: Record<number, { round: string; predicted: string; names: string[] }> = {};
    for (const entry of leaderboard) {
      for (const p of (entry.picks ?? [])) {
        if (p.correct !== true) continue;
        if (!matchCallers[p.matchNum]) {
          matchCallers[p.matchNum] = { round: p.round, predicted: p.predicted, names: [] };
        }
        matchCallers[p.matchNum].names.push(entry.display_name);
      }
    }
    const calloutRows = Object.entries(matchCallers)
      .sort((a, b) => Number(b[0]) - Number(a[0]))
      .slice(0, 8)
      .map(([mn, info]) => {
        const { round, predicted, names } = info;
        const flag = getFlagForTeam(predicted);
        const pts = ROUND_PTS_LB[round] ?? 0;
        const nameStr = names.length <= 3 ? names.join(', ') : names.slice(0, 3).join(', ') + ' +' + (names.length - 3) + ' more';
        return `<div class="who-called-row">\uD83C\uDF89 ${escHtml(flag)} <strong>${escHtml(predicted)}</strong> (Match ${mn} \u00b7 ${escHtml(ROUND_LABELS_SHORT[round] ?? round)} \u00b7 +${pts} pts) \u2014 ${escHtml(nameStr)}</div>`;
      }).join('');
    if (calloutRows) {
      whoCalledHtml = `<div class="who-called-section"><div class="my-picks-title" style="margin-top:24px">Who called it?</div>${calloutRows}</div>`;
    }
  }

  const shareBtn = `<button class="lb-refresh-btn" onclick="window.__app.copyStandings()" style="margin-left:8px">\uD83D\uDCCB Copy standings</button>`;

  container.innerHTML = `
    <div class="lb-meta">
      <span>Updated ${escHtml(agoText)}</span>
      <div style="display:flex;gap:6px">
        <button class="lb-refresh-btn" onclick="window.__app.fetchLeaderboard()">\u21bb Refresh</button>
        ${shareBtn}
      </div>
    </div>
    ${rows}
    ${whoCalledHtml}
    ${myPicksHtml}`;
}

export async function openH2H(theirEmail: string, theirName: string): Promise<void> {
  const modal = document.getElementById('h2h-modal')!;
  const content = document.getElementById('h2h-content')!;
  const title = document.getElementById('h2h-title')!;
  modal.style.display = 'flex';
  title.textContent = 'You vs ' + theirName;
  content.innerHTML = '<div style="color:var(--grey);font-size:0.85rem;padding:12px 0">Loading...</div>';

  try {
    const [myData, theirData] = await Promise.all([
      apiFetch<{ bracket: { bracket_data: string } }>('/api/brackets/' + encodeURIComponent(state.email)),
      apiFetch<{ bracket: { bracket_data: string } }>('/api/brackets/' + encodeURIComponent(theirEmail)),
    ]);

    const myKo: Record<string, string> = JSON.parse(myData.bracket.bracket_data).knockout ?? {};
    const thKo: Record<string, string> = JSON.parse(theirData.bracket.bracket_data).knockout ?? {};

    const ROUNDS_H2H = [
      { key: 'r32',   label: 'Round of 32',    count: 16 },
      { key: 'r16',   label: 'Round of 16',    count: 8 },
      { key: 'qf',    label: 'Quarter-Finals', count: 4 },
      { key: 'sf',    label: 'Semi-Finals',    count: 2 },
      { key: 'final', label: 'Final',           count: 1 },
    ];

    let html = '<table class="h2h-table"><thead><tr><th>You</th><th>Round</th><th>' + escHtml(theirName) + '</th></tr></thead><tbody>';
    let agreeCount = 0, diffCount = 0;
    for (const { key, label, count } of ROUNDS_H2H) {
      html += `<tr><td colspan="3" class="h2h-round-header">${label}</td></tr>`;
      for (let i = 0; i < count; i++) {
        const myPick = myKo[key + '_' + i] ?? '\u2014';
        const thPick = thKo[key + '_' + i] ?? '\u2014';
        const agree = myPick !== '\u2014' && thPick !== '\u2014' && myPick === thPick;
        const differ = myPick !== '\u2014' && thPick !== '\u2014' && myPick !== thPick;
        if (agree) agreeCount++;
        if (differ) diffCount++;
        const cls = agree ? 'h2h-agree' : differ ? 'h2h-diff' : '';
        const myF = getFlagForTeam(myPick);
        const thF = getFlagForTeam(thPick);
        html += `<tr class="${cls}">
          <td>${myF ? myF + ' ' : ''}${escHtml(myPick)}</td>
          <td class="h2h-match-name">${agree ? '\u2713' : differ ? '\u26a1' : ''}</td>
          <td>${thF ? thF + ' ' : ''}${escHtml(thPick)}</td>
        </tr>`;
      }
    }
    html += '</tbody></table>';
    html += `<div style="margin-top:14px;font-size:0.8rem;color:var(--grey)">
      <span style="color:#4ade80">\u2713 ${agreeCount} in common</span> &nbsp;
      <span style="color:#fb923c">\u26a1 ${diffCount} different</span>
    </div>`;
    content.innerHTML = html;
  } catch (e: unknown) {
    content.innerHTML = '<div style="color:#f87171;font-size:0.85rem">Could not load comparison: ' + escHtml(e instanceof Error ? e.message : 'error') + '</div>';
  }
}

export function closeH2H(): void {
  document.getElementById('h2h-modal')!.style.display = 'none';
}

// ── Score graph ───────────────────────────────────────────────────────────────

const GRAPH_COLORS = [
  '#f5c518','#22c55e','#3b82f6','#f97316','#a855f7',
  '#ec4899','#14b8a6','#ef4444','#84cc16','#06b6d4',
  '#8b5cf6','#fb923c',
];

export function renderScoreGraph(): void {
  const container = document.getElementById('score-graph-container');
  if (!container || !lbData || !lbData.has_any_finished) {
    if (container) container.innerHTML = '';
    return;
  }

  const { leaderboard } = lbData;
  if (!leaderboard.length) return;

  // Collect all finished match numbers sorted
  const allMatchNums = Array.from(new Set(
    leaderboard.flatMap(e => e.picks.filter(p => p.correct !== null).map(p => p.matchNum))
  )).sort((a, b) => a - b);

  if (!allMatchNums.length) return;

  // Compute cumulative score per person per match point
  const ROUND_PTS: Record<string, number> = { r32: 2, r16: 3, qf: 4, sf: 5, final: 8 };
  const series = leaderboard.map((e, idx) => {
    const pickMap: Record<number, boolean> = {};
    for (const p of e.picks) {
      if (p.correct === true) pickMap[p.matchNum] = true;
    }
    let cum = 0;
    const points = allMatchNums.map(mn => {
      const pick = e.picks.find(p => p.matchNum === mn);
      if (pick?.correct === true) cum += ROUND_PTS[pick.round] ?? 0;
      return cum;
    });
    return { name: e.display_name, email: e.email, points, color: GRAPH_COLORS[idx % GRAPH_COLORS.length] };
  });

  const W = Math.min(container.clientWidth || 700, 900);
  const H = 200;
  const PAD = { top: 16, right: 16, bottom: 28, left: 36 };
  const gW = W - PAD.left - PAD.right;
  const gH = H - PAD.top - PAD.bottom;
  const maxScore = Math.max(...series.flatMap(s => s.points), 1);
  const xScale = (i: number) => PAD.left + (i / Math.max(allMatchNums.length - 1, 1)) * gW;
  const yScale = (v: number) => PAD.top + gH - (v / maxScore) * gH;

  const meEmail = state.email;

  // Build SVG paths
  const paths = series.map(s => {
    const isMe = s.email === meEmail;
    const d = s.points.map((v, i) => (i === 0 ? 'M' : 'L') + xScale(i).toFixed(1) + ',' + yScale(v).toFixed(1)).join(' ');
    return `<path d="${d}" fill="none" stroke="${isMe ? 'var(--gold)' : s.color}" stroke-width="${isMe ? 3 : 1.5}" opacity="${isMe ? 1 : 0.55}" class="graph-line" data-name="${escHtml(s.name)}"/>`;
  }).join('');

  // Y axis labels
  const yLabels = [0, Math.round(maxScore / 2), maxScore].map(v =>
    `<text x="${PAD.left - 4}" y="${yScale(v).toFixed(1)}" text-anchor="end" dominant-baseline="middle" fill="var(--grey)" font-size="10">${v}</text>`
  ).join('');

  // X axis label
  const xLabel = `<text x="${PAD.left + gW / 2}" y="${H - 4}" text-anchor="middle" fill="var(--grey)" font-size="10">${allMatchNums.length} match${allMatchNums.length !== 1 ? 'es' : ''} played</text>`;

  // Legend
  const legendItems = series.map(s => {
    const isMe = s.email === meEmail;
    return `<span class="graph-legend-item"><svg width="16" height="8"><line x1="0" y1="4" x2="16" y2="4" stroke="${isMe ? 'var(--gold)' : s.color}" stroke-width="${isMe ? 3 : 1.5}"/></svg>${escHtml(s.name)}${isMe ? ' (you)' : ''}</span>`;
  }).join('');

  container.innerHTML = `
    <div class="graph-section">
      <div class="my-picks-title" style="margin-bottom:12px">Score race</div>
      <div class="graph-wrap">
        <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" style="width:100%;height:auto">
          <line x1="${PAD.left}" y1="${PAD.top}" x2="${PAD.left}" y2="${PAD.top + gH}" stroke="var(--border)" stroke-width="1"/>
          <line x1="${PAD.left}" y1="${PAD.top + gH}" x2="${PAD.left + gW}" y2="${PAD.top + gH}" stroke="var(--border)" stroke-width="1"/>
          ${yLabels}
          ${xLabel}
          ${paths}
        </svg>
      </div>
      <div class="graph-legend">${legendItems}</div>
    </div>`;
}

// ── Consensus insights ────────────────────────────────────────────────────────

export function renderConsensusInsights(consensus: ConsensusData): void {
  const container = document.getElementById('consensus-insights-container');
  if (!container) return;

  const { total_players, picks } = consensus;
  if (!total_players) { container.innerHTML = ''; return; }

  // Most popular champion
  const finalPicks = picks['final_0'] ?? {};
  const sortedChampion = Object.entries(finalPicks).sort((a, b) => b[1] - a[1]);

  let championHtml = '';
  if (sortedChampion.length) {
    const bars = sortedChampion.map(([team, cnt]) => {
      const pct = Math.round((cnt / total_players) * 100);
      const isMe = state.knockout?.['final_0'] === team;
      return `<div class="consensus-bar-row">
        <span class="consensus-bar-label">${getFlagForTeam(team)} ${escHtml(team)}${isMe ? ' <span class="lb-you-badge">you</span>' : ''}</span>
        <div class="consensus-bar-track"><div class="consensus-bar-fill" style="width:${pct}%"></div></div>
        <span class="consensus-bar-pct">${cnt}/${total_players}</span>
      </div>`;
    }).join('');
    championHtml = `<div class="consensus-subsection"><div class="consensus-sub-title">🏆 Champion picks</div>${bars}</div>`;
  }

  // Most contrarian pick (closest to 50/50 with >= 2 players)
  let contrarianHtml = '';
  let mostSplit = 0;
  let splitKey = '';
  let splitTeam = '';
  let splitCnt = 0;
  for (const [key, teamMap] of Object.entries(picks)) {
    const total = Object.values(teamMap).reduce((a, b) => a + b, 0);
    if (total < 2) continue;
    for (const [team, cnt] of Object.entries(teamMap)) {
      const pct = cnt / total;
      const splitness = 1 - Math.abs(0.5 - pct) * 2; // 1 = perfect 50/50
      if (splitness > mostSplit) {
        mostSplit = splitness;
        splitKey = key;
        splitTeam = team;
        splitCnt = cnt;
      }
    }
  }
  if (splitKey && mostSplit > 0.6) {
    const [round, idxStr] = splitKey.split('_');
    const roundLabel = ROUND_LABELS_SHORT[round] ?? round;
    const otherEntries = Object.entries(picks[splitKey]).filter(([t]) => t !== splitTeam);
    const otherTeam = otherEntries.sort((a, b) => b[1] - a[1])[0];
    const pct = Math.round((splitCnt / total_players) * 100);
    contrarianHtml = `<div class="consensus-subsection">
      <div class="consensus-sub-title">⚡ Most debated pick (${roundLabel} match ${Number(idxStr) + 1})</div>
      <div class="consensus-split-text">
        ${getFlagForTeam(splitTeam)} <strong>${escHtml(splitTeam)}</strong> — ${splitCnt}/${total_players} (${pct}%)
        ${otherTeam ? ` vs ${getFlagForTeam(otherTeam[0])} <strong>${escHtml(otherTeam[0])}</strong> — ${otherTeam[1]}/${total_players}` : ''}
      </div>
    </div>`;
  }

  // Who agrees with you on champion
  let agreesHtml = '';
  if (state.email && state.knockout?.['final_0']) {
    const myChamp = state.knockout['final_0'];
    const agreedCnt = finalPicks[myChamp] ?? 0;
    const others = agreedCnt - 1;
    if (others >= 0) {
      agreesHtml = `<div class="consensus-subsection">
        <div class="consensus-sub-title">🤝 Your champion: ${getFlagForTeam(myChamp)} ${escHtml(myChamp)}</div>
        <div class="consensus-split-text">${others === 0 ? 'Only you picked this! Bold call.' : others === 1 ? '1 other person agrees with you.' : others + ' others agree with you.'}</div>
      </div>`;
    }
  }

  if (!championHtml && !contrarianHtml && !agreesHtml) { container.innerHTML = ''; return; }

  container.innerHTML = `<div class="consensus-section">
    <div class="my-picks-title" style="margin-bottom:12px">Group consensus</div>
    ${championHtml}
    ${contrarianHtml}
    ${agreesHtml}
  </div>`;
}

// ── Upset alert ───────────────────────────────────────────────────────────────

const KNOCKOUT_MATCH_NUMS: Record<string, number[]> = {
  r32:   Array.from({ length: 16 }, (_, i) => 73 + i),
  r16:   Array.from({ length: 8 },  (_, i) => 89 + i),
  qf:    Array.from({ length: 4 },  (_, i) => 97 + i),
  sf:    Array.from({ length: 2 },  (_, i) => 101 + i),
  final: [104],
};

function matchNumToRoundKey(mn: number): string {
  for (const [r, nums] of Object.entries(KNOCKOUT_MATCH_NUMS)) {
    if (nums.includes(mn)) return r;
  }
  return '';
}

export function checkForUpsets(consensus: ConsensusData, results: MatchResult[]): void {
  const container = document.getElementById('upset-alert-container');
  if (!container) return;

  const { total_players, picks } = consensus;
  if (!total_players) return;

  const dismissed = JSON.parse(sessionStorage.getItem('wc26_upsets_dismissed') ?? '[]') as number[];
  const upsets: Array<{ matchNum: number; winner: string; loser: string; calledBy: number; pct: number }> = [];

  for (const match of results) {
    if (match.status !== 'FINISHED' || !match.home_team || !match.away_team) continue;
    const mn = match.match_num;
    if (mn < 73) continue; // only knockout matches
    if (dismissed.includes(mn)) continue;

    const roundKey = matchNumToRoundKey(mn);
    if (!roundKey) continue;
    const matchIdx = KNOCKOUT_MATCH_NUMS[roundKey].indexOf(mn);
    if (matchIdx === -1) continue;

    const pickKey = roundKey + '_' + matchIdx;
    const teamPicks = picks[pickKey] ?? {};
    const winner = Object.entries(teamPicks).sort((a, b) => b[1] - a[1])[0];
    if (!winner) continue;

    // Determine actual winner from score
    const actualWinner = match.home_score !== null && match.away_score !== null
      ? (match.home_score > match.away_score ? match.home_team : match.away_team)
      : null;
    if (!actualWinner) continue;

    const calledBy = teamPicks[actualWinner] ?? 0;
    const pct = calledBy / total_players;
    if (pct < 0.33) {
      const loser = actualWinner === match.home_team ? match.away_team : match.home_team;
      upsets.push({ matchNum: mn, winner: actualWinner, loser, calledBy, pct });
    }
  }

  if (!upsets.length) { container.innerHTML = ''; return; }

  const html = upsets.map(u => {
    const pctStr = Math.round(u.pct * 100) + '%';
    return `<div class="upset-alert" data-match="${u.matchNum}">
      <span class="upset-emoji">😱</span>
      <span class="upset-text">Upset! ${getFlagForTeam(u.winner)} <strong>${escHtml(u.winner)}</strong> beat ${getFlagForTeam(u.loser)} ${escHtml(u.loser)} — only ${u.calledBy}/${total_players} (${pctStr}) of your group called it!</span>
      <button class="upset-dismiss" onclick="window.__app.dismissUpset(${u.matchNum})">✕</button>
    </div>`;
  }).join('');

  container.innerHTML = html;
}

export function dismissUpset(matchNum: number): void {
  const dismissed = JSON.parse(sessionStorage.getItem('wc26_upsets_dismissed') ?? '[]') as number[];
  if (!dismissed.includes(matchNum)) dismissed.push(matchNum);
  sessionStorage.setItem('wc26_upsets_dismissed', JSON.stringify(dismissed));
  const el = document.querySelector(`.upset-alert[data-match="${matchNum}"]`);
  if (el) el.remove();
}

// ── Hall of Fame (post-tournament) ────────────────────────────────────────────

export function renderHallOfFame(): void {
  if (!lbData || !lbData.leaderboard.length) return;
  const hof = document.getElementById('hof-container');
  if (!hof) return;

  const winner = lbData.leaderboard[0];
  const podium = lbData.leaderboard.slice(0, 3);
  const champion = winner.picks.find(p => p.round === 'final' && p.correct);
  const champTeam = champion ? champion.predicted : winner.picks.find(p => p.round === 'final')?.predicted ?? '?';

  const podiumHtml = podium.map((e, i) => {
    const medal = i === 0 ? '\uD83E\uDD47' : i === 1 ? '\uD83E\uDD48' : '\uD83E\uDD49';
    const isMe = e.email === state.email;
    return `<div class="hof-podium-item hof-podium-${i + 1}">
      <div class="hof-medal">${medal}</div>
      <div class="hof-podium-name">${escHtml(e.display_name)}${isMe ? ' <span class="lb-you-badge">YOU</span>' : ''}</div>
      <div class="hof-podium-score">${e.score} pts</div>
      <div class="hof-podium-detail">${e.correct_knockout} correct picks</div>
    </div>`;
  }).join('');

  hof.innerHTML = `
    <div class="hof-card">
      <div class="hof-header">
        <div class="hof-trophy">🏆</div>
        <div>
          <div class="hof-title">Hall of Fame</div>
          <div class="hof-subtitle">FIFA World Cup 2026 — Final Standings</div>
        </div>
      </div>
      <div class="hof-champion">
        <div class="hof-champion-label">Tournament Winner</div>
        <div class="hof-champion-name">${escHtml(winner.display_name)}</div>
        <div class="hof-champion-stats">
          ${escHtml(String(winner.score))} pts
          ${champTeam !== '?' ? ' \u00b7 Picked \uD83C\uDFC6 ' + escHtml(getFlagForTeam(champTeam)) + ' ' + escHtml(champTeam) : ''}
          ${lbData.actual_top_scorer ? ' \u00b7 \u26BD ' + (winner.golden_boot_score > 0 ? '\u2705 GB correct!' : escHtml(lbData.actual_top_scorer) + ' top scorer') : ''}
        </div>
      </div>
      <div class="hof-podium">${podiumHtml}</div>
      <div class="hof-actions">
        <button class="lb-refresh-btn" onclick="window.__app.copyStandings()" style="padding:10px 20px;font-size:0.85rem">\uD83D\uDCCB Copy final standings</button>
      </div>
    </div>`;
}

export function copyStandings(): void {
  if (!lbData || !lbData.leaderboard.length) { showToast('No standings yet', 'error'); return; }
  const dateStr = new Date().toLocaleDateString([], { month: 'short', day: 'numeric' });
  const rankEmoji = (r: number): string => r === 1 ? '\uD83E\uDD47' : r === 2 ? '\uD83E\uDD48' : r === 3 ? '\uD83E\uDD49' : r + '.';
  const lines = [
    '\uD83C\uDFC6 World Cup 2026 \u2014 Standings (' + dateStr + ')',
    '',
    ...lbData.leaderboard.map(e => {
      const pad = e.rank < 10 ? ' ' : '';
      return pad + rankEmoji(e.rank) + ' ' + e.display_name.padEnd(16) + ' \u2014 ' + e.score + ' pts';
    }),
    '',
    'updated every 5 min \u00b7 worldcup-bracket.cda-testing.workers.dev',
  ];
  const text = lines.join(String.fromCharCode(10));
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => showToast('\uD83D\uDCCB Copied! Paste into WhatsApp.', 'success'));
  } else {
    prompt('Copy this standings text:', text);
  }
}
