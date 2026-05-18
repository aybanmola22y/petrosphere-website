/** Shared Supabase / TMS environment helpers (safe on client and server). */

export const TMS_SCHEMA = process.env.NEXT_PUBLIC_TMS_SCHEMA?.trim() || "tms";

/** `file` = site-content.local.json (default). `supabase` = public CMS tables. */
export type SiteContentStorage = "file" | "supabase";

export function getSiteContentStorage(): SiteContentStorage {
  const v = process.env.SITE_CONTENT_STORAGE?.trim().toLowerCase();
  return v === "supabase" ? "supabase" : "file";
}

export function getSupabaseUrl(): string | undefined {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  return url || undefined;
}

export function getSupabaseAnonKey(): string | undefined {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  return key || undefined;
}

export function getSupabaseServiceRoleKey(): string | undefined {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  return key || undefined;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(getSupabaseUrl() && getSupabaseAnonKey());
}

export function isSupabaseAdminConfigured(): boolean {
  return Boolean(getSupabaseUrl() && getSupabaseServiceRoleKey());
}

/** True when deployed on Vercel (or similar) where the filesystem is read-only. */
export function isServerlessDeployment(): boolean {
  return process.env.VERCEL === "1";
}

/**
 * CMS reads/writes in Supabase (needs service role for admin save).
 * On Vercel we always use Supabase when the service role is set — local JSON cannot be written.
 */
export function isSupabaseSiteContentEnabled(): boolean {
  if (!isSupabaseAdminConfigured()) return false;
  if (getSiteContentStorage() === "supabase") return true;
  return isServerlessDeployment();
}

export function assertSiteContentPersistenceConfigured(): void {
  if (isSupabaseSiteContentEnabled()) return;
  if (isServerlessDeployment()) {
    throw new Error(
      "Admin save on Vercel requires Supabase. In Vercel → Environment Variables, set SITE_CONTENT_STORAGE=supabase, SUPABASE_SERVICE_ROLE_KEY (same project as your URL), then redeploy.",
    );
  }
}
