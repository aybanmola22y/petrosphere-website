"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import Lottie from "lottie-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

/** Swap this file with any JSON export from LottieFiles (Animation → Download → Lottie JSON). */
const LOGIN_LOTTIE_SRC = "/lottie/admin-login.json";

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

/** Same markup for SSR, hydration, and fetch — avoids reduced-motion / client-only branches on first paint. */
function LottieLoadingPlaceholder() {
  return (
    <div
      className="flex min-h-[220px] flex-1 flex-col items-center justify-center px-6 py-8"
      aria-busy="true"
      aria-label="Loading animation"
    >
      <div className="h-56 w-full max-w-[280px] animate-pulse rounded-[28px] bg-white/8 ring-1 ring-white/12" />
    </div>
  );
}

function LoginHeroAnimation() {
  const [mounted, setMounted] = useState(false);
  const [animationData, setAnimationData] = useState<object | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    let cancelled = false;
    fetch(LOGIN_LOTTIE_SRC)
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json();
      })
      .then((data) => {
        if (!cancelled) setAnimationData(data);
      })
      .catch(() => {
        if (!cancelled) setLoadFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [mounted]);

  if (!mounted || !animationData || loadFailed) {
    return <LottieLoadingPlaceholder />;
  }

  return (
    <div className="flex min-h-[200px] flex-1 flex-col items-center justify-center px-4 py-4 lg:px-8 lg:py-6">
      <div className="w-full max-w-[300px] filter-[drop-shadow(0_28px_52px_rgba(0,0,0,0.42))]">
        <Lottie animationData={animationData} loop className="h-auto w-full" aria-hidden />
      </div>
    </div>
  );
}

const darkFieldClass =
  "h-12 rounded-2xl border border-white/12 bg-[#171717] px-4 py-3 text-[15px] text-white shadow-none outline-none ring-0 transition-[border-color,box-shadow] placeholder:text-neutral-600 focus-visible:border-white/22 focus-visible:ring-2 focus-visible:ring-white/18";

/** Hero column — gradient + logo + headline + Lottie (replace JSON in `/public/lottie/`). */
function LoginHero({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative flex flex-col overflow-hidden rounded-b-[28px] p-8 text-white lg:rounded-br-[36px] lg:rounded-tr-[36px] lg:p-11",
        className,
      )}
    >
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

        <div className="mt-6 shrink-0 lg:mt-8">
          <h1 className="admin-title max-w-[18ch] text-pretty text-2xl font-bold leading-tight tracking-tight text-white sm:text-3xl lg:text-[2.15rem]">
            Welcome back
          </h1>
          <p className="mt-2 max-w-sm text-[15px] leading-relaxed text-white/60">Use the secure sign-in panel to continue.</p>
        </div>

        <LoginHeroAnimation />

        <div className="mt-auto shrink-0 pt-6 lg:pt-8">
          <Link href="/" className="text-sm font-medium text-white/52 transition-colors hover:text-white">
            ← Back to website
          </Link>
        </div>
      </div>
    </div>
  );
}

function FormDividerOr() {
  return (
    <div className="relative flex items-center gap-4 py-1">
      <div className="h-px flex-1 bg-white/12" />
      <span className="text-[13px] font-medium text-neutral-600">Or</span>
      <div className="h-px flex-1 bg-white/12" />
    </div>
  );
}

export function AdminLoginForm({
  passwordConfigured,
  defaultDevPassword,
}: {
  passwordConfigured: boolean;
  /** Prefills the field in dev so you can sign in immediately */
  defaultDevPassword?: string | null;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("admin@petrosphere.local");
  const [password, setPassword] = useState(() => defaultDevPassword ?? "");
  const [pending, setPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        toast({
          title: "Sign-in failed",
          description: j.error ?? "Invalid password",
          variant: "destructive",
        });
        return;
      }
      router.push("/admin");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="min-h-screen bg-black lg:bg-[#030303]">
      <div className="flex min-h-screen flex-col lg:grid lg:min-h-screen lg:grid-cols-[minmax(302px,44%)_minmax(0,1fr)] lg:gap-0">
        {/* Hero — stacked on mobile */}
        <LoginHero className="min-h-[52vh] shrink-0 lg:min-h-screen lg:border-r lg:border-white/6" />

        {/* Form panel */}
        <div className="flex flex-1 flex-col bg-black px-5 pb-14 pt-8 sm:px-10 lg:justify-center lg:px-14 lg:py-16 xl:px-20">
          <div className="mx-auto w-full max-w-[420px]">
            {!passwordConfigured ? (
              <div>
                <h2 className="admin-title text-3xl font-bold tracking-tight text-white">Setup required</h2>
                <p className="mt-2 text-[15px] leading-relaxed text-neutral-400">
                  Set <code className="rounded-lg bg-white/8 px-2 py-0.5 font-mono text-[13px] text-neutral-200">ADMIN_PASSWORD</code> in{" "}
                  <code className="rounded-lg bg-white/8 px-2 py-0.5 font-mono text-[13px] text-neutral-200">.env.local</code>, restart the dev
                  server, then reload.
                </p>
                <Button
                  variant="outline"
                  asChild
                  className="mt-10 h-12 w-full rounded-2xl border-white/15 bg-transparent font-semibold text-white hover:bg-white/6"
                >
                  <Link href="/">Return to website</Link>
                </Button>
              </div>
            ) : (
              <>
                <div className="mb-10">
                  <h2 className="admin-title text-3xl font-bold tracking-tight text-white sm:text-[2rem]">Sign in</h2>
                  <p className="mt-2 text-[15px] leading-relaxed text-neutral-500">Enter your email and password to open the dashboard.</p>
                </div>

                <button
                  type="button"
                  disabled
                  title="Administrator login uses email and password only."
                  aria-label="Google sign-in is not available for administrator accounts"
                  className="flex h-12 w-full items-center justify-center gap-3 rounded-2xl border border-white/14 bg-transparent text-[15px] font-semibold text-white/78 transition-colors disabled:cursor-not-allowed disabled:opacity-[0.68]"
                >
                  <GoogleIcon className="h-5 w-5 shrink-0 opacity-95" />
                  Continue with Google
                </button>

                <div className="my-8">
                  <FormDividerOr />
                </div>

                <form onSubmit={submit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="admin-email" className="text-sm font-medium text-neutral-300">
                      Email address
                    </Label>
                    <Input
                      id="admin-email"
                      type="email"
                      autoComplete="username"
                      placeholder="you@organization.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className={darkFieldClass}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-4">
                      <Label htmlFor="admin-password" className="text-sm font-medium text-neutral-300">
                        Password
                      </Label>
                    </div>
                    <div className="relative">
                      <Input
                        id="admin-password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className={cn(darkFieldClass, "pr-12")}
                      />
                      <button
                        type="button"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        title={showPassword ? "Hide password" : "Show password"}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-neutral-500 outline-offset-2 transition-colors hover:bg-white/8 hover:text-neutral-300 focus-visible:ring-2 focus-visible:ring-white/25"
                        onClick={() => setShowPassword((v) => !v)}
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" aria-hidden /> : <Eye className="h-5 w-5" aria-hidden />}
                      </button>
                    </div>
                    <p className="text-[13px] text-neutral-600">Secure credentials required for administrator access.</p>
                  </div>

                  <button
                    type="submit"
                    disabled={pending}
                    className={cn(
                      "flex h-[3.35rem] w-full items-center justify-center rounded-2xl bg-white text-[15px] font-semibold tracking-tight text-neutral-950 transition hover:bg-neutral-100 disabled:opacity-55",
                      "shadow-[0_16px_40px_-20px_rgba(255,255,255,0.35)]",
                    )}
                  >
                    {pending ? "Signing in…" : "Sign in"}
                  </button>
                </form>

                <p className="mt-10 text-center text-[15px] text-neutral-500">
                  <span className="text-neutral-500">Prefer the public site? </span>
                  <Link href="/" className="font-semibold text-white underline-offset-4 hover:underline">
                    Leave
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
