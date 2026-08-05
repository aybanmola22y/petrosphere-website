"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { X } from "lucide-react";

import type { TrainingSession } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { isExternalHref, sessionEnrollHref } from "@/lib/enrollment";
import { resolveCourseForScheduleCard } from "@/lib/catalog";
import { useCatalogCoursesList } from "@/hooks/use-catalog-courses";
import { cn } from "@/lib/utils";

function parseDay(input?: string) {
  if (!input) return null;
  const ymd = input.trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (ymd) return new Date(Number(ymd[1]), Number(ymd[2]) - 1, Number(ymd[3]));
  const d = new Date(input);
  return Number.isNaN(d.getTime()) ? null : d;
}

function formatLongSchedule(session: TrainingSession) {
  const start = parseDay(session.startDate);
  const end = parseDay(session.endDate) ?? start;
  if (!start) return session.dateRange || "TBA";

  const opts: Intl.DateTimeFormatOptions = {
    month: "long",
    day: "numeric",
    year: "numeric",
  };
  const startLabel = start.toLocaleDateString("en-US", opts);
  if (!end || start.getTime() === end.getTime()) return startLabel;
  return `${startLabel} – ${end.toLocaleDateString("en-US", opts)}`;
}

function statusPresentation(status: TrainingSession["status"]) {
  switch (status) {
    case "open":
      return { label: "Upcoming", className: "bg-emerald-500/15 text-emerald-800 ring-1 ring-emerald-600/20" };
    case "ongoing":
      return { label: "Ongoing", className: "bg-amber-500/15 text-amber-900 ring-1 ring-amber-500/25" };
    case "finished":
      return { label: "Finished", className: "bg-slate-500/10 text-slate-600 ring-1 ring-slate-400/25" };
    case "cancelled":
      return { label: "Cancelled", className: "bg-destructive/10 text-destructive ring-1 ring-destructive/20" };
    default:
      return { label: "Closed", className: "bg-slate-500/10 text-slate-600 ring-1 ring-slate-400/25" };
  }
}

function shortCourseCode(title: string, slug: string) {
  const fromSlug = slug
    .split("--")[0]
    ?.replace(/-/g, " ")
    .trim()
    .toUpperCase();
  if (fromSlug && fromSlug.length <= 12) return fromSlug;

  const initials = title
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 6)
    .toUpperCase();
  return initials || "COURSE";
}

function MetaTile({
  icon,
  label,
  children,
}: {
  icon: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border/70 bg-white/70 px-3.5 py-3">
      <div className="flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.16em] uppercase text-muted-foreground">
        <Icon icon={icon} className="size-3.5 text-[#00044a]/45" aria-hidden />
        {label}
      </div>
      <div className="mt-1.5 text-sm font-semibold leading-snug text-[#00044a]">
        {children || <span className="font-medium text-muted-foreground">—</span>}
      </div>
    </div>
  );
}

export function ScheduleSessionDetailDialog({
  session,
  open,
  onOpenChange,
}: {
  session: TrainingSession | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { catalogCourses } = useCatalogCoursesList();
  const course = useMemo(
    () => (session ? resolveCourseForScheduleCard(session, catalogCourses) : null),
    [session, catalogCourses],
  );

  const status = session ? statusPresentation(session.status) : null;
  const code = session && course ? shortCourseCode(course.title, session.courseSlug) : "";
  const canEnroll = session?.status === "open" && session.actionLabel === "Enroll";
  const enrollHref = session ? sessionEnrollHref(session) : "#";
  const enrollExternal = isExternalHref(enrollHref);
  const scheduleLabel = session ? formatLongSchedule(session) : "";

  return (
    <Dialog open={open && !!session} onOpenChange={onOpenChange}>
      {session && course && status ? (
        <DialogContent
          className={cn(
            "max-h-[90vh] w-[min(100vw-1.5rem,30rem)] gap-0 overflow-hidden rounded-3xl border-border/70 p-0 shadow-[0_28px_80px_-28px_rgba(0,4,74,0.45)]",
            "bg-[hsl(40_30%_97%)] [&>button]:hidden",
          )}
        >
          {/* Header */}
          <div className="relative overflow-hidden bg-[#00044a] px-6 pb-6 pt-5 text-white">
            <div
              className="pointer-events-none absolute inset-0 bg-linear-to-br from-accent/30 via-transparent to-transparent"
              aria-hidden
            />
            <div className="pointer-events-none absolute -right-10 -top-12 size-40 rounded-full bg-accent/80" aria-hidden />
            <div className="pointer-events-none absolute right-8 top-10 size-20 rounded-full bg-accent/35" aria-hidden />

            <div className="relative z-10 flex items-start justify-between gap-3">
              <span className="inline-flex rounded-full bg-white/12 px-2.5 py-1 text-[11px] font-semibold text-white ring-1 ring-white/20 backdrop-blur-sm">
                {status.label}
              </span>
              <DialogClose asChild>
                <button
                  type="button"
                  className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
                  aria-label="Close"
                >
                  <X className="size-4" />
                </button>
              </DialogClose>
            </div>

            <p className="relative z-10 mt-5 text-[11px] font-semibold tracking-[0.2em] uppercase text-accent">
              {code}
              {course.category ? (
                <>
                  <span className="mx-2 text-white/30" aria-hidden>
                    ·
                  </span>
                  <span className="tracking-[0.16em] text-white/55">{course.category}</span>
                </>
              ) : null}
            </p>
            <DialogTitle className="relative z-10 mt-2 text-[1.35rem] font-semibold leading-snug tracking-tight text-white">
              {course.title}
            </DialogTitle>
          </div>

          {/* Body */}
          <div className="space-y-4 px-6 py-5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <MetaTile icon="uil:location-point" label="Location">
                {session.location}
              </MetaTile>
              <MetaTile icon="uim:clock" label="Duration">
                {course.duration && course.duration !== "—" ? course.duration : "—"}
              </MetaTile>
            </div>

            <MetaTile icon="uil:calendar-alt" label="Schedule">
              {scheduleLabel}
            </MetaTile>

            <div className="rounded-xl border border-border/70 bg-white/70 px-4 py-3.5">
              <p className="text-[10px] font-semibold tracking-[0.16em] uppercase text-muted-foreground">
                Registration fee
              </p>
              <p className="mt-1 text-xl font-semibold tabular-nums tracking-tight text-[#00044a]">
                {session.price || "Contact for rate"}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="space-y-3 border-t border-[#00044a]/10 px-6 py-5">
            {canEnroll ? (
              <Button
                asChild
                className="h-11 w-full rounded-xl bg-[#00044a] text-[15px] font-semibold text-white hover:bg-[#00044a]/90"
              >
                {enrollExternal ? (
                  <a href={enrollHref} target="_blank" rel="noopener noreferrer">
                    Enroll Now
                  </a>
                ) : (
                  <Link href={enrollHref}>Enroll Now</Link>
                )}
              </Button>
            ) : (
              <Button
                asChild
                className="h-11 w-full rounded-xl bg-[#00044a] text-[15px] font-semibold text-white hover:bg-[#00044a]/90"
              >
                <Link href={`/courses/${session.courseSlug}`}>View program</Link>
              </Button>
            )}

            <div className="flex items-center justify-between gap-3">
              <Link
                href={`/courses/${session.courseSlug}`}
                className="text-xs font-medium text-muted-foreground transition-colors hover:text-[#00044a]"
              >
                Full program details
              </Link>
              <DialogClose asChild>
                <button
                  type="button"
                  className="text-xs font-medium text-muted-foreground transition-colors hover:text-[#00044a]"
                >
                  Close
                </button>
              </DialogClose>
            </div>
          </div>
        </DialogContent>
      ) : null}
    </Dialog>
  );
}
