import { useState, useMemo } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from "recharts";
import { cn } from "@/lib/utils";

export type ComparisonType = "vendor" | "region" | "technology" | "incident" | "automation";

export interface ComparisonEntity {
  id: string;
  name: string;
  color: string;
  type?: "before" | "after" | "primary";
}

export interface ComparisonDataPoint {
  time: string;
  [key: string]: string | number; // entity_id -> value
}

interface ComparisonWorkspaceProps {
  title: string;
  comparisonType: ComparisonType;
  entities: ComparisonEntity[];
  data: ComparisonDataPoint[];
  showBenchmark?: boolean;
  benchmarkMetrics?: {
    average: number;
    median: number;
    best: number;
    worst: number;
    bestEntity?: string;
    worstEntity?: string;
  };
  onEntityToggle?: (entityId: string) => void;
}

export default function ComparisonWorkspace({
  title,
  comparisonType,
  entities,
  data,
  showBenchmark = true,
  benchmarkMetrics,
  onEntityToggle,
}: ComparisonWorkspaceProps) {
  const [chartType, setChartType] = useState<"line" | "bar">("line");
  const [visibleEntities, setVisibleEntities] = useState<Set<string>>(
    new Set(entities.map((e) => e.id))
  );

  const handleEntityToggle = (entityId: string) => {
    const newVisible = new Set(visibleEntities);
    if (newVisible.has(entityId)) {
      newVisible.delete(entityId);
    } else {
      newVisible.add(entityId);
    }
    setVisibleEntities(newVisible);
    onEntityToggle?.(entityId);
  };

  // Prepare chart data with visible entities
  const chartData = useMemo(() => {
    return data.map((point) => {
      const filtered: Record<string, any> = { time: point.time };
      visibleEntities.forEach((entityId) => {
        filtered[entityId] = point[entityId];
      });
      return filtered;
    });
  }, [data, visibleEntities]);

  const getTypeLabel = (type: ComparisonType): string => {
    switch (type) {
      case "vendor":
        return "Vendor Comparison";
      case "region":
        return "Region Comparison";
      case "technology":
        return "Technology Comparison";
      case "incident":
        return "Before/After Incident";
      case "automation":
        return "Before/After Automation";
    }
  };

  const chartTitle = title || getTypeLabel(comparisonType);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="space-y-2">
        <h3 className="text-lg font-bold text-foreground">{chartTitle}</h3>
        <p className="text-sm text-muted-foreground">
          Comparing {visibleEntities.size} of {entities.length} {getTypeLabel(comparisonType).toLowerCase()}
        </p>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex gap-2">
          <button
            onClick={() => setChartType("line")}
            className={cn(
              "px-3 py-2 rounded text-sm font-medium transition-colors",
              chartType === "line"
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80"
            )}
          >
            Line Chart
          </button>
          <button
            onClick={() => setChartType("bar")}
            className={cn(
              "px-3 py-2 rounded text-sm font-medium transition-colors",
              chartType === "bar"
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80"
            )}
          >
            Bar Chart
          </button>
        </div>

        {/* Legend */}
        <div className="flex gap-2 flex-wrap">
          {entities.map((entity) => (
            <label
              key={entity.id}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={visibleEntities.has(entity.id)}
                onChange={() => handleEntityToggle(entity.id)}
                className="w-4 h-4 rounded border border-border"
              />
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: entity.color }}
                />
                <span className="text-sm text-foreground">{entity.name}</span>
                {entity.type && (
                  <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary font-semibold">
                    {entity.type === "before" ? "Before" : entity.type === "after" ? "After" : "Primary"}
                  </span>
                )}
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="bg-card border border-border/50 rounded-lg p-6 overflow-hidden">
        <ResponsiveContainer width="100%" height={350}>
          {chartType === "line" ? (
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="time"
                stroke="hsl(var(--muted-foreground))"
                style={{ fontSize: "12px" }}
              />
              <YAxis stroke="hsl(var(--muted-foreground))" style={{ fontSize: "12px" }} />

              {/* Benchmark Reference Lines */}
              {showBenchmark && benchmarkMetrics && (
                <>
                  <ReferenceLine
                    y={benchmarkMetrics.average}
                    stroke="#9ca3af"
                    strokeDasharray="5 5"
                    label={{ value: "Average", position: "right", fill: "#6b7280", fontSize: 11 }}
                  />
                  <ReferenceLine
                    y={benchmarkMetrics.median}
                    stroke="#6366f1"
                    strokeDasharray="3 3"
                    label={{ value: "Median", position: "right", fill: "#4f46e5", fontSize: 11 }}
                  />
                </>
              )}

              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                formatter={(value: any) => value?.toFixed(2)}
              />
              <Legend />

              {/* Lines for visible entities */}
              {entities
                .filter((e) => visibleEntities.has(e.id))
                .map((entity) => (
                  <Line
                    key={entity.id}
                    type="monotone"
                    dataKey={entity.id}
                    stroke={entity.color}
                    strokeWidth={2}
                    name={entity.name}
                    dot={false}
                    isAnimationActive={false}
                  />
                ))}
            </LineChart>
          ) : (
            <BarChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="time"
                stroke="hsl(var(--muted-foreground))"
                style={{ fontSize: "12px" }}
              />
              <YAxis stroke="hsl(var(--muted-foreground))" style={{ fontSize: "12px" }} />

              {/* Benchmark Reference Lines */}
              {showBenchmark && benchmarkMetrics && (
                <>
                  <ReferenceLine
                    y={benchmarkMetrics.average}
                    stroke="#9ca3af"
                    strokeDasharray="5 5"
                    label={{ value: "Average", position: "right", fill: "#6b7280", fontSize: 11 }}
                  />
                  <ReferenceLine
                    y={benchmarkMetrics.median}
                    stroke="#6366f1"
                    strokeDasharray="3 3"
                    label={{ value: "Median", position: "right", fill: "#4f46e5", fontSize: 11 }}
                  />
                </>
              )}

              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                formatter={(value: any) => value?.toFixed(2)}
              />
              <Legend />

              {/* Bars for visible entities */}
              {entities
                .filter((e) => visibleEntities.has(e.id))
                .map((entity) => (
                  <Bar
                    key={entity.id}
                    dataKey={entity.id}
                    fill={entity.color}
                    name={entity.name}
                    isAnimationActive={false}
                  />
                ))}
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Benchmark Summary */}
      {showBenchmark && benchmarkMetrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Best", value: benchmarkMetrics.best, entity: benchmarkMetrics.bestEntity },
            { label: "Worst", value: benchmarkMetrics.worst, entity: benchmarkMetrics.worstEntity },
            { label: "Average", value: benchmarkMetrics.average, entity: undefined },
            { label: "Median", value: benchmarkMetrics.median, entity: undefined },
          ].map((metric) => (
            <div key={metric.label} className="bg-card border border-border/50 rounded-lg p-4">
              <p className="text-xs text-muted-foreground font-semibold">{metric.label}</p>
              <p className="text-2xl font-bold text-foreground mt-1">
                {metric.value.toFixed(2)}
              </p>
              {metric.entity && (
                <p className="text-xs text-muted-foreground mt-2">{metric.entity}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Info */}
      <div className="text-xs text-muted-foreground bg-muted/20 p-3 rounded">
        <p>
          💡 <span className="font-semibold">Benchmark Mode:</span> Average and Median reference lines help identify outliers. Toggle entities to focus on specific comparisons.
        </p>
      </div>
    </div>
  );
}
