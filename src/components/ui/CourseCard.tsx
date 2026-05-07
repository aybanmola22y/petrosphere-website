import React from "react";
import Link from "next/link";
import { FiArrowUpRight, FiClock, FiCalendar, FiAward, FiLayers } from 'react-icons/fi';
import { Course } from '@/data/mockData';

interface CourseCardProps {
  course: Course;
}

function courseCode(course: Course) {
  const num = course.id.replace(/[^0-9]/g, '').padStart(3, '0');
  const prefix = (course.categorySlug || course.category).slice(0, 4).toUpperCase();
  return `${prefix}-${num}`;
}

export function CourseCard({ course }: CourseCardProps) {
  const accent = 'bg-accent';
  return (
    <Link
      href={`/courses/${course.slug}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-border/70 bg-card shadow-[0_18px_55px_-35px_rgba(15,23,42,0.18)] ring-1 ring-black/5 transition-all duration-300 hover:-translate-y-1 hover:border-foreground/15 hover:shadow-[0_26px_70px_-40px_rgba(15,23,42,0.26)]"
    >
      {/* Top accent rule */}
      <span
        className="absolute inset-x-0 top-0 h-[3px] bg-linear-to-r from-accent/0 via-accent to-accent/0 opacity-90"
        aria-hidden
      />

      <div className="flex h-full flex-col p-8">
        {/* Header row: code + accreditation */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className={`w-1.5 h-1.5 rounded-full ${accent}`} aria-hidden />
            <span className="text-[11px] font-medium tracking-[0.18em] uppercase text-muted-foreground tabular-nums">
              {courseCode(course)}
            </span>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/60 px-2.5 py-1 text-[11px] font-medium tracking-[0.14em] uppercase text-muted-foreground">
            <FiAward className="h-3 w-3" />
            Certified
          </span>
        </div>

        {/* Category pill */}
        <span className="mb-5 inline-flex w-fit items-center rounded-full bg-secondary/70 px-2.5 py-1 text-[11px] font-medium text-secondary-foreground">
          {course.category}
        </span>

        {/* Title */}
        <h3 className="text-[19px] md:text-xl font-semibold tracking-tight text-foreground mb-3 leading-snug group-hover:text-primary transition-colors line-clamp-2">
          {course.title}
        </h3>

        {/* Summary */}
        <p className="grow text-sm leading-relaxed text-muted-foreground mb-6 line-clamp-3">
          {course.summary}
        </p>

        {/* Meta strip */}
        <dl className="grid grid-cols-3 divide-x divide-border/60 border-t border-border/70 pt-5">
          <div className="min-w-0 pr-4">
            <dt className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              <FiClock className="h-3.5 w-3.5 opacity-80" />
              Duration
            </dt>
            <dd className="mt-2 text-[13px] font-semibold text-foreground truncate">
              {course.duration}
            </dd>
          </div>
          <div className="min-w-0 px-4">
            <dt className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              <FiCalendar className="h-3.5 w-3.5 opacity-80" />
              Cohort
            </dt>
            <dd className="mt-2 text-[13px] font-semibold text-foreground truncate">
              {course.schedule}
            </dd>
          </div>
          <div className="min-w-0 pl-4">
            <dt className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              <FiLayers className="h-3.5 w-3.5 opacity-80" />
              Level
            </dt>
            <dd className="mt-2 text-[13px] font-semibold text-foreground truncate">
              {course.level}
            </dd>
          </div>
        </dl>

        {/* Footer */}
        <div className="mt-7 flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground underline-offset-4 transition-colors group-hover:text-foreground group-hover:underline">
            View program
          </span>
          <span className="grid h-10 w-10 place-items-center rounded-full border border-border bg-background/60 text-foreground transition-all group-hover:border-foreground group-hover:bg-foreground group-hover:text-background">
            <FiArrowUpRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
