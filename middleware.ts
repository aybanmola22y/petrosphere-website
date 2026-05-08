import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Optional: keeps Supabase auth cookies fresh for SSR/RSC.
 * Safe to keep even if you don't use auth yet.
 */
export async function middleware(request: NextRequest) {
  // Prefer Website Supabase if configured; fall back to default (TMS) vars.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL_WEBSITE ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_WEBSITE ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If env isn't configured (e.g. local before setup), don't break the app.
  if (!url || !anonKey) return NextResponse.next();

  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  // Touch auth to refresh session if present.
  await supabase.auth.getUser().catch(() => null);
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - next internals
     * - static files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};

