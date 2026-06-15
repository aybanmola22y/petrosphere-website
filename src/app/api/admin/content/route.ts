import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";

import { CACHE_TAGS } from "@/lib/cache";
import { verifyAdminSession } from "@/lib/admin-session";
import { getSiteContentSnapshotForAdminSync, persistSiteContent } from "@/lib/site-content";
import { sanitizeNewsItem } from "@/lib/news-slug";
import { siteContentSavePayloadSchema } from "@/lib/site-content-schema";
import type { SiteContentSnapshot } from "@/types/site-content";

export const runtime = "nodejs";

function sanitizeSnapshot(snapshot: SiteContentSnapshot): SiteContentSnapshot {
  return {
    ...snapshot,
    news: snapshot.news.map((item) => sanitizeNewsItem(item)),
  };
}

function sanitizeSavePayload(raw: unknown): unknown {
  if (!raw || typeof raw !== "object") return raw;
  const payload = raw as { baseline?: SiteContentSnapshot; data?: SiteContentSnapshot };
  return {
    ...payload,
    baseline: payload.baseline ? sanitizeSnapshot(payload.baseline) : payload.baseline,
    data: payload.data ? sanitizeSnapshot(payload.data) : payload.data,
  };
}

export async function GET() {
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const snapshot = await getSiteContentSnapshotForAdminSync({ limit: 12, hydrateBodies: true });
  return NextResponse.json(snapshot);
}

export async function POST(req: Request) {
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = siteContentSavePayloadSchema.safeParse(sanitizeSavePayload(raw));
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 422 });
  }

  try {
    await persistSiteContent(parsed.data);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Write failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  revalidatePath("/");
  revalidatePath("/courses");
  revalidatePath("/schedule");
  // sitemap is a static public/sitemap.xml (regenerated on deploy via postbuild)
  revalidateTag(CACHE_TAGS.cms);
  revalidateTag(CACHE_TAGS.news);

  return NextResponse.json({ ok: true });
}
