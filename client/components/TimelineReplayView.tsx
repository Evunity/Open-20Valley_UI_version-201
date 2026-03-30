import React, { useState, useMemo } from 'react';
import { Clock, ChevronRight, AlertTriangle, TrendingUp, CheckCircle } from 'lucide-react';

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
  const [startTime, setStartTime] = useState('09:12');
  const [endTime, setEndTime] = useState('09:15');
  const [expandedEvent, setExpandedEvent] = useState<number | null>(null);

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

  // Calculate time window in seconds from HH:MM format
  const parseTimeToSeconds = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 3600 + minutes * 60;
  };

  const timeWindowStartSeconds = parseTimeToSeconds(startTime);
  const timeWindowEndSeconds = parseTimeToSeconds(endTime);

  // Filter events within selected time window
  const eventsInWindow = useMemo(() => {
    return timelineEvents.filter(event => {
      const eventSeconds = event.hour * 3600 + event.minute * 60 + event.second;
      return eventSeconds >= timeWindowStartSeconds && eventSeconds <= timeWindowEndSeconds;
    });
  }, [startTime, endTime]);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'failure':
        return <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />;
      case 'degradation':
        return <TrendingUp className="w-4 h-4 text-amber-600 dark:text-amber-400 rotate-180" />;
      case 'recovery':
        return <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />;
      case 'state_change':
        return <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
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


  return (
    <div className="w-full h-full flex flex-col p-6 bg-background overflow-y-auto">

      {/* Time Window Selection - Modern Time Range Picker */}
      <div className="mb-8 space-y-4">
        <div className="bg-card rounded-lg border border-border p-4">
          {/* Time Range Header */}
          <p className="text-sm font-semibold text-foreground mb-4">Select Time Window</p>

          {/* Time Range Inputs */}
          <div className="flex items-end gap-3">
            {/* Start Time */}
            <div className="flex-1">
              <label className="block text-xs font-semibold text-muted-foreground mb-2">From</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-input text-foreground text-sm font-mono"
              />
            </div>

            {/* Separator */}
            <div className="text-muted-foreground font-semibold">→</div>

            {/* End Time */}
            <div className="flex-1">
              <label className="block text-xs font-semibold text-muted-foreground mb-2">To</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-input text-foreground text-sm font-mono"
              />
            </div>
          </div>

          {/* Window Summary */}
          <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">
                {startTime} – {endTime}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{eventsInWindow.length} events in this window</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Duration: {Math.abs(parseInt(endTime.split(':')[0]) * 60 + parseInt(endTime.split(':')[1]) - parseInt(startTime.split(':')[0]) * 60 - parseInt(startTime.split(':')[1]))} minutes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Events Timeline */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-4">Events ({eventsInWindow.length})</h3>

        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>

          {/* Events */}
          <div className="space-y-4">
            {eventsInWindow.length > 0 ? (
              eventsInWindow.map((event, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setExpandedEvent(expandedEvent === idx ? null : idx);
                    onEventSelect?.(event);
                  }}
                  className="w-full text-left transition"
                >
                  <div className="flex gap-4">
                    {/* Timeline dot */}
                    <div className="flex flex-col items-center pt-1">
                      <div className="w-7 h-7 rounded-full bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-700 flex items-center justify-center flex-shrink-0">
                        {getEventIcon(event.type)}
                      </div>
                    </div>

                    {/* Event content */}
                    <div className="flex-1 pb-4">
                      <div className="p-3 rounded border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <p className="text-xs font-mono font-semibold text-blue-600 dark:text-blue-400">
                              {event.time}
                            </p>
                            <p className="text-sm font-semibold text-foreground mt-1">{event.event}</p>
                            <p className="text-xs text-muted-foreground mt-1">{event.impact}</p>
                          </div>
                          <div className="flex-shrink-0">
                            <ChevronRight className={`w-4 h-4 text-muted-foreground transition ${expandedEvent === idx ? 'rotate-90' : ''}`} />
                          </div>
                        </div>

                        {/* Expanded details */}
                        {expandedEvent === idx && (
                          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 space-y-2">
                            <div className="grid grid-cols-3 gap-4 text-xs">
                              <div>
                                <p className="text-muted-foreground font-semibold">Type</p>
                                <p className="text-foreground font-mono mt-0.5">{getEventTypeLabel(event.type)}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground font-semibold">Object</p>
                                <p className="text-foreground font-mono mt-0.5">{event.object}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground font-semibold">Affected</p>
                                <p className="text-foreground font-mono mt-0.5">{event.affectedObjects}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <p className="text-xs text-muted-foreground text-center py-8">No events in selected time window</p>
            )}
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800 grid grid-cols-3 gap-4">
        <div className="p-3 rounded border border-gray-200 dark:border-gray-800">
          <p className="text-xs text-muted-foreground font-semibold">Total Events</p>
          <p className="text-lg font-bold text-foreground mt-1">{timelineEvents.length}</p>
        </div>
        <div className="p-3 rounded border border-gray-200 dark:border-gray-800">
          <p className="text-xs text-muted-foreground font-semibold">In Window</p>
          <p className="text-lg font-bold text-foreground mt-1">{eventsInWindow.length}</p>
        </div>
        <div className="p-3 rounded border border-gray-200 dark:border-gray-800">
          <p className="text-xs text-muted-foreground font-semibold">Failures</p>
          <p className="text-lg font-bold text-red-600 dark:text-red-400 mt-1">
            {eventsInWindow.filter(e => e.type === 'failure').length}
          </p>
        </div>
      </div>

      {/* Info */}
      <div className="mt-6 p-3 text-xs text-muted-foreground bg-gray-50 dark:bg-gray-950/30 rounded border border-gray-200 dark:border-gray-800">
        <p><span className="font-semibold">Tip:</span> Select a time window to focus on specific operational events. Click events to view detailed information.</p>
      </div>
    </div>
  );
};
