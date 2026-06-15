import { defineConfig } from "wxt";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "node:path";
import type { Plugin } from "vite";

// Repo root (the Next app) — one level up from this extension folder.
// Use cwd (wxt is always invoked from extension/ via the npm scripts); WXT
// compiles this config to a temp dir, so import.meta.url is unreliable here.
const repoRoot = resolve(process.cwd(), "..");

/**
 * Resolve "@/..." to the repo root so the reused web-app components load.
 * WXT hard-codes "@" → its own srcDir in resolve-config, overriding the `alias`
 * and `resolve.alias` options. rolldown applies that alias natively (before JS
 * resolveId hooks), so the only reliable override is to mutate the final
 * resolved alias array and prepend our entry so it matches first.
 */
function repoRootAlias(): Plugin {
  return {
    name: "toolnook-repo-alias",
    enforce: "pre",
    configResolved(resolved) {
      const entry = { find: /^@\//, replacement: `${repoRoot}/` };
      const a = resolved.resolve.alias as unknown;
      if (Array.isArray(a)) a.unshift(entry);
      else (resolved.resolve as { alias: unknown }).alias = [entry];
    },
  };
}

export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  manifest: {
    name: "ToolNook",
    description:
      "Browser-native dev & productivity tools — JSON, PDF, image, hashing, AI and more. Everything runs locally.",
    permissions: ["sidePanel"],
    // Lets the model-comparator/cost-estimator fetch live model prices;
    // it falls back to bundled data if blocked.
    host_permissions: ["https://openrouter.ai/*"],
    action: { default_title: "Open ToolNook" },
    icons: {
      16: "icon-16.png",
      32: "icon-32.png",
      48: "icon-48.png",
      128: "icon-128.png",
    },
  },
  vite: () => ({
    plugins: [repoRootAlias(), tailwindcss()],
    // The reused components live in the web app's tree, so without dedupe their
    // `import "react"` resolves to the web app's node_modules — a second React
    // copy that breaks hooks. Force a single instance from the extension.
    resolve: {
      dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
    },
    server: { fs: { allow: [repoRoot] } },
  }),
});
