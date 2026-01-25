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
import { useGlobalFilters } from "@/hooks/useGlobalFilters";
import { useToast } from "@/hooks/use-toast";
import {
  generateDataKPIs,
  generateDataTrendData,
  generateDataBreakdownByVendor,
  generateDataBreakdownByTechnology,
  generateDataBreakdownByRegion,
  segmentDataPerformance,
} from "@/utils/analyticsData";
import {
  Zap,
  TrendingUp,
  Activity,
  Gauge,
  Wifi,
  Clock,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function DataAnalytics() {
  const { toast } = useToast();
  const { filters } = useGlobalFilters();

  // Generate data
  const kpis = useMemo(() => generateDataKPIs(filters), [filters]);
  const trendData = useMemo(() => generateDataTrendData(filters), [filters]);
  const vendorBreakdown = useMemo(() => generateDataBreakdownByVendor(filters), [filters]);
  const techBreakdown = useMemo(() => generateDataBreakdownByTechnology(filters), [filters]);
  const regionBreakdown = useMemo(() => generateDataBreakdownByRegion(filters), [filters]);

  // Segment data
  const vendorSegmented = useMemo(() => segmentDataPerformance(vendorBreakdown), [vendorBreakdown]);
  const techSegmented = useMemo(() => segmentDataPerformance(techBreakdown), [techBreakdown]);
  const regionSegmented = useMemo(() => segmentDataPerformance(regionBreakdown), [regionBreakdown]);

  // Generate insights
  const insights = useMemo(() => {
    const today = new Date();
    const dateStr = today.toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" }).replace(/\//g, "-");

    // Calculate average DEI from trend data
    const avgDEI = trendData.length > 0
      ? trendData.reduce((sum, d) => sum + d.dei, 0) / trendData.length
      : 8.4;

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
        status: deiChange < 0 ? ("Degraded" as const) : "Improved" as const,
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
    XLSX.writeFile(wb, `Data_Analytics_${dateStr}.xlsx`);

    toast({
      title: "Export successful",
      description: `Downloaded as Data_Analytics_${dateStr}.xlsx`,
    });
  };

  return (
    <div className="space-y-8 pb-6">
      {/* Header */}
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold text-foreground">Data Analytics</h1>
            <p className="text-muted-foreground">
              Real-time data service performance and capacity insights
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

      {/* Secondary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KPICard
          label="Session Drop Rate"
          value={kpis.session_drop_rate.value.toFixed(2)}
          unit={kpis.session_drop_rate.unit}
          change={kpis.session_drop_rate.change}
          status={kpis.session_drop_rate.status}
          icon={AlertCircle}
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
        <h2 className="text-2xl font-bold text-foreground">Performance Trends</h2>

        {/* Data Volume Trend */}
        <div className="card-elevated rounded-xl border border-border/50 p-6">
          <h3 className="text-lg font-bold text-foreground mb-4">Data Volume Trend</h3>
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
                dataKey="data_volume"
                stroke="#7c3aed"
                strokeWidth={2}
                name="Data Volume"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Speed & Latency Metrics */}
        <div className="card-elevated rounded-xl border border-border/50 p-6">
          <h3 className="text-lg font-bold text-foreground mb-4">Speed & Latency Metrics</h3>
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
                dataKey="avg_speed"
                stroke="#22c55e"
                strokeWidth={2}
                name="Avg Speed (Mbps)"
              />
              <Line
                type="monotone"
                dataKey="avg_latency"
                stroke="#f59e0b"
                strokeWidth={2}
                name="Avg Latency (ms)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Data Experience Index */}
        <div className="card-elevated rounded-xl border border-border/50 p-6">
          <h3 className="text-lg font-bold text-foreground mb-4">Data Experience Index Trend</h3>
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
                dataKey="dei"
                stroke="#3b82f6"
                strokeWidth={2}
                name="DEI"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Capacity & Congestion Indicators */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground">Capacity & Congestion</h2>

        {/* Peak vs Off-Peak Comparison */}
        <div className="card-elevated rounded-xl border border-border/50 p-6">
          <h3 className="text-lg font-bold text-foreground mb-4">Peak vs Off-Peak Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 rounded-lg bg-status-degraded/5 border border-status-degraded/20">
              <p className="text-sm font-semibold text-foreground mb-2">Peak Hours</p>
              <p className="text-2xl font-bold text-status-degraded mb-2">92.3 Mbps</p>
              <p className="text-xs text-muted-foreground">+2.5% from previous peak</p>
            </div>
            <div className="p-4 rounded-lg bg-status-healthy/5 border border-status-healthy/20">
              <p className="text-sm font-semibold text-foreground mb-2">Off-Peak Hours</p>
              <p className="text-2xl font-bold text-status-healthy mb-2">156.8 Mbps</p>
              <p className="text-xs text-muted-foreground">+4.2% from previous off-peak</p>
            </div>
          </div>
        </div>
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

      {/* Segmentation - High Performance */}
      {vendorSegmented["High performance"] && vendorSegmented["High performance"].length > 0 && (
        <div className="card-elevated rounded-xl border border-border/50 p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-status-healthy" />
            <h3 className="text-lg font-bold text-foreground">High Performance (Vendors)</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vendorSegmented["High performance"].map((vendor, idx) => (
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
