import { getLiveTeams, loadLiveResults } from './liveResults';
import { getFlagForTeam } from './data';

const ROUNDS: { label: string; matchNums: number[] }[] = [
  { label: 'Round of 32',    matchNums: Array.from({ length: 16 }, (_, i) => 73 + i) },
  { label: 'Round of 16',   matchNums: Array.from({ length: 8 },  (_, i) => 89 + i) },
  { label: 'Quarter-finals', matchNums: Array.from({ length: 4 },  (_, i) => 97 + i) },
  { label: 'Semi-finals',    matchNums: Array.from({ length: 2 },  (_, i) => 101 + i) },
  { label: 'Final',          matchNums: [104] },
];

function matchSlotHtml(matchNum: number): string {
  const m = getLiveTeams(matchNum);

  if (!m) {
    return `<div class="lb-match lb-match--tbd">
      <div class="lb-team lb-team--tbd"><span class="lb-flag">🏳</span><span class="lb-name">TBD</span></div>
      <div class="lb-vs">vs</div>
      <div class="lb-team lb-team--tbd"><span class="lb-flag">🏳</span><span class="lb-name">TBD</span></div>
    </div>`;
  }

  const homeWon = m.status === 'FINISHED' && m.homeScore !== null && m.awayScore !== null && m.homeScore > m.awayScore;
  const awayWon = m.status === 'FINISHED' && m.homeScore !== null && m.awayScore !== null && m.awayScore > m.homeScore;
  const live = m.status === 'IN_PLAY' || m.status === 'PAUSED';

  const homeName = m.home ?? 'TBD';
  const awayName = m.away ?? 'TBD';
  const homeScore = m.homeScore !== null ? `<span class="lb-score">${m.homeScore}</span>` : '';
  const awayScore = m.awayScore !== null ? `<span class="lb-score">${m.awayScore}</span>` : '';
  const liveIndicator = live ? '<span class="lb-live-dot"></span>' : '';

  const matchClass = [
    'lb-match',
    m.status === 'FINISHED' ? 'lb-match--finished' : '',
    live ? 'lb-match--live' : '',
  ].filter(Boolean).join(' ');

  return `<div class="${matchClass}">
    ${liveIndicator}
    <div class="lb-team${homeWon ? ' lb-team--winner' : ''}">
      <span class="lb-flag">${getFlagForTeam(homeName)}</span>
      <span class="lb-name">${homeName}</span>
      ${homeScore}
    </div>
    <div class="lb-team${awayWon ? ' lb-team--winner' : ''}">
      <span class="lb-flag">${getFlagForTeam(awayName)}</span>
      <span class="lb-name">${awayName}</span>
      ${awayScore}
    </div>
  </div>`;
}

export function renderLiveBracket(): void {
  const container = document.getElementById('live-bracket-panel');
  if (!container) return;

  let html = '<div style="text-align:center;padding:12px 0 4px;color:var(--grey);font-size:0.78rem">Showing real match results · auto-refreshes every 60s</div>';
  html += '<div class="lb-bracket">';
  for (const round of ROUNDS) {
    html += `<div class="lb-round">
      <div class="lb-round-label">${round.label}</div>
      <div class="lb-round-matches">`;
    for (const matchNum of round.matchNums) {
      html += `<div class="lb-match-wrapper" data-match="${matchNum}">
        ${matchSlotHtml(matchNum)}
        <div class="lb-match-num">M${matchNum}</div>
      </div>`;
    }
    html += '</div></div>';
  }
  html += '</div>';
  container.innerHTML = html;
}

let liveBracketTimer: ReturnType<typeof setInterval> | undefined;

export function startLiveBracketPolling(): void {
  if (liveBracketTimer) return;
  loadLiveResults().then(() => renderLiveBracket());
  liveBracketTimer = setInterval(async () => {
    await loadLiveResults();
    renderLiveBracket();
  }, 60 * 1000);
}

export function stopLiveBracketPolling(): void {
  if (liveBracketTimer) {
    clearInterval(liveBracketTimer);
    liveBracketTimer = undefined;
  }
}
