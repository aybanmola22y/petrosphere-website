"use client";

import React from "react";
import {
  FiAlertTriangle,
  FiArrowUpRight,
  FiAward,
  FiClipboard,
  FiClock,
  FiFilm,
  FiGitMerge,
  FiLayers,
  FiPenTool,
  FiSearch,
  FiShield,
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

type Capability = {
  index: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  engagement: string;
  duration: string;
  team: string;
  /** Thematic preview for the right-hand panel (Unsplash, license: Unsplash) */
  previewImage: { src: string; alt: string };
};

const capabilities: Capability[] = [
  {
    index: "01",
    title: "HSE Management System",
    description:
      "Design, integrate, or mature your occupational health and safety management system so policies, roles, and field practices stay aligned — from governance charters to contractor oversight.",
    icon: <FiShield className="w-5 h-5" />,
    engagement: "Retainer or project",
    duration: "6 – 18 weeks",
    team: "Lead HSE consultant + specialists",
    previewImage: {
      src: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=880&q=80",
      alt: "Industrial team in safety gear reviewing operations on site",
    },
  },
  {
    index: "02",
    title: "Permit to Work System",
    description:
      "Stand up or refine your permit-to-work lifecycle — isolation standards, risk verification, digital or paper workflows, and supervisor competency — so high-risk tasks stay controlled and traceable.",
    icon: <FiClipboard className="w-5 h-5" />,
    engagement: "Project or program",
    duration: "4 – 14 weeks",
    team: "Process safety / HSE lead + PTW SME",
    previewImage: {
      src: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=880&q=80",
      alt: "Technician in a hard hat working with industrial equipment — controlled work context",
    },
  },
  {
    index: "03",
    title: "Accident Investigation",
    description:
      "Structured investigations with root-cause discipline — evidence preservation, witness methodology, barrier analysis, and corrective actions that hold up to regulatory or insurer scrutiny.",
    icon: <FiAlertTriangle className="w-5 h-5" />,
    engagement: "Per incident or retained capacity",
    duration: "1 – 4 weeks per mandate",
    team: "Lead investigator + technical specialists",
    previewImage: {
      src: "https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=880&q=80",
      alt: "Team collaborating over documents during a structured review",
    },
  },
  {
    index: "04",
    title: "HIRAC",
    description:
      "Hazard identification and risk assessment & control programs tailored to your sites — workshops, bowties or matrices, and operational controls that teams actually use.",
    icon: <FiTrendingUp className="w-5 h-5" />,
    engagement: "Workshop series or site rollout",
    duration: "3 – 10 weeks",
    team: "Risk facilitator + subject SMEs",
    previewImage: {
      src: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=880&q=80",
      alt: "Analytics dashboard and charts supporting hazard and risk assessment",
    },
  },
  {
    index: "05",
    title: "SIMOPS",
    description:
      "Simultaneous operations planning — interface agreements, clash scenarios, communication protocols, and combined permits — so parallel crews and disciplines don’t create unmanaged interference risk.",
    icon: <FiGitMerge className="w-5 h-5" />,
    engagement: "Campaign or turnaround window",
    duration: "2 – 8 weeks",
    team: "Operations integration lead + HSE liaison",
    previewImage: {
      src: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=880&q=80",
      alt: "Cross-functional team coordinating work in an office setting",
    },
  },
  {
    index: "06",
    title: "Site Inspection, Audit and Review",
    description:
      "Independent field inspections and systems audits — structured observations, compliance sampling, and pragmatic corrective actions that tighten execution without slowing production unnecessarily.",
    icon: <FiSearch className="w-5 h-5" />,
    engagement: "Scheduled audits or spot campaigns",
    duration: "Ongoing or per visit cycle",
    team: "Lead auditor + discipline inspectors",
    previewImage: {
      src: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=880&q=80",
      alt: "Inspector with hard hat and clipboard on a site walkthrough",
    },
  },
  {
    index: "07",
    title: "QMS, EMS, OHSMS Certification",
    description:
      "Management-system certification readiness for quality, environmental, and occupational health & safety — documentation harmonisation, internal audit programs, and certification-body preparedness.",
    icon: <FiAward className="w-5 h-5" />,
    engagement: "Phased readiness program",
    duration: "12 – 36 weeks",
    team: "Lead auditor / MR support + SMEs",
    previewImage: {
      src: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=880&q=80",
      alt: "Open notebook and study materials suggesting standards and certification preparation",
    },
  },
  {
    index: "08",
    title: "Architectural Design",
    description:
      "Concept through technical design support for facilities that must respect safety circulation, statutory setbacks, and operational adjacencies — coordinated inputs for construction and stakeholder approvals.",
    icon: <FiPenTool className="w-5 h-5" />,
    engagement: "Design sprint or full architectural brief",
    duration: "8 – 24 weeks",
    team: "Architectural lead + draft technicians",
    previewImage: {
      src: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=880&q=80",
      alt: "Architectural blueprints and drawing tools on a desk",
    },
  },
  {
    index: "09",
    title: "AutoCAD",
    description:
      "Production drafting and drawing hygiene — layers, blocks, plotting standards, and as-built discipline — so project teams share consistent CAD deliverables across disciplines.",
    icon: <FiLayers className="w-5 h-5" />,
    engagement: "Per package or embedded support",
    duration: "2 – 12 weeks",
    team: "CAD lead + draft technicians",
    previewImage: {
      src: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=880&q=80",
      alt: "Bright open workplace with laptop and documents — drafting and design collaboration",
    },
  },
  {
    index: "10",
    title: "Animation of Architectural Designs",
    description:
      "Motion studies and visual walkthroughs from approved designs — stakeholder alignment, marketing-quality visuals, or review aids before capital commitment.",
    icon: <FiFilm className="w-5 h-5" />,
    engagement: "Per animation package",
    duration: "3 – 10 weeks",
    team: "Visualization lead + modellers",
    previewImage: {
      src: "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?auto=format&fit=crop&w=880&q=80",
      alt: "Abstract 3D architectural visualization and light",
    },
  },
];

const capabilityTotalDisplay = String(capabilities.length).padStart(2, "0");

const headerStats = [
  { icon: <FiUsers className="w-4 h-4" />, value: "120+", label: "Active engagements" },
  { icon: <FiTrendingUp className="w-4 h-4" />, value: "98%", label: "Audit pass rate" },
  { icon: <FiClock className="w-4 h-4" />, value: "15 yrs", label: "Field experience" },
  { icon: <FiShield className="w-4 h-4" />, value: "Zero", label: "Recordable incidents (2025)" },
];

export default function Services() {
  return (
    <div className="min-h-screen bg-background pt-32 pb-24 md:pb-32">
      <div className="container mx-auto px-6 mb-24 md:mb-32">
        <SectionHeader
          eyebrow="Consulting & Advisory"
          title="Strategic safety services."
          description="We embed with your operations to audit, align, and engineer uncompromising safety frameworks tailored to your specific industry requirements."
        />

        {/* Header stats strip */}
        <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 rounded-2xl border border-border overflow-hidden bg-secondary/30">
          {headerStats.map((s, i) => (
            <div
              key={s.label}
              className={[
                "p-6 flex items-start gap-4 bg-background/60",
                i !== 0 ? "lg:border-l border-border" : "",
                i % 2 !== 0 ? "border-l border-border lg:border-l" : "",
                i >= 2 ? "border-t lg:border-t-0 border-border" : "",
              ].join(" ")}
            >
              <div className="w-9 h-9 rounded-lg bg-primary/5 text-primary flex items-center justify-center shrink-0">
                {s.icon}
              </div>
              <div className="min-w-0">
                <div className="text-2xl font-semibold tracking-tight text-foreground tabular-nums leading-none">
                  {s.value}
                </div>
                <div className="text-[11px] font-medium tracking-[0.18em] uppercase text-muted-foreground mt-2">
                  {s.label}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Capability rows */}
        <div className="mt-20 rounded-3xl border border-border bg-card overflow-hidden divide-y divide-border">
          {capabilities.map((cap, idx) => (
            <motion.article
              key={cap.index}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: idx * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 p-8 lg:p-14 group"
            >
              {/* Left rail: index + icon mark */}
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

              {/* Middle: title + description + meta */}
              <div className="lg:col-span-5 flex flex-col">
                <h3 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground leading-tight">
                  {cap.title}
                </h3>
                <p className="mt-4 text-base text-muted-foreground leading-relaxed">
                  {cap.description}
                </p>

                <dl className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-border">
                  <div>
                    <dt className="text-[11px] font-medium tracking-[0.18em] uppercase text-muted-foreground">
                      Engagement
                    </dt>
                    <dd className="mt-1.5 text-sm font-medium text-foreground">
                      {cap.engagement}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-medium tracking-[0.18em] uppercase text-muted-foreground">
                      Duration
                    </dt>
                    <dd className="mt-1.5 text-sm font-medium text-foreground">
                      {cap.duration}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-medium tracking-[0.18em] uppercase text-muted-foreground">
                      Team
                    </dt>
                    <dd className="mt-1.5 text-sm font-medium text-foreground">
                      {cap.team}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Right: visual preview panel */}
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
