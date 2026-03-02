import { useState, useMemo, useEffect } from "react";
import { ChevronDown, X, AlertCircle, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Technology, Vendor, Domain, KPICategory, KPIScope } from "@/utils/kpiData";
import { getAvailableFilterOptions } from "@/utils/kpiData";
import {
  TIME_PRESETS,
  getValidGranularities,
  validateTimeAndGranularity,
  formatTimeRange,
  type TimePreset,
} from "@/utils/timeGranularityRules";

export interface AnalyticsFilters {
  technologies: Technology[];
  vendors: Vendor[];
  domains: Domain[];
  categories: KPICategory[];
  scopes: KPIScope[];
  networks: string[];
  regions: string[];
  clusters: string[];
  sites: string[];
  cells: string[];
  timeRange: {
    from: string;
    to: string;
  };
  granularity: "1H" | "1D" | "1W" | "1M";
}

interface AnalyticsFilterPanelProps {
  filters: AnalyticsFilters;
  onFiltersChange: (filters: AnalyticsFilters) => void;
}

type TimeRangeMode = "preset" | "manual";

export default function AnalyticsFilterPanel({
  filters,
  onFiltersChange,
}: AnalyticsFilterPanelProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    technology: true,
    vendor: true,
    domain: false,
    category: false,
    scope: false,
    network: false,
    region: false,
    cluster: false,
    site: false,
    cell: false,
    time: false,
  });
  const [timeRangeMode, setTimeRangeMode] = useState<TimeRangeMode>("preset");

  // Staged filters - changes are made here until Apply is clicked
  const [stagedFilters, setStagedFilters] = useState<AnalyticsFilters>(filters);

  // Check if there are unsaved changes
  const hasChanges = JSON.stringify(stagedFilters) !== JSON.stringify(filters);

  // Sync staged filters when external filters change
  useEffect(() => {
    setStagedFilters(filters);
  }, [filters]);

  // Get available options based on current selections (hierarchical dependencies)
  const availableOptions = useMemo(() => {
    return getAvailableFilterOptions(undefined, {
      technologies: stagedFilters.technologies,
      vendors: stagedFilters.vendors,
      domains: stagedFilters.domains,
    });
  }, [stagedFilters.technologies, stagedFilters.vendors, stagedFilters.domains]);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleTechnologyChange = (tech: Technology, checked: boolean) => {
    const updated = checked
      ? [...stagedFilters.technologies, tech]
      : stagedFilters.technologies.filter((t) => t !== tech);
    setStagedFilters({ ...stagedFilters, technologies: updated });
  };

  const handleVendorChange = (vendor: Vendor, checked: boolean) => {
    const updated = checked
      ? [...stagedFilters.vendors, vendor]
      : stagedFilters.vendors.filter((v) => v !== vendor);
    setStagedFilters({ ...stagedFilters, vendors: updated });
  };

  const handleDomainChange = (domain: Domain, checked: boolean) => {
    const updated = checked
      ? [...stagedFilters.domains, domain]
      : stagedFilters.domains.filter((d) => d !== domain);
    setStagedFilters({ ...stagedFilters, domains: updated });
  };

  const handleCategoryChange = (category: KPICategory, checked: boolean) => {
    const updated = checked
      ? [...stagedFilters.categories, category]
      : stagedFilters.categories.filter((c) => c !== category);
    setStagedFilters({ ...stagedFilters, categories: updated });
  };

  const handleScopeChange = (scope: KPIScope, checked: boolean) => {
    const updated = checked
      ? [...stagedFilters.scopes, scope]
      : stagedFilters.scopes.filter((s) => s !== scope);
    setStagedFilters({ ...stagedFilters, scopes: updated });
  };

  const handleNetworkChange = (network: string, checked: boolean) => {
    const updated = checked
      ? [...stagedFilters.networks, network]
      : stagedFilters.networks.filter((n) => n !== network);
    setStagedFilters({ ...stagedFilters, networks: updated });
  };

  const handleRegionChange = (region: string, checked: boolean) => {
    const updated = checked
      ? [...stagedFilters.regions, region]
      : stagedFilters.regions.filter((r) => r !== region);
    setStagedFilters({ ...stagedFilters, regions: updated });
  };

  const handleClusterChange = (cluster: string, checked: boolean) => {
    const updated = checked
      ? [...stagedFilters.clusters, cluster]
      : stagedFilters.clusters.filter((c) => c !== cluster);
    setStagedFilters({ ...stagedFilters, clusters: updated });
  };

  const handleSiteChange = (site: string, checked: boolean) => {
    const updated = checked
      ? [...stagedFilters.sites, site]
      : stagedFilters.sites.filter((s) => s !== site);
    setStagedFilters({ ...stagedFilters, sites: updated });
  };

  const handleCellChange = (cell: string, checked: boolean) => {
    const updated = checked
      ? [...stagedFilters.cells, cell]
      : stagedFilters.cells.filter((c) => c !== cell);
    setStagedFilters({ ...stagedFilters, cells: updated });
  };

  const handleApplyFilters = () => {
    onFiltersChange(stagedFilters);
  };

  const handleClearAll = () => {
    const clearedFilters: AnalyticsFilters = {
      technologies: [],
      vendors: [],
      domains: [],
      categories: [],
      scopes: [],
      networks: [],
      regions: [],
      clusters: [],
      sites: [],
      cells: [],
      timeRange: filters.timeRange,
      granularity: filters.granularity,
    };
    setStagedFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const allTechnologies: Technology[] = ["2G", "3G", "4G", "5G", "O-RAN"];
  const allVendors: Vendor[] = ["Huawei", "Ericsson", "Nokia", "ZTE", "O-RAN"];
  const allDomains: Domain[] = ["RAN", "O-RAN", "Transport", "Core"];
  const allCategories: KPICategory[] = [
    "Accessibility",
    "Throughput",
    "Latency",
    "Reliability",
    "Quality",
    "Traffic",
  ];
  const allScopes: KPIScope[] = ["Network", "Region", "Cluster", "Site", "Cell"];
  const allNetworks: string[] = ["Network 1", "Network 2", "Network 3"];
  const allRegions: string[] = ["North", "South", "East", "West", "Central"];
  const allClusters: string[] = ["Cluster A", "Cluster B", "Cluster C", "Cluster D"];
  const allSites: string[] = ["Site-01", "Site-02", "Site-03", "Site-04", "Site-05"];
  const allCells: string[] = ["Cell-001", "Cell-002", "Cell-003", "Cell-004", "Cell-005"];

  const hasActiveFilters =
    stagedFilters.technologies.length > 0 ||
    stagedFilters.vendors.length > 0 ||
    stagedFilters.domains.length > 0 ||
    stagedFilters.categories.length > 0 ||
    stagedFilters.scopes.length > 0 ||
    stagedFilters.networks.length > 0 ||
    stagedFilters.regions.length > 0 ||
    stagedFilters.clusters.length > 0 ||
    stagedFilters.sites.length > 0 ||
    stagedFilters.cells.length > 0;

  return (
    <div className="bg-card border border-border rounded-lg p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-foreground">Create KPI</h3>
        {hasActiveFilters && (
          <button
            onClick={handleClearAll}
            className="text-xs px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Technology Filter */}
      <FilterSection
        title="Technology"
        sectionKey="technology"
        isExpanded={expandedSections.technology}
        onToggle={toggleSection}
        selectedCount={stagedFilters.technologies.length}
      >
        <div className="space-y-2">
          {allTechnologies.map((tech) => (
            <label key={tech} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={stagedFilters.technologies.includes(tech)}
                onChange={(e) => handleTechnologyChange(tech, e.target.checked)}
                className="w-4 h-4 rounded border border-border"
              />
              <span className="text-sm text-foreground">{tech}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Vendor Filter */}
      <FilterSection
        title="Vendor"
        sectionKey="vendor"
        isExpanded={expandedSections.vendor}
        onToggle={toggleSection}
        selectedCount={stagedFilters.vendors.length}
      >
        <div className="space-y-2">
          {allVendors.map((vendor) => {
            const isAvailable =
              stagedFilters.technologies.length === 0 ||
              availableOptions.vendors.includes(vendor);
            return (
              <label
                key={vendor}
                className={cn(
                  "flex items-center gap-2 cursor-pointer",
                  !isAvailable && "opacity-50 cursor-not-allowed"
                )}
              >
                <input
                  type="checkbox"
                  checked={stagedFilters.vendors.includes(vendor)}
                  onChange={(e) => handleVendorChange(vendor, e.target.checked)}
                  disabled={!isAvailable && !stagedFilters.vendors.includes(vendor)}
                  className="w-4 h-4 rounded border border-border"
                />
                <span className="text-sm text-foreground">{vendor}</span>
              </label>
            );
          })}
        </div>
      </FilterSection>

      {/* Domain Filter */}
      <FilterSection
        title="Domain"
        sectionKey="domain"
        isExpanded={expandedSections.domain}
        onToggle={toggleSection}
        selectedCount={stagedFilters.domains.length}
      >
        <div className="space-y-2">
          {allDomains.map((domain) => {
            const isAvailable =
              (stagedFilters.technologies.length === 0 && stagedFilters.vendors.length === 0) ||
              availableOptions.domains.includes(domain);
            return (
              <label
                key={domain}
                className={cn(
                  "flex items-center gap-2 cursor-pointer",
                  !isAvailable && "opacity-50 cursor-not-allowed"
                )}
              >
                <input
                  type="checkbox"
                  checked={stagedFilters.domains.includes(domain)}
                  onChange={(e) => handleDomainChange(domain, e.target.checked)}
                  disabled={!isAvailable && !stagedFilters.domains.includes(domain)}
                  className="w-4 h-4 rounded border border-border"
                />
                <span className="text-sm text-foreground">{domain}</span>
              </label>
            );
          })}
        </div>
      </FilterSection>

      {/* KPI Category Filter */}
      <FilterSection
        title="KPI Category"
        sectionKey="category"
        isExpanded={expandedSections.category}
        onToggle={toggleSection}
        selectedCount={stagedFilters.categories.length}
      >
        <div className="space-y-2">
          {allCategories.map((category) => {
            const isAvailable =
              stagedFilters.technologies.length === 0 ||
              availableOptions.categories.includes(category);
            return (
              <label
                key={category}
                className={cn(
                  "flex items-center gap-2 cursor-pointer",
                  !isAvailable && "opacity-50 cursor-not-allowed"
                )}
              >
                <input
                  type="checkbox"
                  checked={stagedFilters.categories.includes(category)}
                  onChange={(e) => handleCategoryChange(category, e.target.checked)}
                  disabled={!isAvailable && !stagedFilters.categories.includes(category)}
                  className="w-4 h-4 rounded border border-border"
                />
                <span className="text-sm text-foreground">{category}</span>
              </label>
            );
          })}
        </div>
      </FilterSection>

      {/* Scope Filter */}
      <FilterSection
        title="Scope Level"
        sectionKey="scope"
        isExpanded={expandedSections.scope}
        onToggle={toggleSection}
        selectedCount={stagedFilters.scopes.length}
      >
        <div className="space-y-2">
          {allScopes.map((scope) => (
            <label key={scope} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={stagedFilters.scopes.includes(scope)}
                onChange={(e) => handleScopeChange(scope, e.target.checked)}
                className="w-4 h-4 rounded border border-border"
              />
              <span className="text-sm text-foreground">{scope}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Network Filter */}
      <FilterSection
        title="Network"
        sectionKey="network"
        isExpanded={expandedSections.network}
        onToggle={toggleSection}
        selectedCount={stagedFilters.networks.length}
      >
        <div className="space-y-2">
          {allNetworks.map((network) => (
            <label key={network} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={stagedFilters.networks.includes(network)}
                onChange={(e) => handleNetworkChange(network, e.target.checked)}
                className="w-4 h-4 rounded border border-border"
              />
              <span className="text-sm text-foreground">{network}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Region Filter */}
      <FilterSection
        title="Region"
        sectionKey="region"
        isExpanded={expandedSections.region}
        onToggle={toggleSection}
        selectedCount={stagedFilters.regions.length}
      >
        <div className="space-y-2">
          {allRegions.map((region) => (
            <label key={region} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={stagedFilters.regions.includes(region)}
                onChange={(e) => handleRegionChange(region, e.target.checked)}
                className="w-4 h-4 rounded border border-border"
              />
              <span className="text-sm text-foreground">{region}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Cluster Filter */}
      <FilterSection
        title="Cluster"
        sectionKey="cluster"
        isExpanded={expandedSections.cluster}
        onToggle={toggleSection}
        selectedCount={stagedFilters.clusters.length}
      >
        <div className="space-y-2">
          {allClusters.map((cluster) => (
            <label key={cluster} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={stagedFilters.clusters.includes(cluster)}
                onChange={(e) => handleClusterChange(cluster, e.target.checked)}
                className="w-4 h-4 rounded border border-border"
              />
              <span className="text-sm text-foreground">{cluster}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Site Filter */}
      <FilterSection
        title="Site"
        sectionKey="site"
        isExpanded={expandedSections.site}
        onToggle={toggleSection}
        selectedCount={stagedFilters.sites.length}
      >
        <div className="space-y-2">
          {allSites.map((site) => (
            <label key={site} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={stagedFilters.sites.includes(site)}
                onChange={(e) => handleSiteChange(site, e.target.checked)}
                className="w-4 h-4 rounded border border-border"
              />
              <span className="text-sm text-foreground">{site}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Cell Filter */}
      <FilterSection
        title="Cell"
        sectionKey="cell"
        isExpanded={expandedSections.cell}
        onToggle={toggleSection}
        selectedCount={stagedFilters.cells.length}
      >
        <div className="space-y-2">
          {allCells.map((cell) => (
            <label key={cell} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={stagedFilters.cells.includes(cell)}
                onChange={(e) => handleCellChange(cell, e.target.checked)}
                className="w-4 h-4 rounded border border-border"
              />
              <span className="text-sm text-foreground">{cell}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Time Controls */}
      <FilterSection
        title="Time Range"
        sectionKey="time"
        isExpanded={expandedSections.time}
        onToggle={toggleSection}
      >
        <div className="space-y-3">
          {/* Time Range Mode Toggle */}
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setTimeRangeMode("preset")}
              className={cn(
                "flex-1 px-3 py-2 rounded text-sm font-medium transition-colors",
                timeRangeMode === "preset"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground hover:bg-muted/80"
              )}
            >
              Preset
            </button>
            <button
              onClick={() => setTimeRangeMode("manual")}
              className={cn(
                "flex-1 px-3 py-2 rounded text-sm font-medium transition-colors",
                timeRangeMode === "manual"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground hover:bg-muted/80"
              )}
            >
              Manual
            </button>
          </div>

          {/* Preset Range Options */}
          {timeRangeMode === "preset" && (
            <div className="space-y-2">
              {[
                { label: "Last Day", days: 1 },
                { label: "Last 7 Days", days: 7 },
                { label: "Last 30 Days", days: 30 },
                { label: "Last 3 Months", days: 90 },
                { label: "Last 6 Months", days: 180 },
              ].map(({ label, days }) => {
                const to = new Date().toISOString().split("T")[0];
                const from = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
                  .toISOString()
                  .split("T")[0];
                const isActive = stagedFilters.timeRange.from === from && stagedFilters.timeRange.to === to;

                return (
                  <button
                    key={days}
                    onClick={() => {
                      setStagedFilters({
                        ...stagedFilters,
                        timeRange: { from, to },
                      });
                    }}
                    className={cn(
                      "w-full px-3 py-2 rounded text-sm font-medium transition-colors text-left",
                      isActive
                        ? "bg-primary text-primary-foreground border border-primary"
                        : "border border-border text-foreground hover:bg-muted/50"
                    )}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          )}

          {/* Manual Range Options */}
          {timeRangeMode === "manual" && (
            <>
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  From
                </label>
                <input
                  type="date"
                  value={stagedFilters.timeRange.from}
                  onChange={(e) =>
                    setStagedFilters({
                      ...stagedFilters,
                      timeRange: { ...stagedFilters.timeRange, from: e.target.value },
                    })
                  }
                  className="w-full px-2 py-1 rounded border border-border text-sm text-foreground"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  To
                </label>
                <input
                  type="date"
                  value={stagedFilters.timeRange.to}
                  onChange={(e) =>
                    setStagedFilters({
                      ...stagedFilters,
                      timeRange: { ...stagedFilters.timeRange, to: e.target.value },
                    })
                  }
                  className="w-full px-2 py-1 rounded border border-border text-sm text-foreground"
                />
              </div>
            </>
          )}

          {/* Granularity - Only Hourly and Daily */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1">
              Granularity
            </label>
            <select
              value={stagedFilters.granularity}
              onChange={(e) =>
                setStagedFilters({
                  ...stagedFilters,
                  granularity: e.target.value as any,
                })
              }
              className="w-full px-2 py-1 rounded border border-border text-sm text-foreground"
            >
              <option value="1H">Hourly</option>
              <option value="1D">Daily</option>
            </select>
          </div>
        </div>
      </FilterSection>

      {/* Apply Filter Button */}
      <div className="border-t border-border/50 pt-4 flex gap-2">
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
          Apply Filter
        </button>
        {hasChanges && (
          <button
            onClick={() => setStagedFilters(filters)}
            className="px-4 py-2 rounded border border-border text-foreground hover:bg-muted/50 transition-colors text-sm"
            title="Discard changes"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}

interface FilterSectionProps {
  title: string;
  sectionKey: string;
  isExpanded: boolean;
  onToggle: (key: string) => void;
  selectedCount?: number;
  children: React.ReactNode;
}

function FilterSection({
  title,
  sectionKey,
  isExpanded,
  onToggle,
  selectedCount,
  children,
}: FilterSectionProps) {
  return (
    <div className="border-t border-border/50 pt-4">
      <button
        onClick={() => onToggle(sectionKey)}
        className="w-full flex items-center justify-between mb-3 hover:opacity-70 transition-opacity"
      >
        <span className="flex items-center gap-2">
          <span className="font-semibold text-foreground">{title}</span>
          {selectedCount !== undefined && selectedCount > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
              {selectedCount}
            </span>
          )}
        </span>
        <ChevronDown
          className={cn(
            "w-4 h-4 transition-transform",
            isExpanded && "rotate-180"
          )}
        />
      </button>
      {isExpanded && <div className="ml-2">{children}</div>}
    </div>
  );
}
