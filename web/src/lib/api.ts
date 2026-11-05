import type { SearchHit } from './nav';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export type Via = 'typed' | 'link' | 'back' | 'forward' | 'history' | 'search';
export type SiteDoc = { address: string; title: string; html: string; author: string };
export type HistoryItem = {
  address: string;
  title: string | null;
  at: string;
  via: Via;
  status: 'shown' | 'nowhere';
};

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) throw new Error(String(res.status));
  return res.json() as Promise<T>;
}

export const getPeople = () => fetch(`${API}/people`).then((r) => json<string[]>(r));

// null means "no such address".
export async function getSite(address: string): Promise<SiteDoc | null> {
  const res = await fetch(`${API}/sites/${encodeURIComponent(address)}`, { cache: 'no-store' });
  if (res.status === 404) return null;
  return json<SiteDoc>(res);
}

export function recordVisit(v: {
  person: string;
  address: string;
  via: Via;
  status: 'shown' | 'nowhere';
}) {
  return fetch(`${API}/visits`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(v),
  }).then((r) => json<{ ok: boolean }>(r));
}

export const searchSites = (q: string) =>
  fetch(`${API}/search?q=${encodeURIComponent(q)}`, { cache: 'no-store' }).then((r) =>
    json<SearchHit[]>(r),
  );

export const getHistory = (person: string) =>
  fetch(`${API}/people/${encodeURIComponent(person)}/history`, { cache: 'no-store' }).then((r) =>
    json<HistoryItem[]>(r),
  );

export async function publishSite(b: {
  address: string;
  title: string;
  html: string;
  author: string;
}): Promise<{ ok: true; address: string } | { ok: false; error: string }> {
  const res = await fetch(`${API}/sites`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(b),
  });
  if (res.ok) {
    const data = (await res.json()) as { address: string };
    return { ok: true, address: data.address };
  }
  let error = 'Could not publish';
  try {
    const j = (await res.json()) as { message?: string | string[] };
    if (j.message) error = Array.isArray(j.message) ? j.message.join(', ') : j.message;
  } catch {}
  return { ok: false, error };
}