import { SeverityBadge, type SeverityLevel } from "@/components/ui/severity-badge";
import { cn } from "@/lib/utils";

interface PriorityChipProps {
  priority: SeverityLevel | string;
  className?: string;
  showSuffix?: boolean;
}

export function PriorityChip({ priority, className, showSuffix = false }: PriorityChipProps) {
  return (
    <SeverityBadge severity={priority} className={cn("whitespace-nowrap shadow-sm", className)}>
      {priority}
      {showSuffix ? " Priority" : ""}
    </SeverityBadge>
  );
}
