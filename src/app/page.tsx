import type { Metadata } from "next";
import Home from "@/views/Home";
import { getStatsForSiteAsync, getVideoTestimonialsForSiteAsync } from "@/lib/site-content";
import { getCompanyNewsForSite } from "@/lib/site-content";
import { getCompanyNewsForHome } from "@/lib/site-content";
import { getCachedPublicCatalog } from "@/lib/server-cache";
import { resolveCatalogList } from "@/lib/catalog";

/** ISR: serve cached HTML; refresh CMS/news every 5 minutes. */
export const revalidate = 300;

export const metadata: Metadata = {
  title: {
    absolute: "Petrosphere Incorporated | Training, Review, and Consultancy Company",
  },
  description:
    "Premium safety, technical, and compliance training for enterprise clients.",
};

export default async function Page() {
  // Use admin-edited content when available; otherwise fall back to fetched Petrosphere posts.
  const [companyNews, videoTestimonials, stats, catalogCourses] = await Promise.all([
    getCompanyNewsForHome(6).catch(() => getCompanyNewsForSite().slice(0, 6)),
    getVideoTestimonialsForSiteAsync(),
    getStatsForSiteAsync(),
    getCachedPublicCatalog().catch(() => resolveCatalogList([])),
  ]);
  return (
    <Home
      companyNews={companyNews}
      videoTestimonials={videoTestimonials}
      stats={stats}
      initialCatalog={catalogCourses}
    />
  );
}
