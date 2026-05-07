import type { Metadata } from "next";

import Contact from "@/views/Contact";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact our team for enrollment and corporate training inquiries.",
};

export default function Page() {
  return <Contact />;
}

