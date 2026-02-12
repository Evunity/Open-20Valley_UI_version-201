import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Download, FileText, Clock, AlertCircle, TrendingUp, X } from "lucide-react";
import * as XLSX from "xlsx";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import FilterPanel from "@/components/FilterPanel";
import KPICard from "@/components/KPICard";
import SearchableDropdown from "@/components/SearchableDropdown";
import ReportHistoryModal from "@/components/ReportHistoryModal";
import SmartInsightsPanel from "@/components/SmartInsightsPanel";
import { useGlobalFilters } from "@/hooks/useGlobalFilters";
import { useToast } from "@/hooks/use-toast";
import {
  generateReportKPIs,
  generateStandardReports,
  generateReportActivityTrend,
  generateReportTrends,
  generateReportFreshnessHeatmap,
  generateFailuresByVendor,
  generateFailuresByTechnology,
  generateFailuresByRegion,
  generateTopFailedReports,
  generateMostDownloadedReports,
  generateDownloadsByUserRole,
  generateAvgDownloadTimeTrend,
  generateReportExecutionHistory,
  generateSmartInsights,
  type StandardReport,
} from "@/utils/reportsData";
import { cn } from "@/lib/utils";

const REPORT_CATEGORIES = ["KPI", "Alarm", "SLA", "Vendor", "Custom"];
const REPORT_STATUSES = ["Success", "Failed", "Running", "Delayed"];
const SCHEDULE_TYPES = ["On-demand", "Scheduled"];

const CHART_COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#14b8a6"];
const PIE_COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"];

export default function ReportsPage() {
  const { toast } = useToast();
  const { filters } = useGlobalFilters();

  // Local report-specific filters
  const [reportFilters, setReportFilters] = useState({
    categories: [] as string[],
    statuses: [] as string[],
    scheduleTypes: [] as string[],
  });

  // Report history modal state
  const [selectedReport, setSelectedReport] = useState<StandardReport | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<"xlsx" | "csv">("xlsx");

  // Generate all data
  const kpis = useMemo(() => generateReportKPIs(filters), [filters]);
  const allReports = useMemo(() => generateStandardReports(filters), [filters]);
  const activityTrend = useMemo(() => generateReportActivityTrend(filters), [filters]);
  const trends = useMemo(() => generateReportTrends(), []);
  const freshnessHeatmap = useMemo(() => generateReportFreshnessHeatmap(), []);
  const failuresByVendor = useMemo(() => generateFailuresByVendor(), []);
  const failuresByTech = useMemo(() => generateFailuresByTechnology(), []);
  const failuresByRegion = useMemo(() => generateFailuresByRegion(), []);
  const topFailedReports = useMemo(() => generateTopFailedReports(), []);
  const mostDownloaded = useMemo(() => generateMostDownloadedReports(), []);
  const downloadsByRole = useMemo(() => generateDownloadsByUserRole(), []);
  const downloadTrend = useMemo(() => generateAvgDownloadTimeTrend(), []);
  const smartInsights = useMemo(() => generateSmartInsights(filters), [filters]);

  // Filter reports based on local filters
  const filteredReports = useMemo(() => {
    return allReports.filter((report) => {
      const categoryMatch = reportFilters.categories.length === 0 || reportFilters.categories.some(cat => report.category.toLowerCase().includes(cat.toLowerCase()));
      const statusMatch = reportFilters.statuses.length === 0 || reportFilters.statuses.some(status => report.status === status.toLowerCase());
      const scheduleMatch = reportFilters.scheduleTypes.length === 0 || 
        (reportFilters.scheduleTypes.includes("Scheduled") && report.frequency !== "on-demand") ||
        (reportFilters.scheduleTypes.includes("On-demand") && report.frequency === "on-demand");
      
      return categoryMatch && statusMatch && scheduleMatch;
    });
  }, [allReports, reportFilters]);

  const handleExport = () => {
    const timestamp = new Date().toISOString().split("T")[0];

    // KPI data
    const kpiData = Object.entries(kpis).map(([key, value]) => ({
      Metric: key.replace(/_/g, " "),
      Value: value.value,
      Change: `${value.change}%`,
      Status: value.status,
    }));

    // Failure data
    const failureData = topFailedReports.map((r) => ({
      Report: r.report,
      Vendor: r.vendor,
      FailureCause: r.failureCause,
      LastAttempt: r.lastAttempt,
      FailureCount: r.failureCount,
    }));

    // Trend data
    const trendData = activityTrend.map((point) => ({
      Timestamp: point.timestamp,
      Success: point.success,
      Failed: point.failed,
      Running: point.running,
    }));

    // Reports list
    const reportsData = filteredReports.map((r) => ({
      Title: r.title,
      Category: r.category,
      Status: r.status,
      LastGenerated: new Date(r.lastGenerated).toLocaleString(),
      Frequency: r.frequency,
      FileSize: r.fileSize,
    }));

    if (exportFormat === "csv") {
      // Export as CSV
      const csvContent = [
        // KPI section
        ["REPORT SUMMARY METRICS"],
        ["Metric", "Value", "Change", "Status"],
        ...kpiData.map((k) => [k.Metric, k.Value, k.Change, k.Status]),
        [],
        // Reports section
        ["REPORT LIBRARY"],
        ["Title", "Category", "Status", "Last Generated", "Frequency", "File Size"],
        ...reportsData.map((r) => [r.Title, r.Category, r.Status, r.LastGenerated, r.Frequency, r.FileSize]),
        [],
        // Failures section
        ["TOP FAILED REPORTS"],
        ["Report", "Vendor", "Failure Cause", "Last Attempt", "Failure Count"],
        ...failureData.map((f) => [f.Report, f.Vendor, f.FailureCause, f.LastAttempt, f.FailureCount]),
        [],
        // Trends section
        ["GENERATION TRENDS"],
        ["Timestamp", "Success", "Failed", "Running"],
        ...trendData.map((t) => [t.Timestamp, t.Success, t.Failed, t.Running]),
      ]
        .map((row) => row.map((cell) => `"${cell}"`).join(","))
        .join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `Reports-${timestamp}.csv`);
      link.click();
    } else {
      // Export as Excel (XLSX)
      const wb = XLSX.utils.book_new();

      const kpiSheet = XLSX.utils.json_to_sheet(kpiData);
      XLSX.utils.book_append_sheet(wb, kpiSheet, "Summary Metrics");

      const reportsSheet = XLSX.utils.json_to_sheet(reportsData);
      XLSX.utils.book_append_sheet(wb, reportsSheet, "Report Library");

      const failureSheet = XLSX.utils.json_to_sheet(failureData);
      XLSX.utils.book_append_sheet(wb, failureSheet, "Failures");

      const trendSheet = XLSX.utils.json_to_sheet(trendData);
      XLSX.utils.book_append_sheet(wb, trendSheet, "Trends");

      XLSX.writeFile(wb, `Reports-${timestamp}.xlsx`);
    }

    toast({
      title: "Export successful",
      description: `Reports data has been exported as ${exportFormat.toUpperCase()}`,
    });
  };

  const getFailureRateColor = (failureRate: number) => {
    if (failureRate < 2) return "text-green-600 bg-green-500/10";
    if (failureRate < 5) return "text-orange-600 bg-orange-500/10";
    return "text-red-600 bg-red-500/10";
  };

  const failureRate = kpis.failed_reports.value > 0 ? 
    (kpis.failed_reports.value / (kpis.failed_reports.value + kpis.reports_generated.value)) * 100 : 0;

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
                Report observability layer – visibility into generation, freshness, and delivery
              </p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value as "xlsx" | "csv")}
                className="px-3 py-2 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-primary/50"
              >
                <option value="xlsx">Excel (.xlsx)</option>
                <option value="csv">CSV (.csv)</option>
              </select>
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Global Filters */}
        <FilterPanel />

        {/* Report-Specific Filters */}
        <div className="px-8 py-4 border-t border-border/50 space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Report Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <SearchableDropdown
              label="Report Category"
              options={REPORT_CATEGORIES}
              selected={reportFilters.categories}
              onChange={(selected) => setReportFilters(prev => ({ ...prev, categories: selected }))}
              placeholder="All categories"
            />
            <SearchableDropdown
              label="Report Status"
              options={REPORT_STATUSES}
              selected={reportFilters.statuses}
              onChange={(selected) => setReportFilters(prev => ({ ...prev, statuses: selected }))}
              placeholder="All statuses"
            />
            <SearchableDropdown
              label="Schedule Type"
              options={SCHEDULE_TYPES}
              selected={reportFilters.scheduleTypes}
              onChange={(selected) => setReportFilters(prev => ({ ...prev, scheduleTypes: selected }))}
              placeholder="All types"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-8 py-8 space-y-10">

        {/* Section 3.10: Smart Insights Panel */}
        <SmartInsightsPanel
          insights={smartInsights}
          onInsightClick={(insight) => {
            if (insight.relatedCategory) {
              setReportFilters(prev => ({
                ...prev,
                categories: prev.categories.includes(insight.relatedCategory!)
                  ? prev.categories
                  : [...prev.categories, insight.relatedCategory],
              }));
            }
          }}
        />

        {/* Section 3.3: Executive Summary Cards */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Executive Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              icon={FileText}
              label="Total Reports Available"
              value={kpis.available_reports.value}
              unit="templates"
              change={kpis.available_reports.change}
              status={kpis.available_reports.status}
              direction={kpis.available_reports.change > 0 ? "up" : "down"}
            />
            <KPICard
              icon={TrendingUp}
              label="Reports Generated"
              value={kpis.reports_generated.value}
              unit="successfully"
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
            <div className={cn(
              "card-elevated rounded-xl border border-border/50 p-6 flex flex-col justify-between",
              failureRate < 2 ? "bg-green-500/5" : failureRate < 5 ? "bg-orange-500/5" : "bg-red-500/5"
            )}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Failed Reports</p>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-bold text-foreground">{kpis.failed_reports.value}</span>
                    <span className={cn("text-xs font-semibold px-2.5 py-1 rounded", getFailureRateColor(failureRate))}>
                      {failureRate.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <AlertCircle className={cn(
                  "w-8 h-8",
                  failureRate < 2 ? "text-green-600" : failureRate < 5 ? "text-orange-600" : "text-red-600"
                )} />
              </div>
              <div className="mt-3 pt-3 border-t border-border/50">
                <p className={cn(
                  "text-xs font-semibold",
                  kpis.failed_reports.change > 0 ? "text-red-600" : "text-green-600"
                )}>
                  {kpis.failed_reports.change > 0 ? "↑" : "↓"} {Math.abs(kpis.failed_reports.change)}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3.4: Report Freshness Heatmap */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Report Freshness Heatmap</h2>
          <div className="card-elevated rounded-xl border border-border/50 p-6 overflow-x-auto">
            <div className="min-w-full">
              {/* Header with dates */}
              <div className="flex gap-4 mb-4">
                <div className="w-48 flex-shrink-0 font-semibold text-sm text-foreground">Category</div>
                <div className="flex gap-2">
                  {freshnessHeatmap[0]?.dates.map((_, idx) => (
                    <div key={idx} className="w-24 text-center text-xs text-muted-foreground">
                      {freshnessHeatmap[0].dates[idx].date}
                    </div>
                  ))}
                </div>
              </div>

              {/* Heatmap rows */}
              {freshnessHeatmap.map((row) => (
                <div key={row.category} className="flex gap-4 mb-3">
                  <div className="w-48 flex-shrink-0 text-sm text-foreground">{row.category}</div>
                  <div className="flex gap-2">
                    {row.dates.map((cell, idx) => (
                      <div
                        key={idx}
                        className={cn(
                          "w-24 h-10 rounded flex items-center justify-center text-xs font-semibold transition-colors",
                          cell.status === "green"
                            ? "bg-green-500/20 text-green-700 border border-green-500/30"
                            : cell.status === "orange"
                              ? "bg-orange-500/20 text-orange-700 border border-orange-500/30"
                              : "bg-red-500/20 text-red-700 border border-red-500/30"
                        )}
                        title={`${cell.status === "green" ? "On time" : cell.status === "orange" ? "Delayed" : "Missing"}`}
                      >
                        {cell.status === "green" ? "✓" : cell.status === "orange" ? "⚠" : "✗"}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section 3.5: Report Generation Trend */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Report Generation Trend</h2>
          <div className="card-elevated rounded-xl border border-border/50 p-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={activityTrend} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
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
                  formatter={(value) => [value, ""]}
                />
                <Legend />
                <Bar dataKey="success" stackId="a" fill="#22c55e" name="Success" />
                <Bar dataKey="failed" stackId="a" fill="#ef4444" name="Failed" />
                <Bar dataKey="running" stackId="a" fill="#3b82f6" name="Running" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Section 3.6: Failure Intelligence Panel */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-foreground">Failure Intelligence</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Failures by Vendor */}
            <div className="card-elevated rounded-xl border border-border/50 p-6">
              <h3 className="text-lg font-bold text-foreground mb-4">Failures by Vendor</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={failuresByVendor} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" style={{ fontSize: "12px" }} />
                  <YAxis dataKey="vendor" type="category" stroke="hsl(var(--muted-foreground))" style={{ fontSize: "12px" }} width={80} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="count" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Failures by Technology */}
            <div className="card-elevated rounded-xl border border-border/50 p-6">
              <h3 className="text-lg font-bold text-foreground mb-4">Failures by Technology</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={failuresByTech}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ technology, percentage }) => `${technology} ${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {failuresByTech.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Failures by Region */}
            <div className="card-elevated rounded-xl border border-border/50 p-6">
              <h3 className="text-lg font-bold text-foreground mb-4">Failures by Region</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={failuresByRegion}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="region" stroke="hsl(var(--muted-foreground))" style={{ fontSize: "12px" }} />
                  <YAxis stroke="hsl(var(--muted-foreground))" style={{ fontSize: "12px" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="count" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Failed Reports Table */}
          <div className="card-elevated rounded-xl border border-border/50 p-6">
            <h3 className="text-lg font-bold text-foreground mb-4">Top Failed Reports</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Report</th>
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Vendor</th>
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Failure Cause</th>
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Last Attempt</th>
                    <th className="text-right py-3 px-4 font-semibold text-muted-foreground">Count</th>
                  </tr>
                </thead>
                <tbody>
                  {topFailedReports.map((report, idx) => (
                    <tr key={idx} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 text-foreground">{report.report}</td>
                      <td className="py-3 px-4 text-muted-foreground">{report.vendor}</td>
                      <td className="py-3 px-4 text-red-600">{report.failureCause}</td>
                      <td className="py-3 px-4 text-muted-foreground">{report.lastAttempt}</td>
                      <td className="py-3 px-4 text-right font-semibold text-foreground">{report.failureCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Section 3.7: Report Usage Analytics */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-foreground">Report Usage Analytics</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Most Downloaded Reports */}
            <div className="card-elevated rounded-xl border border-border/50 p-6">
              <h3 className="text-lg font-bold text-foreground mb-4">Most Downloaded Reports</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={mostDownloaded} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" style={{ fontSize: "12px" }} />
                  <YAxis dataKey="report" type="category" stroke="hsl(var(--muted-foreground))" style={{ fontSize: "11px" }} width={130} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="downloads" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Downloads by User Role */}
            <div className="card-elevated rounded-xl border border-border/50 p-6">
              <h3 className="text-lg font-bold text-foreground mb-4">Downloads by User Role</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={downloadsByRole.slice(-14)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="timestamp" stroke="hsl(var(--muted-foreground))" style={{ fontSize: "12px" }} />
                  <YAxis stroke="hsl(var(--muted-foreground))" style={{ fontSize: "12px" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="noc" stackId="a" fill="#3b82f6" name="NOC" />
                  <Bar dataKey="rf" stackId="a" fill="#8b5cf6" name="RF" />
                  <Bar dataKey="management" stackId="a" fill="#ec4899" name="Management" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Average Download Time Trend */}
          <div className="card-elevated rounded-xl border border-border/50 p-6">
            <h3 className="text-lg font-bold text-foreground mb-4">Avg Download Time Trend</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={downloadTrend.slice(-14)}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="timestamp" stroke="hsl(var(--muted-foreground))" style={{ fontSize: "12px" }} />
                <YAxis stroke="hsl(var(--muted-foreground))" style={{ fontSize: "12px" }} label={{ value: "ms", angle: -90, position: "insideLeft" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  formatter={(value) => [`${value}ms`, "Download Time"]}
                />
                <Line
                  type="monotone"
                  dataKey="avgTime"
                  stroke="#10b981"
                  dot={false}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Section 3.8: Report Library Tiles */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Report Library</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReports.map((report) => (
              <div
                key={report.id}
                className="card-elevated rounded-xl border border-border/50 p-6 hover:shadow-md transition-shadow flex flex-col"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-bold text-foreground text-base mb-1">{report.title}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-2">{report.description}</p>
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

                <div className="space-y-2 py-3 border-t border-border/50 border-b border-border/50">
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
                    <span className="text-muted-foreground">Size:</span>
                    <span className="font-medium text-foreground">{report.fileSize}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Schedule:</span>
                    <span className="px-2 py-1 rounded bg-muted text-foreground capitalize font-medium text-xs">
                      {report.schedule}
                    </span>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <button className="w-full px-3 py-2 bg-primary/10 hover:bg-primary/20 text-primary text-sm font-medium rounded transition-colors">
                    Download Latest
                  </button>
                  <button
                    onClick={() => {
                      setSelectedReport(report);
                      setIsHistoryModalOpen(true);
                    }}
                    className="w-full px-3 py-2 bg-muted hover:bg-muted/70 text-foreground text-sm font-medium rounded transition-colors"
                  >
                    View History
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Report History Modal (3.9) */}
      {selectedReport && (
        <ReportHistoryModal
          isOpen={isHistoryModalOpen}
          onClose={() => {
            setIsHistoryModalOpen(false);
            setSelectedReport(null);
          }}
          reportTitle={selectedReport.title}
          executions={generateReportExecutionHistory(selectedReport.id)}
        />
      )}
    </div>
  );
}
