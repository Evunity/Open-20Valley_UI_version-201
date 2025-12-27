import { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { RotateCcw, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

type ChartType = "bar" | "pie" | "line" | "histogram" | "table";

interface DashboardWidgetProps {
  title: string;
  subtitle?: string;
  data: Array<Record<string, any>>;
  dataKey: string;
  categoryKey?: string;
  chartType: ChartType;
  onChartTypeChange: (type: ChartType) => void;
  showTooltip: boolean;
  onTooltipChange: (show: boolean) => void;
  showLegend: boolean;
  onLegendChange: (show: boolean) => void;
  onReset: () => void;
  colors?: string[];
  height?: number;
  onClick?: () => void;
  className?: string;
}

const CHART_TYPES: ChartType[] = ["bar", "pie", "line", "histogram", "table"];

// Color palette that matches the CSS variables
const COLORS = [
  "#7c3aed", // purple primary
  "#a78bfa", // purple accent
  "#22c55e", // green healthy
  "#eab308", // yellow degraded
  "#ef4444", // red critical
];

export default function DashboardWidget({
  title,
  subtitle,
  data,
  dataKey,
  categoryKey = "name",
  chartType,
  onChartTypeChange,
  showTooltip,
  onTooltipChange,
  showLegend,
  onLegendChange,
  onReset,
  colors = COLORS,
  height = 300,
  onClick,
  className,
}: DashboardWidgetProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    return data;
  }, [data]);

  const renderChart = () => {
    if (!chartData || chartData.length === 0) {
      return (
        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
          No data available
        </div>
      );
    }

    const commonProps = {
      width: "100%",
      height: height,
      data: chartData,
      margin: { top: 20, right: 30, left: 0, bottom: 20 },
    };

    const tooltipContent = showTooltip ? <Tooltip /> : null;
    const legendContent = showLegend ? <Legend /> : null;

    switch (chartType) {
      case "pie":
        return (
          <ResponsiveContainer {...commonProps}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey={dataKey}
                nameKey={categoryKey}
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={showTooltip}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              {tooltipContent}
              {legendContent}
            </PieChart>
          </ResponsiveContainer>
        );

      case "line":
      case "histogram":
        return (
          <ResponsiveContainer {...commonProps}>
            <LineChart>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey={categoryKey} />
              <YAxis />
              {tooltipContent}
              {legendContent}
              <Line
                type="monotone"
                dataKey={dataKey}
                stroke={colors[0]}
                strokeWidth={2}
                dot={{ fill: colors[0], r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case "table":
        return (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-3 font-semibold text-foreground">
                    {categoryKey}
                  </th>
                  <th className="text-right py-2 px-3 font-semibold text-foreground">
                    {dataKey}
                  </th>
                </tr>
              </thead>
              <tbody>
                {chartData.map((row, idx) => (
                  <tr key={idx} className="border-b border-border hover:bg-muted/30">
                    <td className="py-2 px-3 text-foreground">{row[categoryKey]}</td>
                    <td className="text-right py-2 px-3 text-foreground font-semibold">
                      {row[dataKey]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case "bar":
      default:
        return (
          <ResponsiveContainer {...commonProps}>
            <BarChart>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey={categoryKey} />
              <YAxis />
              {tooltipContent}
              {legendContent}
              <Bar dataKey={dataKey} fill={colors[0]} radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <div
      className={cn(
        "card-elevated p-6 flex flex-col h-full cursor-pointer hover:shadow-lg transition-shadow",
        onClick && "hover:border-primary/50",
        className
      )}
      onClick={onClick}
    >
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-2 mt-4 items-start sm:items-center">
          {/* Chart Type Selector */}
          <div className="flex gap-1 bg-muted/30 p-1 rounded-lg overflow-x-auto">
            {CHART_TYPES.map((type) => (
              <button
                key={type}
                onClick={(e) => {
                  e.stopPropagation();
                  onChartTypeChange(type);
                }}
                className={cn(
                  "px-2.5 py-1 rounded text-xs font-medium transition-all capitalize whitespace-nowrap flex-shrink-0",
                  chartType === type
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
                title={`Show as ${type}`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Control Buttons */}
          <div className="flex gap-1.5 ml-auto">
            {/* Tooltip Toggle */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTooltipChange(!showTooltip);
              }}
              className={cn(
                "p-1.5 rounded-lg transition-colors",
                showTooltip
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/70"
              )}
              title="Toggle tooltip"
            >
              <Eye className="w-4 h-4" />
            </button>

            {/* Legend Toggle */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onLegendChange(!showLegend);
              }}
              className={cn(
                "p-1.5 rounded-lg transition-colors",
                showLegend
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/70"
              )}
              title="Toggle legend"
            >
              <EyeOff className="w-4 h-4" />
            </button>

            {/* Reset Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onReset();
              }}
              className="p-1.5 rounded-lg bg-muted text-muted-foreground hover:bg-muted/70 transition-colors"
              title="Reset to defaults"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Chart Container */}
      <div className="flex-1 min-h-0 w-full">
        {renderChart()}
      </div>
    </div>
  );
}
