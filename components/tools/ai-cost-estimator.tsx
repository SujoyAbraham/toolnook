"use client";

import { useEffect, useMemo, useState } from "react";
import { Input, Label, Select } from "@/components/ui/Field";
import { Alert } from "@/components/ui/Alert";
import { DataFreshnessBadge } from "@/components/ui/DataFreshnessBadge";
import { useModelsData } from "@/lib/useModelsData";
import { type AIModel, OPENROUTER_FEE_NOTE } from "@/lib/ai-models-fallback";

function usd(n: number): string {
  if (n === 0) return "$0.00";
  if (n < 0.01) return "$" + n.toFixed(6);
  if (n < 1) return "$" + n.toFixed(4);
  return "$" + n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function perRequestCost(m: AIModel, inputTokens: number, outputTokens: number): number {
  return (inputTokens * m.inputPricePerM + outputTokens * m.outputPricePerM) / 1_000_000;
}

export default function AiCostEstimator() {
  const { models, source, updatedAt, loading } = useModelsData();
  const [modelId, setModelId] = useState("openai/gpt-4o");
  const [inputTokens, setInputTokens] = useState(1000);
  const [outputTokens, setOutputTokens] = useState(500);
  const [perDay, setPerDay] = useState(1000);

  useEffect(() => {
    if (models.length && !models.some((m) => m.id === modelId)) setModelId(models[0].id);
  }, [models, modelId]);

  const model = models.find((m) => m.id === modelId) ?? models[0];

  const costs = useMemo(() => {
    if (!model) return { request: 0, day: 0, month: 0, year: 0 };
    const request = perRequestCost(model, inputTokens, outputTokens);
    const day = request * perDay;
    return { request, day, month: day * 30, year: day * 365 };
  }, [model, inputTokens, outputTokens, perDay]);

  const alternatives = useMemo(() => {
    if (!model) return [];
    const selectedMonthly = costs.month;
    return models
      .filter((m) => m.id !== model.id)
      .map((m) => {
        const monthly = perRequestCost(m, inputTokens, outputTokens) * perDay * 30;
        return { model: m, monthly, savings: selectedMonthly - monthly };
      })
      .sort((a, b) => a.monthly - b.monthly)
      .slice(0, 3);
  }, [models, model, inputTokens, outputTokens, perDay, costs.month]);

  return (
    <div className="space-y-4">
      <DataFreshnessBadge source={source} updatedAt={updatedAt} loading={loading} />

      <Alert variant="info">
        Pricing from OpenRouter includes a ~5.5% fee. Self-hosted models show $0 API cost.
      </Alert>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2">
          <Label htmlFor="ce-model">Model</Label>
          <Select id="ce-model" aria-label="Model" value={modelId} onChange={(e) => setModelId(e.target.value)}>
            {models.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.provider})
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="ce-in">Avg input tokens</Label>
          <Input id="ce-in" type="number" min={0} aria-label="Average input tokens" value={inputTokens} onChange={(e) => setInputTokens(Math.max(0, Number(e.target.value)))} />
        </div>
        <div>
          <Label htmlFor="ce-out">Avg output tokens</Label>
          <Input id="ce-out" type="number" min={0} aria-label="Average output tokens" value={outputTokens} onChange={(e) => setOutputTokens(Math.max(0, Number(e.target.value)))} />
        </div>
        <div>
          <Label htmlFor="ce-req">Requests / day</Label>
          <Input id="ce-req" type="number" min={0} aria-label="Requests per day" value={perDay} onChange={(e) => setPerDay(Math.max(0, Number(e.target.value)))} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Per request", value: costs.request },
          { label: "Per day", value: costs.day },
          { label: "Per month", value: costs.month },
          { label: "Per year", value: costs.year },
        ].map((c) => (
          <div key={c.label} className="rounded-lg border border-border bg-surface p-4 text-center">
            <div className="text-xl font-bold text-primary">{usd(c.value)}</div>
            <div className="mt-1 text-xs text-muted">{c.label}</div>
          </div>
        ))}
      </div>

      <div>
        <Label>Cheapest alternatives (same usage)</Label>
        <ul className="space-y-2">
          {alternatives.map((alt) => (
            <li key={alt.model.id} className="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-3 text-sm">
              <div>
                <span className="font-medium text-primary">{alt.model.name}</span>
                <span className="ml-2 text-muted">{alt.model.provider}</span>
                {alt.model.inputPricePerM === 0 && (
                  <span className="ml-2 rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] text-amber-300">self-hosted</span>
                )}
              </div>
              <div className="text-right">
                <div className="font-mono text-primary">{usd(alt.monthly)}/mo</div>
                <div className={`text-xs ${alt.savings >= 0 ? "text-success" : "text-error"}`}>
                  {alt.savings >= 0 ? `save ${usd(alt.savings)}/mo` : `+${usd(-alt.savings)}/mo`}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
