import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const statusPillVariants = cva(
  "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold tabular-nums",
  {
    variants: {
      tone: {
        success:
          "bg-[hsl(var(--status-success-bg))] text-[hsl(var(--status-success-fg))] border-[hsl(var(--status-success-fg)/0.25)]",
        danger:
          "bg-[hsl(var(--status-danger-bg))] text-[hsl(var(--status-danger-fg))] border-[hsl(var(--status-danger-fg)/0.25)]",
        neutral:
          "bg-[hsl(var(--surface-muted))] text-[hsl(var(--fg-secondary))] border-border",
      },
    },
    defaultVariants: {
      tone: "neutral",
    },
  },
);

export interface StatusPillProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof statusPillVariants> {}

export function StatusPill({ className, tone, ...props }: StatusPillProps) {
  return <span className={cn(statusPillVariants({ tone }), className)} {...props} />;
}
