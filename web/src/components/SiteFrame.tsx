'use client';

import { useEffect, useMemo, useRef } from 'react';
import styles from './Browser.module.css';

// No network, no scripts, only inline styles of our own.
const CSP = "default-src 'none'; style-src 'unsafe-inline'";

function buildDoc(body: string) {
  return `<!doctype html><html><head><meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="${CSP}">
<style>
body{font:17px/1.7 Georgia,'Times New Roman',serif;max-width:44rem;margin:0 auto;padding:2.5rem 1.5rem 4rem;color:#1f2937;background:#fff}
h1{font:700 2rem/1.2 'Segoe UI',system-ui,sans-serif;letter-spacing:-.02em;margin:0 0 1rem}
h2{font:650 1.3rem/1.3 'Segoe UI',system-ui,sans-serif;margin:2rem 0 .5rem}
p{margin:0 0 1rem}
a{color:#4f46e5;text-underline-offset:3px;cursor:pointer}
a:hover{color:#3730a3}
ul,ol{padding-left:1.25rem}li{margin:.35rem 0}
table{border-collapse:collapse}td,th{border:1px solid #e5e7eb;padding:.4rem .7rem}
blockquote{margin:1rem 0;padding-left:1rem;border-left:3px solid #c7d2fe;color:#4b5563}
code,pre{background:#f3f4f6;border-radius:.25rem;padding:.1rem .3rem}
</style></head><body>${body}</body></html>`;
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