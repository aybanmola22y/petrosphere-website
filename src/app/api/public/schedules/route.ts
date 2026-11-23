import { NextResponse } from "next/server";

import { CACHE_REVALIDATE_SECONDS } from "@/lib/cache";
import { getCachedTmsSchedules } from "@/lib/server-cache";

export const runtime = "nodejs";

export async function GET() {
  const sessions = await getCachedTmsSchedules();
  return NextResponse.json(sessions, {
    headers: {
      "Cache-Control": `public, max-age=60, s-maxage=${CACHE_REVALIDATE_SECONDS.tms}, stale-while-revalidate=600`,
    },
  });
}
