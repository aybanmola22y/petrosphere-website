import type { Metadata } from "next";
import Home from "@/views/Home";
import {
  getCompanyNewsForHome,
  getCompanyNewsForSite,
  getHeroMasonryForSiteAsync,
  getStatsForSiteAsync,
  getVideoTestimonialsForSiteAsync,
} from "@/lib/site-content";
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
  const [companyNews, videoTestimonials, stats, heroMasonry, catalogCourses] = await Promise.all([
    getCompanyNewsForHome(6).catch(() => getCompanyNewsForSite().slice(0, 6)),
    getVideoTestimonialsForSiteAsync(),
    getStatsForSiteAsync(),
    getHeroMasonryForSiteAsync(),
    getCachedPublicCatalog().catch(() => resolveCatalogList([])),
  ]);
  return (
    <Home
      companyNews={companyNews}
      videoTestimonials={videoTestimonials}
      stats={stats}
      heroMasonry={heroMasonry}
      initialCatalog={catalogCourses}
    />
  );
}
