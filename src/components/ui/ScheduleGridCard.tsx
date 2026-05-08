import React, { useMemo } from "react";
import Link from "next/link";
import {
  FiArrowUpRight,
  FiAward,
  FiCalendar,
  FiChevronRight,
  FiClock,
  FiLayers,
  FiMapPin,
} from "react-icons/fi";

import type { Course, TrainingSession } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { isExternalHref, sessionEnrollHref } from "@/lib/enrollment";
import { cn } from "@/lib/utils";
import { useCatalogCoursesList } from "@/hooks/use-catalog-courses";
import { resolveCourseForScheduleCard } from "@/lib/catalog";

function courseCode(course: Course) {
  const num = course.id.replace(/[^0-9]/g, "").padStart(3, "0");
  const prefix = (course.categorySlug || course.category).slice(0, 4).toUpperCase();
  return `${prefix}-${num}`;
}

/** Fixed footprint so status rows line up across grid cards (badge vs two-line copy). */
function SessionStatus({ status }: { status: TrainingSession["status"] }) {
  const shell = "flex min-h-11 min-w-0 flex-col justify-center";
  if (status === "cancelled") {
    return (
      <div className={shell}>
        <Badge
          variant="outline"
          className="w-fit border-destructive/40 bg-destructive/10 text-destructive font-normal text-[11px]"
        >
          Cancelled
        </Badge>
      </div>
    );
  }
  if (status === "open") {
    return (
      <div className={shell}>
        <span className="text-xs font-semibold text-primary">Open</span>
      </div>
    );
  }
  if (status === "finished") {
    return (
      <div className={shell}>
        <span className="block text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
          Run
        </span>
        <span className="mt-1 block text-xs font-semibold text-foreground">Completed</span>
      </div>
    );
  }
  /* closed: avoid repeating “Closed” next to action label — describe enrollment instead */
  return (
    <div className={shell}>
      <span className="block text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
        Enrollment
      </span>
      <span className="mt-1 block text-xs font-semibold text-muted-foreground">Ended</span>
    </div>
  );
}

export function ScheduleGridCard({ session }: { session: TrainingSession }) {
  const { catalogCourses } = useCatalogCoursesList();
  const course = useMemo(
    () => resolveCourseForScheduleCard(session, catalogCourses),
    [
      catalogCourses,
      session.id,
      session.courseSlug,
      session.courseTitle,
      session.categorySlug,
    ],
  );
  const title = course.title;
  const summary = course.summary;
  const categoryLabel = course.category;
  const duration = course.duration;
  const level = course.level;
  const codeLabel = courseCode(course);

  const canEnroll = session.status === "open" && session.actionLabel === "Enroll";
  const enrollHref = sessionEnrollHref(session);
  const enrollIsExternal = isExternalHref(enrollHref);

  return (
    <div
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300",
        "hover:-translate-y-1 hover:border-foreground/15 hover:shadow-md"
      )}
    >
      <span className="absolute left-0 right-0 top-0 h-px bg-accent" aria-hidden />

      <div className="flex h-full min-h-0 flex-col p-7">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex min-w-0 items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
            <span className="min-w-0 truncate text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground tabular-nums">
              {codeLabel}
            </span>
          </div>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            <FiAward className="h-3 w-3" />
            Certified
          </span>
        </div>

        <div className="mb-4 flex min-h-9 flex-wrap items-center gap-2">
          <span className="inline-flex max-w-full items-center truncate rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium text-secondary-foreground">
            {categoryLabel}
          </span>
          <span className="inline-flex items-center rounded-full border border-border bg-background px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {session.formatNote}
          </span>
        </div>

        <div className="flex min-h-0 flex-1 flex-col">
          <h3 className="mb-3 line-clamp-2 min-h-13 text-[19px] font-semibold leading-snug tracking-tight text-foreground transition-colors group-hover:text-primary md:min-h-14 md:text-xl">
            {title}
          </h3>

          <div className="mb-5 min-h-19.5">
            <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">{summary}</p>
          </div>

          <p className="mb-6 flex min-h-6 items-start gap-2 text-sm text-muted-foreground">
            <FiMapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary/80" aria-hidden />
            <span className="line-clamp-2 leading-snug">{session.location}</span>
          </p>

          <div className="mt-auto flex flex-col">
            <dl className="grid grid-cols-1 divide-y divide-border/60 border-t border-border/50 pt-5 sm:grid-cols-3 sm:divide-y-0 sm:divide-x">
              <div className="min-w-0 pb-4 sm:pb-0 sm:pr-4">
                <dt className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  <FiClock className="h-3.5 w-3.5 shrink-0 opacity-80" />
                  Duration
                </dt>
                <dd className="mt-2 truncate text-[13px] font-semibold text-foreground">{duration}</dd>
              </div>
              <div className="min-w-0 py-4 sm:py-0 sm:px-4">
                <dt className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  <FiCalendar className="h-3.5 w-3.5 shrink-0 opacity-80" />
                  Schedule
                </dt>
                <dd className="mt-2 min-h-11 text-[13px] font-semibold leading-tight text-foreground">
                  <span className="line-clamp-2">{session.dateRange}</span>
                  <span className="mt-0.5 block text-[11px] font-medium text-muted-foreground">
                    {session.year}
                  </span>
                </dd>
              </div>
              <div className="min-w-0 pt-4 sm:pt-0 sm:pl-4">
                <dt className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  <FiLayers className="h-3.5 w-3.5 shrink-0 opacity-80" />
                  Level
                </dt>
                <dd className="mt-2 truncate text-[13px] font-semibold text-foreground">{level}</dd>
              </div>
            </dl>

            <div className="mt-5 flex min-h-11 flex-wrap items-center justify-between gap-3">
              <SessionStatus status={session.status} />
              {canEnroll ? (
                <Button
                  asChild
                  size="sm"
                  className="h-9 shrink-0 rounded-lg gap-1 px-4 font-semibold"
                >
                  {enrollIsExternal ? (
                    <a href={enrollHref} target="_blank" rel="noopener noreferrer">
                      Enroll
                      <FiChevronRight className="h-3.5 w-3.5" />
                    </a>
                  ) : (
                    <Link href={enrollHref}>
                      Enroll
                      <FiChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  )}
                </Button>
              ) : (
                <span className="self-center text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  {session.actionLabel}
                </span>
              )}
            </div>

            <div className="mt-6 flex flex-col border-t border-border pt-6">
              <div className="mb-4 flex flex-col">
                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/60">
                  Registration Fee
                </span>
                <span className="text-base font-bold text-primary tabular-nums">
                  {session.price || "Contact for rate"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <Link
                  href={`/courses/${session.courseSlug}`}
                  className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  View program
                </Link>
                <Link
                  href={`/courses/${session.courseSlug}`}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border text-foreground transition-all hover:border-foreground hover:bg-foreground hover:text-background"
                  aria-label={`Open ${title}`}
                >
                  <FiArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
