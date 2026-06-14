"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Fuse from "fuse.js";
import { Search } from "lucide-react";
import { tools as allTools, type Tool } from "@/lib/tools-registry";
import { useEffectiveHidden } from "@/lib/visibility-client";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { cn } from "@/lib/utils";

export function Topbar({ hidden }: { hidden: string[] }) {
  const router = useRouter();
  const effectiveHidden = useEffectiveHidden(hidden);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const visible = useMemo(() => {
    const hiddenSet = new Set(effectiveHidden);
    return allTools.filter((t) => !hiddenSet.has(t.slug));
  }, [effectiveHidden]);

  const fuse = useMemo(
    () =>
      new Fuse(visible, {
        keys: [
          { name: "name", weight: 0.5 },
          { name: "keywords", weight: 0.3 },
          { name: "description", weight: 0.2 },
        ],
        threshold: 0.4,
        ignoreLocation: true,
      }),
    [visible],
  );

  const results: Tool[] = useMemo(() => {
    const q = query.trim();
    if (!q) return visible.slice(0, 8);
    return fuse.search(q).map((r) => r.item).slice(0, 8);
  }, [query, fuse, visible]);

  const openSearch = useCallback(() => {
    setOpen(true);
    setActiveIndex(0);
    requestAnimationFrame(() => inputRef.current?.focus());
  }, []);

  const closeSearch = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActiveIndex(0);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        openSearch();
      } else if (e.key === "Escape") {
        closeSearch();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openSearch, closeSearch]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) closeSearch();
    }
    if (open) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open, closeSearch]);

  function goTo(tool: Tool) {
    closeSearch();
    router.push(`/tools/${tool.slug}`);
  }

  function onInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const tool = results[activeIndex];
      if (tool) goTo(tool);
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-border bg-base/85 px-5 backdrop-blur">
      <Link
        href="/"
        className="font-display flex items-center gap-2 text-[16px] font-bold text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-accent text-[13px] font-bold text-ink-contrast" aria-hidden>
          T
        </span>
        ToolVault
      </Link>

      <div ref={containerRef} className="relative mx-auto w-full max-w-sm">
        <button
          type="button"
          onClick={openSearch}
          aria-label="Search tools"
          className="flex w-full items-center gap-2 rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-muted transition-colors hover:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <Search size={15} />
          <span className="flex-1 text-left">Search tools</span>
          <kbd className="hidden rounded border border-border px-1.5 py-0.5 text-[10px] sm:inline">⌘K</kbd>
        </button>

        {open && (
          <div className="absolute left-0 right-0 top-full z-40 mt-2 overflow-hidden rounded-lg border border-border bg-surface shadow-lg">
            <div className="flex items-center gap-2 border-b border-border px-3">
              <Search size={15} className="text-muted" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActiveIndex(0);
                }}
                onKeyDown={onInputKeyDown}
                aria-label="Search tools"
                placeholder={`Search ${visible.length} tools`}
                className="h-11 flex-1 bg-transparent text-sm text-primary outline-none placeholder:text-muted"
              />
            </div>
            <ul className="max-h-80 overflow-y-auto py-1">
              {results.length === 0 && (
                <li className="px-3 py-6 text-center text-sm text-muted">No tools found.</li>
              )}
              {results.map((tool, i) => (
                <li key={tool.slug}>
                  <button
                    type="button"
                    onMouseEnter={() => setActiveIndex(i)}
                    onClick={() => goTo(tool)}
                    className={cn(
                      "flex w-full flex-col px-3 py-2 text-left",
                      i === activeIndex ? "bg-elevated" : "",
                    )}
                  >
                    <span className="text-sm font-medium text-primary">{tool.name}</span>
                    <span className="truncate text-xs text-muted">{tool.description}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <ThemeToggle />
    </header>
  );
}
