"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

type LoopingTypewriterProps = {
  text: string;
  /** Milliseconds per character while typing */
  typeSpeed?: number;
  /** Milliseconds per character while deleting */
  deleteSpeed?: number;
  /** Pause when the full phrase is shown */
  holdMs?: number;
  /** Pause on empty before typing again */
  pauseMs?: number;
  className?: string;
};

type Phase = "idle" | "typing" | "hold" | "deleting" | "pause";

export function LoopingTypewriter({
  text,
  typeSpeed = 105,
  deleteSpeed = 72,
  holdMs = 3000,
  pauseMs = 800,
  className,
}: LoopingTypewriterProps) {
  const [output, setOutput] = useState("");
  const runIdRef = useRef(0);

  useEffect(() => {
    const runId = ++runIdRef.current;
    let index = 0;
    let phase: Phase = "idle";
    let elapsed = 0;
    let lastFrame = 0;
    let rafId = 0;

    const setPhase = (next: Phase) => {
      phase = next;
      elapsed = 0;
    };

    const frame = (timestamp: number) => {
      if (runId !== runIdRef.current) return;

      if (!lastFrame) lastFrame = timestamp;
      const delta = timestamp - lastFrame;
      lastFrame = timestamp;
      elapsed += delta;

      if (phase === "idle") {
        if (elapsed >= 450) {
          setOutput("");
          index = 0;
          setPhase("typing");
        }
      } else if (phase === "typing") {
        if (elapsed >= typeSpeed) {
          index += 1;
          setOutput(text.slice(0, index));
          elapsed = 0;
          if (index >= text.length) setPhase("hold");
        }
      } else if (phase === "hold") {
        if (elapsed >= holdMs) setPhase("deleting");
      } else if (phase === "deleting") {
        if (elapsed >= deleteSpeed) {
          index -= 1;
          setOutput(text.slice(0, Math.max(0, index)));
          elapsed = 0;
          if (index <= 0) setPhase("pause");
        }
      } else if (phase === "pause") {
        if (elapsed >= pauseMs) setPhase("typing");
      }

      rafId = requestAnimationFrame(frame);
    };

    setPhase("idle");
    rafId = requestAnimationFrame(frame);

    return () => {
      runIdRef.current += 1;
      cancelAnimationFrame(rafId);
    };
  }, [text, typeSpeed, deleteSpeed, holdMs, pauseMs]);

  return (
    <span
      className={cn("typewriter-text inline", className)}
      suppressHydrationWarning
      aria-label={text}
    >
      <span aria-hidden="true">{output}</span>
      <span className="typewriter-cursor" aria-hidden />
    </span>
  );
}
