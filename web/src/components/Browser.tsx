'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { getPeople, getSite, recordVisit, searchSites, type Via } from '@/lib/api';
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
import { SearchResults } from './SearchResults';
import { HistoryPanel } from './HistoryPanel';
import { PublishForm } from './PublishForm';
import styles from './Browser.module.css';

let nextId = 1;
const OFFLINE = 'Cannot reach the API on port 4000.';

export function Browser() {
  const [people, setPeople] = useState<string[]>([]);
  const [person, setPerson] = useState('');
  const [navs, setNavs] = useState<Record<string, Nav>>({}); // one session per person
  const [draft, setDraft] = useState<string | null>(null); // address typed, until it loads
  const [qDraft, setQDraft] = useState<string | null>(null); // search typed, until it runs
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [historyOpen, setHistoryOpen] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [tick, setTick] = useState(0); // bumps when a visit is recorded, so history refreshes
  const reqRef = useRef(0); // lets a newer navigation cancel an older one
  const scrollRef = useRef<(() => number) | null>(null);

  useEffect(() => {
    getPeople()
      .then((list) => {
        setPeople(list);
        setPerson(list[0] ?? '');
      })
      .catch(() => setError(OFFLINE));
  }, []);

  const nav = navs[person] ?? empty;
  const entry = current(nav);
  const shown = entry?.kind === 'site' ? entry.address : '';
  const shownQuery = entry?.kind === 'search' ? entry.query : '';

  const update = (p: string, fn: (n: Nav) => Nav) =>
    setNavs((prev) => ({ ...prev, [p]: fn(prev[p] ?? empty) }));

  // Remember where the page in front of us was scrolled to, before we leave it.
  function rememberScroll(p: string) {
    const y = scrollRef.current?.();
    if (y != null) update(p, (n) => saveScroll(n, y));
  }

  const logVisit = (address: string, via: Via, status: Page['status']) =>
    recordVisit({ person, address, via, status })
      .then(() => setTick((t) => t + 1))
      .catch(() => {});

  // Typed address, followed link, search result or history item.
  // The old page stays up until the new one has loaded.
  async function go(raw: string, via: Via) {
    const address = normalizeAddress(raw);
    if (!person || !address) return;
    const p = person;
    const token = ++reqRef.current;
    setLoading(true);
    setError('');
    setPublishing(false);
    rememberScroll(p);

    let page: Page;
    try {
      const site = await getSite(address);
      page = site ? { status: 'shown', title: site.title, html: site.html } : { status: 'nowhere' };
    } catch {
      if (token === reqRef.current) {
        setLoading(false);
        setError(OFFLINE);
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

  // A search is a place in history too, so Back can return to its results.
  async function runSearch(raw: string) {
    const query = raw.trim();
    if (!person || !query) return;
    const p = person;
    const token = ++reqRef.current;
    setLoading(true);
    setError('');
    setPublishing(false);
    rememberScroll(p);

    let hits;
    try {
      hits = await searchSites(query);
    } catch {
      if (token === reqRef.current) {
        setLoading(false);
        setError(OFFLINE);
      }
      return;
    }
    if (token !== reqRef.current) return;

    const e = { id: nextId++, kind: 'search' as const, query, scrollY: 0, hits };
    update(p, (n) => visit(n, e));
    setQDraft(null);
    setDraft(null);
    setLoading(false);
  }

  function step(dir: -1 | 1) {
    const target = nav.entries[nav.index + dir];
    if (!person || !target) return;
    reqRef.current++; // cancel anything still loading
    setLoading(false);
    setDraft(null);
    setQDraft(null);
    setPublishing(false);
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
    setQDraft(null);
    setPublishing(false);
    setPerson(name);
  }

  function openPublish() {
    if (person) rememberScroll(person);
    setPublishing(true);
  }

  let view: ReactNode;
  if (!entry) {
    view = (
      <div className={styles.notice}>
        <h1>Small Web</h1>
        <p>
          Type an address above, for example <code>index.zz</code>, or search the whole web.
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
  } else {
    view = (
      <SearchResults
        key={entry.id}
        query={entry.query}
        hits={entry.hits}
        scrollY={entry.scrollY}
        onOpen={(a) => void go(a, 'search')}
        scrollRef={scrollRef}
      />
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
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void runSearch(qDraft ?? shownQuery);
          }}
        >
          <input
            className={styles.search}
            value={qDraft ?? shownQuery}
            onChange={(e) => setQDraft(e.target.value)}
            placeholder="Search the web"
            spellCheck={false}
            autoComplete="off"
            aria-label="Search"
          />
        </form>
        <button
          className={`${styles.tool} ${historyOpen ? styles.toolOn : ''}`}
          onClick={() => setHistoryOpen((o) => !o)}
        >
          History
        </button>
        <button className={styles.tool} onClick={openPublish} disabled={!person}>
          Publish
        </button>
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
      <div className={styles.body}>
        <main className={styles.view}>
          {publishing ? (
            <PublishForm
              key={person}
              people={people}
              defaultAuthor={person}
              onCancel={() => setPublishing(false)}
              onPublished={(address) => {
                setPublishing(false);
                void go(address, 'typed');
              }}
            />
          ) : (
            view
          )}
        </main>
        {historyOpen && person && (
          <HistoryPanel
            person={person}
            refreshKey={tick}
            onOpen={(a) => void go(a, 'history')}
            onClose={() => setHistoryOpen(false)}
          />
        )}
      </div>
    </div>
  );
}