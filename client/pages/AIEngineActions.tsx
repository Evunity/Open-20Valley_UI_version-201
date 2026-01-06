import { useState, useMemo } from "react";
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
import { useGlobalFilters } from "@/hooks/useGlobalFilters";
import { useToast } from "@/hooks/use-toast";
import { Download, Clock, CheckCircle2, XCircle } from "lucide-react";
import * as XLSX from "xlsx";
import {
  generateAIActionsData,
  generateAIActionsSummary,
  generateAIActionsDetailList,
} from "@/utils/dashboardData";
import { cn } from "@/lib/utils";

type ChartType = "line" | "bar" | "histogram";

export default function AIEngineActions() {
  const { toast } = useToast();
  const { filters } = useGlobalFilters();
  const [chartType, setChartType] = useState<ChartType>("bar");

  // Generate all data with memoization
  const aiActionsData = useMemo(() => generateAIActionsData(filters), [filters]);
  const aiSummary = useMemo(() => generateAIActionsSummary(filters), [filters]);
  const aiActionsDetailList = useMemo(() => generateAIActionsDetailList(filters), [filters]);

  const renderChart = (type: ChartType, data: any[]) => {
    switch (type) {
      case "line":
        return (
          <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" style={{ fontSize: "12px" }} />
            <YAxis stroke="hsl(var(--muted-foreground))" style={{ fontSize: "12px" }} />
            <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
            <Legend />
            <Line type="monotone" dataKey="successful" stroke="#22c55e" strokeWidth={2} name="Successful" />
            <Line type="monotone" dataKey="failed" stroke="#ef4444" strokeWidth={2} name="Failed" />
          </LineChart>
        );
      case "bar":
        return (
          <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" style={{ fontSize: "12px" }} />
            <YAxis stroke="hsl(var(--muted-foreground))" style={{ fontSize: "12px" }} />
            <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
            <Legend />
            <Bar dataKey="successful" fill="#22c55e" radius={[8, 8, 0, 0]} name="Successful" />
            <Bar dataKey="failed" fill="#ef4444" radius={[8, 8, 0, 0]} name="Failed" />
          </BarChart>
        );
      case "histogram":
        return (
          <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" style={{ fontSize: "12px" }} />
            <YAxis stroke="hsl(var(--muted-foreground))" style={{ fontSize: "12px" }} />
            <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
            <Legend />
            <Bar dataKey="successful" fill="#22c55e" name="Successful Distribution" />
            <Bar dataKey="failed" fill="#ef4444" name="Failed Distribution" />
          </BarChart>
        );
    }
  };

  const exportToExcel = () => {
    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();

    // Sheet data with sections
    const sheetData: any[] = [];

    // Header
    sheetData.push(["AI ENGINE ACTIONS EXPORT"]);
    sheetData.push([`Generated: ${new Date().toLocaleString()}`]);
    sheetData.push([]);

    // Summary metrics section
    sheetData.push(["SUMMARY METRICS:"]);
    sheetData.push(["Total Actions", aiSummary.totalActions]);
    sheetData.push(["Successful Actions", aiSummary.successfulActions]);
    sheetData.push(["Failed Actions", aiSummary.failedActions]);
    sheetData.push(["Success Rate", `${((aiSummary.successfulActions / aiSummary.totalActions) * 100).toFixed(1)}%`]);
    sheetData.push([]);

    // Detailed actions section
    sheetData.push(["DETAILED ACTION LIST:"]);
    sheetData.push(["Action Name", "Time", "Severity", "Status"]);
    aiActionsDetailList.forEach((action) => {
      sheetData.push([action.name, action.time, action.severity, action.status]);
    });

    const ws = XLSX.utils.aoa_to_sheet(sheetData);

    // Set column widths
    ws["!cols"] = [
      { wch: 25 },
      { wch: 20 },
      { wch: 15 },
      { wch: 15 },
    ];

    XLSX.utils.book_append_sheet(wb, ws, "AI Actions");

    // Generate file
    const fileName = `ai-actions-export-${new Date().getTime()}.xlsx`;
    XLSX.writeFile(wb, fileName);

    toast({
      title: "Export successful",
      description: "Downloaded AI actions data as Excel file",
    });
  };

  return (
    <div className="space-y-8 pb-6">
      {/* ===== HEADER SECTION ===== */}
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold text-foreground">AI Engine Actions</h1>
            <p className="text-muted-foreground">
              Detailed automated network operations and resolution activities
            </p>
          </div>
          <button
            onClick={exportToExcel}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium"
          >
            <Download className="w-4 h-4" />
            Export to Excel
          </button>
        </div>

        {/* Global Filter Panel */}
        <FilterPanel />
      </div>

      {/* ===== SUMMARY METRICS ===== */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Actions */}
        <div className="p-6 rounded-xl border border-border/50 bg-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wide">
                Total Actions
              </p>
              <p className="text-3xl font-bold text-foreground">{aiSummary.totalActions}</p>
            </div>
            <div className="p-2.5 rounded-lg bg-primary/10">
              <Clock className="w-5 h-5 text-primary" />
            </div>
          </div>
        </div>

        {/* Successful */}
        <div className="p-6 rounded-xl border border-border/50 bg-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wide">
                Successful
              </p>
              <p className="text-3xl font-bold text-status-healthy">{aiSummary.successfulActions}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {((aiSummary.successfulActions / aiSummary.totalActions) * 100).toFixed(1)}% success
              </p>
            </div>
            <div className="p-2.5 rounded-lg bg-status-healthy/10">
              <CheckCircle2 className="w-5 h-5 text-status-healthy" />
            </div>
          </div>
        </div>

        {/* Failed */}
        <div className="p-6 rounded-xl border border-border/50 bg-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wide">
                Failed
              </p>
              <p className="text-3xl font-bold text-status-critical">{aiSummary.failedActions}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {((aiSummary.failedActions / aiSummary.totalActions) * 100).toFixed(1)}% failure
              </p>
            </div>
            <div className="p-2.5 rounded-lg bg-status-critical/10">
              <XCircle className="w-5 h-5 text-status-critical" />
            </div>
          </div>
        </div>

        {/* Success Rate */}
        <div className="p-6 rounded-xl border border-border/50 bg-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wide">
                Success Rate
              </p>
              <p className="text-3xl font-bold text-foreground">
                {((aiSummary.successfulActions / aiSummary.totalActions) * 100).toFixed(1)}%
              </p>
            </div>
            <div className="p-2.5 rounded-lg bg-primary/10">
              <CheckCircle2 className="w-5 h-5 text-primary" />
            </div>
          </div>
        </div>
      </div>

      {/* ===== CHART VISUALIZATION ===== */}
      <div className="card-elevated rounded-xl border border-border/50 p-6">
        <div className="mb-6 space-y-1">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-foreground">Actions Timeline</h2>
              <p className="text-sm text-muted-foreground">Success and failure distribution over time</p>
            </div>
            <select
              value={chartType}
              onChange={(e) => setChartType(e.target.value as ChartType)}
              className="px-3 py-1 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-primary/50"
            >
              <option value="bar">Bar Chart</option>
              <option value="line">Line Chart</option>
              <option value="histogram">Histogram</option>
            </select>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          {renderChart(chartType, aiActionsData)}
        </ResponsiveContainer>
      </div>

      {/* ===== DETAILED ACTION LIST ===== */}
      <div className="card-elevated rounded-xl border border-border/50 p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground">Action Details</h2>
          <p className="text-sm text-muted-foreground">
            Complete list of {aiActionsDetailList.length} actions
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Action Name</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Time</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Severity</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {aiActionsDetailList.map((action) => (
                <tr
                  key={action.id}
                  className="border-b border-border/30 hover:bg-muted/50 transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-foreground">{action.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{action.time}</td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "px-2 py-1 rounded text-xs font-semibold",
                        action.severity === "HIGH"
                          ? "bg-status-critical/20 text-status-critical"
                          : action.severity === "MED"
                          ? "bg-status-degraded/20 text-status-degraded"
                          : "bg-status-healthy/20 text-status-healthy"
                      )}
                    >
                      {action.severity}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "px-2 py-1 rounded text-xs font-semibold",
                        action.status === "Success"
                          ? "bg-status-healthy/20 text-status-healthy"
                          : action.status === "Failed"
                          ? "bg-status-critical/20 text-status-critical"
                          : "bg-primary/20 text-primary"
                      )}
                    >
                      {action.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
