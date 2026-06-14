"use client";

import { useMemo, useState } from "react";
import { Input, Label, Select } from "@/components/ui/Field";
import { CopyButton } from "@/components/ui/CopyButton";
import { Alert } from "@/components/ui/Alert";

const BASES = [
  { id: 10, label: "Decimal", pattern: /^[0-9]+$/ },
  { id: 2, label: "Binary", pattern: /^[01]+$/ },
  { id: 16, label: "Hexadecimal", pattern: /^[0-9a-fA-F]+$/ },
  { id: 8, label: "Octal", pattern: /^[0-7]+$/ },
] as const;

export default function NumberBaseConverter() {
  const [value, setValue] = useState("42");
  const [inputBase, setInputBase] = useState(10);

  const { outputs, error } = useMemo(() => {
    const v = value.trim().replace(/^0[xXbBoO]/, "");
    if (!v) return { outputs: null, error: null };
    const base = BASES.find((b) => b.id === inputBase)!;
    if (!base.pattern.test(v)) {
      return { outputs: null, error: `Invalid digits for ${base.label.toLowerCase()} input.` };
    }
    try {
      // Parse via BigInt for arbitrary precision
      let n = 0n;
      const bigBase = BigInt(inputBase);
      for (const ch of v.toLowerCase()) {
        n = n * bigBase + BigInt(parseInt(ch, 16));
      }
      return {
        outputs: {
          Decimal: n.toString(10),
          Binary: n.toString(2),
          Hexadecimal: n.toString(16).toUpperCase(),
          Octal: n.toString(8),
        },
        error: null,
      };
    } catch {
      return { outputs: null, error: "Could not parse number." };
    }
  }, [value, inputBase]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="w-40">
          <Label htmlFor="nb-base">Input base</Label>
          <Select
            id="nb-base"
            aria-label="Input base"
            value={inputBase}
            onChange={(e) => setInputBase(Number(e.target.value))}
          >
            {BASES.map((b) => (
              <option key={b.id} value={b.id}>
                {b.label} (base {b.id})
              </option>
            ))}
          </Select>
        </div>
        <div className="min-w-48 flex-1">
          <Label htmlFor="nb-value">Number</Label>
          <Input
            id="nb-value"
            aria-label="Number to convert"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="font-mono"
          />
        </div>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      {outputs && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {Object.entries(outputs).map(([label, out]) => (
            <div key={label} className="rounded-lg border border-border bg-surface p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</span>
                <CopyButton value={out} label="Copy" />
              </div>
              <div className="break-all font-mono text-sm text-primary">{out}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
