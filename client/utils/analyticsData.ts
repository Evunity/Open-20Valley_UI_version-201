import type { GlobalFilterState } from "@/hooks/useGlobalFilters";
import { getDaysDifference, isHourlyGranularity } from "./dashboardData";

// Re-export InsightData type for use in components
export type InsightData = {
  overall: {
    change: number;
    status: "Improved" | "Degraded" | "No change";
  };
  byTechnology?: Array<{
    name: string;
    change: number;
    status: "Improved" | "Degraded" | "No change";
  }>;
  byRegion?: Array<{
    name: string;
    change: number;
    status: "Improved" | "Degraded" | "No change";
  }>;
  byVendor?: Array<{
    name: string;
    change: number;
    status: "Improved" | "Degraded" | "No change";
  }>;
};

/**
 * VOICE ANALYTICS DATA
 */

interface VoiceKPI {
  value: number | string;
  unit: string;
  change: number; // percentage
  status: "healthy" | "degraded" | "critical";
}

export const generateVoiceKPIs = (filters: GlobalFilterState): Record<string, VoiceKPI> => {
  const baseMultiplier = 1 - (filters.vendors.length * 0.1 + filters.technologies.length * 0.05);

  return {
    call_success_rate: {
      value: (97.45 + Math.random() * 2) * baseMultiplier,
      unit: "%",
      change: 1.2,
      status: "healthy",
    },
    call_drop_rate: {
      value: (0.55 + Math.random() * 0.3) * baseMultiplier,
      unit: "%",
      change: -0.15,
      status: "healthy",
    },
    call_stability: {
      value: (98.2 + Math.random() * 1.5) * baseMultiplier,
      unit: "%",
      change: 0.8,
      status: "healthy",
    },
    service_availability: {
      value: (99.92 + Math.random() * 0.08) * baseMultiplier,
      unit: "%",
      change: 0.05,
      status: "healthy",
    },
    avg_call_duration: {
      value: Math.round((345 + Math.random() * 45) * baseMultiplier),
      unit: "sec",
      change: 2.1,
      status: "healthy",
    },
    call_volume: {
      value: Math.round((45230 + Math.random() * 5000) * baseMultiplier),
      unit: "calls",
      change: 5.3,
      status: "healthy",
    },
    voice_quality_index: {
      value: (8.7 + Math.random() * 1) * baseMultiplier,
      unit: "/10",
      change: 1.17,
      status: "healthy",
    },
  };
};

export interface VoiceTrendData {
  time: string;
  call_volume: number;
  call_success_rate: number;
  drop_rate: number;
  call_stability: number;
  crr: number; // Call Retainability Rate
  call_continuity: number;
  vqi: number; // Voice Quality Index
  vpi: number; // Voice Performance Index
  vsqi: number; // Voice Stability Quality Index
}

export const generateVoiceTrendData = (filters: GlobalFilterState): VoiceTrendData[] => {
  const dayCount = getDaysDifference(filters.dateRange);
  const isHourly = isHourlyGranularity(filters.dateRange);
  const baseMultiplier = 1 - (filters.vendors.length * 0.1 + filters.technologies.length * 0.05);

  if (isHourly) {
    return Array.from({ length: 24 }, (_, i) => {
      const hour = String(i).padStart(2, "0");
      return {
        time: `${hour}:00`,
        call_volume: Math.round((2800 + Math.random() * 800) * baseMultiplier),
        call_success_rate: 97.2 + Math.random() * 2.5,
        drop_rate: 0.28 + Math.random() * 0.32,
        call_stability: 97.8 + Math.random() * 1.8,
        crr: 98.5 + Math.random() * 1.2,
        call_continuity: 97.9 + Math.random() * 1.5,
        vqi: 8.3 + Math.random() * 1.2,
        vpi: 8.1 + Math.random() * 1.3,
        vsqi: 8.0 + Math.random() * 1.4,
      };
    });
  } else {
    return Array.from({ length: Math.min(dayCount, 30) }, (_, i) => {
      let dateStr = "";
      if (filters.dateRange.from) {
        const date = new Date(filters.dateRange.from);
        date.setDate(date.getDate() + i);
        dateStr = date.toISOString().split("T")[0];
      } else {
        const date = new Date();
        date.setDate(date.getDate() - (dayCount - i - 1));
        dateStr = date.toISOString().split("T")[0];
      }

      return {
        time: dateStr,
        call_volume: Math.round((42000 + Math.random() * 8000) * baseMultiplier),
        call_success_rate: 97.3 + Math.random() * 2.3,
        drop_rate: 0.3 + Math.random() * 0.35,
        call_stability: 97.9 + Math.random() * 1.6,
        crr: 98.6 + Math.random() * 1.1,
        call_continuity: 98.0 + Math.random() * 1.4,
        vqi: 8.4 + Math.random() * 1.1,
        vpi: 8.2 + Math.random() * 1.2,
        vsqi: 8.1 + Math.random() * 1.3,
      };
    });
  }
};

export interface VoiceBreakdown {
  name: string;
  call_success_rate: number;
  drop_rate: number;
  call_stability: number;
  status: string;
  count: number;
  priority?: "Critical" | "High" | "Medium" | "Low";
}

export const generateVoiceBreakdownByVendor = (
  filters: GlobalFilterState
): VoiceBreakdown[] => {
  const vendors = ["Ericsson", "Huawei", "Nokia", "Samsung"];
  return vendors.map((vendor) => {
    const successRate = 96.5 + Math.random() * 3;
    const dropRate = 0.35 + Math.random() * 0.4;
    return {
      name: vendor,
      call_success_rate: successRate,
      drop_rate: dropRate,
      call_stability: 97.8 + Math.random() * 1.8,
      status:
        Math.random() > 0.3
          ? "High quality"
          : Math.random() > 0.6
            ? "Acceptable"
            : "Degraded",
      count: Math.round(9000 + Math.random() * 5000),
      priority: calculatePriorityFromPerformance(successRate, dropRate),
    };
  });
};

export const generateVoiceBreakdownByTechnology = (
  filters: GlobalFilterState
): VoiceBreakdown[] => {
  const technologies = ["2G", "3G", "4G", "5G", "O-RAN"];
  return technologies.map((tech) => {
    const successRate = 96.5 + Math.random() * 3;
    const dropRate = 0.35 + Math.random() * 0.4;
    return {
      name: tech,
      call_success_rate: successRate,
      drop_rate: dropRate,
      call_stability: 97.5 + Math.random() * 2,
      status:
        Math.random() > 0.4
          ? "High quality"
          : Math.random() > 0.6
            ? "Acceptable"
            : "Degraded",
      count: Math.round(8000 + Math.random() * 4000),
      priority: calculatePriorityFromPerformance(successRate, dropRate),
    };
  });
};

export const generateVoiceBreakdownByRegion = (
  filters: GlobalFilterState
): VoiceBreakdown[] => {
  const regions = ["North", "South", "East", "West", "Central"];
  return regions.map((region) => {
    const successRate = 96.5 + Math.random() * 3;
    const dropRate = 0.35 + Math.random() * 0.4;
    return {
      name: region,
      call_success_rate: successRate,
      drop_rate: dropRate,
      call_stability: 97.8 + Math.random() * 1.8,
      status:
        Math.random() > 0.3
          ? "High quality"
          : Math.random() > 0.6
            ? "Acceptable"
            : "Degraded",
      count: Math.round(12000 + Math.random() * 6000),
      priority: calculatePriorityFromPerformance(successRate, dropRate),
    };
  });
};

export const generateVoiceBreakdownByCluster = (
  filters: GlobalFilterState
): VoiceBreakdown[] => {
  const clusterNames = filters.clusters.length > 0 ? filters.clusters : ["Cluster A", "Cluster B", "Cluster C", "Cluster D"];
  return clusterNames.map((cluster) => {
    const successRate = 96 + Math.random() * 3.5;
    const dropRate = 0.4 + Math.random() * 0.35;
    return {
      name: cluster,
      call_success_rate: successRate,
      drop_rate: dropRate,
      call_stability: 97.5 + Math.random() * 2,
      status:
        Math.random() > 0.35
          ? "High quality"
          : Math.random() > 0.55
            ? "Acceptable"
            : "Degraded",
      count: Math.round(10000 + Math.random() * 5000),
      priority: calculatePriorityFromPerformance(successRate, dropRate),
    };
  });
};

/**
 * DATA ANALYTICS DATA
 */

interface DataKPI {
  value: number | string;
  unit: string;
  change: number;
  status: "healthy" | "degraded" | "critical";
}

export const generateDataKPIs = (filters: GlobalFilterState): Record<string, DataKPI> => {
  const baseMultiplier = 1 - (filters.vendors.length * 0.1 + filters.technologies.length * 0.05);

  return {
    session_success_rate: {
      value: (98.1 + Math.random() * 1.5) * baseMultiplier,
      unit: "%",
      change: 0.8,
      status: "healthy",
    },
    session_drop_rate: {
      value: (0.35 + Math.random() * 0.2) * baseMultiplier,
      unit: "%",
      change: -0.1,
      status: "healthy",
    },
    avg_speed: {
      value: Math.round((87.5 + Math.random() * 12) * baseMultiplier),
      unit: "Mbps",
      change: 3.2,
      status: "healthy",
    },
    peak_speed: {
      value: Math.round((156 + Math.random() * 20) * baseMultiplier),
      unit: "Mbps",
      change: 2.7,
      status: "healthy",
    },
    avg_latency: {
      value: (38 + Math.random() * 12) * baseMultiplier,
      unit: "ms",
      change: -1.5,
      status: "healthy",
    },
    packet_loss: {
      value: (0.08 + Math.random() * 0.05) * baseMultiplier,
      unit: "%",
      change: -0.02,
      status: "healthy",
    },
    data_volume: {
      value: Math.round((3.2 + Math.random() * 0.8) * 1000) / 1000,
      unit: "Tbps",
      change: 4.5,
      status: "healthy",
    },
    data_experience_index: {
      value: (8.4 + Math.random() * 1.2) * baseMultiplier,
      unit: "/10",
      change: 2.1,
      status: "healthy",
    },
  };
};

export interface DataTrendData {
  time: string;
  data_volume: number;
  avg_speed: number;
  avg_latency: number;
  packet_loss: number;
  dei: number; // Data Experience Index
}

export const generateDataTrendData = (filters: GlobalFilterState): DataTrendData[] => {
  const dayCount = getDaysDifference(filters.dateRange);
  const isHourly = isHourlyGranularity(filters.dateRange);
  const baseMultiplier = 1 - (filters.vendors.length * 0.1 + filters.technologies.length * 0.05);

  if (isHourly) {
    return Array.from({ length: 24 }, (_, i) => {
      const hour = String(i).padStart(2, "0");
      return {
        time: `${hour}:00`,
        data_volume: Math.round((120 + Math.random() * 50) * baseMultiplier),
        avg_speed: 85 + Math.random() * 15,
        avg_latency: 35 + Math.random() * 15,
        packet_loss: 0.08 + Math.random() * 0.06,
        dei: 8.3 + Math.random() * 1.2,
      };
    });
  } else {
    return Array.from({ length: Math.min(dayCount, 30) }, (_, i) => {
      let dateStr = "";
      if (filters.dateRange.from) {
        const date = new Date(filters.dateRange.from);
        date.setDate(date.getDate() + i);
        dateStr = date.toISOString().split("T")[0];
      } else {
        const date = new Date();
        date.setDate(date.getDate() - (dayCount - i - 1));
        dateStr = date.toISOString().split("T")[0];
      }

      return {
        time: dateStr,
        data_volume: Math.round((2800 + Math.random() * 800) * baseMultiplier),
        avg_speed: 87 + Math.random() * 15,
        avg_latency: 38 + Math.random() * 15,
        packet_loss: 0.08 + Math.random() * 0.06,
        dei: 8.4 + Math.random() * 1.2,
      };
    });
  }
};

export const generateDataBreakdownByVendor = (filters: GlobalFilterState): VoiceBreakdown[] => {
  const vendors = ["Ericsson", "Huawei", "Nokia", "Samsung"];
  return vendors.map((vendor) => ({
    name: vendor,
    call_success_rate: 97.5 + Math.random() * 2,
    drop_rate: 0.3 + Math.random() * 0.3,
    call_stability: 97.8 + Math.random() * 1.8,
    status: Math.random() > 0.25 ? "High performance" : "Balanced",
    count: Math.round(12000 + Math.random() * 6000),
  }));
};

export const generateDataBreakdownByTechnology = (
  filters: GlobalFilterState
): VoiceBreakdown[] => {
  const techs = ["2G", "3G", "4G", "5G", "O-RAN"];
  return techs.map((tech) => ({
    name: tech,
    call_success_rate: 97 + Math.random() * 2.5,
    drop_rate: 0.25 + Math.random() * 0.35,
    call_stability: 97.5 + Math.random() * 2,
    status:
      Math.random() > 0.3
        ? "High performance"
        : Math.random() > 0.5
          ? "Balanced"
          : "Congested",
    count: Math.round(7000 + Math.random() * 5000),
  }));
};

export const generateDataBreakdownByRegion = (
  filters: GlobalFilterState
): VoiceBreakdown[] => {
  const regions = ["North", "South", "East", "West", "Central"];
  return regions.map((region) => ({
    name: region,
    call_success_rate: 97.2 + Math.random() * 2.3,
    drop_rate: 0.28 + Math.random() * 0.32,
    call_stability: 97.8 + Math.random() * 1.8,
    status:
      Math.random() > 0.35
        ? "High performance"
        : Math.random() > 0.6
          ? "Balanced"
          : "Congested",
    count: Math.round(9000 + Math.random() * 5000),
  }));
};

export const generateDataBreakdownByCluster = (
  filters: GlobalFilterState
): VoiceBreakdown[] => {
  const clusterNames = filters.clusters.length > 0 ? filters.clusters : ["Cluster A", "Cluster B", "Cluster C", "Cluster D"];
  return clusterNames.map((cluster) => ({
    name: cluster,
    call_success_rate: 97 + Math.random() * 2.5,
    drop_rate: 0.3 + Math.random() * 0.3,
    call_stability: 97.5 + Math.random() * 2,
    status:
      Math.random() > 0.4
        ? "High performance"
        : Math.random() > 0.6
          ? "Balanced"
          : "Congested",
    count: Math.round(8000 + Math.random() * 4000),
  }));
};

/**
 * Segmentation helpers - group data into performance categories
 */

export const segmentVoicePerformance = (
  data: VoiceBreakdown[]
): Record<string, VoiceBreakdown[]> => {
  return {
    "High quality": data.filter((d) => d.call_success_rate > 98),
    Acceptable: data.filter((d) => d.call_success_rate >= 96 && d.call_success_rate <= 98),
    Degraded: data.filter((d) => d.call_success_rate >= 94 && d.call_success_rate < 96),
    Critical: data.filter((d) => d.call_success_rate < 94),
  };
};

export const segmentDataPerformance = (
  data: VoiceBreakdown[]
): Record<string, VoiceBreakdown[]> => {
  return {
    "High performance": data.filter((d) => d.call_success_rate > 98),
    Balanced: data.filter((d) => d.call_success_rate >= 96.5 && d.call_success_rate <= 98),
    Congested: data.filter((d) => d.call_success_rate >= 94 && d.call_success_rate < 96.5),
    Underperforming: data.filter((d) => d.call_success_rate < 94),
  };
};

/**
 * Insight detection and priority calculation
 */

export interface DetectionInsight {
  id: string;
  type: "sudden_degradation" | "ongoing_degradation" | "recovery" | "performance_gap";
  title: string;
  description: string;
  timestamp: string;
  severity: "Critical" | "High" | "Medium";
  affectedFilters: string[];
}

export const generateVoiceInsights = (
  trendData: VoiceTrendData[],
  breakdowns: Record<string, VoiceBreakdown[]>,
  filters: GlobalFilterState
): DetectionInsight[] => {
  const insights: DetectionInsight[] = [];
  const now = new Date();

  // Detect sudden degradation (compare last 3 vs previous 3 data points)
  if (trendData.length >= 6) {
    const lastThree = trendData.slice(-3);
    const prevThree = trendData.slice(-6, -3);

    const lastAvg = lastThree.reduce((sum, d) => sum + d.call_success_rate, 0) / 3;
    const prevAvg = prevThree.reduce((sum, d) => sum + d.call_success_rate, 0) / 3;

    if (prevAvg - lastAvg > 3) {
      insights.push({
        id: `sudden-${Date.now()}`,
        type: "sudden_degradation",
        title: "Sudden Performance Degradation Detected",
        description: `Call success rate dropped ${(prevAvg - lastAvg).toFixed(2)}% recently. Immediate investigation recommended.`,
        timestamp: new Date(now.getTime() - 15 * 60000).toISOString(),
        severity: "High",
        affectedFilters: filters.vendors.length > 0 ? filters.vendors : ["All vendors"],
      });
    }

    // Detect recovery
    if (lastAvg - prevAvg > 2) {
      insights.push({
        id: `recovery-${Date.now()}`,
        type: "recovery",
        title: "Performance Recovery Observed",
        description: `Call success rate improved ${(lastAvg - prevAvg).toFixed(2)}% in recent period. System is stabilizing.`,
        timestamp: new Date(now.getTime() - 5 * 60000).toISOString(),
        severity: "Medium",
        affectedFilters: filters.technologies.length > 0 ? filters.technologies : ["All technologies"],
      });
    }

    // Detect ongoing degradation (gradual decline across multiple periods)
    if (trendData.length >= 8) {
      const lastFour = trendData.slice(-4);
      const prevFour = trendData.slice(-8, -4);

      const lastFourAvg = lastFour.reduce((sum, d) => sum + d.call_success_rate, 0) / 4;
      const prevFourAvg = prevFour.reduce((sum, d) => sum + d.call_success_rate, 0) / 4;

      // Check for consistent decline
      let isConsistentDecline = true;
      for (let i = 1; i < lastFour.length; i++) {
        if (lastFour[i].call_success_rate > lastFour[i - 1].call_success_rate) {
          isConsistentDecline = false;
          break;
        }
      }

      if (
        isConsistentDecline &&
        prevFourAvg - lastFourAvg > 1 &&
        lastFourAvg < 97
      ) {
        insights.push({
          id: `ongoing-${Date.now()}`,
          type: "ongoing_degradation",
          title: "Ongoing Performance Degradation",
          description: `Call success rate has been gradually declining over the past period (avg: ${lastFourAvg.toFixed(1)}%). This suggests a systemic issue that may require intervention.`,
          timestamp: new Date(now.getTime() - 45 * 60000).toISOString(),
          severity: "High",
          affectedFilters: filters.regions.length > 0 ? filters.regions : ["All regions"],
        });
      }
    }
  }

  // Detect performance gaps between breakdown dimensions
  for (const [dimension, items] of Object.entries(breakdowns)) {
    if (!items || items.length < 2) continue;

    const rates = items.map((d) => d.call_success_rate);
    const dropRates = items.map((d) => d.drop_rate);
    const max = Math.max(...rates);
    const min = Math.min(...rates);
    const gap = max - min;

    if (gap > 3) {
      const topItem = items.find((d) => d.call_success_rate === max);
      const bottomItem = items.find((d) => d.call_success_rate === min);

      insights.push({
        id: `gap-${dimension}-${Date.now()}`,
        type: "performance_gap",
        title: `Performance Variation in ${dimension}`,
        description: `${topItem?.name} (${max.toFixed(2)}%) significantly outperforms ${bottomItem?.name} (${min.toFixed(2)}%), indicating a ${gap.toFixed(2)}% gap. Consider investigating the variance.`,
        timestamp: new Date(now.getTime() - 30 * 60000).toISOString(),
        severity: "Medium",
        affectedFilters: [topItem?.name || "Top performer", bottomItem?.name || "Bottom performer"],
      });
    }
  }

  return insights.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export const calculatePriorityLevel = (
  kpiValue: number,
  kpiType: "success_rate" | "drop_rate" | "stability"
): "Critical" | "High" | "Medium" | "Low" => {
  if (kpiType === "success_rate") {
    if (kpiValue < 94) return "Critical";
    if (kpiValue < 96) return "High";
    if (kpiValue < 97) return "Medium";
    return "Low";
  }

  if (kpiType === "drop_rate") {
    if (kpiValue > 1) return "Critical";
    if (kpiValue > 0.7) return "High";
    if (kpiValue > 0.4) return "Medium";
    return "Low";
  }

  if (kpiType === "stability") {
    if (kpiValue < 96) return "Critical";
    if (kpiValue < 97) return "High";
    if (kpiValue < 98) return "Medium";
    return "Low";
  }

  return "Low";
};

/**
 * Heatmap data generation for Capacity & Congestion visualization
 */

export interface HeatmapCell {
  label: string;
  value: number;
  intensity: "low" | "medium" | "high" | "critical";
}

export interface HeatmapRow {
  name: string;
  cells: HeatmapCell[];
}

// Time vs Region heatmap - shows capacity stress by time and region
export const generateTimeRegionHeatmap = (): HeatmapRow[] => {
  const regions = ["North", "South", "East", "West", "Central"];
  const hours = ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00"];
  
  return hours.map((hour) => ({
    name: hour,
    cells: regions.map((region) => {
      // Higher stress during peak hours (8-20)
      const hourNum = parseInt(hour.split(":")[0]);
      const isPeakHour = hourNum >= 8 && hourNum <= 20;
      const baseStress = isPeakHour ? 60 + Math.random() * 30 : 20 + Math.random() * 30;
      
      // South region typically more congested
      const regionMultiplier = region === "South" ? 1.2 : region === "East" ? 1.1 : 1.0;
      const utilization = Math.min(baseStress * regionMultiplier, 100);
      
      return {
        label: `${utilization.toFixed(0)}%`,
        value: utilization,
        intensity: utilization > 80 ? "critical" : utilization > 60 ? "high" : utilization > 40 ? "medium" : "low",
      };
    }),
  }));
};

// Technology vs Capacity Stress heatmap
export const generateTechCapacityHeatmap = (): HeatmapRow[] => {
  const technologies = ["2G", "3G", "4G", "5G", "O-RAN"];
  const regions = ["North", "South", "East", "West"];
  
  return technologies.map((tech) => ({
    name: tech,
    cells: regions.map((region) => {
      // Older tech (2G/3G) has higher stress
      const techBase = tech === "2G" ? 75 : tech === "3G" ? 70 : tech === "4G" ? 55 : tech === "5G" ? 35 : 30;
      const regionVariance = Math.random() * 15;
      const stress = Math.min(techBase + regionVariance, 100);
      
      return {
        label: `${stress.toFixed(0)}%`,
        value: stress,
        intensity: stress > 75 ? "critical" : stress > 60 ? "high" : stress > 45 ? "medium" : "low",
      };
    }),
  }));
};

// Hourly utilization pattern - shows usage pattern across 24 hours
export const generateHourlyUtilizationHeatmap = (): HeatmapRow[] => {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const hours = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, "0")}:00`);
  
  return days.map((day) => ({
    name: day,
    cells: hours.map((hour) => {
      const hourNum = parseInt(hour.split(":")[0]);
      // Peak hours: 8-12, 15-20
      const isPeakHour = (hourNum >= 8 && hourNum <= 12) || (hourNum >= 15 && hourNum <= 20);
      const isWeekend = day === "Sat" || day === "Sun";
      
      let baseUtilization = isPeakHour ? 70 + Math.random() * 25 : 30 + Math.random() * 25;
      if (isWeekend) baseUtilization *= 0.7; // Lower weekend usage
      
      const utilization = Math.min(baseUtilization, 100);
      
      return {
        label: `${utilization.toFixed(0)}%`,
        value: utilization,
        intensity: utilization > 80 ? "critical" : utilization > 60 ? "high" : utilization > 40 ? "medium" : "low",
      };
    }),
  }));
};

/**
 * Data Analytics insights detection
 */

export const generateDataInsights = (
  trendData: DataTrendData[],
  filters: GlobalFilterState
): DetectionInsight[] => {
  const insights: DetectionInsight[] = [];
  const now = new Date();

  if (trendData.length < 2) return insights;

  // Detect sustained latency increase
  if (trendData.length >= 6) {
    const lastThree = trendData.slice(-3);
    const prevThree = trendData.slice(-6, -3);

    const lastLatencyAvg = lastThree.reduce((sum, d) => sum + d.avg_latency, 0) / 3;
    const prevLatencyAvg = prevThree.reduce((sum, d) => sum + d.avg_latency, 0) / 3;

    if (lastLatencyAvg > prevLatencyAvg && lastLatencyAvg - prevLatencyAvg > 5) {
      insights.push({
        id: `latency-increase-${Date.now()}`,
        type: "sudden_degradation",
        title: "Sustained Latency Increase Detected",
        description: `Average latency increased by ${(lastLatencyAvg - prevLatencyAvg).toFixed(2)}ms. This may impact user experience, especially for real-time applications.`,
        timestamp: new Date(now.getTime() - 20 * 60000).toISOString(),
        severity: "High",
        affectedFilters: filters.regions.length > 0 ? filters.regions : ["All regions"],
      });
    }

    // Detect latency improvement
    if (prevLatencyAvg > lastLatencyAvg && prevLatencyAvg - lastLatencyAvg > 3) {
      insights.push({
        id: `latency-improve-${Date.now()}`,
        type: "recovery",
        title: "Latency Improvement Observed",
        description: `Average latency reduced by ${(prevLatencyAvg - lastLatencyAvg).toFixed(2)}ms. Network responsiveness has improved.`,
        timestamp: new Date(now.getTime() - 10 * 60000).toISOString(),
        severity: "Medium",
        affectedFilters: filters.technologies.length > 0 ? filters.technologies : ["All technologies"],
      });
    }
  }

  // Detect speed degradation
  if (trendData.length >= 8) {
    const lastFour = trendData.slice(-4);
    const prevFour = trendData.slice(-8, -4);

    const lastSpeedAvg = lastFour.reduce((sum, d) => sum + d.avg_speed, 0) / 4;
    const prevSpeedAvg = prevFour.reduce((sum, d) => sum + d.avg_speed, 0) / 4;

    // Check for consistent decline
    let isConsistentDecline = true;
    for (let i = 1; i < lastFour.length; i++) {
      if (lastFour[i].avg_speed > lastFour[i - 1].avg_speed) {
        isConsistentDecline = false;
        break;
      }
    }

    if (isConsistentDecline && prevSpeedAvg - lastSpeedAvg > 5 && lastSpeedAvg < 85) {
      insights.push({
        id: `speed-decline-${Date.now()}`,
        type: "ongoing_degradation",
        title: "Sustained Speed Degradation",
        description: `Network speed has gradually declined from ${prevSpeedAvg.toFixed(2)} to ${lastSpeedAvg.toFixed(2)} Mbps over recent periods. This indicates a systemic issue.`,
        timestamp: new Date(now.getTime() - 45 * 60000).toISOString(),
        severity: "High",
        affectedFilters: filters.vendors.length > 0 ? filters.vendors : ["All vendors"],
      });
    }

    // Detect speed improvement
    if (lastSpeedAvg > prevSpeedAvg && lastSpeedAvg - prevSpeedAvg > 5) {
      insights.push({
        id: `speed-improve-${Date.now()}`,
        type: "recovery",
        title: "Network Speed Improvement",
        description: `Average speed improved by ${(lastSpeedAvg - prevSpeedAvg).toFixed(2)} Mbps. User experience enhancements detected.`,
        timestamp: new Date(now.getTime() - 8 * 60000).toISOString(),
        severity: "Medium",
        affectedFilters: filters.regions.length > 0 ? filters.regions : ["All regions"],
      });
    }
  }

  // Detect stability improvement
  if (trendData.length >= 5) {
    const recentPacketLoss = trendData.slice(-5);
    const avgRecentLoss = recentPacketLoss.reduce((sum, d) => sum + d.packet_loss, 0) / 5;
    const avgPreviousLoss = trendData.slice(-10, -5).length > 0
      ? trendData.slice(-10, -5).reduce((sum, d) => sum + d.packet_loss, 0) / 5
      : avgRecentLoss;

    if (avgPreviousLoss > avgRecentLoss && avgPreviousLoss - avgRecentLoss > 0.01) {
      insights.push({
        id: `stability-improve-${Date.now()}`,
        type: "recovery",
        title: "Stability Improvement Observed",
        description: `Packet loss rate decreased from ${(avgPreviousLoss * 100).toFixed(3)}% to ${(avgRecentLoss * 100).toFixed(3)}%. Network stability has improved over recent days.`,
        timestamp: new Date(now.getTime() - 12 * 60000).toISOString(),
        severity: "Medium",
        affectedFilters: filters.clusters.length > 0 ? filters.clusters : ["All clusters"],
      });
    }
  }

  return insights.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

function calculatePriorityFromPerformance(
  successRate: number,
  dropRate: number
): "Critical" | "High" | "Medium" | "Low" {
  if (successRate < 94 || dropRate > 1) return "Critical";
  if (successRate < 96 || dropRate > 0.7) return "High";
  if (successRate < 97 || dropRate > 0.4) return "Medium";
  return "Low";
}
