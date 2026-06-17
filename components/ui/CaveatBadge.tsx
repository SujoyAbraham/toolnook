"use client";

import { useState } from "react";
import { TriangleAlert, X } from "lucide-react";
import { cn } from "@/lib/utils";

type CaveatBadgeProps = {
  children: React.ReactNode;
  /** When false the strip cannot be dismissed (for non-negotiable limitations). */
  dismissible?: boolean;
  className?: string;
};

/** Amber limitation strip shown near the top of a tool. */
export function CaveatBadge({ children, dismissible = true, className }: CaveatBadgeProps) {
  const [hidden, setHidden] = useState(false);
  if (hidden) return null;

  return (
    <div
      role="note"
      className={cn(
        "flex items-start gap-2 rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-sm text-warning",
        className,
      )}
    >
      <TriangleAlert size={16} className="mt-0.5 shrink-0" />
      <div className="flex-1 leading-relaxed">{children}</div>
      {dismissible && (
        <button
          type="button"
          onClick={() => setHidden(true)}
          aria-label="Dismiss caveat"
          className="shrink-0 rounded p-0.5 text-warning/70 transition-colors hover:text-warning"
        >
          <X size={15} />
        </button>
      )}
    </div>
  );
}
