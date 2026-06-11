import { state, isPastDeadline, isReadOnly, resetGroupsToDefault, DEADLINE, setLastSavedAt } from './state';
import { GROUPS_DATA } from './data';
import { apiFetch, apiBracketList, apiBracketGet, apiBracketSave, BracketListItem } from './api';
import { escHtml, escJs, timeAgo, showToast } from './utils';
import { renderGroups, moveTeam } from './groups';
import {
  renderBracket, renderThirdPlaceSection, renderSaveBar,
  updateGroupStageVisibility, pickWinner, pick3rd, autoPickAll,
  isBracketComplete, countMissingPicks,
} from './bracket';
import { renderTicker } from './ticker';
import { loadConsensus } from './consensus';
import { renderSchedule, makeMatchPick, submitScorePick, toggleMatchDetail, clearScheduleCache, startSchedulePolling, stopSchedulePolling } from './schedule';
import {
  fetchLeaderboard, startLeaderboard, stopLeaderboard,
  renderLeaderboard, openH2H, closeH2H, copyStandings, lbData,
  dismissUpset,
} from './leaderboard';
import { loadLiveResults } from './liveResults';
import { renderLiveBracket, startLiveBracketPolling, stopLiveBracketPolling } from './liveBracket';
import {
  gbCurrentPick, setGbCurrentPick, filterGbPlayers, selectGbPlayer, updateGbDisplay,
} from './goldenBoot';

// ── Countdown ────────────────────────────────────────────────────────────────

let deadlineWarningDismissed = false;
let deadlinePassedHandled = false;

function updateCountdown(): void {
  const el = document.getElementById('countdown-text')!;
  const header = document.getElementById('countdown-header')!;
  if (isPastDeadline()) {
    el.textContent = 'PICKS LOCKED';
    header.classList.add('locked');
    document.getElementById('global-lock-banner')!.classList.add('show');
    document.getElementById('deadline-warning-banner')!.style.display = 'none';
    // Update gate deadline line text once tournament has started
    const gateLine = document.getElementById('gate-deadline-line');
    if (gateLine) gateLine.textContent = '\uD83D\uDD12 Picks are closed \u2014 tournament is live!';
    renderSaveBar();
    renderPlaceholder();
    // First time we detect the deadline passing while the tab is open
    if (!deadlinePassedHandled) {
      deadlinePassedHandled = true;
      renderAll();
      loadPredictionsList();
      showToast('\uD83D\uDD12 Picks are now closed! You can now see everyone\u2019s brackets.', 'success');
    }
    return;
  }
  const diff = DEADLINE - Date.now();
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  el.textContent = h + 'h ' + String(m).padStart(2, '0') + 'm ' + String(s).padStart(2, '0') + 's';
  renderDeadlineWarning(diff);
}

function renderDeadlineWarning(diffMs: number): void {
  const banner = document.getElementById('deadline-warning-banner')!;
  const twoHours = 2 * 60 * 60 * 1000;
  const thirtyMin = 30 * 60 * 1000;
  if (!deadlineWarningDismissed && diffMs > 0 && diffMs < twoHours && state.bracketLoaded && !state.locked && !state.isViewing) {
    banner.style.display = 'flex';
    if (diffMs < thirtyMin) {
      const minLeft = Math.ceil(diffMs / 60000);
      const textEl = banner.querySelector('span');
      if (textEl) textEl.textContent = '\u26a0\uFE0F Only ' + minLeft + ' min left \u2014 your bracket isn\u2019t locked yet!';
      banner.classList.add('deadline-warning--urgent');
    } else {
      const textEl = banner.querySelector('span');
      if (textEl) textEl.textContent = '\u26a0\uFE0F Under 2 hours left \u2014 your bracket isn\u2019t locked yet!';
      banner.classList.remove('deadline-warning--urgent');
    }
  } else {
    banner.style.display = 'none';
  }
}

function dismissDeadlineWarning(): void {
  deadlineWarningDismissed = true;
  document.getElementById('deadline-warning-banner')!.style.display = 'none';
}

function scrollToSaveBar(): void {
  dismissDeadlineWarning();
  const bar = document.getElementById('save-bar-inner');
  if (bar) {
    bar.scrollIntoView({ behavior: 'smooth', block: 'center' });
    bar.classList.add('highlight-pulse');
    setTimeout(() => bar.classList.remove('highlight-pulse'), 1500);
  }
}

// ── Placeholder (pre-login) ───────────────────────────────────────────────────

function renderPlaceholder(): void {
  const pre = document.getElementById('placeholder-box-pre')!;
  const live = document.getElementById('placeholder-box-live')!;
  if (isPastDeadline()) {
    pre.style.display = 'none';
    live.style.display = 'block';
  } else {
    pre.style.display = 'block';
    live.style.display = 'none';
  }
}

// ── Predictions list ─────────────────────────────────────────────────────────

let bracketListCache: BracketListItem[] = [];

async function loadPredictionsList(): Promise<void> {
  try {
    const brackets = await apiBracketList();
    renderPredictionsList(brackets);
  } catch { /* non-fatal */ }
}

function renderPredictionsList(brackets: BracketListItem[]): void {
  bracketListCache = brackets;
  const el = document.getElementById('predictions-list')!;
  if (!brackets.length) {
    el.innerHTML = '<div style="color:var(--grey);font-size:0.8rem;">No predictions yet. Be first!</div>';
    return;
  }
  el.innerHTML = brackets.map((b, idx) => {
    const ago = timeAgo(b.updated_at);
    const avatar = (b.display_name || '?')[0].toUpperCase();
    const isLocked = !!b.locked;
    const canView = isPastDeadline() || b.email === state.email;
    const itemStyle = canView ? '' : ' style="cursor:default;opacity:0.85"';
    return `<div class="prediction-item" data-idx="${idx}"${itemStyle} onclick="window.__app.viewBracket(${idx},'${escJs(b.display_name)}')">
      <div class="prediction-avatar">${escHtml(avatar)}</div>
      <div class="prediction-info">
        <div class="prediction-name">${escHtml(b.display_name)}</div>
        <div class="prediction-time">${ago}${!canView ? ' \u00b7 \uD83D\uDD12 hidden' : ''}</div>
      </div>
      <div style="display:flex;align-items:center;gap:4px">
        ${isLocked ? '<span class="lock-badge locked-personal">\uD83D\uDD12 Locked</span>' : '<span class="lock-badge">Draft</span>'}
        <button class="admin-delete-btn" title="Delete entry" onclick="event.stopPropagation();window.__app.openAdminDelete(${idx})" aria-label="Delete">\uD83D\uDDD1\uFE0F</button>
      </div>
    </div>`;
  }).join('');
}

// ── Admin delete ──────────────────────────────────────────────────────────────

let adminDeleteTarget: { email: string; name: string } | null = null;

function openAdminDelete(idx: number): void {
  const entry = bracketListCache[idx];
  if (!entry) return;
  adminDeleteTarget = { email: entry.email, name: entry.display_name };
  document.getElementById('admin-delete-name')!.textContent = entry.display_name;
  (document.getElementById('admin-pass-input') as HTMLInputElement).value = '';
  document.getElementById('admin-pass-error')!.style.display = 'none';
  document.getElementById('admin-modal')!.classList.add('open');
  setTimeout(() => (document.getElementById('admin-pass-input') as HTMLInputElement).focus(), 50);
}

function closeAdminModal(): void {
  document.getElementById('admin-modal')!.classList.remove('open');
  adminDeleteTarget = null;
}

async function confirmAdminDelete(): Promise<void> {
  if (!adminDeleteTarget) return;
  const pass = (document.getElementById('admin-pass-input') as HTMLInputElement).value;
  const btn = document.getElementById('admin-confirm-btn') as HTMLButtonElement;
  btn.disabled = true;
  btn.textContent = 'Deleting...';
  try {
    const res = await fetch('/api/admin/brackets/' + encodeURIComponent(adminDeleteTarget.email), {
      method: 'DELETE',
      headers: { 'X-Admin-Password': pass },
    });
    if (res.status === 401) {
      document.getElementById('admin-pass-error')!.style.display = 'block';
      btn.disabled = false;
      btn.textContent = 'Delete';
      return;
    }
    if (!res.ok) throw new Error('Server error');
    // If we just deleted our own bracket, reset state
    if (adminDeleteTarget.email === state.email) {
      state.email = '';
      state.name = '';
      state.bracketLoaded = false;
      state.locked = false;
      state.knockout = {};
      state.predicted3rd = {};
      resetGroupsToDefault();
      document.getElementById('bracket-content')!.style.display = 'none';
      document.getElementById('pre-login-placeholder')!.style.display = 'flex';
      renderPlaceholder();
    }
    closeAdminModal();
    showToast('🗑️ Deleted ' + adminDeleteTarget.name, 'success');
    loadPredictionsList();
  } catch {
    showToast('Delete failed — check password', 'error');
    btn.disabled = false;
    btn.textContent = 'Delete';
  }
}

// ── Load / login ─────────────────────────────────────────────────────────────

async function handleLoad(): Promise<void> {
  const nameInput = (document.getElementById('input-name') as HTMLInputElement).value.trim();
  const email = (document.getElementById('input-email') as HTMLInputElement).value.trim().toLowerCase();
  const errEl = document.getElementById('load-error')!;
  errEl.style.display = 'none';
  // After the deadline the name field is hidden — only email is required
  if (!isPastDeadline() && !nameInput) { errEl.textContent = 'Please enter your name.'; errEl.style.display = 'block'; return; }
  if (!email || !email.includes('@')) { errEl.textContent = 'Please enter a valid email.'; errEl.style.display = 'block'; return; }
  const name = nameInput || 'viewer'; // placeholder until real name is loaded from bracket

  state.name = name;
  state.email = email;
  state.isViewing = false;
  state.viewingName = '';
  state.locked = false;
  state.bracketLoaded = false;
  state.knockout = {};
  state.predicted3rd = {};
  clearScheduleCache();
  resetGroupsToDefault();
  document.getElementById('viewing-banner')!.style.display = 'none';
  document.querySelectorAll('.prediction-item').forEach(el => el.classList.remove('active'));

  const btn = document.getElementById('btn-load') as HTMLButtonElement;
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Loading...';

  try {
    const data = await apiBracketGet(email);
    // Use the real display_name from the saved bracket (especially important post-deadline)
    if (data.bracket.display_name) state.name = String(data.bracket.display_name);
    let bd: Record<string, unknown> = {};
    try { bd = JSON.parse(data.bracket.bracket_data); } catch { /* corrupt data — start fresh */ }
    if (bd.groups) state.groups = bd.groups as Record<string, string[]>;
    if (bd.knockout) state.knockout = bd.knockout as Record<string, string>;
    if (bd.predicted3rd) state.predicted3rd = bd.predicted3rd as Record<string, string>;
    state.locked = !!data.bracket.locked;
    state.bracketLoaded = true;
    showToast(state.locked ? '\uD83D\uDD12 Your bracket is locked.' : '\u2705 Bracket loaded!', 'success');
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : '';
    if (msg.includes('404') || msg.includes('Not found')) {
      if (isPastDeadline()) {
        // After deadline: no new brackets allowed — just tell them
        btn.disabled = false;
        btn.textContent = 'Load My Bracket';
        errEl.textContent = 'No bracket found for that email. Picks closed \u2014 new entries are not accepted.';
        errEl.style.display = 'block';
        return;
      }
      state.bracketLoaded = true;
      showToast('New bracket started for ' + name + '! Fill in your picks below.', 'success');
    } else {
      // Non-404 error: do not show bracket UI to avoid overwriting a real bracket
      btn.disabled = false;
      btn.textContent = isPastDeadline() ? 'Load My Bracket' : 'Load / New Bracket';
      errEl.textContent = 'Could not load bracket: ' + msg;
      errEl.style.display = 'block';
      return;
    }
  }

  btn.disabled = false;
  btn.textContent = 'Load / New Bracket';
  showBracketContent();
  renderAll();
  loadPredictionsList();

  apiFetch<{ player_name: string | null }>('/api/golden-boot?email=' + encodeURIComponent(email))
    .then(d => {
      if (d.player_name) {
        setGbCurrentPick(d.player_name);
        const inp = document.getElementById('gb-input') as HTMLInputElement;
        if (inp) inp.value = d.player_name;
        updateGbDisplay();
      }
    }).catch(() => {});

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── View others ──────────────────────────────────────────────────────────────

// viewBracket accepts either:
//   - a numeric idx (from predictions list onclick, never exposes email in DOM)
//   - a raw email string (from ?view= URL param and leaderboard rows)
async function viewBracket(idxOrEmail: number | string, displayName: string): Promise<void> {
  const email = (typeof idxOrEmail === 'number'
    ? bracketListCache[idxOrEmail]?.email ?? ''
    : idxOrEmail
  ).toLowerCase();

  if (!email) { showToast('Could not find that bracket', 'error'); return; }

  // Only allow viewing your own bracket before the deadline
  if (!isPastDeadline() && email !== state.email) {
    showToast('\uD83D\uDD12 Brackets are hidden until picks close at 3 PM ET today.', 'error');
    return;
  }
  try {
    const data = await apiBracketGet(email);
    let bd: Record<string, unknown> = {};
    try { bd = JSON.parse(data.bracket.bracket_data); } catch { /* corrupt data — show defaults */ }
    state.isViewing = true;
    state.viewingName = displayName;
    state.groups = Object.keys(GROUPS_DATA).reduce<Record<string, string[]>>((acc, g) => {
      acc[g] = (bd.groups as Record<string, string[]>)?.[g] ?? GROUPS_DATA[g].map(t => t.name);
      return acc;
    }, {});
    state.knockout = (bd.knockout as Record<string, string>) ?? {};
    state.predicted3rd = (bd.predicted3rd as Record<string, string>) ?? {};
    state.locked = !!data.bracket.locked;

    document.getElementById('viewing-banner')!.style.display = 'flex';
    document.getElementById('viewing-text')!.textContent =
      'Viewing ' + displayName + '\u2019s bracket' + (state.locked ? ' \uD83D\uDD12' : '');
    const shareBtnEl = document.getElementById('btn-share-bracket');
    if (shareBtnEl) shareBtnEl.setAttribute('data-share-email', email);

    // Highlight active prediction item by idx (no email in DOM)
    document.querySelectorAll('.prediction-item').forEach(el => el.classList.remove('active'));
    if (typeof idxOrEmail === 'number') {
      document.querySelector<HTMLElement>(`.prediction-item[data-idx="${idxOrEmail}"]`)?.classList.add('active');
    } else {
      const idx = bracketListCache.findIndex(b => b.email.toLowerCase() === email);
      if (idx !== -1) document.querySelector<HTMLElement>(`.prediction-item[data-idx="${idx}"]`)?.classList.add('active');
    }

    showBracketContent();
    renderAll();
    switchTab('bracket');
  } catch (e: unknown) {
    showToast('Could not load bracket: ' + (e instanceof Error ? e.message : 'error'), 'error');
  }
}

function stopViewing(): void {
  state.isViewing = false;
  state.viewingName = '';
  state.locked = false;
  state.knockout = {};
  state.predicted3rd = {};
  resetGroupsToDefault();
  document.getElementById('viewing-banner')!.style.display = 'none';
  document.querySelectorAll('.prediction-item').forEach(el => el.classList.remove('active'));

  if (state.email && state.bracketLoaded) {
    apiBracketGet(state.email).then(data => {
      let bd: Record<string, unknown> = {};
      try { bd = JSON.parse(data.bracket.bracket_data); } catch { /* corrupt — keep defaults */ }
      if (bd.groups) state.groups = bd.groups as Record<string, string[]>;
      if (bd.knockout) state.knockout = bd.knockout as Record<string, string>;
      if (bd.predicted3rd) state.predicted3rd = bd.predicted3rd as Record<string, string>;
      state.locked = !!data.bracket.locked;
      renderAll();
    }).catch(() => {
      state.locked = false;
      renderAll();
    });
  } else {
    state.bracketLoaded = false;
    document.getElementById('bracket-content')!.style.display = 'none';
    document.getElementById('pre-login-placeholder')!.style.display = 'flex';
    renderAll();
  }
}

// ── Login card: hide new-entry fields once tournament starts ─────────────────

let loginCardUpdated = false;

function updateLoginCard(): void {
  if (loginCardUpdated) return;
  if (!isPastDeadline()) return; // nothing to change before deadline
  const card = document.getElementById('login-card');
  if (!card) return;

  loginCardUpdated = true;
  // Replace the card content with a locked-down viewer form
  card.innerHTML = `
    <div class="card-title">\uD83D\uDD12 Tournament Live</div>
    <p style="font-size:0.78rem;color:var(--grey);margin:0 0 12px;line-height:1.5;">
      Picks are closed. Enter your email to load your bracket and see your score.
    </p>
    <input type="email" id="input-email" class="input-field" placeholder="your@email.com"/>
    <input type="hidden" id="input-name" value="viewer"/>
    <button class="btn btn-gold" id="btn-load" style="margin-top:8px">Load My Bracket</button>
    <div id="load-error" style="color:var(--red);font-size:0.75rem;margin-top:8px;display:none;"></div>
  `;
  // Re-wire the load button (DOM was replaced)
  document.getElementById('btn-load')!.addEventListener('click', handleLoad);
}

// ── Render all ───────────────────────────────────────────────────────────────

function renderAll(): void {
  updateLoginCard();
  updateGroupStageVisibility();
  renderGroups();
  renderThirdPlaceSection();
  renderBracket();
  renderSaveBar();
  renderTicker();
  updateGbDisplay();
  if (!(window as any).__consensusLoaded) {
    loadConsensus().then(() => {
      (window as any).__consensusLoaded = true;
      renderBracket();
    });
  }
}

// ── Save / confirm ────────────────────────────────────────────────────────────

async function handleSave(): Promise<void> {
  if (!state.email || !state.bracketLoaded) return;
  const btn = document.getElementById('btn-save') as HTMLButtonElement | null;
  if (btn) { btn.disabled = true; btn.textContent = '\u23f3 Saving...'; }
  try {
    await apiBracketSave(
      state.email, state.name,
      JSON.stringify({ groups: state.groups, knockout: state.knockout, predicted3rd: state.predicted3rd }),
      false,
    );
    setLastSavedAt(Date.now());
    showToast('\u2705 Draft saved!', 'success');
    loadPredictionsList();
  } catch (e: unknown) {
    showToast('\u274c ' + (e instanceof Error ? e.message : 'error'), 'error');
  }
  renderSaveBar();
}

function openModal(): void {
  document.getElementById('confirm-modal')!.classList.add('open');
}

function closeModal(): void {
  document.getElementById('confirm-modal')!.classList.remove('open');
}

async function confirmLock(): Promise<void> {
  closeModal();
  try {
    await apiBracketSave(
      state.email, state.name,
      JSON.stringify({ groups: state.groups, knockout: state.knockout, predicted3rd: state.predicted3rd }),
      true,
    );
    state.locked = true;
    showToast('\uD83D\uDD12 Picks locked permanently!', 'success');
    renderAll();
    loadPredictionsList();
  } catch (e: unknown) {
    showToast('\u274c ' + (e instanceof Error ? e.message : 'error'), 'error');
  }
}

// ── Visibility helpers ────────────────────────────────────────────────────────

function showBracketContent(): void {
  document.getElementById('pre-login-placeholder')!.style.display = 'none';
  document.getElementById('bracket-content')!.style.display = 'block';
}

function loadOtherBracketFromEmail(email: string, name: string): void {
  switchTab('bracket');
  viewBracket(email, name);
}

function shareMyBracket(): void {
  const email = state.isViewing
    ? (document.getElementById('btn-share-bracket')?.getAttribute('data-share-email') ?? state.email)
    : state.email;
  if (!email) return;
  const url = location.origin + location.pathname + '?view=' + encodeURIComponent(email);
  if (navigator.clipboard) {
    navigator.clipboard.writeText(url).then(() => showToast('\uD83D\uDD17 Link copied! Share it with your group.', 'success'));
  } else {
    prompt('Share this bracket link:', url);
  }
}

function copyInviteMessage(): void {
  const msg = '\uD83C\uDFC6 FIFA 2026 Bracket Pool \u2014 join before 3 PM ET today!\n' +
    location.origin + location.pathname + '\nPassword: sofluffy';
  if (navigator.clipboard) {
    navigator.clipboard.writeText(msg)
      .then(() => showToast('\uD83D\uDCCB Invite message copied! Paste it into WhatsApp.', 'success'))
      .catch(() => prompt('Copy this invite message:', msg));
  } else {
    prompt('Copy this invite message:', msg);
  }
}

function scrollToSidebar(): void {
  const sidebar = document.querySelector('.sidebar');
  if (sidebar) sidebar.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function switchTabPublic(tab: string): void {
  switchTab(tab);
}

// ── Tab switching ─────────────────────────────────────────────────────────────

function switchTab(tab: string): void {
  const isBracket = tab === 'bracket';
  const isSchedule = tab === 'schedule';
  const isLeaderboard = tab === 'leaderboard';
  const isLiveBracket = tab === 'live-bracket';
  const loaded = state.bracketLoaded || state.isViewing;

  document.getElementById('bracket-content')!.style.display = (isBracket && loaded) ? 'block' : 'none';
  document.getElementById('pre-login-placeholder')!.style.display = (isBracket && !loaded) ? 'flex' : 'none';
  document.getElementById('schedule-panel')!.style.display = isSchedule ? 'block' : 'none';
  document.getElementById('leaderboard-panel')!.style.display = isLeaderboard ? 'block' : 'none';
  document.getElementById('live-bracket-panel')!.style.display = isLiveBracket ? 'block' : 'none';

  document.getElementById('tab-bracket')!.classList.toggle('tab-active', isBracket);
  document.getElementById('tab-schedule')!.classList.toggle('tab-active', isSchedule);
  document.getElementById('tab-leaderboard')!.classList.toggle('tab-active', isLeaderboard);
  document.getElementById('tab-live-bracket')!.classList.toggle('tab-active', isLiveBracket);

  if (isSchedule) {
    renderSchedule();
    startSchedulePolling();
    setTimeout(() => {
      const el = document.getElementById('today-anchor');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  } else {
    stopSchedulePolling();
  }
  if (isLeaderboard) {
    startLeaderboard();
  } else {
    stopLeaderboard();
  }
  if (isLiveBracket) {
    startLiveBracketPolling();
  } else {
    stopLiveBracketPolling();
  }
}

// ── Rules toggle ─────────────────────────────────────────────────────────────

function toggleRules(): void {
  const body = document.getElementById('rules-body');
  const btn = document.getElementById('rules-toggle-btn');
  if (!body || !btn) return;
  const open = body.style.display !== 'none';
  body.style.display = open ? 'none' : 'block';
  btn.textContent = open ? '\u2139\uFE0F How does this work?' : '\u2716 Close explanation';
}

// ── Password gate ─────────────────────────────────────────────────────────────

const PASS_KEY = 'wc26_unlocked';

function checkPassword(): void {
  const gate = document.getElementById('password-gate')!;
  const app  = document.getElementById('app-root')!;
  // Once the tournament has started the gate is removed — anyone can view results
  if (isPastDeadline() || sessionStorage.getItem(PASS_KEY) === '1') {
    gate.style.display = 'none';
    app.style.display  = 'block';
    loadPredictionsList();
    return;
  }
  gate.style.display = 'flex';
  app.style.display  = 'none';
  (document.getElementById('pass-input') as HTMLInputElement).focus();
}

function submitPassword(): void {
  const val = ((document.getElementById('pass-input') as HTMLInputElement).value ?? '').trim().toLowerCase();
  if (val === 'sofluffy') {
    sessionStorage.setItem(PASS_KEY, '1');
    document.getElementById('password-gate')!.style.display = 'none';
    document.getElementById('app-root')!.style.display = 'block';
    loadPredictionsList();
  } else {
    const err = document.getElementById('pass-error')!;
    err.style.display = 'block';
    (document.getElementById('pass-input') as HTMLInputElement).value = '';
    (document.getElementById('pass-input') as HTMLInputElement).focus();
    const card = document.getElementById('pass-card')!;
    card.classList.remove('shake');
    void card.offsetWidth;
    card.classList.add('shake');
  }
}

// ── Expose to global (used in inline onclick attributes in static HTML) ────────

declare global {
  interface Window {
    __app: Record<string, unknown>;
  }
}

window.__app = {
  renderAll,

  // bracket actions
  pickWinner: (round: string, matchIdx: number, team: string) => {
    pickWinner(round, matchIdx, team);
    renderAll();
  },
  pick3rd: (matchIdx: number, slotIdx: number, team: string) => {
    pick3rd(matchIdx, slotIdx, team);
    renderAll();
  },
  autoPickAll: () => {
    autoPickAll();
    renderAll();
    showToast('\uD83C\uDFB2 All picks filled randomly \u2014 review and save!', 'success');
  },
  moveTeam,
  handleSave,
  openModal,

  // views
  viewBracket,
  stopViewing,
  loadOtherBracketFromEmail,
  openAdminDelete,
  switchTabPublic,
  scrollToSidebar,
  scrollToSaveBar,
  dismissDeadlineWarning,
  shareMyBracket,
  copyInviteMessage,

  // schedule
  makeMatchPick,
  submitScorePick,
  toggleMatchDetail,

  // leaderboard
  fetchLeaderboard,
  openH2H,
  closeH2H,
  copyStandings,
  dismissUpset,

  // golden boot
  filterGbPlayers,
  selectGbPlayer,
};

// ── Wire up static HTML event handlers ────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  // Tab buttons
  document.querySelectorAll<HTMLButtonElement>('.tab-btn[data-tab]').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab!));
  });

  // Load bracket button
  document.getElementById('btn-load')!.addEventListener('click', handleLoad);

  // Stop viewing button
  document.getElementById('btn-stop-viewing')!.addEventListener('click', stopViewing);

  // Share bracket button (in viewing banner)
  document.getElementById('btn-share-bracket')!.addEventListener('click', shareMyBracket);

  // Rules toggle
  document.getElementById('rules-toggle-btn')!.addEventListener('click', toggleRules);

  // Password gate
  (document.getElementById('pass-input') as HTMLInputElement).addEventListener('keydown', e => {
    if (e.key === 'Enter') submitPassword();
    document.getElementById('pass-error')!.style.display = 'none';
  });
  document.getElementById('pass-submit')!.addEventListener('click', submitPassword);

  // Confirm modal
  document.getElementById('modal-cancel-btn')!.addEventListener('click', closeModal);
  document.getElementById('modal-confirm-btn')!.addEventListener('click', confirmLock);

  // Admin delete modal
  document.getElementById('admin-cancel-btn')!.addEventListener('click', closeAdminModal);
  document.getElementById('admin-confirm-btn')!.addEventListener('click', confirmAdminDelete);
  document.getElementById('admin-modal')!.addEventListener('click', e => {
    if (e.target === e.currentTarget) closeAdminModal();
  });
  (document.getElementById('admin-pass-input') as HTMLInputElement).addEventListener('keydown', e => {
    if (e.key === 'Enter') confirmAdminDelete();
    if (e.key === 'Escape') closeAdminModal();
  });

  // H2H modal close
  document.getElementById('h2h-modal')!.addEventListener('click', e => {
    if (e.target === e.currentTarget) closeH2H();
  });
  document.getElementById('h2h-close-btn')!.addEventListener('click', closeH2H);

  // Golden boot input
  document.getElementById('gb-input')!.addEventListener('input', (e) => {
    filterGbPlayers((e.target as HTMLInputElement).value);
  });

  // Countdown
  setInterval(updateCountdown, 1000);
  updateCountdown();

  // Init: load live results for ticker, then check password
  loadLiveResults().then(renderTicker);
  checkPassword();
  updateLoginCard();
  renderPlaceholder();

  // Handle ?view=email shareable link
  const viewParam = new URLSearchParams(location.search).get('view');
  if (viewParam) {
    apiFetch<{ bracket: { display_name: string } }>('/api/brackets/' + encodeURIComponent(viewParam))
      .then(data => {
        viewBracket(viewParam, data.bracket.display_name);
        switchTab('bracket');
      })
      .catch(() => { /* invalid link, ignore */ });
  }
});
