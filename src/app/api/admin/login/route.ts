import { NextResponse } from "next/server";

import { isCmsAuthConfigured } from "@/lib/admin-auth";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/route-handler";

function loginErrorMessage(code: string | undefined, message: string | undefined): string {
  if (code === "email_not_confirmed") {
    return "Email not confirmed. In Supabase → Authentication → Users, confirm the user or disable email confirmation.";
  }
  if (code === "invalid_credentials" || message?.toLowerCase().includes("invalid")) {
    return "Invalid email or password. Use the password set when you added the user in Supabase → Authentication → Users.";
  }
  return message ?? "Sign-in failed. Try again or reset the password in Supabase.";
}

export async function POST(req: Request) {
  if (!isCmsAuthConfigured()) {
    return NextResponse.json(
      {
        error:
          "CMS auth is not configured. Set NEXT_PUBLIC_SUPABASE_URL_WEBSITE and NEXT_PUBLIC_SUPABASE_ANON_KEY_WEBSITE, then restart the dev server.",
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
      ? (body as { email: string }).email.trim().toLowerCase()
      : "";
  const password =
    typeof body === "object" && body !== null && "password" in body && typeof (body as { password: unknown }).password === "string"
      ? (body as { password: string }).password
      : "";

  if (!email || !password) {
    return NextResponse.json({ error: "Enter your email and password." }, { status: 401 });
  }

  const { supabase, jsonResponse } = await createRouteHandlerSupabaseClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    return jsonResponse(
      { error: loginErrorMessage(error?.code, error?.message) },
      { status: 401 },
    );
  }

  return jsonResponse({ ok: true });
}
