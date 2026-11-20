"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
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
 * Desktop pill nav inspired by React Bits PillNav:
 * rising fill + rolling label on hover, sliding active highlight.
 * Dropdowns stay outside the pill face so mega menus still work.
 */
export function HeaderPillNav({
  items,
  className,
  onItemEnter,
  onItemLeave,
  renderDropdown,
}: HeaderPillNavProps) {
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
      <ul className="m-0 flex h-full list-none items-stretch gap-1 p-0">
        {items.map((item) => {
          const content = (
            <>
              <span
                aria-hidden
                className={cn(
                  "pointer-events-none absolute left-1/2 top-full z-0 h-[220%] w-[220%]",
                  "-translate-x-1/2 -translate-y-0 scale-0 rounded-full bg-white",
                  "transition-transform duration-[360ms] ease-[cubic-bezier(0.4,0,0.2,1)]",
                  "group-hover/slot:scale-100 group-hover/slot:duration-[550ms]",
                  "group-hover/slot:ease-[cubic-bezier(0.22,1,0.36,1)]",
                  "motion-reduce:transition-none",
                )}
              />

              {item.active ? (
                <motion.span
                  layoutId="header-pill-active"
                  className="absolute inset-0 z-0 rounded-full bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_6px_16px_-8px_rgba(0,0,0,0.45)]"
                  transition={{ type: "spring", stiffness: 380, damping: 34 }}
                />
              ) : null}

              <span
                className={cn(
                  "relative z-[1] inline-flex items-center gap-1.5 transition-transform duration-[360ms]",
                  "ease-[cubic-bezier(0.22,1,0.36,1)]",
                  "group-hover/slot:-translate-y-[1.9rem] group-hover/slot:duration-500",
                  "group-data-[active=true]/slot:text-[#00044a]",
                  "motion-reduce:transition-none motion-reduce:group-hover/slot:translate-y-0",
                )}
              >
                {item.name}
                {item.hasChildren ? (
                  <FiChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform duration-200",
                      item.open && "rotate-180",
                    )}
                  />
                ) : null}
              </span>

              <span
                aria-hidden
                className={cn(
                  "absolute inset-0 z-[1] inline-flex translate-y-[1.9rem] items-center justify-center gap-1.5",
                  "font-medium text-[#00044a] transition-transform duration-[360ms]",
                  "ease-[cubic-bezier(0.22,1,0.36,1)]",
                  "group-hover/slot:translate-y-0 group-hover/slot:duration-500",
                  "motion-reduce:hidden",
                )}
              >
                {item.name}
                {item.hasChildren ? <FiChevronDown className="h-4 w-4" /> : null}
              </span>
            </>
          );

          const itemClass = cn(
            "group/slot relative isolate inline-flex h-full items-center justify-center overflow-hidden",
            "rounded-full px-5 text-[15px] font-medium tracking-[-0.01em]",
            "text-white/70 no-underline outline-none transition-colors duration-200",
            "hover:text-[#00044a] focus-visible:outline-2 focus-visible:outline-offset-2",
            "focus-visible:outline-white/70",
            item.active && "text-[#00044a]",
          );

          return (
            <li
              key={item.name}
              className="relative flex"
              onPointerEnter={() => item.hasChildren && onItemEnter?.(item.name)}
              onPointerLeave={(e) => onItemLeave?.(e, !!item.hasChildren)}
            >
              {item.external ? (
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={itemClass}
                  aria-label={item.name}
                  data-active={item.active ? "true" : "false"}
                >
                  {content}
                </a>
              ) : (
                <Link
                  href={item.href}
                  className={itemClass}
                  aria-current={item.active ? "page" : undefined}
                  data-active={item.active ? "true" : "false"}
                >
                  {content}
                </Link>
              )}

              {item.hasChildren && item.open ? renderDropdown?.(item.name) : null}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
