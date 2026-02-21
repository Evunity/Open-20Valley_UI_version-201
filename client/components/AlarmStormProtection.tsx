import React, { useState } from 'react';
import { AlertTriangle, X, BarChart3, List } from 'lucide-react';

interface AlarmStormProtectionProps {
  isStormDetected: boolean;
  alarmCountInWindow: number;
  timeWindowMinutes: number;
  onStormAnalyticsClick: () => void;
}

interface AlarmStormView {
  view: 'grouped' | 'raw';
}

export const useAlarmStormView = () => {
  const [view, setView] = useState<AlarmStormView['view']>('grouped');
  return { view, setView };
};

export const AlarmStormProtection: React.FC<AlarmStormProtectionProps & { currentView: 'grouped' | 'raw'; onViewChange: (view: 'grouped' | 'raw') => void; onDismiss: () => void }> = ({
  isStormDetected,
  alarmCountInWindow,
  timeWindowMinutes,
  onStormAnalyticsClick,
  currentView,
  onViewChange,
  onDismiss
}) => {
  if (!isStormDetected) return null;

  return (
    <div className="sticky top-0 z-40 bg-red-50 border-b-2 border-red-600 p-3 shadow-md">
      <div className="flex items-center justify-between gap-3">
        {/* Alert content */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-600 animate-pulse" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-red-900">
              🚨 Alarm Storm Detected
            </h3>
            <p className="text-xs text-red-800 mt-0.5">
              {alarmCountInWindow.toLocaleString()} alarms in last {timeWindowMinutes} minutes
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* View toggle */}
          <div className="flex gap-1 bg-red-100 rounded p-1 border border-red-300">
            <button
              onClick={() => onViewChange('grouped')}
              className={`px-2.5 py-1 text-xs font-semibold rounded transition flex items-center gap-1 ${
                currentView === 'grouped'
                  ? 'bg-red-600 text-white'
                  : 'text-red-800 hover:bg-red-50'
              }`}
            >
              <BarChart3 className="w-3 h-3" />
              Grouped
            </button>
            <button
              onClick={() => onViewChange('raw')}
              className={`px-2.5 py-1 text-xs font-semibold rounded transition flex items-center gap-1 ${
                currentView === 'raw'
                  ? 'bg-red-600 text-white'
                  : 'text-red-800 hover:bg-red-50'
              }`}
            >
              <List className="w-3 h-3" />
              Raw
            </button>
          </div>

          {/* Analytics button */}
          <button
            onClick={onStormAnalyticsClick}
            className="px-3 py-1 text-xs font-semibold bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            Analytics
          </button>

          {/* Dismiss button */}
          <button
            onClick={onDismiss}
            className="text-red-600 hover:text-red-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Additional UI adjustments message */}
      <div className="mt-2 text-xs text-red-700 border-t border-red-200 pt-2">
        ⚡ UI optimizations active: Column density reduced, animations paused, duplicate rows collapsed, root alarms prioritized
      </div>
    </div>
  );
};

// Helper function to detect alarm storm
export function detectAlarmStorm(
  alarmCount: number,
  windowMinutes: number = 3,
  threshold: number = 1000
): boolean {
  return alarmCount > threshold;
}

// Helper function to calculate alarm rate
export function calculateAlarmRate(alarmCount: number, windowMinutes: number): number {
  return Math.round(alarmCount / windowMinutes);
}
