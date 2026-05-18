import "server-only";

import type { CompanyNewsItem, NewsBodyBlock } from "@/data/companyNews";
import { normalizeNewsBody } from "@/data/companyNews";
import type { StudentVideoTestimonial } from "@/data/siteMarketingDefaults";
import { createCmsAdminClient } from "@/lib/supabase/cms-admin";
import type { Json } from "@/lib/supabase/types/database";
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
}): CompanyNewsItem {
  return {
    id: row.id ?? row.slug,
    slug: row.slug,
    category: row.category as CompanyNewsItem["category"],
    title: row.title,
    publishedAt: toDateString(String(row.published_at)),
    summary: row.summary ?? "",
    imageSrc: row.image_src ?? "",
    body: normalizeNewsBody(row.body as NewsBodyBlock[]),
    external: row.external ?? undefined,
    externalHref: row.external_href ?? undefined,
    cta: (row.cta as CompanyNewsItem["cta"]) ?? undefined,
  };
}

function newsItemToAuthoredRow(item: CompanyNewsItem) {
  return {
    id: item.id,
    slug: item.slug,
    category: item.category,
    title: item.title,
    published_at: toDateString(item.publishedAt),
    summary: item.summary,
    image_src: item.imageSrc,
    body: item.body as unknown as Json,
    external: item.external ?? false,
    external_href: item.externalHref ?? null,
    cta: (item.cta as Json) ?? null,
  };
}

function newsItemToOverrideRow(item: CompanyNewsItem) {
  return {
    slug: item.slug,
    category: item.category,
    title: item.title,
    published_at: toDateString(item.publishedAt),
    summary: item.summary,
    image_src: item.imageSrc,
    body: item.body as unknown as Json,
    external: item.external ?? null,
    external_href: item.externalHref ?? null,
    cta: (item.cta as Json) ?? null,
  };
}

export type StoredCmsShape = {
  news: CompanyNewsItem[];
  removedNewsSlugs: string[];
  videoTestimonials: StudentVideoTestimonial[];
  stats: SiteStat[];
};

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
      }),
    );

  const news = [...authored, ...overrides];
  const removedNewsSlugs = (hiddenRes.data ?? []).map((r) => r.slug);

  const videoTestimonials: StudentVideoTestimonial[] = (videosRes.data ?? []).map((r) => ({
    id: r.id,
    studentName: r.student_name,
    credential: r.credential,
    summary: r.summary,
    youtubeVideoId: r.youtube_video_id,
    posterSrc: r.poster_src,
  }));

  const stats: SiteStat[] = (statsRes.data ?? []).map((r) => ({
    value: r.value,
    label: r.label,
  }));

  return { news, removedNewsSlugs, videoTestimonials, stats };
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
  const overrideSlugsToDelete: string[] = [];

  for (const [slug, item] of dataBySlug.entries()) {
    if (isAuthoredNewsId(item.id)) continue;
    const base = baseBySlug.get(slug);
    if (!base) continue;
    if (stableStringify(base) !== stableStringify(item)) {
      overrideUpserts.push(newsItemToOverrideRow(item));
    }
  }
  for (const slug of baseBySlug.keys()) {
    if (isAuthoredNewsId(baseBySlug.get(slug)!.id)) continue;
    if (!dataBySlug.has(slug)) continue;
    const base = baseBySlug.get(slug)!;
    const item = dataBySlug.get(slug)!;
    if (stableStringify(base) === stableStringify(item)) {
      overrideSlugsToDelete.push(slug);
    }
  }

  if (overrideSlugsToDelete.length) {
    const { error } = await db.from("news_fetched_overrides").delete().in("slug", overrideSlugsToDelete);
    if (error) throw error;
  }
  if (overrideUpserts.length) {
    const { error } = await db.from("news_fetched_overrides").upsert(overrideUpserts as never);
    if (error) throw error;
  }

  const removedSlugs: string[] = [];
  for (const slug of baseBySlug.keys()) {
    if (!dataBySlug.has(slug) && !isAuthoredNewsId(baseBySlug.get(slug)!.id)) {
      removedSlugs.push(slug);
    }
  }

  const { data: existingHidden } = await db.from("news_fetched_hidden").select("slug");
  const existingHiddenSet = new Set((existingHidden ?? []).map((r) => r.slug));
  const removedSet = new Set(removedSlugs);

  const toHide = removedSlugs.filter((s) => !existingHiddenSet.has(s));
  const toUnhide = [...existingHiddenSet].filter((s) => !removedSet.has(s));

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
    if (data.videoTestimonials.length) {
      const rows = data.videoTestimonials.map((v, i) => ({
        id: v.id,
        student_name: v.studentName,
        credential: v.credential,
        summary: v.summary,
        youtube_video_id: v.youtubeVideoId,
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
