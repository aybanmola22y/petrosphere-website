import "server-only";

import type { CompanyNewsItem, NewsBodyBlock } from "@/data/companyNews";
import { normalizeNewsBody } from "@/data/companyNews";
import type { StudentVideoTestimonial } from "@/data/siteMarketingDefaults";
import { createCmsAdminClient } from "@/lib/supabase/cms-admin";
import type { Json } from "@/lib/supabase/types/database";
import { canonicalNewsSlug, newsSlugsMatch } from "@/lib/news-slug";
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
};

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
      id: `override-${row.slug}`,
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

  const [authoredRes, overridesRes, hiddenRes, videosRes, statsRes] = await Promise.all([
    db.from("news_authored").select("*").order("published_at", { ascending: false }),
    db.from("news_fetched_overrides").select("*"),
    db.from("news_fetched_hidden").select("slug"),
    db.from("video_testimonials").select("*").order("sort_order", { ascending: true }),
    db.from("site_stats").select("*").order("sort_order", { ascending: true }),
  ]);

  if (authoredRes.error) throw authoredRes.error;
  if (overridesRes.error) throw overridesRes.error;
  if (hiddenRes.error) throw hiddenRes.error;
  if (videosRes.error) throw videosRes.error;
  if (statsRes.error) throw statsRes.error;

  const authored = (authoredRes.data ?? []).map((r) => rowToNewsItem({ ...r, id: r.id }));
  const overrides = (overridesRes.data ?? [])
    .filter((r): r is typeof r & { slug: string; title: string; category: string; published_at: string } =>
      Boolean(r.slug && r.title && r.category && r.published_at),
    )
    .map((r) =>
      rowToNewsItem({
        id: `override-${r.slug}`,
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
      }),
    );

  const removedNewsSlugs = (hiddenRes.data ?? []).map((r) => r.slug);

  const videoTestimonials: StudentVideoTestimonial[] = (videosRes.data ?? []).map((r) => ({
    id: r.id,
    studentName: r.student_name,
    credential: r.credential,
    summary: r.summary,
    youtubeVideoId: r.youtube_video_id ?? "",
    videoSrc: r.video_src?.trim() || undefined,
    posterSrc: r.poster_src,
  }));

  const stats: SiteStat[] = (statsRes.data ?? []).map((r) => ({
    value: r.value,
    label: r.label,
  }));

  return {
    news: [...authored, ...overrides],
    authoredNews: authored,
    fetchedOverrides: overrides,
    removedNewsSlugs,
    videoTestimonials,
    stats,
  };
}

function stableStringify(obj: unknown): string {
  return JSON.stringify(obj, (_k, v) => (v === undefined ? undefined : v));
}

export async function persistCmsToSupabase(payload: {
  baseline: SiteContentSnapshot;
  data: SiteContentSnapshot;
}): Promise<void> {
  const { baseline, data } = payload;
  const db = createCmsAdminClient();

  const baseBySlug = new Map(baseline.news.map((n) => [n.slug, n]));
  const dataBySlug = new Map(data.news.map((n) => [n.slug, n]));

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
    const base = baseBySlug.get(item.slug);
    if (!base) continue;
    if (stableStringify(base) !== stableStringify(item)) {
      overrideUpserts.push(newsItemToOverrideRow(item));
    }
  }

  if (overrideUpserts.length) {
    const { error } = await db.from("news_fetched_overrides").upsert(overrideUpserts as never);
    if (error) throw error;
  }

  const { data: existingHidden } = await db.from("news_fetched_hidden").select("slug");
  const existingHiddenSet = new Set((existingHidden ?? []).map((r) => r.slug));

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
}
