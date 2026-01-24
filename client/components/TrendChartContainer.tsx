import { useState } from "react";
import { Eye, EyeOff, Download, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from "xlsx";
import { cn } from "@/lib/utils";

interface TrendChartContainerProps {
  children: React.ReactNode;
  title: string;
  data: any[];
  exportable?: boolean;
  zoomable?: boolean;
  dataKeys?: string[];
}

export default function TrendChartContainer({
  children,
  title,
  data,
  exportable = true,
  zoomable = true,
  dataKeys = [],
}: TrendChartContainerProps) {
  const { toast } = useToast();
  const [showLegend, setShowLegend] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const handleExportCSV = () => {
    setIsExporting(true);
    try {
      // Create CSV data
      const headers = ["Time", ...dataKeys];
      const rows = data.map((item) => {
        return [
          item.time,
          ...dataKeys.map((key) => {
            const value = item[key];
            return typeof value === "number" ? value.toFixed(2) : value;
          }),
        ];
      });

      const csvContent = [
        headers.join(","),
        ...rows.map((row) => row.join(",")),
      ].join("\n");

      // Download CSV
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `${title.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Export successful",
        description: `Downloaded ${title.toLowerCase()} as CSV`,
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export data",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportImage = async () => {
    setIsExporting(true);
    try {
      // For now, just show a message that PNG export requires html2canvas
      toast({
        title: "PNG export",
        description: "Chart PNG export requires additional dependencies. CSV export available.",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="card-elevated rounded-xl border border-border/50 p-6 space-y-4">
      {/* Header with Controls */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h3 className="text-lg font-bold text-foreground">{title}</h3>

        <div className="flex items-center gap-2">
          {/* Legend Toggle */}
          <button
            onClick={() => setShowLegend(!showLegend)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-background hover:bg-muted/50 transition-colors text-sm font-medium"
            title={showLegend ? "Hide legend" : "Show legend"}
          >
            {showLegend ? (
              <>
                <Eye className="w-4 h-4" />
                <span className="hidden sm:inline">Legend</span>
              </>
            ) : (
              <>
                <EyeOff className="w-4 h-4" />
                <span className="hidden sm:inline">Legend Off</span>
              </>
            )}
          </button>

          {/* Export Dropdown */}
          {exportable && (
            <div className="relative group">
              <button
                disabled={isExporting}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-background hover:bg-muted/50 transition-colors text-sm font-medium disabled:opacity-50"
                title="Export chart data"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export</span>
              </button>

              {/* Export Menu */}
              <div className="absolute right-0 mt-1 w-48 bg-card border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                <button
                  onClick={handleExportCSV}
                  disabled={isExporting}
                  className="w-full text-left px-4 py-2 hover:bg-muted/50 transition-colors text-sm disabled:opacity-50 rounded-t-lg"
                >
                  📊 Export as CSV
                </button>
                <button
                  onClick={handleExportImage}
                  disabled={isExporting}
                  className="w-full text-left px-4 py-2 hover:bg-muted/50 transition-colors text-sm disabled:opacity-50 rounded-b-lg border-t border-border/50"
                >
                  🖼️ Export as PNG
                </button>
              </div>
            </div>
          )}

          {/* Zoom Reset (Placeholder for future implementation) */}
          {zoomable && (
            <button
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-background hover:bg-muted/50 transition-colors text-sm font-medium disabled:opacity-50"
              title="Reset zoom"
              disabled={true}
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Chart Container */}
      <div className="rounded-lg border border-border/50 bg-background p-4">
        {children}
      </div>

      {/* Info text */}
      <p className="text-xs text-muted-foreground">
        💡 Hover over chart for details. Click column headers to compare values.
      </p>
    </div>
  );
}
