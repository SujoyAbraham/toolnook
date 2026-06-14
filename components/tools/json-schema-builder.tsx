"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Input, Label, Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { CopyButton } from "@/components/ui/CopyButton";
import { cn } from "@/lib/utils";

type ParamType = "string" | "number" | "integer" | "boolean" | "array" | "object";
type Param = {
  id: string;
  name: string;
  type: ParamType;
  description: string;
  required: boolean;
  enumCsv: string;
};

type JsonValue = string | number | boolean | null | JsonValue[] | { [k: string]: JsonValue };

function newParam(): Param {
  return { id: crypto.randomUUID(), name: "", type: "string", description: "", required: true, enumCsv: "" };
}

function buildProperties(params: Param[]): { properties: Record<string, JsonValue>; required: string[] } {
  const properties: Record<string, JsonValue> = {};
  const required: string[] = [];
  for (const p of params) {
    const name = p.name.trim();
    if (!name) continue;
    const prop: Record<string, JsonValue> = { type: p.type };
    if (p.description.trim()) prop.description = p.description.trim();
    if (p.type === "string") {
      const values = p.enumCsv.split(",").map((v) => v.trim()).filter(Boolean);
      if (values.length) prop.enum = values;
    }
    properties[name] = prop;
    if (p.required) required.push(name);
  }
  return { properties, required };
}

export default function JsonSchemaBuilder() {
  const [fnName, setFnName] = useState("get_weather");
  const [fnDesc, setFnDesc] = useState("Get the current weather for a location.");
  const [params, setParams] = useState<Param[]>([
    { id: crypto.randomUUID(), name: "location", type: "string", description: "City and country", required: true, enumCsv: "" },
    { id: crypto.randomUUID(), name: "units", type: "string", description: "Temperature units", required: false, enumCsv: "celsius, fahrenheit" },
  ]);
  const [fmt, setFmt] = useState<"openai" | "anthropic">("openai");

  function update(id: string, patch: Partial<Param>) {
    setParams((arr) => arr.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }

  const output = useMemo(() => {
    const { properties, required } = buildProperties(params);
    const schema = { type: "object", properties, required };
    if (fmt === "openai") {
      return JSON.stringify(
        {
          type: "function",
          function: { name: fnName.trim(), description: fnDesc.trim(), parameters: schema },
        },
        null,
        2,
      );
    }
    return JSON.stringify(
      { name: fnName.trim(), description: fnDesc.trim(), input_schema: schema },
      null,
      2,
    );
  }, [params, fnName, fnDesc, fmt]);

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-3">
          <div>
            <Label htmlFor="js-name">Function name</Label>
            <Input id="js-name" aria-label="Function name" value={fnName} onChange={(e) => setFnName(e.target.value)} className="font-mono" />
          </div>
          <div>
            <Label htmlFor="js-desc">Description</Label>
            <Input id="js-desc" aria-label="Function description" value={fnDesc} onChange={(e) => setFnDesc(e.target.value)} />
          </div>
        </div>

        <div>
          <Label>Parameters</Label>
          <div className="space-y-3">
            {params.map((p) => (
              <div key={p.id} className="space-y-2 rounded-lg border border-border bg-surface p-3">
                <div className="flex gap-2">
                  <Input aria-label="Parameter name" className="flex-1 font-mono" value={p.name} onChange={(e) => update(p.id, { name: e.target.value })} placeholder="name" />
                  <Select aria-label="Parameter type" className="w-32" value={p.type} onChange={(e) => update(p.id, { type: e.target.value as ParamType })}>
                    {(["string", "number", "integer", "boolean", "array", "object"] as ParamType[]).map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </Select>
                  <button type="button" onClick={() => setParams((a) => a.filter((x) => x.id !== p.id))} aria-label="Remove parameter" className="text-muted hover:text-error">
                    <Trash2 size={16} />
                  </button>
                </div>
                <Input aria-label="Parameter description" value={p.description} onChange={(e) => update(p.id, { description: e.target.value })} placeholder="Description" />
                {p.type === "string" && (
                  <Input aria-label="Enum values" value={p.enumCsv} onChange={(e) => update(p.id, { enumCsv: e.target.value })} placeholder="Enum values (comma separated, optional)" className="font-mono" />
                )}
                <label className="flex w-fit cursor-pointer items-center gap-2 text-sm text-primary">
                  <input type="checkbox" checked={p.required} onChange={(e) => update(p.id, { required: e.target.checked })} aria-label="Required" className="accent-[var(--accent)]" />
                  Required
                </label>
              </div>
            ))}
          </div>
          <Button variant="secondary" size="sm" className="mt-3" onClick={() => setParams((a) => [...a, newParam()])}>
            <Plus size={14} /> Add parameter
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="inline-flex rounded-lg border border-border bg-surface p-1">
            {(["openai", "anthropic"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFmt(f)}
                className={cn(
                  "rounded-md px-3 py-1 text-sm capitalize transition-colors",
                  fmt === f ? "bg-accent text-white" : "text-muted hover:text-primary",
                )}
              >
                {f}
              </button>
            ))}
          </div>
          <CopyButton value={output} label="Copy" />
        </div>
        <pre className="min-h-96 overflow-auto rounded-lg border border-border bg-surface p-3 font-mono text-sm text-primary">
          {output}
        </pre>
      </div>
    </div>
  );
}
