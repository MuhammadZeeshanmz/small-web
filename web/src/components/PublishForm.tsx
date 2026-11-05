'use client';

import { useState } from 'react';
import { publishSite } from '@/lib/api';
import styles from './Browser.module.css';

export function PublishForm({
  people,
  defaultAuthor,
  onCancel,
  onPublished,
}: {
  people: string[];
  defaultAuthor: string;
  onCancel: () => void;
  onPublished: (address: string) => void;
}) {
  const [address, setAddress] = useState('');
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState(defaultAuthor);
  const [html, setHtml] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const r = await publishSite({ address, title, html, author });
      if (r.ok) onPublished(r.address);
      else setError(r.error);
    } catch {
      setError('Cannot reach the API on port 4000.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={styles.results}>
      <form className={styles.form} onSubmit={submit}>
        <h1>Publish a site</h1>
        <label>
          Address
          <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="mypage.zz" required />
        </label>
        <label>
          Title
          <input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </label>
        <label>
          Author
          <select value={author} onChange={(e) => setAuthor(e.target.value)}>
            {people.map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>
        </label>
        <label>
          Page (HTML)
          <textarea
            value={html}
            onChange={(e) => setHtml(e.target.value)}
            rows={12}
            placeholder={'<h1>Hello</h1>\n<p>My page. See <a href="index.zz">the index</a>.</p>'}
            required
          />
        </label>
        <p className={styles.hint}>
          Headings, text, lists, tables and links to other .zz addresses are kept. Scripts, styles, forms,
          images and outside links are removed.
        </p>
        {error && <div className={styles.error}>{error}</div>}
        <div className={styles.formActions}>
          <button type="submit" className={styles.primary} disabled={busy}>
            {busy ? 'Publishing…' : 'Publish'}
          </button>
          <button type="button" className={styles.tool} onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}