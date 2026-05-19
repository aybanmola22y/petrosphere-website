import "server-only";

import type { CompanyNewsItem } from "@/data/companyNews";
import { resolveCatalogList } from "@/lib/catalog";
import { fetchCatalogCourses } from "@/lib/catalog-tms";
import { getCompanyNewsForSite } from "@/lib/site-content";
import { getSiteUrl } from "@/lib/site-url";

const FETCH_TIMEOUT_MS = 6_000;

export type SitemapUrl = {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: string;
};

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error("timeout")), ms);
    }),
  ]);
}

export function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toIsoDate(input: string | undefined): string {
  if (!input) return new Date().toISOString();
  const d = new Date(input);
  return Number.isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

function safeLoc(base: string, pathname: string): string | null {
  try {
    const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
    return new URL(path, base).toString();
  } catch {
    return null;
  }
}

export function urlsToSitemapXml(urls: SitemapUrl[]): string {
  const body = urls
    .map((entry) => {
      const lines = [`    <loc>${escapeXml(entry.loc)}</loc>`];
      if (entry.lastmod) lines.push(`    <lastmod>${escapeXml(entry.lastmod)}</lastmod>`);
      if (entry.changefreq) lines.push(`    <changefreq>${escapeXml(entry.changefreq)}</changefreq>`);
      if (entry.priority) lines.push(`    <priority>${escapeXml(entry.priority)}</priority>`);
      return `  <url>\n${lines.join("\n")}\n  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

function staticUrls(base: string): SitemapUrl[] {
  const now = new Date().toISOString();
  return [
    { loc: base, lastmod: now, changefreq: "weekly", priority: "1" },
    { loc: `${base}/about`, lastmod: now, changefreq: "monthly", priority: "0.8" },
    { loc: `${base}/courses`, lastmod: now, changefreq: "daily", priority: "0.9" },
    { loc: `${base}/schedule`, lastmod: now, changefreq: "daily", priority: "0.9" },
    { loc: `${base}/services`, lastmod: now, changefreq: "monthly", priority: "0.75" },
    { loc: `${base}/review`, lastmod: now, changefreq: "monthly", priority: "0.75" },
  ];
}

async function loadCourseUrls(base: string): Promise<SitemapUrl[]> {
  const now = new Date().toISOString();
  const seen = new Set<string>();
  const entries: SitemapUrl[] = [];

  try {
    const remote = await withTimeout(fetchCatalogCourses(), FETCH_TIMEOUT_MS);
    const courses = resolveCatalogList(remote);
    for (const course of courses) {
      const slug = course.slug?.trim();
      if (!slug || seen.has(slug)) continue;
      seen.add(slug);
      const loc = safeLoc(base, `/courses/${encodeURIComponent(slug)}`);
      if (!loc) continue;
      entries.push({ loc, lastmod: now, changefreq: "weekly", priority: "0.8" });
    }
  } catch (e) {
    console.warn("sitemap: courses skipped", e);
  }

  return entries;
}

function loadNewsUrls(base: string): SitemapUrl[] {
  const seen = new Set<string>();
  const entries: SitemapUrl[] = [];

  let items: CompanyNewsItem[] = [];
  try {
    items = getCompanyNewsForSite();
  } catch (e) {
    console.warn("sitemap: news skipped", e);
    return entries;
  }

  for (const item of items) {
    const slug = item.slug?.trim();
    if (!slug || seen.has(slug)) continue;
    seen.add(slug);
    const loc = safeLoc(base, `/news/${slug}`);
    if (!loc) continue;
    entries.push({
      loc,
      lastmod: toIsoDate(item.publishedAt),
      changefreq: "monthly",
      priority: "0.65",
    });
  }

  return entries;
}

/** Build sitemap XML without Next.js MetadataRoute (reliable for Googlebot). */
export async function buildSitemapXml(): Promise<string> {
  const base = getSiteUrl();
  const deduped = new Map<string, SitemapUrl>();

  for (const entry of staticUrls(base)) deduped.set(entry.loc, entry);

  const [courseUrls, newsUrls] = await Promise.all([loadCourseUrls(base), Promise.resolve(loadNewsUrls(base))]);

  for (const entry of [...courseUrls, ...newsUrls]) deduped.set(entry.loc, entry);

  return urlsToSitemapXml([...deduped.values()]);
}

export function buildStaticSitemapXml(): string {
  return urlsToSitemapXml(staticUrls(getSiteUrl()));
}
