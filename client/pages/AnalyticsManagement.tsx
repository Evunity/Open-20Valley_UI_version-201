import { useState, useMemo } from "react";
import { Save, Trash2, Download, Eye, EyeOff, ChevronDown, Search, Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";
import * as XLSX from "xlsx";
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

  const [kpiSearch, setKpiSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
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

  // Available filter options
  const allTechnologies: string[] = ["2G", "3G", "4G", "5G", "O-RAN"];
  const allVendors: string[] = ["Huawei", "Ericsson", "Nokia", "ZTE", "O-RAN"];
  const allDomains: string[] = ["RAN", "O-RAN", "Transport", "Core"];
  const allCategories: string[] = [
    "Accessibility",
    "Throughput",
    "Latency",
    "Reliability",
    "Quality",
    "Traffic",
  ];
  const allScopes: string[] = ["Network", "Region", "Cluster", "Site", "Cell"];
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
      granularity: filters.granularity,
    });
  };

  const toggleFilterItem = (filterType: keyof AnalyticsFilters, item: any) => {
    if (filterType === 'timeRange' || filterType === 'granularity') return;
    
    const current = filters[filterType] as any[];
    const updated = current.includes(item)
      ? current.filter((x) => x !== item)
      : [...current, item];
    
    setFilters({ ...filters, [filterType]: updated });
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

  // Handle load view
  const handleLoadView = (view: SavedView) => {
    setFilters(view.filters as AnalyticsFilters);
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
    <div className="space-y-4 p-6">
      {/* ===== GLOBAL HEADER ===== */}
      <div className="space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Analytics Management</h1>
            <p className="text-muted-foreground text-xs md:text-sm mt-1">Create and analyze custom KPIs</p>
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

      {/* ===== SAVED VIEWS PANEL ===== */}
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

      {/* ===== SAVE VIEW DIALOG ===== */}
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

      {/* ===== KPI SEARCH BAR ===== */}
      <div className="card-elevated bg-card border border-border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center gap-3">
          <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          <input
            type="text"
            placeholder="Search KPIs by name, category, or description..."
            value={kpiSearch}
            onChange={(e) => setKpiSearch(e.target.value)}
            className="flex-1 bg-transparent border-0 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-0"
          />
          {kpiSearch && (
            <button
              onClick={() => setKpiSearch("")}
              className="p-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* ===== GLOBAL FILTER BAR ===== */}
      <div className="card-elevated bg-card border border-border rounded-lg p-4 space-y-4 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium active:scale-95",
              showFilters
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-muted hover:bg-muted/70"
            )}
          >
            <Filter className="w-4 h-4" />
            <span>
              Filters {hasActiveFilters && `(${filters.technologies.length + filters.vendors.length + filters.domains.length + filters.categories.length + filters.scopes.length + filters.networks.length + filters.regions.length + filters.clusters.length + filters.sites.length + filters.cells.length})`}
            </span>
          </button>

          {hasActiveFilters && (
            <button
              onClick={handleClearAllFilters}
              className="flex items-center gap-1 px-3 py-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors text-sm font-medium active:scale-95"
            >
              <X className="w-4 h-4" />
              Clear All
            </button>
          )}

          <button
            onClick={handleGenerate}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium active:scale-95 ml-auto"
          >
            Generate KPIs
          </button>

          {isGenerated && (
            <button
              onClick={handleRegenerate}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-background hover:bg-muted transition-colors text-sm font-medium active:scale-95"
            >
              ↻ Regenerate
            </button>
          )}
        </div>

        {/* Horizontal Filters Grid */}
        {showFilters && (
          <div className="border-t border-border pt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Technology */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-2 uppercase tracking-wide">
                Technology
              </label>
              <select
                multiple
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                value={filters.technologies}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, (option) => option.value);
                  setFilters({ ...filters, technologies: selected });
                }}
              >
                {allTechnologies.map((tech) => (
                  <option key={tech} value={tech}>{tech}</option>
                ))}
              </select>
            </div>

            {/* Vendor */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-2 uppercase tracking-wide">
                Vendor
              </label>
              <select
                multiple
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                value={filters.vendors}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, (option) => option.value);
                  setFilters({ ...filters, vendors: selected });
                }}
              >
                {allVendors.map((vendor) => (
                  <option key={vendor} value={vendor}>{vendor}</option>
                ))}
              </select>
            </div>

            {/* Domain */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-2 uppercase tracking-wide">
                Domain
              </label>
              <select
                multiple
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                value={filters.domains}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, (option) => option.value);
                  setFilters({ ...filters, domains: selected });
                }}
              >
                {allDomains.map((domain) => (
                  <option key={domain} value={domain}>{domain}</option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-2 uppercase tracking-wide">
                Category
              </label>
              <select
                multiple
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                value={filters.categories}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, (option) => option.value);
                  setFilters({ ...filters, categories: selected });
                }}
              >
                {allCategories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Scope */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-2 uppercase tracking-wide">
                Scope
              </label>
              <select
                multiple
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                value={filters.scopes}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, (option) => option.value);
                  setFilters({ ...filters, scopes: selected });
                }}
              >
                {allScopes.map((scope) => (
                  <option key={scope} value={scope}>{scope}</option>
                ))}
              </select>
            </div>

            {/* Network */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-2 uppercase tracking-wide">
                Network
              </label>
              <select
                multiple
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                value={filters.networks}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, (option) => option.value);
                  setFilters({ ...filters, networks: selected });
                }}
              >
                {allNetworks.map((network) => (
                  <option key={network} value={network}>{network}</option>
                ))}
              </select>
            </div>

            {/* Region */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-2 uppercase tracking-wide">
                Region
              </label>
              <select
                multiple
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                value={filters.regions}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, (option) => option.value);
                  setFilters({ ...filters, regions: selected });
                }}
              >
                {allRegions.map((region) => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            </div>

            {/* Cluster */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-2 uppercase tracking-wide">
                Cluster
              </label>
              <select
                multiple
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                value={filters.clusters}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, (option) => option.value);
                  setFilters({ ...filters, clusters: selected });
                }}
              >
                {allClusters.map((cluster) => (
                  <option key={cluster} value={cluster}>{cluster}</option>
                ))}
              </select>
            </div>

            {/* Site */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-2 uppercase tracking-wide">
                Site
              </label>
              <select
                multiple
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                value={filters.sites}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, (option) => option.value);
                  setFilters({ ...filters, sites: selected });
                }}
              >
                {allSites.map((site) => (
                  <option key={site} value={site}>{site}</option>
                ))}
              </select>
            </div>

            {/* Cell */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-2 uppercase tracking-wide">
                Cell
              </label>
              <select
                multiple
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                value={filters.cells}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, (option) => option.value);
                  setFilters({ ...filters, cells: selected });
                }}
              >
                {allCells.map((cell) => (
                  <option key={cell} value={cell}>{cell}</option>
                ))}
              </select>
            </div>

            {/* Time Range */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-2 uppercase tracking-wide">
                From Date
              </label>
              <input
                type="date"
                value={filters.timeRange.from}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    timeRange: { ...filters.timeRange, from: e.target.value },
                  })
                }
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>

            {/* Time Range To */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-2 uppercase tracking-wide">
                To Date
              </label>
              <input
                type="date"
                value={filters.timeRange.to}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    timeRange: { ...filters.timeRange, to: e.target.value },
                  })
                }
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>

            {/* Granularity */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-2 uppercase tracking-wide">
                Granularity
              </label>
              <select
                value={filters.granularity}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    granularity: e.target.value as any,
                  })
                }
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              >
                <option value="1H">Hourly</option>
                <option value="1D">Daily</option>
                <option value="1W">Weekly</option>
                <option value="1M">Monthly</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* ===== ANALYSIS SCOPE SELECTION ===== */}
      {isGenerated && (
        <div className="bg-card border border-border rounded-lg p-4 space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground">Analysis Scope - Select Instance</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
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
                  <ChevronDown className={cn("w-4 h-4 transition-transform", openScopeDropdown === "networks" && "rotate-180")} />
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
                  <ChevronDown className={cn("w-4 h-4 transition-transform", openScopeDropdown === "regions" && "rotate-180")} />
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
                  <ChevronDown className={cn("w-4 h-4 transition-transform", openScopeDropdown === "clusters" && "rotate-180")} />
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
                  <ChevronDown className={cn("w-4 h-4 transition-transform", openScopeDropdown === "sites" && "rotate-180")} />
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
                  <ChevronDown className={cn("w-4 h-4 transition-transform", openScopeDropdown === "cells" && "rotate-180")} />
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
              Select Network, Region, Cluster, Site, or Cell in the filters to view instances here.
            </p>
          )}
        </div>
      )}

      {/* ===== KPI SELECTOR & ANALYTICS ===== */}
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
            Use the search bar and filters above to configure your KPI criteria, then click "Generate KPIs" to proceed.
          </p>
        </div>
      ) : (
        <div className="bg-card border border-dashed border-border rounded-lg p-12 text-center">
          <h3 className="text-lg font-semibold text-foreground mb-2">No KPIs Selected</h3>
          <p className="text-muted-foreground">
            Click "Add KPIs" in the panel below to select KPIs for your analysis.
          </p>
        </div>
      )}
    </div>
  );
}
