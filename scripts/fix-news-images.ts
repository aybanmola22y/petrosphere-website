/**
 * Fix Company Update images: WordPress serves lazy-load SVG data-URIs.
 * Decode bv-img-url, download real files into public/uploads/news, update CMS.
 *
 * Usage: npx tsx scripts/fix-news-images.ts
 */
import crypto from "crypto";
import fs from "fs";
import path from "path";

import { createClient } from "@supabase/supabase-js";

import {
  fetchPetrosphereLatestNews,
  fetchPetrosphereNewsArticleByUrl,
} from "../src/lib/petrosphere-latest-news";
import { canonicalNewsSlug } from "../src/lib/news-slug";
import type { CompanyNewsItem, NewsBodyBlock } from "../src/data/companyNews";

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

const OUT_DIR = path.join(process.cwd(), "public", "uploads", "news");
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

function authoredIdFromSlug(slug: string): string {
  const hex = crypto.createHash("sha1").update(slug).digest("hex").slice(0, 12);
  const n = BigInt(`0x${hex}`) % 10n ** 13n;
  return `news-${n.toString()}`;
}

function decodeDataUri(url: string): string | null {
  const m = url.match(/^data:image\/svg\+xml;base64,(.+)$/i);
  if (!m) return null;
  try {
    return Buffer.from(m[1], "base64").toString("utf8");
  } catch {
    return null;
  }
}

function extractBvImgUrl(svgText: string): string | null {
  const m = svgText.match(/bv-img-url="([^"]+)"/i);
  return m?.[1] ? m[1].replace(/&amp;/g, "&") : null;
}

function unwrapOptimizerUrl(url: string): string[] {
  const candidates = [url];
  const m = url.match(
    /\/wp-content\/uploads\/al_opt_content\/IMAGE\/[^/]+\/wp-content\/uploads\/(.+?)(?:\.bv\.webp)?$/i,
  );
  if (m) {
    candidates.unshift(`https://petrosphere.com.ph/wp-content/uploads/${m[1]}`);
  }
  if (url.includes(".bv.webp")) {
    candidates.push(url.replace(/\.bv\.webp$/i, ""));
  }
  return [...new Set(candidates)];
}

function resolveCandidateUrls(raw: string): string[] {
  if (!raw) return [];
  if (raw.startsWith("data:image/svg+xml")) {
    const svg = decodeDataUri(raw);
    const nested = svg ? extractBvImgUrl(svg) : null;
    return nested ? unwrapOptimizerUrl(nested) : [];
  }
  if (/^https?:\/\//i.test(raw)) return unwrapOptimizerUrl(raw);
  return [];
}

function extFromBytes(url: string, contentType: string | null, bytes: Buffer): string {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "jpg";
  if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50) return "png";
  if (
    bytes.length >= 12 &&
    bytes.toString("ascii", 0, 4) === "RIFF" &&
    bytes.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "webp";
  }
  try {
    const pathname = new URL(url).pathname.toLowerCase();
    if (pathname.endsWith(".png") || pathname.includes(".png.")) return "png";
    if (pathname.endsWith(".webp") || pathname.includes(".webp")) return "webp";
    if (pathname.endsWith(".jpg") || pathname.endsWith(".jpeg") || pathname.includes(".jpg.")) {
      return "jpg";
    }
  } catch {
    /* ignore */
  }
  if (contentType?.includes("png")) return "png";
  if (contentType?.includes("webp")) return "webp";
  return "jpg";
}

async function fetchBytes(url: string): Promise<{ buf: Buffer; contentType: string | null; finalUrl: string } | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "user-agent": UA,
        accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
        referer: "https://petrosphere.com.ph/",
      },
      redirect: "follow",
    });
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    return { buf, contentType: res.headers.get("content-type"), finalUrl: res.url || url };
  } catch {
    return null;
  }
}

async function downloadImage(rawUrl: string, slugHint: string): Promise<string> {
  if (!rawUrl) return "/logos/petrosphere.svg";
  if (rawUrl.startsWith("/uploads/")) return rawUrl;
  if (rawUrl.startsWith("/logos/")) return rawUrl;
  if (rawUrl.includes("s.w.org/images/core/emoji")) return rawUrl; // skip emoji icons in body

  const candidates = resolveCandidateUrls(rawUrl);
  if (!candidates.length) {
    console.warn(`  ! no download candidates for: ${rawUrl.slice(0, 80)}`);
    return "/logos/petrosphere.svg";
  }

  for (const candidate of candidates) {
    const hit = await fetchBytes(candidate);
    if (!hit || hit.buf.length < 5000) continue;
    const head = hit.buf.toString("utf8", 0, Math.min(80, hit.buf.length));
    if (head.includes("<svg") || head.includes("<!DOCTYPE") || head.includes("<html")) continue;

    const ext = extFromBytes(hit.finalUrl, hit.contentType, hit.buf);
    const hash = crypto.createHash("sha1").update(rawUrl).digest("hex").slice(0, 10);
    const safeSlug = slugHint.replace(/[^a-z0-9-]+/gi, "-").slice(0, 40) || "news";
    const filename = `${safeSlug}-${hash}.${ext}`;
    fs.mkdirSync(OUT_DIR, { recursive: true });
    fs.writeFileSync(path.join(OUT_DIR, filename), hit.buf);
    console.log(`  + ${filename} (${hit.buf.length} bytes) from ${candidate.slice(0, 70)}`);
    return `/uploads/news/${filename}`;
  }

  console.warn(`  ! failed all candidates for: ${rawUrl.slice(0, 90)}`);
  return "/logos/petrosphere.svg";
}

async function localizeItemImages(item: CompanyNewsItem): Promise<CompanyNewsItem> {
  const slug = canonicalNewsSlug(item.slug) || "news";
  const imageSrc = await downloadImage(item.imageSrc, slug);

  const body: NewsBodyBlock[] = [];
  for (const block of item.body ?? []) {
    if (block.type === "image" && block.src) {
      const src = await downloadImage(block.src, slug);
      // Drop emoji/logo-only body images that failed
      if (src.includes("s.w.org") || src === "/logos/petrosphere.svg") continue;
      body.push({ ...block, src });
    } else {
      body.push(block);
    }
  }

  return { ...item, imageSrc, body };
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL_WEBSITE?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY_WEBSITE?.trim();
  if (!url || !key) throw new Error("Missing CMS Supabase env vars");

  console.log("Fetching WordPress listing + full articles…");
  const listing = await fetchPetrosphereLatestNews(40);
  const imported: CompanyNewsItem[] = [];

  for (let i = 0; i < listing.length; i++) {
    const card = listing[i];
    console.log(`[${i + 1}/${listing.length}] ${card.title.slice(0, 64)}`);

    let article = card;
    if (card.externalHref) {
      try {
        article = await fetchPetrosphereNewsArticleByUrl(card.externalHref);
        article = {
          ...article,
          summary: card.summary || article.summary,
          // Prefer listing image (usually the featured card art)
          imageSrc: card.imageSrc || article.imageSrc,
          category: card.category || article.category,
        };
      } catch (e) {
        console.warn("  ! article fetch failed", e);
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

  console.log(`\nUpserting ${rows.length} posts…`);
  const { error } = await db.from("news_authored").upsert(rows);
  if (error) throw error;

  let ok = 0;
  for (const r of rows) {
    const p = path.join(process.cwd(), "public", String(r.image_src).replace(/^\//, ""));
    try {
      const size = fs.statSync(p).size;
      const good = size >= 5000 && String(r.image_src).startsWith("/uploads/");
      console.log(good ? "OK  " : "BAD ", size, r.image_src.slice(0, 70), "|", r.title.slice(0, 36));
      if (good) ok += 1;
    } catch {
      console.log("MISS", r.image_src.slice(0, 70), "|", r.title.slice(0, 36));
    }
  }

  console.log(`\nFixed card images: ${ok}/${rows.length}`);
  console.log("Refresh /news (hard refresh). Redeploy so production gets public/uploads/news.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
