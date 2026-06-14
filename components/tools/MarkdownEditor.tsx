"use client";

import { useMemo, useState } from "react";
import { Label, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { downloadText } from "@/lib/utils";

const SAMPLE = `# ToolVault Markdown

Write **bold**, *italic* and \`inline code\`.

## Features
- Runs in your browser
- No data leaves the tab
- [Open source friendly](https://example.com)

1. Type on the left
2. See HTML on the right

\`\`\`
const ok = true;
\`\`\`
`;

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function inline(text: string): string {
  return text
    .replace(/`([^`]+)`/g, '<code class="rounded bg-elevated px-1 py-0.5 font-mono text-sm">$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>")
    .replace(/_([^_]+)_/g, "<em>$1</em>")
    .replace(
      /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-accent underline">$1</a>',
    );
}

function parseMarkdown(md: string): string {
  const escaped = escapeHtml(md);
  const lines = escaped.split("\n");
  const html: string[] = [];
  let inCode = false;
  let codeBuf: string[] = [];
  let listType: "ul" | "ol" | null = null;

  function closeList() {
    if (listType) {
      html.push(`</${listType}>`);
      listType = null;
    }
  }

  for (const line of lines) {
    if (line.trim().startsWith("```")) {
      if (inCode) {
        html.push(
          `<pre class="overflow-auto rounded-lg bg-elevated p-3"><code class="font-mono text-sm">${codeBuf.join("\n")}</code></pre>`,
        );
        codeBuf = [];
        inCode = false;
      } else {
        closeList();
        inCode = true;
      }
      continue;
    }
    if (inCode) {
      codeBuf.push(line);
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      closeList();
      const level = heading[1].length;
      const sizes = ["text-2xl", "text-xl", "text-lg", "text-base", "text-sm", "text-xs"];
      html.push(
        `<h${level} class="${sizes[level - 1]} mb-2 mt-3 font-bold">${inline(heading[2])}</h${level}>`,
      );
      continue;
    }

    const ul = line.match(/^\s*[-*]\s+(.*)$/);
    const ol = line.match(/^\s*\d+\.\s+(.*)$/);
    if (ul || ol) {
      const wanted = ul ? "ul" : "ol";
      if (listType !== wanted) {
        closeList();
        const cls = wanted === "ul" ? "list-disc" : "list-decimal";
        html.push(`<${wanted} class="${cls} mb-2 ml-6 space-y-1">`);
        listType = wanted;
      }
      html.push(`<li>${inline((ul ?? ol)![1])}</li>`);
      continue;
    }

    if (line.trim() === "") {
      closeList();
      continue;
    }

    closeList();
    html.push(`<p class="mb-2 leading-relaxed">${inline(line)}</p>`);
  }
  closeList();
  if (inCode && codeBuf.length) {
    html.push(`<pre class="overflow-auto rounded-lg bg-elevated p-3"><code>${codeBuf.join("\n")}</code></pre>`);
  }
  return html.join("\n");
}

export default function MarkdownEditor() {
  const [md, setMd] = useState(SAMPLE);
  const html = useMemo(() => parseMarkdown(md), [md]);
  const wordCount = useMemo(() => md.trim().split(/\s+/).filter(Boolean).length, [md]);

  function exportHtml() {
    const doc = `<!doctype html>\n<html><head><meta charset="utf-8"><title>Markdown export</title></head><body>\n${html}\n</body></html>`;
    downloadText(doc, "document.html", "text/html");
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted">{wordCount} words</span>
        <Button size="sm" onClick={exportHtml}>
          Export as HTML
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div>
          <Label htmlFor="md-input">Markdown</Label>
          <Textarea
            id="md-input"
            aria-label="Markdown input"
            value={md}
            onChange={(e) => setMd(e.target.value)}
            className="min-h-96"
          />
        </div>
        <div>
          <Label>Preview</Label>
          <div
            className="min-h-96 overflow-auto rounded-lg border border-border bg-surface p-4 text-primary"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </div>
    </div>
  );
}
