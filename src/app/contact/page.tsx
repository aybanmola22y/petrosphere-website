import { redirect } from "next/navigation";

/** Legacy /contact URL — contact lives on the About page. */
export default function ContactPage() {
  redirect("/about#contact");
}
