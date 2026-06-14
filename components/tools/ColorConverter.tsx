"use client";

import { useState } from "react";
import { Input, Label } from "@/components/ui/Field";
import { CopyButton } from "@/components/ui/CopyButton";

type RGB = { r: number; g: number; b: number };

function clamp(n: number, max = 255): number {
  return Math.max(0, Math.min(max, n));
}

function rgbToHex({ r, g, b }: RGB): string {
  return "#" + [r, g, b].map((v) => clamp(Math.round(v)).toString(16).padStart(2, "0")).join("");
}

function hexToRgb(hex: string): RGB | null {
  const m = hex.trim().replace(/^#/, "");
  if (!/^[0-9a-fA-F]{6}$/.test(m) && !/^[0-9a-fA-F]{3}$/.test(m)) return null;
  const full = m.length === 3 ? m.split("").map((c) => c + c).join("") : m;
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
}

function rgbToHsl({ r, g, b }: RGB): [number, number, number] {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  let h = 0;
  const l = (max + min) / 2;
  const d = max - min;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  if (d !== 0) {
    if (max === rn) h = ((gn - bn) / d) % 6;
    else if (max === gn) h = (bn - rn) / d + 2;
    else h = (rn - gn) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return [Math.round(h), Math.round(s * 100), Math.round(l * 100)];
}

function hslToRgb(h: number, s: number, l: number): RGB {
  s /= 100;
  l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let rp = 0, gp = 0, bp = 0;
  if (h < 60) [rp, gp, bp] = [c, x, 0];
  else if (h < 120) [rp, gp, bp] = [x, c, 0];
  else if (h < 180) [rp, gp, bp] = [0, c, x];
  else if (h < 240) [rp, gp, bp] = [0, x, c];
  else if (h < 300) [rp, gp, bp] = [x, 0, c];
  else [rp, gp, bp] = [c, 0, x];
  return { r: Math.round((rp + m) * 255), g: Math.round((gp + m) * 255), b: Math.round((bp + m) * 255) };
}

function rgbToCmyk({ r, g, b }: RGB): [number, number, number, number] {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const k = 1 - Math.max(rn, gn, bn);
  if (k === 1) return [0, 0, 0, 100];
  const c = (1 - rn - k) / (1 - k);
  const m = (1 - gn - k) / (1 - k);
  const y = (1 - bn - k) / (1 - k);
  return [Math.round(c * 100), Math.round(m * 100), Math.round(y * 100), Math.round(k * 100)];
}

function cmykToRgb(c: number, m: number, y: number, k: number): RGB {
  c /= 100; m /= 100; y /= 100; k /= 100;
  return {
    r: Math.round(255 * (1 - c) * (1 - k)),
    g: Math.round(255 * (1 - m) * (1 - k)),
    b: Math.round(255 * (1 - y) * (1 - k)),
  };
}

export default function ColorConverter() {
  const [rgb, setRgb] = useState<RGB>({ r: 99, g: 102, b: 241 });

  const hex = rgbToHex(rgb);
  const [h, s, l] = rgbToHsl(rgb);
  const [cy, ma, ye, ka] = rgbToCmyk(rgb);

  const rgbStr = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
  const hslStr = `hsl(${h}, ${s}%, ${l}%)`;
  const cmykStr = `cmyk(${cy}%, ${ma}%, ${ye}%, ${ka}%)`;

  function tryParse(format: "hex" | "rgb" | "hsl" | "cmyk", value: string) {
    if (format === "hex") {
      const parsed = hexToRgb(value);
      if (parsed) setRgb(parsed);
    } else if (format === "rgb") {
      const m = value.match(/(\d+)[,\s]+(\d+)[,\s]+(\d+)/);
      if (m) setRgb({ r: clamp(+m[1]), g: clamp(+m[2]), b: clamp(+m[3]) });
    } else if (format === "hsl") {
      const m = value.match(/(\d+)[,\s]+(\d+)%?[,\s]+(\d+)%?/);
      if (m) setRgb(hslToRgb(clamp(+m[1], 360), clamp(+m[2], 100), clamp(+m[3], 100)));
    } else {
      const m = value.match(/(\d+)%?[,\s]+(\d+)%?[,\s]+(\d+)%?[,\s]+(\d+)%?/);
      if (m) setRgb(cmykToRgb(clamp(+m[1], 100), clamp(+m[2], 100), clamp(+m[3], 100), clamp(+m[4], 100)));
    }
  }

  const panels: { key: "hex" | "rgb" | "hsl" | "cmyk"; label: string; value: string }[] = [
    { key: "hex", label: "HEX", value: hex },
    { key: "rgb", label: "RGB", value: rgbStr },
    { key: "hsl", label: "HSL", value: hslStr },
    { key: "cmyk", label: "CMYK", value: cmykStr },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-4">
        <div
          className="h-24 w-24 shrink-0 rounded-xl border border-border"
          style={{ backgroundColor: hex }}
          aria-hidden
        />
        <div>
          <Label htmlFor="color-picker">Pick a color</Label>
          <input
            id="color-picker"
            type="color"
            aria-label="Color picker"
            value={hex}
            onChange={(e) => {
              const parsed = hexToRgb(e.target.value);
              if (parsed) setRgb(parsed);
            }}
            className="h-12 w-24 cursor-pointer rounded-lg border border-border bg-elevated"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {panels.map((p) => (
          <div key={p.key} className="rounded-lg border border-border bg-surface p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted">{p.label}</span>
              <CopyButton value={p.value} label="Copy" />
            </div>
            <Input
              aria-label={`${p.label} value`}
              value={p.value}
              onChange={(e) => tryParse(p.key, e.target.value)}
              className="font-mono"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
