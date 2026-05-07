"use client";

import { useQuery } from "@tanstack/react-query";

import { courses as mockCourses } from "@/data/mockData";
import type { Course } from "@/data/mockData";
import { fetchCatalogCourses, resolveCatalogList } from "@/lib/catalog";

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
    queryFn: fetchCatalogCourses,
    staleTime: 1000 * 60 * 5,
    retry: 1,
    enabled: canFetchCatalog,
  });

  /** Avoid falling back to static mock while the first Supabase fetch is still in flight (wrong slugs → false "not found"). */
  const awaitingFirstRemote = canFetchCatalog && isPending && data === undefined;
  const remote = data ?? [];
  const catalogCourses = awaitingFirstRemote ? [] : resolveCatalogList(remote);
  const isFromSupabase = remote.length > 0;

  return {
    catalogCourses,
    isLoading: canFetchCatalog && isPending,
    isFromSupabase,
  };
}
