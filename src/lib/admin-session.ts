import "server-only";

import { createHmac, timingSafeEqual } from "crypto";

import { cookies } from "next/headers";

import { DEV_FALLBACK_ADMIN_EMAIL, DEV_FALLBACK_ADMIN_PASSWORD } from "@/constants/admin-auth";

export const ADMIN_COOKIE_NAME = "petrosphere_admin";

export type EffectiveAdminCredentials = { email: string; password: string };

/** Resolved credentials used for login. */
export function getEffectiveAdminCredentials(): EffectiveAdminCredentials | undefined {
  const envPassword = process.env.ADMIN_PASSWORD;
  if (envPassword?.length) {
    const email = process.env.ADMIN_EMAIL?.trim() || DEV_FALLBACK_ADMIN_EMAIL;
    return { email, password: envPassword };
  }
  if (process.env.NODE_ENV !== "production") {
    return { email: DEV_FALLBACK_ADMIN_EMAIL, password: DEV_FALLBACK_ADMIN_PASSWORD };
  }
  return undefined;
}

export function isAdminPasswordConfigured(): boolean {
  return Boolean(getEffectiveAdminCredentials()?.password?.length);
}

export function usesDevelopmentAdminFallback(): boolean {
  return process.env.NODE_ENV !== "production" && !process.env.ADMIN_PASSWORD?.length;
}

function signingSecret(): string | undefined {
  const creds = getEffectiveAdminCredentials();
  return process.env.ADMIN_SESSION_SECRET?.length ? process.env.ADMIN_SESSION_SECRET : creds?.password;
}

export async function verifyAdminSession(): Promise<boolean> {
  const secret = signingSecret();
  if (!secret) return false;
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!token || !token.includes(".")) return false;
  const dot = token.indexOf(".");
  const payloadB64 = token.slice(0, dot);
  const sigHex = token.slice(dot + 1);
  const expectedSig = createHmac("sha256", secret).update(payloadB64).digest("hex");
  try {
    if (sigHex.length !== expectedSig.length) return false;
    if (!timingSafeEqual(Buffer.from(sigHex), Buffer.from(expectedSig))) return false;
    const json = Buffer.from(payloadB64, "base64url").toString("utf-8");
    const payload = JSON.parse(json) as { exp?: number };
    if (typeof payload.exp !== "number" || payload.exp < Date.now()) return false;
    return true;
  } catch {
    return false;
  }
}

export async function setAdminSessionCookie(): Promise<void> {
  const secret = signingSecret();
  if (!secret) throw new Error("ADMIN_PASSWORD or ADMIN_SESSION_SECRET is not set");
  const exp = Date.now() + 7 * 24 * 60 * 60 * 1000;
  const payloadB64 = Buffer.from(JSON.stringify({ exp })).toString("base64url");
  const sigHex = createHmac("sha256", secret).update(payloadB64).digest("hex");
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, `${payloadB64}.${sigHex}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });
}

export async function clearAdminSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
}
