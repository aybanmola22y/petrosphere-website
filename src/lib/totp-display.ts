/** Label shown in Microsoft Authenticator and other TOTP apps. */
export const MFA_TOTP_ISSUER = "Petrosphere Admin";

export function buildMfaTotpUri(secret: string, email: string): string {
  const account = email.trim().toLowerCase();
  const label = encodeURIComponent(`${MFA_TOTP_ISSUER}:${account}`);
  const params = new URLSearchParams({
    secret,
    issuer: MFA_TOTP_ISSUER,
    algorithm: "SHA1",
    digits: "6",
    period: "30",
  });
  return `otpauth://totp/${label}?${params.toString()}`;
}
