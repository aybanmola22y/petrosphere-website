"use client";

import React, {
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";

export type BranchedMenuChild = {
  value: string;
  label: string;
  href?: string;
  icon?: ReactNode;
};

export type BranchedMenuItem = {
  label: string;
  value?: string;
  href?: string;
  children?: BranchedMenuChild[];
};

export type BranchedMenuProps = {
  items?: BranchedMenuItem[];
  defaultOpen?: number | number[];
  defaultActive?: string;
  onSelect?: (value: string, item: BranchedMenuChild | BranchedMenuItem) => void;
  onToggle?: (index: number, open: boolean) => void;
  color?: string;
  accentColor?: string;
  lineColor?: string;
  width?: number;
  rowHeight?: number;
  indent?: number;
  trunk?: number;
  radius?: number;
  lineWidth?: number;
  fontSize?: number;
  drawDuration?: number;
  foldDuration?: number;
  className?: string;
};

const PAD = 6;
const MARK = 16;

const toSet = (open: number | number[]) =>
  new Set(Array.isArray(open) ? open : open >= 0 ? [open] : []);

/**
 * React Bits–style branched menu: trunk + curved branches with a tracing accent line.
 */
export function BranchedMenu({
  items = [],
  defaultOpen = 0,
  defaultActive = "",
  onSelect,
  onToggle,
  color = "#0f172a",
  accentColor = "#0f172a",
  lineColor = "#cbd5e1",
  width = 280,
  rowHeight = 36,
  indent = 40,
  trunk = 14,
  radius = 10,
  lineWidth = 1.5,
  fontSize = 14,
  drawDuration = 400,
  foldDuration = 300,
  className,
}: BranchedMenuProps) {
  const [open, setOpen] = useState<Set<number>>(() => toSet(defaultOpen));
  const [active, setActive] = useState(() => {
    if (defaultActive) return defaultActive;
    const first = items.find((it, i) => it.children && toSet(defaultOpen).has(i));
    return first?.children?.[0]?.value ?? "";
  });

  const navRef = useRef<HTMLElement>(null);
  const heads = useRef<(HTMLButtonElement | null)[]>([]);
  const markerRef = useRef<HTMLSpanElement>(null);
  const latest = useRef<{
    onSelect?: BranchedMenuProps["onSelect"];
    onToggle?: BranchedMenuProps["onToggle"];
  }>({});
  latest.current = { onSelect, onToggle };

  const activeSection = items.findIndex((it) =>
    it.children?.some((kid) => kid.value === active),
  );
  const markerShown = activeSection >= 0 && open.has(activeSection);

  useLayoutEffect(() => {
    const place = (glide: boolean) => {
      const m = markerRef.current;
      const el = heads.current[activeSection];
      if (!m) return;
      const on = markerShown && el;
      if (!glide) m.style.transition = "none";
      if (on) m.style.top = `${el.offsetTop + (el.offsetHeight - MARK) / 2}px`;
      m.toggleAttribute("data-on", Boolean(on));
      if (!glide) {
        void m.offsetHeight;
        m.style.transition = "";
      }
    };
    place(true);
    let first = true;
    const ro = new ResizeObserver(() => {
      if (first) {
        first = false;
        return;
      }
      place(false);
    });
    if (navRef.current) ro.observe(navRef.current);
    return () => ro.disconnect();
  }, [activeSection, markerShown, items, fontSize, rowHeight]);

  const select = (value: string, item: BranchedMenuChild | BranchedMenuItem) => {
    setActive(value);
    latest.current.onSelect?.(value, item);
  };

  const toggle = (i: number) => {
    setOpen((prev) => {
      const next = new Set(prev);
      const isOpen = !next.has(i);
      if (isOpen) next.add(i);
      else next.delete(i);
      latest.current.onToggle?.(i, isOpen);
      return next;
    });
  };

  const r = Math.min(radius, rowHeight / 2 - 2);
  const endX = indent - 8;
  const rowY = (k: number) => PAD + k * rowHeight + rowHeight / 2;
  const branch = (k: number) =>
    `M ${trunk} ${rowY(k) - r} A ${r} ${r} 0 0 0 ${trunk + r} ${rowY(k)} H ${endX}`;
  const reach = (k: number) =>
    `M ${trunk} 0 V ${rowY(k) - r} A ${r} ${r} 0 0 0 ${trunk + r} ${rowY(k)} H ${endX}`;
  const length = (k: number) =>
    rowY(k) - r + (Math.PI * r) / 2 + (endX - trunk - r);

  return (
    <nav
      ref={navRef}
      className={cn(
        "relative flex w-fit max-w-[min(var(--bm-w),100%)] flex-col pl-3.5 leading-[1.2]",
        "[color:var(--bm-ink)] [font-size:var(--bm-font)]",
        "before:absolute before:top-2 before:bottom-0 before:left-0 before:w-0.5 before:rounded-[1px]",
        "before:content-[''] before:[background:linear-gradient(to_bottom,var(--bm-line)_0%,var(--bm-line)_55%,transparent_100%)]",
        className,
      )}
      style={
        {
          "--bm-w": `${width}px`,
          "--bm-ink": color,
          "--bm-accent": accentColor,
          "--bm-line": lineColor,
          "--bm-font": `${fontSize}px`,
          "--bm-row": `${rowHeight}px`,
          "--bm-indent": `${indent}px`,
          "--bm-line-w": lineWidth,
          "--bm-draw": `${drawDuration}ms`,
          "--bm-muted": `color-mix(in srgb, ${color} 55%, transparent)`,
          "--bm-fold": `${foldDuration}ms`,
        } as CSSProperties
      }
    >
      <span
        ref={markerRef}
        className={cn(
          "absolute -top-px left-0 z-[1] h-4 w-0.5 rounded-[1px] opacity-0",
          "[background:var(--bm-accent)]",
          "[transition:top_220ms_cubic-bezier(0.23,1,0.32,1),opacity_150ms_ease]",
          "data-[on]:opacity-100 motion-reduce:[transition:opacity_150ms_ease]",
        )}
        aria-hidden
      />

      {items.map((item, i) => {
        const kids = item.children;
        const isOpen = kids ? open.has(i) : false;
        const leafValue = item.value ?? item.label;
        const leafActive = !kids && leafValue === active;
        const bodyH = kids ? PAD * 2 + kids.length * rowHeight : 0;

        return (
          <div
            key={item.value ?? item.label}
            className="group/section flex flex-col"
            data-open={isOpen ? "" : undefined}
          >
            <button
              ref={(el) => {
                heads.current[i] = el;
              }}
              type="button"
              className={cn(
                "m-0 block cursor-pointer border-0 bg-transparent py-[9px] text-left font-medium outline-none",
                "[color:var(--bm-muted)] [font-size:calc(var(--bm-font)+1px)]",
                "[-webkit-tap-highlight-color:transparent] [transition:color_200ms_ease]",
                "group-data-[open]/section:[color:var(--bm-ink)]",
                "data-[active]:[color:var(--bm-ink)] hover:[color:var(--bm-ink)]",
              )}
              aria-expanded={kids ? isOpen : undefined}
              aria-current={leafActive ? "true" : undefined}
              data-active={leafActive ? "" : undefined}
              onClick={() => (kids ? toggle(i) : select(leafValue, item))}
            >
              {item.label}
            </button>

            {kids ? (
              <div
                className={cn(
                  "grid [transition:grid-template-rows_var(--bm-fold)_cubic-bezier(0.23,1,0.32,1)]",
                  "motion-reduce:[transition:none]",
                  isOpen ? "[grid-template-rows:1fr]" : "[grid-template-rows:0fr]",
                )}
              >
                <div className="overflow-hidden">
                  <div className="relative" style={{ height: bodyH }}>
                    <svg
                      className={cn(
                        "pointer-events-none absolute top-0 left-0 overflow-visible opacity-0",
                        "[transition:opacity_200ms_ease]",
                        "group-data-[open]/section:opacity-100",
                        "group-data-[open]/section:[transition:opacity_250ms_ease_100ms]",
                      )}
                      width={indent}
                      height={bodyH}
                      aria-hidden
                    >
                      <path
                        className="fill-none [stroke:var(--bm-line)] [stroke-width:var(--bm-line-w)] [stroke-linecap:round] [stroke-linejoin:round]"
                        d={`M ${trunk} 0 V ${rowY(kids.length - 1) - r}`}
                      />
                      {kids.map((kid, k) => (
                        <path
                          key={`b-${kid.value}`}
                          className="fill-none [stroke:var(--bm-line)] [stroke-width:var(--bm-line-w)] [stroke-linecap:round] [stroke-linejoin:round]"
                          d={branch(k)}
                        />
                      ))}
                      {kids.map((kid, k) => (
                        <path
                          key={`a-${kid.value}`}
                          className={cn(
                            "fill-none [stroke:var(--bm-accent)] [stroke-width:var(--bm-line-w)]",
                            "[stroke-linecap:round] [stroke-linejoin:round]",
                            "[transition:stroke-dashoffset_var(--bm-draw)_cubic-bezier(0.23,1,0.32,1)]",
                            "motion-reduce:transition-none",
                          )}
                          d={reach(k)}
                          style={{
                            strokeDasharray: length(k),
                            strokeDashoffset: kid.value === active ? 0 : length(k),
                          }}
                        />
                      ))}
                    </svg>

                    {kids.map((kid) => {
                      const childClass = cn(
                        "m-0 box-border flex w-full cursor-pointer items-center gap-2 border-0 bg-transparent",
                        "py-0 pr-0 text-left no-underline outline-none",
                        "[height:var(--bm-row)] [padding-left:var(--bm-indent)]",
                        "[color:var(--bm-muted)] [-webkit-tap-highlight-color:transparent]",
                        "[transition:color_200ms_ease] hover:[color:var(--bm-ink)]",
                        "data-[active]:font-medium data-[active]:[color:var(--bm-accent)]",
                      );
                      const isActive = kid.value === active;

                      if (kid.href) {
                        return (
                          <Link
                            key={kid.value}
                            href={kid.href}
                            className={childClass}
                            aria-current={isActive ? "page" : undefined}
                            data-active={isActive ? "" : undefined}
                            tabIndex={isOpen ? 0 : -1}
                            onClick={() => select(kid.value, kid)}
                            onPointerEnter={() => setActive(kid.value)}
                          >
                            {kid.icon ? (
                              <span className="grid size-4 shrink-0 place-items-center opacity-80" aria-hidden>
                                {kid.icon}
                              </span>
                            ) : null}
                            {kid.label}
                          </Link>
                        );
                      }

                      return (
                        <button
                          key={kid.value}
                          type="button"
                          className={childClass}
                          aria-current={isActive ? "true" : undefined}
                          data-active={isActive ? "" : undefined}
                          tabIndex={isOpen ? 0 : -1}
                          onClick={() => select(kid.value, kid)}
                          onPointerEnter={() => setActive(kid.value)}
                        >
                          {kid.icon ? (
                            <span className="grid size-4 shrink-0 place-items-center opacity-80" aria-hidden>
                              {kid.icon}
                            </span>
                          ) : null}
                          {kid.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        );
      })}
    </nav>
  );
}

export default BranchedMenu;
