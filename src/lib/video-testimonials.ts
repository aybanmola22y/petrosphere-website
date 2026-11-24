import type { StudentVideoTestimonial } from "@/data/siteMarketingDefaults";
import { withMediaCacheBust } from "@/lib/video-testimonial-media";

/** Maximum graduate video cards on the public homepage. */
export const MAX_PUBLIC_VIDEO_TESTIMONIALS = 3;

/** Public homepage only: keep the N newest (index 0 = latest in storage). */
export function capVideoTestimonialsNewestFirst(
  items: StudentVideoTestimonial[],
  limit = MAX_PUBLIC_VIDEO_TESTIMONIALS,
): StudentVideoTestimonial[] {
  return items.slice(0, limit);
}

function withPlayableMediaUrls(item: StudentVideoTestimonial): StudentVideoTestimonial {
  return {
    ...item,
    videoSrc: withMediaCacheBust(item.videoSrc),
    posterSrc: withMediaCacheBust(item.posterSrc) ?? item.posterSrc,
  };
}

/**
 * Homepage grid: newest on the left, older entries to the right (3 columns).
 * Input must already be ordered newest-first (index 0 = latest).
 */
export function videoTestimonialsForHomepageDisplay(
  items: StudentVideoTestimonial[],
  limit = MAX_PUBLIC_VIDEO_TESTIMONIALS,
): StudentVideoTestimonial[] {
  return capVideoTestimonialsNewestFirst(items, limit).map(withPlayableMediaUrls);
}
