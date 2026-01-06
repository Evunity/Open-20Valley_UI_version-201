import type { GlobalFilterState } from "@/hooks/useGlobalFilters";

/**
 * Determines time distribution granularity based on date range
 * - Multiple days: day-by-day distribution
 * - Single day: hour-by-hour distribution
 */
export const getTimeDistribution = (dateRange: {
  from: Date | null;
  to: Date | null;
}): "hourly" | "daily" => {
  if (!dateRange.from || !dateRange.to) {
    return "daily"; // Default to daily if no date range
  }

  const from = new Date(dateRange.from);
  const to = new Date(dateRange.to);
  const diffTime = Math.abs(to.getTime() - from.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays === 1 ? "hourly" : "daily";
};

/**
 * Generates time-series data based on selected granularity
 */
export const generateTimeSeriesData = (baseData: any[], granularity: "hourly" | "daily") => {
  if (granularity === "hourly") {
    // Generate 24 hours of data
    return Array.from({ length: 24 }, (_, i) => ({
      time: `${String(i).padStart(2, "0")}:00`,
      ...baseData[i % baseData.length],
    }));
  } else {
    // Return daily data as-is
    return baseData;
  }
};

/**
 * Apply filters to data with AND logic
 * - All selected filters must match
 * - If no filter selected for a dimension, all values pass
 */
export const applyFiltersToData = <T extends Record<string, any>>(
  data: T[],
  filters: GlobalFilterState,
  filterMappers?: {
    vendor?: (item: T) => string;
    technology?: (item: T) => string;
    region?: (item: T) => string;
    cluster?: (item: T) => string;
    country?: (item: T) => string;
  }
): T[] => {
  return data.filter((item) => {
    // Check vendor filter
    if (filters.vendors.length > 0 && filterMappers?.vendor) {
      const itemVendor = filterMappers.vendor(item);
      if (!filters.vendors.includes(itemVendor)) {
        return false;
      }
    }

    // Check technology filter
    if (filters.technologies.length > 0 && filterMappers?.technology) {
      const itemTech = filterMappers.technology(item);
      if (!filters.technologies.includes(itemTech)) {
        return false;
      }
    }

    // Check region filter
    if (filters.regions.length > 0 && filterMappers?.region) {
      const itemRegion = filterMappers.region(item);
      if (!filters.regions.includes(itemRegion)) {
        return false;
      }
    }

    // Check cluster filter
    if (filters.clusters.length > 0 && filterMappers?.cluster) {
      const itemCluster = filterMappers.cluster(item);
      if (!filters.clusters.includes(itemCluster)) {
        return false;
      }
    }

    // Check country filter
    if (filters.countries.length > 0 && filterMappers?.country) {
      const itemCountry = filterMappers.country(item);
      if (!filters.countries.includes(itemCountry)) {
        return false;
      }
    }

    return true;
  });
};

/**
 * Apply date range filter to time-series data
 */
export const applyDateRangeFilter = <T extends Record<string, any>>(
  data: T[],
  dateRange: { from: Date | null; to: Date | null },
  dateExtractor?: (item: T) => Date
): T[] => {
  if (!dateRange.from && !dateRange.to) {
    return data;
  }

  const from = dateRange.from ? new Date(dateRange.from) : null;
  const to = dateRange.to ? new Date(dateRange.to) : null;

  return data.filter((item) => {
    if (!dateExtractor) return true;

    const itemDate = dateExtractor(item);

    if (from && itemDate < from) {
      return false;
    }
    if (to && itemDate > to) {
      return false;
    }

    return true;
  });
};

/**
 * Apply all filters to data
 */
export const applyAllFilters = <T extends Record<string, any>>(
  data: T[],
  filters: GlobalFilterState,
  config?: {
    filterMappers?: {
      vendor?: (item: T) => string;
      technology?: (item: T) => string;
      region?: (item: T) => string;
      cluster?: (item: T) => string;
      country?: (item: T) => string;
    };
    dateExtractor?: (item: T) => Date;
  }
): T[] => {
  let filtered = data;

  // Apply dimension filters
  if (config?.filterMappers) {
    filtered = applyFiltersToData(filtered, filters, config.filterMappers);
  }

  // Apply date range filter
  if (config?.dateExtractor) {
    filtered = applyDateRangeFilter(filtered, filters.dateRange, config.dateExtractor);
  }

  return filtered;
};

/**
 * Check if any filters are applied
 */
export const hasActiveFilters = (filters: GlobalFilterState): boolean => {
  return (
    filters.vendors.length > 0 ||
    filters.technologies.length > 0 ||
    filters.regions.length > 0 ||
    filters.clusters.length > 0 ||
    filters.countries.length > 0 ||
    (filters.dateRange.from !== null && filters.dateRange.to !== null)
  );
};

/**
 * Get a summary string of active filters
 */
export const getActiveFiltersString = (filters: GlobalFilterState): string => {
  const parts: string[] = [];

  if (filters.vendors.length > 0) {
    parts.push(`Vendor: ${filters.vendors.join(", ")}`);
  }
  if (filters.technologies.length > 0) {
    parts.push(`Tech: ${filters.technologies.join(", ")}`);
  }
  if (filters.regions.length > 0) {
    parts.push(`Region: ${filters.regions.join(", ")}`);
  }
  if (filters.clusters.length > 0) {
    parts.push(`Cluster: ${filters.clusters.join(", ")}`);
  }
  if (filters.countries.length > 0) {
    parts.push(`Country: ${filters.countries.join(", ")}`);
  }
  if (filters.dateRange.from || filters.dateRange.to) {
    const from = filters.dateRange.from
      ? new Date(filters.dateRange.from).toLocaleDateString()
      : "N/A";
    const to = filters.dateRange.to ? new Date(filters.dateRange.to).toLocaleDateString() : "N/A";
    parts.push(`Date: ${from} to ${to}`);
  }

  return parts.length > 0 ? parts.join(" | ") : "No filters applied";
};
