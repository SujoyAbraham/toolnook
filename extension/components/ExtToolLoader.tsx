import { Suspense, lazy, type ComponentType } from "react";
import { toolImports } from "@/lib/tool-imports";

// Wrap each shared importer with React.lazy (the extension equivalent of the
// web app's next/dynamic). Same slug→importer map, so adding a tool to
// lib/tool-imports.ts surfaces it here automatically.
const registry: Record<string, ComponentType> = Object.fromEntries(
  Object.entries(toolImports).map(([slug, importer]) => [slug, lazy(importer)]),
);

export function ExtToolLoader({ slug }: { slug: string }) {
  const Component = registry[slug];
  if (!Component) {
    return (
      <div className="rounded-lg border border-border bg-surface p-6 text-sm text-muted">
        This tool is not available.
      </div>
    );
  }
  return (
    <Suspense
      fallback={<div className="flex h-40 items-center justify-center text-sm text-muted">Loading tool…</div>}
    >
      <Component />
    </Suspense>
  );
}
