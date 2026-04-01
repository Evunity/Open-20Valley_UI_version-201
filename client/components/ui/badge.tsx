import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 typo-badge transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        success:
          "border-transparent bg-[hsl(var(--success-surface))] text-[hsl(var(--success-foreground))] hover:bg-[hsl(var(--success-surface))/0.9]",
        warning:
          "border-transparent bg-[hsl(var(--warning-surface))] text-[hsl(var(--warning-foreground))] hover:bg-[hsl(var(--warning-surface))/0.9]",
        info: "border-transparent bg-[hsl(var(--info-surface))] text-[hsl(var(--info-foreground))] hover:bg-[hsl(var(--info-surface))/0.9]",
        low: "border-[hsl(var(--severity-low-border))] bg-[hsl(var(--severity-low-bg))] text-[hsl(var(--severity-low-fg))]",
        medium:
          "border-[hsl(var(--severity-medium-border))] bg-[hsl(var(--severity-medium-bg))] text-[hsl(var(--severity-medium-fg))]",
        high: "border-[hsl(var(--severity-high-border))] bg-[hsl(var(--severity-high-bg))] text-[hsl(var(--severity-high-fg))]",
        critical:
          "border-[hsl(var(--severity-critical-border))] bg-[hsl(var(--severity-critical-bg))] text-[hsl(var(--severity-critical-fg))]",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground border-border",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
