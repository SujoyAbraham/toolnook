"use client";

import dynamic from "next/dynamic";
import { type ComponentType } from "react";
import { toolImports } from "@/lib/tool-imports";

function Loading() {
  return (
    <div className="flex h-40 items-center justify-center text-sm text-muted">
      Loading tool…
    </div>
  );
}

// Wrap each shared importer with next/dynamic (client-only). The slug→importer
// map lives in lib/tool-imports.ts so the web app and the extension stay in sync.
const registry: Record<string, ComponentType> = Object.fromEntries(
  Object.entries(toolImports).map(([slug, importer]) => [
    slug,
    dynamic(importer, { ssr: false, loading: Loading }),
  ]),
);

export function ToolLoader({ slug }: { slug: string }) {
  const Component = registry[slug];
  if (!Component) {
    return (
      <div className="rounded-lg border border-border bg-surface p-6 text-sm text-muted">
        This tool is not available.
      </div>
    );
  }
  return <Component />;
}
