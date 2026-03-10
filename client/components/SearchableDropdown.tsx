import { useState, useRef, useEffect } from "react";
import { ChevronDown, X, Search, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchableDropdownProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  multiSelect?: boolean;
  disabledOptions?: string[];
}

export default function SearchableDropdown({
  label,
  options,
  selected,
  onChange,
  placeholder = "Search...",
  multiSelect = true,
  disabledOptions = [],
}: SearchableDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOption = (option: string) => {
    if (disabledOptions.includes(option)) {
      return;
    }

    if (!multiSelect) {
      onChange([option]);
      setIsOpen(false);
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
      <label className="block text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
        {label}
      </label>

      <div
        onClick={() => setIsOpen(!isOpen)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
        className={cn(
          "w-full h-[46px] px-3 rounded-lg border transition-all flex items-center justify-between cursor-pointer relative",
          isOpen
            ? "border-primary bg-primary/5 ring-2 ring-primary/50"
            : "border-border bg-background hover:border-primary/50"
        )}
      >
        {multiSelect && selected.length > 1 && !isOpen && (
          <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-md">
            {selected.length}
          </div>
        )}

        <div className="flex items-center gap-2 min-w-0 flex-1">
          {multiSelect ? (
            selected.length > 0 ? (
              <div className="flex items-center gap-1 min-w-0 overflow-hidden">
                {selected.map((item) => (
                  <div
                    key={item}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-primary/10 text-primary text-xs font-medium max-w-full"
                  >
                    <span className="truncate">{item}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeOption(item);
                      }}
                      className="hover:opacity-70 transition-opacity flex-shrink-0 p-0 w-3 h-3"
                      type="button"
                      aria-label={`Remove ${item}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <span className="text-muted-foreground text-sm truncate">Select {label.toLowerCase()}...</span>
            )
          ) : singleSelection ? (
            <span className="text-foreground text-sm truncate">{singleSelection}</span>
          ) : (
            <span className="text-muted-foreground text-sm truncate">Select {label.toLowerCase()}...</span>
          )}
        </div>

        <ChevronDown
          className={cn(
            "w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform",
            isOpen && "transform rotate-180"
          )}
        />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 rounded-lg border border-border bg-card shadow-lg z-50">
          <div className="p-2 border-b border-border/50">
            <div className="flex items-center gap-2 px-3 py-2 rounded bg-muted/30 w-full min-w-0">
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
                      "w-full text-left px-3 py-2.5 text-sm transition-colors flex items-center gap-2",
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

          {multiSelect && selected.length > 0 && (
            <div className="p-2 border-t border-border/50 flex gap-2">
              <button
                onClick={() => onChange([])}
                className="flex-1 px-2 py-1.5 text-xs rounded bg-muted hover:bg-muted/70 transition-all text-foreground font-medium"
              >
                Clear All
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="flex-1 px-2 py-1.5 text-xs rounded bg-primary/10 hover:bg-primary/20 transition-all text-primary font-medium"
              >
                Done
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
