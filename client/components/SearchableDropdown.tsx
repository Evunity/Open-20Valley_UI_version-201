import { useState, useRef, useEffect } from "react";
import { ChevronDown, X, Search, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDropdownManager } from "@/hooks/useDropdownManager";

interface SearchableDropdownProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  multiSelect?: boolean;
  disabledOptions?: string[];
  searchable?: boolean;
  compact?: boolean;
  dropdownId?: string;
}

export default function SearchableDropdown({
  label,
  options,
  selected,
  onChange,
  placeholder = "Search...",
  multiSelect = true,
  disabledOptions = [],
  searchable = true,
  compact = false,
  dropdownId,
}: SearchableDropdownProps) {
  // Generate unique ID from label if not provided
  const uniqueId = dropdownId || `dropdown-${label.replace(/\s+/g, '-').toLowerCase()}`;
  const { isOpen, toggle: toggleDropdown, close: closeDropdown } = useDropdownManager(uniqueId);

  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        closeDropdown();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [closeDropdown]);

  useEffect(() => {
    setHighlightedIndex(0);
  }, [searchTerm, isOpen]);

  const toggleOption = (option: string) => {
    if (disabledOptions.includes(option)) {
      return;
    }

    if (!multiSelect) {
      // In single-select mode, allow toggle - if clicking the same option, deselect it
      if (selected.includes(option)) {
        onChange([]);
        closeDropdown();
      } else {
        onChange([option]);
        closeDropdown();
      }
      return;
    }

    if (selected.includes(option)) {
      onChange(selected.filter((item) => item !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  const removeOption = (option: string) => {
    onChange(selected.filter((item) => item !== option));
  };

  const singleSelection = selected[0];

  return (
    <div ref={dropdownRef} className="relative">
      {label && (
        <label className={cn(
          "block typo-label",
          compact ? "text-[11px] mb-1.5" : "text-xs mb-2"
        )}>
          {label}
        </label>
      )}

      <div
        onClick={toggleDropdown}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (!isOpen && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
            e.preventDefault();
            toggleDropdown();
            return;
          }
          if (e.key === "Escape") {
            closeDropdown();
            return;
          }
          if (isOpen && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
            e.preventDefault();
            setHighlightedIndex((prev) => {
              if (filteredOptions.length === 0) return 0;
              if (e.key === "ArrowDown") return (prev + 1) % filteredOptions.length;
              return prev <= 0 ? filteredOptions.length - 1 : prev - 1;
            });
            return;
          }
          if (isOpen && e.key === "Enter" && filteredOptions[highlightedIndex]) {
            e.preventDefault();
            toggleOption(filteredOptions[highlightedIndex]);
            return;
          }
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggleDropdown();
          }
        }}
        className={cn(
          "w-full border transition-all flex items-center justify-between cursor-pointer relative overflow-hidden",
          compact ? "h-9 px-3 rounded-xl" : "control-height px-3 rounded-xl",
          isOpen
            ? "border-primary bg-primary/5 ring-1 ring-primary/30 ring-offset-0"
            : "border-border bg-background hover:border-primary/50"
        )}
      >

        <div className="flex items-center gap-1.5 min-w-0 flex-1 overflow-hidden pr-1">
          {multiSelect ? (
            selected.length > 0 ? (
              <div className="flex items-center gap-1.5 min-w-0 max-w-full flex-nowrap overflow-hidden">
                {selected.slice(0, 1).map((item) => (
                  <div
                    key={item}
                    className="inline-flex items-center gap-1 h-6 px-2 rounded-full border border-primary/25 bg-primary/10 text-primary text-[11px] font-semibold min-w-0 max-w-[130px] sm:max-w-[180px] flex-shrink"
                  >
                    <span className="truncate min-w-0 leading-none">{item}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeOption(item);
                      }}
                      className="hover:opacity-80 transition-opacity flex-shrink-0 w-4 h-4 inline-flex items-center justify-center rounded-full hover:bg-primary/15"
                      type="button"
                      aria-label={`Remove ${item}`}
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                ))}
                {selected.length > 1 && (
                  <span className="inline-flex items-center h-6 px-2 rounded-full border border-border/80 bg-muted/70 text-[11px] font-semibold text-muted-foreground whitespace-nowrap flex-shrink-0">
                    +{selected.length - 1}
                  </span>
                )}
              </div>
            ) : (
              <span className="typo-input text-muted-foreground truncate">Select {label.toLowerCase()}...</span>
            )
          ) : singleSelection ? (
            <span className="typo-input text-foreground truncate">{singleSelection}</span>
          ) : (
            <span className="typo-input text-muted-foreground truncate">Select {label.toLowerCase()}...</span>
          )}
        </div>

        <div className="ml-2 flex items-center gap-1">
          {selected.length > 0 && (
            <button
              type="button"
              className="inline-flex h-4 w-4 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
              onClick={(e) => {
                e.stopPropagation();
                onChange([]);
              }}
              aria-label="Clear selection"
              title="Clear selection"
            >
              <X className="h-3 w-3" />
            </button>
          )}
          <ChevronDown
            className={cn(
              "w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform",
              isOpen && "transform rotate-180"
            )}
          />
        </div>
      </div>

      {isOpen && (
        <div className={cn(
          "absolute top-full left-0 right-0 z-50 rounded-xl border border-border bg-card shadow-lg",
          compact ? "mt-1.5" : "mt-2"
        )}>
          {searchable && (
            <div className={cn("border-b border-border/50", compact ? "p-1.5" : "p-2")}>
              <div className={cn(
                "flex items-center gap-2 rounded bg-muted/30 w-full min-w-0",
                compact ? "px-2.5 py-1.5" : "px-3 py-2"
              )}>
                <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <input
                  type="text"
                  placeholder={placeholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground min-w-0 truncate"
                  onClick={(e) => e.stopPropagation()}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
                    title="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="max-h-64 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => {
                const isSelected = selected.includes(option);
                const isDisabled = disabledOptions.includes(option);

                return (
                  <button
                    key={option}
                    onClick={() => toggleOption(option)}
                    disabled={isDisabled}
                    className={cn(
                      "w-full text-left px-3 text-sm transition-colors flex items-center gap-2 rounded-md",
                      compact ? "py-2" : "py-2.5",
                      highlightedIndex === filteredOptions.indexOf(option) && "bg-muted/50",
                      isSelected
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-foreground hover:bg-muted/50",
                      isDisabled && "opacity-50 cursor-not-allowed hover:bg-transparent"
                    )}
                  >
                    {multiSelect ? (
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="w-4 h-4 rounded border-border cursor-pointer"
                        onClick={(e) => e.stopPropagation()}
                        disabled={isDisabled}
                      />
                    ) : (
                      <Check className={cn("w-4 h-4", isSelected ? "opacity-100" : "opacity-0")} />
                    )}
                    <span className="truncate">{option}</span>
                  </button>
                );
              })
            ) : (
              <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                No options found
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
