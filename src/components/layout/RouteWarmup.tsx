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
    const idle =
      typeof window !== "undefined" && "requestIdleCallback" in window
        ? window.requestIdleCallback
        : (cb: () => void) => window.setTimeout(cb, 400);

    const id = idle(() => {
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
    });

    return () => {
      cancelled = true;
      if (typeof window !== "undefined" && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(id as number);
      } else {
        window.clearTimeout(id as number);
      }
    };
  }, [queryClient, router]);

  return null;
}
