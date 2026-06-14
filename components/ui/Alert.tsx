import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import { cn } from "@/lib/utils";

type AlertVariant = "error" | "success" | "info";

type AlertProps = {
  variant?: AlertVariant;
  children: React.ReactNode;
  className?: string;
};

const config: Record<AlertVariant, { icon: typeof Info; classes: string }> = {
  error: {
    icon: AlertCircle,
    classes: "border-error/40 bg-error/10 text-error",
  },
  success: {
    icon: CheckCircle2,
    classes: "border-success/40 bg-success/10 text-success",
  },
  info: {
    icon: Info,
    classes: "border-accent/40 bg-accent/10 text-accent",
  },
};

export function Alert({ variant = "info", children, className }: AlertProps) {
  const { icon: IconCmp, classes } = config[variant];
  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-2 rounded-lg border px-3 py-2 text-sm",
        classes,
        className,
      )}
    >
      <IconCmp size={16} className="mt-0.5 shrink-0" />
      <span className="break-words">{children}</span>
    </div>
  );
}
