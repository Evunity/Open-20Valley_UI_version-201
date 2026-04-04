import { useState, useRef, useEffect } from "react";
import { X, Search, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { AVAILABLE_KPIS } from "@/constants/kpis";

interface SearchableKPISelectProps {
  value: string[];
  onChange: (value: string[]) => void;
  maxItems?: number;
  placeholder?: string;
}

export default function SearchableKPISelect({
  value,
  onChange,
  maxItems = 2,
  placeholder = "Search and select KPIs...",
}: SearchableKPISelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter KPIs based on search
  const filteredKPIs = AVAILABLE_KPIS.filter((kpi) =>
    kpi.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle selection
  const handleSelect = (kpiId: string) => {
    if (value.includes(kpiId)) {
      // Deselect
      onChange(value.filter((id) => id !== kpiId));
    } else if (value.length < maxItems) {
      // Select if not at max
      onChange([...value, kpiId]);
    }
  };

  // Handle remove tag
  const handleRemove = (kpiId: string) => {
    onChange(value.filter((id) => id !== kpiId));
  };

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedKPIs = AVAILABLE_KPIS.filter((kpi) => value.includes(kpi.id));
  const showInlineTriggerInput = value.length === 0;

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Selected Tags & Input */}
      <div
        className={cn(
          "w-full min-h-[2.5rem] px-2.5 py-1.5 rounded-lg border typo-input transition-colors flex items-center gap-2 cursor-text bg-card/80 dark:bg-muted/20",
          isOpen
            ? "border-primary/60 ring-1 ring-primary/35"
            : "border-border/70 hover:border-primary/35 focus-within:border-primary/55 focus-within:ring-1 focus-within:ring-primary/30"
        )}
        onClick={() => setIsOpen(true)}
      >
        <div
          className={cn(
            "flex min-w-0 items-center gap-1.5 flex-wrap content-start",
            showInlineTriggerInput ? "flex-1" : "w-full"
          )}
        >
          {selectedKPIs.map((kpi) => (
            <div
              key={kpi.id}
              className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/15 text-primary typo-badge hover:bg-primary/25 transition-colors border border-primary/25 shrink-0"
            >
              {kpi.label}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(kpi.id);
                }}
                className="hover:opacity-70 transition-opacity ml-0.5"
                title={`Remove ${kpi.label}`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          {showInlineTriggerInput && (
            <div
              className={cn(
                "flex items-center transition-all",
                "flex-1 gap-1.5 min-w-[180px]"
              )}
            >
              <Search
                className={cn(
                  "w-4 h-4 transition-colors flex-shrink-0 stroke-2",
                  isOpen ? "text-primary/90" : "text-muted-foreground"
                )}
              />
              <input
                type="text"
                className="bg-transparent outline-none typo-input font-medium h-7 flex-1 min-w-[120px] text-foreground placeholder:text-muted-foreground/75"
                placeholder={placeholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(true);
                }}
              />
            </div>
          )}
        </div>

      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 rounded-lg border border-border bg-card shadow-xl z-50 max-h-64 overflow-y-auto">
          {value.length > 0 && (
            <div className="sticky top-0 z-10 bg-card border-b border-border/60 p-2.5">
              <div className="flex items-center gap-2 px-2.5 h-9 rounded-md border border-border/60 bg-muted/20 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/25 transition-colors">
                <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <input
                  type="text"
                  className="bg-transparent outline-none typo-input flex-1 min-w-0 text-foreground placeholder:text-muted-foreground/75"
                  placeholder="Search KPIs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          )}
          {filteredKPIs.length > 0 ? (
            <div className="divide-y divide-border/50">
              {filteredKPIs.map((kpi, index) => {
                const isSelected = value.includes(kpi.id);
                const isDisabled = value.length >= maxItems && !isSelected;

                return (
                  <button
                    key={kpi.id}
                    onClick={() => handleSelect(kpi.id)}
                    className={cn(
                      "w-full px-4 py-3 text-left transition-all duration-150 flex items-start gap-3 hover:bg-muted/50",
                      isSelected && "bg-primary/5 border-l-2 border-primary",
                      isDisabled && "opacity-50 cursor-not-allowed hover:bg-card",
                      index === 0 && "rounded-t-lg",
                      index === filteredKPIs.length - 1 && "rounded-b-lg"
                    )}
                    disabled={isDisabled}
                  >
                    <div
                      className={cn(
                        "w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5",
                        isSelected
                          ? "bg-primary border-primary"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={cn("font-medium text-sm", isSelected && "text-primary")}>
                        {kpi.label}
                      </div>
                      <div className="typo-meta line-clamp-1">
                        {kpi.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">No KPIs found</div>
          )}
          {value.length >= maxItems && (
            <div className="px-4 py-2 bg-muted/30 typo-meta text-center border-t border-border">
              Max {maxItems} KPI{maxItems !== 1 ? "s" : ""} selected
            </div>
          )}
        </div>
      )}
    </div>
  );
}
