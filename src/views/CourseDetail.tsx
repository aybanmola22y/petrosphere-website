"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiArrowUpRight,
  FiBarChart,
  FiCalendar,
  FiChevronRight,
  FiClock,
  FiMapPin,
} from "react-icons/fi";

import { Button } from "@/components/ui/button";
import {
  contactCorporateHref,
  isExternalHref,
  resolveEnrollHrefForCourse,
} from "@/lib/enrollment";
import { resolveCourseBySlug } from "@/lib/catalog";
import { buildCourseDetailSections } from "@/lib/course-detail-sections";
import { courseDetailVisual } from "@/lib/course-card-image";
import { normalizeCourseTitle } from "@/lib/course-title";
import { useTmsSchedules } from "@/hooks/use-tms-schedules";
import { useCatalogCoursesList } from "@/hooks/use-catalog-courses";
import { cn } from "@/lib/utils";

type TabId = "overview" | "curriculum" | "audience" | "certification";

const TABS: { id: TabId; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "curriculum", label: "Curriculum" },
  { id: "audience", label: "Audience" },
  { id: "certification", label: "Certification" },
];

const panelMotion = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
  transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] as const },
};

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-0 divide-y divide-border/70">
      {items.map((item) => (
        <li key={item} className="flex gap-3.5 py-4 first:pt-0 last:pb-0">
          <span
            className="mt-2 size-1.5 shrink-0 rounded-full bg-primary"
            aria-hidden
          />
          <span className="text-[0.95rem] leading-relaxed text-foreground/80">{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function CourseDetail({ slug }: { slug: string }) {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const { data: tmsSessions = [] } = useTmsSchedules();
  const { catalogCourses, isLoading } = useCatalogCoursesList();

  const course = useMemo(
    () => resolveCourseBySlug(slug, catalogCourses),
    [slug, catalogCourses],
  );

  const enrollHref = useMemo(
    () => (course ? resolveEnrollHrefForCourse(course.slug, tmsSessions) : "/schedule"),
    [course, tmsSessions],
  );
  const detailSections = useMemo(
    () => (course ? buildCourseDetailSections(course) : []),
    [course],
  );
  const enrollIsExternal = course ? isExternalHref(enrollHref) : false;

  const sectionById = useMemo(
    () => new Map(detailSections.map((s) => [s.id, s])),
    [detailSections],
  );

  if (isLoading && !course) {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center bg-background px-6 text-center">
        <div
          className="mb-6 h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent"
          aria-hidden
        />
        <p className="text-sm text-muted-foreground">Loading program details…</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center bg-background px-6 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
          <FiBarChart className="h-6 w-6 text-muted-foreground" />
        </div>
        <h1 className="mb-4 text-3xl font-semibold text-foreground">Course Not Found</h1>
        <p className="mb-8 max-w-sm text-muted-foreground">
          The training program you are looking for does not exist or has been moved.
        </p>
        <Link
          href="/courses"
          className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-2.5 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Return to Curriculum
        </Link>
      </div>
    );
  }

  const whyTrain = sectionById.get("why-train");
  const whoNeeds = sectionById.get("who-needs");
  const objectives = sectionById.get("objectives");
  const keyComponents = sectionById.get("key-components");
  const where = sectionById.get("where");
  const certification = sectionById.get("certification");
  const compliance = sectionById.get("compliance-benefits");
  const cpd = sectionById.get("cpd");

  const whyParagraphs =
    whyTrain?.body.type === "paragraphs" ? whyTrain.body.paragraphs : [];
  const whoItems = whoNeeds?.body.type === "bullets" ? whoNeeds.body.items : [];
  const objectiveItems =
    objectives?.body.type === "bullets" ? objectives.body.items : course.objectives;
  const componentItems =
    keyComponents?.body.type === "bullets" ? keyComponents.body.items : [];
  const whereParagraphs = where?.body.type === "paragraphs" ? where.body.paragraphs : [];
  const certParagraphs =
    certification?.body.type === "paragraphs" ? certification.body.paragraphs : [];
  const complianceParagraphs =
    compliance?.body.type === "paragraphs" ? compliance.body.paragraphs : [];
  const cpdParagraphs = cpd?.body.type === "paragraphs" ? cpd.body.paragraphs : [];

  const meta = [
    { icon: FiClock, label: "Duration", value: course.duration },
    { icon: FiBarChart, label: "Level", value: course.level },
    { icon: FiCalendar, label: "Schedule", value: course.schedule },
    { icon: FiMapPin, label: "Format", value: "In-Person / Remote" },
  ];

  const courseVisual = courseDetailVisual(course);

  return (
    <div className="min-h-screen bg-background">
      {/* Brand band + hero */}
      <section className="relative overflow-hidden">
        <div className="bg-[#00044a] pt-28 pb-16 md:pt-32 md:pb-20">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.14]"
            aria-hidden
            style={{
              backgroundImage: `
                radial-gradient(ellipse 80% 60% at 20% 20%, hsl(42 72% 52% / 0.35), transparent 55%),
                repeating-linear-gradient(
                  90deg,
                  transparent,
                  transparent calc(12.5% - 1px),
                  rgba(255,255,255,0.06) calc(12.5% - 1px),
                  rgba(255,255,255,0.06) 12.5%
                )
              `,
            }}
          />

          <div className="relative z-10 container mx-auto px-6">
            <motion.nav
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mb-8 flex flex-wrap items-center gap-1.5 text-sm text-white/50"
              aria-label="Breadcrumb"
            >
              <Link href="/" className="transition-colors hover:text-white/80">
                Home
              </Link>
              <FiChevronRight className="size-3 opacity-50" aria-hidden />
              <Link href="/courses" className="transition-colors hover:text-white/80">
                Curriculum
              </Link>
              <FiChevronRight className="size-3 opacity-50" aria-hidden />
              <span className="max-w-[16rem] truncate text-white/75 sm:max-w-md">
                {normalizeCourseTitle(course.title)}
              </span>
            </motion.nav>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-3xl"
            >
              <h1 className="text-[2.15rem] font-bold leading-[1.08] tracking-tight text-white sm:text-5xl md:text-[3.25rem]">
                {normalizeCourseTitle(course.title)}
              </h1>

              <p className="mt-5 max-w-xl text-base leading-relaxed text-white/65 sm:text-lg">
                {course.summary}
              </p>
            </motion.div>
          </div>
        </div>

        {/* Gold rule under navy band */}
        <div className="h-1 bg-linear-to-r from-primary via-primary/80 to-primary/20" aria-hidden />
      </section>

      {/* Content shell */}
      <div className="container mx-auto px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-14">
          {/* Main column */}
          <div className="lg:col-span-8">
            {/* Premium tab rail */}
            <div
              role="tablist"
              aria-label="Program information"
              className="relative flex gap-0 overflow-x-auto rounded-full border border-border bg-secondary/50 p-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {TABS.map((tab) => {
                const selected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    id={`course-tab-${tab.id}`}
                    aria-controls={`course-panel-${tab.id}`}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "relative z-10 flex-1 whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-medium transition-colors",
                      selected
                        ? "text-white"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {selected && (
                      <motion.span
                        layoutId="course-tab-pill"
                        className="absolute inset-0 rounded-full bg-foreground shadow-sm"
                        transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      />
                    )}
                    <span className="relative z-10">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <div
              role="tabpanel"
              id={`course-panel-${activeTab}`}
              aria-labelledby={`course-tab-${activeTab}`}
              className="mt-10 min-h-[22rem]"
            >
              <AnimatePresence mode="wait">
                {activeTab === "overview" && (
                  <motion.div key="overview" {...panelMotion} className="space-y-10">
                    <div>
                      <h2 className="text-[11px] font-medium tracking-[0.22em] uppercase text-muted-foreground">
                        Program overview
                      </h2>
                      <p className="mt-4 max-w-2xl text-lg leading-8 text-foreground/85">
                        {course.overview}
                      </p>
                    </div>

                    <figure className="overflow-hidden rounded-2xl border border-border/80 bg-muted">
                      <div className="relative aspect-[16/10] w-full sm:aspect-[2/1]">
                        <Image
                          src={courseVisual.src}
                          alt={courseVisual.alt}
                          fill
                          quality={92}
                          className={cn(
                            courseVisual.objectClass ?? "object-cover object-top",
                          )}
                          sizes="(max-width: 1024px) 100vw, (max-width: 1440px) 70vw, 1100px"
                          priority
                        />
                      </div>
                    </figure>

                    {whyParagraphs.length > 0 && (
                      <blockquote className="relative border-l-2 border-primary pl-6 md:pl-8">
                        <p className="text-[11px] font-medium tracking-[0.22em] uppercase text-primary">
                          Why this program
                        </p>
                        {whyParagraphs.map((paragraph) => (
                          <p
                            key={paragraph}
                            className="mt-3 max-w-2xl text-base leading-7 text-foreground/80 md:text-[1.05rem] md:leading-8"
                          >
                            {paragraph}
                          </p>
                        ))}
                      </blockquote>
                    )}

                    {whereParagraphs.length > 0 && (
                      <div className="grid gap-3 border-t border-border pt-8 sm:grid-cols-[7rem_1fr]">
                        <p className="text-[11px] font-medium tracking-[0.22em] uppercase text-muted-foreground">
                          Delivery
                        </p>
                        <div className="space-y-3">
                          {whereParagraphs.map((paragraph) => (
                            <p
                              key={paragraph}
                              className="max-w-2xl text-[0.95rem] leading-7 text-muted-foreground"
                            >
                              {paragraph}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === "curriculum" && (
                  <motion.div
                    key="curriculum"
                    {...panelMotion}
                    className="grid gap-12 md:grid-cols-2 md:gap-10"
                  >
                    <div>
                      <h2 className="text-[11px] font-medium tracking-[0.22em] uppercase text-muted-foreground">
                        Learning objectives
                      </h2>
                      <div className="mt-6">
                        <BulletList items={objectiveItems} />
                      </div>
                    </div>
                    <div>
                      <h2 className="text-[11px] font-medium tracking-[0.22em] uppercase text-muted-foreground">
                        Key components
                      </h2>
                      <div className="mt-6">
                        <BulletList items={componentItems} />
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === "audience" && (
                  <motion.div key="audience" {...panelMotion} className="space-y-10">
                    <div>
                      <h2 className="text-[11px] font-medium tracking-[0.22em] uppercase text-muted-foreground">
                        Who should attend
                      </h2>
                      <div className="mt-6 max-w-2xl">
                        <BulletList
                          items={whoItems.length ? whoItems : course.audience}
                        />
                      </div>
                    </div>

                    {course.audience.length > 0 && (
                      <div className="border-t border-border pt-8">
                        <h3 className="text-[11px] font-medium tracking-[0.22em] uppercase text-muted-foreground">
                          Target profile
                        </h3>
                        <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3">
                          {course.audience.map((aud) => (
                            <span
                              key={aud}
                              className="border-b border-primary/40 pb-0.5 text-sm font-medium text-foreground"
                            >
                              {aud}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === "certification" && (
                  <motion.div key="certification" {...panelMotion} className="space-y-8">
                    {certParagraphs.map((paragraph) => (
                      <div key={paragraph}>
                        <h2 className="text-[11px] font-medium tracking-[0.22em] uppercase text-muted-foreground">
                          Certification
                        </h2>
                        <p className="mt-4 max-w-2xl text-base leading-8 text-foreground/85">
                          {paragraph}
                        </p>
                      </div>
                    ))}

                    {complianceParagraphs.length > 0 && (
                      <div className="grid gap-3 border-t border-border pt-8 sm:grid-cols-[7rem_1fr]">
                        <p className="text-[11px] font-medium tracking-[0.22em] uppercase text-muted-foreground">
                          Compliance
                        </p>
                        <div className="space-y-3">
                          {complianceParagraphs.map((paragraph) => (
                            <p
                              key={paragraph}
                              className="max-w-2xl text-[0.95rem] leading-7 text-muted-foreground"
                            >
                              {paragraph}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}

                    {cpdParagraphs.length > 0 && (
                      <div className="grid gap-3 border-t border-border pt-8 sm:grid-cols-[7rem_1fr]">
                        <p className="text-[11px] font-medium tracking-[0.22em] uppercase text-muted-foreground">
                          CPD
                        </p>
                        <div className="space-y-3">
                          {cpdParagraphs.map((paragraph) => (
                            <p
                              key={paragraph}
                              className="max-w-2xl text-[0.95rem] leading-7 text-muted-foreground"
                            >
                              {paragraph}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Enrollment panel */}
          <aside className="lg:col-span-4">
            <div className="relative overflow-hidden rounded-2xl border border-border bg-card lg:sticky lg:top-28">
              <span
                className="absolute inset-x-0 top-0 h-[3px] bg-linear-to-r from-primary/0 via-primary to-primary/0"
                aria-hidden
              />

              <div className="p-7 md:p-8">
                <p className="text-[11px] font-medium tracking-[0.22em] uppercase text-muted-foreground">
                  Enroll in this program
                </p>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                  {course.duration}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {course.level} · {course.schedule}
                </p>

                <ul className="mt-7 space-y-3.5 border-t border-border pt-6">
                  {meta.map(({ icon: Icon, label, value }) => (
                    <li key={label} className="flex items-center gap-3 text-sm">
                      <Icon className="size-4 shrink-0 text-primary" aria-hidden />
                      <span className="text-muted-foreground">{label}</span>
                      <span className="ml-auto font-medium text-foreground">{value}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8 space-y-3">
                  <Button
                    asChild
                    className="h-12 w-full rounded-full text-base font-semibold shadow-[0_12px_28px_-14px_hsl(42_72%_52%/0.9)]"
                  >
                    {enrollIsExternal ? (
                      <a href={enrollHref} target="_blank" rel="noopener noreferrer">
                        Enroll Now
                        <FiArrowUpRight className="ml-1 size-4" aria-hidden />
                      </a>
                    ) : (
                      <Link href={enrollHref}>
                        Enroll Now
                        <FiArrowUpRight className="ml-1 size-4" aria-hidden />
                      </Link>
                    )}
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="h-12 w-full rounded-full bg-background text-base font-medium"
                  >
                    <Link href={contactCorporateHref(course.slug)}>Corporate Booking</Link>
                  </Button>
                </div>

                <div className="mt-7 border-t border-border pt-5 text-center">
                  <p className="text-xs text-muted-foreground">Need help choosing a cohort?</p>
                  <a
                    href="mailto:admissions@petrosphere.com"
                    className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80"
                  >
                    Contact Admissions
                    <FiArrowUpRight className="size-3.5" aria-hidden />
                  </a>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
