"use client";

import { useRef, useState } from "react";
import { GripVertical, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { downloadBlob, formatBytes, readFileAsArrayBuffer } from "@/lib/utils";

type Item = { id: string; file: File };

export default function PdfMerge() {
  const [items, setItems] = useState<Item[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dragIndex = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function addFiles(files: FileList | null) {
    if (!files) return;
    const pdfs = Array.from(files).filter((f) => f.type === "application/pdf");
    setItems((prev) => [
      ...prev,
      ...pdfs.map((file) => ({ id: crypto.randomUUID(), file })),
    ]);
    setError(null);
  }

  function remove(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function reorder(from: number, to: number) {
    setItems((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  }

  async function merge() {
    if (items.length < 2) {
      setError("Add at least two PDFs to merge.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const merged = await PDFDocument.create();
      for (const item of items) {
        const bytes = await readFileAsArrayBuffer(item.file);
        const doc = await PDFDocument.load(bytes);
        const pages = await merged.copyPages(doc, doc.getPageIndices());
        pages.forEach((p) => merged.addPage(p));
      }
      const out = await merged.save();
      downloadBlob(new Blob([out as BlobPart], { type: "application/pdf" }), "merged.pdf");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to merge PDFs.");
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
          addFiles(e.dataTransfer.files);
        }}
        className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-surface py-10 text-center text-muted transition-colors hover:border-accent"
      >
        <Upload size={24} />
        <p className="text-sm">Drop PDFs here or click to browse</p>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          multiple
          aria-label="Select PDF files"
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      {items.length > 0 && (
        <ul className="space-y-2">
          {items.map((item, index) => (
            <li
              key={item.id}
              draggable
              onDragStart={() => (dragIndex.current = index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragIndex.current !== null) reorder(dragIndex.current, index);
                dragIndex.current = null;
              }}
              className="flex items-center gap-3 rounded-lg border border-border bg-surface p-3"
            >
              <GripVertical size={16} className="cursor-grab text-muted" />
              <span className="flex-1 truncate text-sm text-primary">{item.file.name}</span>
              <span className="text-xs text-muted">{formatBytes(item.file.size)}</span>
              <button
                type="button"
                onClick={() => remove(item.id)}
                aria-label={`Remove ${item.file.name}`}
                className="text-muted hover:text-error"
              >
                <Trash2 size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <Button onClick={merge} disabled={busy || items.length < 2}>
        {busy ? "Merging…" : `Merge ${items.length || ""} PDFs`}
      </Button>
    </div>
  );
}
