"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Script from "next/script";
import { CheckCircle2, Loader2, Lock, ShieldCheck, Sparkles } from "lucide-react";

import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

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

const PROTECTION_POINTS = [
  {
    icon: ShieldCheck,
    title: "Bot & abuse filtering",
    description: "Cloudflare Turnstile blocks automated login attempts before they reach your credentials.",
  },
  {
    icon: Lock,
    title: "Admin-only access",
    description: "This checkpoint runs only for the Petrosphere content dashboard — not public visitors.",
  },
  {
    icon: Sparkles,
    title: "Frictionless when trusted",
    description: "Most legitimate sessions pass in seconds; suspicious traffic gets challenged.",
  },
] as const;

function StepBadge({ step, label }: { step: string; label: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/6 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">
      <span className="h-1.5 w-1.5 rounded-full bg-violet-300 shadow-[0_0_10px_rgba(196,181,253,0.9)]" aria-hidden />
      {step} · {label}
    </div>
  );
}

function TurnstileHero() {
  return (
    <div className="relative flex min-h-[44vh] flex-col overflow-hidden rounded-b-[28px] p-8 text-white lg:min-h-screen lg:rounded-br-[36px] lg:rounded-tr-[36px] lg:p-11">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-linear-to-b from-[#6d28d9] via-[#4c1d95] to-[#09090b]" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_70%_-5%,rgba(167,139,250,0.45),transparent_55%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-size-[20px_20px] bg-[radial-gradient(circle,rgba(255,255,255,0.12)_1px,transparent_1px)] opacity-[0.22]"
      />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        <Link
          href="/"
          className="inline-flex w-fit items-center rounded-lg outline-offset-4 ring-white/40 focus-visible:ring-2"
          aria-label="Petrosphere — back to website"
        >
          <img src="/petrologo.png" alt="" className="h-10 w-auto object-contain lg:h-11" width={160} height={48} />
        </Link>

        <div className="mt-8 lg:mt-10">
          <StepBadge step="Step 1" label="Security" />
          <h1 className="admin-title mt-5 max-w-[16ch] text-pretty text-2xl font-bold leading-tight tracking-tight text-white sm:text-3xl lg:text-[2.15rem]">
            Verify before you sign in
          </h1>
          <p className="mt-3 max-w-md text-[15px] leading-relaxed text-white/65">
            A quick security check protects your admin workspace from bots and credential-stuffing attacks. Once verified,
            you&apos;ll continue to the sign-in screen.
          </p>
        </div>

        <ul className="mt-8 space-y-4 lg:mt-10">
          {PROTECTION_POINTS.map(({ icon: Icon, title, description }) => (
            <li
              key={title}
              className="flex gap-4 rounded-2xl border border-white/10 bg-white/6 p-4 backdrop-blur-sm transition-colors hover:bg-white/8"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-violet-100 ring-1 ring-white/12">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <div className="min-w-0 text-left">
                <p className="text-sm font-semibold text-white">{title}</p>
                <p className="mt-1 text-[13px] leading-relaxed text-white/58">{description}</p>
              </div>
            </li>
          ))}
        </ul>

        <p className="mt-auto hidden pt-10 text-[12px] font-medium uppercase tracking-[0.16em] text-white/40 lg:block">
          Powered by Cloudflare Turnstile
        </p>
      </div>
    </div>
  );
}

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
      theme: "dark",
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

  const statusLabel = success
    ? "Verified — opening sign-in"
    : pending
      ? "Confirming your session"
      : !scriptReady
        ? "Preparing secure challenge"
        : "Complete the check below";

  return (
    <div className={cn("min-h-screen bg-black lg:bg-[#030303]", className)}>
      <Script
        src={TURNSTILE_SCRIPT}
        strategy="afterInteractive"
        onLoad={() => setScriptReady(true)}
        onError={() => setScriptError(true)}
      />

      <div className="flex min-h-screen flex-col lg:grid lg:min-h-screen lg:grid-cols-[minmax(302px,44%)_minmax(0,1fr)]">
        <TurnstileHero />

        <div className="flex flex-1 flex-col justify-center bg-black px-5 py-10 sm:px-10 lg:px-14 lg:py-16 xl:px-20">
          <div className="mx-auto w-full max-w-[440px]">
            <div className="mb-8 lg:hidden">
              <StepBadge step="Step 1" label="Security" />
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#0c0c0c] p-6 shadow-[0_28px_80px_-40px_rgba(109,40,217,0.55)] sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="admin-title text-xl font-bold tracking-tight text-white sm:text-2xl">Security check</h2>
                  <p className="mt-2 text-[14px] leading-relaxed text-neutral-400">
                    Confirm you&apos;re human to continue. This usually takes a few seconds.
                  </p>
                </div>
                <span
                  className={cn(
                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ring-1",
                    success
                      ? "bg-emerald-500/15 text-emerald-300 ring-emerald-400/20"
                      : "bg-violet-500/12 text-violet-200 ring-violet-300/15",
                  )}
                  aria-hidden
                >
                  {success ? <CheckCircle2 className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
                </span>
              </div>

              <div className="mt-6 rounded-2xl border border-white/8 bg-black/50 px-4 py-3">
                <div className="flex items-center gap-3">
                  {success ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" aria-hidden />
                  ) : pending || !scriptReady ? (
                    <Loader2 className="h-4 w-4 shrink-0 animate-spin text-violet-300" aria-hidden />
                  ) : (
                    <span className="h-2 w-2 shrink-0 rounded-full bg-violet-400 shadow-[0_0_8px_rgba(167,139,250,0.8)]" aria-hidden />
                  )}
                  <p className="text-[13px] font-medium text-neutral-300">{statusLabel}</p>
                </div>
                <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/8">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-700 ease-out",
                      success ? "w-full bg-emerald-400" : pending ? "w-2/3 bg-violet-400" : scriptReady ? "w-1/3 bg-violet-400/80" : "w-1/6 bg-white/20",
                    )}
                  />
                </div>
              </div>

              <div className="mt-8 flex min-h-[84px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/10 bg-white/2 px-4 py-5">
                {scriptError ? (
                  <p className="text-center text-sm leading-relaxed text-red-400">
                    Could not load Cloudflare Turnstile. Check your connection and refresh this page.
                  </p>
                ) : widgetError ? (
                  <p className="text-center text-sm leading-relaxed text-amber-300/95">
                    Widget did not load. In Cloudflare Turnstile → Hostnames, add{" "}
                    <code className="rounded bg-white/10 px-1.5 py-0.5 text-[12px]">localhost</code> and{" "}
                    <code className="rounded bg-white/10 px-1.5 py-0.5 text-[12px]">127.0.0.1</code>, then hard-refresh.
                  </p>
                ) : success ? (
                  <div className="flex flex-col items-center gap-2 text-center">
                    <CheckCircle2 className="h-8 w-8 text-emerald-400" aria-hidden />
                    <p className="text-sm font-medium text-white">Verification successful</p>
                    <p className="text-[13px] text-neutral-500">Redirecting to sign-in…</p>
                  </div>
                ) : !scriptReady ? (
                  <div className="flex flex-col items-center gap-3 text-center">
                    <Loader2 className="h-6 w-6 animate-spin text-violet-300" aria-hidden />
                    <p className="text-sm text-neutral-500">Loading secure challenge…</p>
                  </div>
                ) : (
                  <div ref={containerRef} className={cn("flex justify-center", pending && "pointer-events-none opacity-60")} />
                )}
              </div>

              <p className="mt-6 text-center text-[12px] leading-relaxed text-neutral-600">
                Step 2 of 2: email & password sign-in opens automatically after verification.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
