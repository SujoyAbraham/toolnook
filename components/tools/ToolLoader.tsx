"use client";

import dynamic from "next/dynamic";
import { type ComponentType } from "react";

function Loading() {
  return (
    <div className="flex h-40 items-center justify-center text-sm text-muted">
      Loading tool…
    </div>
  );
}

const registry: Record<string, ComponentType> = {
  "jwt-inspector": dynamic(() => import("./JwtInspector"), { ssr: false, loading: Loading }),
  "regex-playground": dynamic(() => import("./RegexPlayground"), { ssr: false, loading: Loading }),
  "uuid-generator": dynamic(() => import("./UuidGenerator"), { ssr: false, loading: Loading }),
  "cron-builder": dynamic(() => import("./CronBuilder"), { ssr: false, loading: Loading }),
  "diff-checker": dynamic(() => import("./DiffChecker"), { ssr: false, loading: Loading }),
  "api-response-formatter": dynamic(() => import("./ApiResponseFormatter"), { ssr: false, loading: Loading }),
  "pdf-merge": dynamic(() => import("./PdfMerge"), { ssr: false, loading: Loading }),
  "pdf-split": dynamic(() => import("./PdfSplit"), { ssr: false, loading: Loading }),
  "image-to-pdf": dynamic(() => import("./ImageToPdf"), { ssr: false, loading: Loading }),
  "markdown-editor": dynamic(() => import("./MarkdownEditor"), { ssr: false, loading: Loading }),
  "word-counter": dynamic(() => import("./WordCounter"), { ssr: false, loading: Loading }),
  "json-yaml": dynamic(() => import("./JsonYaml"), { ssr: false, loading: Loading }),
  "json-csv": dynamic(() => import("./JsonCsv"), { ssr: false, loading: Loading }),
  base64: dynamic(() => import("./Base64Tool"), { ssr: false, loading: Loading }),
  "url-codec": dynamic(() => import("./UrlCodec"), { ssr: false, loading: Loading }),
  "color-converter": dynamic(() => import("./ColorConverter"), { ssr: false, loading: Loading }),
  "number-base-converter": dynamic(() => import("./NumberBaseConverter"), { ssr: false, loading: Loading }),
  "password-generator": dynamic(() => import("./PasswordGenerator"), { ssr: false, loading: Loading }),
  "password-strength-analyzer": dynamic(() => import("./PasswordStrengthAnalyzer"), { ssr: false, loading: Loading }),
  "hash-generator": dynamic(() => import("./HashGenerator"), { ssr: false, loading: Loading }),
  "csp-builder": dynamic(() => import("./CspBuilder"), { ssr: false, loading: Loading }),
  "loan-calculator": dynamic(() => import("./LoanCalculator"), { ssr: false, loading: Loading }),
  "expense-splitter": dynamic(() => import("./ExpenseSplitter"), { ssr: false, loading: Loading }),
  "invoice-generator": dynamic(() => import("./InvoiceGenerator"), { ssr: false, loading: Loading }),
  "tip-calculator": dynamic(() => import("./TipCalculator"), { ssr: false, loading: Loading }),
  "percentage-calculator": dynamic(() => import("./PercentageCalculator"), { ssr: false, loading: Loading }),
  "unit-converter": dynamic(() => import("./UnitConverter"), { ssr: false, loading: Loading }),
  "image-resizer": dynamic(() => import("./ImageResizer"), { ssr: false, loading: Loading }),
  "image-compressor": dynamic(() => import("./ImageCompressor"), { ssr: false, loading: Loading }),
  "image-converter": dynamic(() => import("./ImageConverter"), { ssr: false, loading: Loading }),
  "color-extractor": dynamic(() => import("./ColorExtractor"), { ssr: false, loading: Loading }),
  "favicon-generator": dynamic(() => import("./FaviconGenerator"), { ssr: false, loading: Loading }),
  "case-converter": dynamic(() => import("./CaseConverter"), { ssr: false, loading: Loading }),
  "lorem-ipsum": dynamic(() => import("./LoremIpsum"), { ssr: false, loading: Loading }),
  "slug-generator": dynamic(() => import("./SlugGenerator"), { ssr: false, loading: Loading }),
  "string-utilities": dynamic(() => import("./StringUtilities"), { ssr: false, loading: Loading }),

  // ── AI & LLM (Phase 2) ─────────────────────────────────────
  "token-counter": dynamic(() => import("./token-counter"), { ssr: false, loading: Loading }),
  "model-comparator": dynamic(() => import("./model-comparator"), { ssr: false, loading: Loading }),
  "prompt-formatter": dynamic(() => import("./prompt-formatter"), { ssr: false, loading: Loading }),
  "prompt-linter": dynamic(() => import("./prompt-linter"), { ssr: false, loading: Loading }),
  "json-schema-builder": dynamic(() => import("./json-schema-builder"), { ssr: false, loading: Loading }),
  "ai-cost-estimator": dynamic(() => import("./ai-cost-estimator"), { ssr: false, loading: Loading }),
  "image-to-base64": dynamic(() => import("./image-to-base64-ai"), { ssr: false, loading: Loading }),
  "text-similarity": dynamic(() => import("./tfidf-similarity"), { ssr: false, loading: Loading }),
  "ai-rules-generator": dynamic(() => import("./ai-rules-generator"), { ssr: false, loading: Loading }),
  "prompt-diff": dynamic(() => import("./prompt-diff"), { ssr: false, loading: Loading }),
};

export function ToolLoader({ slug }: { slug: string }) {
  const Component = registry[slug];
  if (!Component) {
    return (
      <div className="rounded-lg border border-border bg-surface p-6 text-sm text-muted">
        This tool is not available.
      </div>
    );
  }
  return <Component />;
}
