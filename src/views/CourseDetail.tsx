"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { FiClock, FiBarChart, FiCalendar, FiMapPin, FiChevronRight } from "react-icons/fi";

import { Button } from "@/components/ui/button";
import {
  contactCorporateHref,
  isExternalHref,
  resolveEnrollHrefForCourse,
} from "@/lib/enrollment";
import { resolveCourseBySlug } from "@/lib/catalog";
import { useTmsSchedules } from "@/hooks/use-tms-schedules";
import { useCatalogCoursesList } from "@/hooks/use-catalog-courses";

export default function CourseDetail({ slug }: { slug: string }) {
  const { data: tmsSessions = [] } = useTmsSchedules();
  const { catalogCourses, isLoading } = useCatalogCoursesList();

  const course = useMemo(
    () => resolveCourseBySlug(slug, catalogCourses),
    [slug, catalogCourses],
  );

  if (isLoading && !course) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center bg-background px-6 text-center">
        <div
          className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent mb-6"
          aria-hidden
        />
        <p className="text-muted-foreground text-sm">Loading program details…</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center bg-background px-6 text-center">
        <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
          <FiBarChart className="w-6 h-6 text-muted-foreground" />
        </div>
        <h1 className="text-3xl font-semibold text-foreground mb-4">Course Not Found</h1>
        <p className="text-muted-foreground mb-8 max-w-sm">The training program you are looking for does not exist or has been moved.</p>
        <Link href="/courses" className="inline-flex items-center justify-center px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors">
            Return to Curriculum
        </Link>
      </div>
    );
  }

  const enrollHref = useMemo(
    () => resolveEnrollHrefForCourse(course.slug, tmsSessions),
    [course.slug, tmsSessions],
  );
  const enrollIsExternal = isExternalHref(enrollHref);

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Hero */}
      <div className="bg-secondary/30 pt-32 pb-20 md:pt-40 md:pb-24 border-b border-border">
         <div className="container mx-auto px-6">
            <div className="flex items-center text-sm text-muted-foreground mb-8 gap-2">
               <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
               <FiChevronRight className="w-3 h-3" />
               <Link href="/courses" className="hover:text-foreground transition-colors">Curriculum</Link>
               <FiChevronRight className="w-3 h-3" />
               <span className="text-foreground font-medium">{course.title}</span>
            </div>
            
            <div className="max-w-4xl">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary mb-6">
                {course.category}
              </span>
              <h1 className="text-display-2 text-foreground mb-6 text-balance">{course.title}</h1>
              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
                 {course.summary}
              </p>
            </div>
         </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 mt-16 md:mt-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          
          <div className="lg:col-span-8 space-y-16">
            
            <section>
                <h2 className="text-2xl font-semibold text-foreground mb-6">Overview</h2>
                <div className="prose prose-lg prose-p:text-muted-foreground prose-p:leading-relaxed max-w-none">
                    <p>{course.overview}</p>
                </div>
            </section>

            <section>
                <h2 className="text-2xl font-semibold text-foreground mb-6">Learning Outcomes</h2>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {course.objectives.map((obj, idx) => (
                        <li key={idx} className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border">
                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                                <span className="text-primary text-xs font-semibold">{idx + 1}</span>
                            </div>
                            <span className="text-foreground leading-relaxed">{obj}</span>
                        </li>
                    ))}
                </ul>
            </section>

            <section>
                <h2 className="text-2xl font-semibold text-foreground mb-6">Target Profile</h2>
                <div className="flex flex-wrap gap-3">
                    {course.audience.map((aud, idx) => (
                        <div key={idx} className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium">
                            {aud}
                        </div>
                    ))}
                </div>
            </section>

          </div>

          {/* Sticky Action Panel */}
          <div className="lg:col-span-4">
             <div className="sticky top-32 rounded-2xl border border-border bg-card shadow-sm p-8">
                <h3 className="text-xl font-semibold text-foreground mb-6">Course Details</h3>
                
                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <FiClock className="w-5 h-5 text-primary" />
                    <div>
                      <div className="text-xs font-medium uppercase tracking-wider">Duration</div>
                      <div className="text-foreground font-medium">{course.duration}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <FiBarChart className="w-5 h-5 text-primary" />
                    <div>
                      <div className="text-xs font-medium uppercase tracking-wider">Skill Level</div>
                      <div className="text-foreground font-medium">{course.level}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <FiCalendar className="w-5 h-5 text-primary" />
                    <div>
                      <div className="text-xs font-medium uppercase tracking-wider">Schedule</div>
                      <div className="text-foreground font-medium">{course.schedule}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <FiMapPin className="w-5 h-5 text-primary" />
                    <div>
                      <div className="text-xs font-medium uppercase tracking-wider">Format</div>
                      <div className="text-foreground font-medium">In-Person / Remote</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                    <Button
                      asChild
                      className="w-full min-h-12 rounded-lg text-base font-medium hover-lift"
                    >
                      {enrollIsExternal ? (
                        <a
                          href={enrollHref}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Enroll Now
                        </a>
                      ) : (
                        <Link href={enrollHref}>Enroll Now</Link>
                      )}
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      className="w-full min-h-12 rounded-lg text-base font-medium hover-lift bg-background"
                    >
                      <Link href={contactCorporateHref(course.slug)}>
                        Corporate Booking
                      </Link>
                    </Button>
                </div>

                <div className="mt-8 pt-6 border-t border-border text-center">
                    <div className="text-sm text-muted-foreground mb-2">Have questions about this program?</div>
                    <a href="mailto:admissions@petrosphere.com" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                        Contact Admissions
                    </a>
                </div>
             </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}