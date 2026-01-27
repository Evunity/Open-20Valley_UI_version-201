import { GlobalFilterState } from "@/hooks/useGlobalFilters";

export interface ReportKPI {
  value: number;
  change: number;
  status: "healthy" | "degraded" | "critical";
}

export interface StandardReport {
  id: string;
  title: string;
  description: string;
  category: "daily_kpi" | "alarm_summary" | "sla" | "vendor_comparison";
  lastGenerated: string;
  nextScheduled: string;
  status: "success" | "pending" | "failed";
  frequency: "daily" | "weekly" | "monthly";
  downloadUrl?: string;
}

export interface ReportActivityDataPoint {
  timestamp: string;
  total_generated: number;
  successful: number;
  failed: number;
  scheduled: number;
}

export interface ReportTrend {
  name: string;
  value: number;
  change: number;
  status: "up" | "down" | "stable";
}

/**
 * Generate Reports KPIs
 */
export const generateReportKPIs = (filters: GlobalFilterState): Record<string, ReportKPI> => {
  const filterImpact = 1 + (filters.vendors.length * 0.05 + filters.technologies.length * 0.03);

  return {
    available_reports: {
      value: Math.round(24 * filterImpact),
      change: 2.5,
      status: "healthy",
    },
    reports_generated: {
      value: Math.round((156 + Math.random() * 30) * filterImpact),
      change: 5.3,
      status: "healthy",
    },
    scheduled_reports: {
      value: Math.round(18 * filterImpact),
      change: 1.2,
      status: "healthy",
    },
    failed_reports: {
      value: Math.round((2 + Math.random() * 4) * filterImpact),
      change: Math.random() > 0.5 ? -1.5 : 0.8,
      status: Math.random() > 0.7 ? "critical" : "healthy",
    },
  };
};

/**
 * Generate Standard Report Categories
 */
export const generateStandardReports = (filters: GlobalFilterState): StandardReport[] => {
  const now = new Date();
  const categories = [
    {
      id: "daily-kpi-001",
      title: "Daily KPI Report",
      description: "Comprehensive daily performance indicators across all dimensions",
      category: "daily_kpi" as const,
      frequency: "daily" as const,
    },
    {
      id: "daily-kpi-002",
      title: "Daily KPI - Executive Summary",
      description: "High-level daily metrics for executive review",
      category: "daily_kpi" as const,
      frequency: "daily" as const,
    },
    {
      id: "alarm-summary-001",
      title: "Alarm Summary Report",
      description: "Daily alarm trends, hotspots, and resolutions",
      category: "alarm_summary" as const,
      frequency: "daily" as const,
    },
    {
      id: "alarm-summary-002",
      title: "Weekly Alarm Trends",
      description: "Seven-day alarm pattern analysis and forecasting",
      category: "alarm_summary" as const,
      frequency: "weekly" as const,
    },
    {
      id: "sla-001",
      title: "SLA Compliance Report",
      description: "Service level agreement compliance tracking",
      category: "sla" as const,
      frequency: "monthly" as const,
    },
    {
      id: "sla-002",
      title: "SLA Trend Analysis",
      description: "Historical SLA performance and trending",
      category: "sla" as const,
      frequency: "monthly" as const,
    },
    {
      id: "vendor-comp-001",
      title: "Vendor Comparison Report",
      description: "Performance comparison across vendors",
      category: "vendor_comparison" as const,
      frequency: "weekly" as const,
    },
    {
      id: "vendor-comp-002",
      title: "Vendor SLA Scorecard",
      description: "Vendor SLA performance and benchmarking",
      category: "vendor_comparison" as const,
      frequency: "monthly" as const,
    },
  ];

  return categories.map((report, idx) => {
    const hoursAgo = Math.floor(Math.random() * 72);
    const lastGen = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);
    const nextGen = new Date(
      report.frequency === "daily"
        ? now.getTime() + (24 - hoursAgo) * 60 * 60 * 1000
        : report.frequency === "weekly"
          ? now.getTime() + (7 * 24 - hoursAgo) * 60 * 60 * 1000
          : now.getTime() + (30 * 24 - hoursAgo) * 60 * 60 * 1000
    );

    const status: "success" | "pending" | "failed" =
      Math.random() > 0.9 ? "failed" : Math.random() > 0.4 ? "pending" : "success";

    return {
      ...report,
      lastGenerated: lastGen.toISOString(),
      nextScheduled: nextGen.toISOString(),
      status,
    };
  });
};

/**
 * Generate Report Activity Trend data
 */
export const generateReportActivityTrend = (filters: GlobalFilterState): ReportActivityDataPoint[] => {
  const points: ReportActivityDataPoint[] = [];
  const now = new Date();
  const daysToGenerate = 30;

  for (let i = daysToGenerate - 1; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = timestamp.toISOString().split("T")[0];

    const baseTotal = 5 + Math.sin(i / 7) * 2;
    const multiplier = 1 + (filters.vendors.length * 0.1 + filters.technologies.length * 0.05);

    const total = Math.round((baseTotal * multiplier + Math.random() * 2) * 2);
    const failed = Math.max(0, Math.round(total * (0.05 + Math.random() * 0.15)));

    points.push({
      timestamp: dateStr,
      total_generated: total,
      successful: total - failed,
      failed: failed,
      scheduled: Math.round(total * 0.4),
    });
  }

  return points;
};

/**
 * Generate Report Trends Summary
 */
export const generateReportTrends = (): ReportTrend[] => {
  return [
    {
      name: "Generation Success Rate",
      value: 97.5,
      change: 2.3,
      status: "up",
    },
    {
      name: "Avg Generation Time",
      value: 45,
      change: -5.2,
      status: "down",
    },
    {
      name: "On-Time Delivery",
      value: 99.2,
      change: 1.1,
      status: "up",
    },
    {
      name: "Failed Reports",
      value: 3,
      change: -1.8,
      status: "down",
    },
  ];
};
