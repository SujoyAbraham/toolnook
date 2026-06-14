import Link from "next/link";
import { Github, Linkedin, Lock } from "lucide-react";
import { getHiddenTools } from "@/lib/visibility";
import { Topbar } from "@/components/layout/Topbar";
import { Sidebar } from "@/components/layout/Sidebar";

// Update these with your own profile URLs.
const GITHUB_URL = "https://github.com/SujoyAbraham";
const LINKEDIN_URL = "https://www.linkedin.com/in/your-profile";

/** Public shell: top bar, sidebar, footer. Admin pages deliberately omit this. */
export async function SiteShell({ children }: { children: React.ReactNode }) {
  const hidden = await getHiddenTools();
  return (
    <div className="flex min-h-screen flex-col">
      <Topbar hidden={hidden} />
      <div className="mx-auto flex w-full max-w-[1440px] flex-1">
        <Sidebar hidden={hidden} />
        <div className="flex min-w-0 flex-1 flex-col">
          <main className="flex-1 pb-12">{children}</main>
        </div>
      </div>

      {/* Always-visible compact footer bar, pinned to the bottom of the viewport. */}
      <footer className="fixed inset-x-0 bottom-0 z-30 flex h-10 items-center justify-between gap-4 border-t border-border bg-base/90 px-5 text-xs text-muted backdrop-blur">
        <p className="truncate">
          <span className="font-medium text-primary">ToolNook</span>
          <span className="hidden sm:inline"> · Everything runs in your browser · We never see your data</span>
        </p>
        <nav className="flex shrink-0 items-center gap-0.5" aria-label="Social and admin">
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            title="GitHub"
            className="inline-flex h-7 w-7 items-center justify-center rounded-md transition-colors hover:bg-elevated hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <Github size={15} />
          </a>
          <a
            href={LINKEDIN_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            title="LinkedIn"
            className="inline-flex h-7 w-7 items-center justify-center rounded-md transition-colors hover:bg-elevated hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <Linkedin size={15} />
          </a>
          <Link
            href="/admin"
            title="Admin"
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 transition-colors hover:bg-elevated hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <Lock size={13} />
            Admin
          </Link>
        </nav>
      </footer>
    </div>
  );
}
