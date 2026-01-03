import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Download, TrendingUp, TrendingDown, AlertCircle, CheckCircle2, Eye, EyeOff, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useState, useMemo } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { cn } from "@/lib/utils";

type ChartType = "bar" | "pie" | "line" | "histogram" | "table";

// ===== AI ACTION DATA =====

const aiActionsDataMap: Record<string, any> = {
  "ran-anomaly-detection": {
    id: 1,
    action: "RAN Anomaly Detection",
    status: "Success",
    timestamp: "2 min ago",
    impact: "high",
    issueDetected: "Unusual spike in packet loss rates detected in RAN layer, affecting 2.3% of active subscribers",
    rootCause: "Interference from nearby 2.4GHz WiFi equipment in cellular band. Signal-to-noise ratio dropped by 18dB.",
    resolution: "AI-Engine automatically adjusted power allocation and beam steering parameters to mitigate interference. Initiated communication with spectrum monitoring team.",
    timeline: [
      { time: "14:32:15", event: "Anomaly detected via ML clustering algorithm" },
      { time: "14:32:18", event: "Correlation analysis with RF metrics completed" },
      { time: "14:32:25", event: "Root cause identified as external interference" },
      { time: "14:32:42", event: "Adaptive mitigation strategy deployed" },
      { time: "14:33:00", event: "Metric validation confirms 98.7% recovery" },
    ],
    metrics: [
      { name: "Mon", dropsBefore: 18, dropsAfter: 3, recovered: 83 },
      { name: "Tue", dropsBefore: 15, dropsAfter: 2, recovered: 87 },
      { name: "Wed", dropsBefore: 20, dropsAfter: 4, recovered: 80 },
      { name: "Thu", dropsBefore: 17, dropsAfter: 1, recovered: 94 },
      { name: "Fri", dropsBefore: 22, dropsAfter: 3, recovered: 86 },
      { name: "Sat", dropsBefore: 12, dropsAfter: 1, recovered: 92 },
      { name: "Sun", dropsBefore: 10, dropsAfter: 1, recovered: 90 },
    ],
  },
  "media-engine-ddos-protection": {
    id: 2,
    action: "Media Engine DDoS Protection",
    status: "Ongoing",
    timestamp: "5 min ago",
    impact: "high",
    issueDetected: "Distributed Denial of Service (DDoS) attack detected targeting media delivery nodes. Attack vector: UDP flood from 47 botnet IPs.",
    rootCause: "Coordinated botnet infrastructure targeting CDN edge nodes. Attack peaked at 2.3 Tbps of traffic.",
    resolution: "Automatic DDoS mitigation engaged: rate-limiting activated, suspicious IPs blacklisted, traffic rerouted through scrubbing center. Ongoing monitoring.",
    timeline: [
      { time: "14:25:30", event: "Anomalous traffic pattern detected" },
      { time: "14:25:45", event: "DDoS signature matched (UDP flood pattern)" },
      { time: "14:26:00", event: "Rate limiting applied to affected nodes" },
      { time: "14:26:15", event: "Botnet sources identified and blacklisted" },
      { time: "14:26:45", event: "Traffic redirected to mitigation center" },
    ],
    metrics: [
      { name: "Mon", attackTraffic: 450, mitigated: 448, throughput: 95 },
      { name: "Tue", attackTraffic: 380, mitigated: 378, throughput: 97 },
      { name: "Wed", attackTraffic: 520, mitigated: 518, throughput: 93 },
      { name: "Thu", attackTraffic: 290, mitigated: 288, throughput: 98 },
      { name: "Fri", attackTraffic: 610, mitigated: 608, throughput: 92 },
      { name: "Sat", attackTraffic: 150, mitigated: 149, throughput: 99 },
      { name: "Sun", attackTraffic: 120, mitigated: 119, throughput: 99 },
    ],
  },
  "core-network-correction": {
    id: 3,
    action: "CORE Network Correction",
    status: "Success",
    timestamp: "8 min ago",
    impact: "medium",
    issueDetected: "Routing inconsistencies in core network causing suboptimal path selection. 450 sessions rerouted to longer paths.",
    rootCause: "BGP convergence delay due to edge router misconfiguration. Metric values propagated incorrectly causing suboptimal route selection.",
    resolution: "BGP configuration corrected and redistributed. Routing table optimized. All affected sessions maintained with minimal latency impact.",
    timeline: [
      { time: "14:18:10", event: "BGP route instability detected" },
      { time: "14:18:25", event: "Configuration audit initiated" },
      { time: "14:18:40", event: "Root cause identified in edge router" },
      { time: "14:19:00", event: "Corrected configuration deployed" },
      { time: "14:19:30", event: "Route convergence verified" },
    ],
    metrics: [
      { name: "Mon", pathLength: 4.2, latency: 45, jitter: 2.1 },
      { name: "Tue", pathLength: 4.1, latency: 43, jitter: 1.9 },
      { name: "Wed", pathLength: 4.3, latency: 48, jitter: 2.3 },
      { name: "Thu", pathLength: 4.0, latency: 41, jitter: 1.7 },
      { name: "Fri", pathLength: 4.2, latency: 44, jitter: 2.0 },
      { name: "Sat", pathLength: 3.9, latency: 39, jitter: 1.5 },
      { name: "Sun", pathLength: 3.9, latency: 38, jitter: 1.4 },
    ],
  },
  "ip-backbone-fault-analysis": {
    id: 4,
    action: "IP-Backbone Fault Analysis",
    status: "Failed",
    timestamp: "12 min ago",
    impact: "high",
    issueDetected: "Transient fiber cut detected on backbone segment connecting regional datacenters. Optical signal loss on 4 fiber pairs.",
    rootCause: "Physical fiber damage from construction work. Manual traffic rerouting required due to limited redundancy on this segment.",
    resolution: "Automatic failover triggered. However, secondary path capacity exceeded threshold. Manual intervention required to coordinate load balancing across tertiary path.",
    timeline: [
      { time: "14:08:00", event: "Optical signal loss detected" },
      { time: "14:08:15", event: "Automatic failover initiated" },
      { time: "14:08:30", event: "Secondary path bandwidth exceeded" },
      { time: "14:08:45", event: "Manual escalation triggered" },
      { time: "14:09:30", event: "Tertiary path preparation ongoing" },
    ],
    metrics: [
      { name: "Mon", linkUtility: 68, packetLoss: 0.02, recovery: 100 },
      { name: "Tue", linkUtility: 72, packetLoss: 0.01, recovery: 100 },
      { name: "Wed", linkUtility: 85, packetLoss: 4.3, recovery: 45 },
      { name: "Thu", linkUtility: 88, packetLoss: 3.8, recovery: 50 },
      { name: "Fri", linkUtility: 75, packetLoss: 0.05, recovery: 98 },
      { name: "Sat", linkUtility: 55, packetLoss: 0.01, recovery: 100 },
      { name: "Sun", linkUtility: 52, packetLoss: 0.01, recovery: 100 },
    ],
  },
};

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
  dataKey: "calls",
  categoryKey: "name",
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
    { name: "Mon", sessions: 2100, failures: 4, bandwidth: 2.1, completed: 2096 },
    { name: "Tue", sessions: 2250, failures: 3, bandwidth: 2.2, completed: 2247 },
    { name: "Wed", sessions: 2380, failures: 5, bandwidth: 2.4, completed: 2375 },
    { name: "Thu", sessions: 2200, failures: 2, bandwidth: 2.15, completed: 2198 },
    { name: "Fri", sessions: 2500, failures: 6, bandwidth: 2.5, completed: 2494 },
    { name: "Sat", sessions: 1900, failures: 1, bandwidth: 1.9, completed: 1899 },
    { name: "Sun", sessions: 1870, failures: 2, bandwidth: 1.85, completed: 1868 },
  ],
  breakdown: [
    { type: "4G LTE", sessions: 8900, failures: 13, rate: "0.15%" },
    { type: "5G", sessions: 4200, failures: 8, rate: "0.19%" },
    { type: "WiFi", sessions: 2700, failures: 2, rate: "0.07%" },
  ],
  dataKey: "sessions",
  categoryKey: "name",
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
  dataKey: "total",
  categoryKey: "name",
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
  dataKey: "value",
  categoryKey: "name",
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
  dataKey: "incidents",
  categoryKey: "name",
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
  dataKey: "failures",
  categoryKey: "name",
});

const analyticsMap: Record<string, any> = {
  voice: generateVoiceAnalytics(),
  data: generateDataAnalytics(),
  subscribers: generateSubscriberAnalytics(),
  vendors: generateVendorAnalytics(),
  alarms: generateAlarmsAnalytics(),
  failures: generateFailureAnalytics(),
};

// ===== COLORS =====

const COLORS = [
  "#7c3aed", // purple primary
  "#a78bfa", // purple accent
  "#22c55e", // green healthy
  "#eab308", // yellow degraded
  "#ef4444", // red critical
];

const CHART_TYPES: ChartType[] = ["bar", "pie", "line", "histogram", "table"];

// ===== EXPORT UTILITIES =====

const exportToCSV = (data: any[], filename: string) => {
  if (!data || data.length === 0) {
    return;
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
};

const exportToJSON = (data: any[], filename: string) => {
  const json = JSON.stringify(data, null, 2);
  downloadFile(json, `${filename}.json`, "application/json");
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

// ===== DETAIL PAGE COMPONENT =====

export default function DetailPage() {
  const { section, action } = useParams<{ section: string; action?: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [chartType, setChartType] = useLocalStorage<ChartType>(
    `detail-chart-type-${section}`,
    "bar"
  );
  const [showTooltip, setShowTooltip] = useLocalStorage(
    `detail-show-tooltip-${section}`,
    true
  );
  const [showLegend, setShowLegend] = useLocalStorage(
    `detail-show-legend-${section}`,
    true
  );

  // Handle AI Action Detail View
  if (section === "ai-actions" && action) {
    const aiAction = aiActionsDataMap[action];

    if (!aiAction) {
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
            AI Action not found
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
            <h1 className="text-3xl font-bold text-foreground">{aiAction.action}</h1>
            <p className="text-muted-foreground text-sm mt-1">{aiAction.timestamp}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className={`text-xs font-semibold px-3 py-1 rounded ${
              aiAction.impact === "high"
                ? "bg-status-critical/10 text-status-critical"
                : aiAction.impact === "medium"
                ? "bg-status-degraded/10 text-status-degraded"
                : "bg-status-healthy/10 text-status-healthy"
            }`}>
              {aiAction.impact.toUpperCase()} IMPACT
            </div>
            <div className={`text-xs font-bold ${
              aiAction.status === "Success"
                ? "text-status-healthy"
                : aiAction.status === "Ongoing"
                ? "text-status-pending"
                : "text-status-critical"
            }`}>
              {aiAction.status}
            </div>
          </div>
        </div>

        {/* Issue & Resolution Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Issue Detected */}
          <div className="card-elevated p-6 border-l-4 border-status-critical">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-status-critical flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">Issue Detected</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {aiAction.issueDetected}
                </p>
              </div>
            </div>
          </div>

          {/* Root Cause */}
          <div className="card-elevated p-6 border-l-4 border-status-degraded">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-status-degraded flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">Root Cause</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {aiAction.rootCause}
                </p>
              </div>
            </div>
          </div>

          {/* Resolution */}
          <div className="card-elevated p-6 border-l-4 border-status-healthy lg:col-span-2">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-status-healthy flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">AI Resolution</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {aiAction.resolution}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="card-elevated p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Detection & Resolution Timeline</h3>
          <div className="space-y-3">
            {aiAction.timeline.map((entry: any, idx: number) => (
              <div key={idx} className="flex gap-4 items-start">
                <div className="flex flex-col items-center">
                  <div className={`w-3 h-3 rounded-full ${idx === 0 ? "bg-status-critical" : idx === aiAction.timeline.length - 1 ? "bg-status-healthy" : "bg-status-pending"}`} />
                  {idx !== aiAction.timeline.length - 1 && (
                    <div className="w-0.5 h-8 bg-border mt-1" />
                  )}
                </div>
                <div className="flex-1 pb-2">
                  <p className="text-sm font-semibold text-foreground">{entry.time}</p>
                  <p className="text-sm text-muted-foreground">{entry.event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Metrics Impact */}
        <div className="card-elevated p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Impact Metrics</h3>
            <div className="flex gap-1 bg-muted/30 p-1 rounded-lg">
              {CHART_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => setChartType(type)}
                  className={cn(
                    "px-2.5 py-1 rounded text-xs font-medium transition-all capitalize whitespace-nowrap",
                    chartType === type
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="h-96">
            {chartType === "pie" ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart data={aiAction.metrics}>
                  <Pie
                    data={aiAction.metrics}
                    dataKey={Object.keys(aiAction.metrics[0] || {}).find(k => k !== "name") || "recovered"}
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={showTooltip}
                  >
                    {aiAction.metrics.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  {showTooltip && <Tooltip />}
                  {showLegend && <Legend />}
                </PieChart>
              </ResponsiveContainer>
            ) : chartType === "line" || chartType === "histogram" ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={aiAction.metrics} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  {showTooltip && (
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                  )}
                  {showLegend && <Legend />}
                  {Object.keys(aiAction.metrics[0] || {})
                    .filter(key => key !== "name")
                    .map((key, idx) => (
                      <Line
                        key={key}
                        type="monotone"
                        dataKey={key}
                        stroke={COLORS[idx % COLORS.length]}
                        strokeWidth={2}
                        dot={{ fill: COLORS[idx % COLORS.length], r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    ))}
                </LineChart>
              </ResponsiveContainer>
            ) : chartType === "table" ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      {Object.keys(aiAction.metrics[0] || {}).map((key) => (
                        <th
                          key={key}
                          className={cn(
                            "py-2 px-3 font-semibold text-foreground",
                            typeof aiAction.metrics[0][key] === "number"
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
                    {aiAction.metrics.map((row: any, idx: number) => (
                      <tr key={idx} className="border-b border-border hover:bg-muted/30 transition-colors">
                        {Object.entries(row).map(([key, value]: any) => (
                          <td
                            key={key}
                            className={cn(
                              "py-3 px-3 text-foreground",
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
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={aiAction.metrics} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  {showTooltip && (
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                  )}
                  {showLegend && <Legend />}
                  {Object.keys(aiAction.metrics[0] || {})
                    .filter(key => key !== "name")
                    .map((key, idx) => (
                      <Bar
                        key={key}
                        dataKey={key}
                        fill={COLORS[idx % COLORS.length]}
                        radius={[8, 8, 0, 0]}
                      />
                    ))}
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm">
            View Full Report
          </button>
          <button className="flex-1 px-4 py-2 bg-muted hover:bg-muted/70 rounded-lg transition-colors font-medium text-sm">
            Escalate to Team
          </button>
        </div>
      </div>
    );
  }

  // Handle Regular Analytics Detail View
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

  const renderChart = () => {
    const chartData = analytics.mainChart;
    const dataKey = analytics.dataKey;
    const categoryKey = analytics.categoryKey;

    if (chartType === "pie") {
      return (
        <ResponsiveContainer width="100%" height={350}>
          <PieChart data={chartData}>
            <Pie
              data={chartData}
              dataKey={dataKey}
              nameKey={categoryKey}
              cx="50%"
              cy="50%"
              outerRadius={80}
              label={showTooltip}
            >
              {chartData.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            {showTooltip && <Tooltip />}
            {showLegend && <Legend />}
          </PieChart>
        </ResponsiveContainer>
      );
    } else if (chartType === "line" || chartType === "histogram") {
      return (
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey={categoryKey} stroke="hsl(var(--muted-foreground))" />
            <YAxis stroke="hsl(var(--muted-foreground))" />
            {showTooltip && (
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
            )}
            {showLegend && <Legend />}
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={COLORS[0]}
              strokeWidth={2}
              dot={{ fill: COLORS[0], r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      );
    } else if (chartType === "table") {
      return (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left py-2 px-3 font-semibold text-foreground">
                  {categoryKey}
                </th>
                <th className="text-right py-2 px-3 font-semibold text-foreground">
                  {dataKey}
                </th>
              </tr>
            </thead>
            <tbody>
              {chartData.map((row: any, idx: number) => (
                <tr key={idx} className="border-b border-border hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-3 text-foreground">{row[categoryKey]}</td>
                  <td className="text-right py-3 px-3 text-foreground font-semibold">
                    {typeof row[dataKey] === "number"
                      ? row[dataKey].toLocaleString()
                      : row[dataKey]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    } else {
      // bar chart (default)
      return (
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey={categoryKey} stroke="hsl(var(--muted-foreground))" />
            <YAxis stroke="hsl(var(--muted-foreground))" />
            {showTooltip && (
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
            )}
            {showLegend && <Legend />}
            <Bar dataKey={dataKey} fill={COLORS[0]} radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      );
    }
  };

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
          const statusColor =
            kpi.status === "critical"
              ? "text-status-critical"
              : kpi.status === "improving"
              ? "text-status-healthy"
              : "text-foreground";
          const trendIcon =
            kpi.change > 0 ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            );

          return (
            <div key={idx} className="card-elevated p-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                {kpi.label}
              </p>
              <div className="flex items-baseline justify-between gap-2">
                <p className={`text-2xl font-bold ${statusColor}`}>{kpi.value}</p>
                {kpi.change !== undefined && (
                  <p
                    className={`flex items-center gap-1 text-xs font-semibold ${
                      kpi.change < 0
                        ? "text-status-healthy"
                        : "text-status-degraded"
                    }`}
                  >
                    {kpi.change < 0 ? (
                      <TrendingDown className="w-3 h-3" />
                    ) : (
                      <TrendingUp className="w-3 h-3" />
                    )}
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
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Trend Analysis</h2>
            <div className="flex gap-1 bg-muted/30 p-1 rounded-lg overflow-x-auto">
              {CHART_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => setChartType(type)}
                  className={cn(
                    "px-2.5 py-1 rounded text-xs font-medium transition-all capitalize whitespace-nowrap flex-shrink-0",
                    chartType === type
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  title={`Show as ${type}`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="h-96">
            {renderChart()}
          </div>
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
            <h3 className="text-sm font-semibold text-foreground mb-2">Visualization</h3>
            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                <button
                  onClick={() => setShowTooltip(!showTooltip)}
                  className="text-primary hover:underline transition-colors"
                >
                  {showTooltip ? "Hide" : "Show"} Tooltips
                </button>
              </div>
              <div className="flex items-center gap-2">
                <EyeOff className="w-4 h-4" />
                <button
                  onClick={() => setShowLegend(!showLegend)}
                  className="text-primary hover:underline transition-colors"
                >
                  {showLegend ? "Hide" : "Show"} Legend
                </button>
              </div>
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
