import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface RankingEntity {
  rank: number;
  name: string;
  value: number;
  unit: string;
  change: number; // vs previous period
  status: "healthy" | "acceptable" | "degraded" | "critical";
}

interface KPIRankingProps {
  title: string;
  subtitle?: string;
  entities: RankingEntity[];
  type: "best" | "worst";
  maxVisible?: number;
}

export default function KPIRanking({
  title,
  subtitle,
  entities,
  type,
  maxVisible = 5,
}: KPIRankingProps) {
  const displayEntities = entities.slice(0, maxVisible);
  const isBest = type === "best";

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "bg-green-50";
      case "acceptable":
        return "bg-blue-50";
      case "degraded":
        return "bg-orange-50";
      case "critical":
        return "bg-red-50";
      default:
        return "bg-gray-50";
    }
  };

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "text-green-900";
      case "acceptable":
        return "text-blue-900";
      case "degraded":
        return "text-orange-900";
      case "critical":
        return "text-red-900";
      default:
        return "text-gray-900";
    }
  };

  return (
    <div className="bg-card border border-border/50 rounded-lg overflow-hidden">
      {/* Header */}
      <div className={cn(
        "px-6 py-4 border-b border-border/50",
        isBest ? "bg-green-50" : "bg-red-50"
      )}>
        <h3 className={cn(
          "font-semibold",
          isBest ? "text-green-900" : "text-red-900"
        )}>
          {title}
        </h3>
        {subtitle && (
          <p className={cn(
            "text-sm mt-1",
            isBest ? "text-green-700" : "text-red-700"
          )}>
            {subtitle}
          </p>
        )}
      </div>

      {/* Table */}
      <div className="divide-y divide-border/50">
        {displayEntities.length > 0 ? (
          displayEntities.map((entity, idx) => (
            <div
              key={`${entity.name}-${idx}`}
              className={cn(
                "px-6 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors",
                getStatusColor(entity.status)
              )}
            >
              <div className="flex items-center gap-4 flex-1">
                {/* Rank Badge */}
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0",
                  isBest
                    ? "bg-green-200 text-green-900"
                    : "bg-red-200 text-red-900"
                )}>
                  #{entity.rank}
                </div>

                {/* Name and Change */}
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "font-medium text-sm",
                    getStatusTextColor(entity.status)
                  )}>
                    {entity.name}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={cn(
                      "text-xs font-semibold flex items-center gap-1",
                      entity.change > 0
                        ? "text-green-600"
                        : entity.change < 0
                          ? "text-red-600"
                          : "text-gray-600"
                    )}>
                      {entity.change > 0 ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : entity.change < 0 ? (
                        <TrendingDown className="w-3 h-3" />
                      ) : null}
                      {Math.abs(entity.change).toFixed(1)}%
                    </span>
                    <span className="text-xs text-muted-foreground">
                      vs previous
                    </span>
                  </div>
                </div>
              </div>

              {/* Value */}
              <div className="text-right flex-shrink-0 ml-4">
                <p className={cn(
                  "font-bold text-lg",
                  getStatusTextColor(entity.status)
                )}>
                  {entity.value.toFixed(1)}
                </p>
                <p className="text-xs text-muted-foreground">{entity.unit}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="px-6 py-12 text-center text-muted-foreground">
            No data available
          </div>
        )}
      </div>

      {/* Footer */}
      {entities.length > maxVisible && (
        <div className="px-6 py-3 bg-muted/30 border-t border-border/50 text-center">
          <p className="text-xs text-muted-foreground">
            Showing {maxVisible} of {entities.length} entities
          </p>
        </div>
      )}
    </div>
  );
}
