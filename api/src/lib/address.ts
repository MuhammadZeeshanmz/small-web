// An address is "name.zz" and nothing else: no scheme, no path.
export const ADDRESS_RE = /^[a-z0-9]+(-[a-z0-9]+)*\.zz$/;

export function normalizeAddress(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/^[a-z][a-z0-9+.-]*:\/\//, '') // drop http:// etc.
    .replace(/\/+$/, ''); // drop trailing slash
}

export const isAddress = (s: string) => ADDRESS_RE.test(s);