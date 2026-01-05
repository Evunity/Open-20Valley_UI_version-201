import { useState } from "react";
import { Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGlobalFilters, type GlobalFilterState } from "@/hooks/useGlobalFilters";

interface FilterPanelProps {
  showTimeRange?: boolean;
  onFiltersChange?: (filters: GlobalFilterState) => void;
}

export default function FilterPanel({ showTimeRange = true, onFiltersChange }: FilterPanelProps) {
  const { filters, setFilters, resetFilters } = useGlobalFilters();
  const [isOpen, setIsOpen] = useState(false);

  const handleFilterChange = (newFilters: GlobalFilterState) => {
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const activeFilterCount = 
    filters.vendors.length + 
    filters.technologies.length + 
    filters.regions.length + 
    filters.clusters.length;

  return (
    <div className="space-y-3">
      {/* Filter Toggle Button */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "inline-flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 text-sm font-medium",
            isOpen
              ? "bg-primary/10 border-primary text-primary shadow-sm"
              : "bg-background border-border text-foreground hover:border-primary/50"
          )}
        >
          <Filter className="w-4 h-4" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="ml-1 inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Active Filters Pills */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2">
            {filters.vendors.map(v => (
              <div
                key={`vendor-${v}`}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-xs"
              >
                {v}
                <button
                  onClick={() => handleFilterChange({
                    ...filters,
                    vendors: filters.vendors.filter(x => x !== v)
                  })}
                  className="hover:opacity-70"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            {filters.technologies.map(t => (
              <div
                key={`tech-${t}`}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-xs"
              >
                {t}
                <button
                  onClick={() => handleFilterChange({
                    ...filters,
                    technologies: filters.technologies.filter(x => x !== t)
                  })}
                  className="hover:opacity-70"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            {filters.regions.map(r => (
              <div
                key={`region-${r}`}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-xs"
              >
                {r}
                <button
                  onClick={() => handleFilterChange({
                    ...filters,
                    regions: filters.regions.filter(x => x !== r)
                  })}
                  className="hover:opacity-70"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            {filters.clusters.map(c => (
              <div
                key={`cluster-${c}`}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-xs"
              >
                {c}
                <button
                  onClick={() => handleFilterChange({
                    ...filters,
                    clusters: filters.clusters.filter(x => x !== c)
                  })}
                  className="hover:opacity-70"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Filter Dropdowns Panel */}
      {isOpen && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 p-4 rounded-lg border border-border bg-card animate-in fade-in slide-in-from-top-2 duration-200">
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
                const selected = Array.from(e.target.selectedOptions, option => option.value);
                handleFilterChange({ ...filters, vendors: selected });
              }}
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
                const selected = Array.from(e.target.selectedOptions, option => option.value);
                handleFilterChange({ ...filters, technologies: selected });
              }}
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
                const selected = Array.from(e.target.selectedOptions, option => option.value);
                handleFilterChange({ ...filters, regions: selected });
              }}
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
                const selected = Array.from(e.target.selectedOptions, option => option.value);
                handleFilterChange({ ...filters, clusters: selected });
              }}
            >
              <option value="Cluster-A">Cluster A</option>
              <option value="Cluster-B">Cluster B</option>
              <option value="Cluster-C">Cluster C</option>
              <option value="Cluster-D">Cluster D</option>
            </select>
          </div>

          {/* Time Range Dropdown */}
          {showTimeRange && (
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                Time Range
              </label>
              <select
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                value={filters.timeRange}
                onChange={(e) => {
                  handleFilterChange({
                    ...filters,
                    timeRange: e.target.value as "24h" | "7d" | "30d",
                  });
                }}
              >
                <option value="24h">Last 24h</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
              </select>
            </div>
          )}

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
                  timeRange: "24h",
                });
              }}
              className="w-full px-3 py-2 rounded-lg bg-muted hover:bg-muted/70 transition-all duration-200 text-xs font-medium active:scale-95"
            >
              Reset All
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
