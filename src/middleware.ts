import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { isSuspiciousRequestUrl } from "@/lib/security";
import type { Database } from "@/lib/supabase/types/database";

function isAdminPath(pathname: string): boolean {
  return pathname.startsWith("/admin") || pathname.startsWith("/api/admin");
}

export async function middleware(request: NextRequest) {
  if (isSuspiciousRequestUrl(request.nextUrl)) {
    return new NextResponse("Bad Request", { status: 400 });
  }

  if (!isAdminPath(request.nextUrl.pathname)) {
    return NextResponse.next({ request });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL_WEBSITE?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_WEBSITE?.trim();

  if (!url || !key) {
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  await supabase.auth.getUser();
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?|xml|txt)$).*)",
  ],
};
