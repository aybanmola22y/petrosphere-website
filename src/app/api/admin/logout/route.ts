import { NextResponse } from "next/server";

import { createRouteHandlerSupabaseClient } from "@/lib/supabase/route-handler";

export async function POST() {
  try {
    const { supabase, jsonResponse } = await createRouteHandlerSupabaseClient();
    await supabase.auth.signOut();
    return jsonResponse({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
