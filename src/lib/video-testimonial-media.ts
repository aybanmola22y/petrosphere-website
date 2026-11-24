import type { StudentVideoTestimonial } from "@/data/siteMarketingDefaults";

/**
 * Bust poisoned Vercel CDN entries that cached apex→www "Redirecting..."
 * bodies for /media/* before the Hostinger IP proxy fix.
 */
export const MEDIA_CACHE_BUST = "20261124b";

export function withMediaCacheBust(src?: string | null): string | undefined {
  const raw = src?.trim();
  if (!raw) return undefined;
  if (!raw.startsWith("/media/")) return raw;
  try {
    const url = new URL(raw, "https://petrosphere.com.ph");
    url.searchParams.set("v", MEDIA_CACHE_BUST);
    return `${url.pathname}?${url.searchParams.toString()}`;
  } catch {
    const join = raw.includes("?") ? "&" : "?";
    return `${raw}${join}v=${MEDIA_CACHE_BUST}`;
  }
}

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

/** Grab a clear still from a video File or URL for use as a poster thumbnail. */
export function captureVideoPosterFrame(
  source: File | string,
  seekSeconds = 0.35,
): Promise<Blob | null> {
  if (typeof document === "undefined") return Promise.resolve(null);

  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    const objectUrl = typeof source === "string" ? null : URL.createObjectURL(source);
    video.src = typeof source === "string" ? source : objectUrl!;

    let settled = false;
    const finish = (blob: Blob | null) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeout);
      video.removeAttribute("src");
      video.load();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      resolve(blob);
    };

    const timeout = window.setTimeout(() => finish(null), 12000);

    const snap = () => {
      try {
        const w = video.videoWidth;
        const h = video.videoHeight;
        if (!w || !h) {
          finish(null);
          return;
        }
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          finish(null);
          return;
        }
        ctx.drawImage(video, 0, 0, w, h);
        canvas.toBlob((blob) => finish(blob), "image/jpeg", 0.92);
      } catch {
        finish(null);
      }
    };

    video.addEventListener(
      "loadeddata",
      () => {
        const target = Math.min(
          Math.max(seekSeconds, 0.1),
          Number.isFinite(video.duration) && video.duration > 0 ? video.duration * 0.15 : seekSeconds,
        );
        const onSeeked = () => {
          video.removeEventListener("seeked", onSeeked);
          snap();
        };
        video.addEventListener("seeked", onSeeked);
        try {
          video.currentTime = target;
        } catch {
          snap();
        }
      },
      { once: true },
    );

    video.addEventListener("error", () => finish(null), { once: true });
  });
}
