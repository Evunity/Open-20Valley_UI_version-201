import { useState, useMemo } from "react";
import { Eye, EyeOff, Download, RotateCcw, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from "xlsx";
import { cn } from "@/lib/utils";
import {
  LineChart,
  AreaChart,
  BarChart,
  PieChart,
  Line,
  Area,
  Bar,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Brush,
} from "recharts";

type ChartType = "line" | "area" | "bar" | "pie";

interface TrendChartContainerProps {
  children?: React.ReactNode;
  title: string;
  data: any[];
  exportable?: boolean;
  zoomable?: boolean;
  dataKeys?: string[];
  defaultChartType?: ChartType;
  onChartTypeChange?: (type: ChartType) => void;
}

const CHART_COLORS = [
  "#7c3aed",
  "#22c55e",
  "#ef4444",
  "#8b5cf6",
  "#10b981",
  "#06b6d4",
  "#f59e0b",
  "#ec4899",
];

export default function TrendChartContainer({
  children,
  title,
  data,
  exportable = true,
  zoomable = true,
  dataKeys = [],
  defaultChartType = "line",
  onChartTypeChange,
}: TrendChartContainerProps) {
  const { toast } = useToast();
  const [showLegend, setShowLegend] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [chartType, setChartType] = useState<ChartType>(defaultChartType);
  const [zoomStart, setZoomStart] = useState(0);
  const [zoomEnd, setZoomEnd] = useState(data.length - 1);
  const [showChartTypeMenu, setShowChartTypeMenu] = useState(false);
  const [showZoomControls, setShowZoomControls] = useState(false);

  // Get zoomed data
  const zoomedData = useMemo(() => {
    const start = Math.max(0, zoomStart);
    const end = Math.min(data.length - 1, zoomEnd);
    return data.slice(start, end + 1);
  }, [data, zoomStart, zoomEnd]);

  const handleChartTypeChange = (type: ChartType) => {
    setChartType(type);
    setShowChartTypeMenu(false);
    onChartTypeChange?.(type);
  };

  const handleResetZoom = () => {
    setZoomStart(0);
    setZoomEnd(data.length - 1);
    toast({
      title: "Zoom reset",
      description: "Viewing full time range",
    });
  };

  const handleExportCSV = () => {
    setIsExporting(true);
    try {
      const headers = ["Time", ...dataKeys];
      const rows = zoomedData.map((item) => {
        return [
          item.time,
          ...dataKeys.map((key) => {
            const value = item[key];
            return typeof value === "number" ? value.toFixed(2) : value;
          }),
        ];
      });

      const csvContent = [
        headers.join(","),
        ...rows.map((row) => row.join(",")),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `${title.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Export successful",
        description: `Downloaded ${title.toLowerCase()} as CSV`,
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export data",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportImage = async () => {
    setIsExporting(true);
    try {
      toast({
        title: "PNG export",
        description: "Chart PNG export requires additional dependencies. CSV export available.",
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Render chart based on type
  const renderDynamicChart = () => {
    if (!dataKeys || dataKeys.length === 0) return null;

    const commonProps = {
      data: zoomedData,
      margin: { top: 5, right: 20, left: 0, bottom: 5 },
    };

    const baseChartProps = (
      <>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis
          dataKey="time"
          type="category"
          stroke="hsl(var(--muted-foreground))"
          style={{ fontSize: "12px" }}
        />
        <YAxis stroke="hsl(var(--muted-foreground))" style={{ fontSize: "12px" }} />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
            padding: "8px 12px",
          }}
          formatter={(value: any) => {
            if (typeof value === "number") {
              return value.toFixed(2);
            }
            return value;
          }}
          labelFormatter={(label) => `Time: ${label}`}
        />
        {showLegend && <Legend />}
      </>
    );

    const lineItems = dataKeys.map((key, idx) => (
      <Line
        key={key}
        type="monotone"
        dataKey={key}
        stroke={CHART_COLORS[idx % CHART_COLORS.length]}
        strokeWidth={2}
        name={key.replace(/_/g, " ").toUpperCase()}
        isAnimationActive={false}
      />
    ));

    const areaItems = dataKeys.map((key, idx) => (
      <Area
        key={key}
        type="monotone"
        dataKey={key}
        stroke={CHART_COLORS[idx % CHART_COLORS.length]}
        fill={CHART_COLORS[idx % CHART_COLORS.length]}
        fillOpacity={0.3}
        name={key.replace(/_/g, " ").toUpperCase()}
        isAnimationActive={false}
      />
    ));

    const barItems = dataKeys.map((key, idx) => (
      <Bar
        key={key}
        dataKey={key}
        fill={CHART_COLORS[idx % CHART_COLORS.length]}
        name={key.replace(/_/g, " ").toUpperCase()}
        isAnimationActive={false}
      />
    ));

    switch (chartType) {
      case "area":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart {...commonProps}>
              {baseChartProps}
              {areaItems}
            </AreaChart>
          </ResponsiveContainer>
        );
      case "bar":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart {...commonProps}>
              {baseChartProps}
              {barItems}
            </BarChart>
          </ResponsiveContainer>
        );
      case "pie":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                formatter={(value: any) => {
                  if (typeof value === "number") {
                    return value.toFixed(2);
                  }
                  return value;
                }}
              />
              {showLegend && <Legend />}
              {dataKeys.length > 0 && (
                <Pie
                  data={[
                    {
                      [dataKeys[0]]: zoomedData.reduce(
                        (sum, item) => sum + (item[dataKeys[0]] || 0),
                        0
                      ),
                    },
                  ]}
                  dataKey={dataKeys[0]}
                  nameKey={dataKeys[0]}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {dataKeys.map((_, idx) => (
                    <Cell
                      key={`cell-${idx}`}
                      fill={CHART_COLORS[idx % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
              )}
            </PieChart>
          </ResponsiveContainer>
        );
      case "line":
      default:
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart {...commonProps}>
              {baseChartProps}
              {lineItems}
            </LineChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <div className="card-elevated rounded-xl border border-border/50 p-6 space-y-4">
      {/* Header with Controls */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h3 className="text-lg font-bold text-foreground">{title}</h3>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Chart Type Selector */}
          <div className="relative">
            <button
              onClick={() => setShowChartTypeMenu(!showChartTypeMenu)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-background hover:bg-muted/50 transition-colors text-sm font-medium"
              title="Change chart type"
            >
              <span className="capitalize">{chartType}</span>
              <ChevronDown className="w-4 h-4" />
            </button>

            {showChartTypeMenu && (
              <div className="absolute top-full left-0 mt-1 w-40 bg-card border border-border rounded-lg shadow-lg z-10">
                {(["line", "area", "bar", "pie"] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => handleChartTypeChange(type)}
                    className={cn(
                      "w-full text-left px-4 py-2 hover:bg-muted/50 transition-colors text-sm capitalize",
                      chartType === type && "bg-primary/10 text-primary font-semibold",
                      type === "pie" && "rounded-b-lg border-t border-border/50"
                    )}
                  >
                    {type === "pie" ? "Pie" : type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Legend Toggle */}
          <button
            onClick={() => setShowLegend(!showLegend)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-background hover:bg-muted/50 transition-colors text-sm font-medium"
            title={showLegend ? "Hide legend" : "Show legend"}
          >
            {showLegend ? (
              <>
                <Eye className="w-4 h-4" />
                <span className="hidden sm:inline">Legend</span>
              </>
            ) : (
              <>
                <EyeOff className="w-4 h-4" />
                <span className="hidden sm:inline">Legend Off</span>
              </>
            )}
          </button>

          {/* Zoom Controls */}
          {zoomable && (
            <div className="relative">
              <button
                onClick={() => setShowZoomControls(!showZoomControls)}
                className={cn(
                  "inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-background hover:bg-muted/50 transition-colors text-sm font-medium",
                  (zoomStart > 0 || zoomEnd < data.length - 1) &&
                    "border-primary/50 bg-primary/5 text-primary"
                )}
                title="Zoom controls"
              >
                <span className="hidden sm:inline">Zoom</span>
                <ChevronDown className="w-4 h-4" />
              </button>

              {showZoomControls && (
                <div className="absolute top-full right-0 mt-1 w-64 bg-card border border-border rounded-lg shadow-lg z-10 p-4 space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">
                      Start: {zoomStart} / End: {zoomEnd}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max={Math.max(0, data.length - 1)}
                      value={zoomStart}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (val <= zoomEnd) setZoomStart(val);
                      }}
                      className="w-full mt-2"
                    />
                    <input
                      type="range"
                      min="0"
                      max={Math.max(0, data.length - 1)}
                      value={zoomEnd}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (val >= zoomStart) setZoomEnd(val);
                      }}
                      className="w-full mt-2"
                    />
                  </div>
                  <button
                    onClick={handleResetZoom}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background hover:bg-muted/50 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reset Zoom
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Export Dropdown */}
          {exportable && (
            <div className="relative group">
              <button
                disabled={isExporting}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-background hover:bg-muted/50 transition-colors text-sm font-medium disabled:opacity-50"
                title="Export chart data"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export</span>
              </button>

              <div className="absolute right-0 mt-1 w-48 bg-card border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                <button
                  onClick={handleExportCSV}
                  disabled={isExporting}
                  className="w-full text-left px-4 py-2 hover:bg-muted/50 transition-colors text-sm disabled:opacity-50 rounded-t-lg"
                >
                  📊 Export as CSV
                </button>
                <button
                  onClick={handleExportImage}
                  disabled={isExporting}
                  className="w-full text-left px-4 py-2 hover:bg-muted/50 transition-colors text-sm disabled:opacity-50 rounded-b-lg border-t border-border/50"
                >
                  🖼️ Export as PNG
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chart Container */}
      <div className="rounded-lg border border-border/50 bg-background p-4">
        {children ? (
          children
        ) : (
          renderDynamicChart()
        )}
      </div>

      {/* Zoom Indicator */}
      {(zoomStart > 0 || zoomEnd < data.length - 1) && (
        <p className="text-xs text-muted-foreground">
          📍 Zoomed: showing {zoomedData.length} of {data.length} data points
        </p>
      )}

      {/* Info text */}
      <p className="text-xs text-muted-foreground">
        💡 Hover over chart to see Time and Value. Use Chart Type dropdown to switch between
        Line, Area, Bar, or Pie. Use Zoom controls to focus on specific time range.
      </p>
    </div>
  );
}
