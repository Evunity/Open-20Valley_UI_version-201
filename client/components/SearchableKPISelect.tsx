import { useState, useRef, useEffect } from "react";
import { ChevronDown, X, Search, Check } from "lucide-react";
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
  placeholder = "Select KPIs...",
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

  const selectedKPILabels = AVAILABLE_KPIS.filter((kpi) => value.includes(kpi.id)).map((kpi) => kpi.label);

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Selected Tags & Input */}
      <div
        className={cn(
          "w-full px-4 py-3 rounded-lg border bg-background text-sm transition-all flex items-center gap-2 flex-wrap cursor-text",
          isOpen
            ? "border-primary ring-2 ring-primary/20 shadow-md"
            : "border-border hover:border-primary/30 focus-within:ring-2 focus-within:ring-primary/50 focus-within:border-primary"
        )}
        onClick={() => setIsOpen(true)}
      >
        {selectedKPILabels.map((label) => {
          const kpiId = AVAILABLE_KPIS.find((k) => k.label === label)?.id;
          return (
            <div
              key={label}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-primary/10 text-primary text-xs font-medium hover:bg-primary/15 transition-colors"
            >
              {label}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (kpiId) handleRemove(kpiId);
                }}
                className="hover:opacity-70 transition-opacity ml-0.5"
                title="Remove KPI"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}

        {selectedKPILabels.length === 0 && (
          <span className="text-muted-foreground flex-1">{placeholder}</span>
        )}

        <div className="ml-auto flex items-center gap-2 flex-shrink-0">
          <Search className={cn(
            "w-4 h-4 transition-colors",
            isOpen ? "text-primary" : "text-muted-foreground"
          )} />
          <input
            type="text"
            className="w-32 bg-transparent outline-none text-foreground placeholder-muted-foreground text-sm"
            placeholder="Search KPIs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(true);
            }}
          />
          <ChevronDown
            className={cn(
              "w-4 h-4 text-muted-foreground transition-transform duration-200",
              isOpen ? "rotate-180 text-primary" : ""
            )}
          />
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 rounded-lg border border-border bg-card shadow-xl z-50 max-h-64 overflow-y-auto">
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
                      <div className="text-xs text-muted-foreground line-clamp-1">
                        {kpi.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              No KPIs found
            </div>
          )}
          {value.length >= maxItems && (
            <div className="px-4 py-2 bg-muted/30 text-xs text-muted-foreground text-center border-t border-border">
              Max {maxItems} KPI{maxItems !== 1 ? "s" : ""} selected
            </div>
          )}
        </div>
      )}
    </div>
  );
}
