"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { GraduationCap, BookOpenCheck, Briefcase } from "lucide-react";
import { FiArrowRight } from "react-icons/fi";
import { motion } from "framer-motion";

import type { CompanyNewsItem } from "@/data/companyNews";
import type { StudentVideoTestimonial } from "@/data/siteMarketingDefaults";
import type { SiteStat } from "@/types/site-content";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { CourseCard } from "@/components/ui/CourseCard";
import { LogoMarquee } from "@/components/ui/LogoMarquee";
import { LatestUpdatesSection } from "@/components/sections/LatestUpdatesSection";
import { StudentVideoTestimonialsSection } from "@/components/sections/StudentVideoTestimonialsSection";
import { useCatalogCoursesList } from "@/hooks/use-catalog-courses";

const heroImg = "/backgroundtopar.png";

export type HomeProps = {
  companyNews: CompanyNewsItem[];
  videoTestimonials: StudentVideoTestimonial[];
  stats: SiteStat[];
};

export default function Home({ companyNews, videoTestimonials, stats }: HomeProps) {
  const { catalogCourses: courses } = useCatalogCoursesList();
  const featuredCourses = courses.slice(0, 3);

  const accreditationLogos = [
    { src: "/logos/accreditations/dole.svg", alt: "DOLE" },
    { src: "/logos/accreditations/oshc.png", alt: "OSHC", multiply: true },
    { src: "/logos/accreditations/prc.png", alt: "PRC" },
    { src: "/logos/accreditations/pecb.png", alt: "PECB", multiply: true },
    { src: "/logos/accreditations/iadc.png", alt: "IADC", multiply: true },
    { src: "/logos/accreditations/british.svg", alt: "British Council" },
    { src: "/logos/accreditations/idp.svg", alt: "IDP" },
    { src: "/logos/accreditations/ielts.png", alt: "IELTS", multiply: true },
    { src: "/logos/accreditations/ashi.svg", alt: "ASHI" },
  ];

  return (
    <div className="bg-background selection:bg-primary/20 selection:text-primary">
      {/* Hero Section */}
      <section className="pt-32 pb-28 md:pt-48 md:pb-36 px-6">
        <div className="container mx-auto max-w-6xl text-center flex flex-col items-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-display-1 text-foreground mb-8 text-balance"
          >
            Enterprise compliance,<br /> engineered for scale.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-muted-foreground mb-12 max-w-2xl text-balance leading-relaxed"
          >
            Deploy rigorous, standardized competence programs across your entire workforce. We partner with the world's leading industrial firms to protect lives and optimize performance.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
          >
            <Link
              href="/contact?intent=corporate"
              className="inline-flex items-center justify-center px-6 py-3.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all hover-lift"
            >
              Contact Sales
            </Link>
            <Link
              href="/courses"
              className="inline-flex items-center justify-center px-6 py-3.5 rounded-lg bg-background border border-border text-foreground font-medium hover:bg-secondary transition-all hover-lift"
            >
              Explore Catalog
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.38 }}
            className="mt-10 max-w-2xl"
          >
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed text-balance">
              Accredited training and review programs, built for teams that need consistent outcomes across sites, shifts, and
              job roles—without slowing operations.
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="container mx-auto mt-36 md:mt-44 lg:mt-52 rounded-2xl overflow-hidden shadow-xl border border-border bg-card"
        >
          <img src={heroImg} alt="Modern Training Facility" className="w-full object-cover h-[400px] md:h-[600px]" />
        </motion.div>
      </section>

      {/* Trusted By Logo Strip */}
      <section className="py-14 border-y border-border bg-secondary/40 overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="h-px w-10 bg-accent/60" aria-hidden />
            <p className="text-[11px] font-medium tracking-[0.22em] uppercase text-muted-foreground text-center">
              Our Accreditations & Approvals
            </p>
            <span className="h-px w-10 bg-accent/60" aria-hidden />
          </div>

          <LogoMarquee logos={accreditationLogos} speed={40} />
        </div>
      </section>

      {/* Value Prop Trio */}
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-6">
          <SectionHeader
            alignment="center"
            eyebrow="The Platform"
            title="A complete competence system."
            description="More than just courses. A unified approach to managing organizational risk, standardizing procedures, and elevating team capabilities."
          />

          <div className="mt-16 rounded-3xl border border-border bg-card overflow-hidden">
            {/* meta strip */}
            <div className="px-6 md:px-10 py-4 border-b border-border flex items-center justify-between text-[11px] font-medium tracking-[0.18em] uppercase text-muted-foreground">
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                Platform capabilities
              </span>
              <span className="tabular-nums">3 / 3</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
              {[
                {
                  index: "01",
                  title: "Training",
                  description:
                    "We offer courses on BOSH, COSH, LCM, SPA, BBS, First Aid, BLS, ACLS, PALS, EMT, and many others.",
                  icon: <GraduationCap className="size-5" strokeWidth={1.5} aria-hidden />,
                  tag: "Unified curriculum",
                  metric: "1 standard",
                  imageSrc:
                    "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=900&q=80",
                  imageAlt: "Participants in a hands-on technical and safety training session",
                },
                {
                  index: "02",
                  title: "Review",
                  description:
                    "We conduct review classes on IELTS, OET, CSC, NLE, including NCLEX, CGFNS, Prometric, and many others.",
                  icon: <BookOpenCheck className="size-5" strokeWidth={1.5} aria-hidden />,
                  tag: "Field-tested",
                  metric: "200+ instructors",
                  imageSrc:
                    "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=900&q=80",
                  imageAlt: "Learners studying and preparing for professional licensing and exam reviews",
                },
                {
                  index: "03",
                  title: "Consultancy",
                  description:
                    "We provide assessment, certification, and consultancy on various disciplines across industry.",
                  icon: <Briefcase className="size-5" strokeWidth={1.5} aria-hidden />,
                  tag: "Executive reporting",
                  metric: "98% pass rate",
                  imageSrc:
                    "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=900&q=80",
                  imageAlt: "Consultants collaborating with executives on assessment and compliance planning",
                },
              ].map((item, idx) => (
                <motion.div
                  key={item.index}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.5, delay: idx * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  className="p-8 md:p-10 flex flex-col gap-6 group"
                >
                  <div className="flex items-start justify-between">
                    <div className="relative shrink-0">
                      {/* Extra inset so Lucide stroke caps aren’t clipped; grid centers reliably */}
                      <div className="grid size-16 place-items-center rounded-2xl border border-border bg-background p-2.5 text-foreground shadow-sm [&_svg]:block [&_svg]:overflow-visible">
                        {item.icon}
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 z-10 size-3 rounded-full bg-accent ring-[3px] ring-card" />
                    </div>
                    <span className="text-[11px] font-medium tracking-[0.18em] uppercase text-muted-foreground tabular-nums">
                      {item.index}
                    </span>
                  </div>

                  <div className="relative aspect-16/10 w-full overflow-hidden rounded-2xl border border-border bg-muted shadow-inner ring-1 ring-black/4">
                    <Image
                      src={item.imageSrc}
                      alt={item.imageAlt}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    <span
                      className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-card/90 via-transparent to-transparent"
                      aria-hidden
                    />
                  </div>

                  <div>
                    <h3 className="text-xl md:text-2xl font-semibold tracking-tight text-foreground">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-base text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="mt-auto pt-6 border-t border-border flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 text-xs font-medium text-foreground">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                      {item.tag}
                    </span>
                    <span className="text-xs font-medium text-muted-foreground tabular-nums">
                      {item.metric}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {stats.map((stat, idx) => (
              <div key={idx} className="flex flex-col gap-2 items-center text-center">
                <div className="text-4xl md:text-5xl font-bold text-foreground">{stat.value}</div>
                <div className="text-sm font-medium text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-24 md:py-32 bg-secondary/30 border-y border-border">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16">
            <SectionHeader
              eyebrow="Curriculum"
              title="Featured Programs"
              className="mb-0"
            />
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors mb-2"
            >
              View all programs <FiArrowRight />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>
      </section>

      {/* Student video testimonials */}
      <StudentVideoTestimonialsSection
        items={videoTestimonials}
        className="border-y border-border bg-secondary/30 py-24 md:py-32"
      />

      {/* Company news & CSR */}
      <LatestUpdatesSection items={companyNews} />

    </div>
  );
}
