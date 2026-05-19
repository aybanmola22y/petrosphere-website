import { NextResponse } from "next/server";

import { isCmsAuthConfigured } from "@/lib/admin-auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  if (!isCmsAuthConfigured()) {
    return NextResponse.json(
      {
        error:
          "CMS auth is not configured. Set NEXT_PUBLIC_SUPABASE_URL_WEBSITE and NEXT_PUBLIC_SUPABASE_ANON_KEY_WEBSITE.",
      },
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
      ? (body as { email: string }).email.trim()
      : "";
  const password =
    typeof body === "object" && body !== null && "password" in body && typeof (body as { password: unknown }).password === "string"
      ? (body as { password: string }).password
      : "";

  if (!email || !password) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}
