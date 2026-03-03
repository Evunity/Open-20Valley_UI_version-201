import { useState, useMemo } from "react";
import { Save, Trash2, Download, Eye, EyeOff, ChevronDown, Search, X, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import * as XLSX from "xlsx";
import TrendChartContainer from "@/components/TrendChartContainer";
import type { KPI } from "@/utils/kpiData";
import { KPI_CATALOG, filterKPIs, generateKPIValues, SCOPE_OPTIONS } from "@/utils/kpiData";
import {
  getSavedViews,
  saveView,
  deleteView,
  type SavedView,
} from "@/utils/savedViews";

export interface AnalyticsFilters {
  technologies: string[];
  vendors: string[];
  domains: string[];
  categories: string[];
  scopes: string[];
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

type TimeRangeType = "predefined" | "manual";

export default function AnalyticsManagement() {
  const [filters, setFilters] = useState<AnalyticsFilters>({
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
    timeRange: {
      from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      to: new Date().toISOString().split("T")[0],
    },
    granularity: "1D",
  });

  const [kpiSearch, setKpiSearch] = useState("");
  const [selectedKPIs, setSelectedKPIs] = useState<KPI[]>([]);
  const [currentScope, setCurrentScope] = useState<SavedView["scope"]>("Network");
  const [savedViews, setSavedViews] = useState(getSavedViews());
  const [showSavedViews, setShowSavedViews] = useState(false);
  const [saveViewName, setSaveViewName] = useState("");
  const [saveViewDescription, setSaveViewDescription] = useState("");
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [generatedTime, setGeneratedTime] = useState<Date | null>(null);
  const [isGenerated, setIsGenerated] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Time range mode
  const [timeRangeMode, setTimeRangeMode] = useState<TimeRangeType>("predefined");
  const [predefinedRange, setPredefinedRange] = useState("30d");

  // Track selected instances for Analysis Scope
  const [selectedNetwork, setSelectedNetwork] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedCluster, setSelectedCluster] = useState<string | null>(null);
  const [selectedSite, setSelectedSite] = useState<string | null>(null);
  const [selectedCell, setSelectedCell] = useState<string | null>(null);
  const [openScopeDropdown, setOpenScopeDropdown] = useState<string | null>(null);

  // Available filter options
  const allTechnologies = ["2G", "3G", "4G", "5G", "O-RAN"];
  const allVendors = ["Huawei", "Ericsson", "Nokia", "ZTE", "O-RAN"];
  const allDomains = ["RAN", "O-RAN", "Transport", "Core"];
  const allCategories = ["Accessibility", "Throughput", "Latency", "Reliability", "Quality", "Traffic"];
  const allScopes = ["Network", "Region", "Cluster", "Site", "Cell"];
  const allNetworks = ["Network 1", "Network 2", "Network 3"];
  const allRegions = ["North", "South", "East", "West", "Central"];
  const allClusters = ["Cluster A", "Cluster B", "Cluster C", "Cluster D"];
  const allSites = ["Site-01", "Site-02", "Site-03", "Site-04", "Site-05"];
  const allCells = ["Cell-001", "Cell-002", "Cell-003", "Cell-004", "Cell-005"];

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

  const handlePredefinedRange = (range: string) => {
    const now = new Date();
    let from = new Date();

    switch (range) {
      case "1d":
        from.setDate(now.getDate() - 1);
        break;
      case "7d":
        from.setDate(now.getDate() - 7);
        break;
      case "14d":
        from.setDate(now.getDate() - 14);
        break;
      case "30d":
        from.setDate(now.getDate() - 30);
        break;
      case "90d":
        from.setDate(now.getDate() - 90);
        break;
    }

    setPredefinedRange(range);
    setFilters({
      ...filters,
      timeRange: {
        from: from.toISOString().split("T")[0],
        to: now.toISOString().split("T")[0],
      },
    });
  };

  const handleApplyFilter = () => {
    setGeneratedTime(new Date());
    setIsGenerated(true);
  };

  const handleRegenerate = () => {
    setIsGenerated(false);
    setGeneratedTime(null);
    setSelectedKPIs([]);
    setSelectedNetwork(null);
    setSelectedRegion(null);
    setSelectedCluster(null);
    setSelectedSite(null);
    setSelectedCell(null);
  };

  const handleClearAllFilters = () => {
    setFilters({
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
      granularity: "1D",
    });
  };

  const toggleFilterItem = (filterType: keyof AnalyticsFilters, item: any) => {
    const current = filters[filterType] as any[];
    const updated = current.includes(item)
      ? current.filter((x) => x !== item)
      : [...current, item];

    setFilters({ ...filters, [filterType]: updated });
  };

  // Filter KPIs based on current filters AND search
  const filteredKPIs = useMemo(() => {
    let kpis = filterKPIs(KPI_CATALOG, {
      technologies: filters.technologies,
      vendors: filters.vendors,
      domains: filters.domains,
      categories: filters.categories,
      scopes: filters.scopes,
    });

    if (kpiSearch.trim()) {
      const search = kpiSearch.toLowerCase();
      kpis = kpis.filter(
        (kpi) =>
          kpi.name.toLowerCase().includes(search) ||
          kpi.category.toLowerCase().includes(search) ||
          kpi.description.toLowerCase().includes(search)
      );
    }

    return kpis;
  }, [filters, kpiSearch]);

  // Generate chart data for all selected KPIs
  const chartDataMap = useMemo(() => {
    if (selectedKPIs.length === 0) return {};

    const dataMap: Record<string, any[]> = {};

    selectedKPIs.forEach((kpi) => {
      let label = "All";

      if (selectedNetwork) label = selectedNetwork;
      else if (selectedRegion) label = selectedRegion;
      else if (selectedCluster) label = selectedCluster;
      else if (selectedSite) label = selectedSite;
      else if (selectedCell) label = selectedCell;
      else {
        const scopeLabels = SCOPE_OPTIONS[currentScope] || ["Network"];
        label = scopeLabels[0];
      }

      dataMap[kpi.id] = generateKPIValues(kpi, currentScope, label);
    });

    return dataMap;
  }, [selectedKPIs, currentScope, selectedNetwork, selectedRegion, selectedCluster, selectedSite, selectedCell]);

  const handleSaveView = () => {
    if (!saveViewName.trim()) return;

    const newView = saveView(
      saveViewName,
      filters as any,
      selectedKPIs,
      currentScope,
      saveViewDescription
    );

    setSavedViews(getSavedViews());
    setShowSaveDialog(false);
    setSaveViewName("");
    setSaveViewDescription("");

    alert(`View "${newView.name}" saved successfully!`);
  };

  const handleLoadView = (view: SavedView) => {
    setFilters(view.filters as AnalyticsFilters);
    setCurrentScope(view.scope);

    const restoredKPIs = view.kpis
      .map((kpiId) => KPI_CATALOG.find((k) => k.id === kpiId))
      .filter((k) => k !== undefined) as KPI[];
    setSelectedKPIs(restoredKPIs);

    setShowSavedViews(false);
  };

  const handleDeleteView = (viewId: string) => {
    if (window.confirm("Are you sure you want to delete this view?")) {
      deleteView(viewId);
      setSavedViews(getSavedViews());
    }
  };

  const handleExportKPI = (kpi: KPI) => {
    const kpiData = chartDataMap[kpi.id] || [];

    if (kpiData.length === 0) {
      alert("No data available to export for this KPI");
      return;
    }

    const worksheetData = kpiData.map((item) => ({
      "Date": item.timestamp,
      "Value": item.value,
      "Unit": item.unit,
      "Status": item.status,
      "Change %": item.change?.toFixed(2) || "N/A",
      "Scope": item.scopeLabel,
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, kpi.name);

    const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1");
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const address = XLSX.utils.encode_col(C) + "1";
      if (!worksheet[address]) continue;
      worksheet[address].s = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "4F46E5" } },
        alignment: { horizontal: "center" },
      };
    }

    worksheet["!cols"] = [
      { wch: 15 },
      { wch: 12 },
      { wch: 10 },
      { wch: 12 },
      { wch: 12 },
      { wch: 15 },
    ];

    XLSX.writeFile(workbook, `${kpi.name.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  const handleExportAll = () => {
    if (selectedKPIs.length === 0) {
      alert("No KPIs selected to export");
      return;
    }

    const workbook = XLSX.utils.book_new();

    selectedKPIs.forEach((kpi) => {
      const kpiData = chartDataMap[kpi.id] || [];

      if (kpiData.length > 0) {
        const worksheetData = kpiData.map((item) => ({
          "KPI": kpi.name,
          "Date": item.timestamp,
          "Value": item.value,
          "Unit": item.unit,
          "Status": item.status,
          "Change %": item.change?.toFixed(2) || "N/A",
          "Scope": item.scopeLabel,
        }));

        const worksheet = XLSX.utils.json_to_sheet(worksheetData);

        const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1");
        for (let C = range.s.c; C <= range.e.c; ++C) {
          const address = XLSX.utils.encode_col(C) + "1";
          if (!worksheet[address]) continue;
          worksheet[address].s = {
            font: { bold: true, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "4F46E5" } },
            alignment: { horizontal: "center" },
          };
        }

        worksheet["!cols"] = [
          { wch: 25 },
          { wch: 15 },
          { wch: 12 },
          { wch: 10 },
          { wch: 12 },
          { wch: 12 },
          { wch: 15 },
        ];

        XLSX.utils.book_append_sheet(workbook, worksheet, kpi.name.substring(0, 31));
      }
    });

    XLSX.writeFile(workbook, `KPI_Export_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  const renderDropdown = (
    title: string,
    dropdownKey: string,
    items: string[],
    selectedItems: string[],
    filterType: keyof AnalyticsFilters
  ) => (
    <div className="relative flex-1">
      <button
        onClick={() => setOpenDropdown(openDropdown === dropdownKey ? null : dropdownKey)}
        className="w-full flex items-center justify-between px-1.5 py-1 rounded border border-border bg-background hover:bg-muted/50 text-xs font-medium text-foreground transition-colors"
      >
        <div className="flex items-center gap-1 truncate">
          <span className="text-xs truncate">{title}</span>
          {selectedItems.length > 0 && (
            <span className="text-xs px-1 py-0.5 rounded-full bg-primary/10 text-primary flex-shrink-0">
              {selectedItems.length}
            </span>
          )}
        </div>
        <ChevronDown className={cn("w-3 h-3 transition-transform flex-shrink-0", openDropdown === dropdownKey && "rotate-180")} />
      </button>

      {openDropdown === dropdownKey && (
        <div className="absolute top-full left-0 right-0 mt-0.5 bg-card border border-border rounded shadow-lg z-20 max-h-32 overflow-y-auto">
          {items.map((item) => (
            <label key={item} className="flex items-center gap-1.5 px-1.5 py-1 border-b border-border/50 last:border-b-0 cursor-pointer hover:bg-muted/30 transition-colors text-xs">
              <input
                type="checkbox"
                checked={selectedItems.includes(item)}
                onChange={() => toggleFilterItem(filterType, item)}
                className="w-3 h-3 rounded border border-border"
              />
              <span className="truncate text-xs">{item}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-lg font-bold text-foreground">Analytics Management</h1>
          <p className="text-xs text-muted-foreground">Create and analyze custom KPIs</p>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowSavedViews(!showSavedViews)}
            className="flex items-center gap-1 px-2 py-1 rounded-lg border border-border bg-background hover:bg-muted/50 transition-colors text-xs font-medium"
          >
            {showSavedViews ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            Views ({savedViews.length})
          </button>
          <button
            onClick={() => setShowSaveDialog(true)}
            disabled={selectedKPIs.length === 0}
            className="flex items-center gap-1 px-2 py-1 rounded-lg border border-primary bg-primary/10 hover:bg-primary/20 transition-colors text-primary text-xs font-medium disabled:opacity-50"
          >
            <Save className="w-3 h-3" />
            Save
          </button>
        </div>
      </div>

      {/* Saved Views Panel */}
      {showSavedViews && (
        <div className="bg-card border border-border rounded-lg p-2 space-y-2">
          <h3 className="text-xs font-bold text-foreground">Saved Views</h3>
          {savedViews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {savedViews.map((view) => (
                <div key={view.id} className="border border-border/50 rounded-lg p-2 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex-1">
                      <h4 className="font-semibold text-xs text-foreground">{view.name}</h4>
                      {view.description && (
                        <p className="text-xs text-muted-foreground mt-0.5">{view.description}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteView(view.id)}
                      className="p-0.5 rounded hover:bg-red-100 text-red-600 transition-colors flex-shrink-0"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="text-xs text-muted-foreground mb-1">
                    {view.kpis.length} KPI{view.kpis.length !== 1 ? "s" : ""} • {view.scope}
                  </div>
                  <button
                    onClick={() => handleLoadView(view)}
                    className="w-full px-1.5 py-0.5 rounded text-xs bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
                  >
                    Load
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-2">No saved views yet</p>
          )}
        </div>
      )}

      {/* Save View Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2">
          <div className="bg-card rounded-lg border border-border p-3 max-w-sm w-full">
            <h3 className="text-xs font-bold text-foreground mb-2">Save View</h3>
            <div className="space-y-2">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-0.5">
                  Name *
                </label>
                <input
                  type="text"
                  value={saveViewName}
                  onChange={(e) => setSaveViewName(e.target.value)}
                  placeholder="Name"
                  className="w-full px-1.5 py-1 rounded border border-border text-xs text-foreground placeholder-muted-foreground focus:ring-1 focus:ring-primary/50"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-0.5">
                  Description
                </label>
                <textarea
                  value={saveViewDescription}
                  onChange={(e) => setSaveViewDescription(e.target.value)}
                  placeholder="Notes"
                  rows={2}
                  className="w-full px-1.5 py-1 rounded border border-border text-xs text-foreground placeholder-muted-foreground focus:ring-1 focus:ring-primary/50 resize-none"
                />
              </div>
            </div>
            <div className="flex gap-1.5 justify-end mt-2">
              <button
                onClick={() => {
                  setShowSaveDialog(false);
                  setSaveViewName("");
                  setSaveViewDescription("");
                }}
                className="px-2 py-1 rounded border border-border hover:bg-muted transition-colors text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveView}
                disabled={!saveViewName.trim()}
                className="px-2 py-1 rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-xs font-medium disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* KPI Search Bar - FULL WIDTH */}
      <div className="bg-card border border-border rounded-lg p-2">
        <div className="flex items-center gap-2">
          <Search className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
          <input
            type="text"
            placeholder="Search KPIs..."
            value={kpiSearch}
            onChange={(e) => setKpiSearch(e.target.value)}
            className="flex-1 bg-transparent border-0 text-xs text-foreground placeholder-muted-foreground focus:outline-none"
          />
          {kpiSearch && (
            <button
              onClick={() => setKpiSearch("")}
              className="p-0.5 text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Global Filter Bar - with buttons INSIDE */}
      <div className="bg-card border border-border rounded-lg p-2 space-y-2">
        <div className="space-y-1.5">
          {/* Time Range Mode Selection */}
          <div className="text-xs font-semibold text-muted-foreground">Choose Dates</div>
          <div className="flex gap-1.5">
            <label className="flex items-center gap-1 cursor-pointer text-xs">
              <input
                type="radio"
                checked={timeRangeMode === "predefined"}
                onChange={() => setTimeRangeMode("predefined")}
                className="w-3 h-3"
              />
              <span>Presets</span>
            </label>
            <label className="flex items-center gap-1 cursor-pointer text-xs">
              <input
                type="radio"
                checked={timeRangeMode === "manual"}
                onChange={() => setTimeRangeMode("manual")}
                className="w-3 h-3"
              />
              <span>Custom</span>
            </label>
          </div>

          {/* Predefined or Manual Time Range */}
          {timeRangeMode === "predefined" ? (
            <div className="grid grid-cols-3 md:grid-cols-5 gap-1">
              {[
                { label: "1d", value: "1d" },
                { label: "7d", value: "7d" },
                { label: "14d", value: "14d" },
                { label: "30d", value: "30d" },
                { label: "90d", value: "90d" },
              ].map(({ label, value }) => (
                <button
                  key={value}
                  onClick={() => handlePredefinedRange(value)}
                  className={cn(
                    "px-1.5 py-1 rounded text-xs font-medium transition-all",
                    predefinedRange === value
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/70"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-1">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-0.5">From</label>
                <input
                  type="date"
                  value={filters.timeRange.from}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      timeRange: { ...filters.timeRange, from: e.target.value },
                    })
                  }
                  className="w-full px-1.5 py-1 rounded border border-border text-xs text-foreground focus:ring-1 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-0.5">To</label>
                <input
                  type="date"
                  value={filters.timeRange.to}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      timeRange: { ...filters.timeRange, to: e.target.value },
                    })
                  }
                  className="w-full px-1.5 py-1 rounded border border-border text-xs text-foreground focus:ring-1 focus:ring-primary/50"
                />
              </div>
            </div>
          )}
        </div>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1">
          {renderDropdown("Country", "tech", allTechnologies, filters.technologies, "technologies")}
          {renderDropdown("Region", "region", allRegions, filters.regions, "regions")}
          {renderDropdown("Cluster", "cluster", allClusters, filters.clusters, "clusters")}
          {renderDropdown("Vendor", "vendor", allVendors, filters.vendors, "vendors")}
          {renderDropdown("Technology", "technology", allTechnologies, filters.technologies, "technologies")}
          {renderDropdown("Granularity", "granularity", ["Hourly", "Daily", "Weekly", "Monthly"], [], "granularity")}
        </div>

        {/* Additional Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1">
          {renderDropdown("Domain", "domain", allDomains, filters.domains, "domains")}
          {renderDropdown("Category", "category", allCategories, filters.categories, "categories")}
          {renderDropdown("Scope", "scope", allScopes, filters.scopes, "scopes")}
          {renderDropdown("Network", "network", allNetworks, filters.networks, "networks")}
          {renderDropdown("Site", "site", allSites, filters.sites, "sites")}
        </div>

        {/* Action Buttons - INSIDE the filter box */}
        <div className="flex items-center justify-end gap-1.5 pt-1 border-t border-border">
          {hasActiveFilters && (
            <button
              onClick={handleClearAllFilters}
              className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-muted text-muted-foreground hover:bg-red-100 hover:text-red-700 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Reset All
            </button>
          )}

          <button
            onClick={handleApplyFilter}
            className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Apply Filter
          </button>

          {isGenerated && (
            <button
              onClick={handleRegenerate}
              className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border border-border bg-background hover:bg-muted transition-colors"
            >
              ↻ Regenerate
            </button>
          )}
        </div>
      </div>

      {/* KPI Search Results - for selection */}
      {!isGenerated && (
        <div className="bg-card border border-border rounded-lg p-2">
          <div className="max-h-40 overflow-y-auto space-y-1">
            {filteredKPIs.length > 0 ? (
              filteredKPIs.map((kpi) => {
                const isSelected = selectedKPIs.find((k) => k.id === kpi.id);
                return (
                  <button
                    key={kpi.id}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedKPIs(selectedKPIs.filter((k) => k.id !== kpi.id));
                      } else {
                        setSelectedKPIs([...selectedKPIs, kpi]);
                      }
                    }}
                    className={cn(
                      "w-full text-left px-2 py-1 rounded text-xs border transition-all",
                      isSelected
                        ? "border-primary bg-primary/10"
                        : "border-border/50 bg-muted/30 hover:bg-muted/50"
                    )}
                  >
                    <div className="font-medium text-foreground">{kpi.name}</div>
                    <div className="text-xs text-muted-foreground">{kpi.category} • {kpi.technology}</div>
                  </button>
                );
              })
            ) : (
              <p className="text-xs text-muted-foreground text-center py-2">No KPIs found</p>
            )}
          </div>
          {selectedKPIs.length > 0 && (
            <div className="pt-1 border-t border-border mt-1 text-xs text-muted-foreground">
              {selectedKPIs.length} KPI{selectedKPIs.length !== 1 ? "s" : ""} selected
            </div>
          )}
        </div>
      )}

      {/* Analysis Scope - Only after generation */}
      {isGenerated && (filters.networks.length > 0 || filters.regions.length > 0 || filters.clusters.length > 0 || filters.sites.length > 0 || filters.cells.length > 0) && (
        <div className="bg-card border border-border rounded-lg p-2">
          <h3 className="text-xs font-semibold text-muted-foreground mb-1">Select Instance</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1">
            {filters.networks.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setOpenScopeDropdown(openScopeDropdown === "networks" ? null : "networks")}
                  className="w-full flex items-center justify-between px-1.5 py-1 rounded border border-border bg-muted/50 hover:bg-muted text-xs font-medium text-foreground transition-colors"
                >
                  <div className="flex items-center gap-1 truncate">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                    <span className="truncate text-xs">{selectedNetwork || "Networks"}</span>
                  </div>
                  <ChevronDown className={cn("w-3 h-3 flex-shrink-0", openScopeDropdown === "networks" && "rotate-180")} />
                </button>
                {openScopeDropdown === "networks" && (
                  <div className="absolute top-full left-0 right-0 mt-0.5 bg-card border border-border rounded shadow-lg z-10 max-h-24 overflow-y-auto">
                    {filters.networks.map((network) => (
                      <button
                        key={network}
                        onClick={() => {
                          setSelectedNetwork(selectedNetwork === network ? null : network);
                          setOpenScopeDropdown(null);
                        }}
                        className="w-full flex items-center gap-1 px-1.5 py-1 text-xs text-left border-b border-border/50 last:border-b-0 hover:bg-muted/50 transition-colors"
                      >
                        <div className="w-1 h-1 rounded-full bg-blue-500 flex-shrink-0" />
                        <span className="truncate flex-1 text-xs">{network}</span>
                        {selectedNetwork === network && <span className="text-primary text-xs">✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {filters.regions.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setOpenScopeDropdown(openScopeDropdown === "regions" ? null : "regions")}
                  className="w-full flex items-center justify-between px-1.5 py-1 rounded border border-border bg-muted/50 hover:bg-muted text-xs font-medium text-foreground transition-colors"
                >
                  <div className="flex items-center gap-1 truncate">
                    <div className="w-1.5 h-1.5 bg-green-500 flex-shrink-0" />
                    <span className="truncate text-xs">{selectedRegion || "Regions"}</span>
                  </div>
                  <ChevronDown className={cn("w-3 h-3 flex-shrink-0", openScopeDropdown === "regions" && "rotate-180")} />
                </button>
                {openScopeDropdown === "regions" && (
                  <div className="absolute top-full left-0 right-0 mt-0.5 bg-card border border-border rounded shadow-lg z-10 max-h-24 overflow-y-auto">
                    {filters.regions.map((region) => (
                      <button
                        key={region}
                        onClick={() => {
                          setSelectedRegion(selectedRegion === region ? null : region);
                          setOpenScopeDropdown(null);
                        }}
                        className="w-full flex items-center gap-1 px-1.5 py-1 text-xs text-left border-b border-border/50 last:border-b-0 hover:bg-muted/50 transition-colors"
                      >
                        <div className="w-1 h-1 bg-green-500 flex-shrink-0" />
                        <span className="truncate flex-1 text-xs">{region}</span>
                        {selectedRegion === region && <span className="text-primary text-xs">✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {filters.clusters.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setOpenScopeDropdown(openScopeDropdown === "clusters" ? null : "clusters")}
                  className="w-full flex items-center justify-between px-1.5 py-1 rounded border border-border bg-muted/50 hover:bg-muted text-xs font-medium text-foreground transition-colors"
                >
                  <div className="flex items-center gap-1 truncate">
                    <div className="w-1 h-1 border border-purple-500 rotate-45 flex-shrink-0" />
                    <span className="truncate text-xs">{selectedCluster || "Clusters"}</span>
                  </div>
                  <ChevronDown className={cn("w-3 h-3 flex-shrink-0", openScopeDropdown === "clusters" && "rotate-180")} />
                </button>
                {openScopeDropdown === "clusters" && (
                  <div className="absolute top-full left-0 right-0 mt-0.5 bg-card border border-border rounded shadow-lg z-10 max-h-24 overflow-y-auto">
                    {filters.clusters.map((cluster) => (
                      <button
                        key={cluster}
                        onClick={() => {
                          setSelectedCluster(selectedCluster === cluster ? null : cluster);
                          setOpenScopeDropdown(null);
                        }}
                        className="w-full flex items-center gap-1 px-1.5 py-1 text-xs text-left border-b border-border/50 last:border-b-0 hover:bg-muted/50 transition-colors"
                      >
                        <div className="w-1 h-1 border border-purple-500 rotate-45 flex-shrink-0" />
                        <span className="truncate flex-1 text-xs">{cluster}</span>
                        {selectedCluster === cluster && <span className="text-primary text-xs">✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {filters.sites.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setOpenScopeDropdown(openScopeDropdown === "sites" ? null : "sites")}
                  className="w-full flex items-center justify-between px-1.5 py-1 rounded border border-border bg-muted/50 hover:bg-muted text-xs font-medium text-foreground transition-colors"
                >
                  <div className="flex items-center gap-1 truncate">
                    <div className="w-1 h-1 border border-orange-500 rounded-full flex-shrink-0" />
                    <span className="truncate text-xs">{selectedSite || "Sites"}</span>
                  </div>
                  <ChevronDown className={cn("w-3 h-3 flex-shrink-0", openScopeDropdown === "sites" && "rotate-180")} />
                </button>
                {openScopeDropdown === "sites" && (
                  <div className="absolute top-full left-0 right-0 mt-0.5 bg-card border border-border rounded shadow-lg z-10 max-h-24 overflow-y-auto">
                    {filters.sites.map((site) => (
                      <button
                        key={site}
                        onClick={() => {
                          setSelectedSite(selectedSite === site ? null : site);
                          setOpenScopeDropdown(null);
                        }}
                        className="w-full flex items-center gap-1 px-1.5 py-1 text-xs text-left border-b border-border/50 last:border-b-0 hover:bg-muted/50 transition-colors"
                      >
                        <div className="w-1 h-1 border border-orange-500 rounded-full flex-shrink-0" />
                        <span className="truncate flex-1 text-xs">{site}</span>
                        {selectedSite === site && <span className="text-primary text-xs">✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {filters.cells.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setOpenScopeDropdown(openScopeDropdown === "cells" ? null : "cells")}
                  className="w-full flex items-center justify-between px-1.5 py-1 rounded border border-border bg-muted/50 hover:bg-muted text-xs font-medium text-foreground transition-colors"
                >
                  <div className="flex items-center gap-1 truncate">
                    <div className="w-1 h-1 bg-red-500 flex-shrink-0" style={{clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)"}} />
                    <span className="truncate text-xs">{selectedCell || "Cells"}</span>
                  </div>
                  <ChevronDown className={cn("w-3 h-3 flex-shrink-0", openScopeDropdown === "cells" && "rotate-180")} />
                </button>
                {openScopeDropdown === "cells" && (
                  <div className="absolute top-full left-0 right-0 mt-0.5 bg-card border border-border rounded shadow-lg z-10 max-h-24 overflow-y-auto">
                    {filters.cells.map((cell) => (
                      <button
                        key={cell}
                        onClick={() => {
                          setSelectedCell(selectedCell === cell ? null : cell);
                          setOpenScopeDropdown(null);
                        }}
                        className="w-full flex items-center gap-1 px-1.5 py-1 text-xs text-left border-b border-border/50 last:border-b-0 hover:bg-muted/50 transition-colors"
                      >
                        <div className="w-1 h-1 bg-red-500 flex-shrink-0" style={{clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)"}} />
                        <span className="truncate flex-1 text-xs">{cell}</span>
                        {selectedCell === cell && <span className="text-primary text-xs">✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Charts and Details */}
      {isGenerated && selectedKPIs.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              {generatedTime && (
                <p className="text-xs text-muted-foreground">
                  Generated: {generatedTime.toLocaleString()}
                </p>
              )}
            </div>
            <button
              onClick={handleExportAll}
              className="flex items-center gap-1 px-2 py-1 rounded-lg border border-border bg-background hover:bg-muted transition-colors text-xs font-medium"
            >
              <Download className="w-3 h-3" />
              Export
            </button>
          </div>

          {selectedKPIs.map((kpi) => {
            const selectedLabel = selectedNetwork || selectedRegion || selectedCluster || selectedSite || selectedCell || "All";
            const kpiChartData = chartDataMap[kpi.id] || [];

            return (
              <TrendChartContainer
                key={kpi.id}
                title={`${kpi.name} (${selectedLabel})`}
                data={kpiChartData}
                dataKeys={["value"]}
                exportable
                zoomable
                defaultChartType="line"
              />
            );
          })}

          {/* KPI Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {selectedKPIs.map((kpi) => (
              <div
                key={kpi.id}
                className="group relative bg-card border border-border rounded-lg p-2 cursor-help hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-1">
                  <div className="flex-1">
                    <h4 className="font-semibold text-xs text-foreground">{kpi.name}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">{kpi.description}</p>
                  </div>
                  <button
                    onClick={() => handleExportKPI(kpi)}
                    className="flex-shrink-0 p-1 rounded hover:bg-muted transition-colors"
                  >
                    <Download className="w-3 h-3 text-muted-foreground hover:text-foreground" />
                  </button>
                </div>

                {/* Tooltip */}
                <div className="absolute left-0 top-full mt-1 hidden group-hover:block bg-background border border-border rounded-lg p-1.5 shadow-lg z-10 w-48 text-xs space-y-0.5">
                  <div>
                    <span className="text-muted-foreground text-xs">Category:</span>
                    <p className="font-medium text-foreground text-xs">{kpi.category}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs">Technology:</span>
                    <p className="font-medium text-foreground text-xs">{kpi.technology}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs">Unit:</span>
                    <p className="font-medium text-foreground text-xs">{kpi.unit}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isGenerated && selectedKPIs.length === 0 && (
        <div className="bg-card border border-dashed border-border rounded-lg p-3 text-center">
          <p className="text-xs text-muted-foreground">Click "Regenerate" to modify and select KPIs</p>
        </div>
      )}
    </div>
  );
}
