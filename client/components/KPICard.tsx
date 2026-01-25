import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface KPICardProps {
  label: string;
  value: string | number;
  unit?: string;
  change?: number; // percentage change
  status: "healthy" | "degraded" | "critical" | "normal";
  icon: LucideIcon;
  priority?: "Critical" | "High" | "Medium" | "Low";
  comparison?: string; // e.g., "vs previous period"
}

export default function KPICard({
  label,
  value,
  unit,
  change,
  status,
  icon: Icon,
  priority,
  comparison,
}: KPICardProps) {
  const getStatusColor = (s: string) => {
    switch (s) {
      case "healthy":
        return "border-status-healthy/20 bg-status-healthy/5";
      case "degraded":
        return "border-status-degraded/20 bg-status-degraded/5";
      case "critical":
        return "border-status-critical/20 bg-status-critical/5";
      default:
        return "border-border bg-card";
    }
  };

  const getStatusTextColor = (s: string) => {
    switch (s) {
      case "healthy":
        return "text-status-healthy";
      case "degraded":
        return "text-status-degraded";
      case "critical":
        return "text-status-critical";
      default:
        return "text-foreground";
    }
  };

  const getIconBgColor = (s: string) => {
    switch (s) {
      case "healthy":
        return "bg-status-healthy/10";
      case "degraded":
        return "bg-status-degraded/10";
      case "critical":
        return "bg-status-critical/10";
      default:
        return "bg-muted";
    }
  };

  const getPriorityBorderColor = (p?: string) => {
    switch (p) {
      case "Critical":
        return "border-l-4 border-l-status-critical";
      case "High":
        return "border-l-4 border-l-status-degraded";
      case "Medium":
        return "border-l-4 border-l-yellow-500";
      case "Low":
        return "border-l-4 border-l-status-healthy";
      default:
        return "";
    }
  };

  const isPositiveChange = change && change >= 0;

  return (
    <div
      className={cn(
        "p-6 rounded-xl border transition-all duration-300 hover:shadow-lg hover:border-primary/50",
        getStatusColor(status),
        getPriorityBorderColor(priority)
      )}
    >
      {/* Header with Icon and Priority */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className={cn("p-2.5 rounded-lg w-fit", getIconBgColor(status))}>
          <Icon className={cn("w-5 h-5", getStatusTextColor(status))} />
        </div>

        {priority && (
          <span
            className={cn(
              "text-xs font-bold px-2.5 py-1.5 rounded-lg whitespace-nowrap shadow-sm",
              priority === "Critical"
                ? "bg-status-critical text-white"
                : priority === "High"
                  ? "bg-status-degraded text-white"
                  : priority === "Medium"
                    ? "bg-yellow-500 text-white"
                    : "bg-status-healthy text-white"
            )}
          >
            {priority} Priority
          </span>
        )}
      </div>

      {/* Label */}
      <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
        {label}
      </p>

      {/* Value */}
      <div className="mb-3">
        <p className={cn("text-3xl font-bold", getStatusTextColor(status))}>
          {value}
          {unit && <span className="text-lg text-muted-foreground ml-1">{unit}</span>}
        </p>
      </div>

      {/* Change vs Period */}
      {change !== undefined && (
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold",
              isPositiveChange
                ? "bg-status-healthy/20 text-status-healthy"
                : "bg-status-critical/20 text-status-critical"
            )}
          >
            {isPositiveChange ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {isPositiveChange ? "+" : ""}{change.toFixed(2)}%
          </div>
          {comparison && (
            <span className="text-xs text-muted-foreground">{comparison}</span>
          )}
        </div>
      )}
    </div>
  );
}
