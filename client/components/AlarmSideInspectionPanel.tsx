import React from 'react';
import { X, AlertCircle, Clock, Users, Zap, Link2 } from 'lucide-react';
import { Alarm, getSeverityIcon, getSeverityColor, getSeverityTextColor } from '../utils/alarmData';
import { formatDateTime } from '../utils/timeModeManager';

interface AlarmSideInspectionPanelProps {
  alarm: Alarm | null;
  onClose: () => void;
  onViewFullDetails?: () => void;
}

export const AlarmSideInspectionPanel: React.FC<AlarmSideInspectionPanelProps> = ({
  alarm,
  onClose,
  onViewFullDetails
}) => {
  if (!alarm) return null;

  // Calculate lifecycle status
  const createdDate = new Date(alarm.createdAt);
  const acknowledgedDate = alarm.acknowledgedAt ? new Date(alarm.acknowledgedAt) : null;
  const lifecycleStages = [
    {
      stage: 'Created',
      time: createdDate,
      icon: '📌',
      completed: true
    },
    {
      stage: 'Acknowledged',
      time: acknowledgedDate,
      icon: '✓',
      completed: !!acknowledgedDate
    },
    {
      stage: 'Resolved',
      time: null,
      icon: '🎉',
      completed: false
    }
  ];

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl border-l border-gray-300 z-30 overflow-y-auto">
      {/* Header with severity rail */}
      <div className={`flex items-center gap-3 p-4 border-b-2 ${getSeverityColor(alarm.severity)}`}>
        <span className="text-2xl">{getSeverityIcon(alarm.severity)}</span>
        <div className="flex-1">
          <h2 className={`text-sm font-bold ${getSeverityTextColor(alarm.severity)}`}>
            {alarm.severity.toUpperCase()}
          </h2>
          <p className="text-xs text-gray-600">Alarm Summary</p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Alarm Title */}
        <div>
          <h3 className="text-sm font-bold text-gray-900 mb-1">{alarm.title}</h3>
          <p className="text-xs text-gray-600">{alarm.description}</p>
        </div>

        {/* Quick Facts Grid */}
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 bg-gray-50 rounded border border-gray-200">
            <p className="text-xs text-gray-600 font-semibold">Type</p>
            <p className="text-xs text-gray-900 mt-1">{alarm.alarmType}</p>
          </div>
          <div className="p-2 bg-gray-50 rounded border border-gray-200">
            <p className="text-xs text-gray-600 font-semibold">Category</p>
            <p className="text-xs text-gray-900 mt-1">{alarm.category}</p>
          </div>
          <div className="p-2 bg-gray-50 rounded border border-gray-200">
            <p className="text-xs text-gray-600 font-semibold">Vendor</p>
            <p className="text-xs text-gray-900 mt-1">{alarm.sourceSystem}</p>
          </div>
          <div className="p-2 bg-gray-50 rounded border border-gray-200">
            <p className="text-xs text-gray-600 font-semibold">Duration</p>
            <p className="text-xs text-gray-900 mt-1">{alarm.duration}</p>
          </div>
        </div>

        {/* Object Context */}
        <div className="border-t pt-3">
          <h4 className="text-xs font-bold text-gray-900 mb-2 flex items-center gap-1">
            <Zap className="w-3 h-3" /> Object
          </h4>
          <div className="bg-blue-50 border border-blue-200 rounded p-2 mb-2">
            <p className="text-sm font-bold text-blue-900">{alarm.objectName}</p>
            <p className="text-xs text-blue-700">{alarm.objectType}</p>
          </div>
          {alarm.hierarchy.region && (
            <p className="text-xs text-gray-600">
              <span className="font-semibold">Region:</span> {alarm.hierarchy.region}
              {alarm.hierarchy.cluster && ` > ${alarm.hierarchy.cluster}`}
            </p>
          )}
        </div>

        {/* Assignment Status */}
        <div className="border-t pt-3">
          <h4 className="text-xs font-bold text-gray-900 mb-2 flex items-center gap-1">
            <Users className="w-3 h-3" /> Assignment
          </h4>
          {alarm.assignedTeam ? (
            <div className="bg-green-50 border border-green-200 rounded p-2">
              <p className="text-xs font-semibold text-green-900">{alarm.assignedTeam}</p>
              <p className="text-xs text-green-700">Assigned</p>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded p-2">
              <p className="text-xs font-semibold text-gray-900">Unassigned</p>
            </div>
          )}
          {alarm.escalationLevel && (
            <p className="text-xs text-gray-600 mt-2">
              <span className="font-semibold">Escalation:</span> {alarm.escalationLevel}
            </p>
          )}
        </div>

        {/* Lifecycle */}
        <div className="border-t pt-3">
          <h4 className="text-xs font-bold text-gray-900 mb-2 flex items-center gap-1">
            <Clock className="w-3 h-3" /> Lifecycle
          </h4>
          <div className="space-y-2">
            {lifecycleStages.map((stage, idx) => (
              <div key={stage.stage} className="flex gap-2">
                <div className="flex flex-col items-center">
                  <span className="text-lg">{stage.icon}</span>
                  {idx < lifecycleStages.length - 1 && (
                    <div className={`w-0.5 h-4 ${stage.completed ? 'bg-green-400' : 'bg-gray-300'}`} />
                  )}
                </div>
                <div className="flex-1 text-xs">
                  <p className={`font-semibold ${stage.completed ? 'text-green-900' : 'text-gray-600'}`}>
                    {stage.stage}
                  </p>
                  {stage.time && (
                    <p className="text-gray-600 text-xs">
                      {new Date(stage.time).toLocaleTimeString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Impact Section */}
        <div className="border-t pt-3">
          <h4 className="text-xs font-bold text-gray-900 mb-2 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> Impact
          </h4>
          <div className="space-y-1 text-xs">
            <p>
              <span className="font-semibold">Technologies:</span> {alarm.technologies.join(', ')}
            </p>
            <p>
              <span className="font-semibold">Severity:</span> {alarm.severity}
            </p>
            {alarm.comments.length > 0 && (
              <p>
                <span className="font-semibold">Comments:</span> {alarm.comments.length}
              </p>
            )}
          </div>
        </div>

        {/* Correlated Alarms (placeholder) */}
        <div className="border-t pt-3">
          <h4 className="text-xs font-bold text-gray-900 mb-2 flex items-center gap-1">
            <Link2 className="w-3 h-3" /> Related
          </h4>
          <p className="text-xs text-gray-600">No correlated alarms detected</p>
        </div>

        {/* View Full Details Button */}
        <button
          onClick={onViewFullDetails}
          className="w-full px-3 py-2 bg-blue-600 text-white text-xs font-semibold rounded hover:bg-blue-700 transition mt-4"
        >
          View Full Details
        </button>
      </div>
    </div>
  );
};
