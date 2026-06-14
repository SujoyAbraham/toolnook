import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/admin-auth";

/**
 * Guards /admin pages only. The matcher is scoped strictly to /admin and
 * /admin/* so this middleware never runs on public requests (keeping us within
 * the Hobby plan's edge request budget). Unauthenticated requests are redirected
 * server-side before any admin page renders.
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // The login page must be reachable without a session.
  if (pathname === "/admin/login") return NextResponse.next();

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (await verifySessionToken(token)) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = "/admin/login";
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
