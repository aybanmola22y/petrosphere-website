# Admin two-factor authentication (Microsoft Authenticator)

Petrosphere admin uses **Supabase Auth TOTP** — the same standard as Microsoft Authenticator, Google Authenticator, and Authy.

## 1. Enable MFA in Supabase

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your **website CMS** project (`NEXT_PUBLIC_SUPABASE_URL_WEBSITE`).
2. Go to **Authentication** → **Providers** (or **Settings**).
3. Ensure **Multi-Factor Authentication (TOTP)** is **enabled**.

## 2. Set up 2FA (each admin user)

1. Sign in to `/admin` (Turnstile → email/password).
2. On the **Dashboard**, open the **Two-factor authentication** card.
3. Click **Set up Microsoft Authenticator**.
4. On your phone:
   - Open **Microsoft Authenticator**
   - Tap **+** → **Other account** → **Scan QR code**
5. Enter the 6-digit code shown in the app → **Enable 2FA**.

## 3. Sign in with 2FA

1. Turnstile security check  
2. Email + password  
3. **Authenticator code** (6 digits from Microsoft Authenticator)

## Notes

- Codes rotate every ~30 seconds.
- If you lose your phone, another admin must help reset MFA in **Supabase → Authentication → Users** (or use Supabase recovery flows).
- Microsoft Authenticator is recommended but not required — any TOTP app works.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| "Invalid code" | Wait for a new code; check phone time is automatic |
| No QR on enroll | Refresh dashboard; ensure you are signed in |
| Stuck after password | Complete the 6-digit step on the login screen |
| MFA not offered | Enroll first from Dashboard → Two-factor authentication |
