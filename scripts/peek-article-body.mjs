const slug = "latest-news-petrosphere-partners-with-spe-palawan-state-university-student-chapter-for-pogss-2026-driven-by-discovery-powering-progress-with-purpose";
const url = `https://petrosphere.com.ph/${slug.replace(/^latest-news-/, "latest-news/")}/`;

// find real url from listing
const list = await fetch("https://petrosphere.com.ph/latest-news/", {
  headers: { "user-agent": "Mozilla/5.0" },
}).then((r) => r.text());

const href = list.match(/href="([^"]*pogss[^"]*)"/i)?.[1];
const articleUrl = href?.startsWith("http") ? href : `https://petrosphere.com.ph${href}`;
console.log("url", articleUrl);

const html = await fetch(articleUrl, { headers: { "user-agent": "Mozilla/5.0" } }).then((r) => r.text());
const content = html.match(/<div class="entry-content clear"[\s\S]*?>([\s\S]*?)<\/motion>\s*<\/motion>\s*<\/article>/i)?.[1]
  ?? html.match(/<div class="entry-content clear"[\s\S]*?>([\s\S]*?)<\/div>\s*<\/div>\s*<\/article>/i)?.[1];

if (!content) {
  console.log("no content");
  process.exit(0);
}

const blockRe = /<(p|h[2-4]|figure)\b[^>]*>[\s\S]*?<\/\1>/gi;
let m;
let i = 0;
while ((m = blockRe.exec(content)) !== null) {
  const tag = m[0];
  const name = m[1];
  const text = tag.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 80);
  console.log(i++, name, text);
}
