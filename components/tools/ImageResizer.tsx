"use client";

import { useRef, useState } from "react";
import { Lock, Unlock, Upload } from "lucide-react";
import { Input, Label, Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { downloadBlob } from "@/lib/utils";

export default function ImageResizer() {
  const [src, setSrc] = useState<string | null>(null);
  const [natural, setNatural] = useState({ w: 0, h: 0 });
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [lock, setLock] = useState(true);
  const [format, setFormat] = useState<"png" | "jpeg">("png");
  const [quality, setQuality] = useState(90);
  const inputRef = useRef<HTMLInputElement>(null);

  function onFile(file: File | undefined) {
    if (!file || !file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setNatural({ w: img.naturalWidth, h: img.naturalHeight });
      setWidth(img.naturalWidth);
      setHeight(img.naturalHeight);
      setSrc(url);
    };
    img.src = url;
  }

  function changeWidth(w: number) {
    setWidth(w);
    if (lock && natural.w) setHeight(Math.round((w / natural.w) * natural.h));
  }
  function changeHeight(h: number) {
    setHeight(h);
    if (lock && natural.h) setWidth(Math.round((h / natural.h) * natural.w));
  }

  async function download() {
    if (!src) return;
    const img = new Image();
    img.src = src;
    await img.decode();
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, width);
    canvas.height = Math.max(1, height);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => blob && downloadBlob(blob, `resized.${format}`),
      `image/${format}`,
      format === "jpeg" ? quality / 100 : undefined,
    );
  }

  return (
    <div className="space-y-4">
      {!src ? (
        <Dropzone inputRef={inputRef} onFile={onFile} />
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2">
              <div>
                <Label htmlFor="ir-w">Width (px)</Label>
                <Input id="ir-w" type="number" aria-label="Width" value={width} onChange={(e) => changeWidth(Number(e.target.value))} />
              </div>
              <Button variant="secondary" size="md" onClick={() => setLock((l) => !l)} aria-label="Toggle aspect ratio lock">
                {lock ? <Lock size={16} /> : <Unlock size={16} />}
              </Button>
              <div>
                <Label htmlFor="ir-h">Height (px)</Label>
                <Input id="ir-h" type="number" aria-label="Height" value={height} onChange={(e) => changeHeight(Number(e.target.value))} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="ir-fmt">Format</Label>
                <Select id="ir-fmt" aria-label="Output format" value={format} onChange={(e) => setFormat(e.target.value as "png" | "jpeg")}>
                  <option value="png">PNG</option>
                  <option value="jpeg">JPEG</option>
                </Select>
              </div>
              {format === "jpeg" && (
                <div>
                  <Label htmlFor="ir-q">Quality ({quality})</Label>
                  <input id="ir-q" type="range" min={1} max={100} aria-label="JPEG quality" value={quality} onChange={(e) => setQuality(Number(e.target.value))} className="w-full accent-[var(--accent)]" />
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button onClick={download}>Download</Button>
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
    </div>
  );
}

function Dropzone({ inputRef, onFile }: { inputRef: React.RefObject<HTMLInputElement | null>; onFile: (f: File | undefined) => void }) {
  return (
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
  );
}
