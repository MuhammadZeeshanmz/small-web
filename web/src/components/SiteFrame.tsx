'use client';

import { useEffect, useMemo, useRef } from 'react';
import styles from './Browser.module.css';

// No network, no scripts, only inline styles of our own.
const CSP = "default-src 'none'; style-src 'unsafe-inline'";

function buildDoc(body: string) {
  return `<!doctype html><html><head><meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="${CSP}">
<style>body{font:17px/1.65 Georgia,serif;max-width:42rem;margin:2rem auto;padding:0 1.25rem;color:#1f2937;background:#fff}
a{color:#2563eb;cursor:pointer}h1{line-height:1.2}</style></head><body>${body}</body></html>`;
}

export function SiteFrame({
  html,
  scrollY,
  onLink,
  scrollRef,
}: {
  html: string;
  scrollY: number;
  onLink: (address: string) => void;
  scrollRef: { current: (() => number) | null };
}) {
  const srcDoc = useMemo(() => buildDoc(html), [html]);
  const linkRef = useRef(onLink);

  useEffect(() => {
    linkRef.current = onLink;
  });
  useEffect(
    () => () => {
      scrollRef.current = null;
    },
    [scrollRef],
  );

  return (
    <iframe
      className={styles.frame}
      title="page"
      // Containment: no allow-scripts, so nothing inside can run. allow-same-origin
      // lets the browser (parent) read the scroll position and catch link clicks.
      sandbox="allow-same-origin"
      referrerPolicy="no-referrer"
      srcDoc={srcDoc}
      onLoad={(e) => {
        const win = e.currentTarget.contentWindow;
        const doc = e.currentTarget.contentDocument;
        if (!win || !doc) return;
        win.scrollTo(0, scrollY); // restore where the page was left
        scrollRef.current = () => win.scrollY;
        doc.addEventListener('click', (ev) => {
          const a = (ev.target as Element | null)?.closest?.('a');
          if (!a) return;
          ev.preventDefault(); // nothing inside the frame ever navigates by itself
          const address = a.getAttribute('data-address');
          if (address) linkRef.current(address);
        });
      }}
    />
  );
}