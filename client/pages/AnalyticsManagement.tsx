import { useState, useMemo, useCallback } from "react";
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

  // Handle drill down to different scope
  const handleDrillDown = (scope: SavedView["scope"]) => {
    setCurrentScope(scope);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics Management</h1>
          <p className="text-muted-foreground mt-1">
            Analyze performance trends, detect degradation, and compare across regions and vendors
          </p>
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
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar - Filters and KPIs */}
        <div className="lg:col-span-1 space-y-6">
          <AnalyticsFilterPanel filters={filters} onFiltersChange={setFilters} />
          <KPISelector
            selectedKPIs={selectedKPIs}
            onKPIsChange={setSelectedKPIs}
            filters={{
              technologies: filters.technologies,
              vendors: filters.vendors,
              domains: filters.domains,
              categories: filters.categories,
            }}
          />
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Scope Navigation */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">Analysis Scope</h3>
            <div className="flex flex-wrap gap-2">
              {(["Network", "Region", "Cluster", "Site", "Cell"] as const).map((scope) => (
                <button
                  key={scope}
                  onClick={() => handleDrillDown(scope)}
                  className={cn(
                    "px-3 py-2 rounded text-sm font-medium transition-all",
                    currentScope === scope
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground hover:bg-muted/80"
                  )}
                >
                  {scope}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Currently viewing: <span className="font-semibold">{currentScope}</span> level
            </p>
          </div>

          {/* Analytics Dashboard */}
          {selectedKPIs.length > 0 ? (
            <div className="space-y-6">
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
                      <div className="col-span-2">
                        <span className="text-muted-foreground">Direction:</span>
                        <p className="font-medium text-foreground">
                          {kpi.direction === "higher-is-better" ? "↑ Higher is Better" : "↓ Lower is Better"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-card border border-dashed border-border rounded-lg p-12 text-center">
              <h3 className="text-lg font-semibold text-foreground mb-2">No KPIs Selected</h3>
              <p className="text-muted-foreground">
                Select one or more KPIs from the left panel to begin your analysis.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
