"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { Label, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { CopyButton } from "@/components/ui/CopyButton";
import { Alert } from "@/components/ui/Alert";
import { cn, formatBytes } from "@/lib/utils";

type Tab = "text" | "file";

function encodeText(s: string): string {
  const bytes = new TextEncoder().encode(s);
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary);
}

function decodeText(b64: string): string {
  const binary = atob(b64.trim());
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export default function Base64Tool() {
  const [tab, setTab] = useState<Tab>("text");

  // text mode
  const [plain, setPlain] = useState("Hello, ToolVault!");
  const [encoded, setEncoded] = useState(encodeText("Hello, ToolVault!"));
  const [textError, setTextError] = useState<string | null>(null);

  // file mode
  const [fileB64, setFileB64] = useState("");
  const [fileMeta, setFileMeta] = useState<{ name: string; size: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function onPlainChange(value: string) {
    setPlain(value);
    setEncoded(encodeText(value));
    setTextError(null);
  }

  function onEncodedChange(value: string) {
    setEncoded(value);
    try {
      setPlain(value.trim() ? decodeText(value) : "");
      setTextError(null);
    } catch {
      setTextError("Not valid Base64.");
    }
  }

  function onFile(file: File | undefined) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.includes(",") ? result.split(",")[1] : result;
      setFileB64(base64);
      setFileMeta({ name: file.name, size: file.size });
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="space-y-4">
      <div className="inline-flex rounded-lg border border-border bg-surface p-1">
        {(["text", "file"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "rounded-md px-4 py-1.5 text-sm capitalize transition-colors",
              tab === t ? "bg-accent text-white" : "text-muted hover:text-primary",
            )}
          >
            {t} mode
          </button>
        ))}
      </div>

      {tab === "text" ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div>
            <Label htmlFor="b64-plain">Plain text</Label>
            <Textarea
              id="b64-plain"
              aria-label="Plain text"
              value={plain}
              onChange={(e) => onPlainChange(e.target.value)}
              className="min-h-56"
            />
          </div>
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <Label className="mb-0">Base64</Label>
              <CopyButton value={encoded} label="Copy" />
            </div>
            <Textarea
              id="b64-encoded"
              aria-label="Base64"
              value={encoded}
              onChange={(e) => onEncodedChange(e.target.value)}
              className="min-h-56"
            />
            {textError && (
              <div className="mt-2">
                <Alert variant="error">{textError}</Alert>
              </div>
            )}
          </div>
        </div>
      ) : (
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
            <p className="text-sm">{fileMeta ? fileMeta.name : "Drop a file here or click to browse"}</p>
            {fileMeta && <p className="text-xs text-accent">{formatBytes(fileMeta.size)}</p>}
            <input
              ref={inputRef}
              type="file"
              aria-label="Select a file"
              className="hidden"
              onChange={(e) => onFile(e.target.files?.[0])}
            />
          </div>

          {fileB64 && (
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <Label className="mb-0">Base64 output</Label>
                <CopyButton value={fileB64} label="Copy" />
              </div>
              <Textarea readOnly aria-label="Base64 output" value={fileB64} className="min-h-48 break-all bg-surface" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
