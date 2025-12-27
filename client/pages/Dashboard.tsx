import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import DashboardWidget from "@/components/DashboardWidget";
import { useLocalStorage, DEFAULT_WIDGETS, type DashboardLayout, type WidgetConfig } from "@/hooks/useLocalStorage";

// Mock data generators
const generateVoiceData = () => [
  { name: "Monday", value: 4200, calls: 240 },
  { name: "Tuesday", value: 3800, calls: 221 },
  { name: "Wednesday", value: 2000, calls: 229 },
  { name: "Thursday", value: 2780, calls: 200 },
  { name: "Friday", value: 1890, calls: 210 },
  { name: "Saturday", value: 2390, calls: 222 },
  { name: "Sunday", value: 3490, calls: 250 },
];

const generateDataData = () => [
  { name: "Mon", value: 65, traffic: 2400 },
  { name: "Tue", value: 59, traffic: 2210 },
  { name: "Wed", value: 80, traffic: 2290 },
  { name: "Thu", value: 81, traffic: 2000 },
  { name: "Fri", value: 56, traffic: 2181 },
  { name: "Sat", value: 55, traffic: 2500 },
  { name: "Sun", value: 40, traffic: 2100 },
];

const generateSubscriberData = () => [
  { name: "Prepaid", value: 45 },
  { name: "Postpaid", value: 35 },
  { name: "Enterprise", value: 15 },
  { name: "Trial", value: 5 },
];

const generateVendorData = () => [
  { name: "Apple", value: 2800 },
  { name: "Samsung", value: 1398 },
  { name: "Xiaomi", value: 9800 },
  { name: "OnePlus", value: 3908 },
  { name: "Google", value: 4800 },
];

const generateAIActionsData = () => [
  { action: "Traffic Optimization", status: "Completed", timestamp: "2 min ago", impact: "+12% efficiency" },
  { action: "Auto-scaling Services", status: "In Progress", timestamp: "5 min ago", impact: "Preventing overload" },
  { action: "Anomaly Detection", status: "Completed", timestamp: "8 min ago", impact: "Found 3 issues" },
  { action: "Load Balancing", status: "In Progress", timestamp: "12 min ago", impact: "Optimizing routes" },
  { action: "Capacity Planning", status: "Queued", timestamp: "15 min ago", impact: "Analyzing trends" },
];

const generateAlarmData = () => [
  { name: "Mon", value: 24, alarms: 240 },
  { name: "Tue", value: 19, alarms: 221 },
  { name: "Wed", value: 14, alarms: 229 },
  { name: "Thu", value: 11, alarms: 200 },
  { name: "Fri", value: 8, alarms: 210 },
  { name: "Sat", value: 5, alarms: 222 },
  { name: "Sun", value: 2, alarms: 250 },
];

const generateFailureData = () => [
  { name: "Ericsson", value: 2400 },
  { name: "Nokia", value: 1398 },
  { name: "ZTE", value: 1200 },
  { name: "Cisco", value: 780 },
  { name: "Huawei", value: 390 },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [widgetLayout, setWidgetLayout] = useLocalStorage<DashboardLayout>(
    "dashboard_layout",
    DEFAULT_WIDGETS
  );

  // Data sources
  const voiceData = generateVoiceData();
  const dataData = generateDataData();
  const subscriberData = generateSubscriberData();
  const vendorData = generateVendorData();
  const aiActionsData = generateAIActionsData();
  const alarmData = generateAlarmData();
  const failureData = generateFailureData();

  // Widget state management
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

  // Widget definitions with navigation
  const widgets = [
    {
      id: "voice",
      title: "Voice",
      subtitle: "Weekly call volume & quality metrics",
      data: voiceData,
      dataKey: "value",
      categoryKey: "name",
      onNavigate: () => navigate("/detail/voice"),
    },
    {
      id: "data",
      title: "Data",
      subtitle: "Data traffic & consumption",
      data: dataData,
      dataKey: "value",
      categoryKey: "name",
      onNavigate: () => navigate("/detail/data"),
    },
    {
      id: "subscribers",
      title: "Subscribers",
      subtitle: "Subscriber distribution by type",
      data: subscriberData,
      dataKey: "value",
      categoryKey: "name",
      onNavigate: () => navigate("/detail/subscribers"),
    },
    {
      id: "vendors",
      title: "Mobile Device Vendors",
      subtitle: "Device distribution across vendors",
      data: vendorData,
      dataKey: "value",
      categoryKey: "name",
      onNavigate: () => navigate("/detail/vendors"),
    },
    {
      id: "aiActions",
      title: "Recent AI-Engine Actions",
      subtitle: "Recent automated network operations",
      data: aiActionsData,
      dataKey: "impact",
      categoryKey: "action",
      onNavigate: () => navigate("/detail/ai-actions"),
    },
    {
      id: "alarms",
      title: "Network Alarms",
      subtitle: "Weekly alarm trend (improving)",
      data: alarmData,
      dataKey: "value",
      categoryKey: "name",
      onNavigate: () => navigate("/detail/alarms"),
    },
    {
      id: "failures",
      title: "Total Failures per Vendor",
      subtitle: "Failure count by equipment vendor",
      data: failureData,
      dataKey: "value",
      categoryKey: "name",
      onNavigate: () => navigate("/detail/failures"),
    },
  ];

  // Sort widgets by order
  const sortedWidgets = widgets.sort(
    (a, b) => (widgetLayout[a.id]?.order || 0) - (widgetLayout[b.id]?.order || 0)
  );

  // Filter visible widgets
  const visibleWidgets = sortedWidgets.filter((w) => widgetLayout[w.id]?.visible !== false);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Real-time network operations overview. Customize widgets in{" "}
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
              <svg
                className="w-12 h-12 mx-auto mb-4 opacity-50"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
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
