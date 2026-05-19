import { getCmsSupabaseAnonKey, getCmsSupabaseUrl } from "@/lib/supabase/env";

/** CMS Supabase Auth is configured (URL + anon key for browser/server auth). */
export function isCmsAuthConfigured(): boolean {
  return Boolean(getCmsSupabaseUrl() && getCmsSupabaseAnonKey());
}
