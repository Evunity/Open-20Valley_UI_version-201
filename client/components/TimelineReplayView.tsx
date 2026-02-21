import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, ZoomIn } from 'lucide-react';

interface TimelineEvent {
  time: string;
  timestamp: number;
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

  // Mock timeline events (RCA scenario)
  const timelineEvents: TimelineEvent[] = [
    {
      time: '09:12:15',
      timestamp: 0,
      event: 'RRU 2 Power Supply Failure',
      object: 'RRU-Sector-A',
      type: 'failure',
      impact: 'Radio unit offline',
      affectedObjects: 1
    },
    {
      time: '09:12:30',
      timestamp: 15,
      event: 'Cell A Coverage Loss Detected',
      object: 'Cell-Cairo-01-A',
      type: 'degradation',
      impact: 'Coverage degradation detected',
      affectedObjects: 1
    },
    {
      time: '09:13:00',
      timestamp: 45,
      event: 'Critical Alarm Generated',
      object: 'Site-Cairo-01',
      type: 'state_change',
      impact: 'Platform-level alert triggered',
      affectedObjects: 1
    },
    {
      time: '09:13:45',
      timestamp: 90,
      event: 'Automation Triggered – RRU Restart',
      object: 'RRU-Sector-A',
      type: 'state_change',
      impact: 'Automatic recovery initiated',
      affectedObjects: 1
    },
    {
      time: '09:14:00',
      timestamp: 105,
      event: 'RRU Restart Sequence Started',
      object: 'RRU-Sector-A',
      type: 'state_change',
      impact: 'Module rebooting',
      affectedObjects: 1
    },
    {
      time: '09:14:45',
      timestamp: 150,
      event: 'RRU Back Online',
      object: 'RRU-Sector-A',
      type: 'recovery',
      impact: 'Radio unit operational',
      affectedObjects: 1
    },
    {
      time: '09:15:00',
      timestamp: 165,
      event: 'Cell A Coverage Restored',
      object: 'Cell-Cairo-01-A',
      type: 'recovery',
      impact: 'Full coverage restored',
      affectedObjects: 1
    },
    {
      time: '09:15:30',
      timestamp: 195,
      event: 'Network Stabilized',
      object: 'Site-Cairo-01',
      type: 'recovery',
      impact: 'All alarms cleared',
      affectedObjects: 1
    }
  ];

  const totalDuration = 195; // seconds
  const progress = (currentTime / totalDuration) * 100;

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

  const getEventIcon = (type: string) => {
    const icons = {
      'failure': '❌',
      'degradation': '⚠️',
      'recovery': '✅',
      'state_change': '🔄'
    };
    return icons[type as keyof typeof icons] || '?';
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'failure': return 'bg-red-100 border-red-300';
      case 'degradation': return 'bg-yellow-100 border-yellow-300';
      case 'recovery': return 'bg-green-100 border-green-300';
      case 'state_change': return 'bg-blue-100 border-blue-300';
      default: return 'bg-gray-100 border-gray-300';
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full h-full flex flex-col gap-4 p-4 bg-gray-50 overflow-y-auto">
      <h2 className="text-lg font-bold text-gray-900">Timeline & Replay</h2>

      {/* Playback Controls */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-3 py-2 rounded-lg font-semibold text-sm transition flex items-center gap-2 ${
              isPlaying
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4" /> Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4" /> Play
              </>
            )}
          </button>

          <button
            onClick={() => setCurrentTime(0)}
            className="px-3 py-2 rounded-lg font-semibold text-sm bg-gray-200 text-gray-700 hover:bg-gray-300 transition flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" /> Reset
          </button>

          <select
            value={playbackSpeed}
            onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
            className="px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={0.5}>0.5x</option>
            <option value={1}>1x</option>
            <option value={2}>2x</option>
            <option value={4}>4x</option>
          </select>

          <div className="ml-auto text-sm font-bold text-gray-900">
            {formatTime(currentTime)} / {formatTime(totalDuration)}
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
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />

          {/* Event Markers */}
          <div className="relative h-6 bg-gray-100 rounded border border-gray-300">
            {timelineEvents.map((event, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentTime(event.timestamp)}
                className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-white border-2 border-gray-400 hover:border-blue-600 transition"
                style={{ left: `${(event.timestamp / totalDuration) * 100}%` }}
                title={event.event}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Current Event Display */}
      {currentEvent && (
        <div className={`rounded-lg border-2 p-4 ${getEventColor(currentEvent.type)}`}>
          <div className="flex items-start gap-3">
            <span className="text-2xl">{getEventIcon(currentEvent.type)}</span>
            <div className="flex-1">
              <p className="text-sm font-bold text-gray-900">{currentEvent.event}</p>
              <p className="text-xs text-gray-700 mt-1">{currentEvent.impact}</p>
              <div className="flex gap-4 mt-2 text-xs text-gray-700">
                <span><strong>Time:</strong> {currentEvent.time}</span>
                <span><strong>Object:</strong> {currentEvent.object}</span>
                <span><strong>Affected:</strong> {currentEvent.affectedObjects} object(s)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Timeline Events List */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-bold text-gray-900 mb-3">Event Sequence (RCA)</h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {timelineEvents.map((event, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCurrentTime(event.timestamp);
                onEventSelect?.(event);
              }}
              className={`w-full text-left px-3 py-2 rounded border-l-4 transition ${
                Math.abs(currentTime - event.timestamp) < 5
                  ? 'bg-blue-50 border-l-blue-600 border-blue-200'
                  : `${getEventColor(event.type)} border-l-gray-400`
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-2 flex-1">
                  <span className="text-lg mt-0.5">{getEventIcon(event.type)}</span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-900">{event.time}</p>
                    <p className="text-xs font-semibold text-gray-900 mt-0.5">{event.event}</p>
                    <p className="text-xs text-gray-700 mt-0.5">{event.impact}</p>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Use Cases */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-xs font-semibold text-blue-900 mb-1">Use Cases:</p>
        <ul className="text-xs text-blue-800 space-y-0.5">
          <li>• <strong>Root Cause Analysis (RCA)</strong> - Understand how failures propagate</li>
          <li>• <strong>Regulatory Defense</strong> - Show recovery timeline to auditors</li>
          <li>• <strong>Automation Validation</strong> - Verify automation responses</li>
          <li>• <strong>Training</strong> - Replay outages for NOC team education</li>
        </ul>
      </div>
    </div>
  );
};
