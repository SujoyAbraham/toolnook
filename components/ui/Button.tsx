"use client";

import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

const variants: Record<Variant, string> = {
  primary: "bg-ink text-ink-contrast hover:opacity-90 disabled:opacity-50 disabled:pointer-events-none",
  secondary:
    "border border-border bg-surface text-primary hover:bg-elevated disabled:opacity-50 disabled:pointer-events-none",
  ghost: "text-muted hover:bg-elevated hover:text-primary disabled:opacity-50 disabled:pointer-events-none",
  danger: "bg-error text-white hover:opacity-90 disabled:opacity-50 disabled:pointer-events-none",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-9 px-4 text-sm",
  lg: "h-11 px-6 text-base",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", className, type = "button", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-base",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
});
