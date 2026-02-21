import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { cn } from "@/lib/utils";

export interface SegmentationData {
  healthy: number;
  acceptable: number;
  degraded: number;
  critical: number;
}

interface KPISegmentationProps {
  title: string;
  subtitle?: string;
  data: SegmentationData;
  total: number;
  visualizationType?: "bar" | "distribution";
}

export default function KPISegmentation({
  title,
  subtitle,
  data,
  total,
  visualizationType = "bar",
}: KPISegmentationProps) {
  const chartData = [
    { name: "Healthy", value: data.healthy, percentage: ((data.healthy / total) * 100).toFixed(1) },
    { name: "Acceptable", value: data.acceptable, percentage: ((data.acceptable / total) * 100).toFixed(1) },
    { name: "Degraded", value: data.degraded, percentage: ((data.degraded / total) * 100).toFixed(1) },
    { name: "Critical", value: data.critical, percentage: ((data.critical / total) * 100).toFixed(1) },
  ];

  const colors = {
    healthy: "#22c55e",
    acceptable: "#3b82f6",
    degraded: "#f59e0b",
    critical: "#ef4444",
  };

  const statusBgColors = {
    healthy: "bg-green-50",
    acceptable: "bg-blue-50",
    degraded: "bg-orange-50",
    critical: "bg-red-50",
  };

  const statusTextColors = {
    healthy: "text-green-900",
    acceptable: "text-blue-900",
    degraded: "text-orange-900",
    critical: "text-red-900",
  };

  if (visualizationType === "distribution") {
    return (
      <div className="bg-card border border-border/50 rounded-lg overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border/50">
          <h3 className="font-semibold text-foreground">{title}</h3>
          {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
        </div>

        {/* Segmentation Distribution */}
        <div className="p-6 space-y-4">
          {chartData.map((item) => (
            <div key={item.name} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">{item.name}</span>
                <span className="text-sm font-semibold text-muted-foreground">
                  {item.value} ({item.percentage}%)
                </span>
              </div>
              <div className="w-full h-2 bg-border/30 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${(item.value / total) * 100}%`,
                    backgroundColor:
                      item.name === "Healthy"
                        ? colors.healthy
                        : item.name === "Acceptable"
                          ? colors.acceptable
                          : item.name === "Degraded"
                            ? colors.degraded
                            : colors.critical,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Legend Cards */}
        <div className="px-6 py-4 border-t border-border/50 grid grid-cols-2 gap-3">
          {(Object.entries(data) as [keyof SegmentationData, number][]).map(
            ([status, count]) => (
              <div
                key={status}
                className={cn(
                  "p-3 rounded-lg text-center",
                  statusBgColors[status]
                )}
              >
                <p className={cn("text-sm font-semibold", statusTextColors[status])}>
                  {count}
                </p>
                <p className={cn("text-xs capitalize", statusTextColors[status])}>
                  {status}
                </p>
              </div>
            )
          )}
        </div>
      </div>
    );
  }

  // Bar Chart View
  return (
    <div className="bg-card border border-border/50 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border/50">
        <h3 className="font-semibold text-foreground">{title}</h3>
        {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
      </div>

      {/* Chart */}
      <div className="p-6">
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="name"
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize: "12px" }}
            />
            <YAxis stroke="hsl(var(--muted-foreground))" style={{ fontSize: "12px" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
              formatter={(value: any) => [value, "Count"]}
            />
            <Bar dataKey="value" fill="#8b5cf6" radius={[8, 8, 0, 0]}>
              {chartData.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={
                    entry.name === "Healthy"
                      ? colors.healthy
                      : entry.name === "Acceptable"
                        ? colors.acceptable
                        : entry.name === "Degraded"
                          ? colors.degraded
                          : colors.critical
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Summary */}
      <div className="px-6 py-4 border-t border-border/50 grid grid-cols-4 gap-2">
        {chartData.map((item) => (
          <div key={item.name} className="text-center">
            <p className="text-lg font-bold text-foreground">{item.value}</p>
            <p className="text-xs text-muted-foreground">{item.percentage}%</p>
          </div>
        ))}
      </div>
    </div>
  );
}
