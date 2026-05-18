import { createBrowserClient } from "@supabase/ssr";

import { getCmsSupabaseAnonKey, getCmsSupabaseUrl } from "@/lib/supabase/env";
import type { Database } from "@/lib/supabase/types/database";

/** Browser client for your website CMS project (`public` schema). */
export function createBrowserSupabaseClient() {
  const url = getCmsSupabaseUrl();
  const key = getCmsSupabaseAnonKey();
  if (!url || !key) {
    throw new Error(
      "CMS Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL_WEBSITE and NEXT_PUBLIC_SUPABASE_ANON_KEY_WEBSITE.",
    );
  }
  return createBrowserClient<Database>(url, key);
}

/** Explicit name for the website CMS browser client */
export const createCmsBrowserClient = createBrowserSupabaseClient;
