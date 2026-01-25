import { useState, useRef, useEffect } from "react";
import { ChevronDown, X, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchableDropdownProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
}

export default function SearchableDropdown({
  label,
  options,
  selected,
  onChange,
  placeholder = "Search...",
}: SearchableDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter options based on search term
  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle clicking outside dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOption = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter((item) => item !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  const removeOption = (option: string) => {
    onChange(selected.filter((item) => item !== option));
  };

  return (
    <div ref={dropdownRef} className="relative">
      <label className="block text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
        {label}
      </label>

      {/* Main button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full px-3 py-2 rounded-lg border transition-all flex items-center justify-between",
          isOpen
            ? "border-primary bg-primary/5 ring-2 ring-primary/50"
            : "border-border bg-background hover:border-primary/50"
        )}
      >
        <div className="flex items-center gap-2 flex-wrap">
          {selected.length > 0 ? (
            <div className="flex items-center gap-1 flex-wrap">
              {selected.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-primary/10 text-primary text-xs font-medium"
                >
                  {item}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeOption(item);
                    }}
                    className="hover:opacity-70 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <span className="text-muted-foreground text-sm">
              Select {label.toLowerCase()}...
            </span>
          )}
        </div>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform",
            isOpen && "transform rotate-180"
          )}
        />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 rounded-lg border border-border bg-card shadow-lg z-50">
          {/* Search bar */}
          <div className="p-2 border-b border-border/50">
            <div className="flex items-center gap-2 px-3 py-2 rounded bg-muted/30">
              <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <input
                type="text"
                placeholder={placeholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground"
                onClick={(e) => e.stopPropagation()}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Options list */}
          <div className="max-h-64 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => toggleOption(option)}
                  className={cn(
                    "w-full text-left px-3 py-2.5 text-sm transition-colors flex items-center gap-2",
                    selected.includes(option)
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-foreground hover:bg-muted/50"
                  )}
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(option)}
                    onChange={() => {}}
                    className="w-4 h-4 rounded border-border cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                  />
                  {option}
                </button>
              ))
            ) : (
              <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                No options found
              </div>
            )}
          </div>

          {/* Footer with actions */}
          {selected.length > 0 && (
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
