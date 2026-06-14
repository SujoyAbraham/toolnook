"use client";

import { useEffect, useState } from "react";
import {
  type AIModel,
  type ModelProvider,
  type SpeedTier,
  FALLBACK_MODELS,
} from "./ai-models-fallback";

const CACHE_KEY = "toolvault-models-v1";
const ONE_HOUR = 60 * 60 * 1000;
const MODELS_URL = "https://openrouter.ai/api/v1/models";
const MIN_MODELS = 5;

export type ModelsSource = "live" | "fallback";

export type ModelsState = {
  models: AIModel[];
  source: ModelsSource;
  updatedAt: number;
  loading: boolean;
};

type Loaded = Pick<ModelsState, "models" | "source" | "updatedAt">;

// ── OpenRouter response typing (only the fields we use) ──────────────
type OpenRouterModel = {
  id?: string;
  name?: string;
  context_length?: number;
  architecture?: {
    modality?: string;
    input_modalities?: string[];
  };
  pricing?: {
    prompt?: string;
    completion?: string;
  };
  supported_parameters?: string[];
};

function providerFromId(id: string): ModelProvider {
  const prefix = id.split("/")[0]?.toLowerCase() ?? "";
  if (prefix === "openai") return "OpenAI";
  if (prefix === "anthropic") return "Anthropic";
  if (prefix === "google") return "Google";
  if (prefix.startsWith("meta")) return "Meta";
  if (prefix.startsWith("mistral")) return "Mistral";
  return "Other";
}

function speedTierFor(id: string, name: string): SpeedTier {
  const s = `${id} ${name}`.toLowerCase();
  if (/(mini|flash|haiku|nemo|8b|small|lite)/.test(s)) return "Fast";
  if (/(opus|ultra|405b|large|70b)/.test(s)) return "Slow";
  return "Medium";
}

function strengthsFor(m: AIModel): string {
  const parts: string[] = [];
  if (m.contextWindow >= 500000) parts.push("huge context");
  else if (m.contextWindow >= 128000) parts.push("long context");
  if (m.vision) parts.push("vision");
  if (m.tools) parts.push("tool use");
  if (m.inputPricePerM === 0) parts.push("self-host");
  else if (m.inputPricePerM <= 0.5) parts.push("very cheap");
  if (m.speedTier === "Fast") parts.push("low latency");
  return parts.length ? parts.join(", ") : "general purpose";
}

function mapModel(raw: OpenRouterModel): AIModel | null {
  const id = raw.id;
  if (!id || !raw.pricing) return null;
  const provider = providerFromId(id);
  // Keep the comparator focused on the major providers the fallback covers.
  if (provider === "Other") return null;

  const inputPricePerM = parseFloat(raw.pricing.prompt ?? "0") * 1_000_000;
  const outputPricePerM = parseFloat(raw.pricing.completion ?? "0") * 1_000_000;
  if (!Number.isFinite(inputPricePerM) || !Number.isFinite(outputPricePerM)) return null;

  const contextWindow = raw.context_length ?? 0;
  if (contextWindow <= 0) return null;

  const modalities = raw.architecture?.input_modalities ?? [];
  const vision =
    modalities.includes("image") || /image/.test(raw.architecture?.modality ?? "");
  const tools = (raw.supported_parameters ?? []).includes("tools");
  const name = (raw.name ?? id).replace(/^[^:]+:\s*/, "").trim() || id;

  const model: AIModel = {
    id,
    name,
    provider,
    contextWindow,
    inputPricePerM: Math.round(inputPricePerM * 1000) / 1000,
    outputPricePerM: Math.round(outputPricePerM * 1000) / 1000,
    vision,
    tools,
    speedTier: speedTierFor(id, name),
    strengths: "",
  };
  model.strengths = strengthsFor(model);
  return model;
}

function readCache(): Loaded | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Loaded;
    if (!parsed.updatedAt || Date.now() - parsed.updatedAt > ONE_HOUR) return null;
    if (!Array.isArray(parsed.models) || parsed.models.length < MIN_MODELS) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeCache(data: Loaded): void {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {
    // sessionStorage may be unavailable (private mode); proceed without caching.
  }
}

async function loadModels(): Promise<Loaded> {
  const cached = readCache();
  if (cached) return cached;

  try {
    const res = await fetch(MODELS_URL, { headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error(`OpenRouter responded ${res.status}`);
    const json = (await res.json()) as { data?: OpenRouterModel[] };
    const mapped = (json.data ?? [])
      .map(mapModel)
      .filter((m): m is AIModel => m !== null)
      .sort((a, b) => a.inputPricePerM - b.inputPricePerM);

    if (mapped.length < MIN_MODELS) throw new Error("Too few usable models in feed");

    const result: Loaded = { models: mapped, source: "live", updatedAt: Date.now() };
    writeCache(result);
    return result;
  } catch {
    // Silent fallback — the tool must never break or show an empty state.
    const result: Loaded = {
      models: FALLBACK_MODELS,
      source: "fallback",
      updatedAt: Date.now(),
    };
    writeCache(result);
    return result;
  }
}

// Module-scoped promise so the fetch runs at most once per session, even if
// several components mount the hook.
let inflight: Promise<Loaded> | null = null;
function getModels(): Promise<Loaded> {
  if (!inflight) inflight = loadModels();
  return inflight;
}

export function useModelsData(): ModelsState {
  const [state, setState] = useState<ModelsState>(() => ({
    models: FALLBACK_MODELS,
    source: "fallback",
    updatedAt: Date.now(),
    loading: true,
  }));

  useEffect(() => {
    let active = true;
    getModels().then((loaded) => {
      if (active) setState({ ...loaded, loading: false });
    });
    return () => {
      active = false;
    };
  }, []);

  return state;
}
