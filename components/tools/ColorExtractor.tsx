"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { CopyButton } from "@/components/ui/CopyButton";

type Swatch = { hex: string; rgb: string; count: number };

function extractColors(img: HTMLImageElement): Swatch[] {
  const size = 100;
  const canvas = document.createElement("canvas");
  const scale = Math.min(1, size / Math.max(img.naturalWidth, img.naturalHeight));
  canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) return [];
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

  const buckets = new Map<string, { r: number; g: number; b: number; count: number }>();
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 125) continue; // skip transparent
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const key = `${r >> 5}-${g >> 5}-${b >> 5}`;
    const bucket = buckets.get(key);
    if (bucket) {
      bucket.r += r;
      bucket.g += g;
      bucket.b += b;
      bucket.count++;
    } else {
      buckets.set(key, { r, g, b, count: 1 });
    }
  }

  return Array.from(buckets.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)
    .map((bk) => {
      const r = Math.round(bk.r / bk.count);
      const g = Math.round(bk.g / bk.count);
      const b = Math.round(bk.b / bk.count);
      const hex = "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
      return { hex, rgb: `rgb(${r}, ${g}, ${b})`, count: bk.count };
    });
}

export default function ColorExtractor() {
  const [src, setSrc] = useState<string | null>(null);
  const [swatches, setSwatches] = useState<Swatch[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  function onFile(file: File | undefined) {
    if (!file || !file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setSwatches(extractColors(img));
      setSrc(url);
    };
    img.src = url;
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
        <p className="text-sm">Drop an image here or click to browse</p>
        <input ref={inputRef} type="file" accept="image/*" aria-label="Select an image" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
      </div>

      {src && (
        <div className="flex justify-center rounded-lg border border-border bg-surface p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="Source" className="max-h-56 max-w-full object-contain" />
        </div>
      )}

      {swatches.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {swatches.map((s) => (
            <div key={s.hex} className="overflow-hidden rounded-lg border border-border bg-surface">
              <div className="h-20" style={{ backgroundColor: s.hex }} />
              <div className="space-y-1 p-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-primary">{s.hex}</span>
                  <CopyButton value={s.hex} label="" className="px-1.5 py-1" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-muted">{s.rgb}</span>
                  <CopyButton value={s.rgb} label="" className="px-1.5 py-1" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
