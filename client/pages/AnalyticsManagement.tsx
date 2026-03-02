import { useState, useMemo } from "react";
import { Save, Trash2, Download, Eye, EyeOff, Search, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import * as XLSX from "xlsx";
import { type AnalyticsFilters } from "@/components/AnalyticsFilterPanel";
import KPISelector from "@/components/KPISelector";
import TrendChartContainer from "@/components/TrendChartContainer";
import type { KPI } from "@/utils/kpiData";
import { KPI_CATALOG, filterKPIs, generateKPIValues, SCOPE_OPTIONS } from "@/utils/kpiData";
import {
  getSavedViews,
  saveView,
  updateView,
  deleteView,
  type SavedView,
} from "@/utils/savedViews";

export default function AnalyticsManagement() {
  // State management
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

  const [selectedKPIs, setSelectedKPIs] = useState<KPI[]>([]);
  const [currentScope, setCurrentScope] = useState<SavedView["scope"]>("Network");
  const [savedViews, setSavedViews] = useState(getSavedViews());
  const [showSavedViews, setShowSavedViews] = useState(false);
  const [saveViewName, setSaveViewName] = useState("");
  const [saveViewDescription, setSaveViewDescription] = useState("");
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [generatedTime, setGeneratedTime] = useState<Date | null>(null);
  const [isGenerated, setIsGenerated] = useState(false);
  const [kpiSearch, setKpiSearch] = useState("");
  const [openFilterDropdown, setOpenFilterDropdown] = useState<string | null>(null);

  // Track selected instances for Analysis Scope
  const [selectedNetwork, setSelectedNetwork] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedCluster, setSelectedCluster] = useState<string | null>(null);
  const [selectedSite, setSelectedSite] = useState<string | null>(null);
  const [selectedCell, setSelectedCell] = useState<string | null>(null);
  const [openScopeDropdown, setOpenScopeDropdown] = useState<string | null>(null);

  const handleGenerate = () => {
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

  // Filter KPIs based on current filters
  const filteredKPIs = useMemo(() => {
    return filterKPIs(KPI_CATALOG, {
      technologies: filters.technologies,
      vendors: filters.vendors,
      domains: filters.domains,
      categories: filters.categories,
      scopes: filters.scopes,
    });
  }, [filters]);

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

  // Handle save view
  const handleSaveView = () => {
    if (!saveViewName.trim()) return;

    const newView = saveView(
      saveViewName,
      filters,
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

  // Handle load view
  const handleLoadView = (view: SavedView) => {
    setFilters(view.filters);
    setCurrentScope(view.scope);

    const restoredKPIs = view.kpis
      .map((kpiId) => KPI_CATALOG.find((k) => k.id === kpiId))
      .filter((k) => k !== undefined) as KPI[];
    setSelectedKPIs(restoredKPIs);

    setShowSavedViews(false);
  };

  // Handle delete view
  const handleDeleteView = (viewId: string) => {
    if (window.confirm("Are you sure you want to delete this view?")) {
      deleteView(viewId);
      setSavedViews(getSavedViews());
    }
  };

  // Export individual KPI data
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

  // Export all KPIs combined
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

  const allTechnologies = ["2G", "3G", "4G", "5G", "O-RAN"];
  const allVendors = ["Huawei", "Ericsson", "Nokia", "ZTE", "O-RAN"];
  const allDomains = ["RAN", "O-RAN", "Transport", "Core"];
  const allCategories = ["Accessibility", "Throughput", "Latency", "Reliability", "Quality", "Traffic"];
  const allNetworks = ["Network 1", "Network 2", "Network 3"];
  const allRegions = ["North", "South", "East", "West", "Central"];
  const allClusters = ["Cluster A", "Cluster B", "Cluster C", "Cluster D"];
  const allSites = ["Site-01", "Site-02", "Site-03", "Site-04", "Site-05"];
  const allCells = ["Cell-001", "Cell-002", "Cell-003", "Cell-004", "Cell-005"];

  const toggleFilterItem = (filterType: string, item: any) => {
    const current = (filters as any)[filterType] || [];
    const updated = current.includes(item)
      ? current.filter((x: any) => x !== item)
      : [...current, item];
    
    setFilters({ ...filters, [filterType]: updated });
  };

  const renderFilterDropdown = (title: string, key: string, items: any[], selectedItems: any[], filterType: string) => (
    <div className="relative">
      <button
        onClick={() => setOpenFilterDropdown(openFilterDropdown === key ? null : key)}
        className="flex items-center gap-2 px-3 py-2 rounded border border-border bg-background hover:bg-muted/50 text-sm font-medium text-foreground transition-colors whitespace-nowrap"
      >
        <span>{title}</span>
        {selectedItems.length > 0 && (
          <span className="text-xs px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
            {selectedItems.length}
          </span>
        )}
        <ChevronDown className={cn("w-4 h-4 transition-transform", openFilterDropdown === key && "rotate-180")} />
      </button>

      {openFilterDropdown === key && (
        <div className="absolute top-full left-0 mt-1 bg-card border border-border rounded shadow-lg z-20 min-w-48 max-h-48 overflow-y-auto">
          {items.map((item) => (
            <label key={item} className="flex items-center gap-2 px-3 py-2 border-b border-border/50 last:border-b-0 cursor-pointer hover:bg-muted/30 transition-colors">
              <input
                type="checkbox"
                checked={selectedItems.includes(item)}
                onChange={() => toggleFilterItem(filterType, item)}
                className="w-4 h-4 rounded border border-border"
              />
              <span className="text-sm text-foreground">{item}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* ================================================================ */}
      {/* GLOBAL HEADER */}
      {/* ================================================================ */}
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Analytics Management</h1>
            <p className="text-sm text-muted-foreground mt-1">Create, manage, and analyze KPIs across your network</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSavedViews(!showSavedViews)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-background hover:bg-muted/50 transition-colors text-sm font-medium"
              title="Manage saved views"
            >
              {showSavedViews ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              Saved Views ({savedViews.length})
            </button>
            <button
              onClick={() => setShowSaveDialog(true)}
              disabled={selectedKPIs.length === 0}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-primary bg-primary/10 hover:bg-primary/20 transition-colors text-primary text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              title="Save current view"
            >
              <Save className="w-4 h-4" />
              Save View
            </button>
          </div>
        </div>
      </div>

      {/* ================================================================ */}
      {/* KPI SEARCH BAR */}
      {/* ================================================================ */}
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search KPIs..."
              value={kpiSearch}
              onChange={(e) => setKpiSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded border border-border text-sm text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-sm text-muted-foreground">Found: {filteredKPIs.length} KPIs</span>
          </div>
        </div>
      </div>

      {/* ================================================================ */}
      {/* GLOBAL FILTER BAR */}
      {/* ================================================================ */}
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="flex items-center gap-3 overflow-x-auto pb-2">
          <span className="text-sm font-semibold text-muted-foreground whitespace-nowrap">Filters:</span>
          
          {renderFilterDropdown("Technology", "tech", allTechnologies, filters.technologies, "technologies")}
          {renderFilterDropdown("Vendor", "vendor", allVendors, filters.vendors, "vendors")}
          {renderFilterDropdown("Domain", "domain", allDomains, filters.domains, "domains")}
          {renderFilterDropdown("Category", "category", allCategories, filters.categories, "categories")}
          {renderFilterDropdown("Network", "network", allNetworks, filters.networks, "networks")}
          {renderFilterDropdown("Region", "region", allRegions, filters.regions, "regions")}
          {renderFilterDropdown("Cluster", "cluster", allClusters, filters.clusters, "clusters")}
          {renderFilterDropdown("Site", "site", allSites, filters.sites, "sites")}
          {renderFilterDropdown("Cell", "cell", allCells, filters.cells, "cells")}

          {/* Time Range */}
          <div className="flex items-center gap-2 border-l border-border/50 pl-3">
            <input
              type="date"
              value={filters.timeRange.from}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  timeRange: { ...filters.timeRange, from: e.target.value },
                })
              }
              className="px-2 py-1 rounded border border-border text-xs text-foreground"
            />
            <span className="text-xs text-muted-foreground">to</span>
            <input
              type="date"
              value={filters.timeRange.to}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  timeRange: { ...filters.timeRange, to: e.target.value },
                })
              }
              className="px-2 py-1 rounded border border-border text-xs text-foreground"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 border-l border-border/50 pl-3 ml-auto">
            <button
              onClick={handleGenerate}
              disabled={filters.technologies.length === 0 && filters.vendors.length === 0}
              className="px-3 py-2 rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              Generate KPI
            </button>
            {isGenerated && (
              <button
                onClick={handleRegenerate}
                className="px-3 py-2 rounded border border-border text-foreground hover:bg-muted transition-colors text-sm font-medium whitespace-nowrap"
              >
                ↻ Regenerate
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ================================================================ */}
      {/* SAVED VIEWS PANEL */}
      {/* ================================================================ */}
      {showSavedViews && (
        <div className="border-b border-border bg-card px-6 py-4 max-h-64 overflow-y-auto">
          <h3 className="text-lg font-bold text-foreground mb-3">Saved Views</h3>
          {savedViews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {savedViews.map((view) => (
                <div key={view.id} className="border border-border/50 rounded-lg p-3 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground text-sm">{view.name}</h4>
                      {view.description && (
                        <p className="text-xs text-muted-foreground mt-1">{view.description}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteView(view.id)}
                      className="p-1 rounded hover:bg-red-100 text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-xs text-muted-foreground mb-2">
                    {view.kpis.length} KPI{view.kpis.length !== 1 ? "s" : ""} • Scope: {view.scope}
                  </div>
                  <button
                    onClick={() => handleLoadView(view)}
                    className="w-full px-2 py-1 rounded text-xs bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
                  >
                    Load View
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No saved views yet.</p>
          )}
        </div>
      )}

      {/* ================================================================ */}
      {/* SAVE VIEW DIALOG */}
      {/* ================================================================ */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg border border-border p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-foreground mb-4">Save View</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-muted-foreground block mb-2">View Name *</label>
                <input
                  type="text"
                  value={saveViewName}
                  onChange={(e) => setSaveViewName(e.target.value)}
                  placeholder="e.g., 5G Performance Analysis"
                  className="w-full px-3 py-2 rounded border border-border text-foreground placeholder-muted-foreground"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-muted-foreground block mb-2">Description (Optional)</label>
                <textarea
                  value={saveViewDescription}
                  onChange={(e) => setSaveViewDescription(e.target.value)}
                  placeholder="Add notes about this view..."
                  rows={3}
                  className="w-full px-3 py-2 rounded border border-border text-foreground placeholder-muted-foreground resize-none"
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-6">
              <button
                onClick={() => {
                  setShowSaveDialog(false);
                  setSaveViewName("");
                  setSaveViewDescription("");
                }}
                className="px-3 py-2 rounded border border-border hover:bg-muted transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveView}
                disabled={!saveViewName.trim()}
                className="px-3 py-2 rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* MAIN CONTENT AREA */}
      {/* ================================================================ */}
      <div className="flex-1 overflow-auto">
        <div className="p-6 space-y-6">
          {/* Analysis Scope Selection */}
          {isGenerated && (
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="text-sm font-semibold text-muted-foreground mb-4">Analysis Scope - Select Instance</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filters.networks.length > 0 && (
                  <div className="relative">
                    <button
                      onClick={() => setOpenScopeDropdown(openScopeDropdown === "networks" ? null : "networks")}
                      className="w-full flex items-center justify-between px-3 py-2 rounded border border-border bg-muted/50 hover:bg-muted text-sm font-medium text-foreground transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500" />
                        <span>{selectedNetwork || "Networks"}</span>
                      </div>
                      <ChevronDown className={cn("w-4 h-4 transition-transform", openScopeDropdown === "networks" && "rotate-180")} />
                    </button>
                    {openScopeDropdown === "networks" && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded shadow-lg z-10">
                        {filters.networks.map((network) => (
                          <button
                            key={network}
                            onClick={() => {
                              setSelectedNetwork(selectedNetwork === network ? null : network);
                              setOpenScopeDropdown(null);
                            }}
                            className={cn(
                              "w-full flex items-center gap-2 px-3 py-2 text-sm text-left border-b border-border/50 last:border-b-0 hover:bg-muted/50 transition-colors",
                              selectedNetwork === network && "bg-primary/10"
                            )}
                          >
                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                            <span>{network}</span>
                            {selectedNetwork === network && <span className="ml-auto text-primary">✓</span>}
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
                      className="w-full flex items-center justify-between px-3 py-2 rounded border border-border bg-muted/50 hover:bg-muted text-sm font-medium text-foreground transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500" />
                        <span>{selectedRegion || "Regions"}</span>
                      </div>
                      <ChevronDown className={cn("w-4 h-4 transition-transform", openScopeDropdown === "regions" && "rotate-180")} />
                    </button>
                    {openScopeDropdown === "regions" && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded shadow-lg z-10">
                        {filters.regions.map((region) => (
                          <button
                            key={region}
                            onClick={() => {
                              setSelectedRegion(selectedRegion === region ? null : region);
                              setOpenScopeDropdown(null);
                            }}
                            className={cn(
                              "w-full flex items-center gap-2 px-3 py-2 text-sm text-left border-b border-border/50 last:border-b-0 hover:bg-muted/50 transition-colors",
                              selectedRegion === region && "bg-primary/10"
                            )}
                          >
                            <div className="w-2 h-2 bg-green-500" />
                            <span>{region}</span>
                            {selectedRegion === region && <span className="ml-auto text-primary">✓</span>}
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
                      className="w-full flex items-center justify-between px-3 py-2 rounded border border-border bg-muted/50 hover:bg-muted text-sm font-medium text-foreground transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 border-2 border-purple-500 transform rotate-45" />
                        <span>{selectedCluster || "Clusters"}</span>
                      </div>
                      <ChevronDown className={cn("w-4 h-4 transition-transform", openScopeDropdown === "clusters" && "rotate-180")} />
                    </button>
                    {openScopeDropdown === "clusters" && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded shadow-lg z-10">
                        {filters.clusters.map((cluster) => (
                          <button
                            key={cluster}
                            onClick={() => {
                              setSelectedCluster(selectedCluster === cluster ? null : cluster);
                              setOpenScopeDropdown(null);
                            }}
                            className={cn(
                              "w-full flex items-center gap-2 px-3 py-2 text-sm text-left border-b border-border/50 last:border-b-0 hover:bg-muted/50 transition-colors",
                              selectedCluster === cluster && "bg-primary/10"
                            )}
                          >
                            <div className="w-2 h-2 border border-purple-500 transform rotate-45" />
                            <span>{cluster}</span>
                            {selectedCluster === cluster && <span className="ml-auto text-primary">✓</span>}
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
                      className="w-full flex items-center justify-between px-3 py-2 rounded border border-border bg-muted/50 hover:bg-muted text-sm font-medium text-foreground transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 border-2 border-orange-500 rounded-full" />
                        <span>{selectedSite || "Sites"}</span>
                      </div>
                      <ChevronDown className={cn("w-4 h-4 transition-transform", openScopeDropdown === "sites" && "rotate-180")} />
                    </button>
                    {openScopeDropdown === "sites" && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded shadow-lg z-10">
                        {filters.sites.map((site) => (
                          <button
                            key={site}
                            onClick={() => {
                              setSelectedSite(selectedSite === site ? null : site);
                              setOpenScopeDropdown(null);
                            }}
                            className={cn(
                              "w-full flex items-center gap-2 px-3 py-2 text-sm text-left border-b border-border/50 last:border-b-0 hover:bg-muted/50 transition-colors",
                              selectedSite === site && "bg-primary/10"
                            )}
                          >
                            <div className="w-2 h-2 border border-orange-500 rounded-full" />
                            <span>{site}</span>
                            {selectedSite === site && <span className="ml-auto text-primary">✓</span>}
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
                      className="w-full flex items-center justify-between px-3 py-2 rounded border border-border bg-muted/50 hover:bg-muted text-sm font-medium text-foreground transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 transform -rotate-45" style={{clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)"}} />
                        <span>{selectedCell || "Cells"}</span>
                      </div>
                      <ChevronDown className={cn("w-4 h-4 transition-transform", openScopeDropdown === "cells" && "rotate-180")} />
                    </button>
                    {openScopeDropdown === "cells" && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded shadow-lg z-10">
                        {filters.cells.map((cell) => (
                          <button
                            key={cell}
                            onClick={() => {
                              setSelectedCell(selectedCell === cell ? null : cell);
                              setOpenScopeDropdown(null);
                            }}
                            className={cn(
                              "w-full flex items-center gap-2 px-3 py-2 text-sm text-left border-b border-border/50 last:border-b-0 hover:bg-muted/50 transition-colors",
                              selectedCell === cell && "bg-primary/10"
                            )}
                          >
                            <div className="w-2 h-2 bg-red-500 transform -rotate-45" style={{clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)"}} />
                            <span>{cell}</span>
                            {selectedCell === cell && <span className="ml-auto text-primary">✓</span>}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* KPI Results */}
          {selectedKPIs.length > 0 && isGenerated ? (
            <div className="space-y-6">
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
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-background hover:bg-muted transition-colors text-sm font-medium"
                >
                  <Download className="w-4 h-4" />
                  Export All
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {selectedKPIs.map((kpi) => (
                  <div
                    key={kpi.id}
                    className="group relative bg-card border border-border rounded-lg p-4 cursor-help hover:border-primary/50 transition-colors"
                  >
                    <div className="relative flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground">{kpi.name}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{kpi.description}</p>
                      </div>
                      <button
                        onClick={() => handleExportKPI(kpi)}
                        className="flex-shrink-0 p-2 rounded hover:bg-muted transition-colors"
                      >
                        <Download className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                      </button>
                    </div>

                    <div className="absolute left-0 top-full mt-2 hidden group-hover:block bg-background border border-border rounded-lg p-3 shadow-lg z-10 w-64 text-xs space-y-2">
                      <div>
                        <span className="text-muted-foreground">Category:</span>
                        <p className="font-medium text-foreground">{kpi.category}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Technology:</span>
                        <p className="font-medium text-foreground">{kpi.technology}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Domain:</span>
                        <p className="font-medium text-foreground">{kpi.domain}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Vendor:</span>
                        <p className="font-medium text-foreground">{kpi.vendor}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : !isGenerated ? (
            <div className="bg-card border border-dashed border-border rounded-lg p-12 text-center">
              <h3 className="text-lg font-semibold text-foreground mb-2">Ready to Create KPI</h3>
              <p className="text-muted-foreground">
                Use the filter bar above to set your KPI criteria, then click "Generate KPI" to proceed.
              </p>
            </div>
          ) : (
            <div className="bg-card border border-dashed border-border rounded-lg p-12 text-center">
              <h3 className="text-lg font-semibold text-foreground mb-2">No KPIs Selected</h3>
              <p className="text-muted-foreground">
                Select categories and apply filters to see available KPIs.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
