import type { Metadata } from "next";

import { getCachedTmsSchedules } from "@/lib/server-cache";
import Schedule from "@/views/Schedule";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Training Schedule",
  description:
    "View upcoming and completed public training runs across safety, EMS, and certification programs.",
};

export default async function Page() {
  const initialSessions = await getCachedTmsSchedules();
  return <Schedule initialSessions={initialSessions} />;
}
