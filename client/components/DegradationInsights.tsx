import { AlertCircle, AlertTriangle, TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DetectionInsight } from "@/utils/analyticsData";
import { PriorityChip } from "@/components/ui/priority-chip";

interface DegradationInsightsProps {
  insights: DetectionInsight[];
}

export default function DegradationInsights({ insights }: DegradationInsightsProps) {
  if (!insights || insights.length === 0) {
    return null;
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Critical":
        return "border-[hsl(var(--severity-critical-border))] bg-[hsl(var(--severity-critical-surface))] text-[hsl(var(--severity-critical-fg))]";
      case "High":
        return "border-[hsl(var(--severity-high-border))] bg-[hsl(var(--severity-high-surface))] text-[hsl(var(--severity-high-fg))]";
      case "Medium":
        return "border-[hsl(var(--severity-medium-border))] bg-[hsl(var(--severity-medium-surface))] text-[hsl(var(--severity-medium-fg))]";
      default:
        return "border-border/30 bg-[hsl(var(--surface))] text-[hsl(var(--fg-primary))]";
    }
  };

  const getSeverityTextColor = (severity: string) => {
    switch (severity) {
      case "Critical":
        return "text-[hsl(var(--severity-critical-fg))]";
      case "High":
        return "text-[hsl(var(--severity-high-fg))]";
      case "Medium":
        return "text-[hsl(var(--severity-medium-fg))]";
      default:
        return "text-[hsl(var(--fg-primary))]";
    }
  };

  const getIconSurface = (severity: string) => {
    switch (severity) {
      case "Critical":
        return "bg-[hsl(var(--severity-critical-bg))]";
      case "High":
        return "bg-[hsl(var(--severity-high-bg))]";
      case "Medium":
        return "bg-[hsl(var(--severity-medium-bg))]";
      default:
        return "bg-[hsl(var(--surface-muted))]";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "sudden_degradation":
        return <TrendingDown className="w-5 h-5" />;
      case "ongoing_degradation":
        return <AlertTriangle className="w-5 h-5" />;
      case "recovery":
        return <TrendingUp className="w-5 h-5" />;
      default:
        return <AlertCircle className="w-5 h-5" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "sudden_degradation":
        return "Sudden Degradation";
      case "ongoing_degradation":
        return "Ongoing Degradation";
      case "recovery":
        return "Recovery";
      case "performance_gap":
        return "Performance Gap";
      default:
        return "Alert";
    }
  };

  const formatTimestamp = (iso: string) => {
    const date = new Date(iso);
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${month}/${day} ${hours}:${minutes}`;
  };

  return (
    <div className="space-y-3">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">Performance Insights</h2>
        <p className="text-sm text-muted-foreground">
          {insights.length} detection{insights.length !== 1 ? "s" : ""} in current view
        </p>
      </div>

      {insights.map((insight) => (
        <div
          key={insight.id}
          className={cn(
            "p-4 rounded-lg border transition-all duration-200 hover:shadow-md shadow-sm",
            getSeverityColor(insight.severity)
          )}
        >
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div
              className={cn(
                "flex-shrink-0 p-2 rounded-lg",
                getIconSurface(insight.severity)
              )}
            >
              <div className={getSeverityTextColor(insight.severity)}>
                {getTypeIcon(insight.type)}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3
                      className={cn(
                        "text-sm font-semibold",
                        getSeverityTextColor(insight.severity)
                      )}
                    >
                      {insight.title}
                    </h3>
                    <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground">
                      {getTypeLabel(insight.type)}
                    </span>
                  </div>
                  <p className="text-sm text-current/80 mt-2">{insight.description}</p>
                </div>
                    <PriorityChip priority={insight.severity} className="flex-shrink-0" />
                  </div>

              {/* Metadata */}
              <div className="flex items-center gap-4 text-xs text-current/75 mt-3 pt-3 border-t border-current/15">
                <span>{formatTimestamp(insight.timestamp)}</span>
                {insight.affectedFilters.length > 0 && (
                  <>
                    <span className="text-current/40">•</span>
                    <span className="flex items-center gap-1">
                      Affected:{" "}
                      <span className="font-medium text-current">
                        {insight.affectedFilters.join(", ")}
                      </span>
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
