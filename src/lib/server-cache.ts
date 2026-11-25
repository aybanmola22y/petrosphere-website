import "server-only";

import { unstable_cache } from "next/cache";

import type { Course, TrainingSession } from "@/data/mockData";
import { resolveCatalogList } from "@/lib/catalog";
import { fetchCatalogCourses } from "@/lib/catalog-tms";
import { CACHE_REVALIDATE_SECONDS, CACHE_TAGS } from "@/lib/cache";
import { fetchPetrosphereLatestNews } from "@/lib/petrosphere-latest-news";
import { readCmsFromSupabase } from "@/lib/site-content-supabase";
import { fetchTmsSchedules } from "@/lib/tms";
import type { SiteContentSnapshot } from "@/types/site-content";

export type CachedCmsStored = Pick<SiteContentSnapshot, "videoTestimonials" | "stats"> & {
  heroMasonry?: SiteContentSnapshot["heroMasonry"];
  news?: SiteContentSnapshot["news"];
  authoredNews?: SiteContentSnapshot["news"];
  fetchedOverrides?: SiteContentSnapshot["news"];
  removedNewsSlugs?: string[];
};

export function getCachedCmsSnapshot(): Promise<CachedCmsStored> {
  return unstable_cache(
    async () => {
      const cms = await readCmsFromSupabase();
      return {
        news: cms.news,
        authoredNews: cms.authoredNews,
        fetchedOverrides: cms.fetchedOverrides,
        removedNewsSlugs: cms.removedNewsSlugs,
        videoTestimonials: cms.videoTestimonials,
        stats: cms.stats,
        heroMasonry: cms.heroMasonry,
      };
    },
    ["site-cms-snapshot"],
    { revalidate: CACHE_REVALIDATE_SECONDS.cms, tags: [CACHE_TAGS.cms] },
  )();
}

export function getCachedPetrosphereNews(limit: number) {
  return unstable_cache(
    async () => fetchPetrosphereLatestNews(limit),
    ["petrosphere-news", String(limit)],
    { revalidate: CACHE_REVALIDATE_SECONDS.news, tags: [CACHE_TAGS.news] },
  )();
}

export function getCachedPublicCatalog(): Promise<Course[]> {
  return unstable_cache(
    async () => resolveCatalogList(await fetchCatalogCourses()),
    // Bump key when catalog enrichment rules change so stale DOLE dumps are not served.
    ["public-catalog", "enrich-v7-hide-nebosh"],
    { revalidate: CACHE_REVALIDATE_SECONDS.tms, tags: [CACHE_TAGS.tmsCourses] },
  )();
}

export function getCachedTmsSchedules(): Promise<TrainingSession[]> {
  return unstable_cache(
    async () => fetchTmsSchedules(),
    ["tms-schedules"],
    { revalidate: CACHE_REVALIDATE_SECONDS.tms, tags: [CACHE_TAGS.tmsSchedules] },
  )();
}
