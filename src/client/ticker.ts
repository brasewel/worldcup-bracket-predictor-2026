import { SCHEDULE, formatMatchTime } from './data';
import { getFlagForTeam } from './data';
import { escHtml } from './utils';
import { getLiveTeams } from './liveResults';

export function renderTicker(): void {
  const ticker = document.getElementById('score-ticker')!;
  // Use ET (UTC-4) to match the date format stored in SCHEDULE
  const etNow = new Date(Date.now() - 4 * 60 * 60 * 1000);
  const todayStr = etNow.toISOString().slice(0, 10);
  const todayMatches = SCHEDULE.filter(m => m[1] === todayStr);
  if (!todayMatches.length) { ticker.style.display = 'none'; return; }

  const items = todayMatches.map(m => {
    const live = getLiveTeams(m[0]);
    const t1 = live ? live.home : m[3];
    const t2 = live ? live.away : m[4];
    const f1 = getFlagForTeam(t1 ?? '');
    const f2 = getFlagForTeam(t2 ?? '');
    const status = live ? live.status : 'TIMED';
    const isLive = status === 'IN_PLAY' || status === 'PAUSED' || status === 'HALFTIME';
    const isDone = status === 'FINISHED';
    const scoreStr = (live && live.homeScore !== null) ? `${live.homeScore}\u2013${live.awayScore}` : formatMatchTime(m[1], m[2]);
    const statusLabel = isLive ? 'Live' : isDone ? 'Full time' : formatMatchTime(m[1], m[2]) + ' ET';

    return `<div class="ticker-item${isLive ? ' live' : isDone ? ' done' : ''}">
      <div class="ticker-teams">${f1} ${escHtml((t1 ?? 'TBD').slice(0, 10))} v ${escHtml((t2 ?? 'TBD').slice(0, 10))} ${f2}</div>
      <div class="ticker-score">${isDone || isLive ? escHtml(scoreStr) : '\u2013'}</div>
      <div class="ticker-status${isLive ? ' live-dot' : ''}">${escHtml(statusLabel)}</div>
    </div>`;
  }).join('');

  ticker.innerHTML = items;
  ticker.style.display = 'flex';
}
