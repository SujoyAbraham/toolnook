export type Tool = {
  slug: string;
  name: string;
  description: string;
  category: string;
  icon: string; // Lucide icon name, PascalCase
  keywords: string[];
  isNew?: boolean;
  isPopular?: boolean;
};

export type Category = {
  id: string;
  label: string;
  icon: string;
  description: string;
  isNew?: boolean;
};

export const categories: Category[] = [
  {
    id: "developer",
    label: "Developer",
    icon: "Code2",
    description: "JWTs, regex, diffs and everyday coding helpers.",
  },
  {
    id: "documents",
    label: "Documents",
    icon: "FileText",
    description: "PDF, Markdown and writing utilities.",
  },
  {
    id: "conversion",
    label: "Conversion",
    icon: "Replace",
    description: "Translate between data formats and encodings.",
  },
  {
    id: "security",
    label: "Security",
    icon: "Shield",
    description: "Passwords, hashing and content security policies.",
  },
  {
    id: "finance",
    label: "Finance",
    icon: "Wallet",
    description: "Loans, invoices, splits and quick math.",
  },
  {
    id: "image",
    label: "Image",
    icon: "Image",
    description: "Resize, compress, convert and inspect images.",
  },
  {
    id: "text",
    label: "Text",
    icon: "Type",
    description: "Transform, generate and clean up text.",
  },
  {
    id: "ai-llm",
    label: "AI & LLM",
    icon: "Bot",
    description: "Tokens, prompts, model pricing and LLM tooling.",
    isNew: true,
  },
];

export const tools: Tool[] = [
  // ── Developer ──────────────────────────────────────────────
  {
    slug: "jwt-inspector",
    name: "JWT Inspector",
    description: "Decode a JWT into header, payload and signature with expiry highlighting.",
    category: "developer",
    icon: "KeyRound",
    keywords: ["jwt", "token", "decode", "json web token", "auth", "bearer"],
    isPopular: true,
  },
  {
    slug: "regex-playground",
    name: "Regex Playground",
    description: "Test regular expressions live with match highlighting and capture groups.",
    category: "developer",
    icon: "Regex",
    keywords: ["regex", "regular expression", "pattern", "match", "test"],
    isPopular: true,
  },
  {
    slug: "uuid-generator",
    name: "UUID Generator",
    description: "Generate UUID v4 and NanoID identifiers in bulk.",
    category: "developer",
    icon: "Fingerprint",
    keywords: ["uuid", "guid", "nanoid", "id", "identifier", "random"],
  },
  {
    slug: "cron-builder",
    name: "Cron Builder",
    description: "Build cron expressions with a human-readable schedule and next run times.",
    category: "developer",
    icon: "Clock",
    keywords: ["cron", "schedule", "crontab", "job", "timer"],
  },
  {
    slug: "diff-checker",
    name: "Diff Checker",
    description: "Compare two texts line by line with added and removed highlighting.",
    category: "developer",
    icon: "GitCompare",
    keywords: ["diff", "compare", "text", "difference", "changes"],
  },
  {
    slug: "api-response-formatter",
    name: "API Response Formatter",
    description: "Pretty-print and minify JSON or XML with syntax highlighting.",
    category: "developer",
    icon: "Braces",
    keywords: ["json", "xml", "format", "pretty", "minify", "beautify", "api"],
  },

  // ── Documents ──────────────────────────────────────────────
  {
    slug: "pdf-merge",
    name: "PDF Merge",
    description: "Combine multiple PDFs into one, reordering pages before merging.",
    category: "documents",
    icon: "Combine",
    keywords: ["pdf", "merge", "combine", "join", "documents"],
    isPopular: true,
  },
  {
    slug: "pdf-split",
    name: "PDF Split",
    description: "Extract selected page ranges from a PDF into a new file.",
    category: "documents",
    icon: "Scissors",
    keywords: ["pdf", "split", "extract", "pages", "range"],
  },
  {
    slug: "image-to-pdf",
    name: "Image to PDF",
    description: "Turn multiple images into a single ordered PDF document.",
    category: "documents",
    icon: "FileImage",
    keywords: ["image", "pdf", "convert", "png", "jpg", "photo"],
  },
  {
    slug: "markdown-editor",
    name: "Markdown Editor",
    description: "Write Markdown with a live HTML preview and export.",
    category: "documents",
    icon: "FileText",
    keywords: ["markdown", "md", "editor", "preview", "html"],
  },
  {
    slug: "word-counter",
    name: "Word Counter",
    description: "Count words, characters, reading time and top word frequencies.",
    category: "documents",
    icon: "AlignLeft",
    keywords: ["word", "count", "character", "reading time", "text statistics"],
  },

  // ── Conversion ─────────────────────────────────────────────
  {
    slug: "json-yaml",
    name: "JSON ⇄ YAML",
    description: "Convert between JSON and YAML in both directions.",
    category: "conversion",
    icon: "FileJson",
    keywords: ["json", "yaml", "convert", "config"],
  },
  {
    slug: "json-csv",
    name: "JSON ⇄ CSV",
    description: "Convert a JSON array to CSV and back with auto headers.",
    category: "conversion",
    icon: "Table",
    keywords: ["json", "csv", "convert", "spreadsheet", "table"],
  },
  {
    slug: "base64",
    name: "Base64 Encoder",
    description: "Encode and decode text or files to and from Base64.",
    category: "conversion",
    icon: "Binary",
    keywords: ["base64", "encode", "decode", "file", "text"],
  },
  {
    slug: "url-codec",
    name: "URL Encoder",
    description: "Percent-encode and decode URLs with a breakdown of changes.",
    category: "conversion",
    icon: "Link",
    keywords: ["url", "encode", "decode", "percent", "uri", "escape"],
  },
  {
    slug: "color-converter",
    name: "Color Converter",
    description: "Convert colors between HEX, RGB, HSL and CMYK.",
    category: "conversion",
    icon: "Palette",
    keywords: ["color", "hex", "rgb", "hsl", "cmyk", "convert"],
  },
  {
    slug: "number-base-converter",
    name: "Number Base Converter",
    description: "Convert numbers between decimal, binary, hex and octal.",
    category: "conversion",
    icon: "Hash",
    keywords: ["number", "base", "binary", "hex", "octal", "decimal"],
  },

  // ── Security ───────────────────────────────────────────────
  {
    slug: "password-generator",
    name: "Password Generator",
    description: "Generate strong passwords with entropy estimates and bulk mode.",
    category: "security",
    icon: "KeySquare",
    keywords: ["password", "generate", "random", "secure", "entropy"],
    isPopular: true,
  },
  {
    slug: "password-strength-analyzer",
    name: "Password Strength Analyzer",
    description: "Estimate entropy, crack time and weaknesses of a password.",
    category: "security",
    icon: "ShieldCheck",
    keywords: ["password", "strength", "entropy", "crack time", "analyze"],
  },
  {
    slug: "hash-generator",
    name: "Hash Generator",
    description: "Compute SHA-256, SHA-512 and MD5 hashes of text or files.",
    category: "security",
    icon: "Hash",
    keywords: ["hash", "sha256", "sha512", "md5", "checksum", "digest"],
  },
  {
    slug: "csp-builder",
    name: "CSP Builder",
    description: "Build a Content-Security-Policy header with a live preview.",
    category: "security",
    icon: "ShieldAlert",
    keywords: ["csp", "content security policy", "header", "security"],
  },

  // ── Finance ────────────────────────────────────────────────
  {
    slug: "loan-calculator",
    name: "Loan Calculator",
    description: "Calculate EMI, total interest and a full amortization schedule.",
    category: "finance",
    icon: "Landmark",
    keywords: ["loan", "emi", "interest", "mortgage", "amortization"],
  },
  {
    slug: "expense-splitter",
    name: "Expense Splitter",
    description: "Split shared expenses and compute minimal settlement transfers.",
    category: "finance",
    icon: "Users",
    keywords: ["expense", "split", "settle", "group", "bill", "debt"],
  },
  {
    slug: "invoice-generator",
    name: "Invoice Generator",
    description: "Create an invoice with live preview and download it as a PDF.",
    category: "finance",
    icon: "ReceiptText",
    keywords: ["invoice", "bill", "pdf", "receipt", "tax"],
  },
  {
    slug: "tip-calculator",
    name: "Tip Calculator",
    description: "Calculate tip, total and per-person amounts instantly.",
    category: "finance",
    icon: "Coins",
    keywords: ["tip", "gratuity", "bill", "split", "restaurant"],
  },
  {
    slug: "percentage-calculator",
    name: "Percentage Calculator",
    description: "Five percentage modes for everyday math.",
    category: "finance",
    icon: "Percent",
    keywords: ["percentage", "percent", "increase", "decrease", "math"],
  },
  {
    slug: "unit-converter",
    name: "Unit Converter",
    description: "Convert length, weight, temperature, speed, area and data.",
    category: "finance",
    icon: "Ruler",
    keywords: ["unit", "convert", "length", "weight", "temperature", "metric"],
  },

  // ── Image ──────────────────────────────────────────────────
  {
    slug: "image-resizer",
    name: "Image Resizer",
    description: "Resize images with optional aspect-ratio lock and export.",
    category: "image",
    icon: "Scaling",
    keywords: ["image", "resize", "scale", "dimensions", "png", "jpeg"],
  },
  {
    slug: "image-compressor",
    name: "Image Compressor",
    description: "Compress images and compare original vs compressed size.",
    category: "image",
    icon: "FileArchive",
    keywords: ["image", "compress", "optimize", "size", "quality"],
  },
  {
    slug: "image-converter",
    name: "Image Converter",
    description: "Convert images between PNG, JPEG, WebP and BMP.",
    category: "image",
    icon: "Image",
    keywords: ["image", "convert", "png", "jpeg", "webp", "bmp", "format"],
  },
  {
    slug: "color-extractor",
    name: "Color Extractor",
    description: "Extract the dominant colors from an uploaded image.",
    category: "image",
    icon: "Pipette",
    keywords: ["color", "extract", "palette", "dominant", "image"],
  },
  {
    slug: "favicon-generator",
    name: "Favicon Generator",
    description: "Generate favicon sizes from one image and download a ZIP.",
    category: "image",
    icon: "Star",
    keywords: ["favicon", "icon", "generate", "zip", "apple touch"],
  },

  // ── Text ───────────────────────────────────────────────────
  {
    slug: "case-converter",
    name: "Case Converter",
    description: "Convert text between eight common casing styles.",
    category: "text",
    icon: "CaseSensitive",
    keywords: ["case", "uppercase", "lowercase", "camel", "snake", "kebab", "title"],
  },
  {
    slug: "lorem-ipsum",
    name: "Lorem Ipsum",
    description: "Generate placeholder words, sentences or paragraphs.",
    category: "text",
    icon: "Pilcrow",
    keywords: ["lorem", "ipsum", "placeholder", "dummy text", "filler"],
  },
  {
    slug: "slug-generator",
    name: "Slug Generator",
    description: "Turn any phrase into a clean, URL-friendly slug.",
    category: "text",
    icon: "Link2",
    keywords: ["slug", "url", "permalink", "seo", "kebab"],
  },
  {
    slug: "string-utilities",
    name: "String Utilities",
    description: "Trim, reverse, deduplicate and sort lines of text.",
    category: "text",
    icon: "Wrench",
    keywords: ["string", "trim", "reverse", "dedupe", "sort", "lines"],
  },

  // ── AI & LLM ───────────────────────────────────────────────
  {
    slug: "token-counter",
    name: "Token Counter & Cost",
    description: "Count tokens and estimate API cost live across any model.",
    category: "ai-llm",
    icon: "Calculator",
    keywords: ["token", "tokenizer", "cost", "gpt", "bpe", "pricing", "llm"],
    isNew: true,
    isPopular: true,
  },
  {
    slug: "model-comparator",
    name: "LLM Model Comparator",
    description: "Filter and sort every model by price, context and capability.",
    category: "ai-llm",
    icon: "Scale",
    keywords: ["model", "compare", "pricing", "context", "vision", "openrouter", "llm"],
    isNew: true,
  },
  {
    slug: "prompt-formatter",
    name: "Prompt Formatter",
    description: "Convert prompts between Claude XML, OpenAI, ChatML and Llama formats.",
    category: "ai-llm",
    icon: "Sparkles",
    keywords: ["prompt", "format", "chatml", "xml", "messages", "llama", "convert"],
    isNew: true,
  },
  {
    slug: "prompt-linter",
    name: "System Prompt Linter",
    description: "Score a system prompt and surface issues with rule-based checks.",
    category: "ai-llm",
    icon: "SpellCheck",
    keywords: ["prompt", "lint", "system", "quality", "score", "review"],
    isNew: true,
  },
  {
    slug: "json-schema-builder",
    name: "JSON Schema Builder",
    description: "Build LLM tool-calling schemas in OpenAI and Anthropic formats.",
    category: "ai-llm",
    icon: "FileCode2",
    keywords: ["json", "schema", "tool", "function", "calling", "openai", "anthropic"],
    isNew: true,
  },
  {
    slug: "ai-cost-estimator",
    name: "AI API Cost Estimator",
    description: "Project AI spend per day, month and year with cheaper alternatives.",
    category: "ai-llm",
    icon: "PiggyBank",
    keywords: ["cost", "estimate", "budget", "api", "pricing", "spend", "llm"],
    isNew: true,
  },
  {
    slug: "image-to-base64",
    name: "Image to Base64 (Vision)",
    description: "Format an image as a vision-API payload for OpenAI or Anthropic.",
    category: "ai-llm",
    icon: "ImagePlus",
    keywords: ["image", "base64", "vision", "openai", "anthropic", "data uri"],
    isNew: true,
  },
  {
    slug: "text-similarity",
    name: "Text Similarity Analyzer",
    description: "Compare texts with a TF-IDF cosine similarity matrix in the browser.",
    category: "ai-llm",
    icon: "Network",
    keywords: ["similarity", "tfidf", "cosine", "compare", "text", "embedding"],
    isNew: true,
  },
  {
    slug: "ai-rules-generator",
    name: "AI Rules File Generator",
    description: "Generate CLAUDE.md, .cursorrules, .windsurfrules and Copilot files.",
    category: "ai-llm",
    icon: "ScrollText",
    keywords: ["claude.md", "cursorrules", "windsurf", "copilot", "rules", "config"],
    isNew: true,
  },
  {
    slug: "prompt-diff",
    name: "Prompt Version Diff",
    description: "Diff two prompt versions with token deltas and structural changes.",
    category: "ai-llm",
    icon: "FileDiff",
    keywords: ["prompt", "diff", "version", "compare", "changes", "token"],
    isNew: true,
  },
];

export function getTool(slug: string): Tool | undefined {
  return tools.find((t) => t.slug === slug);
}

export function getToolsByCategory(categoryId: string): Tool[] {
  return tools.filter((t) => t.category === categoryId);
}

export function getCategory(id: string): Category | undefined {
  return categories.find((c) => c.id === id);
}

/** Tools that are not in the hidden list, preserving registry order. */
export function visibleTools(hidden: string[]): Tool[] {
  const hiddenSet = new Set(hidden);
  return tools.filter((t) => !hiddenSet.has(t.slug));
}
