"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * Thin top progress bar during client navigations so header clicks feel instant.
 */
export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [visible, setVisible] = useState(false);
  const [complete, setComplete] = useState(false);
  const first = useRef(true);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }

    if (hideTimer.current) clearTimeout(hideTimer.current);
    setComplete(false);
    setVisible(true);

    const done = window.setTimeout(() => {
      setComplete(true);
      hideTimer.current = setTimeout(() => {
        setVisible(false);
        setComplete(false);
      }, 220);
    }, 280);

    return () => {
      window.clearTimeout(done);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [pathname, searchParams]);

  if (!visible) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-[2px] overflow-hidden"
      aria-hidden
    >
      <div
        className="h-full origin-left bg-[linear-gradient(90deg,#f6d56b,#e4b84a,#c9921f)] shadow-[0_0_12px_rgba(228,184,74,0.65)] transition-[transform,opacity] duration-300 ease-out"
        style={{
          transform: complete ? "scaleX(1)" : "scaleX(0.72)",
          opacity: complete ? 0 : 1,
        }}
      />
    </div>
  );
}
