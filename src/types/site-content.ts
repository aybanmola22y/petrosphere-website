import type { CompanyNewsItem } from "@/data/companyNews";
import type { StudentVideoTestimonial } from "@/data/siteMarketingDefaults";

export type SiteStat = { value: string; label: string };

/** Full snapshot persisted to `site-content.local.json` and edited in /admin */
export type SiteContentSnapshot = {
  news: CompanyNewsItem[];
  videoTestimonials: StudentVideoTestimonial[];
  stats: SiteStat[];
};
