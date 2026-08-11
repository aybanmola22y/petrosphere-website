"use client";

import React from "react";
import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";

import type { CompanyNewsItem } from "@/data/companyNews";
import type { StudentVideoTestimonial } from "@/data/siteMarketingDefaults";
import type { SiteStat } from "@/types/site-content";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { CourseCard } from "@/components/ui/CourseCard";
import { LogoMarquee } from "@/components/ui/LogoMarquee";
import { LatestUpdatesSection } from "@/components/sections/LatestUpdatesSection";
import { HomeHeroSection } from "@/components/sections/HomeHeroSection";
import { HomeStatsSection } from "@/components/sections/HomeStatsSection";
import { PlatformCapabilitiesSection } from "@/components/sections/PlatformCapabilitiesSection";
import { StudentVideoTestimonialsSection } from "@/components/sections/StudentVideoTestimonialsSection";
import { useCatalogCoursesList } from "@/hooks/use-catalog-courses";
import { pickFeaturedCourses } from "@/lib/featured-courses";

export type HomeProps = {
  companyNews: CompanyNewsItem[];
  videoTestimonials: StudentVideoTestimonial[];
  stats: SiteStat[];
};

export default function Home({ companyNews, videoTestimonials, stats }: HomeProps) {
  const { catalogCourses: courses } = useCatalogCoursesList();
  const featuredCourses = pickFeaturedCourses(courses);

  const accreditationLogos = [
    { src: "/logos/accreditations/dole.svg", alt: "DOLE" },
    { src: "/logos/accreditations/oshc.png", alt: "OSHC", multiply: true },
    { src: "/logos/accreditations/prc.png", alt: "PRC" },
    { src: "/logos/accreditations/TESDA.png", alt: "TESDA" },
    { src: "/logos/accreditations/pecb.png", alt: "PECB", multiply: true },
    { src: "/logos/accreditations/iadc.png", alt: "IADC", multiply: true },
    { src: "/logos/accreditations/british.svg", alt: "British Council" },
    { src: "/logos/accreditations/idp.svg", alt: "IDP" },
    { src: "/logos/accreditations/ielts.png", alt: "IELTS", multiply: true },
    { src: "/logos/accreditations/ashi.svg", alt: "ASHI" },
  ];

  return (
    <div className="bg-background selection:bg-primary/20 selection:text-primary">
      {/* First viewport: hero + trusted only */}
      <div className="flex min-h-svh flex-col">
        <HomeHeroSection />

        <section className="overflow-hidden border-t border-border/40 bg-secondary/40 py-8 md:py-10">
          <div className="container mx-auto px-6">
            <div className="mb-2 flex items-center justify-center gap-3">
              <span className="h-px w-10 bg-accent/60" aria-hidden />
              <p className="text-center text-[11px] font-medium tracking-[0.22em] uppercase text-muted-foreground">
                Trusted accreditations &amp; approvals
              </p>
              <span className="h-px w-10 bg-accent/60" aria-hidden />
            </div>

            <LogoMarquee logos={accreditationLogos} speed={40} />
          </div>
        </section>

        {/* Platform capabilities (4 services) */}
        <section className="bg-background py-14 md:py-24">
          <div className="container mx-auto px-6">
            <PlatformCapabilitiesSection />
          </div>
        </section>
      </div>

      {/* Featured Courses */}
      <section className="border-y border-border bg-secondary/30 py-24 md:py-32">
        <div className="container mx-auto px-6">
          <SectionHeader
            alignment="center"
            eyebrow="Curriculum"
            title="Popular Courses"
            description="Our most enrolled DOLE and EMS pathways — the courses teams choose first for safety officer accreditation, mandatory orientation, and advanced life support."
            className="mb-0"
          />
          <div className="mt-8 flex justify-center">
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-primary/80"
            >
              View all programs <FiArrowRight />
            </Link>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-6 md:mt-16 md:grid-cols-2 lg:grid-cols-3">
            {featuredCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>
      </section>

      <HomeStatsSection stats={stats} />

      {/* Student video testimonials */}
      <StudentVideoTestimonialsSection
        items={videoTestimonials}
        className="border-y border-border bg-secondary/30 py-24 md:py-32"
      />

      {/* Company news & CSR */}
      <LatestUpdatesSection items={companyNews} showViewAll />
    </div>
  );
}
