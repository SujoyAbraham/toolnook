"use client";

import { useMemo, useState } from "react";
import { Label, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { CopyButton } from "@/components/ui/CopyButton";
import { Alert } from "@/components/ui/Alert";
import { TwoCol } from "@/components/tools/TwoCol";
import { cn } from "@/lib/utils";

type Format = "json" | "xml";

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function detect(input: string): Format {
  return input.trim().startsWith("<") ? "xml" : "json";
}

function formatXml(xml: string, minify: boolean): string {
  const trimmed = xml.replace(/>\s+</g, "><").trim();
  if (minify) return trimmed;
  let formatted = "";
  let indent = 0;
  const tokens = trimmed.replace(/></g, ">\n<").split("\n");
  for (const token of tokens) {
    if (/^<\/\w/.test(token)) indent = Math.max(0, indent - 1);
    formatted += "  ".repeat(indent) + token + "\n";
    if (/^<\w[^>]*[^/]>$/.test(token) && !token.startsWith("<?")) indent++;
  }
  return formatted.trim();
}

function highlightJson(code: string): string {
  return escapeHtml(code).replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g,
    (match) => {
      let cls = "text-amber-400";
      if (/^"/.test(match)) cls = /:$/.test(match) ? "text-accent" : "text-emerald-400";
      else if (/true|false/.test(match)) cls = "text-sky-400";
      else if (/null/.test(match)) cls = "text-muted";
      return `<span class="${cls}">${match}</span>`;
    },
  );
}

function highlightXml(code: string): string {
  return escapeHtml(code)
    .replace(/(&lt;\/?[\w:-]+)/g, '<span class="text-accent">$1</span>')
    .replace(/([\w:-]+)=(&quot;.*?&quot;|".*?")/g, '<span class="text-amber-400">$1</span>=<span class="text-emerald-400">$2</span>');
}

export default function ApiResponseFormatter() {
  const [input, setInput] = useState('{"name":"ToolNook","tools":36,"free":true,"server":null}');
  const [minify, setMinify] = useState(false);

  const { output, format, error } = useMemo(() => {
    const raw = input.trim();
    if (!raw) return { output: "", format: "json" as Format, error: null };
    const fmt = detect(raw);
    try {
      if (fmt === "json") {
        const parsed: unknown = JSON.parse(raw);
        return {
          output: JSON.stringify(parsed, null, minify ? 0 : 2),
          format: fmt,
          error: null,
        };
      }
      // crude XML validity check
      if (!/<[^>]+>/.test(raw)) throw new Error("Input does not look like valid XML.");
      return { output: formatXml(raw, minify), format: fmt, error: null };
    } catch (e) {
      return {
        output: "",
        format: fmt,
        error: e instanceof Error ? e.message : "Could not parse input",
      };
    }
  }, [input, minify]);

  const highlighted = useMemo(() => {
    if (!output) return "";
    return format === "json" ? highlightJson(output) : highlightXml(output);
  }, [output, format]);

  return (
    <TwoCol>
      <div>
        <Label htmlFor="api-input">Input (JSON or XML — auto-detected)</Label>
        <Textarea
          id="api-input"
          aria-label="JSON or XML input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="min-h-72"
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={minify ? "secondary" : "primary"}
              onClick={() => setMinify(false)}
            >
              Formatted
            </Button>
            <Button
              size="sm"
              variant={minify ? "primary" : "secondary"}
              onClick={() => setMinify(true)}
            >
              Minified
            </Button>
            <span className="self-center rounded bg-elevated px-2 py-1 text-xs uppercase text-muted">
              {format}
            </span>
          </div>
          <CopyButton value={output} label="Copy" />
        </div>

        {error && <Alert variant="error">{error}</Alert>}

        <pre
          className={cn(
            "min-h-72 overflow-auto rounded-lg border border-border bg-surface p-3 font-mono text-sm text-primary",
            minify && "whitespace-pre-wrap break-all",
          )}
          dangerouslySetInnerHTML={{ __html: highlighted || "&nbsp;" }}
        />
      </div>
    </TwoCol>
  );
}
