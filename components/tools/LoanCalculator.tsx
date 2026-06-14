"use client";

import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Input, Label } from "@/components/ui/Field";
import { cn } from "@/lib/utils";

function money(n: number): string {
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function LoanCalculator() {
  const [principal, setPrincipal] = useState(250000);
  const [rate, setRate] = useState(7.5);
  const [months, setMonths] = useState(240);
  const [open, setOpen] = useState(false);

  const result = useMemo(() => {
    const p = Math.max(0, principal);
    const n = Math.max(1, Math.round(months));
    const r = rate / 12 / 100;
    const emi = r === 0 ? p / n : (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const total = emi * n;
    const interest = total - p;

    const schedule: { month: number; principal: number; interest: number; balance: number }[] = [];
    let balance = p;
    for (let m = 1; m <= n; m++) {
      const interestPart = balance * r;
      const principalPart = emi - interestPart;
      balance = Math.max(0, balance - principalPart);
      schedule.push({ month: m, principal: principalPart, interest: interestPart, balance });
    }
    return { emi, total, interest, schedule };
  }, [principal, rate, months]);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <Label htmlFor="loan-p">Principal</Label>
          <Input
            id="loan-p"
            type="number"
            aria-label="Principal amount"
            value={principal}
            onChange={(e) => setPrincipal(Number(e.target.value))}
          />
        </div>
        <div>
          <Label htmlFor="loan-r">Annual interest rate (%)</Label>
          <Input
            id="loan-r"
            type="number"
            step="0.01"
            aria-label="Annual interest rate"
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
          />
        </div>
        <div>
          <Label htmlFor="loan-n">Tenure (months)</Label>
          <Input
            id="loan-n"
            type="number"
            aria-label="Tenure in months"
            value={months}
            onChange={(e) => setMonths(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { label: "Monthly EMI", value: result.emi },
          { label: "Total interest", value: result.interest },
          { label: "Total payment", value: result.total },
        ].map((c) => (
          <div key={c.label} className="rounded-lg border border-border bg-surface p-4 text-center">
            <div className="text-xl font-bold text-primary">{money(c.value)}</div>
            <div className="mt-1 text-xs text-muted">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-border bg-surface">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-primary"
        >
          Amortization schedule
          <ChevronDown size={16} className={cn("transition-transform", open && "rotate-180")} />
        </button>
        {open && (
          <div className="max-h-96 overflow-auto border-t border-border">
            <table className="w-full text-right text-sm">
              <thead className="sticky top-0 bg-elevated text-xs text-muted">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">Month</th>
                  <th className="px-3 py-2 font-medium">Principal</th>
                  <th className="px-3 py-2 font-medium">Interest</th>
                  <th className="px-3 py-2 font-medium">Balance</th>
                </tr>
              </thead>
              <tbody>
                {result.schedule.map((row) => (
                  <tr key={row.month} className="border-t border-border">
                    <td className="px-3 py-1.5 text-left text-muted">{row.month}</td>
                    <td className="px-3 py-1.5 font-mono text-primary">{money(row.principal)}</td>
                    <td className="px-3 py-1.5 font-mono text-primary">{money(row.interest)}</td>
                    <td className="px-3 py-1.5 font-mono text-primary">{money(row.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
