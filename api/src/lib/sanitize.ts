import sanitizeHtml from 'sanitize-html';
import { isAddress, normalizeAddress } from './address';

// Allow-list, not block-list: anything not named here is removed.
export function sanitizeSiteHtml(dirty: string): string {
  return sanitizeHtml(dirty, {
    allowedTags: [
      'h1', 'h2', 'h3', 'h4', 'p', 'a', 'ul', 'ol', 'li', 'em', 'strong',
      'blockquote', 'code', 'pre', 'br', 'hr', 'span', 'div',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
    ],
    allowedAttributes: { a: ['href', 'data-address'] },
    transformTags: {
      a: (_tag, attribs) => {
        const address = normalizeAddress(attribs.href ?? '');
        const out: Record<string, string> = {};
        // Only "name.zz" is a link. javascript:, http://evil.com, etc. become plain text.
        if (!isAddress(address)) return { tagName: 'span', attribs: out };
        out.href = '#';
        out['data-address'] = address;
        return { tagName: 'a', attribs: out };
      },
    },
  });
}

// Plain text of a page, used for search.
export function toBodyText(html: string): string {
  return sanitizeHtml(html.replace(/></g, '> <'), { allowedTags: [], allowedAttributes: {} })
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}