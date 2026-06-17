import { NextResponse } from "next/server";
import { auth } from "@/auth";

/**
 * Guards /admin pages only (matcher below), so this never runs on public
 * requests. Access requires a valid Google session (Auth.js), gated by the
 * ADMIN_ALLOWED_EMAILS allowlist. Unauthenticated requests are redirected to
 * the login page before any admin page renders.
 */
export default auth(async (req) => {
  const { pathname } = req.nextUrl;

  // The login page must be reachable without a session.
  if (pathname === "/admin/login") return NextResponse.next();

  // Google session (Auth.js attaches it to req.auth).
  if (req.auth?.user) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = "/admin/login";
  url.search = "";
  return NextResponse.redirect(url);
});

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
