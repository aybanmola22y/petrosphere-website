"use client";

import React, { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Loader2, QrCode, ShieldCheck, Smartphone } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "@/hooks/use-toast";
import { MFA_TOTP_ISSUER } from "@/lib/totp-display";

type MfaStatus = {
  enrolled: boolean;
  factorId: string | null;
  friendlyName: string | null;
  email: string | null;
};

function QrCodeImage({ qrCode }: { qrCode: string }) {
  if (qrCode.startsWith("data:image")) {
    return (
      <img
        src={qrCode}
        alt="QR code for Microsoft Authenticator"
        className="h-44 w-44 rounded-xl border border-black/10 bg-white p-3"
      />
    );
  }
  if (qrCode.trim().startsWith("<svg")) {
    return (
      <div
        className="h-44 w-44 rounded-xl border border-black/10 bg-white p-3 [&_svg]:h-full [&_svg]:w-full"
        dangerouslySetInnerHTML={{ __html: qrCode }}
      />
    );
  }
  return (
    <img
      src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(qrCode)}`}
      alt="QR code for Microsoft Authenticator"
      className="h-44 w-44 rounded-xl border border-black/10 bg-white p-3"
    />
  );
}

type EnrollPayload = {
  factorId: string;
  qrCode: string;
  secret: string;
};

export function AdminMfaSecurityCard() {
  const [status, setStatus] = useState<MfaStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [enroll, setEnroll] = useState<EnrollPayload | null>(null);
  const [code, setCode] = useState("");
  const [pending, setPending] = useState(false);

  const loadStatus = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/mfa/status", { credentials: "same-origin" });
      if (!res.ok) throw new Error("Failed to load MFA status");
      setStatus((await res.json()) as MfaStatus);
    } catch {
      setStatus(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  async function startEnroll() {
    setPending(true);
    try {
      const res = await fetch("/api/admin/mfa/enroll", { method: "POST", credentials: "same-origin" });
      const j = (await res.json().catch(() => ({}))) as EnrollPayload & { error?: string };
      if (!res.ok) {
        toast({ title: "Setup failed", description: j.error ?? `HTTP ${res.status}`, variant: "destructive" });
        return;
      }
      setEnroll({ factorId: j.factorId, qrCode: j.qrCode, secret: j.secret });
      setCode("");
    } finally {
      setPending(false);
    }
  }

  async function confirmEnroll(e: React.FormEvent) {
    e.preventDefault();
    if (!enroll || code.length !== 6) return;
    setPending(true);
    try {
      const res = await fetch("/api/admin/mfa/enroll/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ factorId: enroll.factorId, code }),
      });
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        toast({ title: "Invalid code", description: j.error ?? "Try again.", variant: "destructive" });
        setCode("");
        return;
      }
      toast({
        title: "2FA enabled",
        description: "Microsoft Authenticator is now required when you sign in.",
      });
      setEnroll(null);
      setCode("");
      await loadStatus();
    } finally {
      setPending(false);
    }
  }

  return (
    <Card className="overflow-hidden rounded-3xl border-black/5 bg-white shadow-[0_10px_30px_-20px_rgba(16,24,40,0.35)]">
      <CardHeader className="border-b border-black/5 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-base tracking-tight">
              <ShieldCheck className="size-4 text-primary" aria-hidden />
              Two-factor authentication
            </CardTitle>
            <CardDescription>Use Microsoft Authenticator for an extra sign-in step.</CardDescription>
          </div>
          {loading ? (
            <Loader2 className="size-4 animate-spin text-muted-foreground" aria-hidden />
          ) : status?.enrolled ? (
            <Badge className="rounded-full bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/10">Active</Badge>
          ) : (
            <Badge variant="secondary" className="rounded-full bg-amber-500/10 text-amber-800 hover:bg-amber-500/10">
              Not set up
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4 p-5">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading security settings…</p>
        ) : status?.enrolled ? (
          <div className="flex items-start gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" aria-hidden />
            <div className="text-sm leading-relaxed text-muted-foreground">
              <p className="font-medium text-foreground">Microsoft Authenticator is enabled</p>
              <p className="mt-1">
                Each sign-in will ask for your password, then a 6-digit code from the app
                {status.email ? ` (${status.email})` : ""}.
              </p>
            </div>
          </div>
        ) : enroll ? (
          <form onSubmit={confirmEnroll} className="space-y-4">
            <div className="rounded-2xl border border-black/5 bg-secondary/30 p-4">
              <p className="text-sm font-medium text-foreground">1. Scan with Microsoft Authenticator</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Open the app → <strong>Add account</strong> → <strong>Other</strong> → scan this QR code. It will appear as{" "}
                <strong>{MFA_TOTP_ISSUER}</strong>.
              </p>
              <div className="mt-4 flex flex-col items-center gap-3">
                <QrCodeImage qrCode={enroll.qrCode} />
                <p className="text-center text-[11px] text-muted-foreground">
                  Manual key: <code className="rounded bg-black/5 px-1.5 py-0.5 font-mono text-[10px]">{enroll.secret}</code>
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-black/5 bg-secondary/30 p-4">
              <p className="text-sm font-medium text-foreground">2. Enter the 6-digit code</p>
              <div className="mt-4 flex justify-center">
                <InputOTP maxLength={6} value={code} onChange={setCode} disabled={pending}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={pending || code.length !== 6} className="rounded-full">
                {pending ? "Verifying…" : "Enable 2FA"}
              </Button>
              <Button type="button" variant="ghost" className="rounded-full" disabled={pending} onClick={() => setEnroll(null)}>
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <>
            <div className="flex items-start gap-3 text-sm leading-relaxed text-muted-foreground">
              <Smartphone className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
              <p>
                Protect your admin account with TOTP codes. Scan as{" "}
                <strong className="font-medium text-foreground">{MFA_TOTP_ISSUER}</strong> in Microsoft
                Authenticator (or any authenticator app).
              </p>
            </div>
            <Button onClick={startEnroll} disabled={pending} className="w-full rounded-full sm:w-auto">
              {pending ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  Preparing…
                </>
              ) : (
                <>
                  <QrCode className="size-4" aria-hidden />
                  Set up Microsoft Authenticator
                </>
              )}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
