export type SearchHit = { address: string; title: string; author: string; snippet: string };

export type Page =
  | { status: 'shown'; title: string; html: string }
  | { status: 'nowhere' };

export type Entry =
  | { id: number; kind: 'site'; address: string; scrollY: number; page: Page }
  | { id: number; kind: 'search'; query: string; scrollY: number; hits: SearchHit[] };

// One browsing session: a list of entries and a pointer into it.
export type Nav = { entries: Entry[]; index: number };

export const empty: Nav = { entries: [], index: -1 };

export const current = (n: Nav): Entry | undefined => n.entries[n.index];
export const canBack = (n: Nav) => n.index > 0;
export const canForward = (n: Nav) => n.index < n.entries.length - 1;

const sameTarget = (a: Entry, b: Entry) =>
  a.kind === 'site' && b.kind === 'site'
    ? a.address === b.address
    : a.kind === 'search' && b.kind === 'search'
      ? a.query === b.query
      : false;

// A new navigation always drops everything ahead of the pointer.
// Going to the page you are already on replaces it instead of stacking a duplicate.
export function visit(n: Nav, e: Entry): Nav {
  const kept = n.entries.slice(0, n.index + 1);
  const cur = kept[kept.length - 1];
  if (cur && sameTarget(cur, e)) {
    kept[kept.length - 1] = e;
  } else {
    kept.push(e);
  }
  return { entries: kept, index: kept.length - 1 };
}

// Remember where the page was scrolled to before leaving it.
export function saveScroll(n: Nav, y: number): Nav {
  const cur = n.entries[n.index];
  if (!cur) return n;
  const entries = n.entries.slice();
  entries[n.index] = { ...cur, scrollY: y };
  return { ...n, entries };
}

export const back = (n: Nav): Nav => (canBack(n) ? { ...n, index: n.index - 1 } : n);
export const forward = (n: Nav): Nav => (canForward(n) ? { ...n, index: n.index + 1 } : n);