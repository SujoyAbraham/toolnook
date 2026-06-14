import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/admin-auth";

/**
 * Guards /admin pages only (matcher below), so this never runs on public
 * requests. Access is granted by EITHER a valid Google session (Auth.js) OR a
 * valid password session cookie. Unauthenticated requests are redirected to the
 * login page before any admin page renders.
 */
export default auth(async (req) => {
  const { pathname } = req.nextUrl;

  // The login page must be reachable without a session.
  if (pathname === "/admin/login") return NextResponse.next();

  // Google session (Auth.js attaches it to req.auth).
  if (req.auth?.user) return NextResponse.next();

  // Password session.
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (await verifySessionToken(token)) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = "/admin/login";
  url.search = "";
  return NextResponse.redirect(url);
});

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
