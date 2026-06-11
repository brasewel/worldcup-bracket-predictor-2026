import { state, isReadOnly } from './state';
import { GROUPS_DATA, getFlagForTeam } from './data';
import { escHtml, escJs } from './utils';

let dragSrc: HTMLElement | null = null;

export function renderGroups(): void {
  const grid = document.getElementById('groups-grid')!;
  const ro = isReadOnly();

  grid.innerHTML = Object.entries(GROUPS_DATA).map(([group]) => {
    const order = state.groups[group] ?? GROUPS_DATA[group].map(t => t.name);
    return `<div class="group-card" data-group="${group}">
      <div class="group-card-header">Group ${group}</div>
      <div class="group-teams" data-group="${group}">
        ${order.map((name, i) => `
          <div class="team-row${ro ? ' readonly' : ''}" ${!ro ? 'draggable="true"' : ''} data-group="${group}" data-team="${escHtml(name)}">
            <div class="rank-badge rank-${i + 1}">${i + 1}</div>
            <div class="team-flag">${getFlagForTeam(name)}</div>
            <div class="team-name">${escHtml(name)}</div>
            ${ro ? '' : `<div class="move-btns">
              ${i > 0
                ? `<button class="move-btn" onclick="window.__app.moveTeam(event,'${escJs(group)}','${escJs(name)}',-1)" aria-label="Move up">\u25b2</button>`
                : '<span class="move-btn-placeholder"></span>'}
              ${i < order.length - 1
                ? `<button class="move-btn" onclick="window.__app.moveTeam(event,'${escJs(group)}','${escJs(name)}',1)" aria-label="Move down">\u25bc</button>`
                : '<span class="move-btn-placeholder"></span>'}
            </div>`}
          </div>
        `).join('')}
      </div>
    </div>`;
  }).join('');

  if (!ro) setupMouseDrag();
}

export function moveTeam(e: Event, group: string, name: string, dir: number): void {
  e.stopPropagation();
  const order = state.groups[group];
  const idx = order.indexOf(name);
  const newIdx = idx + dir;
  if (newIdx < 0 || newIdx >= order.length) return;
  order.splice(idx, 1);
  order.splice(newIdx, 0, name);
  state.groups[group] = order;
  state.knockout = {};
  state.predicted3rd = {};
  (window as any).__app.renderAll();
}

function setupMouseDrag(): void {
  document.querySelectorAll<HTMLElement>('.team-row[draggable]').forEach(row => {
    row.addEventListener('dragstart', e => {
      dragSrc = row;
      row.classList.add('dragging');
      e.dataTransfer!.effectAllowed = 'move';
    });
    row.addEventListener('dragend', () => {
      row.classList.remove('dragging');
      document.querySelectorAll('.team-row').forEach(r => r.classList.remove('drag-over'));
      dragSrc = null;
    });
    row.addEventListener('dragover', e => {
      e.preventDefault();
      if (dragSrc && dragSrc !== row && dragSrc.dataset.group === row.dataset.group) {
        document.querySelectorAll('.team-row').forEach(r => r.classList.remove('drag-over'));
        row.classList.add('drag-over');
      }
    });
    row.addEventListener('drop', e => {
      e.preventDefault();
      if (!dragSrc || dragSrc === row || dragSrc.dataset.group !== row.dataset.group) return;
      const group = row.dataset.group!;
      const order = state.groups[group];
      const fromIdx = order.indexOf(dragSrc.dataset.team!);
      const toIdx = order.indexOf(row.dataset.team!);
      if (fromIdx === -1 || toIdx === -1 || fromIdx === toIdx) return;
      order.splice(fromIdx, 1);
      order.splice(toIdx, 0, dragSrc.dataset.team!);
      state.groups[group] = order;
      state.knockout = {};
      state.predicted3rd = {};
      (window as any).__app.renderAll();
    });
  });
}
