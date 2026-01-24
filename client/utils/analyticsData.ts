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
      const successRate = 97 + Math.random() * 2;
      return {
        time: `${hour}:00`,
        call_volume: Math.round((2100 + Math.random() * 800) * baseMultiplier),
        call_success_rate: successRate,
        drop_rate: 0.5 + Math.random() * 0.3,
        call_stability: 98 + Math.random() * 1.5,
        crr: Math.max(85, successRate - Math.random() * 5),
        call_continuity: 97 + Math.random() * 2,
        vqi: 8.5 + Math.random() * 1,
        vpi: 8.6 + Math.random() * 0.9,
        vsqi: 8.4 + Math.random() * 1.1,
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

      const successRate = 97.2 + Math.random() * 2;
      return {
        time: dateStr,
        call_volume: Math.round((50000 + Math.random() * 10000) * baseMultiplier),
        call_success_rate: successRate,
        drop_rate: 0.5 + Math.random() * 0.35,
        call_stability: 98.1 + Math.random() * 1.5,
        crr: Math.max(85, successRate - Math.random() * 5),
        call_continuity: 97.5 + Math.random() * 2,
        vqi: 8.6 + Math.random() * 1,
        vpi: 8.7 + Math.random() * 0.9,
        vsqi: 8.5 + Math.random() * 1.1,
      };
    });
  }
};

interface VoiceBreakdown {
  name: string;
  call_success_rate: number;
  drop_rate: number;
  call_stability: number;
  status: string;
  count: number;
  priority?: "Critical" | "High" | "Medium" | "Low";
}

const calculatePriorityFromPerformance = (successRate: number, dropRate: number): "Critical" | "High" | "Medium" | "Low" => {
  // Critical: success rate < 94% or drop rate > 1.5%
  if (successRate < 94 || dropRate > 1.5) return "Critical";
  // High: success rate 94-96% or drop rate 1-1.5%
  if (successRate < 96 || dropRate > 1) return "High";
  // Medium: success rate 96-98% or drop rate 0.5-1%
  if (successRate < 98 || dropRate > 0.5) return "Medium";
  // Low: success rate > 98% and drop rate < 0.5%
  return "Low";
};

export const generateVoiceBreakdownByVendor = (filters: GlobalFilterState): VoiceBreakdown[] => {
  const vendors = ["Ericsson", "Huawei", "Nokia", "Samsung"];
  return vendors.map((vendor) => {
    const successRate = 96 + Math.random() * 3;
    const dropRate = 0.4 + Math.random() * 0.4;
    return {
      name: vendor,
      call_success_rate: successRate,
      drop_rate: dropRate,
      call_stability: 97.5 + Math.random() * 2,
      status: Math.random() > 0.3 ? "High quality" : "Acceptable",
      count: Math.round(15000 + Math.random() * 5000),
      priority: calculatePriorityFromPerformance(successRate, dropRate),
    };
  });
};

export const generateVoiceBreakdownByTechnology = (
  filters: GlobalFilterState
): VoiceBreakdown[] => {
  const techs = ["2G", "3G", "4G", "5G", "O-RAN"];
  return techs.map((tech) => {
    const successRate = 95 + Math.random() * 4;
    const dropRate = 0.3 + Math.random() * 0.5;
    return {
      name: tech,
      call_success_rate: successRate,
      drop_rate: dropRate,
      call_stability: 97 + Math.random() * 2.5,
      status:
        Math.random() > 0.4
          ? "High quality"
          : Math.random() > 0.5
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
    Congested: data.filter((d) => d.call_success_rate < 96.5),
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
        description: `Call success rate dropped ${(prevAvg - lastAvg).toFixed(2)}% recently`,
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
        description: `Call success rate improved ${(lastAvg - prevAvg).toFixed(2)}% in recent period`,
        timestamp: new Date(now.getTime() - 5 * 60000).toISOString(),
        severity: "Medium",
        affectedFilters: filters.technologies.length > 0 ? filters.technologies : ["All technologies"],
      });
    }
  }

  // Detect performance gaps between breakdown dimensions
  for (const [dimension, items] of Object.entries(breakdowns)) {
    const rates = items.map((d) => d.call_success_rate);
    if (rates.length >= 2) {
      const max = Math.max(...rates);
      const min = Math.min(...rates);

      if (max - min > 2) {
        insights.push({
          id: `gap-${dimension}-${Date.now()}`,
          type: "performance_gap",
          title: `Performance Gap in ${dimension}`,
          description: `Success rate varies by ${(max - min).toFixed(2)}% across ${dimension}s (${min.toFixed(1)}% to ${max.toFixed(1)}%)`,
          timestamp: new Date(now.getTime() - 30 * 60000).toISOString(),
          severity: max - min > 5 ? "Critical" : "High",
          affectedFilters: [dimension],
        });
      }
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
