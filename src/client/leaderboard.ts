import { state } from './state';
import { ROUND_LABELS_SHORT, getFlagForTeam } from './data';
import { escHtml, escJs, showToast } from './utils';
import { apiFetch } from './api';
import { gbCurrentPick, updateGbDisplay } from './goldenBoot';

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
    lbData = await apiFetch<LeaderboardData>('/api/leaderboard');
    renderLeaderboard();
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
