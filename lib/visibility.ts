import { get } from "@vercel/edge-config";
import overrides from "./tools-overrides.json";

/**
 * Tool visibility source of truth.
 *
 * PRIMARY: Vercel Edge Config key "hiddenTools" (array of hidden tool slugs).
 * FALLBACK: lib/tools-overrides.json — used silently if Edge Config is
 * unreachable, unset, or returns an unexpected shape, so the site never breaks.
 *
 * The result is cached in module memory per function instance with a short TTL
 * so each cold start reads Edge Config at most once per minute, keeping us well
 * under the Hobby plan's 100k monthly read limit.
 */

const TTL_MS = 60_000;
let cache: { value: string[]; at: number } | null = null;

function fallback(): string[] {
  return Array.isArray(overrides.hidden) ? (overrides.hidden as string[]) : [];
}

export async function getHiddenTools(): Promise<string[]> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.value;

  let value: string[] | null = null;
  try {
    if (process.env.EDGE_CONFIG) {
      const raw = await get("hiddenTools");
      if (Array.isArray(raw)) {
        value = raw.filter((x): x is string => typeof x === "string");
      }
    }
  } catch {
    value = null; // fall through to the committed JSON fallback
  }

  const resolved = value ?? fallback();
  cache = { value: resolved, at: Date.now() };
  return resolved;
}

/** Drop the module cache (used right after an admin write). */
export function clearHiddenToolsCache(): void {
  cache = null;
}
