import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

/**
 * Google sign-in for the admin area, gated by an email allowlist.
 *
 * Only addresses listed in ADMIN_ALLOWED_EMAILS (comma-separated) may sign in;
 * anyone else completing the Google flow is rejected before a session is issued.
 * Auth.js reads AUTH_SECRET, AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET from env.
 */
const allowedEmails = (process.env.ADMIN_ALLOWED_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [Google],
  pages: { signIn: "/admin/login" },
  callbacks: {
    // Reject any Google account whose email is not on the allowlist.
    signIn({ account, profile }) {
      if (account?.provider !== "google") return false;
      const email = profile?.email?.toLowerCase();
      const verified = profile?.email_verified === true;
      return Boolean(email && verified && allowedEmails.includes(email));
    },
  },
});
