"use client";

import Image from "next/image";

import type { HomeHeroMasonryColumns, HomeHeroMasonryImage } from "@/data/siteMarketingDefaults";
import { homeHeroMasonryColumns } from "@/data/siteMarketingDefaults";
import { normalizeHeroMasonry } from "@/lib/hero-masonry";

const columnMotion = [
  { duration: "42s", direction: "normal" as const },
  { duration: "36s", direction: "reverse" as const },
  { duration: "48s", direction: "normal" as const },
  { duration: "40s", direction: "reverse" as const },
];

function MasonryColumn({
  images,
  duration,
  direction,
  priority,
}: {
  images: HomeHeroMasonryImage[];
  duration: string;
  direction: "normal" | "reverse";
  priority?: boolean;
}) {
  const loop = [...images, ...images];

  return (
    <div className="hero-masonry-col relative h-full overflow-hidden">
      <div
        className="hero-masonry-track flex flex-col gap-3 will-change-transform md:gap-3.5"
        style={{
          animationDuration: duration,
          animationDirection: direction,
        }}
      >
        {loop.map((image, index) => (
          <div
            key={`${image.src}-${index}`}
            className={`relative w-full overflow-hidden rounded-2xl bg-muted/80 shadow-[0_14px_32px_-18px_rgba(15,23,42,0.45)] ${
              image.tall ? "aspect-[3/4]" : "aspect-[4/5]"
            }`}
          >
            <Image
              src={image.src}
              alt={image.alt ?? ""}
              fill
              priority={Boolean(priority && index < 2)}
              quality={88}
              className="object-cover"
              sizes="(max-width: 1024px) 28vw, 160px"
              draggable={false}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export function HomeHeroMasonryCarousel({
  columns: columnsProp,
}: {
  columns?: HomeHeroMasonryColumns;
} = {}) {
  const columns = normalizeHeroMasonry(columnsProp ?? homeHeroMasonryColumns);

  return (
    <div
      className="hero-masonry relative h-[min(42vh,300px)] w-full overflow-hidden sm:h-[min(48vh,380px)] lg:h-[min(56vh,460px)]"
      aria-hidden="true"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-14 bg-gradient-to-b from-background to-transparent md:h-20" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-14 bg-gradient-to-t from-background to-transparent md:h-20" />

      <div className="flex h-full gap-2.5 sm:gap-3 md:gap-3.5">
        {columns.map((images, index) => (
          <div
            key={index}
            className={
              index === 3
                ? "hidden h-full min-w-0 flex-1 lg:block"
                : index === 2
                  ? "hidden h-full min-w-0 flex-1 sm:block"
                  : "h-full min-w-0 flex-1"
            }
          >
            <MasonryColumn
              images={images}
              duration={columnMotion[index]!.duration}
              direction={columnMotion[index]!.direction}
              priority={index < 2}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
