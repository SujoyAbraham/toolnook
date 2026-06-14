import { SiteShell } from "@/components/layout/SiteShell";

/**
 * Shared shell for all public pages. Living in a layout (rather than being
 * rendered per-page) means the top bar and sidebar persist across client
 * navigations — so the sidebar keeps its scroll position when you switch tools.
 * Admin pages sit outside this group and deliberately omit the shell.
 */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return <SiteShell>{children}</SiteShell>;
}
