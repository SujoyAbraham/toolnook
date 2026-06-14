"use client";

import { useMemo, useState } from "react";
import { Label, Textarea } from "@/components/ui/Field";
import { CopyButton } from "@/components/ui/CopyButton";
import { Alert } from "@/components/ui/Alert";
import { TwoCol } from "@/components/tools/TwoCol";

const SAMPLE =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkphbmUgRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

function base64UrlDecode(input: string): string {
  let str = input.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) str += "=";
  const binary = atob(str);
  // Handle UTF-8
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

type Decoded = {
  header: string;
  payload: string;
  signature: string;
  exp?: number;
};

function decodeJwt(token: string): Decoded {
  const parts = token.trim().split(".");
  if (parts.length !== 3) {
    throw new Error("A JWT must have three parts separated by dots.");
  }
  const headerJson = base64UrlDecode(parts[0]);
  const payloadJson = base64UrlDecode(parts[1]);
  const header = JSON.parse(headerJson) as Record<string, unknown>;
  const payload = JSON.parse(payloadJson) as Record<string, unknown>;
  const exp = typeof payload.exp === "number" ? payload.exp : undefined;
  return {
    header: JSON.stringify(header, null, 2),
    payload: JSON.stringify(payload, null, 2),
    signature: parts[2],
    exp,
  };
}

function humanCountdown(seconds: number): string {
  const abs = Math.abs(seconds);
  const d = Math.floor(abs / 86400);
  const h = Math.floor((abs % 86400) / 3600);
  const m = Math.floor((abs % 3600) / 60);
  const parts = [d && `${d}d`, h && `${h}h`, m && `${m}m`].filter(Boolean);
  return parts.length ? parts.join(" ") : "less than a minute";
}

export default function JwtInspector() {
  const [token, setToken] = useState(SAMPLE);

  const { decoded, error } = useMemo(() => {
    if (!token.trim()) return { decoded: null, error: null };
    try {
      return { decoded: decodeJwt(token), error: null };
    } catch (e) {
      return { decoded: null, error: e instanceof Error ? e.message : "Invalid token" };
    }
  }, [token]);

  const expiry = useMemo(() => {
    if (!decoded?.exp) return null;
    const now = Math.floor(Date.now() / 1000);
    const diff = decoded.exp - now;
    return {
      expired: diff <= 0,
      diff,
      date: new Date(decoded.exp * 1000).toLocaleString(),
    };
  }, [decoded]);

  return (
    <TwoCol>
      <div>
        <Label htmlFor="jwt-input">Encoded JWT</Label>
        <Textarea
          id="jwt-input"
          aria-label="Encoded JWT"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Paste a JWT here…"
          className="min-h-64 break-all"
        />
      </div>

      <div className="space-y-4">
        {error && <Alert variant="error">{error}</Alert>}

        {expiry && (
          <Alert variant={expiry.expired ? "error" : "success"}>
            {expiry.expired
              ? `Expired ${humanCountdown(expiry.diff)} ago (${expiry.date})`
              : `Valid — expires in ${humanCountdown(expiry.diff)} (${expiry.date})`}
          </Alert>
        )}

        {decoded && (
          <>
            <Section title="Header" value={decoded.header} mono />
            <Section title="Payload" value={decoded.payload} mono />
            <Section title="Signature" value={decoded.signature} mono />
          </>
        )}
      </div>
    </TwoCol>
  );
}

function Section({ title, value, mono }: { title: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted">{title}</span>
        <CopyButton value={value} label="Copy" />
      </div>
      <pre
        className={`max-h-60 overflow-auto whitespace-pre-wrap break-all text-xs text-primary ${
          mono ? "font-mono" : ""
        }`}
      >
        {value}
      </pre>
    </div>
  );
}
