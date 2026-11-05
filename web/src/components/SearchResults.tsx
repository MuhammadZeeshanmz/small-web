'use client';

import { useEffect, useRef } from 'react';
import type { SearchHit } from '@/lib/nav';
import styles from './Browser.module.css';

export function SearchResults({
  query,
  hits,
  scrollY,
  onOpen,
  scrollRef,
}: {
  query: string;
  hits: SearchHit[];
  scrollY: number;
  onOpen: (address: string) => void;
  scrollRef: { current: (() => number) | null };
}) {
  const box = useRef<HTMLDivElement>(null);
  const initial = useRef(scrollY); // where the results were left, when we come back to them

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    el.scrollTop = initial.current;
    scrollRef.current = () => el.scrollTop;
    return () => {
      scrollRef.current = null;
    };
  }, [scrollRef]);

  return (
    <div className={styles.results} ref={box}>
      <div className={styles.resultsInner}>
        <p className={styles.resultsHead}>
          {hits.length} {hits.length === 1 ? 'page' : 'pages'} for &ldquo;{query}&rdquo;
        </p>
        {hits.length === 0 && <p>Nothing on the web mentions that.</p>}
        {hits.map((h) => (
          <div className={styles.hit} key={h.address}>
            <a
              className={styles.hitTitle}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onOpen(h.address);
              }}
            >
              {h.title}
            </a>
            <div className={styles.hitAddr}>
              {h.address} &middot; by {h.author}
            </div>
            <p className={styles.hitSnippet}>{h.snippet}</p>
          </div>
        ))}
      </div>
    </div>
  );
}