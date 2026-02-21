import { useState } from "react";
import { Download, AlertCircle, CheckCircle, Loader } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  exportToCSV,
  exportToExcel,
  exportAsync,
  isLargeExport,
  validateExportData,
  type ExportData,
  type ExportFormat,
  type ExportScope,
} from "@/utils/exportUtils";

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  data: ExportData;
  scope?: ExportScope;
}

type ExportStatus = "idle" | "confirming" | "processing" | "success" | "error";

export default function ExportDialog({
  isOpen,
  onClose,
  data,
  scope = "page",
}: ExportDialogProps) {
  const [format, setFormat] = useState<ExportFormat>("excel");
  const [status, setStatus] = useState<ExportStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const validation = validateExportData(data);
  const isLarge = isLargeExport(data.rows.length);
  const filename = `${data.metadata.title}_${new Date().toISOString().split("T")[0]}.${
    format === "csv" ? "csv" : "xlsx"
  }`;

  const handleExport = async () => {
    if (!validation.valid) {
      setError(validation.errors.join(", "));
      return;
    }

    setStatus("processing");
    setProgress(0);
    setError(null);

    try {
      if (isLarge) {
        // Use async export for large datasets
        await exportAsync(data, format, filename, setProgress);
      } else {
        // Direct export for smaller datasets
        if (format === "csv") {
          await exportToCSV(data, filename);
        } else {
          await exportToExcel(data, filename);
        }
        setProgress(100);
      }

      setStatus("success");
      setTimeout(() => {
        onClose();
        setStatus("idle");
        setProgress(0);
      }, 2000);
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Export failed");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg border border-border max-w-md w-full p-6 space-y-4">
        {/* Header */}
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export Data
          </h3>
          <p className="text-sm text-muted-foreground">
            Export {data.rows.length} rows from {data.metadata.title}
          </p>
        </div>

        {/* Large Export Warning */}
        {isLarge && (
          <div className="flex gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-amber-900">Large Export</p>
              <p className="text-xs text-amber-700 mt-1">
                This export contains {data.rows.length.toLocaleString()} rows. Processing may take
                a moment.
              </p>
            </div>
          </div>
        )}

        {/* Format Selection */}
        {status === "idle" && (
          <div className="space-y-3">
            <label className="text-sm font-semibold text-foreground">Export Format</label>
            <div className="space-y-2">
              {(["excel", "csv"] as const).map((fmt) => (
                <label key={fmt} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="format"
                    value={fmt}
                    checked={format === fmt}
                    onChange={(e) => setFormat(e.target.value as ExportFormat)}
                    className="w-4 h-4 rounded"
                  />
                  <div>
                    <p className="font-medium text-foreground text-sm">
                      {fmt === "excel" ? "Microsoft Excel (.xlsx)" : "Comma-Separated Values (.csv)"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {fmt === "excel"
                        ? "Formatted spreadsheet with metadata sheet"
                        : "Plain text format for compatibility"}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Processing State */}
        {status === "processing" && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Loader className="w-4 h-4 text-primary animate-spin" />
              <p className="text-sm font-medium text-foreground">
                Exporting {data.rows.length.toLocaleString()} rows...
              </p>
            </div>
            <div className="w-full h-2 bg-border/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground text-center">{progress}% complete</p>
          </div>
        )}

        {/* Success State */}
        {status === "success" && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-green-50 border border-green-200">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-green-900">Export Completed</p>
              <p className="text-xs text-green-700 mt-1">
                Your file has been downloaded successfully.
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {status === "error" && error && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-red-900">Export Failed</p>
              <p className="text-xs text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Export Info */}
        <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded space-y-1">
          <p>
            <span className="font-semibold">File:</span> {filename}
          </p>
          <p>
            <span className="font-semibold">Scope:</span> {scope}
          </p>
          <p>
            <span className="font-semibold">Includes:</span> Data + Metadata + KPI definitions
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2 justify-end pt-4 border-t border-border/50">
          <button
            onClick={onClose}
            disabled={status === "processing"}
            className="px-4 py-2 rounded border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
          >
            {status === "success" ? "Done" : "Cancel"}
          </button>
          {status === "idle" && (
            <button
              onClick={handleExport}
              disabled={!validation.valid}
              className="px-4 py-2 rounded bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
