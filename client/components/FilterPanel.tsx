import { useState } from "react";
import { X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGlobalFilters, type GlobalFilterState } from "@/hooks/useGlobalFilters";
import { useToast } from "@/hooks/use-toast";
import DualMonthCalendar from "@/components/DualMonthCalendar";
import { getDaysDifference } from "@/utils/dashboardData";

interface FilterPanelProps {
  onFiltersChange?: (filters: GlobalFilterState) => void;
}

export default function FilterPanel({ onFiltersChange }: FilterPanelProps) {
  const { filters, setFilters, resetFilters, availableClusters, addCluster } = useGlobalFilters();
  const { toast } = useToast();
  const [showCreateClusterDialog, setShowCreateClusterDialog] = useState(false);
  const [newClusterName, setNewClusterName] = useState("");
  const [showCalendarDropdown, setShowCalendarDropdown] = useState(false);

  const handleFilterChange = (newFilters: GlobalFilterState) => {
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const handleCreateCluster = () => {
    if (!newClusterName.trim()) {
      toast({
        title: "Invalid location name",
        description: "Please enter a location name",
      });
      return;
    }

    const success = addCluster(newClusterName);

    if (!success) {
      toast({
        title: "Cluster already exists",
        description: `A cluster with the name "${newClusterName}" already exists`,
      });
      return;
    }

    toast({
      title: "Cluster created",
      description: `"${newClusterName}" has been added to the cluster list`,
    });

    setNewClusterName("");
    setShowCreateClusterDialog(false);
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
      {/* Active Filters Pills */}
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
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium"
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
        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
            Country
          </label>
          <select
            multiple
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            value={filters.countries}
            onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions, (option) => option.value);
              handleFilterChange({ ...filters, countries: selected });
            }}
            title="Hold Ctrl/Cmd to select multiple countries"
          >
            <option value="United States">United States</option>
            <option value="Canada">Canada</option>
            <option value="United Kingdom">United Kingdom</option>
            <option value="Germany">Germany</option>
            <option value="France">France</option>
            <option value="Japan">Japan</option>
            <option value="India">India</option>
            <option value="Australia">Australia</option>
          </select>
        </div>

        {/* Region Dropdown */}
        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
            Region
          </label>
          <select
            multiple
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            value={filters.regions}
            onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions, (option) => option.value);
              handleFilterChange({ ...filters, regions: selected });
            }}
            title="Hold Ctrl/Cmd to select multiple regions"
          >
            <option value="North">North</option>
            <option value="South">South</option>
            <option value="East">East</option>
            <option value="West">West</option>
            <option value="Central">Central</option>
          </select>
        </div>

        {/* Cluster Dropdown */}
        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
            Cluster
          </label>
          <select
            multiple
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            value={filters.clusters}
            onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions, (option) => option.value);
              handleFilterChange({ ...filters, clusters: selected });
            }}
            title="Hold Ctrl/Cmd to select multiple clusters"
          >
            {availableClusters.map((cluster) => (
              <option key={cluster.id} value={cluster.name}>
                {cluster.name}
              </option>
            ))}
          </select>
        </div>

        {/* Vendor Dropdown */}
        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
            Vendor
          </label>
          <select
            multiple
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            value={filters.vendors}
            onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions, (option) => option.value);
              handleFilterChange({ ...filters, vendors: selected });
            }}
            title="Hold Ctrl/Cmd to select multiple vendors"
          >
            <option value="Ericsson">Ericsson</option>
            <option value="Huawei">Huawei</option>
            <option value="Nokia">Nokia</option>
            <option value="Samsung">Samsung</option>
            <option value="Cisco">Cisco</option>
          </select>
        </div>

        {/* Technology Dropdown */}
        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
            Technology
          </label>
          <select
            multiple
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            value={filters.technologies}
            onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions, (option) => option.value);
              handleFilterChange({ ...filters, technologies: selected });
            }}
            title="Hold Ctrl/Cmd to select multiple technologies"
          >
            <option value="2G">2G</option>
            <option value="3G">3G</option>
            <option value="4G">4G</option>
            <option value="5G">5G</option>
            <option value="ORAN">O-RAN</option>
          </select>
        </div>

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

        {/* Add Cluster Location Button */}
        <div className="flex items-end">
          <button
            onClick={() => setShowCreateClusterDialog(true)}
            className="w-full px-3 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all duration-200 text-xs font-medium active:scale-95 flex items-center justify-center gap-1"
          >
            <Plus className="w-3 h-3" />
            Add Location
          </button>
        </div>

        {/* Calendar Dropdown Button */}
        <div className="relative">
          <button
            onClick={() => setShowCalendarDropdown(!showCalendarDropdown)}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all flex items-center justify-between hover:bg-muted/30"
          >
            <div className="flex flex-col items-start gap-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block">
                Choose Dates
              </span>
              {filters.dateRange.from && filters.dateRange.to ? (
                <span className="text-xs text-foreground font-medium">
                  {new Date(filters.dateRange.from).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })} - {new Date(filters.dateRange.to).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              ) : filters.dateRange.from ? (
                <span className="text-xs text-muted-foreground">
                  From {new Date(filters.dateRange.from).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              ) : (
                <span className="text-xs text-muted-foreground">Select range</span>
              )}
            </div>
            <svg
              className={cn(
                "w-4 h-4 text-muted-foreground transition-transform",
                showCalendarDropdown && "rotate-180"
              )}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </button>

          {/* Calendar Dropdown Content */}
          {showCalendarDropdown && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg p-4 shadow-xl z-40">
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
                  setShowCalendarDropdown(false);
                }}
              />
            </div>
          )}
        </div>

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
              setShowCalendarDropdown(false);
            }}
            className="w-full px-3 py-2 rounded-lg bg-muted hover:bg-muted/70 transition-all duration-200 text-xs font-medium active:scale-95"
          >
            Reset All
          </button>
        </div>
      </div>


      {/* Create Cluster Location Dialog */}
      {showCreateClusterDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md mx-4 space-y-4 shadow-lg">
            <h3 className="text-lg font-bold text-foreground">Create New Cluster Location</h3>
            <p className="text-sm text-muted-foreground">Enter a location name for this cluster</p>
            <input
              type="text"
              value={newClusterName}
              onChange={(e) => setNewClusterName(e.target.value)}
              placeholder="e.g., New York, DataCenter North..."
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreateCluster();
                if (e.key === "Escape") setShowCreateClusterDialog(false);
              }}
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={handleCreateCluster}
                className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all"
              >
                Create Cluster
              </button>
              <button
                onClick={() => {
                  setShowCreateClusterDialog(false);
                  setNewClusterName("");
                }}
                className="flex-1 px-4 py-2 rounded-lg bg-muted text-foreground text-sm font-medium hover:bg-muted/70 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
