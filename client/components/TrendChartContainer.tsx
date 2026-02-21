import { useState, useMemo } from "react";
import { Download, RotateCcw, ChevronDown } from "lucide-react";
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
  const [isExporting, setIsExporting] = useState(false);
  const [chartType, setChartType] = useState<ChartType>(defaultChartType);
  const [zoomStart, setZoomStart] = useState(0);
  const [zoomEnd, setZoomEnd] = useState(data.length - 1);
  const [showChartTypeMenu, setShowChartTypeMenu] = useState(false);
  const [showZoomControls, setShowZoomControls] = useState(false);
  const [dateZoomStart, setDateZoomStart] = useState("");
  const [dateZoomEnd, setDateZoomEnd] = useState("");
  const [timeZoomStart, setTimeZoomStart] = useState("");
  const [timeZoomEnd, setTimeZoomEnd] = useState("");

  // Detect if data is time-based (hourly) or date-based
  const isHourlyData = useMemo(() => {
    if (data.length === 0) return false;
    const firstTime = data[0].time as string;
    return firstTime.includes(":") && !firstTime.includes("-");
  }, [data]);

  // Get zoomed data
  const zoomedData = useMemo(() => {
    const start = Math.max(0, zoomStart);
    const end = Math.min(data.length - 1, zoomEnd);
    return data.slice(start, end + 1);
  }, [data, zoomStart, zoomEnd]);

  // Apply date/time filters
  const applyDateTimeFilters = () => {
    let startIdx = 0;
    let endIdx = data.length - 1;

    if (isHourlyData) {
      // For hourly data, filter by time only
      if (timeZoomStart) {
        startIdx = data.findIndex((d) => (d.time as string) >= timeZoomStart);
        if (startIdx === -1) startIdx = 0;
      }

      if (timeZoomEnd) {
        endIdx = data.findIndex((d) => (d.time as string) >= timeZoomEnd);
        if (endIdx === -1) endIdx = data.length - 1;
      }

      setZoomStart(startIdx);
      setZoomEnd(Math.max(startIdx, endIdx));
      toast({
        title: "Time filter applied",
        description: `Showing data from ${timeZoomStart || "00:00"} to ${timeZoomEnd || "23:00"}`,
      });
    } else {
      // For date-based data, filter by date and/or time
      if (dateZoomStart) {
        startIdx = data.findIndex((d) => (d.time as string) >= dateZoomStart);
        if (startIdx === -1) startIdx = 0;
      }

      if (dateZoomEnd) {
        endIdx = data.findIndex((d) => (d.time as string) <= dateZoomEnd);
        if (endIdx === -1) endIdx = data.length - 1;
      }

      // If time filters are also specified, apply them
      if (timeZoomStart || timeZoomEnd) {
        const filteredData = data.slice(startIdx, endIdx + 1);
        let timeStartIdx = 0;
        let timeEndIdx = filteredData.length - 1;

        if (timeZoomStart) {
          timeStartIdx = filteredData.findIndex((d) => (d.time as string).split(" ")[1] >= timeZoomStart);
          if (timeStartIdx === -1) timeStartIdx = 0;
        }

        if (timeZoomEnd) {
          timeEndIdx = filteredData.findIndex((d) => (d.time as string).split(" ")[1] >= timeZoomEnd);
          if (timeEndIdx === -1) timeEndIdx = filteredData.length - 1;
        }

        startIdx = startIdx + timeStartIdx;
        endIdx = startIdx + Math.max(0, timeEndIdx);
      }

      setZoomStart(startIdx);
      setZoomEnd(Math.max(startIdx, endIdx));

      const dateDesc = dateZoomStart || dateZoomEnd ? `${dateZoomStart || "start"} to ${dateZoomEnd || "end"}` : "full range";
      const timeDesc = timeZoomStart || timeZoomEnd ? ` (${timeZoomStart || "00:00"} to ${timeZoomEnd || "23:00"})` : "";

      toast({
        title: "Filters applied",
        description: `Showing data from ${dateDesc}${timeDesc}`,
      });
    }
  };

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
        <Legend />
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
              <Legend />
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
                title="Zoom and filter controls"
              >
                <span className="hidden sm:inline">Filters</span>
                <ChevronDown className="w-4 h-4" />
              </button>

              {showZoomControls && (
                <div className="absolute top-full right-0 mt-1 w-80 bg-card border border-border rounded-lg shadow-lg z-10 p-4 space-y-4">
                  {/* Date Filters */}
                  {!isHourlyData && (
                    <>
                      <div className="border-b border-border/50 pb-3 mb-3">
                        <h4 className="text-xs font-semibold text-foreground mb-3">Date Filters</h4>
                        <div className="space-y-2">
                          <div>
                            <label className="text-xs font-semibold text-muted-foreground block mb-1">
                              Start Date
                            </label>
                            <input
                              type="date"
                              value={dateZoomStart}
                              onChange={(e) => setDateZoomStart(e.target.value)}
                              className="w-full px-2 py-1 rounded border border-border text-sm"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-muted-foreground block mb-1">
                              End Date
                            </label>
                            <input
                              type="date"
                              value={dateZoomEnd}
                              onChange={(e) => setDateZoomEnd(e.target.value)}
                              className="w-full px-2 py-1 rounded border border-border text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Time Filters */}
                  <div className="pb-3">
                    <h4 className="text-xs font-semibold text-foreground mb-3">Time Filters</h4>
                    <div className="space-y-2">
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground block mb-1">
                          Start Time
                        </label>
                        <input
                          type="time"
                          value={timeZoomStart}
                          onChange={(e) => setTimeZoomStart(e.target.value)}
                          className="w-full px-2 py-1 rounded border border-border text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground block mb-1">
                          End Time
                        </label>
                        <input
                          type="time"
                          value={timeZoomEnd}
                          onChange={(e) => setTimeZoomEnd(e.target.value)}
                          className="w-full px-2 py-1 rounded border border-border text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Apply Button */}
                  <button
                    onClick={applyDateTimeFilters}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium"
                  >
                    Apply Filters
                  </button>

                  {/* Reset Button */}
                  <button
                    onClick={handleResetZoom}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background hover:bg-muted/50 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reset All Filters
                  </button>

                  {/* Info */}
                  <div className="text-xs text-muted-foreground pt-2 border-t border-border/50">
                    Showing {zoomedData.length} of {data.length} data points
                  </div>
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

    </div>
  );
}
