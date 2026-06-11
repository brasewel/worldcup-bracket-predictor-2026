import { apiFetch } from './api';

interface LiveResultRow {
  match_num: number;
  home_team: string | null;
  away_team: string | null;
  home_score: number | null;
  away_score: number | null;
  status: string;
  match_minute: number | null;
  match_injury: number | null;
}

const liveResults: Record<number, LiveResultRow> = {};

export async function loadLiveResults(): Promise<void> {
  try {
    const data = await apiFetch<{ results: LiveResultRow[] }>('/api/match-results');
    for (const row of data.results ?? []) {
      liveResults[row.match_num] = row;
    }
  } catch { /* non-fatal */ }
}

export function getLiveTeams(matchNum: number): {
  home: string | null;
  away: string | null;
  homeScore: number | null;
  awayScore: number | null;
  status: string;
  matchMinute: number | null;
  matchInjury: number | null;
} | null {
  const r = liveResults[matchNum];
  if (!r) return null;
  if (r.home_team && r.away_team) {
    return {
      home: r.home_team,
      away: r.away_team,
      homeScore: r.home_score,
      awayScore: r.away_score,
      status: r.status,
      matchMinute: r.match_minute ?? null,
      matchInjury: r.match_injury ?? null,
    };
  }
  return null;
}
