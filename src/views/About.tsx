"use client";

import React from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import {
  FiTarget,
  FiEye,
  FiHeart,
  FiShield,
  FiActivity,
  FiAward,
  FiArrowUpRight,
  FiExternalLink,
  FiPhone,
  FiMail,
  FiClock,
} from "react-icons/fi";

import { milestones } from "@/data/mockData";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/button";

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

export default function About() {
  return (
    <div className="min-h-screen bg-background pt-32 pb-32">
      <div className="container mx-auto px-6">
        {/* Intro */}
        <div className="mb-20">
             <SectionHeader 
               eyebrow="The Institute"
               title="Setting the global standard for industrial competence."
             />
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
                 <div className="text-xl text-muted-foreground leading-relaxed space-y-6">
                    <p>
                        Petrosphere Incorporated is a registered stock corporation in the Philippines on July 1, 2013, at the Securities and Exchange Commision.
                        <br></br>
                        <br></br>
                        It initially offered oil and gas training courses, eventually becoming an accredited Safety Training Organization in 2017 by the Occupational Safety and Health Center (OSHC), a Department of Labor and Employment (DOLE) Agency.
                    </p>
                    <p>
                    Petrosphere is also accredited by the Professional Regulation Commission (PRC) as a Continuing Professional Development Provider, the International Association of Drilling Contractors (IADC) – the USA, and the Professional Evaluation and Certification Board (PECB) – in Canada.
                    <br></br>
                    <br></br>
                    It is seeking approval from the Institution of Occupational Safety and Health (IOSH) UK and the Technical Education and Skills Development Authority (TESDA) to offer additional courses.
                    </p>
                 </div>
                 <div className="flex flex-col justify-center">
                    <figure className="relative overflow-hidden rounded-3xl border border-border/70 bg-linear-to-br from-background via-secondary/35 to-background p-8 shadow-[0_18px_55px_-28px_rgba(15,23,42,0.28)] ring-1 ring-foreground/6 sm:p-10">
                      <div
                        className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-primary/8 blur-3xl"
                        aria-hidden
                      />
                      <div
                        className="pointer-events-none absolute -left-20 -bottom-24 h-56 w-56 rounded-full bg-accent/8 blur-3xl"
                        aria-hidden
                      />
                      <div className="relative">
                        <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.26em] text-muted-foreground">
                          <span className="h-px w-8 bg-foreground/20" aria-hidden />
                          Founding principle
                        </div>
                        <blockquote className="mt-6">
                          <p className="text-[19px] font-medium leading-relaxed tracking-tight text-foreground sm:text-[20px]">
                            <span className="text-foreground/40">“</span>
                            Founded with a singular vision: to ensure every worker returns home safely while operating at peak efficiency.
                            <span className="text-foreground/40">”</span>
                          </p>
                        </blockquote>
                      </div>
                    </figure>
                 </div>
             </div>
        </div>

        {/* Image */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="mt-10 lg:mt-14 w-full aspect-video md:aspect-[21/9] rounded-3xl overflow-hidden bg-muted mb-24 border border-border shadow-sm"
        >
             <img src={aboutImg} alt="Corporate Office" className="w-full h-full object-cover" />
        </motion.div>

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
                        <p className="text-2xl font-medium leading-[1.25] tracking-tight text-foreground md:text-[28px] lg:text-[32px]">
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

        {/* Timeline */}
        <div className="mx-auto max-w-4xl border-b border-border/60 pb-16 pt-8 md:pb-24">
            <SectionHeader title="Historical Record" eyebrow="Timeline" alignment="center" className="mb-16" />
            
            <div className="space-y-6">
                {milestones.map((milestone, idx) => (
                    <motion.div 
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: idx * 0.1 }}
                        className="flex flex-col md:flex-row gap-6 md:gap-12 p-8 rounded-2xl bg-card border border-border hover:border-primary/20 transition-colors"
                    >
                        <div className="md:w-32 shrink-0">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-primary/10 text-primary">
                            {milestone.year}
                          </span>
                        </div>
                        <div>
                            <h4 className="text-xl font-semibold text-foreground mb-3">{milestone.title}</h4>
                            <p className="text-muted-foreground leading-relaxed">{milestone.description}</p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
      </div>

      {/* Contact — wider than main container; map + channels */}
      <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-14 2xl:px-20">
        <motion.section
          id="contact"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mt-20 w-full max-w-[min(100%,96rem)] md:mt-28 lg:mt-36"
        >
          <div className="relative overflow-hidden rounded-[2rem] border border-border bg-gradient-to-br from-secondary/50 via-background to-secondary/30 shadow-[0_28px_70px_-28px_rgba(0,4,74,0.22)] ring-1 ring-foreground/[0.07]">
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/0 via-primary to-primary/0 opacity-90"
              aria-hidden
            />
            <div className="pointer-events-none absolute -right-32 top-1/4 h-72 w-72 -translate-y-1/2 rounded-full bg-primary/[0.08] blur-3xl" aria-hidden />
            <div className="pointer-events-none absolute -left-24 bottom-0 h-56 w-56 rounded-full bg-accent/[0.07] blur-3xl" aria-hidden />

            <div className="relative px-5 py-12 sm:px-8 md:px-12 md:py-16 lg:px-14 lg:py-20 xl:px-16 xl:py-24">
              <SectionHeader
                eyebrow="Contact"
                title="Visit, call, or write—your next step starts here"
                description="Plan a site visit, lock a cohort date, or route a compliance question. Use the live map for directions, then reach the desk that fits your inquiry."
                alignment="center"
                className="!mb-10 md:!mb-14"
              />

              <div className="grid gap-8 lg:grid-cols-12 lg:items-stretch lg:gap-12 xl:gap-14">
                {/* Map */}
                <div className="flex flex-col lg:col-span-8">
                  <div className="relative min-h-[300px] flex-1 overflow-hidden rounded-2xl border border-border/90 bg-muted shadow-inner sm:min-h-[360px] lg:min-h-[min(52vh,560px)] xl:min-h-[min(56vh,620px)]">
                    <AboutHeadquartersMap lat={HQ_LAT} lon={HQ_LON} />
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-background via-background/85 to-transparent pt-24 pb-0">
                      <div className="pointer-events-auto flex flex-col gap-3 p-4 sm:flex-row sm:items-end sm:justify-between sm:p-5">
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                            Registered office
                          </p>
                          <p className="mt-1 max-w-md text-sm font-medium leading-snug text-foreground sm:text-base">
                            Petrosphere Incorporated · Puerto Princesa, Palawan, Philippines
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            asChild
                            variant="secondary"
                            size="sm"
                            className="rounded-lg border border-border/80 bg-background/95 shadow-sm"
                          >
                            <a href={HQ_GOOGLE_DIRECTIONS} target="_blank" rel="noopener noreferrer">
                              Directions
                              <FiExternalLink className="ml-1.5 h-3.5 w-3.5 opacity-70" aria-hidden />
                            </a>
                          </Button>
                          <Button asChild variant="outline" size="sm" className="rounded-lg bg-background/90">
                            <a href={HQ_GOOGLE_LISTING} target="_blank" rel="noopener noreferrer">
                              Google listing
                              <FiExternalLink className="ml-1.5 h-3.5 w-3.5 opacity-70" aria-hidden />
                            </a>
                          </Button>
                          <Button asChild variant="outline" size="sm" className="rounded-lg bg-background/90">
                            <a href={HQ_MAP_VIEW} target="_blank" rel="noopener noreferrer">
                              OpenStreetMap
                            </a>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="mt-3 text-center text-xs leading-relaxed text-muted-foreground lg:text-left">
                    The map opens on the Philippines, then flies to our Puerto Princesa pin when you scroll here (skipped if
                    you prefer reduced motion). © OpenStreetMap contributors — coordinates match the official{" "}
                    <a href={HQ_GOOGLE_LISTING} className="font-medium text-foreground underline-offset-2 hover:underline">
                      Google Maps listing
                    </a>
                    .
                  </p>
                </div>

                {/* Contact routing — single elevated panel */}
                <div className="flex flex-col lg:col-span-4">
                  <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl border border-border/70 bg-card shadow-[0_28px_65px_-30px_rgba(15,23,42,0.22)] ring-1 ring-black/4">
                    <div
                      className="absolute inset-x-0 top-0 z-10 h-[3px] rounded-t-3xl bg-linear-to-r from-primary/30 via-primary to-primary/40"
                      aria-hidden
                    />
                    <div className="pointer-events-none absolute -left-10 top-32 h-44 w-44 rounded-full bg-primary/8 blur-3xl" aria-hidden />
                    <div className="pointer-events-none absolute -bottom-12 right-0 h-48 w-56 rounded-full bg-accent/10 blur-3xl" aria-hidden />

                    <div className="relative flex flex-col divide-y divide-border/60">
                      <section className="p-7 md:p-8">
                        <div className="flex gap-5 md:gap-6">
                          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-primary/22 via-primary/12 to-primary/5 text-primary shadow-inner ring-1 ring-primary/20">
                            <FiClock className="h-[22px] w-[22px]" strokeWidth={1.75} aria-hidden />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-primary">Desk hours</p>
                            <p className="mt-1 text-xs font-medium text-muted-foreground">Philippine time · UTC+8</p>
                            <p className="mt-5 text-lg font-semibold leading-snug tracking-tight text-foreground md:text-xl">
                              Monday–Friday
                              <span className="mt-1 block text-base font-medium text-muted-foreground md:inline md:mt-0 md:before:mx-2 md:before:text-border md:before:content-['·']">
                                9:00 AM. – 5:00 PM.
                              </span>
                            </p>
                            <p className="mt-4 max-w-[22rem] text-sm leading-relaxed text-muted-foreground">
                              Admissions and sales route through the same desk outside public holidays.
                            </p>
                          </div>
                        </div>
                      </section>

                      <section className="p-7 md:p-8">
                        <div className="flex items-center gap-4">
                          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-primary/22 via-primary/12 to-primary/5 text-primary shadow-inner ring-1 ring-primary/20">
                            <FiPhone className="h-[22px] w-[22px]" strokeWidth={1.75} aria-hidden />
                          </span>
                          <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-primary">Phone</p>
                        </div>
                        <dl className="mt-6 space-y-5">
                          <div className="flex flex-col gap-1 border-b border-border/40 pb-5 last:border-0 last:pb-0 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
                            <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                              General
                            </dt>
                            <dd className="sm:text-right">
                              <a
                                href="tel:+18005550199"
                                className="text-lg font-medium tracking-tight text-foreground tabular-nums underline-offset-4 transition-colors hover:text-primary hover:underline"
                              >
                                +63 975 853 3144
                              </a>
                            </dd>
                          </div>
                          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
                            <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                              Admissions
                            </dt>
                            <dd className="sm:text-right">
                              <a
                                href="tel:+18005550198"
                                className="text-lg font-medium tracking-tight text-foreground tabular-nums underline-offset-4 transition-colors hover:text-primary hover:underline"
                              >
                                +63 975 853 3144
                              </a>
                            </dd>
                          </div>
                        </dl>
                      </section>

                      <section className="flex flex-1 flex-col p-7 md:p-8">
                        <div className="flex items-center gap-4">
                          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-primary/22 via-primary/12 to-primary/5 text-primary shadow-inner ring-1 ring-primary/20">
                            <FiMail className="h-[22px] w-[22px]" strokeWidth={1.75} aria-hidden />
                          </span>
                          <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-primary">Email</p>
                        </div>
                        <dl className="mt-6 flex flex-1 flex-col gap-6">
                          <div>
                            <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                              General & sales
                            </dt>
                            <dd className="mt-2">
                              <a
                                href="mailto:contact@petrosphere.com"
                                className="break-all text-[17px] font-medium tracking-tight text-foreground underline-offset-[3px] transition-colors hover:text-primary hover:underline"
                              >
                                info@petrosphere.com.ph
                              </a>
                            </dd>
                          </div>
                          <div>
                            <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                              Training intake
                            </dt>
                            <dd className="mt-2">
                              <a
                                href="mailto:admissions@petrosphere.com"
                                className="break-all text-[17px] font-medium tracking-tight text-foreground underline-offset-[3px] transition-colors hover:text-primary hover:underline"
                              >
                                sales@petrosphere.com.ph
                              </a>
                            </dd>
                          </div>
                        </dl>
                      </section>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}