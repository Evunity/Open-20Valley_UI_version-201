import { useState, useEffect, useCallback } from "react";

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  // Create state variable to store buffered value
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }

    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key);
      if (item) {
        return JSON.parse(item) as T;
      }
      return initialValue;
    } catch (error) {
      console.error(`Error reading from localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        // Allow value to be a function so we have same API as useState
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        // Save state
        setStoredValue(valueToStore);
        // Save to local storage
        if (typeof window !== "undefined") {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        console.error(`Error writing to localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue];
}

// Type for widget configuration
export interface WidgetConfig {
  id: string;
  chartType: "bar" | "pie" | "line" | "histogram" | "table";
  showTooltip: boolean;
  showLegend: boolean;
  visible: boolean;
  order: number;
}

// Type for dashboard layout
export interface DashboardLayout {
  [widgetId: string]: WidgetConfig;
}

// Default widget configurations
export const DEFAULT_WIDGETS: DashboardLayout = {
  voice: {
    id: "voice",
    chartType: "bar",
    showTooltip: true,
    showLegend: true,
    visible: true,
    order: 0,
  },
  data: {
    id: "data",
    chartType: "line",
    showTooltip: true,
    showLegend: true,
    visible: true,
    order: 1,
  },
  subscribers: {
    id: "subscribers",
    chartType: "pie",
    showTooltip: true,
    showLegend: true,
    visible: true,
    order: 2,
  },
  vendors: {
    id: "vendors",
    chartType: "bar",
    showTooltip: true,
    showLegend: true,
    visible: true,
    order: 3,
  },
  aiActions: {
    id: "aiActions",
    chartType: "table",
    showTooltip: false,
    showLegend: false,
    visible: true,
    order: 4,
  },
  alarms: {
    id: "alarms",
    chartType: "line",
    showTooltip: true,
    showLegend: true,
    visible: true,
    order: 5,
  },
  failures: {
    id: "failures",
    chartType: "bar",
    showTooltip: true,
    showLegend: true,
    visible: true,
    order: 6,
  },
};
