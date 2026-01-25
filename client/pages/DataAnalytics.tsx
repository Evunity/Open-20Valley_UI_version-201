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
  generateDataBreakdownByCluster,
  segmentDataPerformance,
  generateTimeRegionHeatmap,
  generateTechCapacityHeatmap,
  generateHourlyUtilizationHeatmap,
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
  const clusterBreakdown = useMemo(() => generateDataBreakdownByCluster(filters), [filters]);

  // Segment data
  const vendorSegmented = useMemo(() => segmentDataPerformance(vendorBreakdown), [vendorBreakdown]);
  const techSegmented = useMemo(() => segmentDataPerformance(techBreakdown), [techBreakdown]);
  const regionSegmented = useMemo(() => segmentDataPerformance(regionBreakdown), [regionBreakdown]);
  const clusterSegmented = useMemo(() => segmentDataPerformance(clusterBreakdown), [clusterBreakdown]);

  // Calculate average speed and latency for display in tables
  const avgSpeed = useMemo(() => {
    if (trendData.length === 0) return 87;
    return trendData.reduce((sum, d) => sum + d.avg_speed, 0) / trendData.length;
  }, [trendData]);

  const avgLatency = useMemo(() => {
    if (trendData.length === 0) return 38;
    return trendData.reduce((sum, d) => sum + d.avg_latency, 0) / trendData.length;
  }, [trendData]);

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

        {/* Packet Loss Trend */}
        <div className="card-elevated rounded-xl border border-border/50 p-6">
          <h3 className="text-lg font-bold text-foreground mb-4">Packet Loss Trend</h3>
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
                dataKey="packet_loss"
                stroke="#ef4444"
                strokeWidth={2}
                name="Packet Loss (%)"
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-status-degraded/5 border border-status-degraded/20">
              <p className="text-sm font-semibold text-foreground mb-2">Peak Hours (9 AM - 5 PM)</p>
              <p className="text-2xl font-bold text-status-degraded mb-2">92.3 Mbps</p>
              <p className="text-xs text-muted-foreground">Avg Speed: +2.5% trend</p>
              <p className="text-xs text-muted-foreground">Latency: 52.3ms</p>
            </div>
            <div className="p-4 rounded-lg bg-status-healthy/5 border border-status-healthy/20">
              <p className="text-sm font-semibold text-foreground mb-2">Off-Peak Hours (6 PM - 8 AM)</p>
              <p className="text-2xl font-bold text-status-healthy mb-2">156.8 Mbps</p>
              <p className="text-xs text-muted-foreground">Avg Speed: +4.2% trend</p>
              <p className="text-xs text-muted-foreground">Latency: 28.1ms</p>
            </div>
            <div className="p-4 rounded-lg bg-yellow-100 border border-yellow-200">
              <p className="text-sm font-semibold text-foreground mb-2">Capacity Stress</p>
              <p className="text-2xl font-bold text-yellow-700 mb-2">64%</p>
              <p className="text-xs text-muted-foreground">Utilization during peak</p>
              <p className="text-xs text-muted-foreground">Headroom: 36%</p>
            </div>
          </div>
        </div>

        {/* Congestion Hotspots - Ranked List */}
        <div className="card-elevated rounded-xl border border-border/50 p-6">
          <h3 className="text-lg font-bold text-foreground mb-4">Areas Under Capacity Stress</h3>
          <div className="space-y-3">
            {[
              { area: "Region: South - Cluster C", utilization: 85, speed: 62, latency: 67, status: "critical" },
              { area: "Region: East - Cluster B", utilization: 78, speed: 71, latency: 54, status: "high" },
              { area: "Technology: 3G - North", utilization: 72, speed: 58, latency: 78, status: "high" },
              { area: "Vendor: Huawei - Central", utilization: 68, speed: 73, latency: 45, status: "medium" },
            ].map((item, idx) => (
              <div key={idx} className="p-4 rounded-lg border border-border/50 hover:bg-muted/50">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-foreground">{item.area}</p>
                  <span className={cn(
                    "px-2 py-1 rounded text-xs font-semibold",
                    item.status === "critical" ? "bg-red-100 text-red-700" :
                    item.status === "high" ? "bg-orange-100 text-orange-700" :
                    "bg-yellow-100 text-yellow-700"
                  )}>
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs mb-1">Utilization</p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={cn(
                          "h-2 rounded-full",
                          item.utilization > 80 ? "bg-red-500" : item.utilization > 70 ? "bg-orange-500" : "bg-yellow-500"
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
                          item.speed > 80 ? "bg-green-500" : item.speed > 60 ? "bg-yellow-500" : "bg-red-500"
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
                          item.latency < 40 ? "bg-green-500" : item.latency < 60 ? "bg-yellow-500" : "bg-red-500"
                        )}
                        style={{ width: `${Math.min(item.latency, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs font-semibold mt-1">{item.latency}ms</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* High Usage with Low Speed Indicators */}
        <div className="card-elevated rounded-xl border border-border/50 p-6">
          <h3 className="text-lg font-bold text-foreground mb-4">High Usage with Low Speed (Performance Risk)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { area: "South Region", volume: "High", speed: "Low", risk: "Critical", recommendation: "Scale capacity immediately" },
              { area: "East Cluster", volume: "High", speed: "Medium", risk: "High", recommendation: "Monitor closely for escalation" },
              { area: "3G Network", volume: "Medium", speed: "Low", risk: "Medium", recommendation: "Plan upgrade timeline" },
            ].map((item, idx) => (
              <div key={idx} className="p-4 rounded-lg border border-red-200 bg-red-50">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-foreground">{item.area}</p>
                    <p className="text-xs text-muted-foreground mt-1">Data Volume: <span className="font-semibold">{item.volume}</span> | Speed: <span className="font-semibold">{item.speed}</span></p>
                  </div>
                  <span className="px-2 py-1 rounded text-xs font-semibold bg-red-200 text-red-700">
                    {item.risk}
                  </span>
                </div>
                <p className="text-sm text-foreground"><span className="font-semibold">Recommendation:</span> {item.recommendation}</p>
              </div>
            ))}
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

        {/* By Region */}
        <div className="card-elevated rounded-xl border border-border/50 p-6">
          <h3 className="text-lg font-bold text-foreground mb-4">By Region</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={regionBreakdown}
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

      {/* Data Performance Breakdown Details - Tables */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground">Data Performance Breakdown</h2>

        {/* Vendor Breakdown Table */}
        <div className="card-elevated rounded-xl border border-border/50 p-6 overflow-x-auto">
          <h3 className="text-lg font-bold text-foreground mb-4">By Vendor</h3>
          <table className="w-full text-sm">
            <thead className="border-b border-border">
              <tr className="text-muted-foreground font-semibold">
                <th className="text-left py-2 px-4">Vendor</th>
                <th className="text-right py-2 px-4">Sessions</th>
                <th className="text-right py-2 px-4">Failures</th>
                <th className="text-right py-2 px-4">Avg Speed</th>
                <th className="text-right py-2 px-4">Avg Latency</th>
                <th className="text-center py-2 px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {vendorBreakdown.map((vendor, idx) => {
                const failureCount = Math.round((vendor.count * vendor.drop_rate) / 100);
                const statusColor = vendor.call_success_rate > 98 ? "bg-green-100" : vendor.call_success_rate > 96 ? "bg-yellow-100" : "bg-red-100";
                return (
                  <tr key={idx} className="border-b border-border/50 hover:bg-muted/50">
                    <td className="py-2 px-4 font-medium">{vendor.name}</td>
                    <td className="py-2 px-4 text-right">{vendor.count.toLocaleString()}</td>
                    <td className="py-2 px-4 text-right">{failureCount.toLocaleString()}</td>
                    <td className="py-2 px-4 text-right">{avgSpeed.toFixed(2)} Mbps</td>
                    <td className="py-2 px-4 text-right">{avgLatency.toFixed(2)} ms</td>
                    <td className="py-2 px-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor}`}>
                        {vendor.call_success_rate.toFixed(2)}%
                      </span>
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
          <table className="w-full text-sm">
            <thead className="border-b border-border">
              <tr className="text-muted-foreground font-semibold">
                <th className="text-left py-2 px-4">Technology</th>
                <th className="text-right py-2 px-4">Sessions</th>
                <th className="text-right py-2 px-4">Failures</th>
                <th className="text-right py-2 px-4">Avg Speed</th>
                <th className="text-right py-2 px-4">Avg Latency</th>
                <th className="text-center py-2 px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {techBreakdown.map((tech, idx) => {
                const failureCount = Math.round((tech.count * tech.drop_rate) / 100);
                const statusColor = tech.call_success_rate > 98 ? "bg-green-100" : tech.call_success_rate > 96 ? "bg-yellow-100" : "bg-red-100";
                return (
                  <tr key={idx} className="border-b border-border/50 hover:bg-muted/50">
                    <td className="py-2 px-4 font-medium">{tech.name}</td>
                    <td className="py-2 px-4 text-right">{tech.count.toLocaleString()}</td>
                    <td className="py-2 px-4 text-right">{failureCount.toLocaleString()}</td>
                    <td className="py-2 px-4 text-right">{avgSpeed.toFixed(2)} Mbps</td>
                    <td className="py-2 px-4 text-right">{avgLatency.toFixed(2)} ms</td>
                    <td className="py-2 px-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor}`}>
                        {tech.call_success_rate.toFixed(2)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Region Breakdown Table */}
        <div className="card-elevated rounded-xl border border-border/50 p-6 overflow-x-auto">
          <h3 className="text-lg font-bold text-foreground mb-4">By Region</h3>
          <table className="w-full text-sm">
            <thead className="border-b border-border">
              <tr className="text-muted-foreground font-semibold">
                <th className="text-left py-2 px-4">Region</th>
                <th className="text-right py-2 px-4">Sessions</th>
                <th className="text-right py-2 px-4">Failures</th>
                <th className="text-right py-2 px-4">Avg Speed</th>
                <th className="text-right py-2 px-4">Avg Latency</th>
                <th className="text-center py-2 px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {regionBreakdown.map((region, idx) => {
                const failureCount = Math.round((region.count * region.drop_rate) / 100);
                const statusColor = region.call_success_rate > 98 ? "bg-green-100" : region.call_success_rate > 96 ? "bg-yellow-100" : "bg-red-100";
                return (
                  <tr key={idx} className="border-b border-border/50 hover:bg-muted/50">
                    <td className="py-2 px-4 font-medium">{region.name}</td>
                    <td className="py-2 px-4 text-right">{region.count.toLocaleString()}</td>
                    <td className="py-2 px-4 text-right">{failureCount.toLocaleString()}</td>
                    <td className="py-2 px-4 text-right">{avgSpeed.toFixed(2)} Mbps</td>
                    <td className="py-2 px-4 text-right">{avgLatency.toFixed(2)} ms</td>
                    <td className="py-2 px-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor}`}>
                        {region.call_success_rate.toFixed(2)}%
                      </span>
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
          <table className="w-full text-sm">
            <thead className="border-b border-border">
              <tr className="text-muted-foreground font-semibold">
                <th className="text-left py-2 px-4">Cluster</th>
                <th className="text-right py-2 px-4">Sessions</th>
                <th className="text-right py-2 px-4">Failures</th>
                <th className="text-right py-2 px-4">Avg Speed</th>
                <th className="text-right py-2 px-4">Avg Latency</th>
                <th className="text-center py-2 px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {clusterBreakdown.map((cluster, idx) => {
                const failureCount = Math.round((cluster.count * cluster.drop_rate) / 100);
                const statusColor = cluster.call_success_rate > 98 ? "bg-green-100" : cluster.call_success_rate > 96 ? "bg-yellow-100" : "bg-red-100";
                return (
                  <tr key={idx} className="border-b border-border/50 hover:bg-muted/50">
                    <td className="py-2 px-4 font-medium">{cluster.name}</td>
                    <td className="py-2 px-4 text-right">{cluster.count.toLocaleString()}</td>
                    <td className="py-2 px-4 text-right">{failureCount.toLocaleString()}</td>
                    <td className="py-2 px-4 text-right">{avgSpeed.toFixed(2)} Mbps</td>
                    <td className="py-2 px-4 text-right">{avgLatency.toFixed(2)} ms</td>
                    <td className="py-2 px-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor}`}>
                        {cluster.call_success_rate.toFixed(2)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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

      {/* Segmentation - High Performance (Regions) */}
      {regionSegmented["High performance"] && regionSegmented["High performance"].length > 0 && (
        <div className="card-elevated rounded-xl border border-border/50 p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-status-healthy" />
            <h3 className="text-lg font-bold text-foreground">High Performance (Regions)</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {regionSegmented["High performance"].map((region, idx) => (
              <div
                key={idx}
                className="p-4 rounded-lg border border-status-healthy/20 bg-status-healthy/5"
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
                key={idx}
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
