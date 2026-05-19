import "server-only";

import fs from "fs";

import type { CompanyNewsItem } from "@/data/companyNews";
import { companyNewsItems } from "@/data/companyNews";
import type { StudentVideoTestimonial } from "@/data/siteMarketingDefaults";
import { stats as defaultStats, studentVideoTestimonials as defaultVideoTestimonials } from "@/data/siteMarketingDefaults";

import type { SiteContentSnapshot, SiteStat } from "@/types/site-content";
import { getLocalContentPath } from "./site-content-path";
import { fetchPetrosphereLatestNews, fetchPetrosphereNewsArticleByUrl } from "@/lib/petrosphere-latest-news";
import {
  assertSiteContentWritable,
  getSiteContentStorage,
  isSupabaseSiteContentEnabled,
} from "@/lib/supabase/env";
import {
  fetchNewsBySlugFromCms,
  isAuthoredNewsId,
  persistCmsToSupabase,
  readCmsFromSupabase,
} from "@/lib/site-content-supabase";
import {
  capVideoTestimonialsNewestFirst,
  videoTestimonialsForHomepageDisplay,
} from "@/lib/video-testimonials";
import { canonicalNewsSlug, newsSlugsMatch, normalizeNewsRouteSlug } from "@/lib/news-slug";
import { getCachedCmsSnapshot, getCachedPetrosphereNews } from "@/lib/server-cache";

export type { SiteContentSnapshot, SiteStat } from "@/types/site-content";

type StoredShape = Partial<SiteContentSnapshot> & {
  /**
   * When using "Option B" persistence, we store only overrides and deletions
   * (not the full fetched list).
   */
  removedNewsSlugs?: string[];
  authoredNews?: CompanyNewsItem[];
  fetchedOverrides?: CompanyNewsItem[];
};

function readStoredFromFile(): StoredShape | null {
  try {
    const p = getLocalContentPath();
    if (!fs.existsSync(p)) return null;
    return JSON.parse(fs.readFileSync(p, "utf-8")) as StoredShape;
  } catch {
    return null;
  }
}

type StoredNewsParts = {
  authored: CompanyNewsItem[];
  overrides: CompanyNewsItem[];
  hiddenSlugs: string[];
};

function splitStoredNews(stored: StoredShape | null): StoredNewsParts {
  if (!stored) return { authored: [], overrides: [], hiddenSlugs: [] };

  const hiddenSlugs = stored.removedNewsSlugs ?? [];
  if (Array.isArray(stored.authoredNews) || Array.isArray(stored.fetchedOverrides)) {
    return {
      authored: stored.authoredNews ?? [],
      overrides: stored.fetchedOverrides ?? [],
      hiddenSlugs,
    };
  }

  const news = stored.news ?? [];
  return {
    authored: news.filter((n) => isAuthoredNewsId(n.id)),
    overrides: news.filter((n) => !isAuthoredNewsId(n.id)),
    hiddenSlugs,
  };
}

function mergeNewsFromParts(
  fetched: CompanyNewsItem[],
  authored: CompanyNewsItem[],
  overrides: CompanyNewsItem[],
  hiddenSlugs: string[],
): CompanyNewsItem[] {
  const bySlug = new Map<string, CompanyNewsItem>();
  for (const item of fetched) bySlug.set(item.slug, item);
  for (const item of overrides) bySlug.set(item.slug, item);
  for (const item of authored) bySlug.set(item.slug, item);

  const hidden = new Set(hiddenSlugs.map((s) => s.toLowerCase()));
  return Array.from(bySlug.values())
    .filter((n) => !hidden.has(n.slug.toLowerCase()))
    .sort(compareNewsNewestFirst);
}

async function readStoredUncached(): Promise<StoredShape | null> {
  if (isSupabaseSiteContentEnabled()) {
    try {
      const cms = await readCmsFromSupabase();
      return {
        news: cms.news,
        authoredNews: cms.authoredNews,
        fetchedOverrides: cms.fetchedOverrides,
        removedNewsSlugs: cms.removedNewsSlugs,
        videoTestimonials: cms.videoTestimonials,
        stats: cms.stats,
      };
    } catch (e) {
      console.error("CMS Supabase read failed, falling back to file:", e);
    }
  }
  return readStoredFromFile();
}

async function readStoredForPublic(): Promise<StoredShape | null> {
  if (isSupabaseSiteContentEnabled()) {
    try {
      return await getCachedCmsSnapshot();
    } catch (e) {
      console.error("CMS Supabase read failed, falling back to file:", e);
    }
  }
  return readStoredFromFile();
}

function applyNewsOverrides(base: CompanyNewsItem[], overrides?: CompanyNewsItem[], removedSlugs?: string[]): CompanyNewsItem[] {
  const bySlug = new Map<string, CompanyNewsItem>();
  for (const item of base) bySlug.set(item.slug, item);
  if (overrides) {
    for (const item of overrides) bySlug.set(item.slug, item);
  }
  const removed = new Set((removedSlugs ?? []).map((s) => s.toLowerCase()));
  return Array.from(bySlug.values()).filter((n) => !removed.has(n.slug.toLowerCase()));
}

export function getCompanyNewsForSite(): CompanyNewsItem[] {
  // Used for seed-only fallbacks (and static params). Keep it sync.
  const s = readStoredFromFile();
  return applyNewsOverrides(companyNewsItems, s?.news, s?.removedNewsSlugs).sort(compareNewsNewestFirst);
}

/** Admin dashboard assigns ids like `news-1778826122003` (creation time in ms). */
function adminCreatedAtMs(item: CompanyNewsItem): number | null {
  const m = /^news-(\d+)$/.exec(item.id);
  if (!m) return null;
  const ts = Number(m[1]);
  return Number.isFinite(ts) ? ts : null;
}

function compareNewsNewestFirst(a: CompanyNewsItem, b: CompanyNewsItem): number {
  // Primary: publication date (ISO `YYYY-MM-DD`), newest first.
  if (a.publishedAt !== b.publishedAt) {
    return a.publishedAt < b.publishedAt ? 1 : -1;
  }
  // Same calendar day: admin-authored posts before fetched Petrosphere posts.
  const createdA = adminCreatedAtMs(a);
  const createdB = adminCreatedAtMs(b);
  if (createdA !== null || createdB !== null) {
    if (createdA !== null && createdB !== null) return createdB - createdA;
    if (createdA !== null) return -1;
    if (createdB !== null) return 1;
  }
  return 0;
}

function mergeNewsPreferLocal(local: CompanyNewsItem[], incoming: CompanyNewsItem[]): CompanyNewsItem[] {
  const bySlug = new Map<string, CompanyNewsItem>();
  for (const item of local) bySlug.set(item.slug, item);
  for (const item of incoming) {
    if (!bySlug.has(item.slug)) bySlug.set(item.slug, item);
  }
  return Array.from(bySlug.values()).sort(compareNewsNewestFirst);
}

function resolveVideoTestimonialsForSite(stored: StudentVideoTestimonial[] | undefined): StudentVideoTestimonial[] {
  if (stored?.length) {
    return videoTestimonialsForHomepageDisplay(capVideoTestimonialsNewestFirst(stored));
  }
  return videoTestimonialsForHomepageDisplay(defaultVideoTestimonials);
}

const DUMMY_SEED_IDS = new Set<string>([
  "csr-coastal-puerto-princesa",
  "love-affair-nature",
  "moa-spe-psu",
  "safety-leadership-webinar",
  "environmental-health-awareness",
  "bosh-65-trainees",
]);

function removeDummySeedNews(items: CompanyNewsItem[]): CompanyNewsItem[] {
  // Only remove the original seed/dummy items shipped in `src/data/companyNews.ts`.
  // This preserves user-created posts and fetched Petrosphere posts.
  return items.filter((n) => !DUMMY_SEED_IDS.has(n.id) && !DUMMY_SEED_IDS.has(n.slug));
}

/**
 * For the public site: show local/admin-edited posts when present, otherwise
 * fall back to Petrosphere fetch. Does not write to disk.
 */
/** Merged Petrosphere fetch + local overrides, with seed/dummy posts removed. */
export async function getCompanyNewsMergedAsync(limit = 6): Promise<CompanyNewsItem[]> {
  const stored = await readStoredForPublic();
  const { authored, overrides, hiddenSlugs } = splitStoredNews(stored);

  const fetched = await getCachedPetrosphereNews(limit);
  const merged = mergeNewsFromParts(fetched, authored, overrides, hiddenSlugs);
  return removeDummySeedNews(merged).slice(0, limit);
}

export async function getCompanyNewsForHome(limit = 6): Promise<CompanyNewsItem[]> {
  return getCompanyNewsMergedAsync(limit);
}

/**
 * For admin: pull latest Petrosphere posts and merge with local overrides.
 * Does NOT persist fetched posts to disk (Option B behavior).
 */
export async function getSiteContentSnapshotForAdminSync(options?: {
  limit?: number;
  hydrateBodies?: boolean;
}): Promise<SiteContentSnapshot> {
  const limit = options?.limit ?? 12;
  const hydrateBodies = options?.hydrateBodies ?? true;

  const stored = await readStoredUncached();
  const { authored, overrides, hiddenSlugs } = splitStoredNews(stored);

  const storedVideos = Array.isArray(stored?.videoTestimonials) ? stored.videoTestimonials : [];
  const adminVideos = storedVideos.length ? storedVideos : defaultVideoTestimonials;

  const fallbackNews = removeDummySeedNews(
    mergeNewsFromParts([], authored, overrides, hiddenSlugs),
  );

  const base: SiteContentSnapshot = {
    news: fallbackNews,
    videoTestimonials: adminVideos,
    stats: stored?.stats && Array.isArray(stored.stats) ? stored.stats : defaultStats,
  };

  const fetched = await getCachedPetrosphereNews(limit).catch(() => []);

  let hydrated: CompanyNewsItem[] = fetched;
  if (hydrateBodies && fetched.length) {
    const existingSlugs = new Set([...authored, ...overrides].map((n) => n.slug));
    const toHydrate = fetched.filter((n) => !existingSlugs.has(n.slug)).slice(0, limit);
    const hydratedNew = await Promise.all(
      toHydrate.map(async (n) => {
        const src = n.externalHref;
        if (!src) return n;
        return await fetchPetrosphereNewsArticleByUrl(src).catch(() => n);
      }),
    );

    const hydratedBySlug = new Map(hydratedNew.map((n) => [n.slug, n]));
    hydrated = fetched.map((n) => hydratedBySlug.get(n.slug) ?? n);
  }

  if (!hydrated.length) return base;

  const mergedNews = removeDummySeedNews(mergeNewsFromParts(hydrated, authored, overrides, hiddenSlugs));
  return { ...base, news: mergedNews };
}

export function getNewsArticleBySlug(slug: string): CompanyNewsItem | undefined {
  return getCompanyNewsForSite().find((item) => item.slug === slug);
}

export function getRelatedCompanyNews(slug: string, limit = 4): CompanyNewsItem[] {
  return getCompanyNewsForSite()
    .filter((item) => item.slug !== slug)
    .slice(0, limit);
}

export async function getNewsArticleBySlugAsync(slug: string): Promise<CompanyNewsItem | undefined> {
  const normalized = normalizeNewsRouteSlug(slug) ?? canonicalNewsSlug(slug);
  if (!normalized) return undefined;

  if (isSupabaseSiteContentEnabled()) {
    try {
      const fromCms = await fetchNewsBySlugFromCms(normalized);
      if (fromCms) return fromCms;
    } catch (e) {
      console.error("CMS news slug lookup failed:", e);
    }
  }

  const stored = await readStoredForPublic();
  const { authored, overrides, hiddenSlugs } = splitStoredNews(stored);
  const hidden = new Set(hiddenSlugs.map((s) => canonicalNewsSlug(s)));
  if (hidden.has(normalized)) return undefined;

  const localAuthored = authored.find((n) => newsSlugsMatch(n.slug, normalized));
  if (localAuthored) return localAuthored;

  const localOverride = overrides.find((n) => newsSlugsMatch(n.slug, normalized));
  if (localOverride) return localOverride;

  const fetched = await getCachedPetrosphereNews(100).catch(() => []);
  const merged = mergeNewsFromParts(fetched, authored, overrides, hiddenSlugs);
  const fromMerged = merged.find((item) => newsSlugsMatch(item.slug, normalized));
  if (fromMerged) {
    if (fromMerged.externalHref && (!fromMerged.body || fromMerged.body.length <= 1)) {
      try {
        return await fetchPetrosphereNewsArticleByUrl(fromMerged.externalHref);
      } catch {
        return fromMerged;
      }
    }
    return fromMerged;
  }

  return getCompanyNewsForSite().find((item) => newsSlugsMatch(item.slug, normalized));
}

export async function getRelatedCompanyNewsAsync(slug: string, limit = 4): Promise<CompanyNewsItem[]> {
  const normalized = slug.toLowerCase();
  // Fetch extra so we still have `limit` items after excluding the current article.
  const pool = await getCompanyNewsMergedAsync(limit + 8).catch(() => getCompanyNewsForSite());
  return pool.filter((item) => item.slug.toLowerCase() !== normalized).slice(0, limit);
}

export function getVideoTestimonialsForSite(): StudentVideoTestimonial[] {
  return videoTestimonialsForHomepageDisplay(defaultVideoTestimonials);
}

export function getStatsForSite(): SiteStat[] {
  return defaultStats;
}

export async function getVideoTestimonialsForSiteAsync(): Promise<StudentVideoTestimonial[]> {
  const s = await readStoredForPublic();
  return resolveVideoTestimonialsForSite(
    s?.videoTestimonials && Array.isArray(s.videoTestimonials) ? s.videoTestimonials : undefined,
  );
}

export async function getStatsForSiteAsync(): Promise<SiteStat[]> {
  const s = await readStoredForPublic();
  if (s?.stats && Array.isArray(s.stats)) return s.stats;
  return getStatsForSite();
}

export function getSiteContentSnapshot(): SiteContentSnapshot {
  return {
    news: getCompanyNewsForSite(),
    videoTestimonials: getVideoTestimonialsForSite(),
    stats: getStatsForSite(),
  };
}

function stableStringify(obj: unknown): string {
  return JSON.stringify(obj, (_k, v) => (v === undefined ? undefined : v));
}

function pickChangedNewsOverrides(baseline: CompanyNewsItem[], next: CompanyNewsItem[]): {
  overrides: CompanyNewsItem[];
  removedSlugs: string[];
} {
  const baseBySlug = new Map<string, CompanyNewsItem>(baseline.map((n) => [n.slug, n]));
  const nextBySlug = new Map<string, CompanyNewsItem>(next.map((n) => [n.slug, n]));

  const overrides: CompanyNewsItem[] = [];
  for (const [slug, item] of nextBySlug.entries()) {
    const base = baseBySlug.get(slug);
    if (!base) {
      // New local post
      overrides.push(item);
      continue;
    }
    if (stableStringify(base) !== stableStringify(item)) {
      overrides.push(item);
    }
  }

  const removedSlugs: string[] = [];
  for (const slug of baseBySlug.keys()) {
    if (!nextBySlug.has(slug)) removedSlugs.push(slug);
  }

  return { overrides, removedSlugs };
}

export async function persistSiteContent(payload: { baseline: SiteContentSnapshot; data: SiteContentSnapshot }): Promise<void> {
  if (isSupabaseSiteContentEnabled()) {
    await persistCmsToSupabase(payload);
    return;
  }

  assertSiteContentWritable();

  const { baseline, data } = payload;

  const stored: StoredShape = {};

  // Only persist overrides for news (edited/new) and removals.
  const { overrides, removedSlugs } = pickChangedNewsOverrides(baseline.news, data.news);
  if (overrides.length) stored.news = overrides;
  if (removedSlugs.length) stored.removedNewsSlugs = removedSlugs;

  // Persist full sections only when they changed.
  if (stableStringify(baseline.videoTestimonials) !== stableStringify(data.videoTestimonials)) {
    stored.videoTestimonials = data.videoTestimonials;
  }
  if (stableStringify(baseline.stats) !== stableStringify(data.stats)) {
    stored.stats = data.stats;
  }

  fs.writeFileSync(getLocalContentPath(), `${JSON.stringify(stored, null, 2)}\n`, "utf-8");
}

export function siteContentStorageLabel(): "supabase" | "file" {
  return getSiteContentStorage() === "supabase" || isSupabaseSiteContentEnabled() ? "supabase" : "file";
}
