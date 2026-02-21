import React, { useState } from 'react';
import { Clock, CircleDot, PauseCircle, PlayCircle, Calendar } from 'lucide-react';
import { TimeMode, TimeRange } from '../utils/timeModeManager';
import { formatTime, getTimePresetDates, getCurrentTimeFormatted } from '../utils/timeModeManager';

interface TimeModeSwitcherProps {
  currentMode: TimeMode;
  isRefreshing: boolean;
  isPaused: boolean;
  lastRefresh: string;
  onModeChange: (mode: TimeMode) => void;
  onPauseToggle: () => void;
  onSnapshotRangeChange?: (start: string, end: string) => void;
  onHistoricalRangeChange?: (range: TimeRange) => void;
  snapshotStart?: string;
  snapshotEnd?: string;
  historicalRange?: TimeRange;
}

export const TimeModeSwitcher: React.FC<TimeModeSwitcherProps> = ({
  currentMode,
  isRefreshing,
  isPaused,
  lastRefresh,
  onModeChange,
  onPauseToggle,
  onSnapshotRangeChange,
  onHistoricalRangeChange,
  snapshotStart,
  snapshotEnd,
  historicalRange
}) => {
  const [showSnapshotPicker, setShowSnapshotPicker] = useState(false);
  const [showHistoricalPicker, setShowHistoricalPicker] = useState(false);
  const [snapshotStartInput, setSnapshotStartInput] = useState(snapshotStart || '');
  const [snapshotEndInput, setSnapshotEndInput] = useState(snapshotEnd || '');
  const [historicalPreset, setHistoricalPreset] = useState<'1h' | '6h' | '24h'>('24h');

  const handleSnapshotApply = () => {
    if (snapshotStartInput && snapshotEndInput) {
      onSnapshotRangeChange?.(snapshotStartInput, snapshotEndInput);
      setShowSnapshotPicker(false);
    }
  };

  const handleHistoricalPreset = (preset: '1h' | '6h' | '24h') => {
    const range = getTimePresetDates(preset);
    if (range) {
      onHistoricalRangeChange?.(range);
      setHistoricalPreset(preset);
    }
  };

  const handleModeSwitch = (mode: TimeMode) => {
    onModeChange(mode);
    if (mode === 'snapshot') {
      setShowSnapshotPicker(true);
    } else if (mode === 'historical') {
      setShowHistoricalPicker(true);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 space-y-3">
      {/* Mode selector */}
      <div className="flex gap-2">
        <button
          onClick={() => handleModeSwitch('live')}
          className={`flex-1 px-3 py-1.5 rounded text-sm font-semibold transition flex items-center justify-center gap-1 ${
            currentMode === 'live'
              ? 'bg-green-100 text-green-800 border border-green-500'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
          }`}
        >
          <CircleDot className="w-3 h-3" />
          LIVE
        </button>
        <button
          onClick={() => handleModeSwitch('snapshot')}
          className={`flex-1 px-3 py-1.5 rounded text-sm font-semibold transition flex items-center justify-center gap-1 ${
            currentMode === 'snapshot'
              ? 'bg-blue-100 text-blue-800 border border-blue-500'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
          }`}
        >
          <Clock className="w-3 h-3" />
          SNAPSHOT
        </button>
        <button
          onClick={() => handleModeSwitch('historical')}
          className={`flex-1 px-3 py-1.5 rounded text-sm font-semibold transition flex items-center justify-center gap-1 ${
            currentMode === 'historical'
              ? 'bg-purple-100 text-purple-800 border border-purple-500'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
          }`}
        >
          <Calendar className="w-3 h-3" />
          HISTORICAL
        </button>
      </div>

      {/* Mode status and controls */}
      {currentMode === 'live' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isRefreshing ? 'bg-green-600 animate-pulse' : 'bg-green-400'}`} />
              <span className="text-sm font-semibold text-green-800">
                {isRefreshing ? '● Updating' : '● Ready'}
              </span>
            </div>
            <span className="text-xs text-green-700">
              Last updated: {lastRefresh}
            </span>
          </div>

          <button
            onClick={onPauseToggle}
            className={`w-full px-4 py-2 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
              isPaused
                ? 'bg-orange-100 text-orange-800 hover:bg-orange-200 border border-orange-300'
                : 'bg-green-100 text-green-800 hover:bg-green-200 border border-green-300'
            }`}
          >
            {isPaused ? (
              <>
                <PlayCircle className="w-4 h-4" />
                Resume Updates
              </>
            ) : (
              <>
                <PauseCircle className="w-4 h-4" />
                Pause Updates
              </>
            )}
          </button>

          {isPaused && (
            <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
              <p className="text-xs text-orange-800">
                <span className="font-semibold">Paused:</span> Updates are frozen. Resume to continue monitoring.
              </p>
            </div>
          )}
        </div>
      )}

      {currentMode === 'snapshot' && (
        <div className="space-y-3">
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm font-semibold text-blue-900 mb-2">
              SNAPSHOT — Frozen Investigation Mode
            </p>
            <p className="text-xs text-blue-800">
              No live updates. All data is locked to the selected time range.
            </p>
          </div>

          <button
            onClick={() => setShowSnapshotPicker(!showSnapshotPicker)}
            className="w-full px-4 py-2 rounded-lg font-semibold bg-blue-100 text-blue-800 hover:bg-blue-200 border border-blue-300 transition"
          >
            {showSnapshotPicker ? 'Hide' : 'Edit'} Time Range
          </button>

          {showSnapshotPicker && (
            <div className="space-y-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  From Time
                </label>
                <input
                  type="datetime-local"
                  value={snapshotStartInput}
                  onChange={(e) => setSnapshotStartInput(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  To Time
                </label>
                <input
                  type="datetime-local"
                  value={snapshotEndInput}
                  onChange={(e) => setSnapshotEndInput(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={handleSnapshotApply}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition text-sm"
              >
                Apply Time Range
              </button>
            </div>
          )}

          {snapshotStart && snapshotEnd && (
            <div className="text-xs text-gray-600 p-2 bg-gray-100 rounded border border-gray-200">
              <span className="font-semibold">Current range:</span> {snapshotStart} to {snapshotEnd}
            </div>
          )}
        </div>
      )}

      {currentMode === 'historical' && (
        <div className="space-y-3">
          <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
            <p className="text-sm font-semibold text-purple-900 mb-2">
              HISTORICAL — Postmortem Analysis
            </p>
            <p className="text-xs text-purple-800">
              Investigate past events. Select a time range using presets or custom dates.
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-700">Quick Presets:</p>
            <div className="grid grid-cols-3 gap-2">
              {['1h', '6h', '24h'].map(preset => (
                <button
                  key={preset}
                  onClick={() => handleHistoricalPreset(preset as '1h' | '6h' | '24h')}
                  className={`px-3 py-2 rounded text-xs font-semibold transition ${
                    historicalPreset === preset
                      ? 'bg-purple-600 text-white border border-purple-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                  }`}
                >
                  Last {preset}
                </button>
              ))}
            </div>
          </div>

          {historicalRange && (
            <div className="text-xs text-gray-600 p-2 bg-gray-100 rounded border border-gray-200 space-y-1">
              <div>
                <span className="font-semibold">From:</span> {historicalRange.startTime.toLocaleString()}
              </div>
              <div>
                <span className="font-semibold">To:</span> {historicalRange.endTime.toLocaleString()}
              </div>
            </div>
          )}

          <button
            onClick={() => setShowHistoricalPicker(!showHistoricalPicker)}
            className="w-full px-4 py-2 rounded-lg font-semibold bg-purple-100 text-purple-800 hover:bg-purple-200 border border-purple-300 transition text-sm"
          >
            {showHistoricalPicker ? 'Hide' : 'Custom Range'}
          </button>

          {showHistoricalPicker && (
            <div className="space-y-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  From Date
                </label>
                <input
                  type="datetime-local"
                  defaultValue={historicalRange ? historicalRange.startTime.toISOString().slice(0, 16) : ''}
                  onChange={(e) => {
                    const date = new Date(e.target.value);
                    if (historicalRange && !isNaN(date.getTime())) {
                      onHistoricalRangeChange?.({
                        ...historicalRange,
                        startTime: date
                      });
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  To Date
                </label>
                <input
                  type="datetime-local"
                  defaultValue={historicalRange ? historicalRange.endTime.toISOString().slice(0, 16) : ''}
                  onChange={(e) => {
                    const date = new Date(e.target.value);
                    if (historicalRange && !isNaN(date.getTime())) {
                      onHistoricalRangeChange?.({
                        ...historicalRange,
                        endTime: date
                      });
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
