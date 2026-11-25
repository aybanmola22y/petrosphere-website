import "server-only";

import type { CompanyNewsItem, NewsBodyBlock } from "@/data/companyNews";
import { normalizeNewsBody } from "@/data/companyNews";
import type {
  HomeHeroMasonryColumns,
  StudentVideoTestimonial,
} from "@/data/siteMarketingDefaults";
import { createCmsAdminClient } from "@/lib/supabase/cms-admin";
import type { Json } from "@/lib/supabase/types/database";
import { normalizeHeroMasonry } from "@/lib/hero-masonry";
import { canonicalNewsSlug, newsSlugsMatch, sanitizeNewsItem } from "@/lib/news-slug";
import type { SiteContentSnapshot, SiteStat } from "@/types/site-content";

/** Admin-created posts use ids like `news-1730000000000`. */
export function isAuthoredNewsId(id: string): boolean {
  return /^news-\d+$/.test(id);
}

function toDateString(publishedAt: string): string {
  return publishedAt.slice(0, 10);
}

function rowToNewsItem(row: {
  id?: string;
  slug: string;
  category: string;
  title: string;
  published_at: string;
  summary: string;
  image_src: string;
  body: Json;
  external?: boolean | null;
  external_href?: string | null;
  cta?: Json | null;
  location?: string | null;
}): CompanyNewsItem {
  return {
    id: row.id ?? row.slug,
    slug: canonicalNewsSlug(row.slug),
    category: row.category as CompanyNewsItem["category"],
    title: row.title,
    publishedAt: toDateString(String(row.published_at)),
    summary: row.summary ?? "",
    imageSrc: row.image_src ?? "",
    body: normalizeNewsBody(row.body as NewsBodyBlock[]),
    external: row.external ?? undefined,
    externalHref: row.external_href ?? undefined,
    cta: (row.cta as CompanyNewsItem["cta"]) ?? undefined,
    location: row.location?.trim() || undefined,
  };
}

function newsItemToAuthoredRow(item: CompanyNewsItem) {
  return {
    id: item.id,
    slug: canonicalNewsSlug(item.slug),
    category: item.category,
    title: item.title,
    published_at: toDateString(item.publishedAt),
    summary: item.summary,
    image_src: item.imageSrc,
    body: item.body as unknown as Json,
    external: item.external ?? false,
    external_href: item.externalHref ?? null,
    cta: (item.cta as Json) ?? null,
    location: item.location?.trim() || null,
  };
}

function newsItemToOverrideRow(item: CompanyNewsItem) {
  return {
    slug: canonicalNewsSlug(item.slug),
    category: item.category,
    title: item.title,
    published_at: toDateString(item.publishedAt),
    summary: item.summary,
    image_src: item.imageSrc,
    body: item.body as unknown as Json,
    external: item.external ?? null,
    external_href: item.externalHref ?? null,
    cta: (item.cta as Json) ?? null,
    location: item.location?.trim() || null,
  };
}

export type StoredCmsShape = {
  /** @deprecated Use authoredNews + fetchedOverrides */
  news: CompanyNewsItem[];
  authoredNews: CompanyNewsItem[];
  fetchedOverrides: CompanyNewsItem[];
  removedNewsSlugs: string[];
  videoTestimonials: StudentVideoTestimonial[];
  stats: SiteStat[];
  heroMasonry?: HomeHeroMasonryColumns;
};

function rowsToHeroMasonry(
  rows: {
    column_index: number;
    sort_order: number;
    src: string;
    tall: boolean | null;
    alt: string | null;
  }[],
): HomeHeroMasonryColumns {
  const cols: HomeHeroMasonryColumns = [[], [], [], []];
  for (const r of rows) {
    const c = Math.max(0, Math.min(3, r.column_index));
    cols[c]!.push({
      src: r.src,
      tall: Boolean(r.tall),
      alt: r.alt?.trim() || undefined,
    });
  }
  return normalizeHeroMasonry(cols);
}

/** Load a single news post from CMS by slug (authored or fetched override). */
export async function fetchNewsBySlugFromCms(slug: string): Promise<CompanyNewsItem | null> {
  const normalized = canonicalNewsSlug(slug);
  if (!normalized) return null;

  const db = createCmsAdminClient();

  const [hiddenRes, authoredRes, overrideRes] = await Promise.all([
    db.from("news_fetched_hidden").select("slug"),
    db.from("news_authored").select("*"),
    db.from("news_fetched_overrides").select("*"),
  ]);

  if (hiddenRes.error) throw hiddenRes.error;
  if (authoredRes.error) throw authoredRes.error;
  if (overrideRes.error) throw overrideRes.error;

  const isHidden = (hiddenRes.data ?? []).some((r) => newsSlugsMatch(r.slug, normalized));
  if (isHidden) return null;

  const authoredRow = (authoredRes.data ?? []).find((r) => newsSlugsMatch(r.slug, normalized));
  if (authoredRow) {
    return rowToNewsItem({ ...authoredRow, id: authoredRow.id });
  }

  const row = (overrideRes.data ?? []).find((r) => r.slug && newsSlugsMatch(r.slug, normalized));
  if (row?.slug && row.title && row.category && row.published_at) {
    return rowToNewsItem({
      id: `override-${canonicalNewsSlug(row.slug)}`,
      slug: row.slug,
      category: row.category,
      title: row.title,
      published_at: row.published_at,
      summary: row.summary ?? "",
      image_src: row.image_src ?? "",
      body: row.body ?? [],
      external: row.external,
      external_href: row.external_href,
      cta: row.cta,
      location: row.location,
    });
  }

  return null;
}

export async function readCmsFromSupabase(): Promise<StoredCmsShape> {
  const db = createCmsAdminClient();

  const [authoredRes, overridesRes, hiddenRes, videosRes, statsRes, heroRes] = await Promise.all([
    db.from("news_authored").select("*").order("published_at", { ascending: false }),
    db.from("news_fetched_overrides").select("*"),
    db.from("news_fetched_hidden").select("slug"),
    db.from("video_testimonials").select("*").order("sort_order", { ascending: true }),
    db.from("site_stats").select("*").order("sort_order", { ascending: true }),
    db
      .from("hero_masonry_images")
      .select("column_index, sort_order, src, tall, alt")
      .order("column_index", { ascending: true })
      .order("sort_order", { ascending: true }),
  ]);

  if (authoredRes.error) throw authoredRes.error;
  if (overridesRes.error) throw overridesRes.error;
  if (hiddenRes.error) throw hiddenRes.error;
  if (videosRes.error) throw videosRes.error;
  if (statsRes.error) throw statsRes.error;
  // Table may not exist yet — fall back to defaults via normalizeHeroMasonry(undefined)
  if (heroRes.error && !/does not exist|schema cache|Could not find/i.test(heroRes.error.message)) {
    throw heroRes.error;
  }

  const authored = (authoredRes.data ?? []).map((r) => rowToNewsItem({ ...r, id: r.id }));
  const overridesByCanonical = new Map<string, CompanyNewsItem>();
  for (const r of overridesRes.data ?? []) {
    if (!r.slug || !r.title || !r.category || !r.published_at) continue;
    const item = rowToNewsItem({
      id: `override-${canonicalNewsSlug(r.slug)}`,
      slug: r.slug,
      category: r.category,
      title: r.title,
      published_at: r.published_at,
      summary: r.summary ?? "",
      image_src: r.image_src ?? "",
      body: r.body ?? [],
      external: r.external,
      external_href: r.external_href,
      cta: r.cta,
      location: r.location,
    });
    const key = canonicalNewsSlug(item.slug);
    const existing = overridesByCanonical.get(key);
    // Prefer the row whose stored slug is already canonical (no URL-encoded emoji).
    if (!existing || (existing.slug.includes("%") && !item.slug.includes("%"))) {
      overridesByCanonical.set(key, item);
    }
  }
  const overrides = Array.from(overridesByCanonical.values());

  const removedNewsSlugs = (hiddenRes.data ?? []).map((r) => r.slug);

  const videoTestimonials: StudentVideoTestimonial[] = (videosRes.data ?? []).map((r) => ({
    id: r.id,
    studentName: r.student_name,
    credential: r.credential,
    summary: r.summary,
    youtubeVideoId: r.youtube_video_id ?? "",
    videoSrc: r.video_src?.trim() || undefined,
    posterSrc: r.poster_src?.trim() || "",
  }));

  const stats: SiteStat[] = (statsRes.data ?? []).map((r) => ({
    value: r.value,
    label: r.label,
  }));

  await pruneDuplicateFetchedOverrides(db).catch((e) => {
    console.error("Failed to prune duplicate news overrides:", e);
  });

  const heroMasonry = heroRes.error
    ? undefined
    : rowsToHeroMasonry(heroRes.data ?? []);

  return {
    news: [...authored, ...overrides],
    authoredNews: authored,
    fetchedOverrides: overrides,
    removedNewsSlugs,
    videoTestimonials,
    stats,
    heroMasonry,
  };
}

function stableStringify(obj: unknown): string {
  return JSON.stringify(obj, (_k, v) => (v === undefined ? undefined : v));
}

/** Remove legacy override rows whose slug differs only by emoji / URL encoding. */
async function pruneDuplicateFetchedOverrides(db: ReturnType<typeof createCmsAdminClient>): Promise<void> {
  const { data: rows, error } = await db.from("news_fetched_overrides").select("slug");
  if (error || !rows?.length) return;

  const groups = new Map<string, string[]>();
  for (const r of rows) {
    if (!r.slug) continue;
    const key = canonicalNewsSlug(r.slug);
    const list = groups.get(key) ?? [];
    list.push(r.slug);
    groups.set(key, list);
  }

  const toDelete: string[] = [];
  for (const [canonical, slugs] of groups) {
    if (slugs.length <= 1) continue;
    const keep =
      slugs.find((s) => canonicalNewsSlug(s) === s && !s.includes("%")) ??
      slugs.find((s) => canonicalNewsSlug(s) === canonical) ??
      canonical;
    for (const s of slugs) {
      if (s !== keep) toDelete.push(s);
    }
  }

  if (toDelete.length) {
    const { error: delErr } = await db.from("news_fetched_overrides").delete().in("slug", toDelete);
    if (delErr) throw delErr;
  }
}

export async function persistCmsToSupabase(payload: {
  baseline: SiteContentSnapshot;
  data: SiteContentSnapshot;
}): Promise<void> {
  const { baseline, data } = payload;
  const db = createCmsAdminClient();

  const baseBySlug = new Map(baseline.news.map((n) => [canonicalNewsSlug(n.slug), n]));
  const dataBySlug = new Map(data.news.map((n) => [canonicalNewsSlug(n.slug), n]));

  const authored = data.news.filter((n) => isAuthoredNewsId(n.id));
  const authoredIds = authored.map((n) => n.id);

  const { data: existingAuthored } = await db.from("news_authored").select("id");
  const toDeleteAuthored = (existingAuthored ?? [])
    .map((r) => r.id)
    .filter((id) => !authoredIds.includes(id));
  if (toDeleteAuthored.length) {
    const { error } = await db.from("news_authored").delete().in("id", toDeleteAuthored);
    if (error) throw error;
  }
  if (authored.length) {
    const { error } = await db.from("news_authored").upsert(authored.map(newsItemToAuthoredRow));
    if (error) throw error;
  }

  const overrideUpserts: ReturnType<typeof newsItemToOverrideRow>[] = [];

  for (const item of data.news) {
    if (isAuthoredNewsId(item.id)) continue;
    const key = canonicalNewsSlug(item.slug);
    const base = baseBySlug.get(key);
    if (!base) continue;
    if (stableStringify(base) !== stableStringify(item)) {
      overrideUpserts.push(newsItemToOverrideRow(item));
    }
  }

  if (overrideUpserts.length) {
    const { error } = await db.from("news_fetched_overrides").upsert(overrideUpserts as never);
    if (error) throw error;
  }

  await pruneDuplicateFetchedOverrides(db);

  const { data: existingHidden } = await db.from("news_fetched_hidden").select("slug");
  const existingHiddenSet = new Set((existingHidden ?? []).map((r) => canonicalNewsSlug(r.slug)));

  const targetHidden = new Set<string>();

  for (const slug of baseBySlug.keys()) {
    const baseItem = baseBySlug.get(slug)!;
    if (!dataBySlug.has(slug) && !isAuthoredNewsId(baseItem.id)) {
      targetHidden.add(slug);
    }
  }
  for (const slug of existingHiddenSet) {
    if (!dataBySlug.has(slug)) targetHidden.add(slug);
  }

  const toHide = [...targetHidden].filter((s) => !existingHiddenSet.has(s));
  const toUnhide = [...existingHiddenSet].filter((s) => !targetHidden.has(s));

  if (toHide.length) {
    const { error } = await db.from("news_fetched_hidden").upsert(toHide.map((slug) => ({ slug })));
    if (error) throw error;
  }
  if (toUnhide.length) {
    const { error } = await db.from("news_fetched_hidden").delete().in("slug", toUnhide);
    if (error) throw error;
  }

  if (stableStringify(baseline.videoTestimonials) !== stableStringify(data.videoTestimonials)) {
    const { data: existingVideos } = await db.from("video_testimonials").select("id");
    const videoIds = (existingVideos ?? []).map((r) => r.id);
    if (videoIds.length) {
      const { error: delErr } = await db.from("video_testimonials").delete().in("id", videoIds);
      if (delErr) throw delErr;
    }
    const videos = data.videoTestimonials;
    if (videos.length) {
      const rows = videos.map((v, i) => ({
        id: v.id,
        student_name: v.studentName,
        credential: v.credential,
        summary: v.summary,
        youtube_video_id: v.videoSrc?.trim() ? "" : v.youtubeVideoId.trim(),
        video_src: v.videoSrc?.trim() || null,
        poster_src: v.posterSrc,
        sort_order: i,
      }));
      const { error } = await db.from("video_testimonials").insert(rows);
      if (error) throw error;
    }
  }

  if (stableStringify(baseline.stats) !== stableStringify(data.stats)) {
    const { data: existingStats } = await db.from("site_stats").select("id");
    const statIds = (existingStats ?? []).map((r) => r.id);
    if (statIds.length) {
      const { error: delErr } = await db.from("site_stats").delete().in("id", statIds);
      if (delErr) throw delErr;
    }
    const rows = data.stats.map((s, i) => ({
      id: crypto.randomUUID(),
      value: s.value,
      label: s.label,
      sort_order: i,
    }));
    if (rows.length) {
      const { error } = await db.from("site_stats").insert(rows);
      if (error) throw error;
    }
  }

  if (stableStringify(baseline.heroMasonry) !== stableStringify(data.heroMasonry)) {
    const masonry = normalizeHeroMasonry(data.heroMasonry);
    const { data: existingHero } = await db.from("hero_masonry_images").select("id");
    const heroIds = (existingHero ?? []).map((r) => r.id);
    if (heroIds.length) {
      const { error: delErr } = await db.from("hero_masonry_images").delete().in("id", heroIds);
      if (delErr) {
        if (/does not exist|schema cache|Could not find/i.test(delErr.message)) {
          throw new Error(
            "Hero masonry table is missing. Run docs/sql/hero-masonry-images.sql in Supabase, then save again.",
          );
        }
        throw delErr;
      }
    }
    const rows = masonry.flatMap((col, columnIndex) =>
      col.map((img, sortOrder) => ({
        id: crypto.randomUUID(),
        column_index: columnIndex,
        sort_order: sortOrder,
        src: img.src,
        tall: Boolean(img.tall),
        alt: img.alt?.trim() || null,
      })),
    );
    if (rows.length) {
      const { error } = await db.from("hero_masonry_images").insert(rows);
      if (error) {
        if (/does not exist|schema cache|Could not find/i.test(error.message)) {
          throw new Error(
            "Hero masonry table is missing. Run docs/sql/hero-masonry-images.sql in Supabase, then save again.",
          );
        }
        throw error;
      }
    }
  }
}
