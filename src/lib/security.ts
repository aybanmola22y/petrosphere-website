/**
 * Shared security helpers: URL validation, injection heuristics, and safe rendering.
 */

const EXTERNAL_HTTP = /^https?:\/\//i;

/** Blocks javascript:, data:, vbscript:, and protocol-relative URLs. */
const DANGEROUS_SCHEME = /^(?:javascript|data|vbscript|file):/i;

/** Internal paths: /foo, /foo/bar, /foo#hash, /foo?query=1 */
const SAFE_INTERNAL_PATH =
  /^\/[a-z0-9/_-]*(?:\?[a-z0-9_%.=&-]*)?(?:#[a-z0-9_-]*)?$/i;

const SAFE_CONTENT_ID = /^[a-z0-9][a-z0-9_-]{0,199}$/i;

const SAFE_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/i;

/** High-confidence SQLi signatures (avoid blocking innocent query strings). */
const SQL_INJECTION_PATTERNS = [
  /\bunion\b.+\bselect\b/i,
  /\bselect\b.+\bfrom\b.+\bwhere\b/i,
  /\bdrop\b\s+\b(table|database)\b/i,
  /\binsert\b\s+\binto\b/i,
  /\bdelete\b\s+\bfrom\b/i,
  /\bupdate\b.+\bset\b.+\bwhere\b/i,
  /\bor\b\s+['"]?1['"]?\s*=\s*['"]?1\b/i,
  /'\s*or\s+'1'\s*=\s*'1/i,
  /;\s*drop\b/i,
  /;\s*--/,
  /\/\*[\s\S]*\*\//,
  /\bexec\b\s*\(/i,
  /\bxp_cmdshell\b/i,
];

const PATH_TRAVERSAL_PATTERNS = [
  /\.\./,
  /%2e%2e/i,
  /%252e/i,
  /\\+/,
  /%00/,
  /%5c/i,
];

const XSS_URL_PATTERNS = [
  /<script/i,
  /javascript:/i,
  /data:text\/html/i,
  /on\w+\s*=/i,
];

export function isExternalHref(href: string): boolean {
  return EXTERNAL_HTTP.test(href.trim());
}

export function isSafeExternalUrl(href: string): boolean {
  const trimmed = href.trim();
  if (!trimmed || DANGEROUS_SCHEME.test(trimmed)) return false;
  if (!EXTERNAL_HTTP.test(trimmed)) return false;
  try {
    const url = new URL(trimmed);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function isSafeInternalPath(href: string): boolean {
  const trimmed = href.trim();
  if (!trimmed || !trimmed.startsWith("/")) return false;
  if (DANGEROUS_SCHEME.test(trimmed)) return false;
  if (trimmed.startsWith("//")) return false;
  return SAFE_INTERNAL_PATH.test(trimmed);
}

/** http(s) URL or site-relative asset path (/uploads/...). */
export function isSafeAssetHref(href: string): boolean {
  const trimmed = href.trim();
  if (!trimmed) return false;
  return isSafeExternalUrl(trimmed) || isSafeInternalPath(trimmed);
}

export function isSafeNavHref(href: string): boolean {
  return isSafeExternalUrl(href) || isSafeInternalPath(href);
}

export function isSafeContentId(id: string): boolean {
  return SAFE_CONTENT_ID.test(id.trim());
}

export function isSafeSlug(slug: string): boolean {
  const trimmed = slug.trim();
  if (!trimmed || trimmed.length > 200) return false;
  return SAFE_SLUG.test(trimmed);
}

export function normalizeRouteSlug(slug: string): string {
  const raw = slug.trim();
  if (!raw) return "";
  try {
    const decoded = decodeURIComponent(raw).trim();
    if (!isSafeSlug(decoded)) return "";
    return decoded.toLowerCase();
  } catch {
    return "";
  }
}

export type RenderableHref =
  | { kind: "external"; href: string }
  | { kind: "internal"; href: string };

/** Returns a safe href for <a> or <Link>, or null if untrusted. */
export function resolveRenderableHref(href: string): RenderableHref | null {
  const trimmed = href.trim();
  if (!trimmed) return null;
  if (isSafeExternalUrl(trimmed)) return { kind: "external", href: trimmed };
  if (isSafeInternalPath(trimmed)) return { kind: "internal", href: trimmed };
  return null;
}

function testPatterns(value: string, patterns: RegExp[]): boolean {
  return patterns.some((p) => p.test(value));
}

/** Heuristic scan for SQLi, path traversal, and XSS in URLs (middleware). */
export function isSuspiciousRequestUrl(url: URL): boolean {
  const targets = [url.pathname, url.search, decodeURIComponentSafe(url.pathname), decodeURIComponentSafe(url.search)];

  for (const raw of targets) {
    if (!raw) continue;
    const value = raw.toLowerCase();
    if (testPatterns(value, PATH_TRAVERSAL_PATTERNS)) return true;
    if (testPatterns(value, XSS_URL_PATTERNS)) return true;
    if (testPatterns(value, SQL_INJECTION_PATTERNS)) return true;
  }

  return false;
}

function decodeURIComponentSafe(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

const ALLOWED_HOSTS = new Set([
  "petrosphere.petros-global.com",
  "www.petrosphere.petros-global.com",
  "petrosphere.vercel.app",
  "localhost",
  "127.0.0.1",
]);

/** Prefer configured site URL; only trust forwarded host when allowlisted. */
export function resolveTrustedSiteOrigin(
  forwardedHost: string | null,
  forwardedProto: string | null,
): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (configured) return configured;

  const host = forwardedHost?.split(",")[0]?.trim().toLowerCase();
  if (host && ALLOWED_HOSTS.has(host)) {
    const proto = forwardedProto === "http" ? "http" : "https";
    return `${proto}://${host}`;
  }

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel.replace(/\/$/, "")}`;

  return "http://localhost:3000";
}
