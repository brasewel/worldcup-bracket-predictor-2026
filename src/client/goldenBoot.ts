import { state, isReadOnly } from './state';
import { apiFetch } from './api';
import { escHtml, escJs, showToast } from './utils';

const GB_PLAYERS = [
  'Kylian Mbapp\u00e9','Lionel Messi','Erling Haaland','Vinicius Jr.','Neymar Jr.',
  'Harry Kane','Lamine Yamal','Bukayo Saka','Phil Foden','Jude Bellingham',
  'Robert Lewandowski','Mohamed Salah','Sadio Man\u00e9','Romelu Lukaku','Leroy San\u00e9',
  'Karim Benzema','Antoine Griezmann','Olivier Giroud','Raheem Sterling','Marcus Rashford',
  'Richarlison','Raphinha','Rodrygo','Federico Valverde','Lautaro Mart\u00ednez',
  'Paulo Dybala','Victor Osimhen','Riyad Mahrez','Hakim Ziyech','Achraf Hakimi',
  'Son Heung-min','Hwang Hee-chan','Takumi Minamino','Daichi Kamada','Ritsu Doan',
  'Gavi','Pedri','Dani Olmo','\u00c1lvaro Morata','Serge Gnabry',
  'Thomas M\u00fcller','Kai Havertz','Jamal Musiala','Ricardo Horta','Cristiano Ronaldo',
  'Rafael Le\u00e3o','Diogo Jota','Bruno Fernandes','Memphis Depay','Cody Gakpo',
  'Xavi Simons','Denzel Dumfries','Wout Weghorst','Darwin N\u00fa\u00f1ez','Luis Su\u00e1rez',
  'Jonathan David','Alphonso Davies','Jonathan Osorio','Cyle Larin','Junior Hoilett',
  'Christian Pulisic','Timothy Weah','Gio Reyna','Folarin Balogun','Ricardo Pepi',
];

export let gbCurrentPick: string | null = null;

export function filterGbPlayers(q: string): void {
  const box = document.getElementById('gb-suggestions')!;
  if (!q.trim()) { box.style.display = 'none'; return; }
  const results = GB_PLAYERS.filter(p => p.toLowerCase().includes(q.toLowerCase())).slice(0, 8);
  if (!results.length) { box.style.display = 'none'; return; }
  box.innerHTML = results.map(p =>
    `<div class="gb-option" onclick="window.__app.selectGbPlayer('${escJs(p)}')">${escHtml(p)}</div>`
  ).join('');
  box.style.display = 'block';
}

export async function selectGbPlayer(name: string): Promise<void> {
  (document.getElementById('gb-input') as HTMLInputElement).value = name;
  document.getElementById('gb-suggestions')!.style.display = 'none';
  if (!state.email || isReadOnly()) return;
  try {
    await apiFetch('/api/golden-boot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: state.email, player_name: name }),
    });
    gbCurrentPick = name;
    updateGbDisplay();
    showToast('\uD83D\uDC9B Golden Boot pick saved: ' + name, 'success');
  } catch { showToast('Could not save pick', 'error'); }
}

export function updateGbDisplay(): void {
  const el = document.getElementById('gb-current')!;
  const section = document.getElementById('golden-boot-section')!;
  if (!state.email || !state.bracketLoaded || state.isViewing) {
    section.style.display = 'none'; return;
  }
  section.style.display = 'block';
  if (gbCurrentPick) {
    const ro = isReadOnly();
    el.innerHTML = `\uD83D\uDCC2 Your pick: <strong style="color:var(--gold)">${escHtml(gbCurrentPick)}</strong>${ro ? ' (locked)' : ''}`;
    if (ro) {
      (document.getElementById('gb-input') as HTMLInputElement).disabled = true;
    }
  } else {
    el.textContent = isReadOnly() ? 'No pick made before deadline' : 'Start typing to search for a player';
  }
}
