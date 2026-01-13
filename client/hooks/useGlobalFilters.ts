import { createContext, useContext, useState, createElement, type ReactNode } from "react";

export interface GlobalFilterState {
  vendors: string[];
  technologies: string[];
  regions: string[];
  clusters: string[];
  countries: string[];
  dateRange: { from: Date | null; to: Date | null };
  timeGranularity: "hours" | "days";
}

export interface LocationCluster {
  id: string;
  name: string;
}

export interface SavedCluster {
  id: string;
  name: string;
  vendors: string[];
  technologies: string[];
  regions: string[];
  countries: string[];
  dateRange: { from: Date | null; to: Date | null };
}

interface FilterContextType {
  filters: GlobalFilterState;
  setFilters: (filters: GlobalFilterState) => void;
  resetFilters: () => void;
  savedClusters: SavedCluster[];
  saveAsCluster: (name: string, filterState: Omit<GlobalFilterState, "clusters">) => void;
  loadCluster: (cluster: SavedCluster) => void;
  deleteCluster: (clusterId: string) => void;
  availableClusters: LocationCluster[];
  addCluster: (locationName: string) => boolean;
  removeCluster: (clusterId: string) => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

const DEFAULT_FILTERS: GlobalFilterState = {
  vendors: [],
  technologies: [],
  regions: [],
  clusters: [],
  countries: [],
  dateRange: { from: null, to: null },
  timeGranularity: "days",
};

interface FilterProviderProps {
  children: ReactNode;
}

const DEFAULT_LOCATION_CLUSTERS: LocationCluster[] = [
  { id: "cluster-default-a", name: "Cluster A" },
  { id: "cluster-default-b", name: "Cluster B" },
  { id: "cluster-default-c", name: "Cluster C" },
  { id: "cluster-default-d", name: "Cluster D" },
];

export function FilterProvider(props: FilterProviderProps) {
  const { children } = props;
  const [filters, setFilters] = useState<GlobalFilterState>(DEFAULT_FILTERS);
  const [savedClusters, setSavedClusters] = useState<SavedCluster[]>(() => {
    // Safe localStorage access only on client
    if (typeof window === "undefined" || typeof localStorage === "undefined") {
      return [];
    }
    try {
      const stored = localStorage.getItem("savedClusters");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [availableClusters, setAvailableClusters] = useState<LocationCluster[]>(() => {
    // Safe localStorage access only on client
    if (typeof window === "undefined" || typeof localStorage === "undefined") {
      return DEFAULT_LOCATION_CLUSTERS;
    }
    try {
      const stored = localStorage.getItem("customClusters");
      return stored ? JSON.parse(stored) : DEFAULT_LOCATION_CLUSTERS;
    } catch {
      return DEFAULT_LOCATION_CLUSTERS;
    }
  });

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const saveAsCluster = (name: string, filterState: Omit<GlobalFilterState, "clusters">) => {
    const newCluster: SavedCluster = {
      id: `cluster-${Date.now()}`,
      name,
      vendors: filterState.vendors,
      technologies: filterState.technologies,
      regions: filterState.regions,
      countries: filterState.countries,
      dateRange: filterState.dateRange,
    };
    const updated = [...savedClusters, newCluster];
    setSavedClusters(updated);
    localStorage.setItem("savedClusters", JSON.stringify(updated));
  };

  const loadCluster = (cluster: SavedCluster) => {
    setFilters({
      vendors: cluster.vendors,
      technologies: cluster.technologies,
      regions: cluster.regions,
      countries: cluster.countries,
      clusters: [], // Clusters filter itself is empty
      dateRange: cluster.dateRange,
      timeGranularity: "days",
    });
  };

  const deleteCluster = (clusterId: string) => {
    const updated = savedClusters.filter((c) => c.id !== clusterId);
    setSavedClusters(updated);
    localStorage.setItem("savedClusters", JSON.stringify(updated));
  };

  const addCluster = (locationName: string): boolean => {
    // Validate input
    if (!locationName.trim()) {
      return false;
    }

    // Check for duplicates (case-insensitive)
    const isDuplicate = availableClusters.some(
      (c) => c.name.toLowerCase() === locationName.toLowerCase()
    );
    if (isDuplicate) {
      return false;
    }

    const newCluster: LocationCluster = {
      id: `location-cluster-${Date.now()}`,
      name: locationName.trim(),
    };

    const updated = [...availableClusters, newCluster];
    setAvailableClusters(updated);
    localStorage.setItem("customClusters", JSON.stringify(updated));
    return true;
  };

  const removeCluster = (clusterId: string) => {
    const updated = availableClusters.filter((c) => c.id !== clusterId);
    setAvailableClusters(updated);
    localStorage.setItem("customClusters", JSON.stringify(updated));
  };

  const value: FilterContextType = {
    filters,
    setFilters,
    resetFilters,
    savedClusters,
    saveAsCluster,
    loadCluster,
    deleteCluster,
    availableClusters,
    addCluster,
    removeCluster,
  };

  return createElement(FilterContext.Provider, { value }, children);
}

export function useGlobalFilters() {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error("useGlobalFilters must be used within FilterProvider");
  }
  return context;
}
