"use client";

import { useState } from "react";
import { Input, Label } from "@/components/ui/Field";
import { cn } from "@/lib/utils";

type Mode = {
  id: string;
  tab: string;
  labels: [string, string];
  compute: (x: number, y: number) => number;
  format: (x: number, y: number, r: number) => string;
};

const MODES: Mode[] = [
  {
    id: "of",
    tab: "X% of Y",
    labels: ["X (percent)", "Y (value)"],
    compute: (x, y) => (x / 100) * y,
    format: (x, y, r) => `${x}% of ${y} = ${r.toFixed(2)}`,
  },
  {
    id: "isWhat",
    tab: "X is what % of Y",
    labels: ["X (value)", "Y (total)"],
    compute: (x, y) => (y === 0 ? 0 : (x / y) * 100),
    format: (x, y, r) => `${x} is ${r.toFixed(2)}% of ${y}`,
  },
  {
    id: "increase",
    tab: "% increase",
    labels: ["From X", "To Y"],
    compute: (x, y) => (x === 0 ? 0 : ((y - x) / x) * 100),
    format: (x, y, r) => `Increase from ${x} to ${y} = ${r.toFixed(2)}%`,
  },
  {
    id: "decrease",
    tab: "% decrease",
    labels: ["From X", "To Y"],
    compute: (x, y) => (x === 0 ? 0 : ((x - y) / x) * 100),
    format: (x, y, r) => `Decrease from ${x} to ${y} = ${r.toFixed(2)}%`,
  },
  {
    id: "difference",
    tab: "% difference",
    labels: ["Value X", "Value Y"],
    compute: (x, y) => {
      const avg = (x + y) / 2;
      return avg === 0 ? 0 : (Math.abs(x - y) / avg) * 100;
    },
    format: (x, y, r) => `Difference between ${x} and ${y} = ${r.toFixed(2)}%`,
  },
];

export default function PercentageCalculator() {
  const [modeId, setModeId] = useState(MODES[0].id);
  const [x, setX] = useState("25");
  const [y, setY] = useState("200");

  const mode = MODES.find((m) => m.id === modeId)!;
  const nx = parseFloat(x) || 0;
  const ny = parseFloat(y) || 0;
  const result = mode.compute(nx, ny);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setModeId(m.id)}
            className={cn(
              "rounded-lg border px-3 py-1.5 text-sm transition-colors",
              modeId === m.id ? "border-accent bg-accent/15 text-accent" : "border-border bg-elevated text-muted hover:text-primary",
            )}
          >
            {m.tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor="pct-x">{mode.labels[0]}</Label>
          <Input id="pct-x" type="number" aria-label={mode.labels[0]} value={x} onChange={(e) => setX(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="pct-y">{mode.labels[1]}</Label>
          <Input id="pct-y" type="number" aria-label={mode.labels[1]} value={y} onChange={(e) => setY(e.target.value)} />
        </div>
      </div>

      <div className="rounded-lg border border-border bg-surface p-5 text-center">
        <div className="text-3xl font-bold text-primary">
          {mode.id === "of" ? result.toFixed(2) : `${result.toFixed(2)}%`}
        </div>
        <div className="mt-2 text-sm text-muted">{mode.format(nx, ny, result)}</div>
      </div>
    </div>
  );
}
