"use client";

import { useMemo, useState } from "react";
import { Input, Label, Textarea } from "@/components/ui/Field";
import { Alert } from "@/components/ui/Alert";
import { cn } from "@/lib/utils";

const FLAGS = [
  { key: "g", label: "global" },
  { key: "i", label: "ignore case" },
  { key: "m", label: "multiline" },
  { key: "s", label: "dotall" },
] as const;

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

type MatchInfo = {
  index: number;
  match: string;
  groups: string[];
};

export default function RegexPlayground() {
  const [pattern, setPattern] = useState("\\b(\\w+)@(\\w+)\\.(\\w+)\\b");
  const [activeFlags, setActiveFlags] = useState<Set<string>>(new Set(["g"]));
  const [text, setText] = useState("Contact jane@example.com or john@test.org for details.");

  function toggleFlag(flag: string) {
    setActiveFlags((prev) => {
      const next = new Set(prev);
      if (next.has(flag)) next.delete(flag);
      else next.add(flag);
      return next;
    });
  }

  const { html, matches, error } = useMemo(() => {
    if (!pattern) return { html: escapeHtml(text), matches: [], error: null };
    let regex: RegExp;
    const flagStr = Array.from(activeFlags).join("");
    try {
      regex = new RegExp(pattern, flagStr.includes("g") ? flagStr : flagStr + "g");
    } catch (e) {
      return {
        html: escapeHtml(text),
        matches: [],
        error: e instanceof Error ? e.message : "Invalid pattern",
      };
    }

    const collected: MatchInfo[] = [];
    let out = "";
    let last = 0;
    let m: RegExpExecArray | null;
    let guard = 0;
    while ((m = regex.exec(text)) !== null && guard < 10000) {
      guard++;
      const start = m.index;
      const end = start + m[0].length;
      out += escapeHtml(text.slice(last, start));
      out += `<mark class="dev-match">${escapeHtml(m[0])}</mark>`;
      last = end;
      collected.push({ index: start, match: m[0], groups: m.slice(1) });
      if (m[0] === "") regex.lastIndex++; // avoid infinite loop on empty match
    }
    out += escapeHtml(text.slice(last));
    return { html: out, matches: collected, error: null };
  }, [pattern, activeFlags, text]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <Label htmlFor="rx-pattern">Pattern</Label>
          <Input
            id="rx-pattern"
            aria-label="Regular expression pattern"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            className="font-mono"
            placeholder="\\d+"
          />
        </div>
        <div>
          <Label>Flags</Label>
          <div className="flex flex-wrap gap-1.5">
            {FLAGS.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => toggleFlag(f.key)}
                title={f.label}
                aria-pressed={activeFlags.has(f.key)}
                className={cn(
                  "h-10 flex-1 rounded-lg border text-sm font-mono transition-colors",
                  activeFlags.has(f.key)
                    ? "border-accent bg-accent/15 text-accent"
                    : "border-border bg-elevated text-muted hover:text-primary",
                )}
              >
                {f.key}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      <div>
        <Label htmlFor="rx-text">Test string</Label>
        <Textarea
          id="rx-text"
          aria-label="Test string"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="min-h-32"
        />
      </div>

      <div>
        <Label>Highlighted matches ({matches.length})</Label>
        <div
          className="min-h-20 whitespace-pre-wrap break-words rounded-lg border border-border bg-surface p-3 font-mono text-sm text-primary"
          dangerouslySetInnerHTML={{ __html: html || "&nbsp;" }}
        />
      </div>

      {matches.length > 0 && (
        <div>
          <Label>Match details</Label>
          <div className="space-y-2">
            {matches.map((m, i) => (
              <div
                key={i}
                className="rounded-lg border border-border bg-surface p-3 text-sm"
              >
                <div className="font-mono text-primary">
                  <span className="text-muted">#{i + 1} @ {m.index}:</span> {m.match}
                </div>
                {m.groups.length > 0 && (
                  <ul className="mt-1 space-y-0.5 text-xs text-muted">
                    {m.groups.map((g, gi) => (
                      <li key={gi} className="font-mono">
                        group {gi + 1}: {g ?? "(undefined)"}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
