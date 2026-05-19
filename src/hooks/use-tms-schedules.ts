"use client";

import { useQuery } from "@tanstack/react-query";

import type { TrainingSession } from "@/data/mockData";
import { CACHE_REVALIDATE_SECONDS } from "@/lib/cache";
import { fetchPublicSchedules } from "@/lib/public-api";

const canFetchSchedules =
  typeof process.env.NEXT_PUBLIC_SUPABASE_URL === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_URL.length > 0 &&
  typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 0;

export function useTmsSchedules(initialData?: TrainingSession[]) {
  return useQuery({
    queryKey: ["tms-schedules"],
    queryFn: () => fetchPublicSchedules<TrainingSession[]>(),
    staleTime: CACHE_REVALIDATE_SECONDS.tms * 1000,
    retry: 2,
    enabled: canFetchSchedules,
    initialData,
    initialDataUpdatedAt: initialData ? Date.now() : undefined,
  });
}
