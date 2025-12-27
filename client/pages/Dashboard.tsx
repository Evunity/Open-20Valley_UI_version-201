import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, CheckCircle2, TrendingDown, TrendingUp } from "lucide-react";
import DashboardWidget from "@/components/DashboardWidget";
import { useLocalStorage, DEFAULT_WIDGETS, type DashboardLayout, type WidgetConfig } from "@/hooks/useLocalStorage";

// ===== DATA GENERATORS =====

// Voice section: Number of Calls, Call Drops, Call Blocks, Completed Calls
const generateVoiceData = () => [
  { name: "Number of Calls", value: 24500, change: 12, isAbnormal: false },
  { name: "Call Drops", value: 145, change: -8, isAbnormal: true },
  { name: "Call Blocks", value: 89, change: 5, isAbnormal: false },
  { name: "Completed Calls", value: 24266, change: 13, isAbnormal: false },
];

// Data section: Data Sessions, Data Failures
const generateDataData = () => [
  { name: "Data Sessions", value: 15800, change: 15, isAbnormal: false },
  { name: "Data Failures", value: 23, change: -12, isAbnormal: false },
];

// Subscribers: Total Subscribers, Active Subscribers
const generateSubscriberData = () => [
  { name: "Total Subscribers", value: 4850000, change: 8, isAbnormal: false },
  { name: "Active Subscribers", value: 3920000, change: 6, isAbnormal: false },
];

// Mobile Device Vendors
const generateVendorData = () => [
  { name: "Apple", value: 2800 },
  { name: "Samsung", value: 3200 },
  { name: "Nokia", value: 1800 },
  { name: "Xiaomi", value: 2400 },
  { name: "Others", value: 1200 },
];

// Recent AI-Engine Actions
const generateAIActionsData = () => [
  { id: 1, action: "RAN Anomaly Detection", status: "Success", timestamp: "2 min ago" },
  { id: 2, action: "Media Engine DDoS Protection", status: "Ongoing", timestamp: "5 min ago" },
  { id: 3, action: "CORE Network Correction", status: "Success", timestamp: "8 min ago" },
  { id: 4, action: "IP-Backbone Fault Analysis", status: "Failed", timestamp: "12 min ago" },
];

// Network Alarms: Down Sites, Network Failures, % Low Traffic Sites, % Congested Sites
const generateAlarmData = () => [
  { name: "Down Sites", value: 12, isAbnormal: true },
  { name: "Network Failures", value: 45, isAbnormal: true },
  { name: "Low Traffic Sites (%)", value: 22, isAbnormal: false },
  { name: "Congested Sites (%)", value: 18, isAbnormal: true },
];

// Total Failures per Vendor: Huawei, Nokia, Samsung, Cisco, Ericsson
const generateFailureData = () => [
  { name: "Huawei", value: 156 },
  { name: "Nokia", value: 203 },
  { name: "Samsung", value: 89 },
  { name: "Cisco", value: 124 },
  { name: "Ericsson", value: 178 },
];

// Chart data for visualization
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

const generateAlarmsChartData = () => [
  { name: "Mon", sites: 24, failures: 8 },
  { name: "Tue", sites: 19, failures: 6 },
  { name: "Wed", sites: 28, failures: 10 },
  { name: "Thu", sites: 15, failures: 5 },
  { name: "Fri", sites: 32, failures: 12 },
  { name: "Sat", sites: 8, failures: 2 },
  { name: "Sun", sites: 6, failures: 1 },
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

  // ===== KPI DISPLAY COMPONENTS =====
  const formatValue = (value: number) => {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + "M";
    } else if (value >= 1000) {
      return (value / 1000).toFixed(1) + "K";
    }
    return value.toLocaleString();
  };

  const KPIRow = ({ label, value, change, isAbnormal }: any) => (
    <div className="p-3 rounded-lg hover:bg-muted/40 transition-colors border border-transparent hover:border-muted">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className={`text-xl font-bold ${isAbnormal ? "text-status-critical" : "text-foreground"}`}>
              {formatValue(value)}
            </span>
            {change !== undefined && (
              <span className={`text-xs font-medium flex items-center gap-1 ${change > 0 ? "text-status-healthy" : "text-status-degraded"}`}>
                {change > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {Math.abs(change)}%
              </span>
            )}
          </div>
        </div>
        {isAbnormal && <AlertCircle className="w-5 h-5 text-status-critical flex-shrink-0 mt-1" />}
      </div>
    </div>
  );

  const ActionItem = ({ action, status, timestamp }: any) => {
    const statusColor =
      status === "Success"
        ? "badge-healthy"
        : status === "Ongoing"
          ? "badge-pending"
          : "badge-critical";

    const StatusIcon =
      status === "Success"
        ? CheckCircle2
        : status === "Ongoing"
          ? AlertCircle
          : AlertCircle;

    return (
      <div
        className="p-3 border border-border rounded-lg hover:border-primary/50 hover:bg-muted/30 transition-all cursor-pointer group"
        onClick={() => navigate(`/detail/ai-actions/${action.replace(/\s+/g, "-")}`)}
      >
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex-shrink-0">
            <StatusIcon className={`w-4 h-4 ${
              status === "Success"
                ? "text-status-healthy"
                : status === "Ongoing"
                  ? "text-status-pending"
                  : "text-status-critical"
            }`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{action}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{timestamp}</p>
          </div>
          <span className={`${statusColor} flex-shrink-0`}>{status}</span>
        </div>
      </div>
    );
  };

  const widgets = [
    {
      id: "voice",
      title: "Voice",
      subtitle: "Call volume & quality metrics",
      data: generateVoiceChartData(),
      dataKey: "calls",
      categoryKey: "name",
      renderKpis: () => generateVoiceData().map((kpi: any) => (
        <KPIRow key={kpi.name} {...kpi} />
      )),
      onNavigate: () => navigate("/detail/voice"),
    },
    {
      id: "data",
      title: "Data",
      subtitle: "Data sessions & failures",
      data: generateDataChartData(),
      dataKey: "sessions",
      categoryKey: "name",
      renderKpis: () => generateDataData().map((kpi: any) => (
        <KPIRow key={kpi.name} {...kpi} />
      )),
      onNavigate: () => navigate("/detail/data"),
    },
    {
      id: "subscribers",
      title: "Subscribers",
      subtitle: "Total & active subscribers",
      data: generateSubscriberData(),
      dataKey: "value",
      categoryKey: "name",
      renderKpis: () => generateSubscriberData().map((kpi: any) => (
        <KPIRow key={kpi.name} {...kpi} />
      )),
      onNavigate: () => navigate("/detail/subscribers"),
    },
    {
      id: "vendors",
      title: "Mobile Device Vendors",
      subtitle: "Device distribution across manufacturers",
      data: generateVendorData(),
      dataKey: "value",
      categoryKey: "name",
      onNavigate: () => navigate("/detail/vendors"),
    },
    {
      id: "aiActions",
      title: "Recent AI-Engine Actions",
      subtitle: "Automated network operations",
      data: generateAIActionsData(),
      isActionList: true,
      renderActions: () => generateAIActionsData().map((action: any) => (
        <ActionItem key={action.id} {...action} />
      )),
      onNavigate: () => navigate("/detail/ai-actions"),
    },
    {
      id: "alarms",
      title: "Network Alarms",
      subtitle: "Alarm status & trends",
      data: generateAlarmsChartData(),
      dataKey: "sites",
      categoryKey: "name",
      renderKpis: () => generateAlarmData().map((kpi: any) => (
        <KPIRow key={kpi.name} {...kpi} />
      )),
      onNavigate: () => navigate("/detail/alarms"),
    },
    {
      id: "failures",
      title: "Total Failures per Vendor",
      subtitle: "Equipment failure distribution",
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
      {/* Header Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Real-time network operations overview. Customize in{" "}
          <a href="/settings" className="text-primary hover:underline font-medium">
            Settings
          </a>
        </p>
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleWidgets.length === 0 ? (
          <div className="col-span-full card-elevated p-12 flex flex-col items-center justify-center text-center">
            <div className="text-muted-foreground mb-4">
              <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm font-medium">No widgets visible</p>
              <p className="text-xs mt-2">
                Go to{" "}
                <a href="/settings" className="text-primary hover:underline">
                  Settings
                </a>{" "}
                to show widgets
              </p>
            </div>
          </div>
        ) : (
          visibleWidgets.map((widget) => {
            const config = widgetLayout[widget.id] || DEFAULT_WIDGETS[widget.id];

            // For AI Actions (list view)
            if (widget.isActionList) {
              return (
                <div
                  key={widget.id}
                  className="card-elevated p-6 flex flex-col h-full cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={widget.onNavigate}
                >
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-foreground">{widget.title}</h3>
                    {widget.subtitle && <p className="text-sm text-muted-foreground mt-1">{widget.subtitle}</p>}
                  </div>
                  <div className="flex-1 space-y-2 min-h-0 overflow-y-auto">
                    {widget.renderActions?.()}
                  </div>
                </div>
              );
            }

            // For KPI display sections (Voice, Data, Subscribers, Alarms)
            if (widget.renderKpis) {
              return (
                <div
                  key={widget.id}
                  className="card-elevated p-6 flex flex-col h-full cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={widget.onNavigate}
                >
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-foreground">{widget.title}</h3>
                    {widget.subtitle && <p className="text-sm text-muted-foreground mt-1">{widget.subtitle}</p>}
                  </div>
                  <div className="flex-1 space-y-0">
                    {widget.renderKpis?.()}
                  </div>
                </div>
              );
            }

            // For chart sections (Vendors, Failures)
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
                height={280}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
