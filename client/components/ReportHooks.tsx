import { useState } from "react";
import { Plus, Calendar, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReportHooksProps {
  viewTitle: string;
  onAddToReport?: (reportName: string) => void;
  onScheduleView?: (schedule: ScheduleConfig) => void;
  compact?: boolean;
}

export interface ScheduleConfig {
  frequency: "daily" | "weekly" | "monthly" | "custom";
  time: string;
  recipients: string[];
  format: "email" | "dashboard" | "both";
}

export default function ReportHooks({
  viewTitle,
  onAddToReport,
  onScheduleView,
  compact = false,
}: ReportHooksProps) {
  const [showAddReport, setShowAddReport] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [reportName, setReportName] = useState("");
  const [scheduleConfig, setScheduleConfig] = useState<ScheduleConfig>({
    frequency: "daily",
    time: "09:00",
    recipients: [],
    format: "email",
  });
  const [success, setSuccess] = useState<"report" | "schedule" | null>(null);

  const handleAddToReport = () => {
    if (reportName.trim()) {
      onAddToReport?.(reportName);
      setSuccess("report");
      setReportName("");
      setShowAddReport(false);
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  const handleScheduleView = () => {
    onScheduleView?.(scheduleConfig);
    setSuccess("schedule");
    setShowSchedule(false);
    setTimeout(() => setSuccess(null), 3000);
  };

  if (compact) {
    return (
      <div className="flex gap-2">
        <button
          onClick={() => setShowAddReport(!showAddReport)}
          className="inline-flex items-center gap-2 px-3 py-2 rounded text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
          title="Add this view to a report"
        >
          <Plus className="w-4 h-4" />
          Add to Report
        </button>

        <button
          onClick={() => setShowSchedule(!showSchedule)}
          className="inline-flex items-center gap-2 px-3 py-2 rounded text-sm font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
          title="Schedule this view for automatic delivery"
        >
          <Calendar className="w-4 h-4" />
          Schedule
        </button>

        {success && (
          <div className="flex items-center gap-2 px-3 py-2 rounded text-sm font-medium bg-green-100 text-green-700 animate-pulse">
            <CheckCircle className="w-4 h-4" />
            {success === "report" ? "Added to report" : "Scheduled"}
          </div>
        )}

        {/* Dialogs */}
        {showAddReport && (
          <AddReportDialog
            viewTitle={viewTitle}
            reportName={reportName}
            onReportNameChange={setReportName}
            onConfirm={handleAddToReport}
            onCancel={() => setShowAddReport(false)}
          />
        )}

        {showSchedule && (
          <ScheduleDialog
            config={scheduleConfig}
            onConfigChange={setScheduleConfig}
            onConfirm={handleScheduleView}
            onCancel={() => setShowSchedule(false)}
          />
        )}
      </div>
    );
  }

  // Full view
  return (
    <div className="bg-card border border-border/50 rounded-lg p-6 space-y-4">
      <h3 className="text-lg font-bold text-foreground">Report & Scheduling</h3>

      <div className="space-y-3">
        {/* Add to Report */}
        <div className="space-y-2">
          <p className="text-sm font-semibold text-foreground">Add to Report</p>
          <p className="text-xs text-muted-foreground">
            Include this view in a regularly updated report
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Report name..."
              value={reportName}
              onChange={(e) => setReportName(e.target.value)}
              className="flex-1 px-3 py-2 rounded border border-border text-sm"
              onKeyDown={(e) => e.key === "Enter" && handleAddToReport()}
            />
            <button
              onClick={handleAddToReport}
              disabled={!reportName.trim()}
              className="px-4 py-2 rounded bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>
        </div>

        <div className="border-t border-border/50" />

        {/* Schedule View */}
        <div className="space-y-2">
          <p className="text-sm font-semibold text-foreground">Schedule Delivery</p>
          <p className="text-xs text-muted-foreground">
            Automatically send this view at scheduled intervals
          </p>

          <div className="space-y-2">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Frequency
              </label>
              <select
                value={scheduleConfig.frequency}
                onChange={(e) =>
                  setScheduleConfig({
                    ...scheduleConfig,
                    frequency: e.target.value as any,
                  })
                }
                className="w-full px-3 py-2 rounded border border-border text-sm"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Time
              </label>
              <input
                type="time"
                value={scheduleConfig.time}
                onChange={(e) =>
                  setScheduleConfig({
                    ...scheduleConfig,
                    time: e.target.value,
                  })
                }
                className="w-full px-3 py-2 rounded border border-border text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Format
              </label>
              <select
                value={scheduleConfig.format}
                onChange={(e) =>
                  setScheduleConfig({
                    ...scheduleConfig,
                    format: e.target.value as any,
                  })
                }
                className="w-full px-3 py-2 rounded border border-border text-sm"
              >
                <option value="email">Email Only</option>
                <option value="dashboard">Dashboard Only</option>
                <option value="both">Both Email & Dashboard</option>
              </select>
            </div>

            <button
              onClick={handleScheduleView}
              className="w-full px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              Schedule Delivery
            </button>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-200">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <p className="text-sm text-green-700 font-medium">
            {success === "report"
              ? `View added to report "${reportName}"`
              : `View scheduled for ${scheduleConfig.frequency} delivery`}
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Add Report Dialog
 */
function AddReportDialog({
  viewTitle,
  reportName,
  onReportNameChange,
  onConfirm,
  onCancel,
}: {
  viewTitle: string;
  reportName: string;
  onReportNameChange: (name: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg border border-border p-6 max-w-md w-full">
        <h3 className="text-lg font-bold text-foreground mb-4">Add to Report</h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-foreground block mb-2">
              Report Name
            </label>
            <input
              type="text"
              value={reportName}
              onChange={(e) => onReportNameChange(e.target.value)}
              placeholder="e.g., Monthly Performance Summary"
              className="w-full px-3 py-2 rounded border border-border text-foreground"
              autoFocus
            />
            <p className="text-xs text-muted-foreground mt-2">
              This view "{viewTitle}" will be included in the report above.
            </p>
          </div>
        </div>
        <div className="flex gap-2 justify-end mt-6">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded border border-border hover:bg-muted transition-colors text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!reportName.trim()}
            className="px-4 py-2 rounded bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add to Report
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Schedule Dialog
 */
function ScheduleDialog({
  config,
  onConfigChange,
  onConfirm,
  onCancel,
}: {
  config: ScheduleConfig;
  onConfigChange: (config: ScheduleConfig) => void;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg border border-border p-6 max-w-md w-full space-y-4">
        <h3 className="text-lg font-bold text-foreground">Schedule View</h3>

        <div>
          <label className="text-sm font-semibold text-foreground block mb-2">
            Frequency
          </label>
          <select
            value={config.frequency}
            onChange={(e) =>
              onConfigChange({ ...config, frequency: e.target.value as any })
            }
            className="w-full px-3 py-2 rounded border border-border text-sm"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-semibold text-foreground block mb-2">
            Time
          </label>
          <input
            type="time"
            value={config.time}
            onChange={(e) => onConfigChange({ ...config, time: e.target.value })}
            className="w-full px-3 py-2 rounded border border-border text-sm"
          />
        </div>

        <div className="flex gap-2 justify-end pt-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded border border-border hover:bg-muted transition-colors text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Schedule
          </button>
        </div>
      </div>
    </div>
  );
}
