"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Input, Label } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { downloadBlob } from "@/lib/utils";

type LineItem = { id: string; description: string; qty: number; price: number };

export default function InvoiceGenerator() {
  const [company, setCompany] = useState("Acme Studios");
  const [client, setClient] = useState("Globex Corp");
  const [number, setNumber] = useState("INV-001");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [tax, setTax] = useState(10);
  const [discount, setDiscount] = useState(0);
  const [items, setItems] = useState<LineItem[]>([
    { id: crypto.randomUUID(), description: "Design work", qty: 10, price: 75 },
  ]);
  const [busy, setBusy] = useState(false);

  function updateItem(id: string, patch: Partial<LineItem>) {
    setItems((arr) => arr.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  }

  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, it) => sum + it.qty * it.price, 0);
    const discountAmt = (subtotal * discount) / 100;
    const taxable = subtotal - discountAmt;
    const taxAmt = (taxable * tax) / 100;
    return { subtotal, discountAmt, taxAmt, total: taxable + taxAmt };
  }, [items, tax, discount]);

  async function downloadPdf() {
    setBusy(true);
    try {
      const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
      const doc = await PDFDocument.create();
      const page = doc.addPage([595, 842]);
      const font = await doc.embedFont(StandardFonts.Helvetica);
      const bold = await doc.embedFont(StandardFonts.HelveticaBold);
      const ink = rgb(0.06, 0.09, 0.16);
      const grey = rgb(0.4, 0.45, 0.5);
      let y = 790;

      const text = (s: string, x: number, yy: number, size = 11, f = font, color = ink) =>
        page.drawText(s, { x, y: yy, size, font: f, color });

      text("INVOICE", 50, y, 24, bold);
      text(`#${number}`, 450, y + 4, 12, bold, grey);
      y -= 40;
      text("From", 50, y, 9, bold, grey);
      text("Bill To", 320, y, 9, bold, grey);
      y -= 16;
      text(company, 50, y, 12, bold);
      text(client, 320, y, 12, bold);
      y -= 16;
      text(`Date: ${date}`, 50, y, 10, font, grey);
      y -= 40;

      // table header
      text("Description", 50, y, 10, bold);
      text("Qty", 360, y, 10, bold);
      text("Price", 420, y, 10, bold);
      text("Amount", 490, y, 10, bold);
      y -= 8;
      page.drawLine({ start: { x: 50, y }, end: { x: 545, y }, thickness: 1, color: grey });
      y -= 20;
      for (const it of items) {
        text(it.description || "—", 50, y, 10);
        text(String(it.qty), 360, y, 10);
        text(it.price.toFixed(2), 420, y, 10);
        text((it.qty * it.price).toFixed(2), 490, y, 10);
        y -= 18;
      }
      y -= 10;
      page.drawLine({ start: { x: 320, y }, end: { x: 545, y }, thickness: 0.5, color: grey });
      y -= 20;
      const rows: [string, string][] = [
        ["Subtotal", totals.subtotal.toFixed(2)],
        [`Discount (${discount}%)`, `-${totals.discountAmt.toFixed(2)}`],
        [`Tax (${tax}%)`, totals.taxAmt.toFixed(2)],
      ];
      for (const [k, v] of rows) {
        text(k, 360, y, 10, font, grey);
        text(v, 490, y, 10);
        y -= 18;
      }
      text("Total", 360, y, 12, bold);
      text(totals.total.toFixed(2), 490, y, 12, bold);

      const bytes = await doc.save();
      downloadBlob(new Blob([bytes as BlobPart], { type: "application/pdf" }), `${number}.pdf`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      {/* Form */}
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="inv-company">Your company</Label>
            <Input id="inv-company" aria-label="Your company" value={company} onChange={(e) => setCompany(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="inv-client">Client</Label>
            <Input id="inv-client" aria-label="Client name" value={client} onChange={(e) => setClient(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="inv-number">Invoice number</Label>
            <Input id="inv-number" aria-label="Invoice number" value={number} onChange={(e) => setNumber(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="inv-date">Date</Label>
            <Input id="inv-date" type="date" aria-label="Invoice date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
        </div>

        <Label>Line items</Label>
        <div className="space-y-2">
          {items.map((it) => (
            <div key={it.id} className="flex gap-2">
              <Input aria-label="Item description" className="flex-1" value={it.description} onChange={(e) => updateItem(it.id, { description: e.target.value })} placeholder="Description" />
              <Input aria-label="Quantity" className="w-16" type="number" value={it.qty} onChange={(e) => updateItem(it.id, { qty: Number(e.target.value) })} />
              <Input aria-label="Unit price" className="w-24" type="number" value={it.price} onChange={(e) => updateItem(it.id, { price: Number(e.target.value) })} />
              <button type="button" onClick={() => setItems((a) => a.filter((x) => x.id !== it.id))} aria-label="Remove item" className="text-muted hover:text-error">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
        <Button variant="secondary" size="sm" onClick={() => setItems((a) => [...a, { id: crypto.randomUUID(), description: "", qty: 1, price: 0 }])}>
          <Plus size={14} /> Add item
        </Button>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="inv-tax">Tax %</Label>
            <Input id="inv-tax" type="number" aria-label="Tax percent" value={tax} onChange={(e) => setTax(Number(e.target.value))} />
          </div>
          <div>
            <Label htmlFor="inv-disc">Discount %</Label>
            <Input id="inv-disc" type="number" aria-label="Discount percent" value={discount} onChange={(e) => setDiscount(Number(e.target.value))} />
          </div>
        </div>

        <Button onClick={downloadPdf} disabled={busy}>
          {busy ? "Generating…" : "Download as PDF"}
        </Button>
      </div>

      {/* Preview */}
      <div className="rounded-xl border border-border bg-white p-6 text-slate-900 shadow-sm">
        <div className="flex items-start justify-between">
          <h2 className="text-2xl font-bold">INVOICE</h2>
          <span className="text-sm font-medium text-slate-500">#{number}</span>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400">From</p>
            <p className="font-semibold">{company}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400">Bill To</p>
            <p className="font-semibold">{client}</p>
          </div>
        </div>
        <p className="mt-2 text-sm text-slate-500">Date: {date}</p>

        <table className="mt-6 w-full text-sm">
          <thead>
            <tr className="border-b border-slate-300 text-left text-xs uppercase text-slate-400">
              <th className="py-1">Description</th>
              <th className="py-1 text-right">Qty</th>
              <th className="py-1 text-right">Price</th>
              <th className="py-1 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id} className="border-b border-slate-100">
                <td className="py-1.5">{it.description || "—"}</td>
                <td className="py-1.5 text-right">{it.qty}</td>
                <td className="py-1.5 text-right">{it.price.toFixed(2)}</td>
                <td className="py-1.5 text-right">{(it.qty * it.price).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 ml-auto w-1/2 space-y-1 text-sm">
          <Row label="Subtotal" value={totals.subtotal} />
          <Row label={`Discount (${discount}%)`} value={-totals.discountAmt} />
          <Row label={`Tax (${tax}%)`} value={totals.taxAmt} />
          <div className="flex justify-between border-t border-slate-300 pt-1 font-bold">
            <span>Total</span>
            <span>{totals.total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between text-slate-600">
      <span>{label}</span>
      <span>{value.toFixed(2)}</span>
    </div>
  );
}
