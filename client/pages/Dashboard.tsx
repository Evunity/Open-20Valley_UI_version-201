import { Activity, TrendingUp, Zap, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function Dashboard() {
  // Mock data
  const healthStatus = "Healthy";
  const healthPercentage = 98.7;

  const activeIncidents = [
    {
      id: 1,
      title: "Traffic Imbalance in Region A",
      severity: "degraded",
      impact: "Increased latency by 12% in Cluster A",
      aiAction: "Auto-rebalancing traffic distribution",
      timestamp: "2 minutes ago",
    },
    {
      id: 2,
      title: "Capacity Warning - Data Center 2",
      severity: "degraded",
      impact: "CPU utilization at 78%, trending upward",
      aiAction: "Scaling additional compute resources",
      timestamp: "5 minutes ago",
    },
    {
      id: 3,
      title: "Latency Spike in Region B",
      severity: "critical",
      impact: "User-facing API response time +45%",
      aiAction: "Investigating network routing anomalies",
      timestamp: "8 minutes ago",
    },
  ];

  const aiActivities = [
    { id: 1, action: "Optimizing traffic in Region A", status: "in-progress" },
    { id: 2, action: "Auto-resolving latency issue in Cluster X", status: "in-progress" },
    { id: 3, action: "Scaling compute resources in DC-2", status: "pending" },
    { id: 4, action: "Rebalancing load across sites", status: "in-progress" },
    { id: 5, action: "Analyzing network topology changes", status: "pending" },
  ];

  const kpiData = [
    { label: "Uptime", value: "99.97%", icon: CheckCircle2, color: "status-healthy" },
    { label: "Performance (avg)", value: "45ms", icon: Zap, color: "status-healthy" },
    { label: "Cost Efficiency", value: "↓ 12%", icon: TrendingUp, color: "status-healthy" },
  ];

  const uptimeData = [
    { month: "Jan", value: 99.2 },
    { month: "Feb", value: 99.5 },
    { month: "Mar", value: 99.7 },
    { month: "Apr", value: 99.6 },
    { month: "May", value: 99.8 },
    { month: "Jun", value: 99.97 },
  ];

  const incidentTrendData = [
    { month: "Jan", incidents: 24 },
    { month: "Feb", incidents: 19 },
    { month: "Mar", incidents: 14 },
    { month: "Apr", incidents: 11 },
    { month: "May", incidents: 8 },
    { month: "Jun", incidents: 5 },
  ];

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical":
        return "badge-critical";
      case "degraded":
        return "badge-degraded";
      default:
        return "badge-pending";
    }
  };

  return (
    <div className="space-y-6">
      {/* Health Summary Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Overall Health */}
        <div className="card-elevated p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Overall Network Health</p>
              <h2 className="text-3xl font-bold mt-1">
                <span className="status-healthy">{healthStatus}</span>
              </h2>
            </div>
            <CheckCircle2 className="w-8 h-8 text-status-healthy" />
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-status-healthy h-2 rounded-full"
              style={{ width: `${healthPercentage}%` }}
            ></div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">{healthPercentage}% uptime this month</p>
        </div>

        {/* KPI Cards */}
        {kpiData.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="card-elevated p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{kpi.label}</p>
                  <h3 className="text-2xl font-bold mt-1">{kpi.value}</h3>
                </div>
                <Icon className={`w-8 h-8 ${kpi.color}`} />
              </div>
              <p className="text-xs text-muted-foreground">Last 30 days</p>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Activity Panel */}
        <div className="lg:col-span-2 card-elevated p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-accent" />
            <h3 className="font-semibold text-lg">AI Activity</h3>
            <span className="ml-auto text-xs font-medium text-accent bg-accent bg-opacity-10 px-2.5 py-1 rounded-full">
              LIVE
            </span>
          </div>

          <div className="space-y-3">
            {aiActivities.map((item) => (
              <div key={item.id} className="flex items-start gap-3 p-3 bg-muted bg-opacity-30 rounded-lg">
                <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0 animate-pulse bg-accent"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{item.action}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {item.status === "in-progress" ? "In progress..." : "Queued"}
                  </p>
                </div>
                {item.status === "in-progress" && (
                  <Clock className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                )}
              </div>
            ))}
          </div>

          <button className="w-full mt-4 py-2 text-sm font-medium text-accent hover:bg-accent hover:bg-opacity-5 rounded-lg transition-colors">
            View All Actions →
          </button>
        </div>

        {/* Active Incidents Summary */}
        <div className="card-elevated p-6">
          <h3 className="font-semibold text-lg mb-4">Active Incidents</h3>
          <div className="space-y-3">
            {activeIncidents.slice(0, 3).map((incident) => (
              <div
                key={incident.id}
                className="p-3 rounded-lg border border-border hover:border-accent hover:border-opacity-50 transition-colors cursor-pointer"
              >
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-status-critical" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{incident.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{incident.impact}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 py-2 text-sm font-medium text-foreground border border-border hover:bg-muted rounded-lg transition-colors">
            View All
          </button>
        </div>
      </div>

      {/* Incidents Detail List */}
      <div className="card-elevated p-6">
        <h3 className="font-semibold text-lg mb-4">Incident Details</h3>
        <div className="space-y-4">
          {activeIncidents.map((incident) => (
            <div
              key={incident.id}
              className="pb-4 border-b border-border last:border-b-0 hover:bg-muted hover:bg-opacity-20 p-3 rounded-lg transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-start gap-3 flex-1">
                  <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-status-critical" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium">{incident.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{incident.impact}</p>
                  </div>
                </div>
                <div className={`${getSeverityBadge(incident.severity)} flex-shrink-0`}>
                  {incident.severity.charAt(0).toUpperCase() + incident.severity.slice(1)}
                </div>
              </div>
              <div className="ml-8 mt-2">
                <p className="text-sm text-accent font-medium">🤖 {incident.aiAction}</p>
                <p className="text-xs text-muted-foreground mt-1">{incident.timestamp}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Uptime Trend */}
        <div className="card-elevated p-6">
          <h3 className="font-semibold text-lg mb-4">Uptime Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={uptimeData}>
              <defs>
                <linearGradient id="colorUptime" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" domain={[98, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--accent))"
                fillOpacity={1}
                fill="url(#colorUptime)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Incident Reduction */}
        <div className="card-elevated p-6">
          <h3 className="font-semibold text-lg mb-4">Incident Reduction (6 months)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={incidentTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Line
                type="monotone"
                dataKey="incidents"
                stroke="hsl(var(--status-healthy))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--status-healthy))", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Network Overview */}
      <div className="card-elevated p-6">
        <h3 className="font-semibold text-lg mb-4">Network Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { region: "North America", sites: 12, status: "healthy" },
            { region: "Europe", sites: 8, status: "healthy" },
            { region: "Asia Pacific", sites: 15, status: "degraded" },
            { region: "LATAM", sites: 6, status: "healthy" },
            { region: "Africa", sites: 4, status: "healthy" },
          ].map((region) => {
            const statusColor =
              region.status === "healthy" ? "bg-status-healthy" : "bg-status-degraded";
            return (
              <div key={region.region} className="p-4 border border-border rounded-lg hover:border-accent transition-colors cursor-pointer">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-2 h-2 rounded-full ${statusColor}`}></div>
                  <h4 className="font-medium text-sm">{region.region}</h4>
                </div>
                <p className="text-lg font-bold">{region.sites}</p>
                <p className="text-xs text-muted-foreground">sites</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
