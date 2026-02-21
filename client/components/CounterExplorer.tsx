import { useState, useMemo } from "react";
import { Search, ChevronDown, Copy, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Counter, CounterCategory } from "@/utils/counterData";
import {
  COUNTERS,
  DERIVED_COUNTERS,
  getAllCategories,
  getCountersByCategory,
  searchCounters,
} from "@/utils/counterData";

interface CounterExplorerProps {
  onCounterSelect?: (counter: Counter | typeof DERIVED_COUNTERS[0]) => void;
}

export default function CounterExplorer({ onCounterSelect }: CounterExplorerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<CounterCategory | "all">("all");
  const [activeTab, setActiveTab] = useState<"base" | "derived">("base");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const categories = getAllCategories();

  // Filter counters
  const filteredCounters = useMemo(() => {
    let results = activeTab === "base" ? COUNTERS : DERIVED_COUNTERS;

    // Filter by category
    if (selectedCategory !== "all") {
      results = results.filter((c) => c.category === selectedCategory);
    }

    // Search
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      results = results.filter(
        (c) =>
          c.name.toLowerCase().includes(lower) ||
          c.description.toLowerCase().includes(lower) ||
          c.id.toLowerCase().includes(lower)
      );
    }

    return results;
  }, [searchTerm, selectedCategory, activeTab]);

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h3 className="text-lg font-bold text-foreground mb-2">Counter Explorer</h3>
        <p className="text-sm text-muted-foreground">
          Browse and manage network counters by category. Derived counters show calculation formulas.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => {
            setActiveTab("base");
            setSearchTerm("");
          }}
          className={cn(
            "px-4 py-2 font-medium text-sm transition-colors border-b-2",
            activeTab === "base"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          Base Counters ({COUNTERS.length})
        </button>
        <button
          onClick={() => {
            setActiveTab("derived");
            setSearchTerm("");
          }}
          className={cn(
            "px-4 py-2 font-medium text-sm transition-colors border-b-2",
            activeTab === "derived"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          Derived Counters ({DERIVED_COUNTERS.length})
        </button>
      </div>

      {/* Search and Filter */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search counters by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded border border-border text-foreground placeholder-muted-foreground"
          />
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedCategory("all")}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-medium transition-colors",
              selectedCategory === "all"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-foreground hover:bg-muted/80"
            )}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium transition-colors",
                selectedCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground hover:bg-muted/80"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Counter List */}
      <div className="space-y-2 max-h-[600px] overflow-y-auto">
        {filteredCounters.length > 0 ? (
          filteredCounters.map((counter) => (
            <div
              key={counter.id}
              className="bg-card border border-border/50 rounded-lg overflow-hidden hover:border-border transition-colors"
            >
              {/* Counter Header */}
              <div
                className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() =>
                  setExpandedId(expandedId === counter.id ? null : counter.id)
                }
              >
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-foreground text-sm">{counter.name}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{counter.description}</p>
                </div>
                <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                  <span className="text-xs px-2 py-1 rounded bg-primary/10 text-primary font-medium">
                    {counter.unit}
                  </span>
                  <ChevronDown
                    className={cn(
                      "w-4 h-4 text-muted-foreground transition-transform",
                      expandedId === counter.id && "rotate-180"
                    )}
                  />
                </div>
              </div>

              {/* Expanded Details */}
              {expandedId === counter.id && (
                <div className="border-t border-border/50 px-4 py-3 bg-muted/20 space-y-2">
                  {/* Counter ID */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground">ID:</span>
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-muted px-2 py-1 rounded font-mono text-foreground">
                        {counter.id}
                      </code>
                      <button
                        onClick={() => handleCopyId(counter.id)}
                        className="p-1 rounded hover:bg-muted transition-colors"
                        title="Copy ID"
                      >
                        <Copy className={cn(
                          "w-3 h-3",
                          copiedId === counter.id ? "text-green-600" : "text-muted-foreground"
                        )} />
                      </button>
                    </div>
                  </div>

                  {/* Category */}
                  <div>
                    <span className="text-xs font-semibold text-muted-foreground">Category:</span>
                    <p className="text-xs text-foreground mt-1">{counter.category}</p>
                  </div>

                  {/* Additional Info */}
                  {counter.technology && (
                    <div>
                      <span className="text-xs font-semibold text-muted-foreground">Technology:</span>
                      <p className="text-xs text-foreground mt-1">{counter.technology}</p>
                    </div>
                  )}

                  {/* Derived Counter Formula */}
                  {"formulaTree" in counter && (
                    <div className="pt-2 border-t border-border/50">
                      <span className="text-xs font-semibold text-muted-foreground">Formula:</span>
                      <div className="bg-background p-2 rounded mt-1 font-mono text-xs text-foreground border border-border/30">
                        {counter.formula}
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  <button
                    onClick={() => onCounterSelect?.(counter)}
                    className="w-full mt-2 px-3 py-2 rounded text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    Use Counter
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Info className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No counters found matching your search.</p>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded">
        <p>
          Showing <span className="font-semibold">{filteredCounters.length}</span> of{" "}
          <span className="font-semibold">
            {activeTab === "base" ? COUNTERS.length : DERIVED_COUNTERS.length}
          </span>{" "}
          {activeTab === "base" ? "base" : "derived"} counters
        </p>
      </div>
    </div>
  );
}
