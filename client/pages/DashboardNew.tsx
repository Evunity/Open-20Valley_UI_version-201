import { useState, useMemo } from "react";
import { Download, ChevronDown, CheckCircle2, XCircle, Clock } from "lucide-react";
import * as XLSX from "xlsx";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import FilterPanel from "@/components/FilterPanel";
import SearchableKPISelect from "@/components/SearchableKPISelect";
import AnalyticsSections from "@/components/AnalyticsSections";
import VendorComparison from "@/components/VendorComparison";
import { useGlobalFilters } from "@/hooks/useGlobalFilters";
import { useToast } from "@/hooks/use-toast";
import { AVAILABLE_KPIS, getKPIById } from "@/constants/kpis";
import {
  generateTrafficData,
  generateRegionData,
  generateVendorData,
  generateAIActionsData,
  generateAIActionsSummary,
  generateAIActionsDetailList,
  calculateFilterMultiplier,
  calculateDateMultiplier,
  getDaysDifference,
  isHourlyGranularity,
} from "@/utils/dashboardData";
import { cn } from "@/lib/utils";

interface KPIValue {
  value: string | number;
  status: "healthy" | "degraded" | "critical" | "normal";
  change?: number;
}

type ChartType = "line" | "bar" | "pie";

// Get active filters summary for display on KPI cards
const getActiveFiltersSummary = (filters: any) => {
  const activeFilters: string[] = [];

  if (filters.vendors && filters.vendors.length > 0) {
    activeFilters.push(...filters.vendors);
  }
  if (filters.technologies && filters.technologies.length > 0) {
    activeFilters.push(...filters.technologies);
  }
  if (filters.regions && filters.regions.length > 0) {
    activeFilters.push(...filters.regions);
  }
  if (filters.clusters && filters.clusters.length > 0) {
    activeFilters.push(...filters.clusters);
  }
  if (filters.countries && filters.countries.length > 0) {
    activeFilters.push(...filters.countries);
  }

  return {
    count: activeFilters.length,
    names: activeFilters,
  };
};

// Calculate KPI values based on filters AND date range
const calculateKPIValue = (kpiId: string, filters: any): KPIValue => {
  const baseValues: Record<
    string,
    {
      value: number | string;
      unit: string;
      status: "healthy" | "degraded" | "critical" | "normal";
      change: number;
    }
  > = {
    total_sites: { value: 2847, unit: "", status: "healthy", change: -2.1 },
    active_sites: { value: 2721, unit: "", status: "healthy", change: -0.8 },
    down_sites: { value: 126, unit: "", status: "critical", change: 8.2 },
    uptime: { value: 99.87, unit: "%", status: "healthy", change: 0.15 },
    avg_latency: { value: 42, unit: "ms", status: "normal", change: 5.2 },
    success_rate: { value: 98.9, unit: "%", status: "healthy", change: 0.3 },
    packet_loss: { value: 0.12, unit: "%", status: "healthy", change: -0.05 },
    network_availability: { value: 99.92, unit: "%", status: "healthy", change: 0.08 },
    call_completion_rate: { value: 97.45, unit: "%", status: "healthy", change: 1.2 },
    data_throughput: { value: 3.42, unit: "Tbps", status: "healthy", change: 2.3 },
    incident_count: { value: 12, unit: "", status: "degraded", change: 3.0 },
    network_health: { value: 94.2, unit: "%", status: "healthy", change: 0.5 },
  };

  const base = baseValues[kpiId] || { value: "N/A", unit: "", status: "normal", change: 0 };
  let calculatedValue = typeof base.value === "number" ? base.value : base.value;
  let status = base.status;
  let change = base.change;

  // Apply filter multiplier
  const filterMultiplier = calculateFilterMultiplier(filters);
  const dateMultiplier = calculateDateMultiplier(filters);
  const totalMultiplier = filterMultiplier * dateMultiplier;

  // Apply multipliers to count-based KPIs
  if (
    typeof calculatedValue === "number" &&
    ["total_sites", "active_sites", "down_sites", "incident_count", "data_throughput"].includes(
      kpiId
    )
  ) {
    calculatedValue = Math.round(calculatedValue * totalMultiplier);
  } else if (
    typeof calculatedValue === "number" &&
    [
      "uptime",
      "success_rate",
      "packet_loss",
      "network_availability",
      "call_completion_rate",
      "network_health",
    ].includes(kpiId)
  ) {
    // For percentages, adjust slightly based on filters
    calculatedValue = Math.max(
      85,
      calculatedValue - filters.vendors.length * 0.5 - filters.technologies.length * 0.3
    );
  }

  // Adjust change based on filters
  if (filters.vendors.length > 0 || filters.technologies.length > 0) {
    change *= 0.6;
  }

  // Format the value with unit
  let formattedValue = String(calculatedValue);
  if (typeof calculatedValue === "number" && kpiId !== "incident_count") {
    if (
      [
        "uptime",
        "success_rate",
        "packet_loss",
        "network_availability",
        "call_completion_rate",
        "network_health",
      ].includes(kpiId)
    ) {
      formattedValue = calculatedValue.toFixed(2) + base.unit;
    } else if (kpiId === "avg_latency") {
      formattedValue = Math.round(calculatedValue) + base.unit;
    } else if (kpiId === "data_throughput") {
      formattedValue = calculatedValue.toFixed(2) + base.unit;
    } else {
      formattedValue = calculatedValue.toLocaleString() + base.unit;
    }
  }

  return {
    value: formattedValue,
    status: status,
    change: change,
  };
};

export default function DashboardNew() {
  const { toast } = useToast();
  const { filters } = useGlobalFilters();
  const [selectedKPIIds, setSelectedKPIIds] = useState<string[]>([
    "total_sites",
    "active_sites",
    "uptime",
    "success_rate",
    "avg_latency",
    "network_health",
  ]);
  const [showKPISelector, setShowKPISelector] = useState(false);

  // 4 Configurable Graph Cards states
  const [graphCards, setGraphCards] = useState<
    Array<{
      id: number;
      selectedKPIs: string[];
      chartType: ChartType;
      xAxis: string;
      yAxis: string;
    }>
  >([
    {
      id: 1,
      selectedKPIs: ["total_sites", "active_sites"],
      chartType: "line",
      xAxis: "time",
      yAxis: "value",
    },
    {
      id: 2,
      selectedKPIs: ["uptime", "success_rate"],
      chartType: "bar",
      xAxis: "time",
      yAxis: "value",
    },
    {
      id: 3,
      selectedKPIs: ["avg_latency"],
      chartType: "line",
      xAxis: "time",
      yAxis: "value",
    },
    {
      id: 4,
      selectedKPIs: ["network_health"],
      chartType: "bar",
      xAxis: "time",
      yAxis: "value",
    },
  ]);

  // AI Chart type state
  const [aiChartType, setAiChartType] = useState<ChartType>("bar");

  // AI Actions sorting state
  const [actionsSortOrder, setActionsSortOrder] = useState<"low-to-high" | "high-to-low">(
    "high-to-low"
  );

  // Generate all chart data with memoization (re-renders on filter change)
  const trafficData = useMemo(() => generateTrafficData(filters), [filters]);
  const regionData = useMemo(() => generateRegionData(filters), [filters]);
  const vendorData = useMemo(() => generateVendorData(filters), [filters]);
  const aiActionsData = useMemo(() => generateAIActionsData(filters), [filters]);
  const aiSummary = useMemo(() => generateAIActionsSummary(filters), [filters]);
  const aiActionsDetailList = useMemo(() => generateAIActionsDetailList(filters), [filters]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "text-status-healthy";
      case "degraded":
        return "text-status-degraded";
      case "critical":
        return "text-status-critical";
      default:
        return "text-foreground";
    }
  };

  const toggleKPISelection = (kpiId: string) => {
    setSelectedKPIIds((prev) =>
      prev.includes(kpiId) ? prev.filter((id) => id !== kpiId) : [...prev, kpiId]
    );
  };

  // Calculate active filter count for export
  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.vendors.length > 0) count += filters.vendors.length;
    if (filters.technologies.length > 0) count += filters.technologies.length;
    if (filters.regions.length > 0) count += filters.regions.length;
    if (filters.clusters.length > 0) count += filters.clusters.length;
    if (filters.countries.length > 0) count += filters.countries.length;
    if (filters.dateRange.from && filters.dateRange.to) count += 1;
    return count;
  };

  const exportToExcel = () => {
    const selectedKPIs = selectedKPIIds.map((id) => {
      const kpi = getKPIById(id);
      const kpiValue = calculateKPIValue(id, filters);
      return {
        KPI: kpi?.label || id,
        Value: kpiValue.value,
        Unit: kpi?.unit || "",
        Status: kpiValue.status,
      };
    });

    // Prepare chart data for all 4 graph cards
    const graphCardsData = graphCards.map((card) => ({
      cardId: card.id,
      selectedKPIs: card.selectedKPIs,
      chartType: card.chartType,
      data:
        card.selectedKPIs[0] === "total_sites" || card.selectedKPIs[0] === "active_sites"
          ? trafficData
          : trafficData,
    }));

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();

    // Sheet 1: KPI Values
    const kpiSheetData: any[] = [];
    kpiSheetData.push(["KPI", "Value", "Unit", "Status"]);
    selectedKPIs.forEach((kpi) => {
      kpiSheetData.push([kpi.KPI, kpi.Value, kpi.Unit, kpi.Status]);
    });

    const ws1 = XLSX.utils.aoa_to_sheet(kpiSheetData);
    ws1["!cols"] = [{ wch: 25 }, { wch: 20 }, { wch: 15 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, ws1, "KPI Values");

    // Sheet 2: Traffic Data
    const trafficSheetData: any[] = [];
    trafficSheetData.push(["Time", "Traffic", "Success Rate"]);
    trafficData.forEach((item) => {
      trafficSheetData.push([item.time, item.traffic, item.success]);
    });

    const ws2 = XLSX.utils.aoa_to_sheet(trafficSheetData);
    ws2["!cols"] = [{ wch: 20 }, { wch: 15 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, ws2, "Traffic Data");

    // Sheet 3: Region Data
    const regionSheetData: any[] = [];
    regionSheetData.push(["Region", "Sites"]);
    regionData.forEach((item) => {
      regionSheetData.push([item.region, item.sites]);
    });

    const ws3 = XLSX.utils.aoa_to_sheet(regionSheetData);
    ws3["!cols"] = [{ wch: 20 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, ws3, "Region Data");

    // Sheet 4: Vendor Data
    const vendorSheetData: any[] = [];
    vendorSheetData.push(["Vendor", "Sites"]);
    vendorData.forEach((item) => {
      vendorSheetData.push([item.vendor, item.sites]);
    });

    const ws4 = XLSX.utils.aoa_to_sheet(vendorSheetData);
    ws4["!cols"] = [{ wch: 20 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, ws4, "Vendor Data");

    // Sheet 5: Applied Filters
    const filtersData: any[] = [];
    filtersData.push(["Filter Type", "Values"]);
    filtersData.push(["Vendors", filters.vendors.join(", ") || "All"]);
    filtersData.push(["Technologies", filters.technologies.join(", ") || "All"]);
    filtersData.push(["Regions", filters.regions.join(", ") || "All"]);
    filtersData.push(["Clusters", filters.clusters.join(", ") || "All"]);
    filtersData.push(["Countries", filters.countries.join(", ") || "All"]);
    filtersData.push([
      "Date Range",
      filters.dateRange.from && filters.dateRange.to
        ? `${new Date(filters.dateRange.from).toLocaleDateString()} - ${new Date(filters.dateRange.to).toLocaleDateString()}`
        : "All Time",
    ]);

    const ws5 = XLSX.utils.aoa_to_sheet(filtersData);
    ws5["!cols"] = [{ wch: 20 }, { wch: 40 }];
    XLSX.utils.book_append_sheet(wb, ws5, "Filters");

    // Sheet 6: AI Engine Actions Data
    const aiActionsSheetData: any[] = [];
    aiActionsSheetData.push(["Time", "Total", "Successful", "Failed"]);
    aiActionsData.forEach((item) => {
      aiActionsSheetData.push([item.time, item.total, item.successful, item.failed]);
    });

    const ws6 = XLSX.utils.aoa_to_sheet(aiActionsSheetData);
    ws6["!cols"] = [{ wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, ws6, "AI Engine Actions");

    // Sheet 7: AI Actions Detailed List
    const aiActionsDetailSheetData: any[] = [];
    aiActionsDetailSheetData.push(["Action Name", "Time", "Severity", "Status"]);
    aiActionsDetailList.forEach((action) => {
      aiActionsDetailSheetData.push([action.name, action.time, action.severity, action.status]);
    });

    const ws7 = XLSX.utils.aoa_to_sheet(aiActionsDetailSheetData);
    ws7["!cols"] = [{ wch: 30 }, { wch: 20 }, { wch: 15 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, ws7, "AI Actions Details");

    // Sheet 8: Analytics Graph Data - Card 1
    if (graphCards[0] && graphCards[0].selectedKPIs.length > 0) {
      const graphCard1Data: any[] = [];
      const headers = [
        "Time",
        ...graphCards[0].selectedKPIs.map((kpiId) => getKPIById(kpiId)?.label || kpiId),
      ];
      graphCard1Data.push(headers);
      trafficData.forEach((item) => {
        const row = [item.time];
        graphCards[0].selectedKPIs.forEach((kpiId) => {
          row.push(item[kpiId] ?? "N/A");
        });
        graphCard1Data.push(row);
      });
      const ws8 = XLSX.utils.aoa_to_sheet(graphCard1Data);
      ws8["!cols"] = headers.map(() => ({ wch: 20 }));
      XLSX.utils.book_append_sheet(wb, ws8, "Graph Card 1");
    }

    // Sheet 9: Analytics Graph Data - Card 2
    if (graphCards[1] && graphCards[1].selectedKPIs.length > 0) {
      const graphCard2Data: any[] = [];
      const headers = [
        "Time",
        ...graphCards[1].selectedKPIs.map((kpiId) => getKPIById(kpiId)?.label || kpiId),
      ];
      graphCard2Data.push(headers);
      trafficData.forEach((item) => {
        const row = [item.time];
        graphCards[1].selectedKPIs.forEach((kpiId) => {
          row.push(item[kpiId] ?? "N/A");
        });
        graphCard2Data.push(row);
      });
      const ws9 = XLSX.utils.aoa_to_sheet(graphCard2Data);
      ws9["!cols"] = headers.map(() => ({ wch: 20 }));
      XLSX.utils.book_append_sheet(wb, ws9, "Graph Card 2");
    }

    // Sheet 10: Analytics Graph Data - Card 3
    if (graphCards[2] && graphCards[2].selectedKPIs.length > 0) {
      const graphCard3Data: any[] = [];
      const headers = [
        "Time",
        ...graphCards[2].selectedKPIs.map((kpiId) => getKPIById(kpiId)?.label || kpiId),
      ];
      graphCard3Data.push(headers);
      trafficData.forEach((item) => {
        const row = [item.time];
        graphCards[2].selectedKPIs.forEach((kpiId) => {
          row.push(item[kpiId] ?? "N/A");
        });
        graphCard3Data.push(row);
      });
      const ws10 = XLSX.utils.aoa_to_sheet(graphCard3Data);
      ws10["!cols"] = headers.map(() => ({ wch: 20 }));
      XLSX.utils.book_append_sheet(wb, ws10, "Graph Card 3");
    }

    // Sheet 11: Analytics Graph Data - Card 4
    if (graphCards[3] && graphCards[3].selectedKPIs.length > 0) {
      const graphCard4Data: any[] = [];
      const headers = [
        "Time",
        ...graphCards[3].selectedKPIs.map((kpiId) => getKPIById(kpiId)?.label || kpiId),
      ];
      graphCard4Data.push(headers);
      trafficData.forEach((item) => {
        const row = [item.time];
        graphCards[3].selectedKPIs.forEach((kpiId) => {
          row.push(item[kpiId] ?? "N/A");
        });
        graphCard4Data.push(row);
      });
      const ws11 = XLSX.utils.aoa_to_sheet(graphCard4Data);
      ws11["!cols"] = headers.map(() => ({ wch: 20 }));
      XLSX.utils.book_append_sheet(wb, ws11, "Graph Card 4");
    }

    // Sheet 12: Dashboard Summary
    const summaryData: any[] = [];
    summaryData.push(["Metric", "Value"]);
    summaryData.push(["Total AI Actions", aiSummary.totalActions || "N/A"]);
    summaryData.push(["Successful Actions", aiSummary.successfulActions || "N/A"]);
    summaryData.push(["Failed Actions", aiSummary.failedActions || "N/A"]);
    summaryData.push(["", ""]);
    summaryData.push(["Granularity", filters.timeGranularity]);
    summaryData.push([
      "Date Range",
      filters.dateRange.from && filters.dateRange.to
        ? `${new Date(filters.dateRange.from).toLocaleDateString()} - ${new Date(filters.dateRange.to).toLocaleDateString()}`
        : "All Time",
    ]);
    summaryData.push(["Active Filters", getActiveFilterCount()]);

    const ws12 = XLSX.utils.aoa_to_sheet(summaryData);
    ws12["!cols"] = [{ wch: 25 }, { wch: 30 }];
    XLSX.utils.book_append_sheet(wb, ws12, "Dashboard Summary");

    // Generate file with proper naming
    const now = new Date();
    const dateStr = now.toISOString().split("T")[0];
    const fileName = `Network_Operations_Dashboard_${dateStr}.xlsx`;
    XLSX.writeFile(wb, fileName);

    toast({
      title: "Export successful",
      description: `Downloaded as ${fileName}`,
    });
  };

  const selectedKPIs = selectedKPIIds.map((id) => getKPIById(id)).filter(Boolean);

  // Format date for X-axis display (YYYY-MM-DD) - ALWAYS used, never day names
  const formatDateForAxis = (dateStr: string | number): string => {
    try {
      const date = new Date(dateStr);
      const isoString = date.toISOString();
      return isoString.split("T")[0]; // Returns YYYY-MM-DD
    } catch {
      return String(dateStr);
    }
  };

  // KPI to chart color mapping
  const kpiColorMap: Record<string, string> = {
    traffic: "#7c3aed",
    success: "#22c55e",
    total_sites: "#3b82f6",
    active_sites: "#06b6d4",
    uptime: "#8b5cf6",
    success_rate: "#22c55e",
    avg_latency: "#f59e0b",
    network_health: "#10b981",
    sites: "#3b82f6",
    successful: "#22c55e",
    failed: "#ef4444",
  };

  // Get KPI label from ID
  const getKPILabel = (kpiId: string): string => {
    const kpi = AVAILABLE_KPIS.find((k) => k.id === kpiId);
    return kpi?.label || kpiId;
  };

  // Helper function to render charts based on type with strict date formatting
  const renderChart = (chartType: ChartType, data: any[], dataKeys: string[]) => {
    // Transform all data to ensure dates are in YYYY-MM-DD format
    const formattedData = data.map((item: any) => {
      const formatted: any = { ...item };

      // Always format time as YYYY-MM-DD
      if (item.time) {
        formatted.time = formatDateForAxis(item.time);
      }

      return formatted;
    });

    // Filter to only data keys that actually exist in the data
    const validDataKeys = dataKeys.filter((key) => {
      return formattedData.length > 0 && key in formattedData[0];
    });

    switch (chartType) {
      case "line":
        return (
          <LineChart data={formattedData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="time"
              type="category"
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize: "12px" }}
              tick={{ fontSize: 11 }}
            />
            <YAxis stroke="hsl(var(--muted-foreground))" style={{ fontSize: "12px" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
            <Legend />
            {validDataKeys.map((key, idx) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={kpiColorMap[key] || ["#7c3aed", "#3b82f6", "#22c55e", "#f59e0b"][idx % 4]}
                strokeWidth={2}
                name={getKPILabel(key)}
              />
            ))}
          </LineChart>
        );
      case "bar":
        return (
          <BarChart data={formattedData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="time"
              type="category"
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize: "12px" }}
              tick={{ fontSize: 11 }}
            />
            <YAxis stroke="hsl(var(--muted-foreground))" style={{ fontSize: "12px" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
            <Legend />
            {validDataKeys.map((key, idx) => (
              <Bar
                key={key}
                dataKey={key}
                fill={kpiColorMap[key] || ["#7c3aed", "#3b82f6", "#22c55e", "#f59e0b"][idx % 4]}
                radius={[8, 8, 0, 0]}
                name={getKPILabel(key)}
              />
            ))}
          </BarChart>
        );
      case "pie":
        return (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ region, vendor, sites }) => `${region || vendor}: ${sites}`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="sites"
            >
              {data.map((entry: any, index: number) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    entry.fill || ["#7c3aed", "#3b82f6", "#22c55e", "#f59e0b", "#ef4444"][index % 5]
                  }
                />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        );
    }
  };

  return (
    <div className="space-y-8 pb-6">
      {/* ===== HEADER SECTION ===== */}
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold text-foreground">Network Operations Dashboard</h1>
            <p className="text-muted-foreground">
              Real-time monitoring and AI-driven insights across your infrastructure
            </p>
          </div>
          <button
            onClick={exportToExcel}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium"
          >
            <Download className="w-4 h-4" />
            Export to Excel
          </button>
        </div>

        {/* Global Filter Panel */}
        <FilterPanel />
      </div>

      {/* ===== KPI SECTION ===== */}
      <div>
        <div className="space-y-4 mb-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-foreground">Key Performance Indicators</h2>
            <p className="text-sm text-muted-foreground">
              Real-time metrics reflecting current filters ({selectedKPIIds.length} of{" "}
              {AVAILABLE_KPIS.length} displayed)
            </p>
          </div>

          {/* Searchable KPI Dropdown */}
          <div className="max-w-2xl">
            <SearchableKPISelect
              value={selectedKPIIds}
              onChange={setSelectedKPIIds}
              placeholder="Search and select KPIs (max 6)..."
              maxItems={6}
            />
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {selectedKPIs.map((kpi) => {
            const kpiValue = calculateKPIValue(kpi.id, filters);
            const IconComponent = kpi.icon;
            const activeFilters = getActiveFiltersSummary(filters);

            return (
              <div
                key={kpi.id}
                className={cn(
                  "p-6 rounded-xl border transition-all duration-300 hover:shadow-lg hover:border-primary/50",
                  kpiValue.status === "healthy"
                    ? "border-status-healthy/20 bg-status-healthy/5"
                    : kpiValue.status === "critical"
                      ? "border-status-critical/20 bg-status-critical/5"
                      : "border-border bg-card"
                )}
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div
                    className={cn(
                      "p-2.5 rounded-lg w-fit",
                      kpiValue.status === "healthy"
                        ? "bg-status-healthy/10"
                        : kpiValue.status === "critical"
                          ? "bg-status-critical/10"
                          : "bg-muted"
                    )}
                  >
                    <IconComponent
                      className={cn(
                        "w-5 h-5",
                        kpiValue.status === "healthy"
                          ? "text-status-healthy"
                          : kpiValue.status === "critical"
                            ? "text-status-critical"
                            : "text-foreground"
                      )}
                    />
                  </div>

                  {activeFilters.count > 0 && (
                    <div className="text-right flex-1">
                      <p className="text-xs font-semibold text-muted-foreground mb-1">
                        {activeFilters.count} {activeFilters.count === 1 ? "filter" : "filters"}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {activeFilters.names.join(", ")}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                    {kpi.label}
                  </p>
                  <p className={cn("text-3xl font-bold", getStatusColor(kpiValue.status))}>
                    {kpiValue.value}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ===== ANALYTICS SECTIONS ===== */}
      <AnalyticsSections />

      {/* ===== AI ENGINE ACTIONS (2-COLUMN LAYOUT) ===== */}
      <div id="ai-actions" className="card-elevated rounded-xl border border-border/50 p-6">
        <div className="mb-6 space-y-1">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-foreground">AI Engine Actions</h2>
              <p className="text-sm text-muted-foreground">
                Automated network operations and resolution activities
              </p>
            </div>
            <select
              value={aiChartType}
              onChange={(e) => setAiChartType(e.target.value as ChartType)}
              className="px-3 py-1 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-primary/50"
            >
              <option value="bar">Bar Chart</option>
              <option value="line">Line Chart</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT: Chart Visualization */}
          <div className="rounded-lg border border-border/50 bg-background p-4">
            <ResponsiveContainer width="100%" height={350}>
              {renderChart(aiChartType, aiActionsData, ["successful", "failed"])}
            </ResponsiveContainer>
          </div>

          {/* RIGHT: AI Actions List */}
          <div className="space-y-3">
            {/* Severity Sorting Filter */}
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Sort by Severity:
              </label>
              <select
                value={actionsSortOrder}
                onChange={(e) =>
                  setActionsSortOrder(e.target.value as "low-to-high" | "high-to-low")
                }
                className="px-3 py-1 rounded-lg border border-border bg-background text-xs focus:ring-2 focus:ring-primary/50"
              >
                <option value="high-to-low">High → Low</option>
                <option value="low-to-high">Low → High</option>
              </select>
            </div>

            {/* Actions List */}
            <div
              className="rounded-lg border border-border/50 bg-background p-4 overflow-y-auto space-y-2"
              style={{ maxHeight: "350px" }}
            >
              {aiActionsDetailList
                .sort((a, b) => {
                  const severityMap = { HIGH: 3, MED: 2, LOW: 1 };
                  const severityA = severityMap[a.severity as keyof typeof severityMap] || 0;
                  const severityB = severityMap[b.severity as keyof typeof severityMap] || 0;
                  return actionsSortOrder === "high-to-low"
                    ? severityB - severityA
                    : severityA - severityB;
                })
                .map((action) => (
                  <div
                    key={action.id}
                    className="p-3 rounded-lg border border-border/30 bg-card hover:bg-card/80 transition-colors space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {action.name}
                        </p>
                        <p className="text-xs text-muted-foreground">{action.time}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span
                          className={cn(
                            "px-2 py-1 rounded text-xs font-semibold whitespace-nowrap",
                            action.severity === "HIGH"
                              ? "bg-status-critical/20 text-status-critical"
                              : action.severity === "MED"
                                ? "bg-status-degraded/20 text-status-degraded"
                                : "bg-status-healthy/20 text-status-healthy"
                          )}
                        >
                          {action.severity}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span
                        className={cn(
                          "text-xs font-medium px-2 py-1 rounded",
                          action.status === "Success"
                            ? "bg-status-healthy/20 text-status-healthy"
                            : action.status === "Failed"
                              ? "bg-status-critical/20 text-status-critical"
                              : "bg-primary/20 text-primary"
                        )}
                      >
                        {action.status}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* ===== 4 CONFIGURABLE GRAPH CARDS ===== */}
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground">Analytics Graphs</h2>
          <p className="text-sm text-muted-foreground">Configure up to 2 KPIs per card</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {graphCards.map((card) => (
            <div
              key={card.id}
              className="card-elevated rounded-xl border border-border/50 p-6 space-y-4"
            >
              {/* Card Header with KPI Selection and Chart Type */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                    KPI Selection (Max 2)
                  </label>
                  <SearchableKPISelect
                    value={card.selectedKPIs}
                    onChange={(selected) => {
                      setGraphCards((prev) =>
                        prev.map((c) => (c.id === card.id ? { ...c, selectedKPIs: selected } : c))
                      );
                    }}
                    placeholder="Search and select KPIs..."
                    maxItems={2}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                    Chart Type
                  </label>
                  <select
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    value={card.chartType}
                    onChange={(e) => {
                      setGraphCards((prev) =>
                        prev.map((c) =>
                          c.id === card.id ? { ...c, chartType: e.target.value as ChartType } : c
                        )
                      );
                    }}
                  >
                    <option value="line">Line Chart</option>
                    <option value="bar">Bar Chart</option>
                  </select>
                </div>
              </div>

              {/* Chart Visualization */}
              <div className="rounded-lg border border-border/50 bg-background p-4">
                <ResponsiveContainer width="100%" height={300}>
                  {card.selectedKPIs.length > 0 ? (
                    renderChart(card.chartType, trafficData, card.selectedKPIs)
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                      Select KPIs to display chart
                    </div>
                  )}
                </ResponsiveContainer>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== SITES BY REGION ===== */}
      <div className="card-elevated rounded-xl border border-border/50 p-6">
        <div className="mb-6 space-y-1">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-foreground">Sites by Region</h3>
              <p className="text-sm text-muted-foreground">Geographic distribution</p>
            </div>
            <select
              className="px-3 py-1 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-primary/50"
              defaultValue="bar"
              onChange={(e) => {}}
            >
              <option value="bar">Bar Chart</option>
              <option value="line">Line Chart</option>
            </select>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          {renderChart("bar", regionData, ["sites"])}
        </ResponsiveContainer>
      </div>

      {/* ===== VENDOR DISTRIBUTION ===== */}
      <div className="card-elevated rounded-xl border border-border/50 p-6">
        <div className="mb-6 space-y-1">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-foreground">Vendor Distribution</h3>
              <p className="text-sm text-muted-foreground">Equipment manufacturer breakdown</p>
            </div>
            <select
              className="px-3 py-1 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-primary/50"
              defaultValue="pie"
              onChange={(e) => {}}
            >
              <option value="pie">Pie Chart</option>
              <option value="bar">Bar Chart</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ResponsiveContainer width="100%" height={300}>
              {renderChart("pie", vendorData, ["sites"])}
            </ResponsiveContainer>
          </div>
          <div className="space-y-3 flex flex-col justify-center">
            {vendorData.map((vendor, idx) => (
              <div key={idx} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: vendor.fill }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{vendor.vendor}</p>
                  <p className="text-xs text-muted-foreground">{vendor.sites} sites</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
