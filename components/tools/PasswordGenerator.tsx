"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { CopyButton } from "@/components/ui/CopyButton";
import { Input, Label } from "@/components/ui/Field";
import { Alert } from "@/components/ui/Alert";
import { cn } from "@/lib/utils";

const SETS = {
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*()-_=+[]{};:,.<>?",
};
const AMBIGUOUS = /[Il1O0o]/g;

type Options = {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
  excludeAmbiguous: boolean;
};

function buildPool(o: Options): string {
  let pool = "";
  if (o.uppercase) pool += SETS.uppercase;
  if (o.lowercase) pool += SETS.lowercase;
  if (o.numbers) pool += SETS.numbers;
  if (o.symbols) pool += SETS.symbols;
  if (o.excludeAmbiguous) pool = pool.replace(AMBIGUOUS, "");
  return pool;
}

function generate(pool: string, length: number): string {
  const arr = crypto.getRandomValues(new Uint32Array(length));
  let out = "";
  for (let i = 0; i < length; i++) out += pool[arr[i] % pool.length];
  return out;
}

function strength(entropy: number): { label: string; color: string; pct: number } {
  if (entropy < 40) return { label: "Weak", color: "bg-error", pct: 25 };
  if (entropy < 60) return { label: "Fair", color: "bg-amber-500", pct: 50 };
  if (entropy < 80) return { label: "Strong", color: "bg-success", pct: 75 };
  return { label: "Very Strong", color: "bg-success", pct: 100 };
}

export default function PasswordGenerator() {
  const [opts, setOpts] = useState<Options>({
    length: 20,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
    excludeAmbiguous: false,
  });
  const [bulk, setBulk] = useState(1);
  const [passwords, setPasswords] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const pool = buildPool(opts);
  const entropy = pool.length > 0 ? Math.round(opts.length * Math.log2(pool.length)) : 0;
  const meter = strength(entropy);

  function run() {
    if (pool.length === 0) {
      setError("Select at least one character set.");
      setPasswords([]);
      return;
    }
    setError(null);
    const count = Math.min(20, Math.max(1, bulk));
    setPasswords(Array.from({ length: count }, () => generate(pool, opts.length)));
  }

  const toggles: { key: keyof Options; label: string }[] = [
    { key: "uppercase", label: "Uppercase (A-Z)" },
    { key: "lowercase", label: "Lowercase (a-z)" },
    { key: "numbers", label: "Numbers (0-9)" },
    { key: "symbols", label: "Symbols" },
    { key: "excludeAmbiguous", label: "Exclude ambiguous" },
  ];

  return (
    <div className="space-y-5">
      <div className="space-y-4 rounded-xl border border-border bg-surface p-4">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <Label className="mb-0" htmlFor="pw-length">
              Length
            </Label>
            <span className="font-mono text-sm text-accent">{opts.length}</span>
          </div>
          <input
            id="pw-length"
            type="range"
            min={8}
            max={128}
            aria-label="Password length"
            value={opts.length}
            onChange={(e) => setOpts((o) => ({ ...o, length: Number(e.target.value) }))}
            className="w-full accent-[var(--accent)]"
          />
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {toggles.map((t) => (
            <label
              key={t.key}
              className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-elevated px-3 py-2 text-sm text-primary"
            >
              <input
                type="checkbox"
                checked={opts[t.key] as boolean}
                onChange={(e) => setOpts((o) => ({ ...o, [t.key]: e.target.checked }))}
                aria-label={t.label}
                className="accent-[var(--accent)]"
              />
              {t.label}
            </label>
          ))}
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="text-muted">
              Entropy: <span className="font-mono text-primary">{entropy} bits</span>
            </span>
            <span className="font-medium text-primary">{meter.label}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-elevated">
            <div className={cn("h-full transition-all", meter.color)} style={{ width: `${meter.pct}%` }} />
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <div className="w-32">
            <Label htmlFor="pw-bulk">Quantity</Label>
            <Input
              id="pw-bulk"
              type="number"
              min={1}
              max={20}
              aria-label="Number of passwords"
              value={bulk}
              onChange={(e) => setBulk(Number(e.target.value))}
            />
          </div>
          <Button onClick={run}>Generate</Button>
          {passwords.length > 1 && <CopyButton value={passwords.join("\n")} label="Copy all" />}
        </div>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      {passwords.length > 0 && (
        <ul className="space-y-2">
          {passwords.map((p, i) => (
            <li
              key={i}
              className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface p-3"
            >
              <span className="truncate font-mono text-sm text-primary">{p}</span>
              <CopyButton value={p} label="" className="px-2" />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
