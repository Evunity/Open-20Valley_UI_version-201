import { useState, useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  Download,
  ChevronDown,
  CheckCircle2,
  XCircle,
  Clock,
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

// Calculate KPI values based on filters (mock logic)
const calculateKPIValue = (kpiId: string, filters: any): KPIValue => {
  const baseValues: Record<string, KPIValue> = {
    total_sites: { value: "2,847", status: "healthy", change: -2.1 },
    active_sites: { value: "2,721", status: "healthy", change: -0.8 },
    down_sites: { value: "126", status: "critical", change: 8.2 },
    uptime: { value: "99.87%", status: "healthy", change: 0.15 },
    avg_latency: { value: "42ms", status: "normal", change: 5.2 },
    success_rate: { value: "98.9%", status: "healthy", change: 0.3 },
    packet_loss: { value: "0.12%", status: "healthy", change: -0.05 },
    network_availability: { value: "99.92%", status: "healthy", change: 0.08 },
    call_completion_rate: { value: "97.45%", status: "healthy", change: 1.2 },
    data_throughput: { value: "3.42 Tbps", status: "healthy", change: 2.3 },
    incident_count: { value: "12", status: "degraded", change: 3.0 },
    network_health: { value: "94.2%", status: "healthy", change: 0.5 },
  };

  // Apply filter multipliers for mock data variation
  let value = baseValues[kpiId] || { value: "N/A", status: "normal" };

  // Simulate filter impact on values
  if (filters.vendors.length > 0 || filters.technologies.length > 0) {
    const multiplier = Math.max(0.7, 1 - filters.vendors.length * 0.1);
    // In real scenario, recalculate based on filtered data
  }

  return value;
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

  // Mock data for charts
  const trafficData = [
    { time: "00:00", traffic: 2.1, success: 98.2 },
    { time: "04:00", traffic: 1.8, success: 99.1 },
    { time: "08:00", traffic: 3.4, success: 97.8 },
    { time: "12:00", traffic: 3.9, success: 98.9 },
    { time: "16:00", traffic: 3.2, success: 99.2 },
    { time: "20:00", traffic: 2.7, success: 98.5 },
  ];

  const regionData = [
    { region: "North", sites: 684 },
    { region: "South", sites: 512 },
    { region: "East", sites: 721 },
    { region: "West", sites: 598 },
    { region: "Central", sites: 332 },
  ];

  const vendorData = [
    { vendor: "Ericsson", sites: 892, fill: "#7c3aed" },
    { vendor: "Huawei", sites: 756, fill: "#3b82f6" },
    { vendor: "Nokia", sites: 634, fill: "#22c55e" },
    { vendor: "Samsung", sites: 389, fill: "#f59e0b" },
    { vendor: "Others", sites: 176, fill: "#ef4444" },
  ];

  // AI Engine Actions data (mocked)
  const aiActionsData = {
    totalActions: 342,
    successfulActions: 298,
    failedActions: 44,
  };

  // Memoize chart data based on filters
  const memoizedTrafficData = useMemo(() => trafficData, [filters]);
  const memoizedRegionData = useMemo(() => regionData, [filters]);
  const memoizedVendorData = useMemo(() => vendorData, [filters]);

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

  const handleInlineKPIChange = (cardIndex: number, newKpiId: string) => {
    const newSelectedKPIs = [...selectedKPIIds];
    newSelectedKPIs[cardIndex] = newKpiId;
    setSelectedKPIIds(newSelectedKPIs);
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
                Select which KPIs to display ({selectedKPIIds.length} of {AVAILABLE_KPIS.length})
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
          {selectedKPIs.map((kpi, idx) => {
            const kpiValue = calculateKPIValue(kpi.id, filters);
            const IconComponent = kpi.icon;

            return (
              <div
                key={`${kpi.id}-${idx}`}
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
                        {kpiValue.change < 0 ? "↓" : "↑"} {Math.abs(kpiValue.change)}%
                      </span>
                    )}
                  </div>
                </div>

                {/* Inline KPI Selector */}
                <div className="pt-3 border-t border-border">
                  <label className="block text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                    Change KPI
                  </label>
                  <select
                    value={kpi.id}
                    onChange={(e) => handleInlineKPIChange(idx, e.target.value)}
                    className="w-full px-2 py-1 rounded-lg border border-border bg-background text-xs focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  >
                    {AVAILABLE_KPIS.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ===== AI ENGINE ACTIONS SECTION ===== */}
      <div>
        <div className="mb-4 space-y-1">
          <h2 className="text-2xl font-bold text-foreground">AI Engine Actions</h2>
          <p className="text-sm text-muted-foreground">Automated network operations and resolution</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Total Actions */}
          <div className="p-6 rounded-xl border border-border/50 bg-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wide">
                  Total Actions
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
                  Successful
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
                  Failed
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

      {/* ===== TRAFFIC TRENDS & SITE DISTRIBUTION ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Traffic Trends */}
        <div className="card-elevated rounded-xl border border-border/50 p-6">
          <div className="mb-6 space-y-1">
            <h3 className="text-lg font-bold text-foreground">Traffic Trends</h3>
            <p className="text-sm text-muted-foreground">Last 24 hours</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={memoizedTrafficData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" style={{ fontSize: "12px" }} />
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
                dataKey="traffic"
                stroke="#7c3aed"
                strokeWidth={2}
                dot={{ fill: "#7c3aed", r: 4 }}
                name="Traffic (Tbps)"
              />
              <Line
                type="monotone"
                dataKey="success"
                stroke="#22c55e"
                strokeWidth={2}
                dot={{ fill: "#22c55e", r: 4 }}
                name="Success Rate (%)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Region Distribution */}
        <div className="card-elevated rounded-xl border border-border/50 p-6">
          <div className="mb-6 space-y-1">
            <h3 className="text-lg font-bold text-foreground">Sites by Region</h3>
            <p className="text-sm text-muted-foreground">Geographic distribution</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={memoizedRegionData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
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
              <Bar dataKey="sites" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ===== VENDOR PIE CHART ===== */}
      <div className="card-elevated rounded-xl border border-border/50 p-6">
        <div className="mb-6 space-y-1">
          <h3 className="text-lg font-bold text-foreground">Vendor Distribution</h3>
          <p className="text-sm text-muted-foreground">Equipment manufacturer breakdown</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={memoizedVendorData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ vendor, sites }) => `${vendor}: ${sites}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="sites"
                >
                  {memoizedVendorData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3 flex flex-col justify-center">
            {memoizedVendorData.map((vendor, idx) => (
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

      {/* ===== ANALYTICS SECTIONS ===== */}
      <AnalyticsSections />
    </div>
  );
}
