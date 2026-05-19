/**
 * Supabase environment helpers (safe on client and server).
 *
 * Two backends:
 * - TMS:  NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY + TMS_SCHEMA
 * - CMS:  NEXT_PUBLIC_SUPABASE_URL_WEBSITE + SUPABASE_SERVICE_ROLE_KEY_WEBSITE (+ optional anon for reads)
 */

export const TMS_SCHEMA = process.env.NEXT_PUBLIC_TMS_SCHEMA?.trim() || "tms";

export type SiteContentStorage = "file" | "supabase";

export function getSiteContentStorage(): SiteContentStorage {
  const v = process.env.SITE_CONTENT_STORAGE?.trim().toLowerCase();
  return v === "supabase" ? "supabase" : "file";
}

// ─── TMS (courses / schedule) ───────────────────────────────────────────────

export function getTmsSupabaseUrl(): string | undefined {
  return process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || undefined;
}

export function getTmsSupabaseAnonKey(): string | undefined {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || undefined;
}

export function isTmsSupabaseConfigured(): boolean {
  return Boolean(getTmsSupabaseUrl() && getTmsSupabaseAnonKey());
}

/** @deprecated Use getTmsSupabaseUrl — kept for compatibility */
export function getSupabaseUrl(): string | undefined {
  return getTmsSupabaseUrl();
}

/** @deprecated Use getTmsSupabaseAnonKey */
export function getSupabaseAnonKey(): string | undefined {
  return getTmsSupabaseAnonKey();
}

/** @deprecated Use isTmsSupabaseConfigured */
export function isSupabaseConfigured(): boolean {
  return isTmsSupabaseConfigured();
}

// ─── Website CMS (your project) ─────────────────────────────────────────────

export function getCmsSupabaseUrl(): string | undefined {
  return process.env.NEXT_PUBLIC_SUPABASE_URL_WEBSITE?.trim() || undefined;
}

export function getCmsSupabaseAnonKey(): string | undefined {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_WEBSITE?.trim() || undefined;
}

export function getCmsServiceRoleKey(): string | undefined {
  return process.env.SUPABASE_SERVICE_ROLE_KEY_WEBSITE?.trim() || undefined;
}

export function isCmsSupabaseConfigured(): boolean {
  return Boolean(getCmsSupabaseUrl() && getCmsServiceRoleKey());
}

export function isCmsSupabaseReadable(): boolean {
  return Boolean(getCmsSupabaseUrl() && (getCmsSupabaseAnonKey() || getCmsServiceRoleKey()));
}

/** CMS reads/writes in your Supabase project (server-side service role). */
export function isSupabaseSiteContentEnabled(): boolean {
  if (!isCmsSupabaseConfigured()) return false;
  if (getSiteContentStorage() === "supabase") return true;
  return Boolean(process.env.VERCEL);
}

function isReadOnlyDeployFs(): boolean {
  return Boolean(process.env.VERCEL) || process.env.NODE_ENV === "production";
}

export function assertSiteContentWritable(): void {
  if (isSupabaseSiteContentEnabled()) return;
  if (!isReadOnlyDeployFs()) return;
  throw new Error(
    "Saving is not configured for this deployment. Add NEXT_PUBLIC_SUPABASE_URL_WEBSITE and SUPABASE_SERVICE_ROLE_KEY_WEBSITE, or set SITE_CONTENT_STORAGE=supabase.",
  );
}
