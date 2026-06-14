"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { Label, Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { downloadBlob } from "@/lib/utils";

const FORMATS = [
  { id: "png", label: "PNG", mime: "image/png" },
  { id: "jpeg", label: "JPEG", mime: "image/jpeg" },
  { id: "webp", label: "WebP", mime: "image/webp" },
] as const;

export default function ImageConverter() {
  const [src, setSrc] = useState<string | null>(null);
  const [name, setName] = useState("image");
  const [format, setFormat] = useState<(typeof FORMATS)[number]["id"]>("png");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function onFile(file: File | undefined) {
    if (!file || !file.type.startsWith("image/")) {
      setError("Please choose a valid image file.");
      return;
    }
    setError(null);
    setName(file.name.replace(/\.[^.]+$/, "") || "image");
    setSrc(URL.createObjectURL(file));
  }

  async function convert() {
    if (!src) return;
    const img = new Image();
    img.src = src;
    await img.decode();
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (format === "jpeg") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.drawImage(img, 0, 0);
    const fmt = FORMATS.find((f) => f.id === format)!;
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setError("This browser could not export to the chosen format.");
          return;
        }
        downloadBlob(blob, `${name}.${format === "jpeg" ? "jpg" : format}`);
      },
      fmt.mime,
      0.92,
    );
  }

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
          <p className="text-sm">Drop an image (PNG, JPEG, WebP, BMP) or click to browse</p>
          <input ref={inputRef} type="file" accept="image/*" aria-label="Select an image" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="space-y-4">
            <div>
              <Label htmlFor="conv-fmt">Convert to</Label>
              <Select id="conv-fmt" aria-label="Output format" value={format} onChange={(e) => setFormat(e.target.value as typeof format)}>
                {FORMATS.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.label}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex gap-2">
              <Button onClick={convert}>Convert &amp; download</Button>
              <Button variant="ghost" onClick={() => setSrc(null)}>
                Choose another
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-center rounded-lg border border-border bg-surface p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="Preview" className="max-h-72 max-w-full object-contain" />
          </div>
        </div>
      )}

      {error && <Alert variant="error">{error}</Alert>}
    </div>
  );
}
