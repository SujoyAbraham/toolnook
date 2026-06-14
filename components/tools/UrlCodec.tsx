"use client";

import { useMemo, useState } from "react";
import { Label, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { CopyButton } from "@/components/ui/CopyButton";
import { Alert } from "@/components/ui/Alert";

const REASONS: Record<string, string> = {
  " ": "Space is not allowed in URLs",
  "!": "Reserved sub-delimiter",
  "#": "Fragment delimiter",
  $: "Reserved sub-delimiter",
  "&": "Query parameter separator",
  "'": "Reserved sub-delimiter",
  "(": "Reserved sub-delimiter",
  ")": "Reserved sub-delimiter",
  "*": "Reserved sub-delimiter",
  "+": "Interpreted as a space in queries",
  ",": "Reserved sub-delimiter",
  "/": "Path segment separator",
  ":": "Scheme / port delimiter",
  ";": "Reserved sub-delimiter",
  "=": "Key/value delimiter",
  "?": "Query delimiter",
  "@": "Userinfo delimiter",
  "[": "Reserved (IPv6 literal)",
  "]": "Reserved (IPv6 literal)",
};

function reasonFor(ch: string): string {
  if (REASONS[ch]) return REASONS[ch];
  if (/[^\x00-\x7F]/.test(ch)) return "Non-ASCII character (UTF-8 encoded)";
  return "Unsafe character";
}

export default function UrlCodec() {
  const [raw, setRaw] = useState("https://example.com/search?q=hello world&lang=en");
  const [encoded, setEncoded] = useState("");
  const [error, setError] = useState<string | null>(null);

  function doEncode() {
    setEncoded(encodeURIComponent(raw));
    setError(null);
  }

  function doDecode() {
    try {
      setRaw(decodeURIComponent(encoded));
      setError(null);
    } catch {
      setError("The encoded string is not valid.");
    }
  }

  function clear() {
    setRaw("");
    setEncoded("");
    setError(null);
  }

  const changedChars = useMemo(() => {
    const seen = new Map<string, string>();
    for (const ch of raw) {
      if (seen.has(ch)) continue;
      const enc = encodeURIComponent(ch);
      if (enc !== ch) seen.set(ch, enc);
    }
    return Array.from(seen.entries());
  }, [raw]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div>
          <Label htmlFor="url-raw">Raw URL</Label>
          <Textarea
            id="url-raw"
            aria-label="Raw URL"
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            className="min-h-32"
          />
        </div>
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <Label className="mb-0">Encoded URL</Label>
            <CopyButton value={encoded} label="Copy" />
          </div>
          <Textarea
            id="url-encoded"
            aria-label="Encoded URL"
            value={encoded}
            onChange={(e) => setEncoded(e.target.value)}
            className="min-h-32"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={doEncode}>Encode →</Button>
        <Button variant="secondary" onClick={doDecode}>
          ← Decode
        </Button>
        <Button variant="ghost" onClick={clear}>
          Clear
        </Button>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      {changedChars.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-elevated text-muted">
              <tr>
                <th className="px-3 py-2 text-left font-medium">Character</th>
                <th className="px-3 py-2 text-left font-medium">Encoded</th>
                <th className="px-3 py-2 text-left font-medium">Why</th>
              </tr>
            </thead>
            <tbody>
              {changedChars.map(([ch, enc]) => (
                <tr key={ch} className="border-t border-border">
                  <td className="px-3 py-2 font-mono text-primary">
                    {ch === " " ? "(space)" : ch}
                  </td>
                  <td className="px-3 py-2 font-mono text-accent">{enc}</td>
                  <td className="px-3 py-2 text-muted">{reasonFor(ch)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
