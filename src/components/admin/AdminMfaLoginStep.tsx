"use client";

import React, { useState } from "react";
import { Loader2, ShieldCheck, Smartphone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const darkFieldClass =
  "h-12 rounded-2xl border border-white/12 bg-[#171717] px-4 py-3 text-[15px] text-white shadow-none outline-none ring-0 transition-[border-color,box-shadow] placeholder:text-neutral-600 focus-visible:border-white/22 focus-visible:ring-2 focus-visible:ring-white/18";

export function AdminMfaLoginStep({
  factorId,
  challengeId,
  onSuccess,
  onBack,
}: {
  factorId: string;
  challengeId: string;
  onSuccess: () => void;
  onBack: () => void;
}) {
  const [code, setCode] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (code.length !== 6) return;
    setPending(true);
    try {
      const res = await fetch("/api/admin/mfa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ factorId, challengeId, code }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        toast({
          title: "Invalid code",
          description: j.error ?? "Check Microsoft Authenticator and try again.",
          variant: "destructive",
        });
        setCode("");
        return;
      }
      onSuccess();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-[420px]">
      <div className="mb-10">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/6 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden />
          Step 2 · 2FA
        </div>
        <h2 className="admin-title text-3xl font-bold tracking-tight text-white sm:text-[2rem]">Authenticator code</h2>
        <p className="mt-2 text-[15px] leading-relaxed text-neutral-500">
          Open <span className="text-neutral-300">Microsoft Authenticator</span> and enter the 6-digit code for Petrosphere
          Admin.
        </p>
      </div>

      <div className="mb-8 flex items-start gap-4 rounded-2xl border border-white/10 bg-white/4 p-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-500/15 text-violet-200 ring-1 ring-violet-300/20">
          <Smartphone className="h-5 w-5" aria-hidden />
        </span>
        <div className="text-left text-sm leading-relaxed text-neutral-400">
          Codes refresh every 30 seconds. If you recently enabled 2FA, use the account you set up in the admin dashboard.
        </div>
      </div>

      <form onSubmit={submit} className="space-y-8">
        <div className="flex flex-col items-center gap-4">
          <InputOTP
            maxLength={6}
            value={code}
            onChange={setCode}
            disabled={pending}
            containerClassName="justify-center"
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} className={cn(darkFieldClass, "h-12 w-11 border-white/12 bg-[#171717] text-white")} />
              <InputOTPSlot index={1} className={cn(darkFieldClass, "h-12 w-11 border-white/12 bg-[#171717] text-white")} />
              <InputOTPSlot index={2} className={cn(darkFieldClass, "h-12 w-11 border-white/12 bg-[#171717] text-white")} />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              <InputOTPSlot index={3} className={cn(darkFieldClass, "h-12 w-11 border-white/12 bg-[#171717] text-white")} />
              <InputOTPSlot index={4} className={cn(darkFieldClass, "h-12 w-11 border-white/12 bg-[#171717] text-white")} />
              <InputOTPSlot index={5} className={cn(darkFieldClass, "h-12 w-11 border-white/12 bg-[#171717] text-white")} />
            </InputOTPGroup>
          </InputOTP>
        </div>

        <button
          type="submit"
          disabled={pending || code.length !== 6}
          className={cn(
            "flex h-[3.35rem] w-full items-center justify-center gap-2 rounded-2xl bg-white text-[15px] font-semibold tracking-tight text-neutral-950 transition hover:bg-neutral-100 disabled:opacity-55",
            "shadow-[0_16px_40px_-20px_rgba(255,255,255,0.35)]",
          )}
        >
          {pending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Verifying…
            </>
          ) : (
            <>
              <ShieldCheck className="h-4 w-4" aria-hidden />
              Verify & continue
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onBack}
          disabled={pending}
          className="w-full text-center text-sm font-medium text-neutral-500 transition hover:text-white"
        >
          ← Back to password
        </button>
      </form>
    </div>
  );
}
