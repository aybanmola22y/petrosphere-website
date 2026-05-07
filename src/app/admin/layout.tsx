import type { Metadata } from "next";
import { Manrope } from "next/font/google";

import "./admin.css";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-admin",
  display: "swap",
});

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${manrope.variable} admin-scope`}>{children}</div>;
}
