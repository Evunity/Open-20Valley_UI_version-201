import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const iconButtonVariants = cva(
  "inline-flex h-9 w-9 items-center justify-center rounded-md border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-45 [&_svg]:h-4 [&_svg]:w-4",
  {
    variants: {
      variant: {
        default: "bg-card text-foreground border-border hover:bg-muted/70",
        active: "bg-accent/80 text-accent-foreground border-accent/60",
        success: "bg-[hsl(var(--success-surface))] text-[hsl(var(--success-foreground))] border-[hsl(var(--success-border))] hover:bg-[hsl(var(--success-surface))/0.85]",
        warning: "bg-[hsl(var(--warning-surface))] text-[hsl(var(--warning-foreground))] border-[hsl(var(--warning-border))] hover:bg-[hsl(var(--warning-surface))/0.85]",
        destructive:
          "bg-[hsl(var(--destructive)/0.2)] text-destructive-foreground border-[hsl(var(--destructive)/0.42)] hover:bg-[hsl(var(--destructive)/0.3)]",
      },
      size: {
        default: "h-9 w-9",
        sm: "h-8 w-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof iconButtonVariants> {}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(iconButtonVariants({ variant, size }), className)}
      {...props}
    />
  ),
);

IconButton.displayName = "IconButton";
