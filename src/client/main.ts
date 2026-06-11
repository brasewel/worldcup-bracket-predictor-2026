import { state, isPastDeadline, isReadOnly, resetGroupsToDefault, DEADLINE } from './state';
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
import { renderSchedule, makeMatchPick, submitScorePick, toggleMatchDetail } from './schedule';
import {
  fetchLeaderboard, startLeaderboard, stopLeaderboard,
  renderLeaderboard, openH2H, closeH2H, copyStandings, lbData,
} from './leaderboard';
import { loadLiveResults } from './liveResults';
import {
  gbCurrentPick, filterGbPlayers, selectGbPlayer, updateGbDisplay,
} from './goldenBoot';

// ── Countdown ────────────────────────────────────────────────────────────────

function updateCountdown(): void {
  const el = document.getElementById('countdown-text')!;
  const header = document.getElementById('countdown-header')!;
  if (isPastDeadline()) {
    el.textContent = 'PICKS LOCKED';
    header.classList.add('locked');
    document.getElementById('global-lock-banner')!.classList.add('show');
    renderSaveBar();
    return;
  }
  const diff = DEADLINE - Date.now();
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  el.textContent = h + 'h ' + String(m).padStart(2, '0') + 'm ' + String(s).padStart(2, '0') + 's';
}

// ── Predictions list ─────────────────────────────────────────────────────────

async function loadPredictionsList(): Promise<void> {
  try {
    const brackets = await apiBracketList();
    renderPredictionsList(brackets);
  } catch { /* non-fatal */ }
}

function renderPredictionsList(brackets: BracketListItem[]): void {
  const el = document.getElementById('predictions-list')!;
  if (!brackets.length) {
    el.innerHTML = '<div style="color:var(--grey);font-size:0.8rem;">No predictions yet. Be first!</div>';
    return;
  }
  el.innerHTML = brackets.map(b => {
    const ago = timeAgo(b.updated_at);
    const avatar = (b.display_name || '?')[0].toUpperCase();
    const isLocked = !!b.locked;
    return `<div class="prediction-item" data-email="${escHtml(b.email)}" onclick="window.__app.viewBracket('${escJs(b.email)}','${escJs(b.display_name)}')">
      <div class="prediction-avatar">${escHtml(avatar)}</div>
      <div class="prediction-info">
        <div class="prediction-name">${escHtml(b.display_name)}</div>
        <div class="prediction-time">${ago}</div>
      </div>
      ${isLocked ? '<span class="lock-badge locked-personal">\uD83D\uDD12 Locked</span>' : '<span class="lock-badge">Draft</span>'}
    </div>`;
  }).join('');
}

// ── Load / login ─────────────────────────────────────────────────────────────

async function handleLoad(): Promise<void> {
  const name = (document.getElementById('input-name') as HTMLInputElement).value.trim();
  const email = (document.getElementById('input-email') as HTMLInputElement).value.trim().toLowerCase();
  const errEl = document.getElementById('load-error')!;
  errEl.style.display = 'none';
  if (!name) { errEl.textContent = 'Please enter your name.'; errEl.style.display = 'block'; return; }
  if (!email || !email.includes('@')) { errEl.textContent = 'Please enter a valid email.'; errEl.style.display = 'block'; return; }

  state.name = name;
  state.email = email;
  state.isViewing = false;
  state.viewingName = '';
  state.locked = false;
  state.bracketLoaded = false;
  state.knockout = {};
  state.predicted3rd = {};
  resetGroupsToDefault();
  document.getElementById('viewing-banner')!.style.display = 'none';
  document.querySelectorAll('.prediction-item').forEach(el => el.classList.remove('active'));

  const btn = document.getElementById('btn-load') as HTMLButtonElement;
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Loading...';

  try {
    const data = await apiBracketGet(email);
    const bd = JSON.parse(data.bracket.bracket_data);
    if (bd.groups) state.groups = bd.groups;
    if (bd.knockout) state.knockout = bd.knockout;
    if (bd.predicted3rd) state.predicted3rd = bd.predicted3rd;
    state.locked = !!data.bracket.locked;
    state.bracketLoaded = true;
    showToast(state.locked ? '\uD83D\uDD12 Your bracket is locked.' : '\u2705 Bracket loaded!', 'success');
  } catch (e: unknown) {
    state.bracketLoaded = true;
    const msg = e instanceof Error ? e.message : '';
    if (msg.includes('404') || msg.includes('Not found')) {
      showToast('New bracket started for ' + name + '! Fill in your picks below.', 'success');
    } else {
      showToast('Could not load bracket: ' + msg, 'error');
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
        (window as any).__gb_pick = d.player_name;
        const inp = document.getElementById('gb-input') as HTMLInputElement;
        if (inp) inp.value = d.player_name;
        updateGbDisplay();
      }
    }).catch(() => {});

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── View others ──────────────────────────────────────────────────────────────

async function viewBracket(email: string, displayName: string): Promise<void> {
  try {
    const data = await apiBracketGet(email);
    const bd = JSON.parse(data.bracket.bracket_data);
    state.isViewing = true;
    state.viewingName = displayName;
    state.groups = Object.keys(GROUPS_DATA).reduce<Record<string, string[]>>((acc, g) => {
      acc[g] = bd.groups?.[g] ?? GROUPS_DATA[g].map(t => t.name);
      return acc;
    }, {});
    state.knockout = bd.knockout ?? {};
    state.predicted3rd = bd.predicted3rd ?? {};
    state.locked = !!data.bracket.locked;

    document.getElementById('viewing-banner')!.style.display = 'flex';
    document.getElementById('viewing-text')!.textContent =
      'Viewing ' + displayName + '\u2019s bracket' + (state.locked ? ' \uD83D\uDD12' : '');

    document.querySelectorAll('.prediction-item').forEach(el => el.classList.remove('active'));
    const match = Array.from(document.querySelectorAll<HTMLElement>('.prediction-item')).find(el => el.dataset.email === email);
    if (match) match.classList.add('active');

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
      const bd = JSON.parse(data.bracket.bracket_data);
      if (bd.groups) state.groups = bd.groups;
      if (bd.knockout) state.knockout = bd.knockout;
      if (bd.predicted3rd) state.predicted3rd = bd.predicted3rd;
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

// ── Render all ───────────────────────────────────────────────────────────────

function renderAll(): void {
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

// ── Tab switching ─────────────────────────────────────────────────────────────

function switchTab(tab: string): void {
  const isBracket = tab === 'bracket';
  const isSchedule = tab === 'schedule';
  const isLeaderboard = tab === 'leaderboard';
  const loaded = state.bracketLoaded;

  document.getElementById('bracket-content')!.style.display = (isBracket && loaded) ? 'block' : 'none';
  document.getElementById('pre-login-placeholder')!.style.display = (isBracket && !loaded) ? 'flex' : 'none';
  document.getElementById('schedule-panel')!.style.display = isSchedule ? 'block' : 'none';
  document.getElementById('leaderboard-panel')!.style.display = isLeaderboard ? 'block' : 'none';

  document.getElementById('tab-bracket')!.classList.toggle('tab-active', isBracket);
  document.getElementById('tab-schedule')!.classList.toggle('tab-active', isSchedule);
  document.getElementById('tab-leaderboard')!.classList.toggle('tab-active', isLeaderboard);

  if (isSchedule) {
    renderSchedule();
    setTimeout(() => {
      const el = document.getElementById('today-anchor');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  }
  if (isLeaderboard) {
    startLeaderboard();
  } else {
    stopLeaderboard();
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
  if (sessionStorage.getItem(PASS_KEY) === '1') {
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

  // schedule
  makeMatchPick,
  submitScorePick,
  toggleMatchDetail,

  // leaderboard
  fetchLeaderboard,
  openH2H,
  closeH2H,
  copyStandings,

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
});
