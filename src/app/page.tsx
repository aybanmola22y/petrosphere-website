import type { Metadata } from "next";
import Home from "@/views/Home";
import { getStatsForSiteAsync, getVideoTestimonialsForSiteAsync } from "@/lib/site-content";
import { getCompanyNewsForSite } from "@/lib/site-content";
import { getCompanyNewsForHome } from "@/lib/site-content";

export const metadata: Metadata = {
  title: {
    absolute: "Petrosphere Incorporated | Training, Review, and Consultancy Company",
  },
  description:
    "Premium safety, technical, and compliance training for enterprise clients.",
};

export default async function Page() {
  // Use admin-edited content when available; otherwise fall back to fetched Petrosphere posts.
  const [companyNews, videoTestimonials, stats] = await Promise.all([
    getCompanyNewsForHome(6).catch(() => getCompanyNewsForSite().slice(0, 6)),
    getVideoTestimonialsForSiteAsync(),
    getStatsForSiteAsync(),
  ]);
  return (
    <Home
      companyNews={companyNews}
      videoTestimonials={videoTestimonials}
      stats={stats}
    />
  );
}
