"use client";

import { useEffect, useMemo, useState } from "react";
import { Input, Label, Select, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { CopyButton } from "@/components/ui/CopyButton";
import { cn, downloadText } from "@/lib/utils";

const FRAMEWORKS: Record<string, string[]> = {
  TypeScript: ["Next.js", "React", "Vue", "NestJS", "Express", "Svelte", "None"],
  JavaScript: ["Next.js", "React", "Vue", "Express", "Svelte", "None"],
  Python: ["FastAPI", "Django", "Flask", "None"],
  Go: ["Gin", "Echo", "None"],
  Rust: ["Axum", "Actix", "None"],
  Java: ["Spring Boot", "None"],
  Ruby: ["Rails", "Sinatra", "None"],
};
const LANGUAGES = Object.keys(FRAMEWORKS);

const TARGETS = [
  { id: "claude", label: "CLAUDE.md", filename: "CLAUDE.md" },
  { id: "cursor", label: "Cursor", filename: ".cursorrules" },
  { id: "windsurf", label: "Windsurf", filename: ".windsurfrules" },
  { id: "copilot", label: "Copilot", filename: "copilot-instructions.md" },
] as const;
type TargetId = (typeof TARGETS)[number]["id"];

type Form = {
  name: string;
  description: string;
  language: string;
  framework: string;
  packageManager: string;
  indent: string;
  quotes: string;
  lineLength: number;
  testing: string;
  comments: string;
  verbosity: string;
  askBeforeRefactor: boolean;
  responseStyle: string;
};

function generate(form: Form, target: TargetId): string {
  const title =
    target === "claude"
      ? `# ${form.name || "Project"} — Claude Instructions`
      : target === "copilot"
        ? `# GitHub Copilot Instructions — ${form.name || "Project"}`
        : `# ${form.name || "Project"} AI Rules`;

  const lines = [
    title,
    "",
    form.description ? `> ${form.description}` : "> Project guidance for AI coding assistants.",
    "",
    "## Tech stack",
    `- Language: ${form.language}`,
    `- Framework: ${form.framework}`,
    `- Package manager: ${form.packageManager}`,
    "",
    "## Code style",
    `- Indentation: ${form.indent}`,
    `- Quotes: ${form.quotes}`,
    `- Max line length: ${form.lineLength}`,
    `- Comments: ${form.comments}`,
    "",
    "## Testing",
    `- ${form.testing}`,
    "",
    "## How the assistant should behave",
    `- Verbosity: ${form.verbosity}`,
    `- Response style: ${form.responseStyle}`,
    `- ${form.askBeforeRefactor ? "Ask before large refactors." : "Refactor freely when it improves the code."}`,
    "- Follow the existing patterns and conventions in the codebase.",
    "",
  ];
  return lines.join("\n");
}

export default function AiRulesGenerator() {
  const [form, setForm] = useState<Form>({
    name: "Acme App",
    description: "A web app for managing tasks.",
    language: "TypeScript",
    framework: "Next.js",
    packageManager: "pnpm",
    indent: "2 spaces",
    quotes: "double",
    lineLength: 100,
    testing: "Write tests for new logic using Vitest",
    comments: "moderate — explain non-obvious decisions",
    verbosity: "concise",
    askBeforeRefactor: true,
    responseStyle: "direct",
  });
  const [target, setTarget] = useState<TargetId>("claude");

  // Keep the framework valid when the language changes.
  useEffect(() => {
    const options = FRAMEWORKS[form.language] ?? ["None"];
    if (!options.includes(form.framework)) {
      setForm((f) => ({ ...f, framework: options[0] }));
    }
  }, [form.language, form.framework]);

  function set<K extends keyof Form>(key: K, value: Form[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  const output = useMemo(() => generate(form, target), [form, target]);
  const filename = TARGETS.find((t) => t.id === target)!.filename;

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      <div className="space-y-3">
        <div className="grid grid-cols-1 gap-3">
          <div>
            <Label htmlFor="rg-name">Project name</Label>
            <Input id="rg-name" aria-label="Project name" value={form.name} onChange={(e) => set("name", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="rg-desc">Description</Label>
            <Input id="rg-desc" aria-label="Project description" value={form.description} onChange={(e) => set("description", e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="rg-lang">Primary language</Label>
            <Select id="rg-lang" aria-label="Primary language" value={form.language} onChange={(e) => set("language", e.target.value)}>
              {LANGUAGES.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="rg-fw">Framework</Label>
            <Select id="rg-fw" aria-label="Framework" value={form.framework} onChange={(e) => set("framework", e.target.value)}>
              {(FRAMEWORKS[form.language] ?? ["None"]).map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="rg-pm">Package manager</Label>
            <Select id="rg-pm" aria-label="Package manager" value={form.packageManager} onChange={(e) => set("packageManager", e.target.value)}>
              {["npm", "pnpm", "yarn", "bun", "pip", "poetry", "cargo", "go modules"].map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="rg-indent">Indentation</Label>
            <Select id="rg-indent" aria-label="Indentation" value={form.indent} onChange={(e) => set("indent", e.target.value)}>
              {["2 spaces", "4 spaces", "tabs"].map((i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="rg-quotes">Quotes</Label>
            <Select id="rg-quotes" aria-label="Quotes" value={form.quotes} onChange={(e) => set("quotes", e.target.value)}>
              {["single", "double"].map((q) => (
                <option key={q} value={q}>
                  {q}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="rg-line">Max line length</Label>
            <Input id="rg-line" type="number" aria-label="Max line length" value={form.lineLength} onChange={(e) => set("lineLength", Number(e.target.value))} />
          </div>
          <div>
            <Label htmlFor="rg-verbosity">Verbosity</Label>
            <Select id="rg-verbosity" aria-label="Verbosity" value={form.verbosity} onChange={(e) => set("verbosity", e.target.value)}>
              {["concise", "balanced", "detailed"].map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="rg-style">Response style</Label>
            <Select id="rg-style" aria-label="Response style" value={form.responseStyle} onChange={(e) => set("responseStyle", e.target.value)}>
              {["direct", "friendly", "formal"].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="rg-testing">Testing preference</Label>
          <Input id="rg-testing" aria-label="Testing preference" value={form.testing} onChange={(e) => set("testing", e.target.value)} />
        </div>
        <div>
          <Label htmlFor="rg-comments">Comment style</Label>
          <Input id="rg-comments" aria-label="Comment style" value={form.comments} onChange={(e) => set("comments", e.target.value)} />
        </div>
        <label className="flex w-fit cursor-pointer items-center gap-2 text-sm text-primary">
          <input type="checkbox" checked={form.askBeforeRefactor} onChange={(e) => set("askBeforeRefactor", e.target.checked)} aria-label="Ask before refactoring" className="accent-[var(--accent)]" />
          Ask before refactoring
        </label>
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex flex-wrap rounded-lg border border-border bg-surface p-1">
            {TARGETS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTarget(t.id)}
                className={cn(
                  "rounded-md px-3 py-1 text-sm transition-colors",
                  target === t.id ? "bg-accent text-white" : "text-muted hover:text-primary",
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <CopyButton value={output} label="Copy" />
            <Button size="sm" onClick={() => downloadText(output, filename, "text/markdown")}>
              Download {filename}
            </Button>
          </div>
        </div>
        <pre className="min-h-96 overflow-auto whitespace-pre-wrap rounded-lg border border-border bg-surface p-4 font-mono text-sm text-primary">
          {output}
        </pre>
      </div>
    </div>
  );
}
