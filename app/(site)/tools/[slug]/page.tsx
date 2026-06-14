import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Lock } from "lucide-react";
import { getCategory, getTool, visibleTools } from "@/lib/tools-registry";
import { getHiddenTools } from "@/lib/visibility";
import { Icon } from "@/components/ui/Icon";
import { ToolLoader } from "@/components/tools/ToolLoader";

export const dynamic = "force-static";
export const revalidate = 60;
// Only build pages for visible tools. Hidden or unknown slugs fall through to
// the standard Next.js 404 rather than rendering.
export const dynamicParams = false;

export async function generateStaticParams() {
  const hidden = await getHiddenTools();
  return visibleTools(hidden).map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tool = getTool(slug);
  if (!tool) return { title: "Tool not found" };
  return { title: tool.name, description: tool.description };
}

export default async function ToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = getTool(slug);
  if (!tool) notFound();

  const hidden = await getHiddenTools();
  if (hidden.includes(tool.slug)) notFound();

  const category = getCategory(tool.category);

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <nav className="mb-5 flex items-center gap-1.5 text-xs text-muted" aria-label="Breadcrumb">
        <Link href="/" className="transition-colors hover:text-primary">
          Home
        </Link>
        <ChevronRight size={12} />
        <Link href={`/#${tool.category}`} className="transition-colors hover:text-primary">
          {category?.label ?? tool.category}
        </Link>
        <ChevronRight size={12} />
        <span className="text-primary">{tool.name}</span>
      </nav>

      <header className="mb-5 flex items-start gap-4">
        <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-elevated text-accent">
          <Icon name={tool.icon} size={20} strokeWidth={1.75} />
        </span>
        <div>
          <h1 className="font-display text-2xl font-semibold text-primary">{tool.name}</h1>
          <p className="mt-1.5 text-sm leading-relaxed text-muted">{tool.description}</p>
        </div>
      </header>

      <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted">
        <Lock size={13} className="text-accent" />
        Runs entirely in your browser — your data never leaves this tab
      </div>

      <ToolLoader slug={tool.slug} />
    </div>
  );
}
