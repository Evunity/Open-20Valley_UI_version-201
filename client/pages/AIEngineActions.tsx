import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Download, Pause, Play, AlertCircle, Zap, TrendingUp, CheckCircle, X } from "lucide-react";
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
import KPICard from "@/components/KPICard";
import SearchableDropdown from "@/components/SearchableDropdown";
import ActionDrillInModal from "@/components/ActionDrillInModal";
import { useGlobalFilters } from "@/hooks/useGlobalFilters";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from "xlsx";
import {
  generateAIHealthKPIs,
  generateAutomationActions,
  generateAutomationTrend,
  generateIncidentReductionTrend,
  generateReliabilityData,
  generateExecutionModeDistribution,
  generateAIInsights,
  generateFailureIntelligence,
  generateImpactVisualizationData,
  generateKPIImpactSummary,
  type AutomationAction,
} from "@/utils/aiAutomationData";
import { cn } from "@/lib/utils";

const ACTION_TYPES = ["Detection", "Recommendation", "Automated Action", "Scheduled"];
const EXECUTION_MODES = ["Insight Only", "Approval-Based", "Fully Automated"];
const STATUSES = ["Success", "Failed", "Rolled Back", "Running"];

const PI_COLORS = ["#22c55e", "#ef4444", "#8b5cf6"];

export default function AIEngineActions() {
  const { toast } = useToast();
  const { filters } = useGlobalFilters();

  // Local filters
  const [actionFilters, setActionFilters] = useState({
    types: [] as string[],
    executionModes: [] as string[],
    statuses: [] as string[],
  });

  // Modal state
  const [selectedAction, setSelectedAction] = useState<AutomationAction | null>(null);
  const [isDrillInOpen, setIsDrillInOpen] = useState(false);

  // Auto-refresh state
  const [isAutoRefreshing, setIsAutoRefreshing] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5);

  // Export state
  const [exportFormat, setExportFormat] = useState<"xlsx" | "csv">("xlsx");

  // Generate all data
  const kpis = useMemo(() => generateAIHealthKPIs(filters), [filters]);
  const allActions = useMemo(() => generateAutomationActions(filters), [filters]);
  const successFailureTrend = useMemo(() => generateAutomationTrend(filters), [filters]);
  const incidentReductionTrend = useMemo(() => generateIncidentReductionTrend(), []);
  const reliabilityData = useMemo(() => generateReliabilityData(), []);
  const executionModes = useMemo(() => generateExecutionModeDistribution(), []);
  const insights = useMemo(() => generateAIInsights(), []);
  const failures = useMemo(() => generateFailureIntelligence(filters), [filters]);
  const impactData = useMemo(() => generateImpactVisualizationData(), []);
  const kpiImpacts = useMemo(() => generateKPIImpactSummary(), []);

  // Filter actions based on local filters
  const filteredActions = useMemo(() => {
    return allActions.filter((action) => {
      const typeMatch = actionFilters.types.length === 0 || actionFilters.types.some((t) => {
        if (t === "Detection") return action.category === "detection";
        if (t === "Recommendation") return action.category === "recommendation";
        if (t === "Automated Action") return action.category === "automation";
        return false;
      });

      const modeMatch = actionFilters.executionModes.length === 0 || actionFilters.executionModes.some((m) => {
        if (m === "Insight Only") return action.automationLevel === "insight_only";
        if (m === "Approval-Based") return action.automationLevel === "recommendation_only";
        if (m === "Fully Automated") return action.automationLevel === "auto_executed";
        return false;
      });

      const statusMatch = actionFilters.statuses.length === 0 || actionFilters.statuses.some((s) => {
        if (s === "Success") return action.result === "successful";
        if (s === "Failed") return action.result === "failed";
        if (s === "Rolled Back") return action.result === "partial";
        if (s === "Running") return action.result === "partial";
        return false;
      });

      return typeMatch && modeMatch && statusMatch;
    });
  }, [allActions, actionFilters]);

  const getStatusColor = (result: string) => {
    switch (result) {
      case "successful":
        return "bg-green-500/10 text-green-700 border border-green-500/30";
      case "failed":
        return "bg-red-500/10 text-red-700 border border-red-500/30";
      case "partial":
        return "bg-orange-500/10 text-orange-700 border border-orange-500/30";
      default:
        return "bg-gray-500/10 text-gray-700";
    }
  };

  const getExecutionModeLabel = (level: string) => {
    switch (level) {
      case "insight_only":
        return "Insight";
      case "recommendation_only":
        return "Approved";
      case "auto_executed":
        return "Auto";
      default:
        return level;
    }
  };

  const getReliabilityAlert = () => {
    const successRate = reliabilityData[0].value;
    if (successRate < 90) {
      return (
        <div className="flex items-start gap-3 p-4 rounded-lg bg-orange-500/10 border border-orange-500/30">
          <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-orange-700">
            Automation success rate dropped below normal range. Consider reviewing recent actions.
          </p>
        </div>
      );
    }
    return null;
  };

  const failureRate = kpis.failed_automations.value > 0
    ? (kpis.failed_automations.value / kpis.total_actions.value) * 100
    : 0;

  const getFailureRateColor = (rate: number) => {
    if (rate < 2) return "text-green-600 bg-green-500/10";
    if (rate < 5) return "text-orange-600 bg-orange-500/10";
    return "text-red-600 bg-red-500/10";
  };

  const handleExport = () => {
    const timestamp = new Date().toISOString().split("T")[0];

    // Prepare action history data
    const actionData = filteredActions.map((action) => ({
      ID: action.id,
      Action: action.action,
      Category: action.category,
      Scope: action.scope,
      Confidence: `${action.confidence.toFixed(0)}%`,
      ExecutionMode: action.automationLevel,
      Result: action.result,
      Timestamp: new Date(action.timestamp).toLocaleString(),
    }));

    // Prepare failures data
    const failureData = failures.map((failure) => ({
      ID: failure.id,
      Action: failure.action,
      FailureCause: failure.failureCause,
      RolledBack: failure.rolledBack ? "Yes" : "No",
      Severity: failure.severity,
      Scope: failure.scope,
      Timestamp: new Date(failure.timestamp).toLocaleString(),
    }));

    // Prepare KPI impact data
    const impactData = kpiImpacts.map((impact) => ({
      KPI: impact.kpi,
      Before: impact.before,
      After: impact.after,
      ImprovementPercent: `${impact.improvement}%`,
      Unit: impact.unit,
      Description: impact.description,
      AutomationTime: impact.automationTime,
    }));

    if (exportFormat === "csv") {
      // Export as CSV
      const sections = [
        ["AI ENGINE ACTIONS"],
        ["ID", "Action", "Category", "Scope", "Confidence", "Execution Mode", "Result", "Timestamp"],
        ...actionData.map((d) => Object.values(d)),
        [],
        ["FAILED AUTOMATIONS"],
        ["ID", "Action", "Failure Cause", "Rolled Back", "Severity", "Scope", "Timestamp"],
        ...failureData.map((d) => Object.values(d)),
        [],
        ["KPI IMPACT SUMMARY"],
        ["KPI", "Before", "After", "Improvement %", "Unit", "Description", "Automation Time"],
        ...impactData.map((d) => Object.values(d)),
      ];

      const csvContent = sections
        .map((row) => row.map((cell) => `"${cell}"`).join(","))
        .join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `AIEngine-${timestamp}.csv`);
      link.click();
    } else {
      // Export as Excel
      const wb = XLSX.utils.book_new();

      const actionsSheet = XLSX.utils.json_to_sheet(actionData);
      XLSX.utils.book_append_sheet(wb, actionsSheet, "Actions");

      const failuresSheet = XLSX.utils.json_to_sheet(failureData);
      XLSX.utils.book_append_sheet(wb, failuresSheet, "Failures");

      const impactSheet = XLSX.utils.json_to_sheet(impactData);
      XLSX.utils.book_append_sheet(wb, impactSheet, "Impact");

      XLSX.writeFile(wb, `AIEngine-${timestamp}.xlsx`);
    }

    toast({
      title: "Export successful",
      description: `AI Engine data has been exported as ${exportFormat.toUpperCase()}`,
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
                <span>AI & Automation Engine</span>
              </div>
              <h1 className="text-3xl font-bold text-foreground">AI & Automation Engine</h1>
              <p className="text-muted-foreground">
                Real-time AI-driven actions, recommendations, and automation performance
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAutoRefreshing(!isAutoRefreshing)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg transition-colors",
                  isAutoRefreshing
                    ? "bg-primary/10 text-primary hover:bg-primary/20"
                    : "bg-muted text-muted-foreground hover:bg-muted/70"
                )}
                title={isAutoRefreshing ? "Pause auto-refresh" : "Resume auto-refresh"}
              >
                {isAutoRefreshing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isAutoRefreshing ? "Live" : "Paused"}
              </button>
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value as "xlsx" | "csv")}
                className="px-3 py-2 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-primary/50"
              >
                <option value="xlsx">Excel (.xlsx)</option>
                <option value="csv">CSV (.csv)</option>
              </select>
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Global Filters */}
        <FilterPanel />

        {/* AI Engine Specific Filters */}
        <div className="px-8 py-4 border-t border-border/50 space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">AI Engine Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <SearchableDropdown
              label="Action Type"
              options={ACTION_TYPES}
              selected={actionFilters.types}
              onChange={(selected) => setActionFilters(prev => ({ ...prev, types: selected }))}
              placeholder="All types"
            />
            <SearchableDropdown
              label="Execution Mode"
              options={EXECUTION_MODES}
              selected={actionFilters.executionModes}
              onChange={(selected) => setActionFilters(prev => ({ ...prev, executionModes: selected }))}
              placeholder="All modes"
            />
            <SearchableDropdown
              label="Status"
              options={STATUSES}
              selected={actionFilters.statuses}
              onChange={(selected) => setActionFilters(prev => ({ ...prev, statuses: selected }))}
              placeholder="All statuses"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-8 py-8 space-y-10">

        {/* Section 4.2: Executive AI Health Cards */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">AI Health Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <KPICard
              icon={Zap}
              label="Total AI Actions"
              value={kpis.total_actions.value}
              unit="actions"
              change={kpis.total_actions.change}
              status={kpis.total_actions.status}
              direction={kpis.total_actions.change > 0 ? "up" : "down"}
            />
            <KPICard
              icon={CheckCircle}
              label="Autonomous Actions"
              value={kpis.autonomous_actions.value}
              unit={kpis.autonomous_actions.label}
              change={kpis.autonomous_actions.change}
              status={kpis.autonomous_actions.status}
              direction={kpis.autonomous_actions.change > 0 ? "up" : "down"}
            />
            <KPICard
              icon={TrendingUp}
              label="Recommendations"
              value={kpis.recommendations_generated.value}
              unit="generated"
              change={kpis.recommendations_generated.change}
              status={kpis.recommendations_generated.status}
              direction={kpis.recommendations_generated.change > 0 ? "up" : "down"}
            />
            <KPICard
              icon={AlertCircle}
              label="Failed Automations"
              value={kpis.failed_automations.value}
              unit={`${failureRate.toFixed(1)}%`}
              change={kpis.failed_automations.change}
              status={kpis.failed_automations.status}
              direction={kpis.failed_automations.change < 0 ? "down" : "up"}
            />
            <div className={cn(
              "card-elevated rounded-xl border border-border/50 p-6 flex flex-col justify-between",
              kpis.rollbacks_triggered.value > 50 ? "bg-red-500/5" : "bg-orange-500/5"
            )}>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Rollbacks Triggered</p>
                <div className="flex items-end gap-3">
                  <span className="text-3xl font-bold text-foreground">{kpis.rollbacks_triggered.value}</span>
                  <span className={cn(
                    "text-xs font-semibold px-2.5 py-1 rounded",
                    kpis.rollbacks_triggered.change > 0 ? "text-orange-600 bg-orange-500/10" : "text-green-600 bg-green-500/10"
                  )}>
                    {kpis.rollbacks_triggered.change > 0 ? "↑" : "↓"} {Math.abs(kpis.rollbacks_triggered.change)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4.3: Action Stream */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground">Action Stream</h2>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className={cn(
                "w-2 h-2 rounded-full",
                isAutoRefreshing ? "bg-green-600 animate-pulse" : "bg-gray-400"
              )} />
              {isAutoRefreshing ? "Live" : "Paused"}
            </div>
          </div>
          
          <div className="card-elevated rounded-xl border border-border/50 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr className="border-b border-border/50">
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Action</th>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Detected Issue</th>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Scope</th>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Confidence</th>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Execution Mode</th>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Duration</th>
                </tr>
              </thead>
              <tbody>
                {filteredActions.map((action) => (
                  <tr
                    key={action.id}
                    onClick={() => {
                      setSelectedAction(action);
                      setIsDrillInOpen(true);
                    }}
                    className="border-b border-border/30 hover:bg-muted/30 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-4 text-foreground">{action.action.substring(0, 35)}</td>
                    <td className="py-3 px-4 text-muted-foreground text-xs">{action.action}</td>
                    <td className="py-3 px-4 text-muted-foreground text-xs">{action.scope}</td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-2 py-1 rounded bg-blue-500/10 text-blue-700 text-xs font-semibold">
                        {action.confidence.toFixed(0)}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-muted-foreground">
                      {getExecutionModeLabel(action.automationLevel)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={cn(
                        "px-2.5 py-1 rounded text-xs font-semibold",
                        getStatusColor(action.result)
                      )}>
                        {action.result}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground text-xs">
                      {Math.floor(Math.random() * 60 + 5)}s
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 4.4: Automation Effectiveness */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-foreground">Automation Effectiveness</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Success vs Failure Trend */}
            <div className="card-elevated rounded-xl border border-border/50 p-6">
              <h3 className="text-lg font-bold text-foreground mb-4">Success vs Failure Trend</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={successFailureTrend} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="timestamp" stroke="hsl(var(--muted-foreground))" style={{ fontSize: "12px" }} />
                  <YAxis stroke="hsl(var(--muted-foreground))" style={{ fontSize: "12px" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="successful" stroke="#22c55e" dot={false} strokeWidth={2} name="Successful" />
                  <Line type="monotone" dataKey="failed" stroke="#ef4444" dot={false} strokeWidth={2} name="Failed" />
                  <Line type="monotone" dataKey="rolled_back" stroke="#8b5cf6" dot={false} strokeWidth={2} name="Rolled Back" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Repeated Incident Reduction */}
            <div className="card-elevated rounded-xl border border-border/50 p-6">
              <h3 className="text-lg font-bold text-foreground mb-4">Repeated Incident Reduction</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={incidentReductionTrend} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="timestamp" stroke="hsl(var(--muted-foreground))" style={{ fontSize: "12px" }} />
                  <YAxis stroke="hsl(var(--muted-foreground))" style={{ fontSize: "12px" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="repeated_incidents_prevented" fill="#10b981" name="Incidents Prevented" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Section 4.5: Automation Reliability */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-foreground">Automation Reliability</h2>

          {getReliabilityAlert()}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Success vs Failure Rate */}
            <div className="card-elevated rounded-xl border border-border/50 p-6">
              <h3 className="text-lg font-bold text-foreground mb-4">Success vs Failure Rate</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={reliabilityData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category, percentage }) => `${category} ${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {reliabilityData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PI_COLORS[index % PI_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Human Intervention Rate */}
            <div className="card-elevated rounded-xl border border-border/50 p-6">
              <h3 className="text-lg font-bold text-foreground mb-4">Human Intervention Rate</h3>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Automation Handled</span>
                    <span className="text-2xl font-bold text-green-600">94%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                    <div className="bg-green-600 h-full" style={{ width: "94%" }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Manual Intervention Required</span>
                    <span className="text-2xl font-bold text-orange-600">6%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                    <div className="bg-orange-600 h-full" style={{ width: "6%" }} />
                  </div>
                </div>
                <div className="pt-4 border-t border-border/50">
                  <p className="text-xs text-muted-foreground mb-3">
                    Over the last 30 days, the automation engine has independently handled 94% of all actions, requiring human intervention in only 6% of cases.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4.6: Execution Mode Distribution */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Execution Mode Distribution</h2>
          <div className="card-elevated rounded-xl border border-border/50 p-6">
            <h3 className="text-lg font-bold text-foreground mb-4">Automation Maturity</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={executionModes}
                margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="mode" stroke="hsl(var(--muted-foreground))" style={{ fontSize: "12px" }} />
                <YAxis stroke="hsl(var(--muted-foreground))" style={{ fontSize: "12px" }} label={{ value: "% of Actions", angle: -90, position: "insideLeft" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  formatter={(value) => [`${value.toFixed(1)}%`, "Percentage"]}
                />
                <Bar dataKey="percentage" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Section 4.7: Failure Intelligence */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Failure Intelligence</h2>
          <div className="card-elevated rounded-xl border border-border/50 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr className="border-b border-border/50">
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Action</th>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Failure Cause</th>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Scope</th>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Severity</th>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Rolled Back</th>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {failures.map((failure) => (
                  <tr key={failure.id} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 text-foreground font-medium">{failure.action}</td>
                    <td className="py-3 px-4 text-red-600">{failure.failureCause}</td>
                    <td className="py-3 px-4 text-muted-foreground text-xs">{failure.scope}</td>
                    <td className="py-3 px-4">
                      <span className={cn(
                        "px-2.5 py-1 rounded text-xs font-semibold",
                        failure.severity === "critical"
                          ? "bg-red-500/10 text-red-700"
                          : failure.severity === "major"
                            ? "bg-orange-500/10 text-orange-700"
                            : "bg-blue-500/10 text-blue-700"
                      )}>
                        {failure.severity}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={cn(
                        "px-2.5 py-1 rounded text-xs font-semibold",
                        failure.rolledBack ? "bg-orange-500/10 text-orange-700" : "bg-green-500/10 text-green-700"
                      )}>
                        {failure.rolledBack ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground text-xs">
                      {new Date(failure.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 4.8: Impact Visualization */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-foreground">Impact Visualization</h2>

          {/* Impact Summary Card */}
          <div className="card-elevated rounded-xl border border-border/50 p-6 bg-gradient-to-r from-green-500/5 to-blue-500/5">
            <div className="space-y-4">
              <p className="text-lg font-bold text-foreground">Automation Impact</p>
              <p className="text-muted-foreground">
                Automation prevented approximately <strong className="text-green-600">320 minutes</strong> of potential downtime this week and improved network KPIs across <strong className="text-green-600">14 clusters</strong>.
              </p>
            </div>
          </div>

          {/* KPI Before/After Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {kpiImpacts.map((impact) => (
              <div
                key={impact.kpi}
                className="card-elevated rounded-xl border border-border/50 p-5 hover:shadow-md transition-shadow"
              >
                <p className="text-sm font-bold text-foreground mb-3">{impact.kpi}</p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Before</span>
                    <span className="text-sm font-semibold text-foreground">
                      {impact.before}{impact.unit}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">After</span>
                    <span className="text-sm font-semibold text-green-600">
                      {impact.after}{impact.unit}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-border/50">
                    <p className="text-xs text-green-600 font-bold mb-1">
                      ↓ {impact.improvement}% Improvement
                    </p>
                    <p className="text-xs text-muted-foreground">{impact.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* KPI Trend Chart */}
          <div className="card-elevated rounded-xl border border-border/50 p-6">
            <h3 className="text-lg font-bold text-foreground mb-4">KPI Trend with Automation Markers</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={impactData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="timestamp" stroke="hsl(var(--muted-foreground))" style={{ fontSize: "12px" }} />
                <YAxis stroke="hsl(var(--muted-foreground))" style={{ fontSize: "12px" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="latency" stroke="#3b82f6" dot={false} strokeWidth={2} name="Latency (ms)" />
                <Line type="monotone" dataKey="packet_loss" stroke="#ef4444" dot={false} strokeWidth={2} name="Packet Loss %" />
                <Line type="monotone" dataKey="availability" stroke="#22c55e" dot={false} strokeWidth={2} name="Availability %" />
              </LineChart>
            </ResponsiveContainer>
            <p className="text-xs text-muted-foreground mt-4 text-center">
              Vertical markers indicate automation executed. Improved metrics follow automation execution.
            </p>
          </div>
        </div>

      </div>

      {/* Action Drill-In Modal */}
      <ActionDrillInModal
        isOpen={isDrillInOpen}
        onClose={() => {
          setIsDrillInOpen(false);
          setSelectedAction(null);
        }}
        action={selectedAction}
      />
    </div>
  );
}
