import React, { useMemo } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { FiArrowRight, FiChevronRight } from "react-icons/fi";

import type { TrainingSession } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { isExternalHref, sessionEnrollHref } from "@/lib/enrollment";
import { cn } from "@/lib/utils";
import { useCatalogCoursesList } from "@/hooks/use-catalog-courses";
import { resolveCourseForScheduleCard } from "@/lib/catalog";

function statusChip(status: TrainingSession["status"]): {
  text: string;
  className: string;
} {
  switch (status) {
    case "open":
      return {
        text: "Open",
        className: "bg-accent text-[#00044a]",
      };
    case "ongoing":
      return {
        text: "Ongoing",
        className: "border border-amber-500/30 bg-amber-500/10 text-amber-900",
      };
    case "cancelled":
      return {
        text: "Cancelled",
        className: "border border-destructive/30 bg-destructive/10 text-destructive",
      };
    case "finished":
      return {
        text: "Completed",
        className: "border border-border bg-secondary text-muted-foreground",
      };
    default:
      return {
        text: "Closed",
        className: "border border-border bg-secondary text-muted-foreground",
      };
  }
}

function parseStamp(startDate: string, dateRange: string) {
  const start = new Date(startDate);
  const valid = !Number.isNaN(start.getTime());

  const day = valid ? String(start.getDate()).padStart(2, "0") : "—";
  const month = valid
    ? start.toLocaleString("en-US", { month: "short" }).toUpperCase()
    : "TBA";
  const year = valid ? String(start.getFullYear()) : "";

  /** Always keep a subtitle so stamp height matches across the grid. */
  const rangeLabel = dateRange.trim() || (valid ? `${month} ${day}` : "Date TBA");

  return { day, month, year, rangeLabel, valid };
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
  const duration = course.duration;
  const status = statusChip(session.status);
  const stamp = parseStamp(session.startDate, session.dateRange);

  const canEnroll = session.status === "open" && session.actionLabel === "Enroll";
  const enrollHref = sessionEnrollHref(session);
  const enrollIsExternal = isExternalHref(enrollHref);
  const programHref = `/courses/${session.courseSlug}`;

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-2xl",
        "border border-border/60 bg-[hsl(40_30%_97%)]",
        "shadow-[0_16px_40px_-32px_rgba(0,4,74,0.22)]",
        "transition-all duration-300 hover:-translate-y-1",
        "hover:border-foreground/12 hover:shadow-[0_22px_50px_-30px_rgba(0,4,74,0.32)]",
      )}
    >
      <span
        className="absolute inset-x-0 top-0 h-[3px] bg-linear-to-r from-accent/0 via-accent to-accent/0 opacity-90"
        aria-hidden
      />

      <div className="flex min-h-0 flex-1 flex-col px-5 pb-5 pt-5 sm:px-6 sm:pt-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-end gap-2.5">
              <span className="text-[2.25rem] font-semibold leading-none tracking-tight tabular-nums text-[#00044a]">
                {stamp.day}
              </span>
              <div className="mb-0.5 flex flex-col leading-tight">
                <span className="text-[11px] font-semibold tracking-[0.18em] text-[#00044a]/70">
                  {stamp.month}
                </span>
                <span className="mt-0.5 text-[11px] font-medium text-muted-foreground">
                  {stamp.year || "\u00a0"}
                </span>
              </div>
            </div>
            <p className="mt-2 truncate text-[11px] font-medium tracking-wide text-muted-foreground">
              {stamp.rangeLabel}
            </p>
          </div>

          <span
            className={cn(
              "shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold",
              status.className,
            )}
          >
            {status.text}
          </span>
        </div>

        <div className="mt-4 border-t border-[#00044a]/10 pt-4">
          <h3 className="line-clamp-2 min-h-[2.5rem] text-base font-semibold leading-snug tracking-tight text-[#00044a]">
            {title}
          </h3>
        </div>

        <div className="mt-2.5 space-y-1.5 text-[13px] text-muted-foreground">
          <p className="flex min-w-0 items-center gap-1.5">
            <Icon
              icon="uil:location-point"
              className="size-3.5 shrink-0 text-[#00044a]/55"
              aria-hidden
            />
            <span className="truncate text-foreground/70">{session.location}</span>
          </p>
          {duration && duration !== "—" ? (
            <p className="flex items-center gap-1.5">
              <Icon
                icon="uim:clock"
                className="size-3.5 shrink-0 text-[#00044a]/55"
                aria-hidden
              />
              <span>{duration}</span>
            </p>
          ) : null}
        </div>

        <div className="mt-auto space-y-3 pt-5">
          <div className="flex min-h-11 items-end justify-between gap-3 border-t border-[#00044a]/10 pt-4">
            <div className="min-w-0">
              <p className="text-[9px] font-semibold tracking-[0.16em] uppercase text-muted-foreground">
                Registration fee
              </p>
              <p className="mt-1 truncate text-base font-semibold tabular-nums tracking-tight text-[#00044a]">
                {session.price || "Contact for rate"}
              </p>
            </div>

            {canEnroll ? (
              <Button
                asChild
                size="sm"
                className="h-9 shrink-0 rounded-lg gap-0.5 px-3 text-[13px] font-semibold shadow-sm"
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
              <span className="shrink-0 self-center text-[10px] font-medium tracking-wider uppercase text-muted-foreground">
                {session.actionLabel}
              </span>
            )}
          </div>

          <Link
            href={programHref}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground transition-colors hover:text-[#00044a]"
          >
            View program
            <FiArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
