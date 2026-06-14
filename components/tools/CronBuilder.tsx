"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { CopyButton } from "@/components/ui/CopyButton";
import { Input, Label } from "@/components/ui/Field";
import { Alert } from "@/components/ui/Alert";

type Fields = { minute: string; hour: string; day: string; month: string; weekday: string };

const PRESETS: { label: string; fields: Fields }[] = [
  { label: "Every minute", fields: { minute: "*", hour: "*", day: "*", month: "*", weekday: "*" } },
  { label: "Hourly", fields: { minute: "0", hour: "*", day: "*", month: "*", weekday: "*" } },
  { label: "Daily", fields: { minute: "0", hour: "0", day: "*", month: "*", weekday: "*" } },
  { label: "Weekly", fields: { minute: "0", hour: "0", day: "*", month: "*", weekday: "0" } },
  { label: "Monthly", fields: { minute: "0", hour: "0", day: "1", month: "*", weekday: "*" } },
];

function parseField(spec: string, min: number, max: number): number[] {
  const values = new Set<number>();
  for (const part of spec.split(",")) {
    const stepMatch = part.split("/");
    const range = stepMatch[0];
    const step = stepMatch[1] ? parseInt(stepMatch[1], 10) : 1;
    if (!step || step < 1) throw new Error(`Invalid step in "${part}"`);
    let lo = min;
    let hi = max;
    if (range !== "*") {
      const bounds = range.split("-");
      lo = parseInt(bounds[0], 10);
      hi = bounds[1] !== undefined ? parseInt(bounds[1], 10) : lo;
      if (Number.isNaN(lo) || Number.isNaN(hi)) throw new Error(`Invalid value "${part}"`);
    }
    for (let v = lo; v <= hi; v += step) {
      if (v < min || v > max) throw new Error(`Value ${v} out of range (${min}-${max})`);
      values.add(v);
    }
  }
  return Array.from(values).sort((a, b) => a - b);
}

const MONTHS = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function describe(f: Fields): string {
  const parts: string[] = [];
  const m = f.minute === "*" ? "every minute" : `minute ${f.minute}`;
  const h = f.hour === "*" ? "every hour" : `hour ${f.hour}`;
  if (f.minute === "*" && f.hour === "*") parts.push("Every minute");
  else if (f.hour === "*") parts.push(`At ${m} of every hour`);
  else if (f.minute === "*") parts.push(`Every minute during ${h}`);
  else parts.push(`At ${String(f.hour).padStart(2, "0")}:${String(f.minute).padStart(2, "0")}`);

  if (f.day !== "*") parts.push(`on day ${f.day} of the month`);
  if (f.weekday !== "*") {
    const days = f.weekday
      .split(",")
      .map((d) => DAYS[Number(d) % 7] ?? d)
      .join(", ");
    parts.push(`on ${days}`);
  }
  if (f.month !== "*") {
    const months = f.month
      .split(",")
      .map((mo) => MONTHS[Number(mo)] ?? mo)
      .join(", ");
    parts.push(`in ${months}`);
  }
  return parts.join(" ");
}

function nextRuns(f: Fields, n: number): Date[] {
  const minutes = parseField(f.minute, 0, 59);
  const hours = parseField(f.hour, 0, 23);
  const days = parseField(f.day, 1, 31);
  const months = parseField(f.month, 1, 12);
  const weekdays = parseField(f.weekday.replace(/7/g, "0"), 0, 6);

  const dayRestricted = f.day !== "*";
  const weekdayRestricted = f.weekday !== "*";

  const result: Date[] = [];
  const cursor = new Date();
  cursor.setSeconds(0, 0);
  cursor.setMinutes(cursor.getMinutes() + 1);

  let guard = 0;
  while (result.length < n && guard < 600000) {
    guard++;
    const okMonth = months.includes(cursor.getMonth() + 1);
    const okMinute = minutes.includes(cursor.getMinutes());
    const okHour = hours.includes(cursor.getHours());
    const matchDom = days.includes(cursor.getDate());
    const matchDow = weekdays.includes(cursor.getDay());
    // Cron OR semantics when both day-of-month and weekday are restricted
    let okDay: boolean;
    if (dayRestricted && weekdayRestricted) okDay = matchDom || matchDow;
    else if (dayRestricted) okDay = matchDom;
    else if (weekdayRestricted) okDay = matchDow;
    else okDay = true;

    if (okMonth && okDay && okHour && okMinute) result.push(new Date(cursor));
    cursor.setMinutes(cursor.getMinutes() + 1);
  }
  return result;
}

export default function CronBuilder() {
  const [fields, setFields] = useState<Fields>({
    minute: "0",
    hour: "9",
    day: "*",
    month: "*",
    weekday: "1-5",
  });

  function update(key: keyof Fields, value: string) {
    setFields((f) => ({ ...f, [key]: value }));
  }

  const expression = `${fields.minute} ${fields.hour} ${fields.day} ${fields.month} ${fields.weekday}`;

  const { description, runs, error } = useMemo(() => {
    try {
      return { description: describe(fields), runs: nextRuns(fields, 10), error: null };
    } catch (e) {
      return {
        description: "",
        runs: [] as Date[],
        error: e instanceof Error ? e.message : "Invalid expression",
      };
    }
  }, [fields]);

  const labels: [keyof Fields, string, string][] = [
    ["minute", "Minute", "0-59"],
    ["hour", "Hour", "0-23"],
    ["day", "Day", "1-31"],
    ["month", "Month", "1-12"],
    ["weekday", "Weekday", "0-6"],
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <Button key={p.label} variant="secondary" size="sm" onClick={() => setFields(p.fields)}>
            {p.label}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {labels.map(([key, label, hint]) => (
          <div key={key}>
            <Label htmlFor={`cron-${key}`}>
              {label} <span className="text-muted/60">{hint}</span>
            </Label>
            <Input
              id={`cron-${key}`}
              aria-label={label}
              value={fields[key]}
              onChange={(e) => update(key, e.target.value)}
              className="text-center font-mono"
            />
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between gap-2 rounded-lg border border-border bg-surface p-3">
        <code className="font-mono text-lg text-accent">{expression}</code>
        <CopyButton value={expression} label="Copy" />
      </div>

      {error ? (
        <Alert variant="error">{error}</Alert>
      ) : (
        <>
          <Alert variant="info">{description}</Alert>
          <div>
            <Label>Next 10 runs (local time)</Label>
            <ul className="space-y-1 rounded-lg border border-border bg-surface p-3 font-mono text-sm text-primary">
              {runs.length === 0 && <li className="text-muted">No upcoming runs found.</li>}
              {runs.map((d, i) => (
                <li key={i}>{d.toLocaleString()}</li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
