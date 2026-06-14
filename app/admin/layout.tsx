import { ThemeToggle } from "@/components/layout/ThemeToggle";

export const metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-14 items-center border-b border-border px-5">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between">
          <span className="flex items-center gap-2 text-[15px] font-semibold tracking-tight text-primary">
            <span className="h-2 w-2 rounded-[3px] bg-accent" aria-hidden />
            ToolVault
          </span>
          <div className="flex items-center gap-3">
            <span className="rounded border border-border px-2 py-0.5 text-xs text-muted">Admin</span>
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
