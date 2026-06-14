"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { Label, Select } from "@/components/ui/Field";
import { CopyButton } from "@/components/ui/CopyButton";
import { CaveatBadge } from "@/components/ui/CaveatBadge";
import { formatBytes } from "@/lib/utils";

type Format = "openai" | "anthropic" | "raw";
type Detail = "low" | "auto" | "high";

type Loaded = {
  dataUrl: string;
  base64: string;
  mediaType: string;
  name: string;
  size: number;
  width: number;
  height: number;
};

export default function ImageToBase64Ai() {
  const [img, setImg] = useState<Loaded | null>(null);
  const [format, setFormat] = useState<Format>("openai");
  const [detail, setDetail] = useState<Detail>("auto");
  const inputRef = useRef<HTMLInputElement>(null);

  function onFile(file: File | undefined) {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.includes(",") ? dataUrl.split(",")[1] : dataUrl;
      const probe = new Image();
      probe.onload = () => {
        setImg({
          dataUrl,
          base64,
          mediaType: file.type,
          name: file.name,
          size: file.size,
          width: probe.naturalWidth,
          height: probe.naturalHeight,
        });
      };
      probe.src = dataUrl;
    };
    reader.readAsDataURL(file);
  }

  function output(): string {
    if (!img) return "";
    if (format === "raw") return img.dataUrl;
    if (format === "openai") {
      return JSON.stringify(
        { type: "image_url", image_url: { url: img.dataUrl, detail } },
        null,
        2,
      );
    }
    return JSON.stringify(
      { type: "image", source: { type: "base64", media_type: img.mediaType, data: img.base64 } },
      null,
      2,
    );
  }

  const out = output();

  return (
    <div className="space-y-4">
      <CaveatBadge>
        Large images significantly increase token usage in vision API calls. Most providers
        recommend keeping images under 5 MB.
      </CaveatBadge>

      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          onFile(e.dataTransfer.files[0]);
        }}
        className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-surface py-8 text-center text-muted transition-colors hover:border-accent"
      >
        <Upload size={24} />
        <p className="text-sm">{img ? img.name : "Drop an image here or click to browse"}</p>
        <input ref={inputRef} type="file" accept="image/*" aria-label="Select an image" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
      </div>

      {img && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="space-y-3">
            <div className="flex justify-center rounded-lg border border-border bg-surface p-3">
              <img src={img.dataUrl} alt={img.name} className="max-h-56 max-w-full object-contain" />
            </div>
            <dl className="grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-lg border border-border bg-surface px-3 py-2">
                <dt className="text-xs text-muted">File</dt>
                <dd className="truncate text-primary">{img.name}</dd>
              </div>
              <div className="rounded-lg border border-border bg-surface px-3 py-2">
                <dt className="text-xs text-muted">Type</dt>
                <dd className="text-primary">{img.mediaType}</dd>
              </div>
              <div className="rounded-lg border border-border bg-surface px-3 py-2">
                <dt className="text-xs text-muted">Size</dt>
                <dd className="text-primary">{formatBytes(img.size)}</dd>
              </div>
              <div className="rounded-lg border border-border bg-surface px-3 py-2">
                <dt className="text-xs text-muted">Dimensions</dt>
                <dd className="text-primary">{img.width} × {img.height}</dd>
              </div>
            </dl>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="b64-format">Output format</Label>
                <Select id="b64-format" aria-label="Output format" value={format} onChange={(e) => setFormat(e.target.value as Format)}>
                  <option value="openai">OpenAI vision</option>
                  <option value="anthropic">Anthropic vision</option>
                  <option value="raw">Raw data URI</option>
                </Select>
              </div>
              {format === "openai" && (
                <div>
                  <Label htmlFor="b64-detail">Detail</Label>
                  <Select id="b64-detail" aria-label="Detail level" value={detail} onChange={(e) => setDetail(e.target.value as Detail)}>
                    <option value="low">low</option>
                    <option value="auto">auto</option>
                    <option value="high">high</option>
                  </Select>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between">
              <Label className="mb-0">Payload</Label>
              <CopyButton value={out} label="Copy" />
            </div>
            <pre className="max-h-72 overflow-auto whitespace-pre-wrap break-all rounded-lg border border-border bg-surface p-3 font-mono text-xs text-primary">
              {out}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
