"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronsLeft, Home, Star } from "lucide-react";
import { categories, getToolsByCategory } from "@/lib/tools-registry";
import { useEffectiveHidden } from "@/lib/visibility-client";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

const COLLAPSE_KEY = "toolvault-sidebar-collapsed";

export function Sidebar({ hidden }: { hidden: string[] }) {
  const pathname = usePathname();
  const effectiveHidden = useEffectiveHidden(hidden);
  const hiddenSet = new Set(effectiveHidden);

  const [collapsed, setCollapsed] = useState(false);
  const activeRef = useRef<HTMLAnchorElement>(null);

  // Restore collapse preference, then keep it in sync.
  useEffect(() => {
    setCollapsed(localStorage.getItem(COLLAPSE_KEY) === "1");
  }, []);
  function toggle() {
    setCollapsed((c) => {
      const next = !c;
      localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
      return next;
    });
  }

  // On first load (e.g. deep-linking a tool), bring the active item into view.
  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "nearest" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const groups = categories
    .map((category) => ({
      category,
      tools: getToolsByCategory(category.id).filter((t) => !hiddenSet.has(t.slug)),
    }))
    .filter((g) => g.tools.length > 0);

  function Row({
    href,
    icon,
    label,
    active,
    isNew,
  }: {
    href: string;
    icon: string;
    label: string;
    active?: boolean;
    isNew?: boolean;
  }) {
    return (
      <Link
        ref={active ? activeRef : undefined}
        href={href}
        title={collapsed ? label : undefined}
        aria-current={active ? "page" : undefined}
        className={cn(
          "group relative flex items-center rounded-md text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent",
          collapsed ? "justify-center px-0 py-2" : "gap-2.5 px-2.5 py-1.5",
          active
            ? "bg-elevated font-medium text-primary"
            : "text-muted hover:bg-elevated/60 hover:text-primary",
        )}
      >
        {active && (
          <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-accent" />
        )}
        <Icon
          name={icon}
          size={17}
          strokeWidth={1.85}
          className={cn("shrink-0", active ? "text-accent" : "text-muted group-hover:text-primary")}
        />
        {!collapsed && <span className="flex-1 truncate">{label}</span>}
        {!collapsed && isNew && (
          <span className="text-[9px] font-semibold uppercase tracking-wider text-accent">New</span>
        )}
      </Link>
    );
  }

  return (
    <aside
      className={cn(
        "sticky top-14 hidden h-[calc(100vh-3.5rem)] shrink-0 flex-col border-r border-border md:flex",
        collapsed ? "w-[64px]" : "w-60",
      )}
    >
      <nav className="flex-1 overflow-y-auto px-2.5 py-4">
        {/* Pinned shortcuts */}
        <div className="space-y-px">
          <Row href="/" icon="Home" label="Home" active={pathname === "/"} />
          <Row href="/#popular" icon="Star" label="Popular" />
        </div>

        <div className="my-3 h-px bg-border" />

        {/* Categorised tools */}
        <div className="space-y-5">
          {groups.map(({ category, tools }) => (
            <div key={category.id}>
              {collapsed ? (
                <div className="mb-1 flex justify-center text-muted" title={category.label}>
                  <Icon name={category.icon} size={13} />
                </div>
              ) : (
                <p className="flex items-center justify-between px-2.5 pb-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-muted">
                  <span>{category.label}</span>
                  <span className="tabular-nums opacity-60">{tools.length}</span>
                </p>
              )}
              <ul className="space-y-px">
                {tools.map((tool) => (
                  <li key={tool.slug}>
                    <Row
                      href={`/tools/${tool.slug}`}
                      icon={tool.icon}
                      label={tool.name}
                      active={pathname === `/tools/${tool.slug}`}
                      isNew={tool.isNew}
                    />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </nav>

      {/* Collapse toggle */}
      <button
        type="button"
        onClick={toggle}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        title={collapsed ? "Expand" : "Collapse"}
        className={cn(
          "flex h-10 shrink-0 items-center border-t border-border text-xs text-muted transition-colors hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent",
          collapsed ? "justify-center" : "gap-2 px-3.5",
        )}
      >
        <ChevronsLeft
          size={16}
          className={cn("transition-transform", collapsed && "rotate-180")}
        />
        {!collapsed && <span>Collapse</span>}
      </button>
    </aside>
  );
}
