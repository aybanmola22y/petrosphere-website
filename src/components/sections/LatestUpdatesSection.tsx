"use client";

import React from "react";
import { motion } from "framer-motion";

import type { CompanyNewsItem } from "@/data/companyNews";
import { NewsGridCard } from "@/components/ui/NewsGridCard";
import { cn } from "@/lib/utils";

export function LatestUpdatesSection({ className, items }: { className?: string; items: CompanyNewsItem[] }) {
  return (
    <section
      id="latest-updates"
      className={cn(
        "scroll-mt-28 border-t border-border bg-background py-20 md:py-28",
        className,
      )}
    >
      <div className="container mx-auto max-w-7xl px-6">
        <div className="mb-12 max-w-2xl md:mb-14">
          <div className="mb-4 flex items-center gap-3">
            <span className="h-px w-12 bg-linear-to-r from-primary to-primary/20" aria-hidden />
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">Updates</p>
          </div>
          <h2 className="text-display-3 text-balance text-foreground">What we&apos;ve been up to</h2>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground md:text-[17px]">
            CSR, partnerships, and training milestones — presented in the same grid layout as our training schedule for a
            consistent experience.
          </p>
        </div>

        <div className="grid items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.45, delay: Math.min(idx * 0.05, 0.25), ease: [0.22, 1, 0.36, 1] }}
              className="flex h-full min-h-0 min-w-0 w-full"
            >
              <NewsGridCard item={item} index={idx} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
