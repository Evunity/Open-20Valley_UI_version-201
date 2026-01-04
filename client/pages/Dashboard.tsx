import { useCallback, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  Download,
  Filter,
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
import DashboardWidget from "@/components/DashboardWidget";
import { useLocalStorage, DEFAULT_WIDGETS, type DashboardLayout, type WidgetConfig } from "@/hooks/useLocalStorage";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// ===== GLOBAL STATE & TYPES =====

type TimeGranularity = "15min" | "hourly" | "daily";
type Technology = "2G" | "3G" | "4G" | "5G" | "ORAN";
type Region = "North" | "South" | "East" | "West" | "Central";

interface FilterState {
  vendors: string[];
  technologies: Technology[];
  regions: Region[];
  timeRange: "24h" | "7d" | "30d";
}

// ===== DATA FILTERING & AGGREGATION UTILITIES =====

// Apply filters to sample data with AND logic
const applyFilters = (data: any[], filters: FilterState, region?: string): any[] => {
  let filtered = data;

  if (filters.regions.length > 0 && region) {
    filtered = filtered.filter((d) => filters.regions.includes(region));
  }

  return filtered;
};

const getTimeMultiplier = (timeRange: "24h" | "7d" | "30d"): number => {
  switch (timeRange) {
    case "24h":
      return 1;
    case "7d":
      return 7;
    case "30d":
      return 30;
    default:
      return 1;
  }
};

// ===== MOCK DATA GENERATORS (WITH FILTER SUPPORT) =====

const generateNetworkOverviewData = (filters: FilterState) => {
  const multiplier = getTimeMultiplier(filters.timeRange);
  const baseTotal = 2847;
  const baseActive = 2721;

  // Apply region filtering
  let total = baseTotal;
  let active = baseActive;
  if (filters.regions.length > 0) {
    const regionFactor = filters.regions.length / 5;
    total = Math.round(baseTotal * regionFactor);
    active = Math.round(baseActive * regionFactor);
  }

  return {
    totalSites: total,
    activeSites: active,
    downSites: total - active,
    sites_vs_yesterday: -2.1,
  };
};

const generateNetworkKPIsData = (filters: FilterState) => [
  { label: "Availability", value: "99.87%", change: 0.12, status: "healthy" },
  { label: "Accessibility (CSSR)", value: "98.34%", change: -0.45, status: "normal" },
  { label: "Retainability", value: "99.21%", change: 0.08, status: "healthy" },
  { label: "Latency (Avg)", value: "42ms", change: 5.2, status: "normal" },
  { label: "Packet Loss", value: "0.12%", change: -0.04, status: "healthy" },
  { label: "Throughput (Peak)", value: "2.4 Tbps", change: 8.3, status: "normal" },
];

const generateSitesPerTechnologyData = (filters: FilterState) => {
  const baseData = [
    { name: "5G", count: 1240 },
    { name: "4G", count: 890 },
    { name: "3G", count: 456 },
    { name: "2G", count: 234 },
    { name: "O-RAN", count: 27 },
  ];

  if (filters.technologies.length === 0) {
    return baseData;
  }

  return baseData.filter((item) =>
    filters.technologies.includes(item.name as Technology)
  );
};

const generateRegionDistributionData = (filters: FilterState) => {
  const baseData = [
    { region: "North", sites: 684 },
    { region: "South", sites: 512 },
    { region: "East", sites: 721 },
    { region: "West", sites: 598 },
    { region: "Central", sites: 332 },
  ];

  if (filters.regions.length === 0) {
    return baseData;
  }

  return baseData.filter((item) =>
    filters.regions.includes(item.region as Region)
  );
};

const generateVendorDistributionData = (filters: FilterState) => {
  const baseData = [
    { vendor: "Ericsson", sites: 892 },
    { vendor: "Huawei", sites: 756 },
    { vendor: "Nokia", sites: 634 },
    { vendor: "Samsung", sites: 389 },
    { vendor: "Others", sites: 176 },
  ];

  if (filters.vendors.length === 0) {
    return baseData;
  }

  return baseData.filter((item) => filters.vendors.includes(item.vendor));
};

const generateTrafficTrendsData = (filters: FilterState) => [
  { time: "00:00", traffic: 2.1, alarm_volume: 4, success_rate: 98.2 },
  { time: "04:00", traffic: 1.8, alarm_volume: 3, success_rate: 99.1 },
  { time: "08:00", traffic: 3.4, alarm_volume: 8, success_rate: 97.8 },
  { time: "12:00", traffic: 3.9, alarm_volume: 12, success_rate: 98.9 },
  { time: "16:00", traffic: 3.2, alarm_volume: 9, success_rate: 99.2 },
  { time: "20:00", traffic: 2.7, alarm_volume: 6, success_rate: 98.5 },
];

const generateVoiceMetricsData = (filters: FilterState) => [
  { name: "Mon", calls: 3500, drops: 18, blocks: 12 },
  { name: "Tue", calls: 3200, drops: 15, blocks: 10 },
  { name: "Wed", calls: 3800, drops: 20, blocks: 14 },
  { name: "Thu", calls: 3600, drops: 17, blocks: 11 },
  { name: "Fri", calls: 4200, drops: 22, blocks: 16 },
  { name: "Sat", calls: 2900, drops: 12, blocks: 8 },
  { name: "Sun", calls: 2700, drops: 10, blocks: 7 },
];

const generateDataMetricsData = (filters: FilterState) => [
  { name: "Mon", sessions: 2100, failures: 4 },
  { name: "Tue", sessions: 2250, failures: 3 },
  { name: "Wed", sessions: 2380, failures: 5 },
  { name: "Thu", sessions: 2200, failures: 2 },
  { name: "Fri", sessions: 2500, failures: 6 },
  { name: "Sat", sessions: 1900, failures: 1 },
  { name: "Sun", sessions: 1870, failures: 2 },
];

const generateAlarmsData = (filters: FilterState) => [
  { name: "Mon", active: 24, resolved: 22 },
  { name: "Tue", active: 19, resolved: 18 },
  { name: "Wed", active: 28, resolved: 26 },
  { name: "Thu", active: 15, resolved: 14 },
  { name: "Fri", active: 32, resolved: 29 },
  { name: "Sat", active: 8, resolved: 8 },
  { name: "Sun", active: 6, resolved: 6 },
];

const generateAIActionsData = (filters: FilterState) => [
  { id: 1, action: "RAN Anomaly Detection", status: "Success", timestamp: "2 min ago", priority: "high" },
  { id: 2, action: "Media Engine DDoS Protection", status: "Ongoing", timestamp: "5 min ago", priority: "high" },
  { id: 3, action: "CORE Network Correction", status: "Success", timestamp: "8 min ago", priority: "medium" },
  { id: 4, action: "IP-Backbone Fault Analysis", status: "Failed", timestamp: "12 min ago", priority: "high" },
];

// ===== COLOR SEMANTICS =====
const SEVERITY_COLORS = {
  critical: "#ef4444",
  major: "#f97316",
  minor: "#eab308",
  warning: "#3b82f6",
  healthy: "#22c55e",
} as const;

const CHART_COLORS = [
  "#7c3aed", // purple
  "#3b82f6", // blue
  "#22c55e", // green
  "#f59e0b", // amber
  "#ef4444", // red
];

// ===== EXPORT UTILITIES =====

const exportToCSV = (data: any[], filename: string) => {
  if (!data || data.length === 0) {
    return false;
  }

  const headers = Object.keys(data[0]);
  const csv = [
    headers.join(","),
    ...data.map((row) =>
      headers.map((header) => {
        const value = row[header];
        return typeof value === "string" ? `"${value}"` : value;
      }).join(",")
    ),
  ].join("\n");

  downloadFile(csv, `${filename}.csv`, "text/csv");
  return true;
};

const exportToJSON = (data: any[], filename: string) => {
  const json = JSON.stringify(data, null, 2);
  downloadFile(json, `${filename}.json`, "application/json");
  return true;
};

const downloadFile = (content: string, filename: string, type: string) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// ===== MAIN COMPONENT =====

export default function Dashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [timeGranularity, setTimeGranularity] = useState<TimeGranularity>("daily");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    vendors: [],
    technologies: [],
    regions: [],
    timeRange: "24h",
  });

  const [widgetLayout, setWidgetLayout] = useLocalStorage<DashboardLayout>(
    "dashboard_layout",
    DEFAULT_WIDGETS
  );

  const updateWidgetConfig = useCallback(
    (widgetId: string, updates: Partial<WidgetConfig>) => {
      setWidgetLayout((prev) => ({
        ...prev,
        [widgetId]: { ...prev[widgetId], ...updates },
      }));
    },
    [setWidgetLayout]
  );

  // Memoized filtered data - recalculates only when filters change
  const memoizedData = useMemo(() => {
    return {
      networkOverview: generateNetworkOverviewData(filters),
      networkKPIs: generateNetworkKPIsData(filters),
      sitesPerTech: generateSitesPerTechnologyData(filters),
      regionDist: generateRegionDistributionData(filters),
      vendorDist: generateVendorDistributionData(filters),
      trafficTrends: generateTrafficTrendsData(filters),
      voiceMetrics: generateVoiceMetricsData(filters),
      dataMetrics: generateDataMetricsData(filters),
      alarms: generateAlarmsData(filters),
      aiActions: generateAIActionsData(filters),
    };
  }, [filters]);

  // ===== HELPER COMPONENTS =====

  const KPICard = ({ label, value, change, status }: any) => {
    const statusColor =
      status === "healthy"
        ? "text-status-healthy"
        : status === "normal"
        ? "text-foreground"
        : "text-status-critical";
    const changeTrend = change >= 0 ? "positive" : "negative";

    return (
      <div className="card-elevated p-4 md:p-5 hover:shadow-lg hover:border-primary/50 transition-all duration-300 rounded-xl border border-border/50 group cursor-default">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 group-hover:text-foreground/70 transition-colors">
          {label}
        </p>
        <div className="flex items-end justify-between gap-2">
          <p className={`text-xl md:text-2xl font-bold ${statusColor} transition-colors`}>{value}</p>
          {change !== undefined && (
            <div className="flex items-center gap-1 text-xs font-semibold">
              {changeTrend === "positive" ? (
                <TrendingUp className={`w-4 h-4 ${change > 0 ? "text-status-healthy" : "text-status-degraded"}`} />
              ) : (
                <TrendingDown className={`w-4 h-4 ${change < 0 ? "text-status-healthy" : "text-status-degraded"}`} />
              )}
              <span className={change < 0 ? "text-status-healthy" : "text-status-degraded"}>
                {Math.abs(change)}%
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const ExportButton = ({ data, widgetId, filename }: { data: any; widgetId: string; filename: string }) => (
    <div className="flex gap-2">
      <button
        onClick={() => {
          const success = exportToCSV(data, filename);
          if (success) {
            toast({
              title: "Export successful",
              description: `Downloaded ${filename}.csv`,
            });
          } else {
            toast({
              title: "No data",
              description: "Cannot export empty dataset",
              variant: "destructive",
            });
          }
        }}
        className="p-2 rounded-lg bg-muted hover:bg-muted/70 transition-colors text-xs font-medium flex items-center gap-1"
        title="Export as CSV"
      >
        <Download className="w-3 h-3" />
        CSV
      </button>
      <button
        onClick={() => {
          const success = exportToJSON(data, filename);
          if (success) {
            toast({
              title: "Export successful",
              description: `Downloaded ${filename}.json`,
            });
          }
        }}
        className="p-2 rounded-lg bg-muted hover:bg-muted/70 transition-colors text-xs font-medium flex items-center gap-1"
        title="Export as JSON"
      >
        <Download className="w-3 h-3" />
        JSON
      </button>
    </div>
  );

  // ===== RENDER =====

  return (
    <div className="space-y-6 pb-4">
      {/* ===== HEADER & GLOBAL CONTROLS ===== */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Network Operations Dashboard</h1>
            <p className="text-muted-foreground text-xs md:text-sm mt-1">Real-time monitoring and insights</p>
          </div>
          <a
            href="/settings"
            className="px-3 md:px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 active:scale-95 transition-all duration-200 font-medium text-xs md:text-sm flex-shrink-0"
          >
            Settings
          </a>
        </div>

        {/* Global Controls */}
        <div className="card-elevated p-3 md:p-4 space-y-4 rounded-xl border border-border/50 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between flex-wrap gap-2 md:gap-4">
            {/* Time Granularity */}
            <div className="flex items-center gap-2 md:gap-3 flex-wrap">
              <Clock className="w-4 h-4 text-muted-foreground hidden md:block" />
              <div className="flex gap-1 md:gap-2">
                {(["15min", "hourly", "daily"] as TimeGranularity[]).map((granule) => (
                  <button
                    key={granule}
                    onClick={() => setTimeGranularity(granule)}
                    className={cn(
                      "px-2 md:px-3 py-1 rounded text-xs font-medium transition-all duration-200 active:scale-95",
                      timeGranularity === granule
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "bg-muted text-muted-foreground hover:bg-muted/70"
                    )}
                  >
                    {granule === "15min" ? "15m" : granule === "hourly" ? "1h" : "Daily"}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "flex items-center gap-2 px-2 md:px-3 py-1 rounded-lg transition-all duration-200 text-xs font-medium active:scale-95",
                showFilters
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-muted hover:bg-muted/70"
              )}
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">
                {filters.technologies.length > 0 || filters.regions.length > 0 || filters.vendors.length > 0 ? `(${filters.technologies.length + filters.regions.length + filters.vendors.length})` : "Filters"}
              </span>
            </button>

            {/* Dashboard-wide Export */}
            <button
              onClick={() => {
                const success = exportToJSON({
                  timestamp: new Date().toISOString(),
                  filters,
                  data: memoizedData,
                }, "dashboard-export");
                if (success) {
                  toast({
                    title: "Export successful",
                    description: "Downloaded dashboard-export.json",
                  });
                }
              }}
              className="flex items-center gap-1 px-2 md:px-3 py-1 rounded-lg bg-muted hover:bg-muted/70 transition-all duration-200 text-xs font-medium active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="border-t border-border pt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-2 uppercase tracking-wide">
                  Technology
                </label>
                <select
                  multiple
                  className="w-full px-2.5 py-2 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  value={filters.technologies}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, (option) => option.value as Technology);
                    setFilters((prev) => ({ ...prev, technologies: selected }));
                  }}
                >
                  <option value="2G">2G</option>
                  <option value="3G">3G</option>
                  <option value="4G">4G</option>
                  <option value="5G">5G</option>
                  <option value="ORAN">O-RAN</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-2 uppercase tracking-wide">
                  Region
                </label>
                <select
                  multiple
                  className="w-full px-2.5 py-2 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  value={filters.regions}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, (option) => option.value as Region);
                    setFilters((prev) => ({ ...prev, regions: selected }));
                  }}
                >
                  <option value="North">North</option>
                  <option value="South">South</option>
                  <option value="East">East</option>
                  <option value="West">West</option>
                  <option value="Central">Central</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-2 uppercase tracking-wide">
                  Vendor
                </label>
                <select
                  multiple
                  className="w-full px-2.5 py-2 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  value={filters.vendors}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, (option) => option.value);
                    setFilters((prev) => ({ ...prev, vendors: selected }));
                  }}
                >
                  <option value="Ericsson">Ericsson</option>
                  <option value="Huawei">Huawei</option>
                  <option value="Nokia">Nokia</option>
                  <option value="Samsung">Samsung</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-2 uppercase tracking-wide">
                  Time Range
                </label>
                <select
                  className="w-full px-2.5 py-2 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  value={filters.timeRange}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, timeRange: e.target.value as any }))
                  }
                >
                  <option value="24h">Last 24h</option>
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                </select>
              </div>
              <div className="flex items-end gap-2">
                <button
                  onClick={() =>
                    setFilters({
                      vendors: [],
                      technologies: [],
                      regions: [],
                      timeRange: "24h",
                    })
                  }
                  className="flex-1 px-3 py-2 rounded-lg bg-muted hover:bg-muted/70 active:scale-95 transition-all duration-200 text-xs font-medium"
                >
                  Reset
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ===== NETWORK OVERVIEW SECTION ===== */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-foreground">Network Overview</h2>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">Current network status and metrics</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <KPICard
            label="Total Sites"
            value={memoizedData.networkOverview.totalSites.toLocaleString()}
            change={memoizedData.networkOverview.sites_vs_yesterday}
            status="normal"
          />
          <KPICard
            label="Active Sites"
            value={memoizedData.networkOverview.activeSites.toLocaleString()}
            change={-0.8}
            status="healthy"
          />
          <KPICard
            label="Down Sites"
            value={memoizedData.networkOverview.downSites}
            change={8.2}
            status={memoizedData.networkOverview.downSites > 150 ? "critical" : "normal"}
          />
          <KPICard
            label="Uptime %"
            value={((memoizedData.networkOverview.activeSites / memoizedData.networkOverview.totalSites) * 100).toFixed(2) + "%"}
            change={0.15}
            status="healthy"
          />
        </div>

        {/* Distribution Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Sites by Technology */}
          <div className="card-elevated p-6">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <h3 className="text-lg font-semibold text-foreground">Sites by Technology</h3>
              <ExportButton data={memoizedData.sitesPerTech} widgetId="sites-by-tech" filename="sites-by-technology" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={memoizedData.sitesPerTech}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="count" fill={CHART_COLORS[0]} radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Region Distribution */}
          <div className="card-elevated p-6">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <h3 className="text-lg font-semibold text-foreground">Region Distribution</h3>
              <ExportButton data={memoizedData.regionDist} widgetId="region-dist" filename="region-distribution" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={memoizedData.regionDist} dataKey="sites" nameKey="region" cx="50%" cy="50%" outerRadius={100}>
                  {memoizedData.regionDist.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Vendor Distribution */}
        <div className="card-elevated p-6">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h3 className="text-lg font-semibold text-foreground">Vendor Distribution</h3>
            <ExportButton data={memoizedData.vendorDist} widgetId="vendor-dist" filename="vendor-distribution" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={memoizedData.vendorDist}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="vendor" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="sites" fill={CHART_COLORS[1]} radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ===== CORE NETWORK KPIs ===== */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-foreground">Core Network KPIs</h2>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">Key performance indicators across the network</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {memoizedData.networkKPIs.map((kpi, idx) => (
            <KPICard key={idx} {...kpi} />
          ))}
        </div>
      </div>

      {/* ===== TREND INSIGHTS SECTION ===== */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-foreground">Trend Insights</h2>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">Traffic patterns and performance trends</p>
        </div>
        <div className="card-elevated p-6">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h3 className="text-lg font-semibold text-foreground">Traffic & Performance Trends</h3>
            <ExportButton data={memoizedData.trafficTrends} widgetId="trend-insights" filename="traffic-trends" />
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={memoizedData.trafficTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" yAxisId="left" />
              <YAxis stroke="hsl(var(--muted-foreground))" yAxisId="right" orientation="right" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="traffic" stroke={CHART_COLORS[0]} strokeWidth={2} />
              <Line yAxisId="right" type="monotone" dataKey="alarm_volume" stroke={CHART_COLORS[4]} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ===== SERVICE-SPECIFIC SECTIONS ===== */}

      {/* VOICE SECTION */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-xl font-semibold text-foreground">Voice Services</h2>
          <button
            onClick={() => navigate("/detail/voice")}
            className="text-sm text-primary hover:underline font-medium"
          >
            View Details →
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <KPICard
            label="Total Calls"
            value="24.5K"
            change={-2.1}
            status="normal"
          />
          <KPICard
            label="Call Drop Rate"
            value="0.59%"
            change={-12}
            status="healthy"
          />
          <KPICard
            label="Avg Duration"
            value="3m 24s"
            change={2.3}
            status="normal"
          />
        </div>
        <div className="card-elevated p-6">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h3 className="text-lg font-semibold text-foreground">Call Trends</h3>
            <ExportButton data={memoizedData.voiceMetrics} widgetId="voice-trends" filename="voice-trends" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={memoizedData.voiceMetrics}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="calls" stroke={CHART_COLORS[0]} strokeWidth={2} />
              <Line type="monotone" dataKey="drops" stroke={CHART_COLORS[4]} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* DATA SECTION */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-xl font-semibold text-foreground">Data Services (4G / 5G)</h2>
          <button
            onClick={() => navigate("/detail/data")}
            className="text-sm text-primary hover:underline font-medium"
          >
            View Details →
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <KPICard
            label="Total Sessions"
            value="15.8K"
            change={15}
            status="normal"
          />
          <KPICard
            label="Failure Rate"
            value="0.15%"
            change={-12}
            status="healthy"
          />
          <KPICard
            label="Peak Bandwidth"
            value="2.4 Tbps"
            change={5.2}
            status="normal"
          />
        </div>
        <div className="card-elevated p-6">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h3 className="text-lg font-semibold text-foreground">Session Trends</h3>
            <ExportButton data={memoizedData.dataMetrics} widgetId="data-trends" filename="data-trends" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={memoizedData.dataMetrics}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Bar dataKey="sessions" fill={CHART_COLORS[0]} radius={[8, 8, 0, 0]} />
              <Bar dataKey="failures" fill={CHART_COLORS[4]} radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ALARMS SECTION */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-xl font-semibold text-foreground">Network Alarms</h2>
          <button
            onClick={() => navigate("/detail/alarms")}
            className="text-sm text-primary hover:underline font-medium"
          >
            View Details →
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <KPICard
            label="Active Issues"
            value="12"
            change={25}
            status="critical"
          />
          <KPICard
            label="Critical Alarms"
            value="5"
            change={-8}
            status="healthy"
          />
          <KPICard
            label="Resolution Rate"
            value="92%"
            change={3}
            status="normal"
          />
        </div>
        <div className="card-elevated p-6">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h3 className="text-lg font-semibold text-foreground">Alarm Trends</h3>
            <ExportButton data={memoizedData.alarms} widgetId="alarm-trends" filename="alarm-trends" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={memoizedData.alarms}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Bar dataKey="active" fill={CHART_COLORS[4]} radius={[8, 8, 0, 0]} />
              <Bar dataKey="resolved" fill={CHART_COLORS[2]} radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI ENGINE ACTIONS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-xl font-semibold text-foreground">Recent AI Engine Actions</h2>
          <button
            onClick={() => navigate("/detail/ai-actions")}
            className="text-sm text-primary hover:underline font-medium"
          >
            View All →
          </button>
        </div>
        <div className="space-y-2">
          {memoizedData.aiActions.map((action) => (
            <div
              key={action.id}
              onClick={() => navigate(`/detail/ai-actions/${action.action.replace(/\s+/g, "-").toLowerCase()}`)}
              className="card-elevated p-4 hover:shadow-lg transition-all cursor-pointer border-l-4 border-primary"
            >
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground">{action.action}</p>
                  <p className="text-xs text-muted-foreground mt-1">{action.timestamp}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      action.priority === "high"
                        ? "bg-status-critical/10 text-status-critical"
                        : "bg-status-degraded/10 text-status-degraded"
                    }`}
                  >
                    {action.priority.toUpperCase()}
                  </span>
                  <span
                    className={`text-xs font-bold ${
                      action.status === "Success"
                        ? "text-status-healthy"
                        : action.status === "Ongoing"
                        ? "text-status-pending"
                        : "text-status-critical"
                    }`}
                  >
                    {action.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
