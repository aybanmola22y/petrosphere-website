"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { FiArrowRight, FiChevronRight } from "react-icons/fi";

import type { Course } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { courseCardVisual } from "@/lib/course-card-image";
import { normalizeCourseTitle } from "@/lib/course-title";
import { contactEnrollHref } from "@/lib/enrollment";
import { cn } from "@/lib/utils";

interface CourseCardProps {
  course: Course;
  /** Unique src from {@link assignCourseVisuals} so catalog grids never repeat photos. */
  imageSrc?: string;
}

/** Avoid "Title. Title focuses on…" opening repetition in summaries. */
function cleanSummary(title: string, summary: string) {
  const trimmed = summary.trim();
  if (!trimmed) return trimmed;
  const escaped = title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return trimmed
    .replace(new RegExp(`^${escaped}[.\\s—–-]*`, "i"), "")
    .replace(/^\s+/, "")
    .replace(/^[a-z]/, (c) => c.toUpperCase());
}

export function CourseCard({ course, imageSrc }: CourseCardProps) {
  const title = normalizeCourseTitle(course.title);
  const summary = cleanSummary(title, course.summary);
  const programHref = `/courses/${course.slug}`;
  const enrollHref = contactEnrollHref(course.slug);
  const visual = imageSrc ? courseCardVisual(course, imageSrc) : null;

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-2xl",
        "border border-border/70 bg-white",
        "shadow-[0_16px_40px_-32px_rgba(0,4,74,0.22)]",
        "transition-all duration-300 hover:-translate-y-1",
        "hover:border-foreground/12 hover:shadow-[0_22px_50px_-30px_rgba(0,4,74,0.32)]",
      )}
    >
      <span
        className="absolute inset-x-0 top-0 z-10 h-[3px] bg-linear-to-r from-[#00044a]/0 via-[#00044a]/35 to-[#00044a]/0"
        aria-hidden
      />

      {visual ? (
        <div className="relative aspect-[4/3] overflow-hidden bg-[#00044a]">
          <Image
            src={visual.src}
            alt={visual.alt}
            fill
            quality={88}
            className={cn("h-full w-full object-cover", visual.objectClass ?? "object-top")}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>
      ) : null}

      <div className="flex min-h-0 flex-1 flex-col px-6 py-6 sm:px-7 sm:py-7">
        <h3 className="line-clamp-2 min-h-[3.25rem] text-[1.125rem] font-semibold leading-snug tracking-tight text-[#00044a] sm:text-[1.2rem]">
          <Link
            href={programHref}
            className="transition-colors hover:text-[#00044a]/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00044a]/25"
          >
            {title}
          </Link>
        </h3>

        <div className="mt-5 border-t border-[#00044a]/10 pt-5">
          <p className="line-clamp-3 min-h-[4.125rem] text-sm leading-[1.65] text-muted-foreground">
            {summary || course.summary}
          </p>
        </div>

        <div className="mt-auto pt-6">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Icon
                icon="uim:clock"
                className="size-4 shrink-0 text-[#00044a]/50"
                aria-hidden
              />
              <span className="font-medium text-foreground/75">{course.duration}</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Icon
                icon="uim:layer-group"
                className="size-4 shrink-0 text-[#00044a]/50"
                aria-hidden
              />
              <span>{course.level}</span>
            </span>
          </div>

          <div className="mt-5 space-y-3.5 border-t border-[#00044a]/10 pt-5">
            <div className="text-center">
              <p className="text-[9px] font-semibold tracking-[0.16em] uppercase text-muted-foreground">
                Registration fee
              </p>
              <p className="mt-1 text-base font-semibold tracking-tight text-[#00044a]">
                Contact for rate
              </p>
            </div>

            <Button
              asChild
              className="h-10 w-full rounded-xl border-0 bg-[#00044a] text-[13px] font-semibold text-white hover:bg-[#00044a]/90"
            >
              <Link href={enrollHref}>
                Enroll
                <FiChevronRight className="h-3.5 w-3.5" />
              </Link>
            </Button>

            <Link
              href={programHref}
              className="inline-flex w-full items-center justify-center gap-1 text-[11px] font-medium text-muted-foreground transition-colors hover:text-[#00044a]"
            >
              View program
              <FiArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
