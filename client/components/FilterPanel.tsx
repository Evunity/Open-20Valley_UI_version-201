import { useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGlobalFilters, type GlobalFilterState } from "@/hooks/useGlobalFilters";
import { useToast } from "@/hooks/use-toast";
import DualMonthCalendar from "@/components/DualMonthCalendar";
import SearchableDropdown from "@/components/SearchableDropdown";
import { getDaysDifference } from "@/utils/dashboardData";
import { describeMixedTechnologies } from "@/utils/technologyLabels";

interface FilterPanelProps {
  onFiltersChange?: (filters: GlobalFilterState) => void;
}

export default function FilterPanel({ onFiltersChange }: FilterPanelProps) {
  const { filters, setFilters, resetFilters, availableClusters } = useGlobalFilters();
  const { toast } = useToast();
  const [showCalendarDropdown, setShowCalendarDropdown] = useState(false);

  const handleFilterChange = (newFilters: GlobalFilterState) => {
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  // Determine if hourly is allowed based on date range
  const daysDiff = getDaysDifference(filters.dateRange);
  const allowHourly = daysDiff <= 3;
  const shouldForceDaily = daysDiff > 3;

  // Auto-adjust granularity if needed
  if (shouldForceDaily && filters.timeGranularity === "hours") {
    handleFilterChange({
      ...filters,
      timeGranularity: "days",
    });
  }

  const activeFilterCount =
    filters.vendors.length +
    filters.technologies.length +
    filters.regions.length +
    filters.clusters.length +
    filters.countries.length +
    (filters.dateRange.from ? 1 : 0) +
    (filters.dateRange.to ? 1 : 0);

  const formatDateRange = () => {
    if (!filters.dateRange.from && !filters.dateRange.to) return null;
    const from = filters.dateRange.from
      ? new Date(filters.dateRange.from).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })
      : null;
    const to = filters.dateRange.to
      ? new Date(filters.dateRange.to).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })
      : null;

    if (from && to) return `${from} - ${to}`;
    if (from) return `From ${from}`;
    if (to) return `To ${to}`;
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Active Filters Pills with Multi-Vendor Highlighting */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.vendors.map((v) => (
            <div
              key={`vendor-${v}`}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium"
            >
              {v}
              <button
                onClick={() =>
                  handleFilterChange({
                    ...filters,
                    vendors: filters.vendors.filter((x) => x !== v),
                  })
                }
                className="hover:opacity-70 transition-opacity"
                title="Remove filter"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          {filters.technologies.map((t) => (
            <div
              key={`tech-${t}`}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium"
              title={describeMixedTechnologies([t])}
            >
              {t}
              <button
                onClick={() =>
                  handleFilterChange({
                    ...filters,
                    technologies: filters.technologies.filter((x) => x !== t),
                  })
                }
                className="hover:opacity-70 transition-opacity"
                title="Remove filter"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          {filters.regions.map((r) => (
            <div
              key={`region-${r}`}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium"
            >
              {r}
              <button
                onClick={() =>
                  handleFilterChange({
                    ...filters,
                    regions: filters.regions.filter((x) => x !== r),
                  })
                }
                className="hover:opacity-70 transition-opacity"
                title="Remove filter"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          {filters.clusters.map((c) => (
            <div
              key={`cluster-${c}`}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium"
            >
              {c}
              <button
                onClick={() =>
                  handleFilterChange({
                    ...filters,
                    clusters: filters.clusters.filter((x) => x !== c),
                  })
                }
                className="hover:opacity-70 transition-opacity"
                title="Remove filter"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          {filters.countries.map((country) => (
            <div
              key={`country-${country}`}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium"
            >
              {country}
              <button
                onClick={() =>
                  handleFilterChange({
                    ...filters,
                    countries: filters.countries.filter((x) => x !== country),
                  })
                }
                className="hover:opacity-70 transition-opacity"
                title="Remove filter"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          {formatDateRange() && (
            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
              📅 {formatDateRange()}
              <button
                onClick={() =>
                  handleFilterChange({
                    ...filters,
                    dateRange: { from: null, to: null },
                  })
                }
                className="hover:opacity-70 transition-opacity"
                title="Remove filter"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Always-Visible Filter Dropdowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3 p-4 rounded-lg border border-border bg-card">
        {/* Country Dropdown */}
        <SearchableDropdown
          label="Country"
          options={["United States", "Canada", "United Kingdom", "Germany", "France", "Japan", "India", "Australia", "Egypt", "Saudi Arabia", "United Arab Emirates", "Kuwait", "Qatar", "Bahrain", "Morocco"]}
          selected={filters.countries}
          onChange={(selected) => handleFilterChange({ ...filters, countries: selected })}
          placeholder="Search countries..."
        />

        {/* Region Dropdown */}
        <SearchableDropdown
          label="Region"
          options={["North", "South", "East", "West", "Central"]}
          selected={filters.regions}
          onChange={(selected) => handleFilterChange({ ...filters, regions: selected })}
          placeholder="Search regions..."
        />

        {/* Cluster Dropdown */}
        <SearchableDropdown
          label="Cluster"
          options={availableClusters.map((cluster) => cluster.name)}
          selected={filters.clusters}
          onChange={(selected) => handleFilterChange({ ...filters, clusters: selected })}
          placeholder="Search clusters..."
        />

        {/* Vendor Dropdown */}
        <SearchableDropdown
          label="Vendor"
          options={["Ericsson", "Huawei", "Nokia", "Samsung", "Cisco"]}
          selected={filters.vendors}
          onChange={(selected) => handleFilterChange({ ...filters, vendors: selected })}
          placeholder="Search vendors..."
        />

        {/* Technology Dropdown */}
        <SearchableDropdown
          label="Technology"
          options={["2G", "3G", "4G", "5G", "O-RAN"]}
          selected={filters.technologies}
          onChange={(selected) => handleFilterChange({ ...filters, technologies: selected })}
          placeholder="Search technologies..."
        />

        {/* Time Granularity Control */}
        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
            Granularity
          </label>
          <select
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            value={filters.timeGranularity}
            onChange={(e) => {
              const granularity = e.target.value as "hours" | "days";
              // Only allow hourly if date range is 3 days or less
              if (granularity === "hours" && !allowHourly) {
                toast({
                  title: "Cannot select hourly",
                  description: "Hourly view is only available for date ranges of 3 days or less",
                });
                return;
              }
              handleFilterChange({
                ...filters,
                timeGranularity: granularity,
              });
            }}
            disabled={!allowHourly && filters.timeGranularity === "hours"}
          >
            <option value="hours" disabled={!allowHourly}>
              Hours {!allowHourly ? "(not available)" : ""}
            </option>
            <option value="days">Days</option>
          </select>
        </div>

        {/* Choose Dates Button */}
        <div>
          <button
            onClick={() => setShowCalendarDropdown(!showCalendarDropdown)}
            className="w-full h-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all hover:bg-muted/30 flex flex-col items-start justify-center gap-1"
          >
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block">
              Choose Dates
            </span>
            {filters.dateRange.from && filters.dateRange.to ? (
              <span className="text-xs text-foreground font-medium">
                {new Date(filters.dateRange.from).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}{" "}
                -{" "}
                {new Date(filters.dateRange.to).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            ) : (
              <span className="text-xs text-muted-foreground">Select range</span>
            )}
          </button>
        </div>

        {/* Add Cluster Location Button - Hidden in analytics view, only for admin */}
        {/* This configuration action has been moved to Settings page */}

        {/* Reset Button */}
        <div className="flex items-end">
          <button
            onClick={() => {
              resetFilters();
              onFiltersChange?.({
                vendors: [],
                technologies: [],
                regions: [],
                clusters: [],
                countries: [],
                dateRange: { from: null, to: null },
                timeGranularity: "days",
              });
            }}
            className="w-full px-3 py-2 rounded-lg bg-muted hover:bg-muted/70 transition-all duration-200 text-xs font-medium active:scale-95"
          >
            Reset All
          </button>
        </div>
      </div>

      {/* Calendar Dropdown (Only shows when clicked) */}
      {showCalendarDropdown && (
        <div className="p-4 rounded-lg border border-border bg-card shadow-lg">
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Select Start & End Date
              </label>
              <button
                onClick={() => setShowCalendarDropdown(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
                title="Close calendar"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <DualMonthCalendar
              startDate={filters.dateRange.from}
              endDate={filters.dateRange.to}
              onDateSelect={(date, isStart) => {
                if (isStart) {
                  handleFilterChange({
                    ...filters,
                    dateRange: {
                      from: date,
                      to: null,
                    },
                  });
                } else {
                  handleFilterChange({
                    ...filters,
                    dateRange: {
                      from: filters.dateRange.from,
                      to: date,
                    },
                  });
                }
              }}
              onRangeComplete={(start, end) => {
                handleFilterChange({
                  ...filters,
                  dateRange: {
                    from: start,
                    to: end,
                  },
                });
              }}
            />

            {/* Date Range Summary */}
            {filters.dateRange.from && filters.dateRange.to && (
              <div className="pt-3 border-t border-border/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    <strong>Selected:</strong>{" "}
                    {new Date(filters.dateRange.from).toLocaleDateString()} →{" "}
                    {new Date(filters.dateRange.to).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => {
                      handleFilterChange({
                        ...filters,
                        dateRange: { from: null, to: null },
                      });
                    }}
                    className="px-2 py-1 text-xs rounded bg-muted hover:bg-muted/70 transition-all"
                  >
                    Clear
                  </button>
                </div>
                <div className="text-xs text-muted-foreground">
                  {daysDiff} day{daysDiff !== 1 ? "s" : ""} selected
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Cluster Location Dialog removed - moved to Settings page */}
    </div>
  );
}
