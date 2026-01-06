import { useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGlobalFilters, type GlobalFilterState } from "@/hooks/useGlobalFilters";
import { Calendar } from "@/components/ui/calendar";

interface FilterPanelProps {
  onFiltersChange?: (filters: GlobalFilterState) => void;
}

export default function FilterPanel({ onFiltersChange }: FilterPanelProps) {
  const { filters, setFilters, resetFilters } = useGlobalFilters();
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleFilterChange = (newFilters: GlobalFilterState) => {
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const handleDateChange = (type: "from" | "to", date: Date | null) => {
    handleFilterChange({
      ...filters,
      dateRange: {
        ...filters.dateRange,
        [type]: date,
      },
    });
  };

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3 p-4 rounded-lg border border-border bg-card">
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
              const selected = Array.from(
                e.target.selectedOptions,
                (option) => option.value
              );
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
              const selected = Array.from(
                e.target.selectedOptions,
                (option) => option.value
              );
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
              const selected = Array.from(
                e.target.selectedOptions,
                (option) => option.value
              );
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
              const selected = Array.from(
                e.target.selectedOptions,
                (option) => option.value
              );
              handleFilterChange({ ...filters, clusters: selected });
            }}
            title="Hold Ctrl/Cmd to select multiple clusters"
          >
            <option value="Cluster-A">Cluster A</option>
            <option value="Cluster-B">Cluster B</option>
            <option value="Cluster-C">Cluster C</option>
            <option value="Cluster-D">Cluster D</option>
          </select>
        </div>

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
              const selected = Array.from(
                e.target.selectedOptions,
                (option) => option.value
              );
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

        {/* Date Range */}
        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
            Date Range
          </label>
          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all hover:bg-muted text-left"
          >
            {formatDateRange() || "Select dates..."}
          </button>
        </div>

        {/* Reset Button (spans properly in grid) */}
        <div className="flex items-end lg:col-span-1">
          <button
            onClick={() => {
              resetFilters();
              setShowDatePicker(false);
              onFiltersChange?.({
                vendors: [],
                technologies: [],
                regions: [],
                clusters: [],
                countries: [],
                dateRange: { from: null, to: null },
              });
            }}
            className="w-full px-3 py-2 rounded-lg bg-muted hover:bg-muted/70 transition-all duration-200 text-xs font-medium active:scale-95"
          >
            Reset All
          </button>
        </div>
      </div>

      {/* Date Picker Popover (shown below filter grid) */}
      {showDatePicker && (
        <div className="p-4 rounded-lg border border-border bg-card space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                From
              </p>
              <Calendar
                mode="single"
                selected={filters.dateRange.from || undefined}
                onSelect={(date) => handleDateChange("from", date || null)}
                className="scale-90 origin-top-left"
              />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                To
              </p>
              <Calendar
                mode="single"
                selected={filters.dateRange.to || undefined}
                onSelect={(date) => handleDateChange("to", date || null)}
                className="scale-90 origin-top-left"
              />
            </div>
          </div>
          <button
            onClick={() => setShowDatePicker(false)}
            className="w-full px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all"
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
}
