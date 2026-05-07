import type { Metadata } from "next";
import Review from "@/views/Review";

export const metadata: Metadata = {
  title: "Review Centre",
  description:
    "Examination and licensure review programs — English, NLE, CSC, LET, NCLEX, CGFNS, HAAD, and Prometric-focused preparation.",
};

export default function Page() {
  return <Review />;
}
