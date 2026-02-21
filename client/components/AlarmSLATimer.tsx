import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { Alarm } from '../utils/alarmData';

interface AlarmSLATimerProps {
  alarm: Alarm;
}

export const AlarmSLATimer: React.FC<AlarmSLATimerProps> = ({ alarm }) => {
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [percentageRemaining, setPercentageRemaining] = useState(100);

  useEffect(() => {
    const updateTimer = () => {
      // SLA based on severity (example)
      const slaDurationMs = 
        alarm.severity === 'critical' ? 15 * 60 * 1000 : // 15 minutes
        alarm.severity === 'major' ? 30 * 60 * 1000 : // 30 minutes
        60 * 60 * 1000; // 60 minutes

      const assignedAt = alarm.acknowledgedAt ? new Date(alarm.acknowledgedAt) : new Date(alarm.createdAt);
      const now = new Date();
      const elapsed = now.getTime() - assignedAt.getTime();
      const remaining = Math.max(0, slaDurationMs - elapsed);

      const minutes = Math.floor(remaining / 60000);
      const seconds = Math.floor((remaining % 60000) / 1000);

      setPercentageRemaining((remaining / slaDurationMs) * 100);
      setTimeRemaining(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [alarm]);

  const isEscalationSoon = percentageRemaining < 25;
  const isEscalated = percentageRemaining <= 0;

  // Determine SLA level
  const getSLALevel = () => {
    if (alarm.severity === 'critical') return 'L4 (15 min)';
    if (alarm.severity === 'major') return 'L3 (30 min)';
    return 'L2 (60 min)';
  };

  return (
    <div className={`p-3 rounded-lg border-2 ${
      isEscalated ? 'bg-red-100 border-red-500' :
      isEscalationSoon ? 'bg-orange-100 border-orange-500' :
      'bg-green-100 border-green-500'
    }`}>
      <div className="flex items-center gap-2 mb-2">
        {isEscalated ? (
          <AlertTriangle className="w-5 h-5 text-red-600" />
        ) : (
          <Clock className="w-5 h-5 text-green-600" />
        )}
        <h4 className={`text-sm font-bold ${
          isEscalated ? 'text-red-900' :
          isEscalationSoon ? 'text-orange-900' :
          'text-green-900'
        }`}>
          {alarm.acknowledged ? 'SLA Timer' : 'Escalation Timer'}
        </h4>
      </div>

      {/* Timer display */}
      <div className={`text-3xl font-bold font-mono mb-2 ${
        isEscalated ? 'text-red-800' :
        isEscalationSoon ? 'text-orange-800' :
        'text-green-800'
      }`}>
        {timeRemaining}
      </div>

      {/* Progress bar */}
      <div className="w-full bg-white bg-opacity-50 rounded h-3 overflow-hidden mb-2">
        <div
          className={`h-full transition-all ${
            isEscalated ? 'bg-red-600' :
            isEscalationSoon ? 'bg-orange-600' :
            'bg-green-600'
          }`}
          style={{ width: `${percentageRemaining}%` }}
        />
      </div>

      {/* SLA level and status */}
      <div className="text-xs space-y-1">
        <div className="flex justify-between">
          <span className="opacity-75">SLA Level:</span>
          <span className="font-semibold">{getSLALevel()}</span>
        </div>
        <div className="flex justify-between">
          <span className="opacity-75">Status:</span>
          <span className="font-semibold">
            {isEscalated ? (
              <span className="text-red-700">⚠️ Escalated</span>
            ) : isEscalationSoon ? (
              <span className="text-orange-700">⏰ Escalates Soon</span>
            ) : (
              <span className="text-green-700">✓ On Track</span>
            )}
          </span>
        </div>
      </div>

      {/* Escalation info */}
      {alarm.escalationLevel && (
        <div className="mt-3 pt-3 border-t border-opacity-30 border-current">
          <p className="text-xs font-semibold mb-1">Escalation Level:</p>
          <span className={`px-2 py-1 text-xs font-bold rounded ${
            alarm.escalationLevel === 'L4' ? 'bg-red-200 text-red-800' :
            alarm.escalationLevel === 'L3' ? 'bg-orange-200 text-orange-800' :
            alarm.escalationLevel === 'L2' ? 'bg-yellow-200 text-yellow-800' :
            'bg-blue-200 text-blue-800'
          }`}>
            {alarm.escalationLevel}
          </span>
        </div>
      )}
    </div>
  );
};

// Component to show escalation info in alarms list
export const EscalationIndicator: React.FC<{ escalationLevel?: string; isEscalationSoon: boolean }> = ({
  escalationLevel,
  isEscalationSoon
}) => {
  if (!escalationLevel) return null;

  return (
    <div className="flex items-center gap-1">
      {isEscalationSoon && <AlertTriangle className="w-3 h-3 text-orange-600" />}
      <span className={`px-2 py-1 text-xs font-semibold rounded ${
        escalationLevel === 'L4' ? 'bg-red-100 text-red-800' :
        escalationLevel === 'L3' ? 'bg-orange-100 text-orange-800' :
        escalationLevel === 'L2' ? 'bg-yellow-100 text-yellow-800' :
        'bg-blue-100 text-blue-800'
      }`}>
        {escalationLevel}
      </span>
    </div>
  );
};
