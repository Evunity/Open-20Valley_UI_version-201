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

            {/* Related Actions */}
            <div className="space-y-2 pt-4 border-t border-border/50">
              <p className="text-xs font-semibold text-muted-foreground uppercase">Related Information</p>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded bg-muted/50 border border-border/50">
                  <p className="text-muted-foreground mb-1">Category</p>
                  <p className="font-medium text-foreground capitalize">{action.category.replace("_", " ")}</p>
                </div>
                <div className="p-3 rounded bg-muted/50 border border-border/50">
                  <p className="text-muted-foreground mb-1">Confidence Score</p>
                  <p className="font-medium text-foreground">{action.confidence.toFixed(1)}%</p>
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
