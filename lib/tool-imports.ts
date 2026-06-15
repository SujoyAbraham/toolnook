import type { ComponentType } from "react";

/**
 * Single source of truth mapping each tool slug to a dynamic importer.
 *
 * Framework-agnostic on purpose: the Next.js web app wraps each importer with
 * next/dynamic (see components/tools/ToolLoader.tsx), and the browser extension
 * wraps the same importers with React.lazy. Add a new tool here once and both
 * surfaces pick it up. Paths use the "@/" alias so both the Next build and the
 * extension's Vite build resolve them.
 */
export type ToolImporter = () => Promise<{ default: ComponentType }>;

export const toolImports: Record<string, ToolImporter> = {
  "jwt-inspector": () => import("@/components/tools/JwtInspector"),
  "regex-playground": () => import("@/components/tools/RegexPlayground"),
  "uuid-generator": () => import("@/components/tools/UuidGenerator"),
  "cron-builder": () => import("@/components/tools/CronBuilder"),
  "diff-checker": () => import("@/components/tools/DiffChecker"),
  "api-response-formatter": () => import("@/components/tools/ApiResponseFormatter"),
  "pdf-merge": () => import("@/components/tools/PdfMerge"),
  "pdf-split": () => import("@/components/tools/PdfSplit"),
  "image-to-pdf": () => import("@/components/tools/ImageToPdf"),
  "markdown-editor": () => import("@/components/tools/MarkdownEditor"),
  "word-counter": () => import("@/components/tools/WordCounter"),
  "json-yaml": () => import("@/components/tools/JsonYaml"),
  "json-csv": () => import("@/components/tools/JsonCsv"),
  base64: () => import("@/components/tools/Base64Tool"),
  "url-codec": () => import("@/components/tools/UrlCodec"),
  "color-converter": () => import("@/components/tools/ColorConverter"),
  "number-base-converter": () => import("@/components/tools/NumberBaseConverter"),
  "password-generator": () => import("@/components/tools/PasswordGenerator"),
  "password-strength-analyzer": () => import("@/components/tools/PasswordStrengthAnalyzer"),
  "hash-generator": () => import("@/components/tools/HashGenerator"),
  "csp-builder": () => import("@/components/tools/CspBuilder"),
  "loan-calculator": () => import("@/components/tools/LoanCalculator"),
  "expense-splitter": () => import("@/components/tools/ExpenseSplitter"),
  "invoice-generator": () => import("@/components/tools/InvoiceGenerator"),
  "tip-calculator": () => import("@/components/tools/TipCalculator"),
  "percentage-calculator": () => import("@/components/tools/PercentageCalculator"),
  "unit-converter": () => import("@/components/tools/UnitConverter"),
  "image-resizer": () => import("@/components/tools/ImageResizer"),
  "image-compressor": () => import("@/components/tools/ImageCompressor"),
  "image-converter": () => import("@/components/tools/ImageConverter"),
  "color-extractor": () => import("@/components/tools/ColorExtractor"),
  "favicon-generator": () => import("@/components/tools/FaviconGenerator"),
  "case-converter": () => import("@/components/tools/CaseConverter"),
  "lorem-ipsum": () => import("@/components/tools/LoremIpsum"),
  "slug-generator": () => import("@/components/tools/SlugGenerator"),
  "string-utilities": () => import("@/components/tools/StringUtilities"),
  "token-counter": () => import("@/components/tools/token-counter"),
  "model-comparator": () => import("@/components/tools/model-comparator"),
  "prompt-formatter": () => import("@/components/tools/prompt-formatter"),
  "prompt-linter": () => import("@/components/tools/prompt-linter"),
  "json-schema-builder": () => import("@/components/tools/json-schema-builder"),
  "ai-cost-estimator": () => import("@/components/tools/ai-cost-estimator"),
  "image-to-base64": () => import("@/components/tools/image-to-base64-ai"),
  "text-similarity": () => import("@/components/tools/tfidf-similarity"),
  "ai-rules-generator": () => import("@/components/tools/ai-rules-generator"),
  "prompt-diff": () => import("@/components/tools/prompt-diff"),
};
