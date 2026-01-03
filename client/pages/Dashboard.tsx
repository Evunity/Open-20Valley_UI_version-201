import { useCallback, useState } from "react";
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

// ===== DATA GENERATORS =====

const generateNetworkOverviewData = () => ({
  totalSites: 2847,
  activeSites: 2721,
  downSites: 126,
  sites_vs_yesterday: -2.1,
});

const generateNetworkKPIsData = () => [
  { label: "Availability", value: "99.87%", change: 0.12, status: "healthy" },
  { label: "Accessibility (CSSR)", value: "98.34%", change: -0.45, status: "normal" },
  { label: "Retainability", value: "99.21%", change: 0.08, status: "healthy" },
  { label: "Latency (Avg)", value: "42ms", change: 5.2, status: "normal" },
  { label: "Packet Loss", value: "0.12%", change: -0.04, status: "healthy" },
  { label: "Throughput (Peak)", value: "2.4 Tbps", change: 8.3, status: "normal" },
];

const generateSitesPerTechnologyData = () => [
  { name: "5G", count: 1240 },
  { name: "4G", count: 890 },
  { name: "3G", count: 456 },
  { name: "2G", count: 234 },
  { name: "O-RAN", count: 27 },
];

const generateRegionDistributionData = () => [
  { region: "North", sites: 684 },
  { region: "South", sites: 512 },
  { region: "East", sites: 721 },
  { region: "West", sites: 598 },
  { region: "Central", sites: 332 },
];

const generateVendorDistributionData = () => [
  { vendor: "Ericsson", sites: 892 },
  { vendor: "Huawei", sites: 756 },
  { vendor: "Nokia", sites: 634 },
  { vendor: "Samsung", sites: 389 },
  { vendor: "Others", sites: 176 },
];

const generateTrafficTrendsData = () => [
  { time: "00:00", traffic: 2.1, alarm_volume: 4, success_rate: 98.2 },
  { time: "04:00", traffic: 1.8, alarm_volume: 3, success_rate: 99.1 },
  { time: "08:00", traffic: 3.4, alarm_volume: 8, success_rate: 97.8 },
  { time: "12:00", traffic: 3.9, alarm_volume: 12, success_rate: 98.9 },
  { time: "16:00", traffic: 3.2, alarm_volume: 9, success_rate: 99.2 },
  { time: "20:00", traffic: 2.7, alarm_volume: 6, success_rate: 98.5 },
];

const generateVoiceMetricsData = () => [
  { name: "Mon", calls: 3500, drops: 18, blocks: 12 },
  { name: "Tue", calls: 3200, drops: 15, blocks: 10 },
  { name: "Wed", calls: 3800, drops: 20, blocks: 14 },
  { name: "Thu", calls: 3600, drops: 17, blocks: 11 },
  { name: "Fri", calls: 4200, drops: 22, blocks: 16 },
  { name: "Sat", calls: 2900, drops: 12, blocks: 8 },
  { name: "Sun", calls: 2700, drops: 10, blocks: 7 },
];

const generateDataMetricsData = () => [
  { name: "Mon", sessions: 2100, failures: 4 },
  { name: "Tue", sessions: 2250, failures: 3 },
  { name: "Wed", sessions: 2380, failures: 5 },
  { name: "Thu", sessions: 2200, failures: 2 },
  { name: "Fri", sessions: 2500, failures: 6 },
  { name: "Sat", sessions: 1900, failures: 1 },
  { name: "Sun", sessions: 1870, failures: 2 },
];

const generateAlarmsData = () => [
  { name: "Mon", active: 24, resolved: 22 },
  { name: "Tue", active: 19, resolved: 18 },
  { name: "Wed", active: 28, resolved: 26 },
  { name: "Thu", active: 15, resolved: 14 },
  { name: "Fri", active: 32, resolved: 29 },
  { name: "Sat", active: 8, resolved: 8 },
  { name: "Sun", active: 6, resolved: 6 },
];

const generateAIActionsData = () => [
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

// ===== MAIN COMPONENT =====

export default function Dashboard() {
  const navigate = useNavigate();
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
      <div className="card-elevated p-4">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
          {label}
        </p>
        <div className="flex items-end justify-between gap-2">
          <p className={`text-2xl font-bold ${statusColor}`}>{value}</p>
          {change !== undefined && (
            <div className="flex items-center gap-1 text-xs font-semibold">
              {changeTrend === "positive" ? (
                <TrendingUp className={`w-3 h-3 ${change > 0 ? "text-status-healthy" : "text-status-degraded"}`} />
              ) : (
                <TrendingDown className={`w-3 h-3 ${change < 0 ? "text-status-healthy" : "text-status-degraded"}`} />
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

  const ExportButton = ({ widgetId }: { widgetId: string }) => (
    <button
      onClick={() => {
        // Mock export functionality
        console.log("Exporting widget:", widgetId);
      }}
      className="p-2 rounded-lg bg-muted hover:bg-muted/70 transition-colors text-xs font-medium flex items-center gap-1"
      title="Export this widget"
    >
      <Download className="w-3 h-3" />
      Export
    </button>
  );

  // ===== RENDER =====

  return (
    <div className="space-y-6">
      {/* ===== HEADER & GLOBAL CONTROLS ===== */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Network Operations Dashboard</h1>
            <p className="text-muted-foreground text-sm mt-1">Real-time monitoring and insights</p>
          </div>
          <a
            href="/settings"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm"
          >
            Settings
          </a>
        </div>

        {/* Global Controls */}
        <div className="card-elevated p-4 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            {/* Time Granularity */}
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <div className="flex gap-2">
                {(["15min", "hourly", "daily"] as TimeGranularity[]).map((granule) => (
                  <button
                    key={granule}
                    onClick={() => setTimeGranularity(granule)}
                    className={cn(
                      "px-3 py-1 rounded text-xs font-medium transition-all",
                      timeGranularity === granule
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/70"
                    )}
                  >
                    {granule === "15min" ? "15-min" : granule === "hourly" ? "Hourly" : "Daily"}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-3 py-1 rounded-lg bg-muted hover:bg-muted/70 transition-colors text-xs font-medium"
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>

            {/* Dashboard-wide Export */}
            <button className="flex items-center gap-1 px-3 py-1 rounded-lg bg-muted hover:bg-muted/70 transition-colors text-xs font-medium">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="border-t border-border pt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-2">
                  Technology
                </label>
                <select
                  multiple
                  className="w-full px-2 py-1 rounded border border-border bg-background text-sm"
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
                <label className="text-xs font-medium text-muted-foreground block mb-2">
                  Region
                </label>
                <select
                  multiple
                  className="w-full px-2 py-1 rounded border border-border bg-background text-sm"
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
                <label className="text-xs font-medium text-muted-foreground block mb-2">
                  Time Range
                </label>
                <select
                  className="w-full px-2 py-1 rounded border border-border bg-background text-sm"
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
                  className="flex-1 px-3 py-1 rounded bg-muted hover:bg-muted/70 transition-colors text-xs font-medium"
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
        <h2 className="text-xl font-semibold text-foreground">Network Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(() => {
            const overview = generateNetworkOverviewData();
            return (
              <>
                <KPICard
                  label="Total Sites"
                  value={overview.totalSites.toLocaleString()}
                  change={overview.sites_vs_yesterday}
                  status="normal"
                />
                <KPICard
                  label="Active Sites"
                  value={overview.activeSites.toLocaleString()}
                  change={-0.8}
                  status="healthy"
                />
                <KPICard
                  label="Down Sites"
                  value={overview.downSites}
                  change={8.2}
                  status={overview.downSites > 150 ? "critical" : "normal"}
                />
                <KPICard
                  label="Uptime %"
                  value={((overview.activeSites / overview.totalSites) * 100).toFixed(2) + "%"}
                  change={0.15}
                  status="healthy"
                />
              </>
            );
          })()}
        </div>

        {/* Distribution Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sites by Technology */}
          <div className="card-elevated p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Sites by Technology</h3>
              <ExportButton widgetId="sites-by-tech" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={generateSitesPerTechnologyData()}>
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
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Region Distribution</h3>
              <ExportButton widgetId="region-dist" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart data={generateRegionDistributionData()}>
                <Pie dataKey="sites" nameKey="region" cx="50%" cy="50%" outerRadius={100}>
                  {generateRegionDistributionData().map((entry, index) => (
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
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Vendor Distribution</h3>
            <ExportButton widgetId="vendor-dist" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={generateVendorDistributionData()}>
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
        <h2 className="text-xl font-semibold text-foreground">Core Network KPIs</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {generateNetworkKPIsData().map((kpi, idx) => (
            <KPICard key={idx} {...kpi} />
          ))}
        </div>
      </div>

      {/* ===== TREND INSIGHTS SECTION ===== */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Trend Insights</h2>
        <div className="card-elevated p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Traffic & Performance Trends</h3>
            <ExportButton widgetId="trend-insights" />
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={generateTrafficTrendsData()}>
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
        <div className="flex items-center justify-between">
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
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Call Trends</h3>
            <ExportButton widgetId="voice-trends" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={generateVoiceMetricsData()}>
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
        <div className="flex items-center justify-between">
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
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Session Trends</h3>
            <ExportButton widgetId="data-trends" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={generateDataMetricsData()}>
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
        <div className="flex items-center justify-between">
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
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Alarm Trends</h3>
            <ExportButton widgetId="alarm-trends" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={generateAlarmsData()}>
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
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">Recent AI Engine Actions</h2>
          <button
            onClick={() => navigate("/detail/ai-actions")}
            className="text-sm text-primary hover:underline font-medium"
          >
            View All →
          </button>
        </div>
        <div className="space-y-2">
          {generateAIActionsData().map((action) => (
            <div
              key={action.id}
              onClick={() => navigate(`/detail/ai-actions/${action.action.replace(/\s+/g, "-").toLowerCase()}`)}
              className="card-elevated p-4 hover:shadow-lg transition-all cursor-pointer border-l-4 border-primary"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{action.action}</p>
                  <p className="text-xs text-muted-foreground mt-1">{action.timestamp}</p>
                </div>
                <div className="flex items-center gap-2">
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
