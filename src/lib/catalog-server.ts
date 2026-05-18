import "server-only";

import { resolveCourseBySlug } from "@/lib/catalog";
import { getCachedPublicCatalog } from "@/lib/server-cache";

export async function getCourseForSlug(slug: string) {
  const list = await getCachedPublicCatalog();
  return resolveCourseBySlug(slug, list);
}
