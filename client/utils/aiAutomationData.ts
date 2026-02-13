import { GlobalFilterState } from "@/hooks/useGlobalFilters";

export interface AIActivityKPI {
  value: number;
  change: number;
  status: "healthy" | "improving" | "degrading";
}

export interface AutomationAction {
  id: string;
  action: string;
  category: "detection" | "recommendation" | "automation";
  scope: string;
  automationLevel: "insight_only" | "recommendation_only" | "auto_executed";
  priority: "critical" | "major" | "minor";
  result: "successful" | "partial" | "failed";
  timestamp: string;
  confidence: number;
  impact?: string;
}

export interface PerformanceMetric {
  name: string;
  value: number;
  previous: number;
  improvement: number;
  status: "improving" | "stable" | "declining";
}

export interface ConfidenceDataPoint {
  timestamp: string;
  overall_confidence: number;
  high_confidence_detections: number;
  low_confidence_detections: number;
  decision_stability: number;
}

export interface AIInsight {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  impact: "high" | "medium" | "low";
  metricAffected: string;
  percentageChange: number;
}

export interface AIHealthKPI {
  value: number;
  change: number;
  status: "healthy" | "critical" | "degraded";
  label?: string;
}

export interface TrendDataPoint {
  timestamp: string;
  successful?: number;
  failed?: number;
  rolled_back?: number;
  repeated_incidents_prevented?: number;
}

export interface ReliabilityData {
  category: string;
  value: number;
  percentage: string;
}

export interface ExecutionModeDistribution {
  mode: string;
  value: number;
  percentage: number;
}

export interface FailureRecord {
  id: string;
  action: string;
  failureCause: string;
  rolledBack: boolean;
  timestamp: string;
  scope: string;
  severity: "critical" | "major" | "minor";
}

export interface ImpactDataPoint {
  timestamp: string;
  drop_rate?: number;
  throughput?: number;
  latency?: number;
  packet_loss?: number;
  availability?: number;
  mttr?: number;
}

export interface KPIImpact {
  kpi: string;
  before: number;
  after: number;
  improvement: number;
  unit: string;
  description: string;
  automationTime?: string;
}

/**
 * Generate AI & Automation Activity KPIs
 */
export const generateAIActivityKPIs = (filters: GlobalFilterState): Record<string, AIActivityKPI> => {
  const filterImpact = 1 + (filters.vendors.length * 0.05 + filters.technologies.length * 0.03);

  return {
    total_actions: {
      value: Math.round((284 + Math.random() * 50) * filterImpact),
      change: 12.5,
      status: "improving",
    },
    insights_recommendations: {
      value: Math.round((156 + Math.random() * 30) * filterImpact),
      change: 18.2,
      status: "improving",
    },
    automated_executed: {
      value: Math.round((128 + Math.random() * 25) * filterImpact),
      change: 8.7,
      status: "improving",
    },
    failed_aborted: {
      value: Math.round((4 + Math.random() * 8) * filterImpact),
      change: -2.3,
      status: "improving",
    },
  };
};

/**
 * Generate Recent AI & Automation Actions Timeline
 */
export const generateAutomationActions = (filters: GlobalFilterState): AutomationAction[] => {
  const actions: AutomationAction[] = [];
  const now = new Date();
  const scopes = ["North Region", "East Region", "Vendor Ericsson", "Technology 5G", "Cluster A"];
  const actions_list = [
    "Detected alarm surge in network",
    "Recommended optimization for 3G backhaul",
    "Auto-mitigated capacity stress",
    "Identified vendor performance anomaly",
    "Recommended SLA review",
    "Auto-executed failover action",
    "Detected recurring incident pattern",
    "Recommended configuration update",
    "Auto-rerouted traffic",
    "Detected availability degradation",
  ];

  for (let i = 0; i < 12; i++) {
    const hoursAgo = Math.floor(Math.random() * 24);
    const timestamp = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);

    const categories: ("detection" | "recommendation" | "automation")[] = [
      "detection",
      "recommendation",
      "automation",
    ];
    const levels: ("insight_only" | "recommendation_only" | "auto_executed")[] = [
      "insight_only",
      "recommendation_only",
      "auto_executed",
    ];
    const results: ("successful" | "partial" | "failed")[] = ["successful", "partial", "failed"];
    const priorities: ("critical" | "major" | "minor")[] = ["critical", "major", "minor"];

    const category = categories[Math.floor(Math.random() * categories.length)];
    const automationLevel = levels[Math.floor(Math.random() * levels.length)];
    const result = results[Math.random() > 0.85 ? 0 : Math.random() > 0.5 ? 1 : 2];
    const priority = priorities[Math.floor(Math.random() * priorities.length)];

    actions.push({
      id: `action-${i}`,
      action: actions_list[Math.floor(Math.random() * actions_list.length)],
      category,
      scope: scopes[Math.floor(Math.random() * scopes.length)],
      automationLevel,
      priority,
      result,
      timestamp: timestamp.toISOString(),
      confidence: 85 + Math.random() * 15,
      impact: category === "automation" ? `${15 + Math.random() * 40}% reduction in MTTR` : undefined,
    });
  }

  return actions.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
};

/**
 * Generate Automation Performance Metrics
 */
export const generatePerformanceMetrics = (): PerformanceMetric[] => {
  return [
    {
      name: "Automation Success Rate",
      value: 97.8,
      previous: 95.2,
      improvement: 2.6,
      status: "improving",
    },
    {
      name: "Avg Execution Confidence",
      value: 91.4,
      previous: 88.7,
      improvement: 2.7,
      status: "improving",
    },
    {
      name: "Mean Time to Resolution",
      value: 32,
      previous: 48,
      improvement: 33.3,
      status: "improving",
    },
    {
      name: "Repeated Issues Resolved",
      value: 78,
      previous: 64,
      improvement: 21.9,
      status: "improving",
    },
  ];
};

/**
 * Generate AI Confidence & Learning Signals data
 */
export const generateConfidenceTrend = (filters: GlobalFilterState): ConfidenceDataPoint[] => {
  const points: ConfidenceDataPoint[] = [];
  const now = new Date();
  const daysToGenerate = 30;

  for (let i = daysToGenerate - 1; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = timestamp.toISOString().split("T")[0];

    const baseConfidence = 88 + Math.sin(i / 8) * 3;
    const multiplier = 1 - (filters.vendors.length * 0.01 + filters.technologies.length * 0.005);

    const totalDetections = 25 + Math.floor(Math.random() * 15);
    const highConfidence = Math.floor(totalDetections * (0.7 + Math.random() * 0.2));

    points.push({
      timestamp: dateStr,
      overall_confidence: Math.max(75, Math.min(100, baseConfidence * multiplier + Math.random() * 2)),
      high_confidence_detections: highConfidence,
      low_confidence_detections: totalDetections - highConfidence,
      decision_stability: 92 + Math.random() * 6,
    });
  }

  return points;
};

/**
 * Generate AI & Automation Insights
 */
export const generateAIInsights = (): AIInsight[] => {
  const now = new Date();

  return [
    {
      id: "insight-1",
      title: "Automation Reduced Recovery Time",
      description:
        "Automation has reduced mean time to resolution for backhaul incidents by 32% over the past 30 days.",
      timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      impact: "high",
      metricAffected: "Mean Time to Resolution",
      percentageChange: -32,
    },
    {
      id: "insight-2",
      title: "High-Confidence Detections Increasing",
      description:
        "High-confidence detections for core network KPIs have increased by 28%, indicating improved AI learning stability.",
      timestamp: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(),
      impact: "high",
      metricAffected: "Detection Confidence",
      percentageChange: 28,
    },
    {
      id: "insight-3",
      title: "Repeated Issues Auto-Mitigated",
      description:
        "AI successfully identified and auto-mitigated 156 instances of recurring alarm patterns without operator intervention.",
      timestamp: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(),
      impact: "high",
      metricAffected: "Repeated Issues Resolved",
      percentageChange: 22,
    },
    {
      id: "insight-4",
      title: "Manual Intervention Reduced",
      description:
        "Manual intervention required in only 2.1% of automation attempts, indicating high reliability of automated actions.",
      timestamp: new Date(now.getTime() - 8 * 60 * 60 * 1000).toISOString(),
      impact: "medium",
      metricAffected: "Automation Success Rate",
      percentageChange: -97.9,
    },
    {
      id: "insight-5",
      title: "Decision Stability Improved",
      description:
        "AI decision stability has improved by 5.8% week-over-week, showing increased consistency in anomaly detection.",
      timestamp: new Date(now.getTime() - 10 * 60 * 60 * 1000).toISOString(),
      impact: "medium",
      metricAffected: "Decision Stability",
      percentageChange: 5.8,
    },
  ];
};

/**
 * Generate AI Health KPIs for section 4.2
 */
export const generateAIHealthKPIs = (filters: GlobalFilterState): Record<string, AIHealthKPI> => {
  const filterImpact = 1 + filters.vendors.length * 0.05 + filters.technologies.length * 0.03;

  const totalActions = Math.round((12842 + Math.random() * 500) * filterImpact);
  const autonomousActions = Math.round(totalActions * 0.24);
  const failedCount = Math.round(totalActions * 0.007);
  const rollbackCount = Math.round(totalActions * 0.0015);

  return {
    total_actions: {
      value: totalActions,
      change: 14.2,
      status: "healthy",
    },
    autonomous_actions: {
      value: autonomousActions,
      change: 8.5,
      status: "healthy",
      label: `${Math.round((autonomousActions / totalActions) * 100)}% of all actions`,
    },
    recommendations_generated: {
      value: Math.round((5221 + Math.random() * 200) * filterImpact),
      change: 5.3,
      status: "healthy",
    },
    failed_automations: {
      value: failedCount,
      change: -2.1,
      status: failedCount / totalActions < 0.02 ? "healthy" : failedCount / totalActions < 0.05 ? "degraded" : "critical",
    },
    rollbacks_triggered: {
      value: rollbackCount,
      change: 1.8,
      status: rollbackCount / totalActions < 0.01 ? "healthy" : "degraded",
    },
  };
};

/**
 * Generate Success vs Failure Trend (section 4.4)
 */
export const generateAutomationTrend = (filters: GlobalFilterState): TrendDataPoint[] => {
  const points: TrendDataPoint[] = [];
  const now = new Date();
  const daysToGenerate = 30;

  for (let i = daysToGenerate - 1; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = timestamp.toISOString().split("T")[0];

    const baseSuccess = 90 + Math.sin(i / 10) * 5;
    const multiplier = 1 + (filters.vendors.length * 0.03 + filters.technologies.length * 0.02);

    const successful = Math.round((baseSuccess * multiplier + Math.random() * 5) * 1.2);
    const failed = Math.max(0, Math.round(successful * (0.05 + Math.random() * 0.08)));
    const rolled_back = Math.max(0, Math.round(successful * (0.01 + Math.random() * 0.03)));

    points.push({
      timestamp: dateStr,
      successful,
      failed,
      rolled_back,
    });
  }

  return points;
};

/**
 * Generate Repeated Incident Reduction data (section 4.4)
 */
export const generateIncidentReductionTrend = (): TrendDataPoint[] => {
  const points: TrendDataPoint[] = [];
  const now = new Date();

  for (let i = 29; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = timestamp.toISOString().split("T")[0];

    const basePrevention = 50 + Math.sin(i / 8) * 15 + i * 0.5;
    const prevented = Math.round(Math.max(40, Math.min(100, basePrevention)));

    points.push({
      timestamp: dateStr,
      repeated_incidents_prevented: prevented,
    });
  }

  return points;
};

/**
 * Generate Automation Reliability Data (section 4.5)
 */
export const generateReliabilityData = (): ReliabilityData[] => {
  const successful = 94;
  const failed = 4;
  const rolled_back = 2;

  return [
    { category: "Successful Actions", value: successful, percentage: `${successful}%` },
    { category: "Failed", value: failed, percentage: `${failed}%` },
    { category: "Rolled Back", value: rolled_back, percentage: `${rolled_back}%` },
  ];
};

/**
 * Generate Execution Mode Distribution (section 4.6)
 */
export const generateExecutionModeDistribution = (): ExecutionModeDistribution[] => {
  const total = 100;
  const insight = 40;
  const approved = 35;
  const automated = 25;

  return [
    { mode: "Insight Only", value: insight, percentage: (insight / total) * 100 },
    { mode: "Approval-Based", value: approved, percentage: (approved / total) * 100 },
    { mode: "Fully Automated", value: automated, percentage: (automated / total) * 100 },
  ];
};

/**
 * Generate Failure Intelligence Data (section 4.7)
 */
export const generateFailureIntelligence = (filters: GlobalFilterState): FailureRecord[] => {
  const failures: FailureRecord[] = [];
  const causes = [
    "Script timeout",
    "Device unreachable",
    "Parameter conflict",
    "Dependency missing",
    "Authentication failed",
    "Network timeout",
    "Resource unavailable",
  ];
  const scopes = ["DEL Cluster", "BLR Cluster", "Mumbai Region", "North Zone", "East Region"];
  const severities: ("critical" | "major" | "minor")[] = ["critical", "major", "minor"];
  const now = new Date();

  for (let i = 0; i < 8; i++) {
    const hoursAgo = Math.floor(Math.random() * 48);
    const timestamp = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);

    failures.push({
      id: `failure-${i}`,
      action: `Action ${i + 1}`,
      failureCause: causes[Math.floor(Math.random() * causes.length)],
      rolledBack: Math.random() > 0.6,
      timestamp: timestamp.toISOString(),
      scope: scopes[Math.floor(Math.random() * scopes.length)],
      severity: severities[Math.floor(Math.random() * severities.length)],
    });
  }

  return failures.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
};

/**
 * Generate Impact Visualization Data (section 4.8)
 */
export const generateImpactVisualizationData = (): ImpactDataPoint[] => {
  const points: ImpactDataPoint[] = [];
  const now = new Date();
  const automationTime = Math.floor(Math.random() * 24); // Hours ago

  for (let i = 48; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
    const dateStr = timestamp.toISOString().split("T")[0];

    // Before automation: higher metrics, more variance
    let dropRate = 2.1 + Math.sin(i / 8) * 0.5;
    let throughput = 850 + Math.random() * 100;
    let latency = 28 + Math.sin(i / 10) * 5;
    let packetLoss = 1.8 + Math.random() * 0.5;
    let availability = 97.4 + Math.random() * 1;
    let mttr = 46 + Math.random() * 10;

    // After automation (around automation time): improvements
    if (i <= automationTime) {
      dropRate = Math.max(0.6, dropRate * 0.3 + Math.random() * 0.3);
      throughput = Math.min(950, throughput * 1.05 + Math.random() * 20);
      latency = Math.max(16, latency * 0.6 + Math.random() * 2);
      packetLoss = Math.max(0.3, packetLoss * 0.2 + Math.random() * 0.1);
      availability = Math.min(99.8, availability * 1.002 + Math.random() * 0.3);
      mttr = Math.max(9, mttr * 0.2 + Math.random() * 2);
    }

    points.push({
      timestamp: dateStr,
      drop_rate: Math.round(dropRate * 100) / 100,
      throughput: Math.round(throughput),
      latency: Math.round(latency * 10) / 10,
      packet_loss: Math.round(packetLoss * 100) / 100,
      availability: Math.round(availability * 100) / 100,
      mttr: Math.round(mttr),
    });
  }

  return points;
};

/**
 * Generate KPI Impact Summary (section 4.8)
 */
export const generateKPIImpactSummary = (): KPIImpact[] => {
  return [
    {
      kpi: "Call Drop Rate",
      before: 2.1,
      after: 0.6,
      improvement: 71,
      unit: "%",
      description: "Service stability significantly improved",
      automationTime: "2 hours ago",
    },
    {
      kpi: "Site Availability",
      before: 97.4,
      after: 99.2,
      improvement: 1.8,
      unit: "%",
      description: "Availability restored within 3 minutes",
      automationTime: "4 hours ago",
    },
    {
      kpi: "Cell Utilization",
      before: 82,
      after: 64,
      improvement: 22,
      unit: "%",
      description: "Congestion risk reduced",
      automationTime: "6 hours ago",
    },
    {
      kpi: "Latency",
      before: 28,
      after: 16,
      improvement: 43,
      unit: "ms",
      description: "User experience improved",
      automationTime: "8 hours ago",
    },
    {
      kpi: "Packet Loss",
      before: 1.8,
      after: 0.3,
      improvement: 83,
      unit: "%",
      description: "Packet loss normalized after automated reroute",
      automationTime: "10 hours ago",
    },
    {
      kpi: "Mean Time to Resolve",
      before: 46,
      after: 9,
      improvement: 80,
      unit: "min",
      description: "80% faster resolution",
      automationTime: "12 hours ago",
    },
  ];
};
