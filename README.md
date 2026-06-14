# ToolVault

A **100% client-side** multi-tool workspace built with Next.js 15. Every tool runs entirely in the browser — no data ever leaves the tab, no server-side processing, no telemetry. An optional, server-secured admin area controls which tools are public.

## Stack

- **Next.js 15** (App Router, TypeScript strict mode) · **Tailwind CSS v4** · **Geist** font
- **pdf-lib** · **js-yaml** · **JSZip** · **gpt-tokenizer** · **Fuse.js**
- **Web Crypto API** for hashing (hand-written MD5) and admin session HMACs
- **@vercel/edge-config** for tool visibility (with a committed JSON fallback)

## Develop

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm run typecheck  # tsc --noEmit
```

## Design

Light mode is the default; dark mode is a toggle (`.dark` on `<html>`, persisted in `localStorage["toolvault-theme"]`, applied pre-paint to avoid flashes). The visual language is editorial and restrained: one neutral base, a single teal accent used sparingly, subtle borders over shadows. All theming flows through CSS variables in `app/globals.css`.

## Architecture

`lib/tools-registry.ts` is the single source of truth for tools and categories. The sidebar, homepage, search index, and static routes derive from it. Tool components are `'use client'` and lazy-loaded with `next/dynamic({ ssr: false })`. See **[ARCHITECTURE.md](./ARCHITECTURE.md)** for the storage, admin, and Vercel Hobby-plan decisions.

## Admin & tool visibility — setup

The admin area (`/admin`) lets you hide/show tools. Visibility is stored in **Vercel Edge Config** with `lib/tools-overrides.json` as a silent fallback.

1. **Create an Edge Config** in the Vercel dashboard.
2. **Connect it to the ToolVault project** — Vercel auto-injects the `EDGE_CONFIG` env var.
3. **Initialize an item:** key `hiddenTools`, value `[]`.
4. **Generate a Vercel Access Token** scoped to this project; add it as `VERCEL_ACCESS_TOKEN`.
5. **Add `VERCEL_PROJECT_ID`** (and `VERCEL_TEAM_ID` if the project is team-owned).
6. **Generate the admin secrets:**
   - `ADMIN_PASSWORD` — a passphrase of **at least 20 characters** (this is the real defence against brute force).
   - `ADMIN_SESSION_SECRET` — `openssl rand -base64 32`.
7. **Set all variables** in both the Vercel dashboard (Production + Preview scopes) and your local `.env.local`. See `.env.example`.

If `ADMIN_PASSWORD` or `ADMIN_SESSION_SECRET` is missing in production, the admin routes return a generic 500 (logged server-side) and never expose the issue to the client.

### Security summary

- Password check is **server-side and timing-safe** (HMAC of both sides; no length short-circuit). The password never reaches the client.
- Session is an **HMAC-signed token** in an **HttpOnly, Secure, SameSite=Strict** cookie with a generic name; 24-hour expiry.
- **Middleware** (`/admin/*` only) verifies the cookie and redirects unauthenticated requests before any admin page renders.
- A best-effort in-memory rate limiter blocks an IP after 5 failed attempts within 15 minutes (per warm instance — the strong password is the real defence).

## Hobby plan

This deploys to the Vercel **Hobby (free) plan**, which is **non-commercial use only**. The app uses **2 functions** (1 Node bundle for admin + 1 Edge middleware) and no paid Vercel products beyond Edge Config. See ARCHITECTURE.md.
