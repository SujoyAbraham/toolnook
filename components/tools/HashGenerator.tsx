"use client";

import { useEffect, useRef, useState } from "react";
import { Upload } from "lucide-react";
import { Label, Textarea } from "@/components/ui/Field";
import { CopyButton } from "@/components/ui/CopyButton";
import { cn, formatBytes, readFileAsArrayBuffer } from "@/lib/utils";
import { md5 } from "@/lib/md5";

type Tab = "text" | "file";
type Hashes = { "MD5": string; "SHA-256": string; "SHA-512": string };

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function computeHashes(bytes: Uint8Array): Promise<Hashes> {
  const view = new Uint8Array(bytes); // copy into a tightly-fitted ArrayBuffer
  const [sha256, sha512] = await Promise.all([
    crypto.subtle.digest("SHA-256", view),
    crypto.subtle.digest("SHA-512", view),
  ]);
  return {
    "MD5": md5(bytes),
    "SHA-256": toHex(sha256),
    "SHA-512": toHex(sha512),
  };
}

export default function HashGenerator() {
  const [tab, setTab] = useState<Tab>("text");
  const [text, setText] = useState("Hello, ToolNook!");
  const [hashes, setHashes] = useState<Hashes | null>(null);
  const [fileMeta, setFileMeta] = useState<{ name: string; size: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Live hashing for text mode
  useEffect(() => {
    if (tab !== "text") return;
    let active = true;
    computeHashes(new TextEncoder().encode(text)).then((h) => {
      if (active) setHashes(h);
    });
    return () => {
      active = false;
    };
  }, [text, tab]);

  async function onFile(file: File | undefined) {
    if (!file) return;
    const buf = await readFileAsArrayBuffer(file);
    setHashes(await computeHashes(new Uint8Array(buf)));
    setFileMeta({ name: file.name, size: file.size });
  }

  return (
    <div className="space-y-4">
      <div className="inline-flex rounded-lg border border-border bg-surface p-1">
        {(["text", "file"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => {
              setTab(t);
              setHashes(null);
              setFileMeta(null);
            }}
            className={cn(
              "rounded-md px-4 py-1.5 text-sm capitalize transition-colors",
              tab === t ? "bg-accent text-white" : "text-muted hover:text-primary",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "text" ? (
        <div>
          <Label htmlFor="hash-text">Text</Label>
          <Textarea
            id="hash-text"
            aria-label="Text to hash"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="min-h-32"
          />
        </div>
      ) : (
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
            aria-label="Select a file to hash"
            className="hidden"
            onChange={(e) => onFile(e.target.files?.[0])}
          />
        </div>
      )}

      {hashes && (
        <div className="space-y-3">
          {(Object.keys(hashes) as (keyof Hashes)[]).map((algo) => (
            <div key={algo} className="rounded-lg border border-border bg-surface p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted">{algo}</span>
                <CopyButton value={hashes[algo]} label="Copy" />
              </div>
              <div className="break-all font-mono text-sm text-primary">{hashes[algo]}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
