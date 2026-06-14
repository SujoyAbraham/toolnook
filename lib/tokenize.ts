import { encode } from "gpt-tokenizer";
import { type ModelProvider, TOKEN_CORRECTION } from "./ai-models-fallback";

/** Exact GPT/BPE token count via gpt-tokenizer, with a safe character fallback. */
export function gptTokens(text: string): number {
  if (!text) return 0;
  try {
    return encode(text).length;
  } catch {
    return Math.ceil(text.length / 4);
  }
}

export type TokenEstimate = { tokens: number; exact: boolean };

/**
 * Token count for a given provider. Exact for OpenAI (GPT BPE); for other
 * providers a per-provider correction factor is applied (±5–10% estimate).
 */
export function estimateTokens(text: string, provider: ModelProvider): TokenEstimate {
  const base = gptTokens(text);
  if (provider === "OpenAI") return { tokens: base, exact: true };
  return { tokens: Math.round(base * TOKEN_CORRECTION[provider]), exact: false };
}
