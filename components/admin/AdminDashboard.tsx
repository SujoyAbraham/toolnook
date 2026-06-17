"use client";

import { useMemo, useState } from "react";
import { categories, getCategory, tools } from "@/lib/tools-registry";
import { PREVIEW_EVENT, PREVIEW_KEY } from "@/lib/visibility-client";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Field";
import { cn, downloadText } from "@/lib/utils";

type Status = { kind: "idle" | "ok" | "error" | "busy"; message: string };

export function AdminDashboard({
  initialHidden,
  onLogout,
}: {
  initialHidden: string[];
  onLogout: () => Promise<void>;
}) {
  const [hidden, setHidden] = useState<string[]>(initialHidden);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState<Status>({ kind: "idle", message: "" });

  const hiddenSet = new Set(hidden);
  const visibleCount = tools.length - hidden.length;

  function persist(next: string[]) {
    setHidden(next);
    try {
      localStorage.setItem(PREVIEW_KEY, JSON.stringify(next));
      window.dispatchEvent(new Event(PREVIEW_EVENT));
    } catch {
      // localStorage unavailable — preview simply won't sync to other tabs.
    }
  }

  function toggle(slug: string) {
    persist(hiddenSet.has(slug) ? hidden.filter((s) => s !== slug) : [...hidden, slug]);
  }
  function showAll() {
    persist([]);
  }
  function hideAll() {
    if (confirm("Hide every tool from the public site? You can re-enable them before saving.")) {
      persist(tools.map((t) => t.slug));
    }
  }

  async function saveToLive() {
    setStatus({ kind: "busy", message: "Saving to Edge Config…" });
    try {
      const res = await fetch("/api/admin/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hidden }),
      });
      if (!res.ok) throw new Error(String(res.status));
      try {
        localStorage.removeItem(PREVIEW_KEY);
        window.dispatchEvent(new Event(PREVIEW_EVENT));
      } catch {
        // ignore storage errors
      }
      setStatus({ kind: "ok", message: `Saved. ${hidden.length} tool(s) hidden live.` });
    } catch {
      setStatus({ kind: "error", message: "Could not save to live. Check server configuration." });
    }
  }

  function reloadFromLive() {
    try {
      localStorage.removeItem(PREVIEW_KEY);
    } catch {
      // ignore storage errors
    }
    window.location.reload();
  }

  function exportConfig() {
    downloadText(JSON.stringify({ hidden }, null, 2), "tools-overrides.json", "application/json");
  }

  async function logout() {
    try {
      localStorage.removeItem(PREVIEW_KEY);
    } catch {
      // ignore storage errors
    }
    // Clears the Google session, then redirects to the login page.
    await onLogout();
  }

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tools.filter((t) => {
      if (category !== "all" && t.category !== category) return false;
      if (q && !t.name.toLowerCase().includes(q) && !t.slug.includes(q)) return false;
      return true;
    });
  }, [query, category]);

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight text-primary">Tool visibility</h1>
        <p className="mt-1 text-sm text-muted">
          {visibleCount} of {tools.length} tools visible to the public.
        </p>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Input
          aria-label="Filter tools"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search tools"
          className="h-9 max-w-xs"
        />
        <Select
          aria-label="Filter by category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="h-9 w-44"
        >
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </Select>
        <div className="ml-auto flex gap-2">
          <Button variant="secondary" size="sm" onClick={showAll}>
            Show all
          </Button>
          <Button variant="secondary" size="sm" onClick={hideAll}>
            Hide all
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-elevated text-xs text-muted">
            <tr>
              <th className="px-4 py-2.5 text-left font-medium">Tool</th>
              <th className="px-4 py-2.5 text-left font-medium">Category</th>
              <th className="px-4 py-2.5 text-right font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((tool) => {
              const isHidden = hiddenSet.has(tool.slug);
              return (
                <tr key={tool.slug} className="border-b border-border last:border-0">
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2 font-medium text-primary">
                      {tool.name}
                      {tool.isNew && (
                        <span className="text-[10px] font-medium uppercase tracking-wider text-accent">New</span>
                      )}
                    </div>
                    <div className="text-xs text-muted">{tool.slug}</div>
                  </td>
                  <td className="px-4 py-2.5 text-muted">{getCategory(tool.category)?.label}</td>
                  <td className="px-4 py-2.5 text-right">
                    <button
                      type="button"
                      onClick={() => toggle(tool.slug)}
                      aria-pressed={!isHidden}
                      aria-label={`${isHidden ? "Show" : "Hide"} ${tool.name}`}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                        isHidden
                          ? "border-border bg-surface text-muted hover:text-primary"
                          : "border-accent/40 bg-accent/10 text-accent",
                      )}
                    >
                      <span
                        className={cn("h-1.5 w-1.5 rounded-full", isHidden ? "bg-muted" : "bg-accent")}
                        aria-hidden
                      />
                      {isHidden ? "Hidden" : "Visible"}
                    </button>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-muted">
                  No tools match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <Button onClick={saveToLive} disabled={status.kind === "busy"}>
          Save to live
        </Button>
        <Button variant="secondary" onClick={reloadFromLive}>
          Reload from live
        </Button>
        <Button variant="secondary" onClick={exportConfig}>
          Export configuration
        </Button>
        <Button variant="ghost" className="ml-auto" onClick={logout}>
          Log out
        </Button>
      </div>

      {status.message && (
        <p
          className={cn(
            "mt-3 text-sm",
            status.kind === "error" ? "text-error" : status.kind === "ok" ? "text-success" : "text-muted",
          )}
        >
          {status.message}
        </p>
      )}
    </div>
  );
}
