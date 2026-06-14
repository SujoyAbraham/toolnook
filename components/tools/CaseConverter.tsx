"use client";

import { useState } from "react";
import { Label, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { CopyButton } from "@/components/ui/CopyButton";

function words(s: string): string[] {
  return s
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .split(/[\s_\-./]+/)
    .filter(Boolean);
}

const TRANSFORMS: { label: string; fn: (s: string) => string }[] = [
  { label: "UPPERCASE", fn: (s) => s.toUpperCase() },
  { label: "lowercase", fn: (s) => s.toLowerCase() },
  {
    label: "Title Case",
    fn: (s) =>
      words(s)
        .map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase())
        .join(" "),
  },
  {
    label: "Sentence case",
    fn: (s) =>
      s
        .toLowerCase()
        .replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase()),
  },
  {
    label: "camelCase",
    fn: (s) =>
      words(s)
        .map((w, i) => (i === 0 ? w.toLowerCase() : w[0].toUpperCase() + w.slice(1).toLowerCase()))
        .join(""),
  },
  {
    label: "PascalCase",
    fn: (s) =>
      words(s)
        .map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase())
        .join(""),
  },
  { label: "snake_case", fn: (s) => words(s).map((w) => w.toLowerCase()).join("_") },
  { label: "kebab-case", fn: (s) => words(s).map((w) => w.toLowerCase()).join("-") },
];

export default function CaseConverter() {
  const [input, setInput] = useState("The quick brown Fox");
  const [output, setOutput] = useState("");

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="cc-input">Input</Label>
        <Textarea id="cc-input" aria-label="Text to convert" value={input} onChange={(e) => setInput(e.target.value)} className="min-h-32 font-sans" />
      </div>

      <div className="flex flex-wrap gap-2">
        {TRANSFORMS.map((t) => (
          <Button key={t.label} variant="secondary" size="sm" onClick={() => setOutput(t.fn(input))}>
            {t.label}
          </Button>
        ))}
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <Label className="mb-0">Output</Label>
          <CopyButton value={output} label="Copy" />
        </div>
        <Textarea readOnly aria-label="Converted text" value={output} className="min-h-32 bg-surface font-sans" />
      </div>
    </div>
  );
}
