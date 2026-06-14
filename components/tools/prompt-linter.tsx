"use client";

import { useMemo, useState } from "react";
import { Label, Textarea } from "@/components/ui/Field";
import { Alert } from "@/components/ui/Alert";

type Severity = "error" | "warning" | "suggestion";
type Issue = { severity: Severity; title: string; explanation: string; fix: string };

const ANTONYMS: [string, string][] = [
  ["concise", "verbose"],
  ["brief", "detailed"],
  ["brief", "comprehensive"],
  ["short", "lengthy"],
  ["formal", "casual"],
  ["formal", "informal"],
];

function has(text: string, re: RegExp): boolean {
  return re.test(text);
}

function countMatches(text: string, re: RegExp): number {
  return (text.match(re) ?? []).length;
}

function lint(text: string): Issue[] {
  const issues: Issue[] = [];
  const lower = text.toLowerCase();
  const words = text.trim().split(/\s+/).filter(Boolean);

  if (!has(lower, /\b(you are|you're|act as|your role|your job|you will|assistant that|as an?\s+\w+)\b/)) {
    issues.push({
      severity: "error",
      title: "Missing role definition",
      explanation: "The prompt never tells the model who it is or how to behave.",
      fix: 'Start with a clear role, e.g. "You are a senior TypeScript engineer…".',
    });
  }

  for (const [a, b] of ANTONYMS) {
    if (lower.includes(a) && lower.includes(b)) {
      issues.push({
        severity: "warning",
        title: "Possible contradictory instructions",
        explanation: `The prompt asks for both "${a}" and "${b}" output, which can conflict.`,
        fix: "Pick one direction or clarify when each applies.",
      });
      break;
    }
  }

  if (!has(lower, /\b(json|xml|markdown|format|bullet|list|table|schema|respond with|output|structure|yaml|csv)\b/)) {
    issues.push({
      severity: "suggestion",
      title: "No output format specified",
      explanation: "The model is free to format responses however it likes.",
      fix: "State the expected shape, e.g. \"Respond in JSON with keys …\".",
    });
  }

  if (words.length > 120 && !has(lower, /\b(example|e\.g\.|for instance|such as|sample)\b/)) {
    issues.push({
      severity: "suggestion",
      title: "Long prompt without examples",
      explanation: "Long instructions are easier to follow with a concrete example.",
      fix: "Add one or two short input/output examples.",
    });
  }

  const negatives = countMatches(lower, /\b(don't|do not|never|avoid|must not|shouldn't|cannot|can't)\b/g);
  const positives = countMatches(lower, /\b(always|ensure|make sure|should|must|prefer|use|do)\b/g);
  if (negatives >= 4 && negatives > positives) {
    issues.push({
      severity: "warning",
      title: "Over-reliance on negatives",
      explanation: "Mostly telling the model what not to do leaves the desired behaviour unclear.",
      fix: "Rephrase prohibitions as positive instructions where possible.",
    });
  }

  if (words.length > 0 && words.length < 8) {
    issues.push({
      severity: "warning",
      title: "Very short prompt with no context",
      explanation: "Short prompts give the model little to work with and produce inconsistent results.",
      fix: "Add the goal, constraints and any relevant context.",
    });
  }

  if (!has(lower, /\b(tone|audience|formal|casual|friendly|professional|beginner|expert|readers?|users?|for a\s|voice|style)\b/)) {
    issues.push({
      severity: "suggestion",
      title: "No tone or audience specified",
      explanation: "Without a target tone or audience the style of responses may drift.",
      fix: 'Name the audience and tone, e.g. "friendly, for non-technical users".',
    });
  }

  return issues;
}

const PENALTY: Record<Severity, number> = { error: 25, warning: 12, suggestion: 6 };

function scoreFor(issues: Issue[]): number {
  const total = issues.reduce((sum, i) => sum + PENALTY[i.severity], 0);
  return Math.max(0, Math.min(100, 100 - total));
}

function verdict(score: number): { label: string; color: string } {
  if (score < 50) return { label: "Needs Work", color: "text-error" };
  if (score < 80) return { label: "Good", color: "text-amber-400" };
  return { label: "Excellent", color: "text-success" };
}

const SEVERITY_STYLE: Record<Severity, string> = {
  error: "border-error/40 bg-error/10 text-error",
  warning: "border-amber-500/40 bg-amber-500/10 text-amber-300",
  suggestion: "border-accent/40 bg-accent/10 text-accent",
};

export default function PromptLinter() {
  const [text, setText] = useState("");
  const trimmed = text.trim();
  const issues = useMemo(() => (trimmed ? lint(text) : []), [text, trimmed]);
  const score = scoreFor(issues);
  const v = verdict(score);

  return (
    <div className="space-y-4">
      <Alert variant="info">
        This is a rule-based linter, not an AI review. It checks structure, not meaning.
      </Alert>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div>
          <Label htmlFor="pl-input">System prompt</Label>
          <Textarea
            id="pl-input"
            aria-label="System prompt"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste a system prompt to lint…"
            className="min-h-72"
          />
        </div>

        <div className="space-y-3">
          {!trimmed ? (
            <div className="flex h-full min-h-72 items-center justify-center rounded-lg border border-border bg-surface text-sm text-muted">
              Enter a system prompt to see its score and issues.
            </div>
          ) : (
            <>
              <div className="rounded-xl border border-border bg-surface p-5 text-center">
                <div className="text-5xl font-bold text-primary">{score}</div>
                <div className={`mt-1 text-sm font-semibold ${v.color}`}>{v.label}</div>
                <div className="mt-1 text-xs text-muted">{issues.length} issue{issues.length === 1 ? "" : "s"} found</div>
              </div>

              {issues.length === 0 ? (
                <Alert variant="success">No issues found — this prompt is well structured.</Alert>
              ) : (
                <ul className="space-y-2">
                  {issues.map((issue, i) => (
                    <li key={i} className={`rounded-lg border px-3 py-2 ${SEVERITY_STYLE[issue.severity]}`}>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold">{issue.title}</span>
                        <span className="rounded bg-black/20 px-1.5 py-0.5 text-[10px] uppercase tracking-wide">
                          {issue.severity}
                        </span>
                      </div>
                      <p className="mt-1 text-xs opacity-90">{issue.explanation}</p>
                      <p className="mt-1 text-xs opacity-80">
                        <span className="font-semibold">Fix:</span> {issue.fix}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
