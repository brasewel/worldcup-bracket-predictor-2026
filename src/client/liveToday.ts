import { SCHEDULE, SCHEDULE_UTC_MS, formatMatchTime, getFlagForTeam } from './data';
import { getLiveTeams, loadLiveResults } from './liveResults';
import { escHtml } from './utils';

function buildLiveTodayCard(matchNum: number): string {
  const m = SCHEDULE.find(x => x[0] === matchNum);
  if (!m) return '';

  const [, dateStr, timeET, t1raw, t2raw, , venue, city] = m;
  const live = getLiveTeams(matchNum);
  const t1 = live ? (live.home ?? t1raw) : t1raw;
  const t2 = live ? (live.away ?? t2raw) : t2raw;
  const f1 = getFlagForTeam(t1 ?? '');
  const f2 = getFlagForTeam(t2 ?? '');
  const status = live ? live.status : 'TIMED';
  const isLive = status === 'IN_PLAY' || status === 'PAUSED' || status === 'HALFTIME';
  const isFinished = status === 'FINISHED';
  const kickoffUtcMs = SCHEDULE_UTC_MS[matchNum];
  const isStarted = kickoffUtcMs ? Date.now() >= kickoffUtcMs : false;

  // Status badge
  let statusBadgeHtml: string;
  if (isLive) {
    let clockStr = '';
    if (live && live.matchMinute !== null) {
      clockStr = live.matchInjury
        ? ` ${live.matchMinute}+${live.matchInjury}'`
        : ` ${live.matchMinute}'`;
    }
    statusBadgeHtml = `<span class="live-today-status live-today-status--live"><span class="live-dot"></span> LIVE${escHtml(clockStr)}</span>`;
  } else if (isFinished) {
    statusBadgeHtml = `<span class="live-today-status live-today-status--finished">Full time</span>`;
  } else if (isStarted) {
    statusBadgeHtml = `<span class="live-today-status live-today-status--pending">In progress</span>`;
  } else {
    statusBadgeHtml = `<span class="live-today-status live-today-status--upcoming">${formatMatchTime(dateStr, timeET)} ET</span>`;
  }

  // Score display
  const hasScore = live && live.homeScore !== null && live.awayScore !== null;
  const scoreHtml = hasScore
    ? `<div class="live-today-score">${live!.homeScore}<span class="live-today-score-sep">–</span>${live!.awayScore}</div>`
    : `<div class="live-today-score live-today-score--pending">vs</div>`;

  // Team rows
  const homeWon = isFinished && hasScore && live!.homeScore! > live!.awayScore!;
  const awayWon = isFinished && hasScore && live!.awayScore! > live!.homeScore!;

  const teamsHtml = `
    <div class="live-today-teams">
      <div class="live-today-team${homeWon ? ' live-today-team--winner' : ''}">
        <span class="live-today-flag">${f1}</span>
        <span class="live-today-name">${escHtml(t1 ?? 'TBD')}</span>
      </div>
      ${scoreHtml}
      <div class="live-today-team${awayWon ? ' live-today-team--winner' : ''}">
        <span class="live-today-flag">${f2}</span>
        <span class="live-today-name">${escHtml(t2 ?? 'TBD')}</span>
      </div>
    </div>`;

  // Detail expand trigger (for live/finished matches)
  const detailTrigger = (isLive || isFinished)
    ? `<button class="btn-match-detail" onclick="event.stopPropagation();window.__app.toggleMatchDetail(${matchNum})">${isFinished ? '📋 Match summary' : '🔴 Live updates'}</button>
       <div id="match-detail-${matchNum}" class="match-detail-panel" style="display:none"></div>`
    : '';

  return `<div class="live-today-card" onclick="${(isLive || isFinished) ? `window.__app.toggleMatchDetail(${matchNum})` : ''}">
    <div class="live-today-card-header">
      ${statusBadgeHtml}
      <span class="live-today-venue">${escHtml(venue)}, ${escHtml(city)}</span>
    </div>
    ${teamsHtml}
    ${detailTrigger}
  </div>`;
}

export function renderLiveToday(): void {
  const container = document.getElementById('live-panel');
  if (!container) return;

  // Use ET (UTC-4) to match the date format stored in SCHEDULE
  const etNow = new Date(Date.now() - 4 * 60 * 60 * 1000);
  const todayStr = etNow.toISOString().slice(0, 10);
  const todayMatches = SCHEDULE.filter(m => m[1] === todayStr);

  // Only show matches that are currently in progress
  const liveMatches = todayMatches.filter(m => {
    const s = getLiveTeams(m[0])?.status ?? 'TIMED';
    return s === 'IN_PLAY' || s === 'PAUSED' || s === 'HALFTIME';
  });

  if (!liveMatches.length) {
    container.innerHTML = '';
    return;
  }

  const cards = liveMatches.map(m => buildLiveTodayCard(m[0])).join('');
  container.innerHTML = `<div class="live-today-list">${cards}</div>`;
}

let liveTodayTimer: ReturnType<typeof setInterval> | undefined;

export function startLiveTodayPolling(): void {
  if (liveTodayTimer) return;
  loadLiveResults().then(() => renderLiveToday());
  liveTodayTimer = setInterval(async () => {
    await loadLiveResults();
    renderLiveToday();
  }, 60 * 1000);
}

export function stopLiveTodayPolling(): void {
  if (liveTodayTimer) {
    clearInterval(liveTodayTimer);
    liveTodayTimer = undefined;
  }
}
