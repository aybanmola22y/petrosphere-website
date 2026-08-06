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

function formatStripSchedule(session: TrainingSession) {
  const start = parseDay(session.startDate);
  const end = parseDay(session.endDate) ?? start;
  if (!start) return session.dateRange || "TBA";
  if (!end || start.getTime() === end.getTime()) {
    return "One-day session";
  }
  const sameMonth =
    start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();
  if (sameMonth) {
    return `${start.toLocaleString("en-US", { month: "short" })} ${start.getDate()}–${end.getDate()}, ${end.getFullYear()}`;
  }
  return `${start.toLocaleString("en-US", { month: "short", day: "numeric" })} – ${end.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
}

function statusPresentation(status: TrainingSession["status"]) {
  switch (status) {
    case "open":
      return { label: "Upcoming", dot: "bg-emerald-500" };
    case "ongoing":
      return { label: "Ongoing", dot: "bg-amber-500" };
    case "finished":
      return { label: "Finished", dot: "bg-slate-400" };
    case "cancelled":
      return { label: "Cancelled", dot: "bg-destructive" };
    default:
      return { label: "Closed", dot: "bg-slate-400" };
  }
}

function InfoRow({
  icon,
  label,
  children,
}: {
  icon: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3.5 py-3.5">
      <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-full bg-[#00044a]/[0.06] text-[#00044a]/70">
        <Icon icon={icon} className="size-4" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
        <div className="mt-0.5 text-[15px] font-semibold leading-snug text-[#00044a]">
          {children || <span className="font-medium text-muted-foreground">—</span>}
        </div>
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
  const canEnroll = session?.status === "open" && session.actionLabel === "Enroll";
  const enrollHref = session ? sessionEnrollHref(session) : "#";
  const enrollExternal = isExternalHref(enrollHref);
  const stripSchedule = session ? formatStripSchedule(session) : "";
  const start = session ? parseDay(session.startDate) : null;

  return (
    <Dialog open={open && !!session} onOpenChange={onOpenChange}>
      {session && course && status ? (
        <DialogContent
          className={cn(
            "max-h-[min(90vh,40rem)] w-[calc(100vw-2rem)] max-w-[26rem] gap-0 overflow-x-hidden overflow-y-auto rounded-2xl border-border/80 p-0",
            "bg-white shadow-[0_24px_64px_-24px_rgba(0,4,74,0.4)] [&>button]:hidden",
          )}
        >
          <span
            className="absolute inset-x-0 top-0 z-10 h-[3px] bg-linear-to-r from-accent/0 via-accent to-accent/0"
            aria-hidden
          />

          {/* Top bar */}
          <div className="flex items-center justify-between gap-3 px-5 pt-5">
            <span className="inline-flex items-center gap-2 text-[13px] font-medium text-[#00044a]/75">
              <span className={cn("size-2 rounded-full", status.dot)} aria-hidden />
              {status.label}
            </span>
            <DialogClose asChild>
              <button
                type="button"
                className="inline-flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                aria-label="Close"
              >
                <X className="size-4" />
              </button>
            </DialogClose>
          </div>

          {/* Title block */}
          <div className="px-5 pb-5 pt-4">
            <DialogTitle className="text-[1.3rem] font-semibold leading-snug tracking-tight text-[#00044a]">
              {course.title}
            </DialogTitle>
          </div>

          {/* Date strip — compact copy so ranges never clip */}
          {start ? (
            <div className="mx-5 flex min-w-0 items-center gap-3 rounded-xl bg-[#00044a] px-3.5 py-3.5 text-white sm:gap-4 sm:px-4">
              <div className="flex shrink-0 items-end gap-2">
                <span className="text-[1.75rem] font-semibold leading-none tabular-nums sm:text-[2rem]">
                  {String(start.getDate()).padStart(2, "0")}
                </span>
                <div className="mb-0.5 leading-tight">
                  <p className="text-[11px] font-semibold tracking-[0.16em] uppercase text-white/70">
                    {start.toLocaleString("en-US", { month: "short" })}
                  </p>
                  <p className="text-[11px] text-white/50">{start.getFullYear()}</p>
                </div>
              </div>
              <div className="h-9 w-px shrink-0 bg-white/15" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-medium tracking-[0.14em] uppercase text-white/45">
                  Schedule
                </p>
                <p className="mt-0.5 text-sm font-medium leading-snug text-white/90 break-words">
                  {stripSchedule}
                </p>
              </div>
            </div>
          ) : null}

          {/* Details */}
          <div className="mx-5 mt-2 divide-y divide-border/80 border-y border-border/80">
            <InfoRow icon="uil:location-point" label="Location">
              {session.location}
            </InfoRow>
            <InfoRow icon="uim:clock" label="Duration">
              {course.duration && course.duration !== "—" ? course.duration : "—"}
            </InfoRow>
            <InfoRow icon="uil:bill" label="Registration fee">
              {session.price || "Contact for rate"}
            </InfoRow>
          </div>

          {/* Actions — inset so rounded corners are never clipped by the dialog edge */}
          <div className="space-y-3 p-5">
            {canEnroll ? (
              <Button
                asChild
                className="h-11 w-full rounded-xl border-0 bg-[#00044a] text-[15px] font-semibold text-white hover:bg-[#00044a]/90"
              >
                {enrollExternal ? (
                  <a
                    href={enrollHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-xl"
                  >
                    Enroll Now
                  </a>
                ) : (
                  <Link href={enrollHref} className="rounded-xl">
                    Enroll Now
                  </Link>
                )}
              </Button>
            ) : (
              <Button
                asChild
                className="h-11 w-full rounded-xl border-0 bg-[#00044a] text-[15px] font-semibold text-white hover:bg-[#00044a]/90"
              >
                <Link href={`/courses/${session.courseSlug}`} className="rounded-xl">
                  View program
                </Link>
              </Button>
            )}

            <div className="flex items-center justify-center gap-4 text-[12px]">
              {canEnroll ? (
                <Link
                  href={`/courses/${session.courseSlug}`}
                  className="font-medium text-muted-foreground transition-colors hover:text-[#00044a]"
                >
                  Full program details
                </Link>
              ) : null}
              <DialogClose asChild>
                <button
                  type="button"
                  className="font-medium text-muted-foreground transition-colors hover:text-[#00044a]"
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
