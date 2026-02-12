import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ReportExecution } from "@/utils/reportsData";

interface ReportHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportTitle: string;
  executions: ReportExecution[];
}

export default function ReportHistoryModal({
  isOpen,
  onClose,
  reportTitle,
  executions,
}: ReportHistoryModalProps) {
  if (!isOpen) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-500/10 text-green-700 border border-green-500/30";
      case "failed":
        return "bg-red-500/10 text-red-700 border border-red-500/30";
      case "running":
        return "bg-blue-500/10 text-blue-700 border border-blue-500/30";
      case "delayed":
        return "bg-orange-500/10 text-orange-700 border border-orange-500/30";
      default:
        return "bg-gray-500/10 text-gray-700";
    }
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
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
        <div className="bg-card rounded-xl border border-border shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
            <div>
              <h2 className="text-lg font-bold text-foreground">{reportTitle}</h2>
              <p className="text-xs text-muted-foreground mt-1">Recent Executions</p>
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
          <div className="flex-1 overflow-y-auto">
            {executions.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground text-sm">No executions recorded yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-muted/50">
                    <tr className="border-b border-border/50">
                      <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Time</th>
                      <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Duration</th>
                      <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Trigger</th>
                    </tr>
                  </thead>
                  <tbody>
                    {executions.map((execution, idx) => (
                      <tr
                        key={idx}
                        className="border-b border-border/30 hover:bg-muted/20 transition-colors group"
                        title={execution.failureReason ? `Failure: ${execution.failureReason}` : ""}
                      >
                        <td className="py-3 px-4 text-foreground">{execution.time}</td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {execution.duration ? execution.duration : "—"}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span
                              className={cn(
                                "px-2.5 py-1 rounded text-xs font-semibold",
                                getStatusColor(execution.status)
                              )}
                            >
                              {getStatusLabel(execution.status)}
                            </span>
                            {execution.failureReason && (
                              <span className="text-xs text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                {execution.failureReason}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground text-xs">{execution.trigger}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Footer */}
          {executions.length > 0 && (
            <div className="px-6 py-3 border-t border-border/50 flex items-center justify-between bg-muted/20">
              <p className="text-xs text-muted-foreground">Showing last {executions.length} executions (newest first)</p>
              <button className="text-xs text-primary hover:underline">View Full History</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
