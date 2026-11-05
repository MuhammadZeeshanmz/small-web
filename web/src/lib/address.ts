// Same rules as the API: lowercase, no scheme, no trailing slash.
export function normalizeAddress(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/^[a-z][a-z0-9+.-]*:\/\//, '')
    .replace(/\/+$/, '');
}