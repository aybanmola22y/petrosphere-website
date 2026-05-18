import "server-only";

import type { MetadataRoute } from "next";

import { getCachedCmsSnapshot, getCachedPublicCatalog } from "@/lib/server-cache";
import { getCompanyNewsForSite } from "@/lib/site-content";
import type { CompanyNewsItem } from "@/data/companyNews";
import { getSiteUrl } from "@/lib/site-url";

const FETCH_TIMEOUT_MS = 8_000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error("timeout")), ms);
    }),
  ]);
}

function parseLastModified(publishedAt: string | undefined): Date {
  if (!publishedAt) return new Date();
  const d = new Date(publishedAt);
  return Number.isNaN(d.getTime()) ? new Date() : d;
}

function safePathUrl(base: string, pathname: string): string | null {
  const slug = pathname.trim();
  if (!slug) return null;
  try {
    return new URL(slug.startsWith("/") ? slug : `/${slug}`, base).toString();
  } catch {
    return null;
  }
}

function staticEntries(base: string, now: Date): MetadataRoute.Sitemap {
  return [
    { url: base, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/courses`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/schedule`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/services`, lastModified: now, changeFrequency: "monthly", priority: 0.75 },
    { url: `${base}/review`, lastModified: now, changeFrequency: "monthly", priority: 0.75 },
  ];
}

async function courseEntries(base: string, now: Date): Promise<MetadataRoute.Sitemap> {
  try {
    const courses = await withTimeout(getCachedPublicCatalog(), FETCH_TIMEOUT_MS);
    const seen = new Set<string>();
    const entries: MetadataRoute.Sitemap = [];

    for (const course of courses) {
      const slug = course.slug?.trim();
      if (!slug || seen.has(slug)) continue;
      seen.add(slug);
      const url = safePathUrl(base, `/courses/${encodeURIComponent(slug)}`);
      if (!url) continue;
      entries.push({
        url,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }
    return entries;
  } catch (e) {
    console.warn("sitemap: courses skipped", e);
    return [];
  }
}

async function loadNewsForSitemap(): Promise<CompanyNewsItem[]> {
  const bySlug = new Map(getCompanyNewsForSite().map((item) => [item.slug, item]));

  try {
    const stored = await withTimeout(getCachedCmsSnapshot(), 3_000);
    for (const item of stored.authoredNews ?? []) bySlug.set(item.slug, item);
    for (const item of stored.fetchedOverrides ?? []) bySlug.set(item.slug, item);
  } catch (e) {
    console.warn("sitemap: CMS news skipped", e);
  }

  return Array.from(bySlug.values());
}

async function newsEntries(base: string): Promise<MetadataRoute.Sitemap> {
  try {
    const seen = new Set<string>();
    const entries: MetadataRoute.Sitemap = [];

    for (const item of await loadNewsForSitemap()) {
      const slug = item.slug?.trim();
      if (!slug || seen.has(slug)) continue;
      seen.add(slug);
      const url = safePathUrl(base, `/news/${encodeURIComponent(slug)}`);
      if (!url) continue;
      entries.push({
        url,
        lastModified: parseLastModified(item.publishedAt),
        changeFrequency: "monthly",
        priority: 0.65,
      });
    }
    return entries;
  } catch (e) {
    console.warn("sitemap: news skipped", e);
    return [];
  }
}

/** Build sitemap entries without throwing (safe for Googlebot). */
export async function buildSitemapEntries(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const now = new Date();

  const [coursePages, newsPages] = await Promise.all([
    courseEntries(base, now),
    newsEntries(base),
  ]);

  return [...staticEntries(base, now), ...coursePages, ...newsPages];
}
