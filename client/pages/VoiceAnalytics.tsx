import { useMemo } from "react";
import { Download } from "lucide-react";
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
import KPICard from "@/components/KPICard";
import ExecutiveInsightSummary, { type InsightData } from "@/components/ExecutiveInsightSummary";
import VoicePerformanceTable from "@/components/VoicePerformanceTable";
import DegradationInsights from "@/components/DegradationInsights";
import TrendChartContainer from "@/components/TrendChartContainer";
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

    // Sheet 2: Trend Data
    const trendSheetData = [
      ["Time", "Call Volume", "Success Rate", "Drop Rate", "Stability", "VQI", "VPI", "VSQI"],
      ...trendData.map((d) => [
        d.time,
        d.call_volume,
        d.call_success_rate.toFixed(2),
        d.drop_rate.toFixed(2),
        d.call_stability.toFixed(2),
        d.vqi.toFixed(2),
        d.vpi.toFixed(2),
        d.vsqi.toFixed(2),
      ]),
    ];

    const ws2 = XLSX.utils.aoa_to_sheet(trendSheetData);
    ws2["!cols"] = Array(8).fill({ wch: 15 });
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

    // Sheet 5: Applied Filters
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

    const ws5 = XLSX.utils.aoa_to_sheet(filtersData);
    ws5["!cols"] = [{ wch: 20 }, { wch: 40 }];
    XLSX.utils.book_append_sheet(wb, ws5, "Applied Filters");

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
        <h2 className="text-2xl font-bold text-foreground">Performance Trends</h2>

        {/* Call Volume Trend */}
        <div className="card-elevated rounded-xl border border-border/50 p-6">
          <h3 className="text-lg font-bold text-foreground mb-4">Call Volume Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={trendData}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="time"
                type="category"
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
              <Line
                type="monotone"
                dataKey="call_volume"
                stroke="#7c3aed"
                strokeWidth={2}
                name="Call Volume"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Quality Metrics */}
        <div className="card-elevated rounded-xl border border-border/50 p-6">
          <h3 className="text-lg font-bold text-foreground mb-4">Quality Metrics</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={trendData}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="time"
                type="category"
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
              <Line
                type="monotone"
                dataKey="call_success_rate"
                stroke="#22c55e"
                strokeWidth={2}
                name="Success Rate"
              />
              <Line
                type="monotone"
                dataKey="call_stability"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Stability"
              />
              <Line
                type="monotone"
                dataKey="vqi"
                stroke="#f59e0b"
                strokeWidth={2}
                name="VQI"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Call Retainability Rate (CRR) */}
        <TrendChartContainer
          title="Call Retainability Rate (CRR)"
          data={trendData}
          dataKeys={["crr"]}
          exportable
        >
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="time"
                type="category"
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
              <Line
                type="monotone"
                dataKey="crr"
                stroke="#8b5cf6"
                strokeWidth={2}
                name="CRR"
              />
            </LineChart>
          </ResponsiveContainer>
        </TrendChartContainer>

        {/* Call Continuity & VPI & VSQI */}
        <TrendChartContainer
          title="Voice Quality Indices (VPI, VSQI, Call Continuity)"
          data={trendData}
          dataKeys={["call_continuity", "vpi", "vsqi"]}
          exportable
        >
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="time"
                type="category"
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
              <Line
                type="monotone"
                dataKey="call_continuity"
                stroke="#10b981"
                strokeWidth={2}
                name="Call Continuity"
              />
              <Line
                type="monotone"
                dataKey="vpi"
                stroke="#06b6d4"
                strokeWidth={2}
                name="VPI"
              />
              <Line
                type="monotone"
                dataKey="vsqi"
                stroke="#ec4899"
                strokeWidth={2}
                name="VSQI"
              />
            </LineChart>
          </ResponsiveContainer>
        </TrendChartContainer>
      </div>

      {/* Performance Breakdown */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground">Performance Breakdown</h2>

        {/* By Vendor */}
        <div className="card-elevated rounded-xl border border-border/50 p-6">
          <h3 className="text-lg font-bold text-foreground mb-4">By Vendor</h3>
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
              <Bar dataKey="call_success_rate" fill="#22c55e" name="Success Rate" />
              <Bar dataKey="call_stability" fill="#3b82f6" name="Stability" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* By Technology */}
        <div className="card-elevated rounded-xl border border-border/50 p-6">
          <h3 className="text-lg font-bold text-foreground mb-4">By Technology</h3>
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
              <Bar dataKey="call_success_rate" fill="#22c55e" name="Success Rate" />
              <Bar dataKey="call_stability" fill="#3b82f6" name="Stability" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Segmentation - High Quality */}
      {vendorSegmented["High quality"] && vendorSegmented["High quality"].length > 0 && (
        <div className="card-elevated rounded-xl border border-border/50 p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-status-healthy" />
            <h3 className="text-lg font-bold text-foreground">High Quality Performers (Vendors)</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vendorSegmented["High quality"].map((vendor, idx) => (
              <div
                key={idx}
                className="p-4 rounded-lg border border-status-healthy/20 bg-status-healthy/5"
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

      {/* Segmentation - Degraded */}
      {vendorSegmented["Degraded"] && vendorSegmented["Degraded"].length > 0 && (
        <div className="card-elevated rounded-xl border border-border/50 p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-status-critical" />
            <h3 className="text-lg font-bold text-foreground">Degraded Performers (Vendors)</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vendorSegmented["Degraded"].map((vendor, idx) => (
              <div
                key={idx}
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
    </div>
  );
}
