import { useState, useMemo } from "react";
import { ChevronDown, X, AlertCircle } from "lucide-react";
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

  // Get available options based on current selections (hierarchical dependencies)
  const availableOptions = useMemo(() => {
    return getAvailableFilterOptions(undefined, {
      technologies: filters.technologies,
      vendors: filters.vendors,
      domains: filters.domains,
    });
  }, [filters.technologies, filters.vendors, filters.domains]);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleTechnologyChange = (tech: Technology, checked: boolean) => {
    const updated = checked
      ? [...filters.technologies, tech]
      : filters.technologies.filter((t) => t !== tech);
    onFiltersChange({ ...filters, technologies: updated });
  };

  const handleVendorChange = (vendor: Vendor, checked: boolean) => {
    const updated = checked
      ? [...filters.vendors, vendor]
      : filters.vendors.filter((v) => v !== vendor);
    onFiltersChange({ ...filters, vendors: updated });
  };

  const handleDomainChange = (domain: Domain, checked: boolean) => {
    const updated = checked
      ? [...filters.domains, domain]
      : filters.domains.filter((d) => d !== domain);
    onFiltersChange({ ...filters, domains: updated });
  };

  const handleCategoryChange = (category: KPICategory, checked: boolean) => {
    const updated = checked
      ? [...filters.categories, category]
      : filters.categories.filter((c) => c !== category);
    onFiltersChange({ ...filters, categories: updated });
  };

  const handleScopeChange = (scope: KPIScope, checked: boolean) => {
    const updated = checked
      ? [...filters.scopes, scope]
      : filters.scopes.filter((s) => s !== scope);
    onFiltersChange({ ...filters, scopes: updated });
  };

  const handleNetworkChange = (network: string, checked: boolean) => {
    const updated = checked
      ? [...filters.networks, network]
      : filters.networks.filter((n) => n !== network);
    onFiltersChange({ ...filters, networks: updated });
  };

  const handleRegionChange = (region: string, checked: boolean) => {
    const updated = checked
      ? [...filters.regions, region]
      : filters.regions.filter((r) => r !== region);
    onFiltersChange({ ...filters, regions: updated });
  };

  const handleClusterChange = (cluster: string, checked: boolean) => {
    const updated = checked
      ? [...filters.clusters, cluster]
      : filters.clusters.filter((c) => c !== cluster);
    onFiltersChange({ ...filters, clusters: updated });
  };

  const handleSiteChange = (site: string, checked: boolean) => {
    const updated = checked
      ? [...filters.sites, site]
      : filters.sites.filter((s) => s !== site);
    onFiltersChange({ ...filters, sites: updated });
  };

  const handleCellChange = (cell: string, checked: boolean) => {
    const updated = checked
      ? [...filters.cells, cell]
      : filters.cells.filter((c) => c !== cell);
    onFiltersChange({ ...filters, cells: updated });
  };

  const handleClearAll = () => {
    onFiltersChange({
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
    });
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
    filters.technologies.length > 0 ||
    filters.vendors.length > 0 ||
    filters.domains.length > 0 ||
    filters.categories.length > 0 ||
    filters.scopes.length > 0 ||
    filters.networks.length > 0 ||
    filters.regions.length > 0 ||
    filters.clusters.length > 0 ||
    filters.sites.length > 0 ||
    filters.cells.length > 0;

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
        selectedCount={filters.technologies.length}
      >
        <div className="space-y-2">
          {allTechnologies.map((tech) => (
            <label key={tech} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.technologies.includes(tech)}
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
        selectedCount={filters.vendors.length}
      >
        <div className="space-y-2">
          {allVendors.map((vendor) => {
            const isAvailable =
              filters.technologies.length === 0 ||
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
                  checked={filters.vendors.includes(vendor)}
                  onChange={(e) => handleVendorChange(vendor, e.target.checked)}
                  disabled={!isAvailable && !filters.vendors.includes(vendor)}
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
        selectedCount={filters.domains.length}
      >
        <div className="space-y-2">
          {allDomains.map((domain) => {
            const isAvailable =
              (filters.technologies.length === 0 && filters.vendors.length === 0) ||
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
                  checked={filters.domains.includes(domain)}
                  onChange={(e) => handleDomainChange(domain, e.target.checked)}
                  disabled={!isAvailable && !filters.domains.includes(domain)}
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
        selectedCount={filters.categories.length}
      >
        <div className="space-y-2">
          {allCategories.map((category) => {
            const isAvailable =
              filters.technologies.length === 0 ||
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
                  checked={filters.categories.includes(category)}
                  onChange={(e) => handleCategoryChange(category, e.target.checked)}
                  disabled={!isAvailable && !filters.categories.includes(category)}
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
        selectedCount={filters.scopes.length}
      >
        <div className="space-y-2">
          {allScopes.map((scope) => (
            <label key={scope} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.scopes.includes(scope)}
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
        selectedCount={filters.networks.length}
      >
        <div className="space-y-2">
          {allNetworks.map((network) => (
            <label key={network} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.networks.includes(network)}
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
        selectedCount={filters.regions.length}
      >
        <div className="space-y-2">
          {allRegions.map((region) => (
            <label key={region} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.regions.includes(region)}
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
        selectedCount={filters.clusters.length}
      >
        <div className="space-y-2">
          {allClusters.map((cluster) => (
            <label key={cluster} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.clusters.includes(cluster)}
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
        selectedCount={filters.sites.length}
      >
        <div className="space-y-2">
          {allSites.map((site) => (
            <label key={site} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.sites.includes(site)}
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
        selectedCount={filters.cells.length}
      >
        <div className="space-y-2">
          {allCells.map((cell) => (
            <label key={cell} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.cells.includes(cell)}
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
              ].map(({ label, days }) => (
                <button
                  key={days}
                  onClick={() => {
                    const to = new Date().toISOString().split("T")[0];
                    const from = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
                      .toISOString()
                      .split("T")[0];
                    onFiltersChange({
                      ...filters,
                      timeRange: { from, to },
                    });
                  }}
                  className="w-full px-3 py-2 rounded border border-border text-sm font-medium text-foreground hover:bg-muted/50 transition-colors text-left"
                >
                  {label}
                </button>
              ))}
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
                  value={filters.timeRange.from}
                  onChange={(e) =>
                    onFiltersChange({
                      ...filters,
                      timeRange: { ...filters.timeRange, from: e.target.value },
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
                  value={filters.timeRange.to}
                  onChange={(e) =>
                    onFiltersChange({
                      ...filters,
                      timeRange: { ...filters.timeRange, to: e.target.value },
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
              value={filters.granularity}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
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
