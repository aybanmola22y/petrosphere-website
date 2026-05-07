"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Play } from "lucide-react";

import { SectionHeader } from "@/components/ui/SectionHeader";
import type { StudentVideoTestimonial } from "@/data/siteMarketingDefaults";

function embedSrc(videoId: string): string {
  return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?autoplay=1&rel=0&modestbranding=1`;
}

function VideoCard({ item, idx }: { item: StudentVideoTestimonial; idx: number }) {
  const [playing, setPlaying] = useState(false);

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, delay: idx * 0.1 }}
      className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm ring-1 ring-black/4"
    >
      <span className="mx-6 mt-6 h-px bg-linear-to-r from-primary/60 via-primary/20 to-transparent md:mx-8 md:mt-8" aria-hidden />

      <div className="relative mx-6 mt-6 aspect-video overflow-hidden rounded-xl bg-muted md:mx-8 md:mt-7">
        {playing ? (
          <iframe
            title={`Video testimonial — ${item.studentName}`}
            src={embedSrc(item.youtubeVideoId)}
            className="absolute inset-0 h-full w-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            className="group relative h-full w-full cursor-pointer text-left outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            aria-label={`Play video testimonial from ${item.studentName}`}
          >
            <Image
              src={item.posterSrc}
              alt=""
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            />
            <span className="absolute inset-0 bg-linear-to-t from-foreground/55 via-foreground/25 to-foreground/15" aria-hidden />
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_12px_40px_-10px_hsl(42_72%_38%/0.75)] ring-4 ring-background/90 transition-transform duration-200 group-hover:scale-105 md:h-18 md:w-18">
                <Play className="ml-1 h-7 w-7 fill-current md:h-8 md:w-8" aria-hidden />
              </span>
            </span>
          </button>
        )}
      </div>

      {playing ? (
        <div className="border-b border-border px-6 pb-4 pt-3 md:px-8">
          <button
            type="button"
            onClick={() => setPlaying(false)}
            className="text-xs font-semibold uppercase tracking-wider text-muted-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
          >
            Hide video
          </button>
        </div>
      ) : null}

      <div className="flex flex-1 flex-col p-6 pt-5 md:p-8 md:pt-6">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">Graduate story</p>
        <h3 className="mt-2 text-lg font-semibold tracking-tight text-foreground md:text-xl">{item.studentName}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{item.credential}</p>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{item.summary}</p>
      </div>
    </motion.article>
  );
}

export function StudentVideoTestimonialsSection({
  items,
  className,
}: {
  items: StudentVideoTestimonial[];
  className?: string;
}) {
  return (
    <section className={className}>
      <div className="container mx-auto px-6">
        <SectionHeader
          alignment="center"
          eyebrow="Student voices"
          title="Video testimonials from our graduates."
          description="Hear how learners carry Petrosphere training into the workplace—from open enrollments and certified pathways to tailored programs we design with your teams."
          className="mb-0"
        />
        <div className="mx-auto mt-14 grid max-w-6xl grid-cols-1 gap-8 md:mt-16 md:max-w-7xl md:grid-cols-2 md:gap-10 xl:grid-cols-3">
          {items.map((item, idx) => (
            <VideoCard key={item.id} item={item} idx={idx} />
          ))}
        </div>
      </div>
    </section>
  );
}
