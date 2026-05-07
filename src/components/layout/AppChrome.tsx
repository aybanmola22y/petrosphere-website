"use client";

import React, { Suspense } from "react";
import { usePathname } from "next/navigation";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Suspense fallback={<header className="fixed top-0 z-50 h-16 w-full bg-background/80" />}>
        <Navbar />
      </Suspense>
      <main className="grow">{children}</main>
      <Footer />
    </div>
  );
}

