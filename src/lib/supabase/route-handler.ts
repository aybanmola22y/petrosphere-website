import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getCmsSupabaseAnonKey, getCmsSupabaseUrl } from "@/lib/supabase/env";
import type { Database } from "@/lib/supabase/types/database";

/** Supabase client for Route Handlers — attaches auth cookies to the returned NextResponse. */
export async function createRouteHandlerSupabaseClient() {
  const url = getCmsSupabaseUrl();
  const key = getCmsSupabaseAnonKey();
  if (!url || !key) {
    throw new Error(
      "CMS Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL_WEBSITE and NEXT_PUBLIC_SUPABASE_ANON_KEY_WEBSITE.",
    );
  }

  const cookieStore = await cookies();
  let cookieResponse = NextResponse.next();

  const supabase = createServerClient<Database>(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options);
        });
        cookieResponse = NextResponse.next();
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  function jsonResponse(body: unknown, init?: ResponseInit) {
    const res = NextResponse.json(body, init);
    cookieResponse.cookies.getAll().forEach((cookie) => {
      res.cookies.set(cookie);
    });
    return res;
  }

  return { supabase, jsonResponse };
}
