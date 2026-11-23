"use client";

import React from "react";
import Link from "next/link";
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
 * Desktop pill nav:
 * - Idle: muted white text
 * - Active page: white pill + navy text
 * - Hover: gold fill + dark text (overrides active while hovered)
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
            <span className="relative z-[1] inline-flex items-center gap-1.5">
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
          );

          const itemClass = cn(
            "group/slot relative isolate inline-flex h-full items-center justify-center overflow-hidden",
            "rounded-full px-5 text-[15px] font-medium tracking-[-0.01em]",
            "no-underline outline-none transition-colors duration-200",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E0A83A]/70",
            "text-white/70",
            item.active && "text-white",
            // Hover only: gold
            "hover:bg-[#E0A83A] hover:text-[#1a1408]",
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
