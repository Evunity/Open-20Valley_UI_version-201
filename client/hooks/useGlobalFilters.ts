import { createContext, useContext, useState, type ReactNode } from "react";

export interface GlobalFilterState {
  vendors: string[];
  technologies: string[];
  regions: string[];
  clusters: string[];
  timeRange: "24h" | "7d" | "30d";
}

interface FilterContextType {
  filters: GlobalFilterState;
  setFilters: (filters: GlobalFilterState) => void;
  resetFilters: () => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

const DEFAULT_FILTERS: GlobalFilterState = {
  vendors: [],
  technologies: [],
  regions: [],
  clusters: [],
  timeRange: "24h",
};

interface FilterProviderProps {
  children: ReactNode;
}

export function FilterProvider({ children }: FilterProviderProps) {
  const [filters, setFilters] = useState<GlobalFilterState>(DEFAULT_FILTERS);

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const value: FilterContextType = {
    filters,
    setFilters,
    resetFilters,
  };

  return (
    <FilterContext.Provider value={value}>
      {children}
    </FilterContext.Provider>
  );
}

export function useGlobalFilters() {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error("useGlobalFilters must be used within FilterProvider");
  }
  return context;
}