import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Download, FileText, Clock, CheckCircle, AlertCircle, TrendingUp } from "lucide-react";
import * as XLSX from "xlsx";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import FilterPanel from "@/components/FilterPanel";
import KPICard from "@/components/KPICard";
import { useGlobalFilters } from "@/hooks/useGlobalFilters";
import { useToast } from "@/hooks/use-toast";
import {
  generateReportKPIs,
  generateStandardReports,
  generateReportActivityTrend,
  generateReportTrends,
} from "@/utils/reportsData";
import { cn } from "@/lib/utils";

export default function Reports() {
  const { toast } = useToast();
  const { filters } = useGlobalFilters();

  // Generate data
  const kpis = useMemo(() => generateReportKPIs(filters), [filters]);
  const standardReports = useMemo(() => generateStandardReports(filters), [filters]);
  const activityTrend = useMemo(() => generateReportActivityTrend(filters), [filters]);
  const trends = useMemo(() => generateReportTrends(), []);

  const handleExport = () => {
    const wb = XLSX.utils.book_new();

    // Add KPIs sheet
    const kpiData = Object.entries(kpis).map(([key, value]) => ({
      Metric: key,
      Value: value.value,
      Change: `${value.change}%`,
      Status: value.status,
    }));
    const kpiSheet = XLSX.utils.json_to_sheet(kpiData);
    XLSX.utils.book_append_sheet(wb, kpiSheet, "Report KPIs");

    // Add Reports list
    const reportsData = standardReports.map((r) => ({
      Title: r.title,
      Category: r.category,
      Status: r.status,
      LastGenerated: new Date(r.lastGenerated).toLocaleString(),
      Frequency: r.frequency,
    }));
    const reportsSheet = XLSX.utils.json_to_sheet(reportsData);
    XLSX.utils.book_append_sheet(wb, reportsSheet, "Reports");

    XLSX.writeFile(wb, `Reports-${new Date().toISOString().split("T")[0]}.xlsx`);
    toast({
      title: "Export successful",
      description: "Reports data has been exported to Excel",
    });
  };

  const getCategoryLabel = (
    category: "daily_kpi" | "alarm_summary" | "sla" | "vendor_comparison"
  ) => {
    const labels = {
      daily_kpi: "Daily KPI Reports",
      alarm_summary: "Alarm Summary Reports",
      sla: "SLA Reports",
      vendor_comparison: "Vendor Comparison Reports",
    };
    return labels[category];
  };

  const getCategoryColor = (
    category: "daily_kpi" | "alarm_summary" | "sla" | "vendor_comparison"
  ) => {
    const colors = {
      daily_kpi: "from-blue-500/10 to-blue-500/5",
      alarm_summary: "from-orange-500/10 to-orange-500/5",
      sla: "from-green-500/10 to-green-500/5",
      vendor_comparison: "from-purple-500/10 to-purple-500/5",
    };
    return colors[category];
  };

  const groupedReports = standardReports.reduce(
    (acc, report) => {
      if (!acc[report.category]) {
        acc[report.category] = [];
      }
      acc[report.category].push(report);
      return acc;
    },
    {} as Record<string, typeof standardReports>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Link to="/" className="hover:text-foreground">
                  Dashboard
                </Link>
                <span>/</span>
                <span>Reports</span>
              </div>
              <h1 className="text-3xl font-bold text-foreground">Reports</h1>
              <p className="text-muted-foreground">
                Report visibility, freshness tracking, and access to standard outputs
              </p>
            </div>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export to Excel
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        <FilterPanel />
      </div>

      {/* Main Content */}
      <div className="px-8 py-8 space-y-8">

        {/* Report Summary Cards */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Report Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              icon={FileText}
              label="Available Reports"
              value={kpis.available_reports.value}
              unit="reports"
              change={kpis.available_reports.change}
              status={kpis.available_reports.status}
              direction={kpis.available_reports.change > 0 ? "up" : "down"}
            />
            <KPICard
              icon={TrendingUp}
              label="Reports Generated"
              value={kpis.reports_generated.value}
              unit="this period"
              change={kpis.reports_generated.change}
              status={kpis.reports_generated.status}
              direction={kpis.reports_generated.change > 0 ? "up" : "down"}
            />
            <KPICard
              icon={Clock}
              label="Scheduled Reports"
              value={kpis.scheduled_reports.value}
              unit="pending"
              change={kpis.scheduled_reports.change}
              status={kpis.scheduled_reports.status}
              direction={kpis.scheduled_reports.change > 0 ? "up" : "down"}
            />
            <KPICard
              icon={AlertCircle}
              label="Failed Reports"
              value={kpis.failed_reports.value}
              unit="last period"
              change={kpis.failed_reports.change}
              status={kpis.failed_reports.status}
              direction={kpis.failed_reports.change > 0 ? "up" : "down"}
            />
          </div>
        </div>

        {/* Report Trends Summary */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Report Performance Trends</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {trends.map((trend) => (
              <div key={trend.name} className="card-elevated rounded-xl border border-border/50 p-4">
                <p className="text-sm text-muted-foreground mb-2">{trend.name}</p>
                <div className="flex items-end gap-3">
                  <span className="text-2xl font-bold text-foreground">
                    {typeof trend.value === "number" && trend.value > 50
                      ? trend.value.toFixed(1)
                      : trend.value}
                    {trend.name.includes("Time") ? " min" : trend.name.includes("Rate") ? "%" : ""}
                  </span>
                  <span
                    className={cn(
                      "text-sm font-semibold px-2 py-1 rounded flex-shrink-0",
                      trend.status === "up" ? "text-green-600" : trend.status === "down" ? "text-red-600" : "text-blue-600"
                    )}
                  >
                    {trend.status === "up" ? "↑" : trend.status === "down" ? "↓" : "→"}
                    {Math.abs(trend.change).toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Standard Report Categories */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-foreground">Standard Report Categories</h2>

          {Object.entries(groupedReports).map(([category, reports]) => (
            <div key={category} className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">
                {getCategoryLabel(category as any)}
              </h3>
              <div
                className={cn(
                  "grid grid-cols-1 md:grid-cols-2 gap-4 bg-gradient-to-br",
                  getCategoryColor(category as any)
                )}
              >
                {reports.map((report) => (
                  <div
                    key={report.id}
                    className="card-elevated rounded-xl border border-border/50 p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-bold text-foreground text-base mb-1">
                          {report.title}
                        </h4>
                        <p className="text-xs text-muted-foreground">{report.description}</p>
                      </div>
                      <span
                        className={cn(
                          "px-2.5 py-1 rounded text-xs font-semibold flex-shrink-0 ml-2",
                          report.status === "success"
                            ? "bg-green-500/10 text-green-700"
                            : report.status === "pending"
                              ? "bg-blue-500/10 text-blue-700"
                              : "bg-red-500/10 text-red-700"
                        )}
                      >
                        {report.status}
                      </span>
                    </div>

                    <div className="space-y-2 pt-3 border-t border-border/50">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Last Generated:</span>
                        <span className="font-medium text-foreground">
                          {new Date(report.lastGenerated).toLocaleString([], {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Next Scheduled:</span>
                        <span className="font-medium text-foreground">
                          {new Date(report.nextScheduled).toLocaleString([], {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs pt-2">
                        <span className="text-muted-foreground">Frequency:</span>
                        <span className="px-2 py-1 rounded bg-muted text-foreground capitalize font-medium">
                          {report.frequency}
                        </span>
                      </div>
                    </div>

                    <button className="w-full mt-4 px-3 py-2 bg-primary/10 hover:bg-primary/20 text-primary text-sm font-medium rounded transition-colors">
                      Download Latest
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Report Activity Trends */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-foreground">Report Activity Trends</h2>

          {/* Total Reports Generated */}
          <div className="card-elevated rounded-xl border border-border/50 p-6">
            <h3 className="text-lg font-bold text-foreground mb-4">Reports Generated Over Time</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={activityTrend} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="timestamp"
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
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="total_generated"
                  stroke="#3b82f6"
                  dot={false}
                  strokeWidth={2}
                  name="Total Generated"
                />
                <Line
                  type="monotone"
                  dataKey="scheduled"
                  stroke="#8b5cf6"
                  dot={false}
                  strokeWidth={2}
                  name="Scheduled"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Success vs Failure Rate */}
          <div className="card-elevated rounded-xl border border-border/50 p-6">
            <h3 className="text-lg font-bold text-foreground mb-4">Success vs Failure Rate</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={activityTrend} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="timestamp"
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
                />
                <Legend />
                <Bar dataKey="successful" fill="#22c55e" name="Successful" />
                <Bar dataKey="failed" fill="#ef4444" name="Failed" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
