import React from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { FiArrowRight } from "react-icons/fi";

import type { Course } from "@/data/mockData";
import { cn } from "@/lib/utils";

interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  return (
    <Link
      href={`/courses/${course.slug}`}
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

      <div className="flex min-h-0 flex-1 flex-col px-6 py-6 sm:px-7 sm:py-7">
        <div className="flex items-start justify-between gap-3">
          <h3 className="min-w-0 line-clamp-2 min-h-[3.25rem] text-[1.125rem] font-semibold leading-snug tracking-tight text-[#00044a] transition-colors group-hover:text-[#00044a]/85 sm:text-[1.2rem]">
            {course.title}
          </h3>
          <span
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-background/70 text-[#00044a]/70"
            title="Certified"
            aria-label="Certified"
          >
            <Icon icon="uil:award" className="size-4" aria-hidden />
          </span>
        </div>

        <p className="mt-3.5 line-clamp-3 min-h-[4.125rem] text-sm leading-[1.65] text-muted-foreground">
          {course.summary}
        </p>

        <div className="mt-auto pt-6">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-muted-foreground">
            <span className="inline-flex min-w-0 items-center gap-2">
              <Icon
                icon="uim:clock"
                className="size-4 shrink-0 text-primary/80"
                aria-hidden
              />
              <span className="truncate font-medium text-foreground/75">{course.duration}</span>
            </span>
            <span className="inline-flex items-center gap-2">
              <Icon
                icon="uim:layer-group"
                className="size-4 shrink-0 text-primary/80"
                aria-hidden
              />
              <span>{course.level}</span>
            </span>
          </div>

          <div className="mt-5 flex items-center border-t border-[#00044a]/10 pt-5">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors group-hover:text-[#00044a]">
              View program
              <FiArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
