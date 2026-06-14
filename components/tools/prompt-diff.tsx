"use client";

import { useMemo, useState } from "react";
import { Label, Textarea } from "@/components/ui/Field";
import { CopyButton } from "@/components/ui/CopyButton";
import { Alert } from "@/components/ui/Alert";
import { cn } from "@/lib/utils";
import { gptTokens } from "@/lib/tokenize";

type Row = { type: "equal" | "add" | "remove"; text: string };

function diffLines(a: string[], b: string[]): { rows: Row[]; lcs: number } {
  const n = a.length;
  const m = b.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const rows: Row[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      rows.push({ type: "equal", text: a[i] });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      rows.push({ type: "remove", text: a[i++] });
    } else {
      rows.push({ type: "add", text: b[j++] });
    }
  }
  while (i < n) rows.push({ type: "remove", text: a[i++] });
  while (j < m) rows.push({ type: "add", text: b[j++] });
  return { rows, lcs: dp[0][0] };
}

const FEATURES: { key: string; label: string; re: RegExp }[] = [
  { key: "role", label: "Role definition", re: /\b(you are|you're|act as|your role|your job)\b/i },
  { key: "format", label: "Output format instruction", re: /\b(json|xml|markdown|format|bullet|list|table|schema|respond with|output)\b/i },
  { key: "examples", label: "Examples section", re: /\b(example|e\.g\.|for instance|such as)\b/i },
];

function matchedText(text: string, re: RegExp): string {
  return text
    .split("\n")
    .filter((line) => re.test(line))
    .join("\n");
}

function structuralChanges(a: string, b: string): string[] {
  const changes: string[] = [];
  for (const f of FEATURES) {
    const inA = f.re.test(a);
    const inB = f.re.test(b);
    if (inA && !inB) changes.push(`${f.label} removed`);
    else if (!inA && inB) changes.push(`${f.label} added`);
    else if (inA && inB && matchedText(a, f.re) !== matchedText(b, f.re)) {
      changes.push(`${f.label} modified`);
    }
  }
  return changes;
}

export default function PromptDiff() {
  const [view, setView] = useState<"split" | "unified">("split");
  const [a, setA] = useState("You are a helpful assistant.\nAlways answer in English.\nBe concise.");
  const [b, setB] = useState("You are an expert assistant.\nAlways answer in English.\nBe concise.\nRespond in JSON.");

  const { rows, similarity, added, removed, tokensA, tokensB, changes } = useMemo(() => {
    const linesA = a.split("\n");
    const linesB = b.split("\n");
    const { rows, lcs } = diffLines(linesA, linesB);
    const totalLines = linesA.length + linesB.length;
    const similarity = totalLines === 0 ? 100 : Math.round(((2 * lcs) / totalLines) * 100);
    return {
      rows,
      similarity,
      added: rows.filter((r) => r.type === "add").length,
      removed: rows.filter((r) => r.type === "remove").length,
      tokensA: gptTokens(a),
      tokensB: gptTokens(b),
      changes: structuralChanges(a, b),
    };
  }, [a, b]);

  const tokenDelta = tokensB - tokensA;

  const markdown = useMemo(() => {
    const body = rows
      .map((r) => (r.type === "add" ? "+ " : r.type === "remove" ? "- " : "  ") + r.text)
      .join("\n");
    return "```diff\n" + body + "\n```";
  }, [rows]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div>
          <Label htmlFor="pd-a">Version A</Label>
          <Textarea id="pd-a" aria-label="Version A" value={a} onChange={(e) => setA(e.target.value)} className="min-h-40" />
        </div>
        <div>
          <Label htmlFor="pd-b">Version B</Label>
          <Textarea id="pd-b" aria-label="Version B" value={b} onChange={(e) => setB(e.target.value)} className="min-h-40" />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-sm">
        <span className="text-success">+{added} added</span>
        <span className="text-error">-{removed} removed</span>
        <span className="text-muted">{similarity}% similar</span>
        <span className="text-primary">
          Tokens: {tokensA} → {tokensB}{" "}
          <span className={tokenDelta === 0 ? "text-muted" : tokenDelta > 0 ? "text-amber-400" : "text-success"}>
            ({tokenDelta >= 0 ? "+" : ""}
            {tokenDelta})
          </span>
        </span>
      </div>

      {changes.length > 0 && (
        <Alert variant="info">
          <span className="font-semibold">Structural changes:</span> {changes.join(" · ")}
        </Alert>
      )}

      <div className="flex items-center justify-between">
        <div className="inline-flex rounded-lg border border-border bg-surface p-1">
          {(["split", "unified"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              className={cn(
                "rounded-md px-3 py-1 text-sm capitalize transition-colors",
                view === v ? "bg-accent text-white" : "text-muted hover:text-primary",
              )}
            >
              {v}
            </button>
          ))}
        </div>
        <CopyButton value={markdown} label="Copy as markdown" />
      </div>

      {view === "unified" ? (
        <div className="overflow-hidden rounded-lg border border-border bg-surface font-mono text-sm">
          {rows.map((r, i) => (
            <div
              key={i}
              className={cn(
                "px-3",
                r.type === "add" && "bg-success/10 text-success",
                r.type === "remove" && "bg-error/10 text-error",
                r.type === "equal" && "text-muted",
              )}
            >
              <span className="mr-2 select-none opacity-60">
                {r.type === "add" ? "+" : r.type === "remove" ? "-" : " "}
              </span>
              <span className="whitespace-pre-wrap break-words">{r.text || " "}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 font-mono text-sm">
          <div className="overflow-hidden rounded-lg border border-border bg-surface">
            {rows
              .filter((r) => r.type !== "add")
              .map((r, i) => (
                <div key={i} className={cn("px-3", r.type === "remove" && "bg-error/10 text-error", r.type === "equal" && "text-muted")}>
                  <span className="whitespace-pre-wrap break-words">{r.text || " "}</span>
                </div>
              ))}
          </div>
          <div className="overflow-hidden rounded-lg border border-border bg-surface">
            {rows
              .filter((r) => r.type !== "remove")
              .map((r, i) => (
                <div key={i} className={cn("px-3", r.type === "add" && "bg-success/10 text-success", r.type === "equal" && "text-muted")}>
                  <span className="whitespace-pre-wrap break-words">{r.text || " "}</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
