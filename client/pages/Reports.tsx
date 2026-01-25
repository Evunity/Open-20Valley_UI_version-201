import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Filter } from "lucide-react";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import VendorComparison from "@/components/VendorComparison";

interface FilterState {
  regions: string[];
  reportType: string[];
  timeRange: "24h" | "7d" | "30d";
}

export default function Reports() {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    regions: [],
    reportType: [],
    timeRange: "30d",
  });

  // Generate vendor metrics for comparison
  const vendorMetrics = useMemo(() => {
    const vendors = ["Ericsson", "Huawei", "Nokia", "Samsung", "Cisco"];
    return vendors.map((vendor) => ({
      name: vendor,
      successRate: 98.2 + Math.random() * 1.5 - (vendors.indexOf(vendor) * 0.3),
      dropRate: 1.8 - Math.random() * 0.5 + (vendors.indexOf(vendor) * 0.2),
      stability: 97.5 + Math.random() * 1.8 - (vendors.indexOf(vendor) * 0.25),
      volume: Math.floor(5000 + Math.random() * 5000),
      status: (98.2 + Math.random() * 1.5) > 97 ? "healthy" : "degraded" as const,
    }));
  }, []);

  // Mock data
  const stabilityData = [
    { month: "Jan", uptime: 97.8, incidents: 24 },
    { month: "Feb", uptime: 98.1, incidents: 19 },
    { month: "Mar", uptime: 98.5, incidents: 14 },
    { month: "Apr", uptime: 98.8, incidents: 11 },
    { month: "May", uptime: 99.2, incidents: 8 },
    { month: "Jun", uptime: 99.97, incidents: 5 },
  ];

  const incidentReductionData = [
    { month: "Jan", critical: 3, degraded: 12, minor: 9 },
    { month: "Feb", critical: 2, degraded: 10, minor: 7 },
    { month: "Mar", critical: 1, degraded: 8, minor: 5 },
    { month: "Apr", critical: 1, degraded: 6, minor: 4 },
    { month: "May", critical: 0, degraded: 5, minor: 3 },
    { month: "Jun", critical: 0, degraded: 3, minor: 2 },
  ];

  const automationImpactData = [
    { week: "Week 1", resolved: 15, manual: 8 },
    { week: "Week 2", resolved: 18, manual: 6 },
    { week: "Week 3", resolved: 22, manual: 5 },
    { week: "Week 4", resolved: 28, manual: 3 },
    { week: "Week 5", resolved: 32, manual: 2 },
    { week: "Week 6", resolved: 35, manual: 2 },
  ];

  const costEfficiencyData = [
    { month: "Jan", cost: 125000 },
    { month: "Feb", cost: 122000 },
    { month: "Mar", cost: 118000 },
    { month: "Apr", cost: 115000 },
    { month: "May", cost: 112000 },
    { month: "Jun", cost: 110000 },
  ];

  const mttrData = [
    { month: "Jan", mttr: 45 },
    { month: "Feb", mttr: 38 },
    { month: "Mar", mttr: 32 },
    { month: "Apr", mttr: 28 },
    { month: "May", mttr: 22 },
    { month: "Jun", mttr: 18 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Reports & Insights</h1>
        <p className="text-muted-foreground">
          Key metrics and insights on operational stability and AI impact
        </p>
      </div>

      {/* Filter Controls */}
      <div className="card-elevated p-4 space-y-4 rounded-xl border border-border/50 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium",
              showFilters
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-muted hover:bg-muted/70"
            )}
          >
            <Filter className="w-4 h-4" />
            <span>
              {filters.regions.length > 0 || filters.reportType.length > 0 ? `(${filters.regions.length + filters.reportType.length})` : "Filters"}
            </span>
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="border-t border-border pt-4 grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-2 uppercase tracking-wide">
                Region
              </label>
              <select
                multiple
                className="w-full px-2.5 py-2 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                value={filters.regions}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, (option) => option.value);
                  setFilters((prev) => ({ ...prev, regions: selected }));
                }}
              >
                <option value="NA">North America</option>
                <option value="EU">Europe</option>
                <option value="APAC">Asia Pacific</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-2 uppercase tracking-wide">
                Report Type
              </label>
              <select
                multiple
                className="w-full px-2.5 py-2 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                value={filters.reportType}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, (option) => option.value);
                  setFilters((prev) => ({ ...prev, reportType: selected }));
                }}
              >
                <option value="stability">Stability</option>
                <option value="incidents">Incidents</option>
                <option value="automation">Automation</option>
                <option value="costs">Cost Analysis</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-2 uppercase tracking-wide">
                Time Range
              </label>
              <select
                className="w-full px-2.5 py-2 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                value={filters.timeRange}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, timeRange: e.target.value as any }))
                }
              >
                <option value="24h">Last 24h</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
              </select>
            </div>
            <div className="md:col-span-3 flex items-end gap-2">
              <button
                onClick={() =>
                  setFilters({
                    regions: [],
                    reportType: [],
                    timeRange: "30d",
                  })
                }
                className="px-3 py-2 rounded-lg bg-muted hover:bg-muted/70 transition-all duration-200 text-xs font-medium"
              >
                Reset Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Key Metrics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-elevated p-6">
          <p className="text-sm font-medium text-muted-foreground">Avg Uptime (6mo)</p>
          <h3 className="text-3xl font-bold mt-2 status-healthy">98.9%</h3>
          <p className="text-xs text-muted-foreground mt-2">↑ 2.1% vs last year</p>
        </div>
        <div className="card-elevated p-6">
          <p className="text-sm font-medium text-muted-foreground">Incident Reduction</p>
          <h3 className="text-3xl font-bold mt-2 status-healthy">79%</h3>
          <p className="text-xs text-muted-foreground mt-2">vs 6 months ago</p>
        </div>
        <div className="card-elevated p-6">
          <p className="text-sm font-medium text-muted-foreground">Avg MTTR</p>
          <h3 className="text-3xl font-bold mt-2">18 min</h3>
          <p className="text-xs text-muted-foreground mt-2">↓ 60% improvement</p>
        </div>
        <div className="card-elevated p-6">
          <p className="text-sm font-medium text-muted-foreground">Cost Savings</p>
          <h3 className="text-3xl font-bold mt-2 status-healthy">$15K</h3>
          <p className="text-xs text-muted-foreground mt-2">This month</p>
        </div>
      </div>

      {/* Vendor Comparison Section - Only show when vendor filter is applied */}
      {filters.reportType.includes("vendors") && (
        <VendorComparison
          vendors={vendorMetrics}
          title="Vendor Performance Comparison Report"
          showRanking={true}
          selectedRegions={filters.regions}
          isMixedEnvironment={false}
        />
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stability Trend */}
        <div className="card-elevated p-6">
          <h3 className="font-semibold text-lg mb-4">Stability Trend (6 months)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={stabilityData}>
              <defs>
                <linearGradient id="colorStability" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--status-healthy))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--status-healthy))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" domain={[97, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Area
                type="monotone"
                dataKey="uptime"
                stroke="hsl(var(--status-healthy))"
                fillOpacity={1}
                fill="url(#colorStability)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* MTTR Improvement */}
        <div className="card-elevated p-6">
          <h3 className="font-semibold text-lg mb-4">MTTR Improvement (minutes)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={mttrData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Line
                type="monotone"
                dataKey="mttr"
                stroke="hsl(var(--accent))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--accent))", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Incident Severity Distribution */}
        <div className="card-elevated p-6">
          <h3 className="font-semibold text-lg mb-4">Incident Reduction by Severity</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={incidentReductionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Bar dataKey="critical" stackId="a" fill="hsl(var(--status-critical))" />
              <Bar dataKey="degraded" stackId="a" fill="hsl(var(--status-degraded))" />
              <Bar dataKey="minor" stackId="a" fill="hsl(var(--accent))" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Cost Optimization */}
        <div className="card-elevated p-6">
          <h3 className="font-semibold text-lg mb-4">Monthly Operational Cost</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={costEfficiencyData}>
              <defs>
                <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                formatter={(value) => `$${value.toLocaleString()}`}
              />
              <Area
                type="monotone"
                dataKey="cost"
                stroke="hsl(var(--accent))"
                fillOpacity={1}
                fill="url(#colorCost)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Automation Impact */}
      <div className="card-elevated p-6">
        <h3 className="font-semibold text-lg mb-4">AI Automation Impact</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={automationImpactData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" />
            <YAxis stroke="hsl(var(--muted-foreground))" />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Bar dataKey="resolved" fill="hsl(var(--status-healthy))" name="AI Auto-Resolved" />
            <Bar dataKey="manual" fill="hsl(var(--status-degraded))" name="Manual Intervention" />
          </BarChart>
        </ResponsiveContainer>
        <p className="text-sm text-muted-foreground mt-4">
          <strong>94%</strong> of incidents are now resolved automatically by AI agents, reducing manual intervention by 88%.
        </p>
      </div>

      {/* Key Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card-elevated p-6">
          <h3 className="font-semibold text-lg mb-3">Key Achievements</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex gap-2">
              <span className="text-accent font-bold">✓</span>
              <span>Uptime improved from 95.7% to 99.97% YoY</span>
            </li>
            <li className="flex gap-2">
              <span className="text-accent font-bold">✓</span>
              <span>Average resolution time reduced by 60%</span>
            </li>
            <li className="flex gap-2">
              <span className="text-accent font-bold">✓</span>
              <span>Incident count down 79% with AI automation</span>
            </li>
            <li className="flex gap-2">
              <span className="text-accent font-bold">✓</span>
              <span>Operational costs reduced by $15K/month</span>
            </li>
          </ul>
        </div>

        <div className="card-elevated p-6">
          <h3 className="font-semibold text-lg mb-3">Recommendations</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex gap-2">
              <span className="text-accent font-bold">→</span>
              <span>Expand AI automation to compliance monitoring</span>
            </li>
            <li className="flex gap-2">
              <span className="text-accent font-bold">→</span>
              <span>Implement predictive capacity planning</span>
            </li>
            <li className="flex gap-2">
              <span className="text-accent font-bold">→</span>
              <span>Deploy advanced anomaly detection models</span>
            </li>
            <li className="flex gap-2">
              <span className="text-accent font-bold">→</span>
              <span>Enable cross-region failover automation</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
