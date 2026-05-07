"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FiAlertTriangle,
  FiArrowUpRight,
  FiBarChart2,
  FiCheck,
  FiCpu,
  FiFileText,
  FiFlag,
  FiLayers,
  FiMap,
  FiShieldOff,
  FiShield,
  FiUsers,
} from "react-icons/fi";

import { SectionHeader } from "@/components/ui/SectionHeader";

const FALLBACK_HERO_IMAGE =
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#0f172a" stop-opacity="0.06"/>
          <stop offset="1" stop-color="#0f172a" stop-opacity="0.14"/>
        </linearGradient>
        <pattern id="p" width="34" height="34" patternUnits="userSpaceOnUse">
          <path d="M0 34 L34 0" stroke="#0f172a" stroke-opacity="0.08" stroke-width="2"/>
        </pattern>
      </defs>
      <rect width="1600" height="900" fill="url(#g)"/>
      <rect width="1600" height="900" fill="url(#p)"/>
    </svg>`
  );

const highlights = [
  { icon: <FiShield className="w-4 h-4" />, label: "Risk-aligned controls", value: "Mapped to operations" },
  { icon: <FiCpu className="w-4 h-4" />, label: "Assessments & drills", value: "Practical and measurable" },
  { icon: <FiUsers className="w-4 h-4" />, label: "Executive-ready", value: "Clear reporting" },
  { icon: <FiFileText className="w-4 h-4" />, label: "Artifacts delivered", value: "Runbooks & templates" },
];

const capabilities = [
  {
    icon: <FiMap className="w-5 h-5" />,
    title: "Security program foundation",
    description:
      "Define ownership, operating rhythm, and the minimum control set your teams can sustain. We focus on clarity and adoption, not paper compliance.",
    bullets: [
      "Governance & RACI, meeting cadence, and KPI set",
      "Policy pack aligned to real workflows",
      "Control inventory and “what good looks like”",
    ],
  },
  {
    icon: <FiLayers className="w-5 h-5" />,
    title: "Controls mapping & readiness",
    description:
      "Translate risk into a prioritized backlog. Map controls to your environment (people, process, tech) and sequence what to fix first.",
    bullets: [
      "Gap assessment and prioritized remediation roadmap",
      "Identity / access, endpoint, and data handling checks",
      "Evidence plan that won’t slow operations",
    ],
  },
  {
    icon: <FiFlag className="w-5 h-5" />,
    title: "Incident readiness & exercises",
    description:
      "Make your first response repeatable. We run tabletop exercises that stress real scenarios: phishing, ransomware, credential leaks, and vendor compromise.",
    bullets: [
      "IR roles, escalation paths, and decision triggers",
      "Tabletop facilitation with after-action report",
      "Communication templates for leadership and stakeholders",
    ],
  },
  {
    icon: <FiBarChart2 className="w-5 h-5" />,
    title: "Executive reporting that lands",
    description:
      "Turn security effort into business language. We build a compact narrative leadership can approve: what’s at risk, what it costs, and what to do next.",
    bullets: ["One-page risk brief and quarterly update format", "Portfolio view: top risks, owners, due dates", "Metrics that can be collected consistently"],
  },
];

const process = [
  {
    title: "Discovery",
    description: "Align scope, systems, and stakeholders. Confirm constraints (tools, people, timelines).",
  },
  {
    title: "Assessment",
    description: "Review current controls, workflows, and exposure. Identify what matters and what’s missing.",
  },
  {
    title: "Roadmap",
    description: "Prioritize fixes into an actionable backlog with owners, effort bands, and timeframes.",
  },
  {
    title: "Enablement",
    description: "Workshops, templates, and exercises so the program runs after we step out.",
  },
];

const faqs = [
  {
    q: "Is this a technical penetration test?",
    a: "Not by default. This page covers advisory and readiness work. If you need penetration testing, we can scope it as a separate deliverable or partner with a certified testing team.",
  },
  {
    q: "Do you work with small teams?",
    a: "Yes. We tailor the control set to what your team can sustain. The goal is a program you can keep running, not a binder you never open.",
  },
  {
    q: "What do we receive at the end?",
    a: "A prioritized roadmap plus reusable artifacts (policies, runbooks, templates) and an executive-ready reporting pack.",
  },
];

export default function Cybersecurity() {
  return (
    <div className="min-h-screen bg-background pt-32 pb-24 md:pb-32">
      <div className="container mx-auto px-6 mb-24 md:mb-32">
        <SectionHeader
          eyebrow="Cybersecurity advisory"
          title="Information resilience for operational environments."
          description="Security program governance, controls mapping, tabletop exercises, and incident readiness workshops aligned to how your teams work — as a dedicated advisory track, independent from occupational safety consultancy."
        />

        <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 rounded-2xl border border-border overflow-hidden bg-secondary/30">
          {highlights.map((h, i) => (
            <div
              key={h.label}
              className={[
                "p-6 flex items-start gap-4 bg-background/60",
                i !== 0 ? "lg:border-l border-border" : "",
                i % 2 !== 0 ? "border-l border-border lg:border-l" : "",
                i >= 2 ? "border-t lg:border-t-0 border-border" : "",
              ].join(" ")}
            >
              <div className="w-9 h-9 rounded-lg bg-primary/5 text-primary flex items-center justify-center shrink-0">
                {h.icon}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold tracking-tight text-foreground">{h.value}</div>
                <div className="text-[11px] font-medium tracking-[0.18em] uppercase text-muted-foreground mt-2">
                  {h.label}
                </div>
              </div>
            </div>
          ))}
        </div>

        <section className="mt-16 md:mt-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            <div className="lg:col-span-5">
              <p className="text-[11px] font-medium tracking-[0.22em] uppercase text-muted-foreground">
                Where most teams get stuck
              </p>
              <h2 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight text-foreground leading-tight">
                Security work that ships — not shelfware.
              </h2>
              <p className="mt-5 text-base text-muted-foreground leading-relaxed max-w-xl">
                Many security initiatives fail because ownership is unclear, controls aren’t operationalized, and
                incident response is improvised. We help you set a sustainable baseline, prioritize work, and practice
                response so you can reduce risk with the team you have.
              </p>
              <div className="mt-8 grid w-full max-w-xl grid-cols-1 gap-4">
                <div className="relative aspect-16/10 overflow-hidden rounded-3xl border border-border bg-secondary/30">
                  <img
                    src="https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&w=1600&q=80"
                    alt="Cybersecurity monitoring and threat analysis on screens"
                    className="absolute inset-0 h-full w-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      const img = e.currentTarget;
                      if (img.src !== FALLBACK_HERO_IMAGE) img.src = FALLBACK_HERO_IMAGE;
                    }}
                  />
                  <div
                    className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/35 via-transparent to-transparent"
                    aria-hidden
                  />
                </div>
                <div className="relative aspect-16/10 overflow-hidden rounded-3xl border border-border bg-secondary/30">
                  <img
                    src="https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?auto=format&fit=crop&w=1600&q=80"
                    alt="Cybersecurity concept: secure access and protection"
                    className="absolute inset-0 h-full w-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      const img = e.currentTarget;
                      if (img.src !== FALLBACK_HERO_IMAGE) img.src = FALLBACK_HERO_IMAGE;
                    }}
                  />
                  <div
                    className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/30 via-transparent to-transparent"
                    aria-hidden
                  />
                </div>
              </div>
            </div>
            <div className="lg:col-span-7">
              <div className="rounded-3xl border border-border bg-card overflow-hidden divide-y divide-border">
                {capabilities.map((c) => (
                  <div key={c.title} className="p-8 lg:p-10 grid grid-cols-1 md:grid-cols-12 gap-6">
                    <div className="md:col-span-3 flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl border border-border bg-secondary/50 flex items-center justify-center text-foreground">
                        {c.icon}
                      </div>
                    </div>
                    <div className="md:col-span-9">
                      <h3 className="text-xl md:text-2xl font-semibold tracking-tight text-foreground">{c.title}</h3>
                      <p className="mt-3 text-base text-muted-foreground leading-relaxed">{c.description}</p>
                      <ul className="mt-5 grid gap-2">
                        {c.bullets.map((b) => (
                          <li key={b} className="flex items-start gap-3 text-sm text-foreground">
                            <span className="mt-0.5 w-5 h-5 rounded-md bg-secondary border border-border flex items-center justify-center shrink-0 text-foreground/70">
                              <FiCheck className="w-3 h-3" />
                            </span>
                            <span className="leading-snug">{b}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-16 md:mt-20 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
          <div className="lg:col-span-5">
            <p className="text-[11px] font-medium tracking-[0.22em] uppercase text-muted-foreground">How it runs</p>
            <h2 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight text-foreground leading-tight">
              A clear engagement flow.
            </h2>
            <p className="mt-5 text-base text-muted-foreground leading-relaxed max-w-xl">
              We keep engagements simple: understand your environment, assess what’s real, prioritize the work, then
              enable your team to sustain it. No jargon walls, no unrealistic control catalogs.
            </p>
          </div>
          <div className="lg:col-span-7">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {process.map((p) => (
                <div key={p.title} className="rounded-2xl border border-border bg-card p-6">
                  <h3 className="text-base font-semibold text-foreground">{p.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{p.description}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-2xl border border-border bg-secondary/30 p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/5 text-primary flex items-center justify-center shrink-0">
                  <FiAlertTriangle className="w-4 h-4" aria-hidden />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">Good to know</p>
                  <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                    If you’re currently responding to an incident, we can prioritize readiness and communications
                    first, then backfill the broader security program work.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-16 md:mt-20">
          <div className="rounded-3xl border border-border bg-card overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 p-8 lg:p-14">
              <div className="lg:col-span-4 flex flex-col gap-5">
                <div className="w-16 h-16 rounded-2xl border border-border bg-secondary/50 flex items-center justify-center text-foreground">
                  <FiShieldOff className="w-5 h-5" aria-hidden />
                </div>
                <p className="text-[11px] font-medium tracking-[0.22em] uppercase text-muted-foreground">
                  Outcomes you can run
                </p>
              </div>
              <div className="lg:col-span-8">
                <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground">
                  Practical artifacts, not just advice.
                </h2>
                <p className="mt-4 text-base text-muted-foreground leading-relaxed max-w-2xl">
                  Your team leaves with templates and formats they can reuse: governance, response playbooks, and
                  reporting. We also provide a prioritized backlog so next steps are obvious.
                </p>
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {faqs.map((f) => (
                    <div key={f.q} className="rounded-2xl border border-border bg-background/60 p-6">
                      <p className="text-sm font-semibold text-foreground">{f.q}</p>
                      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
