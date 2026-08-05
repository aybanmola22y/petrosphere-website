"use client";

import { cn } from "@/lib/utils";

export function AdminAuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <div className="flex min-h-screen flex-col items-center justify-center px-5 py-12 sm:px-6">
        <div className="w-full max-w-[400px]">{children}</div>
      </div>
    </div>
  );
}

/** Kept for MFA / setup screens that still wrap content in a card. */
export function AdminAuthCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("w-full", className)}>{children}</div>
  );
}
