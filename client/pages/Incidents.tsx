import { AlertTriangle, CheckCircle2, Clock, ChevronRight } from "lucide-react";
import { useState } from "react";

export default function Incidents() {
  const [selectedIncident, setSelectedIncident] = useState<number | null>(null);

  const incidents = [
    {
      id: 1,
      title: "Latency Spike in Region B",
      severity: "critical",
      status: "in-progress",
      impact: "User-facing API response time increased by 45%",
      rootCause: "Network routing anomaly detected in BGP configuration. Traffic is being inefficiently routed through secondary paths instead of primary paths.",
      affectedServices: ["API Gateway", "Load Balancer", "Core Network"],
      timeline: [
        { time: "14:32", event: "Incident detected by AI monitoring", type: "detection" },
        { time: "14:33", event: "Root cause analysis initiated", type: "action" },
        { time: "14:35", event: "BGP configuration anomaly identified", type: "finding" },
        { time: "14:36", event: "Auto-remediation started", type: "action" },
        { time: "14:38", event: "Monitoring latency recovery", type: "monitoring" },
      ],
      aiAction: "Automatically re-routing traffic through optimal paths",
      recommendation: "Review BGP policies and implement automated health checks for path selection",
    },
    {
      id: 2,
      title: "Capacity Warning - Data Center 2",
      severity: "degraded",
      status: "needs-attention",
      impact: "CPU utilization at 78%, trending upward. Potential for cascading failures.",
      rootCause: "Traffic spike from automated backup jobs coinciding with peak user load. No auto-scaling policy in place.",
      affectedServices: ["Compute Cluster 2", "Storage", "Database"],
      timeline: [
        { time: "13:45", event: "CPU utilization exceeds 70%", type: "detection" },
        { time: "13:47", event: "Capacity analysis started", type: "action" },
        { time: "13:50", event: "Backup job identified as root cause", type: "finding" },
      ],
      aiAction: "Scaling additional compute resources and deferring non-critical jobs",
      recommendation: "Implement intelligent job scheduling to distribute backup operations",
    },
    {
      id: 3,
      title: "Traffic Imbalance in Region A",
      severity: "degraded",
      status: "resolved",
      impact: "Increased latency by 12% in Cluster A",
      rootCause: "One load balancer was processing 35% more traffic than others due to misconfigured weights.",
      affectedServices: ["Load Balancer", "Cluster A-1", "Cluster A-2"],
      timeline: [
        { time: "12:15", event: "Traffic imbalance detected", type: "detection" },
        { time: "12:17", event: "Load balancer weights analyzed", type: "action" },
        { time: "12:19", event: "Auto-rebalanced traffic distribution", type: "action" },
        { time: "12:22", event: "Latency normalized", type: "resolution" },
      ],
      aiAction: "Redistributed traffic weights across load balancers",
      recommendation: "Implement automated weight optimization algorithm",
    },
    {
      id: 4,
      title: "Database Replication Lag",
      severity: "degraded",
      status: "in-progress",
      impact: "Read replicas lagging by 2.5 seconds behind primary",
      rootCause: "Network congestion on replica connection link during peak traffic hours",
      affectedServices: ["Database Primary", "Read Replicas", "Network"],
      timeline: [
        { time: "11:30", event: "Replication lag detected", type: "detection" },
        { time: "11:32", event: "Network analysis initiated", type: "action" },
      ],
      aiAction: "Optimizing network QoS and increasing replica connection bandwidth",
      recommendation: "Implement dedicated network path for replication traffic",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "critical":
        return "status-critical";
      case "degraded":
        return "status-degraded";
      default:
        return "status-healthy";
    }
  };

  const getStatusBadge = (severity: string) => {
    switch (severity) {
      case "critical":
        return "badge-critical";
      case "degraded":
        return "badge-degraded";
      default:
        return "badge-healthy";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "resolved":
        return <CheckCircle2 className="w-5 h-5 text-status-healthy" />;
      case "in-progress":
        return <Clock className="w-5 h-5 text-accent animate-pulse" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-status-degraded" />;
    }
  };

  const currentIncident = incidents.find((i) => i.id === selectedIncident);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Incidents & Troubleshooting</h1>
        <p className="text-muted-foreground">
          AI-detected issues with impact analysis and recommended actions
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Incident List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card-elevated p-4">
            <h2 className="font-semibold mb-4">Recent Incidents</h2>
            <div className="space-y-2">
              {incidents.map((incident) => (
                <button
                  key={incident.id}
                  onClick={() => setSelectedIncident(incident.id)}
                  className={`w-full text-left p-4 rounded-lg border transition-colors ${
                    selectedIncident === incident.id
                      ? "border-accent bg-accent bg-opacity-5"
                      : "border-border hover:border-accent"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {getStatusIcon(incident.status)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-medium">{incident.title}</h3>
                        <div className={getStatusBadge(incident.severity)}>
                          {incident.severity.charAt(0).toUpperCase() + incident.severity.slice(1)}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {incident.impact}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 flex-shrink-0 mt-1 opacity-50" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="card-elevated p-4">
              <p className="text-sm text-muted-foreground">Critical Issues</p>
              <h3 className="text-2xl font-bold mt-1">1</h3>
            </div>
            <div className="card-elevated p-4">
              <p className="text-sm text-muted-foreground">This Month</p>
              <h3 className="text-2xl font-bold mt-1">4</h3>
            </div>
          </div>
        </div>

        {/* Incident Details */}
        <div className="lg:col-span-1">
          {currentIncident ? (
            <div className="card-elevated p-6 sticky top-6">
              <div className="flex items-start justify-between mb-4">
                <h2 className="font-semibold">Details</h2>
                <div className={getStatusBadge(currentIncident.severity)}>
                  {currentIncident.severity.charAt(0).toUpperCase() +
                    currentIncident.severity.slice(1)}
                </div>
              </div>

              <div className="space-y-4">
                {/* Status */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Status</p>
                  <p className="text-sm mt-1 capitalize">
                    {currentIncident.status === "in-progress"
                      ? "In Progress"
                      : currentIncident.status === "needs-attention"
                        ? "Needs Attention"
                        : "Resolved"}
                  </p>
                </div>

                {/* Impact */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Impact</p>
                  <p className="text-sm mt-1">{currentIncident.impact}</p>
                </div>

                {/* AI Action */}
                <div>
                  <p className="text-xs font-medium text-accent">🤖 AI Action</p>
                  <p className="text-sm mt-1">{currentIncident.aiAction}</p>
                </div>

                {/* Affected Services */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Affected Services</p>
                  <div className="mt-2 space-y-1">
                    {currentIncident.affectedServices.map((service) => (
                      <div
                        key={service}
                        className="text-sm px-2.5 py-1 bg-muted rounded text-muted-foreground"
                      >
                        {service}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 pt-2 border-t border-border">
                  {currentIncident.status !== "resolved" && (
                    <>
                      <button className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium text-sm">
                        Approve Action
                      </button>
                      <button className="w-full py-2 px-4 border border-border rounded-lg hover:bg-muted transition-colors font-medium text-sm">
                        Escalate
                      </button>
                    </>
                  )}
                  <button className="w-full py-2 px-4 border border-border rounded-lg hover:bg-muted transition-colors font-medium text-sm">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="card-elevated p-6 sticky top-6 text-center">
              <p className="text-muted-foreground">Select an incident to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Incident Timeline */}
      {currentIncident && (
        <div className="card-elevated p-6">
          <h2 className="font-semibold mb-4">Timeline of Events</h2>
          <div className="space-y-4">
            {currentIncident.timeline.map((event, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-accent mt-1.5"></div>
                  {index < currentIncident.timeline.length - 1 && (
                    <div className="w-0.5 h-12 bg-border my-2"></div>
                  )}
                </div>
                <div className="pb-4">
                  <p className="text-sm font-medium">{event.event}</p>
                  <p className="text-xs text-muted-foreground">{event.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
