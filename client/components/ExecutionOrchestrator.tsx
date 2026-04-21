import React, { useMemo, useState } from 'react';
import { Calendar, Play, Power, Pause, RotateCcw, Edit3, Clock, ListChecks, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type AutomationExecutionStatus = 'active' | 'running' | 'scheduled' | 'paused' | 'stopped' | 'failed';
export type AutomationRunStatus = 'success' | 'failed' | 'running' | 'cancelled' | 'timed_out';

type ScheduleType = 'interval' | 'hourly' | 'daily' | 'weekly' | 'custom';

interface AutomationSchedule {
  type: ScheduleType;
  intervalMinutes?: number;
  cronExpression?: string;
  timezone?: string;
  dailyTime?: string;
  weeklyDay?: string;
}

interface AutomationRun {
  id: string;
  automationId: string;
  startTime: string;
  endTime?: string;
  durationSeconds?: number;
  triggerType: string;
  status: AutomationRunStatus;
  initiatedBy?: string;
  resultSummary?: string;
  errorMessage?: string | null;
  exactTrigger?: string;
  stepsExecuted?: string[];
  nodeExecutionResults?: string[];
  failurePoint?: string;
  affectedObjects?: string[];
  outputSummary?: string;
}

interface AutomationRecord {
  id: string;
  name: string;
  description: string;
  executionStatus: AutomationExecutionStatus;
  frequencyLabel: string;
  schedule: AutomationSchedule;
  nextRun: string;
  lastRun: string | null;
  tasksCount: number;
  latestError?: string;
  lastRunDurationSeconds?: number;
}

const initialAutomations: AutomationRecord[] = [
  {
    id: 'auto_1',
    name: 'Cell Outage Recovery',
    description: 'Detect and recover cell outages',
    executionStatus: 'running',
    frequencyLabel: 'Every 5 minutes',
    schedule: { type: 'interval', intervalMinutes: 5, timezone: 'UTC' },
    nextRun: '2 minutes',
    lastRun: '2 minutes ago',
    tasksCount: 2,
    lastRunDurationSeconds: 41,
  },
  {
    id: 'auto_2',
    name: 'Alarm Ticket Escalation',
    description: 'Escalate unresolved alarm incidents',
    executionStatus: 'scheduled',
    frequencyLabel: 'Hourly',
    schedule: { type: 'hourly', timezone: 'UTC' },
    nextRun: '27 minutes',
    lastRun: '33 minutes ago',
    tasksCount: 3,
    lastRunDurationSeconds: 85,
  },
  {
    id: 'auto_3',
    name: 'KPI Regression Guard',
    description: 'Watch KPI thresholds and trigger rollback',
    executionStatus: 'paused',
    frequencyLabel: 'Daily 02:00',
    schedule: { type: 'daily', dailyTime: '02:00', timezone: 'UTC' },
    nextRun: 'Paused',
    lastRun: 'Yesterday',
    tasksCount: 1,
    latestError: 'Last run failed at ticket update node',
    lastRunDurationSeconds: 112,
  }
];

const initialRuns: Record<string, AutomationRun[]> = {
  auto_1: [
    {
      id: 'run_1001',
      automationId: 'auto_1',
      startTime: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      endTime: new Date(Date.now() - 9 * 60 * 1000 - 20 * 1000).toISOString(),
      durationSeconds: 40,
      triggerType: 'Scheduled Trigger',
      status: 'success',
      initiatedBy: 'system.scheduler',
      resultSummary: 'Recovered 1 cell and cleared 2 alarms',
      errorMessage: null,
      exactTrigger: 'schedule(interval:5m)',
      stepsExecuted: ['Open Site', 'Check Active Alarms', 'Execute Command Template'],
      nodeExecutionResults: ['Open Site ✅', 'Check Active Alarms ✅', 'Execute Command Template ✅'],
      affectedObjects: ['SITE_104', 'CELL_104_A'],
      outputSummary: 'Recovery complete',
    },
    {
      id: 'run_1002',
      automationId: 'auto_1',
      startTime: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      durationSeconds: 31,
      triggerType: 'Scheduled Trigger',
      status: 'running',
      initiatedBy: 'system.scheduler',
      resultSummary: 'Execution in progress',
      exactTrigger: 'schedule(interval:5m)',
      stepsExecuted: ['Open Site', 'Check Active Alarms'],
      nodeExecutionResults: ['Open Site ✅', 'Check Active Alarms ⏳'],
      affectedObjects: ['SITE_104'],
      outputSummary: 'In progress',
    }
  ],
  auto_2: [
    {
      id: 'run_2001',
      automationId: 'auto_2',
      startTime: new Date(Date.now() - 65 * 60 * 1000).toISOString(),
      endTime: new Date(Date.now() - 63 * 60 * 1000).toISOString(),
      durationSeconds: 120,
      triggerType: 'Alarm Raised Trigger',
      status: 'failed',
      initiatedBy: 'alarm.bus',
      resultSummary: 'Ticket creation failed',
      errorMessage: 'ServiceNow API timeout',
      exactTrigger: 'alarm(code=RAN_501)',
      stepsExecuted: ['Check Alarm Exists', 'Create Ticket'],
      nodeExecutionResults: ['Check Alarm Exists ✅', 'Create Ticket ❌'],
      failurePoint: 'Create Ticket',
      affectedObjects: ['SITE_220'],
      outputSummary: 'No ticket created',
    }
  ],
  auto_3: []
};

interface ExecutionOrchestratorProps {
  onEditAutomation?: (automationId: string) => void;
}

export const ExecutionOrchestrator: React.FC<ExecutionOrchestratorProps> = ({ onEditAutomation }) => {
  const [automations, setAutomations] = useState<AutomationRecord[]>(initialAutomations);
  const [runsByAutomation, setRunsByAutomation] = useState<Record<string, AutomationRun[]>>(initialRuns);
  const [activeTab, setActiveTab] = useState<'automations' | 'models'>('automations');
  const [selectedAutomationId, setSelectedAutomationId] = useState<string>(initialAutomations[0].id);
  const [scheduleEditorId, setScheduleEditorId] = useState<string | null>(null);
  const [runsViewerId, setRunsViewerId] = useState<string | null>(null);
  const [selectedRun, setSelectedRun] = useState<AutomationRun | null>(null);

  const selectedAutomation = automations.find((a) => a.id === selectedAutomationId) || null;
  const activeAutomations = automations.filter((a) => a.executionStatus !== 'stopped').length;
  const runningAutomations = automations.filter((a) => a.executionStatus === 'running').length;

  const statusClass = (status: AutomationExecutionStatus) => {
    if (status === 'running' || status === 'active') return 'bg-green-100 text-green-700';
    if (status === 'scheduled') return 'bg-blue-100 text-blue-700';
    if (status === 'paused') return 'bg-amber-100 text-amber-700';
    if (status === 'failed') return 'bg-red-100 text-red-700';
    return 'bg-gray-100 text-gray-700';
  };

  const runStatusClass = (status: AutomationRunStatus) => {
    if (status === 'success') return 'bg-green-100 text-green-700';
    if (status === 'running') return 'bg-blue-100 text-blue-700';
    if (status === 'failed') return 'bg-red-100 text-red-700';
    if (status === 'timed_out') return 'bg-amber-100 text-amber-700';
    return 'bg-gray-100 text-gray-700';
  };

  const persistState = (id: string, nextStatus: AutomationExecutionStatus, summary: string, runStatus: AutomationRunStatus, error: string | null = null) => {
    const now = new Date();
    setAutomations((prev) => prev.map((a) =>
      a.id === id ? { ...a, executionStatus: nextStatus, lastRun: now.toLocaleString(), latestError: error || undefined } : a
    ));

    const run: AutomationRun = {
      id: `run_${Date.now()}`,
      automationId: id,
      startTime: now.toISOString(),
      endTime: runStatus === 'running' ? undefined : new Date(now.getTime() + 45_000).toISOString(),
      durationSeconds: runStatus === 'running' ? undefined : 45,
      triggerType: 'Manual Trigger',
      status: runStatus,
      initiatedBy: 'operator.console',
      resultSummary: summary,
      errorMessage: error,
      exactTrigger: 'manual_start',
      stepsExecuted: ['Validate Policy', 'Execute Workflow'],
      nodeExecutionResults: ['Validate Policy ✅', runStatus === 'failed' ? 'Execute Workflow ❌' : 'Execute Workflow ✅'],
      failurePoint: runStatus === 'failed' ? 'Execute Workflow' : undefined,
      affectedObjects: ['SITE_101'],
      outputSummary: summary,
    };

    setRunsByAutomation((prev) => ({ ...prev, [id]: [run, ...(prev[id] || [])] }));
  };

  const startAutomationNow = async (id: string) => {
    persistState(id, 'running', 'Automation run started by operator', 'running');
  };
  const stopAutomation = async (id: string) => {
    if (!window.confirm('Stop this automation now?')) return;
    persistState(id, 'stopped', 'Automation stopped by operator', 'cancelled');
  };
  const pauseAutomation = async (id: string) => {
    persistState(id, 'paused', 'Automation paused by operator', 'cancelled');
  };
  const resumeAutomation = async (id: string) => {
    persistState(id, 'running', 'Automation resumed by operator', 'running');
  };
  const fetchRunHistory = async (id: string) => runsByAutomation[id] || [];
  const fetchRunDetails = async (runId: string) => Object.values(runsByAutomation).flat().find((r) => r.id === runId) || null;

  const [scheduleForm, setScheduleForm] = useState<AutomationSchedule>({ type: 'interval', intervalMinutes: 5, timezone: 'UTC' });
  const openScheduleEditor = (automation: AutomationRecord) => {
    setScheduleEditorId(automation.id);
    setScheduleForm(automation.schedule);
  };
  const saveSchedule = () => {
    if (scheduleForm.type === 'interval' && (!scheduleForm.intervalMinutes || scheduleForm.intervalMinutes < 1)) {
      alert('Interval minutes must be greater than 0.');
      return;
    }
    if (scheduleForm.type === 'custom' && !scheduleForm.cronExpression?.trim()) {
      alert('Custom schedule requires cron expression.');
      return;
    }
    setAutomations((prev) => prev.map((a) => {
      if (a.id !== scheduleEditorId) return a;
      let freq = 'Scheduled';
      if (scheduleForm.type === 'interval') freq = `Every ${scheduleForm.intervalMinutes} minutes`;
      if (scheduleForm.type === 'hourly') freq = 'Hourly';
      if (scheduleForm.type === 'daily') freq = `Daily ${scheduleForm.dailyTime || ''}`.trim();
      if (scheduleForm.type === 'weekly') freq = `Weekly ${scheduleForm.weeklyDay || ''}`.trim();
      if (scheduleForm.type === 'custom') freq = `Cron: ${scheduleForm.cronExpression}`;
      return { ...a, schedule: scheduleForm, frequencyLabel: freq, executionStatus: 'scheduled' };
    }));
    setScheduleEditorId(null);
  };

  const validActions = (automation: AutomationRecord) => {
    const status = automation.executionStatus;
    return {
      start: status === 'stopped' || status === 'scheduled' || status === 'failed' || status === 'active',
      stop: status === 'running' || status === 'active' || status === 'scheduled',
      pause: status === 'running' || status === 'active' || status === 'scheduled',
      resume: status === 'paused',
    };
  };

  const selectedRuns = useMemo(() => runsByAutomation[runsViewerId || ''] || [], [runsByAutomation, runsViewerId]);

  return (
    <div className="w-full flex flex-col h-full gap-2 p-3 bg-background overflow-y-auto">
      <div className="flex items-center justify-between border border-border rounded-lg bg-card px-3 py-2">
        <h2 className="text-sm font-bold text-foreground">Execution Orchestrator</h2>
        <div className="flex items-center gap-3">
          <p className="text-[11px] text-muted-foreground">Active Automations <span className="font-bold text-foreground">{activeAutomations}</span></p>
          <p className="text-[11px] text-muted-foreground">Running Models <span className="font-bold text-foreground">{runningAutomations}</span></p>
        </div>
      </div>

      <div className="flex gap-1.5 border-b border-border pb-1">
        <button onClick={() => setActiveTab('automations')} className={cn('h-9 px-2.5 text-[12px] font-bold rounded-lg border', activeTab === 'automations' ? 'text-primary border-primary bg-primary/10' : 'text-muted-foreground border-border')}>Automations</button>
        <button onClick={() => setActiveTab('models')} className={cn('h-9 px-2.5 text-[12px] font-bold rounded-lg border', activeTab === 'models' ? 'text-primary border-primary bg-primary/10' : 'text-muted-foreground border-border')}>AI Models</button>
      </div>

      {activeTab === 'automations' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 flex-1 overflow-hidden">
          <div className="lg:col-span-2 space-y-2 overflow-y-auto">
            {automations.map((automation) => {
              const actions = validActions(automation);
              return (
                <div key={automation.id} onClick={() => setSelectedAutomationId(automation.id)} className={cn('px-3.5 py-2.5 min-h-[72px] rounded-lg border transition cursor-pointer', selectedAutomationId === automation.id ? 'border-primary bg-primary/10' : 'border-border bg-card')}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h3 className="text-sm font-bold text-foreground">{automation.name}</h3>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{automation.frequencyLabel} • Next: {automation.nextRun} • Tasks: {automation.tasksCount} • {automation.executionStatus}</p>
                    </div>
                    <span className={cn('px-2 py-1 text-[10px] font-bold rounded-full capitalize', statusClass(automation.executionStatus))}>{automation.executionStatus}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-2 flex-wrap">
                    {actions.start && <button onClick={(e) => { e.stopPropagation(); startAutomationNow(automation.id); }} className="px-2 py-1 text-[11px] rounded border border-green-400 text-green-700 bg-green-50">Start Now</button>}
                    {actions.stop && <button onClick={(e) => { e.stopPropagation(); stopAutomation(automation.id); }} className="px-2 py-1 text-[11px] rounded border border-red-400 text-red-700 bg-red-50">Stop</button>}
                    {actions.pause && <button onClick={(e) => { e.stopPropagation(); pauseAutomation(automation.id); }} className="px-2 py-1 text-[11px] rounded border border-amber-400 text-amber-700 bg-amber-50">Pause</button>}
                    {actions.resume && <button onClick={(e) => { e.stopPropagation(); resumeAutomation(automation.id); }} className="px-2 py-1 text-[11px] rounded border border-blue-400 text-blue-700 bg-blue-50">Resume</button>}
                    <button onClick={(e) => { e.stopPropagation(); openScheduleEditor(automation); }} className="px-2 py-1 text-[11px] rounded border">Edit Schedule</button>
                    <button onClick={(e) => { e.stopPropagation(); onEditAutomation?.(automation.id); }} className="px-2 py-1 text-[11px] rounded border">Edit Automation</button>
                    <button onClick={async (e) => { e.stopPropagation(); await fetchRunHistory(automation.id); setRunsViewerId(automation.id); }} className="px-2 py-1 text-[11px] rounded border">View Runs</button>
                  </div>
                </div>
              );
            })}
          </div>

          {selectedAutomation && (
            <div className="bg-card border border-border rounded-lg p-3 flex flex-col gap-3 overflow-y-auto">
              <section>
                <p className="text-sm font-bold text-foreground">{selectedAutomation.name}</p>
                <p className="text-xs text-muted-foreground mt-1">Status: <span className="font-semibold capitalize">{selectedAutomation.executionStatus}</span></p>
                <p className="text-xs text-muted-foreground">Frequency: {selectedAutomation.frequencyLabel}</p>
                <p className="text-xs text-muted-foreground">Next Run: {selectedAutomation.nextRun}</p>
                <p className="text-xs text-muted-foreground">Last Run: {selectedAutomation.lastRun || 'Never'}</p>
              </section>

              <section>
                <p className="text-xs font-bold text-foreground mb-1">Execution Controls</p>
                <div className="flex gap-1 flex-wrap">
                  {validActions(selectedAutomation).start && <button onClick={() => startAutomationNow(selectedAutomation.id)} className="px-2 py-1 text-[11px] rounded border border-green-400 text-green-700 bg-green-50 flex items-center gap-1"><Play className="w-3 h-3" />Start Now</button>}
                  {validActions(selectedAutomation).stop && <button onClick={() => stopAutomation(selectedAutomation.id)} className="px-2 py-1 text-[11px] rounded border border-red-400 text-red-700 bg-red-50 flex items-center gap-1"><Power className="w-3 h-3" />Stop</button>}
                  {validActions(selectedAutomation).pause && <button onClick={() => pauseAutomation(selectedAutomation.id)} className="px-2 py-1 text-[11px] rounded border border-amber-400 text-amber-700 bg-amber-50 flex items-center gap-1"><Pause className="w-3 h-3" />Pause</button>}
                  {validActions(selectedAutomation).resume && <button onClick={() => resumeAutomation(selectedAutomation.id)} className="px-2 py-1 text-[11px] rounded border border-blue-400 text-blue-700 bg-blue-50 flex items-center gap-1"><RotateCcw className="w-3 h-3" />Resume</button>}
                </div>
              </section>

              <section>
                <p className="text-xs font-bold text-foreground mb-1">Schedule Controls</p>
                <button onClick={() => openScheduleEditor(selectedAutomation)} className="px-2 py-1 text-[11px] rounded border flex items-center gap-1"><Calendar className="w-3 h-3" />Edit Schedule</button>
              </section>

              <section>
                <p className="text-xs font-bold text-foreground mb-1">Automation Controls</p>
                <div className="flex gap-1 flex-wrap">
                  <button onClick={() => onEditAutomation?.(selectedAutomation.id)} className="px-2 py-1 text-[11px] rounded border flex items-center gap-1"><Edit3 className="w-3 h-3" />Edit Automation</button>
                  <button onClick={async () => { await fetchRunHistory(selectedAutomation.id); setRunsViewerId(selectedAutomation.id); }} className="px-2 py-1 text-[11px] rounded border flex items-center gap-1"><ListChecks className="w-3 h-3" />View Runs</button>
                </div>
              </section>

              <section>
                <p className="text-xs font-bold text-foreground mb-1">Recent Run Summary</p>
                <p className="text-xs text-muted-foreground">Duration: {selectedAutomation.lastRunDurationSeconds ? `${selectedAutomation.lastRunDurationSeconds}s` : 'N/A'}</p>
                {selectedAutomation.latestError && <p className="text-xs text-red-600 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{selectedAutomation.latestError}</p>}
              </section>
            </div>
          )}
        </div>
      )}

      {activeTab === 'models' && (
        <div className="text-xs text-muted-foreground p-3 border border-border rounded-lg bg-card">Model controls remain available here.</div>
      )}

      {scheduleEditorId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-lg p-4 w-full max-w-md space-y-3">
            <h3 className="text-sm font-bold text-foreground">Edit Schedule</h3>
            <select value={scheduleForm.type} onChange={(e) => setScheduleForm((prev) => ({ ...prev, type: e.target.value as ScheduleType }))} className="w-full px-2 py-1.5 border border-border rounded text-xs">
              <option value="interval">Every X minutes</option>
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="custom">Custom cron</option>
            </select>
            {scheduleForm.type === 'interval' && <input type="number" min={1} value={scheduleForm.intervalMinutes || ''} onChange={(e) => setScheduleForm((p) => ({ ...p, intervalMinutes: Number(e.target.value) }))} placeholder="Interval minutes" className="w-full px-2 py-1.5 border border-border rounded text-xs" />}
            {scheduleForm.type === 'daily' && <input type="time" value={scheduleForm.dailyTime || ''} onChange={(e) => setScheduleForm((p) => ({ ...p, dailyTime: e.target.value }))} className="w-full px-2 py-1.5 border border-border rounded text-xs" />}
            {scheduleForm.type === 'weekly' && <select value={scheduleForm.weeklyDay || 'Monday'} onChange={(e) => setScheduleForm((p) => ({ ...p, weeklyDay: e.target.value }))} className="w-full px-2 py-1.5 border border-border rounded text-xs"><option>Monday</option><option>Tuesday</option><option>Wednesday</option><option>Thursday</option><option>Friday</option><option>Saturday</option><option>Sunday</option></select>}
            {scheduleForm.type === 'custom' && <input value={scheduleForm.cronExpression || ''} onChange={(e) => setScheduleForm((p) => ({ ...p, cronExpression: e.target.value }))} placeholder="Cron expression" className="w-full px-2 py-1.5 border border-border rounded text-xs" />}
            <input value={scheduleForm.timezone || ''} onChange={(e) => setScheduleForm((p) => ({ ...p, timezone: e.target.value }))} placeholder="Timezone" className="w-full px-2 py-1.5 border border-border rounded text-xs" />
            <div className="flex justify-end gap-2">
              <button onClick={() => setScheduleEditorId(null)} className="px-3 py-1.5 text-xs border rounded">Cancel</button>
              <button onClick={saveSchedule} className="px-3 py-1.5 text-xs bg-primary text-primary-foreground rounded">Save</button>
            </div>
          </div>
        </div>
      )}

      {runsViewerId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-lg p-4 w-full max-w-6xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-foreground">Run History</h3>
              <button onClick={() => setRunsViewerId(null)} className="px-2 py-1 text-xs border rounded">Close</button>
            </div>
            <div className="overflow-auto text-xs">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-border">
                    <th className="p-2">Run ID</th><th className="p-2">Start</th><th className="p-2">End</th><th className="p-2">Duration</th><th className="p-2">Trigger</th><th className="p-2">Status</th><th className="p-2">Initiated By</th><th className="p-2">Summary</th><th className="p-2">Error</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedRuns.map((run) => (
                    <tr key={run.id} className="border-b border-border/50 hover:bg-muted/40 cursor-pointer" onClick={async () => setSelectedRun(await fetchRunDetails(run.id))}>
                      <td className="p-2">{run.id}</td>
                      <td className="p-2">{new Date(run.startTime).toLocaleString()}</td>
                      <td className="p-2">{run.endTime ? new Date(run.endTime).toLocaleString() : '-'}</td>
                      <td className="p-2">{run.durationSeconds ? `${run.durationSeconds}s` : '-'}</td>
                      <td className="p-2">{run.triggerType}</td>
                      <td className="p-2"><span className={cn('px-2 py-0.5 rounded-full text-[10px] font-semibold', runStatusClass(run.status))}>{run.status}</span></td>
                      <td className="p-2">{run.initiatedBy || '-'}</td>
                      <td className="p-2">{run.resultSummary || '-'}</td>
                      <td className="p-2 text-red-600">{run.errorMessage || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {selectedRun && (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-lg p-4 w-full max-w-2xl max-h-[80vh] overflow-y-auto space-y-2">
            <div className="flex items-center justify-between"><h3 className="text-sm font-bold">Run Details: {selectedRun.id}</h3><button onClick={() => setSelectedRun(null)} className="px-2 py-1 text-xs border rounded">Close</button></div>
            <p className="text-xs"><strong>Exact Trigger:</strong> {selectedRun.exactTrigger}</p>
            <p className="text-xs"><strong>Start:</strong> {new Date(selectedRun.startTime).toLocaleString()}</p>
            <p className="text-xs"><strong>End:</strong> {selectedRun.endTime ? new Date(selectedRun.endTime).toLocaleString() : '-'}</p>
            <p className="text-xs"><strong>Status:</strong> {selectedRun.status}</p>
            <p className="text-xs"><strong>Steps Executed:</strong> {selectedRun.stepsExecuted?.join(' → ')}</p>
            <p className="text-xs"><strong>Node Results:</strong> {selectedRun.nodeExecutionResults?.join(' | ')}</p>
            {selectedRun.failurePoint && <p className="text-xs text-red-600"><strong>Failure Point:</strong> {selectedRun.failurePoint}</p>}
            <p className="text-xs"><strong>Affected Objects:</strong> {selectedRun.affectedObjects?.join(', ')}</p>
            <p className="text-xs"><strong>Output Summary:</strong> {selectedRun.outputSummary}</p>
          </div>
        </div>
      )}
    </div>
  );
};
