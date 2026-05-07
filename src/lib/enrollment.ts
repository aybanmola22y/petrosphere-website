import type { TrainingSession } from "@/data/mockData";

const EXTERNAL = /^https?:\/\//i;

/** On-site registration / inquiry form for a single course (public enroll). */
export function contactEnrollHref(courseSlug: string): string {
  return `/contact?course=${encodeURIComponent(courseSlug)}&intent=enroll`;
}

export function contactCorporateHref(courseSlug: string): string {
  return `/contact?course=${encodeURIComponent(courseSlug)}&intent=corporate`;
}

/** Public enroll target: TMS URL when provided, otherwise same flow as course page Enroll. */
export function sessionEnrollHref(session: TrainingSession): string {
  return session.enrollmentUrl ?? contactEnrollHref(session.courseSlug);
}

/**
 * Course page: same destination as Schedule "Enroll" when TMS has an open run
 * (guest-training-registration?schedule_id=…). Otherwise falls back to contact form.
 */
export function resolveEnrollHrefForCourse(
  courseSlug: string,
  sessions: TrainingSession[],
): string {
  const openRuns = sessions
    .filter((s) => s.courseSlug === courseSlug)
    .filter((s) => s.status === "open" && s.actionLabel === "Enroll")
    .sort((a, b) => a.startDate.localeCompare(b.startDate));

  const first = openRuns[0];
  if (first) return sessionEnrollHref(first);
  return contactEnrollHref(courseSlug);
}

export function isExternalHref(href: string): boolean {
  return EXTERNAL.test(href);
}
