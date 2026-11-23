"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import type { Course } from "@/data/mockData";
import { resolveCatalogList } from "@/lib/catalog";
import { CACHE_REVALIDATE_SECONDS } from "@/lib/cache";
import { fetchPublicCatalog } from "@/lib/public-api";

const canFetchCatalog =
  typeof process.env.NEXT_PUBLIC_SUPABASE_URL === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_URL.length > 0 &&
  typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 0;

/** Stable seed for SSR + first client paint (avoids title hydration mismatches). */
const localCatalogSeed = resolveCatalogList([]);

export function useCatalogCoursesList(initialData?: Course[]): {
  catalogCourses: Course[];
  isLoading: boolean;
  isFromSupabase: boolean;
} {
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    setHasMounted(true);
  }, []);

  const seed =
    initialData && initialData.length > 0 ? initialData : localCatalogSeed;

  const { data, isFetching } = useQuery({
    queryKey: ["catalog-courses"],
    queryFn: () => fetchPublicCatalog<Course[]>(),
    staleTime: CACHE_REVALIDATE_SECONDS.tms * 1000,
    retry: 1,
    enabled: canFetchCatalog && hasMounted,
    initialData: seed,
    // Local mock seed is immediately stale; server snapshot stays fresh for staleTime.
    initialDataUpdatedAt: initialData && initialData.length > 0 ? 1 : 0,
  });

  const remote = Array.isArray(data) ? data : [];
  /**
   * Until mount, always render the same seed used on the server.
   * After mount, prefer live catalog when present.
   */
  const catalogCourses = !hasMounted
    ? seed
    : remote.length > 0
      ? remote
      : seed;

  return {
    catalogCourses,
    isLoading: Boolean(canFetchCatalog && hasMounted && isFetching && remote.length === 0),
    isFromSupabase: hasMounted && remote.length > 0,
  };
}
