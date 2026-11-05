'use client';

import { useEffect, useState } from 'react';
import { getHistory, type HistoryItem } from '@/lib/api';
import styles from './Browser.module.css';

const when = (iso: string) =>
  new Date(iso).toLocaleString([], {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

export function HistoryPanel({
  person,
  refreshKey,
  onOpen,
  onClose,
}: {
  person: string;
  refreshKey: number;
  onOpen: (address: string) => void;
  onClose: () => void;
}) {
  const [items, setItems] = useState<HistoryItem[] | null>(null);

  useEffect(() => {
    let live = true;
    getHistory(person)
      .then((r) => {
        if (live) setItems(r);
      })
      .catch(() => {
        if (live) setItems([]);
      });
    return () => {
      live = false;
    };
  }, [person, refreshKey]);

  return (
    <aside className={styles.panel}>
      <div className={styles.panelHead}>
        <strong>History: {person}</strong>
        <button className={styles.tool} onClick={onClose}>
          Close
        </button>
      </div>
      <div className={styles.panelList}>
        {items === null && <p className={styles.panelNote}>Loading…</p>}
        {items?.length === 0 && <p className={styles.panelNote}>Nothing yet.</p>}
        {items?.map((it, i) => (
          <button className={styles.histItem} key={`${it.at}-${i}`} onClick={() => onOpen(it.address)}>
            <div className={styles.histTitle}>{it.title ?? 'No such address'}</div>
            <div className={styles.histMeta}>
              {it.address} &middot; {when(it.at)} &middot; {it.via}
              {it.status === 'nowhere' && <span className={styles.badge}>nowhere</span>}
            </div>
          </button>
        ))}
      </div>
    </aside>
  );
}