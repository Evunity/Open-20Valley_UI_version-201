import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const DETAIL_PAGES: Record<string, { title: string; description: string; metrics: string[] }> = {
  voice: {
    title: "Voice Analytics",
    description: "Detailed call volume, call quality, drops, and blocks analysis",
    metrics: ["Total Calls", "Call Drops", "Call Blocks", "Completed Calls", "Quality Score"],
  },
  data: {
    title: "Data Analytics",
    description: "Data sessions, failures, traffic patterns, and network utilization",
    metrics: ["Data Sessions", "Data Failures", "Peak Bandwidth", "Failure Rate", "Traffic Trends"],
  },
  subscribers: {
    title: "Subscriber Management",
    description: "Total and active subscriber metrics, segmentation, and engagement",
    metrics: ["Total Subscribers", "Active Subscribers", "Growth Rate", "Churn Rate", "Segments"],
  },
  vendors: {
    title: "Mobile Device Vendors",
    description: "Device distribution by manufacturer and performance analysis",
    metrics: ["Apple", "Samsung", "Nokia", "Xiaomi", "Market Share"],
  },
  "ai-actions": {
    title: "AI Engine Actions",
    description: "Automated network operations and their outcomes",
    metrics: ["RAN Anomaly Detection", "Media Engine DDoS Protection", "CORE Network Correction", "IP-Backbone Fault Analysis"],
  },
  alarms: {
    title: "Network Alarms",
    description: "Down sites, network failures, traffic congestion, and alarm trends",
    metrics: ["Down Sites", "Network Failures", "Low Traffic Sites", "Congested Sites", "Severity Levels"],
  },
  failures: {
    title: "Equipment Failures by Vendor",
    description: "Failure distribution across equipment vendors",
    metrics: ["Huawei", "Nokia", "Samsung", "Cisco", "Ericsson"],
  },
};

export default function DetailPage() {
  const { section } = useParams<{ section: string }>();
  const navigate = useNavigate();

  const details = section ? DETAIL_PAGES[section] : null;

  if (!details) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-primary hover:underline mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
        <div className="card-elevated p-12 text-center">
          <p className="text-muted-foreground">Page not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-primary hover:underline mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">{details.title}</h1>
          <p className="text-muted-foreground">{details.description}</p>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Placeholder Chart Area */}
          <div className="card-elevated p-8 min-h-96 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Detailed Analytics View
              </h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-sm">
                This is a placeholder for the detailed analytics page. In a production environment, this would display comprehensive data, charts, and metrics specific to this section.
              </p>
              <p className="text-xs text-muted-foreground">
                Dashboard customization completed ✓
              </p>
            </div>
          </div>

          {/* Description Card */}
          <div className="card-elevated p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Overview</h2>
            <div className="prose prose-sm text-muted-foreground space-y-3">
              <p>
                This detailed analytics view provides comprehensive insights for the <strong>{details.title}</strong> section of your network operations dashboard.
              </p>
              <p>
                You can use this page to:
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Drill down into specific metrics and KPIs</li>
                <li>Analyze trends and patterns over time</li>
                <li>Compare performance across different dimensions</li>
                <li>Export reports and data</li>
                <li>Take corrective actions based on insights</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Key Metrics */}
          <div className="card-elevated p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Key Metrics</h2>
            <div className="space-y-3">
              {details.metrics.map((metric, idx) => (
                <div key={idx} className="p-3 bg-secondary/20 rounded-lg">
                  <p className="text-sm font-medium text-foreground">{metric}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card-elevated p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <button className="w-full px-4 py-2 bg-muted hover:bg-muted/70 text-foreground rounded-lg transition-colors text-sm font-medium">
                Export Report
              </button>
              <button className="w-full px-4 py-2 bg-muted hover:bg-muted/70 text-foreground rounded-lg transition-colors text-sm font-medium">
                Set Alerts
              </button>
              <button className="w-full px-4 py-2 bg-muted hover:bg-muted/70 text-foreground rounded-lg transition-colors text-sm font-medium">
                Compare Periods
              </button>
            </div>
          </div>

          {/* Info Card */}
          <div className="card-elevated p-6 bg-primary/5 border border-primary/20">
            <h3 className="font-semibold text-sm text-foreground mb-2">💡 Tip</h3>
            <p className="text-sm text-muted-foreground">
              Customize your dashboard widgets in Settings to show the most relevant metrics for your role.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
