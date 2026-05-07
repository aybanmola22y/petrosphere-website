import type { Metadata } from "next";
import { Suspense } from "react";
import Courses from "@/views/Courses";

export const metadata: Metadata = {
  title: "Training Curriculum",
  description:
    "Browse our extensive catalog of corporate training and certification programs.",
};

function CoursesFallback() {
  return (
    <div className="min-h-screen bg-background pt-32 pb-32">
      <div className="container mx-auto px-6">
        <div className="h-10 w-48 animate-pulse rounded-md bg-muted" />
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<CoursesFallback />}>
      <Courses />
    </Suspense>
  );
}
