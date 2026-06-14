"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/Field";
import { CopyButton } from "@/components/ui/CopyButton";

const DIRECTIVES = [
  "default-src",
  "script-src",
  "style-src",
  "img-src",
  "font-src",
  "connect-src",
  "media-src",
  "object-src",
  "frame-src",
  "worker-src",
  "form-action",
  "base-uri",
  "frame-ancestors",
] as const;

type Directive = (typeof DIRECTIVES)[number];
type State = Record<Directive, { enabled: boolean; value: string }>;

const QUICK = ["'self'", "'none'", "'unsafe-inline'", "'unsafe-eval'", "data:", "https:", "blob:"];

function initialState(): State {
  const state = {} as State;
  for (const d of DIRECTIVES) {
    state[d] = { enabled: d === "default-src", value: d === "default-src" ? "'self'" : "" };
  }
  return state;
}

export default function CspBuilder() {
  const [state, setState] = useState<State>(initialState);

  function toggle(d: Directive) {
    setState((s) => ({ ...s, [d]: { ...s[d], enabled: !s[d].enabled } }));
  }
  function setValue(d: Directive, value: string) {
    setState((s) => ({ ...s, [d]: { ...s[d], value } }));
  }
  function appendToken(d: Directive, token: string) {
    setState((s) => {
      const current = s[d].value.trim();
      const parts = current ? current.split(/\s+/) : [];
      if (parts.includes(token)) return s;
      return { ...s, [d]: { enabled: true, value: [...parts, token].join(" ") } };
    });
  }

  const header = useMemo(() => {
    return DIRECTIVES.filter((d) => state[d].enabled)
      .map((d) => {
        const value = state[d].value.trim();
        return value ? `${d} ${value}` : d;
      })
      .join("; ");
  }, [state]);

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-surface p-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted">
            Content-Security-Policy
          </span>
          <CopyButton value={header} label="Copy header" />
        </div>
        <code className="block break-all font-mono text-sm text-accent">{header || "—"}</code>
      </div>

      <div className="space-y-2">
        {DIRECTIVES.map((d) => (
          <div
            key={d}
            className="flex flex-col gap-2 rounded-lg border border-border bg-surface p-3 sm:flex-row sm:items-center"
          >
            <label className="flex w-44 shrink-0 cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={state[d].enabled}
                onChange={() => toggle(d)}
                aria-label={`Enable ${d}`}
                className="accent-[var(--accent)]"
              />
              <span className="font-mono text-primary">{d}</span>
            </label>
            <div className="flex-1">
              <Input
                aria-label={`${d} value`}
                value={state[d].value}
                onChange={(e) => setValue(d, e.target.value)}
                placeholder="e.g. 'self' https://cdn.example.com"
                className="font-mono"
                disabled={!state[d].enabled}
              />
              <div className="mt-1.5 flex flex-wrap gap-1">
                {QUICK.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => appendToken(d, q)}
                    className="rounded border border-border px-1.5 py-0.5 font-mono text-[11px] text-muted hover:border-accent hover:text-accent"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
