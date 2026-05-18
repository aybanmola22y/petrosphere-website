import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { verifyAdminSession } from "@/lib/admin-session";
import { getSiteContentSnapshotForAdminSync, persistSiteContent } from "@/lib/site-content";
import { siteContentSavePayloadSchema } from "@/lib/site-content-schema";

export const runtime = "nodejs";

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

  const parsed = siteContentSavePayloadSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 422 });
  }

  try {
    await persistSiteContent(parsed.data);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Write failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  // The public homepage uses ISR; clear cached HTML so edits reflect immediately.
  revalidatePath("/");

  return NextResponse.json({ ok: true });
}
