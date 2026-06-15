import "server-only";

import { cookies } from "next/headers";

import { isTurnstileConfigured } from "@/lib/turnstile";

export const ADMIN_TURNSTILE_GATE_COOKIE = "admin_turnstile_gate";

export const ADMIN_TURNSTILE_GATE_MAX_AGE_SEC = 15 * 60;

export async function hasAdminTurnstileGate(): Promise<boolean> {
  if (!isTurnstileConfigured()) return true;
  const jar = await cookies();
  return jar.get(ADMIN_TURNSTILE_GATE_COOKIE)?.value === "1";
}
