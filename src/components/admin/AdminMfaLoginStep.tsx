"use client";

import React, { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";

import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

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
  const [showCode, setShowCode] = useState(false);

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
    <div>
      <div className="flex justify-center">
        <img
          src="/petrologo-light.png"
          alt="Petrosphere"
          className="h-[4.5rem] w-auto object-contain sm:h-20"
          width={320}
          height={80}
        />
      </div>

      <div className="mt-9">
        <h1 className="text-[2rem] font-bold leading-tight tracking-tight text-[#111827]">
          Authenticator code
        </h1>
        <p className="mt-2 text-[15px] text-[#6b7280]">
          Enter the 6-digit code from Microsoft Authenticator
        </p>
      </div>

      <form onSubmit={submit} className="mt-8 space-y-4">
        <div className="relative rounded-2xl border border-transparent bg-[#f3f4f6] px-4 pb-3 pt-2.5 transition-[box-shadow,background-color] focus-within:bg-white focus-within:shadow-[0_0_0_1.5px_#00044a]">
          <label htmlFor="mfa-code" className="block text-[12px] font-medium text-[#6b7280]">
            Code
          </label>
          <div className="relative mt-0.5 flex items-center">
            <input
              id="mfa-code"
              type={showCode ? "text" : "password"}
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              disabled={pending}
              autoComplete="one-time-code"
              className="w-full bg-transparent pr-9 text-[15px] font-medium tracking-[0.2em] text-[#111827] outline-none"
              placeholder="••••••"
            />
            <button
              type="button"
              aria-label={showCode ? "Hide code" : "Show code"}
              className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-[#9ca3af] hover:text-[#6b7280]"
              onClick={() => setShowCode((v) => !v)}
            >
              {showCode ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={pending || code.length !== 6}
          className="mt-2 flex h-[3.25rem] w-full items-center justify-center gap-2 rounded-2xl bg-[#00044a] text-[15px] font-semibold text-white transition hover:bg-[#00044a]/92 disabled:opacity-60"
        >
          {pending ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Verifying…
            </>
          ) : (
            "Verify & continue"
          )}
        </button>

        <button
          type="button"
          onClick={onBack}
          disabled={pending}
          className={cn(
            "w-full pt-2 text-center text-sm font-medium text-[#6b7280] hover:text-[#111827]",
            pending && "opacity-50",
          )}
        >
          Back to password
        </button>
      </form>
    </div>
  );
}
