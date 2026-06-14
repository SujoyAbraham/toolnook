"use client";

import { useMemo, useState } from "react";
import { Label, Select, Textarea } from "@/components/ui/Field";
import { CopyButton } from "@/components/ui/CopyButton";
import { cn } from "@/lib/utils";

type Tab = "trim" | "reverse" | "dedupe" | "sort";
type SortMode = "alpha" | "reverse" | "length";

export default function StringUtilities() {
  const [tab, setTab] = useState<Tab>("trim");
  const [input, setInput] = useState("  banana\napple\n  apple\ncherry\nBanana  ");
  const [caseSensitive, setCaseSensitive] = useState(true);
  const [sortMode, setSortMode] = useState<SortMode>("alpha");

  const output = useMemo(() => {
    const lines = input.split("\n");
    switch (tab) {
      case "trim":
        return input
          .split("\n")
          .map((l) => l.trim().replace(/\s+/g, " "))
          .join("\n")
          .trim();
      case "reverse":
        return [...input].reverse().join("");
      case "dedupe": {
        const seen = new Set<string>();
        const result: string[] = [];
        for (const line of lines) {
          const key = caseSensitive ? line : line.toLowerCase();
          if (!seen.has(key)) {
            seen.add(key);
            result.push(line);
          }
        }
        return result.join("\n");
      }
      case "sort": {
        const sorted = [...lines];
        if (sortMode === "alpha") sorted.sort((a, b) => a.localeCompare(b));
        else if (sortMode === "reverse") sorted.sort((a, b) => b.localeCompare(a));
        else sorted.sort((a, b) => a.length - b.length);
        return sorted.join("\n");
      }
    }
  }, [tab, input, caseSensitive, sortMode]);

  const tabs: { id: Tab; label: string }[] = [
    { id: "trim", label: "Trim" },
    { id: "reverse", label: "Reverse" },
    { id: "dedupe", label: "Deduplicate lines" },
    { id: "sort", label: "Sort lines" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "rounded-lg border px-3 py-1.5 text-sm transition-colors",
              tab === t.id ? "border-accent bg-accent/15 text-accent" : "border-border bg-elevated text-muted hover:text-primary",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "dedupe" && (
        <label className="flex cursor-pointer items-center gap-2 text-sm text-primary">
          <input type="checkbox" checked={caseSensitive} onChange={(e) => setCaseSensitive(e.target.checked)} aria-label="Case sensitive" className="accent-[var(--accent)]" />
          Case sensitive
        </label>
      )}

      {tab === "sort" && (
        <div className="w-48">
          <Label htmlFor="su-sort">Order</Label>
          <Select id="su-sort" aria-label="Sort order" value={sortMode} onChange={(e) => setSortMode(e.target.value as SortMode)}>
            <option value="alpha">Alphabetical</option>
            <option value="reverse">Reverse alphabetical</option>
            <option value="length">By length</option>
          </Select>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div>
          <Label htmlFor="su-input">Input</Label>
          <Textarea id="su-input" aria-label="Input text" value={input} onChange={(e) => setInput(e.target.value)} className="min-h-48" />
        </div>
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <Label className="mb-0">Output</Label>
            <CopyButton value={output} label="Copy" />
          </div>
          <Textarea readOnly aria-label="Output text" value={output} className="min-h-48 bg-surface" />
        </div>
      </div>
    </div>
  );
}
