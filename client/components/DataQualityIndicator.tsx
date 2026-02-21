import { AlertTriangle, AlertCircle, CheckCircle, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type DataQuality = "healthy" | "warning" | "critical";
export type DataGapType = "missing" | "partial" | "vendor_outage" | "stale";

export interface DataQualityIssue {
  type: DataGapType;
  message: string;
  severity: "info" | "warning" | "critical";
  timestamp?: string;
  affectedVendor?: string;
}

interface DataQualityIndicatorProps {
  lastUpdated: string; // ISO timestamp
  quality: DataQuality;
  issues?: DataQualityIssue[];
  compact?: boolean;
  className?: string;
}

const formatTimeAgo = (isoString: string): string => {
  const now = new Date();
  const updated = new Date(isoString);
  const diffMs = now.getTime() - updated.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
};

const getQualityColor = (quality: DataQuality): string => {
  switch (quality) {
    case "healthy":
      return "text-green-600";
    case "warning":
      return "text-orange-600";
    case "critical":
      return "text-red-600";
  }
};

const getQualityBgColor = (quality: DataQuality): string => {
  switch (quality) {
    case "healthy":
      return "bg-green-50";
    case "warning":
      return "bg-orange-50";
    case "critical":
      return "bg-red-50";
  }
};

const getQualityBorderColor = (quality: DataQuality): string => {
  switch (quality) {
    case "healthy":
      return "border-green-200";
    case "warning":
      return "border-orange-200";
    case "critical":
      return "border-red-200";
  }
};

const getQualityIcon = (quality: DataQuality) => {
  switch (quality) {
    case "healthy":
      return <CheckCircle className="w-4 h-4" />;
    case "warning":
      return <AlertCircle className="w-4 h-4" />;
    case "critical":
      return <AlertTriangle className="w-4 h-4" />;
  }
};

export default function DataQualityIndicator({
  lastUpdated,
  quality,
  issues = [],
  compact = false,
  className,
}: DataQualityIndicatorProps) {
  const timeAgo = formatTimeAgo(lastUpdated);
  const hasIssues = issues.length > 0;

  if (compact) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium",
          getQualityBgColor(quality),
          getQualityBorderColor(quality),
          "border",
          className
        )}
        title={`Last updated: ${new Date(lastUpdated).toLocaleString()}`}
      >
        <span className={getQualityColor(quality)}>{getQualityIcon(quality)}</span>
        <span className={getQualityColor(quality)}>Updated {timeAgo}</span>
        {hasIssues && (
          <span
            className={cn(
              "ml-2 px-2 py-0.5 rounded text-xs font-semibold",
              issues.some((i) => i.severity === "critical")
                ? "bg-red-100 text-red-700"
                : "bg-orange-100 text-orange-700"
            )}
          >
            {issues.length} issue{issues.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>
    );
  }

  // Full view
  return (
    <div
      className={cn(
        "rounded-lg border p-4 space-y-3",
        getQualityBgColor(quality),
        getQualityBorderColor(quality),
        "border",
        className
      )}
    >
      {/* Main status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={getQualityColor(quality)}>{getQualityIcon(quality)}</span>
          <div>
            <p className={cn("font-semibold text-sm", getQualityColor(quality))}>
              {quality === "healthy"
                ? "Data Quality Healthy"
                : quality === "warning"
                  ? "Data Quality Warning"
                  : "Data Quality Critical"}
            </p>
            <p className={cn("text-xs mt-0.5", getQualityColor(quality))}>
              Last updated: {timeAgo} ({new Date(lastUpdated).toLocaleTimeString()})
            </p>
          </div>
        </div>
      </div>

      {/* Issues */}
      {hasIssues && (
        <div className="space-y-2 pt-2 border-t" style={{
          borderTopColor: getQualityColor(quality).replace("text-", "border-").split("-")[0] === "border" ? undefined : undefined
        }}>
          {issues.map((issue, idx) => (
            <div key={idx} className="flex items-start gap-2 text-xs">
              <TrendingDown className="w-3 h-3 flex-shrink-0 mt-0.5" style={{
                color: issue.severity === "critical" ? "#dc2626" : "#ea580c"
              }} />
              <div className="flex-1">
                <p className="font-medium" style={{
                  color: issue.severity === "critical" ? "#7f1d1d" : "#92400e"
                }}>
                  {issue.message}
                </p>
                {issue.affectedVendor && (
                  <p className="text-xs opacity-75 mt-1">
                    Vendor: <span className="font-semibold">{issue.affectedVendor}</span>
                  </p>
                )}
                {issue.timestamp && (
                  <p className="text-xs opacity-75">
                    {new Date(issue.timestamp).toLocaleTimeString()}
                  </p>
                )}
              </div>
              <span className={cn(
                "px-2 py-0.5 rounded font-semibold text-xs flex-shrink-0",
                issue.severity === "critical"
                  ? "bg-red-100 text-red-700"
                  : "bg-orange-100 text-orange-700"
              )}>
                {issue.severity}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Info text */}
      <p className="text-xs opacity-75 italic">
        {quality === "healthy"
          ? "✓ All data sources are current and complete"
          : quality === "warning"
            ? "⚠ Some data may be incomplete or slightly delayed"
            : "✕ Data quality is significantly impacted. Results may be unreliable."}
      </p>
    </div>
  );
}
