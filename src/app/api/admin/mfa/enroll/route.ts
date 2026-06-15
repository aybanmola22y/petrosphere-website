import { NextResponse } from "next/server";
import QRCode from "qrcode";

import { getVerifiedTotpFactor } from "@/lib/admin-mfa";
import { buildMfaTotpUri, MFA_TOTP_ISSUER } from "@/lib/totp-display";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/route-handler";

export const runtime = "nodejs";

export async function POST() {
  try {
    const { supabase, jsonResponse } = await createRouteHandlerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existing = await getVerifiedTotpFactor(supabase);
    if (existing) {
      return jsonResponse({ error: "Two-factor authentication is already enabled." }, { status: 409 });
    }

    const { data: factors } = await supabase.auth.mfa.listFactors();
    const pending = factors?.totp?.find((f) => f.status === "unverified");
    if (pending) {
      await supabase.auth.mfa.unenroll({ factorId: pending.id });
    }

    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: MFA_TOTP_ISSUER,
    });
    if (error || !data?.id || !data.totp) {
      return jsonResponse({ error: error?.message ?? "Could not start MFA enrollment." }, { status: 500 });
    }

    const email = user.email ?? "admin@petrosphere.com.ph";
    const uri = buildMfaTotpUri(data.totp.secret, email);
    const qrCode = await QRCode.toDataURL(uri, { margin: 1, width: 280 });

    return jsonResponse({
      factorId: data.id,
      qrCode,
      secret: data.totp.secret,
      uri,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Enrollment failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
