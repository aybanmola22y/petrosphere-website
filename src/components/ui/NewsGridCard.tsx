import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Newspaper } from "lucide-react";
import { FiArrowUpRight, FiMapPin } from "react-icons/fi";

import type { CompanyNewsItem } from "@/data/companyNews";
import { formatCompanyNewsDate, newsReferenceLabel } from "@/data/companyNews";
import { cn } from "@/lib/utils";

function detailHref(item: CompanyNewsItem): string {
  if (item.external && item.externalHref) return item.externalHref;
  return `/news/${item.slug}`;
}

function DetailHref({
  item,
  children,
  className,
  "aria-label": ariaLabel,
}: {
  item: CompanyNewsItem;
  children: React.ReactNode;
  className?: string;
  "aria-label"?: string;
}) {
  const href = detailHref(item);
  if (item.external && item.externalHref) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className} aria-label={ariaLabel}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className} aria-label={ariaLabel}>
      {children}
    </Link>
  );
}

/**
 * Mirrors {@link ScheduleGridCard} chrome — gold rule, reference ribbon row,
 * pill badges, title/summary, location strip, footer publication date + arrow.
 */
export function NewsGridCard({
  item,
  index,
}: {
  item: CompanyNewsItem;
  /** Zero-based sequence number for NEWS-001 style references */
  index: number;
}) {
  const code = newsReferenceLabel(index);

  return (
    <div
      className={cn(
        "group/card relative flex h-full min-h-0 w-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300",
        "hover:-translate-y-1 hover:border-foreground/15 hover:shadow-md",
      )}
    >
      <span className="absolute left-0 right-0 top-0 z-10 h-px bg-accent" aria-hidden />

      <div className="relative aspect-16/10 min-h-[148px] w-full shrink-0 overflow-hidden bg-muted">
        <Image
          src={item.imageSrc}
          alt={item.title}
          fill
          className="object-contain bg-muted transition-transform duration-700 ease-out group-hover/card:scale-[1.01]"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          priority={index < 3}
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-card/90 via-card/25 to-transparent"
          aria-hidden
        />
      </div>

      <div className="flex min-h-0 flex-1 flex-col p-7">
        <div className="mb-6 flex min-h-11 shrink-0 items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
            <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground tabular-nums">
              {code}
            </span>
          </div>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            <Newspaper className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} aria-hidden />
            Official
          </span>
        </div>

        <div className="mb-4 flex min-h-9 flex-wrap items-center gap-2">
          <span className="inline-flex max-w-full items-center truncate rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium text-secondary-foreground">
            {item.category}
          </span>
          <span className="inline-flex items-center rounded-full border border-border bg-background px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Article
          </span>
        </div>

        <div className="flex min-h-0 flex-1 flex-col">
          {/* Fixed vertical rhythm: 3 title lines + 3 summary lines + 2 location lines so footers align in each grid row */}
          <h3 className="mb-3 line-clamp-3 min-h-19.5 text-[19px] font-semibold leading-snug tracking-tight text-foreground transition-colors group-hover/card:text-primary md:min-h-21 md:text-xl">
            {item.title}
          </h3>

          <div className="mb-5 min-h-17.25">
            <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">{item.summary}</p>
          </div>

          <p className="mb-6 flex min-h-11.5 items-start gap-2 text-sm leading-snug text-muted-foreground">
            <FiMapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary/80" aria-hidden />
            <span className="line-clamp-2 leading-snug">Nationwide · Puerto Princesa</span>
          </p>

          <div className="mt-auto flex shrink-0 flex-col pt-1">
            <div className="flex flex-col border-t border-border pt-6">
              <div className="mb-4 flex flex-col">
                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/60">
                  Publication date
                </span>
                <span className="text-base font-bold text-primary tabular-nums">{formatCompanyNewsDate(item.publishedAt)}</span>
              </div>

              <div className="flex items-center justify-between">
                <DetailHref
                  item={item}
                  className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Read article
                </DetailHref>
                <DetailHref
                  item={item}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border text-foreground transition-all hover:border-foreground hover:bg-foreground hover:text-background"
                  aria-label={`Open: ${item.title}`}
                >
                  <FiArrowUpRight className="h-4 w-4" aria-hidden />
                </DetailHref>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
