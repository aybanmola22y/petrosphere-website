import "server-only";

import type { CompanyNewsItem, CompanyNewsCategory, NewsBodyBlock } from "@/data/companyNews";
import { stripEmbeddedRelatedPosts } from "@/data/companyNews";

const SOURCE_URL = "https://petrosphere.com.ph/latest-news/";
const REQUEST_HEADERS = {
  // Some WP/CDN setups behave better with a UA.
  "user-agent": "petrosphere-web/1.0 (+https://example.invalid)",
  accept: "text/html,application/xhtml+xml",
} as const;

function decodeHtmlEntities(input: string): string {
  return (
    input
      // numeric entities
      .replace(/&#(\d+);/g, (_m, n) => String.fromCharCode(Number(n)))
      // basic named entities we expect in excerpts/titles
      .replaceAll("&nbsp;", " ")
      .replaceAll("&amp;", "&")
      .replaceAll("&quot;", '"')
      .replaceAll("&apos;", "'")
      .replaceAll("&lt;", "<")
      .replaceAll("&gt;", ">")
      // collapse whitespace
      .replace(/\s+/g, " ")
      .trim()
  );
}

function stripTags(input: string): string {
  return input.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<style[\s\S]*?<\/style>/gi, "").replace(/<[^>]*>/g, " ");
}

function inferCategoryFromHref(href: string): CompanyNewsCategory {
  if (href.includes("/hse/")) return "HSE NEWS";
  if (href.includes("/news/")) return "NEWS";
  return "NEWS";
}

function parseWpOrdinalDateToIso(input: string): string | null {
  // e.g. "29th April 2026"
  const m = input.trim().match(/^(\d{1,2})(?:st|nd|rd|th)\s+([A-Za-z]+)\s+(\d{4})$/);
  if (!m) return null;
  const day = Number(m[1]);
  const monthName = m[2].toLowerCase();
  const year = Number(m[3]);
  const monthMap: Record<string, number> = {
    january: 1,
    february: 2,
    march: 3,
    april: 4,
    may: 5,
    june: 6,
    july: 7,
    august: 8,
    september: 9,
    october: 10,
    november: 11,
    december: 12,
  };
  const month = monthMap[monthName];
  if (!year || !month || !day) return null;
  const mm = String(month).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${year}-${mm}-${dd}`;
}

function slugFromUrl(href: string): string {
  try {
    const u = new URL(href);
    const path = u.pathname.replace(/^\/+|\/+$/g, "");
    if (!path) return "latest-news";
    return path.replaceAll("/", "-").toLowerCase();
  } catch {
    return href.replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "").toLowerCase() || "latest-news";
  }
}

type Parsed = {
  href: string;
  title: string;
  summary: string;
  imageSrc: string;
  dateText: string;
};

function parseLatestNewsHtml(html: string): Parsed[] {
  const blocks = html.split('class="premium-blog-post-outer-container"');
  if (blocks.length <= 1) return [];

  const results: Parsed[] = [];
  for (const block of blocks.slice(1)) {
    const img = block.match(/<img[^>]+src="([^"]+)"/i)?.[1] ?? "";
    const href = block.match(/<h2 class="premium-blog-entry-title">[\s\S]*?<a[^>]+href="([^"]+)"/i)?.[1] ?? "";
    const titleRaw = block.match(/<h2 class="premium-blog-entry-title">[\s\S]*?<a[^>]*>([\s\S]*?)<\/a>/i)?.[1] ?? "";
    const dateRaw = block.match(/class="premium-blog-post-time[\s\S]*?<span>([^<]+)<\/span>/i)?.[1] ?? "";
    const summaryRaw = block.match(/<p class="premium-blog-post-content">([\s\S]*?)<\/p>/i)?.[1] ?? "";

    const title = decodeHtmlEntities(titleRaw.replace(/<[^>]*>/g, ""));
    const summary = decodeHtmlEntities(summaryRaw.replace(/<[^>]*>/g, ""));
    const dateText = decodeHtmlEntities(dateRaw);

    if (!href || !title) continue;

    results.push({
      href,
      title,
      summary,
      imageSrc: img,
      dateText,
    });
  }

  return results;
}

function parseIsoDateFromHtml(html: string): string | null {
  // Prefer the machine-readable meta tag.
  const meta = html.match(/<meta[^>]+property="article:published_time"[^>]+content="([^"]+)"/i)?.[1];
  if (meta) {
    const m = meta.match(/^(\d{4}-\d{2}-\d{2})/);
    if (m) return m[1];
  }

  // Fallback to the human date used in the theme.
  const human = html.match(/class="published"[^>]*>\s*([^<]+?)\s*</i)?.[1];
  if (human) {
    const iso = parseWpOrdinalDateToIso(decodeHtmlEntities(human));
    if (iso) return iso;
  }

  return null;
}

function parseTitleFromHtml(html: string): string | null {
  const titleRaw = html.match(/<h1 class="entry-title"[^>]*>([\s\S]*?)<\/h1>/i)?.[1];
  if (titleRaw) return decodeHtmlEntities(stripTags(titleRaw));
  const ogTitle = html.match(/<meta[^>]+property="og:title"[^>]+content="([^"]+)"/i)?.[1];
  if (ogTitle) return decodeHtmlEntities(ogTitle);
  return null;
}

function parseOgImage(html: string): string | null {
  return html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/i)?.[1] ?? null;
}

function parseMetaDescription(html: string): string | null {
  const raw =
    html.match(/<meta[^>]+name="description"[^>]+content="([^"]+)"/i)?.[1] ??
    html.match(/<meta[^>]+content="([^"]+)"[^>]+name="description"/i)?.[1] ??
    html.match(/<meta[^>]+property="og:description"[^>]+content="([^"]+)"/i)?.[1] ??
    html.match(/<meta[^>]+content="([^"]+)"[^>]+property="og:description"/i)?.[1];
  if (!raw) return null;
  const text = decodeHtmlEntities(stripTags(raw)).replace(/\s+/g, " ").trim();
  return text.length ? text : null;
}

function extractEntryContentHtml(html: string): string {
  const m = html.match(/<div class="entry-content clear"[\s\S]*?>([\s\S]*?)<\/div>\s*<\/div>\s*<\/article>/i);
  return m?.[1] ?? "";
}

function parseImgSrcFromTag(tag: string): string | null {
  const src =
    tag.match(/\ssrc="([^"]+)"/i)?.[1] ??
    tag.match(/\sdata-src="([^"]+)"/i)?.[1] ??
    tag.match(/\sdata-lazy-src="([^"]+)"/i)?.[1];
  if (!src || src.startsWith("data:")) return null;
  return src;
}

function parseArticleBodyBlocks(html: string): NewsBodyBlock[] {
  const content = extractEntryContentHtml(html);
  if (!content) return [];

  const blocks: NewsBodyBlock[] = [];
  const blockRe = /<(p|h[2-4]|figure)\b[^>]*>[\s\S]*?<\/\1>/gi;
  let match: RegExpExecArray | null;

  while ((match = blockRe.exec(content)) !== null) {
    const tag = match[0];
    const tagName = match[1].toLowerCase();

    if (tagName === "figure" || /<img\b/i.test(tag)) {
      for (const imgMatch of tag.matchAll(/<img\b[^>]*>/gi)) {
        const src = parseImgSrcFromTag(imgMatch[0]);
        if (src) {
          const alt = imgMatch[0].match(/\salt="([^"]*)"/i)?.[1];
          blocks.push({
            type: "image",
            src,
            alt: alt ? decodeHtmlEntities(alt) : undefined,
          });
        }
      }
      continue;
    }

    if (/^h[2-4]$/.test(tagName)) {
      const text = decodeHtmlEntities(stripTags(tag)).replace(/\s+/g, " ").trim();
      if (text) blocks.push({ type: "heading", text });
      continue;
    }

    const imgTags = Array.from(tag.matchAll(/<img\b[^>]*>/gi));
    const text = decodeHtmlEntities(stripTags(tag)).replace(/\s+/g, " ").trim();

    if (imgTags.length) {
      for (const imgMatch of imgTags) {
        const src = parseImgSrcFromTag(imgMatch[0]);
        if (src) {
          const alt = imgMatch[0].match(/\salt="([^"]*)"/i)?.[1];
          blocks.push({
            type: "image",
            src,
            alt: alt ? decodeHtmlEntities(alt) : undefined,
          });
        }
      }
    }

    if (text && !/^data:image/i.test(text)) {
      blocks.push({ type: "paragraph", text });
    }
  }

  return stripEmbeddedRelatedPosts(dedupeLeadingParagraphs(blocks));
}

/** WordPress often repeats the opening sentence in a second, longer paragraph. */
function dedupeLeadingParagraphs(blocks: NewsBodyBlock[]): NewsBodyBlock[] {
  if (blocks.length < 2) return blocks;
  const first = blocks[0];
  const second = blocks[1];
  if (first.type !== "paragraph" || second.type !== "paragraph") return blocks;

  const a = first.text.trim();
  const b = second.text.trim();
  if (!a || !b) return blocks;

  // Drop the short teaser when the next paragraph starts with the same text.
  if (b.startsWith(a) || a === b.slice(0, Math.min(a.length, b.length))) {
    return blocks.slice(1);
  }

  return blocks;
}

async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, {
    next: { revalidate: 60 * 30 },
    headers: REQUEST_HEADERS,
  });
  if (!res.ok) throw new Error(`Fetch failed: ${res.status} (${url})`);
  return await res.text();
}

export async function fetchPetrosphereNewsArticleByUrl(sourceUrl: string): Promise<CompanyNewsItem> {
  const html = await fetchHtml(sourceUrl);
  const title = parseTitleFromHtml(html) ?? "News";
  const publishedAt = parseIsoDateFromHtml(html) ?? "1970-01-01";
  const imageSrc = parseOgImage(html) ?? "/logos/petrosphere.svg";
  const body = parseArticleBodyBlocks(html);
  const summary =
    parseMetaDescription(html) ??
    "Read the full update on Petrosphere's official website.";

  const slug = slugFromUrl(sourceUrl);

  return {
    id: `petrosphere-${slug}`,
    slug,
    category: inferCategoryFromHref(sourceUrl),
    title,
    publishedAt,
    summary,
    imageSrc,
    body: body.length ? body : [{ type: "paragraph", text: summary }],
    // Render internally, but keep the source URL for traceability.
    external: false,
    externalHref: sourceUrl,
  };
}

export async function fetchPetrosphereNewsArticleBySlug(slug: string): Promise<CompanyNewsItem | null> {
  const normalizedSlug = slug.toLowerCase();
  // Search the latest-news index pages for the matching slug, then fetch the full article page.
  const maxPages = 8;
  for (let page = 1; page <= maxPages; page++) {
    const url = page === 1 ? SOURCE_URL : `${SOURCE_URL.replace(/\/$/, "")}/page/${page}/`;
    const html = await fetchHtml(url).catch(() => null);
    if (!html) break;
    const parsed = parseLatestNewsHtml(html);
    if (parsed.length === 0) break;

    const hit = parsed.find((p) => slugFromUrl(p.href) === normalizedSlug);
    if (hit?.href) {
      // Prefer index summary/image if present; body/title/date from article page.
      const article = await fetchPetrosphereNewsArticleByUrl(hit.href);
      return {
        ...article,
        summary: hit.summary ? hit.summary : article.summary,
        imageSrc: hit.imageSrc ? hit.imageSrc : article.imageSrc,
      };
    }
  }
  return null;
}

export async function fetchPetrosphereLatestNews(limit = 6): Promise<CompanyNewsItem[]> {
  const items: Parsed[] = [];
  const seen = new Set<string>();

  // The first page's HTML typically includes only a couple of posts; older posts are on /page/2/, /page/3/, ...
  // Pull pages until we reach the requested limit (bounded by maxPages to avoid runaway).
  const maxPages = 8;
  for (let page = 1; page <= maxPages && items.length < limit; page++) {
    const url = page === 1 ? SOURCE_URL : `${SOURCE_URL.replace(/\/$/, "")}/page/${page}/`;
    const res = await fetch(url, {
      // Cache on the server; refresh occasionally.
      next: { revalidate: 60 * 30 },
      headers: REQUEST_HEADERS,
    });

    if (!res.ok) {
      if (page === 1) throw new Error(`Failed to fetch Petrosphere latest news: ${res.status}`);
      break;
    }

    const html = await res.text();
    const parsed = parseLatestNewsHtml(html);
    if (parsed.length === 0) break;

    for (const p of parsed) {
      if (!p.href || seen.has(p.href)) continue;
      seen.add(p.href);
      items.push(p);
      if (items.length >= limit) break;
    }
  }

  // For cards missing an image in the listing HTML, fetch the article page's og:image.
  const resolved = await Promise.all(
    items.slice(0, limit).map(async (p) => {
      let imageSrc = p.imageSrc;
      if (!imageSrc && p.href) {
        try {
          const articleHtml = await fetch(p.href, {
            next: { revalidate: 60 * 60 * 6 }, // 6-hour cache — images rarely change
            headers: REQUEST_HEADERS,
          }).then((r) => (r.ok ? r.text() : ""));
          imageSrc = parseOgImage(articleHtml) ?? "";
        } catch {
          // ignore — fall through to placeholder below
        }
      }

      const slug = slugFromUrl(p.href);
      const publishedAt =
        (p.dateText && parseWpOrdinalDateToIso(p.dateText)) ??
        // fallback so the UI doesn't break (shows raw)
        "1970-01-01";

      return {
        id: `petrosphere-${slug}`,
        slug,
        category: inferCategoryFromHref(p.href),
        title: p.title,
        publishedAt,
        summary: p.summary || "Read the full update on Petrosphere's official website.",
        imageSrc: imageSrc || "/logos/petrosphere.svg",
        body: [],
        // Link internally to `/news/[slug]`, but keep the source URL to fetch the full article on demand.
        external: false,
        externalHref: p.href,
      };
    }),
  );

  return resolved;
}

