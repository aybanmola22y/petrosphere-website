"use client";

import React, { useState } from "react";

import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { AdminTurnstileGate } from "@/components/admin/AdminTurnstileGate";

export function AdminLoginShell({
  authConfigured,
  turnstileSiteKey,
  turnstileConfigured,
}: {
  authConfigured: boolean;
  turnstileSiteKey: string | null;
  turnstileConfigured: boolean;
}) {
  const [verified, setVerified] = useState(false);

  const turnstileRequired = Boolean(turnstileSiteKey);

  if (turnstileRequired && !verified && turnstileSiteKey) {
    return <AdminTurnstileGate siteKey={turnstileSiteKey} onVerified={() => setVerified(true)} />;
  }

  return (
    <>
      {!turnstileConfigured ? (
        <p className="sr-only">Turnstile is not configured — set NEXT_PUBLIC_TURNSTILE_SITE_KEY and TURNSTILE_SECRET_KEY.</p>
      ) : null}
      <AdminLoginForm authConfigured={authConfigured} />
    </>
  );
}
