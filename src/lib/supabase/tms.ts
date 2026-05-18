import "server-only";

import { createClient } from "@supabase/supabase-js";

import { getTmsSupabaseAnonKey, getTmsSupabaseUrl, TMS_SCHEMA } from "@/lib/supabase/env";

/**
 * Read-only TMS schema client (courses, schedules).
 * Uses the TMS Supabase project — separate from the website CMS project.
 */
export function createTmsSupabaseClient() {
  const url = getTmsSupabaseUrl();
  const key = getTmsSupabaseAnonKey();
  if (!url || !key) {
    throw new Error(
      "TMS Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  return createClient(url, key, {
    db: { schema: TMS_SCHEMA },
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
