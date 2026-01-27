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
