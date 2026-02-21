import type { AnalyticsFilters } from "@/components/AnalyticsFilterPanel";
import type { KPI } from "@/utils/kpiData";

export interface SavedView {
  id: string;
  name: string;
  description?: string;
  filters: AnalyticsFilters;
  kpis: string[]; // Array of KPI IDs
  scope: "Network" | "Region" | "Cluster" | "Site" | "Cell";
  createdAt: string;
  updatedAt: string;
}

const SAVED_VIEWS_STORAGE_KEY = "analytics-saved-views";

// Get all saved views from localStorage
export const getSavedViews = (): SavedView[] => {
  try {
    const data = localStorage.getItem(SAVED_VIEWS_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to load saved views:", error);
    return [];
  }
};

// Save a new view
export const saveView = (
  name: string,
  filters: AnalyticsFilters,
  kpis: KPI[],
  scope: SavedView["scope"],
  description?: string
): SavedView => {
  const views = getSavedViews();

  const newView: SavedView = {
    id: `view-${Date.now()}`,
    name,
    description,
    filters,
    kpis: kpis.map((k) => k.id),
    scope,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  views.push(newView);
  localStorage.setItem(SAVED_VIEWS_STORAGE_KEY, JSON.stringify(views));

  return newView;
};

// Update a saved view
export const updateView = (
  id: string,
  updates: Partial<Omit<SavedView, "id" | "createdAt">>
): SavedView | null => {
  const views = getSavedViews();
  const index = views.findIndex((v) => v.id === id);

  if (index === -1) return null;

  const updated = {
    ...views[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  views[index] = updated;
  localStorage.setItem(SAVED_VIEWS_STORAGE_KEY, JSON.stringify(views));

  return updated;
};

// Delete a saved view
export const deleteView = (id: string): boolean => {
  const views = getSavedViews();
  const filtered = views.filter((v) => v.id !== id);

  if (filtered.length === views.length) return false; // View not found

  localStorage.setItem(SAVED_VIEWS_STORAGE_KEY, JSON.stringify(filtered));
  return true;
};

// Get a single view by ID
export const getViewById = (id: string): SavedView | null => {
  const views = getSavedViews();
  return views.find((v) => v.id === id) || null;
};

// Search views by name
export const searchViews = (query: string): SavedView[] => {
  const views = getSavedViews();
  const lower = query.toLowerCase();
  return views.filter(
    (v) =>
      v.name.toLowerCase().includes(lower) ||
      v.description?.toLowerCase().includes(lower)
  );
};
