import React from "react";
import Link from "next/link";
import { FiArrowUpRight, FiAward } from "react-icons/fi";
import { Course } from "@/data/mockData";

interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  return (
    <Link
      href={`/courses/${course.slug}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-border/70 bg-card shadow-[0_18px_55px_-35px_rgba(15,23,42,0.18)] ring-1 ring-black/5 transition-all duration-300 hover:-translate-y-1 hover:border-foreground/15 hover:shadow-[0_26px_70px_-40px_rgba(15,23,42,0.26)]"
    >
      <span
        className="absolute inset-x-0 top-0 h-[3px] bg-linear-to-r from-accent/0 via-accent to-accent/0 opacity-90"
        aria-hidden
      />

      <div className="flex h-full flex-col p-8">
        <div className="mb-5 flex items-start justify-between gap-3">
          <span className="inline-flex w-fit items-center rounded-full bg-secondary/70 px-2.5 py-1 text-[11px] font-medium text-secondary-foreground">
            {course.category}
          </span>
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-background/60 px-2.5 py-1 text-[11px] font-medium tracking-[0.14em] uppercase text-muted-foreground">
            <FiAward className="h-3 w-3" />
            Certified
          </span>
        </div>

        <h3 className="mb-3 line-clamp-2 text-[19px] font-semibold leading-snug tracking-tight text-foreground transition-colors group-hover:text-primary md:text-xl">
          {course.title}
        </h3>

        <p className="mb-6 line-clamp-3 grow text-sm leading-relaxed text-muted-foreground">{course.summary}</p>

        <div className="mt-auto flex items-center justify-between border-t border-border/70 pt-6">
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
