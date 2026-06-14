import { cn } from "@/lib/utils";

/** Two-column layout (input | output) that stacks on mobile. */
export function TwoCol({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grid grid-cols-1 gap-4 lg:grid-cols-2", className)}>{children}</div>
  );
}
