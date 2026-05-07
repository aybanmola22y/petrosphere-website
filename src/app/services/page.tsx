import type { Metadata } from "next";
import Services from "@/views/Services";

export const metadata: Metadata = {
  title: "Consulting & Advisory",
  description:
    "Enterprise consultancy services for occupational safety, environmental compliance, and operational governance.",
};

export default function Page() {
  return <Services />;
}
