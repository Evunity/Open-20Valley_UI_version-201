import { useState, useMemo } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Technology, Vendor, Domain, KPICategory, KPIScope } from "@/utils/kpiData";
import { getAvailableFilterOptions } from "@/utils/kpiData";

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
  onGenerate?: () => void;
  isGenerated?: boolean;
  onRegenerate?: () => void;
}

export default function AnalyticsFilterPanel({
  filters,
  onFiltersChange,
  onGenerate,
  isGenerated = false,
  onRegenerate,
}: AnalyticsFilterPanelProps) {
  const [kpiSearch, setKpiSearch] = useState("");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Get available options based on current selections
  const availableOptions = useMemo(() => {
    return getAvailableFilterOptions(undefined, {
      technologies: filters.technologies,
      vendors: filters.vendors,
      domains: filters.domains,
    });
  }, [filters.technologies, filters.vendors, filters.domains]);

  // Data
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

  const toggleFilterItem = (filterType: keyof AnalyticsFilters, item: any) => {
    if (filterType === 'timeRange' || filterType === 'granularity') return;
    
    const current = filters[filterType] as any[];
    const updated = current.includes(item)
      ? current.filter((x) => x !== item)
      : [...current, item];
    
    onFiltersChange({ ...filters, [filterType]: updated });
  };

  const renderDropdown = (
    title: string,
    dropdownKey: string,
    items: any[],
    selectedItems: any[],
    filterType: keyof AnalyticsFilters,
    isAvailable?: (item: any) => boolean
  ) => (
    <div className="relative">
      <button
        onClick={() => setOpenDropdown(openDropdown === dropdownKey ? null : dropdownKey)}
        className="w-full flex items-center justify-between px-3 py-2 rounded border border-border bg-background hover:bg-muted/50 text-sm font-medium text-foreground transition-colors"
      >
        <div className="flex items-center gap-2">
          <span>{title}</span>
          {selectedItems.length > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
              {selectedItems.length}
            </span>
          )}
        </div>
        <ChevronDown
          className={cn(
            "w-4 h-4 transition-transform",
            openDropdown === dropdownKey && "rotate-180"
          )}
        />
      </button>

      {openDropdown === dropdownKey && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded shadow-lg z-20 max-h-48 overflow-y-auto">
          {items.map((item) => {
            const available = !isAvailable || isAvailable(item);
            return (
              <label
                key={item}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 border-b border-border/50 last:border-b-0 cursor-pointer hover:bg-muted/30 transition-colors",
                  !available && "opacity-50 cursor-not-allowed"
                )}
              >
                <input
                  type="checkbox"
                  checked={selectedItems.includes(item)}
                  onChange={() => toggleFilterItem(filterType, item)}
                  disabled={!available && !selectedItems.includes(item)}
                  className="w-4 h-4 rounded border border-border"
                />
                <span className="text-sm text-foreground">{item}</span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-card border border-border rounded-lg flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-border px-6 py-4 flex items-center justify-between flex-shrink-0">
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

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {/* KPI Search */}
        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-2">
            Search KPIs
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Find KPIs..."
              value={kpiSearch}
              onChange={(e) => setKpiSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded border border-border text-sm text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
            {kpiSearch && (
              <button
                onClick={() => setKpiSearch("")}
                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Dropdowns */}
        <div className="space-y-3">
          {renderDropdown(
            "Technology",
            "technology",
            allTechnologies,
            filters.technologies,
            "technologies"
          )}

          {renderDropdown(
            "Vendor",
            "vendor",
            allVendors,
            filters.vendors,
            "vendors",
            (vendor) => filters.technologies.length === 0 || availableOptions.vendors.includes(vendor)
          )}

          {renderDropdown(
            "Domain",
            "domain",
            allDomains,
            filters.domains,
            "domains",
            (domain) =>
              (filters.technologies.length === 0 && filters.vendors.length === 0) ||
              availableOptions.domains.includes(domain)
          )}

          {renderDropdown(
            "KPI Category",
            "category",
            allCategories.filter((c) => c.toLowerCase().includes(kpiSearch.toLowerCase())),
            filters.categories,
            "categories"
          )}

          {renderDropdown(
            "Scope Level",
            "scope",
            allScopes,
            filters.scopes,
            "scopes"
          )}

          {renderDropdown(
            "Network",
            "network",
            allNetworks,
            filters.networks,
            "networks"
          )}

          {renderDropdown(
            "Region",
            "region",
            allRegions,
            filters.regions,
            "regions"
          )}

          {renderDropdown(
            "Cluster",
            "cluster",
            allClusters,
            filters.clusters,
            "clusters"
          )}

          {renderDropdown(
            "Site",
            "site",
            allSites,
            filters.sites,
            "sites"
          )}

          {renderDropdown(
            "Cell",
            "cell",
            allCells,
            filters.cells,
            "cells"
          )}

          {/* Time Range */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-muted-foreground">
              Time Range
            </label>
            <div className="space-y-2">
              <input
                type="date"
                value={filters.timeRange.from}
                onChange={(e) =>
                  onFiltersChange({
                    ...filters,
                    timeRange: { ...filters.timeRange, from: e.target.value },
                  })
                }
                className="w-full px-3 py-2 rounded border border-border text-sm text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary"
              />
              <input
                type="date"
                value={filters.timeRange.to}
                onChange={(e) =>
                  onFiltersChange({
                    ...filters,
                    timeRange: { ...filters.timeRange, to: e.target.value },
                  })
                }
                className="w-full px-3 py-2 rounded border border-border text-sm text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary"
              />
            </div>
          </div>

          {/* Granularity */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-2">
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
              className="w-full px-3 py-2 rounded border border-border text-sm text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary"
            >
              <option value="1H">Hourly</option>
              <option value="1D">Daily</option>
            </select>
          </div>
        </div>
      </div>

      {/* Action Buttons - Sticky Footer */}
      <div className="border-t border-border px-6 py-4 flex gap-2 flex-shrink-0">
        <button
          onClick={onGenerate}
          className="flex-1 px-4 py-2 rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium"
        >
          Generate KPI
        </button>
        {isGenerated && (
          <button
            onClick={onRegenerate}
            className="px-4 py-2 rounded border border-border text-foreground hover:bg-muted transition-colors text-sm font-medium"
            title="Restart filter configuration"
          >
            ↻ Regenerate
          </button>
        )}
      </div>
    </div>
  );
}
