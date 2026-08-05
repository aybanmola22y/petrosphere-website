"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { AdminMfaLoginStep } from "@/components/admin/AdminMfaLoginStep";
import { AdminAuthShell } from "@/components/admin/AdminAuthLayout";

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
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function MicrosoftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 23 23" aria-hidden>
      <path fill="#f25022" d="M1 1h10v10H1z" />
      <path fill="#00a4ef" d="M12 1h10v10H12z" />
      <path fill="#7fba00" d="M1 12h10v10H1z" />
      <path fill="#ffb900" d="M12 12h10v10H12z" />
    </svg>
  );
}

function FloatingField({
  id,
  label,
  type,
  value,
  onChange,
  autoComplete,
  required,
  trailing,
}: {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  required?: boolean;
  trailing?: React.ReactNode;
}) {
  return (
    <div className="relative rounded-2xl border border-transparent bg-[#f3f4f6] px-4 pb-3 pt-2.5 transition-[box-shadow,background-color] focus-within:bg-white focus-within:shadow-[0_0_0_1.5px_#00044a]">
      <label htmlFor={id} className="block text-[12px] font-medium text-[#6b7280]">
        {label}
      </label>
      <div className="relative mt-0.5 flex items-center">
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          required={required}
          className={cn(
            "w-full bg-transparent text-[15px] font-medium text-[#111827] outline-none placeholder:text-[#9ca3af]",
            trailing && "pr-9",
          )}
        />
        {trailing}
      </div>
    </div>
  );
}

export function AdminLoginForm({ authConfigured }: { authConfigured: boolean }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [step, setStep] = useState<"credentials" | "mfa">("credentials");
  const [mfaChallenge, setMfaChallenge] = useState<{
    factorId: string;
    challengeId: string;
  } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      const j = (await res.json().catch(() => ({}))) as {
        error?: string;
        needsMfa?: boolean;
        factorId?: string;
        challengeId?: string;
      };
      if (!res.ok) {
        const needsTurnstile =
          res.status === 403 && j.error?.includes("security verification");
        toast({
          title: "Sign-in failed",
          description: needsTurnstile
            ? "Complete the security check on this page first, then try signing in again."
            : (j.error ?? "Invalid password"),
          variant: "destructive",
        });
        return;
      }
      if (j.needsMfa && j.factorId && j.challengeId) {
        setMfaChallenge({ factorId: j.factorId, challengeId: j.challengeId });
        setStep("mfa");
        return;
      }
      router.push("/admin");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  async function backFromMfa() {
    await fetch("/api/admin/logout", {
      method: "POST",
      credentials: "same-origin",
    }).catch(() => undefined);
    setStep("credentials");
    setMfaChallenge(null);
    setPassword("");
  }

  if (!authConfigured) {
    return (
      <AdminAuthShell>
        <div className="text-center">
          <h1 className="text-[1.75rem] font-bold tracking-tight text-[#111827]">
            Setup required
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-[#6b7280]">
            Configure Supabase environment variables in{" "}
            <code className="rounded bg-[#f3f4f6] px-1.5 py-0.5 font-mono text-[12px]">
              .env.local
            </code>{" "}
            and restart the server.
          </p>
          <Link
            href="/"
            className="mt-8 inline-flex h-12 w-full items-center justify-center rounded-2xl bg-[#00044a] text-[15px] font-semibold text-white"
          >
            Back to website
          </Link>
        </div>
      </AdminAuthShell>
    );
  }

  if (step === "mfa" && mfaChallenge) {
    return (
      <AdminAuthShell>
        <AdminMfaLoginStep
          factorId={mfaChallenge.factorId}
          challengeId={mfaChallenge.challengeId}
          onSuccess={() => {
            router.push("/admin");
            router.refresh();
          }}
          onBack={() => void backFromMfa()}
        />
      </AdminAuthShell>
    );
  }

  return (
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

      {/* Heading */}
      <div className="mt-9 text-center">
        <h1 className="text-[2rem] font-bold leading-tight tracking-tight text-[#111827]">
          Welcome Back
        </h1>
        <p className="mt-2 text-[15px] text-[#6b7280]">
          Sign in to access the administrator dashboard
        </p>
      </div>

      {/* Social */}
      <div className="mt-8 space-y-3">
        <button
          type="button"
          disabled
          title="Administrator login uses email and password only"
          className="flex h-[3.25rem] w-full items-center justify-center gap-3 rounded-2xl border border-[#e5e7eb] bg-white text-[15px] font-medium text-[#111827] opacity-70"
        >
          <GoogleIcon className="size-5" />
          Continue with Google
        </button>
        <button
          type="button"
          disabled
          title="Administrator login uses email and password only"
          className="flex h-[3.25rem] w-full items-center justify-center gap-3 rounded-2xl border border-[#e5e7eb] bg-white text-[15px] font-medium text-[#111827] opacity-70"
        >
          <MicrosoftIcon className="size-5" />
          Continue with Microsoft Account
        </button>
      </div>

      {/* Divider */}
      <div className="my-7 flex items-center gap-4">
        <div className="h-px flex-1 bg-[#e5e7eb]" />
        <span className="text-sm text-[#9ca3af]">Or</span>
        <div className="h-px flex-1 bg-[#e5e7eb]" />
      </div>

      {/* Form */}
      <form onSubmit={submit} className="space-y-4">
        <FloatingField
          id="admin-email"
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          autoComplete="username"
          required
        />

        <FloatingField
          id="admin-password"
          label="Password"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
          required
          trailing={
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-[#9ca3af] hover:text-[#6b7280]"
              onClick={() => setShowPassword((v) => !v)}
            >
              {showPassword ? (
                <EyeOff className="size-5" aria-hidden />
              ) : (
                <Eye className="size-5" aria-hidden />
              )}
            </button>
          }
        />

        <div className="flex items-center justify-between pt-1">
          <label className="flex cursor-pointer items-center gap-2.5 text-sm text-[#374151]">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="size-4 rounded border-[#d1d5db] text-[#00044a] accent-[#00044a]"
            />
            Remember me
          </label>
          <a
            href="mailto:admissions@petrosphere.com?subject=Admin%20password%20help"
            className="text-sm font-semibold text-[#111827] underline underline-offset-2"
          >
            Forgot Password?
          </a>
        </div>

        <button
          type="submit"
          disabled={pending}
          className="mt-2 flex h-[3.25rem] w-full items-center justify-center rounded-2xl bg-[#00044a] text-[15px] font-semibold text-white transition hover:bg-[#00044a]/92 disabled:opacity-60"
        >
          {pending ? "Signing in…" : "Login"}
        </button>
      </form>

      <p className="mt-8 text-center text-[15px] text-[#6b7280]">
        Prefer the public site?{" "}
        <Link href="/" className="font-semibold text-[#00044a]">
          Leave
        </Link>
      </p>
    </AdminAuthShell>
  );
}
