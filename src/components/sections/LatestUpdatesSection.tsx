"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { FiArrowRight } from "react-icons/fi";

import type { CompanyNewsItem } from "@/data/companyNews";
import { NewsGridCard } from "@/components/ui/NewsGridCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { cn } from "@/lib/utils";

type LatestUpdatesSectionProps = {
  className?: string;
  items: CompanyNewsItem[];
  showViewAll?: boolean;
  viewAllHref?: string;
  title?: string;
  description?: string;
};

export function LatestUpdatesSection({
  className,
  items,
  showViewAll = false,
  viewAllHref = "/news",
  title = "What we've been up to",
  description = "CSR, partnerships, and training milestones — presented in the same grid layout as our training schedule for a consistent experience.",
}: LatestUpdatesSectionProps) {
  return (
    <section
      id="latest-updates"
      className={cn(
        "scroll-mt-28 border-t border-border bg-background py-20 md:py-28",
        className,
      )}
    >
      <div className="container mx-auto max-w-7xl px-6">
        <SectionHeader
          alignment="center"
          eyebrow="Updates"
          title={title}
          description={description}
          className="mb-0"
        />

        <div className="mt-14 grid items-stretch gap-6 sm:grid-cols-2 md:mt-16 lg:grid-cols-3">
          {items.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.45, delay: Math.min(idx * 0.05, 0.25), ease: [0.22, 1, 0.36, 1] }}
              className="flex h-full min-w-0 min-h-0 w-full"
            >
              <NewsGridCard item={item} index={idx} />
            </motion.div>
          ))}
        </div>

        {showViewAll ? (
          <div className="mt-12 flex justify-center md:mt-14">
            <Link
              href={viewAllHref}
              className="inline-flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-primary/80"
            >
              View all updates
              <FiArrowRight aria-hidden />
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}
