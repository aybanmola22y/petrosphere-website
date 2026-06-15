import { redirect } from "next/navigation";

import { AdminLoginShell } from "@/components/admin/AdminLoginShell";
import { isCmsAuthConfigured, verifyAdminSession } from "@/lib/admin-session";
import { getTurnstileSiteKey, isTurnstileConfigured } from "@/lib/turnstile";

export const runtime = "nodejs";

export default async function AdminLoginPage() {
  if (await verifyAdminSession()) {
    redirect("/admin");
  }
  const turnstileSiteKey = getTurnstileSiteKey();
  return (
    <AdminLoginShell
      authConfigured={isCmsAuthConfigured()}
      turnstileSiteKey={turnstileSiteKey}
      turnstileConfigured={isTurnstileConfigured()}
    />
  );
}
