import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Download, Server, AlertCircle, TrendingUp, Clock } from "lucide-react";
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
import { useGlobalFilters } from "@/hooks/useGlobalFilters";
import { useToast } from "@/hooks/use-toast";
import {
  generateNetworkStatusKPIs,
  generateNetworkAvailabilityTrend,
  generateTopologyHealth,
  generateImpactedAreas,
  generateStatusInsights,
} from "@/utils/networkStatusData";
import { cn } from "@/lib/utils";

export default function NetworkStatus() {
  const { toast } = useToast();
  const { filters } = useGlobalFilters();

  // Generate data
  const kpis = useMemo(() => generateNetworkStatusKPIs(filters), [filters]);
  const availabilityTrend = useMemo(
    () => generateNetworkAvailabilityTrend(filters),
    [filters]
  );
  const topologyHealth = useMemo(() => generateTopologyHealth(filters), [filters]);
  const impactedAreas = useMemo(() => generateImpactedAreas(filters), [filters]);
  const insights = useMemo(
    () => generateStatusInsights(topologyHealth, impactedAreas, filters),
    [topologyHealth, impactedAreas, filters]
  );

  const handleExport = () => {
    const wb = XLSX.utils.book_new();

    // Add KPIs sheet
    const kpiData = Object.entries(kpis).map(([key, value]) => ({
      Metric: key,
      Value: value.value,
      Change: `${value.change}%`,
      Status: value.status,
    }));
    const kpiSheet = XLSX.utils.json_to_sheet(kpiData);
    XLSX.utils.book_append_sheet(wb, kpiSheet, "Status KPIs");

    // Add Availability Trend sheet
    const availabilitySheet = XLSX.utils.json_to_sheet(availabilityTrend);
    XLSX.utils.book_append_sheet(wb, availabilitySheet, "Availability Trend");

    XLSX.writeFile(wb, `Network-Status-${new Date().toISOString().split("T")[0]}.xlsx`);
    toast({
      title: "Export successful",
      description: "Network Status data has been exported to Excel",
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
                <span>Network Status</span>
              </div>
              <h1 className="text-3xl font-bold text-foreground">Network Status</h1>
              <p className="text-muted-foreground">Structural and availability-focused network overview</p>
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

        {/* Top Status Summary Cards */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Site Status Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              icon={Server}
              label="Total Sites"
              value={kpis.total_sites.value}
              unit="sites"
              change={kpis.total_sites.change}
              status={kpis.total_sites.status}
              direction={kpis.total_sites.change < 0 ? "down" : "up"}
            />
            <KPICard
              icon={TrendingUp}
              label="Active Sites"
              value={kpis.active_sites.value}
              unit="sites"
              change={kpis.active_sites.change}
              status={kpis.active_sites.status}
              direction={kpis.active_sites.change < 0 ? "down" : "up"}
            />
            <KPICard
              icon={AlertCircle}
              label="Down Sites"
              value={kpis.down_sites.value}
              unit="sites"
              change={kpis.down_sites.change}
              status={kpis.down_sites.status}
              direction={kpis.down_sites.change > 0 ? "up" : "down"}
            />
            <KPICard
              icon={AlertCircle}
              label="Partially Degraded"
              value={kpis.partially_degraded.value}
              unit="sites"
              change={kpis.partially_degraded.change}
              status={kpis.partially_degraded.status}
              direction={kpis.partially_degraded.change > 0 ? "up" : "down"}
            />
          </div>
        </div>

        {/* Network Availability Overview */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-foreground">Availability Overview</h2>

          {/* Overall Availability Trend */}
          <div className="card-elevated rounded-xl border border-border/50 p-6">
            <h3 className="text-lg font-bold text-foreground mb-4">Network Availability Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={availabilityTrend} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="timestamp"
                  stroke="hsl(var(--muted-foreground))"
                  style={{ fontSize: "12px" }}
                />
                <YAxis stroke="hsl(var(--muted-foreground))" style={{ fontSize: "12px" }} domain={[95, 100]} />
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
                  dataKey="overall_availability"
                  stroke="#22c55e"
                  dot={false}
                  strokeWidth={2}
                  name="Overall"
                />
                <Line
                  type="monotone"
                  dataKey="availability_5g"
                  stroke="#3b82f6"
                  dot={false}
                  strokeWidth={2}
                  name="5G"
                />
                <Line
                  type="monotone"
                  dataKey="availability_4g"
                  stroke="#f59e0b"
                  dot={false}
                  strokeWidth={2}
                  name="4G"
                />
                <Line
                  type="monotone"
                  dataKey="availability_3g"
                  stroke="#ef4444"
                  dot={false}
                  strokeWidth={2}
                  name="3G"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Availability by Technology */}
          <div className="card-elevated rounded-xl border border-border/50 p-6">
            <h3 className="text-lg font-bold text-foreground mb-4">Availability by Technology</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={[
                  { name: "5G", availability: 99.8 },
                  { name: "4G", availability: 99.5 },
                  { name: "3G", availability: 99.0 },
                  { name: "2G", availability: 98.5 },
                ]}
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
                <Bar dataKey="availability" fill="#22c55e" name="Availability %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Topology Health Snapshot */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Topology Health Snapshot</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {topologyHealth.map((node) => (
              <div
                key={node.name}
                className="card-elevated rounded-xl border border-border/50 p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-foreground text-sm">{node.name}</h3>
                  <span
                    className={cn(
                      "px-2 py-1 rounded text-xs font-semibold flex-shrink-0",
                      node.status === "healthy"
                        ? "bg-green-500/10 text-green-700"
                        : node.status === "degraded"
                          ? "bg-yellow-500/10 text-yellow-700"
                          : "bg-red-500/10 text-red-700"
                    )}
                  >
                    {node.status}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Health</span>
                    <span className="font-semibold text-foreground">
                      {node.healthPercentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className={cn(
                        "h-2 rounded-full transition-all",
                        node.status === "healthy"
                          ? "bg-green-500"
                          : node.status === "degraded"
                            ? "bg-yellow-500"
                            : "bg-red-500"
                      )}
                      style={{ width: `${node.healthPercentage}%` }}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {node.downSites} / {node.totalSites} sites down
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Impacted Areas Overview */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Impacted Areas Overview</h2>
          <div className="card-elevated rounded-xl border border-border/50 p-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border">
                <tr className="text-muted-foreground font-semibold">
                  <th className="text-left py-3 px-4">Area / Dimension</th>
                  <th className="text-center py-3 px-4">Down Sites</th>
                  <th className="text-center py-3 px-4">Affected Sites</th>
                  <th className="text-center py-3 px-4">Recovery Trend</th>
                  <th className="text-center py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {impactedAreas.map((area) => (
                  <tr key={area.name} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 font-medium">{area.name}</td>
                    <td className="text-center py-3 px-4 text-red-600 font-semibold">
                      {area.downSites}
                    </td>
                    <td className="text-center py-3 px-4">{area.affectedSites}</td>
                    <td className="text-center py-3 px-4">
                      <span
                        className={cn(
                          "px-2 py-1 rounded text-xs font-semibold",
                          area.recoveryTrend === "improving"
                            ? "bg-green-500/10 text-green-700"
                            : area.recoveryTrend === "stable"
                              ? "bg-blue-500/10 text-blue-700"
                              : "bg-red-500/10 text-red-700"
                        )}
                      >
                        {area.recoveryTrend}
                      </span>
                    </td>
                    <td className="text-center py-3 px-4">
                      <span
                        className={cn(
                          "px-2 py-1 rounded text-xs font-semibold",
                          area.status === "healthy"
                            ? "bg-green-500/10 text-green-700"
                            : area.status === "degraded"
                              ? "bg-yellow-500/10 text-yellow-700"
                              : "bg-red-500/10 text-red-700"
                        )}
                      >
                        {area.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Status Insights */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Status Insights</h2>
          {insights.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
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
                      <h4 className="font-bold text-foreground text-sm leading-snug flex-1">
                        {insight.title}
                      </h4>
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
                    <p className="text-xs text-muted-foreground mb-4 flex-1 leading-relaxed">
                      {insight.description}
                    </p>
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
              <p className="text-muted-foreground">No status insights at this time.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
