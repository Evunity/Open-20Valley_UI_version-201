import { createContext, useContext, useState, createElement, type ReactNode } from "react";

export interface GlobalFilterState {
  vendors: string[];
  technologies: string[];
  regions: string[];
  clusters: string[];
  countries: string[];
  dateRange: { from: Date | null; to: Date | null };
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
  countries: [],
  dateRange: { from: null, to: null },
};

interface FilterProviderProps {
  children: ReactNode;
}

export function FilterProvider(props: FilterProviderProps) {
  const { children } = props;
  const [filters, setFilters] = useState<GlobalFilterState>(DEFAULT_FILTERS);

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const value: FilterContextType = {
    filters,
    setFilters,
    resetFilters,
  };

  return createElement(
    FilterContext.Provider,
    { value },
    children
  );
}

export function useGlobalFilters() {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error("useGlobalFilters must be used within FilterProvider");
  }
  return context;
}
