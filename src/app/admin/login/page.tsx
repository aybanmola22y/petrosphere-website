import { redirect } from "next/navigation";

import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { DEV_FALLBACK_ADMIN_PASSWORD } from "@/constants/admin-auth";
import { isAdminPasswordConfigured, usesDevelopmentAdminFallback, verifyAdminSession } from "@/lib/admin-session";

export const runtime = "nodejs";

export default async function AdminLoginPage() {
  if (await verifyAdminSession()) {
    redirect("/admin");
  }
  const devFallback = usesDevelopmentAdminFallback();
  return (
    <AdminLoginForm
      passwordConfigured={isAdminPasswordConfigured()}
      defaultDevPassword={devFallback ? DEV_FALLBACK_ADMIN_PASSWORD : null}
    />
  );
}
