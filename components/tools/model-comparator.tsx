"use client";

import { useMemo, useState } from "react";
import { Check, Minus } from "lucide-react";
import { Label, Select } from "@/components/ui/Field";
import { Alert } from "@/components/ui/Alert";
import { CaveatBadge } from "@/components/ui/CaveatBadge";
import { DataFreshnessBadge } from "@/components/ui/DataFreshnessBadge";
import { useModelsData } from "@/lib/useModelsData";
import { OPENROUTER_FEE_NOTE, type SpeedTier } from "@/lib/ai-models-fallback";

type SortKey = "context" | "input" | "output" | "speed";
const SPEED_ORDER: Record<SpeedTier, number> = { Fast: 0, Medium: 1, Slow: 2 };

function usdPerM(n: number): string {
  if (n === 0) return "$0";
  return "$" + n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function ctx(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n % 1_000_000 ? 1 : 0)}M`;
  if (n >= 1000) return `${Math.round(n / 1000)}K`;
  return String(n);
}

export default function ModelComparator() {
  const { models, source, updatedAt, loading } = useModelsData();
  const [provider, setProvider] = useState("all");
  const [capability, setCapability] = useState<"any" | "vision" | "tools">("any");
  const [sortKey, setSortKey] = useState<SortKey>("input");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const providers = useMemo(
    () => Array.from(new Set(models.map((m) => m.provider))).sort(),
    [models],
  );

  const rows = useMemo(() => {
    const filtered = models.filter((m) => {
      if (provider !== "all" && m.provider !== provider) return false;
      if (capability === "vision" && !m.vision) return false;
      if (capability === "tools" && !m.tools) return false;
      return true;
    });
    const dir = sortDir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      let diff = 0;
      if (sortKey === "context") diff = a.contextWindow - b.contextWindow;
      else if (sortKey === "input") diff = a.inputPricePerM - b.inputPricePerM;
      else if (sortKey === "output") diff = a.outputPricePerM - b.outputPricePerM;
      else diff = SPEED_ORDER[a.speedTier] - SPEED_ORDER[b.speedTier];
      return diff * dir || a.name.localeCompare(b.name);
    });
  }, [models, provider, capability, sortKey, sortDir]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <DataFreshnessBadge source={source} updatedAt={updatedAt} loading={loading} />
        <span className="text-xs text-muted">{rows.length} models</span>
      </div>

      <CaveatBadge>
        This tool fetches the public model price list from OpenRouter to stay current.
        Nothing you type or select is ever sent — only a read-only catalogue is loaded.
      </CaveatBadge>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        <div>
          <Label htmlFor="mc-provider">Provider</Label>
          <Select id="mc-provider" aria-label="Filter by provider" value={provider} onChange={(e) => setProvider(e.target.value)}>
            <option value="all">All providers</option>
            {providers.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="mc-cap">Capability</Label>
          <Select id="mc-cap" aria-label="Filter by capability" value={capability} onChange={(e) => setCapability(e.target.value as typeof capability)}>
            <option value="any">Any capability</option>
            <option value="vision">Vision</option>
            <option value="tools">Tool use</option>
          </Select>
        </div>
        <div>
          <Label htmlFor="mc-sort">Sort by</Label>
          <Select id="mc-sort" aria-label="Sort by" value={sortKey} onChange={(e) => setSortKey(e.target.value as SortKey)}>
            <option value="input">Input price</option>
            <option value="output">Output price</option>
            <option value="context">Context window</option>
            <option value="speed">Speed tier</option>
          </Select>
        </div>
        <div>
          <Label htmlFor="mc-dir">Direction</Label>
          <Select id="mc-dir" aria-label="Sort direction" value={sortDir} onChange={(e) => setSortDir(e.target.value as "asc" | "desc")}>
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </Select>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-elevated text-xs text-muted">
            <tr>
              <th className="px-3 py-2 text-left font-medium">Model</th>
              <th className="px-3 py-2 text-left font-medium">Provider</th>
              <th className="px-3 py-2 text-right font-medium">Context</th>
              <th className="px-3 py-2 text-right font-medium">In /1M</th>
              <th className="px-3 py-2 text-right font-medium">Out /1M</th>
              <th className="px-3 py-2 text-left font-medium">Speed</th>
              <th className="px-3 py-2 text-center font-medium">Vision</th>
              <th className="px-3 py-2 text-center font-medium">Tools</th>
              <th className="px-3 py-2 text-left font-medium">Strengths</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((m) => (
              <tr key={m.id} className="border-t border-border align-top">
                <td className="px-3 py-2 font-medium text-primary">{m.name}</td>
                <td className="px-3 py-2 text-muted">{m.provider}</td>
                <td className="px-3 py-2 text-right font-mono text-primary">{ctx(m.contextWindow)}</td>
                <td className="px-3 py-2 text-right font-mono text-primary">{usdPerM(m.inputPricePerM)}</td>
                <td className="px-3 py-2 text-right font-mono text-primary">{usdPerM(m.outputPricePerM)}</td>
                <td className="px-3 py-2 text-muted">{m.speedTier}</td>
                <td className="px-3 py-2 text-center">{m.vision ? <Check size={15} className="mx-auto text-success" /> : <Minus size={15} className="mx-auto text-muted" />}</td>
                <td className="px-3 py-2 text-center">{m.tools ? <Check size={15} className="mx-auto text-success" /> : <Minus size={15} className="mx-auto text-muted" />}</td>
                <td className="px-3 py-2 text-xs text-muted">{m.strengths}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Alert variant="info">{OPENROUTER_FEE_NOTE}</Alert>
      <Alert variant="info">
        Self-hosted models like Llama show $0 API cost, but real hosting costs vary.
      </Alert>
    </div>
  );
}
