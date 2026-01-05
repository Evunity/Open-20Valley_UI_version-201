import { useNavigate } from "react-router-dom";
import {
  TrendingUp,
  TrendingDown,
  Zap,
  AlertCircle,
  Server,
  Wifi,
  Clock,
  Activity,
  CheckCircle2,
  BarChart3,
  Download,
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
import { cn } from "@/lib/utils";

interface KPIData {
  icon: React.ReactNode;
  label: string;
  value: string;
  change: number;
  status: "healthy" | "degraded" | "critical";
}

export default function DashboardNew() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { filters } = useGlobalFilters();

  // Mock data - in production this would come from actual data based on filters
  const kpiData: KPIData[] = [
    {
      icon: <Server className="w-5 h-5" />,
      label: "Total Sites",
      value: "2,847",
      change: -2.1,
      status: "healthy",
    },
    {
      icon: <Wifi className="w-5 h-5" />,
      label: "Active Sites",
      value: "2,721",
      change: -0.8,
      status: "healthy",
    },
    {
      icon: <AlertCircle className="w-5 h-5" />,
      label: "Down Sites",
      value: "126",
      change: 8.2,
      status: "critical",
    },
    {
      icon: <Activity className="w-5 h-5" />,
      label: "Uptime",
      value: "99.87%",
      change: 0.15,
      status: "healthy",
    },
    {
      icon: <Zap className="w-5 h-5" />,
      label: "Avg Latency",
      value: "42ms",
      change: 5.2,
      status: "normal",
    },
    {
      icon: <CheckCircle2 className="w-5 h-5" />,
      label: "Success Rate",
      value: "98.9%",
      change: 0.3,
      status: "healthy",
    },
  ];

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

  const getStatusIcon = (change: number) => {
    return change < 0 ? (
      <TrendingDown className="w-4 h-4 text-status-healthy" />
    ) : (
      <TrendingUp className="w-4 h-4 text-status-degraded" />
    );
  };

  const exportData = (format: "csv" | "json") => {
    const data = {
      timestamp: new Date().toISOString(),
      filters,
      kpis: kpiData.map((k) => ({ label: k.label, value: k.value })),
    };

    if (format === "csv") {
      const csv = Object.entries(data.kpis)
        .map(([key, value]) => `${key},${value}`)
        .join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `dashboard-${new Date().getTime()}.csv`;
      a.click();
    } else {
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `dashboard-${new Date().getTime()}.json`;
      a.click();
    }

    toast({
      title: "Export successful",
      description: `Downloaded dashboard data as ${format.toUpperCase()}`,
    });
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
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportData("csv")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card hover:bg-muted transition-colors text-sm font-medium"
              title="Export as CSV"
            >
              <Download className="w-4 h-4" />
              CSV
            </button>
            <button
              onClick={() => exportData("json")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card hover:bg-muted transition-colors text-sm font-medium"
              title="Export as JSON"
            >
              <Download className="w-4 h-4" />
              JSON
            </button>
          </div>
        </div>

        {/* Global Filter Panel */}
        <FilterPanel showTimeRange={true} />
      </div>

      {/* ===== KPI GRID (DOMINANT) ===== */}
      <div>
        <div className="mb-4 space-y-1">
          <h2 className="text-2xl font-bold text-foreground">Key Performance Indicators</h2>
          <p className="text-sm text-muted-foreground">Current network status and metrics</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {kpiData.map((kpi, idx) => (
            <div
              key={idx}
              className={cn(
                "p-6 rounded-xl border transition-all duration-300 hover:shadow-lg hover:border-primary/50",
                kpi.status === "healthy"
                  ? "border-status-healthy/20 bg-status-healthy/5"
                  : kpi.status === "critical"
                  ? "border-status-critical/20 bg-status-critical/5"
                  : "border-border bg-card"
              )}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={cn("p-2.5 rounded-lg", kpi.status === "healthy" ? "bg-status-healthy/10" : "bg-muted")}>
                  <div className={cn("w-5 h-5", kpi.status === "healthy" ? "text-status-healthy" : "text-status-critical")}>
                    {kpi.icon}
                  </div>
                </div>
                {getStatusIcon(kpi.change)}
              </div>
              <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                {kpi.label}
              </p>
              <div className="flex items-baseline gap-2 mb-1">
                <p className={cn("text-3xl font-bold", getStatusColor(kpi.status))}>
                  {kpi.value}
                </p>
                <span className={cn("text-xs font-semibold", kpi.change < 0 ? "text-status-healthy" : "text-status-degraded")}>
                  {kpi.change < 0 ? "↓" : "↑"} {Math.abs(kpi.change)}%
                </span>
              </div>
              <p className="text-xs text-muted-foreground">vs. previous period</p>
            </div>
          ))}
        </div>
      </div>

      {/* ===== ANALYTICS SECTIONS ===== */}
      <AnalyticsSections />

      {/* ===== CHARTS SECTION ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Traffic Trends */}
        <div className="card-elevated rounded-xl border border-border/50 p-6">
          <div className="mb-6 space-y-1">
            <h3 className="text-lg font-bold text-foreground">Traffic Trends</h3>
            <p className="text-sm text-muted-foreground">Last 24 hours</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trafficData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
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
            <BarChart data={regionData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
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
                  data={vendorData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ vendor, sites }) => `${vendor}: ${sites}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="sites"
                >
                  {vendorData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
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

      {/* ===== QUICK ACTIONS ===== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => navigate("/network")}
          className="p-4 rounded-lg border border-border bg-card hover:bg-muted transition-colors text-left"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Wifi className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground text-sm">Network Status</p>
              <p className="text-xs text-muted-foreground mt-1">View infrastructure hierarchy</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => navigate("/incidents")}
          className="p-4 rounded-lg border border-border bg-card hover:bg-muted transition-colors text-left"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-status-critical/10">
              <AlertCircle className="w-5 h-5 text-status-critical" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground text-sm">Incidents</p>
              <p className="text-xs text-muted-foreground mt-1">View and manage incidents</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => navigate("/reports")}
          className="p-4 rounded-lg border border-border bg-card hover:bg-muted transition-colors text-left"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-accent/10">
              <BarChart3 className="w-5 h-5 text-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground text-sm">Generate Reports</p>
              <p className="text-xs text-muted-foreground mt-1">Create custom reports</p>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}
