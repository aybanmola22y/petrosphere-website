"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import type { EmblaCarouselType } from "embla-carousel";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

const AUTOPLAY_MS = 4200;

/** Portrait 4:5 crop at ~4K width for sharp carousel display on retina / large screens. */
function heroSlideSrc(photoId: string) {
  return `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=3840&h=4800&q=92`;
}

const slides = [
  {
    src: heroSlideSrc("photo-1522202176988-66273c2fd55f"),
    alt: "Professional training session with instructor and participants",
  },
  {
    src: heroSlideSrc("photo-1524178232363-1fb2b075b655"),
    alt: "Hands-on safety and technical training session",
  },
  {
    src: heroSlideSrc("photo-1504307651254-35680f356dfd"),
    alt: "Industrial team in safety gear on site",
  },
  {
    src: heroSlideSrc("photo-1576091160399-112ba8d25d1d"),
    alt: "Healthcare and emergency medical training",
  },
  {
    src: heroSlideSrc("photo-1557804506-669a67965ba0"),
    alt: "Consultancy and executive planning session",
  },
  {
    src: heroSlideSrc("photo-1460925895917-afdab827c52f"),
    alt: "Integrated workforce and compliance solutions",
  },
  {
    src: heroSlideSrc("photo-1517245386807-bb43f82c33c4"),
    alt: "Collaborative team workshop and planning",
  },
] as const;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getCoverflowLayer(slideNode: HTMLElement): HTMLElement | null {
  return slideNode.querySelector<HTMLElement>("[data-coverflow-layer]");
}

function scrollToNextSlide(emblaApi: EmblaCarouselType) {
  if (emblaApi.canScrollNext()) {
    emblaApi.scrollNext();
    return;
  }
  emblaApi.scrollTo(0);
}

export function HomeHeroCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "center",
    containScroll: false,
    skipSnaps: false,
    duration: 32,
  });
  const [selected, setSelected] = useState(0);
  const autoplayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const applyArc = useCallback(() => {
    if (!emblaApi) return;

    const engine = emblaApi.internalEngine();
    const scrollProgress = emblaApi.scrollProgress();
    const slideNodes = emblaApi.slideNodes();
    const snapList = emblaApi.scrollSnapList();
    const snapStep = Math.abs(snapList[1] - snapList[0]) || 1 / Math.max(slides.length - 1, 1);

    emblaApi.scrollSnapList().forEach((snap, snapIndex) => {
      let diffToTarget = snap - scrollProgress;
      const slideIndexes = engine.slideRegistry[snapIndex];

      slideIndexes.forEach((slideIndex) => {
        if (engine.options.loop) {
          engine.slideLooper.loopPoints.forEach((loopItem) => {
            const target = loopItem.target();
            if (slideIndex === loopItem.index && target !== 0) {
              const sign = Math.sign(target);
              if (sign === -1) {
                diffToTarget = snap - (1 + scrollProgress);
              }
              if (sign === 1) {
                diffToTarget = snap + (1 - scrollProgress);
              }
            }
          });
        }

        const normalized = diffToTarget / snapStep;
        const distance = Math.abs(normalized);
        const focus = clamp(1 - distance * 0.18, 0, 1);
        const rotateY = normalized * -40;
        const translateZ = focus * 130 - distance * 55;
        const translateX = normalized * 16;
        const scale = clamp(1 - distance * 0.07, 0.84, 1);
        const opacity = clamp(1 - distance * 0.1, 0.7, 1);

        const slideNode = slideNodes[slideIndex] as HTMLElement;
        if (!slideNode) return;

        const coverflowLayer = getCoverflowLayer(slideNode);
        if (!coverflowLayer) return;

        coverflowLayer.dataset.focus = focus.toFixed(3);
        coverflowLayer.style.transform = `translate3d(${translateX.toFixed(1)}px, 0, ${translateZ.toFixed(1)}px) rotateY(${rotateY.toFixed(2)}deg) scale3d(${scale.toFixed(3)}, ${scale.toFixed(3)}, 1)`;
        coverflowLayer.style.opacity = String(opacity);
        slideNode.style.zIndex = String(Math.round(focus * 100));
      });
    });
  }, [emblaApi]);

  const startAutoplay = useCallback(() => {
    if (!emblaApi) return;
    if (autoplayRef.current) clearInterval(autoplayRef.current);
    autoplayRef.current = setInterval(() => scrollToNextSlide(emblaApi), AUTOPLAY_MS);
  }, [emblaApi]);

  const stopAutoplay = useCallback(() => {
    if (autoplayRef.current) {
      clearInterval(autoplayRef.current);
      autoplayRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    const onSettle = () => setSelected(emblaApi.selectedScrollSnap());

    const onReInit = () => {
      emblaApi.slideNodes().forEach((slideNode: HTMLElement) => {
        const coverflowLayer = getCoverflowLayer(slideNode);
        if (coverflowLayer) {
          coverflowLayer.style.willChange = "transform, opacity";
        }
      });
      applyArc();
    };

    emblaApi.reInit();
    applyArc();
    onSettle();
    startAutoplay();

    emblaApi.on("scroll", applyArc);
    emblaApi.on("reInit", onReInit);
    emblaApi.on("settle", onSettle);

    return () => {
      stopAutoplay();
      emblaApi.off("scroll", applyArc);
      emblaApi.off("reInit", onReInit);
      emblaApi.off("settle", onSettle);
    };
  }, [emblaApi, applyArc, startAutoplay, stopAutoplay]);

  const scrollPrev = useCallback(() => {
    if (!emblaApi) return;
    stopAutoplay();
    emblaApi.scrollPrev();
    startAutoplay();
  }, [emblaApi, startAutoplay, stopAutoplay]);

  const scrollNext = useCallback(() => {
    if (!emblaApi) return;
    stopAutoplay();
    emblaApi.scrollNext();
    startAutoplay();
  }, [emblaApi, startAutoplay, stopAutoplay]);

  const scrollTo = useCallback(
    (index: number) => {
      if (!emblaApi) return;
      stopAutoplay();
      emblaApi.scrollTo(index);
      startAutoplay();
    },
    [emblaApi, startAutoplay, stopAutoplay],
  );

  return (
    <div
      className="group/carousel relative -mx-6 w-[calc(100%+3rem)] sm:-mx-8 sm:w-[calc(100%+4rem)] lg:-mx-12 lg:w-[calc(100%+6rem)]"
      aria-label="Featured training facility photos"
      onMouseEnter={stopAutoplay}
      onMouseLeave={startAutoplay}
    >
      <div className="py-2 md:py-4">
        <div className="carousel-arc-viewport" ref={emblaRef}>
          <div className="carousel-arc-track flex touch-pan-y -ml-2 md:-ml-3">
            {slides.map((slide, index) => (
              <div
                key={slide.src}
                className="carousel-arc-slide min-w-0 shrink-0 grow-0 basis-[46%] pl-2 sm:basis-[34%] sm:pl-2.5 md:basis-[28%] md:pl-3 lg:basis-[22%] xl:basis-[20%]"
              >
                <div data-coverflow-layer className="carousel-arc-layer h-full">
                  <div className="carousel-arc-card relative aspect-[4/5] w-full overflow-hidden rounded-[1.35rem] bg-muted shadow-[0_20px_44px_-22px_rgba(15,23,42,0.4)] md:rounded-[1.5rem]">
                    <Image
                      src={slide.src}
                      alt={slide.alt}
                      fill
                      priority={index < 5}
                      quality={92}
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, (max-width: 1280px) 30vw, 25vw"
                      draggable={false}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        size="icon"
        className="absolute left-3 top-1/2 z-20 size-9 -translate-y-1/2 rounded-full border-border/70 bg-background/95 shadow-sm hover:bg-background md:left-6 md:size-10 md:opacity-0 md:transition-opacity md:group-hover/carousel:opacity-100"
        onClick={scrollPrev}
        aria-label="Previous slide"
      >
        <ChevronLeft className="size-4 md:size-5" aria-hidden />
      </Button>

      <Button
        type="button"
        variant="outline"
        size="icon"
        className="absolute right-3 top-1/2 z-20 size-9 -translate-y-1/2 rounded-full border-border/70 bg-background/95 shadow-sm hover:bg-background md:right-6 md:size-10 md:opacity-0 md:transition-opacity md:group-hover/carousel:opacity-100"
        onClick={scrollNext}
        aria-label="Next slide"
      >
        <ChevronRight className="size-4 md:size-5" aria-hidden />
      </Button>

      <div className="sr-only">
        {slides.map((slide, index) => (
          <button
            key={slide.src}
            type="button"
            aria-label={`Go to slide ${index + 1}`}
            aria-current={selected === index ? "true" : undefined}
            onClick={() => scrollTo(index)}
          />
        ))}
      </div>
    </div>
  );
}
