/**
 * One-time migration: pull Company Updates from the old WordPress site,
 * download images into this project, and save posts into Supabase CMS.
 *
 * Usage: npx tsx scripts/import-wp-news-to-cms.ts
 */
import crypto from "crypto";
import fs from "fs";
import path from "path";

import { createClient } from "@supabase/supabase-js";

import type { CompanyNewsItem, NewsBodyBlock } from "../src/data/companyNews";
import {
  fetchPetrosphereLatestNews,
  fetchPetrosphereNewsArticleByUrl,
} from "../src/lib/petrosphere-latest-news";
import { canonicalNewsSlug } from "../src/lib/news-slug";

function loadEnvLocal() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;
  for (const raw of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq <= 0) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadEnvLocal();

const LIMIT = Number(process.env.WP_NEWS_IMPORT_LIMIT ?? "40");
const OUT_DIR = path.join(process.cwd(), "public", "uploads", "news");

function authoredIdFromSlug(slug: string): string {
  const hex = crypto.createHash("sha1").update(slug).digest("hex").slice(0, 12);
  const n = BigInt(`0x${hex}`) % 10n ** 13n;
  return `news-${n.toString()}`;
}

function extFromUrl(url: string, contentType: string | null): string {
  try {
    const pathname = new URL(url).pathname;
    const m = pathname.match(/\.([a-z0-9]{2,5})$/i);
    if (m) return m[1].toLowerCase();
  } catch {
    /* ignore */
  }
  if (contentType?.includes("png")) return "png";
  if (contentType?.includes("webp")) return "webp";
  if (contentType?.includes("gif")) return "gif";
  return "jpg";
}

async function downloadImage(url: string, slugHint: string): Promise<string> {
  if (!url || url.startsWith("/uploads/")) return url;
  if (url.startsWith("/logos/")) return url;

  const res = await fetch(url, {
    headers: { "user-agent": "petrosphere-web/1.0 (+import-wp-news)" },
  });
  if (!res.ok) {
    console.warn(`  ! image download failed (${res.status}): ${url}`);
    return url;
  }

  const buf = Buffer.from(await res.arrayBuffer());
  const ext = extFromUrl(url, res.headers.get("content-type"));
  const hash = crypto.createHash("sha1").update(url).digest("hex").slice(0, 10);
  const safeSlug = slugHint.replace(/[^a-z0-9-]+/gi, "-").slice(0, 40) || "news";
  const filename = `${safeSlug}-${hash}.${ext}`;
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(path.join(OUT_DIR, filename), buf);
  return `/uploads/news/${filename}`;
}

async function localizeItemImages(item: CompanyNewsItem): Promise<CompanyNewsItem> {
  const slug = canonicalNewsSlug(item.slug) || "news";
  const imageSrc = await downloadImage(item.imageSrc, slug);

  const body: NewsBodyBlock[] = [];
  for (const block of item.body ?? []) {
    if (block.type === "image" && block.src) {
      body.push({
        ...block,
        src: await downloadImage(block.src, slug),
      });
    } else {
      body.push(block);
    }
  }

  return { ...item, imageSrc, body };
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL_WEBSITE?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY_WEBSITE?.trim();
  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL_WEBSITE or SUPABASE_SERVICE_ROLE_KEY_WEBSITE in .env.local",
    );
  }

  console.log(`Fetching up to ${LIMIT} posts from petrosphere.com.ph/latest-news …`);
  const listing = await fetchPetrosphereLatestNews(LIMIT);
  console.log(`Found ${listing.length} listing cards. Hydrating full articles…`);

  const imported: CompanyNewsItem[] = [];

  for (let i = 0; i < listing.length; i++) {
    const card = listing[i];
    process.stdout.write(`[${i + 1}/${listing.length}] ${card.title.slice(0, 64)}… `);

    let article = card;
    if (card.externalHref) {
      try {
        article = await fetchPetrosphereNewsArticleByUrl(card.externalHref);
        article = {
          ...article,
          summary: card.summary || article.summary,
          imageSrc: card.imageSrc || article.imageSrc,
          category: card.category || article.category,
        };
      } catch (e) {
        console.warn(`\n  ! article fetch failed, keeping card summary:`, e);
      }
    }

    const localized = await localizeItemImages(article);
    const slug = canonicalNewsSlug(localized.slug);
    imported.push({
      ...localized,
      id: authoredIdFromSlug(slug),
      slug,
      external: false,
      externalHref: undefined,
      location: localized.location || "Nationwide · Puerto Princesa",
    });
    console.log("ok");
  }

  const db = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const rows = imported.map((item) => ({
    id: item.id,
    slug: item.slug,
    category: item.category,
    title: item.title,
    published_at: item.publishedAt.slice(0, 10),
    summary: item.summary,
    image_src: item.imageSrc,
    body: item.body,
    external: false,
    external_href: null,
    cta: item.cta ?? null,
    location: item.location ?? null,
  }));

  console.log(`\nUpserting ${rows.length} posts into news_authored…`);
  const { error } = await db.from("news_authored").upsert(rows);
  if (error) throw error;

  console.log("\nDone.");
  console.log(`- Posts saved to Supabase: ${rows.length}`);
  console.log(`- Images saved under: public/uploads/news/`);
  console.log("\nNext:");
  console.log("1) Add PETROSPHERE_WP_NEWS_FETCH=0 to .env.local");
  console.log("2) Restart npm run dev");
  console.log("3) Open /news and confirm posts still appear");
  console.log("4) Commit public/uploads/news/ so production keeps the images");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
