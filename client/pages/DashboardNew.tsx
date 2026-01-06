import { useState, useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  Download,
  ChevronDown,
  CheckCircle2,
  XCircle,
  Clock,
  Zap,
} from "lucide-react";
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
import { cn } from "@/lib/utils";

interface KPIValue {
  value: string | number;
  status: "healthy" | "degraded" | "critical" | "normal";
  change?: number;
}

type ChartType = "line" | "bar" | "pie";

// Calculate KPI values based on filters (mock logic with filter-aware simulation)
const calculateKPIValue = (kpiId: string, filters: any): KPIValue => {
  // Base values when no filters are applied
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

  // Apply filter multipliers to simulate different data
  let filterMultiplier = 1;
  
  // Vendor filter impact
  if (filters.vendors.length > 0) {
    filterMultiplier *= 0.85; // Reduce by 15% per vendor filter
  }
  
  // Technology filter impact
  if (filters.technologies.length > 0) {
    filterMultiplier *= 0.9; // Reduce by 10% per tech filter
  }
  
  // Region filter impact
  if (filters.regions.length > 0) {
    filterMultiplier = 1 - (filters.regions.length * 0.15); // 15% per region
    filterMultiplier = Math.max(0.4, filterMultiplier); // Min 40% of base value
  }
  
  // Country filter impact
  if (filters.countries.length > 0) {
    filterMultiplier *= 0.95;
  }

  // Apply multiplier to count-based KPIs
  if (typeof calculatedValue === "number" && ["total_sites", "active_sites", "down_sites", "incident_count", "data_throughput"].includes(kpiId)) {
    calculatedValue = Math.round(calculatedValue * filterMultiplier);
  } else if (typeof calculatedValue === "number" && ["uptime", "success_rate", "packet_loss", "network_availability", "call_completion_rate", "network_health"].includes(kpiId)) {
    // For percentages, adjust slightly based on filters
    calculatedValue = Math.max(85, calculatedValue - (filters.vendors.length * 0.5) - (filters.technologies.length * 0.3));
  }

  // Adjust change based on filters
  if (filters.vendors.length > 0 || filters.technologies.length > 0) {
    change *= 0.6; // Reduce volatility when filters are applied
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

  // Mock data for charts (filter-aware)
  const trafficData = useMemo(() => [
    { time: "00:00", traffic: 2.1 * (1 - filters.vendors.length * 0.1), success: 98.2 - filters.vendors.length * 0.5 },
    { time: "04:00", traffic: 1.8 * (1 - filters.vendors.length * 0.1), success: 99.1 - filters.vendors.length * 0.5 },
    { time: "08:00", traffic: 3.4 * (1 - filters.vendors.length * 0.1), success: 97.8 - filters.vendors.length * 0.5 },
    { time: "12:00", traffic: 3.9 * (1 - filters.vendors.length * 0.1), success: 98.9 - filters.vendors.length * 0.5 },
    { time: "16:00", traffic: 3.2 * (1 - filters.vendors.length * 0.1), success: 99.2 - filters.vendors.length * 0.5 },
    { time: "20:00", traffic: 2.7 * (1 - filters.vendors.length * 0.1), success: 98.5 - filters.vendors.length * 0.5 },
  ], [filters]);

  const regionData = useMemo(() => {
    const baseData = [
      { region: "North", sites: 684 },
      { region: "South", sites: 512 },
      { region: "East", sites: 721 },
      { region: "West", sites: 598 },
      { region: "Central", sites: 332 },
    ];
    // Apply region filter
    const multiplier = filters.regions.length > 0 ? 0.7 : 1;
    return baseData.map(d => ({ ...d, sites: Math.round(d.sites * multiplier) }));
  }, [filters]);

  const vendorData = useMemo(() => {
    const baseData = [
      { vendor: "Ericsson", sites: 892, fill: "#7c3aed" },
      { vendor: "Huawei", sites: 756, fill: "#3b82f6" },
      { vendor: "Nokia", sites: 634, fill: "#22c55e" },
      { vendor: "Samsung", sites: 389, fill: "#f59e0b" },
      { vendor: "Others", sites: 176, fill: "#ef4444" },
    ];
    // Apply vendor filter
    const multiplier = filters.vendors.length > 0 ? 0.8 : 1;
    return baseData.map(d => ({ ...d, sites: Math.round(d.sites * multiplier) }));
  }, [filters]);

  // AI Engine Actions data (filter-aware)
  const aiActionsData = useMemo(() => {
    const baseTotal = 342;
    const multiplier = 1 - (filters.vendors.length * 0.1 + filters.technologies.length * 0.05);
    const total = Math.round(baseTotal * multiplier);
    const successful = Math.round(total * 0.87);
    const failed = total - successful;
    return { totalActions: total, successfulActions: successful, failedActions: failed };
  }, [filters]);

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

  const getStatusIcon = (change?: number) => {
    if (!change) return null;
    return change < 0 ? (
      <TrendingDown className="w-4 h-4 text-status-healthy" />
    ) : (
      <TrendingUp className="w-4 h-4 text-status-degraded" />
    );
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

    // Build CSV content
    const csvHeader = ["NETWORK OPERATIONS DASHBOARD EXPORT"];
    const csvSubHeader = [
      `Generated: ${new Date().toLocaleString()}`,
      "",
      "APPLIED FILTERS:",
    ];
    const csvFiltersRows = Object.entries(filtersApplied).map(([key, value]) => [
      key,
      value,
    ]);

    const csvKPIHeader = ["", "", "SELECTED KPI VALUES:"];
    const csvKPILabels = ["KPI", "Value", "Unit", "Status"];
    const csvKPIRows = selectedKPIs.map((kpi) => [
      kpi.KPI,
      kpi.Value,
      kpi.Unit,
      kpi.Status,
    ]);

    const allRows = [
      csvHeader,
      csvSubHeader,
      ...csvFiltersRows,
      csvKPIHeader,
      [csvKPILabels],
      ...csvKPIRows,
    ];

    const csvContent = allRows
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `dashboard-export-${new Date().getTime()}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export successful",
      description: `Downloaded dashboard data as Excel CSV`,
    });
  };

  const selectedKPIs = selectedKPIIds
    .map((id) => getKPIById(id))
    .filter(Boolean);

  // Helper function to render charts
  const renderChart = (chartType: ChartType, data: any, dataKey: string, isRegion = false) => {
    switch (chartType) {
      case "line":
        return (
          <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey={isRegion ? "region" : "time"} stroke="hsl(var(--muted-foreground))" style={{ fontSize: "12px" }} />
            <YAxis stroke="hsl(var(--muted-foreground))" style={{ fontSize: "12px" }} />
            <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
            <Legend />
            {isRegion ? (
              <Line type="monotone" dataKey="sites" stroke="#3b82f6" strokeWidth={2} dot={{ fill: "#3b82f6", r: 4 }} />
            ) : (
              <>
                <Line type="monotone" dataKey="traffic" stroke="#7c3aed" strokeWidth={2} dot={{ fill: "#7c3aed", r: 4 }} name="Traffic (Tbps)" />
                <Line type="monotone" dataKey="success" stroke="#22c55e" strokeWidth={2} dot={{ fill: "#22c55e", r: 4 }} name="Success Rate (%)" />
              </>
            )}
          </LineChart>
        );
      case "bar":
        return (
          <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey={isRegion ? "region" : "time"} stroke="hsl(var(--muted-foreground))" style={{ fontSize: "12px" }} />
            <YAxis stroke="hsl(var(--muted-foreground))" style={{ fontSize: "12px" }} />
            <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
            <Legend />
            {isRegion ? (
              <Bar dataKey="sites" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            ) : (
              <>
                <Bar dataKey="traffic" fill="#7c3aed" radius={[8, 8, 0, 0]} />
                <Bar dataKey="success" fill="#22c55e" radius={[8, 8, 0, 0]} />
              </>
            )}
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
              label={({ vendor, sites, region }) => `${vendor || region}: ${sites}`}
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
        {/* Page Title */}
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
            title="Export as Excel"
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
        {/* KPI Selection Bar */}
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

          {/* KPI Selection Dropdown */}
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
                <div className="flex items-start justify-between mb-3">
                  <div
                    className={cn(
                      "p-2.5 rounded-lg",
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
                  {getStatusIcon(kpiValue.change)}
                </div>

                {/* KPI Value Display */}
                <div className="mb-3">
                  <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wide">
                    {kpi.label}
                  </p>
                  <div className="flex items-baseline gap-2 mb-1">
                    <p
                      className={cn(
                        "text-3xl font-bold",
                        getStatusColor(kpiValue.status)
                      )}
                    >
                      {kpiValue.value}
                    </p>
                    {kpiValue.change !== undefined && (
                      <span
                        className={cn(
                          "text-xs font-semibold",
                          kpiValue.change < 0
                            ? "text-status-healthy"
                            : "text-status-degraded"
                        )}
                      >
                        {kpiValue.change < 0 ? "↓" : "↑"} {Math.abs(kpiValue.change).toFixed(1)}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ===== ANALYTICS SECTIONS ===== */}
      <AnalyticsSections />

      {/* ===== AI ENGINE ACTIONS SECTION (2-COLUMN LAYOUT) ===== */}
      <div className="card-elevated rounded-xl border border-border/50 p-6">
        <div className="mb-6 space-y-1">
          <h2 className="text-2xl font-bold text-foreground">AI Engine Actions</h2>
          <p className="text-sm text-muted-foreground">Automated network operations and resolution activities</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT SIDE: Visual Element */}
          <div className="flex items-center justify-center p-8 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 border border-border/50 min-h-[300px]">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-4 rounded-full bg-primary/20">
                  <Zap className="w-12 h-12 text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">AI-Powered Automation</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                Real-time automation engine detecting and resolving network anomalies autonomously
              </p>
            </div>
          </div>

          {/* RIGHT SIDE: Action Metrics Cards */}
          <div className="space-y-4">
            {/* Total Actions */}
            <div className="p-6 rounded-xl border border-border/50 bg-card">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wide">
                    Total Actions Taken
                  </p>
                  <p className="text-3xl font-bold text-foreground">{aiActionsData.totalActions}</p>
                </div>
                <div className="p-2.5 rounded-lg bg-primary/10">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
              </div>
            </div>

            {/* Successful Actions */}
            <div className="p-6 rounded-xl border border-border/50 bg-card">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wide">
                    Successful Actions
                  </p>
                  <p className="text-3xl font-bold text-status-healthy">{aiActionsData.successfulActions}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {((aiActionsData.successfulActions / aiActionsData.totalActions) * 100).toFixed(1)}% success rate
                  </p>
                </div>
                <div className="p-2.5 rounded-lg bg-status-healthy/10">
                  <CheckCircle2 className="w-5 h-5 text-status-healthy" />
                </div>
              </div>
            </div>

            {/* Failed Actions */}
            <div className="p-6 rounded-xl border border-border/50 bg-card">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wide">
                    Failed Actions
                  </p>
                  <p className="text-3xl font-bold text-status-critical">{aiActionsData.failedActions}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {((aiActionsData.failedActions / aiActionsData.totalActions) * 100).toFixed(1)}% failure rate
                  </p>
                </div>
                <div className="p-2.5 rounded-lg bg-status-critical/10">
                  <XCircle className="w-5 h-5 text-status-critical" />
                </div>
              </div>
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
              <option value="pie">Pie Chart</option>
            </select>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          {renderChart(trafficChartType, trafficData, "traffic")}
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
              <option value="line">Line Chart</option>
              <option value="bar">Bar Chart</option>
              <option value="pie">Pie Chart</option>
            </select>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          {renderChart(regionChartType, regionData, "sites", true)}
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
              <option value="line">Line Chart</option>
              <option value="bar">Bar Chart</option>
              <option value="pie">Pie Chart</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ResponsiveContainer width="100%" height={300}>
              {renderChart(vendorChartType, vendorData, "sites")}
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
