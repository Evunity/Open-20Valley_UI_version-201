import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Copy, Download, Plus, RotateCcw, Save, Trash2 } from "lucide-react";
import * as XLSX from "xlsx";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import FilterPanel from "@/components/FilterPanel";
import DashboardDrilldownHeader from "@/components/DashboardDrilldownHeader";
import KPICard from "@/components/KPICard";
import ExecutiveInsightSummary, { type InsightData } from "@/components/ExecutiveInsightSummary";
import TrendChartContainer from "@/components/TrendChartContainer";
import { useGlobalFilters } from "@/hooks/useGlobalFilters";
import { useToast } from "@/hooks/use-toast";
import {
  generateDataKPIs,
  generateDataTrendData,
  generateDataBreakdownByVendor,
  generateDataBreakdownByTechnology,
  generateDataBreakdownByRegion,
  generateDataBreakdownByCluster,
  segmentDataPerformance,
  generateTimeRegionHeatmap,
  generateTechCapacityHeatmap,
  generateHourlyUtilizationHeatmap,
  generateDataInsights,
} from "@/utils/analyticsData";
import { getDaysDifference } from "@/utils/dashboardData";
import { Zap, TrendingUp, Activity, Gauge, Wifi, Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { SeverityBadge } from "@/components/ui/severity-badge";
import { PriorityChip } from "@/components/ui/priority-chip";
import { StatusPill } from "@/components/ui/status-pill";

export default function DataAnalytics() {
  const { toast } = useToast();
  const { filters } = useGlobalFilters();
  const [heatmapDate, setHeatmapDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  // Generate data
  const kpis = useMemo(() => generateDataKPIs(filters), [filters]);
  const trendData = useMemo(() => generateDataTrendData(filters), [filters]);
  const vendorBreakdown = useMemo(() => generateDataBreakdownByVendor(filters), [filters]);
  const techBreakdown = useMemo(() => generateDataBreakdownByTechnology(filters), [filters]);
  const regionBreakdown = useMemo(() => generateDataBreakdownByRegion(filters), [filters]);
  const clusterBreakdown = useMemo(() => generateDataBreakdownByCluster(filters), [filters]);

  // Segment data
  const vendorSegmented = useMemo(() => segmentDataPerformance(vendorBreakdown), [vendorBreakdown]);
  const techSegmented = useMemo(() => segmentDataPerformance(techBreakdown), [techBreakdown]);
  const regionSegmented = useMemo(() => segmentDataPerformance(regionBreakdown), [regionBreakdown]);
  const clusterSegmented = useMemo(
    () => segmentDataPerformance(clusterBreakdown),
    [clusterBreakdown]
  );

  // Calculate average speed and latency for display in tables
  const avgSpeed = useMemo(() => {
    if (trendData.length === 0) return 87;
    return trendData.reduce((sum, d) => sum + d.avg_speed, 0) / trendData.length;
  }, [trendData]);

  const avgLatency = useMemo(() => {
    if (trendData.length === 0) return 38;
    return trendData.reduce((sum, d) => sum + d.avg_latency, 0) / trendData.length;
  }, [trendData]);

  // Generate heatmap data
  const timeRegionHeatmap = useMemo(() => generateTimeRegionHeatmap(), []);
  const techCapacityHeatmap = useMemo(() => generateTechCapacityHeatmap(), []);
  const hourlyUtilizationHeatmap = useMemo(
    () => generateHourlyUtilizationHeatmap(heatmapDate),
    [heatmapDate]
  );
  const heatmapRegions = ["North", "South", "East", "West", "Central"];
  const heatmapLegendItems = [
    { label: "Low (<40%)", colorClass: "bg-green-300" },
    { label: "Medium (40-60%)", colorClass: "bg-yellow-300" },
    { label: "High (60-80%)", colorClass: "bg-orange-400" },
    { label: "Critical (>80%)", colorClass: "bg-red-500" },
  ];
  const getHeatmapCellColor = (intensity: "low" | "medium" | "high" | "critical") =>
    intensity === "critical"
      ? "bg-red-500"
      : intensity === "high"
        ? "bg-orange-400"
        : intensity === "medium"
          ? "bg-yellow-300"
          : "bg-green-300";

  // Generate data insights
  const dataInsights = useMemo(
    () => generateDataInsights(trendData, filters),
    [trendData, filters]
  );

  // Generate capacity stress areas based on filters
  const stressAreas = useMemo(() => {
    const baseAreas = [
      {
        area: "Region: South - Cluster C",
        utilization: 85,
        speed: 62,
        latency: 67,
        status: "critical",
      },
      {
        area: "Region: East - Cluster B",
        utilization: 78,
        speed: 71,
        latency: 54,
        status: "high",
      },
      {
        area: "Technology: 3G - North",
        utilization: 72,
        speed: 58,
        latency: 78,
        status: "high",
      },
      {
        area: "Vendor: Huawei - Central",
        utilization: 68,
        speed: 73,
        latency: 45,
        status: "medium",
      },
    ];

    // Filter areas based on selected vendors, technologies, and regions
    return baseAreas.filter((item) => {
      const matchesVendor =
        filters.vendors.length === 0 || filters.vendors.some((v) => item.area.includes(v));
      const matchesTech =
        filters.technologies.length === 0 || filters.technologies.some((t) => item.area.includes(t));
      const matchesRegion =
        filters.regions.length === 0 || filters.regions.some((r) => item.area.includes(r));

      return matchesVendor && matchesTech && matchesRegion;
    });
  }, [filters]);

  // Generate insights
  const insights = useMemo(() => {
    const today = new Date();
    const dateStr = today
      .toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" })
      .replace(/\//g, "-");

    // Calculate average DEI from trend data
    const avgDEI =
      trendData.length > 0 ? trendData.reduce((sum, d) => sum + d.dei, 0) / trendData.length : 8.4;

    // Calculate change (comparing last 3 with previous 3 periods)
    let deiChange = -0.83;
    if (trendData.length >= 6) {
      const lastThree = trendData.slice(-3);
      const prevThree = trendData.slice(-6, -3);
      const lastAvg = lastThree.reduce((sum, d) => sum + d.dei, 0) / 3;
      const prevAvg = prevThree.reduce((sum, d) => sum + d.dei, 0) / 3;
      deiChange = lastAvg - prevAvg;
    }

    return {
      overall: {
        change: deiChange,
        status: deiChange < 0 ? ("Degraded" as const) : ("Improved" as const),
      },
      byTechnology: [
        { name: "5G", change: 3.2, status: "Improved" as const },
        { name: "4G", change: 0.8, status: "Improved" as const },
        { name: "3G", change: -1.5, status: "Degraded" as const },
      ],
      byRegion: [
        { name: "North", change: 2.5, status: "Improved" as const },
        { name: "South", change: -0.8, status: "Degraded" as const },
        { name: "East", change: 1.8, status: "Improved" as const },
      ],
    };
  }, [trendData]);

  const getSuccessRateTone = (successRate: number): "success" | "danger" | "neutral" => {
    if (successRate > 98) return "success";
    if (successRate > 96) return "neutral";
    return "danger";
  };

  type SegmentLogic = "AND" | "OR";
  type SegmentRule = {
    id: string;
    field: string;
    operator: string;
    value: string;
  };

  const dimensionOptions = [
    "Country",
    "Region",
    "Vendor",
    "Technology",
    "Site Type",
    "Cluster",
    "Customer Tier",
  ];
  const operatorOptions = [
    "equals",
    "not equals",
    "in",
    "not in",
    "greater than",
    "less than",
    "contains",
  ];
  const groupingOptions = ["Region", "Cluster", "Vendor", "Technology", "Site Type"];
  const aggregationOptions = ["Count", "Sum", "Average", "Median", "Rate", "Percentile"];
  const sortingOptions = ["By value", "By name", "By trend", "By change"];
  const defaultRules: SegmentRule[] = [
    { id: "rule-1", field: "Region", operator: "equals", value: "North" },
  ];

  const [segmentRules, setSegmentRules] = useState<SegmentRule[]>(defaultRules);
  const [segmentLogic, setSegmentLogic] = useState<SegmentLogic>("AND");
  const [segmentName, setSegmentName] = useState("High Traffic Sites");
  const [savedSegments, setSavedSegments] = useState<
    Array<{ id: string; name: string; rules: SegmentRule[]; logic: SegmentLogic }>
  >([
    { id: "seg-1", name: "High Traffic Sites", rules: defaultRules, logic: "AND" },
    {
      id: "seg-2",
      name: "Urban Clusters",
      rules: [{ id: "rule-2", field: "Site Type", operator: "equals", value: "Urban" }],
      logic: "AND",
    },
    {
      id: "seg-3",
      name: "Premium Customers",
      rules: [{ id: "rule-3", field: "Customer Tier", operator: "equals", value: "Premium" }],
      logic: "AND",
    },
    {
      id: "seg-4",
      name: "Critical Nodes",
      rules: [{ id: "rule-4", field: "Cluster", operator: "contains", value: "C" }],
      logic: "OR",
    },
  ]);

  const [groupBy, setGroupBy] = useState<string[]>(["Region", "Cluster"]);
  const [aggregationType, setAggregationType] = useState("Count");
  const [sortBy, setSortBy] = useState("By value");
  const [hierarchyMode, setHierarchyMode] = useState<"Hierarchy" | "Flat">("Hierarchy");
  const [topN, setTopN] = useState(4);
  const [appliedSummary, setAppliedSummary] = useState("Default configuration");

  const analyticsRecords = useMemo(() => {
    const countries = ["USA", "Canada", "Mexico", "Brazil"];
    const regions = ["North", "South", "East", "West", "Central"];
    const vendors = ["Nokia", "Huawei", "Ericsson", "Cisco", "ZTE"];
    const technologies = ["5G", "4G", "3G", "Fiber", "Microwave"];
    const siteTypes = ["Urban", "Suburban", "Rural", "Industrial"];
    const clusters = ["Cluster A", "Cluster B", "Cluster C", "Cluster D"];
    const customerTiers = ["Standard", "Premium", "Enterprise"];

    return Array.from({ length: 140 }, (_, idx) => {
      const trend = trendData.length ? trendData[idx % trendData.length] : undefined;
      return {
        id: `record-${idx + 1}`,
        Country: countries[idx % countries.length],
        Region: regions[idx % regions.length],
        Vendor: vendors[idx % vendors.length],
        Technology: technologies[idx % technologies.length],
        "Site Type": siteTypes[idx % siteTypes.length],
        Cluster: clusters[idx % clusters.length],
        "Customer Tier": customerTiers[idx % customerTiers.length],
        Count: 80 + ((idx * 17) % 420),
        "Success Rate": Number((95 + ((idx * 3) % 45) / 10).toFixed(2)),
        Stability: Number((90 + ((idx * 5) % 60) / 10).toFixed(2)),
        Sessions: 400 + ((idx * 113) % 1200),
        trendDelta: Number(((trend?.dei ?? 8) - 8).toFixed(2)),
        changeDelta: Number(((trend?.packet_loss ?? 0.2) - 0.2).toFixed(3)),
      };
    });
  }, [trendData]);

  const evaluateRule = (record: (typeof analyticsRecords)[number], rule: SegmentRule) => {
    const source = String(record[rule.field as keyof typeof record] ?? "");
    const normalizedSource = source.toLowerCase();
    const normalizedValue = rule.value.toLowerCase();
    const listValues = rule.value
      .split(",")
      .map((v) => v.trim().toLowerCase())
      .filter(Boolean);
    const sourceNumber = Number(source);
    const valueNumber = Number(rule.value);

    switch (rule.operator) {
      case "equals":
        return normalizedSource === normalizedValue;
      case "not equals":
        return normalizedSource !== normalizedValue;
      case "in":
        return listValues.includes(normalizedSource);
      case "not in":
        return !listValues.includes(normalizedSource);
      case "greater than":
        return Number.isFinite(sourceNumber) && Number.isFinite(valueNumber)
          ? sourceNumber > valueNumber
          : false;
      case "less than":
        return Number.isFinite(sourceNumber) && Number.isFinite(valueNumber)
          ? sourceNumber < valueNumber
          : false;
      case "contains":
        return normalizedSource.includes(normalizedValue);
      default:
        return true;
    }
  };

  const filteredRecords = useMemo(() => {
    if (!segmentRules.length) return analyticsRecords;
    return analyticsRecords.filter((record) => {
      const checks = segmentRules.map((rule) => evaluateRule(record, rule));
      return segmentLogic === "AND" ? checks.every(Boolean) : checks.some(Boolean);
    });
  }, [analyticsRecords, segmentLogic, segmentRules]);

  const groupedPreview = useMemo(() => {
    const groupMap = new Map<string, (typeof analyticsRecords)>();
    filteredRecords.forEach((record) => {
      const keyFields = groupBy.length ? groupBy : ["Region"];
      const key = keyFields.map((field) => record[field as keyof typeof record]).join(" / ");
      groupMap.set(key, [...(groupMap.get(key) ?? []), record]);
    });

    const results = Array.from(groupMap.entries()).map(([group, items]) => {
      const count = items.length;
      const successRate = items.reduce((sum, item) => sum + item["Success Rate"], 0) / count;
      const stability = items.reduce((sum, item) => sum + item.Stability, 0) / count;
      const sessions = items.reduce((sum, item) => sum + item.Sessions, 0);
      const value = aggregationType === "Count" ? count : sessions;
      const trend = items.reduce((sum, item) => sum + item.trendDelta, 0) / count;
      const change = items.reduce((sum, item) => sum + item.changeDelta, 0) / count;
      return { group, count, successRate, stability, sessions, value, trend, change };
    });

    const sorted = [...results].sort((a, b) => {
      if (sortBy === "By name") return a.group.localeCompare(b.group);
      if (sortBy === "By trend") return b.trend - a.trend;
      if (sortBy === "By change") return b.change - a.change;
      return b.value - a.value;
    });
    return sorted.slice(0, topN);
  }, [aggregationType, filteredRecords, groupBy, sortBy, topN]);

  const coveragePercent = useMemo(() => {
    if (!analyticsRecords.length) return 0;
    return Math.round((filteredRecords.length / analyticsRecords.length) * 100);
  }, [analyticsRecords.length, filteredRecords.length]);

  const handleExport = () => {
    const wb = XLSX.utils.book_new();

    // Sheet 1: KPI Summary
    const kpiData = [
      ["KPI", "Value", "Unit", "Change", "Status"],
      ["Session Success Rate", kpis.session_success_rate.value, "%", "+0.8%", "Healthy"],
      ["Session Drop Rate", kpis.session_drop_rate.value, "%", "-0.1%", "Healthy"],
      ["Average Speed", kpis.avg_speed.value, "Mbps", "+3.2%", "Healthy"],
      ["Peak Speed", kpis.peak_speed.value, "Mbps", "+2.7%", "Healthy"],
      ["Average Latency", kpis.avg_latency.value, "ms", "-1.5%", "Healthy"],
      ["Packet Loss", kpis.packet_loss.value, "%", "-0.02%", "Healthy"],
      ["Data Volume", kpis.data_volume.value, "Tbps", "+4.5%", "Healthy"],
      ["Data Experience Index", kpis.data_experience_index.value, "/10", "+2.1%", "Healthy"],
    ];

    const ws1 = XLSX.utils.aoa_to_sheet(kpiData);
    ws1["!cols"] = [{ wch: 25 }, { wch: 15 }, { wch: 10 }, { wch: 10 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, ws1, "KPI Summary");

    // Sheet 2: Trend Data
    const trendSheetData = [
      ["Time", "Data Volume", "Avg Speed", "Avg Latency", "Packet Loss", "DEI"],
      ...trendData.map((d) => [
        d.time,
        d.data_volume.toFixed(2),
        d.avg_speed.toFixed(2),
        d.avg_latency.toFixed(2),
        d.packet_loss.toFixed(4),
        d.dei.toFixed(2),
      ]),
    ];

    const ws2 = XLSX.utils.aoa_to_sheet(trendSheetData);
    ws2["!cols"] = Array(6).fill({ wch: 15 });
    XLSX.utils.book_append_sheet(wb, ws2, "Trend Data");

    // Sheet 3: Vendor Breakdown
    const vendorData = [
      ["Vendor", "Success Rate", "Drop Rate", "Stability", "Status", "Volume"],
      ...vendorBreakdown.map((v) => [
        v.name,
        v.call_success_rate.toFixed(2),
        v.drop_rate.toFixed(2),
        v.call_stability.toFixed(2),
        v.status,
        v.count,
      ]),
    ];

    const ws3 = XLSX.utils.aoa_to_sheet(vendorData);
    ws3["!cols"] = [{ wch: 15 }, { wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 15 }, { wch: 10 }];
    XLSX.utils.book_append_sheet(wb, ws3, "Vendor Breakdown");

    // Sheet 4: Technology Breakdown
    const techData = [
      ["Technology", "Success Rate", "Drop Rate", "Stability", "Status", "Volume"],
      ...techBreakdown.map((t) => [
        t.name,
        t.call_success_rate.toFixed(2),
        t.drop_rate.toFixed(2),
        t.call_stability.toFixed(2),
        t.status,
        t.count,
      ]),
    ];

    const ws4 = XLSX.utils.aoa_to_sheet(techData);
    ws4["!cols"] = [{ wch: 15 }, { wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 15 }, { wch: 10 }];
    XLSX.utils.book_append_sheet(wb, ws4, "Technology Breakdown");

    // Sheet 5: Region Breakdown
    const regionData = [
      ["Region", "Success Rate", "Drop Rate", "Stability", "Status", "Volume"],
      ...regionBreakdown.map((r) => [
        r.name,
        r.call_success_rate.toFixed(2),
        r.drop_rate.toFixed(2),
        r.call_stability.toFixed(2),
        r.status,
        r.count,
      ]),
    ];

    const ws5 = XLSX.utils.aoa_to_sheet(regionData);
    ws5["!cols"] = [{ wch: 15 }, { wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 15 }, { wch: 10 }];
    XLSX.utils.book_append_sheet(wb, ws5, "Region Breakdown");

    // Sheet 6: Cluster Breakdown
    const clusterData = [
      ["Cluster", "Success Rate", "Drop Rate", "Stability", "Status", "Volume"],
      ...clusterBreakdown.map((c) => [
        c.name,
        c.call_success_rate.toFixed(2),
        c.drop_rate.toFixed(2),
        c.call_stability.toFixed(2),
        c.status,
        c.count,
      ]),
    ];

    const ws6 = XLSX.utils.aoa_to_sheet(clusterData);
    ws6["!cols"] = [{ wch: 15 }, { wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 15 }, { wch: 10 }];
    XLSX.utils.book_append_sheet(wb, ws6, "Cluster Breakdown");

    // Sheet 7: Applied Filters
    const filtersData = [
      ["Filter Type", "Values"],
      ["Vendors", filters.vendors.join(", ") || "All"],
      ["Technologies", filters.technologies.join(", ") || "All"],
      ["Regions", filters.regions.join(", ") || "All"],
      ["Countries", filters.countries.join(", ") || "All"],
      [
        "Date Range",
        filters.dateRange.from && filters.dateRange.to
          ? `${new Date(filters.dateRange.from).toLocaleDateString()} - ${new Date(filters.dateRange.to).toLocaleDateString()}`
          : "All Time",
      ],
    ];

    const ws7 = XLSX.utils.aoa_to_sheet(filtersData);
    ws7["!cols"] = [{ wch: 20 }, { wch: 40 }];
    XLSX.utils.book_append_sheet(wb, ws7, "Applied Filters");

    const dateStr = new Date().toISOString().split("T")[0];
    XLSX.writeFile(wb, `Data_Analytics_${dateStr}.xlsx`);

    toast({
      title: "Export successful",
      description: `Downloaded as Data_Analytics_${dateStr}.xlsx`,
    });
  };

  return (
    <div className="space-y-8 pb-6">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm rounded-lg">
        <DashboardDrilldownHeader
          title="Data Analytics"
          description="Real-time data service performance and capacity insights"
          className="px-6 py-5"
          actions={
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium"
            >
              <Download className="w-4 h-4" />
              Export to Excel
            </button>
          }
        />
        <FilterPanel />
      </div>

      {/* KPI Cards - Top Row */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-4">Key Performance Indicators</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            label="Session Success Rate"
            value={kpis.session_success_rate.value.toFixed(2)}
            unit={kpis.session_success_rate.unit}
            change={kpis.session_success_rate.change}
            status={kpis.session_success_rate.status}
            icon={Wifi}
            priority="High"
            comparison="vs previous period"
          />
          <KPICard
            label="Average Speed"
            value={kpis.avg_speed.value}
            unit={kpis.avg_speed.unit}
            change={kpis.avg_speed.change}
            status={kpis.avg_speed.status}
            icon={Zap}
            priority="High"
            comparison="vs previous period"
          />
          <KPICard
            label="Average Latency"
            value={kpis.avg_latency.value.toFixed(2)}
            unit={kpis.avg_latency.unit}
            change={kpis.avg_latency.change}
            status={kpis.avg_latency.status}
            icon={Clock}
            comparison="vs previous period"
          />
          <KPICard
            label="Data Experience Index"
            value={kpis.data_experience_index.value.toFixed(2)}
            unit={kpis.data_experience_index.unit}
            change={kpis.data_experience_index.change}
            status={kpis.data_experience_index.status}
            icon={Gauge}
            priority="Critical"
            comparison="vs previous period"
          />
        </div>
      </div>

      {/* KPI Cards - Secondary Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Session Drop Rate"
          value={kpis.session_drop_rate.value.toFixed(2)}
          unit={kpis.session_drop_rate.unit}
          change={kpis.session_drop_rate.change}
          status={kpis.session_drop_rate.status}
          icon={AlertCircle}
          priority="High"
          comparison="vs previous period"
        />
        <KPICard
          label="Peak Speed"
          value={kpis.peak_speed.value}
          unit={kpis.peak_speed.unit}
          change={kpis.peak_speed.change}
          status={kpis.peak_speed.status}
          icon={TrendingUp}
          comparison="vs previous period"
        />
        <KPICard
          label="Packet Loss"
          value={kpis.packet_loss.value.toFixed(4)}
          unit={kpis.packet_loss.unit}
          change={kpis.packet_loss.change}
          status={kpis.packet_loss.status}
          icon={AlertCircle}
          comparison="vs previous period"
        />
        <KPICard
          label="Data Volume"
          value={kpis.data_volume.value}
          unit={kpis.data_volume.unit}
          change={kpis.data_volume.change}
          status={kpis.data_volume.status}
          icon={Activity}
          comparison="vs previous period"
        />
      </div>

      {/* Executive Insight Summary */}
      <ExecutiveInsightSummary
        title="Data Experience Index Summary"
        date={new Date().toISOString().split("T")[0]}
        insights={insights}
      />

      {/* Trend Charts */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Performance Trends</h2>
        </div>

        {/* Data Volume Trend & Speed & Latency Metrics - Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TrendChartContainer
            title="Data Volume Trend"
            data={trendData}
            dataKeys={["data_volume"]}
            exportable
            zoomable
            defaultChartType="line"
          />

          <TrendChartContainer
            title="Speed & Latency Metrics"
            data={trendData}
            dataKeys={["avg_speed", "avg_latency"]}
            exportable
            zoomable
            defaultChartType="line"
          />
        </div>

        {/* Data Experience Index Trend & Packet Loss Trend - Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TrendChartContainer
            title="Data Experience Index Trend"
            data={trendData}
            dataKeys={["dei"]}
            exportable
            zoomable
            defaultChartType="line"
          />

          <TrendChartContainer
            title="Packet Loss Trend"
            data={trendData}
            dataKeys={["packet_loss"]}
            exportable
            zoomable
            defaultChartType="line"
          />
        </div>
      </div>

      {/* Capacity & Congestion Indicators */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Capacity & Congestion</h2>
        </div>

        {/* Peak vs Off-Peak Comparison */}
        <div className="card-elevated rounded-xl border border-border/50 p-6">
          <h3 className="text-lg font-bold text-foreground mb-4">Peak vs Off-Peak Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-status-degraded/5 border border-status-degraded/20">
              <p className="text-sm font-semibold text-foreground mb-2">Peak Hours (9 AM - 5 PM)</p>
              <p className="text-2xl font-bold text-status-degraded mb-2">92.3 Mbps</p>
              <p className="text-xs text-muted-foreground">Avg Speed: +2.5% trend</p>
              <p className="text-xs text-muted-foreground">Latency: 52.3ms</p>
            </div>
            <div className="p-4 rounded-lg bg-status-healthy/5 border border-status-healthy/20">
              <p className="text-sm font-semibold text-foreground mb-2">
                Off-Peak Hours (6 PM - 8 AM)
              </p>
              <p className="text-2xl font-bold text-status-healthy mb-2">156.8 Mbps</p>
              <p className="text-xs text-muted-foreground">Avg Speed: +4.2% trend</p>
              <p className="text-xs text-muted-foreground">Latency: 28.1ms</p>
            </div>
            <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-900">
              <p className="text-sm font-semibold text-foreground dark:text-foreground mb-2">Capacity Stress</p>
              <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-400 mb-2">64%</p>
              <p className="text-xs text-muted-foreground dark:text-muted-foreground">Utilization during peak</p>
              <p className="text-xs text-muted-foreground dark:text-muted-foreground">Headroom: 36%</p>
            </div>
          </div>
        </div>

        {/* Congestion Hotspots - Ranked List */}
        <div className="card-elevated rounded-xl border border-border/50 p-6">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-foreground mb-4">Areas Under Capacity Stress</h3>

            {/* Use main filter panel */}
            <FilterPanel />
          </div>
          <div className="space-y-3">
            {stressAreas.length > 0 ? (
              stressAreas.map((item, idx) => (
              <div key={item.area} className="p-4 rounded-lg border border-border/50 hover:bg-muted/50">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-foreground">{item.area}</p>
                  <PriorityChip
                    priority={item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs mb-1">Utilization</p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={cn(
                          "h-2 rounded-full",
                          item.utilization > 80
                            ? "bg-red-500"
                            : item.utilization > 70
                              ? "bg-orange-500"
                              : "bg-yellow-500"
                        )}
                        style={{ width: `${item.utilization}%` }}
                      />
                    </div>
                    <p className="text-xs font-semibold mt-1">{item.utilization}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs mb-1">Speed</p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={cn(
                          "h-2 rounded-full",
                          item.speed > 80
                            ? "bg-green-500"
                            : item.speed > 60
                              ? "bg-yellow-500"
                              : "bg-red-500"
                        )}
                        style={{ width: `${item.speed}%` }}
                      />
                    </div>
                    <p className="text-xs font-semibold mt-1">{item.speed} Mbps</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs mb-1">Latency</p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={cn(
                          "h-2 rounded-full",
                          item.latency < 40
                            ? "bg-green-500"
                            : item.latency < 60
                              ? "bg-yellow-500"
                              : "bg-red-500"
                        )}
                        style={{ width: `${Math.min(item.latency, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs font-semibold mt-1">{item.latency}ms</p>
                  </div>
                </div>
              </div>
              ))
            ) : (
              <div className="p-4 rounded-lg border border-border/50 text-center text-muted-foreground">
                No capacity stress areas found for the selected filters.
              </div>
            )}
          </div>
        </div>

        {/* High Usage with Low Speed Indicators */}
        <div className="card-elevated rounded-xl border border-border/50 p-6">
          <h3 className="text-lg font-bold text-foreground mb-4">
            High Usage with Low Speed (Performance Risk)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                area: "South Region",
                volume: "High",
                speed: "Low",
                risk: "Critical",
                recommendation: "Scale capacity immediately",
              },
              {
                area: "East Cluster",
                volume: "High",
                speed: "Medium",
                risk: "High",
                recommendation: "Monitor closely for escalation",
              },
              {
                area: "3G Network",
                volume: "Medium",
                speed: "Low",
                risk: "Medium",
                recommendation: "Plan upgrade timeline",
              },
            ].map((item, idx) => (
              <div
                key={item.area}
                className={cn(
                  "p-4 rounded-lg border",
                  item.risk === "Critical"
                    ? "surface-destructive"
                    : item.risk === "High"
                      ? "bg-[hsl(var(--severity-high-surface))] text-[hsl(var(--severity-high-fg))] border-[hsl(var(--severity-high-border))]"
                      : "surface-warning"
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-current">{item.area}</p>
                    <p className="text-xs text-current/80 mt-1">
                      Data Volume: <span className="font-semibold">{item.volume}</span> | Speed:{" "}
                      <span className="font-semibold">{item.speed}</span>
                    </p>
                  </div>
                  <SeverityBadge severity={item.risk}>{item.risk}</SeverityBadge>
                </div>
                <p className="text-sm text-current">
                  <span className="font-semibold">Recommendation:</span> {item.recommendation}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Heatmaps: Time vs Region & Technology Capacity Stress - Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {/* Heatmap: Time vs Region Capacity Stress */}
          <div className="card-elevated rounded-xl border border-border/50 p-6 flex flex-col min-h-[430px] h-full">
            <h3 className="text-lg font-bold text-foreground mb-4">
              Capacity Stress by Time & Region (Heatmap)
            </h3>
            <div className="flex-1 flex flex-col justify-between gap-5">
              <div className="flex-1 min-w-0">
                <div className="w-full space-y-1">
                  {/* Column headers (Regions) */}
                  <div className="grid grid-cols-[4.5rem_repeat(5,minmax(0,1fr))] gap-2 mb-2">
                    <div></div>
                    {heatmapRegions.map((region) => (
                      <div
                        key={region}
                        className="text-center text-xs font-semibold text-muted-foreground"
                      >
                        {region}
                      </div>
                    ))}
                  </div>

                  {/* Heatmap rows */}
                  {timeRegionHeatmap.map((row) => (
                    <div key={row.name} className="grid grid-cols-[4.5rem_repeat(5,minmax(0,1fr))] gap-2">
                      <div className="text-xs font-semibold text-muted-foreground flex items-center">
                        {row.name}
                      </div>
                      {row.cells.map((cell, cellIdx) => {
                        return (
                          <div
                            key={`${row.name}-cell-${cellIdx}`}
                            className={cn(
                              "h-11 lg:h-12 rounded-md flex items-center justify-center text-xs lg:text-sm font-semibold text-gray-900 shadow-sm",
                              getHeatmapCellColor(cell.intensity)
                            )}
                            title={`${row.name} - ${cell.value.toFixed(1)}%`}
                          >
                            {cell.label}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="grid grid-cols-4 gap-2 text-[11px] lg:text-xs leading-none">
                  {heatmapLegendItems.map((item) => (
                    <div key={item.label} className="flex items-center justify-center gap-1.5 whitespace-nowrap">
                      <div className={cn("w-6 h-4 rounded-sm", item.colorClass)}></div>
                      <span className="text-muted-foreground">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Heatmap: Technology vs Capacity Stress */}
          <div className="card-elevated rounded-xl border border-border/50 p-6 flex flex-col min-h-[430px] h-full">
            <h3 className="text-lg font-bold text-foreground mb-4">
              Technology Performance by Region (Heatmap)
            </h3>
            <div className="flex-1 flex flex-col justify-between gap-5">
              <div className="flex-1 min-w-0">
                <div className="w-full space-y-1">
                  {/* Column headers (Regions) */}
                  <div className="grid grid-cols-[4.5rem_repeat(5,minmax(0,1fr))] gap-2 mb-2">
                    <div></div>
                    {heatmapRegions.map((region) => (
                      <div
                        key={region}
                        className="text-center text-xs font-semibold text-muted-foreground"
                      >
                        {region}
                      </div>
                    ))}
                  </div>

                  {/* Heatmap rows */}
                  {techCapacityHeatmap.map((row) => (
                    <div key={row.name} className="grid grid-cols-[4.5rem_repeat(5,minmax(0,1fr))] gap-2">
                      <div className="text-xs font-semibold text-muted-foreground flex items-center">
                        {row.name}
                      </div>
                      {row.cells.map((cell, cellIdx) => {
                        return (
                          <div
                            key={`${row.name}-cell-${cellIdx}`}
                            className={cn(
                              "h-11 lg:h-12 rounded-md flex items-center justify-center text-xs lg:text-sm font-semibold text-gray-900 shadow-sm",
                              getHeatmapCellColor(cell.intensity)
                            )}
                            title={`${row.name} - ${cell.value.toFixed(1)}%`}
                          >
                            {cell.label}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="grid grid-cols-4 gap-2 text-[11px] lg:text-xs leading-none">
                  {heatmapLegendItems.map((item) => (
                    <div key={item.label} className="flex items-center justify-center gap-1.5 whitespace-nowrap">
                      <div className={cn("w-6 h-4 rounded-sm", item.colorClass)}></div>
                      <span className="text-muted-foreground">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Heatmap: Hourly/Daily Utilization Pattern */}
        <div className="card-elevated rounded-xl border border-border/50 p-6 flex flex-col min-h-[420px]">
          {(() => {
            // Determine if showing hourly or daily based on date range
            const daysDiff = getDaysDifference(filters.dateRange);
            const isMultiDay = daysDiff > 1;
            const displayLabel = isMultiDay
              ? "Daily Utilization Pattern (Heatmap)"
              : "24-Hour Utilization Pattern (Heatmap)";

            // Generate column headers based on date range
            let columnHeaders: string[] = [];
            let tooltipPrefix = "";

            if (isMultiDay && filters.dateRange.from && filters.dateRange.to) {
              // Multi-day view - show days of month
              const fromDate = new Date(filters.dateRange.from);
              const toDate = new Date(filters.dateRange.to);
              const daysCount =
                Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

              for (let i = 0; i < daysCount && i < 31; i++) {
                const day = new Date(fromDate);
                day.setDate(day.getDate() + i);
                columnHeaders.push(String(day.getDate()).padStart(2, "0"));
              }
              tooltipPrefix = "Day";
            } else {
              // Single day or default - show hours
              columnHeaders = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
              tooltipPrefix = "Hour";
            }

            return (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-foreground">{displayLabel}</h3>
                  {!isMultiDay && (
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-semibold text-muted-foreground">Date:</label>
                      <input
                        type="date"
                        value={heatmapDate}
                        onChange={(e) => setHeatmapDate(e.target.value)}
                        className="px-3 py-1.5 rounded border border-border text-xs bg-background text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                        title="Select date for heatmap"
                      />
                    </div>
                  )}
                </div>
                <div className="flex-1 overflow-x-auto -mx-6 px-6">
                  <div className="w-full">
                    {/* Column headers */}
                    <div className="flex gap-0.5 mb-2">
                      <div className="w-14 sm:w-16 flex-shrink-0"></div>
                      {columnHeaders.map((header, colIdx) => (
                        <div
                          key={`header-${colIdx}`}
                          className="flex-1 min-w-0 text-center text-xs font-semibold text-muted-foreground dark:text-muted-foreground"
                        >
                          {header}
                        </div>
                      ))}
                    </div>

                    {/* Heatmap rows */}
                    {hourlyUtilizationHeatmap.map((row) => (
                      <div key={row.name} className="flex gap-0.5 mb-2">
                        <div className="w-14 sm:w-16 flex-shrink-0 text-xs font-semibold text-muted-foreground dark:text-muted-foreground flex items-center truncate">
                          {row.name}
                        </div>
                        {row.cells.slice(0, columnHeaders.length).map((cell, cellIdx) => {
                          const bgColor =
                            cell.intensity === "critical"
                              ? "bg-red-500 dark:bg-red-600"
                              : cell.intensity === "high"
                                ? "bg-orange-400 dark:bg-orange-500"
                                : cell.intensity === "medium"
                                  ? "bg-yellow-300 dark:bg-yellow-500"
                                  : "bg-green-400 dark:bg-green-600";

                          return (
                            <div
                              key={`${row.name}-cell-${cellIdx}`}
                              className={cn("flex-1 min-h-6 sm:min-h-8 rounded flex items-center justify-center", bgColor)}
                              title={`${row.name} ${tooltipPrefix} ${columnHeaders[cellIdx]} - ${cell.value.toFixed(1)}%`}
                            ></div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-center gap-2 sm:gap-4 mt-auto pt-6 text-xs flex-wrap">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <div className="w-4 h-3 sm:w-6 sm:h-4 rounded bg-green-400 dark:bg-green-600"></div>
                    <span>0-40%</span>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <div className="w-4 h-3 sm:w-6 sm:h-4 rounded bg-yellow-300 dark:bg-yellow-500"></div>
                    <span>40-60%</span>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <div className="w-4 h-3 sm:w-6 sm:h-4 rounded bg-orange-400 dark:bg-orange-500"></div>
                    <span>60-80%</span>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <div className="w-4 h-3 sm:w-6 sm:h-4 rounded bg-red-500 dark:bg-red-600"></div>
                    <span>80-100%</span>
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      </div>

      {/* Performance Breakdown */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Performance Breakdown</h2>
        </div>

        {/* Filter Context Info */}
        {(filters.technologies.length > 0 || filters.regions.length > 0) && (
          <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900">
            <p className="text-sm text-blue-900 dark:text-blue-300">
              <span className="font-semibold">Viewing results:</span>
              {filters.technologies.length > 0 &&
                ` Technologies: ${filters.technologies.join(", ")}`}
              {filters.regions.length > 0 && ` | Regions: ${filters.regions.join(", ")}`}
            </p>
          </div>
        )}

        {/* By Vendor & By Technology - Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* By Vendor */}
          <div className="card-elevated rounded-xl border border-border/50 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-foreground">By Vendor</h3>
              {filters.vendors.length > 0 && (
                <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
                  {filters.vendors.length} vendor{filters.vendors.length !== 1 ? "s" : ""} selected
                </span>
              )}
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={vendorBreakdown}
                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                maxBarSize={40}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="name"
                  stroke="hsl(var(--muted-foreground))"
                  style={{ fontSize: "12px" }}
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
                <Bar dataKey="call_success_rate" fill="#22c55e" name="Success Rate" />
                <Bar dataKey="call_stability" fill="#3b82f6" name="Stability" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* By Technology */}
          <div className="card-elevated rounded-xl border border-border/50 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-foreground">By Technology</h3>
              {filters.technologies.length > 0 && (
                <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">
                  {filters.technologies.length} technology
                  {filters.technologies.length !== 1 ? "s" : ""} selected
                </span>
              )}
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={techBreakdown}
                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                maxBarSize={40}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="name"
                  stroke="hsl(var(--muted-foreground))"
                  style={{ fontSize: "12px" }}
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
                <Bar dataKey="call_success_rate" fill="#22c55e" name="Success Rate" />
                <Bar dataKey="call_stability" fill="#3b82f6" name="Stability" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* By Region */}
        <div className="card-elevated rounded-xl border border-border/50 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-foreground">By Region</h3>
            {filters.regions.length > 0 && (
              <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 font-medium">
                {filters.regions.length} region{filters.regions.length !== 1 ? "s" : ""} selected
              </span>
            )}
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={regionBreakdown}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              maxBarSize={40}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="name"
                stroke="hsl(var(--muted-foreground))"
                style={{ fontSize: "12px" }}
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
              <Bar dataKey="call_success_rate" fill="#22c55e" name="Success Rate" />
              <Bar dataKey="call_stability" fill="#3b82f6" name="Stability" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Data Insights Section */}
      {dataInsights.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-foreground">Data Insights</h2>
          <div className="space-y-3">
            {dataInsights.map((insight) => {
              const severityColor =
                insight.severity === "Critical"
                  ? "surface-destructive"
                  : insight.severity === "High"
                    ? "bg-[hsl(var(--severity-high-surface))] text-[hsl(var(--severity-high-fg))] border border-[hsl(var(--severity-high-border))]"
                    : "surface-warning";

              return (
                <div key={insight.id} className={cn("p-4 rounded-lg border", severityColor)}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-semibold text-current">{insight.title}</p>
                      <p className="text-sm text-current/80 mt-1">{insight.description}</p>
                    </div>
                    <SeverityBadge
                      severity={insight.severity}
                      className="flex-shrink-0 ml-3"
                    >
                      {insight.severity}
                    </SeverityBadge>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-current/75">
                      {new Date(insight.timestamp).toLocaleTimeString()}
                    </span>
                    {insight.affectedFilters.length > 0 && (
                      <div className="flex items-center gap-1 flex-wrap">
                        <span className="text-xs text-current/75">Affected:</span>
                        {insight.affectedFilters.map((filter, idx) => (
                          <span
                            key={filter}
                            className="inline-flex items-center px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs"
                          >
                            {filter}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Vendor Comparison Section - Only show when multiple vendors selected */}
      {filters.vendors.length > 1 && (
        <div className="space-y-6">
          <div className="card-elevated rounded-xl border border-border/50 p-6">
            <h2 className="text-2xl font-bold text-foreground mb-4">Vendor Comparison</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Comparing {filters.vendors.length} vendors across selected regions and technologies
            </p>

            {/* Vendor Performance Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border">
                  <tr className="text-muted-foreground font-semibold">
                    <th className="text-left py-2 px-4">Vendor</th>
                    <th className="text-right py-2 px-4">Success Rate</th>
                    <th className="text-right py-2 px-4">Stability</th>
                    <th className="text-right py-2 px-4">Sessions</th>
                    <th className="text-center py-2 px-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {vendorBreakdown
                    .filter((v) => filters.vendors.includes(v.name))
                    .sort((a, b) => b.call_success_rate - a.call_success_rate)
                    .map((vendor, idx) => {
                      const performanceRank = idx + 1;
                      return (
                        <tr key={vendor.name} className="border-b border-border/50 hover:bg-muted/50">
                          <td className="py-2 px-4 font-medium">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                                #{performanceRank}
                              </div>
                              {vendor.name}
                            </div>
                          </td>
                          <td className="py-2 px-4 text-right font-semibold">
                            {vendor.call_success_rate.toFixed(2)}%
                          </td>
                          <td className="py-2 px-4 text-right font-semibold">
                            {vendor.call_stability.toFixed(2)}%
                          </td>
                          <td className="py-2 px-4 text-right">{vendor.count.toLocaleString()}</td>
                          <td className="py-2 px-4 text-center">
                            <StatusPill tone={getSuccessRateTone(vendor.call_success_rate)}>
                              {vendor.call_success_rate.toFixed(1)}%
                            </StatusPill>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>

            {/* Vendor Comparison Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-border/50">
              {(() => {
                const selectedVendors = vendorBreakdown.filter((v) =>
                  filters.vendors.includes(v.name)
                );
                const topPerformer = selectedVendors.reduce(
                  (prev, current) =>
                    prev.call_success_rate > current.call_success_rate ? prev : current,
                  selectedVendors[0]
                );
                const avgSuccessRate =
                  selectedVendors.reduce((sum, v) => sum + v.call_success_rate, 0) /
                  selectedVendors.length;
                const performanceGap =
                  Math.max(...selectedVendors.map((v) => v.call_success_rate)) -
                  Math.min(...selectedVendors.map((v) => v.call_success_rate));

                return (
                  <>
                    <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900">
                      <p className="text-sm text-muted-foreground dark:text-muted-foreground mb-2">Top Performer</p>
                      <p className="text-2xl font-bold text-green-700 dark:text-green-400">{topPerformer.name}</p>
                      <p className="text-xs text-muted-foreground dark:text-muted-foreground mt-2">
                        {topPerformer.call_success_rate.toFixed(2)}% success rate
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900">
                      <p className="text-sm text-muted-foreground dark:text-muted-foreground mb-2">Average Success Rate</p>
                      <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                        {avgSuccessRate.toFixed(2)}%
                      </p>
                      <p className="text-xs text-muted-foreground dark:text-muted-foreground mt-2">
                        Across all selected vendors
                      </p>
                    </div>
                    <div
                      className={`p-4 rounded-lg ${performanceGap > 3 ? "bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900" : "bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900"}`}
                    >
                      <p className="text-sm text-muted-foreground dark:text-muted-foreground mb-2">Performance Gap</p>
                      <p
                        className={`text-2xl font-bold ${performanceGap > 3 ? "text-orange-700 dark:text-orange-400" : "text-green-700 dark:text-green-400"}`}
                      >
                        {performanceGap.toFixed(2)}%
                      </p>
                      <p className="text-xs text-muted-foreground dark:text-muted-foreground mt-2">
                        {performanceGap > 3 ? "Significant variation detected" : "Good consistency"}
                      </p>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Segmentation & Grouping Section */}
      <div className="space-y-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Segmentation & Grouping</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Configure segmentation filters, grouping logic, and preview before applying.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-lg border border-violet-500/30 bg-violet-500/10 px-3 py-2 text-xs font-medium text-violet-700 dark:text-violet-300">
            Applied: {appliedSummary}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <div className="card-elevated rounded-xl border border-border/50 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">1. Segment Builder</h3>
              <button
                type="button"
                onClick={() =>
                  setSegmentRules((prev) => [
                    ...prev,
                    {
                      id: `rule-${Date.now()}`,
                      field: dimensionOptions[0],
                      operator: operatorOptions[0],
                      value: "",
                    },
                  ])
                }
                className="inline-flex items-center gap-1 rounded-md border border-violet-500/40 px-2.5 py-1.5 text-xs font-semibold text-violet-700 hover:bg-violet-500/10"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Dimension
              </button>
            </div>

            <div className="space-y-3">
              {segmentRules.map((rule, index) => (
                <div key={rule.id} className="rounded-lg border border-border/60 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-muted-foreground">Rule {index + 1}</p>
                    <button
                      type="button"
                      onClick={() => setSegmentRules((prev) => prev.filter((item) => item.id !== rule.id))}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    <select
                      value={rule.field}
                      onChange={(e) =>
                        setSegmentRules((prev) =>
                          prev.map((item) =>
                            item.id === rule.id ? { ...item, field: e.target.value } : item
                          )
                        )
                      }
                      className="rounded-md border border-border bg-background px-2.5 py-2 text-xs"
                    >
                      {dimensionOptions.map((dimension) => (
                        <option key={dimension} value={dimension}>
                          {dimension}
                        </option>
                      ))}
                    </select>
                    <select
                      value={rule.operator}
                      onChange={(e) =>
                        setSegmentRules((prev) =>
                          prev.map((item) =>
                            item.id === rule.id ? { ...item, operator: e.target.value } : item
                          )
                        )
                      }
                      className="rounded-md border border-border bg-background px-2.5 py-2 text-xs"
                    >
                      {operatorOptions.map((operator) => (
                        <option key={operator} value={operator}>
                          {operator}
                        </option>
                      ))}
                    </select>
                    <input
                      value={rule.value}
                      onChange={(e) =>
                        setSegmentRules((prev) =>
                          prev.map((item) =>
                            item.id === rule.id ? { ...item, value: e.target.value } : item
                          )
                        )
                      }
                      className="rounded-md border border-border bg-background px-2.5 py-2 text-xs"
                      placeholder="Value (or comma-separated values)"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground">Rule logic:</span>
              <button
                type="button"
                onClick={() => setSegmentLogic("AND")}
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs font-semibold border",
                  segmentLogic === "AND"
                    ? "border-violet-500/50 bg-violet-500/15 text-violet-700"
                    : "border-border text-muted-foreground"
                )}
              >
                AND
              </button>
              <button
                type="button"
                onClick={() => setSegmentLogic("OR")}
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs font-semibold border",
                  segmentLogic === "OR"
                    ? "border-violet-500/50 bg-violet-500/15 text-violet-700"
                    : "border-border text-muted-foreground"
                )}
              >
                OR
              </button>
            </div>

            <div className="space-y-2 pt-2 border-t border-border/50">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Saved segments</p>
              {savedSegments.map((segment) => (
                <div key={segment.id} className="rounded-md border border-border/50 p-2.5 space-y-2">
                  <p className="text-sm font-medium text-foreground">{segment.name}</p>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setSegmentName(segment.name);
                        setSegmentLogic(segment.logic);
                        setSegmentRules(segment.rules.map((rule) => ({ ...rule, id: `${rule.id}-${Date.now()}` })));
                      }}
                      className="rounded-md border border-border px-2 py-1 text-[11px] font-medium hover:bg-muted/40"
                    >
                      Load
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSegmentName(`${segment.name} (Edited)`);
                        setSegmentLogic(segment.logic);
                        setSegmentRules(segment.rules.map((rule) => ({ ...rule, id: `${rule.id}-edit-${Date.now()}` })));
                      }}
                      className="rounded-md border border-border px-2 py-1 text-[11px] font-medium hover:bg-muted/40"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setSavedSegments((prev) => [
                          ...prev,
                          { ...segment, id: `${segment.id}-copy-${Date.now()}`, name: `${segment.name} Copy` },
                        ])
                      }
                      className="rounded-md border border-border px-2 py-1 text-[11px] font-medium hover:bg-muted/40"
                    >
                      Duplicate
                    </button>
                    <button
                      type="button"
                      onClick={() => setSavedSegments((prev) => prev.filter((item) => item.id !== segment.id))}
                      className="rounded-md border border-border px-2 py-1 text-[11px] font-medium text-destructive hover:bg-destructive/10"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card-elevated rounded-xl border border-border/50 p-5 space-y-4">
            <h3 className="text-lg font-semibold text-foreground">2. Grouping Builder</h3>
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground">Group By (multi-level order)</p>
              <div className="space-y-2">
                {groupBy.map((field, index) => (
                  <div key={`${field}-${index}`} className="flex items-center gap-2 rounded-md border border-border/50 p-2">
                    <select
                      value={field}
                      onChange={(e) =>
                        setGroupBy((prev) => prev.map((item, idx) => (idx === index ? e.target.value : item)))
                      }
                      className="flex-1 rounded-md border border-border bg-background px-2 py-1.5 text-xs"
                    >
                      {groupingOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() =>
                        setGroupBy((prev) => {
                          if (index === 0) return prev;
                          const copy = [...prev];
                          [copy[index - 1], copy[index]] = [copy[index], copy[index - 1]];
                          return copy;
                        })
                      }
                      className="rounded border border-border px-1.5 py-1 text-muted-foreground hover:bg-muted/40"
                    >
                      <ChevronUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setGroupBy((prev) => {
                          if (index === prev.length - 1) return prev;
                          const copy = [...prev];
                          [copy[index + 1], copy[index]] = [copy[index], copy[index + 1]];
                          return copy;
                        })
                      }
                      className="rounded border border-border px-1.5 py-1 text-muted-foreground hover:bg-muted/40"
                    >
                      <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setGroupBy((prev) => [...prev, groupingOptions[prev.length % groupingOptions.length]])}
                className="text-xs font-medium text-violet-700 hover:underline"
              >
                + Add Group Level
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="space-y-1">
                <span className="text-xs font-semibold text-muted-foreground">Aggregation</span>
                <select
                  value={aggregationType}
                  onChange={(e) => setAggregationType(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-2.5 py-2 text-xs"
                >
                  {aggregationOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-1">
                <span className="text-xs font-semibold text-muted-foreground">Sort</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-2.5 py-2 text-xs"
                >
                  {sortingOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="space-y-1">
                <span className="text-xs font-semibold text-muted-foreground">View mode</span>
                <select
                  value={hierarchyMode}
                  onChange={(e) => setHierarchyMode(e.target.value as "Hierarchy" | "Flat")}
                  className="w-full rounded-md border border-border bg-background px-2.5 py-2 text-xs"
                >
                  <option value="Hierarchy">Hierarchy</option>
                  <option value="Flat">Flat</option>
                </select>
              </label>
              <label className="space-y-1">
                <span className="text-xs font-semibold text-muted-foreground">Top N</span>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={topN}
                  onChange={(e) => setTopN(Math.max(1, Number(e.target.value) || 1))}
                  className="w-full rounded-md border border-border bg-background px-2.5 py-2 text-xs"
                />
              </label>
            </div>
          </div>

          <div className="card-elevated rounded-xl border border-border/50 p-5 space-y-4">
            <h3 className="text-lg font-semibold text-foreground">3. Preview / Result</h3>
            <div className="rounded-lg border border-border/60 overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-muted/40">
                  <tr>
                    <th className="text-left px-3 py-2 font-semibold">Group</th>
                    <th className="text-right px-3 py-2 font-semibold">Count</th>
                    <th className="text-right px-3 py-2 font-semibold">Success Rate</th>
                    <th className="text-right px-3 py-2 font-semibold">Stability</th>
                    <th className="text-right px-3 py-2 font-semibold">Sessions</th>
                  </tr>
                </thead>
                <tbody>
                  {groupedPreview.map((row) => (
                    <tr key={row.group} className="border-t border-border/50">
                      <td className="px-3 py-2 text-foreground">{row.group}</td>
                      <td className="px-3 py-2 text-right">{row.count}</td>
                      <td className="px-3 py-2 text-right">{row.successRate.toFixed(1)}%</td>
                      <td className="px-3 py-2 text-right">{row.stability.toFixed(1)}%</td>
                      <td className="px-3 py-2 text-right">{row.sessions.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground">Distribution preview</p>
              <div className="space-y-2">
                {groupedPreview.map((row) => (
                  <div key={`${row.group}-bar`} className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span className="truncate pr-2">{row.group}</span>
                      <span>{row.count}</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted/60 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-violet-500"
                        style={{
                          width: `${Math.max(6, (row.count / Math.max(...groupedPreview.map((item) => item.count), 1)) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div className="rounded-md border border-violet-500/30 bg-violet-500/10 px-3 py-2">
                Coverage: <span className="font-semibold">{coveragePercent}%</span>
              </div>
              <div className="rounded-md border border-border/60 px-3 py-2">
                Groups: <span className="font-semibold">{groupedPreview.length}</span>
              </div>
              <div className="rounded-md border border-border/60 px-3 py-2">
                Levels: <span className="font-semibold">{groupBy.length}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-border/50 pt-4">
          <button
            type="button"
            onClick={() => {
              setAppliedSummary(`${segmentName || "Ad-hoc segment"} • ${groupBy.join(" > ")}`);
              toast({
                title: "Segmentation applied",
                description: `Applied ${segmentLogic} rules with ${groupBy.length} grouping levels.`,
              });
            }}
            className="inline-flex items-center gap-1.5 rounded-md bg-violet-600 px-3 py-2 text-xs font-semibold text-white hover:bg-violet-700"
          >
            Apply
          </button>
          <button
            type="button"
            onClick={() => {
              setSegmentRules(defaultRules);
              setSegmentLogic("AND");
              setGroupBy(["Region", "Cluster"]);
              setAggregationType("Count");
              setSortBy("By value");
              setHierarchyMode("Hierarchy");
              setTopN(4);
              setSegmentName("High Traffic Sites");
              toast({ title: "Configuration reset", description: "Defaults restored." });
            }}
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-xs font-semibold hover:bg-muted/40"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>
          <button
            type="button"
            onClick={() => {
              const newSegment = {
                id: `seg-${Date.now()}`,
                name: segmentName || `Segment ${savedSegments.length + 1}`,
                rules: segmentRules.map((rule) => ({ ...rule })),
                logic: segmentLogic,
              };
              setSavedSegments((prev) => [newSegment, ...prev]);
              toast({ title: "Segment saved", description: `${newSegment.name} added to saved list.` });
            }}
            className="inline-flex items-center gap-1.5 rounded-md border border-violet-500/40 px-3 py-2 text-xs font-semibold text-violet-700 hover:bg-violet-500/10"
          >
            <Save className="h-3.5 w-3.5" />
            Save Segment
          </button>
          <button
            type="button"
            onClick={() => {
              const payload = {
                segment: { name: segmentName || "Ad-hoc", logic: segmentLogic, rules: segmentRules },
                grouping: { groupBy, aggregationType, sortBy, hierarchyMode, topN },
              };
              const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.href = url;
              link.download = "segmentation-grouping-config.json";
              link.click();
              URL.revokeObjectURL(url);
              toast({ title: "Configuration exported", description: "JSON schema downloaded." });
            }}
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-xs font-semibold hover:bg-muted/40"
          >
            <Copy className="h-3.5 w-3.5" />
            Export Configuration
          </button>
          <input
            value={segmentName}
            onChange={(e) => setSegmentName(e.target.value)}
            className="ml-auto min-w-[180px] rounded-md border border-border bg-background px-2.5 py-2 text-xs"
            placeholder="Segment name"
          />
        </div>
      </div>

      {/* Data Performance Breakdown Details - Tables */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Data Performance Breakdown</h2>
        </div>

        {/* By Vendor & By Technology Tables - Stacked */}
        <div className="grid grid-cols-1 gap-6">
          {/* Vendor Breakdown Table */}
          <div className="card-elevated rounded-xl border border-border/50 p-6 overflow-x-auto">
            <h3 className="text-lg font-bold text-foreground mb-4">By Vendor</h3>
            <table className="w-full text-xs md:text-sm table-fixed">
              <colgroup>
                <col style={{ width: "30%" }} />
                <col style={{ width: "14%" }} />
                <col style={{ width: "14%" }} />
                <col style={{ width: "16%" }} />
                <col style={{ width: "16%" }} />
                <col style={{ width: "10%" }} />
              </colgroup>
              <thead>
                <tr className="border-b border-border text-muted-foreground font-semibold text-xs md:text-sm">
                  <th className="text-left py-3 px-2 md:px-4">Vendor</th>
                  <th className="text-right py-3 px-2 md:px-4">Sessions</th>
                  <th className="text-right py-3 px-2 md:px-4">Failures</th>
                  <th className="text-right py-3 px-2 md:px-4">Avg Speed</th>
                  <th className="text-right py-3 px-2 md:px-4">Avg Latency</th>
                  <th className="text-center py-3 px-2 md:px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {vendorBreakdown.map((vendor, idx) => {
                  const failureCount = Math.round((vendor.count * vendor.drop_rate) / 100);
                  return (
                    <tr key={vendor.name} className="border-b border-border/50 hover:bg-muted/50">
                      <td className="py-3 px-2 md:px-4 font-medium text-foreground text-left">{vendor.name}</td>
                      <td className="py-3 px-2 md:px-4 text-right text-foreground font-medium tabular-nums">{vendor.count.toLocaleString()}</td>
                      <td className="py-3 px-2 md:px-4 text-right text-foreground font-medium tabular-nums">{failureCount.toLocaleString()}</td>
                      <td className="py-3 px-2 md:px-4 text-right text-foreground font-medium tabular-nums">{avgSpeed.toFixed(2)} Mbps</td>
                      <td className="py-3 px-2 md:px-4 text-right text-foreground font-medium tabular-nums">{avgLatency.toFixed(2)} ms</td>
                      <td className="py-3 px-2 md:px-4 text-center">
                        <StatusPill tone={getSuccessRateTone(vendor.call_success_rate)}>
                          {vendor.call_success_rate.toFixed(2)}%
                        </StatusPill>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Technology Breakdown Table */}
          <div className="card-elevated rounded-xl border border-border/50 p-6 overflow-x-auto">
            <h3 className="text-lg font-bold text-foreground mb-4">By Technology</h3>
            <table className="w-full text-xs md:text-sm table-fixed">
              <colgroup>
                <col style={{ width: "30%" }} />
                <col style={{ width: "14%" }} />
                <col style={{ width: "14%" }} />
                <col style={{ width: "16%" }} />
                <col style={{ width: "16%" }} />
                <col style={{ width: "10%" }} />
              </colgroup>
              <thead>
                <tr className="border-b border-border text-muted-foreground font-semibold text-xs md:text-sm">
                  <th className="text-left py-3 px-2 md:px-4">Technology</th>
                  <th className="text-right py-3 px-2 md:px-4">Sessions</th>
                  <th className="text-right py-3 px-2 md:px-4">Failures</th>
                  <th className="text-right py-3 px-2 md:px-4">Avg Speed</th>
                  <th className="text-right py-3 px-2 md:px-4">Avg Latency</th>
                  <th className="text-center py-3 px-2 md:px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {techBreakdown.map((tech, idx) => {
                  const failureCount = Math.round((tech.count * tech.drop_rate) / 100);
                  return (
                    <tr key={tech.name} className="border-b border-border/50 hover:bg-muted/50">
                      <td className="py-3 px-2 md:px-4 font-medium text-foreground text-left">{tech.name}</td>
                      <td className="py-3 px-2 md:px-4 text-right text-foreground font-medium tabular-nums">{tech.count.toLocaleString()}</td>
                      <td className="py-3 px-2 md:px-4 text-right text-foreground font-medium tabular-nums">{failureCount.toLocaleString()}</td>
                      <td className="py-3 px-2 md:px-4 text-right text-foreground font-medium tabular-nums">{avgSpeed.toFixed(2)} Mbps</td>
                      <td className="py-3 px-2 md:px-4 text-right text-foreground font-medium tabular-nums">{avgLatency.toFixed(2)} ms</td>
                      <td className="py-3 px-2 md:px-4 text-center">
                        <StatusPill tone={getSuccessRateTone(tech.call_success_rate)}>
                          {tech.call_success_rate.toFixed(2)}%
                        </StatusPill>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Region and Cluster Tables - Stacked */}
        <div className="grid grid-cols-1 gap-6">
          {/* Region Breakdown Table */}
          <div className="card-elevated rounded-xl border border-border/50 p-6 overflow-x-auto">
            <h3 className="text-lg font-bold text-foreground mb-4">By Region</h3>
            <table className="w-full text-xs md:text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground font-semibold text-xs md:text-sm">
                  <th className="text-left py-3 px-2 md:px-4">Region</th>
                  <th className="text-right py-3 px-2 md:px-4">Sessions</th>
                  <th className="text-right py-3 px-2 md:px-4">Failures</th>
                  <th className="text-right py-3 px-2 md:px-4">Avg Speed</th>
                  <th className="text-right py-3 px-2 md:px-4">Avg Latency</th>
                  <th className="text-center py-3 px-2 md:px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {regionBreakdown.map((region, idx) => {
                  const failureCount = Math.round((region.count * region.drop_rate) / 100);
                  return (
                    <tr key={region.name} className="border-b border-border/50 hover:bg-muted/50">
                      <td className="py-3 px-2 md:px-4 font-medium text-foreground text-left">{region.name}</td>
                      <td className="py-3 px-2 md:px-4 text-right text-foreground font-medium tabular-nums">{region.count.toLocaleString()}</td>
                      <td className="py-3 px-2 md:px-4 text-right text-foreground font-medium tabular-nums">{failureCount.toLocaleString()}</td>
                      <td className="py-3 px-2 md:px-4 text-right text-foreground font-medium tabular-nums">{avgSpeed.toFixed(2)} Mbps</td>
                      <td className="py-3 px-2 md:px-4 text-right text-foreground font-medium tabular-nums">{avgLatency.toFixed(2)} ms</td>
                      <td className="py-3 px-2 md:px-4 text-center">
                        <StatusPill tone={getSuccessRateTone(region.call_success_rate)}>
                          {region.call_success_rate.toFixed(2)}%
                        </StatusPill>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Cluster Breakdown Table */}
          <div className="card-elevated rounded-xl border border-border/50 p-6 overflow-x-auto">
            <h3 className="text-lg font-bold text-foreground mb-4">By Cluster</h3>
            <table className="w-full text-xs md:text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground font-semibold text-xs md:text-sm">
                  <th className="text-left py-3 px-2 md:px-4">Cluster</th>
                  <th className="text-right py-3 px-2 md:px-4">Sessions</th>
                  <th className="text-right py-3 px-2 md:px-4">Failures</th>
                  <th className="text-right py-3 px-2 md:px-4">Avg Speed</th>
                  <th className="text-right py-3 px-2 md:px-4">Avg Latency</th>
                  <th className="text-center py-3 px-2 md:px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {clusterBreakdown.map((cluster, idx) => {
                  const failureCount = Math.round((cluster.count * cluster.drop_rate) / 100);
                  return (
                    <tr key={cluster.name} className="border-b border-border/50 hover:bg-muted/50">
                      <td className="py-3 px-2 md:px-4 font-medium text-foreground text-left">{cluster.name}</td>
                      <td className="py-3 px-2 md:px-4 text-right text-foreground font-medium tabular-nums">{cluster.count.toLocaleString()}</td>
                      <td className="py-3 px-2 md:px-4 text-right text-foreground font-medium tabular-nums">{failureCount.toLocaleString()}</td>
                      <td className="py-3 px-2 md:px-4 text-right text-foreground font-medium tabular-nums">{avgSpeed.toFixed(2)} Mbps</td>
                      <td className="py-3 px-2 md:px-4 text-right text-foreground font-medium tabular-nums">{avgLatency.toFixed(2)} ms</td>
                      <td className="py-3 px-2 md:px-4 text-center">
                        <StatusPill tone={getSuccessRateTone(cluster.call_success_rate)}>
                          {cluster.call_success_rate.toFixed(2)}%
                        </StatusPill>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Segmentation - Congested */}
      {vendorSegmented["Congested"] && vendorSegmented["Congested"].length > 0 && (
        <div className="card-elevated rounded-xl border border-border/50 p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-status-critical" />
            <h3 className="text-lg font-bold text-foreground">Congested Areas (Vendors)</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vendorSegmented["Congested"].map((vendor, idx) => (
              <div
                key={vendor.name}
                className="p-4 rounded-lg border border-status-critical/20 bg-status-critical/5"
              >
                <p className="font-semibold text-foreground">{vendor.name}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Success Rate: {vendor.call_success_rate.toFixed(2)}%
                </p>
                <p className="text-sm text-muted-foreground">
                  Stability: {vendor.call_stability.toFixed(2)}%
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Segmentation - Congested (Regions) */}
      {regionSegmented["Congested"] && regionSegmented["Congested"].length > 0 && (
        <div className="card-elevated rounded-xl border border-border/50 p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-status-critical" />
            <h3 className="text-lg font-bold text-foreground">Congested Areas (Regions)</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {regionSegmented["Congested"].map((region, idx) => (
              <div
                key={region.name}
                className="p-4 rounded-lg border border-status-critical/20 bg-status-critical/5"
              >
                <p className="font-semibold text-foreground">{region.name}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Success Rate: {region.call_success_rate.toFixed(2)}%
                </p>
                <p className="text-sm text-muted-foreground">
                  Stability: {region.call_stability.toFixed(2)}%
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
