import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isAdminMfaSatisfied } from "@/lib/admin-mfa";
import { isCmsAuthConfigured } from "@/lib/admin-auth";

export { isCmsAuthConfigured };

/** @deprecated Use isCmsAuthConfigured */
export function isAdminPasswordConfigured(): boolean {
  return isCmsAuthConfigured();
}

/** @deprecated Env-password fallback removed; always false */
export function usesDevelopmentAdminFallback(): boolean {
  return false;
}

export async function verifyAdminSession(): Promise<boolean> {
  if (!isCmsAuthConfigured()) return false;

  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) return false;
    return await isAdminMfaSatisfied(supabase);
  } catch {
    return false;
  }
}

export async function getAdminSessionUser(): Promise<{ id: string; email: string } | null> {
  if (!isCmsAuthConfigured()) return null;

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) return null;
  return { id: user.id, email: user.email };
}
