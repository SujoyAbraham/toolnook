"use client";

import { useMemo, useState } from "react";
import { Input, Label } from "@/components/ui/Field";
import { CopyButton } from "@/components/ui/CopyButton";

function slugify(text: string, sep: string, lower: boolean, removeNumbers: boolean): string {
  let s = text
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, ""); // strip diacritics
  if (removeNumbers) s = s.replace(/[0-9]/g, "");
  s = s
    .replace(/[^a-zA-Z0-9\s-_]/g, "")
    .trim()
    .replace(/[\s-_]+/g, sep);
  return lower ? s.toLowerCase() : s;
}

export default function SlugGenerator() {
  const [text, setText] = useState("Hello World! This is ToolVault 2024");
  const [sep, setSep] = useState("-");
  const [lower, setLower] = useState(true);
  const [removeNumbers, setRemoveNumbers] = useState(false);

  const slug = useMemo(
    () => slugify(text, sep, lower, removeNumbers),
    [text, sep, lower, removeNumbers],
  );

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="slug-input">Text</Label>
        <Input id="slug-input" aria-label="Text to slugify" value={text} onChange={(e) => setText(e.target.value)} />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div>
          <Label>Separator</Label>
          <div className="flex gap-2">
            {[
              { v: "-", l: "Dash" },
              { v: "_", l: "Underscore" },
            ].map((o) => (
              <button
                key={o.v}
                type="button"
                onClick={() => setSep(o.v)}
                className={
                  "rounded-lg border px-3 py-1.5 text-sm transition-colors " +
                  (sep === o.v ? "border-accent bg-accent/15 text-accent" : "border-border bg-elevated text-muted hover:text-primary")
                }
              >
                {o.l}
              </button>
            ))}
          </div>
        </div>
        <label className="flex cursor-pointer items-center gap-2 pt-5 text-sm text-primary">
          <input type="checkbox" checked={lower} onChange={(e) => setLower(e.target.checked)} aria-label="Force lowercase" className="accent-[var(--accent)]" />
          Force lowercase
        </label>
        <label className="flex cursor-pointer items-center gap-2 pt-5 text-sm text-primary">
          <input type="checkbox" checked={removeNumbers} onChange={(e) => setRemoveNumbers(e.target.checked)} aria-label="Remove numbers" className="accent-[var(--accent)]" />
          Remove numbers
        </label>
      </div>

      <div className="rounded-lg border border-border bg-surface p-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted">Slug</span>
          <CopyButton value={slug} label="Copy" />
        </div>
        <code className="block break-all font-mono text-sm text-accent">{slug || "—"}</code>
      </div>
    </div>
  );
}
