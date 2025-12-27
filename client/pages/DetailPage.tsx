import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Download, TrendingUp, TrendingDown, AlertCircle, CheckCircle2 } from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { cn } from "@/lib/utils";

// ===== DATA GENERATORS FOR ANALYTICS =====

const generateVoiceAnalytics = () => ({
  title: "Voice Analytics",
  kpis: [
    { label: "Total Calls", value: "24.5K", change: -8, status: "normal" },
    { label: "Call Drop Rate", value: "0.59%", change: -12, status: "improving" },
    { label: "Completed Rate", value: "99.41%", change: 8, status: "normal" },
    { label: "Avg Duration", value: "3m 24s", change: 2, status: "normal" },
  ],
  mainChart: [
    { name: "Mon", calls: 3500, drops: 18, blocks: 12, completed: 3470 },
    { name: "Tue", calls: 3200, drops: 15, blocks: 10, completed: 3175 },
    { name: "Wed", calls: 3800, drops: 20, blocks: 14, completed: 3766 },
    { name: "Thu", calls: 3600, drops: 17, blocks: 11, completed: 3572 },
    { name: "Fri", calls: 4200, drops: 22, blocks: 16, completed: 4162 },
    { name: "Sat", calls: 2900, drops: 12, blocks: 8, completed: 2880 },
    { name: "Sun", calls: 2700, drops: 10, blocks: 7, completed: 2683 },
  ],
  breakdown: [
    { region: "North America", calls: 8200, drops: 45, rate: "0.55%" },
    { region: "Europe", calls: 6400, drops: 38, rate: "0.59%" },
    { region: "Asia Pacific", calls: 5800, drops: 38, rate: "0.66%" },
    { region: "LATAM", calls: 2400, drops: 16, rate: "0.67%" },
    { region: "Africa", calls: 1700, drops: 8, rate: "0.47%" },
  ],
});

const generateDataAnalytics = () => ({
  title: "Data Analytics",
  kpis: [
    { label: "Total Sessions", value: "15.8K", change: 15, status: "normal" },
    { label: "Failure Rate", value: "0.15%", change: -12, status: "improving" },
    { label: "Peak Bandwidth", value: "2.4 Tbps", change: 5, status: "normal" },
    { label: "Avg Latency", value: "42ms", change: -3, status: "normal" },
  ],
  mainChart: [
    { name: "Mon", sessions: 2100, failures: 4, bandwidth: 2.1 },
    { name: "Tue", sessions: 2250, failures: 3, bandwidth: 2.2 },
    { name: "Wed", sessions: 2380, failures: 5, bandwidth: 2.4 },
    { name: "Thu", sessions: 2200, failures: 2, bandwidth: 2.15 },
    { name: "Fri", sessions: 2500, failures: 6, bandwidth: 2.5 },
    { name: "Sat", sessions: 1900, failures: 1, bandwidth: 1.9 },
    { name: "Sun", sessions: 1870, failures: 2, bandwidth: 1.85 },
  ],
  breakdown: [
    { type: "4G LTE", sessions: 8900, failures: 13, rate: "0.15%" },
    { type: "5G", sessions: 4200, failures: 8, rate: "0.19%" },
    { type: "WiFi", sessions: 2700, failures: 2, rate: "0.07%" },
  ],
});

const generateSubscriberAnalytics = () => ({
  title: "Subscriber Analytics",
  kpis: [
    { label: "Total Subscribers", value: "4.85M", change: 8, status: "normal" },
    { label: "Active Subscribers", value: "3.92M", change: 6, status: "normal" },
    { label: "Churn Rate", value: "2.3%", change: -5, status: "improving" },
    { label: "ARPU Growth", value: "+4.2%", change: 12, status: "normal" },
  ],
  mainChart: [
    { name: "Week 1", total: 4650000, active: 3720000, new: 45000 },
    { name: "Week 2", total: 4710000, active: 3760000, new: 48000 },
    { name: "Week 3", total: 4780000, active: 3830000, new: 52000 },
    { name: "Week 4", total: 4850000, active: 3920000, new: 55000 },
  ],
  breakdown: [
    { segment: "Prepaid", subscribers: 2180000, churn: "3.2%" },
    { segment: "Postpaid", subscribers: 1910000, churn: "1.5%" },
    { segment: "Enterprise", subscribers: 700000, churn: "0.8%" },
    { segment: "Trial", subscribers: 60000, churn: "15.2%" },
  ],
});

const generateVendorAnalytics = () => ({
  title: "Mobile Device Vendor Analysis",
  kpis: [
    { label: "Top Vendor", value: "Samsung", change: 0, status: "normal" },
    { label: "Market Share", value: "32%", change: 5, status: "normal" },
    { label: "Active Devices", value: "12.8M", change: 12, status: "normal" },
    { label: "Avg Device Age", value: "3.2 yrs", change: 2, status: "normal" },
  ],
  mainChart: [
    { name: "Apple", value: 2800, performance: 95 },
    { name: "Samsung", value: 3200, performance: 92 },
    { name: "Nokia", value: 1800, performance: 88 },
    { name: "Xiaomi", value: 2400, performance: 89 },
    { name: "Others", value: 1200, performance: 85 },
  ],
  breakdown: [
    { vendor: "Apple", devices: 2800000, marketShare: "22%", performanceScore: 95, issues: 24 },
    { vendor: "Samsung", devices: 3200000, marketShare: "25%", performanceScore: 92, issues: 45 },
    { vendor: "Nokia", devices: 1800000, marketShare: "14%", performanceScore: 88, issues: 38 },
    { vendor: "Xiaomi", devices: 2400000, marketShare: "19%", performanceScore: 89, issues: 52 },
    { vendor: "Others", devices: 1200000, marketShare: "9%", performanceScore: 85, issues: 28 },
  ],
});

const generateAlarmsAnalytics = () => ({
  title: "Network Alarms Analytics",
  kpis: [
    { label: "Active Incidents", value: "12", change: 25, status: "critical" },
    { label: "MTTR (Avg)", value: "18min", change: -8, status: "improving" },
    { label: "Alarm Rate", value: "4.2 /min", change: 15, status: "warning" },
    { label: "Resolution Rate", value: "92%", change: 3, status: "normal" },
  ],
  mainChart: [
    { name: "Mon", incidents: 24, resolved: 22, pending: 2 },
    { name: "Tue", incidents: 19, resolved: 18, pending: 1 },
    { name: "Wed", incidents: 28, resolved: 26, pending: 2 },
    { name: "Thu", incidents: 15, resolved: 14, pending: 1 },
    { name: "Fri", incidents: 32, resolved: 29, pending: 3 },
    { name: "Sat", incidents: 8, resolved: 8, pending: 0 },
    { name: "Sun", incidents: 6, resolved: 6, pending: 0 },
  ],
  breakdown: [
    { severity: "Critical", count: 5, mttr: "12min", resolution: "100%" },
    { severity: "High", count: 35, mttr: "18min", resolution: "94%" },
    { severity: "Medium", count: 68, mttr: "35min", resolution: "89%" },
    { severity: "Low", count: 124, mttr: "2.5hr", resolution: "78%" },
  ],
});

const generateFailureAnalytics = () => ({
  title: "Equipment Failure Analysis",
  kpis: [
    { label: "Total Failures", value: "750", change: -15, status: "improving" },
    { label: "MTTR", value: "2.4hr", change: -22, status: "improving" },
    { label: "Critical Failures", value: "28", change: -35, status: "improving" },
    { label: "RCA Completion", value: "94%", change: 8, status: "normal" },
  ],
  mainChart: [
    { name: "Huawei", failures: 156, critical: 8, warning: 45 },
    { name: "Nokia", failures: 203, critical: 12, warning: 58 },
    { name: "Samsung", failures: 89, critical: 4, warning: 25 },
    { name: "Cisco", failures: 124, critical: 6, warning: 35 },
    { name: "Ericsson", failures: 178, critical: 10, warning: 50 },
  ],
  breakdown: [
    { vendor: "Huawei", failures: 156, mttr: "2.1hr", failureRate: "0.8%", trend: "↓" },
    { vendor: "Nokia", failures: 203, mttr: "2.8hr", failureRate: "1.1%", trend: "↓" },
    { vendor: "Samsung", failures: 89, mttr: "1.9hr", failureRate: "0.6%", trend: "→" },
    { vendor: "Cisco", failures: 124, mttr: "2.2hr", failureRate: "0.9%", trend: "↓" },
    { vendor: "Ericsson", failures: 178, mttr: "2.6hr", failureRate: "1.0%", trend: "↓" },
  ],
});

const analyticsMap: Record<string, any> = {
  voice: generateVoiceAnalytics(),
  data: generateDataAnalytics(),
  subscribers: generateSubscriberAnalytics(),
  vendors: generateVendorAnalytics(),
  alarms: generateAlarmsAnalytics(),
  failures: generateFailureAnalytics(),
};

// ===== DETAIL PAGE COMPONENT =====

export default function DetailPage() {
  const { section } = useParams<{ section: string }>();
  const navigate = useNavigate();

  const analytics = section ? analyticsMap[section] : null;

  if (!analytics) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-primary hover:underline transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
        <div className="card-elevated p-8 text-center text-muted-foreground">
          Section not found
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-primary hover:underline mb-4 transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-foreground">{analytics.title}</h1>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/70 rounded-lg transition-colors text-sm font-medium">
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>

      {/* KPI Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {analytics.kpis.map((kpi: any, idx: number) => {
          const statusColor = kpi.status === "critical" ? "text-status-critical" : kpi.status === "improving" ? "text-status-healthy" : "text-foreground";
          const trendIcon = kpi.change > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />;
          
          return (
            <div key={idx} className="card-elevated p-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">{kpi.label}</p>
              <div className="flex items-baseline justify-between gap-2">
                <p className={`text-2xl font-bold ${statusColor}`}>{kpi.value}</p>
                {kpi.change !== undefined && (
                  <p className={`flex items-center gap-1 text-xs font-semibold ${kpi.change < 0 ? "text-status-healthy" : "text-status-degraded"}`}>
                    {kpi.change < 0 ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                    {Math.abs(kpi.change)}%
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Primary Chart */}
        <div className="lg:col-span-2 card-elevated p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Trend Analysis</h2>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={analytics.mainChart}>
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
              <Line type="monotone" dataKey="value" stroke="#7c3aed" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="completed" stroke="#22c55e" strokeWidth={2} dot={{ r: 4 }} opacity={0.7} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Summary Stats */}
        <div className="space-y-4">
          <div className="card-elevated p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Status</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-status-healthy" />
                <div>
                  <p className="text-sm font-medium text-foreground">Healthy</p>
                  <p className="text-xs text-muted-foreground">Operations normal</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-status-degraded" />
                <div>
                  <p className="text-sm font-medium text-foreground">Monitor</p>
                  <p className="text-xs text-muted-foreground">Some degradation</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card-elevated p-6 bg-primary/5 border-primary/20">
            <h3 className="text-sm font-semibold text-foreground mb-2">Time Range</h3>
            <div className="flex gap-2">
              <button className="flex-1 px-3 py-2 bg-primary text-primary-foreground rounded text-xs font-medium">24h</button>
              <button className="flex-1 px-3 py-2 bg-muted rounded text-xs font-medium hover:bg-muted/70 transition-colors">7d</button>
              <button className="flex-1 px-3 py-2 bg-muted rounded text-xs font-medium hover:bg-muted/70 transition-colors">30d</button>
            </div>
          </div>
        </div>
      </div>

      {/* Data Breakdown Table */}
      <div className="card-elevated p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Detailed Breakdown</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {Object.keys(analytics.breakdown[0] || {}).map((key) => (
                  <th
                    key={key}
                    className={cn(
                      "py-3 px-4 font-semibold text-foreground",
                      typeof analytics.breakdown[0][key] === "number"
                        ? "text-right"
                        : "text-left"
                    )}
                  >
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {analytics.breakdown.map((row: any, idx: number) => (
                <tr key={idx} className="border-b border-border hover:bg-muted/30 transition-colors">
                  {Object.entries(row).map(([key, value]: any) => (
                    <td
                      key={key}
                      className={cn(
                        "py-3 px-4 text-foreground",
                        typeof value === "number" ? "text-right font-semibold" : ""
                      )}
                    >
                      {value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm">
          Set Alerts
        </button>
        <button className="flex-1 px-4 py-2 bg-muted hover:bg-muted/70 rounded-lg transition-colors font-medium text-sm">
          Compare Periods
        </button>
        <button className="flex-1 px-4 py-2 bg-muted hover:bg-muted/70 rounded-lg transition-colors font-medium text-sm">
          Schedule Report
        </button>
      </div>
    </div>
  );
}
