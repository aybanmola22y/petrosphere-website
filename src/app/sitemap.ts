import type { MetadataRoute } from "next";

import { buildSitemapEntries } from "@/lib/sitemap-data";
import { getSiteUrl } from "@/lib/site-url";

export const runtime = "nodejs";
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    return await buildSitemapEntries();
  } catch (e) {
    console.error("sitemap: fatal error, serving static URLs only", e);
    const base = getSiteUrl();
    const now = new Date();
    return [
      { url: base, lastModified: now, changeFrequency: "weekly", priority: 1 },
      { url: `${base}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
      { url: `${base}/courses`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
      { url: `${base}/schedule`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
      { url: `${base}/services`, lastModified: now, changeFrequency: "monthly", priority: 0.75 },
      { url: `${base}/review`, lastModified: now, changeFrequency: "monthly", priority: 0.75 },
    ];
  }
}
