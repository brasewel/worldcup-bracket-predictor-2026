import { GROUPS_DATA } from './data';

// June 11, 2026 3:00 PM ET = 19:00 UTC (first match kickoff)
export const DEADLINE: number = new Date('2026-06-11T19:00:00Z').getTime();

export interface AppState {
  name: string;
  email: string;
  groups: Record<string, string[]>;
  knockout: Record<string, string>;
  predicted3rd: Record<string, string>;
  locked: boolean;
  isViewing: boolean;
  viewingName: string;
  bracketLoaded: boolean;
}

export const state: AppState = {
  name: '',
  email: '',
  groups: {},
  knockout: {},
  predicted3rd: {},
  locked: false,
  isViewing: false,
  viewingName: '',
  bracketLoaded: false,
};

export function resetGroupsToDefault(): void {
  Object.entries(GROUPS_DATA).forEach(([g, teams]) => {
    state.groups[g] = teams.map(t => t.name);
  });
}

// Initialise groups from defaults on load
resetGroupsToDefault();

export let lastSavedAt: number | null = null;
export function setLastSavedAt(ts: number | null): void { lastSavedAt = ts; }

export function isPastDeadline(): boolean {
  return Date.now() >= DEADLINE;
}

export function isReadOnly(): boolean {
  return state.locked || isPastDeadline() || state.isViewing;
}
