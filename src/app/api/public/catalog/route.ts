import { NextResponse } from "next/server";

import { CACHE_REVALIDATE_SECONDS } from "@/lib/cache";
import { getCachedPublicCatalog } from "@/lib/server-cache";

export const runtime = "nodejs";

export async function GET() {
  const courses = await getCachedPublicCatalog();
  return NextResponse.json(courses, {
    headers: {
      "Cache-Control": `public, max-age=60, s-maxage=${CACHE_REVALIDATE_SECONDS.tms}, stale-while-revalidate=600`,
    },
  });
}
