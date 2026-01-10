import type { GlobalFilterState } from "@/hooks/useGlobalFilters";

/**
 * Calculate how many days are in the selected date range
 */
export const getDaysDifference = (dateRange: { from: Date | null; to: Date | null }): number => {
  if (!dateRange.from || !dateRange.to) return 1;

  const from = new Date(dateRange.from);
  const to = new Date(dateRange.to);
  const diffTime = Math.abs(to.getTime() - from.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return Math.max(1, diffDays);
};

/**
 * Determine if we should show hourly or daily data
 * Hourly is available for 1-3 day ranges
 * For longer ranges, daily is forced
 */
export const isHourlyGranularity = (
  dateRange: { from: Date | null; to: Date | null },
  manualGranularity?: "hours" | "days"
): boolean => {
  const daysDiff = getDaysDifference(dateRange);

  // If manual granularity is set, respect it (but only if it's allowed)
  if (manualGranularity) {
    if (manualGranularity === "hours" && daysDiff <= 3) {
      return true;
    }
    if (manualGranularity === "days") {
      return false;
    }
  }

  // If date range is longer than 3 days, force daily view
  if (daysDiff > 3) {
    return false;
  }

  // For 1-3 days, default to hourly
  return true;
};

/**
 * Generate hourly traffic data (24 hours)
 */
export const generateHourlyTrafficData = (filters: GlobalFilterState) => {
  const baseMultiplier = 1 - (filters.vendors.length * 0.1 + filters.technologies.length * 0.05);

  return Array.from({ length: 24 }, (_, i) => {
    const hour = String(i).padStart(2, "0");
    const traffic = (2 + Math.random() * 2) * baseMultiplier;
    const success = 97 + Math.random() * 3 - filters.vendors.length * 0.5;
    const totalSites = Math.round((2847 + Math.random() * 200) * baseMultiplier);
    const activeSites = Math.round(totalSites * (0.95 + Math.random() * 0.04));
    const latency = 40 + Math.random() * 20 - filters.vendors.length * 2;

    return {
      time: `${hour}:00`,
      traffic: Math.round(traffic * 100) / 100,
      success: Math.round(success * 100) / 100,
      total_sites: totalSites,
      active_sites: activeSites,
      uptime: Math.round((99.5 + Math.random() * 0.5) * 100) / 100,
      success_rate: Math.round(success * 100) / 100,
      avg_latency: Math.round(latency * 100) / 100,
      network_health: Math.round((93 + Math.random() * 5) * 100) / 100,
    };
  });
};

/**
 * Generate daily traffic data
 */
export const generateDailyTrafficData = (filters: GlobalFilterState, dayCount: number) => {
  const baseMultiplier = 1 - (filters.vendors.length * 0.1 + filters.technologies.length * 0.05);
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return Array.from({ length: Math.min(dayCount, 30) }, (_, i) => {
    const traffic = (2.5 + Math.random() * 1.5) * baseMultiplier;
    const success = 98 + Math.random() * 2 - filters.vendors.length * 0.5;
    const totalSites = Math.round((2847 + Math.random() * 300) * baseMultiplier);
    const activeSites = Math.round(totalSites * (0.94 + Math.random() * 0.05));
    const latency = 42 + Math.random() * 25 - filters.vendors.length * 2;

    return {
      time: days[i % 7],
      traffic: Math.round(traffic * 100) / 100,
      success: Math.round(success * 100) / 100,
      total_sites: totalSites,
      active_sites: activeSites,
      uptime: Math.round((99.7 + Math.random() * 0.3) * 100) / 100,
      success_rate: Math.round(success * 100) / 100,
      avg_latency: Math.round(latency * 100) / 100,
      network_health: Math.round((94 + Math.random() * 4) * 100) / 100,
    };
  });
};

/**
 * Generate traffic data based on date range
 */
export const generateTrafficData = (filters: GlobalFilterState) => {
  const dayCount = getDaysDifference(filters.dateRange);
  const isHourly = isHourlyGranularity(filters.dateRange);

  return isHourly
    ? generateHourlyTrafficData(filters)
    : generateDailyTrafficData(filters, dayCount);
};

/**
 * Generate region data with filter impact
 */
export const generateRegionData = (filters: GlobalFilterState) => {
  const baseData = [
    { region: "North", sites: 684 },
    { region: "South", sites: 512 },
    { region: "East", sites: 721 },
    { region: "West", sites: 598 },
    { region: "Central", sites: 332 },
  ];

  const multiplier = filters.regions.length > 0 ? 0.7 : 1;
  const vendorMultiplier = 1 - filters.vendors.length * 0.1;

  return baseData.map((d) => ({
    ...d,
    sites: Math.round(d.sites * multiplier * vendorMultiplier),
  }));
};

/**
 * Generate vendor data with filter impact
 */
export const generateVendorData = (filters: GlobalFilterState) => {
  const baseData = [
    { vendor: "Ericsson", sites: 892, fill: "#7c3aed" },
    { vendor: "Huawei", sites: 756, fill: "#3b82f6" },
    { vendor: "Nokia", sites: 634, fill: "#22c55e" },
    { vendor: "Samsung", sites: 389, fill: "#f59e0b" },
    { vendor: "Others", sites: 176, fill: "#ef4444" },
  ];

  const multiplier = filters.vendors.length > 0 ? 0.8 : 1;
  const techMultiplier = 1 - filters.technologies.length * 0.05;

  return baseData.map((d) => ({
    ...d,
    sites: Math.round(d.sites * multiplier * techMultiplier),
  }));
};

/**
 * Generate AI Engine Actions data
 */
export const generateAIActionsData = (filters: GlobalFilterState) => {
  const dayCount = getDaysDifference(filters.dateRange);
  const isHourly = isHourlyGranularity(filters.dateRange);

  const baseMultiplier = 1 - (filters.vendors.length * 0.1 + filters.technologies.length * 0.05);

  if (isHourly) {
    // Hourly data
    return Array.from({ length: 24 }, (_, i) => {
      const hour = String(i).padStart(2, "0");
      const total = Math.round((12 + Math.random() * 8) * baseMultiplier);
      const successful = Math.round(total * (0.85 + Math.random() * 0.1));
      const failed = total - successful;

      return {
        time: `${hour}:00`,
        total,
        successful,
        failed,
      };
    });
  } else {
    // Daily data
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    return Array.from({ length: Math.min(dayCount, 30) }, (_, i) => {
      const total = Math.round((150 + Math.random() * 100) * baseMultiplier);
      const successful = Math.round(total * (0.85 + Math.random() * 0.1));
      const failed = total - successful;

      return {
        time: days[i % 7],
        total,
        successful,
        failed,
      };
    });
  }
};

/**
 * Generate summary metrics for AI Engine Actions
 */
export const generateAIActionsSummary = (filters: GlobalFilterState) => {
  const dayCount = getDaysDifference(filters.dateRange);
  const baseMultiplier = 1 - (filters.vendors.length * 0.1 + filters.technologies.length * 0.05);

  // Scale total based on day count
  const baseTotal = 342 * (dayCount > 1 ? dayCount : 1);
  const total = Math.round(baseTotal * baseMultiplier);
  const successful = Math.round(total * 0.87);
  const failed = total - successful;

  return {
    totalActions: total,
    successfulActions: successful,
    failedActions: failed,
  };
};

/**
 * Calculate filter impact multiplier (for KPIs)
 */
export const calculateFilterMultiplier = (filters: GlobalFilterState): number => {
  let multiplier = 1;

  if (filters.vendors.length > 0) {
    multiplier *= 0.85;
  }
  if (filters.technologies.length > 0) {
    multiplier *= 0.9;
  }
  if (filters.regions.length > 0) {
    multiplier = 1 - filters.regions.length * 0.15;
    multiplier = Math.max(0.4, multiplier);
  }
  if (filters.countries.length > 0) {
    multiplier *= 0.95;
  }

  return multiplier;
};

/**
 * Calculate date range multiplier (for KPIs)
 */
export const calculateDateMultiplier = (filters: GlobalFilterState): number => {
  const dayCount = getDaysDifference(filters.dateRange);

  // If single day selected, show reduced numbers (subset of daily activity)
  if (dayCount === 1) {
    return 1;
  }

  // For multiple days, scale up proportionally
  return Math.min(dayCount / 7, 1.5); // Cap at 1.5x to avoid exponential growth
};

/**
 * Generate detailed AI Engine Actions list with action names, times, severity, and status
 */
export const generateAIActionsDetailList = (filters: GlobalFilterState) => {
  const actionTypes = [
    "Auto-scale Resources",
    "Reroute Traffic",
    "Clear Cache",
    "Restart Service",
    "Update Configuration",
    "Backup Data",
    "Optimize Network",
    "Patch Security",
    "Monitor Health",
    "Load Balance",
    "Failover Activate",
    "Sync Database",
    "Compress Logs",
    "Verify Integrity",
    "Clean Temp Files",
  ];

  const severities: Array<"HIGH" | "MED" | "LOW"> = ["HIGH", "MED", "LOW"];
  const statuses: Array<"Success" | "Failed" | "Ongoing"> = ["Success", "Failed", "Ongoing"];

  const dayCount = getDaysDifference(filters.dateRange);
  const isHourly = isHourlyGranularity(filters.dateRange);

  const baseMultiplier = 1 - (filters.vendors.length * 0.1 + filters.technologies.length * 0.05);

  // Generate list based on granularity
  const actionCount = isHourly
    ? Math.round(8 * baseMultiplier)
    : Math.round(20 * baseMultiplier * Math.min(dayCount, 5));

  const actions = [];
  const now = new Date();

  for (let i = 0; i < actionCount; i++) {
    const actionTime = new Date(
      now.getTime() -
        i * (isHourly ? 3600000 : 86400000 * (dayCount > 1 ? dayCount / actionCount : 0.5))
    );

    const timeStr = isHourly
      ? actionTime.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
      : actionTime.toLocaleDateString("en-US", { month: "short", day: "numeric" });

    actions.push({
      id: `action-${i}`,
      name: actionTypes[Math.floor(Math.random() * actionTypes.length)],
      time: timeStr,
      severity: severities[Math.floor(Math.random() * severities.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
    });
  }

  return actions;
};
