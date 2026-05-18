/** Shared cache durations (seconds) for ISR and `unstable_cache`. */
export const CACHE_REVALIDATE_SECONDS = {
  /** Homepage CMS: stats, testimonials, news overrides. */
  cms: 300,
  /** TMS catalog + schedules. */
  tms: 300,
  /** Petrosphere.com.ph news scrape. */
  news: 60 * 30,
  /** Mostly static marketing pages. */
  staticPage: 3600,
} as const;

/** `revalidateTag` targets — invalidate from admin saves. */
export const CACHE_TAGS = {
  cms: "site-cms",
  tmsCourses: "tms-courses",
  tmsSchedules: "tms-schedules",
  news: "petrosphere-news",
} as const;
