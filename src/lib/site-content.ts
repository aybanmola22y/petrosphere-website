import "server-only";

import fs from "fs";

import type { CompanyNewsItem } from "@/data/companyNews";
import { companyNewsItems } from "@/data/companyNews";
import type { StudentVideoTestimonial } from "@/data/siteMarketingDefaults";
import { stats as defaultStats, studentVideoTestimonials as defaultVideoTestimonials } from "@/data/siteMarketingDefaults";

import type { SiteContentSnapshot, SiteStat } from "@/types/site-content";
import { getLocalContentPath } from "./site-content-path";
import { fetchPetrosphereLatestNews, fetchPetrosphereNewsArticleByUrl } from "@/lib/petrosphere-latest-news";

export type { SiteContentSnapshot, SiteStat } from "@/types/site-content";

type StoredShape = Partial<SiteContentSnapshot> & {
  /**
   * When using "Option B" persistence, we store only overrides and deletions
   * (not the full fetched list).
   */
  removedNewsSlugs?: string[];
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

function readStored(): StoredShape | null {
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

function mergeVideoPreferLocal(local: StudentVideoTestimonial[], defaults: StudentVideoTestimonial[]): StudentVideoTestimonial[] {
  const byId = new Map<string, StudentVideoTestimonial>();
  for (const v of local) byId.set(v.id, v);
  for (const v of defaults) {
    if (!byId.has(v.id)) byId.set(v.id, v);
  }
  return Array.from(byId.values());
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
  const stored = readStored();
  const overrides = stored?.news && Array.isArray(stored.news) ? stored.news : undefined;
  const removedSlugs = stored?.removedNewsSlugs && Array.isArray(stored.removedNewsSlugs) ? stored.removedNewsSlugs : undefined;

  const fetched = await fetchPetrosphereLatestNews(limit);
  const merged = applyNewsOverrides(fetched, overrides, removedSlugs);
  const ordered = merged.slice().sort(compareNewsNewestFirst);
  return removeDummySeedNews(ordered).slice(0, limit);
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

  const stored = readStored();
  const storedNewsOverrides = stored?.news && Array.isArray(stored.news) ? stored.news : [];
  const removedSlugs =
    stored?.removedNewsSlugs && Array.isArray(stored.removedNewsSlugs) ? stored.removedNewsSlugs : [];

  const storedVideos =
    stored?.videoTestimonials && Array.isArray(stored.videoTestimonials) ? stored.videoTestimonials : defaultVideoTestimonials;
  const mergedVideos = mergeVideoPreferLocal(storedVideos, defaultVideoTestimonials);

  const base: SiteContentSnapshot = {
    // Local/admin overrides applied to seed data (used only as fallback if fetch fails).
    news: removeDummySeedNews(applyNewsOverrides(companyNewsItems, storedNewsOverrides, removedSlugs)),
    videoTestimonials: mergedVideos,
    stats: stored?.stats && Array.isArray(stored.stats) ? stored.stats : defaultStats,
  };

  // Fetch latest index cards.
  const fetched = await fetchPetrosphereLatestNews(limit).catch(() => []);

  // Optionally fetch full bodies for any new items (so admin starts with real content).
  let hydrated: CompanyNewsItem[] = fetched;
  if (hydrateBodies && fetched.length) {
    const existingSlugs = new Set(base.news.map((n) => n.slug));
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

  // Apply local overrides on top of fetched items, and include any local-only posts.
  const fetchedWithOverrides = applyNewsOverrides(hydrated, storedNewsOverrides, removedSlugs);
  const mergedNews = mergeNewsPreferLocal(fetchedWithOverrides, storedNewsOverrides);
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
  const normalized = slug.toLowerCase();
  const local = getNewsArticleBySlug(normalized) ?? getNewsArticleBySlug(slug);
  return local;
}

export async function getRelatedCompanyNewsAsync(slug: string, limit = 4): Promise<CompanyNewsItem[]> {
  const normalized = slug.toLowerCase();
  // Fetch extra so we still have `limit` items after excluding the current article.
  const pool = await getCompanyNewsMergedAsync(limit + 8).catch(() => getCompanyNewsForSite());
  return pool.filter((item) => item.slug.toLowerCase() !== normalized).slice(0, limit);
}

export function getVideoTestimonialsForSite(): StudentVideoTestimonial[] {
  return defaultVideoTestimonials;
}

export function getStatsForSite(): SiteStat[] {
  return defaultStats;
}

export async function getVideoTestimonialsForSiteAsync(): Promise<StudentVideoTestimonial[]> {
  return getVideoTestimonialsForSite();
}

export async function getStatsForSiteAsync(): Promise<SiteStat[]> {
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
  return "file";
}
