import { useState, useMemo } from "react";
import { Search, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { KPI, Technology, Vendor, Domain, KPICategory } from "@/utils/kpiData";
import { KPI_CATALOG, filterKPIs } from "@/utils/kpiData";

interface KPISelectorProps {
  selectedKPIs: KPI[];
  onKPIsChange: (kpis: KPI[]) => void;
  filters?: {
    technologies?: Technology[];
    vendors?: Vendor[];
    domains?: Domain[];
    categories?: KPICategory[];
  };
}

export default function KPISelector({
  selectedKPIs,
  onKPIsChange,
  filters = {},
}: KPISelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showSelector, setShowSelector] = useState(false);

  // Filter KPIs based on current filters
  const availableKPIs = useMemo(() => {
    const filtered = filterKPIs(KPI_CATALOG, filters);
    if (!searchTerm) return filtered;

    return filtered.filter(
      (kpi) =>
        kpi.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        kpi.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        kpi.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [filters, searchTerm]);

  const handleAddKPI = (kpi: KPI) => {
    if (!selectedKPIs.find((k) => k.id === kpi.id)) {
      onKPIsChange([...selectedKPIs, kpi]);
    }
  };

  const handleRemoveKPI = (kpiId: string) => {
    onKPIsChange(selectedKPIs.filter((k) => k.id !== kpiId));
  };

  const handleClearAll = () => {
    onKPIsChange([]);
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-foreground">Selected KPIs</h3>
        {selectedKPIs.length > 0 && (
          <button
            onClick={handleClearAll}
            className="text-xs px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Selected KPIs */}
      {selectedKPIs.length > 0 ? (
        <div className="space-y-2">
          {selectedKPIs.map((kpi) => (
            <div
              key={kpi.id}
              className="flex items-center justify-between p-3 rounded border border-border/50 bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-foreground text-sm">{kpi.name}</h4>
                <div className="flex gap-2 mt-1 flex-wrap">
                  <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary">
                    {kpi.category}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                    {kpi.technology}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-purple-100 text-purple-700">
                    {kpi.domain}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-700">
                    {kpi.vendor}
                  </span>
                  <span className="text-xs text-muted-foreground">{kpi.unit}</span>
                </div>
              </div>
              <button
                onClick={() => handleRemoveKPI(kpi.id)}
                className="ml-2 p-1 rounded hover:bg-red-100 text-red-600 transition-colors"
                title="Remove KPI"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-4">
          No KPIs selected. Click below to add KPIs.
        </p>
      )}

      {/* Add KPI Button */}
      <button
        onClick={() => setShowSelector(!showSelector)}
        className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-dashed border-primary bg-primary/5 hover:bg-primary/10 transition-colors text-primary font-medium"
      >
        <Plus className="w-4 h-4" />
        Add KPIs
      </button>

      {/* KPI Selector Modal */}
      {showSelector && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg border border-border max-w-2xl w-full max-h-[80vh] overflow-auto">
            <div className="sticky top-0 bg-card border-b border-border p-4 space-y-4">
              <h4 className="font-bold text-foreground">Select KPIs</h4>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search KPIs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded border border-border text-sm text-foreground placeholder-muted-foreground"
                  autoFocus
                />
              </div>
            </div>

            <div className="p-4 space-y-2">
              {availableKPIs.length > 0 ? (
                availableKPIs.map((kpi) => {
                  const isSelected = selectedKPIs.find((k) => k.id === kpi.id);
                  return (
                    <button
                      key={kpi.id}
                      onClick={() => {
                        handleAddKPI(kpi);
                        if (!isSelected) {
                          // Auto-close after selection
                          setTimeout(() => setShowSelector(false), 300);
                        }
                      }}
                      className={cn(
                        "w-full text-left p-3 rounded border transition-all",
                        isSelected
                          ? "border-primary bg-primary/10"
                          : "border-border/50 bg-muted/30 hover:bg-muted/50"
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-foreground text-sm">
                            {kpi.name}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            {kpi.description}
                          </p>
                        </div>
                        {isSelected && (
                          <span className="ml-2 text-xs px-2 py-1 rounded bg-primary text-primary-foreground font-semibold">
                            Selected
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2 mt-2 flex-wrap">
                        <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary">
                          {kpi.category}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                          {kpi.technology}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded bg-purple-100 text-purple-700">
                          {kpi.domain}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-700">
                          {kpi.vendor}
                        </span>
                      </div>
                    </button>
                  );
                })
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No KPIs found matching your filters.
                </p>
              )}
            </div>

            <div className="sticky bottom-0 bg-card border-t border-border p-4 flex gap-2 justify-end">
              <button
                onClick={() => setShowSelector(false)}
                className="px-3 py-2 rounded border border-border hover:bg-muted transition-colors text-sm font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
