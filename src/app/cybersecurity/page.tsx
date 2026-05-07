import type { Metadata } from "next";
import Cybersecurity from "@/views/Cybersecurity";

export const metadata: Metadata = {
  title: "Cybersecurity Advisory",
  description:
    "Cybersecurity and information resilience advisory: governance, controls mapping, incident readiness, and operational alignment.",
};

export default function Page() {
  return <Cybersecurity />;
}
