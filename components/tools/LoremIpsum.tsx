"use client";

import { useState } from "react";
import { Input, Label, Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { CopyButton } from "@/components/ui/CopyButton";
import { Textarea } from "@/components/ui/Field";

const WORDS =
  "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure reprehenderit voluptate velit esse cillum fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt mollit anim id est laborum".split(
    " ",
  );

type Mode = "words" | "sentences" | "paragraphs";

function pick(): string {
  return WORDS[Math.floor(Math.random() * WORDS.length)];
}

function sentence(): string {
  const len = 6 + Math.floor(Math.random() * 10);
  const ws = Array.from({ length: len }, pick);
  ws[0] = ws[0][0].toUpperCase() + ws[0].slice(1);
  return ws.join(" ") + ".";
}

function paragraph(): string {
  const len = 3 + Math.floor(Math.random() * 4);
  return Array.from({ length: len }, sentence).join(" ");
}

function generate(mode: Mode, count: number): string {
  const n = Math.max(1, Math.min(500, count || 1));
  if (mode === "words") {
    const ws = Array.from({ length: n }, pick);
    ws[0] = ws[0][0].toUpperCase() + ws[0].slice(1);
    return ws.join(" ") + ".";
  }
  if (mode === "sentences") return Array.from({ length: n }, sentence).join(" ");
  return Array.from({ length: n }, paragraph).join("\n\n");
}

export default function LoremIpsum() {
  const [mode, setMode] = useState<Mode>("paragraphs");
  const [count, setCount] = useState(3);
  const [output, setOutput] = useState(generate("paragraphs", 3));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="w-40">
          <Label htmlFor="li-mode">Type</Label>
          <Select id="li-mode" aria-label="Generation type" value={mode} onChange={(e) => setMode(e.target.value as Mode)}>
            <option value="words">Words</option>
            <option value="sentences">Sentences</option>
            <option value="paragraphs">Paragraphs</option>
          </Select>
        </div>
        <div className="w-32">
          <Label htmlFor="li-count">Count</Label>
          <Input id="li-count" type="number" min={1} max={500} aria-label="Count" value={count} onChange={(e) => setCount(Number(e.target.value))} />
        </div>
        <Button onClick={() => setOutput(generate(mode, count))}>Generate</Button>
        <CopyButton value={output} label="Copy" />
      </div>

      <Textarea readOnly aria-label="Generated text" value={output} className="min-h-64 font-sans" />
    </div>
  );
}
