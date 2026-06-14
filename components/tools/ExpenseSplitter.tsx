"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Input, Label, Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

type Expense = {
  id: string;
  description: string;
  amount: number;
  payer: string;
  participants: string[];
};

function settle(balances: Map<string, number>) {
  const debtors: { name: string; amount: number }[] = [];
  const creditors: { name: string; amount: number }[] = [];
  for (const [name, bal] of balances) {
    if (bal < -0.01) debtors.push({ name, amount: -bal });
    else if (bal > 0.01) creditors.push({ name, amount: bal });
  }
  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const transfers: { from: string; to: string; amount: number }[] = [];
  let i = 0;
  let j = 0;
  while (i < debtors.length && j < creditors.length) {
    const pay = Math.min(debtors[i].amount, creditors[j].amount);
    transfers.push({ from: debtors[i].name, to: creditors[j].name, amount: pay });
    debtors[i].amount -= pay;
    creditors[j].amount -= pay;
    if (debtors[i].amount < 0.01) i++;
    if (creditors[j].amount < 0.01) j++;
  }
  return transfers;
}

export default function ExpenseSplitter() {
  const [members, setMembers] = useState<string[]>(["Alice", "Bob", "Carol"]);
  const [newMember, setNewMember] = useState("");
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [payer, setPayer] = useState("Alice");
  const [participants, setParticipants] = useState<string[]>(["Alice", "Bob", "Carol"]);

  function addMember() {
    const name = newMember.trim();
    if (!name || members.includes(name)) return;
    setMembers((m) => [...m, name]);
    setParticipants((p) => [...p, name]);
    setNewMember("");
  }

  function removeMember(name: string) {
    setMembers((m) => m.filter((x) => x !== name));
    setParticipants((p) => p.filter((x) => x !== name));
    setExpenses((e) => e.filter((x) => x.payer !== name).map((x) => ({ ...x, participants: x.participants.filter((p) => p !== name) })));
    if (payer === name && members.length > 1) setPayer(members.find((x) => x !== name) ?? "");
  }

  function addExpense() {
    const amt = parseFloat(amount);
    if (!desc.trim() || !amt || amt <= 0 || participants.length === 0) return;
    setExpenses((e) => [
      ...e,
      { id: crypto.randomUUID(), description: desc.trim(), amount: amt, payer, participants: [...participants] },
    ]);
    setDesc("");
    setAmount("");
  }

  const { transfers, total } = useMemo(() => {
    const balances = new Map<string, number>(members.map((m) => [m, 0]));
    let sum = 0;
    for (const exp of expenses) {
      sum += exp.amount;
      balances.set(exp.payer, (balances.get(exp.payer) ?? 0) + exp.amount);
      const share = exp.amount / exp.participants.length;
      for (const p of exp.participants) {
        balances.set(p, (balances.get(p) ?? 0) - share);
      }
    }
    return { transfers: settle(balances), total: sum };
  }, [members, expenses]);

  function toggleParticipant(name: string) {
    setParticipants((p) => (p.includes(name) ? p.filter((x) => x !== name) : [...p, name]));
  }

  return (
    <div className="space-y-5">
      {/* Members */}
      <div className="rounded-lg border border-border bg-surface p-4">
        <Label>Members</Label>
        <div className="mb-3 flex flex-wrap gap-2">
          {members.map((m) => (
            <span key={m} className="flex items-center gap-1.5 rounded-full border border-border bg-elevated px-3 py-1 text-sm text-primary">
              {m}
              <button type="button" onClick={() => removeMember(m)} aria-label={`Remove ${m}`}>
                <Trash2 size={12} className="text-muted hover:text-error" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            aria-label="New member name"
            value={newMember}
            onChange={(e) => setNewMember(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addMember()}
            placeholder="Add member…"
          />
          <Button onClick={addMember}>
            <Plus size={16} /> Add
          </Button>
        </div>
      </div>

      {/* Add expense */}
      {members.length >= 2 && (
        <div className="space-y-3 rounded-lg border border-border bg-surface p-4">
          <Label>Add expense</Label>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input aria-label="Description" value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Description" />
            <Input aria-label="Amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount" />
          </div>
          <div>
            <Label htmlFor="exp-payer">Paid by</Label>
            <Select id="exp-payer" aria-label="Payer" value={payer} onChange={(e) => setPayer(e.target.value)}>
              {members.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Split between</Label>
            <div className="flex flex-wrap gap-2">
              {members.map((m) => (
                <label key={m} className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-elevated px-3 py-1.5 text-sm">
                  <input type="checkbox" checked={participants.includes(m)} onChange={() => toggleParticipant(m)} aria-label={`Include ${m}`} className="accent-[var(--accent)]" />
                  {m}
                </label>
              ))}
            </div>
          </div>
          <Button onClick={addExpense}>Add expense</Button>
        </div>
      )}

      {/* Expense list */}
      {expenses.length > 0 && (
        <div className="space-y-2">
          {expenses.map((exp) => (
            <div key={exp.id} className="flex items-center justify-between rounded-lg border border-border bg-surface p-3 text-sm">
              <div>
                <span className="font-medium text-primary">{exp.description}</span>
                <span className="ml-2 text-muted">
                  {exp.payer} paid for {exp.participants.join(", ")}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-primary">{exp.amount.toFixed(2)}</span>
                <button type="button" onClick={() => setExpenses((e) => e.filter((x) => x.id !== exp.id))} aria-label="Remove expense">
                  <Trash2 size={14} className="text-muted hover:text-error" />
                </button>
              </div>
            </div>
          ))}
          <div className="text-right text-sm text-muted">Total: {total.toFixed(2)}</div>
        </div>
      )}

      {/* Settlement */}
      <div>
        <Label>Settlement</Label>
        {transfers.length === 0 ? (
          <Alert variant="info">Add expenses to see who owes whom.</Alert>
        ) : (
          <ul className="space-y-2">
            {transfers.map((t, i) => (
              <li key={i} className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-primary">
                <span className="font-medium text-error">{t.from}</span> owes{" "}
                <span className="font-medium text-success">{t.to}</span>:{" "}
                <span className="font-mono">{t.amount.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
