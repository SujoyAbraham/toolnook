"use client";

import Link from "next/link";
import { ArrowUpRight, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { categories, getToolsByCategory, tools as allTools, type Tool } from "@/lib/tools-registry";
import { useEffectiveHidden } from "@/lib/visibility-client";
import { Icon } from "@/components/ui/Icon";

function ToolCard({ tool }: { tool: Tool }) {
  return (
    <Link
      href={`/tools/${tool.slug}`}
      className="group relative flex flex-col gap-2 rounded-xl border border-border bg-surface p-4 transition-all hover:-translate-y-0.5 hover:border-accent/60 hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      <div className="flex items-center justify-between">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-elevated text-accent transition-colors group-hover:border-accent/40">
          <Icon name={tool.icon} size={17} strokeWidth={1.85} />
        </span>
        <ArrowUpRight
          size={15}
          className="text-muted opacity-0 transition-opacity group-hover:opacity-100"
        />
      </div>
      <span className="flex items-center gap-1.5 text-sm font-medium text-primary">
        {tool.name}
        {tool.isNew && (
          <span className="text-[9px] font-semibold uppercase tracking-wider text-accent">New</span>
        )}
      </span>
      <span className="text-xs leading-relaxed text-muted">{tool.description}</span>
    </Link>
  );
}

export function HomeTools({ hidden }: { hidden: string[] }) {
  const effectiveHidden = useEffectiveHidden(hidden);
  const hiddenSet = new Set(effectiveHidden);
  const isVisible = (slug: string) => !hiddenSet.has(slug);

  const visible = allTools.filter((t) => isVisible(t.slug));
  const total = visible.length;
  const popular = visible.filter((t) => t.isPopular).slice(0, 4);
  const newCount = visible.filter((t) => t.isNew).length;
  const groups = categories
    .map((category) => ({ category, items: getToolsByCategory(category.id).filter((t) => isVisible(t.slug)) }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 sm:py-16">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl border border-border bg-surface px-6 py-12 sm:px-10 sm:py-16">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-60 blur-3xl"
          style={{ background: "radial-gradient(circle, var(--accent) 0%, transparent 70%)" }}
        />
        <div className="relative max-w-2xl">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-elevated px-3 py-1 text-xs font-medium text-muted">
            <Sparkles size={13} className="text-accent" />
            {newCount} new AI &amp; LLM tools
          </span>
          <h1 className="font-display mt-5 text-4xl font-bold text-primary sm:text-5xl">
            A quiet workspace of professional tools.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
            {total} focused utilities for developers and writers. Everything runs in your
            browser — nothing is uploaded, nothing is stored.
          </p>

          {/* Stat strip */}
          <div className="mt-7 flex flex-wrap gap-2.5">
            <Stat icon={Zap} label={`${total} tools`} />
            <Stat icon={ShieldCheck} label="100% client-side" />
            <Stat icon={Sparkles} label="No sign-up" />
          </div>
        </div>
      </section>

      {/* Popular */}
      {popular.length > 0 && (
        <section id="popular" className="mt-14 scroll-mt-20">
          <SectionHeading label="Popular" count={popular.length} />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {popular.map((tool) => (
              <ToolCard key={tool.slug} tool={tool} />
            ))}
          </div>
        </section>
      )}

      {/* Category quick nav */}
      <section className="mt-14 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
        {groups.map(({ category, items }) => (
          <a
            key={category.id}
            href={`#${category.id}`}
            className="group flex items-center gap-3 rounded-xl border border-border bg-surface p-3.5 transition-colors hover:border-accent/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-elevated text-accent">
              <Icon name={category.icon} size={17} strokeWidth={1.85} />
            </span>
            <span className="min-w-0">
              <span className="flex items-center gap-1.5 text-sm font-medium text-primary">
                {category.label}
                {category.isNew && (
                  <span className="text-[9px] font-semibold uppercase tracking-wider text-accent">
                    New
                  </span>
                )}
              </span>
              <span className="text-xs text-muted">{items.length} tools</span>
            </span>
          </a>
        ))}
      </section>

      {/* Full directory */}
      <div className="mt-16 space-y-14">
        {groups.map(({ category, items }) => (
          <section key={category.id} id={category.id} className="scroll-mt-20">
            <SectionHeading
              icon={category.icon}
              label={category.label}
              description={category.description}
              count={items.length}
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((tool) => (
                <ToolCard key={tool.slug} tool={tool} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function Stat({ icon: I, label }: { icon: typeof Zap; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-lg border border-border bg-base px-3 py-1.5 text-sm font-medium text-primary">
      <I size={15} className="text-accent" />
      {label}
    </span>
  );
}

function SectionHeading({
  icon,
  label,
  description,
  count,
}: {
  icon?: string;
  label: string;
  description?: string;
  count: number;
}) {
  return (
    <div className="mb-4 flex items-center gap-3">
      {icon && (
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-elevated text-accent">
          <Icon name={icon} size={16} strokeWidth={1.85} />
        </span>
      )}
      <div className="flex-1">
        <h2 className="font-display flex items-center gap-2 text-base font-semibold text-primary">
          {label}
          <span className="text-xs font-normal tabular-nums text-muted">{count}</span>
        </h2>
        {description && <p className="text-xs text-muted">{description}</p>}
      </div>
    </div>
  );
}
