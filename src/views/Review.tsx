"use client";

import React from "react";
import {
  FiActivity,
  FiArrowUpRight,
  FiAward,
  FiBriefcase,
  FiClock,
  FiEdit3,
  FiGlobe,
  FiGrid,
  FiMapPin,
  FiTrendingUp,
  FiUsers,
} from "react-icons/fi";
import { motion } from "framer-motion";
import Link from "next/link";

import { SectionHeader } from "@/components/ui/SectionHeader";

const FALLBACK_PREVIEW_IMAGE =
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#0f172a" stop-opacity="0.08"/>
          <stop offset="1" stop-color="#0f172a" stop-opacity="0.16"/>
        </linearGradient>
        <pattern id="p" width="28" height="28" patternUnits="userSpaceOnUse">
          <path d="M0 28 L28 0" stroke="#0f172a" stroke-opacity="0.08" stroke-width="2"/>
        </pattern>
      </defs>
      <rect width="800" height="600" fill="url(#g)"/>
      <rect width="800" height="600" fill="url(#p)"/>
    </svg>`
  );

type ReviewProgram = {
  anchorId: string;
  index: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  previewImage: { src: string; alt: string };
};

const programs: ReviewProgram[] = [
  {
    anchorId: "nle",
    index: "01",
    title: "NLE",
    description:
      "Nursing Licensure Examination review grounded in local blueprint coverage — high-yield concepts, computation clinics where applicable, and sit-style practice that mirrors testing psychology.",
    icon: <FiActivity className="w-5 h-5" />,
    previewImage: {
      src: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=880&q=80",
      alt: "Student studying with notes and books",
    },
  },
  {
    anchorId: "csc-exam-review",
    index: "02",
    title: "CSC Exam Review",
    description:
      "Civil Service Commission examination readiness — verbal, analytical, and clerical domains handled through repeatable workflows, speed drills, and mistake-proofing habits under time pressure.",
    icon: <FiBriefcase className="w-5 h-5" />,
    previewImage: {
      src: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=880&q=80",
      alt: "Paperwork and documents for exam preparation",
    },
  },
  {
    anchorId: "let",
    index: "03",
    title: "LET",
    description:
      "Licensure Examination for Teachers preparation spanning general education and professional education pillars — concept mastery, item-type tactics, and lesson-demonstration confidence where applicable.",
    icon: <FiEdit3 className="w-5 h-5" />,
    previewImage: {
      src: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=880&q=80",
      alt: "Teacher or student working at a desk with books",
    },
  },
  {
    anchorId: "nclex",
    index: "04",
    title: "NCLEX",
    description:
      "NCLEX-RN / PN readiness focused on Next Generation-style prioritisation, safety, and management-of-care judgement — not memorisation alone, but repeatable clinical reasoning frameworks.",
    icon: <FiGlobe className="w-5 h-5" />,
    previewImage: {
      src: "https://images.unsplash.com/photo-1551601651-2a8555f1a136?auto=format&fit=crop&w=880&q=80",
      alt: "Healthcare study environment with books and notes",
    },
  },
  {
    anchorId: "cgfns",
    index: "05",
    title: "CGFNS",
    description:
      "Commission on Graduates of Foreign Nursing Schools pathway guidance — credential evaluation orientation, qualifying exam preparation, and documentation hygiene for downstream regulators.",
    icon: <FiAward className="w-5 h-5" />,
    previewImage: {
      src: "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=880&q=80",
      alt: "Professional reviewing documents in an office setting",
    },
  },
  {
    anchorId: "haad",
    index: "06",
    title: "HAAD",
    description:
      "Health Authority – Abu Dhabi (HAAD) assessment orientation — exam mechanics, clinical scenario pacing, and professional communication expectations for Gulf deployment readiness.",
    icon: <FiMapPin className="w-5 h-5" />,
    previewImage: {
      src: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=880&q=80",
      alt: "Study group collaborating around a laptop",
    },
  },
  {
    anchorId: "prometric",
    index: "07",
    title: "PROMETRIC",
    description:
      "Prometric-delivered healthcare and professional examinations — environment familiarity, computer-based testing ergonomics, and adaptive pacing strategies across credentialing partners.",
    icon: <FiGrid className="w-5 h-5" />,
    previewImage: {
      src: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=880&q=80",
      alt: "People working with laptops in a modern workspace",
    },
  },
];

const capabilityTotalDisplay = String(programs.length).padStart(2, "0");

const headerStats = [
  { icon: <FiUsers className="w-4 h-4" />, value: "7", label: "Review verticals" },
  { icon: <FiTrendingUp className="w-4 h-4" />, value: "Live", label: "Cohort & hybrid" },
  { icon: <FiClock className="w-4 h-4" />, value: "15+", label: "Instructional years" },
  { icon: <FiAward className="w-4 h-4" />, value: "Structured", label: "Diagnostics to mocks" },
];

export default function Review() {
  return (
    <div className="min-h-screen bg-background pt-32 pb-24 md:pb-32">
      <div className="container mx-auto px-6 mb-24 md:mb-32">
        <SectionHeader
          eyebrow="Review Centre"
          title="Licensure & examination readiness."
          description="Dedicated review programs for English proficiency, nursing and teacher licensure, civil service, and international credentialing pathways — coached cohorts, diagnostics, and examination-style practice designed around how Filipinos actually prepare."
        />

        <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 rounded-2xl border border-border overflow-hidden bg-secondary/30">
          {headerStats.map((s, i) => (
            <div
              key={s.label}
              className={[
                "flex min-w-0 flex-col gap-3 bg-background/60 p-4 sm:flex-row sm:items-start sm:gap-4 sm:p-5 lg:p-6",
                i !== 0 ? "lg:border-l border-border" : "",
                i % 2 !== 0 ? "border-l border-border lg:border-l" : "",
                i >= 2 ? "border-t lg:border-t-0 border-border" : "",
              ].join(" ")}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/5 text-primary">
                {s.icon}
              </div>
              <div className="min-w-0 flex-1">
                <div className="break-words text-xl font-semibold leading-tight tracking-tight text-foreground tabular-nums sm:text-2xl">
                  {s.value}
                </div>
                <div className="mt-2 break-words pb-0.5 text-[10px] font-medium uppercase leading-relaxed tracking-[0.08em] text-muted-foreground sm:text-[11px] sm:tracking-[0.12em]">
                  {s.label}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 space-y-6 md:space-y-8">
          {programs.map((cap, idx) => (
            <motion.article
              key={cap.anchorId}
              id={cap.anchorId}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: Math.min(idx * 0.06, 0.3), ease: [0.22, 1, 0.36, 1] }}
              className="group scroll-mt-36 overflow-hidden rounded-3xl border border-border bg-card"
            >
              <div className="grid grid-cols-1 gap-0 lg:grid-cols-12 lg:items-stretch">
                <div className="flex items-center gap-5 border-b border-border px-6 py-6 sm:px-8 lg:col-span-2 lg:flex-col lg:items-start lg:justify-between lg:border-b-0 lg:border-r lg:px-8 lg:py-10">
                  <span className="text-[11px] font-medium tracking-[0.18em] uppercase text-muted-foreground tabular-nums">
                    {cap.index} / {capabilityTotalDisplay}
                  </span>
                  <div className="relative">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-background text-foreground shadow-sm">
                      {cap.icon}
                    </div>
                    <span className="absolute -bottom-1 -right-1 h-2.5 w-2.5 rounded-full bg-accent ring-4 ring-card" />
                  </div>
                </div>

                <div className="flex flex-col justify-center px-6 py-8 sm:px-8 lg:col-span-6 lg:px-10 lg:py-10">
                  <h3 className="text-2xl font-semibold tracking-tight text-foreground leading-tight md:text-3xl">
                    {cap.title}
                  </h3>
                  <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
                    {cap.description}
                  </p>

                  <div className="mt-6">
                    <Link
                      href="/about#contact"
                      className="inline-flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-primary/80"
                    >
                      Discuss this program
                      <FiArrowUpRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>

                <div className="relative min-h-[220px] border-t border-border lg:col-span-4 lg:min-h-full lg:border-t-0 lg:border-l">
                  <img
                    src={cap.previewImage.src}
                    alt={cap.previewImage.alt}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                    loading="lazy"
                    onError={(e) => {
                      const img = e.currentTarget;
                      if (img.src !== FALLBACK_PREVIEW_IMAGE) img.src = FALLBACK_PREVIEW_IMAGE;
                    }}
                  />
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </div>
  );
}
