import { unstable_cache } from "next/cache";
import { get } from "@vercel/edge-config";
import overrides from "./tools-overrides.json";

/**
 * Tool visibility source of truth.
 *
 * PRIMARY: Vercel Edge Config key "hiddenTools" (array of hidden tool slugs).
 * FALLBACK: lib/tools-overrides.json — used silently if Edge Config is
 * unreachable, unset, or returns an unexpected shape, so the site never breaks.
 *
 * The Edge Config read is wrapped in Next's data cache (tagged + 60s revalidate)
 * so we stay well under the Hobby plan's read limit. Unlike a per-instance memory
 * cache, the tag lets an admin save invalidate every instance at once via
 * revalidateTag(HIDDEN_TOOLS_TAG) — so changes show up immediately everywhere.
 */

export const HIDDEN_TOOLS_TAG = "hidden-tools";

function fallback(): string[] {
  return Array.isArray(overrides.hidden) ? (overrides.hidden as string[]) : [];
}

async function readHiddenTools(): Promise<string[]> {
  try {
    if (process.env.EDGE_CONFIG) {
      const raw = await get("hiddenTools");
      if (Array.isArray(raw)) {
        return raw.filter((x): x is string => typeof x === "string");
      }
    }
  } catch {
    // fall through to the committed JSON fallback
  }
  return fallback();
}

export const getHiddenTools = unstable_cache(readHiddenTools, ["hidden-tools"], {
  tags: [HIDDEN_TOOLS_TAG],
  revalidate: 60,
});
