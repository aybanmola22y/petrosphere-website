import type { StudentVideoTestimonial } from "@/data/siteMarketingDefaults";

export function testimonialHasUploadedVideo(
  item: Pick<StudentVideoTestimonial, "videoSrc">,
): boolean {
  return Boolean(item.videoSrc?.trim());
}

export function testimonialHasPlayableVideo(item: StudentVideoTestimonial): boolean {
  return testimonialHasUploadedVideo(item) || Boolean(item.youtubeVideoId?.trim());
}

export function testimonialVideoLabel(item: StudentVideoTestimonial): string {
  if (testimonialHasUploadedVideo(item)) {
    const name = item.videoSrc!.split("/").pop() ?? "file";
    return `Upload: ${name}`;
  }
  if (item.youtubeVideoId?.trim()) return `YouTube: ${item.youtubeVideoId}`;
  return "No video";
}
