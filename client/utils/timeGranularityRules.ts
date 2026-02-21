/**
 * Time & Granularity Rules for Analytics Management
 * Validates and enforces constraints on time ranges and data granularity
 */

export type TimePreset = "15m" | "1h" | "24h" | "7d" | "custom";
export type Granularity = "15m" | "1h" | "1d" | "1w" | "1M";

export interface TimeRange {
  from: string; // ISO date string
  to: string; // ISO date string
}

interface GranularityConstraint {
  granularity: Granularity;
  maxRangeDays: number;
  label: string;
}

// Granularity constraints: max range for each granularity level
export const GRANULARITY_CONSTRAINTS: GranularityConstraint[] = [
  { granularity: "15m", maxRangeDays: 1, label: "15 Minutes" },
  { granularity: "1h", maxRangeDays: 30, label: "Hourly" },
  { granularity: "1d", maxRangeDays: Infinity, label: "Daily" },
  { granularity: "1w", maxRangeDays: Infinity, label: "Weekly" },
  { granularity: "1M", maxRangeDays: Infinity, label: "Monthly" },
];

// Preset time ranges
export const TIME_PRESETS = {
  "15m": {
    label: "Last 15 minutes",
    getDates: () => {
      const to = new Date();
      const from = new Date(to.getTime() - 15 * 60 * 1000);
      return {
        from: from.toISOString().split("T")[0],
        to: to.toISOString().split("T")[0],
      };
    },
  },
  "1h": {
    label: "Last 1 hour",
    getDates: () => {
      const to = new Date();
      const from = new Date(to.getTime() - 60 * 60 * 1000);
      return {
        from: from.toISOString().split("T")[0],
        to: to.toISOString().split("T")[0],
      };
    },
  },
  "24h": {
    label: "Last 24 hours",
    getDates: () => {
      const to = new Date();
      const from = new Date(to.getTime() - 24 * 60 * 60 * 1000);
      return {
        from: from.toISOString().split("T")[0],
        to: to.toISOString().split("T")[0],
      };
    },
  },
  "7d": {
    label: "Last 7 days",
    getDates: () => {
      const to = new Date();
      const from = new Date(to.getTime() - 7 * 24 * 60 * 60 * 1000);
      return {
        from: from.toISOString().split("T")[0],
        to: to.toISOString().split("T")[0],
      };
    },
  },
};

/**
 * Get the number of days between two dates
 */
export const getDaysBetween = (from: string, to: string): number => {
  const fromDate = new Date(from);
  const toDate = new Date(to);
  const diffTime = Math.abs(toDate.getTime() - fromDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Get valid granularities for a given time range
 */
export const getValidGranularities = (timeRange: TimeRange): Granularity[] => {
  const rangeDays = getDaysBetween(timeRange.from, timeRange.to);

  return GRANULARITY_CONSTRAINTS.filter(
    (constraint) => rangeDays <= constraint.maxRangeDays
  ).map((c) => c.granularity);
};

/**
 * Check if a granularity is valid for a given time range
 */
export const isValidGranularity = (
  timeRange: TimeRange,
  granularity: Granularity
): boolean => {
  const validGranularities = getValidGranularities(timeRange);
  return validGranularities.includes(granularity);
};

/**
 * Get warning message if granularity is not optimal
 */
export const getGranularityWarning = (
  timeRange: TimeRange,
  granularity: Granularity
): string | null => {
  const rangeDays = getDaysBetween(timeRange.from, timeRange.to);
  const constraint = GRANULARITY_CONSTRAINTS.find(
    (c) => c.granularity === granularity
  );

  if (!constraint) return null;

  if (rangeDays > constraint.maxRangeDays) {
    return `⚠️ ${granularity === "15m" ? "15-minute" : granularity === "1h" ? "Hourly" : "Daily"} granularity supports a maximum of ${constraint.maxRangeDays} days. Consider using a coarser granularity.`;
  }

  if (rangeDays > 7 && granularity === "15m") {
    return "💡 For ranges longer than 1 day, consider using hourly granularity for better performance.";
  }

  if (rangeDays > 30 && granularity === "1h") {
    return "💡 For ranges longer than 30 days, consider using daily granularity for better performance.";
  }

  return null;
};

/**
 * Get recommended granularity for a given time range
 */
export const getRecommendedGranularity = (timeRange: TimeRange): Granularity => {
  const rangeDays = getDaysBetween(timeRange.from, timeRange.to);

  if (rangeDays <= 1) return "15m";
  if (rangeDays <= 30) return "1h";
  return "1d";
};

/**
 * Validate time range and granularity combination
 * Returns { valid: boolean, error?: string, warning?: string }
 */
export const validateTimeAndGranularity = (
  timeRange: TimeRange,
  granularity: Granularity
): { valid: boolean; error?: string; warning?: string } => {
  const rangeDays = getDaysBetween(timeRange.from, timeRange.to);

  if (rangeDays <= 0) {
    return { valid: false, error: "Invalid date range: 'from' must be before 'to'" };
  }

  const constraint = GRANULARITY_CONSTRAINTS.find(
    (c) => c.granularity === granularity
  );

  if (!constraint) {
    return { valid: false, error: `Invalid granularity: ${granularity}` };
  }

  if (rangeDays > constraint.maxRangeDays) {
    return {
      valid: false,
      error: `${granularity === "15m" ? "15-minute" : granularity === "1h" ? "Hourly" : "Daily"} granularity only supports up to ${constraint.maxRangeDays} days.`,
    };
  }

  const warning = getGranularityWarning(timeRange, granularity);
  return { valid: true, warning: warning || undefined };
};

/**
 * Format granularity for display
 */
export const formatGranularity = (granularity: Granularity): string => {
  const constraint = GRANULARITY_CONSTRAINTS.find(
    (c) => c.granularity === granularity
  );
  return constraint?.label || granularity;
};

/**
 * Format time range for display
 */
export const formatTimeRange = (timeRange: TimeRange): string => {
  const from = new Date(timeRange.from);
  const to = new Date(timeRange.to);
  const sameYear = from.getFullYear() === to.getFullYear();
  const sameMonth = sameYear && from.getMonth() === to.getMonth();

  const formatDate = (date: Date, full = false) => {
    if (full) {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  if (sameMonth) {
    return `${formatDate(from, false)} - ${formatDate(to, true)}`;
  }

  return `${formatDate(from, !sameYear)} - ${formatDate(to, true)}`;
};
