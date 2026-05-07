import type { Metadata } from "next";
import CourseDetail from "@/views/CourseDetail";
import { getCourseForSlug } from "@/lib/catalog";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourseForSlug(slug);
  if (!course) {
    return { title: "Course Not Found" };
  }
  return {
    title: course.title,
    description: course.summary,
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  return <CourseDetail slug={slug} />;
}
