import React, { useState, useEffect, useMemo } from 'react';
import { Play, Pause, RotateCcw, Clock } from 'lucide-react';

interface TimelineEvent {
  time: string;
  timestamp: number;
  hour: number;
  minute: number;
  second: number;
  event: string;
  object: string;
  type: 'failure' | 'recovery' | 'degradation' | 'state_change';
  impact: string;
  affectedObjects: number;
}

interface TimelineReplayViewProps {
  onEventSelect?: (event: TimelineEvent) => void;
}

export const TimelineReplayView: React.FC<TimelineReplayViewProps> = ({ onEventSelect }) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [selectedStartHour, setSelectedStartHour] = useState(9);
  const [selectedStartMinute, setSelectedStartMinute] = useState(12);
  const [selectedEndHour, setSelectedEndHour] = useState(9);
  const [selectedEndMinute, setSelectedEndMinute] = useState(15);

  // Mock timeline events with proper timestamps
  const timelineEvents: TimelineEvent[] = [
    {
      time: '09:12:15',
      timestamp: 0,
      hour: 9,
      minute: 12,
      second: 15,
      event: 'RRU 2 Power Supply Failure',
      object: 'RRU-Sector-A',
      type: 'failure',
      impact: 'Radio unit offline',
      affectedObjects: 1
    },
    {
      time: '09:12:30',
      timestamp: 15,
      hour: 9,
      minute: 12,
      second: 30,
      event: 'Cell A Coverage Loss Detected',
      object: 'Cell-Cairo-01-A',
      type: 'degradation',
      impact: 'Coverage degradation detected',
      affectedObjects: 1
    },
    {
      time: '09:13:00',
      timestamp: 45,
      hour: 9,
      minute: 13,
      second: 0,
      event: 'Critical Alarm Generated',
      object: 'Site-Cairo-01',
      type: 'state_change',
      impact: 'Platform-level alert triggered',
      affectedObjects: 1
    },
    {
      time: '09:13:45',
      timestamp: 90,
      hour: 9,
      minute: 13,
      second: 45,
      event: 'Automation Triggered – RRU Restart',
      object: 'RRU-Sector-A',
      type: 'state_change',
      impact: 'Automatic recovery initiated',
      affectedObjects: 1
    },
    {
      time: '09:14:00',
      timestamp: 105,
      hour: 9,
      minute: 14,
      second: 0,
      event: 'RRU Restart Sequence Started',
      object: 'RRU-Sector-A',
      type: 'state_change',
      impact: 'Module rebooting',
      affectedObjects: 1
    },
    {
      time: '09:14:45',
      timestamp: 150,
      hour: 9,
      minute: 14,
      second: 45,
      event: 'RRU Back Online',
      object: 'RRU-Sector-A',
      type: 'recovery',
      impact: 'Radio unit operational',
      affectedObjects: 1
    },
    {
      time: '09:15:00',
      timestamp: 165,
      hour: 9,
      minute: 15,
      second: 0,
      event: 'Cell A Coverage Restored',
      object: 'Cell-Cairo-01-A',
      type: 'recovery',
      impact: 'Full coverage restored',
      affectedObjects: 1
    },
    {
      time: '09:15:30',
      timestamp: 195,
      hour: 9,
      minute: 15,
      second: 30,
      event: 'Network Stabilized',
      object: 'Site-Cairo-01',
      type: 'recovery',
      impact: 'All alarms cleared',
      affectedObjects: 1
    }
  ];

  const totalDuration = 195; // seconds
  const progress = (currentTime / totalDuration) * 100;

  // Calculate time window in seconds
  const timeWindowStartSeconds = selectedStartHour * 3600 + selectedStartMinute * 60;
  const timeWindowEndSeconds = selectedEndHour * 3600 + selectedEndMinute * 60;

  // Filter events within selected time window
  const eventsInWindow = useMemo(() => {
    const baseTime = timelineEvents[0].hour * 3600 + timelineEvents[0].minute * 60;
    return timelineEvents.filter(event => {
      const eventSeconds = event.hour * 3600 + event.minute * 60 + event.second;
      return eventSeconds >= timeWindowStartSeconds && eventSeconds <= timeWindowEndSeconds;
    });
  }, [selectedStartHour, selectedStartMinute, selectedEndHour, selectedEndMinute]);

  // Auto-play logic
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentTime(prev => {
        if (prev >= totalDuration) {
          setIsPlaying(false);
          return prev;
        }
        return prev + (1 * playbackSpeed);
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed]);

  const currentEvent = timelineEvents.find(e => Math.abs(e.timestamp - currentTime) < 5);

  const getEventColor = (type: string) => {
    switch (type) {
      case 'failure':
        return 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300';
      case 'degradation':
        return 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-300';
      case 'recovery':
        return 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300';
      case 'state_change':
        return 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300';
      default:
        return 'bg-gray-50 dark:bg-gray-800/30 border-gray-200 dark:border-gray-700';
    }
  };

  const getEventTypeLabel = (type: string) => {
    const labels = {
      'failure': 'Failure',
      'degradation': 'Degradation',
      'recovery': 'Recovery',
      'state_change': 'State Change'
    };
    return labels[type as keyof typeof labels] || 'Event';
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  return (
    <div className="w-full h-full flex flex-col gap-6 p-4 bg-background overflow-y-auto">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-foreground">Timeline & Replay</h2>
        <p className="text-xs text-muted-foreground mt-1">Root cause analysis with event sequencing and time-window selection</p>
      </div>

      {/* Playback Controls */}
      <div className="bg-card rounded-lg border border-border p-4 space-y-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition flex items-center gap-2 ${
              isPlaying
                ? 'bg-red-600 dark:bg-red-700 text-white hover:bg-red-700'
                : 'bg-green-600 dark:bg-green-700 text-white hover:bg-green-700'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Play
              </>
            )}
          </button>

          <button
            onClick={() => setCurrentTime(0)}
            className="px-4 py-2 rounded-lg font-semibold text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>

          <div className="flex items-center gap-2">
            <select
              value={playbackSpeed}
              onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
              className="px-3 py-2 border border-border rounded text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={0.5}>0.5x Speed</option>
              <option value={1}>1x Speed</option>
              <option value={2}>2x Speed</option>
              <option value={4}>4x Speed</option>
            </select>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="font-mono text-sm font-semibold text-foreground">
              {formatTime(currentTime)} / {formatTime(totalDuration)}
            </span>
          </div>
        </div>

        {/* Timeline Slider */}
        <div className="space-y-2">
          <input
            type="range"
            min="0"
            max={totalDuration}
            value={currentTime}
            onChange={(e) => setCurrentTime(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-300 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
          />

          {/* Event Markers */}
          <div className="relative h-8 bg-gray-100 dark:bg-gray-800 rounded border border-border flex items-center">
            {timelineEvents.map((event, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentTime(event.timestamp)}
                className={`absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 w-5 h-5 rounded-full border-2 transition ${
                  Math.abs(currentTime - event.timestamp) < 5
                    ? 'bg-blue-600 border-blue-700'
                    : 'bg-white dark:bg-gray-700 border-gray-400 dark:border-gray-600 hover:border-blue-500'
                }`}
                style={{ left: `${(event.timestamp / totalDuration) * 100}%` }}
                title={event.time}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Time Window Selection */}
      <div className="bg-card rounded-lg border border-border p-4 space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Time Window Selection</h3>

        <div className="grid grid-cols-2 gap-6">
          {/* Start Time */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-3">Start Time</p>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <label className="block text-xs text-muted-foreground mb-1">Hour</label>
                <select
                  value={selectedStartHour}
                  onChange={(e) => setSelectedStartHour(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-border rounded text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {hours.map(h => (
                    <option key={h} value={h}>
                      {h.toString().padStart(2, '0')}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-xs text-muted-foreground mb-1">Minute</label>
                <select
                  value={selectedStartMinute}
                  onChange={(e) => setSelectedStartMinute(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-border rounded text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {minutes.map(m => (
                    <option key={m} value={m}>
                      {m.toString().padStart(2, '0')}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {selectedStartHour.toString().padStart(2, '0')}:{selectedStartMinute.toString().padStart(2, '0')}:00
            </p>
          </div>

          {/* End Time */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-3">End Time</p>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <label className="block text-xs text-muted-foreground mb-1">Hour</label>
                <select
                  value={selectedEndHour}
                  onChange={(e) => setSelectedEndHour(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-border rounded text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {hours.map(h => (
                    <option key={h} value={h}>
                      {h.toString().padStart(2, '0')}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-xs text-muted-foreground mb-1">Minute</label>
                <select
                  value={selectedEndMinute}
                  onChange={(e) => setSelectedEndMinute(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-border rounded text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {minutes.map(m => (
                    <option key={m} value={m}>
                      {m.toString().padStart(2, '0')}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {selectedEndHour.toString().padStart(2, '0')}:{selectedEndMinute.toString().padStart(2, '0')}:59
            </p>
          </div>
        </div>

        {/* Window Summary */}
        <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded">
          <p className="text-sm font-semibold text-foreground mb-1">Selected Window</p>
          <p className="text-xs text-muted-foreground">
            {selectedStartHour.toString().padStart(2, '0')}:{selectedStartMinute.toString().padStart(2, '0')} to{' '}
            {selectedEndHour.toString().padStart(2, '0')}:{selectedEndMinute.toString().padStart(2, '0')}
            {' '}({eventsInWindow.length} events)
          </p>
        </div>
      </div>

      {/* Current Event Display */}
      {currentEvent && (
        <div className={`rounded-lg border p-4 ${getEventColor(currentEvent.type)}`}>
          <div className="flex items-start gap-4">
            <div className="pt-1">
              <p className="text-lg font-semibold">{getEventTypeLabel(currentEvent.type)}</p>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground">{currentEvent.event}</p>
              <p className="text-sm text-foreground mt-1">{currentEvent.impact}</p>
              <div className="grid grid-cols-3 gap-4 mt-3 text-xs text-muted-foreground">
                <div>
                  <p className="font-semibold">Time</p>
                  <p className="font-mono">{currentEvent.time}</p>
                </div>
                <div>
                  <p className="font-semibold">Object</p>
                  <p className="font-mono">{currentEvent.object}</p>
                </div>
                <div>
                  <p className="font-semibold">Affected</p>
                  <p className="font-mono">{currentEvent.affectedObjects} object(s)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtered Events List */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">
          Events in Selected Window ({eventsInWindow.length})
        </h3>
        <div className="space-y-2 max-h-72 overflow-y-auto">
          {eventsInWindow.length > 0 ? (
            eventsInWindow.map((event, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setCurrentTime(event.timestamp);
                  onEventSelect?.(event);
                }}
                className={`w-full text-left px-4 py-3 rounded-lg border-l-4 transition ${
                  Math.abs(currentTime - event.timestamp) < 5
                    ? 'bg-blue-50 dark:bg-blue-950/20 border-l-blue-600 border border-blue-300 dark:border-blue-700'
                    : `${getEventColor(event.type)} border-l-gray-400`
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-mono text-muted-foreground">{event.time}</p>
                    <p className="text-sm font-semibold text-foreground mt-0.5">{event.event}</p>
                    <p className="text-xs text-muted-foreground mt-1">{event.impact}</p>
                  </div>
                  <span className="text-xs font-semibold whitespace-nowrap flex-shrink-0">
                    {getEventTypeLabel(event.type)}
                  </span>
                </div>
              </button>
            ))
          ) : (
            <p className="text-xs text-muted-foreground text-center py-4">No events in selected time window</p>
          )}
        </div>
      </div>

      {/* Information */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-700 rounded-lg">
        <h4 className="text-sm font-semibold text-foreground mb-2">About Timeline Analysis</h4>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• Use time-window selection to focus on specific operational events</li>
          <li>• Merge related events within a time period for easier analysis</li>
          <li>• Replay events at different speeds to understand failure progression</li>
          <li>• Compare event sequences across different incidents</li>
        </ul>
      </div>
    </div>
  );
};
