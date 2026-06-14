"use client";

import { useMemo, useState } from "react";
import yaml from "js-yaml";
import { ArrowLeftRight } from "lucide-react";
import { Label, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { CopyButton } from "@/components/ui/CopyButton";
import { Alert } from "@/components/ui/Alert";

type Mode = "json2yaml" | "yaml2json";

export default function JsonYaml() {
  const [mode, setMode] = useState<Mode>("json2yaml");
  const [input, setInput] = useState('{\n  "name": "ToolVault",\n  "tools": 36,\n  "tags": ["fast", "private"]\n}');

  const { output, error } = useMemo(() => {
    if (!input.trim()) return { output: "", error: null };
    try {
      if (mode === "json2yaml") {
        const obj: unknown = JSON.parse(input);
        return { output: yaml.dump(obj, { indent: 2 }), error: null };
      }
      const obj = yaml.load(input);
      return { output: JSON.stringify(obj, null, 2), error: null };
    } catch (e) {
      return { output: "", error: e instanceof Error ? e.message : "Conversion failed" };
    }
  }, [input, mode]);

  function swap() {
    if (output && !error) setInput(output);
    setMode((m) => (m === "json2yaml" ? "yaml2json" : "json2yaml"));
  }

  const inputLabel = mode === "json2yaml" ? "JSON" : "YAML";
  const outputLabel = mode === "json2yaml" ? "YAML" : "JSON";

  return (
    <div className="grid grid-cols-1 items-start gap-3 lg:grid-cols-[1fr_auto_1fr]">
      <div>
        <Label htmlFor="jy-input">{inputLabel}</Label>
        <Textarea
          id="jy-input"
          aria-label={`${inputLabel} input`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="min-h-72"
        />
      </div>

      <div className="flex justify-center lg:flex-col lg:pt-8">
        <Button variant="secondary" size="sm" onClick={swap} aria-label="Swap direction">
          <ArrowLeftRight size={16} />
        </Button>
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <Label className="mb-0">{outputLabel}</Label>
          <CopyButton value={output} label="Copy" />
        </div>
        {error ? (
          <Alert variant="error">{error}</Alert>
        ) : (
          <Textarea
            readOnly
            aria-label={`${outputLabel} output`}
            value={output}
            className="min-h-72 bg-surface"
          />
        )}
      </div>
    </div>
  );
}
