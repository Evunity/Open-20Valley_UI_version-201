import { useState, useMemo } from "react";
import { Save, Trash2, Download, Eye, EyeOff, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import * as XLSX from "xlsx";
import AnalyticsFilterPanel, { type AnalyticsFilters } from "@/components/AnalyticsFilterPanel";
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

  return (
    <div className="space-y-6 p-6">
      {/* Header Buttons */}
      <div className="flex items-center justify-between">
        <div />
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

      {/* Saved Views Panel */}
      {showSavedViews && (
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-bold text-foreground">Saved Views</h3>
          {savedViews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedViews.map((view) => (
                <div
                  key={view.id}
                  className="border border-border/50 rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground">{view.name}</h4>
                      {view.description && (
                        <p className="text-sm text-muted-foreground mt-1">{view.description}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteView(view.id)}
                      className="p-1 rounded hover:bg-red-100 text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-xs text-muted-foreground mb-3">
                    {view.kpis.length} KPI{view.kpis.length !== 1 ? "s" : ""} • Scope:{" "}
                    {view.scope}
                  </div>
                  <button
                    onClick={() => handleLoadView(view)}
                    className="w-full px-2 py-1 rounded text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
                  >
                    Load View
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              No saved views yet. Create one using the "Save View" button.
            </p>
          )}
        </div>
      )}

      {/* Save View Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg border border-border p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-foreground mb-4">Save View</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-muted-foreground block mb-2">
                  View Name *
                </label>
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
                <label className="text-sm font-semibold text-muted-foreground block mb-2">
                  Description (Optional)
                </label>
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

      {/* Main Content Grid */}
      <div className="flex gap-6">
        {/* Left Sidebar - Filters and KPIs */}
        <div className="w-64 flex-shrink-0 space-y-6">
          <AnalyticsFilterPanel filters={filters} onFiltersChange={setFilters} />
          <KPISelector
            selectedKPIs={selectedKPIs}
            onKPIsChange={setSelectedKPIs}
            onGenerate={handleGenerate}
            isGenerated={isGenerated}
            filters={{
              technologies: filters.technologies,
              vendors: filters.vendors,
              domains: filters.domains,
              categories: filters.categories,
              networks: filters.networks,
              regions: filters.regions,
              clusters: filters.clusters,
              sites: filters.sites,
              cells: filters.cells,
            }}
          />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 space-y-6">
          {/* Regenerate Button - Always visible after Generate */}
          {isGenerated && (
            <div className="flex justify-end">
              <button
                onClick={handleRegenerate}
                className="px-3 py-2 rounded-lg border border-border bg-background hover:bg-muted transition-colors text-sm font-medium"
              >
                ↻ Regenerate
              </button>
            </div>
          )}

          {/* Analysis Scope Selection */}
          {isGenerated && (
            <div className="bg-card border border-border rounded-lg p-4 space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground">Analysis Scope - Select Instance</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Networks Dropdown */}
                {filters.networks.length > 0 && (
                  <div className="relative">
                    <button
                      onClick={() => setOpenScopeDropdown(openScopeDropdown === "networks" ? null : "networks")}
                      className="w-full flex items-center justify-between px-3 py-2 rounded border border-border bg-muted/50 hover:bg-muted text-sm font-medium text-foreground transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500" title="Network shape" />
                        <span>{selectedNetwork ? selectedNetwork : "Networks"}</span>
                      </div>
                      <svg className={cn("w-4 h-4 transition-transform", openScopeDropdown === "networks" && "rotate-180")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    </button>
                    {openScopeDropdown === "networks" && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded shadow-lg z-10">
                        {filters.networks.map((network) => (
                          <button
                            key={network}
                            onClick={() => {
                              setSelectedNetwork(selectedNetwork === network ? null : network);
                              setSelectedRegion(null);
                              setSelectedCluster(null);
                              setSelectedSite(null);
                              setSelectedCell(null);
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

                {/* Regions Dropdown */}
                {filters.regions.length > 0 && (
                  <div className="relative">
                    <button
                      onClick={() => setOpenScopeDropdown(openScopeDropdown === "regions" ? null : "regions")}
                      className="w-full flex items-center justify-between px-3 py-2 rounded border border-border bg-muted/50 hover:bg-muted text-sm font-medium text-foreground transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500" title="Region shape (square)" />
                        <span>{selectedRegion ? selectedRegion : "Regions"}</span>
                      </div>
                      <svg className={cn("w-4 h-4 transition-transform", openScopeDropdown === "regions" && "rotate-180")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    </button>
                    {openScopeDropdown === "regions" && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded shadow-lg z-10">
                        {filters.regions.map((region) => (
                          <button
                            key={region}
                            onClick={() => {
                              setSelectedRegion(selectedRegion === region ? null : region);
                              setSelectedNetwork(null);
                              setSelectedCluster(null);
                              setSelectedSite(null);
                              setSelectedCell(null);
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

                {/* Clusters Dropdown */}
                {filters.clusters.length > 0 && (
                  <div className="relative">
                    <button
                      onClick={() => setOpenScopeDropdown(openScopeDropdown === "clusters" ? null : "clusters")}
                      className="w-full flex items-center justify-between px-3 py-2 rounded border border-border bg-muted/50 hover:bg-muted text-sm font-medium text-foreground transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 border-2 border-purple-500 transform rotate-45" title="Cluster shape (diamond)" />
                        <span>{selectedCluster ? selectedCluster : "Clusters"}</span>
                      </div>
                      <svg className={cn("w-4 h-4 transition-transform", openScopeDropdown === "clusters" && "rotate-180")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    </button>
                    {openScopeDropdown === "clusters" && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded shadow-lg z-10">
                        {filters.clusters.map((cluster) => (
                          <button
                            key={cluster}
                            onClick={() => {
                              setSelectedCluster(selectedCluster === cluster ? null : cluster);
                              setSelectedNetwork(null);
                              setSelectedRegion(null);
                              setSelectedSite(null);
                              setSelectedCell(null);
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

                {/* Sites Dropdown */}
                {filters.sites.length > 0 && (
                  <div className="relative">
                    <button
                      onClick={() => setOpenScopeDropdown(openScopeDropdown === "sites" ? null : "sites")}
                      className="w-full flex items-center justify-between px-3 py-2 rounded border border-border bg-muted/50 hover:bg-muted text-sm font-medium text-foreground transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 border-2 border-orange-500 rounded-full" title="Site shape (ring)" />
                        <span>{selectedSite ? selectedSite : "Sites"}</span>
                      </div>
                      <svg className={cn("w-4 h-4 transition-transform", openScopeDropdown === "sites" && "rotate-180")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    </button>
                    {openScopeDropdown === "sites" && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded shadow-lg z-10">
                        {filters.sites.map((site) => (
                          <button
                            key={site}
                            onClick={() => {
                              setSelectedSite(selectedSite === site ? null : site);
                              setSelectedNetwork(null);
                              setSelectedRegion(null);
                              setSelectedCluster(null);
                              setSelectedCell(null);
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

                {/* Cells Dropdown */}
                {filters.cells.length > 0 && (
                  <div className="relative">
                    <button
                      onClick={() => setOpenScopeDropdown(openScopeDropdown === "cells" ? null : "cells")}
                      className="w-full flex items-center justify-between px-3 py-2 rounded border border-border bg-muted/50 hover:bg-muted text-sm font-medium text-foreground transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 transform -rotate-45" title="Cell shape (triangle)" style={{clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)"}} />
                        <span>{selectedCell ? selectedCell : "Cells"}</span>
                      </div>
                      <svg className={cn("w-4 h-4 transition-transform", openScopeDropdown === "cells" && "rotate-180")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    </button>
                    {openScopeDropdown === "cells" && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded shadow-lg z-10">
                        {filters.cells.map((cell) => (
                          <button
                            key={cell}
                            onClick={() => {
                              setSelectedCell(selectedCell === cell ? null : cell);
                              setSelectedNetwork(null);
                              setSelectedRegion(null);
                              setSelectedCluster(null);
                              setSelectedSite(null);
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

              {filters.networks.length === 0 &&
               filters.regions.length === 0 &&
               filters.clusters.length === 0 &&
               filters.sites.length === 0 &&
               filters.cells.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  Select Network, Region, Cluster, Site, or Cell in the Create KPI filters to view instances here.
                </p>
              )}
            </div>
          )}

          {/* Analytics Dashboard */}
          {selectedKPIs.length > 0 && isGenerated ? (
            <div className="space-y-6">
              {/* Header with Export All Button */}
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
                  title="Export all KPIs to Excel"
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

              {/* KPI Details Grid with Hover Tooltip */}
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
                        title="Export this KPI data to Excel"
                      >
                        <Download className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                      </button>
                    </div>

                    {/* Hover Tooltip */}
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
                      <div>
                        <span className="text-muted-foreground">Scope:</span>
                        <p className="font-medium text-foreground">{kpi.scope}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Unit:</span>
                        <p className="font-medium text-foreground">{kpi.unit}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Direction:</span>
                        <p className="font-medium text-foreground">
                          {kpi.direction === "higher-is-better" ? "↑ Higher is Better" : "↓ Lower is Better"}
                        </p>
                      </div>
                      {generatedTime && (
                        <div>
                          <span className="text-muted-foreground">Generated:</span>
                          <p className="font-medium text-foreground">
                            {generatedTime.toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : !isGenerated ? (
            <div className="bg-card border border-dashed border-border rounded-lg p-12 text-center">
              <h3 className="text-lg font-semibold text-foreground mb-2">Ready to Create KPI</h3>
              <p className="text-muted-foreground">
                Use the filters on the left to set your KPI criteria, then click "Generate Selected KPIs" to proceed.
              </p>
            </div>
          ) : (
            <div className="bg-card border border-dashed border-border rounded-lg p-12 text-center">
              <h3 className="text-lg font-semibold text-foreground mb-2">No KPIs Selected</h3>
              <p className="text-muted-foreground">
                Click "Add KPIs" in the left panel to select KPIs for your analysis.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
