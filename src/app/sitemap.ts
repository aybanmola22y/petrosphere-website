import type { MetadataRoute } from "next";

import { getCachedPublicCatalog } from "@/lib/server-cache";
import { getCompanyNewsForSite, getCompanyNewsMergedAsync } from "@/lib/site-content";
import { getSiteUrl } from "@/lib/site-url";

export const revalidate = 3600;

function parseLastModified(publishedAt: string | undefined): Date {
  if (!publishedAt) return new Date();
  const d = new Date(publishedAt);
  return Number.isNaN(d.getTime()) ? new Date() : d;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/courses`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/schedule`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/services`, lastModified: now, changeFrequency: "monthly", priority: 0.75 },
    { url: `${base}/review`, lastModified: now, changeFrequency: "monthly", priority: 0.75 },
  ];

  let coursePages: MetadataRoute.Sitemap = [];
  try {
    const courses = await getCachedPublicCatalog();
    coursePages = courses.map((course) => ({
      url: `${base}/courses/${encodeURIComponent(course.slug)}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch (e) {
    console.warn("sitemap: could not load TMS courses", e);
  }

  let newsPages: MetadataRoute.Sitemap = [];
  try {
    const news = await getCompanyNewsMergedAsync(48);
    newsPages = news.map((item) => ({
      url: `${base}/news/${encodeURIComponent(item.slug)}`,
      lastModified: parseLastModified(item.publishedAt),
      changeFrequency: "monthly" as const,
      priority: 0.65,
    }));
  } catch {
    newsPages = getCompanyNewsForSite().map((item) => ({
      url: `${base}/news/${encodeURIComponent(item.slug)}`,
      lastModified: parseLastModified(item.publishedAt),
      changeFrequency: "monthly" as const,
      priority: 0.65,
    }));
  }

  return [...staticPages, ...coursePages, ...newsPages];
}
