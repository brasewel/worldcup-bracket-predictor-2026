import { state, isReadOnly } from './state';
import { GROUPS_DATA, R32_SEEDS, ROUND_COUNTS, getFlagForTeam } from './data';
import { escHtml, escJs } from './utils';
import { getConsensusBadge } from './consensus';

export function getGroupTeam(group: string, pos: number): string | null {
  return state.groups[group]?.[pos] ?? null;
}

export function getKnockoutTeam(round: string, matchIdx: number, slot: number): string | null {
  if (round === 'r32') {
    const seed = R32_SEEDS[matchIdx]?.[slot];
    if (!seed) return null;
    if ('third' in seed) {
      return state.predicted3rd[matchIdx + '_' + slot] ?? null;
    }
    return getGroupTeam(seed.g, seed.p);
  }
  const prevRound: Record<string, string> = { r16: 'r32', qf: 'r16', sf: 'qf', final: 'sf' };
  const prev = prevRound[round];
  const prevMatchIdx = matchIdx * 2 + slot;
  return state.knockout[prev + '_' + prevMatchIdx] ?? null;
}

function getThirdSeed(matchIdx: number, slot: number): boolean {
  const seed = R32_SEEDS[matchIdx]?.[slot];
  return !!(seed && 'third' in seed);
}

export function isBracketComplete(): boolean {
  return countMissingPicks() === 0;
}

export function countMissingPicks(): number {
  let missing = 0;
  for (let i = 0; i < 16; i++) {
    for (let s = 0; s < 2; s++) {
      const seed = R32_SEEDS[i]?.[s];
      if (seed && 'third' in seed && !state.predicted3rd[i + '_' + s]) missing++;
    }
  }
  for (const [round, count] of Object.entries(ROUND_COUNTS)) {
    for (let i = 0; i < count; i++) {
      const t1 = getKnockoutTeam(round, i, 0);
      const t2 = getKnockoutTeam(round, i, 1);
      if (t1 && t2 && !state.knockout[round + '_' + i]) missing++;
    }
  }
  return missing;
}

export function pickWinner(round: string, matchIdx: number, team: string): void {
  if (isReadOnly()) return;
  state.knockout[round + '_' + matchIdx] = team;
  clearDownstream(round, matchIdx);
}

export function pick3rd(matchIdx: number, slotIdx: number, team: string): void {
  if (isReadOnly()) return;
  const key = matchIdx + '_' + slotIdx;
  if (team) {
    state.predicted3rd[key] = team;
  } else {
    delete state.predicted3rd[key];
  }
  const prevKnockoutKey = 'r32_' + matchIdx;
  if (state.knockout[prevKnockoutKey]) {
    delete state.knockout[prevKnockoutKey];
    clearDownstream('r32', matchIdx);
  }
}

export function autoPickAll(): void {
  if (isReadOnly()) return;
  // Fill unpicked 3rd-place slots
  for (let i = 0; i < 16; i++) {
    for (let s = 0; s < 2; s++) {
      const seed = R32_SEEDS[i]?.[s];
      if (!seed || !('third' in seed)) continue;
      const key = i + '_' + s;
      if (state.predicted3rd[key]) continue;
      const candidates = seed.third.map(g => (state.groups[g] ?? [])[2]).filter(Boolean) as string[];
      if (candidates.length) state.predicted3rd[key] = candidates[Math.floor(Math.random() * candidates.length)];
    }
  }
  // Fill match winners round by round
  for (const round of ['r32', 'r16', 'qf', 'sf', 'final']) {
    const count = ROUND_COUNTS[round];
    for (let i = 0; i < count; i++) {
      if (state.knockout[round + '_' + i]) continue;
      const t1 = getKnockoutTeam(round, i, 0);
      const t2 = getKnockoutTeam(round, i, 1);
      if (t1 && t2) state.knockout[round + '_' + i] = Math.random() < 0.5 ? t1 : t2;
    }
  }
}

function clearDownstream(round: string, matchIdx: number): void {
  const next: Record<string, string> = { r32: 'r16', r16: 'qf', qf: 'sf', sf: 'final' };
  const nextRound = next[round];
  if (!nextRound) return;
  const nextMatch = Math.floor(matchIdx / 2);
  const nextWinner = state.knockout[nextRound + '_' + nextMatch];
  const t0 = getKnockoutTeam(round, matchIdx, 0);
  const t1 = getKnockoutTeam(round, matchIdx, 1);
  if (nextWinner && (nextWinner === t0 || nextWinner === t1)) {
    delete state.knockout[nextRound + '_' + nextMatch];
    clearDownstream(nextRound, nextMatch);
  }
}

export function renderBracket(): void {
  const bracket = document.getElementById('bracket')!;
  const rounds = [
    { key: 'r32', label: 'Round of 32', count: 16 },
    { key: 'r16', label: 'Round of 16', count: 8 },
    { key: 'qf',  label: 'Quarter-Finals', count: 4 },
    { key: 'sf',  label: 'Semi-Finals', count: 2 },
    { key: 'final', label: 'Final', count: 1 },
  ];
  const ro = isReadOnly();

  bracket.innerHTML = rounds.map(({ key, label, count }) => {
    const matches: string[] = [];
    for (let i = 0; i < count; i++) {
      const t1 = getKnockoutTeam(key, i, 0);
      const t2 = getKnockoutTeam(key, i, 1);
      const winner = state.knockout[key + '_' + i] ?? null;

      const teamHtml = (team: string | null, slotIdx: number): string => {
        if (key === 'r32' && getThirdSeed(i, slotIdx)) {
          if (!team) return `<div class="match-team empty" title="Pick this team in section 1.5 above">3rd Place \u2191</div>`;
          const isWinner = winner === team;
          const f = getFlagForTeam(team);
          const clickable = !ro && t1 && t2;
          return `<div class="match-team${isWinner ? ' winner' : ''}${!clickable ? ' readonly' : ''}"${
            clickable ? ` onclick="window.__app.pickWinner('${key}',${i},'${escJs(team)}')"` : ''
          }>${f} ${escHtml(team)}</div>`;
        }
        if (!team) return `<div class="match-team empty">TBD</div>`;
        const isWinner = winner === team;
        const f = getFlagForTeam(team);
        const clickable = !ro && t1 && t2;
        return `<div class="match-team${isWinner ? ' winner' : ''}${!clickable ? ' readonly' : ''}"${
          clickable ? ` onclick="window.__app.pickWinner('${key}',${i},'${escJs(team)}')"` : ''
        }>${f} ${escHtml(team)}</div>`;
      };

      const consensusBadge = state.isViewing ? '' : getConsensusBadge(key, i);
      matches.push(`<div class="bracket-match">
        ${teamHtml(t1, 0)}
        <div class="match-separator"></div>
        ${teamHtml(t2, 1)}
        ${consensusBadge}
      </div>`);
    }

    return `<div class="bracket-round">
      <div class="round-label">${label}</div>
      <div class="bracket-matches">${matches.join('')}</div>
    </div>`;
  }).join('');

  // Champion slot
  const champion = state.knockout['final_0'] ?? null;
  bracket.innerHTML += `<div class="bracket-round" style="min-width:160px">
    <div class="round-label">Champion</div>
    <div class="bracket-matches">
      <div class="champion-slot">
        <span class="champion-trophy">\uD83C\uDFC6</span>
        <div class="champion-name">${champion ? escHtml(getFlagForTeam(champion) + ' ' + champion) : '?'}</div>
        <div class="champion-label">World Cup 2026 Champions</div>
      </div>
    </div>
  </div>`;
}

export function renderThirdPlaceSection(): void {
  const grid = document.getElementById('third-grid');
  if (!grid) return;
  const ro = isReadOnly();

  const slots: Array<{ matchIdx: number; slotIdx: number; groups: string[]; opponentLabel: string }> = [];
  for (let i = 0; i < R32_SEEDS.length; i++) {
    for (let s = 0; s < 2; s++) {
      const seed = R32_SEEDS[i][s];
      if (!seed || !('third' in seed)) continue;
      const other = R32_SEEDS[i][1 - s];
      const opponentLabel = 'third' in other
        ? 'Best 3rd Place'
        : ('Winner Group ' + other.g + (other.p === 1 ? ' Runner-up' : ''));
      slots.push({ matchIdx: i, slotIdx: s, groups: seed.third, opponentLabel });
    }
  }

  const usedTeams = new Set(Object.values(state.predicted3rd).filter(Boolean));

  grid.innerHTML = slots.map(({ matchIdx, slotIdx, groups, opponentLabel }) => {
    const key = matchIdx + '_' + slotIdx;
    const picked = state.predicted3rd[key] ?? '';
    const opponentHtml = `<span class="third-slot-opponent">vs <span class="third-slot-vs"></span>${escHtml(opponentLabel)}</span>`;

    let pickHtml: string;
    if (ro) {
      pickHtml = picked
        ? `<div class="third-slot-picked">${getFlagForTeam(picked)} ${escHtml(picked)}</div>`
        : `<div style="color:var(--grey);font-size:0.78rem;font-style:italic;">Not picked</div>`;
    } else {
      const options = groups.map(g => {
        const team3 = (state.groups[g] ?? [])[2];
        if (!team3) return '';
        const usedElsewhere = usedTeams.has(team3) && team3 !== picked;
        const sel = picked === team3 ? ' selected' : '';
        const dis = usedElsewhere ? ' disabled' : '';
        const label = usedElsewhere
          ? `${getFlagForTeam(team3)} ${escHtml(team3)} (already picked)`
          : `${getFlagForTeam(team3)} ${escHtml(team3)} (3rd, Group ${g})`;
        return `<option value="${escHtml(team3)}"${sel}${dis}>${label}</option>`;
      }).filter(Boolean).join('');
      pickHtml = `<select class="third-slot-pick" onchange="window.__app.pick3rd(${matchIdx},${slotIdx},this.value)">
        <option value="">\u2014 Pick a team \u2014</option>
        ${options}
      </select>`;
    }

    return `<div class="third-slot${picked ? ' third-slot--done' : ''}">
      <div class="third-slot-label">Match ${matchIdx + 73} \u00b7 Groups ${groups.join('/')}</div>
      ${opponentHtml}
      ${pickHtml}
    </div>`;
  }).join('');
}

export function renderSaveBar(): void {
  const bar = document.getElementById('save-bar-inner')!;
  const hasUser = !!state.email && state.bracketLoaded;

  if (state.isViewing) {
    bar.innerHTML = '<div class="locked-banner">\uD83D\uDC41\uFE0F Viewing another person\u2019s bracket</div>';
    return;
  }
  if (state.locked) {
    bar.innerHTML = '<div class="locked-banner">\uD83D\uDD12 Your picks are permanently locked</div>';
    return;
  }
  if (Date.now() >= (window as any).__DEADLINE_MS__) {
    bar.innerHTML = '<div class="locked-banner">\uD83D\uDD12 Picks are locked \u2014 Tournament has started!</div>';
    return;
  }
  const allDone = hasUser && isBracketComplete();
  const missingCount = hasUser ? countMissingPicks() : 0;
  const confirmTitle = allDone
    ? ''
    : missingCount > 0
      ? `You still have ${missingCount} pick${missingCount > 1 ? 's' : ''} remaining`
      : 'Complete your bracket first';

  bar.innerHTML = `
    <button class="auto-btn" id="btn-auto" ${hasUser ? '' : 'disabled'} title="Randomly fill all remaining picks">\uD83C\uDFB2 Auto-Pick</button>
    <button class="save-main-btn" id="btn-save" ${hasUser ? '' : 'disabled'}>\uD83D\uDCBE Save Draft</button>
    <button class="confirm-btn" id="btn-confirm" ${allDone ? '' : 'disabled'} title="${escHtml(confirmTitle)}">${allDone ? '\u2705' : '\uD83D\uDD12'} Confirm &amp; Lock</button>
  `;

  document.getElementById('btn-auto')?.addEventListener('click', () => {
    (window as any).__app.autoPickAll();
  });
  document.getElementById('btn-save')?.addEventListener('click', () => {
    (window as any).__app.handleSave();
  });
  document.getElementById('btn-confirm')?.addEventListener('click', () => {
    if (allDone) (window as any).__app.openModal();
  });
}

export function updateGroupStageVisibility(): void {
  const groupSection = document.getElementById('group-stage-section')!;
  const thirdSection = document.getElementById('third-place-section');
  const knockoutNum = document.getElementById('knockout-num')!;
  const knockoutSubtitle = document.getElementById('knockout-subtitle')!;

  if (state.isViewing) {
    groupSection.style.display = 'none';
    if (thirdSection) thirdSection.style.display = 'none';
    knockoutNum.textContent = '';
    knockoutNum.style.display = 'none';
    knockoutSubtitle.textContent = 'Read-only view of ' + state.viewingName + '\u2019s picks.';
  } else {
    groupSection.style.display = 'block';
    if (thirdSection) thirdSection.style.display = 'block';
    knockoutNum.style.display = 'flex';
    knockoutNum.textContent = '2';
    if (!isReadOnly() && state.bracketLoaded) {
      const missing = countMissingPicks();
      const total = 39;
      const done = total - missing;
      knockoutSubtitle.innerHTML = missing === 0
        ? '\u2705 All ' + total + ' picks made \u2014 ready to confirm!'
        : `Click a team in each match to advance them. <span style="color:var(--gold);font-weight:700;">${done}/${total} picks made</span>${missing > 0 ? ` \u2014 <span style="color:#f87171;">${missing} remaining</span>` : ''}`;
    } else {
      knockoutSubtitle.textContent = 'Click a team in each match to advance them to the next round.';
    }
  }
}
