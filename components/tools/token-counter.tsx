"use client";

import { useEffect, useMemo, useState } from "react";
import { Label, Select, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { CaveatBadge } from "@/components/ui/CaveatBadge";
import { DataFreshnessBadge } from "@/components/ui/DataFreshnessBadge";
import { useModelsData } from "@/lib/useModelsData";
import { estimateTokens } from "@/lib/tokenize";
import { OPENROUTER_FEE_NOTE } from "@/lib/ai-models-fallback";

function usd(n: number): string {
  if (n === 0) return "$0.00";
  if (n < 0.01) return "$" + n.toFixed(6);
  if (n < 1) return "$" + n.toFixed(4);
  return "$" + n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function barColor(ratio: number): string {
  if (ratio >= 0.9) return "bg-error";
  if (ratio >= 0.7) return "bg-amber-500";
  return "bg-success";
}

export default function TokenCounter() {
  const { models, source, updatedAt, loading } = useModelsData();
  const [text, setText] = useState("");
  const [modelId, setModelId] = useState("openai/gpt-4o");
  const [compareAll, setCompareAll] = useState(false);

  // Keep the selected model valid as the live list arrives.
  useEffect(() => {
    if (models.length && !models.some((m) => m.id === modelId)) {
      setModelId(models[0].id);
    }
  }, [models, modelId]);

  const model = models.find((m) => m.id === modelId) ?? models[0];

  const { tokens, exact } = useMemo(
    () => (model ? estimateTokens(text, model.provider) : { tokens: 0, exact: true }),
    [text, model],
  );

  const costPerRequest = model ? (tokens / 1_000_000) * model.inputPricePerM : 0;
  const fillRatio = model && model.contextWindow > 0 ? Math.min(1, tokens / model.contextWindow) : 0;

  const comparison = useMemo(() => {
    return models
      .map((m) => {
        const t = estimateTokens(text, m.provider).tokens;
        return { model: m, tokens: t, cost: (t / 1_000_000) * m.inputPricePerM };
      })
      .sort((a, b) => a.cost - b.cost || a.tokens - b.tokens);
  }, [models, text]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <DataFreshnessBadge source={source} updatedAt={updatedAt} loading={loading} />
      </div>

      <CaveatBadge>
        GPT token counts are exact. Claude, Gemini, Llama and other non-GPT models are
        estimates within ±5–10%. Pricing is loaded from OpenRouter&rsquo;s public catalogue;
        your text is tokenised locally and never sent anywhere.
      </CaveatBadge>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="space-y-3">
          <div>
            <Label htmlFor="tc-model">Model</Label>
            <Select
              id="tc-model"
              aria-label="Model"
              value={modelId}
              onChange={(e) => setModelId(e.target.value)}
            >
              {models.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.provider})
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="tc-text">Text</Label>
            <Textarea
              id="tc-text"
              aria-label="Text to count"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste text to count tokens and estimate cost…"
              className="min-h-64 font-sans"
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="rounded-xl border border-border bg-surface p-5 text-center">
            <div className="text-5xl font-bold text-primary">{tokens.toLocaleString()}</div>
            <div className="mt-1 text-sm text-muted">
              tokens {exact ? "(exact)" : "(estimated)"}
            </div>
          </div>

          {model && (
            <div className="rounded-lg border border-border bg-surface p-4">
              <div className="mb-1 flex items-center justify-between text-xs text-muted">
                <span>Context window</span>
                <span className="font-mono">
                  {tokens.toLocaleString()} / {model.contextWindow.toLocaleString()}
                </span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-elevated">
                <div
                  className={`h-full transition-all ${barColor(fillRatio)}`}
                  style={{ width: `${Math.max(2, fillRatio * 100)}%` }}
                />
              </div>
              <div className="mt-1 text-right text-xs text-muted">
                {(fillRatio * 100).toFixed(1)}% full
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Per request", value: costPerRequest },
              { label: "Per 100", value: costPerRequest * 100 },
              { label: "Per 1,000", value: costPerRequest * 1000 },
            ].map((c) => (
              <div key={c.label} className="rounded-lg border border-border bg-surface p-3 text-center">
                <div className="text-sm font-bold text-primary">{usd(c.value)}</div>
                <div className="mt-1 text-[11px] text-muted">{c.label}</div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted">Input-token cost only. {OPENROUTER_FEE_NOTE}</p>
        </div>
      </div>

      <div>
        <Button variant="secondary" size="sm" onClick={() => setCompareAll((v) => !v)}>
          {compareAll ? "Hide" : "Compare all models"}
        </Button>
      </div>

      {compareAll && (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-elevated text-xs text-muted">
              <tr>
                <th className="px-3 py-2 text-left font-medium">Model</th>
                <th className="px-3 py-2 text-left font-medium">Provider</th>
                <th className="px-3 py-2 text-right font-medium">Tokens</th>
                <th className="px-3 py-2 text-right font-medium">Input cost / request</th>
              </tr>
            </thead>
            <tbody>
              {comparison.map((row) => (
                <tr key={row.model.id} className="border-t border-border">
                  <td className="px-3 py-2 text-primary">{row.model.name}</td>
                  <td className="px-3 py-2 text-muted">{row.model.provider}</td>
                  <td className="px-3 py-2 text-right font-mono text-primary">
                    {row.tokens.toLocaleString()}
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-primary">{usd(row.cost)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Alert variant="info">
        Cheapest first. Self-hosted models (e.g. Llama) show $0 API cost — real hosting costs vary.
      </Alert>
    </div>
  );
}
