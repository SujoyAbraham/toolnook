"use client";

import { useEffect, useRef, useState } from "react";
import { GripVertical, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { downloadBlob, readFileAsDataURL } from "@/lib/utils";

type Item = { id: string; file: File; url: string };

async function imageToPngBytes(url: string): Promise<{ bytes: Uint8Array; w: number; h: number }> {
  const img = new Image();
  img.src = url;
  await img.decode();
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported.");
  ctx.drawImage(img, 0, 0);
  const blob: Blob = await new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), "image/png"),
  );
  const bytes = new Uint8Array(await blob.arrayBuffer());
  return { bytes, w: canvas.width, h: canvas.height };
}

export default function ImageToPdf() {
  const [items, setItems] = useState<Item[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dragIndex = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => items.forEach((i) => URL.revokeObjectURL(i.url));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function addFiles(files: FileList | null) {
    if (!files) return;
    const images = Array.from(files).filter((f) => f.type.startsWith("image/"));
    const newItems = await Promise.all(
      images.map(async (file) => ({
        id: crypto.randomUUID(),
        file,
        url: await readFileAsDataURL(file),
      })),
    );
    setItems((prev) => [...prev, ...newItems]);
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

  async function convert() {
    if (items.length === 0) return;
    setBusy(true);
    setError(null);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const doc = await PDFDocument.create();
      for (const item of items) {
        const { bytes, w, h } = await imageToPngBytes(item.url);
        const png = await doc.embedPng(bytes);
        const page = doc.addPage([w, h]);
        page.drawImage(png, { x: 0, y: 0, width: w, height: h });
      }
      const out = await doc.save();
      downloadBlob(new Blob([out as BlobPart], { type: "application/pdf" }), "images.pdf");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to build PDF.");
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
        <p className="text-sm">Drop images here or click to browse (PNG, JPG, WebP)</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          aria-label="Select images"
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      {items.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {items.map((item, index) => (
            <div
              key={item.id}
              draggable
              onDragStart={() => (dragIndex.current = index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragIndex.current !== null) reorder(dragIndex.current, index);
                dragIndex.current = null;
              }}
              className="group relative overflow-hidden rounded-lg border border-border bg-surface"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.url} alt={item.file.name} className="h-28 w-full object-cover" />
              <div className="flex items-center justify-between px-2 py-1">
                <GripVertical size={14} className="cursor-grab text-muted" />
                <span className="truncate text-[11px] text-muted">{index + 1}</span>
                <button
                  type="button"
                  onClick={() => remove(item.id)}
                  aria-label={`Remove ${item.file.name}`}
                  className="text-muted hover:text-error"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Button onClick={convert} disabled={busy || items.length === 0}>
        {busy ? "Building…" : "Convert to PDF"}
      </Button>
    </div>
  );
}
