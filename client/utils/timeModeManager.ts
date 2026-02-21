import { TimeMode } from './alarmData';

export type TimePreset = "1h" | "6h" | "24h" | "custom";

export interface TimeRange {
  startTime: Date;
  endTime: Date;
}

export interface TimeModeState {
  mode: TimeMode;
  lastRefresh: string;
  isRefreshing: boolean;
  isPaused: boolean;
  snapshotRange?: {
    start: string;
    end: string;
  };
  historicalRange?: TimeRange;
  historicalPreset?: TimePreset;
  refreshInterval: number; // in seconds
}

export interface TimeModeActions {
  setMode: (mode: TimeMode) => void;
  setRefreshing: (refreshing: boolean) => void;
  setPaused: (paused: boolean) => void;
  updateLastRefresh: () => void;
  setSnapshotRange: (start: string, end: string) => void;
  setHistoricalRange: (range: TimeRange) => void;
  setHistoricalPreset: (preset: TimePreset) => void;
  resetState: () => void;
}

// Get current time with format
export function getCurrentTimeFormatted(): string {
  return new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
}

// Format time for display
export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
}

// Format date and time
export function formatDateTime(date: Date): string {
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
}

// Time preset utilities
export function getTimePresetDates(preset: TimePreset): TimeRange | null {
  const now = new Date();
  const endTime = new Date(now);
  const startTime = new Date(now);

  switch (preset) {
    case "1h":
      startTime.setHours(startTime.getHours() - 1);
      return { startTime, endTime };
    case "6h":
      startTime.setHours(startTime.getHours() - 6);
      return { startTime, endTime };
    case "24h":
      startTime.setDate(startTime.getDate() - 1);
      return { startTime, endTime };
    default:
      return null;
  }
}

// Initialize time mode state
export function initializeTimeMode(mode: TimeMode = "live"): TimeModeState {
  const now = new Date();
  
  return {
    mode,
    lastRefresh: getCurrentTimeFormatted(),
    isRefreshing: false,
    isPaused: false,
    refreshInterval: 5, // 5-10 seconds default
    snapshotRange: mode === "snapshot" ? {
      start: formatDateTime(new Date(now.getTime() - 30 * 60000)),
      end: formatDateTime(now)
    } : undefined,
    historicalRange: mode === "historical" ? getTimePresetDates("24h") || {
      startTime: new Date(now.getTime() - 24 * 60 * 60000),
      endTime: now
    } : undefined,
    historicalPreset: mode === "historical" ? "24h" : undefined
  };
}

// Validate time mode transition
export function validateModeTransition(
  currentMode: TimeMode,
  newMode: TimeMode
): { valid: boolean; reason?: string } {
  // Any mode can transition to any other
  // But we should clear cached data and reset timers
  return { valid: true };
}

// Create mode-specific display text
export function getModeBannerText(state: TimeModeState): string {
  switch (state.mode) {
    case "live":
      return `LIVE ${state.isRefreshing ? "● Updating" : "● Ready"}`;
    case "snapshot":
      if (state.snapshotRange) {
        return `SNAPSHOT — ${state.snapshotRange.start} to ${state.snapshotRange.end}`;
      }
      return "SNAPSHOT";
    case "historical":
      if (state.historicalPreset) {
        return `HISTORICAL — Last ${state.historicalPreset.replace('h', ' hour').replace('d', ' day')}`;
      }
      return "HISTORICAL";
    default:
      return "UNKNOWN MODE";
  }
}

// Check if mode allows auto-refresh
export function isAutoRefreshAllowed(mode: TimeMode, isPaused: boolean): boolean {
  if (mode !== "live") return false;
  return !isPaused;
}

// Check if mode allows live duration increments
export function allowsLiveDurationIncrement(mode: TimeMode): boolean {
  return mode === "live";
}

// Get visual palette multiplier based on mode
export function getModeOpacityMultiplier(mode: TimeMode): number {
  switch (mode) {
    case "snapshot":
      return 0.85; // Slightly muted
    case "historical":
      return 0.9;
    case "live":
      return 1;
    default:
      return 1;
  }
}

// Check if UI should be locked (snapshot mode)
export function shouldLockUI(mode: TimeMode): boolean {
  return mode === "snapshot";
}

// Get refresh interval based on mode
export function getRefreshInterval(mode: TimeMode): number {
  switch (mode) {
    case "live":
      return 5000; // 5 seconds
    case "snapshot":
      return -1; // No refresh
    case "historical":
      return -1; // No auto refresh
    default:
      return -1;
  }
}

// Calculate duration increment for live mode
export function incrementLiveDuration(createdAt: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - createdAt.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "< 1m";
  if (diffMins < 60) return `${diffMins}m`;

  const diffHours = Math.floor(diffMins / 60);
  const remainingMins = diffMins % 60;

  if (diffHours < 24) {
    return remainingMins > 0 ? `${diffHours}h ${remainingMins}m` : `${diffHours}h`;
  }

  const diffDays = Math.floor(diffHours / 24);
  const remainingHours = diffHours % 24;

  return remainingHours > 0 ? `${diffDays}d ${remainingHours}h` : `${diffDays}d`;
}

// Time mode transition side effects
export function handleModeTransition(
  fromMode: TimeMode,
  toMode: TimeMode
): { clearCache: boolean; resetRefreshTimer: boolean; clearData: boolean } {
  return {
    clearCache: fromMode !== toMode,
    resetRefreshTimer: true,
    clearData: true
  };
}

// Validate snapshot time range
export function isValidSnapshotRange(start: string, end: string): boolean {
  try {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return startDate < endDate && !isNaN(startDate.getTime()) && !isNaN(endDate.getTime());
  } catch {
    return false;
  }
}

// Validate historical time range
export function isValidHistoricalRange(range: TimeRange): boolean {
  return range.startTime < range.endTime;
}

// Get recommended granularity for historical range
export function getRecommendedGranularity(range: TimeRange): string {
  const diffDays = Math.ceil((range.endTime.getTime() - range.startTime.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays <= 1) return "15m";
  if (diffDays <= 7) return "1h";
  return "1d";
}
