import { redirect } from "next/navigation";

import { AdminApp } from "@/components/admin/AdminApp";
import { verifyAdminSession } from "@/lib/admin-session";
import { getSiteContentSnapshotForAdminSync } from "@/lib/site-content";

export const runtime = "nodejs";

export default async function AdminDashboardPage() {
  if (!(await verifyAdminSession())) {
    redirect("/admin/login");
  }
  const snapshot = await getSiteContentSnapshotForAdminSync({ limit: 12, hydrateBodies: true });
  return <AdminApp initial={snapshot} />;
}
