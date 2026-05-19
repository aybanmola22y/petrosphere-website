import type { Course } from "@/data/mockData";
import { resolveCourseBySlug } from "@/lib/catalog";

/** Homepage featured row — top programs in display order (left to right). */
export const FEATURED_COURSE_SLUGS = [
  "bosh-so2",
  "bosh-so1",
  "mesh",
  "acls",
  "cosh",
  "bls",
] as const;

const SLUG_ALTERNATES: Partial<Record<(typeof FEATURED_COURSE_SLUGS)[number], string[]>> = {
  acls: ["acls", "acls-ashi"],
};

function courseBlob(course: Course): string {
  return `${course.title} ${course.slug} ${course.id}`.toLowerCase();
}

function isBoshSo2(course: Course): boolean {
  const b = courseBlob(course);
  return (
    b.includes("boshso2") ||
    b.includes("bosh-so2") ||
    b.includes("bosh002") ||
    b.includes("safety officer 2") ||
    (b.includes("bosh") && b.includes("officer 2"))
  );
}

function isBoshSo1(course: Course): boolean {
  if (isBoshSo2(course)) return false;
  const b = courseBlob(course);
  return (
    b.includes("boshso1") ||
    b.includes("bosh-so1") ||
    b.includes("bosh001") ||
    b.includes("safety officer 1") ||
    (b.includes("bosh") && b.includes("officer 1"))
  );
}

function isMesh(course: Course): boolean {
  const b = courseBlob(course);
  if (b.includes("elearning") && b.includes("mesh")) return false;
  return (
    b.includes("mesh") ||
    b.includes("eight-hour") ||
    b.includes("8-hour") ||
    b.includes("mandatory eight")
  );
}

function isAcls(course: Course): boolean {
  const b = courseBlob(course);
  return b.includes("acls") || b.includes("advanced cardiac");
}

function isCosh(course: Course): boolean {
  const b = courseBlob(course);
  return b.includes("cosh") || b.includes("construction occupational");
}

function isBls(course: Course): boolean {
  const b = courseBlob(course);
  return (
    (b.includes("bls") || b.includes("basic life support")) &&
    !b.includes("acls") &&
    !b.includes("pals")
  );
}

const TITLE_MATCHERS: Record<(typeof FEATURED_COURSE_SLUGS)[number], (course: Course) => boolean> = {
  "bosh-so2": isBoshSo2,
  "bosh-so1": isBoshSo1,
  mesh: isMesh,
  acls: isAcls,
  cosh: isCosh,
  bls: isBls,
};

function findCourseForFeaturedSlug(courses: Course[], canonical: string): Course | undefined {
  const candidates = SLUG_ALTERNATES[canonical as keyof typeof SLUG_ALTERNATES] ?? [canonical];
  for (const slug of candidates) {
    const match = resolveCourseBySlug(slug, courses);
    if (match) return match;
  }

  const bySlug = courses.find(
    (c) =>
      c.slug === canonical ||
      c.slug.startsWith(`${canonical}-`) ||
      c.slug.startsWith(`${canonical}--`),
  );
  if (bySlug) return bySlug;

  const matcher = TITLE_MATCHERS[canonical as (typeof FEATURED_COURSE_SLUGS)[number]];
  return matcher ? courses.find(matcher) : undefined;
}

/** Pick the top featured programs from the live catalog (TMS or merged mock). */
export function pickFeaturedCourses(courses: Course[]): Course[] {
  const seen = new Set<string>();
  const result: Course[] = [];

  for (const slug of FEATURED_COURSE_SLUGS) {
    const course = findCourseForFeaturedSlug(courses, slug);
    if (!course || seen.has(course.id)) continue;
    seen.add(course.id);
    result.push(course);
  }

  return result;
}
