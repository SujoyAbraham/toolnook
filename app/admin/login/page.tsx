import { LoginForm } from "@/components/admin/LoginForm";
import { googleSignIn } from "@/app/admin/actions";

// Show the Google button only when the OAuth credentials are configured.
const googleEnabled = Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);

function GoogleMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" aria-hidden>
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18Z" />
      <path fill="#FBBC05" d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33Z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z" />
    </svg>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-6">
      <div className="w-full max-w-sm rounded-lg border border-border bg-surface p-6">
        <h1 className="text-lg font-semibold tracking-tight text-primary">Admin access</h1>
        <p className="mt-1 text-sm text-muted">Sign in to manage tool visibility.</p>

        {googleEnabled && (
          <>
            <form action={googleSignIn} className="mt-5">
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2.5 rounded-md border border-border bg-base px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-elevated focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <GoogleMark />
                Continue with Google
              </button>
            </form>

            <div className="my-5 flex items-center gap-3 text-xs text-muted">
              <span className="h-px flex-1 bg-border" />
              or
              <span className="h-px flex-1 bg-border" />
            </div>
          </>
        )}

        <LoginForm />
      </div>
    </div>
  );
}
