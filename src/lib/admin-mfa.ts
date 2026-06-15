import type { SupabaseClient } from "@supabase/supabase-js";

export type MfaChallengePayload = {
  needsMfa: true;
  factorId: string;
  challengeId: string;
};

export async function getVerifiedTotpFactor(supabase: SupabaseClient) {
  const { data, error } = await supabase.auth.mfa.listFactors();
  if (error) throw error;
  return data.totp.find((f) => f.status === "verified") ?? null;
}

export async function needsMfaVerification(supabase: SupabaseClient): Promise<boolean> {
  const factor = await getVerifiedTotpFactor(supabase);
  if (!factor) return false;
  const { data: aal, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (error) throw error;
  return aal.nextLevel === "aal2" && aal.currentLevel !== "aal2";
}

export async function isAdminMfaSatisfied(supabase: SupabaseClient): Promise<boolean> {
  const factor = await getVerifiedTotpFactor(supabase);
  if (!factor) return true;
  const { data: aal, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (error) throw error;
  return aal.currentLevel === "aal2";
}

export async function createMfaChallenge(supabase: SupabaseClient): Promise<MfaChallengePayload | null> {
  const factor = await getVerifiedTotpFactor(supabase);
  if (!factor) return null;
  const needs = await needsMfaVerification(supabase);
  if (!needs) return null;
  const { data: challenge, error } = await supabase.auth.mfa.challenge({ factorId: factor.id });
  if (error) throw error;
  if (!challenge?.id) return null;
  return { needsMfa: true, factorId: factor.id, challengeId: challenge.id };
}
