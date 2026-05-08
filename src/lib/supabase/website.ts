import "server-only";

import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { createBrowserClient, createServerClient } from "@supabase/ssr";

/**
 * SECOND Supabase connection (your own Website project).
 *
 * Keep using NEXT_PUBLIC_SUPABASE_* for TMS fetching.
 * Use NEXT_PUBLIC_SUPABASE_*_WEBSITE for your own tables/auth.
 */

function websiteEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL_WEBSITE;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_WEBSITE;
  return { url, anonKey };
}

export function createSupabaseWebsiteBrowserClient() {
  const { url, anonKey } = websiteEnv();
  if (!url || !anonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL_WEBSITE or NEXT_PUBLIC_SUPABASE_ANON_KEY_WEBSITE");
  }
  return createBrowserClient(url, anonKey);
}

export async function createSupabaseWebsiteServerClient() {
  const { url, anonKey } = websiteEnv();
  if (!url || !anonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL_WEBSITE or NEXT_PUBLIC_SUPABASE_ANON_KEY_WEBSITE");
  }

  const cookieStore = await cookies();
  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server Components can't set cookies; Route Handlers can.
        }
      },
    },
  });
}

export function createSupabaseWebsiteAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL_WEBSITE;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY_WEBSITE;
  if (!url || !serviceRole) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL_WEBSITE or SUPABASE_SERVICE_ROLE_KEY_WEBSITE");
  }
  return createClient(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

