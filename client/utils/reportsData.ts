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
  category: "daily_kpi" | "alarm_summary" | "sla" | "vendor_comparison" | "traffic" | "diagnostic";
  lastGenerated: string;
  nextScheduled: string;
  status: "success" | "pending" | "failed";
  frequency: "daily" | "weekly" | "monthly" | "hourly";
  fileSize?: string;
  purpose?: string;
  schedule?: string;
}

export interface ReportActivityDataPoint {
  timestamp: string;
  success: number;
  failed: number;
  running: number;
}

export interface ReportTrend {
  name: string;
  value: number;
  change: number;
  status: "up" | "down" | "stable";
}

export interface FreshnessHeatmapRow {
  category: string;
  dates: Array<{ date: string; status: "green" | "orange" | "red" }>;
}

export interface FailureData {
  vendor?: string;
  technology?: string;
  region?: string;
  count: number;
  percentage?: number;
}

export interface TopFailedReport {
  report: string;
  vendor: string;
  failureCause: string;
  lastAttempt: string;
  failureCount: number;
}

export interface DownloadData {
  report: string;
  downloads: number;
}

export interface RoleDownloadData {
  timestamp: string;
  noc: number;
  rf: number;
  management: number;
}

export interface DownloadTimeData {
  timestamp: string;
  avgTime: number;
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
 * Generate Standard Report Categories with detailed specs (section 3.8)
 */
export const generateStandardReports = (filters: GlobalFilterState): StandardReport[] => {
  const now = new Date();
  const reports = [
    {
      id: "daily-kpi-001",
      title: "Daily KPI Report",
      description: "Quick overview of network health KPIs",
      purpose: "Quick overview of network health KPIs.",
      category: "daily_kpi" as const,
      frequency: "daily" as const,
      fileSize: "10MB",
      schedule: "Daily",
    },
    {
      id: "alarm-summary-001",
      title: "Alarm Summary Report",
      description: "Shows total alarms, severity distribution, and impacted regions/vendors",
      purpose: "Shows total alarms, severity distribution, and most impacted regions/vendors.",
      category: "alarm_summary" as const,
      frequency: "hourly" as const,
      fileSize: "5MB",
      schedule: "Hourly",
    },
    {
      id: "vendor-comp-001",
      title: "Vendor Comparison Report",
      description: "Compares vendors across availability and throughput",
      purpose: "Compares vendors across major KPIs like availability and throughput. Supports vendor performance evaluation and decision making.",
      category: "vendor_comparison" as const,
      frequency: "daily" as const,
      fileSize: "12MB",
      schedule: "Daily",
    },
    {
      id: "traffic-001",
      title: "Weekly Traffic Report",
      description: "Tracks traffic growth and detects capacity risks",
      purpose: "Tracks traffic growth and detects capacity risks. Helps planning teams anticipate congestion before it happens.",
      category: "traffic" as const,
      frequency: "weekly" as const,
      fileSize: "14MB",
      schedule: "Weekly",
    },
    {
      id: "diagnostic-001",
      title: "Failed Reports Diagnostic",
      description: "Lists reports that failed along with basic failure reasons",
      purpose: "Lists reports that failed along with basic failure reasons. Improves operational awareness and speeds up troubleshooting.",
      category: "diagnostic" as const,
      frequency: "daily" as const,
      fileSize: "2MB",
      schedule: "Daily",
    },
  ];

  return reports.map((report) => {
    const hoursAgo = Math.floor(Math.random() * (report.frequency === "weekly" ? 168 : report.frequency === "daily" ? 24 : 2));
    const lastGen = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);
    const nextGen = new Date(
      report.frequency === "hourly"
        ? now.getTime() + 60 * 60 * 1000
        : report.frequency === "daily"
          ? now.getTime() + (24 - hoursAgo) * 60 * 60 * 1000
          : report.frequency === "weekly"
            ? now.getTime() + (7 * 24 - hoursAgo) * 60 * 60 * 1000
            : now.getTime() + (30 * 24 - hoursAgo) * 60 * 60 * 1000
    );

    const status: "success" | "pending" | "failed" =
      report.category === "diagnostic" && Math.random() > 0.5
        ? "failed"
        : Math.random() > 0.85
          ? "failed"
          : Math.random() > 0.3
            ? "pending"
            : "success";

    return {
      ...report,
      lastGenerated: lastGen.toISOString(),
      nextScheduled: nextGen.toISOString(),
      status,
    };
  });
};

/**
 * Generate Report Activity Trend data (stacked: Success, Failed, Running)
 */
export const generateReportActivityTrend = (filters: GlobalFilterState): ReportActivityDataPoint[] => {
  const points: ReportActivityDataPoint[] = [];
  const now = new Date();
  const daysToGenerate = 30;

  for (let i = daysToGenerate - 1; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = timestamp.toISOString().split("T")[0];

    const baseTotal = 10 + Math.sin(i / 7) * 4;
    const multiplier = 1 + (filters.vendors.length * 0.1 + filters.technologies.length * 0.05);

    const total = Math.round((baseTotal * multiplier + Math.random() * 4) * 1.5);
    const failed = Math.max(0, Math.round(total * (0.04 + Math.random() * 0.12)));
    const running = Math.max(0, Math.round(total * (0.03 + Math.random() * 0.08)));
    const success = total - failed - running;

    points.push({
      timestamp: dateStr,
      success: Math.max(0, success),
      failed: failed,
      running: running,
    });
  }

  return points;
};

/**
 * Generate Report Freshness Heatmap data (section 3.4)
 */
export const generateReportFreshnessHeatmap = (): FreshnessHeatmapRow[] => {
  const categories = ["Daily KPI", "Alarm Summary", "SLA", "Vendor", "Traffic"];
  const now = new Date();

  return categories.map((category) => {
    const dates: Array<{ date: string; status: "green" | "orange" | "red" }> = [];
    for (let i = 0; i < 5; i++) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" });

      // Green (generated on time): 70%, Orange (delayed): 20%, Red (missing): 10%
      const rand = Math.random();
      const status = rand < 0.7 ? "green" : rand < 0.9 ? "orange" : "red";
      dates.push({ date: dateStr, status });
    }
    return { category, dates };
  });
};

/**
 * Generate Failures by Vendor (section 3.6)
 */
export const generateFailuresByVendor = (): FailureData[] => {
  const vendors = ["Huawei", "Ericsson", "Nokia", "Samsung", "Cisco"];
  const baseFailures = [32, 18, 11, 7, 4];
  const total = baseFailures.reduce((a, b) => a + b, 0);

  return vendors.map((vendor, idx) => ({
    vendor,
    count: baseFailures[idx],
    percentage: Math.round((baseFailures[idx] / total) * 100),
  }));
};

/**
 * Generate Failures by Technology (section 3.6)
 */
export const generateFailuresByTechnology = (): FailureData[] => {
  const techs = ["5G", "4G", "3G", "2G", "O-RAN"];
  const failures = [28, 22, 18, 14, 10];
  const total = failures.reduce((a, b) => a + b, 0);

  return techs.map((tech, idx) => ({
    technology: tech,
    count: failures[idx],
    percentage: Math.round((failures[idx] / total) * 100),
  }));
};

/**
 * Generate Failures by Region (section 3.6)
 */
export const generateFailuresByRegion = (): FailureData[] => {
  const regions = ["UK", "KSA", "USA", "Egypt", "UAE"];
  const failures = [42, 23, 10, 5, 12];
  const total = failures.reduce((a, b) => a + b, 0);

  return regions.map((region, idx) => ({
    region,
    count: failures[idx],
    percentage: Math.round((failures[idx] / total) * 100),
  }));
};

/**
 * Generate Top Failed Reports (section 3.6)
 */
export const generateTopFailedReports = (): TopFailedReport[] => {
  return [
    {
      report: "Daily KPI",
      vendor: "Huawei",
      failureCause: "Data timeout",
      lastAttempt: "10:03",
      failureCount: 8,
    },
    {
      report: "SLA Compliance",
      vendor: "Nokia",
      failureCause: "Missing counters",
      lastAttempt: "09:55",
      failureCount: 5,
    },
    {
      report: "Alarm Summary",
      vendor: "Ericsson",
      failureCause: "DB connection error",
      lastAttempt: "09:42",
      failureCount: 3,
    },
    {
      report: "Vendor Comparison",
      vendor: "Samsung",
      failureCause: "Memory allocation failed",
      lastAttempt: "09:28",
      failureCount: 2,
    },
  ];
};

/**
 * Generate Most Downloaded Reports (section 3.7)
 */
export const generateMostDownloadedReports = (): DownloadData[] => {
  return [
    { report: "Daily KPI Report", downloads: 234 },
    { report: "Alarm Summary Report", downloads: 187 },
    { report: "Vendor Comparison Report", downloads: 156 },
    { report: "SLA Compliance Report", downloads: 128 },
    { report: "Weekly Traffic Report", downloads: 94 },
  ];
};

/**
 * Generate Downloads by User Role (section 3.7)
 */
export const generateDownloadsByUserRole = (): RoleDownloadData[] => {
  const points: RoleDownloadData[] = [];
  const now = new Date();

  for (let i = 29; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = timestamp.toISOString().split("T")[0];

    points.push({
      timestamp: dateStr,
      noc: Math.round(40 + Math.random() * 30 + Math.sin(i / 7) * 15),
      rf: Math.round(25 + Math.random() * 20 + Math.sin(i / 7) * 10),
      management: Math.round(15 + Math.random() * 15 + Math.sin(i / 7) * 8),
    });
  }

  return points;
};

/**
 * Generate Average Download Time Trend (section 3.7)
 */
export const generateAvgDownloadTimeTrend = (): DownloadTimeData[] => {
  const points: DownloadTimeData[] = [];
  const now = new Date();

  for (let i = 29; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = timestamp.toISOString().split("T")[0];

    // Values in seconds
    points.push({
      timestamp: dateStr,
      avgTime: Math.round(2.5 + Math.random() * 1.5 + Math.sin(i / 10) * 0.8) * 10, // 25-40ms range
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
