"use client";

import { useEffect, useState } from "react";

/**
 * Admin preview: while an admin is signed in, the dashboard writes the pending
 * hidden list to localStorage so the public shell in the same browser reflects
 * unsaved toggles. Public visitors never have this key, so they only ever see
 * the server-rendered (live) state — no flash of hidden tools.
 */
export const PREVIEW_KEY = "toolnook-preview";
export const PREVIEW_EVENT = "toolnook:preview";

export function useEffectiveHidden(liveHidden: string[]): string[] {
  const [hidden, setHidden] = useState<string[]>(liveHidden);

  useEffect(() => {
    const read = () => {
      try {
        const raw = localStorage.getItem(PREVIEW_KEY);
        setHidden(raw ? (JSON.parse(raw) as string[]) : liveHidden);
      } catch {
        setHidden(liveHidden);
      }
    };
    read();
    window.addEventListener("storage", read);
    window.addEventListener(PREVIEW_EVENT, read);
    return () => {
      window.removeEventListener("storage", read);
      window.removeEventListener(PREVIEW_EVENT, read);
    };
  }, [liveHidden]);

  return hidden;
}
