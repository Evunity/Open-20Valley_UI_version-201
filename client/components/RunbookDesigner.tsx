import React, { useState } from 'react';
import {
  Plus, Trash2, Copy, Save, ArrowRight, Play, Pause, AlertCircle,
  CheckCircle, Clock, Settings, ChevronUp, ChevronDown, Code, Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';

type StepType = 'trigger' | 'action' | 'validation' | 'rollback' | 'notification' | 'decision' | 'wait' | 'api-call';

interface RunbookStep {
  id: string;
  type: StepType;
  title: string;
  description: string;
  config: Record<string, any>;
  rollbackAvailable: boolean;
  expectedRuntime: number;
  onFailure?: 'rollback' | 'continue' | 'stop';
  timeout?: number;
}

interface Runbook {
  id: string;
  name: string;
  description: string;
  steps: RunbookStep[];
  active: boolean;
  createdAt: string;
  lastModified: string;
}

const STEP_TYPES: Record<StepType, { icon: string; color: string; description: string }> = {
  trigger: { icon: '🔔', color: 'bg-blue-100 dark:bg-blue-950 border-blue-300 dark:border-blue-700', description: 'Trigger event' },
  action: { icon: '⚙️', color: 'bg-purple-100 dark:bg-purple-950 border-purple-300 dark:border-purple-700', description: 'Execute action' },
  validation: { icon: '✓', color: 'bg-green-100 dark:bg-green-950 border-green-300 dark:border-green-700', description: 'Validate result' },
  rollback: { icon: '↩️', color: 'bg-orange-100 dark:bg-orange-950 border-orange-300 dark:border-orange-700', description: 'Undo action' },
  notification: { icon: '📢', color: 'bg-pink-100 dark:bg-pink-950 border-pink-300 dark:border-pink-700', description: 'Send notification' },
  decision: { icon: '❓', color: 'bg-amber-100 dark:bg-amber-950 border-amber-300 dark:border-amber-700', description: 'Decision point' },
  wait: { icon: '⏱️', color: 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600', description: 'Wait period' },
  'api-call': { icon: '🌐', color: 'bg-cyan-100 dark:bg-cyan-950 border-cyan-300 dark:border-cyan-700', description: 'Call API' }
};

export const RunbookDesigner: React.FC<{
  onSave?: (runbook: Runbook) => void;
  onCancel?: () => void;
}> = ({ onSave, onCancel }) => {
  const [runbook, setRunbook] = useState<Runbook>({
    id: `runbook_${Date.now()}`,
    name: 'New Runbook',
    description: 'Automated response playbook',
    steps: [
      {
        id: 'step_1',
        type: 'trigger',
        title: 'Trigger',
        description: 'Listen for critical alarm',
        config: { severity: 'critical' },
        rollbackAvailable: false,
        expectedRuntime: 0
      }
    ],
    active: false,
    createdAt: new Date().toLocaleString(),
    lastModified: new Date().toLocaleString()
  });

  const [selectedStepId, setSelectedStepId] = useState<string | null>('step_1');
  const [showStepPalette, setShowStepPalette] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const selectedStep = runbook.steps.find(s => s.id === selectedStepId);

  const addStep = (type: StepType) => {
    const newStep: RunbookStep = {
      id: `step_${Date.now()}`,
      type,
      title: STEP_TYPES[type].description,
      description: '',
      config: {},
      rollbackAvailable: type === 'action',
      expectedRuntime: type === 'wait' ? 30 : 0,
      onFailure: type === 'action' ? 'rollback' : 'stop'
    };
    setRunbook(prev => ({
      ...prev,
      steps: [...prev.steps, newStep],
      lastModified: new Date().toLocaleString()
    }));
    setSelectedStepId(newStep.id);
    setShowStepPalette(false);
  };

  const deleteStep = (id: string) => {
    if (runbook.steps.length === 1) {
      alert('Runbook must have at least one step');
      return;
    }
    setRunbook(prev => ({
      ...prev,
      steps: prev.steps.filter(s => s.id !== id),
      lastModified: new Date().toLocaleString()
    }));
    if (selectedStepId === id) setSelectedStepId(runbook.steps[0]?.id || null);
  };

  const duplicateStep = (id: string) => {
    const step = runbook.steps.find(s => s.id === id);
    if (!step) return;
    const newStep = { ...step, id: `step_${Date.now()}` };
    setRunbook(prev => ({
      ...prev,
      steps: [...prev.steps, newStep],
      lastModified: new Date().toLocaleString()
    }));
  };

  const moveStep = (id: string, direction: 'up' | 'down') => {
    const index = runbook.steps.findIndex(s => s.id === id);
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === runbook.steps.length - 1)) return;

    const newSteps = [...runbook.steps];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newSteps[index], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[index]];

    setRunbook(prev => ({
      ...prev,
      steps: newSteps,
      lastModified: new Date().toLocaleString()
    }));
  };

  const calculateTotalRuntime = () => {
    return runbook.steps.reduce((total, step) => total + step.expectedRuntime, 0);
  };

  const isValidRunbook = runbook.steps.length > 1 && runbook.steps[0].type === 'trigger' && runbook.name.trim();

  return (
    <div className="flex h-full bg-background gap-4 p-4 overflow-hidden">
      {/* Left Sidebar - Steps List */}
      <div className="w-80 flex flex-col border border-border rounded-lg bg-card overflow-hidden">
        <div className="p-4 border-b border-border space-y-3">
          <div>
            <p className="text-sm font-bold text-foreground">Runbook Details</p>
            <p className="text-xs text-muted-foreground mt-1">{runbook.steps.length} steps • {calculateTotalRuntime()}s runtime</p>
          </div>
          <button
            onClick={() => setShowStepPalette(!showStepPalette)}
            className="w-full px-3 py-2 text-xs font-bold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition flex items-center justify-center gap-2"
          >
            <Plus className="w-3 h-3" /> Add Step
          </button>
        </div>

        {/* Step Palette */}
        {showStepPalette && (
          <div className="p-3 space-y-2 border-b border-border max-h-48 overflow-y-auto bg-muted/30">
            {Object.entries(STEP_TYPES).map(([type, config]) => (
              <button
                key={type}
                onClick={() => addStep(type as StepType)}
                className={cn(
                  'w-full p-2 rounded-lg border-2 transition text-left text-xs hover:shadow-md',
                  `${config.color}`
                )}
              >
                <div className="font-bold">{config.icon} {type.toUpperCase().replace('-', ' ')}</div>
                <div className="text-[10px] opacity-75 mt-0.5">{config.description}</div>
              </button>
            ))}
          </div>
        )}

        {/* Steps Flow */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {runbook.steps.map((step, idx) => (
            <div key={step.id} className="space-y-1">
              <button
                onClick={() => setSelectedStepId(step.id)}
                className={cn(
                  'w-full p-3 rounded-lg border-2 transition text-left',
                  selectedStepId === step.id
                    ? 'bg-primary/20 border-primary'
                    : `border-border ${STEP_TYPES[step.type].color}`
                )}
              >
                <div className="font-bold text-xs flex items-center gap-2">
                  {STEP_TYPES[step.type].icon} <span className="truncate">{step.title}</span>
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5 truncate">{step.description}</div>
                {step.expectedRuntime > 0 && (
                  <div className="text-[10px] text-muted-foreground mt-1">⏱️ {step.expectedRuntime}s</div>
                )}
              </button>

              {idx < runbook.steps.length - 1 && (
                <div className="flex justify-center py-1 text-muted-foreground text-xs">
                  <ArrowRight className="w-3 h-3 rotate-90" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Step Actions */}
        {selectedStep && (
          <div className="border-t border-border p-3 space-y-2">
            <button
              onClick={() => moveStep(selectedStepId!, 'up')}
              disabled={runbook.steps.findIndex(s => s.id === selectedStepId) === 0}
              className="w-full px-2 py-1.5 text-xs font-bold rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              ↑ Move Up
            </button>
            <button
              onClick={() => moveStep(selectedStepId!, 'down')}
              disabled={runbook.steps.findIndex(s => s.id === selectedStepId) === runbook.steps.length - 1}
              className="w-full px-2 py-1.5 text-xs font-bold rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              ↓ Move Down
            </button>
            <button
              onClick={() => duplicateStep(selectedStepId!)}
              className="w-full px-2 py-1.5 text-xs font-bold rounded-lg bg-card text-foreground border border-border hover:bg-muted/70 transition flex items-center justify-center gap-1"
            >
              <Copy className="w-3 h-3" /> Duplicate
            </button>
            <button
              onClick={() => deleteStep(selectedStepId!)}
              disabled={runbook.steps.length === 1}
              className="w-full px-2 py-1.5 text-xs font-bold rounded-lg bg-[hsl(var(--destructive)/0.2)] text-destructive-foreground border border-[hsl(var(--destructive)/0.4)] hover:bg-[hsl(var(--destructive)/0.28)] transition flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-3 h-3" /> Delete
            </button>
          </div>
        )}
      </div>

      {/* Middle - Runbook Metadata & Flow */}
      <div className="flex-1 flex flex-col gap-4 overflow-hidden">
        {/* Metadata */}
        <div className="bg-card border border-border rounded-lg p-4 space-y-3">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-foreground block mb-1">Runbook Name</label>
              <input
                type="text"
                value={runbook.name}
                onChange={(e) => setRunbook(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-foreground block mb-1">Status</label>
              <button
                onClick={() => setRunbook(prev => ({ ...prev, active: !prev.active }))}
                className={cn(
                  'w-full px-3 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-2',
                  runbook.active
                    ? 'bg-[hsl(var(--success-surface))] text-[hsl(var(--success-foreground))] border border-[hsl(var(--success-border))]'
                    : 'bg-card text-foreground border border-border'
                )}
              >
                {runbook.active ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                {runbook.active ? 'Active' : 'Inactive'}
              </button>
            </div>
            <div>
              <label className="text-xs font-bold text-foreground block mb-1">Estimate</label>
              <div className="px-3 py-2 rounded-lg border border-border bg-muted text-sm font-bold text-foreground text-center">
                {calculateTotalRuntime()}s
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-foreground block mb-1">Description</label>
            <textarea
              value={runbook.description}
              onChange={(e) => setRunbook(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              rows={2}
            />
          </div>
        </div>

        {/* Step Flow Visualization */}
        <div className="flex-1 bg-muted/30 rounded-lg border border-border overflow-y-auto p-6">
          <div className="flex flex-col items-center gap-3">
            {runbook.steps.map((step, idx) => {
              const stepType = STEP_TYPES[step.type];
              return (
                <div key={step.id} className="w-full max-w-sm">
                  <div
                    onClick={() => setSelectedStepId(step.id)}
                    className={cn(
                      'p-4 rounded-lg border-2 transition cursor-pointer text-center',
                      selectedStepId === step.id
                        ? 'border-primary bg-primary/10 shadow-lg'
                        : 'border-border bg-card hover:border-border/80'
                    )}
                  >
                    <div className="text-2xl mb-2">{stepType.icon}</div>
                    <p className="text-sm font-bold text-foreground">{step.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{step.description}</p>
                    <p className="text-xs text-muted-foreground mt-2 font-semibold">Step {idx + 1}</p>
                  </div>

                  {idx < runbook.steps.length - 1 && (
                    <div className="flex justify-center py-2">
                      <ArrowRight className="w-5 h-5 text-primary rotate-90" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Panel - Step Config */}
      {selectedStep && (
        <div className="w-72 bg-card border border-border rounded-lg p-4 flex flex-col gap-3 overflow-y-auto max-h-[calc(100vh-120px)]">
          <div>
            <p className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
              <span className="text-lg">{STEP_TYPES[selectedStep.type].icon}</span>
              Step Config
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-foreground block mb-1">Title</label>
                <input
                  type="text"
                  value={selectedStep.title}
                  onChange={(e) => {
                    setRunbook(prev => ({
                      ...prev,
                      steps: prev.steps.map(s =>
                        s.id === selectedStepId ? { ...s, title: e.target.value } : s
                      )
                    }));
                  }}
                  className="w-full px-2 py-1.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="font-bold text-foreground block mb-1">Description</label>
                <textarea
                  value={selectedStep.description}
                  onChange={(e) => {
                    setRunbook(prev => ({
                      ...prev,
                      steps: prev.steps.map(s =>
                        s.id === selectedStepId ? { ...s, description: e.target.value } : s
                      )
                    }));
                  }}
                  className="w-full px-2 py-1.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  rows={2}
                />
              </div>

              {selectedStep.type === 'wait' && (
                <div>
                  <label className="font-bold text-foreground block mb-1">Duration (s)</label>
                  <input
                    type="number"
                    value={selectedStep.expectedRuntime}
                    onChange={(e) => {
                      setRunbook(prev => ({
                        ...prev,
                        steps: prev.steps.map(s =>
                          s.id === selectedStepId ? { ...s, expectedRuntime: parseInt(e.target.value) || 0 } : s
                        )
                      }));
                    }}
                    className="w-full px-2 py-1.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              )}

              {selectedStep.type !== 'trigger' && (
                <>
                  <div>
                    <label className="font-bold text-foreground block mb-1">Timeout (s)</label>
                    <input
                      type="number"
                      value={selectedStep.timeout || 120}
                      onChange={(e) => {
                        setRunbook(prev => ({
                          ...prev,
                          steps: prev.steps.map(s =>
                            s.id === selectedStepId ? { ...s, timeout: parseInt(e.target.value) || 120 } : s
                          )
                        }));
                      }}
                      className="w-full px-2 py-1.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>

                  {selectedStep.type === 'action' && (
                    <div>
                      <label className="font-bold text-foreground block mb-1">On Failure</label>
                      <select
                        value={selectedStep.onFailure || 'rollback'}
                        onChange={(e) => {
                          setRunbook(prev => ({
                            ...prev,
                            steps: prev.steps.map(s =>
                              s.id === selectedStepId ? { ...s, onFailure: e.target.value as any } : s
                            )
                          }));
                        }}
                        className="w-full px-2 py-1.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      >
                        <option value="rollback">Rollback</option>
                        <option value="continue">Continue</option>
                        <option value="stop">Stop</option>
                      </select>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* JSON Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card border border-border rounded-lg w-3/4 max-h-96 p-6 overflow-y-auto">
            <p className="text-sm font-bold text-foreground mb-4">Runbook JSON</p>
            <pre className="text-[10px] text-muted-foreground bg-muted/30 p-3 rounded-lg overflow-x-auto">
              {JSON.stringify(runbook, null, 2)}
            </pre>
            <button
              onClick={() => setShowPreview(false)}
              className="mt-4 px-4 py-2 text-xs font-bold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Footer Actions */}
      <div className="border-t border-border bg-card px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="p-2 hover:bg-muted rounded-lg transition"
          title="View JSON"
        >
          <Code className="w-4 h-4 text-muted-foreground" />
        </button>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-xs font-bold rounded-lg border border-border text-foreground hover:bg-muted transition"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (isValidRunbook) {
                onSave?.(runbook);
              } else {
                alert('Please fix the errors:\n- Name is required\n- Must have at least 2 steps\n- First step must be a trigger');
              }
            }}
            disabled={!isValidRunbook}
            className={cn(
              'px-4 py-2 text-xs font-bold rounded-lg transition flex items-center gap-2',
              isValidRunbook
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            )}
          >
            <Save className="w-3 h-3" /> Save Runbook
          </button>
        </div>
      </div>
    </div>
  );
};
