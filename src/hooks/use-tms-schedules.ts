"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchTmsSchedules } from "@/lib/tms";

export function useTmsSchedules() {
  return useQuery({
    queryKey: ["tms-schedules"],
    queryFn: fetchTmsSchedules,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
}
