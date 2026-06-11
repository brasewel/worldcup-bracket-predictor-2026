import { state } from './state';
import { SCHEDULE, SCHEDULE_UTC_MS, getRoundLabel, formatMatchTime, getFlagForTeam, MatchRow } from './data';
import { escHtml, escJs, showToast } from './utils';
import { apiFetch } from './api';
import { getLiveTeams, loadLiveResults } from './liveResults';

const schedulePickCache: Record<number, { picked: string | null; tally: Array<{ team: string; cnt: number }> | null } | 'loading' | null> = {};
const scorePickCache: Record<string, { myPick: { home_score: number; away_score: number } | null; tally: Array<{ home_score: number; away_score: number; cnt: number }> | null } | 'loading' | null> = {};

export function clearScheduleCache(): void {
  for (const k in schedulePickCache) delete schedulePickCache[k as unknown as number];
  for (const k in scorePickCache) delete scorePickCache[k];
}

export async function loadMatchPick(matchId: number): Promise<void> {
  if (!state.email) return;
  if (schedulePickCache[matchId] === 'loading') return;
  schedulePickCache[matchId] = 'loading';
  try {
    const data = await apiFetch<{ picked: string | null; tally: Array<{ team: string; cnt: number }> | null }>(
      '/api/live-picks/' + matchId + '?email=' + encodeURIComponent(state.email)
    );
    schedulePickCache[matchId] = data;
    renderMatchCard(matchId);
  } catch {
    schedulePickCache[matchId] = null;
  }
}

export async function makeMatchPick(matchId: number, team: string): Promise<void> {
  if (!state.email) { showToast('Load your bracket first to make picks', 'error'); return; }
  try {
    const data = await apiFetch<{ ok: boolean; tally: Array<{ team: string; cnt: number }> }>(
      '/api/live-picks/' + matchId, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: state.email, team }),
      }
    );
    schedulePickCache[matchId] = { picked: team, tally: data.tally };
    renderMatchCard(matchId);
  } catch (e: unknown) {
    showToast('Could not save pick: ' + (e instanceof Error ? e.message : 'error'), 'error');
  }
}

export async function loadScorePick(matchId: string): Promise<void> {
  if (!state.email) return;
  if (scorePickCache[matchId] === 'loading') return;
  scorePickCache[matchId] = 'loading';
  try {
    const data = await apiFetch<{ myPick: { home_score: number; away_score: number } | null; tally: Array<{ home_score: number; away_score: number; cnt: number }> | null }>(
      '/api/score-picks/' + matchId + '?email=' + encodeURIComponent(state.email)
    );
    scorePickCache[matchId] = data;
    renderMatchCard(Number(matchId));
  } catch { scorePickCache[matchId] = null; }
}

export async function submitScorePick(matchId: string, homeScore: number, awayScore: number): Promise<void> {
  if (!state.email) { showToast('Load your bracket first', 'error'); return; }
  try {
    const data = await apiFetch<{ ok: boolean; myPick: { home_score: number; away_score: number }; tally: Array<{ home_score: number; away_score: number; cnt: number }> }>(
      '/api/score-picks/' + matchId, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: state.email, home_score: homeScore, away_score: awayScore }),
      }
    );
    scorePickCache[matchId] = { myPick: data.myPick, tally: data.tally };
    showToast('\u26BD Score pick saved!', 'success');
    renderMatchCard(Number(matchId));
  } catch (e: unknown) {
    showToast('Could not save: ' + (e instanceof Error ? e.message : 'error'), 'error');
  }
}

function buildScorePickHtml(matchId: string, canPick: boolean): string {
  const sp = scorePickCache[matchId];
  const spResolved = (sp && sp !== 'loading') ? sp : null;
  const hasPick = spResolved?.myPick ?? null;
  const matchUtcMs = SCHEDULE_UTC_MS[Number(matchId)];
  const kickedOff = matchUtcMs ? Date.now() >= matchUtcMs : false;

  if (kickedOff || !canPick) {
    if (hasPick && spResolved?.myPick) {
      const p = spResolved.myPick;
      const tallyRows = (spResolved.tally ?? []).map(r =>
        `<span style="font-size:0.68rem;color:var(--grey)">${r.home_score}\u2013${r.away_score} (${r.cnt})</span>`
      ).join(', ');
      return `<div class="score-pick-row">\u26BD Your score pick: <strong>${p.home_score}\u2013${p.away_score}</strong>${tallyRows ? ' \u00b7 group: ' + tallyRows : ''}</div>`;
    }
    return '';
  }

  const h = spResolved?.myPick ? spResolved.myPick.home_score : '';
  const a = spResolved?.myPick ? spResolved.myPick.away_score : '';
  return `<div class="score-pick-row">
    <span style="font-size:0.72rem;color:var(--grey);margin-right:6px">\u26BD Score pick:</span>
    <input class="score-input" id="sp-h-${matchId}" type="number" min="0" max="20" value="${h}" placeholder="0" style="width:36px">
    <span style="color:var(--grey);margin:0 4px">\u2013</span>
    <input class="score-input" id="sp-a-${matchId}" type="number" min="0" max="20" value="${a}" placeholder="0" style="width:36px">
    <button class="btn-score-submit" onclick="(function(){
      var h=parseInt(document.getElementById('sp-h-${matchId}').value);
      var a=parseInt(document.getElementById('sp-a-${matchId}').value);
      if(isNaN(h)||isNaN(a))return;
      window.__app.submitScorePick('${matchId}',h,a);
    })()">Save</button>
  </div>`;
}

export function buildMatchCardInner(m: MatchRow): string {
  const [matchId, dateStr, timeET, t1raw, t2raw, , venue, city] = m;
  const cache = schedulePickCache[matchId];
  const picked = cache && cache !== 'loading' ? cache.picked : null;
  const tally  = cache && cache !== 'loading' ? cache.tally  : null;

  const live = getLiveTeams(matchId);
  const t1 = live ? live.home : t1raw;
  const t2 = live ? live.away : t2raw;
  const teamsKnown = !!(live ? (live.home && live.away) : matchId <= 72);
  const isGroupStage = matchId <= 72;

  const timeLocal = formatMatchTime(dateStr, timeET);
  const roundLabel = getRoundLabel(matchId);
  const f1 = teamsKnown ? getFlagForTeam(t1 ?? '') : '';
  const f2 = teamsKnown ? getFlagForTeam(t2 ?? '') : '';
  const canPick = !!state.email && teamsKnown;

  let scoreBadge = '';
  if (live && live.homeScore !== null && live.awayScore !== null) {
    const isLive = live.status === 'IN_PLAY' || live.status === 'PAUSED' || live.status === 'HALFTIME';
    const color = isLive ? '#ef4444' : 'var(--gold)';
    scoreBadge = ` <span style="color:${color};font-weight:900;font-size:1rem;margin:0 6px">${live.homeScore}\u2013${live.awayScore}${isLive ? ' \uD83D\uDD34' : ''}</span>`;
  }

  let teamsHtml: string;
  if (!teamsKnown) {
    teamsHtml = `<div class="match-tbd-teams">${escHtml(t1 ?? '')} vs ${escHtml(t2 ?? '')}</div>`;
  } else if (picked) {
    teamsHtml = `<div class="match-card-teams">
      <button class="match-pick-btn${picked === t1 ? ' picked' : ''}" disabled>${f1} ${escHtml(t1 ?? '')}</button>
      <div class="match-vs">VS</div>
      <button class="match-pick-btn${picked === t2 ? ' picked' : ''}" disabled>${f2} ${escHtml(t2 ?? '')}</button>
    </div>`;
  } else {
    teamsHtml = `<div class="match-card-teams">
      <button class="match-pick-btn" ${canPick ? `onclick="window.__app.makeMatchPick(${matchId},'${escJs(t1 ?? '')}')"` : 'disabled'}>${f1} ${escHtml(t1 ?? '')}</button>
      <div class="match-vs">VS</div>
      <button class="match-pick-btn" ${canPick ? `onclick="window.__app.makeMatchPick(${matchId},'${escJs(t2 ?? '')}')"` : 'disabled'}>${f2} ${escHtml(t2 ?? '')}</button>
    </div>`;
  }

  let tallyHtml = '';
  if (picked && tally && tally.length) {
    const total = tally.reduce((s, r) => s + Number(r.cnt), 0);
    const bars = [t1, t2].map(team => {
      const row = tally.find(r => r.team === team);
      const cnt = row ? Number(row.cnt) : 0;
      const pct = total ? Math.round(cnt / total * 100) : 0;
      const isPicked = picked === team;
      const flag = teamsKnown ? getFlagForTeam(team ?? '') : '';
      return `<div class="tally-bar-wrap">
        <div class="tally-label">${flag} ${escHtml(team ?? '')}${isPicked ? ' \u2713' : ''}</div>
        <div class="tally-bar-outer"><div class="tally-bar-inner" style="width:${pct}%"></div></div>
        <div class="tally-count">${cnt}</div>
      </div>`;
    }).join('');
    tallyHtml = `<div class="match-tally visible">${bars}<div class="tally-total">${total} pick${total !== 1 ? 's' : ''} in your group</div></div>`;
  }

  const scorePickHtml = isGroupStage && teamsKnown ? buildScorePickHtml(String(matchId), canPick) : '';

  const isLive2 = live && (live.status === 'IN_PLAY' || live.status === 'PAUSED' || live.status === 'HALFTIME');
  const isFinished = live && live.status === 'FINISHED';
  let matchDetailTrigger = '';
  if (isLive2 || isFinished) {
    const label = isFinished ? '\uD83D\uDCCB Match summary' : '\uD83D\uDD34 Live updates';
    matchDetailTrigger = `<button class="btn-match-detail" onclick="window.__app.toggleMatchDetail(${matchId})">${label}</button>
    <div id="match-detail-${matchId}" class="match-detail-panel" style="display:none"></div>`;
  }

  return `<div class="match-card-meta">
    <span>${escHtml(roundLabel)}${scoreBadge}</span>
    <span>${timeLocal} ET \u00b7 ${escHtml(venue)}, ${escHtml(city)}</span>
  </div>
  ${teamsHtml}
  ${tallyHtml}
  ${scorePickHtml}
  ${matchDetailTrigger}`;
}

function renderMatchCard(matchId: number): void {
  const el = document.getElementById('match-card-' + matchId);
  if (!el) return;
  const m = SCHEDULE.find(x => x[0] === matchId);
  if (!m) return;
  el.innerHTML = buildMatchCardInner(m);
}

export async function renderSchedule(): Promise<void> {
  const container = document.getElementById('schedule-days')!;
  const loginNotice = document.getElementById('schedule-login-notice')!;
  loginNotice.style.display = state.email ? 'none' : 'block';

  await loadLiveResults();

  const byDate: Record<string, MatchRow[]> = {};
  for (const m of SCHEDULE) {
    const d = m[1];
    if (!byDate[d]) byDate[d] = [];
    byDate[d].push(m);
  }

  const todayStr = new Date().toISOString().slice(0, 10);

  container.innerHTML = Object.entries(byDate).map(([date, matches]) => {
    const isToday = date === todayStr;
    const dateLabel = new Date(date + 'T12:00:00Z').toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
    const anchorId = isToday ? 'id="today-anchor"' : '';
    const todayBadge = isToday ? '<span class="today-badge">TODAY</span>' : '';

    let lastRound: string | null = null;
    const cardsHtml = matches.map(m => {
      const round = getRoundLabel(m[0]);
      const roundHeader = round !== lastRound ? `<div class="schedule-round-label">${escHtml(round)}</div>` : '';
      lastRound = round;
      return roundHeader + `<div class="match-card${isToday ? ' today-match' : ''}" id="match-card-${m[0]}">${buildMatchCardInner(m)}</div>`;
    }).join('');

    return `<div class="schedule-day" ${anchorId}>
      <div class="schedule-day-header">${escHtml(dateLabel)} ${todayBadge}</div>
      ${cardsHtml}
    </div>`;
  }).join('');

  if (state.email) {
    for (const m of SCHEDULE) {
      if (m[0] <= 72) {
        if (!schedulePickCache[m[0]]) loadMatchPick(m[0]);
        if (!scorePickCache[String(m[0])]) loadScorePick(String(m[0]));
      }
    }
  }
}

// ── Schedule auto-refresh ─────────────────────────────────────────────────────

let schedulePollTimer: ReturnType<typeof setInterval> | undefined;

export function startSchedulePolling(): void {
  if (schedulePollTimer) return; // already running
  schedulePollTimer = setInterval(async () => {
    await loadLiveResults();
    renderSchedule();
  }, 60 * 1000);
}

export function stopSchedulePolling(): void {
  if (schedulePollTimer) { clearInterval(schedulePollTimer); schedulePollTimer = undefined; }
}

interface GoalEvent {
  minute: number | null;
  extra_time: number | null;
  scorer_name: string | null;
  team_name: string | null;
  goal_type: string | null;
}

export async function toggleMatchDetail(matchId: number): Promise<void> {
  const panel = document.getElementById('match-detail-' + matchId);
  if (!panel) return;
  if (panel.style.display !== 'none') { panel.style.display = 'none'; return; }
  panel.innerHTML = '<div style="color:var(--grey);font-size:0.78rem;padding:8px 0">Loading...</div>';
  panel.style.display = 'block';
  try {
    const data = await apiFetch<{
      events: Array<{ home_score: number; away_score: number; detected_at: number }>;
      match: { home_team: string; away_team: string; home_score: number | null; away_score: number | null; home_score_ht: number | null; away_score_ht: number | null; status: string; winner: string | null } | null;
      goals: GoalEvent[];
    }>('/api/match-events/' + matchId);
    const { events, match, goals } = data;
    const ht = (match && match.home_score_ht !== null) ? `HT: ${match.home_score_ht}\u2013${match.away_score_ht}` : '';
    let html = '';

    if (match && match.status === 'FINISHED') {
      html += `<div class="match-summary-header">Full time${ht ? ' \u00b7 ' + ht : ''}</div>`;
    } else if (match) {
      html += `<div class="match-summary-header" style="color:#ef4444">\uD83D\uDD34 Live ${ht ? '\u00b7 HT: ' + ht : ''}</div>`;
    }

    if (goals && goals.length) {
      // Render per-goal scorer rows
      html += goals.map(g => {
        const minStr = g.minute !== null
          ? (g.extra_time ? `${g.minute}+${g.extra_time}'` : `${g.minute}'`)
          : '';
        const scorer = g.scorer_name ?? 'Unknown';
        const team = g.team_name ? `<span style="color:var(--grey);font-size:0.7rem">(${escHtml(g.team_name)})</span>` : '';
        const typeLabel = g.goal_type === 'OWN' ? ' <span class="goal-type-badge">OG</span>'
          : g.goal_type === 'PENALTY' ? ' <span class="goal-type-badge">PEN</span>'
          : '';
        return `<div class="goal-event">
          <span class="goal-minute">${escHtml(minStr)}</span>
          \u26BD <strong>${escHtml(scorer)}</strong>${typeLabel} ${team}
        </div>`;
      }).join('');
    } else if (events && events.length) {
      // Fallback: score-change snapshots
      html += events.map(e => {
        const t = new Date(e.detected_at);
        const timeStr = t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return `<div class="goal-event">\u26BD ${e.home_score}\u2013${e.away_score} <span style="color:var(--grey);font-size:0.68rem">(detected ~${timeStr})</span></div>`;
      }).join('');
    } else {
      html += '<div style="color:var(--grey);font-size:0.78rem">No goals recorded yet</div>';
    }

    panel.innerHTML = html;
  } catch {
    panel.innerHTML = '<div style="color:#f87171;font-size:0.78rem">Could not load match detail</div>';
  }
}
