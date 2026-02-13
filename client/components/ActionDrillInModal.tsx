import { X, TrendingUp, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { AutomationAction } from "@/utils/aiAutomationData";

interface ActionDrillInModalProps {
  isOpen: boolean;
  onClose: () => void;
  action: AutomationAction | null;
}

export default function ActionDrillInModal({
  isOpen,
  onClose,
  action,
}: ActionDrillInModalProps) {
  if (!isOpen || !action) return null;

  const getStatusIcon = (result: string) => {
    switch (result) {
      case "successful":
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case "failed":
        return <AlertCircle className="w-6 h-6 text-red-600" />;
      default:
        return <Clock className="w-6 h-6 text-orange-600" />;
    }
  };

  const getStatusColor = (result: string) => {
    switch (result) {
      case "successful":
        return "bg-green-500/10 text-green-700 border border-green-500/30";
      case "failed":
        return "bg-red-500/10 text-red-700 border border-red-500/30";
      default:
        return "bg-orange-500/10 text-orange-700 border border-orange-500/30";
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "detection":
        return "AI Detection";
      case "recommendation":
        return "AI Recommendation";
      case "automation":
        return "Automated Action";
      default:
        return category;
    }
  };

  const getAutomationLevelLabel = (level: string) => {
    switch (level) {
      case "insight_only":
        return "Insight Only";
      case "recommendation_only":
        return "Recommendation";
      case "auto_executed":
        return "Fully Automated";
      default:
        return level;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-500/10 text-red-700";
      case "major":
        return "bg-orange-500/10 text-orange-700";
      default:
        return "bg-blue-500/10 text-blue-700";
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-card rounded-xl border border-border shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
            <div className="flex items-center gap-4">
              {getStatusIcon(action.result)}
              <div>
                <h2 className="text-lg font-bold text-foreground">{action.action}</h2>
                <p className="text-xs text-muted-foreground">
                  {getCategoryLabel(action.category)}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Status Overview */}
            <div className="grid grid-cols-2 gap-4">
              <div className={cn(
                "rounded-lg p-4 border",
                getStatusColor(action.result)
              )}>
                <p className="text-xs text-muted-foreground mb-1">Status</p>
                <p className="text-lg font-bold capitalize">{action.result}</p>
              </div>
              <div className="rounded-lg p-4 border border-border/50 bg-muted/30">
                <p className="text-xs text-muted-foreground mb-1">Confidence</p>
                <p className="text-lg font-bold">{action.confidence.toFixed(1)}%</p>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Scope</p>
                <p className="text-foreground">{action.scope}</p>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Priority</p>
                <span className={cn(
                  "inline-block px-2.5 py-1 rounded text-xs font-semibold capitalize",
                  getPriorityColor(action.priority)
                )}>
                  {action.priority}
                </span>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Execution Mode</p>
                <p className="text-foreground">{getAutomationLevelLabel(action.automationLevel)}</p>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Detected Issue</p>
                <p className="text-foreground text-sm">{action.action}</p>
              </div>
            </div>

            {/* Timestamp */}
            <div className="space-y-2 pt-4 border-t border-border/50">
              <p className="text-xs font-semibold text-muted-foreground uppercase">Timestamp</p>
              <p className="text-foreground">
                {new Date(action.timestamp).toLocaleString()}
              </p>
            </div>

            {/* Impact (if available) */}
            {action.impact && (
              <div className="space-y-2 pt-4 border-t border-border/50">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Impact</p>
                </div>
                <p className="text-foreground text-sm">{action.impact}</p>
              </div>
            )}

            {/* What Triggered AI (Section 4.9) */}
            <div className="space-y-2 pt-4 border-t border-border/50">
              <p className="text-xs font-semibold text-muted-foreground uppercase">What Triggered AI</p>
              <p className="text-sm text-foreground">
                Detected anomalous behavior in {action.scope}. System identified threshold breach based on historical baseline analysis and real-time metric correlation.
              </p>
            </div>

            {/* Data Evaluated */}
            <div className="space-y-2 pt-4 border-t border-border/50">
              <p className="text-xs font-semibold text-muted-foreground uppercase">Data Evaluated</p>
              <ul className="text-xs space-y-1 text-muted-foreground">
                <li>• Network performance metrics (latency, throughput, packet loss)</li>
                <li>• Vendor-specific counters and KPIs</li>
                <li>• Historical patterns and seasonal trends</li>
                <li>• Related alarms and incidents from past 7 days</li>
              </ul>
            </div>

            {/* Decision Taken */}
            <div className="space-y-2 pt-4 border-t border-border/50">
              <p className="text-xs font-semibold text-muted-foreground uppercase">Decision Taken</p>
              <p className="text-sm text-foreground">
                Execute {getAutomationLevelLabel(action.automationLevel).toLowerCase()} mode with {action.confidence.toFixed(0)}% confidence.
                Action classified as {action.priority} priority with expected {action.impact ? "positive" : "neutral"} impact.
              </p>
            </div>

            {/* Execution Steps */}
            <div className="space-y-2 pt-4 border-t border-border/50">
              <p className="text-xs font-semibold text-muted-foreground uppercase">Execution Steps</p>
              <ol className="text-xs space-y-1 text-muted-foreground list-decimal list-inside">
                <li>Validate affected resources</li>
                <li>Apply configuration changes</li>
                <li>Monitor post-execution metrics</li>
                <li>Confirm resolution within 5 minutes</li>
              </ol>
            </div>

            {/* Affected Objects */}
            <div className="space-y-2 pt-4 border-t border-border/50">
              <p className="text-xs font-semibold text-muted-foreground uppercase">Affected Objects</p>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2 rounded bg-muted/50 border border-border/50">
                  <p className="text-muted-foreground">Scope</p>
                  <p className="font-medium text-foreground">{action.scope}</p>
                </div>
                <div className="p-2 rounded bg-muted/50 border border-border/50">
                  <p className="text-muted-foreground">Category</p>
                  <p className="font-medium text-foreground capitalize">{action.category}</p>
                </div>
              </div>
            </div>

            {/* KPI Impact */}
            {action.impact && (
              <div className="space-y-2 pt-4 border-t border-border/50">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Measurable Impact</p>
                <p className="text-sm font-medium text-green-600">{action.impact}</p>
              </div>
            )}

            {/* Timeline */}
            <div className="space-y-2 pt-4 border-t border-border/50">
              <p className="text-xs font-semibold text-muted-foreground uppercase">Timeline</p>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-600" />
                  <span className="text-muted-foreground">
                    <strong>Detected:</strong> {new Date(action.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-orange-600" />
                  <span className="text-muted-foreground">
                    <strong>Evaluated:</strong> {Math.floor(Math.random() * 30 + 5)}s after detection
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-600" />
                  <span className="text-muted-foreground">
                    <strong>Executed:</strong> {Math.floor(Math.random() * 10 + 5)}s after decision
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-border/50 bg-muted/20 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Action ID: {action.id}</p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
