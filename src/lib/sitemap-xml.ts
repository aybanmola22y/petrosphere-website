import "server-only";

import type { CompanyNewsItem } from "@/data/companyNews";
import { resolveCatalogList } from "@/lib/catalog";
import { fetchCatalogCourses } from "@/lib/catalog-tms";
import { getCompanyNewsForSite } from "@/lib/site-content";
import { getSiteUrl } from "@/lib/site-url";
import {
  staticSitemapUrls,
  urlsToSitemapXml,
  type SitemapUrl,
} from "@/lib/sitemap-xml-core";

const FETCH_TIMEOUT_MS = 6_000;

export type { SitemapUrl } from "@/lib/sitemap-xml-core";
export { escapeXml, urlsToSitemapXml } from "@/lib/sitemap-xml-core";

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error("timeout")), ms);
    }),
  ]);
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

/** Build sitemap XML (server components / API). */
export async function buildSitemapXml(): Promise<string> {
  const base = getSiteUrl();
  const deduped = new Map<string, SitemapUrl>();

  for (const entry of staticSitemapUrls(base)) deduped.set(entry.loc, entry);

  const [courseUrls, newsUrls] = await Promise.all([loadCourseUrls(base), Promise.resolve(loadNewsUrls(base))]);

  for (const entry of [...courseUrls, ...newsUrls]) deduped.set(entry.loc, entry);

  return urlsToSitemapXml([...deduped.values()]);
}

export function buildStaticSitemapXml(): string {
  return urlsToSitemapXml(staticSitemapUrls(getSiteUrl()));
}
