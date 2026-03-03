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
  const [showAllActivities, setShowAllActivities] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<AutomationActivity | null>(null);

  // Simulate live updates - slower (10 seconds instead of 4)
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
    }, 10000); // Increased from 4000 to 10000 (10 seconds)

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
    <div className="w-full flex flex-col h-full gap-4 p-4 bg-gray-50 overflow-y-auto">
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
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-900">Automation Activity Timeline</h3>
          <button
            onClick={() => setShowAllActivities(true)}
            className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition"
          >
            Show All
          </button>
        </div>
        <div className="flex gap-2 pb-3 overflow-x-auto">
          {activities.slice(0, 5).map((activity, idx) => (
            <div key={activity.id} className="flex items-center gap-1 flex-shrink-0">
              <div
                onClick={() => setSelectedActivity(activity)}
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

      {/* All Activities Modal */}
      {showAllActivities && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg border border-gray-200 max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">All Automation Activities</h2>
              <button
                onClick={() => setShowAllActivities(false)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="divide-y divide-gray-200">
                {activities.map((activity) => (
                  <div
                    key={activity.id}
                    onClick={() => {
                      setSelectedActivity(activity);
                      setShowAllActivities(false);
                    }}
                    className="p-4 hover:bg-gray-50 cursor-pointer transition"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{activity.name}</h3>
                          <span className={`text-xs px-2 py-1 rounded ${
                            activity.risk === 'high' ? 'bg-red-100 text-red-800' :
                            activity.risk === 'medium' ? 'bg-amber-100 text-amber-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {activity.risk.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          <strong>Trigger:</strong> {activity.triggerEvent.description}
                        </p>
                        <div className="flex gap-3 text-xs text-gray-600">
                          <span>📍 {activity.affectedObjects.join(', ')}</span>
                          <span>⏱️ {new Date(activity.createdAt).toLocaleTimeString()}</span>
                          <span>👥 {activity.subscribersSaved.toLocaleString()} subscribers saved</span>
                        </div>
                      </div>
                      <div className="flex gap-0.5">
                        {activity.stages.map((stage, idx) => (
                          <div
                            key={idx}
                            className={`w-2 h-8 rounded ${
                              stage.status === 'success'
                                ? 'bg-green-500'
                                : stage.status === 'pending'
                                ? 'bg-amber-500'
                                : 'bg-red-500'
                            }`}
                            title={`${stage.stage}: ${stage.status}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Activity Detail Modal */}
      {selectedActivity && !showAllActivities && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg border border-gray-200 max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">{selectedActivity.name}</h2>
              <button
                onClick={() => setSelectedActivity(null)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm font-semibold text-blue-900 mb-1">Trigger Event</p>
                <p className="text-sm text-blue-800">{selectedActivity.triggerEvent.description}</p>
                {selectedActivity.triggerEvent.value && (
                  <p className="text-sm text-blue-800 mt-1">Value: <strong>{selectedActivity.triggerEvent.value}</strong></p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-1">Risk Level</p>
                  <span className={`text-sm px-2 py-1 rounded inline-block ${
                    selectedActivity.risk === 'high' ? 'bg-red-100 text-red-800' :
                    selectedActivity.risk === 'medium' ? 'bg-amber-100 text-amber-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {selectedActivity.risk.toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-1">Subscribers Saved</p>
                  <p className="text-sm font-semibold text-gray-900">{selectedActivity.subscribersSaved.toLocaleString()}</p>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-700 mb-2">Execution Stages</p>
                <div className="space-y-2">
                  {selectedActivity.stages.map((stage, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                      <div className={`w-3 h-3 rounded-full ${
                        stage.status === 'success'
                          ? 'bg-green-500'
                          : stage.status === 'pending'
                          ? 'bg-amber-500'
                          : 'bg-red-500'
                      }`} />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900 capitalize">{stage.stage}</p>
                        <p className="text-xs text-gray-600">{stage.details}</p>
                      </div>
                      <p className="text-xs text-gray-500">{new Date(stage.timestamp).toLocaleTimeString()}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-700 mb-1">Affected Objects</p>
                <div className="flex flex-wrap gap-2">
                  {selectedActivity.affectedObjects.map((obj, idx) => (
                    <span key={idx} className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                      {obj}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
