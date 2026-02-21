import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ORanKPILabelProps {
  variant?: "badge" | "banner" | "inline";
  className?: string;
}

export default function ORanKPILabel({ variant = "badge", className }: ORanKPILabelProps) {
  const tooltipText =
    "This KPI may be affected by RIC (RAN Intelligent Controller) policies and intelligent automation rules. Values may vary based on RIC decisions.";

  if (variant === "badge") {
    return (
      <span
        title={tooltipText}
        className={cn(
          "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 cursor-help",
          className
        )}
      >
        <AlertCircle className="w-3 h-3" />
        O-RAN
      </span>
    );
  }

  if (variant === "banner") {
    return (
      <div
        className={cn(
          "flex items-start gap-2 px-4 py-3 rounded-lg bg-purple-50 border border-purple-200",
          className
        )}
      >
        <AlertCircle className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-purple-900">O-RAN Affected KPI</p>
          <p className="text-xs text-purple-700 mt-1">{tooltipText}</p>
        </div>
      </div>
    );
  }

  // inline variant
  return (
    <span
      title={tooltipText}
      className={cn(
        "inline-flex items-center gap-1 text-xs text-purple-600 font-medium cursor-help",
        className
      )}
    >
      <AlertCircle className="w-3 h-3" />
      O-RAN-affected
    </span>
  );
}
