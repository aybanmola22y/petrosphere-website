import type { Metadata } from "next";
import Schedule from "@/views/Schedule";

export const metadata: Metadata = {
  title: "Training Schedule",
  description:
    "View upcoming and completed public training runs across safety, EMS, and certification programs.",
};

export default function Page() {
  return <Schedule />;
}
