import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

export interface InsightData {
  overall: {
    change: number; // percentage
    status: "Improved" | "Degraded" | "No change";
  };
  byTechnology?: Array<{
    name: string;
    change: number;
    status: "Improved" | "Degraded" | "No change";
  }>;
  byRegion?: Array<{
    name: string;
    change: number;
    status: "Improved" | "Degraded" | "No change";
  }>;
  byVendor?: Array<{
    name: string;
    change: number;
    status: "Improved" | "Degraded" | "No change";
  }>;
}

interface ExecutiveInsightSummaryProps {
  title: string;
  date: string;
  insights: InsightData;
}

export default function ExecutiveInsightSummary({
  title,
  date,
  insights,
}: ExecutiveInsightSummaryProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Improved":
        return "text-status-healthy";
      case "Degraded":
        return "text-status-critical";
      default:
        return "text-muted-foreground";
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case "Improved":
        return "bg-status-healthy/10";
      case "Degraded":
        return "bg-status-critical/10";
      default:
        return "bg-muted/50";
    }
  };

  const getTrendIcon = (status: string) => {
    switch (status) {
      case "Improved":
        return <TrendingUp className="w-3 h-3" />;
      case "Degraded":
        return <TrendingDown className="w-3 h-3" />;
      default:
        return <span>−</span>;
    }
  };

  const formatChange = (change: number, status: string) => {
    if (status === "No change") return "No change";
    const sign = change >= 0 ? "+" : "−";
    return `${sign}${Math.abs(change).toFixed(2)}%`;
  };

  return (
    <div className="card-elevated rounded-xl border border-border/50 p-6 space-y-4">
      {/* Header */}
      <div className="space-y-2">
        <h3 className="text-lg font-bold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{date}</p>
      </div>

      {/* Overall Status */}
      <div
        className={cn(
          "p-4 rounded-lg border border-border/50",
          getStatusBgColor(insights.overall.status)
        )}
      >
        <div className="flex items-start gap-2">
          <div className="flex items-center gap-1">
            {getTrendIcon(insights.overall.status)}
          </div>
          <div>
            <p className={cn("text-sm font-semibold", getStatusColor(insights.overall.status))}>
              Overall: {insights.overall.status}{" "}
              <span className="ml-1">{formatChange(insights.overall.change, insights.overall.status)}</span>
            </p>
          </div>
        </div>
      </div>

      {/* By Technology */}
      {insights.byTechnology && insights.byTechnology.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            By Technology
          </p>
          <div className="space-y-2">
            {insights.byTechnology.map((tech, idx) => (
              <div
                key={idx}
                className={cn(
                  "p-3 rounded-lg border border-border/30",
                  getStatusBgColor(tech.status)
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {getTrendIcon(tech.status)}
                    </div>
                    <span className="text-sm font-medium text-foreground">{tech.name}</span>
                  </div>
                  <span className={cn("text-xs font-semibold", getStatusColor(tech.status))}>
                    {tech.status === "Improved" ? "+" : tech.status === "Degraded" ? "−" : ""}{" "}
                    {Math.abs(tech.change).toFixed(2)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* By Region */}
      {insights.byRegion && insights.byRegion.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            By Region
          </p>
          <div className="space-y-2">
            {insights.byRegion.map((region, idx) => (
              <div
                key={idx}
                className={cn(
                  "p-3 rounded-lg border border-border/30",
                  getStatusBgColor(region.status)
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {getTrendIcon(region.status)}
                    </div>
                    <span className="text-sm font-medium text-foreground">{region.name}</span>
                  </div>
                  <span className={cn("text-xs font-semibold", getStatusColor(region.status))}>
                    {region.status === "Improved" ? "+" : region.status === "Degraded" ? "−" : ""}{" "}
                    {Math.abs(region.change).toFixed(2)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* By Vendor */}
      {insights.byVendor && insights.byVendor.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            By Vendor
          </p>
          <div className="space-y-2">
            {insights.byVendor.map((vendor, idx) => (
              <div
                key={idx}
                className={cn(
                  "p-3 rounded-lg border border-border/30",
                  getStatusBgColor(vendor.status)
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {getTrendIcon(vendor.status)}
                    </div>
                    <span className="text-sm font-medium text-foreground">{vendor.name}</span>
                  </div>
                  <span className={cn("text-xs font-semibold", getStatusColor(vendor.status))}>
                    {vendor.status === "Improved" ? "+" : vendor.status === "Degraded" ? "−" : ""}{" "}
                    {Math.abs(vendor.change).toFixed(2)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
