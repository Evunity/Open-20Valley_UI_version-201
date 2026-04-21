import React, { useState, useEffect } from 'react';
import { Activity, TrendingUp, CheckCircle, Clock, AlertCircle, Zap, XCircle, ShieldCheck } from 'lucide-react';
import {
  AutomationMetrics,
  LiveAutonomyEvent,
  generateMockAutomationMetrics,
  generateMockLiveEvents
} from '../utils/automationData';

export const AutomationCommandCenter: React.FC = () => {
  const [metrics, setMetrics] = useState<AutomationMetrics>(generateMockAutomationMetrics());
  const [liveEvents, setLiveEvents] = useState<LiveAutonomyEvent[]>(generateMockLiveEvents(8));
  const [isPaused, setIsPaused] = useState(false);
  const [selectedLiveEvent, setSelectedLiveEvent] = useState<LiveAutonomyEvent | null>(null);

  // Simulate live updates - slower (10 seconds instead of 4)
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setLiveEvents(prev => {
        const newEvent = generateMockLiveEvents(1)[0];
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

      {/* Live Autonomy Feed */}
      <div className="bg-card rounded-lg border border-border p-4 shadow-sm flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500 animate-pulse" />
            Live Autonomy Feed
          </h3>
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="px-2 py-1 text-xs bg-muted text-foreground rounded hover:bg-muted/80 transition border border-border"
          >
            {isPaused ? 'Resume' : 'Pause'}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
          {liveEvents.map((event) => (
            <div
              key={event.id}
              onClick={() => setSelectedLiveEvent(event)}
              className={`p-3 rounded-lg border-l-4 ${
                event.status === 'success'
                  ? 'surface-success border-l-[hsl(var(--success))]'
                  : event.status === 'pending'
                  ? 'surface-warning border-l-[hsl(var(--warning))]'
                  : 'surface-destructive border-l-[hsl(var(--destructive))]'
              } hover:shadow-sm cursor-pointer transition`}
            >
              <div className="flex items-start gap-2">
                <Activity className="w-4 h-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground">{event.action}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {event.scope} • {event.impact}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full flex-shrink-0 ${
                    event.status === 'success'
                      ? 'surface-success border'
                      : event.status === 'pending'
                      ? 'surface-warning border'
                      : 'surface-destructive border'
                  }`}
                >
                  {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                </span>
              </div>
              <p className="mt-2 text-[10px] text-muted-foreground">
                Click for event inspector
              </p>
            </div>
          ))}
        </div>
      </div>

      {selectedLiveEvent && (
        <div className="fixed inset-0 z-50 flex">
          <button
            className="flex-1 bg-black/40"
            onClick={() => setSelectedLiveEvent(null)}
            aria-label="Close event inspector backdrop"
          />
          <div className="w-full max-w-2xl h-full bg-card border-l border-border shadow-2xl overflow-y-auto">
            <div className="sticky top-0 bg-card/95 backdrop-blur border-b border-border p-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs text-muted-foreground">Live Autonomy Event Inspector</p>
                <h3 className="text-lg font-bold text-foreground">{selectedLiveEvent.action}</h3>
                <p className="text-xs text-muted-foreground mt-1">{selectedLiveEvent.scope} • {selectedLiveEvent.category}</p>
              </div>
              <button onClick={() => setSelectedLiveEvent(null)} className="text-muted-foreground hover:text-foreground">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4 text-sm">
              <section className="rounded-lg border border-border p-3 space-y-2">
                <h4 className="font-semibold text-foreground">Event Summary</h4>
                <p className="text-muted-foreground">{selectedLiveEvent.explanation}</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <p><span className="text-muted-foreground">Status:</span> {selectedLiveEvent.status}</p>
                  <p><span className="text-muted-foreground">Severity:</span> {selectedLiveEvent.impactDetails.severity}</p>
                  <p><span className="text-muted-foreground">Trigger Time:</span> {new Date(selectedLiveEvent.triggerTime).toLocaleTimeString()}</p>
                  <p><span className="text-muted-foreground">Started:</span> {new Date(selectedLiveEvent.startedAt).toLocaleTimeString()}</p>
                  <p><span className="text-muted-foreground">Ended:</span> {selectedLiveEvent.endedAt ? new Date(selectedLiveEvent.endedAt).toLocaleTimeString() : `In progress (${selectedLiveEvent.progress || 0}%)`}</p>
                </div>
              </section>

              <section className="rounded-lg border border-border p-3 space-y-2">
                <h4 className="font-semibold text-foreground">Trigger / Cause</h4>
                <p className="text-muted-foreground">{selectedLiveEvent.triggerReason}</p>
              </section>

              <section className="rounded-lg border border-border p-3 space-y-2">
                <h4 className="font-semibold text-foreground">Action Taken & Decision Logic</h4>
                <p className="text-muted-foreground">{selectedLiveEvent.actionTaken}</p>
                <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                  {selectedLiveEvent.decisionPath.map((step, idx) => <li key={idx}>{step}</li>)}
                </ul>
              </section>

              <section className="rounded-lg border border-border p-3 space-y-2">
                <h4 className="font-semibold text-foreground">Impact & Related Entities</h4>
                <p className="text-muted-foreground">{selectedLiveEvent.impact}</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <p>Subscribers: {selectedLiveEvent.impactDetails.subscribersAffected.toLocaleString()}</p>
                  <p>Services: {selectedLiveEvent.impactDetails.servicesAffected.join(', ')}</p>
                  <p>Region/Site: {selectedLiveEvent.location.region} / {selectedLiveEvent.location.site}</p>
                  <p>Cluster/Vendor: {selectedLiveEvent.location.cluster} / {selectedLiveEvent.location.vendor}</p>
                  <p>KPI: {selectedLiveEvent.relatedEntities.kpi}</p>
                  <p>Alarm: {selectedLiveEvent.relatedEntities.alarmId}</p>
                </div>
              </section>

              <section className="rounded-lg border border-border p-3 space-y-2">
                <h4 className="font-semibold text-foreground">Outcome / Audit</h4>
                <p className="text-muted-foreground">{selectedLiveEvent.outcome}</p>
                {selectedLiveEvent.rollback && (
                  <p className="text-xs surface-warning border rounded p-2">
                    Rollback {selectedLiveEvent.rollback.status}: {selectedLiveEvent.rollback.reason}
                  </p>
                )}
                {selectedLiveEvent.failureReason && (
                  <p className="text-xs surface-destructive border rounded p-2">
                    Failure reason: {selectedLiveEvent.failureReason}
                  </p>
                )}
                <p className="text-xs text-muted-foreground flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Policy {selectedLiveEvent.audit.policyId} • Model {selectedLiveEvent.audit.modelVersion} • Runbook {selectedLiveEvent.audit.runbookId}</p>
              </section>

              <section className="rounded-lg border border-border p-3 space-y-2">
                <h4 className="font-semibold text-foreground">Timeline</h4>
                <div className="space-y-2">
                  {selectedLiveEvent.timeline.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs">
                      <span className={`mt-0.5 w-2 h-2 rounded-full ${step.state === 'done' ? 'bg-green-500' : step.state === 'running' ? 'bg-amber-500' : 'bg-red-500'}`} />
                      <div>
                        <p className="font-semibold text-foreground">{step.label} • {new Date(step.time).toLocaleTimeString()}</p>
                        <p className="text-muted-foreground">{step.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      )}

      {/* Blast Radius Info */}
      <div className="surface-info rounded-lg border p-4">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-current mt-0.5 flex-shrink-0" />
          <div className="text-xs text-current">
            <p className="font-semibold mb-1">Blast Radius Map</p>
            <p className="text-current/90">
              Click on regions in the alarm topology to see automations affecting them.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
