"use client";

import React from "react";
import {
  FiActivity,
  FiAlertTriangle,
  FiArrowUpRight,
  FiAward,
  FiCheckSquare,
  FiClipboard,
  FiClock,
  FiGitMerge,
  FiGlobe,
  FiHeart,
  FiMessageCircle,
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
    title: "Safety Culture Assessment",
    description:
      "Measure how people really work — leadership visibility, reporting climate, stop-work confidence, and peer norms — then turn findings into a practical culture improvement roadmap.",
    icon: <FiUsers className="w-5 h-5" />,
    engagement: "Assessment + improvement roadmap",
    duration: "4 – 12 weeks",
    team: "Culture lead + site facilitators",
    previewImage: {
      src: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=880&q=80",
      alt: "Team collaborating in a workshop setting",
    },
  },
  {
    index: "09",
    title: "Process Safety Audit",
    description:
      "Independent review of process safety barriers — MOC, mechanical integrity, operating procedures, and critical controls — with prioritized findings for high-hazard operations.",
    icon: <FiActivity className="w-5 h-5" />,
    engagement: "Site or unit audit campaign",
    duration: "3 – 10 weeks",
    team: "Process safety auditor + discipline SMEs",
    previewImage: {
      src: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=880&q=80",
      alt: "Industrial process equipment and technician in protective gear",
    },
  },
  {
    index: "10",
    title: "Health and Wellness",
    description:
      "Workplace health and wellness programs that fit your operations — fitness-to-work, fatigue awareness, ergonomics, and wellbeing initiatives that support safer, more resilient crews.",
    icon: <FiHeart className="w-5 h-5" />,
    engagement: "Program design or retained support",
    duration: "6 – 20 weeks",
    team: "Occupational health advisor + HSE liaison",
    previewImage: {
      src: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=880&q=80",
      alt: "People engaging in a workplace wellness activity",
    },
  },
  {
    index: "11",
    title: "Mental Health Awareness",
    description:
      "Practical mental health awareness for supervisors and teams — stigma reduction, early recognition, peer support pathways, and referral options aligned with Philippine workplace realities.",
    icon: <FiMessageCircle className="w-5 h-5" />,
    engagement: "Awareness sessions or full program",
    duration: "2 – 8 weeks",
    team: "Wellbeing facilitator + HR/HSE partners",
    previewImage: {
      src: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=880&q=80",
      alt: "Supportive one-on-one conversation in a professional setting",
    },
  },
  {
    index: "12",
    title: "Safety Program Audit",
    description:
      "Audit your OSH program against DOLE and international benchmarks — policy coverage, implementation evidence, contractor control, and corrective-action closure discipline.",
    icon: <FiCheckSquare className="w-5 h-5" />,
    engagement: "Full program audit or focused modules",
    duration: "3 – 8 weeks",
    team: "Lead OSH auditor + compliance specialist",
    previewImage: {
      src: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=880&q=80",
      alt: "Auditor reviewing documents and checklists at a desk",
    },
  },
  {
    index: "13",
    title: "Environmental Impact Assessment",
    description:
      "DENR-aligned EIA support from screening through ECC pathways — scoping, baseline studies, impact analysis, mitigation planning, and stakeholder facilitation.",
    icon: <FiGlobe className="w-5 h-5" />,
    engagement: "Project EIA or supplemental studies",
    duration: "8 – 36 weeks",
    team: "EIA lead + environmental specialists",
    previewImage: {
      src: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=880&q=80",
      alt: "Forest canopy and natural landscape representing environmental stewardship",
    },
  },
];

const capabilityTotalDisplay = String(capabilities.length).padStart(2, "0");

const headerStats = [
  { icon: <FiUsers className="w-4 h-4" />, value: "120+", label: "Active engagements" },
  { icon: <FiTrendingUp className="w-4 h-4" />, value: "98%", label: "Audit pass rate" },
  { icon: <FiClock className="w-4 h-4" />, value: "15 yrs", label: "Field experience" },
  { icon: <FiShield className="w-4 h-4" />, value: "Zero", label: "Recordable incidents" },
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

        {/* Capability rows */}
        <div className="mt-20 space-y-6 md:space-y-8">
          {capabilities.map((cap, idx) => (
            <motion.article
              key={cap.index}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: Math.min(idx * 0.06, 0.3), ease: [0.22, 1, 0.36, 1] }}
              className="group overflow-hidden rounded-3xl border border-border bg-card"
            >
              <div className="grid grid-cols-1 gap-0 lg:grid-cols-12 lg:items-stretch">
                {/* Left rail: index + icon */}
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

                {/* Middle: copy + meta */}
                <div className="flex flex-col justify-center px-6 py-8 sm:px-8 lg:col-span-6 lg:px-10 lg:py-10">
                  <h3 className="text-2xl font-semibold tracking-tight text-foreground leading-tight md:text-3xl">
                    {cap.title}
                  </h3>
                  <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
                    {cap.description}
                  </p>

                  <dl className="mt-8 grid grid-cols-1 gap-0 overflow-hidden rounded-2xl border border-border bg-secondary/25 sm:grid-cols-3">
                    {(
                      [
                        ["Engagement", cap.engagement],
                        ["Duration", cap.duration],
                        ["Team", cap.team],
                      ] as const
                    ).map(([label, value], metaIdx) => (
                      <div
                        key={label}
                        className={[
                          "min-w-0 px-5 py-4",
                          metaIdx > 0 ? "border-t border-border sm:border-t-0 sm:border-l" : "",
                        ].join(" ")}
                      >
                        <dt className="text-[10px] font-medium tracking-[0.16em] uppercase text-muted-foreground">
                          {label}
                        </dt>
                        <dd className="mt-2 text-sm font-medium leading-snug text-foreground break-words">
                          {value}
                        </dd>
                      </div>
                    ))}
                  </dl>

                  <div className="mt-6">
                    <Link
                      href="/about#contact"
                      className="inline-flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-primary/80"
                    >
                      Discuss this service
                      <FiArrowUpRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>

                {/* Right: image — full-bleed in its column, no nested padding card */}
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
