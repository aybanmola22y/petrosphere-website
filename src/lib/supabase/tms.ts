import "server-only";

import { createClient } from "@supabase/supabase-js";

import { getSupabaseAnonKey, getSupabaseUrl, TMS_SCHEMA } from "@/lib/supabase/env";

/**
 * Read-only TMS schema client (courses, schedules).
 * TMS tables live in a separate Postgres schema on the same Supabase project.
 */
export function createTmsSupabaseClient() {
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();
  if (!url || !key) {
    throw new Error("Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }

  return createClient(url, key, {
    db: { schema: TMS_SCHEMA },
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
