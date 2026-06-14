import { cookies } from "next/headers";
import { LogOut } from "lucide-react";
import { auth } from "@/auth";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/admin-auth";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { logout } from "@/app/admin/actions";

export const metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Show "Log out" only when there is an active session (Google or password).
  const session = await auth();
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const loggedIn = Boolean(session?.user) || (await verifySessionToken(token));

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-14 items-center border-b border-border px-5">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between">
          <span className="flex items-center gap-2 text-[15px] font-semibold tracking-tight text-primary">
            <span className="h-2 w-2 rounded-[3px] bg-accent" aria-hidden />
            ToolNook
          </span>
          <div className="flex items-center gap-3">
            <span className="rounded border border-border px-2 py-0.5 text-xs text-muted">Admin</span>
            {loggedIn && (
              <form action={logout}>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-xs text-muted transition-colors hover:bg-elevated hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <LogOut size={13} />
                  Log out
                </button>
              </form>
            )}
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
