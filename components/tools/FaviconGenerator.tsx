"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { downloadBlob } from "@/lib/utils";

const SIZES = [16, 32, 48, 180];

function renderSize(img: HTMLImageElement, size: number): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported.");
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, size, size);
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), "image/png"),
  );
}

export default function FaviconGenerator() {
  const [src, setSrc] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function onFile(file: File | undefined) {
    if (!file || !file.type.startsWith("image/")) return;
    setError(null);
    setSrc(URL.createObjectURL(file));
  }

  async function generate() {
    if (!src) return;
    setBusy(true);
    setError(null);
    try {
      const img = new Image();
      img.src = src;
      await img.decode();
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      for (const size of SIZES) {
        const blob = await renderSize(img, size);
        const filename = size === 180 ? "apple-touch-icon-180x180.png" : `favicon-${size}x${size}.png`;
        zip.file(filename, blob);
      }
      const out = await zip.generateAsync({ type: "blob" });
      downloadBlob(out, "favicons.zip");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate favicons.");
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
          onFile(e.dataTransfer.files[0]);
        }}
        className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-surface py-10 text-center text-muted transition-colors hover:border-accent"
      >
        <Upload size={24} />
        <p className="text-sm">Drop a square image here or click to browse</p>
        <input ref={inputRef} type="file" accept="image/*" aria-label="Select a square image" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      {src && (
        <>
          <div className="flex flex-wrap items-end gap-4 rounded-lg border border-border bg-surface p-4">
            {SIZES.map((size) => (
              <div key={size} className="text-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={`${size} preview`} width={Math.min(size, 64)} height={Math.min(size, 64)} className="mx-auto rounded border border-border object-cover" style={{ width: Math.min(size, 64), height: Math.min(size, 64) }} />
                <div className="mt-1 text-xs text-muted">{size}×{size}</div>
              </div>
            ))}
          </div>
          <Button onClick={generate} disabled={busy}>
            {busy ? "Generating…" : "Generate & download ZIP"}
          </Button>
        </>
      )}
    </div>
  );
}
