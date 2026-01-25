import { useMemo } from "react";
import { Download } from "lucide-react";
import * as XLSX from "xlsx";
import {
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
import KPICard from "@/components/KPICard";
import ExecutiveInsightSummary, { type InsightData } from "@/components/ExecutiveInsightSummary";
import VoicePerformanceTable from "@/components/VoicePerformanceTable";
import DegradationInsights from "@/components/DegradationInsights";
import TrendChartContainer from "@/components/TrendChartContainer";
import SegmentationSummary from "@/components/SegmentationSummary";
import { useGlobalFilters } from "@/hooks/useGlobalFilters";
import { useToast } from "@/hooks/use-toast";
import {
  generateVoiceKPIs,
  generateVoiceTrendData,
  generateVoiceBreakdownByVendor,
  generateVoiceBreakdownByTechnology,
  generateVoiceBreakdownByRegion,
  generateVoiceBreakdownByCluster,
  segmentVoicePerformance,
  generateVoiceInsights,
  calculatePriorityLevel,
} from "@/utils/analyticsData";
import {
  Headphones,
  TrendingUp,
  Clock,
  Shield,
  Phone,
  Activity,
  Gauge,
} from "lucide-react";

export default function VoiceAnalytics() {
  const { toast } = useToast();
  const { filters } = useGlobalFilters();

  // Generate data
  const kpis = useMemo(() => generateVoiceKPIs(filters), [filters]);
  const trendData = useMemo(() => generateVoiceTrendData(filters), [filters]);
  const vendorBreakdown = useMemo(() => generateVoiceBreakdownByVendor(filters), [filters]);
  const techBreakdown = useMemo(() => generateVoiceBreakdownByTechnology(filters), [filters]);
  const regionBreakdown = useMemo(() => generateVoiceBreakdownByRegion(filters), [filters]);
  const clusterBreakdown = useMemo(() => generateVoiceBreakdownByCluster(filters), [filters]);

  // Segment data
  const vendorSegmented = useMemo(() => segmentVoicePerformance(vendorBreakdown), [vendorBreakdown]);
  const techSegmented = useMemo(() => segmentVoicePerformance(techBreakdown), [techBreakdown]);
  const regionSegmented = useMemo(() => segmentVoicePerformance(regionBreakdown), [regionBreakdown]);
  const clusterSegmented = useMemo(() => segmentVoicePerformance(clusterBreakdown), [clusterBreakdown]);

  // Generate degradation insights
  const degradationInsights = useMemo(() => {
    return generateVoiceInsights(
      trendData,
      {
        vendor: vendorBreakdown,
        technology: techBreakdown,
        region: regionBreakdown,
        cluster: clusterBreakdown,
      },
      filters
    );
  }, [trendData, vendorBreakdown, techBreakdown, regionBreakdown, clusterBreakdown, filters]);

  // Generate insights
  const insights: InsightData = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return {
      overall: {
        change: 1.17,
        status: "Improved",
      },
      byTechnology: [
        { name: "5G", change: 2.1, status: "Improved" },
        { name: "4G", change: 0.5, status: "No change" },
        { name: "3G", change: -0.8, status: "Degraded" },
      ],
      byRegion: [
        { name: "North", change: 1.5, status: "Improved" },
        { name: "South", change: -0.3, status: "Degraded" },
        { name: "East", change: 0.8, status: "Improved" },
      ],
    };
  }, []);

  const handleExport = () => {
    const wb = XLSX.utils.book_new();

    // Sheet 1: KPI Summary
    const kpiData = [
      ["KPI", "Value", "Unit", "Change", "Status"],
      ["Call Success Rate", kpis.call_success_rate.value, "%", "+1.2%", "Healthy"],
      ["Call Drop Rate", kpis.call_drop_rate.value, "%", "-0.15%", "Healthy"],
      ["Call Stability", kpis.call_stability.value, "%", "+0.8%", "Healthy"],
      ["Service Availability", kpis.service_availability.value, "%", "+0.05%", "Healthy"],
      ["Avg Call Duration", kpis.avg_call_duration.value, "sec", "+2.1%", "Healthy"],
      ["Call Volume", kpis.call_volume.value, "calls", "+5.3%", "Healthy"],
      ["Voice Quality Index", kpis.voice_quality_index.value, "/10", "+1.17%", "Healthy"],
    ];

    const ws1 = XLSX.utils.aoa_to_sheet(kpiData);
    ws1["!cols"] = [{ wch: 25 }, { wch: 15 }, { wch: 10 }, { wch: 10 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, ws1, "KPI Summary");

    // Sheet 2: Trend Data (All 8 metrics)
    const trendSheetData = [
      ["Time", "Call Volume", "Success Rate", "Drop Rate", "Stability", "CRR", "Call Continuity", "VQI", "VPI", "VSQI"],
      ...trendData.map((d) => [
        d.time,
        d.call_volume,
        d.call_success_rate.toFixed(2),
        d.drop_rate.toFixed(2),
        d.call_stability.toFixed(2),
        d.crr.toFixed(2),
        d.call_continuity.toFixed(2),
        d.vqi.toFixed(2),
        d.vpi.toFixed(2),
        d.vsqi.toFixed(2),
      ]),
    ];

    const ws2 = XLSX.utils.aoa_to_sheet(trendSheetData);
    ws2["!cols"] = Array(10).fill({ wch: 15 });
    XLSX.utils.book_append_sheet(wb, ws2, "Trend Data");

    // Sheet 3: Vendor Breakdown
    const vendorData = [
      ["Vendor", "Call Success Rate", "Drop Rate", "Stability", "Status", "Volume"],
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
      ["Technology", "Call Success Rate", "Drop Rate", "Stability", "Status", "Volume"],
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
      ["Region", "Call Success Rate", "Drop Rate", "Stability", "Status", "Volume"],
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
      ["Cluster", "Call Success Rate", "Drop Rate", "Stability", "Status", "Volume"],
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

    // Sheet 7: Degradation Insights
    const insightsData = [
      ["Type", "Title", "Description", "Timestamp", "Severity", "Affected Filters"],
      ...degradationInsights.map((insight) => [
        insight.type,
        insight.title,
        insight.description,
        insight.timestamp,
        insight.severity,
        insight.affectedFilters.join(", "),
      ]),
    ];

    const ws7 = XLSX.utils.aoa_to_sheet(insightsData);
    ws7["!cols"] = [{ wch: 20 }, { wch: 30 }, { wch: 40 }, { wch: 20 }, { wch: 10 }, { wch: 30 }];
    XLSX.utils.book_append_sheet(wb, ws7, "Insights");

    // Sheet 8: Applied Filters
    const filtersData = [
      ["Filter Type", "Values"],
      ["Vendors", filters.vendors.join(", ") || "All"],
      ["Technologies", filters.technologies.join(", ") || "All"],
      ["Regions", filters.regions.join(", ") || "All"],
      ["Clusters", filters.clusters.join(", ") || "All"],
      ["Countries", filters.countries.join(", ") || "All"],
      [
        "Date Range",
        filters.dateRange.from && filters.dateRange.to
          ? `${new Date(filters.dateRange.from).toLocaleDateString()} - ${new Date(filters.dateRange.to).toLocaleDateString()}`
          : "All Time",
      ],
      ["Time Granularity", filters.timeGranularity],
    ];

    const ws8 = XLSX.utils.aoa_to_sheet(filtersData);
    ws8["!cols"] = [{ wch: 20 }, { wch: 40 }];
    XLSX.utils.book_append_sheet(wb, ws8, "Applied Filters");

    const dateStr = new Date().toISOString().split("T")[0];
    XLSX.writeFile(wb, `Voice_Analytics_${dateStr}.xlsx`);

    toast({
      title: "Export successful",
      description: `Downloaded as Voice_Analytics_${dateStr}.xlsx`,
    });
  };

  return (
    <div className="space-y-8 pb-6">
      {/* Header */}
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold text-foreground">Voice Analytics</h1>
            <p className="text-muted-foreground">
              Real-time voice service performance and quality insights
            </p>
          </div>
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium"
          >
            <Download className="w-4 h-4" />
            Export to Excel
          </button>
        </div>

        {/* Global Filter Panel */}
        <FilterPanel />
      </div>

      {/* Drill-Down Flow Guide - Scannable Structure */}
      <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 flex flex-wrap items-center justify-between gap-3 text-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-blue-900 dark:text-blue-100">Flow: </span>
          <span className="text-blue-800 dark:text-blue-200">Summary (KPIs)</span>
          <span className="text-blue-400">→</span>
          <span className="text-blue-800 dark:text-blue-200">Insights</span>
          <span className="text-blue-400">→</span>
          <span className="text-blue-800 dark:text-blue-200">Breakdown</span>
          <span className="text-blue-400">→</span>
          <span className="text-blue-800 dark:text-blue-200">Trends</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-4">Key Performance Indicators</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            label="Call Success Rate"
            value={kpis.call_success_rate.value.toFixed(2)}
            unit={kpis.call_success_rate.unit}
            change={kpis.call_success_rate.change}
            status={kpis.call_success_rate.status}
            icon={Phone}
            priority="High"
            comparison="vs previous period"
          />
          <KPICard
            label="Call Drop Rate"
            value={kpis.call_drop_rate.value.toFixed(2)}
            unit={kpis.call_drop_rate.unit}
            change={kpis.call_drop_rate.change}
            status={kpis.call_drop_rate.status}
            icon={TrendingUp}
            comparison="vs previous period"
          />
          <KPICard
            label="Service Availability"
            value={kpis.service_availability.value.toFixed(2)}
            unit={kpis.service_availability.unit}
            change={kpis.service_availability.change}
            status={kpis.service_availability.status}
            icon={Shield}
            priority="Critical"
            comparison="vs previous period"
          />
          <KPICard
            label="Voice Quality Index"
            value={kpis.voice_quality_index.value.toFixed(2)}
            unit={kpis.voice_quality_index.unit}
            change={kpis.voice_quality_index.change}
            status={kpis.voice_quality_index.status}
            icon={Gauge}
            comparison="vs previous period"
          />
        </div>
      </div>

      {/* Secondary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KPICard
          label="Call Stability"
          value={kpis.call_stability.value.toFixed(2)}
          unit={kpis.call_stability.unit}
          change={kpis.call_stability.change}
          status={kpis.call_stability.status}
          icon={Activity}
          comparison="vs previous period"
        />
        <KPICard
          label="Avg Call Duration"
          value={kpis.avg_call_duration.value}
          unit={kpis.avg_call_duration.unit}
          change={kpis.avg_call_duration.change}
          status={kpis.avg_call_duration.status}
          icon={Clock}
          comparison="vs previous period"
        />
        <KPICard
          label="Call Volume"
          value={(kpis.call_volume.value as number).toLocaleString()}
          unit={kpis.call_volume.unit}
          change={kpis.call_volume.change}
          status={kpis.call_volume.status}
          icon={Headphones}
          comparison="vs previous period"
        />
      </div>

      {/* Executive Insight Summary */}
      <ExecutiveInsightSummary
        title="Voice Quality Index Summary"
        date={new Date().toISOString().split("T")[0]}
        insights={insights}
      />

      {/* Degradation Insights */}
      {degradationInsights.length > 0 && (
        <DegradationInsights insights={degradationInsights} />
      )}

      {/* Trend Charts */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Performance Trends</h2>
          <p className="text-sm text-muted-foreground mt-2">How metrics are trending over time</p>
        </div>

        {/* Call Volume Trend */}
        <TrendChartContainer
          title="Call Volume Trend"
          data={trendData}
          dataKeys={["call_volume"]}
          exportable
          zoomable
          defaultChartType="line"
        />

        {/* Call Success Rate Trend */}
        <TrendChartContainer
          title="Call Success Rate Trend"
          data={trendData}
          dataKeys={["call_success_rate"]}
          exportable
          zoomable
          defaultChartType="line"
        />

        {/* Drop Rate Trend */}
        <TrendChartContainer
          title="Drop Rate Trend"
          data={trendData}
          dataKeys={["drop_rate"]}
          exportable
          zoomable
          defaultChartType="line"
        />

        {/* Call Retainability Rate (CRR) */}
        <TrendChartContainer
          title="Call Retainability Rate (CRR)"
          data={trendData}
          dataKeys={["crr"]}
          exportable
          zoomable
          defaultChartType="line"
        />

        {/* Call Continuity Trend */}
        <TrendChartContainer
          title="Call Continuity Trend"
          data={trendData}
          dataKeys={["call_continuity"]}
          exportable
          zoomable
          defaultChartType="line"
        />

        {/* Voice Quality Index (VQI) Trend */}
        <TrendChartContainer
          title="Voice Quality Index (VQI) Trend"
          data={trendData}
          dataKeys={["vqi"]}
          exportable
          zoomable
          defaultChartType="line"
        />

        {/* Voice Performance Index (VPI) Trend */}
        <TrendChartContainer
          title="Voice Performance Index (VPI) Trend"
          data={trendData}
          dataKeys={["vpi"]}
          exportable
          zoomable
          defaultChartType="line"
        />

        {/* Voice Service Quality Index (VSQI) Trend */}
        <TrendChartContainer
          title="Voice Service Quality Index (VSQI) Trend"
          data={trendData}
          dataKeys={["vsqi"]}
          exportable
          zoomable
          defaultChartType="line"
        />
      </div>

      {/* Performance Breakdown */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Performance Breakdown</h2>
          <p className="text-sm text-muted-foreground mt-2">Compare performance across vendors, technologies, and regions</p>
        </div>

        {/* By Vendor - Comparison */}
        <div className="card-elevated rounded-xl border border-border/50 p-6">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-foreground">By Vendor - Performance Comparison</h3>
            <p className="text-sm text-muted-foreground mt-1">Grouped bar chart comparing key metrics across vendors</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={vendorBreakdown}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
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
              <Bar dataKey="call_success_rate" fill="#22c55e" name="Success Rate %" />
              <Bar dataKey="call_stability" fill="#3b82f6" name="Stability %" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* By Vendor - Contribution */}
        <div className="card-elevated rounded-xl border border-border/50 p-6">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-foreground">By Vendor - Call Volume Contribution</h3>
            <p className="text-sm text-muted-foreground mt-1">Stacked bar chart showing each vendor's contribution to total call volume</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={[
                {
                  name: "Call Volume Distribution",
                  ...vendorBreakdown.reduce(
                    (acc, vendor) => ({
                      ...acc,
                      [vendor.name]: vendor.count,
                    }),
                    {}
                  ),
                },
              ]}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" stroke="hsl(var(--muted-foreground))" style={{ fontSize: "12px" }} />
              <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" style={{ fontSize: "12px" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              {vendorBreakdown.map((vendor, idx) => (
                <Bar
                  key={vendor.name}
                  dataKey={vendor.name}
                  stackId="a"
                  fill={["#22c55e", "#3b82f6", "#f59e0b", "#ef4444"][idx % 4]}
                  name={vendor.name}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* By Technology - Comparison */}
        <div className="card-elevated rounded-xl border border-border/50 p-6">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-foreground">By Technology - Performance Comparison</h3>
            <p className="text-sm text-muted-foreground mt-1">Grouped bar chart comparing key metrics across technologies</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={techBreakdown}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
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
              <Bar dataKey="call_success_rate" fill="#22c55e" name="Success Rate %" />
              <Bar dataKey="call_stability" fill="#3b82f6" name="Stability %" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* By Technology - Contribution */}
        <div className="card-elevated rounded-xl border border-border/50 p-6">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-foreground">By Technology - Call Volume Contribution</h3>
            <p className="text-sm text-muted-foreground mt-1">Stacked bar chart showing each technology's contribution to total call volume</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={[
                {
                  name: "Call Volume Distribution",
                  ...techBreakdown.reduce(
                    (acc, tech) => ({
                      ...acc,
                      [tech.name]: tech.count,
                    }),
                    {}
                  ),
                },
              ]}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" stroke="hsl(var(--muted-foreground))" style={{ fontSize: "12px" }} />
              <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" style={{ fontSize: "12px" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              {techBreakdown.map((tech, idx) => (
                <Bar
                  key={tech.name}
                  dataKey={tech.name}
                  stackId="a"
                  fill={["#22c55e", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"][idx % 5]}
                  name={tech.name}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* By Region */}
        <VoicePerformanceTable
          data={regionBreakdown.map((r) => ({
            name: r.name,
            calls: r.count,
            drop_rate: r.drop_rate,
            success_rate: r.call_success_rate,
            stability: r.call_stability,
            status: r.status,
            priority: r.priority,
          }))}
          title="Regional Performance"
          dimension="Region"
        />

        {/* By Cluster */}
        <VoicePerformanceTable
          data={clusterBreakdown.map((c) => ({
            name: c.name,
            calls: c.count,
            drop_rate: c.drop_rate,
            success_rate: c.call_success_rate,
            stability: c.call_stability,
            status: c.status,
            priority: c.priority,
          }))}
          title="Cluster Performance"
          dimension="Cluster"
        />
      </div>

      {/* Segmentation & Grouping Section */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground">Segmentation & Grouping</h2>
        <p className="text-sm text-muted-foreground">
          Entities automatically grouped into 4 categories: High Quality, Acceptable, Degraded, and Critical.
          This helps quickly separate system-wide issues from local issues.
        </p>

        {/* Vendor Segmentation Summary */}
        <div>
          <h3 className="text-lg font-bold text-foreground mb-4">Vendor Performance Categories</h3>
          <SegmentationSummary data={vendorSegmented} dimension="Vendor" />
        </div>

        {/* Technology Segmentation Summary */}
        <div>
          <h3 className="text-lg font-bold text-foreground mb-4">Technology Performance Categories</h3>
          <SegmentationSummary data={techSegmented} dimension="Technology" />
        </div>

        {/* Region Segmentation Summary */}
        <div>
          <h3 className="text-lg font-bold text-foreground mb-4">Region Performance Categories</h3>
          <SegmentationSummary data={regionSegmented} dimension="Region" />
        </div>

        {/* Cluster Segmentation Summary */}
        <div>
          <h3 className="text-lg font-bold text-foreground mb-4">Cluster Performance Categories</h3>
          <SegmentationSummary data={clusterSegmented} dimension="Cluster" />
        </div>

        {/* Vendor Segmentation Overview */}
        <div className="card-elevated rounded-xl border border-border/50 p-6">
          <h3 className="text-lg font-bold text-foreground mb-4">Vendor Segmentation Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={[
                {
                  category: "Vendor Distribution",
                  "High quality": vendorSegmented["High quality"]?.length || 0,
                  "Acceptable": vendorSegmented["Acceptable"]?.length || 0,
                  "Degraded": vendorSegmented["Degraded"]?.length || 0,
                  "Critical": vendorSegmented["Critical"]?.length || 0,
                },
              ]}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" stroke="hsl(var(--muted-foreground))" style={{ fontSize: "12px" }} />
              <YAxis dataKey="category" type="category" stroke="hsl(var(--muted-foreground))" style={{ fontSize: "12px" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Bar dataKey="High quality" stackId="a" fill="#22c55e" name="High Quality" />
              <Bar dataKey="Acceptable" stackId="a" fill="#f59e0b" name="Acceptable" />
              <Bar dataKey="Degraded" stackId="a" fill="#ef4444" name="Degraded" />
              <Bar dataKey="Critical" stackId="a" fill="#7f1d1d" name="Critical" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Technology Segmentation Overview */}
        <div className="card-elevated rounded-xl border border-border/50 p-6">
          <h3 className="text-lg font-bold text-foreground mb-4">Technology Segmentation Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={[
                {
                  category: "Technology Distribution",
                  "High quality": techSegmented["High quality"]?.length || 0,
                  "Acceptable": techSegmented["Acceptable"]?.length || 0,
                  "Degraded": techSegmented["Degraded"]?.length || 0,
                  "Critical": techSegmented["Critical"]?.length || 0,
                },
              ]}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" stroke="hsl(var(--muted-foreground))" style={{ fontSize: "12px" }} />
              <YAxis dataKey="category" type="category" stroke="hsl(var(--muted-foreground))" style={{ fontSize: "12px" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Bar dataKey="High quality" stackId="a" fill="#22c55e" name="High Quality" />
              <Bar dataKey="Acceptable" stackId="a" fill="#f59e0b" name="Acceptable" />
              <Bar dataKey="Degraded" stackId="a" fill="#ef4444" name="Degraded" />
              <Bar dataKey="Critical" stackId="a" fill="#7f1d1d" name="Critical" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Region Segmentation Overview */}
        <div className="card-elevated rounded-xl border border-border/50 p-6">
          <h3 className="text-lg font-bold text-foreground mb-4">Region Segmentation Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={[
                {
                  category: "Region Distribution",
                  "High quality": regionSegmented["High quality"]?.length || 0,
                  "Acceptable": regionSegmented["Acceptable"]?.length || 0,
                  "Degraded": regionSegmented["Degraded"]?.length || 0,
                  "Critical": regionSegmented["Critical"]?.length || 0,
                },
              ]}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" stroke="hsl(var(--muted-foreground))" style={{ fontSize: "12px" }} />
              <YAxis dataKey="category" type="category" stroke="hsl(var(--muted-foreground))" style={{ fontSize: "12px" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Bar dataKey="High quality" stackId="a" fill="#22c55e" name="High Quality" />
              <Bar dataKey="Acceptable" stackId="a" fill="#f59e0b" name="Acceptable" />
              <Bar dataKey="Degraded" stackId="a" fill="#ef4444" name="Degraded" />
              <Bar dataKey="Critical" stackId="a" fill="#7f1d1d" name="Critical" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Cluster Segmentation Overview */}
        <div className="card-elevated rounded-xl border border-border/50 p-6">
          <h3 className="text-lg font-bold text-foreground mb-4">Cluster Segmentation Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={[
                {
                  category: "Cluster Distribution",
                  "High quality": clusterSegmented["High quality"]?.length || 0,
                  "Acceptable": clusterSegmented["Acceptable"]?.length || 0,
                  "Degraded": clusterSegmented["Degraded"]?.length || 0,
                  "Critical": clusterSegmented["Critical"]?.length || 0,
                },
              ]}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" stroke="hsl(var(--muted-foreground))" style={{ fontSize: "12px" }} />
              <YAxis dataKey="category" type="category" stroke="hsl(var(--muted-foreground))" style={{ fontSize: "12px" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Bar dataKey="High quality" stackId="a" fill="#22c55e" name="High Quality" />
              <Bar dataKey="Acceptable" stackId="a" fill="#f59e0b" name="Acceptable" />
              <Bar dataKey="Degraded" stackId="a" fill="#ef4444" name="Degraded" />
              <Bar dataKey="Critical" stackId="a" fill="#7f1d1d" name="Critical" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Segmentation Category Details - Vendor */}
      {Object.entries(vendorSegmented).map(([category, items]) =>
        items && items.length > 0 ? (
          <div key={`vendor-${category}`} className="card-elevated rounded-xl border border-border/50 p-6">
            <div className="flex items-center gap-2 mb-4">
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor:
                    category === "High quality"
                      ? "rgb(34, 197, 94)"
                      : category === "Acceptable"
                        ? "rgb(245, 158, 11)"
                        : category === "Degraded"
                          ? "rgb(239, 68, 68)"
                          : "rgb(59, 130, 246)",
                }}
              />
              <h3 className="text-lg font-bold text-foreground">{category} Performers - Vendors</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((vendor, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-lg border ${
                    category === "High quality"
                      ? "border-status-healthy/20 bg-status-healthy/5"
                      : category === "Critical"
                        ? "border-status-critical/20 bg-status-critical/5"
                        : "border-status-degraded/20 bg-status-degraded/5"
                  }`}
                >
                  <p className="font-semibold text-foreground">{vendor.name}</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Success Rate: {vendor.call_success_rate.toFixed(2)}%
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Stability: {vendor.call_stability.toFixed(2)}%
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Calls: {vendor.count.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : null
      )}

      {/* Segmentation Sections - Technology */}
      {Object.entries(techSegmented).map(([category, items]) =>
        items && items.length > 0 ? (
          <div key={`tech-${category}`} className="card-elevated rounded-xl border border-border/50 p-6">
            <div className="flex items-center gap-2 mb-4">
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor:
                    category === "High quality"
                      ? "rgb(34, 197, 94)"
                      : category === "Acceptable"
                        ? "rgb(245, 158, 11)"
                        : category === "Degraded"
                          ? "rgb(239, 68, 68)"
                          : "rgb(59, 130, 246)",
                }}
              />
              <h3 className="text-lg font-bold text-foreground">{category} Performers - Technologies</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((tech, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-lg border ${
                    category === "High quality"
                      ? "border-status-healthy/20 bg-status-healthy/5"
                      : category === "Critical"
                        ? "border-status-critical/20 bg-status-critical/5"
                        : "border-status-degraded/20 bg-status-degraded/5"
                  }`}
                >
                  <p className="font-semibold text-foreground">{tech.name}</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Success Rate: {tech.call_success_rate.toFixed(2)}%
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Stability: {tech.call_stability.toFixed(2)}%
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Calls: {tech.count.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : null
      )}

      {/* Segmentation Sections - Region */}
      {Object.entries(regionSegmented).map(([category, items]) =>
        items && items.length > 0 ? (
          <div key={`region-${category}`} className="card-elevated rounded-xl border border-border/50 p-6">
            <div className="flex items-center gap-2 mb-4">
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor:
                    category === "High quality"
                      ? "rgb(34, 197, 94)"
                      : category === "Acceptable"
                        ? "rgb(245, 158, 11)"
                        : category === "Degraded"
                          ? "rgb(239, 68, 68)"
                          : "rgb(59, 130, 246)",
                }}
              />
              <h3 className="text-lg font-bold text-foreground">{category} Performers - Regions</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((region, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-lg border ${
                    category === "High quality"
                      ? "border-status-healthy/20 bg-status-healthy/5"
                      : category === "Critical"
                        ? "border-status-critical/20 bg-status-critical/5"
                        : "border-status-degraded/20 bg-status-degraded/5"
                  }`}
                >
                  <p className="font-semibold text-foreground">{region.name}</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Success Rate: {region.call_success_rate.toFixed(2)}%
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Stability: {region.call_stability.toFixed(2)}%
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Calls: {region.count.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : null
      )}

      {/* Segmentation Sections - Cluster */}
      {Object.entries(clusterSegmented).map(([category, items]) =>
        items && items.length > 0 ? (
          <div key={`cluster-${category}`} className="card-elevated rounded-xl border border-border/50 p-6">
            <div className="flex items-center gap-2 mb-4">
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor:
                    category === "High quality"
                      ? "rgb(34, 197, 94)"
                      : category === "Acceptable"
                        ? "rgb(245, 158, 11)"
                        : category === "Degraded"
                          ? "rgb(239, 68, 68)"
                          : "rgb(59, 130, 246)",
                }}
              />
              <h3 className="text-lg font-bold text-foreground">{category} Performers - Clusters</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((cluster, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-lg border ${
                    category === "High quality"
                      ? "border-status-healthy/20 bg-status-healthy/5"
                      : category === "Critical"
                        ? "border-status-critical/20 bg-status-critical/5"
                        : "border-status-degraded/20 bg-status-degraded/5"
                  }`}
                >
                  <p className="font-semibold text-foreground">{cluster.name}</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Success Rate: {cluster.call_success_rate.toFixed(2)}%
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Stability: {cluster.call_stability.toFixed(2)}%
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Calls: {cluster.count.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : null
      )}
    </div>
  );
}
