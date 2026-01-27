import { GlobalFilterState } from "@/hooks/useGlobalFilters";

export interface AlarmKPI {
  value: number;
  unit: string;
  change: number; // percentage
  status: "healthy" | "degraded" | "critical";
  direction: "up" | "down" | "stable";
}

export interface AlarmDataPoint {
  timestamp: string;
  active_alarms: number;
  critical_alarms: number;
  major_alarms: number;
  minor_alarms: number;
  clear_rate: number;
}

export interface AlarmDistribution {
  name: string;
  active: number;
  critical: number;
  major: number;
  minor: number;
  avg_duration: number; // in minutes
  status: "healthy" | "degraded" | "critical";
}

export interface AlarmInsight {
  id: string;
  type: "surge" | "persistent" | "severity_shift" | "pattern";
  title: string;
  description: string;
  timestamp: string;
  scope: string;
  severity: "critical" | "major" | "minor";
}

export interface AlarmHealthIndex {
  value: number;
  change: number;
  status: "healthy" | "degraded" | "critical";
}

/**
 * Generate Alarm KPIs based on filters
 */
export const generateAlarmKPIs = (filters: GlobalFilterState): Record<string, AlarmKPI> => {
  // Apply filter impact
  const filterImpact = 1 + (filters.vendors.length * 0.05 + filters.technologies.length * 0.03);

  return {
    active_alarms: {
      value: Math.round((42 + Math.random() * 25) * filterImpact),
      unit: "alarms",
      change: 3.2,
      status: Math.random() > 0.7 ? "critical" : "degraded",
      direction: Math.random() > 0.5 ? "up" : "down",
    },
    critical_alarms: {
      value: Math.round((8 + Math.random() * 6) * filterImpact),
      unit: "alarms",
      change: 1.8,
      status: "critical",
      direction: "up",
    },
    major_alarms: {
      value: Math.round((15 + Math.random() * 12) * filterImpact),
      unit: "alarms",
      change: 2.1,
      status: "degraded",
      direction: "stable",
    },
    alarm_rate: {
      value: Math.round((8.5 + Math.random() * 4) * filterImpact),
      unit: "per site",
      change: -1.2,
      status: Math.random() > 0.6 ? "degraded" : "healthy",
      direction: "down",
    },
  };
};

/**
 * Generate Alarm Health Index
 */
export const generateAlarmHealthIndex = (filters: GlobalFilterState): AlarmHealthIndex => {
  const baseValue = 65 - (filters.vendors.length * 5 + filters.technologies.length * 3);
  const healthValue = Math.max(20, Math.min(100, baseValue + Math.random() * 15));

  return {
    value: Math.round(healthValue),
    change: -2.5,
    status: healthValue > 75 ? "healthy" : healthValue > 50 ? "degraded" : "critical",
  };
};

/**
 * Generate time-series alarm trend data
 */
export const generateAlarmTrendData = (filters: GlobalFilterState): AlarmDataPoint[] => {
  const points: AlarmDataPoint[] = [];
  const now = new Date();
  const hoursToGenerate = 24;

  for (let i = hoursToGenerate - 1; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
    const timeStr = timestamp.toISOString().split("T")[0] + " " + String(timestamp.getHours()).padStart(2, "0") + ":00";

    // Generate alarm counts with some variation
    const baseActive = 35 + Math.sin(i / 6) * 15;
    const baseCritical = 6 + Math.cos(i / 8) * 4;
    const baseMajor = 12 + Math.sin(i / 4) * 8;

    const multiplier = 1 + (filters.vendors.length * 0.05 + filters.technologies.length * 0.03);

    points.push({
      timestamp: timeStr,
      active_alarms: Math.round(baseActive * multiplier + Math.random() * 5),
      critical_alarms: Math.round(baseCritical * multiplier + Math.random() * 2),
      major_alarms: Math.round(baseMajor * multiplier + Math.random() * 3),
      minor_alarms: Math.round((15 + Math.random() * 10) * multiplier),
      clear_rate: 62 + Math.random() * 20,
    });
  }

  return points;
};

/**
 * Generate alarm distribution by dimension (vendor, technology, region, cluster)
 */
export const generateAlarmDistributionByVendor = (
  filters: GlobalFilterState
): AlarmDistribution[] => {
  const vendors = ["Ericsson", "Huawei", "Nokia", "Samsung"];

  return vendors.map((vendor, idx) => ({
    name: vendor,
    active: Math.round(12 + Math.random() * 18),
    critical: Math.round(2 + Math.random() * 5),
    major: Math.round(4 + Math.random() * 8),
    minor: Math.round(5 + Math.random() * 10),
    avg_duration: Math.round(45 + Math.random() * 120 + idx * 20),
    status: Math.random() > 0.6 ? "critical" : Math.random() > 0.3 ? "degraded" : "healthy",
  }));
};

export const generateAlarmDistributionByTechnology = (
  filters: GlobalFilterState
): AlarmDistribution[] => {
  const techs = ["5G", "4G", "3G", "2G"];

  return techs.map((tech, idx) => ({
    name: tech,
    active: Math.round(10 + Math.random() * 15),
    critical: Math.round(1 + Math.random() * 4),
    major: Math.round(3 + Math.random() * 7),
    minor: Math.round(4 + Math.random() * 8),
    avg_duration: Math.round(50 + Math.random() * 100 + idx * 30),
    status: Math.random() > 0.5 ? "degraded" : "healthy",
  }));
};

export const generateAlarmDistributionByRegion = (
  filters: GlobalFilterState
): AlarmDistribution[] => {
  const regions = ["North", "South", "East", "West", "Central"];

  return regions.map((region, idx) => ({
    name: region,
    active: Math.round(8 + Math.random() * 14),
    critical: Math.round(1 + Math.random() * 4),
    major: Math.round(3 + Math.random() * 7),
    minor: Math.round(4 + Math.random() * 8),
    avg_duration: Math.round(40 + Math.random() * 110 + idx * 15),
    status: Math.random() > 0.55 ? "degraded" : "healthy",
  }));
};

export const generateAlarmDistributionByCluster = (
  filters: GlobalFilterState
): AlarmDistribution[] => {
  const clusters = ["Cluster A", "Cluster B", "Cluster C", "Cluster D"];

  return clusters.map((cluster, idx) => ({
    name: cluster,
    active: Math.round(9 + Math.random() * 16),
    critical: Math.round(1 + Math.random() * 4),
    major: Math.round(3 + Math.random() * 7),
    minor: Math.round(5 + Math.random() * 9),
    avg_duration: Math.round(45 + Math.random() * 115 + idx * 20),
    status: Math.random() > 0.5 ? "degraded" : "healthy",
  }));
};

/**
 * Generate alarm pattern insights
 */
export const generateAlarmInsights = (
  trendData: AlarmDataPoint[],
  distributions: Record<string, AlarmDistribution[]>,
  filters: GlobalFilterState
): AlarmInsight[] => {
  const insights: AlarmInsight[] = [];
  const now = new Date();

  // Detect surge if recent alarms are high
  const recentAverage =
    trendData.slice(-6).reduce((sum, p) => sum + p.active_alarms, 0) / 6;
  const overallAverage =
    trendData.reduce((sum, p) => sum + p.active_alarms, 0) / trendData.length;

  if (recentAverage > overallAverage * 1.3) {
    insights.push({
      id: "surge-1",
      type: "surge",
      title: "Alarm Surge Detected",
      description: `Active alarms have increased by ${Math.round(((recentAverage / overallAverage - 1) * 100))}% in the last 6 hours compared to daily average.`,
      timestamp: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
      scope: filters.regions.length > 0 ? filters.regions.join(", ") : "All Regions",
      severity: "critical",
    });
  }

  // Detect persistent alarms
  const highDurationDimensions = Object.entries(distributions)
    .flatMap(([dimension, items]) =>
      items
        .filter((item) => item.avg_duration > 120)
        .map((item) => `${item.name} (${item.avg_duration} min)`)
    )
    .slice(0, 2);

  if (highDurationDimensions.length > 0) {
    insights.push({
      id: "persistent-1",
      type: "persistent",
      title: "Persistent Alarms Detected",
      description: `Alarms lasting longer than 2 hours detected in: ${highDurationDimensions.join(", ")}.`,
      timestamp: new Date(now.getTime() - 90 * 60 * 1000).toISOString(),
      scope: "Multiple Dimensions",
      severity: "major",
    });
  }

  // Severity mix shift
  const criticalCount = trendData[trendData.length - 1].critical_alarms;
  const majorCount = trendData[trendData.length - 1].major_alarms;
  const severityRatio = criticalCount / (majorCount + criticalCount);

  if (severityRatio > 0.35) {
    insights.push({
      id: "severity-1",
      type: "severity_shift",
      title: "Severity Mix Shift",
      description: `Critical alarms now comprise ${Math.round(severityRatio * 100)}% of major+critical alarms, indicating increased network instability.`,
      timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      scope: "Network-wide",
      severity: "critical",
    });
  }

  // Recurring pattern
  if (Math.random() > 0.5) {
    insights.push({
      id: "pattern-1",
      type: "pattern",
      title: "Recurring Alarm Pattern Identified",
      description: "Alarm spikes detected at consistent 6-hour intervals over the last 48 hours. Pattern suggests cyclical load or configuration issue.",
      timestamp: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(),
      scope: filters.clusters.length > 0 ? filters.clusters.join(", ") : "All Clusters",
      severity: "major",
    });
  }

  return insights;
};
