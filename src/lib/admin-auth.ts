import "server-only";

import { createCmsAdminClient } from "@/lib/supabase/cms-admin";
import { getCmsSupabaseAnonKey, getCmsSupabaseUrl } from "@/lib/supabase/env";

/** CMS Supabase Auth is configured (URL + anon key for browser/server auth). */
export function isCmsAuthConfigured(): boolean {
  return Boolean(getCmsSupabaseUrl() && getCmsSupabaseAnonKey());
}

function bootstrapEmails(): Set<string> {
  const raw = process.env.ADMIN_BOOTSTRAP_EMAILS?.trim();
  if (!raw) return new Set();
  return new Set(
    raw
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean),
  );
}

/** True if this auth user id is on the admin allowlist (or bootstrapped via env). */
export async function isAdminUserId(userId: string, email?: string | null): Promise<boolean> {
  const admin = createCmsAdminClient();
  const { data, error } = await admin.from("admin_users").select("user_id").eq("user_id", userId).maybeSingle();

  if (error) {
    console.error("isAdminUserId:", error.message);
    return false;
  }
  if (data) return true;

  const normalizedEmail = email?.trim().toLowerCase();
  if (!normalizedEmail || !bootstrapEmails().has(normalizedEmail)) return false;

  const { error: insertError } = await admin.from("admin_users").upsert(
    { user_id: userId, email: normalizedEmail },
    { onConflict: "user_id" },
  );

  if (insertError) {
    console.error("admin bootstrap insert:", insertError.message);
    return false;
  }
  return true;
}
