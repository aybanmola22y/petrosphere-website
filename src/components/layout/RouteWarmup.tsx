"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { CACHE_REVALIDATE_SECONDS } from "@/lib/cache";
import { fetchPublicCatalog, fetchPublicSchedules } from "@/lib/public-api";

const PRIMARY_ROUTES = [
  "/",
  "/about",
  "/courses",
  "/schedule",
  "/review",
  "/services",
  "/news",
  "/contact",
] as const;

const canFetch =
  typeof process.env.NEXT_PUBLIC_SUPABASE_URL === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_URL.length > 0 &&
  typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 0;

/**
 * Prefetch primary routes + warm catalog/schedule caches after first paint.
 */
export function RouteWarmup() {
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    let cancelled = false;

    const run = () => {
      if (cancelled) return;

      for (const href of PRIMARY_ROUTES) {
        try {
          router.prefetch(href);
        } catch {
          /* ignore */
        }
      }

      if (!canFetch) return;

      void queryClient.prefetchQuery({
        queryKey: ["catalog-courses"],
        queryFn: () => fetchPublicCatalog(),
        staleTime: CACHE_REVALIDATE_SECONDS.tms * 1000,
      });
      void queryClient.prefetchQuery({
        queryKey: ["tms-schedules"],
        queryFn: () => fetchPublicSchedules(),
        staleTime: CACHE_REVALIDATE_SECONDS.tms * 1000,
      });
    };

    const supportsIdle =
      typeof window !== "undefined" && typeof window.requestIdleCallback === "function";

    let idleId: number | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    if (supportsIdle) {
      idleId = window.requestIdleCallback(run, { timeout: 1500 });
    } else {
      timeoutId = setTimeout(run, 400);
    }

    return () => {
      cancelled = true;
      if (idleId !== undefined && typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId !== undefined) {
        clearTimeout(timeoutId);
      }
    };
  }, [queryClient, router]);

  return null;
}
