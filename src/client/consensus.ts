import { apiFetch } from './api';
import { getFlagForTeam } from './data';
import { escHtml } from './utils';

interface ConsensusData {
  total_players: number;
  picks: Record<string, Record<string, number>>;
}

let consensusData: ConsensusData | null = null;

export async function loadConsensus(): Promise<void> {
  if (consensusData) return;
  try {
    consensusData = await apiFetch<ConsensusData>('/api/consensus');
  } catch { /* non-fatal */ }
}

export function getConsensusBadge(roundKey: string, matchIdx: number): string {
  if (!consensusData) return '';
  const key = roundKey + '_' + matchIdx;
  const picks = consensusData.picks[key];
  const total = consensusData.total_players;
  if (!picks || !total) return '';
  const topTeam = Object.entries(picks).sort((a, b) => b[1] - a[1])[0];
  if (!topTeam) return '';
  const [team, cnt] = topTeam;
  const flag = getFlagForTeam(team);
  return `<div class="consensus-badge">${flag} ${escHtml(team)} \u00b7 ${cnt}/${total} picked</div>`;
}
