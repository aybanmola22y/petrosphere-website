import { NextResponse } from "next/server";

import { hasAdminTurnstileGate } from "@/lib/admin-turnstile-gate";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/route-handler";
import { isTurnstileConfigured } from "@/lib/turnstile";

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
  const challengeId =
    typeof body === "object" &&
    body !== null &&
    "challengeId" in body &&
    typeof (body as { challengeId: unknown }).challengeId === "string"
      ? (body as { challengeId: string }).challengeId
      : "";
  const code =
    typeof body === "object" && body !== null && "code" in body && typeof (body as { code: unknown }).code === "string"
      ? (body as { code: string }).code.replace(/\s/g, "")
      : "";

  if (!factorId || !challengeId || !/^\d{6}$/.test(code)) {
    return NextResponse.json({ error: "Enter the 6-digit code from your authenticator app." }, { status: 400 });
  }

  if (isTurnstileConfigured() && !(await hasAdminTurnstileGate())) {
    return NextResponse.json({ error: "Complete the security verification before signing in." }, { status: 403 });
  }

  try {
    const { supabase, jsonResponse } = await createRouteHandlerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Sign in with your password first." }, { status: 401 });
    }

    const { error } = await supabase.auth.mfa.verify({ factorId, challengeId, code });
    if (error) {
      return jsonResponse({ error: "Invalid or expired code. Try again." }, { status: 401 });
    }

    return jsonResponse({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Verification failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
