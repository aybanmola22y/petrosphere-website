import "server-only";

import type { Course } from "@/data/mockData";
import { mapCourseRowToCourse } from "@/lib/catalog";
import { CACHE_REVALIDATE_SECONDS } from "@/lib/cache";
import { buildCollisionBaseSlugSet, isExcludedTmsTestCourseRow } from "@/lib/tms";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const TMS_SCHEMA = process.env.NEXT_PUBLIC_TMS_SCHEMA || "tms";

/** Fetch raw course rows from TMS Supabase (server-only). */
export async function fetchCatalogCourses(): Promise<Course[]> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return [];
  }

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/courses?select=*&order=title.asc`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          "accept-profile": TMS_SCHEMA,
        },
        next: { revalidate: CACHE_REVALIDATE_SECONDS.tms },
      },
    );

    if (!response.ok) {
      console.warn(`fetchCatalogCourses: ${response.status} ${response.statusText}`);
      return [];
    }

    const data = (await response.json()) as unknown;
    if (!Array.isArray(data)) return [];

    const rows = data
      .filter((item): item is Record<string, unknown> => !!item && typeof item === "object")
      .filter((row) => !isExcludedTmsTestCourseRow(row));
    const collisionBases = buildCollisionBaseSlugSet(rows);

    const seenIds = new Set<string>();
    const out: Course[] = [];
    for (const item of rows) {
      const course = mapCourseRowToCourse(item, collisionBases);
      if (seenIds.has(course.id)) continue;
      seenIds.add(course.id);
      out.push(course);
    }
    return out;
  } catch (e) {
    console.warn("fetchCatalogCourses failed", e);
    return [];
  }
}
