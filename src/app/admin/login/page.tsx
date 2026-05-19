import { redirect } from "next/navigation";

import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { isCmsAuthConfigured, verifyAdminSession } from "@/lib/admin-session";

export const runtime = "nodejs";

export default async function AdminLoginPage() {
  if (await verifyAdminSession()) {
    redirect("/admin");
  }
  return <AdminLoginForm authConfigured={isCmsAuthConfigured()} />;
}
