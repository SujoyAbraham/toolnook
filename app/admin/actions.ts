"use server";

import { signIn, signOut } from "@/auth";

/** Start the Google OAuth flow, returning to the dashboard on success. */
export async function googleSignIn() {
  await signIn("google", { redirectTo: "/admin" });
}

/** Log out of the Auth.js (Google) session, then return to the login page. */
export async function logout() {
  await signOut({ redirectTo: "/admin/login" });
}
