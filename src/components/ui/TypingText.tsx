"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

type TypingTextProps = {
  text: string;
  /** Milliseconds per character while typing */
  speed?: number;
  /** Milliseconds per character while deleting (loop mode) */
  deleteSpeed?: number;
  /** Delay before animation starts (ms) */
  startDelay?: number;
  /** Pause at full text before deleting (loop mode, ms) */
  holdDelay?: number;
  /** Pause when empty before typing again (loop mode, ms) */
  pauseDelay?: number;
  /** Repeat type → delete forever */
  loop?: boolean;
  className?: string;
};

export function TypingText({
  text,
  speed = 55,
  deleteSpeed = 35,
  startDelay = 500,
  holdDelay = 2200,
  pauseDelay = 500,
  loop = false,
  className,
}: TypingTextProps) {
  const [displayed, setDisplayed] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    const clearTimers = () => {
      timersRef.current.forEach((id) => window.clearTimeout(id));
      timersRef.current = [];
    };

    const schedule = (fn: () => void, ms: number) => {
      const id = window.setTimeout(fn, ms);
      timersRef.current.push(id);
    };

    clearTimers();
    setShowCursor(true);

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      setDisplayed(text);
      setShowCursor(false);
      return clearTimers;
    }

    if (!loop) {
      setDisplayed("");
      schedule(() => {
        let index = 0;
        const typeNext = () => {
          index += 1;
          setDisplayed(text.slice(0, index));
          if (index < text.length) {
            schedule(typeNext, speed);
          } else {
            schedule(() => setShowCursor(false), 2400);
          }
        };
        typeNext();
      }, startDelay);
      return clearTimers;
    }

    setDisplayed("");
    let index = 0;
    let deleting = false;

    const tick = () => {
      if (deleting) {
        index -= 1;
        setDisplayed(text.slice(0, Math.max(0, index)));
        if (index <= 0) {
          index = 0;
          deleting = false;
          schedule(tick, pauseDelay);
        } else {
          schedule(tick, deleteSpeed);
        }
        return;
      }

      index += 1;
      setDisplayed(text.slice(0, index));
      if (index >= text.length) {
        schedule(() => {
          deleting = true;
          tick();
        }, holdDelay);
      } else {
        schedule(tick, speed);
      }
    };

    schedule(tick, startDelay);
    return clearTimers;
  }, [text, speed, deleteSpeed, startDelay, holdDelay, pauseDelay, loop]);

  return (
    <span className={cn("inline", className)} aria-label={text}>
      <span aria-hidden="true">{displayed}</span>
      {showCursor ? (
        <span
          className="ml-0.5 inline-block w-[3px] translate-y-px animate-pulse bg-current align-middle"
          style={{ height: "0.9em" }}
          aria-hidden
        />
      ) : null}
    </span>
  );
}
