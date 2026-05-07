import type { Metadata } from "next";
import Home from "@/views/Home";
import {
  getStatsForSite,
  getVideoTestimonialsForSite,
} from "@/lib/site-content";
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
  const companyNews = await getCompanyNewsForHome(6).catch(() => getCompanyNewsForSite().slice(0, 6));
  return (
    <Home
      companyNews={companyNews}
      videoTestimonials={getVideoTestimonialsForSite()}
      stats={getStatsForSite()}
    />
  );
}
