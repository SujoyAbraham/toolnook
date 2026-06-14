"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Field";
import { Alert } from "@/components/ui/Alert";
import { downloadBlob, readFileAsArrayBuffer } from "@/lib/utils";

function parseRanges(spec: string, max: number): number[] {
  const pages = new Set<number>();
  for (const part of spec.split(",").map((s) => s.trim()).filter(Boolean)) {
    if (part.includes("-")) {
      const [a, b] = part.split("-").map((n) => parseInt(n, 10));
      if (Number.isNaN(a) || Number.isNaN(b)) throw new Error(`Invalid range "${part}"`);
      const lo = Math.min(a, b);
      const hi = Math.max(a, b);
      for (let p = lo; p <= hi; p++) pages.add(p);
    } else {
      const p = parseInt(part, 10);
      if (Number.isNaN(p)) throw new Error(`Invalid page "${part}"`);
      pages.add(p);
    }
  }
  const sorted = Array.from(pages).sort((a, b) => a - b);
  for (const p of sorted) {
    if (p < 1 || p > max) throw new Error(`Page ${p} is out of range (1-${max}).`);
  }
  return sorted;
}

export default function PdfSplit() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [ranges, setRanges] = useState("1-1");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function onSelect(f: File | undefined) {
    if (!f) return;
    setError(null);
    setFile(f);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const bytes = await readFileAsArrayBuffer(f);
      const doc = await PDFDocument.load(bytes);
      const count = doc.getPageCount();
      setPageCount(count);
      setRanges(`1-${count}`);
    } catch {
      setError("Could not read this PDF.");
      setFile(null);
    }
  }

  async function extract() {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const wanted = parseRanges(ranges, pageCount);
      if (wanted.length === 0) throw new Error("Specify at least one page.");
      const { PDFDocument } = await import("pdf-lib");
      const bytes = await readFileAsArrayBuffer(file);
      const src = await PDFDocument.load(bytes);
      const out = await PDFDocument.create();
      const copied = await out.copyPages(src, wanted.map((p) => p - 1));
      copied.forEach((p) => out.addPage(p));
      const result = await out.save();
      downloadBlob(new Blob([result as BlobPart], { type: "application/pdf" }), "extracted.pdf");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to extract pages.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          onSelect(e.dataTransfer.files[0]);
        }}
        className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-surface py-10 text-center text-muted transition-colors hover:border-accent"
      >
        <Upload size={24} />
        <p className="text-sm">{file ? file.name : "Drop a PDF here or click to browse"}</p>
        {pageCount > 0 && <p className="text-xs text-accent">{pageCount} pages</p>}
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          aria-label="Select a PDF file"
          className="hidden"
          onChange={(e) => onSelect(e.target.files?.[0])}
        />
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      {file && (
        <>
          <div>
            <Label htmlFor="pdf-ranges">Page ranges (e.g. 1-3, 5, 7-9)</Label>
            <Input
              id="pdf-ranges"
              aria-label="Page ranges"
              value={ranges}
              onChange={(e) => setRanges(e.target.value)}
              className="font-mono"
            />
          </div>
          <Button onClick={extract} disabled={busy}>
            {busy ? "Extracting…" : "Extract pages"}
          </Button>
        </>
      )}
    </div>
  );
}
