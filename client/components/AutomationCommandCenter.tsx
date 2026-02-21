import React, { useState, useEffect } from 'react';
import { Activity, TrendingUp, CheckCircle, Clock, AlertCircle, Zap } from 'lucide-react';
import {
  AutomationMetrics,
  AutomationActivity,
  LiveAutonomyEvent,
  generateMockAutomationMetrics,
  generateMockAutomationActivity,
  generateMockLiveEvents,
  getStatusColor
} from '../utils/automationData';

interface AutomationCommandCenterProps {
  onActivitySelect?: (activity: AutomationActivity) => void;
}

export const AutomationCommandCenter: React.FC<AutomationCommandCenterProps> = ({ onActivitySelect }) => {
  const [metrics, setMetrics] = useState<AutomationMetrics>(generateMockAutomationMetrics());
  const [activities, setActivities] = useState<AutomationActivity[]>(generateMockAutomationActivity(15));
  const [liveEvents, setLiveEvents] = useState<LiveAutonomyEvent[]>(generateMockLiveEvents(8));
  const [isPaused, setIsPaused] = useState(false);

  // Simulate live updates
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setLiveEvents(prev => {
        const newEvent: LiveAutonomyEvent = {
          id: `event_${Date.now()}`,
          timestamp: new Date().toISOString(),
          action: [
            'AI triggered Cell Outage Recovery',
            'Restarted DU – Cluster East',
            'Failover initiated for transport link',
            'Parameter correction applied',
            'KPI threshold auto-recovery started'
          ][Math.floor(Math.random() * 5)],
          scope: ['Cluster East', 'Region North', 'Site Alexandria'][Math.floor(Math.random() * 3)],
          status: ['success', 'success', 'pending'][Math.floor(Math.random() * 3)] as any,
          impact: `Impact: ${Math.floor(Math.random() * 30000 + 1000)} subscribers`
        };
        return [newEvent, ...prev.slice(0, 7)];
      });

      setMetrics(generateMockAutomationMetrics());
    }, 4000);

    return () => clearInterval(interval);
  }, [isPaused]);

  const MetricCard = ({ label, value, unit, icon: Icon, color }: any) => (
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-3">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-gray-600 font-semibold">{label}</p>
          <p className="text-2xl font-bold text-gray-900">
            {value}<span className="text-sm text-gray-500 ml-1">{unit}</span>
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full gap-4 p-4 bg-gray-50 overflow-y-auto">
      {/* Executive Strip */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Autonomous Network Status</h2>
        <div className="grid grid-cols-4 gap-4">
          <MetricCard
            label="Resolution Rate"
            value={metrics.autonomousResolutionRate}
            unit="%"
            icon={TrendingUp}
            color="bg-emerald-500"
          />
          <MetricCard
            label="Risk Index"
            value={metrics.automationRiskIndex}
            unit="/100"
            icon={AlertCircle}
            color="bg-amber-500"
          />
          <MetricCard
            label="Closed Loop Success"
            value={metrics.closedLoopSuccess}
            unit="%"
            icon={CheckCircle}
            color="bg-blue-500"
          />
          <MetricCard
            label="MTTAR"
            value={metrics.mttar}
            unit="min"
            icon={Clock}
            color="bg-purple-500"
          />
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
        <h3 className="text-sm font-bold text-gray-900 mb-3">Automation Activity Timeline</h3>
        <div className="flex gap-2 pb-3 overflow-x-auto">
          {activities.slice(0, 5).map((activity, idx) => (
            <div key={activity.id} className="flex items-center gap-1 flex-shrink-0">
              <div
                onClick={() => onActivitySelect?.(activity)}
                className="flex flex-col items-center gap-1 p-2 bg-gray-50 rounded border border-gray-200 hover:bg-gray-100 cursor-pointer transition min-w-fit"
              >
                <div className="flex gap-0.5">
                  {activity.stages.map((stage, sIdx) => (
                    <div
                      key={sIdx}
                      className={`w-2 h-2 rounded-full ${
                        stage.status === 'success'
                          ? 'bg-green-500'
                          : stage.status === 'pending'
                          ? 'bg-amber-500'
                          : 'bg-red-500'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs font-semibold text-gray-700 text-center max-w-xs truncate">
                  {activity.name}
                </p>
              </div>
              {idx < activities.length - 1 && (
                <div className="text-gray-400">→</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Live Autonomy Feed */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500 animate-pulse" />
            Live Autonomy Feed
          </h3>
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition"
          >
            {isPaused ? 'Resume' : 'Pause'}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
          {liveEvents.map((event) => (
            <div
              key={event.id}
              className={`p-3 rounded-lg border-l-4 ${
                event.status === 'success'
                  ? 'bg-green-50 border-l-green-500'
                  : event.status === 'pending'
                  ? 'bg-amber-50 border-l-amber-500'
                  : 'bg-red-50 border-l-red-500'
              }`}
            >
              <div className="flex items-start gap-2">
                <Activity className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-600" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-900">{event.action}</p>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {event.scope} • {event.impact}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full flex-shrink-0 ${
                    event.status === 'success'
                      ? 'bg-green-100 text-green-800'
                      : event.status === 'pending'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Blast Radius Info */}
      <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-blue-900">
            <p className="font-semibold mb-1">Blast Radius Map</p>
            <p className="text-blue-800">
              Click on regions in the alarm topology to see automations affecting them. {activities.length} active automations detected.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
