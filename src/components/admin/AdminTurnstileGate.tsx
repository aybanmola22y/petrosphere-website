"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Script from "next/script";
import { CheckCircle2, Loader2 } from "lucide-react";

import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { AdminAuthShell } from "@/components/admin/AdminAuthLayout";

type TurnstileApi = {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string;
      callback: (token: string) => void;
      "error-callback"?: () => void;
      "expired-callback"?: () => void;
      theme?: "light" | "dark" | "auto";
    },
  ) => string;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const TURNSTILE_SCRIPT = "https://challenges.cloudflare.com/turnstile/v0/api.js";

export function AdminTurnstileGate({
  siteKey,
  onVerified,
  className,
}: {
  siteKey: string;
  onVerified: () => void;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const renderedRef = useRef(false);
  const [scriptReady, setScriptReady] = useState(false);
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [scriptError, setScriptError] = useState(false);
  const [widgetError, setWidgetError] = useState(false);

  const verifyToken = useCallback(
    async (token: string) => {
      setPending(true);
      try {
        const res = await fetch("/api/admin/turnstile-verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({ token }),
        });
        if (!res.ok) {
          const j = (await res.json().catch(() => ({}))) as { error?: string };
          toast({
            title: "Verification failed",
            description: j.error ?? "Please try again.",
            variant: "destructive",
          });
          if (widgetIdRef.current && window.turnstile) {
            window.turnstile.reset(widgetIdRef.current);
          }
          return;
        }
        setSuccess(true);
        window.setTimeout(() => onVerified(), 650);
      } finally {
        setPending(false);
      }
    },
    [onVerified],
  );

  useEffect(() => {
    if (!scriptReady || !containerRef.current || !window.turnstile || renderedRef.current) return;

    renderedRef.current = true;
    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      theme: "light",
      callback: (token) => {
        void verifyToken(token);
      },
      "error-callback": () => {
        setWidgetError(true);
        toast({
          title: "Verification error",
          description:
            "Turnstile could not load. Add localhost to your Cloudflare Turnstile hostnames, then refresh.",
          variant: "destructive",
        });
      },
      "expired-callback": () => {
        if (widgetIdRef.current && window.turnstile) {
          window.turnstile.reset(widgetIdRef.current);
        }
      },
    });

    const timer = window.setTimeout(() => {
      const el = containerRef.current;
      if (!el || el.childElementCount > 0) return;
      setWidgetError(true);
    }, 8000);

    return () => window.clearTimeout(timer);
  }, [scriptReady, siteKey, verifyToken]);

  useEffect(() => {
    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
      renderedRef.current = false;
    };
  }, []);

  return (
    <div className={cn(className)}>
      <Script
        src={TURNSTILE_SCRIPT}
        strategy="afterInteractive"
        onLoad={() => setScriptReady(true)}
        onError={() => setScriptError(true)}
      />

      <AdminAuthShell>
        <div className="flex justify-center">
          <Link
            href="/"
            className="outline-offset-4 focus-visible:ring-2 focus-visible:ring-primary/40"
            aria-label="Petrosphere — back to website"
          >
            <img
              src="/petrologo-light.png"
              alt="Petrosphere"
              className="h-[4.5rem] w-auto object-contain sm:h-20"
              width={320}
              height={80}
            />
          </Link>
        </div>

        <div className="mt-9 text-center">
          <h1 className="text-[2rem] font-bold leading-tight tracking-tight text-[#111827]">
            Security check
          </h1>
          <p className="mt-2 text-[15px] text-[#6b7280]">
            Confirm you&apos;re human to continue to sign-in
          </p>
        </div>

        <div className="mt-10 flex min-h-[120px] flex-col items-center justify-center rounded-2xl bg-[#f3f4f6] px-4 py-8">
          {scriptError ? (
            <p className="text-center text-sm text-red-600">
              Could not load Cloudflare Turnstile. Check your connection and refresh.
            </p>
          ) : widgetError ? (
            <p className="text-center text-sm text-amber-800">
              Widget did not load. Add{" "}
              <code className="rounded bg-white px-1 text-[12px]">localhost</code> to Cloudflare
              Turnstile hostnames, then refresh.
            </p>
          ) : success ? (
            <div className="flex flex-col items-center gap-2 text-center">
              <CheckCircle2 className="size-7 text-emerald-600" aria-hidden />
              <p className="text-sm font-medium text-[#111827]">Verified</p>
              <p className="text-[13px] text-[#6b7280]">Opening sign-in…</p>
            </div>
          ) : !scriptReady ? (
            <div className="flex flex-col items-center gap-2.5 text-center">
              <Loader2 className="size-5 animate-spin text-[#00044a]" aria-hidden />
              <p className="text-sm text-[#6b7280]">Loading…</p>
            </div>
          ) : (
            <div
              ref={containerRef}
              className={cn("flex justify-center", pending && "pointer-events-none opacity-60")}
            />
          )}
        </div>

        <p className="mt-8 text-center text-[15px] text-[#6b7280]">
          Prefer the public site?{" "}
          <Link href="/" className="font-semibold text-[#00044a]">
            Leave
          </Link>
        </p>
      </AdminAuthShell>
    </div>
  );
}
