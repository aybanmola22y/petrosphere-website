import type { Metadata } from "next";

import { LatestUpdatesSection } from "@/components/sections/LatestUpdatesSection";
import { getCompanyNewsForSite, getCompanyNewsMergedAsync } from "@/lib/site-content";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Company Updates & CSR",
  description:
    "Browse CSR initiatives, partnerships, training milestones, and community engagement from Petrosphere Incorporated.",
};

export default async function Page() {
  const items = await getCompanyNewsMergedAsync(100).catch(() => getCompanyNewsForSite());

  return (
    <LatestUpdatesSection
      items={items}
      title="All company updates"
      description="CSR, partnerships, training milestones, and community engagement — newest posts first."
      className="min-h-screen border-t-0 pt-28 md:pt-32"
    />
  );
}
