# ToolNook — Browser Extension

A Chrome + Firefox extension that surfaces the ToolNook tools in a **side panel**:
search for a tool, click it, and it loads in place. Built with [WXT](https://wxt.dev).

This is a **standalone sub-project**. It has its own `package.json` / `node_modules`
and is **not** part of the Next.js app's build — Vercel never builds it, and a
`git push` only deploys the website. The extension ships only when you build and
upload it to the stores (below).

## How it reuses the web app

The extension imports the real tool components and registry from the web app
(`../components/tools`, `../components/ui`, `../lib`). The slug→component map lives
in `../lib/tool-imports.ts` and is shared by both the website (`next/dynamic`) and
the extension (`React.lazy`). Each tool is a lazy chunk, so only the opened tool
downloads.

## Develop

```bash
cd extension
npm install
npm run dev            # Chrome, hot-reload
npm run dev:firefox    # Firefox
```

Then load the dev build (WXT prints the path), or for a production build:

```bash
npm run build          # → .output/chrome-mv3
npm run build:firefox  # → .output/firefox-mv2
```

### Load an unpacked build manually
- **Chrome/Edge:** `chrome://extensions` → enable Developer mode → *Load unpacked* → select `.output/chrome-mv3`. Click the toolbar icon to open the side panel.
- **Firefox:** `about:debugging` → This Firefox → *Load Temporary Add-on* → pick any file in `.output/firefox-mv2`. Open the sidebar from the toolbar.

## Adding a new tool

Because the extension reuses the web registry, adding a tool is the same as for
the website, plus one shared line:

1. Add the component to `../components/tools/` and the entry to `../lib/tools-registry.ts`.
2. Add its importer to `../lib/tool-imports.ts` (one line) — both web and extension pick it up.
3. The tool now appears in the side-panel search automatically. Rebuild to ship.

## Publishing (ship an update)

A git push does **not** publish the extension. To release:

```bash
npm run zip            # → .output/*-chrome.zip
npm run zip:firefox    # → .output/*-firefox.zip
```

Upload the zips to the **Chrome Web Store** (one-time $5 developer fee) and
**Firefox Add-ons (AMO)** dashboards. WXT also supports `wxt submit` to automate
store submissions. Safari can be added later from this same code via
`safari-web-extension-converter` (needs Xcode + an Apple Developer account).
