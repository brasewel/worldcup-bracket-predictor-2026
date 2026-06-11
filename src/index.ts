export interface Env {
  DB: D1Database;
  FOOTBALL_DATA_TOKEN: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

// June 11, 2026 21:00 UTC = 5:00 PM ET (Mexico vs South Africa kickoff)
const DEADLINE_ISO = '2026-06-11T21:00:00Z';
const DEADLINE_MS = new Date(DEADLINE_ISO).getTime();

const GROUPS: Record<string, { flag: string; name: string }[]> = {
  A: [
    { flag: '🇲🇽', name: 'Mexico' },
    { flag: '🇿🇦', name: 'South Africa' },
    { flag: '🇰🇷', name: 'South Korea' },
    { flag: '🇨🇿', name: 'Czechia' },
  ],
  B: [
    { flag: '🇨🇦', name: 'Canada' },
    { flag: '🇧🇦', name: 'Bosnia & Herzegovina' },
    { flag: '🇶🇦', name: 'Qatar' },
    { flag: '🇨🇭', name: 'Switzerland' },
  ],
  C: [
    { flag: '🇧🇷', name: 'Brazil' },
    { flag: '🇲🇦', name: 'Morocco' },
    { flag: '🇭🇹', name: 'Haiti' },
    { flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', name: 'Scotland' },
  ],
  D: [
    { flag: '🇺🇸', name: 'USA' },
    { flag: '🇵🇾', name: 'Paraguay' },
    { flag: '🇦🇺', name: 'Australia' },
    { flag: '🇹🇷', name: 'Türkiye' },
  ],
  E: [
    { flag: '🇩🇪', name: 'Germany' },
    { flag: '🇨🇼', name: 'Curaçao' },
    { flag: '🇨🇮', name: "Ivory Coast" },
    { flag: '🇪🇨', name: 'Ecuador' },
  ],
  F: [
    { flag: '🇳🇱', name: 'Netherlands' },
    { flag: '🇯🇵', name: 'Japan' },
    { flag: '🇸🇪', name: 'Sweden' },
    { flag: '🇹🇳', name: 'Tunisia' },
  ],
  G: [
    { flag: '🇧🇪', name: 'Belgium' },
    { flag: '🇪🇬', name: 'Egypt' },
    { flag: '🇮🇷', name: 'Iran' },
    { flag: '🇳🇿', name: 'New Zealand' },
  ],
  H: [
    { flag: '🇪🇸', name: 'Spain' },
    { flag: '🇨🇻', name: 'Cape Verde' },
    { flag: '🇸🇦', name: 'Saudi Arabia' },
    { flag: '🇺🇾', name: 'Uruguay' },
  ],
  I: [
    { flag: '🇫🇷', name: 'France' },
    { flag: '🇸🇳', name: 'Senegal' },
    { flag: '🇮🇶', name: 'Iraq' },
    { flag: '🇳🇴', name: 'Norway' },
  ],
  J: [
    { flag: '🇦🇷', name: 'Argentina' },
    { flag: '🇩🇿', name: 'Algeria' },
    { flag: '🇦🇹', name: 'Austria' },
    { flag: '🇯🇴', name: 'Jordan' },
  ],
  K: [
    { flag: '🇵🇹', name: 'Portugal' },
    { flag: '🇨🇩', name: 'DR Congo' },
    { flag: '🇺🇿', name: 'Uzbekistan' },
    { flag: '🇨🇴', name: 'Colombia' },
  ],
  L: [
    { flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', name: 'England' },
    { flag: '🇭🇷', name: 'Croatia' },
    { flag: '🇬🇭', name: 'Ghana' },
    { flag: '🇵🇦', name: 'Panama' },
  ],
};

// ─── HTML ─────────────────────────────────────────────────────────────────────

function buildHtml(deadlineMs: number, groupsJson: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>FIFA World Cup 2026 — Bracket Predictor</title>
<style>
  :root {
    --navy: #0a0e1a;
    --navy2: #111827;
    --navy3: #1e2a3b;
    --gold: #f5c518;
    --gold2: #d4a017;
    --gold-dim: rgba(245,197,24,0.15);
    --white: #f0f4f8;
    --grey: #8899aa;
    --green: #22c55e;
    --red: #ef4444;
    --amber: #f59e0b;
    --border: rgba(245,197,24,0.25);
    --card-bg: #0f1624;
    --font: 'Segoe UI', system-ui, sans-serif;
  }
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body {
    background: var(--navy);
    color: var(--white);
    font-family: var(--font);
    min-height: 100vh;
    background-image:
      radial-gradient(ellipse at 20% 0%, rgba(245,197,24,0.06) 0%, transparent 50%),
      radial-gradient(ellipse at 80% 100%, rgba(245,197,24,0.04) 0%, transparent 50%);
  }

  /* ── Header ── */
  .header {
    background: linear-gradient(135deg, #060910 0%, #0f1624 50%, #060910 100%);
    border-bottom: 2px solid var(--gold2);
    padding: 0 24px;
    position: sticky; top: 0; z-index: 100;
    box-shadow: 0 4px 32px rgba(0,0,0,0.5);
  }
  .header-inner {
    max-width: 1400px; margin: 0 auto;
    display: flex; align-items: center; justify-content: space-between;
    gap: 16px; padding: 14px 0;
  }
  .header-brand { display: flex; align-items: center; gap: 14px; }
  .trophy { font-size: 2.4rem; filter: drop-shadow(0 0 8px rgba(245,197,24,0.6)); }
  .header-titles { line-height: 1.1; }
  .header-titles h1 {
    font-size: 1.5rem; font-weight: 900; letter-spacing: 2px;
    background: linear-gradient(90deg, var(--gold), #fff 60%, var(--gold));
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    text-transform: uppercase;
  }
  .header-titles p { font-size: 0.7rem; letter-spacing: 4px; color: var(--grey); text-transform: uppercase; margin-top: 2px; }
  .host-flags { font-size: 1.3rem; letter-spacing: 4px; }
  #countdown-header {
    text-align: right; font-size: 0.75rem; color: var(--grey);
    line-height: 1.5;
  }
  #countdown-header .time-big { font-size: 1.1rem; color: var(--gold); font-weight: 700; font-variant-numeric: tabular-nums; }
  #countdown-header.locked { color: var(--red); }
  #countdown-header.locked .time-big { color: var(--red); }

  /* ── Layout ── */
  .main { max-width: 1400px; margin: 0 auto; padding: 24px; display: flex; gap: 24px; }
  .sidebar {
    width: 260px; flex-shrink: 0;
    position: sticky; top: 80px; align-self: flex-start;
    max-height: calc(100vh - 100px); overflow-y: auto;
  }
  .content { flex: 1; min-width: 0; }

  /* ── Cards ── */
  .card {
    background: var(--card-bg);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 20px;
  }
  .card-title {
    font-size: 0.7rem; font-weight: 700; letter-spacing: 3px;
    text-transform: uppercase; color: var(--gold); margin-bottom: 16px;
    display: flex; align-items: center; gap: 8px;
  }
  .card-title::before { content: ''; display: block; width: 3px; height: 14px; background: var(--gold); border-radius: 2px; }

  /* ── Sidebar inputs ── */
  .input-label { font-size: 0.65rem; letter-spacing: 2px; text-transform: uppercase; color: var(--grey); margin-bottom: 6px; display: block; }
  .input-field {
    width: 100%; background: var(--navy3); border: 1px solid var(--border);
    border-radius: 8px; padding: 10px 12px; color: var(--white);
    font-size: 0.9rem; outline: none; transition: border-color 0.2s;
    margin-bottom: 12px;
  }
  .input-field:focus { border-color: var(--gold); }
  .input-field::placeholder { color: var(--grey); }
  .btn {
    width: 100%; padding: 12px; border-radius: 8px; border: none;
    font-weight: 700; font-size: 0.85rem; letter-spacing: 1px; cursor: pointer;
    transition: all 0.2s; text-transform: uppercase;
  }
  .btn-gold {
    background: linear-gradient(135deg, var(--gold), var(--gold2));
    color: #0a0e1a;
  }
  .btn-gold:hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(245,197,24,0.4); }
  .btn-gold:active { transform: translateY(0); }
  .btn-gold:disabled { opacity: 0.4; cursor: not-allowed; transform: none; box-shadow: none; }
  .btn-outline {
    background: transparent; color: var(--gold);
    border: 1px solid var(--gold); margin-top: 8px;
  }
  .btn-outline:hover { background: var(--gold-dim); }
  .btn-danger {
    background: linear-gradient(135deg, #dc2626, #991b1b);
    color: white; margin-top: 8px;
  }
  .btn-danger:hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(220,38,38,0.4); }

  /* ── Predictions list ── */
  .predictions-list { display: flex; flex-direction: column; gap: 6px; max-height: 320px; overflow-y: auto; }
  .prediction-item {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 12px; border-radius: 8px; cursor: pointer;
    background: var(--navy3); border: 1px solid transparent;
    transition: all 0.15s;
  }
  .prediction-item:hover { border-color: var(--border); background: var(--navy2); }
  .prediction-item.active { border-color: var(--gold); background: var(--gold-dim); }
  .prediction-avatar {
    width: 32px; height: 32px; border-radius: 50%;
    background: linear-gradient(135deg, var(--gold2), var(--gold));
    color: var(--navy); font-weight: 900; font-size: 0.8rem;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .prediction-info { flex: 1; min-width: 0; }
  .prediction-name { font-size: 0.85rem; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .prediction-time { font-size: 0.65rem; color: var(--grey); }
  .lock-badge {
    font-size: 0.65rem; background: var(--gold-dim); color: var(--gold);
    border: 1px solid var(--gold); border-radius: 4px; padding: 2px 5px;
    white-space: nowrap;
  }
  .lock-badge.locked-personal { background: rgba(245,197,24,0.3); }

  /* ── Section headers ── */
  .section-header {
    display: flex; align-items: center; gap: 12px; margin-bottom: 20px;
  }
  .section-num {
    width: 32px; height: 32px; border-radius: 50%;
    background: var(--gold); color: var(--navy);
    font-weight: 900; font-size: 0.9rem;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .section-title { font-size: 1.1rem; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; }
  .section-subtitle { font-size: 0.75rem; color: var(--grey); margin-top: 2px; }

  /* ── Groups grid ── */
  .groups-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 16px;
    margin-bottom: 32px;
  }
  .group-card {
    background: var(--card-bg); border: 1px solid var(--border);
    border-radius: 10px; overflow: hidden;
  }
  .group-card-header {
    background: linear-gradient(90deg, rgba(245,197,24,0.15), transparent);
    border-bottom: 1px solid var(--border);
    padding: 10px 14px;
    font-size: 0.7rem; font-weight: 800; letter-spacing: 3px;
    color: var(--gold); text-transform: uppercase;
  }
  .group-teams { padding: 8px; display: flex; flex-direction: column; gap: 4px; }
  .team-row {
    display: flex; align-items: center; gap: 8px;
    padding: 8px 10px; border-radius: 7px;
    cursor: grab; user-select: none;
    transition: background 0.15s;
    border: 1px solid transparent;
  }
  .team-row:hover { background: var(--navy3); }
  .team-row.dragging { opacity: 0.4; }
  .team-row.drag-over { border-color: var(--gold); background: var(--gold-dim); }
  .team-row.readonly { cursor: default; }
  .rank-badge {
    width: 22px; height: 22px; border-radius: 5px; flex-shrink: 0;
    font-size: 0.65rem; font-weight: 800;
    display: flex; align-items: center; justify-content: center;
  }
  .rank-1 { background: rgba(34,197,94,0.2); color: var(--green); border: 1px solid rgba(34,197,94,0.4); }
  .rank-2 { background: rgba(245,197,24,0.15); color: var(--gold); border: 1px solid rgba(245,197,24,0.3); }
  .rank-3 { background: rgba(245,158,11,0.1); color: var(--amber); border: 1px solid rgba(245,158,11,0.2); }
  .rank-4 { background: rgba(136,153,170,0.1); color: var(--grey); border: 1px solid rgba(136,153,170,0.2); }
  .team-flag { font-size: 1.1rem; line-height: 1; flex-shrink: 0; }
  .team-name { font-size: 0.82rem; font-weight: 500; flex: 1; }
  /* ── Section number variant for 1.5 ── */
  .section-num-alt {
    background: linear-gradient(135deg, var(--gold2), #b8860b);
    color: var(--navy); width: 44px; height: 44px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-weight: 900; font-size: 0.75rem; flex-shrink: 0;
  }
  /* ── Rules explainer ── */
  .rules-explainer { margin-bottom: 16px; }
  .rules-toggle {
    background: none; border: 1px solid var(--border); color: var(--grey);
    padding: 7px 14px; border-radius: 8px; cursor: pointer; font-size: 0.78rem;
    font-family: var(--font); transition: all 0.2s;
  }
  .rules-toggle:hover { border-color: var(--gold); color: var(--gold); }
  .rules-body {
    margin-top: 12px; background: rgba(245,197,24,0.05); border: 1px solid var(--border);
    border-radius: 10px; padding: 14px 18px;
  }
  .rules-body p { color: var(--grey); font-size: 0.82rem; line-height: 1.6; margin: 0 0 8px; }
  .rules-body p:last-child { margin-bottom: 0; }
  .rules-body strong { color: var(--white); }
  /* ── 3rd place qualifier grid ── */
  .third-grid {
    display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 28px;
  }
  .third-slot {
    background: var(--card-bg); border: 1px solid var(--border); border-radius: 12px;
    padding: 14px 16px; display: flex; flex-direction: column; gap: 10px;
  }
  .third-slot-label {
    font-size: 0.62rem; letter-spacing: 1.5px; text-transform: uppercase;
    color: var(--grey); font-weight: 700;
  }
  .third-slot-opponent {
    font-size: 0.8rem; font-weight: 700; color: var(--white);
    display: flex; align-items: center; gap: 6px;
  }
  .third-slot-vs { color: var(--grey); font-size: 0.7rem; font-weight: 400; margin: 0 2px; }
  .third-slot-pick {
    background: var(--navy2); border: 1.5px solid var(--border); border-radius: 8px;
    color: var(--white); padding: 8px 10px; font-size: 0.78rem; font-family: var(--font);
    cursor: pointer; width: 100%; outline: none; transition: border-color 0.2s;
    appearance: auto;
  }
  .third-slot-pick:focus { border-color: var(--gold); }
  .third-slot-picked { font-size: 0.82rem; font-weight: 700; color: var(--gold); display: flex; align-items: center; gap: 6px; }
  .third-slot--done { border-color: rgba(245,197,24,0.4); }
  @media (max-width: 768px) {
    .third-grid { grid-template-columns: 1fr; }
  }
  /* ── Move btns (existing, keep below) ── */
  .move-btns { display: flex; flex-direction: column; gap: 1px; margin-left: auto; flex-shrink: 0; }
  .move-btn {
    background: var(--navy2); border: 1px solid var(--border); color: var(--gold);
    border-radius: 4px; width: 28px; height: 22px; cursor: pointer;
    font-size: 0.6rem; display: flex; align-items: center; justify-content: center;
    transition: background 0.15s; line-height: 1; padding: 0;
  }
  .move-btn:hover { background: var(--gold-dim); }
  .move-btn:active { background: rgba(245,197,24,0.3); }
  .move-btn-placeholder { display: block; width: 28px; height: 22px; }

  /* ── Knockout bracket ── */
  .bracket-scroll { overflow-x: auto; overflow-y: auto; padding-bottom: 16px; max-height: 700px; }
  .bracket {
    display: flex; gap: 0; min-width: 900px;
    align-items: stretch; min-height: 600px;
  }
  .bracket-round {
    display: flex; flex-direction: column;
    flex: 1;
    min-width: 140px;
  }
  .round-label {
    text-align: center; font-size: 0.6rem; font-weight: 700;
    letter-spacing: 2px; color: var(--gold); text-transform: uppercase;
    padding: 8px 4px 12px; border-bottom: 1px solid var(--border); margin-bottom: 8px;
  }
  .bracket-matches {
    display: flex; flex-direction: column;
    justify-content: space-around;
    flex: 1; gap: 8px; padding: 4px 0;
  }
  .bracket-match {
    display: flex; flex-direction: column; gap: 2px;
    position: relative;
  }
  .bracket-match::after {
    content: '';
    position: absolute;
    right: -1px; top: 25%; bottom: 25%;
    width: 1px; background: var(--border);
  }
  .bracket-round:last-child .bracket-match::after { display: none; }
  .match-team {
    padding: 6px 8px; border-radius: 5px;
    font-size: 0.72rem; font-weight: 500; cursor: pointer;
    background: var(--navy3); border: 1px solid var(--border);
    transition: all 0.15s; white-space: nowrap; overflow: hidden;
    text-overflow: ellipsis; min-height: 36px;
    display: flex; align-items: center; gap: 5px;
  }
  .match-team:hover:not(.empty):not(.readonly) { border-color: var(--gold); background: var(--gold-dim); }
  .match-team.winner { background: rgba(34,197,94,0.15); border-color: rgba(34,197,94,0.5); color: #86efac; }
  .match-team.empty { cursor: default; color: var(--grey); font-style: italic; }
  .match-team.readonly { cursor: default; }
  .match-separator { height: 1px; background: var(--border); margin: 0 8px; }
  .champion-slot {
    background: linear-gradient(135deg, rgba(245,197,24,0.15), rgba(245,197,24,0.05));
    border: 2px solid var(--gold);
    border-radius: 12px; padding: 20px; text-align: center;
    margin: auto 0;
  }
  .champion-trophy { font-size: 2rem; display: block; margin-bottom: 8px; }
  .champion-name { font-size: 1rem; font-weight: 800; color: var(--gold); }
  .champion-label { font-size: 0.6rem; letter-spacing: 2px; color: var(--grey); text-transform: uppercase; margin-top: 4px; }

  /* ── Save bar ── */
  .save-bar {
    position: sticky; bottom: 0; z-index: 50;
    background: linear-gradient(0deg, var(--navy) 80%, transparent);
    padding: 16px 0 20px;
    margin-top: 32px;
  }
  .save-bar-inner {
    display: flex; align-items: center; gap: 16px;
    max-width: 1400px; margin: 0 auto; padding: 0 24px;
  }
  .save-main-btn {
    flex: 1; padding: 16px; border-radius: 10px; border: none;
    font-weight: 900; font-size: 1rem; letter-spacing: 2px; cursor: pointer;
    text-transform: uppercase;
    background: linear-gradient(135deg, var(--gold), var(--gold2));
    color: var(--navy);
    box-shadow: 0 4px 20px rgba(245,197,24,0.3);
    transition: all 0.2s;
  }
  .save-main-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(245,197,24,0.5); }
  .save-main-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; box-shadow: none; }
  .auto-btn {
    flex: 0 0 auto; padding: 16px 14px; border-radius: 10px; border: 2px solid var(--gold);
    font-weight: 800; font-size: 0.85rem; letter-spacing: 1px; cursor: pointer;
    text-transform: uppercase; background: transparent; color: var(--gold);
    transition: all 0.2s; white-space: nowrap;
  }
  .auto-btn:hover:not(:disabled) { background: rgba(245,197,24,0.15); transform: translateY(-2px); }
  .auto-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .confirm-btn {
    flex: 1; padding: 16px; border-radius: 10px; border: none;
    font-weight: 900; font-size: 0.9rem; letter-spacing: 1.5px; cursor: pointer;
    text-transform: uppercase;
    background: linear-gradient(135deg, #16a34a, #15803d);
    color: white;
    box-shadow: 0 4px 20px rgba(22,163,74,0.3);
    transition: all 0.2s;
  }
  .confirm-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(22,163,74,0.5); }
  .confirm-btn:disabled { opacity: 0.35; cursor: not-allowed; transform: none; box-shadow: none; background: #374151; color: #9ca3af; }
  .locked-banner {
    flex: 1; padding: 16px; border-radius: 10px;
    background: rgba(239,68,68,0.15); border: 2px solid rgba(239,68,68,0.5);
    color: #fca5a5; font-weight: 900; font-size: 0.9rem;
    text-align: center; letter-spacing: 1px;
  }
  /* ── Score ticker ── */
  .ticker-wrap {
    overflow-x: auto; display: flex; gap: 10px; padding: 10px 0 14px;
    scrollbar-width: none; -webkit-overflow-scrolling: touch;
  }
  .ticker-wrap::-webkit-scrollbar { display: none; }
  .ticker-item {
    flex-shrink: 0; background: var(--card-bg); border: 1px solid var(--border);
    border-radius: 10px; padding: 8px 14px; font-size: 0.75rem; white-space: nowrap;
    display: flex; flex-direction: column; align-items: center; gap: 3px;
    min-width: 130px;
  }
  .ticker-item.live   { border-color: rgba(239,68,68,0.6); animation: ticker-pulse 2s infinite; }
  .ticker-item.done   { border-color: rgba(245,197,24,0.4); }
  .ticker-teams { font-weight: 700; color: var(--white); font-size: 0.78rem; }
  .ticker-score { font-weight: 900; font-size: 1rem; color: var(--gold); }
  .ticker-status { font-size: 0.6rem; letter-spacing: 1px; text-transform: uppercase; color: var(--grey); }
  .ticker-status.live-dot::before { content: '● '; color: #ef4444; }
  @keyframes ticker-pulse {
    0%,100% { border-color: rgba(239,68,68,0.6); }
    50%      { border-color: rgba(239,68,68,1); }
  }

  /* ── Tab navigation ── */
  .tab-nav {
    display: flex; gap: 8px; margin-bottom: 20px;
  }
  .tab-btn {
    flex: 1; padding: 12px 16px; border-radius: 10px; border: 2px solid var(--border);
    background: transparent; color: var(--grey); font-weight: 700; font-size: 0.85rem;
    letter-spacing: 1px; text-transform: uppercase; cursor: pointer;
    font-family: var(--font); transition: all 0.2s;
  }
  .tab-btn:hover { border-color: var(--gold); color: var(--gold); }
  .tab-btn.tab-active { background: var(--gold); border-color: var(--gold); color: var(--navy); }

  /* ── Schedule panel ── */
  .schedule-notice {
    background: rgba(245,197,24,0.08); border: 1px solid var(--border);
    border-radius: 10px; padding: 12px 16px; margin-bottom: 20px;
    color: var(--grey); font-size: 0.82rem;
  }
  .schedule-notice strong { color: var(--white); }
  .schedule-day {
    margin-bottom: 28px;
  }
  .schedule-day-header {
    font-size: 0.68rem; font-weight: 900; letter-spacing: 3px;
    text-transform: uppercase; color: var(--gold); padding: 6px 0;
    border-bottom: 1px solid var(--border); margin-bottom: 12px;
    display: flex; align-items: center; gap: 10px;
  }
  .schedule-day-header .today-badge {
    background: var(--gold); color: var(--navy); font-size: 0.6rem;
    padding: 2px 8px; border-radius: 20px; font-weight: 900; letter-spacing: 1px;
  }
  .schedule-round-label {
    font-size: 0.62rem; letter-spacing: 2px; text-transform: uppercase;
    color: #6b7280; font-weight: 700; margin: 16px 0 8px;
  }
  .match-card {
    background: var(--card-bg); border: 1px solid var(--border); border-radius: 12px;
    padding: 14px 16px; margin-bottom: 10px; transition: border-color 0.2s;
  }
  .match-card.today-match { border-color: rgba(245,197,24,0.4); }
  .match-card-meta {
    display: flex; justify-content: space-between; align-items: center;
    font-size: 0.62rem; color: var(--grey); margin-bottom: 10px;
    letter-spacing: 0.5px;
  }
  .match-card-teams {
    display: flex; align-items: stretch; gap: 0; margin-bottom: 10px;
  }
  .match-pick-btn {
    flex: 1; padding: 10px 8px; border-radius: 8px; border: 1.5px solid var(--border);
    background: var(--navy2); color: var(--white); font-weight: 700; font-size: 0.8rem;
    cursor: pointer; font-family: var(--font); transition: all 0.2s; text-align: center;
    display: flex; align-items: center; justify-content: center; gap: 5px;
  }
  .match-pick-btn:hover:not(:disabled) { border-color: var(--gold); color: var(--gold); background: rgba(245,197,24,0.08); }
  .match-pick-btn.picked { border-color: var(--gold); background: rgba(245,197,24,0.15); color: var(--gold); }
  .match-pick-btn:disabled { cursor: default; opacity: 0.6; }
  .match-vs {
    padding: 0 10px; display: flex; align-items: center;
    color: var(--grey); font-size: 0.7rem; font-weight: 700; flex-shrink: 0;
  }
  .match-tbd-teams {
    color: var(--grey); font-style: italic; font-size: 0.8rem; margin-bottom: 10px;
    padding: 10px 0;
  }
  .match-tally {
    display: none; margin-top: 8px;
  }
  .match-tally.visible { display: block; }
  .tally-bar-wrap {
    display: flex; align-items: center; gap: 8px; margin-bottom: 4px;
  }
  .tally-label { font-size: 0.72rem; color: var(--grey); min-width: 110px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .tally-bar-outer { flex: 1; background: var(--navy2); border-radius: 4px; height: 8px; overflow: hidden; }
  .tally-bar-inner { height: 100%; border-radius: 4px; background: var(--gold); transition: width 0.5s; }
  .tally-count { font-size: 0.7rem; color: var(--grey); min-width: 28px; text-align: right; }
  .tally-total { font-size: 0.68rem; color: #6b7280; margin-top: 4px; }
  .score-pick-row {
    display: flex; align-items: center; gap: 6px; margin-top: 8px;
    padding: 8px 10px; background: rgba(245,197,24,0.06); border-radius: 8px;
    border: 1px solid rgba(245,197,24,0.2); font-size: 0.78rem; color: var(--white);
    flex-wrap: wrap;
  }
  .score-input {
    background: var(--navy2); border: 1px solid var(--border); border-radius: 6px;
    color: var(--white); padding: 4px 6px; font-size: 0.9rem; font-weight: 700;
    text-align: center; font-family: var(--font);
  }
  .score-input:focus { outline: none; border-color: var(--gold); }
  .btn-score-submit {
    background: var(--gold); color: var(--navy); border: none; border-radius: 6px;
    padding: 4px 10px; font-weight: 700; font-size: 0.72rem; cursor: pointer;
    font-family: var(--font); margin-left: 4px;
  }
  @media (max-width: 768px) {
    .match-pick-btn { font-size: 0.72rem; padding: 8px 5px; }
    .tally-label { min-width: 80px; }
  }

  /* ── Consensus badge on bracket ── */
  .consensus-badge {
    font-size: 0.62rem; color: var(--grey); margin-top: 4px; text-align: center;
    letter-spacing: 0.3px;
  }

  /* ── Leaderboard ── */
  .lb-meta {
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 16px; font-size: 0.72rem; color: var(--grey);
  }
  .lb-refresh-btn {
    background: transparent; border: 1px solid var(--border); border-radius: 6px;
    color: var(--grey); padding: 4px 10px; cursor: pointer; font-family: var(--font);
    font-size: 0.72rem; transition: all 0.2s;
  }
  .lb-refresh-btn:hover { border-color: var(--gold); color: var(--gold); }
  .lb-empty {
    text-align: center; padding: 60px 20px; color: var(--grey);
    font-size: 0.9rem; line-height: 1.6;
  }
  .lb-row {
    display: flex; align-items: center; gap: 12px;
    background: var(--card-bg); border: 1px solid var(--border); border-radius: 12px;
    padding: 14px 16px; margin-bottom: 10px; cursor: pointer;
    transition: border-color 0.2s;
  }
  .lb-row:hover { border-color: var(--gold); }
  .lb-row.lb-me { border-color: rgba(245,197,24,0.5); background: rgba(245,197,24,0.05); }
  .lb-rank {
    font-size: 1.1rem; font-weight: 900; min-width: 32px; text-align: center;
  }
  .lb-rank.rank-1 { color: #ffd700; }
  .lb-rank.rank-2 { color: #c0c0c0; }
  .lb-rank.rank-3 { color: #cd7f32; }
  .lb-name { flex: 1; font-weight: 700; font-size: 0.9rem; color: var(--white); }
  .lb-score { font-size: 1.1rem; font-weight: 900; color: var(--gold); }
  .lb-detail { font-size: 0.68rem; color: var(--grey); margin-top: 2px; }
  .lb-you-badge {
    font-size: 0.6rem; font-weight: 900; letter-spacing: 1px;
    background: var(--gold); color: var(--navy); padding: 2px 7px; border-radius: 20px;
  }
  /* Your picks breakdown */
  .my-picks-section {
    margin-top: 28px;
  }
  .my-picks-title {
    font-size: 0.68rem; font-weight: 900; letter-spacing: 3px; text-transform: uppercase;
    color: var(--gold); border-bottom: 1px solid var(--border); padding-bottom: 8px;
    margin-bottom: 14px;
  }
  .pick-row {
    display: flex; align-items: center; gap: 10px;
    padding: 8px 12px; border-radius: 8px; margin-bottom: 6px;
    background: var(--card-bg); border: 1px solid var(--border);
    font-size: 0.8rem;
  }
  .pick-row.pick-correct { border-color: rgba(34,197,94,0.4); background: rgba(34,197,94,0.07); }
  .pick-row.pick-wrong   { border-color: rgba(239,68,68,0.3); background: rgba(239,68,68,0.07); }
  .pick-icon { font-size: 1rem; min-width: 22px; text-align: center; }
  .pick-round { font-size: 0.62rem; color: var(--grey); min-width: 70px; }
  .pick-team { flex: 1; font-weight: 700; color: var(--white); }
  .pick-actual { font-size: 0.72rem; color: var(--grey); }
  .btn-match-detail {
    background: transparent; border: 1px solid var(--border); border-radius: 6px;
    color: var(--grey); padding: 5px 10px; cursor: pointer; font-size: 0.72rem;
    font-family: var(--font); margin-top: 8px; transition: all 0.2s;
  }
  .btn-match-detail:hover { border-color: var(--gold); color: var(--gold); }
  .match-detail-panel {
    margin-top: 8px; padding: 10px 12px; background: rgba(0,0,0,0.3);
    border-radius: 8px; border: 1px solid var(--border);
  }
  .match-summary-header {
    font-size: 0.72rem; font-weight: 700; color: var(--gold);
    margin-bottom: 8px; letter-spacing: 1px; text-transform: uppercase;
  }
  .goal-event {
    font-size: 0.8rem; font-weight: 700; color: var(--white);
    padding: 4px 0; border-bottom: 1px solid var(--border);
  }
  .goal-event:last-child { border-bottom: none; }
  /* Head-to-head */
  .btn-h2h {
    background: rgba(245,197,24,0.1); border: 1px solid rgba(245,197,24,0.3);
    border-radius: 6px; color: var(--gold); padding: 3px 7px; cursor: pointer;
    font-size: 0.7rem; font-family: var(--font); transition: background 0.2s;
  }
  .btn-h2h:hover { background: rgba(245,197,24,0.25); }
  #h2h-modal {
    position: fixed; inset: 0; background: rgba(0,0,0,0.8); z-index: 1000;
    display: flex; align-items: flex-start; justify-content: center;
    padding: 20px 12px; overflow-y: auto;
  }
  .h2h-box {
    background: var(--navy2); border: 1px solid var(--border); border-radius: 16px;
    padding: 20px; max-width: 700px; width: 100%; position: relative;
  }
  .h2h-header {
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 16px; font-size: 0.85rem; color: var(--grey);
  }
  .h2h-title { font-size: 1rem; font-weight: 700; color: var(--white); margin-bottom: 4px; }
  .h2h-table { width: 100%; border-collapse: collapse; }
  .h2h-table th { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 1px; color: var(--grey); padding: 6px 10px; background: rgba(255,255,255,0.03); }
  .h2h-table td { padding: 6px 10px; font-size: 0.8rem; border-bottom: 1px solid var(--border); }
  .h2h-match-name { color: var(--grey); font-size: 0.7rem; }
  .h2h-agree { color: #4ade80; font-weight: 700; }
  .h2h-diff  { color: #fb923c; font-weight: 700; }
  .h2h-round-header { color: var(--gold); font-weight: 700; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 1px; padding: 10px 10px 4px; }
  .gb-option {
    padding: 10px 14px; cursor: pointer; font-size: 0.85rem; color: var(--white);
    border-bottom: 1px solid var(--border); transition: background 0.15s;
  }
  .gb-option:last-child { border-bottom: none; }
  .gb-option:hover { background: rgba(245,197,24,0.1); color: var(--gold); }
  .who-called-row {
    font-size: 0.78rem; color: var(--grey); padding: 7px 12px;
    border-left: 3px solid var(--gold); margin-bottom: 6px;
    background: rgba(245,197,24,0.05); border-radius: 0 8px 8px 0;
  }
  .who-called-row strong { color: var(--white); }

  @keyframes shake {
    0%,100% { transform: translateX(0); }
    15%      { transform: translateX(-8px); }
    30%      { transform: translateX(8px); }
    45%      { transform: translateX(-6px); }
    60%      { transform: translateX(6px); }
    75%      { transform: translateX(-3px); }
    90%      { transform: translateX(3px); }
  }
  #pass-card.shake { animation: shake 0.45s ease; }
  #pass-input:focus { border-color: var(--gold) !important; }
  #toast {
    position: fixed; bottom: 100px; left: 50%; transform: translateX(-50%) translateY(20px);
    background: var(--navy3); border: 1px solid var(--gold);
    color: var(--white); padding: 12px 24px; border-radius: 8px;
    font-size: 0.85rem; font-weight: 600;
    opacity: 0; transition: all 0.3s; pointer-events: none; z-index: 9999;
    white-space: nowrap;
  }
  #toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }
  #toast.success { border-color: var(--green); }
  #toast.error { border-color: var(--red); }

  /* ── Modal ── */
  .modal-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.8);
    display: flex; align-items: center; justify-content: center;
    z-index: 200; opacity: 0; pointer-events: none; transition: opacity 0.2s;
  }
  .modal-overlay.open { opacity: 1; pointer-events: all; }
  .modal {
    background: var(--navy2); border: 1px solid var(--gold);
    border-radius: 16px; padding: 32px; max-width: 440px; width: 90%;
    text-align: center;
  }
  .modal h2 { font-size: 1.3rem; font-weight: 900; color: var(--gold); margin-bottom: 12px; }
  .modal p { color: var(--grey); line-height: 1.6; margin-bottom: 24px; }
  .modal-actions { display: flex; gap: 12px; }

  /* ── Locked global overlay ── */
  #global-lock-banner {
    background: linear-gradient(90deg, rgba(239,68,68,0.1), rgba(239,68,68,0.05));
    border: 1px solid rgba(239,68,68,0.3); border-radius: 10px;
    padding: 16px 20px; margin-bottom: 24px;
    display: none; align-items: center; gap: 12px;
    color: #fca5a5; font-weight: 700; font-size: 0.9rem;
  }
  #global-lock-banner.show { display: flex; }

  /* ── Viewing mode ── */
  .viewing-banner {
    background: rgba(245,197,24,0.1); border: 1px solid var(--gold);
    border-radius: 10px; padding: 12px 16px; margin-bottom: 20px;
    font-size: 0.85rem; display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
  }

  .spinner { display: inline-block; width: 16px; height: 16px; border: 2px solid var(--border); border-top-color: var(--gold); border-radius: 50%; animation: spin 0.6s linear infinite; vertical-align: middle; margin-right: 6px; }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ── Pre-login placeholder ── */
  #pre-login-placeholder {
    display: flex; align-items: center; justify-content: center;
    min-height: 50vh; padding: 16px;
  }
  .placeholder-box {
    text-align: center; max-width: 500px; width: 100%;
    background: var(--card-bg); border: 1px solid var(--border);
    border-radius: 16px; padding: 32px 24px;
  }
  .placeholder-trophy { font-size: 3rem; margin-bottom: 16px; filter: drop-shadow(0 0 16px rgba(245,197,24,0.4)); }
  .placeholder-box h2 { font-size: 1.15rem; font-weight: 800; color: var(--white); margin-bottom: 10px; }
  .placeholder-box p { color: var(--grey); line-height: 1.7; font-size: 0.875rem; margin-bottom: 24px; }
  .placeholder-box strong { color: var(--gold); }
  .placeholder-steps { display: flex; flex-direction: column; gap: 10px; text-align: left; }
  .placeholder-step {
    display: flex; align-items: center; gap: 12px;
    background: var(--navy3); border-radius: 8px; padding: 11px 14px;
    font-size: 0.82rem; color: var(--white);
  }
  .step-num {
    width: 26px; height: 26px; border-radius: 50%; flex-shrink: 0;
    background: linear-gradient(135deg, var(--gold), var(--gold2));
    color: var(--navy); font-weight: 900; font-size: 0.8rem;
    display: flex; align-items: center; justify-content: center;
  }

  /* ── Mobile — tablet (≤768px) ── */
  @media (max-width: 768px) {
    /* Header */
    .header { padding: 0 16px; }
    .header-inner { flex-wrap: wrap; gap: 8px; padding: 10px 0; }
    .trophy { font-size: 1.8rem; }
    .header-titles h1 { font-size: 1.1rem; letter-spacing: 1px; }
    .header-titles p { font-size: 0.6rem; letter-spacing: 2px; }
    .host-flags { font-size: 1rem; letter-spacing: 2px; }
    #countdown-header { font-size: 0.7rem; }
    #countdown-header .time-big { font-size: 0.95rem; }

    /* Layout — single column */
    .main { flex-direction: column; padding: 12px; gap: 12px; }
    .sidebar { width: 100%; position: static; max-height: none; }

    /* Login card — horizontal on mobile */
    #login-card { padding: 16px; }
    .input-field { font-size: 1rem; padding: 12px; margin-bottom: 10px; }
    .btn { padding: 14px; font-size: 0.9rem; }

    /* Predictions list — horizontal scroll row on mobile */
    .predictions-list {
      flex-direction: row; flex-wrap: nowrap;
      overflow-x: auto; overflow-y: hidden;
      max-height: none; gap: 8px; padding-bottom: 4px;
    }
    .prediction-item { flex-shrink: 0; width: 160px; flex-direction: column; align-items: flex-start; gap: 6px; padding: 10px; }
    .prediction-info { width: 100%; }
    .prediction-name { white-space: normal; font-size: 0.8rem; }

    /* Groups — 2 columns on tablet */
    .groups-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 20px; }
    .group-card-header { padding: 8px 12px; font-size: 0.65rem; }
    .team-row { padding: 8px 6px; gap: 5px; }
    .team-name { font-size: 0.75rem; }
    .team-flag { font-size: 0.95rem; }
    .rank-badge { width: 18px; height: 18px; font-size: 0.55rem; }
    .move-btn { width: 32px; height: 26px; font-size: 0.65rem; }
    .move-btn-placeholder { width: 32px; height: 26px; }

    /* Section headers */
    .section-header { gap: 10px; margin-bottom: 14px; }
    .section-title { font-size: 0.95rem; }
    .section-subtitle { font-size: 0.7rem; }

    /* Bracket — horizontal scroll with hint */
    .bracket-scroll { max-height: 520px; border-radius: 10px; border: 1px solid var(--border); }
    .bracket { min-width: 780px; min-height: 500px; }
    .bracket-round { min-width: 120px; }
    .round-label { font-size: 0.55rem; padding: 6px 2px 8px; }
    .match-team { font-size: 0.68rem; padding: 6px 6px; min-height: 40px; gap: 4px; }

    /* Save bar */
    .save-bar { padding: 10px 0 16px; }
    .save-bar-inner { padding: 0 12px; gap: 10px; }
    .save-main-btn { padding: 14px 8px; font-size: 0.82rem; letter-spacing: 1px; }
    .auto-btn { padding: 12px 8px; font-size: 0.72rem; }
    .confirm-btn { padding: 14px 8px; font-size: 0.78rem; letter-spacing: 0.5px; }
    .locked-banner { font-size: 0.8rem; padding: 12px; }

    /* Toast */
    #toast { font-size: 0.8rem; padding: 10px 18px; max-width: 90vw; white-space: normal; text-align: center; }

    /* Modal */
    .modal { padding: 24px 20px; }
    .modal h2 { font-size: 1.1rem; }
    .modal-actions { flex-direction: column; }
  }

  /* ── Small phones (≤420px) ── */
  @media (max-width: 420px) {
    .header-titles h1 { font-size: 0.95rem; }
    .host-flags { display: none; }
    .groups-grid { grid-template-columns: 1fr 1fr; gap: 8px; }
    .group-card-header { font-size: 0.6rem; padding: 7px 10px; }
    .team-name { font-size: 0.72rem; }
    .bracket-round { min-width: 100px; }
    .auto-btn, .save-main-btn, .confirm-btn { font-size: 0.7rem; letter-spacing: 0; padding: 12px 6px; }
    .placeholder-box { padding: 24px 16px; }
    .placeholder-box h2 { font-size: 1rem; }
  }
</style>
</head>
<body>

<!-- Password gate -->
<div id="password-gate" style="display:none;position:fixed;inset:0;z-index:10000;background:linear-gradient(160deg,#0a0e1a 0%,#0d1425 60%,#0a0e1a 100%);align-items:center;justify-content:center;padding:20px;">
  <div id="pass-card" style="background:var(--navy2);border:2px solid var(--gold);border-radius:18px;padding:40px 32px;max-width:380px;width:100%;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,0.7);">
    <div style="font-size:3rem;margin-bottom:12px;">🏆</div>
    <h2 style="color:var(--gold);font-size:1.4rem;font-weight:900;letter-spacing:3px;text-transform:uppercase;margin:0 0 4px;">FIFA World Cup 2026</h2>
    <p style="color:var(--grey);font-size:0.75rem;letter-spacing:2px;text-transform:uppercase;margin:0 0 28px;">Private Group Predictor</p>
    <p style="color:var(--white);font-size:0.9rem;margin:0 0 18px;opacity:0.8;">Enter the group password to access</p>
    <input id="pass-input" type="password" placeholder="Group password" autocomplete="off"
      style="width:100%;box-sizing:border-box;padding:14px 16px;border-radius:10px;border:2px solid var(--border);background:var(--navy3);color:var(--white);font-size:1rem;outline:none;margin-bottom:10px;text-align:center;letter-spacing:4px;" />
    <div id="pass-error" style="display:none;color:#f87171;font-size:0.82rem;margin-bottom:10px;">Wrong password. Try again.</div>
    <button id="pass-submit" style="width:100%;padding:15px;border-radius:10px;border:none;background:linear-gradient(135deg,var(--gold),var(--gold2));color:var(--navy);font-weight:900;font-size:1rem;letter-spacing:2px;text-transform:uppercase;cursor:pointer;">Enter</button>
  </div>
</div>

<div id="app-root" style="display:none;">

<header class="header">
  <div class="header-inner">
    <div class="header-brand">
      <span class="trophy">🏆</span>
      <div class="header-titles">
        <h1>FIFA World Cup 2026</h1>
        <p>Bracket Predictor</p>
      </div>
    </div>
    <div class="host-flags">🇺🇸 🇨🇦 🇲🇽</div>
    <div id="countdown-header">
      <div>Picks close in</div>
      <div class="time-big" id="countdown-text">...</div>
    </div>
  </div>
</header>

<div class="main">
  <!-- ── Sidebar ── -->
  <aside class="sidebar">
    <div class="card" id="login-card">
      <div class="card-title">Your Bracket</div>
      <label class="input-label">Display Name</label>
      <input type="text" id="input-name" class="input-field" placeholder="e.g. Bruno" maxlength="40"/>
      <label class="input-label">Email (used to identify you)</label>
      <input type="email" id="input-email" class="input-field" placeholder="you@example.com"/>
      <button class="btn btn-gold" id="btn-load">Load / New Bracket</button>
      <div id="load-error" style="color:var(--red);font-size:0.75rem;margin-top:8px;display:none;"></div>
    </div>

    <div class="card">
      <div class="card-title">All Predictions</div>
      <div id="predictions-list" class="predictions-list">
        <div style="color:var(--grey);font-size:0.8rem;">Loading...</div>
      </div>
    </div>
  </aside>

  <!-- ── Main Content ── -->
  <main class="content">
    <!-- Tab navigation -->
    <div class="tab-nav">
      <button class="tab-btn tab-active" id="tab-bracket" onclick="switchTab('bracket')">🏆 Bracket</button>
      <button class="tab-btn" id="tab-schedule" onclick="switchTab('schedule')">📅 Schedule</button>
      <button class="tab-btn" id="tab-leaderboard" onclick="switchTab('leaderboard')">🥇 Leaderboard</button>
    </div>

    <!-- Live score ticker -->
    <div id="score-ticker" class="ticker-wrap" style="display:none"></div>

    <div id="global-lock-banner">
      🔒 Picks are locked — the tournament has started!
    </div>

    <div id="viewing-banner" class="viewing-banner" style="display:none">
      <span>👁️</span>
      <span id="viewing-text">Viewing bracket</span>
      <button class="btn btn-outline" style="width:auto;padding:6px 14px;margin:0;flex-shrink:0;" id="btn-stop-viewing" onclick="stopViewing()">Close</button>
    </div>

    <!-- Pre-login placeholder -->
    <div id="pre-login-placeholder">
      <div class="placeholder-box">
        <div class="placeholder-trophy">🏆</div>
        <h2>Ready to predict the 2026 World Cup?</h2>
        <p>Enter your name and email in the sidebar, then hit <strong>Load / New Bracket</strong> to start filling in your picks.</p>
        <div class="placeholder-steps">
          <div class="placeholder-step"><span class="step-num">1</span> Enter your name &amp; email</div>
          <div class="placeholder-step"><span class="step-num">2</span> Drag teams to set group standings</div>
          <div class="placeholder-step"><span class="step-num">3</span> Pick winners through the knockout rounds</div>
          <div class="placeholder-step"><span class="step-num">4</span> Save &amp; lock your picks before June 11, 5 PM ET</div>
        </div>
      </div>
    </div>

    <!-- Bracket content — hidden until bracket is loaded -->
    <div id="bracket-content" style="display:none">
      <!-- Group Stage -->
      <div id="group-stage-section">
        <div class="section-header">
          <div class="section-num">1</div>
          <div>
            <div class="section-title">Group Stage</div>
            <div class="section-subtitle">Drag teams to set your predicted finishing order. Top 2 advance automatically.</div>
          </div>
        </div>
        <div class="groups-grid" id="groups-grid"></div>
      </div>

      <!-- 3rd Place Qualifiers -->
      <div id="third-place-section">
        <div class="section-header">
          <div class="section-num section-num-alt">1.5</div>
          <div>
            <div class="section-title">3rd Place Qualifiers</div>
            <div class="section-subtitle">Pick which 3rd-place team you predict will advance in each match.</div>
          </div>
        </div>
        <div class="rules-explainer">
          <button class="rules-toggle" onclick="toggleRules()" id="rules-toggle-btn">\u2139\uFE0F How does this work?</button>
          <div class="rules-body" id="rules-body" style="display:none">
            <p><strong>Only 8 of the 12 third-place teams advance</strong> \u2014 the other 4 go home.</p>
            <p>FIFA pre-determined which 3rd-place teams can fill which bracket slots based on their group. For example, only a team finishing 3rd in Groups A, B, C, D, or F can go into Match 74 against the Winner of Group E. A 3rd-place team from Group G simply cannot appear there.</p>
            <p>Each dropdown below only shows you the eligible groups for that particular slot, so you\u2019re always picking from the correct pool. Once the real tournament\u2019s group stage ends, FIFA slots in the actual qualifying teams automatically using this exact same system \u2014 no second draw needed.</p>
          </div>
        </div>
        <div class="third-grid" id="third-grid"></div>
      </div>

      <!-- Knockout -->
      <div class="section-header">
        <div class="section-num" id="knockout-num">2</div>
        <div>
          <div class="section-title">Knockout Stage</div>
          <div class="section-subtitle" id="knockout-subtitle">Click a team in each match to advance them to the next round.</div>
        </div>
      </div>
      <div class="bracket-scroll">
        <div class="bracket" id="bracket"></div>
      </div>

      <!-- Golden Boot -->
      <div id="golden-boot-section" style="display:none;margin-top:32px">
        <div class="section-header">
          <div class="section-num" style="background:var(--gold);color:var(--navy)">⚽</div>
          <div>
            <div class="section-title">Golden Boot Predictor</div>
            <div class="section-subtitle">Pick the tournament top scorer (+5 pts if correct)</div>
          </div>
        </div>
        <div id="golden-boot-card" class="card" style="padding:16px">
          <input type="text" id="gb-input" placeholder="Search player name..." class="score-input"
            style="width:100%;font-size:0.9rem;padding:10px 12px;border-radius:8px;margin-bottom:10px"
            oninput="filterGbPlayers(this.value)" autocomplete="off">
          <div id="gb-suggestions" style="display:none;max-height:180px;overflow-y:auto;background:var(--navy2);border:1px solid var(--border);border-radius:8px;margin-bottom:10px"></div>
          <div id="gb-current" style="font-size:0.82rem;color:var(--grey)">No pick yet</div>
        </div>
      </div>

      <!-- Save bar -->
      <div class="save-bar">
        <div class="save-bar-inner" id="save-bar-inner">
          <button class="save-main-btn" id="btn-save" disabled>💾 Save Draft</button>
          <button class="confirm-btn" id="btn-confirm" disabled>✅ Confirm &amp; Lock My Picks</button>
        </div>
      </div>
    </div>
  </main>
</div>

<!-- Leaderboard panel -->
<div id="leaderboard-panel" style="display:none">
  <div id="leaderboard-content"></div>
</div>

<!-- H2H modal -->
<div id="h2h-modal" style="display:none" onclick="if(event.target===this)closeH2H()">
  <div class="h2h-box">
    <div class="h2h-header">
      <div>
        <div class="h2h-title" id="h2h-title">Head-to-Head</div>
        <div id="h2h-subtitle">Your picks vs theirs</div>
      </div>
      <button class="btn-h2h" onclick="closeH2H()" style="font-size:1rem;padding:6px 10px">✕</button>
    </div>
    <div id="h2h-content"><div style="color:var(--grey);font-size:0.85rem">Loading...</div></div>
  </div>
</div>

<!-- Schedule panel -->
<div id="schedule-panel" style="display:none">
  <div id="schedule-login-notice" style="display:none" class="schedule-notice">
    ℹ️ <strong>Load your bracket</strong> to make quick picks on each match.
  </div>
  <div id="schedule-days"></div>
</div>

<!-- Confirm modal -->
<div class="modal-overlay" id="confirm-modal">
  <div class="modal">
    <h2>🔒 Lock Your Picks?</h2>
    <p>Once you confirm, your bracket is <strong>permanently locked</strong> and cannot be changed. Make sure you're happy with every pick!</p>
    <div class="modal-actions">
      <button class="btn btn-outline" style="flex:1" onclick="closeModal()">Go Back</button>
      <button class="btn btn-danger" style="flex:1" onclick="confirmLock()">Yes, Lock It!</button>
    </div>
  </div>
</div>

<div id="toast"></div>

<script>
const DEADLINE = ${deadlineMs};
const GROUPS_DATA = ${groupsJson};

// ── State ──────────────────────────────────────────────────────────────────────
let state = {
  name: '',
  email: '',
  groups: {},       // { A: ['Mexico','South Africa','South Korea','Czechia'], ... }
  knockout: {},     // { 'r32_0': 'Mexico', 'r16_0': ... }
  predicted3rd: {}, // { 1: 'Germany', 4: 'France', ... } — matchIdx → predicted 3rd-place team
  locked: false,
  isViewing: false,
  viewingName: '',
  bracketLoaded: false,
};

// Init group order from default
Object.entries(GROUPS_DATA).forEach(([g, teams]) => {
  state.groups[g] = teams.map(t => t.name);
});

// ── Deadline / lock ────────────────────────────────────────────────────────────
function isPastDeadline() { return Date.now() >= DEADLINE; }
function isReadOnly() { return state.locked || isPastDeadline() || state.isViewing; }

function updateCountdown() {
  const el = document.getElementById('countdown-text');
  const header = document.getElementById('countdown-header');
  if (isPastDeadline()) {
    el.textContent = 'PICKS LOCKED';
    header.classList.add('locked');
    document.getElementById('global-lock-banner').classList.add('show');
    renderSaveBar();
    return;
  }
  const diff = DEADLINE - Date.now();
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  el.textContent = h + 'h ' + String(m).padStart(2,'0') + 'm ' + String(s).padStart(2,'0') + 's';
}
setInterval(updateCountdown, 1000);
updateCountdown();

// ── Toast ──────────────────────────────────────────────────────────────────────
let toastTimer;
function showToast(msg, type='') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'show ' + type;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.className = ''; }, 3000);
}

// ── API ────────────────────────────────────────────────────────────────────────
async function apiFetch(path, opts) {
  const res = await fetch(path, opts);
  if (!res.ok) {
    const j = await res.json().catch(() => ({}));
    throw new Error(j.error || ('HTTP ' + res.status));
  }
  return res.json();
}

async function loadPredictionsList() {
  try {
    const data = await apiFetch('/api/brackets');
    renderPredictionsList(data.brackets || []);
  } catch(e) {}
}

async function loadBracket(email) {
  return apiFetch('/api/brackets/' + encodeURIComponent(email));
}

async function saveBracket(lock = false) {
  const body = {
    display_name: state.name,
    bracket_data: JSON.stringify({ groups: state.groups, knockout: state.knockout, predicted3rd: state.predicted3rd }),
    lock,
  };
  return apiFetch('/api/brackets/' + encodeURIComponent(state.email), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

// ── Load / login ───────────────────────────────────────────────────────────────
document.getElementById('btn-load').addEventListener('click', async () => {
  const name = document.getElementById('input-name').value.trim();
  const email = document.getElementById('input-email').value.trim().toLowerCase();
  const errEl = document.getElementById('load-error');
  errEl.style.display = 'none';
  if (!name) { errEl.textContent = 'Please enter your name.'; errEl.style.display = 'block'; return; }
  if (!email || !email.includes('@')) { errEl.textContent = 'Please enter a valid email.'; errEl.style.display = 'block'; return; }

  // Reset all state cleanly before loading — important when switching from viewing mode
  state.name = name;
  state.email = email;
  state.isViewing = false;
  state.viewingName = '';
  state.locked = false;
  state.bracketLoaded = false;
  state.knockout = {};
  state.predicted3rd = {};
  Object.entries(GROUPS_DATA).forEach(([g, teams]) => {
    state.groups[g] = teams.map(t => t.name);
  });
  document.getElementById('viewing-banner').style.display = 'none';
  document.querySelectorAll('.prediction-item').forEach(el => el.classList.remove('active'));

  const btn = document.getElementById('btn-load');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Loading...';

  try {
    const data = await loadBracket(email);
    // Existing bracket found
    const bd = JSON.parse(data.bracket.bracket_data);
    if (bd.groups) state.groups = bd.groups;
    if (bd.knockout) state.knockout = bd.knockout;
    if (bd.predicted3rd) state.predicted3rd = bd.predicted3rd;
    state.locked = !!data.bracket.locked;
    state.bracketLoaded = true;
    showToast(state.locked ? '🔒 Your bracket is locked.' : '✅ Bracket loaded!', 'success');
  } catch(e) {
    // New bracket — use defaults
    state.bracketLoaded = true;
    if (e.message.includes('404') || e.message.includes('Not found')) {
      showToast('New bracket started for ' + name + '! Fill in your picks below.', 'success');
    } else {
      showToast('Could not load bracket: ' + e.message, 'error');
    }
  }

  btn.disabled = false;
  btn.textContent = 'Load / New Bracket';
  showBracketContent();
  renderAll();
  loadPredictionsList();
  // Load golden boot pick
  apiFetch('/api/golden-boot?email=' + encodeURIComponent(email)).then(d => {
    if (d.player_name) {
      gbCurrentPick = d.player_name;
      const inp = /** @type {HTMLInputElement} */ (document.getElementById('gb-input'));
      if (inp) inp.value = gbCurrentPick;
      updateGbDisplay();
    }
  }).catch(() => {});
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ── View others ────────────────────────────────────────────────────────────────
async function viewBracket(email, displayName) {
  try {
    const data = await apiFetch('/api/brackets/' + encodeURIComponent(email));
    const bd = JSON.parse(data.bracket.bracket_data);
    const savedGroups = bd.groups || {};
    const savedKnockout = bd.knockout || {};
    const savedLocked = !!data.bracket.locked;

    // Temporarily override state for rendering
    state.isViewing = true;
    state.viewingName = displayName;
    // swap in their data
    state.groups = Object.keys(GROUPS_DATA).reduce((acc, g) => {
      acc[g] = savedGroups[g] || GROUPS_DATA[g].map(t => t.name);
      return acc;
    }, {});
    state.knockout = savedKnockout;
    state.predicted3rd = bd.predicted3rd || {};
    state.locked = savedLocked;

    document.getElementById('viewing-banner').style.display = 'flex';
    document.getElementById('viewing-text').textContent = 'Viewing ' + displayName + '\u2019s bracket' + (savedLocked ? ' 🔒' : '');

    document.querySelectorAll('.prediction-item').forEach(el => el.classList.remove('active'));
    const match = [...document.querySelectorAll('.prediction-item')].find(el => el.dataset.email === email);
    if (match) match.classList.add('active');

    showBracketContent();
    renderAll();
  } catch(e) {
    showToast('Could not load bracket: ' + e.message, 'error');
  }
}

function stopViewing() {
  state.isViewing = false;
  state.viewingName = '';
  // Always reset lock + groups to defaults first — never inherit viewed person's state
  state.locked = false;
  state.knockout = {};
  state.predicted3rd = {};
  Object.entries(GROUPS_DATA).forEach(([g, teams]) => {
    state.groups[g] = teams.map(t => t.name);
  });
  document.getElementById('viewing-banner').style.display = 'none';
  document.querySelectorAll('.prediction-item').forEach(el => el.classList.remove('active'));

  if (state.email && state.bracketLoaded) {
    // Reload own saved bracket from server
    loadBracket(state.email).then(data => {
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
    // Not logged in — just go back to placeholder
    state.bracketLoaded = false;
    document.getElementById('bracket-content').style.display = 'none';
    document.getElementById('pre-login-placeholder').style.display = 'flex';
    renderAll();
  }
}

// ── Render predictions list ────────────────────────────────────────────────────
function renderPredictionsList(brackets) {
  const el = document.getElementById('predictions-list');
  if (!brackets.length) { el.innerHTML = '<div style="color:var(--grey);font-size:0.8rem;">No predictions yet. Be first!</div>'; return; }
  el.innerHTML = brackets.map(b => {
    const ago = timeAgo(b.updated_at);
    const avatar = (b.display_name || '?')[0].toUpperCase();
    const isLocked = !!b.locked;
    return \`<div class="prediction-item" data-email="\${escHtml(b.email)}" onclick="viewBracket('\${escJs(b.email)}', '\${escJs(b.display_name)}')">
      <div class="prediction-avatar">\${escHtml(avatar)}</div>
      <div class="prediction-info">
        <div class="prediction-name">\${escHtml(b.display_name)}</div>
        <div class="prediction-time">\${ago}</div>
      </div>
      \${isLocked ? '<span class="lock-badge locked-personal">🔒 Locked</span>' : '<span class="lock-badge">Draft</span>'}
    </div>\`;
  }).join('');
}

// ── Render save bar ────────────────────────────────────────────────────────────
function renderSaveBar() {
  const bar = document.getElementById('save-bar-inner');
  const hasUser = !!state.email && state.bracketLoaded;

  if (state.isViewing) {
    bar.innerHTML = '<div class="locked-banner">👁\uFE0F Viewing another person\u2019s bracket</div>';
    return;
  }
  if (state.locked) {
    bar.innerHTML = '<div class="locked-banner">🔒 Your picks are permanently locked</div>';
    return;
  }
  if (isPastDeadline()) {
    bar.innerHTML = '<div class="locked-banner">🔒 Picks are locked — Tournament has started!</div>';
    return;
  }
  const allDone = hasUser && isBracketComplete();
  const missingCount = hasUser ? countMissingPicks() : 0;
  const confirmTitle = allDone ? '' : (missingCount > 0 ? 'You still have ' + missingCount + ' pick' + (missingCount > 1 ? 's' : '') + ' remaining' : 'Complete your bracket first');
  bar.innerHTML = \`
    <button class="auto-btn" id="btn-auto" \${hasUser ? '' : 'disabled'} title="Randomly fill all remaining picks">🎲 Auto-Pick</button>
    <button class="save-main-btn" id="btn-save" \${hasUser ? '' : 'disabled'}>💾 Save Draft</button>
    <button class="confirm-btn" id="btn-confirm" \${allDone ? '' : 'disabled'} title="\${confirmTitle}">\${allDone ? '✅' : '🔒'} Confirm &amp; Lock</button>
  \`;
  document.getElementById('btn-auto')?.addEventListener('click', autoPickAll);
  document.getElementById('btn-save')?.addEventListener('click', handleSave);
  document.getElementById('btn-confirm')?.addEventListener('click', () => allDone && openModal());
}

// ── Group stage rendering & drag ───────────────────────────────────────────────
function getFlagForTeam(name) {
  for (const teams of Object.values(GROUPS_DATA)) {
    const t = teams.find(t => t.name === name);
    if (t) return t.flag;
  }
  return '🏳';
}

// ── Toggle rules explainer ──────────────────────────────────────────────────────
function toggleRules() {
  const body = document.getElementById('rules-body');
  const btn  = document.getElementById('rules-toggle-btn');
  if (!body || !btn) return;
  const open = body.style.display !== 'none';
  body.style.display = open ? 'none' : 'block';
  btn.textContent = (open ? '\u2139\uFE0F How does this work?' : '\u2716 Close explanation');
}

// ── 3rd place qualifier section ────────────────────────────────────────────────
// R32_SEEDS entries that have {third} — precomputed for rendering
function getThirdSlots() {
  const slots = [];
  for (let i = 0; i < R32_SEEDS.length; i++) {
    for (let s = 0; s < 2; s++) {
      const seed = R32_SEEDS[i][s];
      if (seed && seed.third) {
        // Build opponent label from the other slot
        const other = R32_SEEDS[i][1 - s];
        const opponentLabel = other.third
          ? 'Best 3rd Place'
          : ('Winner Group ' + other.g + (other.p === 1 ? ' Runner-up' : ''));
        slots.push({ matchIdx: i, slotIdx: s, groups: seed.third, opponentLabel });
      }
    }
  }
  return slots;
}

function renderThirdPlaceSection() {
  const grid = document.getElementById('third-grid');
  if (!grid) return;
  const ro = isReadOnly();
  const slots = getThirdSlots();

  // Build set of all teams already picked across all slots (for duplicate prevention)
  const usedTeams = new Set(Object.values(state.predicted3rd).filter(Boolean));

  grid.innerHTML = slots.map(({ matchIdx, slotIdx, groups, opponentLabel }) => {
    const key = matchIdx + '_' + slotIdx;
    const picked = state.predicted3rd[key] || '';

    const opponentHtml = \`<span class="third-slot-opponent">vs <span class="third-slot-vs"></span>\${escHtml(opponentLabel)}</span>\`;

    let pickHtml;
    if (ro) {
      pickHtml = picked
        ? \`<div class="third-slot-picked">\${getFlagForTeam(picked)} \${escHtml(picked)}</div>\`
        : \`<div style="color:var(--grey);font-size:0.78rem;font-style:italic;">Not picked</div>\`;
    } else {
      const options = groups.map(g => {
        const team3 = (state.groups[g] || [])[2];
        if (!team3) return '';
        // Only disable (not hide) teams already used in another slot — user can see why
        const usedElsewhere = usedTeams.has(team3) && team3 !== picked;
        const sel = picked === team3 ? ' selected' : '';
        const dis = usedElsewhere ? ' disabled' : '';
        const label = usedElsewhere
          ? \`\${getFlagForTeam(team3)} \${escHtml(team3)} (already picked)\`
          : \`\${getFlagForTeam(team3)} \${escHtml(team3)} (3rd, Group \${g})\`;
        return \`<option value="\${escHtml(team3)}"\${sel}\${dis}>\${label}</option>\`;
      }).filter(Boolean).join('');
      pickHtml = \`<select class="third-slot-pick" onchange="pick3rd(\${matchIdx},\${slotIdx},this.value)">
        <option value="">— Pick a team —</option>
        \${options}
      </select>\`;
    }

    return \`<div class="third-slot\${picked ? ' third-slot--done' : ''}">
      <div class="third-slot-label">Match \${matchIdx + 73} \u00b7 Groups \${groups.join('/')}</div>
      \${opponentHtml}
      \${pickHtml}
    </div>\`;
  }).join('');
}

function renderGroups() {
  const grid = document.getElementById('groups-grid');
  const ro = isReadOnly();
  grid.innerHTML = Object.entries(GROUPS_DATA).map(([group, _]) => {
    const order = state.groups[group] || GROUPS_DATA[group].map(t => t.name);
    return \`<div class="group-card" data-group="\${group}">
      <div class="group-card-header">Group \${group}</div>
      <div class="group-teams" data-group="\${group}">
        \${order.map((name, i) => \`
          <div class="team-row\${ro ? ' readonly' : ''}" \${!ro ? 'draggable="true"' : ''} data-group="\${group}" data-team="\${escHtml(name)}">
            <div class="rank-badge rank-\${i+1}">\${i+1}</div>
            <div class="team-flag">\${getFlagForTeam(name)}</div>
            <div class="team-name">\${escHtml(name)}</div>
            \${ro ? '' : \`<div class="move-btns">
              \${i > 0 ? \`<button class="move-btn" onclick="moveTeam(event,'\${escJs(group)}','\${escJs(name)}',-1)" aria-label="Move up">▲</button>\` : '<span class="move-btn-placeholder"></span>'}
              \${i < order.length-1 ? \`<button class="move-btn" onclick="moveTeam(event,'\${escJs(group)}','\${escJs(name)}',1)" aria-label="Move down">▼</button>\` : '<span class="move-btn-placeholder"></span>'}
            </div>\`}
          </div>
        \`).join('')}
      </div>
    </div>\`;
  }).join('');

  if (!ro) setupMouseDrag();
}

function moveTeam(e, group, name, dir) {
  e.stopPropagation();
  const order = state.groups[group];
  const idx = order.indexOf(name);
  const newIdx = idx + dir;
  if (newIdx < 0 || newIdx >= order.length) return;
  order.splice(idx, 1);
  order.splice(newIdx, 0, name);
  state.groups[group] = order;
  state.knockout = {};
  renderAll();
}

// ── Mouse drag-and-drop (desktop only) ────────────────────────────────────────
let dragSrc = null;

function setupMouseDrag() {
  document.querySelectorAll('.team-row[draggable]').forEach(row => {
    row.addEventListener('dragstart', e => {
      dragSrc = row;
      row.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
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
      const group = row.dataset.group;
      const order = state.groups[group];
      const fromIdx = order.indexOf(dragSrc.dataset.team);
      const toIdx = order.indexOf(row.dataset.team);
      if (fromIdx === -1 || toIdx === -1 || fromIdx === toIdx) return;
      order.splice(fromIdx, 1);
      order.splice(toIdx, 0, dragSrc.dataset.team);
      state.groups[group] = order;
      state.knockout = {};
      renderAll();
    });
  });
}

// ── Knockout bracket ───────────────────────────────────────────────────────────
// 2026 WC: R32 (16 matches) → R16 (8) → QF (4) → SF (2) → Final (1) → Champion
// Seeding per official bracket (simplified — use group positions as seeds)
function getGroupTeam(group, pos) {
  // pos 0 = 1st, 1 = 2nd, 2 = 3rd
  return state.groups[group]?.[pos] || null;
}

// Official R32 pairings (simplified using group winner/runner-up)
// Official FIFA 2026 World Cup Round of 32 matchups (matches 73-88).
// {g, p} = group/position (p:0=winner, p:1=runner-up).
// {third: [...groups]} = best 3rd-place team from those groups — user predicts which team.
// Source: https://en.wikipedia.org/wiki/2026_FIFA_World_Cup_knockout_stage
const R32_SEEDS = [
  [{g:'A',p:1}, {g:'B',p:1}],                          // M73
  [{g:'E',p:0}, {third:['A','B','C','D','F']}],         // M74
  [{g:'F',p:0}, {g:'C',p:1}],                          // M75
  [{g:'C',p:0}, {g:'F',p:1}],                          // M76
  [{g:'I',p:0}, {third:['C','D','F','G','H']}],         // M77
  [{g:'E',p:1}, {g:'I',p:1}],                          // M78
  [{g:'A',p:0}, {third:['C','E','F','H','I']}],         // M79
  [{g:'L',p:0}, {third:['E','H','I','J','K']}],         // M80
  [{g:'D',p:0}, {third:['B','E','F','I','J']}],         // M81
  [{g:'G',p:0}, {third:['A','E','H','I','J']}],         // M82
  [{g:'K',p:1}, {g:'L',p:1}],                          // M83
  [{g:'H',p:0}, {g:'J',p:1}],                          // M84
  [{g:'B',p:0}, {third:['E','F','G','I','J']}],         // M85
  [{g:'J',p:0}, {g:'H',p:1}],                          // M86
  [{g:'K',p:0}, {third:['D','E','I','J','L']}],         // M87
  [{g:'D',p:1}, {g:'G',p:1}],                          // M88
];

// Returns team name, or null if not yet determined.
// For {third} R32 slots: returns the user's predicted team or null if not yet picked.
function getKnockoutTeam(round, matchIdx, slot) {
  if (round === 'r32') {
    const seed = R32_SEEDS[matchIdx]?.[slot];
    if (!seed) return null;
    if (seed.third) {
      // User picks which 3rd-place team they predict will qualify here
      return state.predicted3rd[matchIdx + '_' + slot] || null;
    }
    return getGroupTeam(seed.g, seed.p);
  }
  const prevRound = { r16: 'r32', qf: 'r16', sf: 'qf', final: 'sf' }[round];
  const prevMatchIdx = matchIdx * 2 + slot;
  return state.knockout[prevRound + '_' + prevMatchIdx] || null;
}

// Returns the {third} seed definition for an R32 slot, or null
function getThirdSeed(matchIdx, slot) {
  const seed = R32_SEEDS[matchIdx]?.[slot];
  return seed?.third ? seed : null;
}

function renderBracket() {
  const bracket = document.getElementById('bracket');
  const rounds = [
    { key: 'r32', label: 'Round of 32', count: 16 },
    { key: 'r16', label: 'Round of 16', count: 8 },
    { key: 'qf', label: 'Quarter-Finals', count: 4 },
    { key: 'sf', label: 'Semi-Finals', count: 2 },
    { key: 'final', label: 'Final', count: 1 },
  ];

  const ro = isReadOnly();

  bracket.innerHTML = rounds.map(({ key, label, count }) => {
    const matches = [];
    for (let i = 0; i < count; i++) {
      const t1 = getKnockoutTeam(key, i, 0);
      const t2 = getKnockoutTeam(key, i, 1);
      const winner = state.knockout[key + '_' + i] || null;

      const teamHtml = (team, slotIdx) => {
        // 3rd-place slot: team is null until user picks in section 1.5
        if (key === 'r32' && getThirdSeed(i, slotIdx)) {
          if (!team) {
            return \`<div class="match-team empty" title="Pick this team in section 1.5 above">3rd Place \u2191</div>\`;
          }
          // Team is resolved — render as normal clickable cell
          const isWinner = winner === team;
          const f = getFlagForTeam(team);
          const clickable = !ro && t1 && t2;
          return \`<div class="match-team\${isWinner ? ' winner' : ''}\${!clickable ? ' readonly' : ''}"
            \${clickable ? \`onclick="pickWinner('\${key}',\${i},'\${escJs(team)}')"\` : ''}>
            \${f} \${escHtml(team)}
          </div>\`;
        }
        if (!team) return \`<div class="match-team empty">TBD</div>\`;
        const isWinner = winner === team;
        const f = getFlagForTeam(team);
        const clickable = !ro && t1 && t2;
        return \`<div class="match-team\${isWinner ? ' winner' : ''}\${!clickable ? ' readonly' : ''}"
          \${clickable ? \`onclick="pickWinner('\${key}',\${i},'\${escJs(team)}')"\` : ''}>
          \${f} \${escHtml(team)}
        </div>\`;
      };

      const consensusBadge = state.isViewing ? '' : getConsensusBadge(key, i);
      matches.push(\`<div class="bracket-match">
        \${teamHtml(t1, 0)}
        <div class="match-separator"></div>
        \${teamHtml(t2, 1)}
        \${consensusBadge}
      </div>\`);
    }

    return \`<div class="bracket-round">
      <div class="round-label">\${label}</div>
      <div class="bracket-matches">\${matches.join('')}</div>
    </div>\`;
  }).join('');

  // Champion slot
  const champion = state.knockout['final_0'] || null;
  const champHtml = \`<div class="bracket-round" style="min-width:160px">
    <div class="round-label">Champion</div>
    <div class="bracket-matches">
      <div class="champion-slot">
        <span class="champion-trophy">🏆</span>
        <div class="champion-name">\${champion ? escHtml(getFlagForTeam(champion) + ' ' + champion) : '?'}</div>
        <div class="champion-label">World Cup 2026 Champions</div>
      </div>
    </div>
  </div>\`;
  bracket.innerHTML += champHtml;
}

function pickWinner(round, matchIdx, team) {
  if (isReadOnly()) return;
  state.knockout[round + '_' + matchIdx] = team;
  clearDownstream(round, matchIdx);
  renderAll();
}

function pick3rd(matchIdx, slotIdx, team) {
  if (isReadOnly()) return;
  const key = matchIdx + '_' + slotIdx;
  if (team) {
    state.predicted3rd[key] = team;
  } else {
    delete state.predicted3rd[key];
  }
  // Clear any knockout pick that depended on this slot
  const prevKnockoutKey = 'r32_' + matchIdx;
  if (state.knockout[prevKnockoutKey]) {
    delete state.knockout[prevKnockoutKey];
    clearDownstream('r32', matchIdx);
  }
  renderAll();
}

function clearDownstream(round, matchIdx) {
  const next = { r32: 'r16', r16: 'qf', qf: 'sf', sf: 'final' };
  const nextRound = next[round];
  if (!nextRound) return;
  const nextMatch = Math.floor(matchIdx / 2);
  // Check if the team in next round was dependent on this match
  const nextWinner = state.knockout[nextRound + '_' + nextMatch];
  const t0 = getKnockoutTeam(round, matchIdx, 0);
  const t1 = getKnockoutTeam(round, matchIdx, 1);
  if (nextWinner && (nextWinner === t0 || nextWinner === t1)) {
    // Only clear if it's a team that's no longer valid
    delete state.knockout[nextRound + '_' + nextMatch];
    clearDownstream(nextRound, nextMatch);
  }
}

// ── Bracket completeness ───────────────────────────────────────────────────────
const ROUND_COUNTS = { r32: 16, r16: 8, qf: 4, sf: 2, final: 1 };

function isBracketComplete() {
  return countMissingPicks() === 0;
}

function countMissingPicks() {
  let missing = 0;
  // Count unpicked 3rd-place slots in R32
  for (let i = 0; i < 16; i++) {
    for (let s = 0; s < 2; s++) {
      const seed = R32_SEEDS[i]?.[s];
      if (seed?.third && !state.predicted3rd[i + '_' + s]) missing++;
    }
  }
  // Count unpicked match winners (only when both teams are resolved)
  for (const [round, count] of Object.entries(ROUND_COUNTS)) {
    for (let i = 0; i < count; i++) {
      const t1 = getKnockoutTeam(round, i, 0);
      const t2 = getKnockoutTeam(round, i, 1);
      if (t1 && t2 && !state.knockout[round + '_' + i]) missing++;
    }
  }
  return missing;
}

// ── Auto-pick ──────────────────────────────────────────────────────────────────
function autoPickAll() {
  if (isReadOnly()) return;
  // First, fill any unpicked 3rd-place slots
  for (let i = 0; i < 16; i++) {
    for (let s = 0; s < 2; s++) {
      const seed = R32_SEEDS[i]?.[s];
      if (!seed?.third) continue;
      const key = i + '_' + s;
      if (state.predicted3rd[key]) continue;
      const candidates = seed.third.map(g => (state.groups[g] || [])[2]).filter(Boolean);
      if (candidates.length) state.predicted3rd[key] = candidates[Math.floor(Math.random() * candidates.length)];
    }
  }
  // Then fill match winners round by round
  for (const round of ['r32', 'r16', 'qf', 'sf', 'final']) {
    const count = ROUND_COUNTS[round];
    for (let i = 0; i < count; i++) {
      if (state.knockout[round + '_' + i]) continue;
      const t1 = getKnockoutTeam(round, i, 0);
      const t2 = getKnockoutTeam(round, i, 1);
      if (t1 && t2) state.knockout[round + '_' + i] = Math.random() < 0.5 ? t1 : t2;
    }
  }
  renderAll();
  showToast('🎲 All picks filled randomly — review and save!', 'success');
}

// ── Save / confirm ─────────────────────────────────────────────────────────────
async function handleSave() {
  if (!state.email || !state.bracketLoaded) return;
  const btn = document.getElementById('btn-save');
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Saving...'; }
  try {
    await saveBracket(false);
    showToast('✅ Draft saved!', 'success');
    loadPredictionsList();
  } catch(e) {
    showToast('❌ ' + e.message, 'error');
  }
  renderSaveBar();
}

function openModal() {
  document.getElementById('confirm-modal').classList.add('open');
}
function closeModal() {
  document.getElementById('confirm-modal').classList.remove('open');
}
async function confirmLock() {
  closeModal();
  try {
    await saveBracket(true);
    state.locked = true;
    showToast('🔒 Picks locked permanently!', 'success');
    renderAll();
    loadPredictionsList();
  } catch(e) {
    showToast('❌ ' + e.message, 'error');
  }
}

// ── Show / hide bracket content ────────────────────────────────────────────────
function showBracketContent() {
  document.getElementById('pre-login-placeholder').style.display = 'none';
  document.getElementById('bracket-content').style.display = 'block';
}

function updateGroupStageVisibility() {
  const groupSection = document.getElementById('group-stage-section');
  const thirdSection = document.getElementById('third-place-section');
  const knockoutNum = document.getElementById('knockout-num');
  const knockoutSubtitle = document.getElementById('knockout-subtitle');
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
      const total = 39; // 8 third-place picks + 16+8+4+2+1 match picks
      const done = total - missing;
      knockoutSubtitle.innerHTML = missing === 0
        ? '\u2705 All ' + total + ' picks made \u2014 ready to confirm!'
        : 'Click a team in each match to advance them. <span style="color:var(--gold);font-weight:700;">' + done + '/' + total + ' picks made</span>' + (missing > 0 ? ' \u2014 <span style="color:#f87171;">' + missing + ' remaining</span>' : '');
    } else {
      knockoutSubtitle.textContent = 'Click a team in each match to advance them to the next round.';
    }
  }
}

// ── Render all ─────────────────────────────────────────────────────────────────
function renderAll() {
  updateGroupStageVisibility();
  renderGroups();
  renderThirdPlaceSection();
  renderBracket();
  renderSaveBar();
  renderTicker();
  updateGbDisplay();
  if (!consensusData) {
    loadConsensus().then(() => { if (consensusData) renderBracket(); });
  }
}

// ── Utils ──────────────────────────────────────────────────────────────────────
function escHtml(s) {
  const amp = '&' + 'amp;', lt = '&' + 'lt;', gt = '&' + 'gt;', quot = '&' + 'quot;';
  return String(s).replace(/&/g, amp).replace(/</g, lt).replace(/>/g, gt).replace(/"/g, quot);
}
function escJs(s) {
  return String(s).replace(/\\\\/g,'\\\\\\\\').replace(/'/g,"\\\\'").replace(/"/g,'\\\\"');
}
function timeAgo(ts) {
  const diff = Date.now() - ts;
  if (diff < 60000) return 'just now';
  if (diff < 3600000) return Math.floor(diff/60000) + 'm ago';
  if (diff < 86400000) return Math.floor(diff/3600000) + 'h ago';
  return Math.floor(diff/86400000) + 'd ago';
}

// ── Score ticker ─────────────────────────────────────────────────────────────
function renderTicker() {
  const ticker = document.getElementById('score-ticker');
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayMatches = SCHEDULE.filter(m => m[1] === todayStr);
  if (!todayMatches.length) { ticker.style.display = 'none'; return; }

  const items = todayMatches.map(m => {
    const live = getLiveTeams(m[0]);
    const t1 = live ? live.home : m[3];
    const t2 = live ? live.away : m[4];
    const f1 = getFlagForTeam(t1 || '');
    const f2 = getFlagForTeam(t2 || '');
    const status = live ? live.status : 'TIMED';
    const isLive = status === 'IN_PLAY' || status === 'PAUSED' || status === 'HALFTIME';
    const isDone = status === 'FINISHED';
    const scoreStr = (live && live.homeScore !== null) ? \`\${live.homeScore}–\${live.awayScore}\` : formatMatchTime(m[1], m[2]);
    const statusLabel = isLive ? 'Live' : isDone ? 'Full time' : formatMatchTime(m[1], m[2]) + ' ET';
    return \`<div class="ticker-item\${isLive ? ' live' : isDone ? ' done' : ''}">
      <div class="ticker-teams">\${f1} \${escHtml((t1||'TBD').slice(0,10))} v \${escHtml((t2||'TBD').slice(0,10))} \${f2}</div>
      <div class="ticker-score">\${isDone || isLive ? escHtml(scoreStr) : '–'}</div>
      <div class="ticker-status\${isLive ? ' live-dot' : ''}">\${escHtml(statusLabel)}</div>
    </div>\`;
  }).join('');

  ticker.innerHTML = items;
  ticker.style.display = 'flex';
}

// ── Consensus ────────────────────────────────────────────────────────────────
let consensusData = null; // { total_players, picks }

async function loadConsensus() {
  if (consensusData) return;
  try {
    consensusData = await apiFetch('/api/consensus');
  } catch(e) { /* non-fatal */ }
}

function getConsensusBadge(roundKey, matchIdx) {
  if (!consensusData) return '';
  const key = roundKey + '_' + matchIdx;
  const picks = consensusData.picks[key];
  const total = consensusData.total_players;
  if (!picks || !total) return '';
  const topTeam = Object.entries(picks).sort((a,b) => b[1] - a[1])[0];
  if (!topTeam) return '';
  const [team, cnt] = topTeam;
  const flag = getFlagForTeam(team);
  return \`<div class="consensus-badge">\${flag} \${escHtml(team)} · \${cnt}/\${total} picked</div>\`;
}

// ── Leaderboard ───────────────────────────────────────────────────────────────
let lbPollTimer = null;
let lbData = null;

async function fetchLeaderboard() {
  try {
    lbData = await apiFetch('/api/leaderboard');
    renderLeaderboard();
  } catch(e) {
    document.getElementById('leaderboard-content').innerHTML =
      \`<div class="lb-empty">Could not load leaderboard. Try again shortly.</div>\`;
  }
}

function startLeaderboard() {
  fetchLeaderboard();
  lbPollTimer = setInterval(fetchLeaderboard, 2 * 60 * 1000); // every 2 min
}

function stopLeaderboard() {
  if (lbPollTimer) { clearInterval(lbPollTimer); lbPollTimer = null; }
}

const ROUND_LABELS_SHORT = { r32: 'R32', r16: 'R16', qf: 'QF', sf: 'SF', final: 'Final' };

function renderLeaderboard() {
  const container = document.getElementById('leaderboard-content');
  if (!lbData) return;

  const { leaderboard, has_any_finished, updated_at } = lbData;

  // Sync golden boot pick from leaderboard data
  const meEntry = leaderboard.find(e => e.email === state.email);
  if (meEntry && meEntry.golden_boot_pick && !gbCurrentPick) {
    gbCurrentPick = meEntry.golden_boot_pick;
    const inp = /** @type {HTMLInputElement} */ (document.getElementById('gb-input'));
    if (inp) inp.value = gbCurrentPick;
    updateGbDisplay();
  }
  const ago = Math.round((Date.now() - updated_at) / 60000);
  const agoText = ago < 1 ? 'just now' : ago + ' min ago';

  if (!has_any_finished) {
    container.innerHTML = \`
      <div class="lb-meta">
        <span>Updated \${escHtml(agoText)}</span>
        <button class="lb-refresh-btn" onclick="fetchLeaderboard()">↻ Refresh</button>
      </div>
      <div class="lb-empty">
        ⚽ The tournament is underway!<br>Check back once the first match finishes to see rankings.
      </div>\`;
    return;
  }

  const rankIcon = r => r === 1 ? '🥇' : r === 2 ? '🥈' : r === 3 ? '🥉' : r;
  const meEmail = state.email || '';

  const rows = leaderboard.map(e => {
    const isMe = e.email === meEmail;
    const rankClass = e.rank <= 3 ? \` rank-\${e.rank}\` : '';
    const gbBadge = e.golden_boot_pick ? \`<span style="font-size:0.65rem;color:var(--grey)">⚽ \${escHtml(e.golden_boot_pick)}</span>\` : '';
    const compareBtn = !isMe && meEmail ? \`<button class="btn-h2h" onclick="event.stopPropagation();openH2H('\${escJs(e.email)}','\${escJs(e.display_name)}')" title="Compare brackets">⚔️</button>\` : '';
    return \`<div class="lb-row\${isMe ? ' lb-me' : ''}" onclick="loadOtherBracketFromEmail('\${escJs(e.email)}','\${escJs(e.display_name)}')">
      <div class="lb-rank\${rankClass}">\${rankIcon(e.rank)}</div>
      <div style="flex:1;min-width:0">
        <div class="lb-name">\${escHtml(e.display_name)} \${isMe ? '<span class="lb-you-badge">YOU</span>' : ''}</div>
        <div class="lb-detail">\${e.correct_knockout} correct knock. picks\${e.group_score ? ' · ' + e.group_score + ' group pts' : ''}</div>
        \${gbBadge}
      </div>
      <div style="text-align:right;display:flex;flex-direction:column;align-items:flex-end;gap:4px">
        <div class="lb-score">\${e.score} pts</div>
        \${compareBtn}
      </div>
    </div>\`;
  }).join('');

  // My picks breakdown
  let myPicksHtml = '';
  const me = leaderboard.find(e => e.email === meEmail);
  if (me && me.picks.length) {
    const pickRows = me.picks.map(p => {
      const icon = p.correct === true ? '✅' : p.correct === false ? '❌' : '⏳';
      const cls = p.correct === true ? 'pick-correct' : p.correct === false ? 'pick-wrong' : '';
      const actualText = p.correct === false && p.actual ? \` → actually \${escHtml(getFlagForTeam(p.actual))} \${escHtml(p.actual)}\` : '';
      return \`<div class="pick-row \${cls}">
        <span class="pick-icon">\${icon}</span>
        <span class="pick-round">\${escHtml(ROUND_LABELS_SHORT[p.round] || p.round)}</span>
        <span class="pick-team">\${escHtml(getFlagForTeam(p.predicted))} \${escHtml(p.predicted)}</span>
        <span class="pick-actual">\${actualText}</span>
      </div>\`;
    }).join('');
    const scorePickLine = me.score_pick_score > 0
      ? \`<div class="pick-row pick-correct"><span class="pick-icon">✅</span><span class="pick-round">SCORE</span><span class="pick-team">+\${me.score_pick_score} pts from score picks</span><span class="pick-actual"></span></div>\`
      : '';
    const gbLine = me.golden_boot_pick
      ? \`<div class="pick-row \${me.golden_boot_score > 0 ? 'pick-correct' : ''}">
          <span class="pick-icon">\${me.golden_boot_score > 0 ? '✅' : '⚽'}</span>
          <span class="pick-round">GB</span>
          <span class="pick-team">\${escHtml(me.golden_boot_pick)} \${me.golden_boot_score > 0 ? '(+5 pts!)' : ''}</span>
          <span class="pick-actual">\${lbData.actual_top_scorer && me.golden_boot_pick !== lbData.actual_top_scorer ? '→ currently ' + escHtml(lbData.actual_top_scorer) : ''}</span>
        </div>\`
      : '';
    myPicksHtml = \`<div class="my-picks-section">
      <div class="my-picks-title">Your picks breakdown</div>
      \${pickRows}
      \${scorePickLine}
      \${gbLine}
    </div>\`;
  }

  // Who called it — for each finished knockout match, find who predicted correctly
  let whoCalledHtml = '';
  if (lbData.has_any_finished) {
    const ROUND_NAMES_LB = { r32: 'R32', r16: 'R16', qf: 'QF', sf: 'SF', final: 'Final' };
    const ROUND_PTS_LB = { r32: 2, r16: 3, qf: 4, sf: 5, final: 8 };
    const ROUND_MATCH_NUMS_LB = { r32: [73,88], r16: [89,96], qf: [97,100], sf: [101,102], final: [104,104] };
    const calledItems = [];
    for (const entry of leaderboard) {
      for (const p of (entry.picks || [])) {
        if (p.correct !== true) continue;
        // Already captured by entry level — aggregate by pick key
      }
    }
    // Group by matchNum
    const matchCallers = {};
    for (const entry of leaderboard) {
      for (const p of (entry.picks || [])) {
        if (p.correct !== true) continue;
        if (!matchCallers[p.matchNum]) matchCallers[p.matchNum] = { round: p.round, predicted: p.predicted, names: [] };
        matchCallers[p.matchNum].names.push(entry.display_name);
      }
    }
    const calloutRows = Object.entries(matchCallers).sort((a,b)=>Number(b[0])-Number(a[0])).slice(0,8).map(([mn, info]) => {
      const { round, predicted, names } = /** @type {any} */ (info);
      const flag = getFlagForTeam(predicted);
      const pts = ROUND_PTS_LB[round] || 0;
      const nameStr = names.length <= 3 ? names.join(', ') : names.slice(0,3).join(', ') + ' +' + (names.length-3) + ' more';
      return \`<div class="who-called-row">🎉 \${escHtml(flag)} <strong>\${escHtml(predicted)}</strong> (Match \${mn} · \${escHtml(ROUND_NAMES_LB[round]||round)} · +\${pts} pts) — \${escHtml(nameStr)}</div>\`;
    }).join('');
    if (calloutRows) {
      whoCalledHtml = \`<div class="who-called-section"><div class="my-picks-title" style="margin-top:24px">Who called it?</div>\${calloutRows}</div>\`;
    }
  }

  // Shareable card button
  const shareBtn = \`<button class="lb-refresh-btn" onclick="copyStandings()" style="margin-left:8px">📋 Copy standings</button>\`;

  container.innerHTML = \`
    <div class="lb-meta">
      <span>Updated \${escHtml(agoText)}</span>
      <div style="display:flex;gap:6px">
        <button class="lb-refresh-btn" onclick="fetchLeaderboard()">↻ Refresh</button>
        \${shareBtn}
      </div>
    </div>
    \${rows}
    \${whoCalledHtml}
    \${myPicksHtml}\`;
}

function loadOtherBracketFromEmail(email, name) {
  switchTab('bracket');
  viewBracket(email, name);
}

async function openH2H(theirEmail, theirName) {
  const modal = document.getElementById('h2h-modal');
  const content = document.getElementById('h2h-content');
  const title = document.getElementById('h2h-title');
  modal.style.display = 'flex';
  title.textContent = 'You vs ' + theirName;
  content.innerHTML = '<div style="color:var(--grey);font-size:0.85rem;padding:12px 0">Loading...</div>';

  try {
    const [myData, theirData] = await Promise.all([
      apiFetch('/api/brackets/' + encodeURIComponent(state.email)),
      apiFetch('/api/brackets/' + encodeURIComponent(theirEmail)),
    ]);

    const myKo = JSON.parse(myData.bracket.bracket_data).knockout || {};
    const thKo = JSON.parse(theirData.bracket.bracket_data).knockout || {};

    const ROUNDS_H2H = [
      { key: 'r32',   label: 'Round of 32',   count: 16 },
      { key: 'r16',   label: 'Round of 16',   count: 8 },
      { key: 'qf',    label: 'Quarter-Finals', count: 4 },
      { key: 'sf',    label: 'Semi-Finals',   count: 2 },
      { key: 'final', label: 'Final',          count: 1 },
    ];

    let html = '<table class="h2h-table"><thead><tr><th>You</th><th>Round</th><th>' + escHtml(theirName) + '</th></tr></thead><tbody>';
    let agreeCount = 0, diffCount = 0;
    for (const { key, label, count } of ROUNDS_H2H) {
      html += \`<tr><td colspan="3" class="h2h-round-header">\${label}</td></tr>\`;
      for (let i = 0; i < count; i++) {
        const myPick = myKo[key + '_' + i] || '—';
        const thPick = thKo[key + '_' + i] || '—';
        const agree = myPick !== '—' && thPick !== '—' && myPick === thPick;
        const differ = myPick !== '—' && thPick !== '—' && myPick !== thPick;
        if (agree) agreeCount++;
        if (differ) diffCount++;
        const cls = agree ? 'h2h-agree' : differ ? 'h2h-diff' : '';
        const myF = getFlagForTeam(myPick);
        const thF = getFlagForTeam(thPick);
        html += \`<tr class="\${cls}">
          <td>\${myF ? myF + ' ' : ''}\${escHtml(myPick)}</td>
          <td class="h2h-match-name">\${agree ? '✓' : differ ? '⚡' : ''}</td>
          <td>\${thF ? thF + ' ' : ''}\${escHtml(thPick)}</td>
        </tr>\`;
      }
    }
    html += '</tbody></table>';
    html += \`<div style="margin-top:14px;font-size:0.8rem;color:var(--grey)">
      <span style="color:#4ade80">✓ \${agreeCount} in common</span> &nbsp;
      <span style="color:#fb923c">⚡ \${diffCount} different</span>
    </div>\`;
    content.innerHTML = html;
  } catch(e) {
    content.innerHTML = '<div style="color:#f87171;font-size:0.85rem">Could not load comparison: ' + escHtml(e.message) + '</div>';
  }
}

function closeH2H() {
  document.getElementById('h2h-modal').style.display = 'none';
}

function copyStandings() {
  if (!lbData || !lbData.leaderboard.length) { showToast('No standings yet', 'error'); return; }
  const dateStr = new Date().toLocaleDateString([], { month: 'short', day: 'numeric' });
  const rankEmoji = r => r === 1 ? '\uD83E\uDD47' : r === 2 ? '\uD83E\uDD48' : r === 3 ? '\uD83E\uDD49' : r + '.';
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

// ── Golden Boot ───────────────────────────────────────────────────────────────
const GB_PLAYERS = [
  'Kylian Mbappé','Lionel Messi','Erling Haaland','Vinicius Jr.','Neymar Jr.',
  'Harry Kane','Lamine Yamal','Bukayo Saka','Phil Foden','Jude Bellingham',
  'Robert Lewandowski','Mohamed Salah','Sadio Mané','Romelu Lukaku','Leroy Sané',
  'Karim Benzema','Antoine Griezmann','Olivier Giroud','Raheem Sterling','Marcus Rashford',
  'Richarlison','Raphinha','Rodrygo','Federico Valverde','Lautaro Martínez',
  'Paulo Dybala','Victor Osimhen','Riyad Mahrez','Hakim Ziyech','Achraf Hakimi',
  'Son Heung-min','Hwang Hee-chan','Takumi Minamino','Daichi Kamada','Ritsu Doan',
  'Gavi','Pedri','Dani Olmo','Álvaro Morata','Serge Gnabry',
  'Thomas Müller','Kai Havertz','Jamal Musiala','Ricardo Horta','Cristiano Ronaldo',
  'Rafael Leão','Diogo Jota','Bruno Fernandes','Memphis Depay','Cody Gakpo',
  'Xavi Simons','Denzel Dumfries','Wout Weghorst','Darwin Núñez','Luis Suárez',
  'Jonathan David','Alphonso Davies','Jonathan Osorio','Cyle Larin','Junior Hoilett',
  'Christian Pulisic','Timothy Weah','Gio Reyna','Folarin Balogun','Ricardo Pepi',
];

let gbCurrentPick = null;

function filterGbPlayers(q) {
  const box = document.getElementById('gb-suggestions');
  if (!q.trim()) { box.style.display = 'none'; return; }
  const results = GB_PLAYERS.filter(p => p.toLowerCase().includes(q.toLowerCase())).slice(0,8);
  if (!results.length) { box.style.display = 'none'; return; }
  box.innerHTML = results.map(p =>
    \`<div class="gb-option" onclick="selectGbPlayer('\${escJs(p)}')">\${escHtml(p)}</div>\`
  ).join('');
  box.style.display = 'block';
}

async function selectGbPlayer(name) {
  document.getElementById('gb-input').value = name;
  document.getElementById('gb-suggestions').style.display = 'none';
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
  } catch(e) { showToast('Could not save pick', 'error'); }
}

function updateGbDisplay() {
  const el = document.getElementById('gb-current');
  const section = document.getElementById('golden-boot-section');
  if (!section) return;
  if (!state.email || !state.bracketLoaded || state.isViewing) {
    section.style.display = 'none'; return;
  }
  section.style.display = 'block';
  if (gbCurrentPick) {
    const ro = isReadOnly();
    el.innerHTML = \`\uD83D\uDCC2 Your pick: <strong style="color:var(--gold)">\${escHtml(gbCurrentPick)}</strong>\${ro ? ' (locked)' : ''}\`;
    if (ro) {
      document.getElementById('gb-input').disabled = true;
    }
  } else {
    el.textContent = isReadOnly() ? 'No pick made before deadline' : 'Start typing to search for a player';
  }
}


// ── Tab switching ─────────────────────────────────────────────────────────────
function switchTab(tab) {
  const isBracket = tab === 'bracket';
  const isSchedule = tab === 'schedule';
  const isLeaderboard = tab === 'leaderboard';
  const loaded = state.bracketLoaded;

  document.getElementById('bracket-content').style.display = (isBracket && loaded) ? 'block' : 'none';
  document.getElementById('pre-login-placeholder').style.display = (isBracket && !loaded) ? 'flex' : 'none';
  document.getElementById('schedule-panel').style.display = isSchedule ? 'block' : 'none';
  document.getElementById('leaderboard-panel').style.display = isLeaderboard ? 'block' : 'none';
  document.getElementById('tab-bracket').classList.toggle('tab-active', isBracket);
  document.getElementById('tab-schedule').classList.toggle('tab-active', isSchedule);
  document.getElementById('tab-leaderboard').classList.toggle('tab-active', isLeaderboard);

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

// ── Schedule data (all 104 matches, times in ET = UTC-4 during tournament) ───
// Format: [matchId, dateISO, timeET, team1, team2, group, venue, city]
// group is null for knockout matches
const SCHEDULE = [
  [1,'2026-06-11','15:00','Mexico','South Africa','A','Estadio Azteca','Mexico City'],
  [2,'2026-06-11','22:00','South Korea','Czechia','A','Estadio Akron','Guadalajara'],
  [3,'2026-06-12','15:00','Canada','Bosnia & Herz.','B','BMO Field','Toronto'],
  [4,'2026-06-12','21:00','USA','Paraguay','D','SoFi Stadium','Los Angeles'],
  [5,'2026-06-13','21:00','Haiti','Scotland','C','Gillette Stadium','Boston'],
  [6,'2026-06-13','00:00','Australia','Türkiye','D','BC Place','Vancouver'],
  [7,'2026-06-13','18:00','Brazil','Morocco','C','MetLife Stadium','New York/NJ'],
  [8,'2026-06-13','15:00','Qatar','Switzerland','B','Levi\u2019s Stadium','San Francisco'],
  [9,'2026-06-14','19:00','Ivory Coast','Ecuador','E','Lincoln Financial','Philadelphia'],
  [10,'2026-06-14','13:00','Germany','Curaçao','E','NRG Stadium','Houston'],
  [11,'2026-06-14','16:00','Netherlands','Japan','F','AT&T Stadium','Dallas'],
  [12,'2026-06-14','22:00','Sweden','Tunisia','F','Estadio BBVA','Monterrey'],
  [13,'2026-06-15','18:00','Saudi Arabia','Uruguay','H','Hard Rock Stadium','Miami'],
  [14,'2026-06-15','12:00','Spain','Cape Verde','H','Mercedes-Benz Stadium','Atlanta'],
  [15,'2026-06-15','21:00','Iran','New Zealand','G','SoFi Stadium','Los Angeles'],
  [16,'2026-06-15','15:00','Belgium','Egypt','G','Lumen Field','Seattle'],
  [17,'2026-06-16','15:00','France','Senegal','I','MetLife Stadium','New York/NJ'],
  [18,'2026-06-16','18:00','Iraq','Norway','I','Gillette Stadium','Boston'],
  [19,'2026-06-16','21:00','Argentina','Algeria','J','Arrowhead Stadium','Kansas City'],
  [20,'2026-06-16','00:00','Austria','Jordan','J','Levi\u2019s Stadium','San Francisco'],
  [21,'2026-06-17','19:00','Ghana','Panama','L','BMO Field','Toronto'],
  [22,'2026-06-17','16:00','England','Croatia','L','AT&T Stadium','Dallas'],
  [23,'2026-06-17','13:00','Portugal','DR Congo','K','NRG Stadium','Houston'],
  [24,'2026-06-17','22:00','Uzbekistan','Colombia','K','Estadio Azteca','Mexico City'],
  [25,'2026-06-18','12:00','Czechia','South Africa','A','Mercedes-Benz Stadium','Atlanta'],
  [26,'2026-06-18','15:00','Switzerland','Bosnia & Herz.','B','SoFi Stadium','Los Angeles'],
  [27,'2026-06-18','18:00','Canada','Qatar','B','BC Place','Vancouver'],
  [28,'2026-06-18','21:00','Mexico','South Korea','A','Estadio Akron','Guadalajara'],
  [29,'2026-06-19','21:00','Brazil','Haiti','C','Lincoln Financial','Philadelphia'],
  [30,'2026-06-19','18:00','Scotland','Morocco','C','Gillette Stadium','Boston'],
  [31,'2026-06-19','23:00','Türkiye','Paraguay','D','Levi\u2019s Stadium','San Francisco'],
  [32,'2026-06-19','15:00','USA','Australia','D','Lumen Field','Seattle'],
  [33,'2026-06-20','16:00','Germany','Ivory Coast','E','BMO Field','Toronto'],
  [34,'2026-06-20','20:00','Ecuador','Curaçao','E','Arrowhead Stadium','Kansas City'],
  [35,'2026-06-20','13:00','Netherlands','Sweden','F','NRG Stadium','Houston'],
  [36,'2026-06-20','00:00','Tunisia','Japan','F','Estadio BBVA','Monterrey'],
  [37,'2026-06-21','18:00','Uruguay','Cape Verde','H','Hard Rock Stadium','Miami'],
  [38,'2026-06-21','12:00','Spain','Saudi Arabia','H','Mercedes-Benz Stadium','Atlanta'],
  [39,'2026-06-21','15:00','Belgium','Iran','G','SoFi Stadium','Los Angeles'],
  [40,'2026-06-21','21:00','New Zealand','Egypt','G','BC Place','Vancouver'],
  [41,'2026-06-22','20:00','Norway','Senegal','I','MetLife Stadium','New York/NJ'],
  [42,'2026-06-22','17:00','France','Iraq','I','Lincoln Financial','Philadelphia'],
  [43,'2026-06-22','13:00','Argentina','Austria','J','AT&T Stadium','Dallas'],
  [44,'2026-06-22','23:00','Jordan','Algeria','J','Levi\u2019s Stadium','San Francisco'],
  [45,'2026-06-23','16:00','England','Ghana','L','Gillette Stadium','Boston'],
  [46,'2026-06-23','19:00','Panama','Croatia','L','BMO Field','Toronto'],
  [47,'2026-06-23','13:00','Portugal','Uzbekistan','K','NRG Stadium','Houston'],
  [48,'2026-06-23','22:00','Colombia','DR Congo','K','Estadio Akron','Guadalajara'],
  [49,'2026-06-24','18:00','Scotland','Brazil','C','Hard Rock Stadium','Miami'],
  [50,'2026-06-24','18:00','Morocco','Haiti','C','Mercedes-Benz Stadium','Atlanta'],
  [51,'2026-06-24','15:00','Switzerland','Canada','B','BC Place','Vancouver'],
  [52,'2026-06-24','15:00','Bosnia & Herz.','Qatar','B','Lumen Field','Seattle'],
  [53,'2026-06-24','21:00','Czechia','Mexico','A','Estadio Azteca','Mexico City'],
  [54,'2026-06-24','21:00','South Africa','South Korea','A','Estadio BBVA','Monterrey'],
  [55,'2026-06-25','16:00','Curaçao','Ivory Coast','E','Lincoln Financial','Philadelphia'],
  [56,'2026-06-25','16:00','Ecuador','Germany','E','MetLife Stadium','New York/NJ'],
  [57,'2026-06-25','19:00','Japan','Sweden','F','AT&T Stadium','Dallas'],
  [58,'2026-06-25','19:00','Tunisia','Netherlands','F','Arrowhead Stadium','Kansas City'],
  [59,'2026-06-25','22:00','Türkiye','USA','D','SoFi Stadium','Los Angeles'],
  [60,'2026-06-25','22:00','Paraguay','Australia','D','Levi\u2019s Stadium','San Francisco'],
  [61,'2026-06-26','15:00','Norway','France','I','Gillette Stadium','Boston'],
  [62,'2026-06-26','15:00','Senegal','Iraq','I','BMO Field','Toronto'],
  [63,'2026-06-26','23:00','Egypt','Iran','G','Lumen Field','Seattle'],
  [64,'2026-06-26','23:00','New Zealand','Belgium','G','BC Place','Vancouver'],
  [65,'2026-06-26','20:00','Cape Verde','Saudi Arabia','H','NRG Stadium','Houston'],
  [66,'2026-06-26','20:00','Uruguay','Spain','H','Estadio Akron','Guadalajara'],
  [67,'2026-06-27','17:00','Panama','England','L','MetLife Stadium','New York/NJ'],
  [68,'2026-06-27','17:00','Croatia','Ghana','L','Lincoln Financial','Philadelphia'],
  [69,'2026-06-27','22:00','Algeria','Austria','J','Arrowhead Stadium','Kansas City'],
  [70,'2026-06-27','22:00','Jordan','Argentina','J','AT&T Stadium','Dallas'],
  [71,'2026-06-27','19:30','Colombia','Portugal','K','Hard Rock Stadium','Miami'],
  [72,'2026-06-27','19:30','DR Congo','Uzbekistan','K','Mercedes-Benz Stadium','Atlanta'],
  // Round of 32
  [73,'2026-06-28','15:00','2nd Group A','2nd Group B',null,'SoFi Stadium','Los Angeles'],
  [74,'2026-06-29','16:30','1st Group E','Best 3rd (A/B/C/D/F)',null,'Gillette Stadium','Boston'],
  [75,'2026-06-29','21:00','1st Group F','2nd Group C',null,'Estadio BBVA','Monterrey'],
  [76,'2026-06-29','13:00','1st Group C','2nd Group F',null,'NRG Stadium','Houston'],
  [77,'2026-06-30','17:00','1st Group I','Best 3rd (C/D/F/G/H)',null,'MetLife Stadium','New York/NJ'],
  [78,'2026-06-30','13:00','2nd Group E','2nd Group I',null,'AT&T Stadium','Dallas'],
  [79,'2026-06-30','21:00','1st Group A','Best 3rd (C/E/F/H/I)',null,'Estadio Azteca','Mexico City'],
  [80,'2026-07-01','12:00','1st Group L','Best 3rd (E/H/I/J/K)',null,'Mercedes-Benz Stadium','Atlanta'],
  [81,'2026-07-01','20:00','1st Group D','Best 3rd (B/E/F/I/J)',null,'Levi\u2019s Stadium','San Francisco'],
  [82,'2026-07-01','16:00','1st Group G','Best 3rd (A/E/H/I/J)',null,'Lumen Field','Seattle'],
  [83,'2026-07-02','19:00','2nd Group K','2nd Group L',null,'BMO Field','Toronto'],
  [84,'2026-07-02','15:00','1st Group H','2nd Group J',null,'SoFi Stadium','Los Angeles'],
  [85,'2026-07-02','23:00','1st Group B','Best 3rd (E/F/G/I/J)',null,'BC Place','Vancouver'],
  [86,'2026-07-03','18:00','1st Group J','2nd Group H',null,'Hard Rock Stadium','Miami'],
  [87,'2026-07-03','21:30','1st Group K','Best 3rd (D/E/I/J/L)',null,'Arrowhead Stadium','Kansas City'],
  [88,'2026-07-03','14:00','2nd Group D','2nd Group G',null,'AT&T Stadium','Dallas'],
  // Round of 16
  [89,'2026-07-04','17:00','W74','W77',null,'Lincoln Financial','Philadelphia'],
  [90,'2026-07-04','13:00','W73','W75',null,'NRG Stadium','Houston'],
  [91,'2026-07-05','16:00','W76','W78',null,'MetLife Stadium','New York/NJ'],
  [92,'2026-07-05','20:00','W79','W80',null,'Estadio Azteca','Mexico City'],
  [93,'2026-07-06','15:00','W83','W84',null,'AT&T Stadium','Dallas'],
  [94,'2026-07-06','20:00','W81','W82',null,'Lumen Field','Seattle'],
  [95,'2026-07-07','12:00','W86','W88',null,'Mercedes-Benz Stadium','Atlanta'],
  [96,'2026-07-07','16:00','W85','W87',null,'BC Place','Vancouver'],
  // Quarter-Finals
  [97,'2026-07-09','16:00','W89','W90',null,'Gillette Stadium','Boston'],
  [98,'2026-07-10','15:00','W93','W94',null,'SoFi Stadium','Los Angeles'],
  [99,'2026-07-11','17:00','W91','W92',null,'Hard Rock Stadium','Miami'],
  [100,'2026-07-11','21:00','W95','W96',null,'Arrowhead Stadium','Kansas City'],
  // Semi-Finals
  [101,'2026-07-14','15:00','W97','W98',null,'AT&T Stadium','Dallas'],
  [102,'2026-07-15','15:00','W99','W100',null,'Mercedes-Benz Stadium','Atlanta'],
  // Third Place + Final
  [103,'2026-07-18','17:00','L101','L102',null,'Hard Rock Stadium','Miami'],
  [104,'2026-07-19','15:00','W101','W102',null,'MetLife Stadium','New York/NJ'],
];

// Precomputed kickoff times in UTC ms for score-pick lockout
const SCHEDULE_UTC_MS = {};
for (const m of SCHEDULE) {
  const [matchId, dateStr, timeET] = m;
  const [h, min] = timeET.split(':').map(Number);
  SCHEDULE_UTC_MS[matchId] = new Date(dateStr + 'T00:00:00Z').getTime() + (h + 4) * 3600000 + min * 60000;
}

function getRoundLabel(matchId) {
  if (matchId <= 72)  return 'Group Stage \u00b7 Group ' + (SCHEDULE[matchId-1][5] || '');
  if (matchId <= 88)  return 'Round of 32';
  if (matchId <= 96)  return 'Round of 16';
  if (matchId <= 100) return 'Quarter-Finals';
  if (matchId <= 102) return 'Semi-Finals';
  if (matchId === 103) return 'Third Place Play-off';
  return 'FINAL';
}

function formatMatchTime(dateStr, timeET) {
  // Convert ET (UTC-4 during summer) to local time
  const [h, m] = timeET.split(':').map(Number);
  const utcMs = new Date(dateStr + 'T00:00:00Z').getTime() + (h + 4) * 3600000 + m * 60000;
  return new Date(utcMs).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// ── Live match results cache (populated from /api/match-results) ──────────────
// matchNum (1-104) -> { home_team, away_team, home_score, away_score, status }
const liveResults = {};
let liveResultsLoaded = false;

async function loadLiveResults() {
  if (liveResultsLoaded) return;
  try {
    const data = await apiFetch('/api/match-results');
    for (const row of (data.results || [])) {
      liveResults[row.match_num] = row;
    }
    liveResultsLoaded = true;
  } catch(e) { /* non-fatal */ }
}

function getLiveTeams(matchNum) {
  const r = liveResults[matchNum];
  if (!r) return null;
  if (r.home_team && r.away_team) return { home: r.home_team, away: r.away_team, homeScore: r.home_score, awayScore: r.away_score, status: r.status };
  return null;
}

// ── Schedule render ────────────────────────────────────────────────────────────
const schedulePickCache = {}; // matchId -> { picked, tally } | 'loading'
const scorePickCache = {};    // matchId -> { myPick: {home,away}|null, tally } | 'loading'

async function loadScorePick(matchId) {
  if (!state.email) return;
  if (scorePickCache[matchId] === 'loading') return;
  scorePickCache[matchId] = 'loading';
  try {
    const data = await apiFetch('/api/score-picks/' + matchId + '?email=' + encodeURIComponent(state.email));
    scorePickCache[matchId] = data;
    renderMatchCard(matchId);
  } catch(e) { scorePickCache[matchId] = null; }
}

async function submitScorePick(matchId, homeScore, awayScore) {
  if (!state.email) { showToast('Load your bracket first', 'error'); return; }
  try {
    const data = await apiFetch('/api/score-picks/' + matchId, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: state.email, home_score: homeScore, away_score: awayScore }),
    });
    scorePickCache[matchId] = { myPick: data.myPick, tally: data.tally };
    showToast('\u26BD Score pick saved!', 'success');
    renderMatchCard(matchId);
  } catch(e) { showToast('Could not save: ' + e.message, 'error'); }
}

function buildScorePickHtml(matchId, t1, t2, canPick) {
  const sp = scorePickCache[matchId];
  const hasPick = sp && sp !== 'loading' && sp.myPick;
  const matchUtcMs = SCHEDULE_UTC_MS[matchId];
  const kickedOff = matchUtcMs ? Date.now() >= matchUtcMs : false;
  if (kickedOff || !canPick) {
    // Show result/pick read-only if kicked off
    if (hasPick) {
      const p = sp.myPick;
      const tallyRows = (sp.tally || []).map(r =>
        \`<span style="font-size:0.68rem;color:var(--grey)">\${r.home_score}–\${r.away_score} (\${r.cnt})</span>\`
      ).join(', ');
      return \`<div class="score-pick-row">⚽ Your score pick: <strong>\${p.home_score}–\${p.away_score}</strong> \${tallyRows ? '· group: ' + tallyRows : ''}</div>\`;
    }
    return '';
  }
  // Editable score inputs
  const h = hasPick ? sp.myPick.home_score : '';
  const a = hasPick ? sp.myPick.away_score : '';
  return \`<div class="score-pick-row">
    <span style="font-size:0.72rem;color:var(--grey);margin-right:6px">⚽ Score pick:</span>
    <input class="score-input" id="sp-h-\${matchId}" type="number" min="0" max="20" value="\${h}" placeholder="0" style="width:36px">
    <span style="color:var(--grey);margin:0 4px">–</span>
    <input class="score-input" id="sp-a-\${matchId}" type="number" min="0" max="20" value="\${a}" placeholder="0" style="width:36px">
    <button class="btn-score-submit" onclick="(function(){
      const h=parseInt(document.getElementById('sp-h-\${matchId}').value);
      const a=parseInt(document.getElementById('sp-a-\${matchId}').value);
      if(isNaN(h)||isNaN(a))return;
      submitScorePick('\${matchId}',h,a);
    })()">Save</button>
  </div>\`;
}

async function loadMatchPick(matchId) {
  if (!state.email) return;
  if (schedulePickCache[matchId] === 'loading') return;
  schedulePickCache[matchId] = 'loading';
  try {
    const data = await apiFetch('/api/live-picks/' + matchId + '?email=' + encodeURIComponent(state.email));
    schedulePickCache[matchId] = data;
    renderMatchCard(matchId);
  } catch(e) {
    schedulePickCache[matchId] = null;
  }
}

async function makeMatchPick(matchId, team) {
  if (!state.email) { showToast('Load your bracket first to make picks', 'error'); return; }
  try {
    const data = await apiFetch('/api/live-picks/' + matchId, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: state.email, team }),
    });
    schedulePickCache[matchId] = { picked: team, tally: data.tally };
    renderMatchCard(matchId);
  } catch(e) {
    showToast('Could not save pick: ' + e.message, 'error');
  }
}

function renderMatchCard(matchId) {
  const el = document.getElementById('match-card-' + matchId);
  if (!el) return;
  const m = SCHEDULE.find(x => x[0] === matchId);
  if (!m) return;
  el.innerHTML = buildMatchCardInner(m);
}

function buildMatchCardInner(m) {
  const [matchId, dateStr, timeET, t1raw, t2raw, group, venue, city] = m;
  const cache = schedulePickCache[matchId];
  const picked = cache && cache !== 'loading' ? cache.picked : null;
  const tally  = cache && cache !== 'loading' ? cache.tally  : null;

  // Use live API data if available; otherwise fall back to hardcoded strings
  const live = getLiveTeams(matchId);
  const t1 = live ? live.home : t1raw;
  const t2 = live ? live.away : t2raw;
  const teamsKnown = !!(live ? (live.home && live.away) : matchId <= 72);
  const isGroupStage = matchId <= 72;

  const timeLocal = formatMatchTime(dateStr, timeET);
  const roundLabel = getRoundLabel(matchId);
  const f1 = teamsKnown ? getFlagForTeam(t1) : '';
  const f2 = teamsKnown ? getFlagForTeam(t2) : '';
  const canPick = !!state.email && teamsKnown;

  // Score badge for finished/live matches
  let scoreBadge = '';
  if (live && live.homeScore !== null && live.awayScore !== null) {
    const isLive = live.status === 'IN_PLAY' || live.status === 'PAUSED' || live.status === 'HALFTIME';
    const color = isLive ? '#ef4444' : 'var(--gold)';
    scoreBadge = \` <span style="color:\${color};font-weight:900;font-size:1rem;margin:0 6px">\${live.homeScore}–\${live.awayScore}\${isLive ? ' 🔴' : ''}</span>\`;
  }

  let teamsHtml;
  if (!teamsKnown) {
    teamsHtml = \`<div class="match-tbd-teams">\${escHtml(t1)} vs \${escHtml(t2)}</div>\`;
  } else if (picked) {
    teamsHtml = \`<div class="match-card-teams">
      <button class="match-pick-btn\${picked === t1 ? ' picked' : ''}" disabled>\${f1} \${escHtml(t1)}</button>
      <div class="match-vs">VS</div>
      <button class="match-pick-btn\${picked === t2 ? ' picked' : ''}" disabled>\${f2} \${escHtml(t2)}</button>
    </div>\`;
  } else {
    teamsHtml = \`<div class="match-card-teams">
      <button class="match-pick-btn" \${canPick ? \`onclick="makeMatchPick(\${matchId},'\${escJs(t1)}')" \` : 'disabled '}>\${f1} \${escHtml(t1)}</button>
      <div class="match-vs">VS</div>
      <button class="match-pick-btn" \${canPick ? \`onclick="makeMatchPick(\${matchId},'\${escJs(t2)}')" \` : 'disabled '}>\${f2} \${escHtml(t2)}</button>
    </div>\`;
  }

  let tallyHtml = '';
  if (picked && tally && tally.length) {
    const total = tally.reduce((s, r) => s + Number(r.cnt), 0);
    const bars = [t1, t2].map(team => {
      const row = tally.find(r => r.team === team);
      const cnt = row ? Number(row.cnt) : 0;
      const pct = total ? Math.round(cnt / total * 100) : 0;
      const isPicked = picked === team;
      const flag = teamsKnown ? getFlagForTeam(team) : '';
      return \`<div class="tally-bar-wrap">
        <div class="tally-label">\${flag} \${escHtml(team)}\${isPicked ? ' \u2713' : ''}</div>
        <div class="tally-bar-outer"><div class="tally-bar-inner" style="width:\${pct}%"></div></div>
        <div class="tally-count">\${cnt}</div>
      </div>\`;
    }).join('');
    tallyHtml = \`<div class="match-tally visible">\${bars}<div class="tally-total">\${total} pick\${total !== 1 ? 's' : ''} in your group</div></div>\`;
  }

  // Score predictor (only for group stage matches with known teams)
  const scorePickHtml = isGroupStage && teamsKnown ? buildScorePickHtml(String(matchId), t1, t2, canPick) : '';

  // Post-match summary / live goal feed — loaded lazily via expandMatch()
  const isLive2 = live && (live.status === 'IN_PLAY' || live.status === 'PAUSED' || live.status === 'HALFTIME');
  const isFinished = live && live.status === 'FINISHED';
  const matchDetailId = 'match-detail-' + matchId;
  let matchDetailTrigger = '';
  if (isLive2 || isFinished) {
    const label = isFinished ? '📋 Match summary' : '🔴 Live updates';
    matchDetailTrigger = \`<button class="btn-match-detail" onclick="toggleMatchDetail(\${matchId})">\${label}</button>
    <div id="\${matchDetailId}" class="match-detail-panel" style="display:none"></div>\`;
  }

  return \`<div class="match-card-meta">
    <span>\${escHtml(roundLabel)}\${scoreBadge}</span>
    <span>\${timeLocal} ET \u00b7 \${escHtml(venue)}, \${escHtml(city)}</span>
  </div>
  \${teamsHtml}
  \${tallyHtml}
  \${scorePickHtml}
  \${matchDetailTrigger}\`;
}

async function renderSchedule() {
  const container = document.getElementById('schedule-days');
  // Show login notice if not logged in
  document.getElementById('schedule-login-notice').style.display = state.email ? 'none' : 'block';

  // Load live match results (team names + scores) — renders skeleton first, then updates
  if (!liveResultsLoaded) {
    await loadLiveResults();
  }

  // Group matches by date
  const byDate = {};
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

    // Check if this day crosses round boundaries — show round labels
    let lastRound = null;
    const cardsHtml = matches.map(m => {
      const round = getRoundLabel(m[0]);
      const roundHeader = round !== lastRound ? \`<div class="schedule-round-label">\${escHtml(round)}</div>\` : '';
      lastRound = round;
      return roundHeader + \`<div class="match-card\${isToday ? ' today-match' : ''}" id="match-card-\${m[0]}">\${buildMatchCardInner(m)}</div>\`;
    }).join('');

    return \`<div class="schedule-day" \${anchorId}>
      <div class="schedule-day-header">\${escHtml(dateLabel)} \${todayBadge}</div>
      \${cardsHtml}
    </div>\`;
  }).join('');

  // Kick off async pick loading for all group stage matches
  if (state.email) {
    for (const m of SCHEDULE) {
      if (m[0] <= 72) {
        if (!schedulePickCache[m[0]]) loadMatchPick(m[0]);
        if (!scorePickCache[m[0]]) loadScorePick(String(m[0]));
      }
    }
  }
}

// ── Match detail (goal feed + post-match summary) ────────────────────────────
async function toggleMatchDetail(matchId) {
  const panel = document.getElementById('match-detail-' + matchId);
  if (!panel) return;
  if (panel.style.display !== 'none') { panel.style.display = 'none'; return; }
  panel.innerHTML = '<div style="color:var(--grey);font-size:0.78rem;padding:8px 0">Loading...</div>';
  panel.style.display = 'block';
  try {
    const data = await apiFetch('/api/match-events/' + matchId);
    const { events, match } = data;
    const ht = (match && match.home_score_ht !== null) ? \`HT: \${match.home_score_ht}–\${match.away_score_ht}\` : '';
    let html = '';
    if (match && match.status === 'FINISHED') {
      html += \`<div class="match-summary-header">Full time\${ht ? ' · ' + ht : ''}</div>\`;
    } else {
      html += \`<div class="match-summary-header" style="color:#ef4444">🔴 Live \${ht ? '· HT: ' + ht : ''}</div>\`;
    }
    if (events && events.length) {
      html += events.map(e => {
        const t = new Date(e.detected_at);
        const timeStr = t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return \`<div class="goal-event">⚽ \${e.home_score}–\${e.away_score} <span style="color:var(--grey);font-size:0.68rem">(detected ~\${timeStr})</span></div>\`;
      }).join('');
    } else {
      html += '<div style="color:var(--grey);font-size:0.78rem">No score changes detected yet</div>';
    }
    panel.innerHTML = html;
  } catch(e) {
    panel.innerHTML = '<div style="color:#f87171;font-size:0.78rem">Could not load match detail</div>';
  }
}

// ── Password gate ──────────────────────────────────────────────────────────────
const PASS_KEY = 'wc26_unlocked';

function checkPassword() {
  const gate = document.getElementById('password-gate');
  const app  = document.getElementById('app-root');
  if (sessionStorage.getItem(PASS_KEY) === '1') {
    gate.style.display = 'none';
    app.style.display  = 'block';
    loadPredictionsList();
    return;
  }
  gate.style.display = 'flex';
  app.style.display  = 'none';
  document.getElementById('pass-input').focus();
}

function submitPassword() {
  const val = (document.getElementById('pass-input').value || '').trim().toLowerCase();
  if (val === 'sofluffy') {
    sessionStorage.setItem(PASS_KEY, '1');
    document.getElementById('password-gate').style.display = 'none';
    document.getElementById('app-root').style.display = 'block';
    loadPredictionsList();
  } else {
    const err = document.getElementById('pass-error');
    err.style.display = 'block';
    document.getElementById('pass-input').value = '';
    document.getElementById('pass-input').focus();
    // Shake the card
    const card = document.getElementById('pass-card');
    card.classList.remove('shake');
    void card.offsetWidth;
    card.classList.add('shake');
  }
}

document.getElementById('pass-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') submitPassword();
  document.getElementById('pass-error').style.display = 'none';
});
document.getElementById('pass-submit').addEventListener('click', submitPassword);

// ── Init ───────────────────────────────────────────────────────────────────────
// Ticker runs even before login — load live results first
loadLiveResults().then(renderTicker);
checkPassword();
</script>
</div><!-- /app-root -->
</body>
</html>`;
}

// ─── football-data.org match ID → our match number (1–104, chronological) ────
// Fetched once on 2026-06-10 and hardcoded to avoid an extra API call per sync.
const FD_MATCH_IDS: number[] = [537327,537328,537333,537345,537334,537339,537340,537346,537351,537357,537352,537358,537369,537363,537370,537364,537391,537392,537397,537398,537403,537409,537410,537404,537329,537335,537336,537330,537348,537342,537341,537347,537359,537353,537354,537360,537371,537365,537372,537366,537399,537393,537394,537400,537405,537411,537412,537406,537337,537338,537344,537343,537331,537332,537355,537356,537361,537362,537349,537350,537395,537396,537373,537374,537367,537368,537413,537414,537407,537408,537401,537402,537417,537423,537415,537418,537424,537416,537425,537426,537422,537421,537420,537419,537429,537428,537427,537430,537376,537375,537377,537378,537379,537380,537381,537382,537383,537384,537385,537386,537387,537388,537389,537390];

async function syncMatchResults(env: Env): Promise<void> {
  const res = await fetch('https://api.football-data.org/v4/competitions/WC/matches?season=2026', {
    headers: { 'X-Auth-Token': env.FOOTBALL_DATA_TOKEN },
  });
  if (!res.ok) return;

  const data = await res.json() as { matches: Array<{
    id: number;
    status: string;
    score: {
      winner: string | null;
      fullTime: { home: number | null; away: number | null };
      halfTime: { home: number | null; away: number | null };
    };
    homeTeam: { name: string | null };
    awayTeam: { name: string | null };
  }> };

  const now = Date.now();
  const stmts = data.matches.map(m => {
    const matchNum = FD_MATCH_IDS.indexOf(m.id) + 1;
    if (matchNum === 0) return null;

    // Resolve winner to actual team name
    let winner: string | null = null;
    if (m.score.winner === 'HOME_TEAM') winner = m.homeTeam.name ?? null;
    else if (m.score.winner === 'AWAY_TEAM') winner = m.awayTeam.name ?? null;
    // DRAW stays null (group stage draws have no knockout winner)

    return env.DB.prepare(
      `INSERT INTO match_results (fd_match_id, match_num, home_team, away_team, home_score, away_score, home_score_ht, away_score_ht, status, winner, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(fd_match_id) DO UPDATE SET
         home_team = excluded.home_team,
         away_team = excluded.away_team,
         home_score = excluded.home_score,
         away_score = excluded.away_score,
         home_score_ht = excluded.home_score_ht,
         away_score_ht = excluded.away_score_ht,
         status = excluded.status,
         winner = excluded.winner,
         updated_at = excluded.updated_at`
    ).bind(
      m.id, matchNum,
      m.homeTeam.name ?? null,
      m.awayTeam.name ?? null,
      m.score.fullTime.home ?? null,
      m.score.fullTime.away ?? null,
      m.score.halfTime.home ?? null,
      m.score.halfTime.away ?? null,
      m.status,
      winner,
      now,
    );
  }).filter(Boolean) as D1PreparedStatement[];

  // Batch upserts
  for (let i = 0; i < stmts.length; i += 20) {
    await env.DB.batch(stmts.slice(i, i + 20));
  }

  // Detect score changes → insert score_events
  // Read current stored scores before we overwrote them — we need to compare.
  // Strategy: read existing scores, then compare with data.matches scores.
  const existingScores = await env.DB.prepare(
    'SELECT match_num, home_score, away_score FROM match_results WHERE home_score IS NOT NULL'
  ).all<{ match_num: number; home_score: number; away_score: number }>();
  const existingMap: Record<number, { home: number; away: number }> = {};
  for (const r of existingScores.results) {
    existingMap[r.match_num] = { home: r.home_score, away: r.away_score };
  }

  const eventStmts: D1PreparedStatement[] = [];
  for (const m of data.matches) {
    const matchNum = FD_MATCH_IDS.indexOf(m.id) + 1;
    if (matchNum === 0) continue;
    const nh = m.score.fullTime.home;
    const na = m.score.fullTime.away;
    if (nh === null || na === null) continue;
    const prev = existingMap[matchNum];
    if (!prev || prev.home !== nh || prev.away !== na) {
      // Score changed — record the new scoreline
      eventStmts.push(env.DB.prepare(
        `INSERT OR IGNORE INTO score_events (match_num, home_score, away_score, detected_at) VALUES (?, ?, ?, ?)`
      ).bind(matchNum, nh, na, now));
    }
  }
  for (let i = 0; i < eventStmts.length; i += 20) {
    await env.DB.batch(eventStmts.slice(i, i + 20));
  }

  // Sync group standings (football-data.org updates these as matchdays complete)
  await syncGroupStandings(env);
}

async function syncGroupStandings(env: Env): Promise<void> {
  const res = await fetch('https://api.football-data.org/v4/competitions/WC/standings?season=2026', {
    headers: { 'X-Auth-Token': env.FOOTBALL_DATA_TOKEN },
  });
  if (!res.ok) return;

  const data = await res.json() as {
    standings: Array<{
      stage: string;
      type: string;
      group: string | null;
      table: Array<{ position: number; team: { name: string } }>;
    }>;
  };

  const now = Date.now();
  const stmts: D1PreparedStatement[] = [];
  for (const standing of data.standings) {
    if (standing.type !== 'TOTAL' || !standing.group) continue;
    // group looks like "GROUP_A" → extract letter
    const letter = standing.group.replace('GROUP_', '');
    for (const row of standing.table) {
      stmts.push(env.DB.prepare(
        `INSERT INTO group_standings (group_letter, position, team_name, updated_at)
         VALUES (?, ?, ?, ?)
         ON CONFLICT(group_letter, position) DO UPDATE SET
           team_name = excluded.team_name,
           updated_at = excluded.updated_at`
      ).bind(letter, row.position, row.team.name, now));
    }
  }

  for (let i = 0; i < stmts.length; i += 20) {
    await env.DB.batch(stmts.slice(i, i + 20));
  }
}

// ─── Worker ───────────────────────────────────────────────────────────────────

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS headers for API routes
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // ── GET / ──────────────────────────────────────────────────────────────────
    if (path === '/' && request.method === 'GET') {
      const html = buildHtml(DEADLINE_MS, JSON.stringify(GROUPS));
      return new Response(html, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    // ── GET /api/brackets ──────────────────────────────────────────────────────
    if (path === '/api/brackets' && request.method === 'GET') {
      const result = await env.DB.prepare(
        'SELECT email, display_name, locked, updated_at FROM brackets ORDER BY updated_at DESC'
      ).all();
      return Response.json(
        { brackets: result.results },
        { headers: corsHeaders }
      );
    }

    // ── GET /api/brackets/:email ───────────────────────────────────────────────
    const bracketMatch = path.match(/^\/api\/brackets\/(.+)$/);
    if (bracketMatch) {
      const email = decodeURIComponent(bracketMatch[1]);

      if (request.method === 'GET') {
        const row = await env.DB.prepare(
          'SELECT * FROM brackets WHERE email = ?'
        ).bind(email).first();
        if (!row) {
          return Response.json({ error: 'Not found' }, { status: 404, headers: corsHeaders });
        }
        return Response.json({ bracket: row }, { headers: corsHeaders });
      }

      // ── POST /api/brackets/:email ────────────────────────────────────────────
      if (request.method === 'POST') {
        // Check global deadline
        if (Date.now() >= DEADLINE_MS) {
          return Response.json(
            { error: 'Picks are locked — the tournament has started.' },
            { status: 403, headers: corsHeaders }
          );
        }

        // Check personal lock
        const existing = await env.DB.prepare(
          'SELECT locked FROM brackets WHERE email = ?'
        ).bind(email).first<{ locked: number }>();

        if (existing?.locked) {
          return Response.json(
            { error: 'Your bracket is permanently locked.' },
            { status: 403, headers: corsHeaders }
          );
        }

        const body = await request.json() as {
          display_name: string;
          bracket_data: string;
          lock?: boolean;
        };

        if (!body.display_name || !body.bracket_data) {
          return Response.json(
            { error: 'Missing display_name or bracket_data.' },
            { status: 400, headers: corsHeaders }
          );
        }

        const locked = body.lock ? 1 : 0;
        const now = Date.now();

        await env.DB.prepare(
          `INSERT INTO brackets (email, display_name, bracket_data, locked, updated_at)
           VALUES (?, ?, ?, ?, ?)
           ON CONFLICT(email) DO UPDATE SET
             display_name = excluded.display_name,
             bracket_data = excluded.bracket_data,
             locked = excluded.locked,
             updated_at = excluded.updated_at`
        ).bind(email, body.display_name, body.bracket_data, locked, now).run();

        return Response.json(
          { ok: true, locked: !!locked },
          { headers: corsHeaders }
        );
      }
    }

    // ── POST /api/score-picks/:matchId ────────────────────────────────────────
    // Body: { email, home_score, away_score }
    const scorePickMatch = path.match(/^\/api\/score-picks\/(.+)$/);
    if (scorePickMatch) {
      const matchId = scorePickMatch[1];

      if (request.method === 'POST') {
        const body = await request.json() as { email: string; home_score: number; away_score: number };
        if (!body.email || body.home_score === undefined || body.away_score === undefined) {
          return Response.json({ error: 'Missing fields' }, { status: 400, headers: corsHeaders });
        }
        await env.DB.prepare(
          `INSERT INTO score_picks (email, match_id, home_score, away_score, picked_at)
           VALUES (?, ?, ?, ?, ?)
           ON CONFLICT(email, match_id) DO UPDATE SET
             home_score = excluded.home_score,
             away_score = excluded.away_score,
             picked_at = excluded.picked_at`
        ).bind(body.email, matchId, body.home_score, body.away_score, Date.now()).run();

        // Return group tally of score picks for this match
        const tally = await env.DB.prepare(
          `SELECT home_score, away_score, COUNT(*) as cnt FROM score_picks WHERE match_id = ? GROUP BY home_score, away_score ORDER BY cnt DESC`
        ).bind(matchId).all();
        const myPick = { home_score: body.home_score, away_score: body.away_score };
        return Response.json({ ok: true, myPick, tally: tally.results }, { headers: corsHeaders });
      }

      if (request.method === 'GET') {
        const email = url.searchParams.get('email');
        if (!email) return Response.json({ error: 'email required' }, { status: 400, headers: corsHeaders });
        const myPick = await env.DB.prepare(
          'SELECT home_score, away_score FROM score_picks WHERE match_id = ? AND email = ?'
        ).bind(matchId, email).first<{ home_score: number; away_score: number }>();

        if (!myPick) return Response.json({ myPick: null, tally: null }, { headers: corsHeaders });

        const tally = await env.DB.prepare(
          `SELECT home_score, away_score, COUNT(*) as cnt FROM score_picks WHERE match_id = ? GROUP BY home_score, away_score ORDER BY cnt DESC`
        ).bind(matchId).all();
        return Response.json({ myPick, tally: tally.results }, { headers: corsHeaders });
      }
    }

    // ── POST /api/live-picks/:matchId ─────────────────────────────────────────
    // Body: { email, team }
    const livePickMatch = path.match(/^\/api\/live-picks\/(.+)$/);
    if (livePickMatch) {
      const matchId = livePickMatch[1];

      if (request.method === 'POST') {
        const body = await request.json() as { email: string; team: string };
        if (!body.email || !body.team) {
          return Response.json({ error: 'Missing email or team' }, { status: 400, headers: corsHeaders });
        }
        await env.DB.prepare(
          `INSERT INTO live_picks (email, match_id, team, picked_at)
           VALUES (?, ?, ?, ?)
           ON CONFLICT(email, match_id) DO UPDATE SET team = excluded.team, picked_at = excluded.picked_at`
        ).bind(body.email, matchId, body.team, Date.now()).run();

        // Return tally
        const tally = await env.DB.prepare(
          'SELECT team, COUNT(*) as cnt FROM live_picks WHERE match_id = ? GROUP BY team'
        ).bind(matchId).all();
        return Response.json({ ok: true, tally: tally.results }, { headers: corsHeaders });
      }

      if (request.method === 'GET') {
        // Only return tally if caller has picked (email query param)
        const email = url.searchParams.get('email');
        if (!email) {
          return Response.json({ error: 'email required' }, { status: 400, headers: corsHeaders });
        }
        const myPick = await env.DB.prepare(
          'SELECT team FROM live_picks WHERE match_id = ? AND email = ?'
        ).bind(matchId, email).first<{ team: string }>();

        if (!myPick) {
          // Haven't picked yet — return null tally so UI shows pick buttons
          return Response.json({ picked: null, tally: null }, { headers: corsHeaders });
        }
        const tally = await env.DB.prepare(
          'SELECT team, COUNT(*) as cnt FROM live_picks WHERE match_id = ? GROUP BY team'
        ).bind(matchId).all();
        return Response.json({ picked: myPick.team, tally: tally.results }, { headers: corsHeaders });
      }
    }

    // ── POST /api/golden-boot ────────────────────────────────────────────────
    if (path === '/api/golden-boot' && request.method === 'POST') {
      if (Date.now() >= DEADLINE_MS) {
        return Response.json({ error: 'Picks are locked.' }, { status: 403, headers: corsHeaders });
      }
      const body = await request.json() as { email: string; player_name: string };
      if (!body.email || !body.player_name) {
        return Response.json({ error: 'Missing fields' }, { status: 400, headers: corsHeaders });
      }
      await env.DB.prepare(
        `INSERT INTO golden_boot_picks (email, player_name, picked_at)
         VALUES (?, ?, ?)
         ON CONFLICT(email) DO UPDATE SET player_name = excluded.player_name, picked_at = excluded.picked_at`
      ).bind(body.email, body.player_name, Date.now()).run();
      return Response.json({ ok: true }, { headers: corsHeaders });
    }

    // ── GET /api/golden-boot ─────────────────────────────────────────────────
    if (path === '/api/golden-boot' && request.method === 'GET') {
      const email = url.searchParams.get('email');
      if (!email) return Response.json({ error: 'email required' }, { status: 400, headers: corsHeaders });
      const row = await env.DB.prepare('SELECT player_name FROM golden_boot_picks WHERE email = ?')
        .bind(email).first<{ player_name: string }>();
      return Response.json({ player_name: row?.player_name ?? null }, { headers: corsHeaders });
    }

    // ── GET /api/golden-boot-tally ───────────────────────────────────────────
    if (path === '/api/golden-boot-tally' && request.method === 'GET') {
      // Fetch actual top scorer from football-data.org
      let actualTopScorer: string | null = null;
      try {
        const sRes = await fetch('https://api.football-data.org/v4/competitions/WC/scorers?season=2026&limit=1', {
          headers: { 'X-Auth-Token': env.FOOTBALL_DATA_TOKEN },
        });
        if (sRes.ok) {
          const sd = await sRes.json() as { scorers: Array<{ player: { name: string }; goals: number }> };
          if (sd.scorers.length) actualTopScorer = sd.scorers[0].player.name;
        }
      } catch { /* non-fatal */ }

      const picks = await env.DB.prepare(
        'SELECT player_name, COUNT(*) as cnt FROM golden_boot_picks GROUP BY player_name ORDER BY cnt DESC'
      ).all<{ player_name: string; cnt: number }>();

      return Response.json({
        tally: picks.results,
        actual_top_scorer: actualTopScorer,
      }, { headers: corsHeaders });
    }

    // ── GET /api/consensus ────────────────────────────────────────────────────
    // Returns { total_players, picks: { "r32_0": { "Mexico": 5, "Brazil": 3 }, ... } }
    if (path === '/api/consensus' && request.method === 'GET') {
      const rows = await env.DB.prepare(
        'SELECT bracket_data FROM brackets'
      ).all<{ bracket_data: string }>();

      const tallies: Record<string, Record<string, number>> = {};
      let total = 0;
      for (const row of rows.results) {
        total++;
        try {
          const bd = JSON.parse(row.bracket_data);
          const ko = bd.knockout ?? {};
          for (const [key, team] of Object.entries(ko)) {
            if (!tallies[key]) tallies[key] = {};
            tallies[key][team as string] = (tallies[key][team as string] ?? 0) + 1;
          }
        } catch { /* skip */ }
      }
      return Response.json({ total_players: total, picks: tallies }, { headers: corsHeaders });
    }

    // ── GET /api/leaderboard ──────────────────────────────────────────────────
    if (path === '/api/leaderboard' && request.method === 'GET') {
      // Load all finished match results and group standings
      const [matchRows, groupRows, bracketRows, scorePickRows, gbPickRows, gbScorers] = await Promise.all([
        env.DB.prepare(
          'SELECT match_num, home_team, away_team, home_score, away_score, status, winner FROM match_results WHERE status = ? ORDER BY match_num'
        ).bind('FINISHED').all<{ match_num: number; home_team: string; away_team: string; home_score: number | null; away_score: number | null; status: string; winner: string | null }>(),
        env.DB.prepare(
          'SELECT group_letter, position, team_name FROM group_standings ORDER BY group_letter, position'
        ).all<{ group_letter: string; position: number; team_name: string }>(),
        env.DB.prepare(
          'SELECT email, display_name, bracket_data FROM brackets'
        ).all<{ email: string; display_name: string; bracket_data: string }>(),
        env.DB.prepare(
          'SELECT email, match_id, home_score, away_score FROM score_picks'
        ).all<{ email: string; match_id: string; home_score: number; away_score: number }>(),
        env.DB.prepare('SELECT email, player_name FROM golden_boot_picks')
          .all<{ email: string; player_name: string }>(),
        // Fetch actual top scorer live
        fetch('https://api.football-data.org/v4/competitions/WC/scorers?season=2026&limit=1', {
          headers: { 'X-Auth-Token': env.FOOTBALL_DATA_TOKEN },
        }).then(r => r.ok ? r.json() : { scorers: [] }).catch(() => ({ scorers: [] })) as Promise<{ scorers: Array<{ player: { name: string }; goals: number }> }>,
      ]);

      // Build lookup: match_num -> winner team name (knockout only, matches 73+)
      const knockoutWinners: Record<number, string> = {};
      // Also build: match_num -> { home_score, away_score } for all finished matches (score picks)
      const finishedScores: Record<number, { home: number; away: number }> = {};
      for (const m of matchRows.results) {
        if (m.match_num >= 73 && m.winner) {
          knockoutWinners[m.match_num] = m.winner;
        }
        if (m.home_score !== null && m.away_score !== null) {
          finishedScores[m.match_num] = { home: m.home_score, away: m.away_score };
        }
      }

      // Build score_picks lookup: email -> { match_id -> { home_score, away_score } }
      const scorePicksByEmail: Record<string, Record<string, { home: number; away: number }>> = {};
      for (const sp of scorePickRows.results) {
        if (!scorePicksByEmail[sp.email]) scorePicksByEmail[sp.email] = {};
        scorePicksByEmail[sp.email][sp.match_id] = { home: sp.home_score, away: sp.away_score };
      }

      // Golden boot lookup and actual winner
      const gbByEmail: Record<string, string> = {};
      for (const gb of gbPickRows.results) gbByEmail[gb.email] = gb.player_name;
      const actualTopScorer = (gbScorers as any).scorers?.[0]?.player?.name ?? null;

      // Build lookup: group_letter -> [1st, 2nd, 3rd, 4th] team names
      const groupStandings: Record<string, string[]> = {};
      for (const r of groupRows.results) {
        if (!groupStandings[r.group_letter]) groupStandings[r.group_letter] = [];
        groupStandings[r.group_letter][r.position - 1] = r.team_name;
      }

      // Round -> match number offset for scoring
      // R32: matches 73-88 (16 matches, 2 pts each)
      // R16: matches 89-96 (8 matches, 3 pts each)
      // QF:  matches 97-100 (4 matches, 4 pts each)
      // SF:  matches 101-102 (2 matches, 5 pts each)
      // Final: match 104 (1 match, 8 pts)
      // 3rd place: match 103 (skip — not in bracket picks)
      const ROUND_POINTS: Array<{ key: string; matchNums: number[]; pts: number }> = [
        { key: 'r32',   matchNums: Array.from({length:16}, (_,i) => 73+i),  pts: 2 },
        { key: 'r16',   matchNums: Array.from({length:8},  (_,i) => 89+i),  pts: 3 },
        { key: 'qf',    matchNums: Array.from({length:4},  (_,i) => 97+i),  pts: 4 },
        { key: 'sf',    matchNums: Array.from({length:2},  (_,i) => 101+i), pts: 5 },
        { key: 'final', matchNums: [104],                                    pts: 8 },
      ];

      const finishedMatchNums = new Set(matchRows.results.map(m => m.match_num));
      const hasAnyFinished = finishedMatchNums.size > 0;

      const leaderboard = bracketRows.results.map(b => {
        let bd: { groups?: Record<string, string[]>; knockout?: Record<string, string> } = {};
        try { bd = JSON.parse(b.bracket_data); } catch { /* skip */ }
        const knockout = bd.knockout ?? {};
        const groups = bd.groups ?? {};

        let score = 0;
        const picks: Array<{ round: string; matchNum: number; predicted: string; actual: string | null; correct: boolean | null }> = [];

        // Score knockout picks
        for (const { key, matchNums, pts } of ROUND_POINTS) {
          matchNums.forEach((matchNum, idx) => {
            const predicted = knockout[`${key}_${idx}`] ?? null;
            const actual = knockoutWinners[matchNum] ?? null;
            const finished = finishedMatchNums.has(matchNum);
            const correct = finished && predicted && actual ? predicted === actual : null;
            if (correct) score += pts;
            if (predicted) picks.push({ round: key, matchNum, predicted, actual, correct });
          });
        }

        // Score group standings (only groups where all 3 matchdays are done = 4 entries in groupStandings)
        let groupScore = 0;
        for (const [letter, actualOrder] of Object.entries(groupStandings)) {
          if (actualOrder.length < 4) continue; // group not complete yet
          const predicted = groups[letter] ?? [];
          for (let pos = 0; pos < 4; pos++) {
            if (predicted[pos] && actualOrder[pos] && predicted[pos] === actualOrder[pos]) {
              groupScore += 1;
            }
          }
        }
        score += groupScore;

        // Score score_picks (group stage only, match_num 1–72)
        // Exact score: 3 pts, correct result (W/D/L direction): 1 pt
        let scorePickScore = 0;
        const myScorePicks = scorePicksByEmail[b.email] ?? {};
        for (const [matchIdStr, predicted] of Object.entries(myScorePicks)) {
          const mn = parseInt(matchIdStr);
          if (isNaN(mn) || mn > 72) continue;
          const actual = finishedScores[mn];
          if (!actual) continue;
          if (predicted.home === actual.home && predicted.away === actual.away) {
            scorePickScore += 3; // exact score
          } else {
            // correct result direction
            const predDir = predicted.home > predicted.away ? 1 : predicted.home < predicted.away ? -1 : 0;
            const actDir  = actual.home > actual.away ? 1 : actual.home < actual.away ? -1 : 0;
            if (predDir === actDir) scorePickScore += 1;
          }
        }
        score += scorePickScore;

        // Golden Boot bonus (5 pts if correct)
        const myGbPick = gbByEmail[b.email] ?? null;
        let gbScore = 0;
        if (myGbPick && actualTopScorer && myGbPick === actualTopScorer) gbScore = 5;
        score += gbScore;

        return {
          email: b.email,
          display_name: b.display_name,
          score,
          correct_knockout: picks.filter(p => p.correct === true).length,
          total_knockout_finished: picks.filter(p => p.correct !== null).length,
          group_score: groupScore,
          score_pick_score: scorePickScore,
          golden_boot_pick: myGbPick,
          golden_boot_score: gbScore,
          picks,
        };
      });

      leaderboard.sort((a, b) => b.score - a.score || b.correct_knockout - a.correct_knockout);
      leaderboard.forEach((e, i) => Object.assign(e, { rank: i + 1 }));

      return Response.json({
        leaderboard,
        has_any_finished: hasAnyFinished,
        actual_top_scorer: actualTopScorer,
        updated_at: Date.now(),
      }, { headers: corsHeaders });
    }

    // ── GET /api/match-events/:matchNum ───────────────────────────────────────
    const matchEventsMatch = path.match(/^\/api\/match-events\/(\d+)$/);
    if (matchEventsMatch && request.method === 'GET') {
      const mn = parseInt(matchEventsMatch[1]);
      const [events, matchRow] = await Promise.all([
        env.DB.prepare('SELECT home_score, away_score, detected_at FROM score_events WHERE match_num = ? ORDER BY detected_at')
          .bind(mn).all<{ home_score: number; away_score: number; detected_at: number }>(),
        env.DB.prepare('SELECT home_team, away_team, home_score, away_score, home_score_ht, away_score_ht, status, winner FROM match_results WHERE match_num = ?')
          .bind(mn).first<{ home_team: string; away_team: string; home_score: number | null; away_score: number | null; home_score_ht: number | null; away_score_ht: number | null; status: string; winner: string | null }>(),
      ]);
      return Response.json({ events: events.results, match: matchRow }, { headers: corsHeaders });
    }

    // ── GET /api/match-results ─────────────────────────────────────────────────
    if (path === '/api/match-results' && request.method === 'GET') {
      const rows = await env.DB.prepare(
        'SELECT match_num, home_team, away_team, home_score, away_score, status FROM match_results ORDER BY match_num'
      ).all();
      return Response.json({ results: rows.results }, { headers: corsHeaders });
    }

    // ── POST /api/sync-matches (manual trigger, admin only) ───────────────────
    if (path === '/api/sync-matches' && request.method === 'POST') {
      await syncMatchResults(env);
      return Response.json({ ok: true }, { headers: corsHeaders });
    }

    return Response.json({ error: 'Not found' }, { status: 404, headers: corsHeaders });
  },

  async scheduled(_controller: ScheduledController, env: Env, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(syncMatchResults(env));
  },
} satisfies ExportedHandler<Env>;
