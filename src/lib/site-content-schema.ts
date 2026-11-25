import { z } from "zod";

import {
  isSafeAssetHref,
  isSafeContentId,
  isSafeExternalUrl,
  isSafeNavHref,
  isSafeSlug,
} from "@/lib/security";

const newsCategories = ["CSR", "HSE NEWS", "NEWS", "PARTNERSHIP", "TRAINING"] as const;

const safeSlug = z
  .string()
  .min(1)
  .max(200)
  .refine((s) => isSafeSlug(s), { message: "Invalid slug format" });

const safeContentId = z
  .string()
  .min(1)
  .max(200)
  .refine((s) => isSafeContentId(s), { message: "Invalid id format" });

const safeAssetHref = z
  .string()
  .min(1)
  .refine((s) => isSafeAssetHref(s), { message: "Asset URL must be http(s) or a site path" });

const safeExternalHref = z
  .string()
  .refine((s) => isSafeExternalUrl(s), { message: "External link must be a valid http(s) URL" });

const safeNavHref = z
  .string()
  .min(1)
  .refine((s) => isSafeNavHref(s), { message: "Link must be a valid http(s) URL or site path" });

const newsItemSchema = z.object({
  id: safeContentId,
  slug: safeSlug,
  category: z.enum(newsCategories),
  title: z.string().min(1),
  publishedAt: z.string().min(1),
  summary: z.string(),
  imageSrc: safeAssetHref,
  body: z.preprocess(
    (val) => {
      if (!Array.isArray(val)) return val;
      return val.map((item) =>
        typeof item === "string" ? { type: "paragraph", text: item } : item,
      );
    },
    z
      .array(
        z.discriminatedUnion("type", [
          z.object({ type: z.literal("paragraph"), text: z.string() }),
          z.object({ type: z.literal("heading"), text: z.string() }),
          z.object({ type: z.literal("image"), src: safeAssetHref, alt: z.string().optional() }),
        ]),
      )
      .min(1),
  ),
  external: z.boolean().optional(),
  externalHref: z
    .string()
    .optional()
    .refine((s) => !s?.trim() || isSafeExternalUrl(s), {
      message: "External link must be a valid http(s) URL",
    }),
  cta: z.object({ label: z.string(), href: safeNavHref }).optional(),
  location: z.string().optional(),
});

const videoSchema = z
  .object({
    id: safeContentId,
    studentName: z.string().min(1),
    credential: z.string(),
    summary: z.string(),
    youtubeVideoId: z.string(),
    videoSrc: z
      .string()
      .optional()
      .refine((s) => !s?.trim() || isSafeAssetHref(s), {
        message: "Video URL must be http(s) or a site path",
      }),
    posterSrc: z
      .string()
      .refine((s) => !s.trim() || isSafeAssetHref(s), {
        message: "Poster URL must be http(s) or a site path",
      }),
  })
  .refine((v) => Boolean(v.videoSrc?.trim()) || Boolean(v.youtubeVideoId?.trim()), {
    message: "Each testimonial needs a YouTube video ID or an uploaded video file.",
  });

const statSchema = z.object({
  value: z.string().min(1),
  label: z.string().min(1),
});

const heroMasonryImageSchema = z.object({
  src: safeAssetHref,
  tall: z.boolean().optional(),
  alt: z.string().optional(),
});

const heroMasonrySchema = z
  .array(z.array(heroMasonryImageSchema).min(1).max(12))
  .min(1)
  .max(6);

export const siteContentSnapshotSchema = z.object({
  news: z.array(newsItemSchema),
  videoTestimonials: z.array(videoSchema),
  stats: z.array(statSchema),
  heroMasonry: heroMasonrySchema,
});

// For Option B behavior: persist only local edits (overrides) computed as a diff
// between a baseline snapshot (fetched+merged) and the user's edited snapshot.
export const siteContentSavePayloadSchema = z.object({
  baseline: siteContentSnapshotSchema,
  data: siteContentSnapshotSchema,
});
