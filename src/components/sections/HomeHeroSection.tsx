"use client";

import Link from "next/link";

import type { HomeHeroMasonryColumns } from "@/data/siteMarketingDefaults";
import { Button } from "@/components/ui/button";
import { HomeHeroMasonryCarousel } from "@/components/sections/HomeHeroMasonryCarousel";

export function HomeHeroSection({
  heroMasonry,
}: {
  heroMasonry?: HomeHeroMasonryColumns;
} = {}) {
  return (
    <section className="relative flex min-h-0 flex-1 flex-col justify-center overflow-hidden bg-background pt-20 pb-4 md:pt-24 md:pb-5">
      <div className="relative z-10 container mx-auto grid items-center gap-8 px-6 py-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-10 lg:py-6 xl:gap-14">
        {/* Left — brand + value + CTAs */}
        <div className="hero-fade-up relative z-10 max-w-xl text-left">
          <h1 className="text-[2.35rem] font-bold leading-[1.08] tracking-tight text-foreground sm:text-5xl md:text-[3.15rem] lg:text-[3.45rem]">
            Petrosphere Incorporated
            <span className="mt-2 block text-primary md:mt-3">
              Where Quality Matters
            </span>
          </h1>

          <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg md:mt-5">
            One-stop training, review, and consultancy for teams across
            construction, mining, manufacturing, healthcare, and service
            industries.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3 md:mt-8">
            <Button
              asChild
              size="lg"
              className="h-12 rounded-full bg-primary px-8 text-base font-semibold text-primary-foreground shadow-[0_12px_32px_-12px_hsl(42_72%_52%/0.85)] hover:bg-primary/90 md:h-14 md:px-10"
            >
              <Link href="/courses">Get Started Today</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 rounded-full border-foreground/15 bg-background/80 px-8 text-base font-semibold text-foreground hover:bg-background md:h-14 md:px-10"
            >
              <Link href="/about">Learn More</Link>
            </Button>
          </div>
        </div>

        {/* Right — multi-column vertical image carousel */}
        <div className="hero-fade-up relative min-w-0 [animation-delay:120ms]">
          <HomeHeroMasonryCarousel columns={heroMasonry} />
        </div>
      </div>
    </section>
  );
}
