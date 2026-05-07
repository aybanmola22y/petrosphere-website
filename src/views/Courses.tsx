"use client";

import React, { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FiFilter, FiSearch, FiX } from "react-icons/fi";
import { motion } from "framer-motion";

import { courseCategories, curriculumNavigation } from "@/data/mockData";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { CourseCard } from "@/components/ui/CourseCard";
import { Input } from "@/components/ui/input";
import { useCatalogCoursesList } from "@/hooks/use-catalog-courses";
import {
  canonicalGroupLabelsForCategory,
  resolveCurriculumProgramGroup,
} from "@/lib/curriculum-group";

export default function Courses() {
  const { catalogCourses: courses, isLoading } = useCatalogCoursesList();
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const searchParams = useSearchParams() ?? new URLSearchParams();
  const categoryParam = searchParams.get("category") ?? "all";
  const programParam = searchParams.get("program") ?? "";
  const searchTerm = searchParams.get("q") ?? "";

  const replaceSearchParams = (next: URLSearchParams) => {
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const updateParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(searchParams.toString());
    if (value === null || value === "") next.delete(key);
    else next.set(key, value);
    replaceSearchParams(next);
  };

  const setCategory = (slug: string) => {
    const next = new URLSearchParams(searchParams.toString());
    if (slug === "all") next.delete("category");
    else next.set("category", slug);
    next.delete("program");
    replaceSearchParams(next);
  };

  const allowedSubgroupLabels = useMemo(
    () => (categoryParam === "all" ? null : canonicalGroupLabelsForCategory(categoryParam)),
    [categoryParam],
  );

  const filteredCourses = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return courses.filter((course) => {
      const matchesCategory =
        categoryParam === "all" || course.categorySlug === categoryParam;
      const matchesProgram = !programParam || course.slug === programParam;
      const programGroupLabel = resolveCurriculumProgramGroup(course);
      const matchesSearch =
        !term ||
        course.title.toLowerCase().includes(term) ||
        course.summary.toLowerCase().includes(term) ||
        (course.programGroup ?? "").toLowerCase().includes(term) ||
        programGroupLabel.toLowerCase().includes(term);
      const matchesCurriculumSubgroup =
        !allowedSubgroupLabels || allowedSubgroupLabels.has(programGroupLabel);
      return matchesCategory && matchesProgram && matchesSearch && matchesCurriculumSubgroup;
    });
  }, [categoryParam, programParam, searchTerm, courses, allowedSubgroupLabels]);

  /** When a category pill is active: only the canonical program groups for that category (e.g. DOLE’s four). */
  const groupedResults = useMemo(() => {
    if (categoryParam === "all" || programParam) return null;
    const map = new Map<string, typeof filteredCourses>();
    filteredCourses.forEach((c) => {
      const key = resolveCurriculumProgramGroup(c);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(c);
    });
    for (const list of map.values()) {
      list.sort((a, b) => a.title.localeCompare(b.title));
    }
    const nav = curriculumNavigation.find((n) => n.slug === categoryParam);
    const ordered: [string, typeof filteredCourses][] = [];
    if (nav) {
      for (const g of nav.groups) {
        const list = map.get(g.label);
        if (list?.length) ordered.push([g.label, list]);
      }
    }
    return ordered;
  }, [filteredCourses, categoryParam, programParam, courses]);

  const activeCategoryLabel =
    courseCategories.find((c) => c.slug === categoryParam)?.label ?? "All";
  const activeProgramTitle = programParam
    ? courses.find((c) => c.slug === programParam)?.title
    : null;

  const clearAll = () => {
    router.replace(pathname || "/", { scroll: false });
  };

  return (
    <div className="min-h-screen bg-background pt-32 pb-32">
      <div className="container mx-auto px-6">
        <div className="mb-12">
          <SectionHeader
            eyebrow="Curriculum"
            title="Training Programs"
            description="Explore our comprehensive catalog of industry-standard safety, technical, and compliance courses."
          />
          {isLoading && (
            <p className="mt-3 text-sm text-muted-foreground" role="status">
              Loading latest catalog…
            </p>
          )}
        </div>

        {/* Active filters — summary bar */}
        {(categoryParam !== "all" || programParam || searchTerm) && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="mb-10 rounded-2xl border border-border bg-card/80 shadow-sm backdrop-blur-sm"
            role="region"
            aria-label="Active filters"
          >
            <div className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4">
              <div className="min-w-0 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                <div className="flex shrink-0 items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-foreground">
                    <FiFilter className="h-3.5 w-3.5" aria-hidden />
                  </span>
                  <span>Active filters</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {categoryParam !== "all" && (
                    <span className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 py-1 pl-3 pr-1 text-sm font-medium text-foreground shadow-sm">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                      <span className="truncate">{activeCategoryLabel}</span>
                      <button
                        type="button"
                        onClick={() => setCategory("all")}
                        aria-label={`Remove ${activeCategoryLabel} filter`}
                        className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-background/90 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <FiX className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  )}
                  {activeProgramTitle && (
                    <span className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-accent/35 bg-accent/12 py-1 pl-3 pr-1 text-sm font-medium text-foreground shadow-sm">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
                      <span className="truncate">{activeProgramTitle}</span>
                      <button
                        type="button"
                        onClick={() => updateParam("program", null)}
                        aria-label="Remove program filter"
                        className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-background/90 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <FiX className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  )}
                  {searchTerm && (
                    <span className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-border bg-secondary/90 py-1 pl-3 pr-1 text-sm font-medium text-secondary-foreground shadow-sm">
                      <FiSearch className="h-3 w-3 shrink-0 opacity-70" aria-hidden />
                      <span className="max-w-[200px] truncate sm:max-w-[280px]">&ldquo;{searchTerm}&rdquo;</span>
                      <button
                        type="button"
                        onClick={() => updateParam("q", null)}
                        aria-label="Clear search"
                        className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-background/90 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <FiX className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  )}
                </div>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-3 border-t border-border pt-3 sm:border-t-0 sm:pt-0 sm:pl-4 sm:ml-1 md:border-l md:pl-5">
                <p className="text-xs tabular-nums text-muted-foreground">
                  <span className="font-semibold text-foreground">{filteredCourses.length}</span>
                  {filteredCourses.length === 1 ? " program" : " programs"}
                  <span className="hidden sm:inline"> match</span>
                </p>
                <button
                  type="button"
                  onClick={clearAll}
                  className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm transition-colors hover:border-foreground/20 hover:bg-secondary/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Clear all
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Filter Controls */}
        <div className="flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center mb-12">
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            <button
              onClick={() => setCategory("all")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                categoryParam === "all"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              All
            </button>
            {courseCategories.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => setCategory(cat.slug)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  categoryParam === cat.slug
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="relative w-full lg:w-80">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search programs..."
              className="pl-9 h-11 bg-background border-border rounded-lg shadow-sm focus-visible:ring-1 focus-visible:ring-primary"
              value={searchTerm}
              onChange={(e) => updateParam("q", e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={() => updateParam("q", null)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <FiX className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Course List */}
        {filteredCourses.length === 0 ? (
          <div className="py-24 text-center border border-border rounded-2xl bg-card">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
              <FiSearch className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No programs found</h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              We couldn't find any courses matching your current search parameters.
            </p>
            <button
              onClick={clearAll}
              className="inline-flex items-center justify-center px-6 py-2.5 rounded-lg bg-secondary text-secondary-foreground font-medium hover:bg-secondary/80 transition-colors"
            >
              Clear all filters
            </button>
          </div>
        ) : groupedResults ? (
          <div className="flex flex-col gap-16">
            {groupedResults.map(([groupName, list]) => (
              <div key={groupName}>
                <div className="flex items-center gap-3 mb-6">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent" aria-hidden />
                  <h3 className="text-[11px] font-semibold tracking-[0.22em] uppercase text-muted-foreground">
                    {groupName}
                  </h3>
                  <span className="h-px flex-1 bg-border" aria-hidden />
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {list.length} {list.length === 1 ? "program" : "programs"}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {list.map((course, idx) => (
                    <motion.div
                      key={course.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: idx * 0.05 }}
                    >
                      <CourseCard course={course} />
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course, idx) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
              >
                <CourseCard course={course} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
