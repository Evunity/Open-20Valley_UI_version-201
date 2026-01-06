import { useState, useMemo } from "react";
import {
  Download,
  ChevronDown,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
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
import AnalyticsSections from "@/components/AnalyticsSections";
import { useGlobalFilters } from "@/hooks/useGlobalFilters";
import { useToast } from "@/hooks/use-toast";
import { AVAILABLE_KPIS, getKPIById } from "@/constants/kpis";
import {
  generateTrafficData,
  generateRegionData,
  generateVendorData,
  generateAIActionsData,
  generateAIActionsSummary,
  generateAIActionsDetailList,
  calculateFilterMultiplier,
  calculateDateMultiplier,
  getDaysDifference,
} from "@/utils/dashboardData";
import { cn } from "@/lib/utils";

interface KPIValue {
  value: string | number;
  status: "healthy" | "degraded" | "critical" | "normal";
  change?: number;
}

type ChartType = "line" | "bar" | "pie" | "histogram";

// Calculate KPI values based on filters AND date range
const calculateKPIValue = (kpiId: string, filters: any): KPIValue => {
  const baseValues: Record<string, { value: number | string; unit: string; status: "healthy" | "degraded" | "critical" | "normal"; change: number }> = {
    total_sites: { value: 2847, unit: "", status: "healthy", change: -2.1 },
    active_sites: { value: 2721, unit: "", status: "healthy", change: -0.8 },
    down_sites: { value: 126, unit: "", status: "critical", change: 8.2 },
    uptime: { value: 99.87, unit: "%", status: "healthy", change: 0.15 },
    avg_latency: { value: 42, unit: "ms", status: "normal", change: 5.2 },
    success_rate: { value: 98.9, unit: "%", status: "healthy", change: 0.3 },
    packet_loss: { value: 0.12, unit: "%", status: "healthy", change: -0.05 },
    network_availability: { value: 99.92, unit: "%", status: "healthy", change: 0.08 },
    call_completion_rate: { value: 97.45, unit: "%", status: "healthy", change: 1.2 },
    data_throughput: { value: 3.42, unit: "Tbps", status: "healthy", change: 2.3 },
    incident_count: { value: 12, unit: "", status: "degraded", change: 3.0 },
    network_health: { value: 94.2, unit: "%", status: "healthy", change: 0.5 },
  };

  const base = baseValues[kpiId] || { value: "N/A", unit: "", status: "normal", change: 0 };
  let calculatedValue = typeof base.value === "number" ? base.value : base.value;
  let status = base.status;
  let change = base.change;

  // Apply filter multiplier
  const filterMultiplier = calculateFilterMultiplier(filters);
  const dateMultiplier = calculateDateMultiplier(filters);
  const totalMultiplier = filterMultiplier * dateMultiplier;

  // Apply multipliers to count-based KPIs
  if (typeof calculatedValue === "number" && ["total_sites", "active_sites", "down_sites", "incident_count", "data_throughput"].includes(kpiId)) {
    calculatedValue = Math.round(calculatedValue * totalMultiplier);
  } else if (typeof calculatedValue === "number" && ["uptime", "success_rate", "packet_loss", "network_availability", "call_completion_rate", "network_health"].includes(kpiId)) {
    // For percentages, adjust slightly based on filters
    calculatedValue = Math.max(85, calculatedValue - (filters.vendors.length * 0.5) - (filters.technologies.length * 0.3));
  }

  // Adjust change based on filters
  if (filters.vendors.length > 0 || filters.technologies.length > 0) {
    change *= 0.6;
  }

  // Format the value with unit
  let formattedValue = String(calculatedValue);
  if (typeof calculatedValue === "number" && kpiId !== "incident_count") {
    if (["uptime", "success_rate", "packet_loss", "network_availability", "call_completion_rate", "network_health"].includes(kpiId)) {
      formattedValue = calculatedValue.toFixed(2) + base.unit;
    } else if (kpiId === "avg_latency") {
      formattedValue = Math.round(calculatedValue) + base.unit;
    } else if (kpiId === "data_throughput") {
      formattedValue = calculatedValue.toFixed(2) + base.unit;
    } else {
      formattedValue = calculatedValue.toLocaleString() + base.unit;
    }
  }

  return {
    value: formattedValue,
    status: status,
    change: change,
  };
};

export default function DashboardNew() {
  const { toast } = useToast();
  const { filters } = useGlobalFilters();
  const [selectedKPIIds, setSelectedKPIIds] = useState<string[]>([
    "total_sites",
    "active_sites",
    "uptime",
    "success_rate",
    "avg_latency",
    "network_health",
  ]);
  const [showKPISelector, setShowKPISelector] = useState(false);

  // Chart type states
  const [trafficChartType, setTrafficChartType] = useState<ChartType>("line");
  const [regionChartType, setRegionChartType] = useState<ChartType>("bar");
  const [vendorChartType, setVendorChartType] = useState<ChartType>("pie");
  const [aiChartType, setAiChartType] = useState<ChartType>("bar");

  // Generate all chart data with memoization (re-renders on filter change)
  const trafficData = useMemo(() => generateTrafficData(filters), [filters]);
  const regionData = useMemo(() => generateRegionData(filters), [filters]);
  const vendorData = useMemo(() => generateVendorData(filters), [filters]);
  const aiActionsData = useMemo(() => generateAIActionsData(filters), [filters]);
  const aiSummary = useMemo(() => generateAIActionsSummary(filters), [filters]);
  const aiActionsDetailList = useMemo(() => generateAIActionsDetailList(filters), [filters]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "text-status-healthy";
      case "degraded":
        return "text-status-degraded";
      case "critical":
        return "text-status-critical";
      default:
        return "text-foreground";
    }
  };


  const toggleKPISelection = (kpiId: string) => {
    setSelectedKPIIds((prev) =>
      prev.includes(kpiId) ? prev.filter((id) => id !== kpiId) : [...prev, kpiId]
    );
  };

  const exportToExcel = () => {
    const selectedKPIs = selectedKPIIds
      .map((id) => {
        const kpi = getKPIById(id);
        const kpiValue = calculateKPIValue(id, filters);
        return {
          KPI: kpi?.label || id,
          Value: kpiValue.value,
          Unit: kpi?.unit || "",
          Status: kpiValue.status,
        };
      });

    const filtersApplied = {
      Vendors: filters.vendors.length > 0 ? filters.vendors.join(", ") : "All",
      Technologies: filters.technologies.length > 0 ? filters.technologies.join(", ") : "All",
      Regions: filters.regions.length > 0 ? filters.regions.join(", ") : "All",
      Clusters: filters.clusters.length > 0 ? filters.clusters.join(", ") : "All",
      Countries: filters.countries.length > 0 ? filters.countries.join(", ") : "All",
      "Date Range":
        filters.dateRange.from && filters.dateRange.to
          ? `${new Date(filters.dateRange.from).toLocaleDateString()} - ${new Date(filters.dateRange.to).toLocaleDateString()}`
          : "All Time",
    };

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();

    // Sheet data with sections
    const sheetData: any[] = [];

    // Header
    sheetData.push(["NETWORK OPERATIONS DASHBOARD EXPORT"]);
    sheetData.push([`Generated: ${new Date().toLocaleString()}`]);
    sheetData.push([]);

    // Filters section
    sheetData.push(["APPLIED FILTERS:"]);
    Object.entries(filtersApplied).forEach(([key, value]) => {
      sheetData.push([key, value]);
    });
    sheetData.push([]);

    // KPI section
    sheetData.push(["SELECTED KPI VALUES:"]);
    sheetData.push(["KPI", "Value", "Unit", "Status"]);
    selectedKPIs.forEach((kpi) => {
      sheetData.push([kpi.KPI, kpi.Value, kpi.Unit, kpi.Status]);
    });

    const ws = XLSX.utils.aoa_to_sheet(sheetData);

    // Set column widths
    ws["!cols"] = [
      { wch: 25 },
      { wch: 20 },
      { wch: 15 },
      { wch: 15 },
    ];

    XLSX.utils.book_append_sheet(wb, ws, "Dashboard");

    // Generate file
    const fileName = `dashboard-export-${new Date().getTime()}.xlsx`;
    XLSX.writeFile(wb, fileName);

    toast({
      title: "Export successful",
      description: `Downloaded dashboard data as Excel file`,
    });
  };

  const selectedKPIs = selectedKPIIds
    .map((id) => getKPIById(id))
    .filter(Boolean);

  // Helper function to render charts based on type
  const renderChart = (chartType: ChartType, data: any[], dataKeys: string[]) => {
    switch (chartType) {
      case "line":
        return (
          <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" style={{ fontSize: "12px" }} />
            <YAxis stroke="hsl(var(--muted-foreground))" style={{ fontSize: "12px" }} />
            <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
            <Legend />
            {dataKeys.includes("traffic") && <Line type="monotone" dataKey="traffic" stroke="#7c3aed" strokeWidth={2} name="Traffic (Tbps)" />}
            {dataKeys.includes("success") && <Line type="monotone" dataKey="success" stroke="#22c55e" strokeWidth={2} name="Success Rate (%)" />}
            {dataKeys.includes("sites") && <Line type="monotone" dataKey="sites" stroke="#3b82f6" strokeWidth={2} name="Sites" />}
            {dataKeys.includes("successful") && <Line type="monotone" dataKey="successful" stroke="#22c55e" strokeWidth={2} name="Successful" />}
            {dataKeys.includes("failed") && <Line type="monotone" dataKey="failed" stroke="#ef4444" strokeWidth={2} name="Failed" />}
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
            {dataKeys.includes("traffic") && <Bar dataKey="traffic" fill="#7c3aed" radius={[8, 8, 0, 0]} name="Traffic" />}
            {dataKeys.includes("success") && <Bar dataKey="success" fill="#22c55e" radius={[8, 8, 0, 0]} name="Success Rate" />}
            {dataKeys.includes("sites") && <Bar dataKey="sites" fill="#3b82f6" radius={[8, 8, 0, 0]} name="Sites" />}
            {dataKeys.includes("successful") && <Bar dataKey="successful" fill="#22c55e" radius={[8, 8, 0, 0]} name="Successful" />}
            {dataKeys.includes("failed") && <Bar dataKey="failed" fill="#ef4444" radius={[8, 8, 0, 0]} name="Failed" />}
          </BarChart>
        );
      case "histogram":
        // Histogram is rendered as a Bar chart with tight grouping
        return (
          <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" style={{ fontSize: "12px" }} />
            <YAxis stroke="hsl(var(--muted-foreground))" style={{ fontSize: "12px" }} />
            <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
            <Legend />
            {dataKeys.includes("traffic") && <Bar dataKey="traffic" fill="#7c3aed" name="Traffic Distribution" />}
            {dataKeys.includes("success") && <Bar dataKey="success" fill="#22c55e" name="Success Distribution" />}
            {dataKeys.includes("sites") && <Bar dataKey="sites" fill="#3b82f6" name="Sites Distribution" />}
            {dataKeys.includes("successful") && <Bar dataKey="successful" fill="#22c55e" name="Successful Distribution" />}
            {dataKeys.includes("failed") && <Bar dataKey="failed" fill="#ef4444" name="Failed Distribution" />}
          </BarChart>
        );
      case "pie":
        return (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ region, vendor, sites }) => `${region || vendor}: ${sites}`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="sites"
            >
              {data.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={entry.fill || ["#7c3aed", "#3b82f6", "#22c55e", "#f59e0b", "#ef4444"][index % 5]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        );
    }
  };

  return (
    <div className="space-y-8 pb-6">
      {/* ===== HEADER SECTION ===== */}
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold text-foreground">
              Network Operations Dashboard
            </h1>
            <p className="text-muted-foreground">
              Real-time monitoring and AI-driven insights across your infrastructure
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

      {/* ===== KPI SECTION ===== */}
      <div>
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-foreground">
                Key Performance Indicators
              </h2>
              <p className="text-sm text-muted-foreground">
                Real-time metrics reflecting current filters ({selectedKPIIds.length} of {AVAILABLE_KPIS.length} displayed)
              </p>
            </div>
            <button
              onClick={() => setShowKPISelector(!showKPISelector)}
              className={cn(
                "inline-flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 text-sm font-medium",
                showKPISelector
                  ? "bg-primary/10 border-primary text-primary"
                  : "bg-background border-border text-foreground hover:border-primary/50"
              )}
            >
              <span>Customize KPIs</span>
              <ChevronDown
                className={cn(
                  "w-4 h-4 transition-transform",
                  showKPISelector ? "rotate-180" : ""
                )}
              />
            </button>
          </div>

          {showKPISelector && (
            <div className="p-4 rounded-lg border border-border bg-card grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {AVAILABLE_KPIS.map((kpi) => (
                <button
                  key={kpi.id}
                  onClick={() => toggleKPISelection(kpi.id)}
                  className={cn(
                    "p-3 rounded-lg border-2 transition-all text-left text-sm",
                    selectedKPIIds.includes(kpi.id)
                      ? "border-primary bg-primary/5 font-medium"
                      : "border-border bg-background hover:border-primary/50"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedKPIIds.includes(kpi.id)}
                      onChange={() => {}}
                      className="rounded"
                    />
                    <span className="line-clamp-2">{kpi.label}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {selectedKPIs.map((kpi) => {
            const kpiValue = calculateKPIValue(kpi.id, filters);
            const IconComponent = kpi.icon;

            return (
              <div
                key={kpi.id}
                className={cn(
                  "p-6 rounded-xl border transition-all duration-300 hover:shadow-lg hover:border-primary/50",
                  kpiValue.status === "healthy"
                    ? "border-status-healthy/20 bg-status-healthy/5"
                    : kpiValue.status === "critical"
                    ? "border-status-critical/20 bg-status-critical/5"
                    : "border-border bg-card"
                )}
              >
                <div className="mb-4">
                  <div
                    className={cn(
                      "p-2.5 rounded-lg w-fit",
                      kpiValue.status === "healthy"
                        ? "bg-status-healthy/10"
                        : kpiValue.status === "critical"
                        ? "bg-status-critical/10"
                        : "bg-muted"
                    )}
                  >
                    <IconComponent
                      className={cn(
                        "w-5 h-5",
                        kpiValue.status === "healthy"
                          ? "text-status-healthy"
                          : kpiValue.status === "critical"
                          ? "text-status-critical"
                          : "text-foreground"
                      )}
                    />
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                    {kpi.label}
                  </p>
                  <p
                    className={cn(
                      "text-3xl font-bold",
                      getStatusColor(kpiValue.status)
                    )}
                  >
                    {kpiValue.value}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ===== ANALYTICS SECTIONS ===== */}
      <AnalyticsSections />

      {/* ===== AI ENGINE ACTIONS (2-COLUMN LAYOUT) ===== */}
      <div id="ai-actions" className="card-elevated rounded-xl border border-border/50 p-6">
        <div className="mb-6 space-y-1">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-foreground">AI Engine Actions</h2>
              <p className="text-sm text-muted-foreground">Automated network operations and resolution activities</p>
            </div>
            <select
              value={aiChartType}
              onChange={(e) => setAiChartType(e.target.value as ChartType)}
              className="px-3 py-1 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-primary/50"
            >
              <option value="bar">Bar Chart</option>
              <option value="line">Line Chart</option>
              <option value="histogram">Histogram</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT: Chart Visualization */}
          <div className="rounded-lg border border-border/50 bg-background p-4">
            <ResponsiveContainer width="100%" height={350}>
              {renderChart(aiChartType, aiActionsData, ["successful", "failed"])}
            </ResponsiveContainer>
          </div>

          {/* RIGHT: AI Actions List */}
          <div className="rounded-lg border border-border/50 bg-background p-4 overflow-y-auto" style={{ maxHeight: "420px" }}>
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground mb-4 sticky top-0 bg-background py-2">Recent Actions</h3>
              {aiActionsDetailList.map((action) => (
                <div
                  key={action.id}
                  className="p-3 rounded-lg border border-border/30 bg-card hover:bg-card/80 transition-colors space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{action.name}</p>
                      <p className="text-xs text-muted-foreground">{action.time}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span
                        className={cn(
                          "px-2 py-1 rounded text-xs font-semibold whitespace-nowrap",
                          action.severity === "HIGH"
                            ? "bg-status-critical/20 text-status-critical"
                            : action.severity === "MED"
                            ? "bg-status-degraded/20 text-status-degraded"
                            : "bg-status-healthy/20 text-status-healthy"
                        )}
                      >
                        {action.severity}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        "text-xs font-medium px-2 py-1 rounded",
                        action.status === "Success"
                          ? "bg-status-healthy/20 text-status-healthy"
                          : action.status === "Failed"
                          ? "bg-status-critical/20 text-status-critical"
                          : "bg-primary/20 text-primary"
                      )}
                    >
                      {action.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ===== TRAFFIC TRENDS ===== */}
      <div className="card-elevated rounded-xl border border-border/50 p-6">
        <div className="mb-6 space-y-1">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-foreground">Traffic Trends</h3>
              <p className="text-sm text-muted-foreground">Last 24 hours</p>
            </div>
            <select
              value={trafficChartType}
              onChange={(e) => setTrafficChartType(e.target.value as ChartType)}
              className="px-3 py-1 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-primary/50"
            >
              <option value="line">Line Chart</option>
              <option value="bar">Bar Chart</option>
              <option value="histogram">Histogram</option>
            </select>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          {renderChart(trafficChartType, trafficData, ["traffic", "success"])}
        </ResponsiveContainer>
      </div>

      {/* ===== SITES BY REGION ===== */}
      <div className="card-elevated rounded-xl border border-border/50 p-6">
        <div className="mb-6 space-y-1">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-foreground">Sites by Region</h3>
              <p className="text-sm text-muted-foreground">Geographic distribution</p>
            </div>
            <select
              value={regionChartType}
              onChange={(e) => setRegionChartType(e.target.value as ChartType)}
              className="px-3 py-1 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-primary/50"
            >
              <option value="bar">Bar Chart</option>
              <option value="line">Line Chart</option>
              <option value="histogram">Histogram</option>
            </select>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          {renderChart(regionChartType, regionData, ["sites"])}
        </ResponsiveContainer>
      </div>

      {/* ===== VENDOR DISTRIBUTION ===== */}
      <div className="card-elevated rounded-xl border border-border/50 p-6">
        <div className="mb-6 space-y-1">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-foreground">Vendor Distribution</h3>
              <p className="text-sm text-muted-foreground">Equipment manufacturer breakdown</p>
            </div>
            <select
              value={vendorChartType}
              onChange={(e) => setVendorChartType(e.target.value as ChartType)}
              className="px-3 py-1 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-primary/50"
            >
              <option value="pie">Pie Chart</option>
              <option value="bar">Bar Chart</option>
              <option value="histogram">Histogram</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ResponsiveContainer width="100%" height={300}>
              {renderChart(vendorChartType, vendorData, ["sites"])}
            </ResponsiveContainer>
          </div>
          <div className="space-y-3 flex flex-col justify-center">
            {vendorData.map((vendor, idx) => (
              <div key={idx} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: vendor.fill }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{vendor.vendor}</p>
                  <p className="text-xs text-muted-foreground">{vendor.sites} sites</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
