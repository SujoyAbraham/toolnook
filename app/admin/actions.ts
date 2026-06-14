"use server";

import { cookies } from "next/headers";
import { signIn, signOut } from "@/auth";
import { SESSION_COOKIE, clearedCookieOptions } from "@/lib/admin-auth";

/** Start the Google OAuth flow, returning to the dashboard on success. */
export async function googleSignIn() {
  await signIn("google", { redirectTo: "/admin" });
}

/** Log out of whichever session is active: clear the password cookie and the
 *  Auth.js (Google) session, then return to the login page. */
export async function logout() {
  const store = await cookies();
  store.set(SESSION_COOKIE, "", clearedCookieOptions);
  await signOut({ redirectTo: "/admin/login" });
}
