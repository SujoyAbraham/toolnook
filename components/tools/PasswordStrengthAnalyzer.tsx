"use client";

import { useMemo, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Label } from "@/components/ui/Field";
import { cn } from "@/lib/utils";

const COMMON = new Set([
  "password", "123456", "123456789", "qwerty", "abc123", "password1", "111111",
  "12345678", "letmein", "admin", "welcome", "monkey", "iloveyou", "dragon",
]);

const GUESSES_PER_SEC = 10_000_000_000;

function analyze(pw: string) {
  let pool = 0;
  if (/[a-z]/.test(pw)) pool += 26;
  if (/[A-Z]/.test(pw)) pool += 26;
  if (/[0-9]/.test(pw)) pool += 10;
  if (/[^a-zA-Z0-9]/.test(pw)) pool += 33;
  const entropy = pw.length > 0 && pool > 0 ? pw.length * Math.log2(pool) : 0;

  const weaknesses: string[] = [];
  if (pw.length < 12) weaknesses.push("Too short — aim for at least 12 characters");
  if (!/[A-Z]/.test(pw)) weaknesses.push("No uppercase letters");
  if (!/[a-z]/.test(pw)) weaknesses.push("No lowercase letters");
  if (!/[0-9]/.test(pw)) weaknesses.push("No numbers");
  if (!/[^a-zA-Z0-9]/.test(pw)) weaknesses.push("No symbols");
  if (/(.)\1{2,}/.test(pw)) weaknesses.push("Contains repeated characters");
  if (/(abc|123|qwe|asd|password)/i.test(pw)) weaknesses.push("Contains a common pattern");
  if (COMMON.has(pw.toLowerCase())) weaknesses.push("This is a commonly used password");

  return { entropy: Math.round(entropy), weaknesses };
}

function crackTime(entropy: number): string {
  const seconds = Math.pow(2, entropy) / 2 / GUESSES_PER_SEC;
  if (seconds < 1) return "instantly";
  const units: [number, string][] = [
    [60, "second"],
    [60, "minute"],
    [24, "hour"],
    [365, "day"],
    [100, "year"],
    [Infinity, "century"],
  ];
  let value = seconds;
  let name = "second";
  for (const [factor, unit] of units) {
    name = unit;
    if (value < factor) break;
    value /= factor;
  }
  if (value > 1e6) return "millions of years";
  return `${Math.round(value).toLocaleString()} ${name}${Math.round(value) === 1 ? "" : "s"}`;
}

function verdict(entropy: number): { label: string; color: string } {
  if (entropy < 40) return { label: "Weak", color: "bg-error text-white" };
  if (entropy < 60) return { label: "Fair", color: "bg-amber-500 text-white" };
  if (entropy < 80) return { label: "Strong", color: "bg-success text-white" };
  return { label: "Very Strong", color: "bg-success text-white" };
}

export default function PasswordStrengthAnalyzer() {
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);
  const { entropy, weaknesses } = useMemo(() => analyze(pw), [pw]);
  const v = verdict(entropy);

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="psa-input">Password</Label>
        <div className="relative">
          <input
            id="psa-input"
            type={show ? "text" : "password"}
            aria-label="Password to analyze"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="Type a password to analyze…"
            className="h-11 w-full rounded-lg border border-border bg-elevated px-3 pr-11 font-mono text-sm text-primary placeholder:font-sans placeholder:text-muted focus:border-accent focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary"
          >
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      {pw && (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-border bg-surface p-4 text-center">
              <div className="text-2xl font-bold text-primary">{entropy}</div>
              <div className="text-xs text-muted">bits of entropy</div>
            </div>
            <div className="rounded-lg border border-border bg-surface p-4 text-center">
              <div className="text-lg font-bold text-primary">{crackTime(entropy)}</div>
              <div className="text-xs text-muted">to crack @ 10B/sec</div>
            </div>
            <div className="flex items-center justify-center rounded-lg border border-border bg-surface p-4">
              <span className={cn("rounded-full px-4 py-1.5 text-sm font-semibold", v.color)}>{v.label}</span>
            </div>
          </div>

          <div>
            <Label>Findings</Label>
            {weaknesses.length === 0 ? (
              <div className="rounded-lg border border-success/40 bg-success/10 px-3 py-2 text-sm text-success">
                No obvious weaknesses found.
              </div>
            ) : (
              <ul className="space-y-1">
                {weaknesses.map((w) => (
                  <li
                    key={w}
                    className="rounded-lg border border-error/30 bg-error/10 px-3 py-2 text-sm text-error"
                  >
                    {w}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
