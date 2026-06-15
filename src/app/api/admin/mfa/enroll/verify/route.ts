import { NextResponse } from "next/server";

import { createRouteHandlerSupabaseClient } from "@/lib/supabase/route-handler";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const factorId =
    typeof body === "object" && body !== null && "factorId" in body && typeof (body as { factorId: unknown }).factorId === "string"
      ? (body as { factorId: string }).factorId
      : "";
  const code =
    typeof body === "object" && body !== null && "code" in body && typeof (body as { code: unknown }).code === "string"
      ? (body as { code: string }).code.replace(/\s/g, "")
      : "";

  if (!factorId || !/^\d{6}$/.test(code)) {
    return NextResponse.json({ error: "Enter the 6-digit code from your authenticator app." }, { status: 400 });
  }

  try {
    const { supabase, jsonResponse } = await createRouteHandlerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId, code });
    if (error) {
      return jsonResponse({ error: "Invalid code. Check Microsoft Authenticator and try again." }, { status: 401 });
    }

    return jsonResponse({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Enrollment verification failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
