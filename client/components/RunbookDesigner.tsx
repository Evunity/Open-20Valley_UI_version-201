import React, { useState } from 'react';
import {
  Plus, Trash2, Copy, Save, ArrowRight, Play, Pause, AlertCircle,
  CheckCircle, Clock, RefreshCw, Settings, ChevronDown, Code, Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';

type StepType = 'trigger' | 'action' | 'validation' | 'rollback' | 'notification' | 'decision' | 'wait';

interface RunbookStep {
  id: string;
  type: StepType;
  title: string;
  description: string;
  config: Record<string, any>;
  rollbackAvailable: boolean;
  expectedRuntime: number; // in seconds
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
  wait: { icon: '⏱️', color: 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600', description: 'Wait period' }
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
        title: 'Alarm Detected',
        description: 'Listen for critical network alarm',
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
      title: `New ${type}`,
      description: '',
      config: {},
      rollbackAvailable: type === 'action',
      expectedRuntime: type === 'wait' ? 30 : type === 'trigger' ? 0 : 10,
      onFailure: type === 'action' ? 'rollback' : 'stop'
    };
    setRunbook(prev => ({
      ...prev,
      steps: [...prev.steps, newStep],
      lastModified: new Date().toLocaleString()
    }));
    setShowStepPalette(false);
  };

  const deleteStep = (id: string) => {
    setRunbook(prev => ({
      ...prev,
      steps: prev.steps.filter(s => s.id !== id),
      lastModified: new Date().toLocaleString()
    }));
    if (selectedStepId === id) setSelectedStepId(null);
  };

  const duplicateStep = (id: string) => {
    const step = runbook.steps.find(s => s.id === id);
    if (!step) return;

    const newStep = {
      ...step,
      id: `step_${Date.now()}`
    };
    setRunbook(prev => ({
      ...prev,
      steps: [...prev.steps, newStep],
      lastModified: new Date().toLocaleString()
    }));
  };

  const moveStep = (id: string, direction: 'up' | 'down') => {
    const index = runbook.steps.findIndex(s => s.id === id);
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === runbook.steps.length - 1)) {
      return;
    }

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

  const isValidRunbook = runbook.steps.length > 1 && runbook.steps[0].type === 'trigger';

  return (
    <div className="flex h-full bg-background gap-4 p-4">
      {/* Steps List */}
      <div className="w-80 flex flex-col border border-border rounded-lg bg-card overflow-hidden">
        <div className="p-3 border-b border-border">
          <p className="text-sm font-bold text-foreground mb-2">Runbook Steps</p>
          <button
            onClick={() => setShowStepPalette(!showStepPalette)}
            className="w-full px-3 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition flex items-center justify-center gap-2"
          >
            <Plus className="w-3 h-3" /> Add Step
          </button>
        </div>

        {showStepPalette && (
          <div className="p-2 space-y-2 border-b border-border max-h-48 overflow-y-auto">
            {Object.entries(STEP_TYPES).map(([type, config]) => (
              <button
                key={type}
                onClick={() => addStep(type as StepType)}
                className={`w-full p-2 rounded-lg border-2 transition text-left text-xs ${config.color} hover:shadow-md`}
              >
                <div className="font-semibold">{config.icon} {type.charAt(0).toUpperCase() + type.slice(1)}</div>
                <div className="text-[11px] opacity-75">{config.description}</div>
              </button>
            ))}
          </div>
        )}

        {/* Steps Flow */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {runbook.steps.map((step, idx) => (
            <div key={step.id} className="space-y-1">
              <button
                onClick={() => setSelectedStepId(step.id)}
                className={cn(
                  'w-full p-2 rounded-lg border-2 transition text-left',
                  selectedStepId === step.id
                    ? 'bg-primary/20 border-primary'
                    : `border-border ${STEP_TYPES[step.type].color}`
                )}
              >
                <div className="font-bold text-xs flex items-center gap-2">
                  {STEP_TYPES[step.type].icon} <span>{step.title}</span>
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5 truncate">{step.description}</div>
                {step.expectedRuntime > 0 && (
                  <div className="text-[10px] text-muted-foreground mt-1">⏱️ {step.expectedRuntime}s</div>
                )}
              </button>

              {/* Arrow between steps */}
              {idx < runbook.steps.length - 1 && (
                <div className="flex items-center justify-center py-1 text-muted-foreground text-xs">
                  <ArrowRight className="w-3 h-3 rotate-90" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Step Actions - Bottom */}
        {selectedStep && (
          <div className="border-t border-border p-3 space-y-2">
            <button
              onClick={() => duplicateStep(selectedStepId!)}
              className="w-full px-2 py-1.5 text-xs font-semibold rounded-lg bg-muted text-foreground hover:bg-muted/80 transition flex items-center justify-center gap-1"
            >
              <Copy className="w-3 h-3" /> Duplicate
            </button>
            <button
              onClick={() => deleteStep(selectedStepId!)}
              className="w-full px-2 py-1.5 text-xs font-semibold rounded-lg bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900 transition flex items-center justify-center gap-1"
            >
              <Trash2 className="w-3 h-3" /> Delete
            </button>
          </div>
        )}
      </div>

      {/* Main Editor */}
      <div className="flex-1 flex flex-col gap-4">
        {/* Header */}
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4 mb-4">
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
                    ? 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {runbook.active ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                {runbook.active ? 'Active' : 'Inactive'}
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-foreground block mb-1">Description</label>
            <textarea
              value={runbook.description}
              onChange={(e) => setRunbook(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              rows={2}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-card border border-border rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground font-semibold">Total Steps</p>
            <p className="text-2xl font-bold text-primary mt-1">{runbook.steps.length}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground font-semibold">Est. Runtime</p>
            <p className="text-2xl font-bold text-primary mt-1">{calculateTotalRuntime()}s</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground font-semibold">Rollback Steps</p>
            <p className="text-2xl font-bold text-primary mt-1">{runbook.steps.filter(s => s.rollbackAvailable).length}</p>
          </div>
        </div>

        {/* Step Config */}
        {selectedStep && (
          <div className="bg-card border border-border rounded-lg p-4 flex-1 overflow-y-auto">
            <p className="text-sm font-bold text-foreground mb-4">Step Configuration</p>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-foreground block mb-1">Title</label>
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
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1">Description</label>
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
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  rows={2}
                />
              </div>

              {selectedStep.type === 'wait' && (
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">Duration (seconds)</label>
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
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              )}

              {selectedStep.type !== 'trigger' && (
                <>
                  <div>
                    <label className="text-xs font-bold text-foreground block mb-1">Timeout (seconds)</label>
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
                      className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>

                  {selectedStep.type === 'action' && (
                    <div>
                      <label className="text-xs font-bold text-foreground block mb-1">On Failure</label>
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
                        className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      >
                        <option value="rollback">Rollback all changes</option>
                        <option value="continue">Continue to next step</option>
                        <option value="stop">Stop execution</option>
                      </select>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-muted text-foreground hover:bg-muted/80 transition flex items-center gap-2"
          >
            <Eye className="w-3 h-3" /> {showPreview ? 'Hide' : 'Preview'}
          </button>
          <button
            onClick={() => {
              if (isValidRunbook) {
                onSave?.(runbook);
              }
            }}
            disabled={!isValidRunbook}
            className={cn(
              'px-4 py-2 text-xs font-semibold rounded-lg transition flex items-center gap-2 flex-1',
              isValidRunbook
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            )}
          >
            <Save className="w-3 h-3" /> Save Runbook
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 text-xs font-semibold rounded-lg border border-border text-foreground hover:bg-muted transition"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card border border-border rounded-lg w-3/4 max-h-96 p-6 overflow-y-auto">
            <p className="text-sm font-bold text-foreground mb-4">Runbook Preview</p>
            <pre className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg overflow-x-auto">
              {JSON.stringify(runbook, null, 2)}
            </pre>
            <button
              onClick={() => setShowPreview(false)}
              className="mt-4 px-4 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
