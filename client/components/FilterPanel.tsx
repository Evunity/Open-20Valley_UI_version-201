import { useState, useEffect } from "react";
import { X, Check } from "lucide-react";
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

  // Staged filters - changes are made here until Apply is clicked
  const [stagedFilters, setStagedFilters] = useState<GlobalFilterState>(filters);

  // Check if there are unsaved changes
  const hasChanges = JSON.stringify(stagedFilters) !== JSON.stringify(filters);

  // Sync staged filters when external filters change
  useEffect(() => {
    setStagedFilters(filters);
  }, [filters]);

  const handleStagedFilterChange = (newFilters: GlobalFilterState) => {
    setStagedFilters(newFilters);
  };

  const handleApplyFilters = () => {
    setFilters(stagedFilters);
    onFiltersChange?.(stagedFilters);
  };

  const handleResetChanges = () => {
    setStagedFilters(filters);
  };

  // Determine if hourly is allowed based on date range
  const daysDiff = getDaysDifference(stagedFilters.dateRange);
  const allowHourly = daysDiff <= 3;
  const shouldForceDaily = daysDiff > 3;

  // Auto-adjust granularity if needed
  if (shouldForceDaily && stagedFilters.timeGranularity === "hours") {
    handleStagedFilterChange({
      ...stagedFilters,
      timeGranularity: "days",
    });
  }

  const activeFilterCount =
    stagedFilters.vendors.length +
    stagedFilters.technologies.length +
    stagedFilters.regions.length +
    stagedFilters.clusters.length +
    stagedFilters.countries.length +
    (stagedFilters.dateRange.from ? 1 : 0) +
    (stagedFilters.dateRange.to ? 1 : 0);

  const formatDateRange = () => {
    if (!stagedFilters.dateRange.from && !stagedFilters.dateRange.to) return null;
    const from = stagedFilters.dateRange.from
      ? new Date(stagedFilters.dateRange.from).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })
      : null;
    const to = stagedFilters.dateRange.to
      ? new Date(stagedFilters.dateRange.to).toLocaleDateString("en-US", {
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
    <div className="space-y-3 flex flex-col h-full">
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
                  handleStagedFilterChange({
                    ...stagedFilters,
                    vendors: stagedFilters.vendors.filter((x) => x !== v),
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
                  handleStagedFilterChange({
                    ...stagedFilters,
                    technologies: stagedFilters.technologies.filter((x) => x !== t),
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
                  handleStagedFilterChange({
                    ...filters,
                    regions: stagedFilters.regions.filter((x) => x !== r),
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
                  handleStagedFilterChange({
                    ...filters,
                    clusters: stagedFilters.clusters.filter((x) => x !== c),
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
                  handleStagedFilterChange({
                    ...filters,
                    countries: stagedFilters.countries.filter((x) => x !== country),
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
                  handleStagedFilterChange({
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
          options={[
            "United States",
            "Canada",
            "United Kingdom",
            "Germany",
            "France",
            "Japan",
            "India",
            "Australia",
            "Egypt",
            "Saudi Arabia",
            "United Arab Emirates",
            "Kuwait",
            "Qatar",
            "Bahrain",
            "Morocco",
          ]}
          selected={stagedFilters.countries}
          onChange={(selected) => handleStagedFilterChange({ ...stagedFilters, countries: selected })}
          placeholder="Search countries..."
        />

        {/* Region Dropdown */}
        <SearchableDropdown
          label="Region"
          options={["North", "South", "East", "West", "Central"]}
          selected={stagedFilters.regions}
          onChange={(selected) => handleStagedFilterChange({ ...stagedFilters, regions: selected })}
          placeholder="Search regions..."
        />

        {/* Cluster Dropdown */}
        <SearchableDropdown
          label="Cluster"
          options={availableClusters.map((cluster) => cluster.name)}
          selected={stagedFilters.clusters}
          onChange={(selected) => handleStagedFilterChange({ ...stagedFilters, clusters: selected })}
          placeholder="Search clusters..."
        />

        {/* Vendor Dropdown */}
        <SearchableDropdown
          label="Vendor"
          options={["Ericsson", "Huawei", "Nokia", "Samsung", "Cisco"]}
          selected={stagedFilters.vendors}
          onChange={(selected) => handleStagedFilterChange({ ...stagedFilters, vendors: selected })}
          placeholder="Search vendors..."
        />

        {/* Technology Dropdown */}
        <SearchableDropdown
          label="Technology"
          options={["2G", "3G", "4G", "5G", "O-RAN"]}
          selected={stagedFilters.technologies}
          onChange={(selected) => handleStagedFilterChange({ ...stagedFilters, technologies: selected })}
          placeholder="Search technologies..."
        />

        {/* Time Granularity Control */}
        <SearchableDropdown
          label="Granularity"
          options={["Hours", "Days"]}
          selected={[stagedFilters.timeGranularity === "hours" ? "Hours" : "Days"]}
          multiSelect={false}
          disabledOptions={allowHourly ? [] : ["Hours"]}
          onChange={(selected) => {
            const granularity = selected[0] === "Hours" ? "hours" : "days";

            if (granularity === "hours" && !allowHourly) {
              toast({
                title: "Cannot select hourly",
                description: "Hourly view is only available for date ranges of 3 days or less",
              });
              return;
            }

            handleStagedFilterChange({
              ...stagedFilters,
              timeGranularity: granularity,
            });
          }}
          placeholder="Search granularity..."
        />

        {/* Choose Dates Button */}
        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
            Choose Dates
          </label>
          <button
            onClick={() => setShowCalendarDropdown(!showCalendarDropdown)}
            className="w-full h-[46px] px-3 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all hover:bg-muted/30 flex items-center"
          >
            {stagedFilters.dateRange.from && stagedFilters.dateRange.to ? (
              <span className="text-sm text-foreground font-medium truncate">
                {new Date(stagedFilters.dateRange.from).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}{" "}
                -{" "}
                {new Date(stagedFilters.dateRange.to).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            ) : (
              <span className="text-sm text-muted-foreground truncate">Select range</span>
            )}
          </button>
        </div>

        {/* Add Cluster Location Button - Hidden in analytics view, only for admin */}
        {/* This configuration action has been moved to Settings page */}

        {/* Buttons Row - Spans full width at bottom */}
        <div className="col-span-1 md:col-span-2 lg:col-span-7 flex gap-2 pt-2 border-t border-border/50">
          <button
            onClick={handleApplyFilters}
            disabled={!hasChanges}
            className={cn(
              "flex-1 px-4 py-2 rounded font-medium transition-colors text-sm flex items-center justify-center gap-2",
              hasChanges
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
            )}
          >
            <Check className="w-4 h-4" />
            Apply
          </button>
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
            className="px-4 py-2 rounded border border-border text-foreground hover:bg-muted/50 transition-colors text-sm font-medium"
            title="Clear all filters"
          >
            Reset All
          </button>
          {hasChanges && (
            <button
              onClick={handleResetChanges}
              className="px-3 py-2 rounded border border-border text-foreground hover:bg-muted/50 transition-colors text-sm"
              title="Discard changes"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Calendar Modal (Fixed Position - Small Compact Popup) */}
      {showCalendarDropdown && (
        <>
          {/* Overlay backdrop to close on click */}
          <div
            className="fixed inset-0 z-40 bg-black/30"
            onClick={() => setShowCalendarDropdown(false)}
          />
          {/* Calendar Popup - Centered and Compact */}
          <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-sm mx-auto p-4 rounded-lg border border-border bg-card shadow-2xl z-50 max-h-[85vh] overflow-y-auto">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Select Dates
                </label>
                <button
                  onClick={() => setShowCalendarDropdown(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors p-1"
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
                startDate={stagedFilters.dateRange.from}
                endDate={stagedFilters.dateRange.to}
                onDateSelect={(date, isStart) => {
                  if (isStart) {
                    handleStagedFilterChange({
                      ...stagedFilters,
                      dateRange: {
                        from: date,
                        to: null,
                      },
                    });
                  } else {
                    handleStagedFilterChange({
                      ...stagedFilters,
                      dateRange: {
                        from: stagedFilters.dateRange.from,
                        to: date,
                      },
                    });
                  }
                }}
                onRangeComplete={(start, end) => {
                  handleStagedFilterChange({
                    ...stagedFilters,
                    dateRange: {
                      from: start,
                      to: end,
                    },
                  });
                  setShowCalendarDropdown(false);
                }}
              />

              {/* Date Range Summary */}
              {stagedFilters.dateRange.from && stagedFilters.dateRange.to && (
                <div className="pt-2 border-t border-border/50 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-muted-foreground truncate">
                      <strong>Selected:</strong> {new Date(stagedFilters.dateRange.from).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => {
                        handleStagedFilterChange({
                          ...stagedFilters,
                          dateRange: { from: null, to: null },
                        });
                      }}
                      className="px-2 py-1 text-xs rounded bg-muted hover:bg-muted/70 transition-all flex-shrink-0"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    to {new Date(stagedFilters.dateRange.to).toLocaleDateString()} ({daysDiff} day{daysDiff !== 1 ? "s" : ""})
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Create Cluster Location Dialog removed - moved to Settings page */}
    </div>
  );
}
