"use client";

import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { AnimatePresence, motion, useInView } from "framer-motion";
import {
  FiTarget,
  FiEye,
  FiHeart,
  FiShield,
  FiActivity,
  FiAward,
  FiArrowUpRight,
} from "react-icons/fi";
import {
  BuildingLibraryIcon,
  BuildingOffice2Icon,
  CheckBadgeIcon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/react/24/outline";

import { milestones } from "@/data/mockData";
import { cn } from "@/lib/utils";

const aboutImg = "/background.jpg";

/**
 * Exact pin from Google Maps listing:
 * https://maps.app.goo.gl/eAcvZZkJXcND3za29
 */
const HQ_LAT = 9.7605689;
const HQ_LON = 118.7469315;
const HQ_GOOGLE_LISTING = "https://maps.app.goo.gl/eAcvZZkJXcND3za29";
const HQ_MAP_VIEW = `https://www.openstreetmap.org/?mlat=${HQ_LAT}&mlon=${HQ_LON}#map=16/${HQ_LAT}/${HQ_LON}`;
const HQ_GOOGLE_DIRECTIONS = `https://www.google.com/maps/dir/?api=1&destination=${HQ_LAT},${HQ_LON}`;

const HISTORY_STOP_MS = 6500;

type HistoryStopDetail = {
  src: string;
  alt: string;
  summary: string;
  facts: { label: string; value: string }[];
};

const historyStops: Record<string, HistoryStopDetail> = {
  "2013": {
    src: "https://images.unsplash.com/photo-1544531586-fde5298cdd40?auto=format&fit=crop&w=1400&q=80",
    alt: "Instructor leading a BOSH, COSH, and ACLS training class",
    summary:
      "Registered with the SEC on July 1, 2013 and opened in Puerto Princesa. Petrosphere began with occupational safety and emergency response training — BOSH SO1/SO2, COSH, and ACLS — and a founding brief that still holds: every worker returns home safely.",
    facts: [
      { label: "Registered", value: "July 1, 2013" },
      { label: "Headquarters", value: "Puerto Princesa, Palawan" },
      { label: "First focus", value: "BOSH SO1/SO2, COSH, ACLS" },
    ],
  },
  "2015": {
    src: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1400&q=80",
    alt: "Safety training classroom session",
    summary:
      "The company moved beyond a single site and opened three new training centers, taking the same safety programs to more teams across the region.",
    facts: [
      { label: "New centers", value: "3 training sites" },
      { label: "Reach", value: "Regional Philippines" },
      { label: "Delivery", value: "In-person cohorts" },
    ],
  },
  "2018": {
    src: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1400&q=80",
    alt: "Emergency response and ACLS medical training",
    summary:
      "Course offerings earned international accreditation, shifting Petrosphere from a local training house to a recognised institution with a certified catalogue.",
    facts: [
      { label: "Scope", value: "International course approvals" },
      { label: "Outcome", value: "Accredited catalogue" },
      { label: "Position", value: "Local to recognised provider" },
    ],
  },
  "2023": {
    src: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1400&q=80",
    alt: "Learners in a digital safety training session",
    summary:
      "The e-learning platform went live, so cohorts can train on-site, in class, or online without losing the same Petrosphere standard.",
    facts: [
      { label: "Launch", value: "E-learning platform" },
      { label: "Access", value: "On-site, classroom, online" },
      { label: "Continuity", value: "Same programs, more formats" },
    ],
  },
};

const AboutHeadquartersMap = dynamic(
  () => import("@/components/maps/AboutHeadquartersMap").then((mod) => mod.AboutHeadquartersMap),
  {
    ssr: false,
    loading: () => (
      <div
        className="absolute inset-0 z-0 flex items-center justify-center bg-muted animate-pulse"
        aria-hidden
      >
        <span className="text-xs font-medium text-muted-foreground">Loading map…</span>
      </div>
    ),
  },
);

function HistoricalRecordSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { amount: 0.35 });
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const current = milestones[active] ?? milestones[0];
  const detail = current ? historyStops[current.year] : undefined;
  const stopCount = milestones.length;
  const progress = stopCount <= 1 ? 0 : (active / (stopCount - 1)) * 100;
  const railStart = 100 / (2 * stopCount);
  const railEnd = 100 - railStart;
  const fillTo = railStart + (progress / 100) * (railEnd - railStart);

  useEffect(() => {
    if (!inView || paused || stopCount < 2) return;
    const id = window.setTimeout(() => {
      setActive((index) => (index + 1) % stopCount);
    }, HISTORY_STOP_MS);
    return () => window.clearTimeout(id);
  }, [active, inView, paused, stopCount]);

  return (
    <section ref={sectionRef} className="pb-16 md:pb-20">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-3xl"
      >
        <p className="text-sm font-medium text-primary">Timeline</p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#00044a] sm:text-4xl">
          Historical Record
        </h2>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
          Key milestones that shaped Petrosphere — from founding to regional growth,
          international accreditation, and digital learning.
        </p>
      </motion.div>

      <div
        className="mt-10 lg:mt-12"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className="grid items-start gap-8 lg:grid-cols-12 lg:gap-12">
          <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-muted lg:col-span-7">
            <div className="relative aspect-[16/10]">
              {milestones.map((milestone, idx) => {
                const slide = historyStops[milestone.year];
                return (
                  <div
                    key={milestone.year}
                    className={cn(
                      "absolute inset-0 transition-opacity duration-700 ease-out",
                      idx === active ? "opacity-100" : "opacity-0",
                    )}
                    aria-hidden={idx !== active}
                  >
                    {slide ? (
                      <Image
                        src={slide.src}
                        alt={idx === active ? slide.alt : ""}
                        fill
                        className="h-full w-full object-cover object-center"
                        sizes="(max-width: 1024px) 100vw, 60vw"
                        priority={idx === 0}
                      />
                    ) : null}
                  </div>
                );
              })}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-[#00044a] via-[#00044a]/55 to-transparent px-5 pb-5 pt-16 sm:px-6">
                <p className="text-4xl font-bold tabular-nums tracking-tight text-white sm:text-5xl">
                  {current?.year}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:col-span-5" aria-live="polite">
            <AnimatePresence mode="wait">
              <motion.div
                key={current?.year}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.28 }}
                className="flex flex-1 flex-col"
              >
                <h3 className="text-2xl font-semibold tracking-tight text-[#00044a] md:text-3xl">
                  {current?.title}
                </h3>
                <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-[1.05rem]">
                  {detail?.summary ?? current?.description}
                </p>
                {detail?.facts?.length ? (
                  <dl className="mt-8 divide-y divide-[#00044a]/10 border-y border-[#00044a]/10 md:mt-10">
                    {detail.facts.map((fact) => (
                      <div
                        key={fact.label}
                        className="flex items-baseline justify-between gap-4 py-3"
                      >
                        <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                          {fact.label}
                        </dt>
                        <dd className="text-right text-sm font-semibold tracking-tight text-[#00044a]">
                          {fact.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                ) : null}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div
          className="relative mt-10"
          role="tablist"
          aria-label="Historical record stops"
        >
          <div className="absolute top-[7px] right-0 left-0 h-px bg-[#00044a]/15" aria-hidden />
          <motion.div
            className="absolute top-[7px] left-0 h-px bg-[#00044a]"
            initial={false}
            animate={{ width: `${fillTo}%` }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            aria-hidden
          />
          <div className="relative grid" style={{ gridTemplateColumns: `repeat(${stopCount}, minmax(0, 1fr))` }}>
            {milestones.map((milestone, idx) => {
              const selected = idx === active;
              const passed = idx < active;

              return (
                <button
                  key={milestone.year}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setActive(idx)}
                  className="flex flex-col items-center gap-2 pt-0.5"
                >
                  <span
                    className={cn(
                      "relative z-10 block rounded-full border-2 transition-all",
                      selected &&
                        "size-4 border-primary bg-primary shadow-[0_0_0_4px_hsl(42_72%_52%_/_0.22)]",
                      passed && !selected && "size-3.5 border-[#00044a] bg-[#00044a]",
                      !passed && !selected && "size-3.5 border-[#00044a]/30 bg-background",
                    )}
                    aria-hidden
                  />
                  <span
                    className={cn(
                      "text-sm font-semibold tabular-nums tracking-tight",
                      selected ? "text-[#00044a]" : "text-[#00044a]/45",
                    )}
                  >
                    {milestone.year}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function ContactSection() {
  const [manilaClock, setManilaClock] = useState<string | null>(null);

  useEffect(() => {
    const tick = () =>
      setManilaClock(
        new Intl.DateTimeFormat("en-US", {
          timeZone: "Asia/Manila",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }).format(new Date()),
      );
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <section id="contact" className="scroll-mt-28 border-t border-[#00044a]/10 pt-16 md:pt-24">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-3xl"
      >
        <p className="text-sm font-medium text-primary">Contact</p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#00044a] sm:text-4xl">
          Get in touch.
        </h2>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
          Visit the Puerto Princesa office, call the desk, or write to admissions and sales.
        </p>
      </motion.div>

      <div className="mt-12 grid gap-12 lg:grid-cols-12 lg:items-start lg:gap-16">
        <dl className="divide-y divide-[#00044a]/10 lg:col-span-5">
          <div className="pb-7">
            <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Office
            </dt>
            <dd className="mt-3 text-lg font-semibold tracking-tight text-[#00044a]">
              Petrosphere Incorporated
            </dd>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Puerto Princesa, Palawan, Philippines
            </p>
            <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm font-medium text-[#00044a]">
              <a
                href={HQ_GOOGLE_DIRECTIONS}
                target="_blank"
                rel="noopener noreferrer"
                className="underline-offset-4 hover:text-primary hover:underline"
              >
                Directions
              </a>
              <a
                href={HQ_GOOGLE_LISTING}
                target="_blank"
                rel="noopener noreferrer"
                className="underline-offset-4 hover:text-primary hover:underline"
              >
                Google listing
              </a>
            </p>
          </div>

          <div className="py-7">
            <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Hours
            </dt>
            <dd className="mt-3 text-lg font-semibold tracking-tight text-[#00044a]">
              Monday–Friday, 9:00 AM – 5:00 PM
            </dd>
            <p className="mt-1 text-sm text-muted-foreground">
              Philippine time (UTC+8)
              {manilaClock ? ` · ${manilaClock}` : ""}
            </p>
          </div>

          <div className="py-7">
            <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Phone
            </dt>
            <dd className="mt-3">
              <a
                href="tel:+639758533144"
                className="text-2xl font-semibold tabular-nums tracking-tight text-[#00044a] transition-colors hover:text-primary"
              >
                +63 975 853 3144
              </a>
            </dd>
            <p className="mt-1 text-sm text-muted-foreground">General &amp; admissions</p>
          </div>

          <div className="pt-7">
            <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Email
            </dt>
            <dd className="mt-3 space-y-4">
              <div>
                <a
                  href="mailto:info@petrosphere.com.ph"
                  className="break-all text-lg font-semibold tracking-tight text-[#00044a] transition-colors hover:text-primary"
                >
                  info@petrosphere.com.ph
                </a>
                <p className="mt-1 text-sm text-muted-foreground">General &amp; sales</p>
              </div>
              <div>
                <a
                  href="mailto:sales@petrosphere.com.ph"
                  className="break-all text-lg font-semibold tracking-tight text-[#00044a] transition-colors hover:text-primary"
                >
                  sales@petrosphere.com.ph
                </a>
                <p className="mt-1 text-sm text-muted-foreground">Training intake</p>
              </div>
            </dd>
          </div>
        </dl>

        <figure className="lg:col-span-7">
          <div className="overflow-hidden rounded-2xl border border-border/80 bg-muted">
            <div className="relative aspect-[4/3] min-h-[260px] sm:min-h-[340px] lg:aspect-auto lg:h-[28rem]">
              <AboutHeadquartersMap lat={HQ_LAT} lon={HQ_LON} />
            </div>
          </div>
          <figcaption className="mt-3 text-sm text-muted-foreground">
            Registered office · Puerto Princesa, Palawan
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

export default function About() {
  return (
    <div className="min-h-screen bg-background pt-32 pb-32">
      <div className="container mx-auto px-6">
        {/* Intro — editorial, less template-like */}
        <section className="mb-24 md:mb-32">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-3xl"
          >
            <p className="text-sm font-medium text-primary">About us</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#00044a] sm:text-4xl md:text-[2.65rem] md:leading-[1.15]">
              Setting the global standard for industrial competence.
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
              Petrosphere Incorporated is a training, review, and consultancy company based in
              Puerto Princesa. We help teams in construction, mining, manufacturing, healthcare,
              and service industries work safer — and stay competent.
            </p>
          </motion.div>

          <motion.figure
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="mt-10 overflow-hidden rounded-2xl border border-border/80 bg-muted"
          >
            <img
              src={aboutImg}
              alt="Petrosphere Incorporated organization group photo"
              className="aspect-[16/10] w-full object-cover object-[center_40%] sm:aspect-[21/9]"
            />
          </motion.figure>

          <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">
            <div className="space-y-5 text-base leading-[1.75] text-muted-foreground lg:col-span-7 sm:text-[1.05rem]">
              <p>
                The company was registered with the Securities and Exchange Commission on July 1,
                2013. We began with oil and gas training, then became an accredited Safety Training
                Organization in 2017 under the Occupational Safety and Health Center (OSHC), a
                Department of Labor and Employment (DOLE) agency.
              </p>
              <p>
                Petrosphere is also accredited by the Professional Regulation Commission (PRC) as a
                Continuing Professional Development Provider, the International Association of
                Drilling Contractors (IADC) in the United States, and the Professional Evaluation
                and Certification Board (PECB) in Canada. Approvals with IOSH UK and TESDA are
                still in progress.
              </p>
            </div>

            <blockquote className="border-l-2 border-primary pl-5 lg:col-span-5 lg:pl-6">
              <p className="text-xl font-semibold leading-snug tracking-tight text-[#00044a] sm:text-[1.35rem]">
                Every worker returns home safely — while operating at peak efficiency.
              </p>
              <footer className="mt-4 text-sm text-muted-foreground">
                Founding principle · still the measure for every program we run.
              </footer>
            </blockquote>
          </div>

          <dl className="mt-12 overflow-hidden rounded-2xl border border-border/80 bg-white">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  label: "Incorporated",
                  value: "July 1, 2013",
                  note: "SEC registered corporation",
                  icon: <BuildingLibraryIcon className="h-5 w-5" />,
                },
                {
                  label: "Headquarters",
                  value: "Puerto Princesa",
                  note: "Palawan, Philippines",
                  icon: <BuildingOffice2Icon className="h-5 w-5" />,
                },
                {
                  label: "DOLE–OSHC STO",
                  value: "Since 2017",
                  note: "Safety Training Organization",
                  icon: <CheckBadgeIcon className="h-5 w-5" />,
                },
                {
                  label: "Also accredited by",
                  value: "PRC, IADC, PECB",
                  note: "Local and international partners",
                  icon: <ClipboardDocumentCheckIcon className="h-5 w-5" />,
                },
              ].map((item, idx) => (
                <div
                  key={item.label}
                  className={cn(
                    "px-5 py-6 sm:px-6 sm:py-7",
                    idx > 0 && "border-t border-border/70",
                    (idx === 1 || idx === 3) && "sm:border-l sm:border-border/70",
                    idx === 1 && "sm:border-t-0",
                    idx > 0 && "lg:border-l lg:border-t-0 lg:border-border/70",
                  )}
                >
                  <dt className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="text-[#00044a]/55" aria-hidden>
                      {item.icon}
                    </span>
                    {item.label}
                  </dt>
                  <dd className="mt-3 text-lg font-semibold tracking-tight text-[#00044a]">
                    {item.value}
                  </dd>
                  <p className="mt-1 text-sm text-muted-foreground">{item.note}</p>
                </div>
              ))}
            </div>
          </dl>
        </section>

        {/* Mission & Vision */}
        <section className="relative mb-32">
          <div className="rounded-3xl bg-secondary/40 border border-border overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12">
              {/* Left rail */}
              <div className="lg:col-span-3 p-10 lg:p-12 lg:border-r border-border bg-background/40">
                <div className="flex items-center gap-2 text-xs font-medium tracking-[0.18em] uppercase text-muted-foreground mb-4">
                  <span className="w-6 h-px bg-foreground/30" />
                  Principles
                </div>
                <h3 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground leading-tight">
                  What we stand for, and what we are building toward.
                </h3>
                <p className="mt-6 text-sm text-muted-foreground leading-relaxed">
                  Mission, vision, and values guide every program we deliver and every certification we issue.
                </p>
              </div>

              {/* Right column: mission, vision, values */}
              <div className="lg:col-span-9 divide-y divide-border">
                {[
                  {
                    index: "01",
                    label: "Mission",
                    statement: "To provide quality training, review, and consultancy services to clients seeking growth and development.",
                    accent: <FiTarget className="w-5 h-5" />,
                  },
                  {
                    index: "02",
                    label: "Vision",
                    statement: "To be the leading institution providing one-stop-shop services on becoming better, safer and healthier nation.",
                    accent: <FiEye className="w-5 h-5" />,
                  },
                  {
                    index: "03",
                    label: "Values",
                    bullets: [
                      "Committed to Quality and Excellence",
                      "Respect for Diversity and Equality",
                      "Care for Client, Community, and the Environment",
                      "Passion for Service",
                    ],
                    accent: <FiHeart className="w-5 h-5" />,
                  },
                ].map((item, idx) => (
                  <motion.div
                    key={item.index}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.6, delay: idx * 0.1, ease: [0.22, 1, 0.36, 1] }}
                    className="p-10 lg:p-14 grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-start"
                  >
                    <div className="md:col-span-3 flex md:flex-col items-baseline md:items-start gap-3">
                      <span className="text-5xl md:text-6xl font-light tracking-tight text-foreground/15 tabular-nums leading-none">
                        {item.index}
                      </span>
                      <div className="flex items-center gap-2 text-xs font-medium tracking-[0.18em] uppercase text-muted-foreground">
                        <span className="text-foreground/60">{item.accent}</span>
                        {item.label}
                      </div>
                    </div>
                    <div className="md:col-span-9">
                      {"bullets" in item && item.bullets ? (
                        <ul className="list-disc space-y-3 pl-6 marker:text-primary md:space-y-4 md:pl-7 lg:space-y-5">
                          {item.bullets.map((line) => (
                            <li
                              key={line}
                              className="text-2xl font-medium leading-snug tracking-tight text-foreground md:text-[28px] lg:text-[30px] lg:leading-snug pl-1"
                            >
                              {line}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-2xl font-medium leading-tight tracking-tight text-foreground md:text-[28px] lg:text-[32px]">
                          {"statement" in item ? item.statement : ""}
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}

                {/* Pillar strip */}
                <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border bg-background/40">
                  {[
                    { icon: <FiShield className="w-4 h-4" />, label: "Zero-incident outcomes", value: "Every program" },
                    { icon: <FiActivity className="w-4 h-4" />, label: "Operational readiness", value: "Field-tested" },
                    { icon: <FiAward className="w-4 h-4" />, label: "Recognized certification", value: "Global standard" },
                  ].map((p) => (
                    <div key={p.label} className="p-6 lg:p-8 flex items-center gap-4">
                      <div className="w-9 h-9 rounded-lg bg-primary/5 text-primary flex items-center justify-center shrink-0">
                        {p.icon}
                      </div>
                      <div className="min-w-0">
                        <div className="text-[11px] font-medium tracking-[0.18em] uppercase text-muted-foreground">
                          {p.label}
                        </div>
                        <div className="text-sm font-semibold text-foreground mt-1 truncate">
                          {p.value}
                        </div>
                      </div>
                      <FiArrowUpRight className="ml-auto w-4 h-4 text-muted-foreground/60 shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Temporarily hidden — restore when timeline content is ready */}
        {/* <HistoricalRecordSection /> */}

        <ContactSection />
      </div>
    </div>
  );
}