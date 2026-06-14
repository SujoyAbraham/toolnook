# ToolNook

A fast, privacy-first workspace of professional developer and writer utilities. Every tool runs **100% in the browser** — no data ever leaves the tab, no server-side processing, and no telemetry.

ToolNook bundles dozens of focused tools — JSON/YAML conversion, JWT inspection, regex testing, hashing, PDF utilities, image processing, AI/LLM helpers, and more — behind a single, searchable interface.

## Highlights

- **Private by design** — all processing happens client-side; nothing is uploaded or stored remotely.
- **Instant** — no accounts, no sign-up, no waiting on a backend.
- **Searchable** — fuzzy command palette (`⌘K`) across every tool.
- **Polished UI** — light/dark themes, a collapsible icon sidebar, and a dashboard home.

## Tech stack

- **Next.js 15** (App Router, TypeScript strict mode)
- **Tailwind CSS v4** with CSS-variable theming
- **Inter** + **Plus Jakarta Sans** + **JetBrains Mono** typefaces
- **lucide-react** icons · **Fuse.js** search
- **pdf-lib** · **js-yaml** · **JSZip** · **gpt-tokenizer**
- **Web Crypto API** for client-side hashing

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm run typecheck  # tsc --noEmit
```

## Design

Light mode is the default; dark mode is a toggle (`.dark` on `<html>`), applied before paint to avoid flashes. The visual language is restrained and editorial: one neutral base, a single accent used sparingly, and subtle borders over heavy shadows. All theming flows through CSS variables in `app/globals.css`.

## Architecture

`lib/tools-registry.ts` is the single source of truth for tools and categories — the sidebar, homepage, search index, and static routes all derive from it. Tool components are `'use client'` and lazy-loaded with `next/dynamic`, so each tool's dependencies load only when it's opened.
