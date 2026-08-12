"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import type { SiteStat } from "@/types/site-content";

type ParsedStatValue = {
  target: number;
  prefix: string;
  suffix: string;
  decimals: number;
  useGrouping: boolean;
};

const COUNT_DURATION_MS = 4500;

function parseStatValue(value: string): ParsedStatValue {
  const trimmed = value.trim();
  const match = trimmed.match(/^([^0-9]*)([\d,]+(?:\.\d+)?)(.*)$/);

  if (!match) {
    return { target: 0, prefix: "", suffix: trimmed, decimals: 0, useGrouping: false };
  }

  const [, prefix = "", numPart, suffix = ""] = match;
  const target = Number.parseFloat(numPart.replace(/,/g, ""));
  const decimals = numPart.includes(".") ? (numPart.split(".")[1]?.length ?? 0) : 0;

  return {
    target: Number.isFinite(target) ? target : 0,
    prefix,
    suffix,
    decimals,
    useGrouping: numPart.includes(",") || target >= 1000,
  };
}

function formatStatCount(current: number, parsed: ParsedStatValue) {
  const value = parsed.decimals > 0 ? current : Math.floor(current);

  const formatted = value.toLocaleString("en-US", {
    minimumFractionDigits: parsed.decimals,
    maximumFractionDigits: parsed.decimals,
    useGrouping: parsed.useGrouping,
  });

  return `${parsed.prefix}${formatted}${parsed.suffix}`;
}

function isStatsGridVisible(node: HTMLElement) {
  const rect = node.getBoundingClientRect();
  const viewportHeight = window.innerHeight;
  const visibleTop = viewportHeight * 0.15;
  const visibleBottom = viewportHeight * 0.85;

  return rect.top < visibleBottom && rect.bottom > visibleTop && rect.height > 0;
}

export function HomeStatsSection({ stats }: { stats: SiteStat[] }) {
  const gridRef = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);
  const frameRef = useRef(0);
  const generationRef = useRef(0);

  const parsedStats = useMemo(() => stats.map((stat) => parseStatValue(stat.value)), [stats]);
  const targets = useMemo(() => parsedStats.map((parsed) => parsed.target), [parsedStats]);

  const [values, setValues] = useState<number[]>(() => targets.map(() => 0));

  useEffect(() => {
    const node = gridRef.current;
    if (!node) return;

    const startCountUp = () => {
      if (startedRef.current || !isStatsGridVisible(node)) return;

      startedRef.current = true;
      generationRef.current += 1;
      const generation = generationRef.current;

      setValues(targets.map(() => 0));

      const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (prefersReduced) {
        setValues(targets);
        return;
      }

      const startTime = performance.now();

      const tick = (now: number) => {
        if (generation !== generationRef.current) return;

        const progress = Math.min((now - startTime) / COUNT_DURATION_MS, 1);
        setValues(targets.map((target) => target * progress));

        if (progress < 1) {
          frameRef.current = requestAnimationFrame(tick);
        }
      };

      frameRef.current = requestAnimationFrame(tick);
    };

    startCountUp();
    window.addEventListener("scroll", startCountUp, { passive: true });
    window.addEventListener("resize", startCountUp, { passive: true });

    return () => {
      window.removeEventListener("scroll", startCountUp);
      window.removeEventListener("resize", startCountUp);
      cancelAnimationFrame(frameRef.current);
      generationRef.current += 1;
      startedRef.current = false;
    };
  }, [targets]);

  return (
    <section className="py-16 md:py-28">
      <div className="container mx-auto px-6">
        <div
          ref={gridRef}
          className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4 lg:gap-6"
        >
          {stats.map((stat, idx) => (
            <div
              key={`${stat.label}-${idx}`}
              className="flex flex-col items-center justify-center rounded-2xl border border-border/70 bg-white px-3 py-6 text-center shadow-[0_12px_28px_-24px_rgba(0,4,74,0.28)] sm:px-5 sm:py-8"
            >
              <div className="text-[1.7rem] font-bold tracking-tight text-[#00044a] sm:text-4xl lg:text-5xl">
                <span className="tabular-nums" aria-label={stat.value}>
                  {formatStatCount(values[idx] ?? 0, parsedStats[idx])}
                </span>
              </div>
              <div className="mt-2 max-w-[10.5rem] text-[12px] font-medium leading-snug text-muted-foreground sm:mt-3 sm:text-sm">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
