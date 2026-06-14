"use client";

import { useEffect, useRef, useState } from "react";
import { Upload } from "lucide-react";
import { Label } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { downloadBlob, formatBytes } from "@/lib/utils";

export default function ImageCompressor() {
  const [src, setSrc] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState(0);
  const [quality, setQuality] = useState(70);
  const [compressed, setCompressed] = useState<{ url: string; size: number; blob: Blob } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function onFile(file: File | undefined) {
    if (!file || !file.type.startsWith("image/")) return;
    setOriginalSize(file.size);
    setSrc(URL.createObjectURL(file));
  }

  useEffect(() => {
    if (!src) return;
    let cancelled = false;
    let createdUrl: string | null = null;
    (async () => {
      const img = new Image();
      img.src = src;
      await img.decode();
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(
        (blob) => {
          if (!blob || cancelled) return;
          createdUrl = URL.createObjectURL(blob);
          setCompressed({ url: createdUrl, size: blob.size, blob });
        },
        "image/jpeg",
        quality / 100,
      );
    })();
    return () => {
      cancelled = true;
      if (createdUrl) URL.revokeObjectURL(createdUrl);
    };
  }, [src, quality]);

  const ratio = compressed && originalSize ? Math.round((1 - compressed.size / originalSize) * 100) : 0;

  return (
    <div className="space-y-4">
      {!src ? (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            onFile(e.dataTransfer.files[0]);
          }}
          className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-surface py-12 text-center text-muted transition-colors hover:border-accent"
        >
          <Upload size={24} />
          <p className="text-sm">Drop an image here or click to browse</p>
          <input ref={inputRef} type="file" accept="image/*" aria-label="Select an image" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
        </div>
      ) : (
        <>
          <div>
            <Label htmlFor="ic-q">Quality ({quality})</Label>
            <input id="ic-q" type="range" min={1} max={100} aria-label="Compression quality" value={quality} onChange={(e) => setQuality(Number(e.target.value))} className="w-full accent-[var(--accent)]" />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <figure className="rounded-lg border border-border bg-surface p-3 text-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="Original" className="mx-auto max-h-60 object-contain" />
              <figcaption className="mt-2 text-sm text-muted">Original · {formatBytes(originalSize)}</figcaption>
            </figure>
            <figure className="rounded-lg border border-border bg-surface p-3 text-center">
              {compressed ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={compressed.url} alt="Compressed" className="mx-auto max-h-60 object-contain" />
                  <figcaption className="mt-2 text-sm">
                    <span className="text-success">Compressed · {formatBytes(compressed.size)}</span>
                    {ratio > 0 && <span className="ml-1 text-muted">(−{ratio}%)</span>}
                  </figcaption>
                </>
              ) : (
                <p className="py-20 text-sm text-muted">Compressing…</p>
              )}
            </figure>
          </div>

          <div className="flex gap-2">
            <Button onClick={() => compressed && downloadBlob(compressed.blob, "compressed.jpg")} disabled={!compressed}>
              Download
            </Button>
            <Button variant="ghost" onClick={() => { setSrc(null); setCompressed(null); }}>
              Choose another
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
