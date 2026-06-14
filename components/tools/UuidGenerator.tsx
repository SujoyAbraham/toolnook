"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { CopyButton } from "@/components/ui/CopyButton";
import { Input, Label, Select } from "@/components/ui/Field";

type Mode = "uuid" | "nanoid";

const NANO_ALPHABET = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";

function uuidV4(): string {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function nanoId(size = 21): string {
  const bytes = crypto.getRandomValues(new Uint8Array(size));
  let id = "";
  for (let i = 0; i < size; i++) {
    id += NANO_ALPHABET[bytes[i] & 63];
  }
  return id;
}

export default function UuidGenerator() {
  const [mode, setMode] = useState<Mode>("uuid");
  const [count, setCount] = useState(5);
  const [ids, setIds] = useState<string[]>([]);

  function generate() {
    const n = Math.min(100, Math.max(1, count || 1));
    const out = Array.from({ length: n }, () => (mode === "uuid" ? uuidV4() : nanoId()));
    setIds(out);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="w-40">
          <Label htmlFor="uuid-mode">Type</Label>
          <Select
            id="uuid-mode"
            aria-label="ID type"
            value={mode}
            onChange={(e) => setMode(e.target.value as Mode)}
          >
            <option value="uuid">UUID v4</option>
            <option value="nanoid">NanoID</option>
          </Select>
        </div>
        <div className="w-32">
          <Label htmlFor="uuid-count">Quantity</Label>
          <Input
            id="uuid-count"
            aria-label="Quantity"
            type="number"
            min={1}
            max={100}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
          />
        </div>
        <Button onClick={generate}>Generate</Button>
        {ids.length > 0 && <CopyButton value={ids.join("\n")} label="Copy all" />}
      </div>

      {ids.length > 0 && (
        <ul className="max-h-96 space-y-1 overflow-y-auto rounded-lg border border-border bg-surface p-3 font-mono text-sm">
          {ids.map((id, i) => (
            <li
              key={i}
              className="flex items-center justify-between gap-2 rounded px-2 py-1 hover:bg-elevated"
            >
              <span className="truncate text-primary">{id}</span>
              <CopyButton value={id} label="" className="px-2" />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
