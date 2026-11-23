import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const staffPaths = ["/admin", "/dashboard", "/candidates", "/companies", "/vacancies", "/settings"];

export async function middleware(request: NextRequest) {
  const hasSupabaseConfiguration = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );

  // Public registration/login pages and APIs remain reachable in an unconfigured
  // local checkout. Protected pages redirect instead of producing a server error.
  if (!hasSupabaseConfiguration) {
    const { pathname } = request.nextUrl;
    if (pathname === "/candidate") {
      return NextResponse.redirect(new URL("/candidate/login", request.url));
    }
    if (pathname === "/" || staffPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
      return NextResponse.redirect(new URL("/login?error=Supabase%20is%20not%20configured", request.url));
    }
  }

  return updateSession(request);
}
export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"] };
