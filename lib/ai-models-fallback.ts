/**
 * Static safety-net model data used when the live OpenRouter feed is
 * unavailable. Prices are USD per 1,000,000 tokens (already converted from
 * OpenRouter's per-token values). Self-hosted models (Llama) are listed at
 * $0 API cost — real hosting costs vary.
 */

export type ModelProvider = "OpenAI" | "Anthropic" | "Google" | "Meta" | "Mistral" | "Other";
export type SpeedTier = "Fast" | "Medium" | "Slow";

export type AIModel = {
  id: string;
  name: string;
  provider: ModelProvider;
  contextWindow: number;
  inputPricePerM: number;
  outputPricePerM: number;
  vision: boolean;
  tools: boolean;
  speedTier: SpeedTier;
  strengths: string;
};

export const PROVIDERS: ModelProvider[] = [
  "OpenAI",
  "Anthropic",
  "Google",
  "Meta",
  "Mistral",
  "Other",
];

/** Multiply a GPT/BPE token count by this factor to estimate a provider's count. */
export const TOKEN_CORRECTION: Record<ModelProvider, number> = {
  OpenAI: 1.0,
  Anthropic: 1.15,
  Google: 1.1,
  Meta: 1.1,
  Mistral: 1.08,
  Other: 1.1,
};

export const OPENROUTER_FEE_NOTE =
  "Pricing reflects OpenRouter rates, which include a ~5.5% platform fee. Direct provider pricing may differ.";

export const FALLBACK_MODELS: AIModel[] = [
  {
    id: "openai/gpt-4o",
    name: "GPT-4o",
    provider: "OpenAI",
    contextWindow: 128000,
    inputPricePerM: 2.5,
    outputPricePerM: 10,
    vision: true,
    tools: true,
    speedTier: "Fast",
    strengths: "Balanced flagship, vision, tool use",
  },
  {
    id: "openai/gpt-4o-mini",
    name: "GPT-4o mini",
    provider: "OpenAI",
    contextWindow: 128000,
    inputPricePerM: 0.15,
    outputPricePerM: 0.6,
    vision: true,
    tools: true,
    speedTier: "Fast",
    strengths: "Very cheap, low latency, vision",
  },
  {
    id: "openai/gpt-4-turbo",
    name: "GPT-4 Turbo",
    provider: "OpenAI",
    contextWindow: 128000,
    inputPricePerM: 10,
    outputPricePerM: 30,
    vision: true,
    tools: true,
    speedTier: "Medium",
    strengths: "Strong reasoning, vision, tool use",
  },
  {
    id: "anthropic/claude-3.5-sonnet",
    name: "Claude 3.5 Sonnet",
    provider: "Anthropic",
    contextWindow: 200000,
    inputPricePerM: 3,
    outputPricePerM: 15,
    vision: true,
    tools: true,
    speedTier: "Medium",
    strengths: "Top coding, long context, vision",
  },
  {
    id: "anthropic/claude-3-opus",
    name: "Claude 3 Opus",
    provider: "Anthropic",
    contextWindow: 200000,
    inputPricePerM: 15,
    outputPricePerM: 75,
    vision: true,
    tools: true,
    speedTier: "Slow",
    strengths: "Deep reasoning, long context",
  },
  {
    id: "anthropic/claude-3-haiku",
    name: "Claude 3 Haiku",
    provider: "Anthropic",
    contextWindow: 200000,
    inputPricePerM: 0.25,
    outputPricePerM: 1.25,
    vision: true,
    tools: true,
    speedTier: "Fast",
    strengths: "Cheap, fast, long context",
  },
  {
    id: "google/gemini-1.5-pro",
    name: "Gemini 1.5 Pro",
    provider: "Google",
    contextWindow: 2000000,
    inputPricePerM: 1.25,
    outputPricePerM: 5,
    vision: true,
    tools: true,
    speedTier: "Medium",
    strengths: "Huge 2M context, vision, tool use",
  },
  {
    id: "google/gemini-1.5-flash",
    name: "Gemini 1.5 Flash",
    provider: "Google",
    contextWindow: 1000000,
    inputPricePerM: 0.075,
    outputPricePerM: 0.3,
    vision: true,
    tools: true,
    speedTier: "Fast",
    strengths: "Cheap, huge context, low latency",
  },
  {
    id: "google/gemini-flash-1.5-8b",
    name: "Gemini 1.5 Flash 8B",
    provider: "Google",
    contextWindow: 1000000,
    inputPricePerM: 0.0375,
    outputPricePerM: 0.15,
    vision: true,
    tools: true,
    speedTier: "Fast",
    strengths: "Ultra cheap, huge context",
  },
  {
    id: "meta-llama/llama-3.1-405b-instruct",
    name: "Llama 3.1 405B Instruct",
    provider: "Meta",
    contextWindow: 128000,
    inputPricePerM: 0,
    outputPricePerM: 0,
    vision: false,
    tools: true,
    speedTier: "Slow",
    strengths: "Open weights, self-host, tool use",
  },
  {
    id: "meta-llama/llama-3.1-70b-instruct",
    name: "Llama 3.1 70B Instruct",
    provider: "Meta",
    contextWindow: 128000,
    inputPricePerM: 0,
    outputPricePerM: 0,
    vision: false,
    tools: true,
    speedTier: "Medium",
    strengths: "Open weights, self-host, low cost",
  },
  {
    id: "meta-llama/llama-3.2-90b-vision-instruct",
    name: "Llama 3.2 90B Vision",
    provider: "Meta",
    contextWindow: 128000,
    inputPricePerM: 0,
    outputPricePerM: 0,
    vision: true,
    tools: false,
    speedTier: "Medium",
    strengths: "Open weights, vision, self-host",
  },
  {
    id: "mistralai/mistral-large",
    name: "Mistral Large",
    provider: "Mistral",
    contextWindow: 128000,
    inputPricePerM: 2,
    outputPricePerM: 6,
    vision: false,
    tools: true,
    speedTier: "Medium",
    strengths: "Strong reasoning, tool use",
  },
  {
    id: "mistralai/mistral-nemo",
    name: "Mistral Nemo",
    provider: "Mistral",
    contextWindow: 128000,
    inputPricePerM: 0.15,
    outputPricePerM: 0.15,
    vision: false,
    tools: true,
    speedTier: "Fast",
    strengths: "Cheap, fast, tool use",
  },
];
