import { z } from "zod";

const newsCategories = ["CSR", "HSE NEWS", "NEWS", "PARTNERSHIP", "TRAINING"] as const;

const newsItemSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  category: z.enum(newsCategories),
  title: z.string().min(1),
  publishedAt: z.string().min(1),
  summary: z.string(),
  imageSrc: z.string().min(1),
  body: z.array(z.string()).min(1),
  external: z.boolean().optional(),
  externalHref: z.string().optional(),
  cta: z.object({ label: z.string(), href: z.string() }).optional(),
});

const videoSchema = z.object({
  id: z.string().min(1),
  studentName: z.string().min(1),
  credential: z.string(),
  summary: z.string(),
  youtubeVideoId: z.string().min(1),
  posterSrc: z.string().min(1),
});

const statSchema = z.object({
  value: z.string().min(1),
  label: z.string().min(1),
});

export const siteContentSnapshotSchema = z.object({
  news: z.array(newsItemSchema),
  videoTestimonials: z.array(videoSchema),
  stats: z.array(statSchema),
});

// For Option B behavior: persist only local edits (overrides) computed as a diff
// between a baseline snapshot (fetched+merged) and the user's edited snapshot.
export const siteContentSavePayloadSchema = z.object({
  baseline: siteContentSnapshotSchema,
  data: siteContentSnapshotSchema,
});
