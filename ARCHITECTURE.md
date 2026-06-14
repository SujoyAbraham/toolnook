# ToolNook — Architecture

This document explains the structural choices behind ToolNook, especially the
constraints imposed by the **Vercel Hobby (free) plan**. Read this before
changing the shell, the admin layer, or the storage code.

## Goals

- Every tool runs 100% in the browser. No tool hits a server function.
- Public pages are statically generated and cheap to serve.
- An admin can hide/show tools without a redeploy, secured server-side.
- Stay comfortably inside the Hobby plan limits.

## Function budget (Hobby plan = 12 functions max)

We deploy **2 functions**:

1. **One Node.js bundle** for all admin server code — the admin pages
   (`/admin`, `/admin/login`) and the three route handlers
   (`/api/admin/login`, `/api/admin/logout`, `/api/admin/save`). They all use
   the default Node runtime so Vercel groups them into a single function.
2. **One Edge function** for `middleware.ts`.

Everything else is static:

- `/` and `/tools/[slug]` are statically generated (`dynamic = "force-static"`,
  `revalidate = 60`). The tool route uses `generateStaticParams` over the list
  of **visible** tools and sets `dynamicParams = false`, so hidden or unknown
  slugs return the standard Next.js 404 without a server function.

## Middleware scope

`middleware.ts` matches **only** `/admin` and `/admin/:path*`. It never runs on
public requests, which keeps us well inside the edge-request budget. It verifies
the signed session cookie and redirects to `/admin/login` server-side before any
admin page renders. `/admin/login` is allowed through so it stays reachable.

## Tool visibility storage

- **Primary:** Vercel Edge Config, key `hiddenTools` = array of hidden slugs.
  Hobby includes 100k reads + 100 writes / month.
- **Fallback:** `lib/tools-overrides.json` (`{ "hidden": [] }`), used silently if
  Edge Config is unreachable or unset, so the site never breaks.
- `lib/visibility.ts#getHiddenTools()` reads Edge Config, caches the result in
  **module memory for 60s** (so each warm instance reads at most once per
  minute), and falls back to the JSON file on any failure.
- Reads happen on the sidebar, homepage, search index, and tool route — all via
  the same cached helper.

### Writes (admin "Save to live")

`/api/admin/save` verifies the session cookie, then calls the **Vercel REST API**
(`PATCH /v1/edge-config/{id}/items`) with a server-only `VERCEL_ACCESS_TOKEN` to
upsert `hiddenTools`. It then clears the module cache and calls
`revalidatePath("/", "layout")` so listings refresh.

### Honest limitation

Because tool pages are statically generated with `generateStaticParams`, **hiding
a tool removes it from all navigation immediately** (listings revalidate), but a
direct visit to a previously-built tool URL only starts returning 404 after the
next deploy rebuilds the static params. Newly *un-hidden* tools likewise become
reachable on the next build. This is the deliberate trade-off for keeping every
tool page static and the function count at 2.

## Admin preview (local, per-browser)

While signed in, the dashboard writes the pending hidden list to
`localStorage["toolnook-preview"]` and dispatches an event. The public shell in
the same browser reads it (`lib/visibility-client.ts`) and reflects unsaved
changes. Public visitors never have this key, so they only ever see the live,
server-rendered state — there is no flash of hidden tools. "Save to live" and
"Log out" clear the key.

## Security

See the README for the full setup. In short: the password lives only in
`ADMIN_PASSWORD`, compared timing-safe (HMAC of both sides, no length
short-circuit); sessions are HMAC-signed with `ADMIN_SESSION_SECRET`; the cookie
is HttpOnly + Secure + SameSite=Strict with a generic name; a best-effort
in-memory rate limiter slows brute force per warm instance.

## Other Hobby-driven rules

- Live model data (Phase 2) is fetched **browser → OpenRouter directly**, never
  proxied through a Next.js route, and cached in `sessionStorage`.
- No runtime filesystem writes (the runtime FS is read-only).
- Non-commercial use only, per the Hobby plan terms.
