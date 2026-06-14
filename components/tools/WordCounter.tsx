"use client";

import { useMemo, useState } from "react";
import { Label, Textarea } from "@/components/ui/Field";

const STOP_WORDS = new Set([
  "the", "a", "an", "and", "or", "but", "of", "to", "in", "on", "at", "for", "with",
  "is", "are", "was", "were", "be", "been", "being", "it", "its", "this", "that",
  "these", "those", "as", "by", "from", "i", "you", "he", "she", "we", "they", "them",
  "his", "her", "their", "our", "my", "your", "if", "then", "so", "not", "no", "do",
  "does", "did", "have", "has", "had", "will", "would", "can", "could", "should", "all",
]);

function analyze(text: string) {
  const trimmed = text.trim();
  const words = trimmed ? trimmed.split(/\s+/) : [];
  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, "").length;
  const sentences = trimmed ? (trimmed.match(/[.!?]+(\s|$)/g)?.length ?? 1) : 0;
  const paragraphs = trimmed ? trimmed.split(/\n\s*\n/).filter((p) => p.trim()).length : 0;

  const freq = new Map<string, number>();
  for (const raw of words) {
    const w = raw.toLowerCase().replace(/[^a-z0-9']/g, "");
    if (w.length < 2 || STOP_WORDS.has(w)) continue;
    freq.set(w, (freq.get(w) ?? 0) + 1);
  }
  const top = Array.from(freq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  return {
    words: words.length,
    characters,
    charactersNoSpaces,
    sentences,
    paragraphs,
    readingMin: words.length / 200,
    speakingMin: words.length / 130,
    top,
  };
}

function fmtTime(min: number): string {
  if (min === 0) return "0 sec";
  if (min < 1) return `${Math.ceil(min * 60)} sec`;
  return `${Math.floor(min)} min ${Math.round((min % 1) * 60)} sec`;
}

export default function WordCounter() {
  const [text, setText] = useState("");
  const stats = useMemo(() => analyze(text), [text]);

  const cards = [
    { label: "Words", value: stats.words },
    { label: "Characters", value: stats.characters },
    { label: "Characters (no spaces)", value: stats.charactersNoSpaces },
    { label: "Sentences", value: stats.sentences },
    { label: "Paragraphs", value: stats.paragraphs },
    { label: "Reading time", value: fmtTime(stats.readingMin) },
    { label: "Speaking time", value: fmtTime(stats.speakingMin) },
  ];

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="wc-input">Text</Label>
        <Textarea
          id="wc-input"
          aria-label="Text to analyze"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Start typing or paste your text…"
          className="min-h-56 font-sans"
        />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        {cards.map((c) => (
          <div key={c.label} className="rounded-lg border border-border bg-surface p-3 text-center">
            <div className="text-xl font-bold text-primary">{c.value}</div>
            <div className="mt-1 text-[11px] text-muted">{c.label}</div>
          </div>
        ))}
      </div>

      {stats.top.length > 0 && (
        <div>
          <Label>Top 10 words</Label>
          <div className="flex flex-wrap gap-2">
            {stats.top.map(([word, count]) => (
              <span
                key={word}
                className="rounded-full border border-border bg-surface px-3 py-1 text-sm text-primary"
              >
                {word} <span className="text-muted">×{count}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
