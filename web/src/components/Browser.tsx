'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { getPeople, getSite, recordVisit, type Via } from '@/lib/api';
import { normalizeAddress } from '@/lib/address';
import {
  back,
  canBack,
  canForward,
  current,
  empty,
  forward,
  saveScroll,
  visit,
  type Nav,
  type Page,
} from '@/lib/nav';
import { SiteFrame } from './SiteFrame';
import styles from './Browser.module.css';

let nextId = 1;

export function Browser() {
  const [people, setPeople] = useState<string[]>([]);
  const [person, setPerson] = useState('');
  const [navs, setNavs] = useState<Record<string, Nav>>({}); // one session per person
  const [draft, setDraft] = useState<string | null>(null); // what is typed, until it loads
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const reqRef = useRef(0); // lets a newer navigation cancel an older one
  const scrollRef = useRef<(() => number) | null>(null);

  useEffect(() => {
    getPeople()
      .then((list) => {
        setPeople(list);
        setPerson(list[0] ?? '');
      })
      .catch(() => setError('Cannot reach the API on port 4000.'));
  }, []);

  const nav = navs[person] ?? empty;
  const entry = current(nav);
  const shown = entry?.kind === 'site' ? entry.address : '';

  const update = (p: string, fn: (n: Nav) => Nav) =>
    setNavs((prev) => ({ ...prev, [p]: fn(prev[p] ?? empty) }));

  const logVisit = (address: string, via: Via, status: Page['status']) =>
    recordVisit({ person, address, via, status }).catch(() => {});

  // Typed address or followed link. The old page stays up until the new one has loaded.
  async function go(raw: string, via: Via) {
    const address = normalizeAddress(raw);
    if (!person || !address) return;
    const p = person;
    const token = ++reqRef.current;
    setLoading(true);
    setError('');

    const y = scrollRef.current?.();
    if (y != null) update(p, (n) => saveScroll(n, y));

    let page: Page;
    try {
      const site = await getSite(address);
      page = site ? { status: 'shown', title: site.title, html: site.html } : { status: 'nowhere' };
    } catch {
      if (token === reqRef.current) {
        setLoading(false);
        setError('Cannot reach the API on port 4000.');
      }
      return;
    }
    if (token !== reqRef.current) return; // superseded by a newer navigation

    const e = { id: nextId++, kind: 'site' as const, address, scrollY: 0, page };
    update(p, (n) => visit(n, e));
    setDraft(null);
    setLoading(false);
    void logVisit(address, via, page.status);
  }

  function step(dir: -1 | 1) {
    const target = nav.entries[nav.index + dir];
    if (!person || !target) return;
    reqRef.current++; // cancel anything still loading
    setLoading(false);
    setDraft(null);
    const y = scrollRef.current?.();
    update(person, (n) => {
      const saved = y != null ? saveScroll(n, y) : n;
      return dir === -1 ? back(saved) : forward(saved);
    });
    if (target.kind === 'site') {
      void logVisit(target.address, dir === -1 ? 'back' : 'forward', target.page.status);
    }
  }

  function switchPerson(name: string) {
    reqRef.current++;
    setLoading(false);
    setDraft(null);
    setPerson(name);
  }

  let view: ReactNode = null;
  if (!entry) {
    view = (
      <div className={styles.notice}>
        <h1>Small Web</h1>
        <p>
          Type an address above, for example <code>index.zz</code>.
        </p>
      </div>
    );
  } else if (entry.kind === 'site' && entry.page.status === 'shown') {
    view = (
      <SiteFrame
        key={entry.id}
        html={entry.page.html}
        scrollY={entry.scrollY}
        onLink={(a) => void go(a, 'link')}
        scrollRef={scrollRef}
      />
    );
  } else if (entry.kind === 'site') {
    view = (
      <div className={styles.notice}>
        <h1>No such address</h1>
        <p>
          <code>{entry.address}</code> leads nowhere. Nothing was ever published there.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.shell}>
      <header className={styles.chrome}>
        <button className={styles.nav} onClick={() => step(-1)} disabled={!canBack(nav)} aria-label="Back">
          ←
        </button>
        <button className={styles.nav} onClick={() => step(1)} disabled={!canForward(nav)} aria-label="Forward">
          →
        </button>
        <form
          className={styles.bar}
          onSubmit={(e) => {
            e.preventDefault();
            void go(draft ?? shown, 'typed');
          }}
        >
          <input
            className={styles.input}
            value={draft ?? shown}
            onChange={(e) => setDraft(e.target.value)}
            onFocus={(e) => e.currentTarget.select()}
            placeholder="Type an address, e.g. index.zz"
            spellCheck={false}
            autoComplete="off"
            aria-label="Address"
          />
        </form>
        <select
          className={styles.person}
          value={person}
          onChange={(e) => switchPerson(e.target.value)}
          aria-label="Browsing as"
        >
          {people.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </header>
      {error && <div className={styles.error}>{error}</div>}
      <div className={loading ? styles.progress : styles.idle} />
      <main className={styles.view}>{view}</main>
    </div>
  );
}