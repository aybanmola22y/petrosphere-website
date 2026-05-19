/**
 * Canonical slug format for news routes and Petrosphere fetch matching.
 * WordPress paths often produce trailing hyphens or emoji in the post slug; strip both.
 */

export function canonicalNewsSlug(slug: string): string {
  try {
    const decoded = decodeURIComponent(slug.trim()).toLowerCase();
    const ascii = decoded
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "");
    return ascii;
  } catch {
    return slug
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
}

/** Safe news URL segment — returns null for empty or malicious slugs. */
export function normalizeNewsRouteSlug(slug: string): string | null {
  const cleaned = canonicalNewsSlug(slug);
  if (!cleaned || cleaned.length > 200) return null;
  if (/[./\\]|\.\.|%2f|%5c/i.test(cleaned)) return null;
  if (!/^[a-z0-9]+(?:[-_][a-z0-9]+)*$/.test(cleaned)) return null;
  return cleaned;
}

export function newsSlugsMatch(a: string, b: string): boolean {
  const ca = canonicalNewsSlug(a);
  const cb = canonicalNewsSlug(b);
  if (!ca || !cb) return false;
  if (ca === cb) return true;
  // Long Petrosphere slugs: tolerate minor tail differences (e.g. princesa vs princess).
  const minLen = Math.min(ca.length, cb.length);
  if (minLen >= 48 && Math.abs(ca.length - cb.length) <= 2) {
    const prefixLen = Math.floor(minLen * 0.85);
    if (ca.slice(0, prefixLen) === cb.slice(0, prefixLen)) return true;
  }
  return false;
}

/** Route-safe slug for lookups — never rejects emoji-stripped slugs. */
export function resolveNewsSlugParam(slug: string): string | null {
  const resolved = normalizeNewsRouteSlug(slug) ?? canonicalNewsSlug(slug);
  return resolved || null;
}
