import { buildSitemapXml, buildStaticSitemapXml } from "@/lib/sitemap-xml";

export const runtime = "nodejs";
export const revalidate = 3600;

const XML_HEADERS = {
  "Content-Type": "application/xml; charset=utf-8",
  "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=600",
} as const;

export async function GET(): Promise<Response> {
  try {
    const xml = await buildSitemapXml();
    return new Response(xml, { status: 200, headers: XML_HEADERS });
  } catch (error) {
    console.error("sitemap.xml route: falling back to static URLs", error);
    return new Response(buildStaticSitemapXml(), { status: 200, headers: XML_HEADERS });
  }
}
