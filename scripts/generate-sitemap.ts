/**
 * Postbuild: writes public/sitemap.xml (static file for Google Search Console).
 * Uses sitemap-xml-core only — no `server-only` imports.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

import { companyNewsItems } from "../src/data/companyNews";
import { mapCourseRowToCourse } from "../src/lib/catalog";
import { staticSitemapUrls, urlsToSitemapXml, type SitemapUrl } from "../src/lib/sitemap-xml-core";
import { buildCollisionBaseSlugSet, isExcludedTmsTestCourseRow } from "../src/lib/tms";

function loadEnvLocal(): void {
  try {
    const raw = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // optional locally; Vercel injects env at build
  }
}

function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel.replace(/\/$/, "")}`;
  return "http://localhost:3000";
}

async function fetchCourseSlugsForSitemap(): Promise<string[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  const schema = process.env.NEXT_PUBLIC_TMS_SCHEMA?.trim() || "tms";
  if (!url || !key) return [];

  const response = await fetch(`${url}/rest/v1/courses?select=*&order=title.asc`, {
    headers: {
      apikey: key,
      authorization: `Bearer ${key}`,
      "accept-profile": schema,
    },
  });
  if (!response.ok) return [];

  const data = (await response.json()) as unknown;
  if (!Array.isArray(data)) return [];

  const rows = data
    .filter((item): item is Record<string, unknown> => !!item && typeof item === "object")
    .filter((row) => !isExcludedTmsTestCourseRow(row));
  const collisionBases = buildCollisionBaseSlugSet(rows);

  const slugs: string[] = [];
  const seenIds = new Set<string>();
  for (const row of rows) {
    const course = mapCourseRowToCourse(row, collisionBases);
    if (seenIds.has(course.id)) continue;
    seenIds.add(course.id);
    const slug = course.slug?.trim();
    if (slug) slugs.push(slug);
  }
  return slugs;
}

async function main(): Promise<void> {
  loadEnvLocal();
  const base = getSiteUrl();
  const deduped = new Map<string, SitemapUrl>();

  for (const entry of staticSitemapUrls(base)) deduped.set(entry.loc, entry);

  const now = new Date().toISOString();
  try {
    const courseSlugs = await fetchCourseSlugsForSitemap();
    for (const slug of courseSlugs) {
      deduped.set(`${base}/courses/${encodeURIComponent(slug)}`, {
        loc: `${base}/courses/${encodeURIComponent(slug)}`,
        lastmod: now,
        changefreq: "weekly",
        priority: "0.8",
      });
    }
  } catch (e) {
    console.warn("generate-sitemap: courses skipped", e);
  }

  const seenNews = new Set<string>();
  for (const item of companyNewsItems) {
    const slug = item.slug?.trim();
    if (!slug || seenNews.has(slug)) continue;
    seenNews.add(slug);
    deduped.set(`${base}/news/${slug}`, {
      loc: `${base}/news/${slug}`,
      lastmod: new Date(item.publishedAt).toISOString(),
      changefreq: "monthly",
      priority: "0.65",
    });
  }

  const xml = urlsToSitemapXml([...deduped.values()]);
  const out = resolve(process.cwd(), "public", "sitemap.xml");
  writeFileSync(out, xml, "utf8");
  console.log(`Wrote ${out} (${xml.length} bytes, ${deduped.size} URLs)`);
}

main().catch((error) => {
  console.error("generate-sitemap failed", error);
  process.exit(1);
});
