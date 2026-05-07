import type { Metadata } from "next";
import { Suspense } from "react";

import Contact from "@/views/Contact";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact our team for enrollment and corporate training inquiries.",
};

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background pt-32 pb-32" />}>
      <Contact />
    </Suspense>
  );
}

