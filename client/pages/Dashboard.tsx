import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, CheckCircle2, TrendingDown, TrendingUp, Zap } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import DashboardWidget from "@/components/DashboardWidget";
import { useLocalStorage, DEFAULT_WIDGETS, type DashboardLayout, type WidgetConfig } from "@/hooks/useLocalStorage";
import { cn } from "@/lib/utils";

// ===== DATA GENERATORS =====

const generateVoiceChartData = () => [
  { name: "Mon", calls: 3500, drops: 18, blocks: 12 },
  { name: "Tue", calls: 3200, drops: 15, blocks: 10 },
  { name: "Wed", calls: 3800, drops: 20, blocks: 14 },
  { name: "Thu", calls: 3600, drops: 17, blocks: 11 },
  { name: "Fri", calls: 4200, drops: 22, blocks: 16 },
  { name: "Sat", calls: 2900, drops: 12, blocks: 8 },
  { name: "Sun", calls: 2700, drops: 10, blocks: 7 },
];

const generateDataChartData = () => [
  { name: "Mon", sessions: 2100, failures: 4 },
  { name: "Tue", sessions: 2250, failures: 3 },
  { name: "Wed", sessions: 2380, failures: 5 },
  { name: "Thu", sessions: 2200, failures: 2 },
  { name: "Fri", sessions: 2500, failures: 6 },
  { name: "Sat", sessions: 1900, failures: 1 },
  { name: "Sun", sessions: 1870, failures: 2 },
];

const generateSubscriberChartData = () => [
  { name: "Week 1", subscribers: 4650000, active: 3720000 },
  { name: "Week 2", subscribers: 4710000, active: 3760000 },
  { name: "Week 3", subscribers: 4780000, active: 3830000 },
  { name: "Week 4", subscribers: 4850000, active: 3920000 },
];

const generateVendorData = () => [
  { name: "Apple", value: 2800 },
  { name: "Samsung", value: 3200 },
  { name: "Nokia", value: 1800 },
  { name: "Xiaomi", value: 2400 },
  { name: "Others", value: 1200 },
];

const generateAIActionsData = () => [
  { id: 1, action: "RAN Anomaly Detection", status: "Success", timestamp: "2 min ago", impact: "high" },
  { id: 2, action: "Media Engine DDoS Protection", status: "Ongoing", timestamp: "5 min ago", impact: "high" },
  { id: 3, action: "CORE Network Correction", status: "Success", timestamp: "8 min ago", impact: "medium" },
  { id: 4, action: "IP-Backbone Fault Analysis", status: "Failed", timestamp: "12 min ago", impact: "high" },
];

const generateAlarmsChartData = () => [
  { name: "Mon", sites: 24, failures: 8 },
  { name: "Tue", sites: 19, failures: 6 },
  { name: "Wed", sites: 28, failures: 10 },
  { name: "Thu", sites: 15, failures: 5 },
  { name: "Fri", sites: 32, failures: 12 },
  { name: "Sat", sites: 8, failures: 2 },
  { name: "Sun", sites: 6, failures: 1 },
];

const generateFailureData = () => [
  { name: "Huawei", value: 156 },
  { name: "Nokia", value: 203 },
  { name: "Samsung", value: 89 },
  { name: "Cisco", value: 124 },
  { name: "Ericsson", value: 178 },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [widgetLayout, setWidgetLayout] = useLocalStorage<DashboardLayout>(
    "dashboard_layout",
    DEFAULT_WIDGETS
  );

  const updateWidgetConfig = useCallback((widgetId: string, updates: Partial<WidgetConfig>) => {
    setWidgetLayout((prev) => ({
      ...prev,
      [widgetId]: { ...prev[widgetId], ...updates },
    }));
  }, [setWidgetLayout]);

  const resetWidget = useCallback((widgetId: string) => {
    setWidgetLayout((prev) => ({
      ...prev,
      [widgetId]: DEFAULT_WIDGETS[widgetId],
    }));
  }, [setWidgetLayout]);

  // ===== COMPONENT HELPERS =====
  
  const MetricBadge = ({ label, value, change, isAbnormal, icon: Icon }: any) => (
    <div className="p-3 bg-muted/20 rounded-lg border border-muted/30">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
          <p className={`text-2xl font-bold mt-1 ${isAbnormal ? "text-status-critical" : "text-foreground"}`}>
            {typeof value === "number" && value > 1000 ? (value > 1000000 ? (value / 1000000).toFixed(1) + "M" : (value / 1000).toFixed(0) + "K") : value}
          </p>
          {change !== undefined && (
            <p className={`text-xs mt-1 flex items-center gap-1 ${change < 0 ? "text-status-healthy" : "text-status-degraded"}`}>
              {change < 0 ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
              {Math.abs(change)}% vs yesterday
            </p>
          )}
        </div>
        {isAbnormal && <AlertCircle className="w-5 h-5 text-status-critical flex-shrink-0 mt-1" />}
      </div>
    </div>
  );

  const ActionRow = ({ action, status, timestamp, impact }: any) => {
    const statusColor = status === "Success" ? "text-status-healthy" : status === "Ongoing" ? "text-status-pending" : "text-status-critical";
    const impactColor = impact === "high" ? "bg-status-critical/10 text-status-critical" : impact === "medium" ? "bg-status-degraded/10 text-status-degraded" : "bg-status-healthy/10 text-status-healthy";
    
    return (
      <div
        className="p-3 border border-muted rounded-lg hover:border-primary/50 hover:bg-muted/40 transition-all cursor-pointer"
        onClick={() => navigate(`/detail/ai-actions/${action.replace(/\s+/g, "-").toLowerCase()}`)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">{action}</p>
            <p className="text-xs text-muted-foreground mt-1">{timestamp}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded ${impactColor}`}>
              {impact === "high" ? "HIGH" : impact === "medium" ? "MED" : "LOW"}
            </span>
            <span className={`text-xs font-bold ${statusColor}`}>{status}</span>
          </div>
        </div>
      </div>
    );
  };

  const widgets = [
    {
      id: "voice",
      title: "Voice",
      subtitle: "Call volume & quality",
      type: "kpi",
      data: generateVoiceChartData(),
      dataKey: "calls",
      categoryKey: "name",
      primaryMetric: { label: "Calls", value: 24500, change: -8, isAbnormal: false },
      secondaryMetrics: [
        { label: "Drops", value: 145, change: -12, isAbnormal: true },
        { label: "Blocks", value: 89, change: 5, isAbnormal: false },
      ],
      onNavigate: () => navigate("/detail/voice"),
    },
    {
      id: "data",
      title: "Data",
      subtitle: "Sessions & failures",
      type: "kpi-chart",
      data: generateDataChartData(),
      dataKey: "sessions",
      categoryKey: "name",
      primaryMetric: { label: "Sessions", value: 15800, change: 15, isAbnormal: false },
      secondaryMetrics: [
        { label: "Failures", value: 23, change: -12, isAbnormal: false },
      ],
      onNavigate: () => navigate("/detail/data"),
    },
    {
      id: "subscribers",
      title: "Subscribers",
      subtitle: "Active subscriber base",
      type: "kpi-chart",
      data: generateSubscriberChartData(),
      dataKey: "subscribers",
      categoryKey: "name",
      primaryMetric: { label: "Total", value: 4850000, change: 8, isAbnormal: false },
      secondaryMetrics: [
        { label: "Active", value: 3920000, change: 6, isAbnormal: false },
      ],
      onNavigate: () => navigate("/detail/subscribers"),
    },
    {
      id: "vendors",
      title: "Mobile Device Vendors",
      subtitle: "Distribution across manufacturers",
      type: "chart",
      data: generateVendorData(),
      dataKey: "value",
      categoryKey: "name",
      onNavigate: () => navigate("/detail/vendors"),
    },
    {
      id: "aiActions",
      title: "Recent AI-Engine Actions",
      subtitle: "Automated network operations",
      type: "actions",
      data: generateAIActionsData(),
      onNavigate: () => navigate("/detail/ai-actions"),
    },
    {
      id: "alarms",
      title: "Network Alarms",
      subtitle: "Incidents & congestion status",
      type: "kpi",
      data: generateAlarmsChartData(),
      dataKey: "sites",
      categoryKey: "name",
      primaryMetric: { label: "Active Issues", value: 12, change: 25, isAbnormal: true },
      secondaryMetrics: [
        { label: "Failures", value: 45, change: 18, isAbnormal: true },
        { label: "Low Traffic", value: 22, change: -5, isAbnormal: false },
      ],
      onNavigate: () => navigate("/detail/alarms"),
    },
    {
      id: "failures",
      title: "Total Failures per Vendor",
      subtitle: "Equipment reliability metrics",
      type: "chart",
      data: generateFailureData(),
      dataKey: "value",
      categoryKey: "name",
      onNavigate: () => navigate("/detail/failures"),
    },
  ];

  const sortedWidgets = widgets.sort(
    (a, b) => (widgetLayout[a.id]?.order || 0) - (widgetLayout[b.id]?.order || 0)
  );

  const visibleWidgets = sortedWidgets.filter((w) => widgetLayout[w.id]?.visible !== false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm">
          Real-time network operations overview. Customize in{" "}
          <a href="/settings" className="text-primary hover:underline font-medium">
            Settings
          </a>
        </p>
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-max">
        {visibleWidgets.length === 0 ? (
          <div className="col-span-full card-elevated p-12 flex flex-col items-center justify-center text-center">
            <p className="text-muted-foreground mb-2">No widgets visible</p>
            <a href="/settings" className="text-primary hover:underline text-sm">
              Go to Settings to enable widgets
            </a>
          </div>
        ) : (
          visibleWidgets.map((widget) => {
            const config = widgetLayout[widget.id] || DEFAULT_WIDGETS[widget.id];

            // KPI Cards (Voice, Data, Subscribers, Alarms)
            if (widget.type === "kpi") {
              return (
                <div
                  key={widget.id}
                  className="card-elevated p-6 cursor-pointer hover:shadow-lg transition-all hover:border-primary/50"
                  onClick={widget.onNavigate}
                >
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-foreground">{widget.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{widget.subtitle}</p>
                  </div>

                  <div className="space-y-3">
                    {/* Primary Metric */}
                    {widget.primaryMetric && (
                      <MetricBadge {...widget.primaryMetric} />
                    )}

                    {/* Secondary Metrics */}
                    {widget.secondaryMetrics && widget.secondaryMetrics.length > 0 && (
                      <div className="space-y-2">
                        {widget.secondaryMetrics.map((metric: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between p-2 rounded hover:bg-muted/20 transition-colors">
                            <span className="text-xs font-medium text-muted-foreground">{metric.label}</span>
                            <div className="flex items-center gap-2">
                              <span className={`font-semibold ${metric.isAbnormal ? "text-status-critical" : "text-foreground"}`}>
                                {typeof metric.value === "number" && metric.value > 1000 ? (metric.value / 1000).toFixed(0) + "K" : metric.value}
                              </span>
                              {metric.change !== undefined && (
                                <span className={`text-xs ${metric.change < 0 ? "text-status-healthy" : "text-status-degraded"}`}>
                                  {metric.change < 0 ? "−" : "+"}{Math.abs(metric.change)}%
                                </span>
                              )}
                              {metric.isAbnormal && <AlertCircle className="w-3 h-3 text-status-critical" />}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            }

            // KPI Cards with Charts (Data, Subscribers)
            if (widget.type === "kpi-chart") {
              const COLORS = ["#7c3aed", "#a78bfa", "#22c55e", "#eab308", "#ef4444"];
              const CHART_TYPES = ["bar", "pie", "line", "histogram", "table"];

              return (
                <div
                  key={widget.id}
                  className="card-elevated p-6 cursor-pointer hover:shadow-lg transition-all hover:border-primary/50"
                  onClick={widget.onNavigate}
                >
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-foreground">{widget.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{widget.subtitle}</p>
                  </div>

                  <div className="space-y-4">
                    {/* Metrics Section */}
                    <div className="space-y-3">
                      {/* Primary Metric */}
                      {widget.primaryMetric && (
                        <MetricBadge {...widget.primaryMetric} />
                      )}

                      {/* Secondary Metrics */}
                      {widget.secondaryMetrics && widget.secondaryMetrics.length > 0 && (
                        <div className="space-y-2">
                          {widget.secondaryMetrics.map((metric: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between p-2 rounded hover:bg-muted/20 transition-colors">
                              <span className="text-xs font-medium text-muted-foreground">{metric.label}</span>
                              <div className="flex items-center gap-2">
                                <span className={`font-semibold ${metric.isAbnormal ? "text-status-critical" : "text-foreground"}`}>
                                  {typeof metric.value === "number" && metric.value > 1000 ? (metric.value / 1000).toFixed(0) + "K" : metric.value}
                                </span>
                                {metric.change !== undefined && (
                                  <span className={`text-xs ${metric.change < 0 ? "text-status-healthy" : "text-status-degraded"}`}>
                                    {metric.change < 0 ? "−" : "+"}{Math.abs(metric.change)}%
                                  </span>
                                )}
                                {metric.isAbnormal && <AlertCircle className="w-3 h-3 text-status-critical" />}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Chart Section */}
                    {widget.data && widget.data.length > 0 && (
                      <div className="border-t border-border pt-4 mt-4">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-xs font-medium text-muted-foreground">Trend Chart</p>
                          <div className="flex gap-1 bg-muted/30 p-1 rounded-lg overflow-x-auto">
                            {CHART_TYPES.slice(0, 3).map((type) => (
                              <button
                                key={type}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateWidgetConfig(widget.id, { chartType: type as any });
                                }}
                                className={cn(
                                  "px-2 py-1 rounded text-xs font-medium transition-all capitalize whitespace-nowrap flex-shrink-0",
                                  config.chartType === type
                                    ? "bg-primary text-primary-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                                )}
                              >
                                {type}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="h-48">
                          {config.chartType === "pie" ? (
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart data={widget.data}>
                                <Pie
                                  data={widget.data}
                                  dataKey={widget.dataKey}
                                  nameKey={widget.categoryKey}
                                  cx="50%"
                                  cy="50%"
                                  outerRadius={50}
                                >
                                  {widget.data.map((entry: any, index: number) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                  ))}
                                </Pie>
                                {config.showTooltip && <Tooltip />}
                                {config.showLegend && <Legend />}
                              </PieChart>
                            </ResponsiveContainer>
                          ) : (
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={widget.data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                <XAxis dataKey={widget.categoryKey} stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
                                <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
                                {config.showTooltip && (
                                  <Tooltip
                                    contentStyle={{
                                      backgroundColor: "hsl(var(--card))",
                                      border: "1px solid hsl(var(--border))",
                                      borderRadius: "6px",
                                      fontSize: "12px",
                                    }}
                                  />
                                )}
                                {config.showLegend && <Legend />}
                                <Line
                                  type="monotone"
                                  dataKey={widget.dataKey}
                                  stroke={COLORS[0]}
                                  strokeWidth={2}
                                  dot={{ fill: COLORS[0], r: 3 }}
                                  activeDot={{ r: 5 }}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            }

            // AI Actions List
            if (widget.type === "actions") {
              return (
                <div
                  key={widget.id}
                  className="card-elevated p-6 hover:shadow-lg transition-all lg:col-span-2"
                >
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-foreground">{widget.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{widget.subtitle}</p>
                  </div>
                  <div className="space-y-2">
                    {widget.data.map((action: any) => (
                      <ActionRow key={action.id} {...action} />
                    ))}
                  </div>
                </div>
              );
            }

            // Chart Cards (Vendors, Failures)
            return (
              <DashboardWidget
                key={widget.id}
                title={widget.title}
                subtitle={widget.subtitle}
                data={widget.data}
                dataKey={widget.dataKey}
                categoryKey={widget.categoryKey}
                chartType={config.chartType}
                onChartTypeChange={(type) =>
                  updateWidgetConfig(widget.id, { chartType: type })
                }
                showTooltip={config.showTooltip}
                onTooltipChange={(show) =>
                  updateWidgetConfig(widget.id, { showTooltip: show })
                }
                showLegend={config.showLegend}
                onLegendChange={(show) =>
                  updateWidgetConfig(widget.id, { showLegend: show })
                }
                onReset={() => resetWidget(widget.id)}
                onClick={widget.onNavigate}
                height={320}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
