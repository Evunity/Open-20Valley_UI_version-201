import { useState, useMemo } from "react";
import { Save, Trash2, Download, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
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

  const handleGenerate = () => {
    setGeneratedTime(new Date());
    setIsGenerated(true);
  };

  const handleRegenerate = () => {
    setIsGenerated(false);
    setGeneratedTime(null);
    setSelectedKPIs([]);
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

  // Generate chart data for selected KPIs
  const chartData = useMemo(() => {
    if (selectedKPIs.length === 0) return [];

    // Generate mock data for the first selected KPI
    const kpi = selectedKPIs[0];
    const scopeLabels = SCOPE_OPTIONS[currentScope] || ["Network"];
    const label = scopeLabels[0];

    return generateKPIValues(kpi, currentScope, label);
  }, [selectedKPIs, currentScope]);

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

    // Show confirmation
    alert(`View "${newView.name}" saved successfully!`);
  };

  // Handle load view
  const handleLoadView = (view: SavedView) => {
    setFilters(view.filters);
    setCurrentScope(view.scope);

    // Restore selected KPIs
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

  return (
    <div className="space-y-6">
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
          {/* Analysis Scope Selection */}
          {isGenerated && (
            <div className="bg-card border border-border rounded-lg p-4 space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground">Analysis Scope - Select Instance</h3>

              {/* Networks */}
              {filters.networks.length > 0 && (
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-2">Networks</label>
                  <div className="flex flex-wrap gap-2">
                    {filters.networks.map((network) => (
                      <button
                        key={network}
                        className="px-3 py-2 rounded text-sm font-medium bg-muted text-foreground hover:bg-muted/80 transition-all"
                      >
                        {network}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Regions */}
              {filters.regions.length > 0 && (
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-2">Regions</label>
                  <div className="flex flex-wrap gap-2">
                    {filters.regions.map((region) => (
                      <button
                        key={region}
                        className="px-3 py-2 rounded text-sm font-medium bg-muted text-foreground hover:bg-muted/80 transition-all"
                      >
                        {region}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Clusters */}
              {filters.clusters.length > 0 && (
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-2">Clusters</label>
                  <div className="flex flex-wrap gap-2">
                    {filters.clusters.map((cluster) => (
                      <button
                        key={cluster}
                        className="px-3 py-2 rounded text-sm font-medium bg-muted text-foreground hover:bg-muted/80 transition-all"
                      >
                        {cluster}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Sites */}
              {filters.sites.length > 0 && (
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-2">Sites</label>
                  <div className="flex flex-wrap gap-2">
                    {filters.sites.map((site) => (
                      <button
                        key={site}
                        className="px-3 py-2 rounded text-sm font-medium bg-muted text-foreground hover:bg-muted/80 transition-all"
                      >
                        {site}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Cells */}
              {filters.cells.length > 0 && (
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-2">Cells</label>
                  <div className="flex flex-wrap gap-2">
                    {filters.cells.map((cell) => (
                      <button
                        key={cell}
                        className="px-3 py-2 rounded text-sm font-medium bg-muted text-foreground hover:bg-muted/80 transition-all"
                      >
                        {cell}
                      </button>
                    ))}
                  </div>
                </div>
              )}

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
              {/* Header with Regenerate Button */}
              <div className="flex items-center justify-between">
                <div>
                  {generatedTime && (
                    <p className="text-xs text-muted-foreground">
                      Generated: {generatedTime.toLocaleString()}
                    </p>
                  )}
                </div>
                <button
                  onClick={handleRegenerate}
                  className="px-3 py-2 rounded-lg border border-border bg-background hover:bg-muted transition-colors text-sm font-medium"
                >
                  ↻ Regenerate
                </button>
              </div>
              {selectedKPIs.map((kpi, idx) => (
                <TrendChartContainer
                  key={kpi.id}
                  title={`${kpi.name} (${currentScope})`}
                  data={idx === 0 ? chartData : []} // Only show chart for first KPI
                  dataKeys={["value"]}
                  exportable
                  zoomable
                  defaultChartType="line"
                />
              ))}

              {/* KPI Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {selectedKPIs.map((kpi) => (
                  <div
                    key={kpi.id}
                    className="bg-card border border-border rounded-lg p-4 space-y-2"
                  >
                    <h4 className="font-semibold text-foreground">{kpi.name}</h4>
                    <p className="text-sm text-muted-foreground">{kpi.description}</p>
                    <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-border/50">
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
                      <div className="col-span-2">
                        <span className="text-muted-foreground">Direction:</span>
                        <p className="font-medium text-foreground">
                          {kpi.direction === "higher-is-better" ? "↑ Higher is Better" : "↓ Lower is Better"}
                        </p>
                      </div>
                      {generatedTime && (
                        <div className="col-span-2">
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
