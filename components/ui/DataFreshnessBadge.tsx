"use client";

import { Loader2, Radio, WifiOff } from "lucide-react";
import { type ModelsSource } from "@/lib/useModelsData";
import { cn } from "@/lib/utils";

function relativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  return `${hours}h ago`;
}

type Props = {
  source: ModelsSource;
  updatedAt: number;
  loading?: boolean;
  className?: string;
};

/**
 * Non-blocking status chip showing whether model data is live or fallback and
 * when it was last refreshed. Never prevents the tool from being used.
 */
export function DataFreshnessBadge({ source, updatedAt, loading, className }: Props) {
  if (loading) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border border-border bg-elevated px-2.5 py-1 text-xs text-muted",
          className,
        )}
      >
        <Loader2 size={12} className="animate-spin" />
        Loading model data…
      </span>
    );
  }

  const live = source === "live";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs",
        live
          ? "border-success/40 bg-success/10 text-success"
          : "border-amber-500/40 bg-amber-500/10 text-amber-300",
        className,
      )}
      title={live ? "Fetched from OpenRouter" : "Using built-in fallback model list"}
    >
      {live ? <Radio size={12} /> : <WifiOff size={12} />}
      {live ? "Live data" : "Fallback data"}
      <span className="opacity-70">· updated {relativeTime(updatedAt)}</span>
    </span>
  );
}
