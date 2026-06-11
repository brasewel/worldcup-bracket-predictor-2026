export async function apiFetch<T = unknown>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(path, opts);
  if (!res.ok) {
    const j = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(j.error ?? ('HTTP ' + res.status));
  }
  return res.json() as Promise<T>;
}

export interface BracketListItem {
  email: string;
  display_name: string;
  locked: number;
  updated_at: number;
}

export interface BracketRow {
  email: string;
  display_name: string;
  bracket_data: string;
  locked: number;
  updated_at: number;
}

export async function apiBracketList(): Promise<BracketListItem[]> {
  const data = await apiFetch<{ brackets: BracketListItem[] }>('/api/brackets');
  return data.brackets ?? [];
}

export async function apiBracketGet(email: string): Promise<{ bracket: BracketRow }> {
  return apiFetch<{ bracket: BracketRow }>('/api/brackets/' + encodeURIComponent(email));
}

export async function apiBracketSave(
  email: string,
  displayName: string,
  bracketData: string,
  lock: boolean,
): Promise<void> {
  await apiFetch('/api/brackets/' + encodeURIComponent(email), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ display_name: displayName, bracket_data: bracketData, lock }),
  });
}
