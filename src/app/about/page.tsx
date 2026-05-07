import type { Metadata } from "next";
import About from "@/views/About";

export const metadata: Metadata = {
  title: "The Institute",
  description:
    "Learn about our mission, vision, and history of excellence in corporate training.",
};

export default function Page() {
  return <About />;
}
