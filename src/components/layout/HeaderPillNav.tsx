"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LayoutGroup, motion } from "framer-motion";
import { FiChevronDown } from "react-icons/fi";

import { cn } from "@/lib/utils";

type HeaderPillNavProps = {
  items: Array<{
    name: string;
    href: string;
    hasChildren?: boolean;
    open?: boolean;
    active?: boolean;
    external?: boolean;
  }>;
  className?: string;
  onItemEnter?: (name: string) => void;
  onItemLeave?: (e: React.PointerEvent<HTMLElement>, hasChildren: boolean) => void;
  renderDropdown?: (name: string) => React.ReactNode;
};

/**
 * Desktop pill nav with a sliding metallic gold indicator.
 * Hover / open / active share one animated pill for smooth click transitions.
 */
function prefetchHref(router: ReturnType<typeof useRouter>, href: string) {
  if (!href || href.startsWith("http://") || href.startsWith("https://") || href.startsWith("#")) {
    return;
  }
  try {
    router.prefetch(href);
  } catch {
    /* ignore */
  }
}

export function HeaderPillNav({
  items,
  className,
  onItemEnter,
  onItemLeave,
  renderDropdown,
}: HeaderPillNavProps) {
  const router = useRouter();
  const [hovered, setHovered] = useState<string | null>(null);

  const highlighted =
    hovered ??
    items.find((item) => item.open)?.name ??
    items.find((item) => item.active)?.name ??
    null;

  return (
    <nav
      aria-label="Primary"
      className={cn(
        "group/nav relative hidden h-12 items-center rounded-full p-1.5 lg:flex sm:h-[3.25rem]",
        "bg-white/[0.07] shadow-[0_18px_40px_-24px_rgba(0,0,0,0.75)]",
        "ring-1 ring-inset ring-white/12 backdrop-blur-md",
        className,
      )}
    >
      <LayoutGroup id="header-pill-nav">
      <ul className="m-0 flex h-full list-none items-stretch gap-1 p-0">
        {items.map((item) => {
          const isLit = highlighted === item.name;

          const content = (
            <span className="relative z-[2] inline-flex items-center gap-1.5">
              {item.name}
              {item.hasChildren ? (
                <FiChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                    item.open && "rotate-180",
                  )}
                />
              ) : null}
            </span>
          );

          const itemClass = cn(
            "header-pill-slot group/slot relative isolate inline-flex h-full items-center justify-center",
            "rounded-full px-5 text-[15px] font-medium tracking-[-0.01em]",
            "no-underline outline-none",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E0A83A]/70",
            isLit ? "is-lit text-[var(--nav-gold-ink)]" : "text-white/70",
          );

          const indicator = isLit ? (
            <motion.span
              layoutId="header-pill-gold"
              className="header-pill-indicator"
              transition={{ type: "spring", stiffness: 420, damping: 34, mass: 0.65 }}
              initial={false}
            >
              <span className="header-pill-indicator__sheen" aria-hidden />
            </motion.span>
          ) : null;

          return (
            <li
              key={item.name}
              className="relative flex"
              onPointerEnter={() => {
                setHovered(item.name);
                prefetchHref(router, item.href);
                if (item.hasChildren) onItemEnter?.(item.name);
              }}
              onPointerLeave={(e) => {
                setHovered(null);
                onItemLeave?.(e, !!item.hasChildren);
              }}
            >
              {item.external ? (
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={itemClass}
                  aria-label={item.name}
                  data-active={item.active ? "true" : "false"}
                  data-open={item.open ? "true" : "false"}
                >
                  {indicator}
                  {content}
                </a>
              ) : (
                <Link
                  href={item.href}
                  className={itemClass}
                  aria-current={item.active ? "page" : undefined}
                  data-active={item.active ? "true" : "false"}
                  data-open={item.open ? "true" : "false"}
                  onClick={() => setHovered(item.name)}
                >
                  {indicator}
                  {content}
                </Link>
              )}

              {item.hasChildren && item.open ? renderDropdown?.(item.name) : null}
            </li>
          );
        })}
      </ul>
      </LayoutGroup>
    </nav>
  );
}
