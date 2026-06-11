import { GROUPS_DATA } from './data';

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

export function isPastDeadline(): boolean {
  return Date.now() >= DEADLINE;
}

export function isReadOnly(): boolean {
  return state.locked || isPastDeadline() || state.isViewing;
}

// Injected by the worker into the HTML page via a script tag
declare const __DEADLINE_MS__: number;
declare const __GROUPS_JSON__: string;

// We read these from the window globals set by the worker (see worker/routes/html.ts)
export const DEADLINE: number = (window as any).__DEADLINE_MS__;
