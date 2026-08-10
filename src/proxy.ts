import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";

// Fast-path only: redirects obviously-logged-out requests before any
// server-rendering starts, purely for UX/perf. This checks cookie
// *presence*, not validity — it cannot reach Postgres from the Edge runtime
// without extra plumbing, and doesn't need to. The actual authorization
// check (signature/expiry/revocation, all DB-backed) lives in
// src/app/admin/(protected)/layout.tsx and src/lib/auth/requireAdmin.ts,
// both of which run in the Node.js runtime with full Prisma access and are
// never bypassed by this file being wrong, missing, or misconfigured.
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname === "/admin/login") return NextResponse.next();

  const hasSessionCookie = Boolean(req.cookies.get(SESSION_COOKIE_NAME)?.value);

  if (!hasSessionCookie) {
    if (pathname.startsWith("/api/admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = new URL("/admin/login", req.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
