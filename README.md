# FIFA World Cup 2026 — Bracket Predictor

A full-featured bracket prediction app for the FIFA 2026 World Cup, built for a WhatsApp group of football fans. Runs entirely on Cloudflare Workers + D1 with no external backend.

**Live app:** https://worldcup-bracket.cda-testing.workers.dev

---

## Features

### Bracket Prediction
- Pick winners for all 5 knockout rounds (R32 → R16 → QF → SF → Final)
- Drag-and-drop team reordering in the 12 group stage cards
- 3rd-place qualifier section following the official FIFA 2026 rules (8 best 3rd-place teams from 12 groups advance)
- Auto-pick button to randomly fill the entire bracket
- Save as draft or lock your picks permanently
- Picks are locked globally at the tournament start deadline (first match kickoff)

### Schedule
- All 104 matches with dates, times (ET), venues, and cities
- Quick-pick winner buttons on group stage matches
- Score predictor — pick exact scorelines for each match
- Expandable match detail panel showing:
  - Goal scorers with minute, player name, team, and OG/PEN labels
  - Falls back to score-change snapshots if goal data is not yet available
- Auto-refreshes every 60 seconds while the tab is open
- Social tally showing what percentage of players picked each team

### Live Bracket (🔴 Live tab)
- Real tournament bracket filling in with results as matches finish
- 5-column layout: Round of 32 → Round of 16 → Quarter-finals → Semi-finals → Final
- Each match shows team flags, names, and scores
- Winner row highlighted in gold; live matches pulse red
- Unplayed slots show TBD
- Auto-refreshes every 60 seconds

### Leaderboard
- Scores calculated after each finished match
- Points system:
  - R32 correct winner: 2 pts
  - R16 correct winner: 3 pts
  - Quarter-final correct winner: 4 pts
  - Semi-final correct winner: 5 pts
  - Final correct winner: 8 pts
  - Group stage correct position: 1 pt per team
  - Exact score pick: 3 pts / correct result direction: 1 pt
  - Golden Boot correct pick: 5 pts
- Score graph, consensus insights (most popular picks), and upset alerts
- Head-to-head bracket comparison between any two players
- Shareable standings card
- Hall of Fame card post-tournament

### Golden Boot Predictor
- Pick which player you think will finish as top scorer

### Access Control
- Before the tournament: login with name + email, optional password gate (`sofluffy`)
- After the deadline: existing users load by email only, new signups blocked
- Admin delete function (password-protected) to remove test entries

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Cloudflare Workers |
| Database | Cloudflare D1 (SQLite) |
| Static assets | Cloudflare Workers Assets |
| Client | Vanilla TypeScript, bundled with esbuild |
| Match data | [football-data.org](https://www.football-data.org) API (free tier) |
| Scheduling | Cloudflare Cron Trigger (every 5 minutes) |

No React, no framework, no external backend — the worker serves the HTML/JS and handles all API routes.

---

## Project Structure

```
worldcup-bracket/
├── migrations/              # D1 schema migrations (applied in order)
│   ├── 0001_initial.sql     # brackets, live_picks tables
│   ├── 0002–0008_*.sql      # incremental additions
│   └── 0009_goal_events.sql # per-goal scorer data
├── src/
│   ├── client/              # TypeScript client-side modules (bundled by esbuild)
│   │   ├── main.ts          # Entry point, tab switching, login, save/load
│   │   ├── bracket.ts       # Knockout bracket renderer
│   │   ├── groups.ts        # Group stage drag-drop UI
│   │   ├── schedule.ts      # Schedule tab, quick picks, score predictor
│   │   ├── leaderboard.ts   # Leaderboard, graph, consensus, H2H
│   │   ├── liveBracket.ts   # Live bracket tab renderer and polling
│   │   ├── liveResults.ts   # Fetches /api/match-results, provides getLiveTeams()
│   │   ├── goldenBoot.ts    # Golden Boot predictor UI
│   │   ├── ticker.ts        # Live score ticker (top bar)
│   │   ├── consensus.ts     # Consensus data fetching
│   │   ├── state.ts         # Global app state and deadline constant
│   │   ├── data.ts          # Static team data, schedule, R32 seed pairings
│   │   ├── api.ts           # Typed fetch wrappers
│   │   └── utils.ts         # escHtml, timeAgo, showToast helpers
│   ├── worker/              # Cloudflare Worker (TypeScript)
│   │   ├── index.ts         # Worker entry point, cron handler
│   │   ├── routes/
│   │   │   ├── api.ts       # All REST API handlers
│   │   │   └── html.ts      # Serves index.html
│   │   ├── services/
│   │   │   └── sync.ts      # Syncs match results + goal scorers from football-data.org
│   │   └── data/
│   │       └── constants.ts # Deadline ISO, football-data match ID mapping
│   └── public/              # Static assets served by Workers Assets
│       ├── index.html       # App shell
│       ├── style.css        # All styles
│       └── client.js        # Built client bundle (output of esbuild)
├── wrangler.jsonc           # Cloudflare Worker config (D1, Assets, Cron)
├── tsconfig.json            # TypeScript config for worker code
├── tsconfig.client.json     # TypeScript config for client code (DOM APIs)
└── package.json
```

---

## Database Schema

| Table | Purpose |
|---|---|
| `brackets` | One row per user: `email`, `display_name`, `bracket_data` (JSON blob), `locked` |
| `live_picks` | Per-user, per-match quick picks on the schedule tab |
| `score_picks` | Per-user exact score predictions for group stage matches |
| `golden_boot_picks` | Per-user Golden Boot player name predictions |
| `match_results` | Synced from football-data.org every 5 min: scores, status, winner |
| `group_standings` | Synced group table positions per team |
| `score_events` | Score-change snapshots (detected when the sync cron sees a changed score) |
| `goal_events` | Per-goal detail: match, minute, injury time, scorer name, team, type (REGULAR/OWN/PENALTY) |

---

## API Routes

| Method | Path | Description |
|---|---|---|
| `GET/POST` | `/api/brackets/:email` | Load or save a user's bracket |
| `GET` | `/api/match-results` | All match results (used by live bracket + leaderboard) |
| `GET` | `/api/match-events/:matchNum` | Score snapshots + goal scorers for one match |
| `GET` | `/api/leaderboard` | Ranked leaderboard with scores, picks, consensus |
| `GET` | `/api/consensus` | Aggregated knockout pick tallies across all users |
| `GET/POST` | `/api/score-picks/:matchId` | Load or save a score prediction |
| `GET/POST` | `/api/live-picks/:matchId` | Load or save a quick-pick winner |
| `GET/POST` | `/api/golden-boot` | Load or save a Golden Boot prediction |
| `GET` | `/api/golden-boot-tally` | All Golden Boot picks + current actual leader |
| `POST` | `/api/sync-matches` | Manually trigger a match data sync |
| `DELETE` | `/api/admin/brackets/:email` | Admin-only: delete a user entry |

---

## Local Development

### Prerequisites
- Node.js 18+
- A [Cloudflare account](https://dash.cloudflare.com) with Wrangler authenticated (`npx wrangler login`)
- A [football-data.org](https://www.football-data.org) API token (free tier works)

### Setup

```bash
git clone https://github.com/brasewel/worldcup-bracket-predictor-2026.git
cd worldcup-bracket-predictor-2026
npm install
```

Create a `.dev.vars` file for local secrets:

```
FOOTBALL_DATA_TOKEN=your_token_here
ADMIN_PASSWORD=your_admin_password
```

Apply migrations to the local D1 database:

```bash
npm run db:migrate:local
```

Start the dev server (client bundle watcher + Wrangler dev in parallel):

```bash
npm run dev
```

App will be at http://localhost:8787.

### Deploy to production

```bash
npm run build
```

This bundles the client with esbuild and deploys the worker via `wrangler deploy`. Secrets (`FOOTBALL_DATA_TOKEN`, `ADMIN_PASSWORD`) must be set as Cloudflare Worker secrets:

```bash
npx wrangler secret put FOOTBALL_DATA_TOKEN
npx wrangler secret put ADMIN_PASSWORD
```

Apply migrations to the remote D1 database:

```bash
npm run db:migrate:remote
```

---

## Data Sync

A Cloudflare Cron Trigger fires every 5 minutes and calls `syncMatchResults()` in `src/worker/services/sync.ts`. This:

1. Fetches all 2026 World Cup matches from `football-data.org` with `X-Unfold-Goals: true`
2. Upserts scores, status, and winner into `match_results`
3. Detects score changes and inserts rows into `score_events`
4. For finished matches, inserts per-goal rows into `goal_events` (scorer name, minute, injury time, team, type)
5. Fetches group standings and upserts into `group_standings`

A manual sync can also be triggered via `POST /api/sync-matches`.

---

## Scoring System

Points are awarded after each match finishes by comparing every user's saved bracket picks against `match_results`:

| Category | Points |
|---|---|
| Round of 32 correct winner | 2 |
| Round of 16 correct winner | 3 |
| Quarter-final correct winner | 4 |
| Semi-final correct winner | 5 |
| Final correct winner | 8 |
| Group stage correct position (per team) | 1 |
| Exact score prediction | 3 |
| Correct result direction (win/draw/loss) | 1 |
| Golden Boot correct pick | 5 |

---

## Tournament Format (FIFA 2026)

- **48 teams**, **12 groups** of 4 (Groups A–L)
- Top 2 from each group advance (24 teams)
- Best **8 third-place teams** also advance (32 total in R32)
- Knockout rounds: R32 (16 matches) → R16 (8) → QF (4) → SF (2) → Final (1) + Third-place playoff (match 103)
- Match numbers used in this app: Group stage = 1–72, R32 = 73–88, R16 = 89–96, QF = 97–100, SF = 101–102, Final = 104

The 3rd-place qualifier rules (which groups' 3rd-place teams can meet which opponents) are encoded in `src/client/data.ts` → `R32_SEEDS`.
