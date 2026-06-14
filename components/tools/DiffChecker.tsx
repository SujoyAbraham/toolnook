"use client";

import { useMemo, useState } from "react";
import { Label, Textarea } from "@/components/ui/Field";

type Row = { type: "equal" | "add" | "remove"; text: string };

function diffLines(a: string[], b: string[]): Row[] {
  const n = a.length;
  const m = b.length;
  // LCS table
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
      rows.push({ type: "remove", text: a[i] });
      i++;
    } else {
      rows.push({ type: "add", text: b[j] });
      j++;
    }
  }
  while (i < n) rows.push({ type: "remove", text: a[i++] });
  while (j < m) rows.push({ type: "add", text: b[j++] });
  return rows;
}

export default function DiffChecker() {
  const [left, setLeft] = useState("line one\nline two\nline three");
  const [right, setRight] = useState("line one\nline 2\nline three\nline four");

  const rows = useMemo(
    () => diffLines(left.split("\n"), right.split("\n")),
    [left, right],
  );

  const added = rows.filter((r) => r.type === "add").length;
  const removed = rows.filter((r) => r.type === "remove").length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div>
          <Label htmlFor="diff-left">Original</Label>
          <Textarea
            id="diff-left"
            aria-label="Original text"
            value={left}
            onChange={(e) => setLeft(e.target.value)}
            className="min-h-48"
          />
        </div>
        <div>
          <Label htmlFor="diff-right">Changed</Label>
          <Textarea
            id="diff-right"
            aria-label="Changed text"
            value={right}
            onChange={(e) => setRight(e.target.value)}
            className="min-h-48"
          />
        </div>
      </div>

      <div className="flex gap-4 text-sm">
        <span className="text-success">+{added} added</span>
        <span className="text-error">-{removed} removed</span>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-surface font-mono text-sm">
        {rows.map((r, i) => (
          <div
            key={i}
            className={
              r.type === "add"
                ? "bg-success/10 text-success"
                : r.type === "remove"
                  ? "bg-error/10 text-error"
                  : "text-muted"
            }
          >
            <span className="mr-2 select-none opacity-60">
              {r.type === "add" ? "+" : r.type === "remove" ? "-" : " "}
            </span>
            <span className="whitespace-pre-wrap break-words">{r.text || " "}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
