import { AlertTriangle, CheckCircle, AlertCircle, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { VoiceBreakdown } from "@/utils/analyticsData";

interface SegmentationSummaryProps {
  data: Record<string, VoiceBreakdown[]>;
  dimension: "Vendor" | "Technology" | "Region" | "Cluster";
}

export default function SegmentationSummary({ data, dimension }: SegmentationSummaryProps) {
  // Calculate metrics for each category
  const categoryMetrics = Object.entries(data).map(([category, items]) => {
    if (!items || items.length === 0) {
      return {
        category,
        count: 0,
        avgSuccessRate: 0,
        avgDropRate: 0,
        avgStability: 0,
        totalCalls: 0,
      };
    }

    const avgSuccessRate =
      items.reduce((sum, item) => sum + item.call_success_rate, 0) / items.length;
    const avgDropRate = items.reduce((sum, item) => sum + item.drop_rate, 0) / items.length;
    const avgStability = items.reduce((sum, item) => sum + item.call_stability, 0) / items.length;
    const totalCalls = items.reduce((sum, item) => sum + item.count, 0);

    return {
      category,
      count: items.length,
      avgSuccessRate,
      avgDropRate,
      avgStability,
      totalCalls,
    };
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "High quality":
        return {
          bg: "bg-status-healthy/5",
          border: "border-status-healthy/30",
          text: "text-status-healthy",
          icon: CheckCircle,
        };
      case "Acceptable":
        return {
          bg: "bg-yellow-50",
          border: "border-yellow-200/30",
          text: "text-yellow-700",
          icon: TrendingUp,
        };
      case "Degraded":
        return {
          bg: "bg-status-degraded/5",
          border: "border-status-degraded/30",
          text: "text-status-degraded",
          icon: AlertCircle,
        };
      case "Critical":
        return {
          bg: "bg-status-critical/5",
          border: "border-status-critical/30",
          text: "text-status-critical",
          icon: AlertTriangle,
        };
      default:
        return {
          bg: "bg-muted/5",
          border: "border-border/30",
          text: "text-foreground",
          icon: CheckCircle,
        };
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {categoryMetrics.map(
          ({ category, count, avgSuccessRate, avgDropRate, avgStability, totalCalls }) => {
            const colors = getCategoryColor(category);
            const Icon = colors.icon;

            return (
              <div
                key={category}
                className={cn(
                  "rounded-xl border p-4 transition-all hover:shadow-md",
                  colors.bg,
                  colors.border
                )}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className={cn("p-2 rounded-lg", colors.bg)}>
                    <Icon className={cn("w-5 h-5", colors.text)} />
                  </div>
                  <div className="flex-1">
                    <h3 className={cn("font-semibold text-sm", colors.text)}>{category}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {count} {dimension.toLowerCase()}
                      {count !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 pt-3 border-t border-current/10">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Success Rate</span>
                    <span className="text-sm font-semibold text-foreground">
                      {avgSuccessRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-muted/30 rounded-full h-2">
                    <div
                      className="h-full bg-status-healthy/70 rounded-full transition-all"
                      style={{ width: `${Math.min(avgSuccessRate, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Drop Rate</span>
                    <span className="text-sm font-semibold text-foreground">
                      {avgDropRate.toFixed(2)}%
                    </span>
                  </div>
                  <div className="w-full bg-muted/30 rounded-full h-2">
                    <div
                      className="h-full bg-status-critical/70 rounded-full transition-all"
                      style={{ width: `${Math.min(avgDropRate * 50, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Stability</span>
                    <span className="text-sm font-semibold text-foreground">
                      {avgStability.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-muted/30 rounded-full h-2">
                    <div
                      className="h-full bg-status-healthy/70 rounded-full transition-all"
                      style={{ width: `${Math.min(avgStability, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-current/10">
                  <p className="text-xs text-muted-foreground">
                    Total Calls:{" "}
                    <span className="font-semibold text-foreground">
                      {totalCalls.toLocaleString()}
                    </span>
                  </p>
                </div>
              </div>
            );
          }
        )}
      </div>

      {/* Detailed Summary Table */}
      <div className="card-elevated rounded-xl border border-border/50 p-6 mt-6">
        <h3 className="text-lg font-bold text-foreground mb-4">Category Summary</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50">
                <th className="px-4 py-3 text-left font-semibold text-foreground">Category</th>
                <th className="px-4 py-3 text-right font-semibold text-foreground">Count</th>
                <th className="px-4 py-3 text-right font-semibold text-foreground">
                  Avg Success Rate
                </th>
                <th className="px-4 py-3 text-right font-semibold text-foreground">
                  Avg Drop Rate
                </th>
                <th className="px-4 py-3 text-right font-semibold text-foreground">
                  Avg Stability
                </th>
                <th className="px-4 py-3 text-right font-semibold text-foreground">Total Calls</th>
              </tr>
            </thead>
            <tbody>
              {categoryMetrics.map(
                ({ category, count, avgSuccessRate, avgDropRate, avgStability, totalCalls }) => {
                  const colors = getCategoryColor(category);
                  return (
                    <tr
                      key={category}
                      className={cn(
                        "border-b border-border/30 hover:bg-muted/30 transition-colors",
                        colors.bg
                      )}
                    >
                      <td className={cn("px-4 py-3 font-semibold", colors.text)}>{category}</td>
                      <td className="px-4 py-3 text-right text-muted-foreground">{count}</td>
                      <td className="px-4 py-3 text-right font-medium text-foreground">
                        {avgSuccessRate.toFixed(1)}%
                      </td>
                      <td className="px-4 py-3 text-right text-muted-foreground">
                        {avgDropRate.toFixed(2)}%
                      </td>
                      <td className="px-4 py-3 text-right text-muted-foreground">
                        {avgStability.toFixed(1)}%
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-foreground">
                        {totalCalls.toLocaleString()}
                      </td>
                    </tr>
                  );
                }
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
