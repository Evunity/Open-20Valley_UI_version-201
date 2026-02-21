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
    time: false,
  });

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

  const handleClearAll = () => {
    onFiltersChange({
      technologies: [],
      vendors: [],
      domains: [],
      categories: [],
      scopes: [],
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
  const allScopes: KPIScope[] = ["Network", "Region", "Cluster", "Site", "Node", "Cell", "Interface"];

  const hasActiveFilters =
    filters.technologies.length > 0 ||
    filters.vendors.length > 0 ||
    filters.domains.length > 0 ||
    filters.categories.length > 0 ||
    filters.scopes.length > 0;

  return (
    <div className="bg-card border border-border rounded-lg p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-foreground">Global Filters</h3>
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
        title="Analysis Scope"
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

      {/* Time Controls */}
      <FilterSection
        title="Time Range"
        sectionKey="time"
        isExpanded={expandedSections.time}
        onToggle={toggleSection}
      >
        <div className="space-y-3">
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
              <option value="1W">Weekly</option>
              <option value="1M">Monthly</option>
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
