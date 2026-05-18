import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { getCmsSupabaseAnonKey, getCmsSupabaseUrl } from "@/lib/supabase/env";
import type { Database } from "@/lib/supabase/types/database";

/** Server client for your website CMS project (`public` schema). */
export async function createServerSupabaseClient() {
  const url = getCmsSupabaseUrl();
  const key = getCmsSupabaseAnonKey();
  if (!url || !key) {
    throw new Error(
      "CMS Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL_WEBSITE and NEXT_PUBLIC_SUPABASE_ANON_KEY_WEBSITE.",
    );
  }

  const cookieStore = await cookies();

  return createServerClient<Database>(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          /* Server Components cannot set cookies */
        }
      },
    },
  });
}

export const createCmsServerClient = createServerSupabaseClient;
