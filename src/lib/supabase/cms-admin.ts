import "server-only";

import { createClient } from "@supabase/supabase-js";

import { getCmsServiceRoleKey, getCmsSupabaseUrl } from "@/lib/supabase/env";
import type { Database } from "@/lib/supabase/types/database";

/** Service-role client for /admin CMS writes. Never import from client components. */
export function createCmsAdminClient() {
  const url = getCmsSupabaseUrl();
  const key = getCmsServiceRoleKey();
  if (!url || !key) {
    throw new Error(
      "CMS Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL_WEBSITE and SUPABASE_SERVICE_ROLE_KEY_WEBSITE.",
    );
  }

  return createClient<Database>(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/** Alias for createCmsAdminClient */
export const createAdminSupabaseClient = createCmsAdminClient;
