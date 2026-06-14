"use client";

import { useMemo, useState } from "react";
import { Label, Select, Textarea } from "@/components/ui/Field";
import { CopyButton } from "@/components/ui/CopyButton";
import { gptTokens } from "@/lib/tokenize";

type Role = "system" | "user" | "assistant";
type Msg = { role: Role; content: string };
type InputKind = "system" | "user" | "conversation";
type OutputFormat = "plain" | "claude-xml" | "openai" | "chatml" | "llama3";

function normalizeRole(raw: string): Role {
  const r = raw.toLowerCase();
  if (r === "human" || r === "user") return "user";
  if (r === "ai" || r === "assistant") return "assistant";
  return "system";
}

function parseConversation(text: string): Msg[] {
  const re = /^\s*(system|user|human|assistant|ai)\s*:\s*(.*)$/i;
  const msgs: Msg[] = [];
  let current: Msg | null = null;
  for (const line of text.split("\n")) {
    const m = line.match(re);
    if (m) {
      current = { role: normalizeRole(m[1]), content: m[2] };
      msgs.push(current);
    } else if (current) {
      current.content += "\n" + line;
    } else {
      current = { role: "user", content: line };
      msgs.push(current);
    }
  }
  return msgs.map((m) => ({ ...m, content: m.content.trim() })).filter((m) => m.content.length > 0);
}

function toMessages(text: string, kind: InputKind): Msg[] {
  const trimmed = text.trim();
  if (!trimmed) return [];
  if (kind === "system") return [{ role: "system", content: trimmed }];
  if (kind === "user") return [{ role: "user", content: trimmed }];
  return parseConversation(text);
}

function format(messages: Msg[], fmt: OutputFormat): string {
  if (messages.length === 0) return "";
  switch (fmt) {
    case "plain":
      return messages.map((m) => `${m.role.toUpperCase()}:\n${m.content}`).join("\n\n");
    case "claude-xml":
      return messages.map((m) => `<${m.role}>\n${m.content}\n</${m.role}>`).join("\n\n");
    case "openai":
      return JSON.stringify(
        messages.map((m) => ({ role: m.role, content: m.content })),
        null,
        2,
      );
    case "chatml":
      return messages
        .map((m) => `<|im_start|>${m.role}\n${m.content}<|im_end|>`)
        .join("\n")
        .concat("\n<|im_start|>assistant\n");
    case "llama3": {
      let out = "<|begin_of_text|>";
      for (const m of messages) {
        out += `<|start_header_id|>${m.role}<|end_header_id|>\n\n${m.content}<|eot_id|>`;
      }
      out += "<|start_header_id|>assistant<|end_header_id|>\n\n";
      return out;
    }
  }
}

export default function PromptFormatter() {
  const [text, setText] = useState("You are a helpful assistant. Always answer concisely.");
  const [kind, setKind] = useState<InputKind>("system");
  const [fmt, setFmt] = useState<OutputFormat>("claude-xml");

  const messages = useMemo(() => toMessages(text, kind), [text, kind]);
  const output = useMemo(() => format(messages, fmt), [messages, fmt]);
  const tokens = useMemo(() => gptTokens(output), [output]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="pf-kind">Input is a…</Label>
              <Select id="pf-kind" aria-label="Input kind" value={kind} onChange={(e) => setKind(e.target.value as InputKind)}>
                <option value="system">System prompt</option>
                <option value="user">User message</option>
                <option value="conversation">Full conversation</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="pf-fmt">Output format</Label>
              <Select id="pf-fmt" aria-label="Output format" value={fmt} onChange={(e) => setFmt(e.target.value as OutputFormat)}>
                <option value="plain">Plain text</option>
                <option value="claude-xml">Claude XML tags</option>
                <option value="openai">OpenAI messages JSON</option>
                <option value="chatml">ChatML</option>
                <option value="llama3">Llama 3 Instruct</option>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="pf-input">Prompt</Label>
            <Textarea
              id="pf-input"
              aria-label="Prompt input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-64"
            />
            {kind === "conversation" && (
              <p className="mt-1 text-xs text-muted">
                Prefix turns with <code className="font-mono">User:</code> /{" "}
                <code className="font-mono">Assistant:</code> /{" "}
                <code className="font-mono">System:</code>.
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="mb-0">Output</Label>
            <CopyButton value={output} label="Copy" />
          </div>
          <pre className="min-h-64 overflow-auto whitespace-pre-wrap break-words rounded-lg border border-border bg-surface p-3 font-mono text-sm text-primary">
            {output || " "}
          </pre>
          <p className="text-xs text-muted">
            {output.length.toLocaleString()} characters · ~{tokens.toLocaleString()} tokens (estimated)
          </p>
        </div>
      </div>
    </div>
  );
}
