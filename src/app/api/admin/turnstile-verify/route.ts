import { NextResponse } from "next/server";

import {
  ADMIN_TURNSTILE_GATE_COOKIE,
  ADMIN_TURNSTILE_GATE_MAX_AGE_SEC,
} from "@/lib/admin-turnstile-gate";
import { isTurnstileConfigured, verifyTurnstileToken } from "@/lib/turnstile";

export const runtime = "nodejs";

function clientIp(req: Request): string | null {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? null;
  return req.headers.get("x-real-ip");
}

export async function POST(req: Request) {
  if (!isTurnstileConfigured()) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const token =
    typeof body === "object" && body !== null && "token" in body && typeof (body as { token: unknown }).token === "string"
      ? (body as { token: string }).token
      : "";

  if (!token) {
    return NextResponse.json({ error: "Missing Turnstile token" }, { status: 400 });
  }

  const ok = await verifyTurnstileToken(token, clientIp(req));
  if (!ok) {
    return NextResponse.json({ error: "Verification failed. Try again." }, { status: 403 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_TURNSTILE_GATE_COOKIE, "1", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: ADMIN_TURNSTILE_GATE_MAX_AGE_SEC,
    path: "/",
  });
  return res;
}
