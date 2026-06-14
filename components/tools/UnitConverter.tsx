"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Input, Label, Select } from "@/components/ui/Field";
import { cn } from "@/lib/utils";

type LinearCategory = { name: string; units: Record<string, number> };

const LINEAR: LinearCategory[] = [
  {
    name: "Length",
    units: { Meter: 1, Kilometer: 1000, Centimeter: 0.01, Millimeter: 0.001, Mile: 1609.344, Yard: 0.9144, Foot: 0.3048, Inch: 0.0254 },
  },
  {
    name: "Weight",
    units: { Gram: 1, Kilogram: 1000, Milligram: 0.001, Tonne: 1_000_000, Pound: 453.592, Ounce: 28.3495 },
  },
  {
    name: "Speed",
    units: { "Meter/sec": 1, "Km/hour": 0.277778, "Miles/hour": 0.44704, Knot: 0.514444, "Foot/sec": 0.3048 },
  },
  {
    name: "Area",
    units: { "Sq meter": 1, "Sq kilometer": 1_000_000, "Sq centimeter": 0.0001, "Sq foot": 0.092903, Acre: 4046.86, Hectare: 10000, "Sq mile": 2_589_988.11 },
  },
  {
    name: "Data storage",
    units: { Byte: 1, Bit: 0.125, Kilobyte: 1024, Megabyte: 1048576, Gigabyte: 1073741824, Terabyte: 1099511627776 },
  },
];

const TEMP_UNITS = ["Celsius", "Fahrenheit", "Kelvin"];

function toCelsius(value: number, unit: string): number {
  if (unit === "Fahrenheit") return (value - 32) * (5 / 9);
  if (unit === "Kelvin") return value - 273.15;
  return value;
}
function fromCelsius(c: number, unit: string): number {
  if (unit === "Fahrenheit") return c * (9 / 5) + 32;
  if (unit === "Kelvin") return c + 273.15;
  return c;
}

export default function UnitConverter() {
  const categories = [...LINEAR.map((c) => c.name), "Temperature"];
  const [category, setCategory] = useState("Length");
  const [value, setValue] = useState("1");
  const [from, setFrom] = useState("Meter");
  const [to, setTo] = useState("Foot");

  const isTemp = category === "Temperature";
  const units = isTemp ? TEMP_UNITS : Object.keys(LINEAR.find((c) => c.name === category)!.units);

  function switchCategory(name: string) {
    setCategory(name);
    const u = name === "Temperature" ? TEMP_UNITS : Object.keys(LINEAR.find((c) => c.name === name)!.units);
    setFrom(u[0]);
    setTo(u[1] ?? u[0]);
  }

  const num = parseFloat(value);
  let result = "";
  if (!Number.isNaN(num)) {
    if (isTemp) {
      result = fromCelsius(toCelsius(num, from), to).toFixed(4).replace(/\.?0+$/, "");
    } else {
      const map = LINEAR.find((c) => c.name === category)!.units;
      const base = num * map[from];
      result = (base / map[to]).toFixed(6).replace(/\.?0+$/, "");
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => switchCategory(c)}
            className={cn(
              "rounded-lg border px-3 py-1.5 text-sm transition-colors",
              category === c ? "border-accent bg-accent/15 text-accent" : "border-border bg-elevated text-muted hover:text-primary",
            )}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-[1fr_auto_1fr]">
        <div>
          <Label htmlFor="uc-value">From</Label>
          <Input id="uc-value" type="number" aria-label="Value to convert" value={value} onChange={(e) => setValue(e.target.value)} />
          <div className="mt-2">
            <Select aria-label="From unit" value={from} onChange={(e) => setFrom(e.target.value)}>
              {units.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="flex justify-center pb-2 text-muted">
          <ArrowRight size={20} />
        </div>

        <div>
          <Label>To</Label>
          <Input readOnly aria-label="Converted value" value={result} className="bg-surface font-mono" />
          <div className="mt-2">
            <Select aria-label="To unit" value={to} onChange={(e) => setTo(e.target.value)}>
              {units.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
