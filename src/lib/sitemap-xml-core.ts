export type SitemapUrl = {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: string;
};

export function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function urlsToSitemapXml(urls: SitemapUrl[]): string {
  const body = urls
    .map((entry) => {
      const lines = [`    <loc>${escapeXml(entry.loc)}</loc>`];
      if (entry.lastmod) lines.push(`    <lastmod>${escapeXml(entry.lastmod)}</lastmod>`);
      if (entry.changefreq) lines.push(`    <changefreq>${escapeXml(entry.changefreq)}</changefreq>`);
      if (entry.priority) lines.push(`    <priority>${escapeXml(entry.priority)}</priority>`);
      return `  <url>\n${lines.join("\n")}\n  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

/** Canonical absolute URL for a path on this site. */
export function absoluteUrl(base: string, pathname: string): string {
  const origin = base.endsWith("/") ? base : `${base}/`;
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return new URL(path, origin).href;
}

export function staticSitemapUrls(base: string): SitemapUrl[] {
  const now = new Date().toISOString();
  return [
    { loc: absoluteUrl(base, "/"), lastmod: now, changefreq: "weekly", priority: "1" },
    { loc: absoluteUrl(base, "/about"), lastmod: now, changefreq: "monthly", priority: "0.8" },
    { loc: absoluteUrl(base, "/courses"), lastmod: now, changefreq: "daily", priority: "0.9" },
    { loc: absoluteUrl(base, "/schedule"), lastmod: now, changefreq: "daily", priority: "0.9" },
    { loc: absoluteUrl(base, "/services"), lastmod: now, changefreq: "monthly", priority: "0.75" },
    { loc: absoluteUrl(base, "/review"), lastmod: now, changefreq: "monthly", priority: "0.75" },
  ];
}
