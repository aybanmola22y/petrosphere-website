import { NextResponse } from "next/server";

import { getVerifiedTotpFactor, getUnverifiedTotpFactor } from "@/lib/admin-mfa";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/route-handler";

export const runtime = "nodejs";

export async function GET() {
  try {
    const { supabase } = await createRouteHandlerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const verified = await getVerifiedTotpFactor(supabase);
    const pending = await getUnverifiedTotpFactor(supabase);

    return NextResponse.json({
      enrolled: Boolean(verified),
      factorId: verified?.id ?? pending?.id ?? null,
      friendlyName: verified?.friendly_name ?? pending?.friendly_name ?? null,
      email: user.email ?? null,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to load MFA status";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
