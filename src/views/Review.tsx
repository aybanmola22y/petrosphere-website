"use client";

import React from "react";
import {
  FiActivity,
  FiArrowUpRight,
  FiAward,
  FiBookOpen,
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
  engagement: string;
  duration: string;
  team: string;
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
    engagement: "Intensive cycle or extended program",
    duration: "8 – 20 weeks",
    team: "Clinical reviewers + test strategist",
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
    engagement: "Sprint or full preparatory season",
    duration: "6 – 14 weeks",
    team: "Exam strategist + item specialists",
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
    engagement: "Seasonal cohort or customised pacing",
    duration: "10 – 24 weeks",
    team: "LET faculty leads + subject coaches",
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
    engagement: "Adaptive program",
    duration: "12 – 28 weeks",
    team: "International nurse educators + NCLEX coach",
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
    engagement: "Stage-based advisory",
    duration: "8 – 20 weeks",
    team: "Credential advisor + clinical reviewer",
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
    engagement: "Targeted prep window",
    duration: "6 – 12 weeks",
    team: "Gulf-licensure SME + clinical coach",
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
    engagement: "Exam-window aligned sprint",
    duration: "4 – 10 weeks",
    team: "CBT strategist + domain SMEs",
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
  { icon: <FiClock className="w-4 h-4" />, value: "15+", label: "Years instructional bench" },
  { icon: <FiAward className="w-4 h-4" />, value: "Structured", label: "Diagnostics to mock exams" },
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
                // Slightly taller cells on mobile so labels never clip against borders.
                "px-6 py-7 flex items-start gap-4 bg-background/60",
                i !== 0 ? "lg:border-l border-border" : "",
                i % 2 !== 0 ? "border-l border-border lg:border-l" : "",
                i >= 2 ? "border-t lg:border-t-0 border-border" : "",
              ].join(" ")}
            >
              <div className="w-9 h-9 rounded-lg bg-primary/5 text-primary flex items-center justify-center shrink-0">
                {s.icon}
              </div>
              <div className="min-w-0 flex flex-col gap-2">
                <div className="min-w-0 wrap-break-word text-xl font-semibold tracking-tight text-foreground leading-tight sm:text-2xl tabular-nums">
                  {s.value}
                </div>
                <div className="whitespace-normal pb-1 text-[11px] font-medium uppercase tracking-[0.14em] leading-relaxed text-muted-foreground sm:tracking-[0.18em]">
                  {s.label}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 rounded-3xl border border-border bg-card overflow-hidden divide-y divide-border">
          {programs.map((cap, idx) => (
            <motion.article
              key={cap.anchorId}
              id={cap.anchorId}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: idx * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="scroll-mt-36 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 p-8 lg:p-14 group"
            >
              <div className="lg:col-span-3 flex lg:flex-col gap-6 items-start">
                <div className="flex items-baseline gap-4">
                  <span className="text-[11px] font-medium tracking-[0.18em] uppercase text-muted-foreground tabular-nums">
                    {cap.index} / {capabilityTotalDisplay}
                  </span>
                </div>
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl border border-border bg-background flex items-center justify-center text-foreground shadow-sm">
                    {cap.icon}
                  </div>
                  <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-accent ring-4 ring-card" />
                </div>
              </div>

              <div className="lg:col-span-5 flex flex-col">
                <h3 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground leading-tight">
                  {cap.title}
                </h3>
                <p className="mt-4 text-base text-muted-foreground leading-relaxed">{cap.description}</p>

                <dl className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-border">
                  <div>
                    <dt className="text-[11px] font-medium tracking-[0.18em] uppercase text-muted-foreground">
                      Engagement
                    </dt>
                    <dd className="mt-1.5 text-sm font-medium text-foreground">{cap.engagement}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-medium tracking-[0.18em] uppercase text-muted-foreground">
                      Duration
                    </dt>
                    <dd className="mt-1.5 text-sm font-medium text-foreground">{cap.duration}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-medium tracking-[0.18em] uppercase text-muted-foreground">
                      Team
                    </dt>
                    <dd className="mt-1.5 text-sm font-medium text-foreground">{cap.team}</dd>
                  </div>
                </dl>
              </div>

              <div className="lg:col-span-4">
                <div className="rounded-2xl bg-secondary/50 border border-border p-6 lg:p-7 h-full flex flex-col">
                  <div className="relative aspect-4/3 w-full flex-1 min-h-[200px] overflow-hidden rounded-xl border border-border bg-muted">
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
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </div>
  );
}
