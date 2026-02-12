import { AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { SmartInsight } from "@/utils/reportsData";

interface SmartInsightsPanelProps {
  insights: SmartInsight[];
  onInsightClick?: (insight: SmartInsight) => void;
}

export default function SmartInsightsPanel({
  insights,
  onInsightClick,
}: SmartInsightsPanelProps) {
  if (insights.length === 0) {
    return (
      <div className="card-elevated rounded-xl border border-border/50 p-8 text-center">
        <div className="flex justify-center mb-3">
          <Info className="w-8 h-8 text-muted-foreground/50" />
        </div>
        <p className="text-sm text-muted-foreground">
          No notable reporting patterns detected.
        </p>
      </div>
    );
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return {
          bg: "bg-red-500/10",
          border: "border-red-500/30",
          badge: "bg-red-500 text-white",
          icon: "text-red-600",
        };
      case "medium":
        return {
          bg: "bg-orange-500/10",
          border: "border-orange-500/30",
          badge: "bg-orange-500 text-white",
          icon: "text-orange-600",
        };
      case "low":
        return {
          bg: "bg-blue-500/10",
          border: "border-blue-500/30",
          badge: "bg-blue-500 text-white",
          icon: "text-blue-600",
        };
      default:
        return {
          bg: "bg-gray-500/10",
          border: "border-gray-500/30",
          badge: "bg-gray-500 text-white",
          icon: "text-gray-600",
        };
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <AlertCircle className="w-5 h-5 text-foreground" />
        <h3 className="text-lg font-bold text-foreground">Smart Insights</h3>
        {insights.length > 0 && (
          <span className="ml-auto text-xs text-muted-foreground">
            {insights.length} insight{insights.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {insights.map((insight) => {
          const colors = getPriorityColor(insight.priority);
          return (
            <div
              key={insight.id}
              onClick={() => onInsightClick?.(insight)}
              className={cn(
                "card-elevated rounded-xl border p-4 cursor-pointer transition-all hover:shadow-md group",
                colors.bg,
                colors.border
              )}
              title={insight.tooltip}
            >
              <div className="flex items-start gap-3">
                <div className={cn(
                  "w-2 h-2 rounded-full flex-shrink-0 mt-1.5",
                  colors.icon
                )} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground leading-tight group-hover:underline">
                    {insight.message}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {insight.timestamp}
                  </p>
                </div>
                <span className={cn(
                  "px-2 py-0.5 rounded text-xs font-semibold flex-shrink-0",
                  colors.badge
                )}>
                  {insight.priority}
                </span>
              </div>
              {insight.tooltip && (
                <div className="mt-2 pt-2 border-t border-border/30 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-xs text-muted-foreground italic">
                    ℹ️ {insight.tooltip}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
