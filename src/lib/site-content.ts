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

const WEBSITE_CONTENT_TABLE = "site_content_overrides"; // now used only for: removed slugs + stats (and any future site-wide settings)
const WEBSITE_CONTENT_ROW_ID = 1;

const NEWS_FETCHED_TABLE = "news_fetched";
const NEWS_AUTHORED_TABLE = "news_authored";
const VIDEO_TESTIMONIALS_TABLE = "video_testimonials";

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
      .select("removed_news_slugs,stats")
      .eq("id", WEBSITE_CONTENT_ROW_ID)
      .maybeSingle();
    if (error || !data) return null;

    const out: StoredShape = {};
    if (Array.isArray(data.removed_news_slugs)) out.removedNewsSlugs = data.removed_news_slugs as unknown as string[];
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

function mapNewsRowToItem(row: any): CompanyNewsItem {
  return {
    id: String(row.id),
    slug: String(row.slug),
    category: row.category,
    title: row.title,
    publishedAt: row.published_at ?? row.publishedAt ?? "1970-01-01",
    summary: row.summary ?? "",
    imageSrc: row.image_src ?? row.imageSrc ?? "/logos/petrosphere.svg",
    body: Array.isArray(row.body) ? row.body : Array.isArray(row.body_json) ? row.body_json : Array.isArray(row.body_jsonb) ? row.body_jsonb : row.body ?? [],
    external: Boolean(row.external ?? false),
    externalHref: row.source_url ?? row.external_href ?? row.externalHref ?? undefined,
    cta: row.cta ?? undefined,
  } as CompanyNewsItem;
}

async function loadNewsFromWebsiteSupabase(limit?: number): Promise<CompanyNewsItem[]> {
  if (!websiteSupabaseConfigured()) return [];
  const supabase = createSupabaseWebsiteAdminClient();

  const fetchedQuery = supabase
    .from(NEWS_FETCHED_TABLE)
    .select("id,slug,source_url,category,title,published_at,summary,image_src,body,external,updated_at");
  const authoredQuery = supabase
    .from(NEWS_AUTHORED_TABLE)
    .select("id,slug,category,title,published_at,summary,image_src,body,external,external_href,cta,updated_at");

  const [fetchedRes, authoredRes] = await Promise.all([fetchedQuery, authoredQuery]);
  const fetched = Array.isArray(fetchedRes.data) ? fetchedRes.data.map(mapNewsRowToItem) : [];
  const authored = Array.isArray(authoredRes.data) ? authoredRes.data.map(mapNewsRowToItem) : [];
  const merged = [...authored, ...fetched].sort(byPublishedDesc);
  return typeof limit === "number" ? merged.slice(0, limit) : merged;
}

async function loadVideoTestimonialsFromWebsiteSupabase(): Promise<StudentVideoTestimonial[]> {
  if (!websiteSupabaseConfigured()) return [];
  const supabase = createSupabaseWebsiteAdminClient();
  const { data } = await supabase
    .from(VIDEO_TESTIMONIALS_TABLE)
    .select("id,student_name,credential,summary,youtube_video_id,poster_src,updated_at")
    .order("updated_at", { ascending: false });
  if (!Array.isArray(data)) return [];
  return data.map((r: any) => ({
    id: String(r.id),
    studentName: String(r.student_name ?? ""),
    credential: String(r.credential ?? ""),
    summary: String(r.summary ?? ""),
    youtubeVideoId: String(r.youtube_video_id ?? ""),
    posterSrc: String(r.poster_src ?? ""),
  }));
}

async function syncFetchedNewsToWebsiteSupabase(options: { limit: number; hydrateBodies: boolean }): Promise<void> {
  if (!websiteSupabaseConfigured()) return;
  const supabase = createSupabaseWebsiteAdminClient();

  const fetched = await fetchPetrosphereLatestNews(options.limit).catch(() => []);
  if (!fetched.length) return;

  let hydrated: CompanyNewsItem[] = fetched;
  if (options.hydrateBodies) {
    hydrated = await Promise.all(
      fetched.map(async (n) => {
        if (n.body && n.body.length) return n;
        const src = n.externalHref;
        if (!src) return n;
        return await fetchPetrosphereNewsArticleByUrl(src).catch(() => n);
      }),
    );
  }

  const rows = hydrated.map((n) => ({
    id: n.id,
    slug: n.slug,
    source_url: n.externalHref ?? null,
    category: n.category,
    title: n.title,
    published_at: n.publishedAt,
    summary: n.summary,
    image_src: n.imageSrc,
    body: n.body ?? [],
    external: Boolean(n.external ?? false),
    updated_at: new Date().toISOString(),
    fetched_at: new Date().toISOString(),
  }));

  await supabase.from(NEWS_FETCHED_TABLE).upsert(rows, { onConflict: "slug" });
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
  const stored = await readStored();
  const removedSlugs = stored?.removedNewsSlugs && Array.isArray(stored.removedNewsSlugs) ? stored.removedNewsSlugs : undefined;

  const fromDb = await loadNewsFromWebsiteSupabase();
  if (fromDb.length) {
    const filtered = applyNewsOverrides(fromDb, undefined, removedSlugs).slice().sort(byPublishedDesc);
    return removeDummySeedNews(filtered).slice(0, limit);
  }

  // Fallback if DB isn't configured or empty.
  const fetched = await fetchPetrosphereLatestNews(limit);
  const ordered = fetched.slice().sort(byPublishedDesc);
  return removeDummySeedNews(ordered).slice(0, limit);
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
  const removedSlugs = stored?.removedNewsSlugs && Array.isArray(stored.removedNewsSlugs) ? stored.removedNewsSlugs : [];

  // Sync fetched news into the dedicated table, then load combined list (authored + fetched).
  await syncFetchedNewsToWebsiteSupabase({ limit, hydrateBodies });
  const news = await loadNewsFromWebsiteSupabase();
  const filtered = removeDummySeedNews(applyNewsOverrides(news, undefined, removedSlugs));

  const dbVideos = await loadVideoTestimonialsFromWebsiteSupabase();
  const mergedVideos = mergeVideoPreferLocal(dbVideos.length ? dbVideos : defaultVideoTestimonials, defaultVideoTestimonials);

  return {
    news: filtered,
    videoTestimonials: mergedVideos,
    stats: stored?.stats && Array.isArray(stored.stats) ? stored.stats : defaultStats,
  };
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
  const supabase = websiteSupabaseConfigured() ? createSupabaseWebsiteAdminClient() : null;
  if (supabase) {
    const [a, f] = await Promise.all([
      supabase.from(NEWS_AUTHORED_TABLE).select("*").eq("slug", normalized).maybeSingle(),
      supabase.from(NEWS_FETCHED_TABLE).select("*").eq("slug", normalized).maybeSingle(),
    ]);
    const hit = a.data ?? f.data;
    if (hit) return mapNewsRowToItem(hit);
  }
  return undefined;
}

export async function getRelatedCompanyNewsAsync(slug: string, limit = 4): Promise<CompanyNewsItem[]> {
  const normalized = slug.toLowerCase();
  const all = await loadNewsFromWebsiteSupabase();
  return all.filter((item) => item.slug.toLowerCase() !== normalized).slice(0, limit);
}

export function getVideoTestimonialsForSite(): StudentVideoTestimonial[] {
  return defaultVideoTestimonials;
}

export function getStatsForSite(): SiteStat[] {
  return defaultStats;
}

export async function getVideoTestimonialsForSiteAsync(): Promise<StudentVideoTestimonial[]> {
  const rows = await loadVideoTestimonialsFromWebsiteSupabase();
  return rows.length ? rows : defaultVideoTestimonials;
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

  // Track removals so fetched items can be hidden without deleting and being re-synced.
  const { removedSlugs } = pickChangedNewsOverrides(baseline.news, data.news);
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
    // 1) Save news items into the correct table.
    const authoredItems = data.news.filter((n) => !String(n.id).startsWith("petrosphere-"));
    const fetchedItems = data.news.filter((n) => String(n.id).startsWith("petrosphere-"));

    if (authoredItems.length) {
      await supabase.from(NEWS_AUTHORED_TABLE).upsert(
        authoredItems.map((n) => ({
          id: n.id,
          slug: n.slug,
          category: n.category,
          title: n.title,
          published_at: n.publishedAt,
          summary: n.summary,
          image_src: n.imageSrc,
          body: n.body,
          external: Boolean(n.external ?? false),
          external_href: n.externalHref ?? null,
          cta: n.cta ?? null,
          updated_at: new Date().toISOString(),
        })),
        { onConflict: "id" },
      );
    }

    if (fetchedItems.length) {
      await supabase.from(NEWS_FETCHED_TABLE).upsert(
        fetchedItems.map((n) => ({
          id: n.id,
          slug: n.slug,
          source_url: n.externalHref ?? null,
          category: n.category,
          title: n.title,
          published_at: n.publishedAt,
          summary: n.summary,
          image_src: n.imageSrc,
          body: n.body ?? [],
          external: Boolean(n.external ?? false),
          updated_at: new Date().toISOString(),
          fetched_at: new Date().toISOString(),
        })),
        { onConflict: "slug" },
      );
    }

    // 2) Save video testimonials into their own table (upsert per id).
    if (stored.videoTestimonials) {
      await supabase.from(VIDEO_TESTIMONIALS_TABLE).upsert(
        stored.videoTestimonials.map((v) => ({
          id: v.id,
          student_name: v.studentName,
          credential: v.credential,
          summary: v.summary,
          youtube_video_id: v.youtubeVideoId,
          poster_src: v.posterSrc,
          updated_at: new Date().toISOString(),
        })),
        { onConflict: "id" },
      );
    }

    // 3) Save removed slugs + stats into the settings row.
    const existing = await supabase
      .from(WEBSITE_CONTENT_TABLE)
      .select("removed_news_slugs,stats")
      .eq("id", WEBSITE_CONTENT_ROW_ID)
      .maybeSingle();
    const ex = existing.data ?? ({} as any);

    const payloadRow = {
      id: WEBSITE_CONTENT_ROW_ID,
      removed_news_slugs: stored.removedNewsSlugs ?? ex.removed_news_slugs ?? [],
      stats: stored.stats !== undefined ? stored.stats : (ex.stats ?? null),
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase.from(WEBSITE_CONTENT_TABLE).upsert(payloadRow, { onConflict: "id" });
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
