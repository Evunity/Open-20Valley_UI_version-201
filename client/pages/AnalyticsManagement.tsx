import { useEffect, useMemo, useState } from "react";
import { Save, Trash2, Download, Eye, EyeOff, ChevronDown, Search, X, RotateCcw, Calendar, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import * as XLSX from "xlsx";
import TrendChartContainer from "@/components/TrendChartContainer";
import DualMonthCalendar from "@/components/DualMonthCalendar";
import SearchableDropdown from "@/components/SearchableDropdown";
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
  countries: string[];
  granularityValues: string[];
  timeRange: {
    from: string;
    to: string;
  };
  granularity: "1H" | "1D" | "1W" | "1M";
}

type TimeRangeType = "predefined" | "manual";

export default function AnalyticsManagement() {
  const initialFilters: AnalyticsFilters = {
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
    countries: [],
    granularityValues: [],
    timeRange: {
      from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      to: new Date().toISOString().split("T")[0],
    },
    granularity: "1D",
  };

  const [draftFilters, setDraftFilters] = useState<AnalyticsFilters>(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState<AnalyticsFilters>(initialFilters);

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
  const [showKPIDropdown, setShowKPIDropdown] = useState(false);

  // Time range mode
  const [timeRangeMode, setTimeRangeMode] = useState<TimeRangeType>("predefined");
  const [predefinedRange, setPredefinedRange] = useState("30d");
  const [showCalendarPicker, setShowCalendarPicker] = useState(false);

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
    draftFilters.technologies.length > 0 ||
    draftFilters.vendors.length > 0 ||
    draftFilters.domains.length > 0 ||
    draftFilters.categories.length > 0 ||
    draftFilters.scopes.length > 0 ||
    draftFilters.networks.length > 0 ||
    draftFilters.regions.length > 0 ||
    draftFilters.clusters.length > 0 ||
    draftFilters.sites.length > 0 ||
    draftFilters.cells.length > 0 ||
    draftFilters.countries.length > 0 ||
    draftFilters.granularityValues.length > 0;

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

    setTimeRangeMode("predefined");
    setPredefinedRange(range);
    setShowCalendarPicker(false);
    setDraftFilters({
      ...draftFilters,
      timeRange: {
        from: from.toISOString().split("T")[0],
        to: now.toISOString().split("T")[0],
      },
    });
  };

  const activatePredefinedMode = () => {
    setTimeRangeMode("predefined");
    setShowCalendarPicker(false);
  };

  const activateManualMode = () => {
    setTimeRangeMode("manual");
  };

  const handleApplyFilter = () => {
    setAppliedFilters(draftFilters);
    setGeneratedTime(new Date());
    setIsGenerated(true);
    setShowKPIDropdown(false);
  };

  const handleRegenerate = () => {
    setGeneratedTime(new Date());
    setIsGenerated(true);
  };

  const handleClearAllFilters = () => {
    setDraftFilters({
      ...initialFilters,
      timeRange: draftFilters.timeRange,
    });
  };

  const selectedScopeFromInstance = useMemo(() => {
    if (selectedCell) return "Cell";
    if (selectedSite) return "Site";
    if (selectedCluster) return "Cluster";
    if (selectedRegion) return "Region";
    if (selectedNetwork) return "Network";
    return null;
  }, [selectedCell, selectedSite, selectedCluster, selectedRegion, selectedNetwork]);

  // KPI source is derived ONLY from applied filters (+ selected instance scope when selected)
  const availableKPIs = useMemo(() => {
    const scopesFromAppliedFilters = [...appliedFilters.scopes];
    if (selectedScopeFromInstance) {
      scopesFromAppliedFilters.push(selectedScopeFromInstance);
    }

    return filterKPIs(KPI_CATALOG, {
      technologies: appliedFilters.technologies as any,
      vendors: appliedFilters.vendors as any,
      domains: appliedFilters.domains as any,
      categories: appliedFilters.categories as any,
      scopes: [...new Set(scopesFromAppliedFilters)] as any,
    });
  }, [appliedFilters, selectedScopeFromInstance]);

  // Search only within currently available KPIs from applied state
  const filteredKPIs = useMemo(() => {
    let kpis = availableKPIs;

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
  }, [availableKPIs, kpiSearch]);

  // Keep selected KPIs synchronized with valid KPI source
  useEffect(() => {
    setSelectedKPIs((previousSelectedKPIs) =>
      previousSelectedKPIs.filter((kpi) => availableKPIs.some((availableKPI) => availableKPI.id === kpi.id))
    );
  }, [availableKPIs]);

  useEffect(() => {
    if (selectedNetwork && !appliedFilters.networks.includes(selectedNetwork)) setSelectedNetwork(null);
    if (selectedRegion && !appliedFilters.regions.includes(selectedRegion)) setSelectedRegion(null);
    if (selectedCluster && !appliedFilters.clusters.includes(selectedCluster)) setSelectedCluster(null);
    if (selectedSite && !appliedFilters.sites.includes(selectedSite)) setSelectedSite(null);
    if (selectedCell && !appliedFilters.cells.includes(selectedCell)) setSelectedCell(null);
  }, [
    appliedFilters,
    selectedNetwork,
    selectedRegion,
    selectedCluster,
    selectedSite,
    selectedCell,
  ]);

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
      appliedFilters as any,
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
    const loadedFilters = view.filters as AnalyticsFilters;
    setDraftFilters(loadedFilters);
    setAppliedFilters(loadedFilters);
    setCurrentScope(view.scope);

    const restoredKPIs = view.kpis
      .map((kpiId) => KPI_CATALOG.find((k) => k.id === kpiId))
      .filter((k) => k !== undefined) as KPI[];
    setSelectedKPIs(restoredKPIs);
    setGeneratedTime(new Date());
    setIsGenerated(true);

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

    // Sanitize sheet name - remove forbidden characters
    const sanitizedName = kpi.name.replace(/[\:\\\/?*\[\]]/g, "").substring(0, 31);
    XLSX.utils.book_append_sheet(workbook, worksheet, sanitizedName);

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

    const fileName = `${kpi.name.replace(/[\:\\\/?*\[\]\s]/g, "_")}_${new Date().toISOString().split("T")[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const handleExportAll = () => {
    if (availableKPIs.length === 0) {
      alert("No KPIs available to export");
      return;
    }

    const workbook = XLSX.utils.book_new();

    // Sanitize sheet names - remove forbidden characters
    const sanitizeSheetName = (name: string): string => {
      return name.replace(/[\:\\\/?*\[\]]/g, "").substring(0, 31);
    };

    // Export ALL available KPIs, not just selected ones
    availableKPIs.forEach((kpi) => {
      // Generate data for this KPI
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

      const kpiData = generateKPIValues(kpi, currentScope, label);

      if (kpiData && kpiData.length > 0) {
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

        XLSX.utils.book_append_sheet(workbook, worksheet, sanitizeSheetName(kpi.name));
      }
    });

    XLSX.writeFile(workbook, `KPI_Export_All_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  return (
    <div className="space-y-2">
      {/* Header - Search bar with Views and Save buttons on one row */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {/* KPI Search Bar - Flex left */}
        <div className="relative flex-1 min-w-[200px]">
          <div className={cn("bg-card border rounded p-1.5 flex items-center gap-1.5 transition-all shadow-sm", showKPIDropdown ? "border-primary ring-1 ring-primary/30 shadow-md" : "border-border hover:border-primary/30")}>
            <Search className="w-3.5 h-3.5 text-primary flex-shrink-0 stroke-2" />
            <input
              type="text"
              placeholder="Search KPIs..."
              value={kpiSearch}
              onChange={(e) => {
                setKpiSearch(e.target.value);
                setShowKPIDropdown(true);
              }}
              onFocus={() => setShowKPIDropdown(true)}
              className="flex-1 bg-transparent border-0 text-xs text-foreground placeholder-muted-foreground/70 focus:outline-none font-medium"
            />
            {kpiSearch && (
              <button
                onClick={() => setKpiSearch("")}
                className="p-0.5 text-muted-foreground hover:text-foreground transition-colors flex-shrink-0 hover:bg-muted/50 rounded"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* KPI Search Results Dropdown */}
          {showKPIDropdown && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowKPIDropdown(false)}
              />
              {/* Dropdown */}
              <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-primary/40 rounded-lg shadow-xl z-20 max-h-72 overflow-y-auto">
                {filteredKPIs.length > 0 ? (
                  <div className="divide-y divide-border/30">
                    {filteredKPIs.map((kpi) => {
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
                            "w-full text-left px-2 py-1.5 text-xs transition-all flex items-start gap-2",
                            isSelected
                              ? "bg-primary/10 border-l-2 border-l-primary"
                              : "hover:bg-muted/40"
                          )}
                        >
                          <div className={cn("w-4 h-4 rounded border-2 flex-shrink-0 mt-0.5 flex items-center justify-center", isSelected ? "bg-primary border-primary" : "border-border")}>
                            {isSelected && <Check className="w-2.5 h-2.5 text-primary-foreground" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-xs text-foreground">{kpi.name}</div>
                            <div className="text-[10px] text-muted-foreground mt-0.5">{kpi.category} • {kpi.technology}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="px-3 py-3 text-xs text-muted-foreground">
                    {availableKPIs.length === 0
                      ? "No KPIs match the currently applied filters."
                      : "No KPIs match your search term in the applied filter set."}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Views and Save buttons - Right side */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={() => setShowSavedViews(!showSavedViews)}
            className="flex items-center gap-1 px-2 py-1 rounded border border-border bg-background hover:bg-muted/50 transition-colors text-xs font-medium"
          >
            {showSavedViews ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            Views ({savedViews.length})
          </button>
          <button
            onClick={() => setShowSaveDialog(true)}
            disabled={selectedKPIs.length === 0}
            className="flex items-center gap-1 px-2 py-1 rounded border border-primary bg-primary/10 hover:bg-primary/20 transition-colors text-primary text-xs font-medium disabled:opacity-50"
          >
            <Save className="w-3 h-3" />
            Save
          </button>
        </div>
      </div>

      {/* Saved Views Panel */}
      {showSavedViews && (
        <div className="bg-card border border-border rounded-lg p-2 space-y-1.5">
          <h3 className="text-xs font-bold text-foreground">Saved Views</h3>
          {savedViews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
              {savedViews.map((view) => (
                <div key={view.id} className="border border-border/50 rounded p-1.5 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-xs text-foreground truncate">{view.name}</h4>
                      {view.description && (
                        <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{view.description}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteView(view.id)}
                      className="p-0.5 rounded hover:bg-red-100 text-red-600 transition-colors flex-shrink-0 ml-1"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="text-xs text-muted-foreground mb-1.5">
                    {view.kpis.length} KPI{view.kpis.length !== 1 ? "s" : ""} • {view.scope}
                  </div>
                  <button
                    onClick={() => handleLoadView(view)}
                    className="w-full px-1.5 py-1 rounded text-xs bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
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
          <div className="bg-card rounded-lg border border-border p-2 max-w-sm w-full">
            <h3 className="text-xs font-bold text-foreground mb-1">Save View</h3>
            <div className="space-y-1">
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


      {isGenerated && availableKPIs.length === 0 && (
        <div className="bg-card border border-dashed border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">
            No KPIs match the currently applied filters.
          </p>
        </div>
      )}

      {/* Global Filter Bar - Redesigned */}
      <div className="bg-card border border-border rounded-lg p-2.5 md:p-3 space-y-3 text-xs shadow-sm">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Analytics Filters</h3>
            <p className="text-xs text-muted-foreground">Choose date mode and filter dimensions before applying.</p>
          </div>
          <div className="text-xs text-muted-foreground bg-muted/40 rounded-md px-2 py-1">
            Active mode: <span className="font-semibold text-foreground">{timeRangeMode === "predefined" ? "Presets" : "Custom"}</span>
          </div>
        </div>

        {/* Date Modes + Date Controls */}
        <div className="space-y-2 border border-border/60 rounded-lg p-2.5 bg-muted/20">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Date Range</label>
            <div className="inline-flex rounded-md border border-border bg-background p-0.5">
              <button
                onClick={activatePredefinedMode}
                className={cn(
                  "px-2.5 py-0.5 rounded text-xs font-semibold transition-colors",
                  timeRangeMode === "predefined"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Presets
              </button>
              <button
                onClick={activateManualMode}
                className={cn(
                  "px-2.5 py-0.5 rounded text-xs font-semibold transition-colors",
                  timeRangeMode === "manual"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Custom
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-2.5">
            <div
              className={cn(
                "rounded-md border p-2.5 transition-all",
                timeRangeMode === "predefined"
                  ? "border-primary/40 bg-primary/5"
                  : "border-border/70 bg-background/40 opacity-55"
              )}
            >
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-xs font-semibold text-foreground">Presets</p>
                {timeRangeMode === "predefined" && (
                  <span className="text-[10px] font-semibold text-primary">Active</span>
                )}
              </div>
              <div className="grid grid-cols-5 gap-1">
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
                    disabled={timeRangeMode !== "predefined"}
                    className={cn(
                      "px-1.5 py-1 rounded text-xs font-semibold transition-all border rounded-md",
                      predefinedRange === value
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-muted-foreground border-border hover:border-primary/40",
                      timeRangeMode !== "predefined" && "cursor-not-allowed opacity-60 hover:border-border"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div
              className={cn(
                "rounded-md border p-2.5 transition-all relative",
                timeRangeMode === "manual"
                  ? "border-primary/40 bg-primary/5"
                  : "border-border/70 bg-background/40 opacity-55"
              )}
            >
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-xs font-semibold text-foreground">Custom</p>
                {timeRangeMode === "manual" && (
                  <span className="text-[10px] font-semibold text-primary">Active</span>
                )}
              </div>
              <button
                onClick={() => setShowCalendarPicker(!showCalendarPicker)}
                disabled={timeRangeMode !== "manual"}
                className={cn(
                  "w-full px-2 py-1.5 rounded-md border text-xs font-medium flex items-center gap-1.5 transition-all",
                  showCalendarPicker && timeRangeMode === "manual"
                    ? "border-primary ring-1 ring-primary/30 bg-background"
                    : "border-border bg-background",
                  timeRangeMode !== "manual" && "cursor-not-allowed text-muted-foreground"
                )}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span className="truncate">
                  {draftFilters.timeRange.from && draftFilters.timeRange.to
                    ? `${new Date(draftFilters.timeRange.from).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })} - ${new Date(draftFilters.timeRange.to).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}`
                    : "Select custom range"}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Calendar Popup */}
        {showCalendarPicker && timeRangeMode === "manual" && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/30"
              onClick={() => setShowCalendarPicker(false)}
            />
            <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-sm mx-auto p-3 rounded-lg border border-border bg-card shadow-2xl z-50 max-h-[85vh] overflow-y-auto">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-muted-foreground">
                    Select Dates
                  </label>
                  <button
                    onClick={() => setShowCalendarPicker(false)}
                    className="text-muted-foreground hover:text-foreground transition-colors p-0.5"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <DualMonthCalendar
                  startDate={draftFilters.timeRange.from}
                  endDate={draftFilters.timeRange.to}
                  onDateSelect={(date, isStart) => {
                    const isoDate = date.toISOString().split("T")[0];
                    if (isStart) {
                      setDraftFilters({
                        ...draftFilters,
                        timeRange: { from: isoDate, to: "" },
                      });
                    } else {
                      setDraftFilters({
                        ...draftFilters,
                        timeRange: {
                          from: draftFilters.timeRange.from,
                          to: isoDate,
                        },
                      });
                    }
                  }}
                  onRangeComplete={(start, end) => {
                    setDraftFilters({
                      ...draftFilters,
                      timeRange: {
                        from: start.toISOString().split("T")[0],
                        to: end.toISOString().split("T")[0],
                      },
                    });
                    setShowCalendarPicker(false);
                  }}
                />
                {draftFilters.timeRange.from && draftFilters.timeRange.to && (
                  <div className="pt-2 border-t border-border/50 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-muted-foreground truncate">
                        <strong>Selected:</strong> {new Date(draftFilters.timeRange.from).toLocaleDateString()}
                      </span>
                      <button
                        onClick={() => {
                          setDraftFilters({
                            ...draftFilters,
                            timeRange: { from: "", to: "" },
                          });
                        }}
                        className="px-2 py-0.5 text-xs rounded bg-muted hover:bg-muted/70 transition-all flex-shrink-0"
                      >
                        Clear
                      </button>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      to {new Date(draftFilters.timeRange.to).toLocaleDateString()}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-2.5">
          <SearchableDropdown
            label="Country"
            options={["USA", "Canada", "UK", "Germany", "France", "Japan"]}
            selected={draftFilters.countries || []}
            onChange={(selected) => setDraftFilters({ ...draftFilters, countries: selected })}
            placeholder="Search countries..."
            compact
          />
          <SearchableDropdown
            label="Region"
            options={allRegions}
            selected={draftFilters.regions}
            onChange={(selected) => setDraftFilters({ ...draftFilters, regions: selected })}
            placeholder="Search regions..."
            compact
          />
          <SearchableDropdown
            label="Cluster"
            options={allClusters}
            selected={draftFilters.clusters}
            onChange={(selected) => setDraftFilters({ ...draftFilters, clusters: selected })}
            placeholder="Search clusters..."
            compact
          />
          <SearchableDropdown
            label="Vendor"
            options={allVendors}
            selected={draftFilters.vendors}
            onChange={(selected) => setDraftFilters({ ...draftFilters, vendors: selected })}
            placeholder="Search vendors..."
            compact
          />
          <SearchableDropdown
            label="Technology"
            options={allTechnologies}
            selected={draftFilters.technologies}
            onChange={(selected) => setDraftFilters({ ...draftFilters, technologies: selected })}
            placeholder="Search technologies..."
            compact
          />
          <SearchableDropdown
            label="Granularity"
            options={["Hourly", "Daily", "Weekly", "Monthly"]}
            selected={draftFilters.granularityValues}
            onChange={(selected) => setDraftFilters({ ...draftFilters, granularityValues: selected })}
            placeholder="Search granularity..."
            compact
          />
          <SearchableDropdown
            label="Network"
            options={allNetworks}
            selected={draftFilters.networks}
            onChange={(selected) => setDraftFilters({ ...draftFilters, networks: selected })}
            placeholder="Search networks..."
            compact
          />
          <SearchableDropdown
            label="Site"
            options={allSites}
            selected={draftFilters.sites}
            onChange={(selected) => setDraftFilters({ ...draftFilters, sites: selected })}
            placeholder="Search sites..."
            compact
          />
          <SearchableDropdown
            label="Cell"
            options={allCells}
            selected={draftFilters.cells}
            onChange={(selected) => setDraftFilters({ ...draftFilters, cells: selected })}
            placeholder="Search cells..."
            compact
          />
          <SearchableDropdown
            label="Domain"
            options={allDomains}
            selected={draftFilters.domains}
            onChange={(selected) => setDraftFilters({ ...draftFilters, domains: selected })}
            placeholder="Search domains..."
            compact
          />
          <SearchableDropdown
            label="Category"
            options={allCategories}
            selected={draftFilters.categories}
            onChange={(selected) => setDraftFilters({ ...draftFilters, categories: selected })}
            placeholder="Search categories..."
            compact
          />
        </div>

        {/* Action Buttons - INSIDE the filter box */}
        <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-border/50">
          <button
            onClick={handleClearAllFilters}
            disabled={!hasActiveFilters}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-muted text-muted-foreground hover:bg-red-100 hover:text-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>

          <button
            onClick={handleApplyFilter}
            className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Apply
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

      {/* Selected KPIs Summary - shown after generation */}
      {isGenerated && selectedKPIs.length > 0 && (
        <div className="bg-card border border-border/50 rounded-lg p-3 text-sm text-muted-foreground">
          {selectedKPIs.length} KPI{selectedKPIs.length !== 1 ? "s" : ""} selected
        </div>
      )}

      {/* Analysis Scope - Only after generation */}
      {isGenerated && (appliedFilters.networks.length > 0 || appliedFilters.regions.length > 0 || appliedFilters.clusters.length > 0 || appliedFilters.sites.length > 0 || appliedFilters.cells.length > 0) && (
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">Select Instance</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {appliedFilters.networks.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setOpenScopeDropdown(openScopeDropdown === "networks" ? null : "networks")}
                  className="w-full flex items-center justify-between px-3 py-2 rounded border border-border bg-muted/50 hover:bg-muted text-sm font-medium text-foreground transition-colors"
                >
                  <div className="flex items-center gap-2 truncate">
                    <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                    <span className="truncate text-sm">{selectedNetwork || "Networks"}</span>
                  </div>
                  <ChevronDown className={cn("w-4 h-4 flex-shrink-0", openScopeDropdown === "networks" && "rotate-180")} />
                </button>
                {openScopeDropdown === "networks" && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded shadow-lg z-10 max-h-32 overflow-y-auto">
                    {appliedFilters.networks.map((network) => (
                      <button
                        key={network}
                        onClick={() => {
                          setSelectedNetwork(selectedNetwork === network ? null : network);
                          setOpenScopeDropdown(null);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left border-b border-border/50 last:border-b-0 hover:bg-muted/50 transition-colors"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                        <span className="truncate flex-1 text-sm">{network}</span>
                        {selectedNetwork === network && <span className="text-primary text-sm">✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {appliedFilters.regions.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setOpenScopeDropdown(openScopeDropdown === "regions" ? null : "regions")}
                  className="w-full flex items-center justify-between px-3 py-2 rounded border border-border bg-muted/50 hover:bg-muted text-sm font-medium text-foreground transition-colors"
                >
                  <div className="flex items-center gap-2 truncate">
                    <div className="w-2 h-2 bg-green-500 flex-shrink-0" />
                    <span className="truncate text-sm">{selectedRegion || "Regions"}</span>
                  </div>
                  <ChevronDown className={cn("w-4 h-4 flex-shrink-0", openScopeDropdown === "regions" && "rotate-180")} />
                </button>
                {openScopeDropdown === "regions" && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded shadow-lg z-10 max-h-32 overflow-y-auto">
                    {appliedFilters.regions.map((region) => (
                      <button
                        key={region}
                        onClick={() => {
                          setSelectedRegion(selectedRegion === region ? null : region);
                          setOpenScopeDropdown(null);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left border-b border-border/50 last:border-b-0 hover:bg-muted/50 transition-colors"
                      >
                        <div className="w-1.5 h-1.5 bg-green-500 flex-shrink-0" />
                        <span className="truncate flex-1 text-sm">{region}</span>
                        {selectedRegion === region && <span className="text-primary text-sm">✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {appliedFilters.clusters.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setOpenScopeDropdown(openScopeDropdown === "clusters" ? null : "clusters")}
                  className="w-full flex items-center justify-between px-3 py-2 rounded border border-border bg-muted/50 hover:bg-muted text-sm font-medium text-foreground transition-colors"
                >
                  <div className="flex items-center gap-2 truncate">
                    <div className="w-2 h-2 border border-purple-500 rotate-45 flex-shrink-0" />
                    <span className="truncate text-sm">{selectedCluster || "Clusters"}</span>
                  </div>
                  <ChevronDown className={cn("w-4 h-4 flex-shrink-0", openScopeDropdown === "clusters" && "rotate-180")} />
                </button>
                {openScopeDropdown === "clusters" && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded shadow-lg z-10 max-h-32 overflow-y-auto">
                    {appliedFilters.clusters.map((cluster) => (
                      <button
                        key={cluster}
                        onClick={() => {
                          setSelectedCluster(selectedCluster === cluster ? null : cluster);
                          setOpenScopeDropdown(null);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left border-b border-border/50 last:border-b-0 hover:bg-muted/50 transition-colors"
                      >
                        <div className="w-1.5 h-1.5 border border-purple-500 rotate-45 flex-shrink-0" />
                        <span className="truncate flex-1 text-sm">{cluster}</span>
                        {selectedCluster === cluster && <span className="text-primary text-sm">✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {appliedFilters.sites.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setOpenScopeDropdown(openScopeDropdown === "sites" ? null : "sites")}
                  className="w-full flex items-center justify-between px-3 py-2 rounded border border-border bg-muted/50 hover:bg-muted text-sm font-medium text-foreground transition-colors"
                >
                  <div className="flex items-center gap-2 truncate">
                    <div className="w-2 h-2 border border-orange-500 rounded-full flex-shrink-0" />
                    <span className="truncate text-sm">{selectedSite || "Sites"}</span>
                  </div>
                  <ChevronDown className={cn("w-4 h-4 flex-shrink-0", openScopeDropdown === "sites" && "rotate-180")} />
                </button>
                {openScopeDropdown === "sites" && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded shadow-lg z-10 max-h-32 overflow-y-auto">
                    {appliedFilters.sites.map((site) => (
                      <button
                        key={site}
                        onClick={() => {
                          setSelectedSite(selectedSite === site ? null : site);
                          setOpenScopeDropdown(null);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left border-b border-border/50 last:border-b-0 hover:bg-muted/50 transition-colors"
                      >
                        <div className="w-1.5 h-1.5 border border-orange-500 rounded-full flex-shrink-0" />
                        <span className="truncate flex-1 text-sm">{site}</span>
                        {selectedSite === site && <span className="text-primary text-sm">✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {appliedFilters.cells.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setOpenScopeDropdown(openScopeDropdown === "cells" ? null : "cells")}
                  className="w-full flex items-center justify-between px-3 py-2 rounded border border-border bg-muted/50 hover:bg-muted text-sm font-medium text-foreground transition-colors"
                >
                  <div className="flex items-center gap-2 truncate">
                    <div className="w-2 h-2 bg-red-500 flex-shrink-0" style={{clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)"}} />
                    <span className="truncate text-sm">{selectedCell || "Cells"}</span>
                  </div>
                  <ChevronDown className={cn("w-4 h-4 flex-shrink-0", openScopeDropdown === "cells" && "rotate-180")} />
                </button>
                {openScopeDropdown === "cells" && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded shadow-lg z-10 max-h-32 overflow-y-auto">
                    {appliedFilters.cells.map((cell) => (
                      <button
                        key={cell}
                        onClick={() => {
                          setSelectedCell(selectedCell === cell ? null : cell);
                          setOpenScopeDropdown(null);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left border-b border-border/50 last:border-b-0 hover:bg-muted/50 transition-colors"
                      >
                        <div className="w-1.5 h-1.5 bg-red-500 flex-shrink-0" style={{clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)"}} />
                        <span className="truncate flex-1 text-sm">{cell}</span>
                        {selectedCell === cell && <span className="text-primary text-sm">✓</span>}
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
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              {generatedTime && (
                <p className="text-sm text-muted-foreground">
                  Generated: {generatedTime.toLocaleString()}
                </p>
              )}
            </div>
            <button
              onClick={handleExportAll}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-background hover:bg-muted transition-colors text-sm font-medium"
            >
              <Download className="w-4 h-4" />
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
              className="group relative bg-card border border-border rounded-lg p-4 cursor-help hover:border-primary/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-sm text-foreground">{kpi.name}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{kpi.description}</p>
                </div>
                <button
                  onClick={() => handleExportKPI(kpi)}
                  className="flex-shrink-0 p-2 rounded hover:bg-muted transition-colors"
                >
                  <Download className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                </button>
              </div>

              {/* Tooltip */}
              <div className="absolute left-0 top-full mt-2 hidden group-hover:block bg-background border border-border rounded-lg p-3 shadow-lg z-10 w-56 text-sm space-y-2">
                <div>
                  <span className="text-muted-foreground text-xs font-semibold">Category:</span>
                  <p className="font-medium text-foreground text-sm">{kpi.category}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs font-semibold">Technology:</span>
                  <p className="font-medium text-foreground text-sm">{kpi.technology}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs font-semibold">Unit:</span>
                  <p className="font-medium text-foreground text-sm">{kpi.unit}</p>
                </div>
              </div>
            </div>
          ))}
          </div>
        </div>
      )}

      {isGenerated && selectedKPIs.length === 0 && (
        <div className="bg-card border border-dashed border-border rounded-lg p-6 text-center">
          <p className="text-sm text-muted-foreground">Click "Regenerate" to modify and select KPIs</p>
        </div>
      )}
    </div>
  );
}
