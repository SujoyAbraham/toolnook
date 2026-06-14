"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Field";

export function LoginForm() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(false);
    let ok = false;
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      ok = res.ok;
    } catch {
      ok = false;
    }
    if (ok) {
      window.location.href = "/admin";
      return;
    }
    setBusy(false);
    setPassword("");
    setError(true);
  }

  return (
    <form
      onSubmit={submit}
      className="w-full max-w-sm rounded-lg border border-border bg-surface p-6"
      autoComplete="off"
    >
      <h1 className="text-lg font-semibold tracking-tight text-primary">Admin access</h1>
      <p className="mt-1 text-sm text-muted">Enter the admin password to continue.</p>

      <div className="mt-5">
        <Label htmlFor="admin-password">Password</Label>
        <Input
          id="admin-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-label="Admin password"
          autoComplete="off"
          autoFocus
        />
      </div>

      {error && <p className="mt-3 text-sm text-error">Incorrect password. Please try again.</p>}

      <Button type="submit" className="mt-5 w-full" disabled={busy || password.length === 0}>
        {busy ? "Checking…" : "Sign in"}
      </Button>
    </form>
  );
}
