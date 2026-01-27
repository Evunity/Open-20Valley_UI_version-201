import { useMemo } from "react";
import { Link } from "react-router-dom";
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
import { Headphones, TrendingUp, Clock, Shield, Phone, Activity, Gauge } from "lucide-react";

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
  const vendorSegmented = useMemo(
    () => segmentVoicePerformance(vendorBreakdown),
    [vendorBreakdown]
  );
  const techSegmented = useMemo(() => segmentVoicePerformance(techBreakdown), [techBreakdown]);
  const regionSegmented = useMemo(
    () => segmentVoicePerformance(regionBreakdown),
    [regionBreakdown]
  );
  const clusterSegmented = useMemo(
    () => segmentVoicePerformance(clusterBreakdown),
    [clusterBreakdown]
  );

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
      [
        "Time",
        "Call Volume",
        "Success Rate",
        "Drop Rate",
        "Stability",
        "CRR",
        "Call Continuity",
        "VQI",
        "VPI",
        "VSQI",
      ],
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
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-sm">
        <Link to="/" className="text-primary hover:text-primary/80 transition-colors font-medium">
          Dashboard
        </Link>
        <span className="text-muted-foreground">/</span>
        <span className="text-muted-foreground">Voice Analytics</span>
      </div>

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
      {degradationInsights.length > 0 && <DegradationInsights insights={degradationInsights} />}

      {/* Trend Charts */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Performance Trends</h2>
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
        </div>

        {/* By Vendor - Contribution & By Technology - Performance Comparison - Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* By Vendor - Contribution */}
          <div className="card-elevated rounded-xl border border-border/50 p-6">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-foreground">
                By Vendor - Call Volume Contribution
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Stacked bar chart showing each vendor's contribution to total call volume
              </p>
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
                <XAxis
                  type="number"
                  stroke="hsl(var(--muted-foreground))"
                  style={{ fontSize: "12px" }}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  stroke="hsl(var(--muted-foreground))"
                  style={{ fontSize: "12px" }}
                />
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

          {/* By Technology - Performance Comparison */}
          <div className="card-elevated rounded-xl border border-border/50 p-6">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-foreground">
                By Technology - Performance Comparison
              </h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={techBreakdown} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
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
        </div>

        {/* By Vendor - Comparison */}
        <div className="card-elevated rounded-xl border border-border/50 p-6">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-foreground">
              By Vendor - Performance Comparison
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={vendorBreakdown} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
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
            <h3 className="text-lg font-bold text-foreground">
              By Technology - Call Volume Contribution
            </h3>
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
              <XAxis
                type="number"
                stroke="hsl(var(--muted-foreground))"
                style={{ fontSize: "12px" }}
              />
              <YAxis
                dataKey="name"
                type="category"
                stroke="hsl(var(--muted-foreground))"
                style={{ fontSize: "12px" }}
              />
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

        {/* By Region and By Cluster - Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
      </div>

      {/* Segmentation & Grouping */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Segmentation & Grouping</h2>
        </div>

        {/* Helper function to transform segmented data for charts */}
        {useMemo(() => {
          const transformSegmentedData = (data: Record<string, any[]>) => {
            return Object.entries(data).map(([category, items]) => ({
              category,
              count: items?.length || 0,
            }));
          };

          const vendorSegmentedForChart = transformSegmentedData(vendorSegmented);
          const techSegmentedForChart = transformSegmentedData(techSegmented);
          const regionSegmentedForChart = transformSegmentedData(regionSegmented);
          const clusterSegmentedForChart = transformSegmentedData(clusterSegmented);

          return (
            <>
              {/* Vendor & Technology Segmentation Distribution - Side by Side */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Vendor Segmentation Distribution */}
                <div className="card-elevated rounded-xl border border-border/50 p-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-foreground">
                      Vendor Performance Categories
                    </h3>
                  </div>
                  {vendorSegmentedForChart.some((d) => d.count > 0) ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={vendorSegmentedForChart} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis
                          dataKey="category"
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
                        <Bar dataKey="count" fill="#8b5cf6" name="Count" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      No data available
                    </div>
                  )}
                </div>

                {/* Technology Segmentation Distribution */}
                <div className="card-elevated rounded-xl border border-border/50 p-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-foreground">
                      Technology Performance Categories
                    </h3>
                  </div>
                  {techSegmentedForChart.some((d) => d.count > 0) ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={techSegmentedForChart} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis
                          dataKey="category"
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
                        <Bar dataKey="count" fill="#8b5cf6" name="Count" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      No data available
                    </div>
                  )}
                </div>
              </div>

              {/* Region & Cluster Segmentation Distribution - Side by Side */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Region Segmentation Distribution */}
                <div className="card-elevated rounded-xl border border-border/50 p-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-foreground">
                      Region Performance Categories
                    </h3>
                  </div>
                  {regionSegmentedForChart.some((d) => d.count > 0) ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={regionSegmentedForChart} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis
                          dataKey="category"
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
                        <Bar dataKey="count" fill="#8b5cf6" name="Count" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      No data available
                    </div>
                  )}
                </div>

                {/* Cluster Segmentation Distribution */}
                <div className="card-elevated rounded-xl border border-border/50 p-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-foreground">
                      Cluster Performance Categories
                    </h3>
                  </div>
                  {clusterSegmentedForChart.some((d) => d.count > 0) ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={clusterSegmentedForChart} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis
                          dataKey="category"
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
                        <Bar dataKey="count" fill="#8b5cf6" name="Count" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      No data available
                    </div>
                  )}
                </div>
              </div>

              {/* Vendor Performance Categories Summary */}
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-foreground">Vendor Performance Categories</h3>
                <SegmentationSummary data={vendorSegmented} dimension="Vendor" />
              </div>

              {/* Technology Performance Categories Summary */}
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-foreground">Technology Performance Categories</h3>
                <SegmentationSummary data={techSegmented} dimension="Technology" />
              </div>

              {/* Region Performance Categories Summary */}
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-foreground">Region Performance Categories</h3>
                <SegmentationSummary data={regionSegmented} dimension="Region" />
              </div>

              {/* Cluster Performance Categories Summary */}
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-foreground">Cluster Performance Categories</h3>
                <SegmentationSummary data={clusterSegmented} dimension="Cluster" />
              </div>
            </>
          );
        }, [vendorSegmented, techSegmented, regionSegmented, clusterSegmented])}
      </div>
    </div>
  );
}
