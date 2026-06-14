"use client";

import { useState } from "react";
import { Input, Label } from "@/components/ui/Field";
import { cn } from "@/lib/utils";

const PRESETS = [10, 15, 18, 20, 25];

export default function TipCalculator() {
  const [bill, setBill] = useState(50);
  const [tipPct, setTipPct] = useState(18);
  const [people, setPeople] = useState(2);

  const safePeople = Math.max(1, people || 1);
  const tipAmount = (bill * tipPct) / 100;
  const total = bill + tipAmount;
  const perPerson = total / safePeople;

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      <div className="space-y-4">
        <div>
          <Label htmlFor="tip-bill">Bill amount</Label>
          <Input id="tip-bill" type="number" aria-label="Bill amount" value={bill} onChange={(e) => setBill(Number(e.target.value))} />
        </div>

        <div>
          <Label>Tip percentage</Label>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setTipPct(p)}
                className={cn(
                  "rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
                  tipPct === p ? "border-accent bg-accent/15 text-accent" : "border-border bg-elevated text-muted hover:text-primary",
                )}
              >
                {p}%
              </button>
            ))}
          </div>
          <div className="mt-2">
            <Input type="number" aria-label="Custom tip percentage" value={tipPct} onChange={(e) => setTipPct(Number(e.target.value))} />
          </div>
        </div>

        <div>
          <Label htmlFor="tip-people">Number of people</Label>
          <Input id="tip-people" type="number" min={1} aria-label="Number of people" value={people} onChange={(e) => setPeople(Number(e.target.value))} />
        </div>
      </div>

      <div className="space-y-3">
        {[
          { label: "Tip amount", value: tipAmount },
          { label: "Total", value: total },
          { label: "Per person", value: perPerson },
        ].map((c) => (
          <div key={c.label} className="flex items-center justify-between rounded-lg border border-border bg-surface px-5 py-4">
            <span className="text-sm text-muted">{c.label}</span>
            <span className="text-2xl font-bold text-primary">{c.value.toFixed(2)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
