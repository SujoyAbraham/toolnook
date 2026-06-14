"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Label, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { CaveatBadge } from "@/components/ui/CaveatBadge";

function tokenize(text: string): string[] {
  const clean = text.toLowerCase();
  const words = clean.split(/[^a-z0-9]+/).filter(Boolean);
  const letters = clean.replace(/[^a-z0-9]/g, "");
  const bigrams: string[] = [];
  for (let i = 0; i < letters.length - 1; i++) bigrams.push("_" + letters.slice(i, i + 2));
  return [...words, ...bigrams];
}

function buildVectors(docs: string[]): Map<string, number>[] {
  const tokenized = docs.map(tokenize);
  const n = docs.length;
  const df = new Map<string, number>();
  for (const tokens of tokenized) {
    for (const term of new Set(tokens)) df.set(term, (df.get(term) ?? 0) + 1);
  }
  return tokenized.map((tokens) => {
    const tf = new Map<string, number>();
    for (const t of tokens) tf.set(t, (tf.get(t) ?? 0) + 1);
    const vec = new Map<string, number>();
    for (const [term, count] of tf) {
      const idf = Math.log((1 + n) / (1 + (df.get(term) ?? 0))) + 1;
      vec.set(term, count * idf);
    }
    return vec;
  });
}

function cosine(a: Map<string, number>, b: Map<string, number>): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (const v of a.values()) na += v * v;
  for (const v of b.values()) nb += v * v;
  const [small, large] = a.size <= b.size ? [a, b] : [b, a];
  for (const [term, v] of small) {
    const other = large.get(term);
    if (other) dot += v * other;
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

function bucketClass(score: number): string {
  if (score >= 0.75) return "bg-success/30 text-success";
  if (score >= 0.5) return "bg-success/15 text-success";
  if (score >= 0.3) return "bg-amber-500/15 text-amber-300";
  if (score >= 0.15) return "bg-error/10 text-error";
  return "bg-error/20 text-error";
}

type Result = {
  matrix: number[][];
  labels: string[];
  mostSimilar: { i: number; j: number; score: number } | null;
  mostDifferent: { i: number; j: number; score: number } | null;
};

export default function TfidfSimilarity() {
  const [texts, setTexts] = useState<string[]>([
    "The cat sat quietly on the warm windowsill in the afternoon sun.",
    "A feline rested calmly by the sunny window during the afternoon.",
  ]);
  const [result, setResult] = useState<Result | null>(null);

  function update(index: number, value: string) {
    setTexts((arr) => arr.map((t, i) => (i === index ? value : t)));
  }

  function analyze() {
    const vectors = buildVectors(texts);
    const n = texts.length;
    const matrix: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));
    let mostSimilar: Result["mostSimilar"] = null;
    let mostDifferent: Result["mostDifferent"] = null;
    for (let i = 0; i < n; i++) {
      matrix[i][i] = 1;
      for (let j = i + 1; j < n; j++) {
        const score = cosine(vectors[i], vectors[j]);
        matrix[i][j] = score;
        matrix[j][i] = score;
        if (!mostSimilar || score > mostSimilar.score) mostSimilar = { i, j, score };
        if (!mostDifferent || score < mostDifferent.score) mostDifferent = { i, j, score };
      }
    }
    setResult({
      matrix,
      labels: texts.map((_, i) => `Text ${i + 1}`),
      mostSimilar,
      mostDifferent,
    });
  }

  return (
    <div className="space-y-4">
      <CaveatBadge dismissible={false}>
        This uses TF-IDF approximation, not real vector embeddings. Results indicate keyword
        overlap, not deep semantic similarity. For production use, use your provider&apos;s
        embeddings API.
      </CaveatBadge>

      <div className="space-y-3">
        {texts.map((text, i) => (
          <div key={i}>
            <div className="mb-1 flex items-center justify-between">
              <Label className="mb-0">Text {i + 1}</Label>
              {texts.length > 2 && (
                <button
                  type="button"
                  onClick={() => setTexts((arr) => arr.filter((_, idx) => idx !== i))}
                  aria-label={`Remove text ${i + 1}`}
                  className="text-muted hover:text-error"
                >
                  <Trash2 size={15} />
                </button>
              )}
            </div>
            <Textarea
              aria-label={`Text ${i + 1}`}
              value={text}
              onChange={(e) => update(i, e.target.value)}
              className="min-h-24 font-sans"
            />
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {texts.length < 6 && (
          <Button variant="secondary" size="sm" onClick={() => setTexts((arr) => [...arr, ""])}>
            <Plus size={14} /> Add text
          </Button>
        )}
        <Button onClick={analyze}>Analyze</Button>
      </div>

      {result && (
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <table className="border-collapse text-sm">
              <thead>
                <tr>
                  <th className="p-2"></th>
                  {result.labels.map((l) => (
                    <th key={l} className="p-2 text-xs font-medium text-muted">
                      {l}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.matrix.map((row, i) => (
                  <tr key={i}>
                    <th className="p-2 text-left text-xs font-medium text-muted">{result.labels[i]}</th>
                    {row.map((score, j) => (
                      <td key={j} className="p-1">
                        <div className={`flex h-11 w-16 items-center justify-center rounded font-mono text-xs ${bucketClass(score)}`}>
                          {score.toFixed(2)}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {result.mostSimilar && result.mostDifferent && (
            <div className="space-y-2 text-sm">
              <p className="rounded-lg border border-border bg-surface px-3 py-2 text-primary">
                <span className="font-semibold text-success">Most similar:</span>{" "}
                {result.labels[result.mostSimilar.i]} and {result.labels[result.mostSimilar.j]} share
                the most keywords ({result.mostSimilar.score.toFixed(2)}).
              </p>
              <p className="rounded-lg border border-border bg-surface px-3 py-2 text-primary">
                <span className="font-semibold text-error">Most different:</span>{" "}
                {result.labels[result.mostDifferent.i]} and {result.labels[result.mostDifferent.j]}{" "}
                overlap the least ({result.mostDifferent.score.toFixed(2)}).
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
