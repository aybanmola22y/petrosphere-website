"use client";

import { useQuery } from "@tanstack/react-query";

import { courses as mockCourses } from "@/data/mockData";
import type { Course } from "@/data/mockData";
import { resolveCatalogList } from "@/lib/catalog";
import { CACHE_REVALIDATE_SECONDS } from "@/lib/cache";
import { fetchPublicCatalog } from "@/lib/public-api";

const canFetchCatalog =
  typeof process.env.NEXT_PUBLIC_SUPABASE_URL === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_URL.length > 0 &&
  typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 0;

export function useCatalogCoursesList(): {
  catalogCourses: Course[];
  isLoading: boolean;
  isFromSupabase: boolean;
} {
  const { data, isPending } = useQuery({
    queryKey: ["catalog-courses"],
    queryFn: () => fetchPublicCatalog<Course[]>(),
    staleTime: CACHE_REVALIDATE_SECONDS.tms * 1000,
    retry: 1,
    enabled: canFetchCatalog,
  });

  /** Avoid falling back to static mock while the first remote fetch is still in flight. */
  const awaitingFirstRemote = canFetchCatalog && isPending && data === undefined;
  const remote = data ?? [];
  const catalogCourses = awaitingFirstRemote ? [] : remote.length > 0 ? remote : resolveCatalogList([]);
  const isFromSupabase = remote.length > 0;

  return {
    catalogCourses,
    isLoading: canFetchCatalog && isPending,
    isFromSupabase,
  };
}
