import { GlobalFilterState } from "@/hooks/useGlobalFilters";

export interface StatusKPI {
  value: number;
  change: number;
  status: "healthy" | "degraded" | "critical";
}

export interface AvailabilityDataPoint {
  timestamp: string;
  overall_availability: number;
  availability_5g: number;
  availability_4g: number;
  availability_3g: number;
  availability_2g: number;
}

export interface TopologyNode {
  name: string;
  status: "healthy" | "degraded" | "critical";
  downSites: number;
  totalSites: number;
  healthPercentage: number;
}

export interface ImpactedArea {
  name: string;
  downSites: number;
  affectedSites: number;
  recoveryTrend: "improving" | "stable" | "worsening";
  status: "healthy" | "degraded" | "critical";
}

export interface StatusInsight {
  id: string;
  type: "outage" | "degradation" | "recovery" | "trend";
  title: string;
  description: string;
  timestamp: string;
  scope: string;
  severity: "critical" | "major" | "minor";
}

/**
 * Generate Network Status KPIs
 */
export const generateNetworkStatusKPIs = (filters: GlobalFilterState): Record<string, StatusKPI> => {
  const filterImpact = 1 + (filters.vendors.length * 0.05 + filters.technologies.length * 0.03);

  return {
    total_sites: {
      value: Math.round(2847 * filterImpact),
      change: -2.1,
      status: "healthy",
    },
    active_sites: {
      value: Math.round(2721 * filterImpact * 0.95),
      change: -0.8,
      status: "healthy",
    },
    down_sites: {
      value: Math.round((126 + Math.random() * 50) * filterImpact),
      change: Math.random() > 0.5 ? 8.2 : -3.5,
      status: Math.random() > 0.7 ? "critical" : "degraded",
    },
    partially_degraded: {
      value: Math.round((30 + Math.random() * 25) * filterImpact),
      change: Math.random() > 0.5 ? 4.1 : -2.3,
      status: Math.random() > 0.6 ? "degraded" : "healthy",
    },
  };
};

/**
 * Generate Network Availability Overview data
 */
export const generateNetworkAvailabilityTrend = (filters: GlobalFilterState): AvailabilityDataPoint[] => {
  const points: AvailabilityDataPoint[] = [];
  const now = new Date();
  const hoursToGenerate = 24;

  for (let i = hoursToGenerate - 1; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
    const timeStr = timestamp.toISOString().split("T")[0] + " " + String(timestamp.getHours()).padStart(2, "0") + ":00";

    // Generate availability with some variation
    const baseAvailability = 99.5 + Math.sin(i / 8) * 1.5;
    const multiplier = 1 - (filters.vendors.length * 0.02 + filters.technologies.length * 0.01);

    points.push({
      timestamp: timeStr,
      overall_availability: Math.max(95, Math.min(100, baseAvailability * multiplier + Math.random() * 0.5)),
      availability_5g: Math.max(95, Math.min(100, 99.8 + Math.random() * 0.2)),
      availability_4g: Math.max(95, Math.min(100, 99.5 + Math.random() * 0.4)),
      availability_3g: Math.max(95, Math.min(100, 99.0 + Math.random() * 0.8)),
      availability_2g: Math.max(95, Math.min(100, 98.5 + Math.random() * 1.0)),
    });
  }

  return points;
};

/**
 * Generate Topology Health Snapshot
 */
export const generateTopologyHealth = (filters: GlobalFilterState): TopologyNode[] => {
  const regions = ["North", "South", "East", "West", "Central"];
  
  return regions.map((region, idx) => {
    const totalSites = Math.round(550 + Math.random() * 150);
    const downSites = Math.round((20 + Math.random() * 40) * (1 + filters.vendors.length * 0.1));
    const healthPercentage = ((totalSites - downSites) / totalSites) * 100;

    return {
      name: region,
      status: 
        healthPercentage > 98 ? "healthy" 
        : healthPercentage > 95 ? "degraded" 
        : "critical",
      downSites: Math.max(0, downSites),
      totalSites,
      healthPercentage: Math.max(80, healthPercentage),
    };
  });
};

/**
 * Generate Impacted Areas Overview
 */
export const generateImpactedAreas = (filters: GlobalFilterState): ImpactedArea[] => {
  const areas = [
    { name: "North Region", base: 15 },
    { name: "East Region", base: 8 },
    { name: "Vendor Ericsson", base: 12 },
    { name: "Technology 3G", base: 18 },
  ];

  return areas.map((area, idx) => {
    const downSites = Math.round(area.base + Math.random() * 15);
    const affectedSites = Math.round(downSites * (1.5 + Math.random() * 2));
    const trend = Math.random() > 0.4 ? "improving" : Math.random() > 0.5 ? "stable" : "worsening";

    return {
      name: area.name,
      downSites,
      affectedSites,
      recoveryTrend: trend,
      status: downSites > 15 ? "critical" : downSites > 8 ? "degraded" : "healthy",
    };
  });
};

/**
 * Generate Status Insights
 */
export const generateStatusInsights = (
  topologyHealth: TopologyNode[],
  impactedAreas: ImpactedArea[],
  filters: GlobalFilterState
): StatusInsight[] => {
  const insights: StatusInsight[] = [];
  const now = new Date();

  // Find regions with most down sites
  const criticalRegions = topologyHealth
    .filter((r) => r.status === "critical")
    .slice(0, 2);

  if (criticalRegions.length > 0) {
    insights.push({
      id: "outage-1",
      type: "outage",
      title: "Increase in Unreachable Sites",
      description: `${criticalRegions[0].name} reporting ${criticalRegions[0].downSites} unreachable sites. Infrastructure assessment recommended.`,
      timestamp: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
      scope: criticalRegions.map((r) => r.name).join(", "),
      severity: "critical",
    });
  }

  // Degradation in specific vendors/tech
  const degradedAreas = impactedAreas
    .filter((a) => a.status === "degraded")
    .slice(0, 1);

  if (degradedAreas.length > 0) {
    insights.push({
      id: "degradation-1",
      type: "degradation",
      title: "Availability Degradation",
      description: `${degradedAreas[0].name} experiencing availability degradation. ${degradedAreas[0].affectedSites} sites partially affected.`,
      timestamp: new Date(now.getTime() - 60 * 60 * 1000).toISOString(),
      scope: degradedAreas[0].name,
      severity: "major",
    });
  }

  // Recovery trend
  const improvingAreas = impactedAreas
    .filter((a) => a.recoveryTrend === "improving")
    .slice(0, 1);

  if (improvingAreas.length > 0) {
    insights.push({
      id: "recovery-1",
      type: "recovery",
      title: "Recovery Trend Detected",
      description: `${improvingAreas[0].name} showing recovery pattern. Down sites reduced from 24 to ${improvingAreas[0].downSites} over last 24 hours.`,
      timestamp: new Date(now.getTime() - 120 * 60 * 1000).toISOString(),
      scope: improvingAreas[0].name,
      severity: "minor",
    });
  }

  // Overall trend
  insights.push({
    id: "trend-1",
    type: "trend",
    title: "Network Stability Status",
    description: `Overall network stability is ${Math.random() > 0.5 ? "improving" : "stable"}. ${Math.random() > 0.5 ? "No significant" : "Minor"} incidents reported in the last 4 hours.`,
    timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
    scope: "Network-wide",
    severity: "minor",
  });

  return insights;
};
