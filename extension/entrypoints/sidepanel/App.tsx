import { useMemo, useState } from "react";
import Fuse from "fuse.js";
import { ArrowLeft, Search } from "lucide-react";
import { tools as allTools, getCategory, type Tool } from "@/lib/tools-registry";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import { ExtToolLoader } from "../../components/ExtToolLoader";

export function App() {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<Tool | null>(null);

  const fuse = useMemo(
    () =>
      new Fuse(allTools, {
        keys: [
          { name: "name", weight: 0.5 },
          { name: "keywords", weight: 0.3 },
          { name: "description", weight: 0.2 },
        ],
        threshold: 0.4,
        ignoreLocation: true,
      }),
    [],
  );

  const results = useMemo(() => {
    const q = query.trim();
    return q ? fuse.search(q).map((r) => r.item) : allTools;
  }, [query, fuse]);

  // ── Tool view ──────────────────────────────────────────────
  if (active) {
    const category = getCategory(active.category);
    return (
      <div className="flex h-screen flex-col">
        <header className="flex items-center gap-2 border-b border-border bg-base px-2.5 py-2">
          <button
            type="button"
            onClick={() => setActive(null)}
            aria-label="Back to tools"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-elevated hover:text-primary"
          >
            <ArrowLeft size={16} />
          </button>
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border bg-elevated text-accent">
            <Icon name={active.icon} size={15} strokeWidth={1.85} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-primary">{active.name}</p>
            <p className="truncate text-[11px] text-muted">{category?.label}</p>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-3">
          <ExtToolLoader slug={active.slug} />
        </main>
      </div>
    );
  }

  // ── Search / launcher view ─────────────────────────────────
  return (
    <div className="flex h-screen flex-col">
      <header className="border-b border-border bg-base px-3 py-2.5">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-[#19b3a3] to-[#0c5f58] text-[9px] font-bold tracking-tight text-white">
            TN
          </span>
          <span className="font-display text-sm font-bold text-primary">ToolNook</span>
        </div>
        <div className="mt-2.5 flex items-center gap-2 rounded-md border border-border bg-surface px-2.5 focus-within:border-accent">
          <Search size={15} className="text-muted" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${allTools.length} tools`}
            aria-label="Search tools"
            className="h-9 flex-1 bg-transparent text-sm text-primary outline-none placeholder:text-muted"
          />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-2">
        {results.length === 0 && (
          <p className="p-6 text-center text-sm text-muted">No tools found.</p>
        )}
        <ul className="space-y-0.5">
          {results.map((tool) => (
            <li key={tool.slug}>
              <button
                type="button"
                onClick={() => setActive(tool)}
                className={cn(
                  "group flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left transition-colors hover:bg-elevated",
                )}
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-elevated text-accent">
                  <Icon name={tool.icon} size={16} strokeWidth={1.85} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5 text-sm font-medium text-primary">
                    {tool.name}
                    {tool.isNew && (
                      <span className="text-[9px] font-semibold uppercase tracking-wider text-accent">
                        New
                      </span>
                    )}
                  </span>
                  <span className="block truncate text-xs text-muted">{tool.description}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
