import { NextResponse } from "next/server";

import {
  getEffectiveAdminCredentials,
  isAdminPasswordConfigured,
  setAdminSessionCookie,
} from "@/lib/admin-session";

export async function POST(req: Request) {
  if (!isAdminPasswordConfigured()) {
    return NextResponse.json(
      { error: "ADMIN_PASSWORD must be set in production. Add ADMIN_PASSWORD on your server or in .env." },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email =
    typeof body === "object" && body !== null && "email" in body && typeof (body as { email: unknown }).email === "string"
      ? (body as { email: string }).email
      : "";
  const password =
    typeof body === "object" && body !== null && "password" in body && typeof (body as { password: unknown }).password === "string"
      ? (body as { password: string }).password
      : "";

  const expected = getEffectiveAdminCredentials();
  if (!email || !password || !expected || email !== expected.email || password !== expected.password) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  await setAdminSessionCookie();
  return NextResponse.json({ ok: true });
}
