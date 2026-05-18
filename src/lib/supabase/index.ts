export {
  getSiteContentStorage,
  getSupabaseAnonKey,
  getSupabaseServiceRoleKey,
  getSupabaseUrl,
  isSupabaseAdminConfigured,
  isSupabaseConfigured,
  isSupabaseSiteContentEnabled,
  TMS_SCHEMA,
  type SiteContentStorage,
} from "@/lib/supabase/env";
export { createBrowserSupabaseClient } from "@/lib/supabase/client";
export { createServerSupabaseClient } from "@/lib/supabase/server";
export { createAdminSupabaseClient } from "@/lib/supabase/admin";
export { createTmsSupabaseClient } from "@/lib/supabase/tms";
export type { Database, Json } from "@/lib/supabase/types/database";
