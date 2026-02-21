import { cn } from "@/lib/utils";

export interface HeatmapCell {
  entity: string; // Region, Site, or Node name
  time: string; // ISO date or timestamp
  value: number; // KPI value
  status: "healthy" | "acceptable" | "degraded" | "critical";
}

interface KPIHeatmapProps {
  title: string;
  data: HeatmapCell[];
  entityLabel?: string;
  timeLabel?: string;
  showValues?: boolean;
  maxWidth?: string;
}

export default function KPIHeatmap({
  title,
  data,
  entityLabel = "Entity",
  timeLabel = "Date",
  showValues = false,
  maxWidth = "1200px",
}: KPIHeatmapProps) {
  // Group data by entity and time
  const entities = Array.from(new Set(data.map((d) => d.entity))).sort();
  const times = Array.from(new Set(data.map((d) => d.time))).sort();

  // Create lookup map
  const cellMap = new Map(
    data.map((cell) => [`${cell.entity}|${cell.time}`, cell])
  );

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "healthy":
        return "bg-green-500 hover:bg-green-600";
      case "acceptable":
        return "bg-blue-500 hover:bg-blue-600";
      case "degraded":
        return "bg-orange-500 hover:bg-orange-600";
      case "critical":
        return "bg-red-500 hover:bg-red-600";
      default:
        return "bg-gray-300";
    }
  };

  const getStatusText = (status: string): string => {
    switch (status) {
      case "healthy":
        return "Healthy";
      case "acceptable":
        return "Acceptable";
      case "degraded":
        return "Degraded";
      case "critical":
        return "Critical";
      default:
        return "Unknown";
    }
  };

  return (
    <div className="bg-card border border-border/50 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border/50">
        <h3 className="text-lg font-bold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground mt-1">
          {entities.length} {entityLabel.toLowerCase()}s over {times.length} time periods
        </p>
      </div>

      {/* Heatmap Container */}
      <div className="overflow-x-auto">
        <div
          style={{ maxWidth }}
          className="inline-block min-w-full"
        >
          {/* Table */}
          <table className="w-full text-xs border-collapse">
            {/* Header Row */}
            <thead>
              <tr>
                <th className="px-3 py-2 text-left font-semibold text-foreground bg-muted/30 border-b border-border/50 sticky left-0 z-10 min-w-[120px]">
                  {entityLabel}
                </th>
                {times.map((time) => (
                  <th
                    key={time}
                    className="px-2 py-2 text-center font-semibold text-foreground bg-muted/30 border-b border-border/50 text-[10px]"
                  >
                    {new Date(time).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </th>
                ))}
              </tr>
            </thead>

            {/* Body */}
            <tbody>
              {entities.map((entity) => (
                <tr key={entity} className="border-b border-border/50 hover:bg-muted/20">
                  {/* Entity Label */}
                  <td className="px-3 py-2 font-medium text-foreground bg-muted/10 sticky left-0 z-10 min-w-[120px] border-r border-border/50">
                    <span className="line-clamp-1">{entity}</span>
                  </td>

                  {/* Heatmap Cells */}
                  {times.map((time) => {
                    const cell = cellMap.get(`${entity}|${time}`);
                    const hasData = !!cell;

                    return (
                      <td
                        key={`${entity}|${time}`}
                        className="p-1 text-center group"
                        title={
                          cell
                            ? `${entity} - ${new Date(time).toLocaleDateString()}: ${cell.value} (${getStatusText(
                                cell.status
                              )})`
                            : "No data"
                        }
                      >
                        {hasData && cell ? (
                          <div
                            className={cn(
                              "w-8 h-8 rounded flex items-center justify-center transition-all duration-200 cursor-help relative group",
                              getStatusColor(cell.status)
                            )}
                          >
                            {showValues && (
                              <span className="text-white text-[9px] font-bold">
                                {Math.round(cell.value)}
                              </span>
                            )}
                            {/* Tooltip on hover */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 rounded bg-gray-900 text-white text-[10px] whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-20 pointer-events-none">
                              {cell.value.toFixed(2)}
                            </div>
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded bg-gray-200 opacity-30"></div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="px-6 py-4 border-t border-border/50 bg-muted/20 space-y-3">
        <p className="text-xs font-semibold text-foreground">Status Legend</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(
            [
              { status: "healthy", label: "Healthy" },
              { status: "acceptable", label: "Acceptable" },
              { status: "degraded", label: "Degraded" },
              { status: "critical", label: "Critical" },
            ] as const
          ).map(({ status, label }) => (
            <div key={status} className="flex items-center gap-2">
              <div
                className={cn("w-3 h-3 rounded", getStatusColor(status))}
              />
              <span className="text-xs text-foreground">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="px-6 py-3 bg-primary/5 border-t border-border/50 text-xs text-muted-foreground">
        <p>Hover over cells to see values. Gaps indicate missing data.</p>
      </div>
    </div>
  );
}
