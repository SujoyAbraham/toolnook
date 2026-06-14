"use client";

import { useMemo, useState } from "react";
import { ArrowLeftRight } from "lucide-react";
import { Label, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { CopyButton } from "@/components/ui/CopyButton";
import { Alert } from "@/components/ui/Alert";
import { downloadText } from "@/lib/utils";

type Mode = "json2csv" | "csv2json";

function escapeCsv(value: unknown): string {
  const s = value === null || value === undefined ? "" : String(value);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function jsonToCsv(json: string): string {
  const data: unknown = JSON.parse(json);
  if (!Array.isArray(data)) throw new Error("JSON must be an array of objects.");
  if (data.length === 0) return "";
  const headers = Array.from(
    data.reduce<Set<string>>((set, row) => {
      if (row && typeof row === "object") Object.keys(row).forEach((k) => set.add(k));
      return set;
    }, new Set<string>()),
  );
  const lines = [headers.map(escapeCsv).join(",")];
  for (const row of data) {
    const obj = (row ?? {}) as Record<string, unknown>;
    lines.push(headers.map((h) => escapeCsv(obj[h])).join(","));
  }
  return lines.join("\n");
}

function parseCsv(csv: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < csv.length; i++) {
    const c = csv[i];
    if (inQuotes) {
      if (c === '"') {
        if (csv[i + 1] === '"') {
          field += '"';
          i++;
        } else inQuotes = false;
      } else field += c;
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && csv[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else field += c;
  }
  if (field !== "" || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((v) => v !== ""));
}

function csvToJson(csv: string): string {
  const rows = parseCsv(csv);
  if (rows.length < 1) return "[]";
  const headers = rows[0];
  const result = rows.slice(1).map((r) => {
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => (obj[h] = r[i] ?? ""));
    return obj;
  });
  return JSON.stringify(result, null, 2);
}

export default function JsonCsv() {
  const [mode, setMode] = useState<Mode>("json2csv");
  const [input, setInput] = useState(
    '[\n  { "name": "Ada", "role": "Engineer" },\n  { "name": "Linus", "role": "Maintainer" }\n]',
  );

  const { output, error } = useMemo(() => {
    if (!input.trim()) return { output: "", error: null };
    try {
      return { output: mode === "json2csv" ? jsonToCsv(input) : csvToJson(input), error: null };
    } catch (e) {
      return { output: "", error: e instanceof Error ? e.message : "Conversion failed" };
    }
  }, [input, mode]);

  function swap() {
    if (output && !error) setInput(output);
    setMode((m) => (m === "json2csv" ? "csv2json" : "json2csv"));
  }

  const inLabel = mode === "json2csv" ? "JSON array" : "CSV";
  const outLabel = mode === "json2csv" ? "CSV" : "JSON array";

  return (
    <div className="grid grid-cols-1 items-start gap-3 lg:grid-cols-[1fr_auto_1fr]">
      <div>
        <Label htmlFor="jc-input">{inLabel}</Label>
        <Textarea
          id="jc-input"
          aria-label={`${inLabel} input`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="min-h-72"
        />
      </div>

      <div className="flex justify-center lg:flex-col lg:pt-8">
        <Button variant="secondary" size="sm" onClick={swap} aria-label="Swap direction">
          <ArrowLeftRight size={16} />
        </Button>
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <Label className="mb-0">{outLabel}</Label>
          <div className="flex gap-2">
            <CopyButton value={output} label="Copy" />
            <Button
              size="sm"
              variant="secondary"
              disabled={!output || !!error}
              onClick={() =>
                downloadText(
                  output,
                  mode === "json2csv" ? "data.csv" : "data.json",
                  mode === "json2csv" ? "text/csv" : "application/json",
                )
              }
            >
              Download
            </Button>
          </div>
        </div>
        {error ? (
          <Alert variant="error">{error}</Alert>
        ) : (
          <Textarea readOnly aria-label={`${outLabel} output`} value={output} className="min-h-72 bg-surface" />
        )}
      </div>
    </div>
  );
}
