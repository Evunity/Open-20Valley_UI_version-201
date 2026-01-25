import { useState } from "react";
import { Download, AlertCircle, CheckCircle2, Loader } from "lucide-react";
import { useGlobalFilters } from "@/hooks/useGlobalFilters";
import FilterPanel from "@/components/FilterPanel";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface KPISelectOption {
  id: string;
  label: string;
  category: string;
  description: string;
}

const KPI_OPTIONS: KPISelectOption[] = [
  { id: "availability", label: "Availability", category: "Network", description: "System uptime percentage" },
  { id: "latency", label: "Latency (Avg)", category: "Network", description: "Average response time" },
  { id: "packet_loss", label: "Packet Loss", category: "Network", description: "Data packet loss rate" },
  { id: "active_sites", label: "Active Sites", category: "Infrastructure", description: "Number of operational sites" },
  { id: "incident_count", label: "Incident Count", category: "Operations", description: "Total incidents detected" },
  { id: "mttr", label: "MTTR", category: "Operations", description: "Mean time to recovery" },
  { id: "automation_rate", label: "Automation Rate", category: "AI Impact", description: "% of automated resolutions" },
  { id: "cost_savings", label: "Cost Savings", category: "Financial", description: "Operational cost reduction" },
];

export default function ReportsPage() {
  const { filters } = useGlobalFilters();
  const { toast } = useToast();
  const [selectedKPIs, setSelectedKPIs] = useState<string[]>(["availability", "latency", "active_sites"]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleKPIToggle = (kpiId: string) => {
    setSelectedKPIs((prev) =>
      prev.includes(kpiId)
        ? prev.filter((id) => id !== kpiId)
        : [...prev, kpiId]
    );
  };

  const generateExcelReport = async () => {
    if (selectedKPIs.length === 0) {
      toast({
        title: "No KPIs selected",
        description: "Please select at least one KPI to include in the report",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsGenerating(true);

      // Simulated report data
      const reportData = {
        timestamp: new Date().toISOString(),
        timeRange: filters.timeRange,
        appliedFilters: {
          vendors: filters.vendors.length > 0 ? filters.vendors : "All",
          technologies: filters.technologies.length > 0 ? filters.technologies : "All",
          regions: filters.regions.length > 0 ? filters.regions : "All",
          clusters: filters.clusters.length > 0 ? filters.clusters : "All",
        },
        kpis: selectedKPIs.map((id) => {
          const kpi = KPI_OPTIONS.find((k) => k.id === id);
          return {
            name: kpi?.label || id,
            value: Math.floor(Math.random() * 100) + "%",
            trend: Math.random() > 0.5 ? "↑" : "↓",
            change: (Math.random() * 10 - 5).toFixed(2) + "%",
          };
        }),
      };

      // Generate vendor comparison data if multiple vendors selected
      const vendorComparisonData =
        filters.vendors.length > 1
          ? filters.vendors.map((vendor) => ({
              vendor,
              successRate: (98.2 + Math.random() * 1.5).toFixed(2),
              dropRate: (1.8 - Math.random() * 0.5).toFixed(2),
              stability: (97.5 + Math.random() * 1.8).toFixed(2),
              volume: Math.floor(5000 + Math.random() * 5000),
            }))
          : [];

      // Create CSV content
      const csvContent = [
        ["Network Operations Report"],
        ["Generated:", new Date().toLocaleString()],
        ["Time Range:", filters.timeRange],
        [""],
        ["APPLIED FILTERS"],
        ["Vendors:", reportData.appliedFilters.vendors.toString()],
        ["Technologies:", reportData.appliedFilters.technologies.toString()],
        ["Regions:", reportData.appliedFilters.regions.toString()],
        ["Clusters:", reportData.appliedFilters.clusters.toString()],
        [""],
        ["KEY PERFORMANCE INDICATORS"],
        ["KPI", "Value", "Trend", "Change"],
        ...reportData.kpis.map((kpi) => [kpi.name, kpi.value, kpi.trend, kpi.change]),
      ];

      // Add vendor comparison section if applicable
      if (vendorComparisonData.length > 0) {
        csvContent.push([]);
        csvContent.push(["MULTI-VENDOR COMPARISON"]);
        csvContent.push([
          "Vendor",
          "Success Rate (%)",
          "Drop Rate (%)",
          "Stability (%)",
          "Volume",
        ]);
        vendorComparisonData.forEach((v) => {
          csvContent.push([v.vendor, v.successRate, v.dropRate, v.stability, v.volume]);
        });
      }

      // Convert to CSV format
      const csvString = csvContent
        .map((row) => row.map((cell) => `"${cell}"`).join(","))
        .join("\n");

      // Create blob and download
      const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);

      link.setAttribute("href", url);
      link.setAttribute("download", `network-report-${new Date().getTime()}.csv`);
      link.style.visibility = "hidden";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Report generated successfully",
        description: `Downloaded CSV with ${selectedKPIs.length} KPI(s)${
          vendorComparisonData.length > 0 ? " + vendor comparison" : ""
        }`,
      });
    } catch (error) {
      toast({
        title: "Error generating report",
        description: error instanceof Error ? error.message : "Failed to generate report",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const groupedKPIs = KPI_OPTIONS.reduce((acc, kpi) => {
    if (!acc[kpi.category]) acc[kpi.category] = [];
    acc[kpi.category].push(kpi);
    return acc;
  }, {} as Record<string, KPISelectOption[]>);

  return (
    <div className="space-y-6 pb-4">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Reports</h1>
        <p className="text-muted-foreground">Generate custom reports with selected KPIs and filters</p>
      </div>

      {/* Global Filters */}
      <FilterPanel showTimeRange={true} />

      {/* Main Report Builder */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* KPI Selection Panel */}
        <div className="lg:col-span-2 space-y-4">
          {Object.entries(groupedKPIs).map(([category, kpis]) => (
            <div key={category} className="card-elevated p-6 rounded-xl border border-border/50">
              <h3 className="font-semibold text-lg mb-4 text-foreground">{category}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {kpis.map((kpi) => (
                  <button
                    key={kpi.id}
                    onClick={() => handleKPIToggle(kpi.id)}
                    className={cn(
                      "p-4 rounded-lg border-2 transition-all duration-200 text-left",
                      selectedKPIs.includes(kpi.id)
                        ? "border-primary bg-primary/5"
                        : "border-border bg-card hover:border-primary/50"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{kpi.label}</p>
                        <p className="text-xs text-muted-foreground mt-1">{kpi.description}</p>
                      </div>
                      {selectedKPIs.includes(kpi.id) && (
                        <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Report Summary Sidebar */}
        <div className="space-y-4">
          {/* Report Details Card */}
          <div className="card-elevated p-6 rounded-xl border border-border/50 sticky top-6">
            <h3 className="font-semibold text-lg mb-4 text-foreground">Report Summary</h3>
            <div className="space-y-4">
              {/* Selected KPIs Count */}
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-xs text-muted-foreground mb-1">Selected KPIs</p>
                <p className="text-2xl font-bold text-primary">{selectedKPIs.length}</p>
              </div>

              {/* Active Filters Summary */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Active Filters</p>
                <div className="space-y-1 text-xs">
                  {filters.vendors.length > 0 && (
                    <p className="text-foreground">Vendors: {filters.vendors.join(", ")}</p>
                  )}
                  {filters.technologies.length > 0 && (
                    <p className="text-foreground">Tech: {filters.technologies.join(", ")}</p>
                  )}
                  {filters.regions.length > 0 && (
                    <p className="text-foreground">Regions: {filters.regions.join(", ")}</p>
                  )}
                  {filters.clusters.length > 0 && (
                    <p className="text-foreground">Clusters: {filters.clusters.join(", ")}</p>
                  )}
                  <p className="text-foreground">Time Range: {filters.timeRange}</p>
                </div>
                {filters.vendors.length === 0 &&
                  filters.technologies.length === 0 &&
                  filters.regions.length === 0 &&
                  filters.clusters.length === 0 && (
                    <p className="text-xs text-muted-foreground italic">No filters applied (all data)</p>
                  )}
              </div>

              {/* Generate Button */}
              <button
                onClick={generateExcelReport}
                disabled={isGenerating || selectedKPIs.length === 0}
                className={cn(
                  "w-full py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200 active:scale-95",
                  isGenerating || selectedKPIs.length === 0
                    ? "bg-muted text-muted-foreground cursor-not-allowed"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                )}
              >
                {isGenerating ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader className="w-4 h-4 animate-spin" />
                    <span>Generating...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Download className="w-4 h-4" />
                    <span>Download Report</span>
                  </div>
                )}
              </button>

              {/* Instructions */}
              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
                <p className="text-xs text-blue-900 dark:text-blue-100">
                  <strong>How to use:</strong> Select KPIs, apply filters, and click Download to generate a CSV report.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Box */}
      {selectedKPIs.length === 0 && (
        <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-amber-900 dark:text-amber-100">No KPIs selected</p>
            <p className="text-sm text-amber-800 dark:text-amber-200 mt-1">
              Select at least one KPI to generate a report.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
