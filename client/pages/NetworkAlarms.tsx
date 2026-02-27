import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Download, AlertTriangle, AlertCircle, Clock, TrendingUp } from "lucide-react";
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
import TrendChartContainer from "@/components/TrendChartContainer";
import { useGlobalFilters } from "@/hooks/useGlobalFilters";
import { useToast } from "@/hooks/use-toast";
import {
  generateAlarmKPIs,
  generateAlarmHealthIndex,
  generateAlarmTrendData,
  generateAlarmDistributionByVendor,
  generateAlarmDistributionByTechnology,
  generateAlarmDistributionByRegion,
  generateAlarmDistributionByCluster,
  generateAlarmInsights,
} from "@/utils/alarmData";
import { cn } from "@/lib/utils";

export default function NetworkAlarms() {
  const { toast } = useToast();
  const { filters } = useGlobalFilters();

  // Generate data
  const kpis = useMemo(() => generateAlarmKPIs(filters), [filters]);
  const healthIndex = useMemo(() => generateAlarmHealthIndex(filters), [filters]);
  const trendData = useMemo(() => generateAlarmTrendData(filters), [filters]);
  const vendorDistribution = useMemo(() => generateAlarmDistributionByVendor(filters), [filters]);
  const techDistribution = useMemo(() => generateAlarmDistributionByTechnology(filters), [filters]);
  const regionDistribution = useMemo(() => generateAlarmDistributionByRegion(filters), [filters]);
  const clusterDistribution = useMemo(() => generateAlarmDistributionByCluster(filters), [filters]);

  const insights = useMemo(
    () =>
      generateAlarmInsights(trendData, {
        vendor: vendorDistribution,
        technology: techDistribution,
        region: regionDistribution,
        cluster: clusterDistribution,
      }, filters),
    [trendData, vendorDistribution, techDistribution, regionDistribution, clusterDistribution, filters]
  );

  const handleExport = () => {
    const wb = XLSX.utils.book_new();

    // Add KPIs sheet
    const kpiData = Object.entries(kpis).map(([key, kpiValue]) => ({
      Metric: key.replace(/_/g, " ").toUpperCase(),
      Value: kpiValue.value,
      Unit: kpiValue.unit,
      Change: `${kpiValue.change}%`,
      Status: kpiValue.status,
    }));
    const kpiSheet = XLSX.utils.json_to_sheet(kpiData);
    XLSX.utils.book_append_sheet(wb, kpiSheet, "KPIs");

    // Add Trend Data sheet
    const trendSheet = XLSX.utils.json_to_sheet(trendData);
    XLSX.utils.book_append_sheet(wb, trendSheet, "Trends");

    XLSX.writeFile(wb, `Network-Alarms-${new Date().toISOString().split("T")[0]}.xlsx`);
    toast({
      title: "Export successful",
      description: "Network Alarms data has been exported to Excel",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Link to="/" className="hover:text-foreground">
                  Dashboard
                </Link>
                <span>/</span>
                <span>Network Alarms</span>
              </div>
              <h1 className="text-3xl font-bold text-foreground">Network Alarms</h1>
              <p className="text-muted-foreground">Network instability and operational risk awareness</p>
            </div>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export to Excel
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        <FilterPanel />
      </div>

      {/* Main Content */}
      <div className="px-8 py-8 space-y-8">

        {/* Top Alarm Summary Cards */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Alarm Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                key: "active",
                icon: AlertCircle,
                label: "Active Alarms",
                value: kpis.active_alarms.value,
                unit: kpis.active_alarms.unit,
                change: kpis.active_alarms.direction === "down" ? -kpis.active_alarms.change : kpis.active_alarms.change,
                status: kpis.active_alarms.status,
              },
              {
                key: "critical",
                icon: AlertTriangle,
                label: "Critical Alarms",
                value: kpis.critical_alarms.value,
                unit: kpis.critical_alarms.unit,
                change: kpis.critical_alarms.change,
                status: kpis.critical_alarms.status,
              },
              {
                key: "major",
                icon: AlertTriangle,
                label: "Major Alarms",
                value: kpis.major_alarms.value,
                unit: kpis.major_alarms.unit,
                change: kpis.major_alarms.direction === "down" ? -kpis.major_alarms.change : kpis.major_alarms.change,
                status: kpis.major_alarms.status,
              },
              {
                key: "rate",
                icon: TrendingUp,
                label: "Alarm Rate",
                value: kpis.alarm_rate.value,
                unit: kpis.alarm_rate.unit,
                change: kpis.alarm_rate.change,
                status: kpis.alarm_rate.status,
              },
            ].map((card) => (
              <KPICard
                key={card.key}
                icon={card.icon}
                label={card.label}
                value={card.value}
                unit={card.unit}
                change={card.change}
                status={card.status}
              />
            ))}
          </div>
        </div>

        {/* Alarm Health Index */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Alarm Health Index</h2>
          <div className="card-elevated rounded-xl border border-border/50 p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Alarm Stability Index</p>
                <div className="flex items-baseline gap-3">
                  <span className="text-5xl font-bold text-foreground">{healthIndex.value}</span>
                  <span className="text-lg text-muted-foreground">/100</span>
                  <span
                    className={cn(
                      "px-3 py-1 rounded-full text-sm font-semibold",
                      healthIndex.status === "healthy"
                        ? "bg-green-500/10 text-green-700"
                        : healthIndex.status === "degraded"
                          ? "bg-yellow-500/10 text-yellow-700"
                          : "bg-red-500/10 text-red-700"
                    )}
                  >
                    {healthIndex.status === "healthy"
                      ? "Stable"
                      : healthIndex.status === "degraded"
                        ? "Degrading"
                        : "Critical"}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground mb-2">vs previous period</p>
                <p
                  className={cn(
                    "text-2xl font-semibold",
                    healthIndex.change < 0 ? "text-green-600" : "text-red-600"
                  )}
                >
                  {healthIndex.change > 0 ? "+" : ""}{healthIndex.change}%
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-6">
              Composite indicator derived from alarm volume, severity distribution, and persistence duration.
            </p>
          </div>
        </div>

        {/* Alarm Trend Analysis */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-foreground">Trend Analysis</h2>

          {/* Alarm Volume & Critical vs Non-Critical - Stacked */}
          <div className="space-y-4">
            {/* Alarm Volume Trend */}
            <TrendChartContainer
              title="Alarm Volume Trend"
              data={trendData.map((d) => ({ ...d, time: d.timestamp }))}
              dataKeys={["active_alarms"]}
              exportable
              zoomable
              defaultChartType="line"
            />

            {/* Critical vs Non-Critical Distribution */}
            <TrendChartContainer
              title="Critical vs Non-Critical Distribution"
              data={trendData.map((d) => ({ ...d, time: d.timestamp }))}
              dataKeys={["critical_alarms", "major_alarms", "minor_alarms"]}
              exportable
              zoomable
              defaultChartType="line"
            />
          </div>

          {/* Alarm Clear Rate with Severity Breakdown */}
          <div className="space-y-4">
            <TrendChartContainer
              title="Alarm Clear Rate"
              data={trendData.map((d) => ({ ...d, time: d.timestamp }))}
              dataKeys={["clear_rate"]}
              exportable
              zoomable
              defaultChartType="area"
            />

            {/* Clear Rate by Severity */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { key: "critical", label: "Critical", color: "bg-red-500", value: "85%", text: "text-red-600", desc: "Clear rate for critical alarms" },
                { key: "major", label: "Major", color: "bg-yellow-500", value: "78%", text: "text-yellow-600", desc: "Clear rate for major alarms" },
                { key: "minor", label: "Minor", color: "bg-blue-500", value: "92%", text: "text-blue-600", desc: "Clear rate for minor alarms" },
                { key: "warning", label: "Warning", color: "bg-cyan-500", value: "96%", text: "text-cyan-600", desc: "Clear rate for warnings" },
              ].map((item) => (
                <div key={item.key} className="card-elevated rounded-xl border border-border/50 p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-foreground">{item.label}</h4>
                    <span className={`w-3 h-3 rounded-full ${item.color}`} />
                  </div>
                  <p className={`text-2xl font-bold ${item.text}`}>{item.value}</p>
                  <p className="text-xs text-muted-foreground mt-2">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Alarm Distribution & Hotspots */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-foreground">Alarm Distribution & Hotspots</h2>

          {/* By Vendor Distribution */}
          <div className="card-elevated rounded-xl border border-border/50 p-6">
            <h3 className="text-lg font-bold text-foreground mb-4">By Vendor</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={vendorDistribution}
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
                <Bar dataKey="active" fill="#3b82f6" name="Active" />
                <Bar dataKey="critical" fill="#ef4444" name="Critical" />
                <Bar dataKey="major" fill="#f59e0b" name="Major" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* By Region & Cluster Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card-elevated rounded-xl border border-border/50 p-6">
              <h3 className="text-lg font-bold text-foreground mb-4">By Region</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={regionDistribution}
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
                  <Bar dataKey="active" fill="#3b82f6" name="Active" />
                  <Bar dataKey="critical" fill="#ef4444" name="Critical" />
                  <Bar dataKey="major" fill="#f59e0b" name="Major" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="card-elevated rounded-xl border border-border/50 p-6">
              <h3 className="text-lg font-bold text-foreground mb-4">By Cluster</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={clusterDistribution}
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
                  <Bar dataKey="active" fill="#3b82f6" name="Active" />
                  <Bar dataKey="critical" fill="#ef4444" name="Critical" />
                  <Bar dataKey="major" fill="#f59e0b" name="Major" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Alarm Duration Analysis Table */}
          <div className="card-elevated rounded-xl border border-border/50 p-6">
            <h3 className="text-lg font-bold text-foreground mb-4">Average Alarm Duration by Dimension</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border">
                  <tr className="text-muted-foreground font-semibold">
                    <th className="text-left py-2 px-4">Dimension</th>
                    <th className="text-right py-2 px-4">Active</th>
                    <th className="text-right py-2 px-4">Critical</th>
                    <th className="text-right py-2 px-4">Avg Duration (min)</th>
                    <th className="text-center py-2 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {vendorDistribution.map((vendor) => (
                    <tr key={vendor.name} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 font-medium">{vendor.name}</td>
                      <td className="text-right py-3 px-4">{vendor.active}</td>
                      <td className="text-right py-3 px-4 text-red-600 font-semibold">{vendor.critical}</td>
                      <td className="text-right py-3 px-4">{vendor.avg_duration}</td>
                      <td className="text-center py-3 px-4">
                        <span
                          className={cn(
                            "px-2 py-1 rounded-full text-xs font-semibold",
                            vendor.status === "healthy"
                              ? "bg-green-500/10 text-green-700"
                              : vendor.status === "degraded"
                                ? "bg-yellow-500/10 text-yellow-700"
                                : "bg-red-500/10 text-red-700"
                          )}
                        >
                          {vendor.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Alarm Pattern Insights */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Alarm Pattern Insights</h2>
          {insights.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {insights.map((insight) => (
                <div
                  key={insight.id}
                  className="card-elevated rounded-xl border border-border/50 overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col"
                >
                  <div
                    className={cn(
                      "h-1",
                      insight.severity === "critical"
                        ? "bg-red-500"
                        : insight.severity === "major"
                          ? "bg-yellow-500"
                          : "bg-blue-500"
                    )}
                  />
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-start justify-between mb-2 gap-2">
                      <h4 className="font-bold text-foreground text-sm leading-snug flex-1">{insight.title}</h4>
                      <span
                        className={cn(
                          "px-2 py-1 rounded text-xs font-semibold flex-shrink-0 whitespace-nowrap",
                          insight.severity === "critical"
                            ? "bg-red-500/10 text-red-700"
                            : insight.severity === "major"
                              ? "bg-yellow-500/10 text-yellow-700"
                              : "bg-blue-500/10 text-blue-700"
                        )}
                      >
                        {insight.severity}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-4 flex-1 leading-relaxed">{insight.description}</p>
                    <div className="space-y-2 text-xs text-muted-foreground border-t border-border/50 pt-3 mt-auto">
                      <div>{insight.scope}</div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(insight.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card-elevated rounded-xl border border-border/50 p-8 text-center">
              <p className="text-muted-foreground">No alarm pattern insights at this time.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
