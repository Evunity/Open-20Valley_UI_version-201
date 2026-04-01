import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { ReactNode } from "react";

export type SeverityLevel = "low" | "medium" | "high" | "critical";

const severityVariantMap: Record<SeverityLevel, "low" | "medium" | "high" | "critical"> = {
  low: "low",
  medium: "medium",
  high: "high",
  critical: "critical",
};

interface SeverityBadgeProps {
  severity: SeverityLevel | string;
  className?: string;
  children?: ReactNode;
}

export function SeverityBadge({ severity, className, children }: SeverityBadgeProps) {
  const normalized = severity.toLowerCase() as SeverityLevel;
  const variant = severityVariantMap[normalized] ?? "medium";
  const label = children ?? severity;

  return (
    <Badge
      variant={variant}
      className={cn("px-2.5 py-1 rounded-md text-[0.72rem] font-semibold tracking-[0.01em]", className)}
    >
      {label}
    </Badge>
  );
}
