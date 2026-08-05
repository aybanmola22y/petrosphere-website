"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      delay,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
};

export function HomeHeroSection() {
  return (
    <section className="relative flex flex-1 flex-col justify-center overflow-hidden bg-background pt-28 pb-10 md:pt-32 md:pb-12">
      {/* Subtle column lines + dots — Invicto atmosphere */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.55]"
        aria-hidden
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent calc(12.5% - 1px),
              hsl(var(--border) / 0.55) calc(12.5% - 1px),
              hsl(var(--border) / 0.55) 12.5%
            )
          `,
        }}
      />
      <span
        className="pointer-events-none absolute left-[18%] top-[28%] size-1.5 rounded-full bg-primary/45"
        aria-hidden
      />
      <span
        className="pointer-events-none absolute right-[22%] top-[36%] size-1 rounded-full bg-foreground/20"
        aria-hidden
      />
      <span
        className="pointer-events-none absolute left-[62%] top-[22%] size-1 rounded-full bg-primary/30"
        aria-hidden
      />
      <span
        className="pointer-events-none absolute right-[12%] bottom-[38%] size-1.5 rounded-full bg-foreground/15"
        aria-hidden
      />

      <div className="relative z-10 container mx-auto flex flex-col items-center px-6 py-6 text-center md:py-10">
        <motion.h1
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="max-w-5xl text-[2.75rem] font-bold leading-[1.05] tracking-tight text-foreground sm:text-6xl md:text-[3.75rem] lg:text-[4.35rem]"
        >
          Petrosphere Incorporated
          <span className="mt-3 block text-primary md:mt-4">Where Quality Matters</span>
        </motion.h1>

        <motion.p
          custom={0.08}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl md:mt-8"
        >
          One-stop training, review, and consultancy for teams across construction,
          mining, manufacturing, healthcare, and service industries.
        </motion.p>

        <motion.div
          custom={0.16}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mt-10 md:mt-12"
        >
          <Button
            asChild
            size="lg"
            className="h-13 rounded-full bg-primary px-10 text-lg font-semibold text-primary-foreground shadow-[0_12px_32px_-12px_hsl(42_72%_52%/0.85)] hover:bg-primary/90 md:h-14 md:px-12"
          >
            <Link href="/courses">Get Started Today</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
