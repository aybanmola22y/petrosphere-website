import "server-only";

import fs from "fs";

import type { CompanyNewsItem } from "@/data/companyNews";
import { companyNewsItems } from "@/data/companyNews";
import type { StudentVideoTestimonial } from "@/data/siteMarketingDefaults";
import { stats as defaultStats, studentVideoTestimonials as defaultVideoTestimonials } from "@/data/siteMarketingDefaults";

import type { SiteContentSnapshot, SiteStat } from "@/types/site-content";
import { getLocalContentPath } from "./site-content-path";
import { fetchPetrosphereLatestNews, fetchPetrosphereNewsArticleByUrl } from "@/lib/petrosphere-latest-news";
import { createSupabaseWebsiteAdminClient } from "@/lib/supabase/website";

export type { SiteContentSnapshot, SiteStat } from "@/types/site-content";

type StoredShape = Partial<SiteContentSnapshot> & {
  /**
   * When using "Option B" persistence, we store only overrides and deletions
   * (not the full fetched list).
   */
  removedNewsSlugs?: string[];
};

const WEBSITE_CONTENT_TABLE = "site_content_overrides";
const WEBSITE_CONTENT_ROW_ID = 1;

function websiteSupabaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL_WEBSITE && process.env.SUPABASE_SERVICE_ROLE_KEY_WEBSITE);
}

function isReadOnlyDeployFs(): boolean {
  // Vercel (and similar serverless) runtimes don't allow writing to the repo filesystem at runtime.
  return Boolean(process.env.VERCEL) || process.env.NODE_ENV === "production";
}

function readStoredFromFile(): StoredShape | null {
  try {
    const p = getLocalContentPath();
    if (!fs.existsSync(p)) return null;
    return JSON.parse(fs.readFileSync(p, "utf-8")) as StoredShape;
  } catch {
    return null;
  }
}

async function readStoredFromWebsiteSupabase(): Promise<StoredShape | null> {
  try {
    const supabase = createSupabaseWebsiteAdminClient();
    const { data, error } = await supabase
      .from(WEBSITE_CONTENT_TABLE)
      .select("news_overrides,removed_news_slugs,video_testimonials,stats")
      .eq("id", WEBSITE_CONTENT_ROW_ID)
      .maybeSingle();
    if (error || !data) return null;

    const out: StoredShape = {};
    if (Array.isArray(data.news_overrides)) out.news = data.news_overrides as unknown as CompanyNewsItem[];
    if (Array.isArray(data.removed_news_slugs)) out.removedNewsSlugs = data.removed_news_slugs as unknown as string[];
    if (Array.isArray(data.video_testimonials)) out.videoTestimonials = data.video_testimonials as unknown as StudentVideoTestimonial[];
    if (Array.isArray(data.stats)) out.stats = data.stats as unknown as SiteStat[];
    return out;
  } catch {
    return null;
  }
}

async function readStored(): Promise<StoredShape | null> {
  if (websiteSupabaseConfigured()) {
    const s = await readStoredFromWebsiteSupabase();
    if (s) return s;
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
  return applyNewsOverrides(companyNewsItems, s?.news, s?.removedNewsSlugs);
}

function byPublishedDesc(a: CompanyNewsItem, b: CompanyNewsItem): number {
  // Sort newest first. Works for ISO `YYYY-MM-DD`.
  if (a.publishedAt === b.publishedAt) return 0;
  return a.publishedAt < b.publishedAt ? 1 : -1;
}

function mergeNewsPreferLocal(local: CompanyNewsItem[], incoming: CompanyNewsItem[]): CompanyNewsItem[] {
  const bySlug = new Map<string, CompanyNewsItem>();
  for (const item of local) bySlug.set(item.slug, item);
  for (const item of incoming) {
    if (!bySlug.has(item.slug)) bySlug.set(item.slug, item);
  }
  return Array.from(bySlug.values()).sort(byPublishedDesc);
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
export async function getCompanyNewsForHome(limit = 6): Promise<CompanyNewsItem[]> {
  const s = await readStored();
  const overrides = s?.news && Array.isArray(s.news) ? s.news : undefined;
  const removedSlugs = s?.removedNewsSlugs && Array.isArray(s.removedNewsSlugs) ? s.removedNewsSlugs : undefined;

  // Always fetch the latest for the public site, then apply local overrides.
  // This keeps the site fresh while still letting admin edits win.
  const fetched = await fetchPetrosphereLatestNews(limit);
  const merged = applyNewsOverrides(fetched, overrides, removedSlugs);
  return removeDummySeedNews(merged).slice(0, limit);
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

  const stored = await readStored();
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

export function getVideoTestimonialsForSite(): StudentVideoTestimonial[] {
  return defaultVideoTestimonials;
}

export function getStatsForSite(): SiteStat[] {
  return defaultStats;
}

export async function getVideoTestimonialsForSiteAsync(): Promise<StudentVideoTestimonial[]> {
  const s = await readStored();
  if (s && Array.isArray(s.videoTestimonials)) return s.videoTestimonials;
  return defaultVideoTestimonials;
}

export async function getStatsForSiteAsync(): Promise<SiteStat[]> {
  const s = await readStored();
  if (s && Array.isArray(s.stats)) return s.stats;
  return defaultStats;
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

  if (websiteSupabaseConfigured()) {
    const supabase = createSupabaseWebsiteAdminClient();
    const { error } = await supabase.from(WEBSITE_CONTENT_TABLE).upsert(
      {
        id: WEBSITE_CONTENT_ROW_ID,
        news_overrides: stored.news ?? [],
        removed_news_slugs: stored.removedNewsSlugs ?? [],
        video_testimonials: stored.videoTestimonials ?? null,
        stats: stored.stats ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    );
    if (!error) return;
    throw new Error(`Supabase save failed: ${error.message}`);
  }

  if (isReadOnlyDeployFs()) {
    throw new Error(
      "Saving is not configured for this deployment. Set SUPABASE_SERVICE_ROLE_KEY_WEBSITE (and run the SQL for site_content_overrides) so /admin can save without writing local files.",
    );
  }

  fs.writeFileSync(getLocalContentPath(), `${JSON.stringify(stored, null, 2)}\n`, "utf-8");
}

export function siteContentStorageLabel(): "supabase" | "file" {
  if (websiteSupabaseConfigured()) return "supabase";
  return "file";
}
