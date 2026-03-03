import React, { useState } from 'react';
import {
  Plus, Trash2, Clock, Power, PlayCircle, PauseCircle, Calendar,
  Edit2, AlertCircle, CheckCircle, MoreVertical, Zap, Repeat
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AutomationSchedule {
  id: string;
  name: string;
  type: 'automation' | 'ai-model';
  status: 'active' | 'inactive' | 'paused';
  schedule: string; // cron expression or human readable
  frequency: 'once' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'custom';
  nextRun: string;
  lastRun: string | null;
  enabled: boolean;
  relatedModels?: string[];
  description: string;
}

interface AIModel {
  id: string;
  name: string;
  status: 'running' | 'stopped' | 'paused';
  automationsCount: number;
  lastActivity: string;
  uptime: number; // percentage
}

const mockAutomations: AutomationSchedule[] = [
  {
    id: 'auto_1',
    name: 'Cell Outage Recovery',
    type: 'automation',
    status: 'active',
    schedule: 'Every 5 minutes',
    frequency: 'custom',
    nextRun: '2 minutes',
    lastRun: '2 minutes ago',
    enabled: true,
    relatedModels: ['model_1'],
    description: 'Automatically detect and recover cell outages'
  },
  {
    id: 'auto_2',
    name: 'Network Optimization',
    type: 'automation',
    status: 'active',
    schedule: 'Every 15 minutes',
    frequency: 'custom',
    nextRun: '8 minutes',
    lastRun: '7 minutes ago',
    enabled: true,
    relatedModels: ['model_2', 'model_3'],
    description: 'Optimize network performance'
  },
  {
    id: 'auto_3',
    name: 'Capacity Planning Check',
    type: 'automation',
    status: 'inactive',
    schedule: 'Daily at 2:00 AM',
    frequency: 'daily',
    nextRun: '5 hours',
    lastRun: 'Yesterday at 2:04 AM',
    enabled: false,
    relatedModels: ['model_2'],
    description: 'Review and plan capacity for next week'
  },
  {
    id: 'auto_4',
    name: 'Security Audit',
    type: 'automation',
    status: 'paused',
    schedule: 'Weekly on Monday',
    frequency: 'weekly',
    nextRun: '2 days 4 hours',
    lastRun: 'Last Monday',
    enabled: false,
    relatedModels: [],
    description: 'Run security compliance checks'
  }
];

const mockModels: AIModel[] = [
  {
    id: 'model_1',
    name: 'Network Optimization AI',
    status: 'running',
    automationsCount: 2,
    lastActivity: '30 seconds ago',
    uptime: 99.8
  },
  {
    id: 'model_2',
    name: 'Predictive Maintenance Engine',
    status: 'running',
    automationsCount: 3,
    lastActivity: '1 minute ago',
    uptime: 99.5
  },
  {
    id: 'model_3',
    name: 'Anomaly Detection System',
    status: 'paused',
    automationsCount: 1,
    lastActivity: '2 hours ago',
    uptime: 98.2
  },
  {
    id: 'model_4',
    name: 'Capacity Planning AI',
    status: 'stopped',
    automationsCount: 0,
    lastActivity: '1 day ago',
    uptime: 0
  }
];

export const ExecutionOrchestrator: React.FC = () => {
  const [automations, setAutomations] = useState<AutomationSchedule[]>(mockAutomations);
  const [models, setModels] = useState<AIModel[]>(mockModels);
  const [activeTab, setActiveTab] = useState<'automations' | 'models'>('automations');
  const [selectedAutomation, setSelectedAutomation] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);

  const toggleAutomation = (id: string) => {
    setAutomations(prev =>
      prev.map(a =>
        a.id === id
          ? {
              ...a,
              enabled: !a.enabled,
              status: !a.enabled ? 'active' : 'inactive'
            }
          : a
      )
    );
  };

  const toggleModel = (id: string) => {
    setModels(prev =>
      prev.map(m =>
        m.id === id
          ? {
              ...m,
              status: m.status === 'running' ? 'stopped' : 'running'
            }
          : m
      )
    );
  };

  const deleteAutomation = (id: string) => {
    setAutomations(prev => prev.filter(a => a.id !== id));
    if (selectedAutomation === id) setSelectedAutomation(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'running':
        return 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700';
      case 'inactive':
      case 'stopped':
        return 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700';
      case 'paused':
        return 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700';
      default:
        return 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'running':
        return <PlayCircle className="w-4 h-4 text-green-600" />;
      case 'paused':
        return <PauseCircle className="w-4 h-4 text-amber-600" />;
      default:
        return <Power className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="w-full flex flex-col h-full gap-4 p-4 bg-background overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">Execution Orchestrator</h2>
          <p className="text-xs text-muted-foreground mt-1">Schedule and manage automations and AI models</p>
        </div>
        <button
          onClick={() => setShowScheduleDialog(true)}
          className="px-4 py-2 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Schedule
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab('automations')}
          className={cn(
            'px-4 py-2 text-sm font-semibold border-b-2 transition',
            activeTab === 'automations'
              ? 'text-primary border-b-primary'
              : 'text-muted-foreground border-b-transparent hover:text-foreground'
          )}
        >
          Automations ({automations.filter(a => a.enabled).length} active)
        </button>
        <button
          onClick={() => setActiveTab('models')}
          className={cn(
            'px-4 py-2 text-sm font-semibold border-b-2 transition',
            activeTab === 'models'
              ? 'text-primary border-b-primary'
              : 'text-muted-foreground border-b-transparent hover:text-foreground'
          )}
        >
          AI Models ({models.filter(m => m.status === 'running').length} running)
        </button>
      </div>

      {/* Automations Tab */}
      {activeTab === 'automations' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1">
          {/* List */}
          <div className="lg:col-span-2 space-y-2 overflow-y-auto max-h-96">
            {automations.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <p>No automations scheduled yet</p>
              </div>
            ) : (
              automations.map(automation => (
                <div
                  key={automation.id}
                  className={cn(
                    'w-full p-4 rounded-lg border-2 transition cursor-pointer hover:shadow-sm',
                    selectedAutomation === automation.id
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-card hover:border-border/80'
                  )}
                  onClick={() => setSelectedAutomation(automation.id)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-bold text-foreground truncate">{automation.name}</h3>
                        <span
                          className={cn(
                            'px-2 py-1 text-xs font-bold rounded-full whitespace-nowrap',
                            getStatusColor(automation.status)
                          )}
                        >
                          {getStatusIcon(automation.status)}
                          <span className="ml-1">{automation.status.toUpperCase()}</span>
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{automation.description}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {automation.schedule}
                        </span>
                        <span className="flex items-center gap-1">
                          <Repeat className="w-3 h-3" />
                          Next: {automation.nextRun}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleAutomation(automation.id);
                      }}
                      className={cn(
                        'px-3 py-1.5 text-xs font-bold rounded-lg transition flex-shrink-0',
                        automation.enabled
                          ? 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      )}
                    >
                      {automation.enabled ? 'ON' : 'OFF'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Details */}
          {selectedAutomation && (
            <div className="bg-card border border-border rounded-lg p-4 flex flex-col gap-4 max-h-96 overflow-y-auto">
              {(() => {
                const auto = automations.find(a => a.id === selectedAutomation);
                if (!auto) return null;
                return (
                  <>
                    <div>
                      <p className="text-xs font-bold text-foreground mb-1">Schedule Details</p>
                      <div className="space-y-2 text-xs text-muted-foreground">
                        <div className="flex justify-between">
                          <span>Frequency:</span>
                          <span className="font-semibold text-foreground">{auto.frequency}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Next Run:</span>
                          <span className="font-semibold text-foreground">{auto.nextRun}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Last Run:</span>
                          <span className="font-semibold text-foreground">{auto.lastRun || 'Never'}</span>
                        </div>
                      </div>
                    </div>

                    {auto.relatedModels && auto.relatedModels.length > 0 && (
                      <div>
                        <p className="text-xs font-bold text-foreground mb-2">Related AI Models</p>
                        <div className="space-y-1">
                          {auto.relatedModels.map(modelId => {
                            const model = models.find(m => m.id === modelId);
                            return (
                              <div key={modelId} className="flex items-center gap-2 text-xs">
                                <div
                                  className={cn(
                                    'w-2 h-2 rounded-full',
                                    model?.status === 'running' ? 'bg-green-500' : 'bg-gray-400'
                                  )}
                                />
                                <span className="text-foreground">{model?.name}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div className="border-t border-border pt-3">
                      <button
                        onClick={() => deleteAutomation(auto.id)}
                        className="w-full px-3 py-2 text-xs font-bold rounded-lg bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900 transition flex items-center justify-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" /> Delete Schedule
                      </button>
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {/* AI Models Tab */}
      {activeTab === 'models' && (
        <div className="space-y-3 flex-1 overflow-y-auto">
          {models.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <p>No AI models configured</p>
            </div>
          ) : (
            models.map(model => (
              <div
                key={model.id}
                className={cn(
                  'p-4 rounded-lg border-2 bg-card',
                  model.status === 'running' ? 'border-green-300 dark:border-green-700' : 'border-border'
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-sm font-bold text-foreground truncate">{model.name}</h3>
                      <span
                        className={cn(
                          'px-2 py-1 text-xs font-bold rounded-full whitespace-nowrap',
                          getStatusColor(model.status)
                        )}
                      >
                        {getStatusIcon(model.status)}
                        <span className="ml-1">{model.status.toUpperCase()}</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mb-3 text-xs text-muted-foreground">
                      <div>
                        <p className="text-[11px] font-semibold">Automations</p>
                        <p className="font-bold text-foreground">{model.automationsCount}</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold">Last Activity</p>
                        <p className="font-bold text-foreground">{model.lastActivity}</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold">Uptime</p>
                        <p className="font-bold text-foreground">{model.uptime}%</p>
                      </div>
                    </div>

                    {/* Uptime Progress */}
                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full transition',
                          model.uptime >= 99 ? 'bg-green-500' : model.uptime >= 98 ? 'bg-amber-500' : 'bg-red-500'
                        )}
                        style={{ width: `${model.uptime}%` }}
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => toggleModel(model.id)}
                    className={cn(
                      'px-3 py-2 text-xs font-bold rounded-lg transition flex items-center gap-1 flex-shrink-0',
                      model.status === 'running'
                        ? 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    )}
                  >
                    {model.status === 'running' ? (
                      <>
                        <Power className="w-3 h-3" /> ON
                      </>
                    ) : (
                      <>
                        <Power className="w-3 h-3" /> OFF
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Info Box */}
      <div className="bg-primary/10 border border-primary/30 rounded-lg p-3 mt-auto">
        <p className="text-xs font-semibold text-foreground mb-1">📅 About Orchestration</p>
        <p className="text-xs text-muted-foreground">
          Use the Orchestrator to schedule when automations run and control which AI models are active.
          Toggling a model off pauses all dependent automations.
        </p>
      </div>

      {/* Schedule Dialog */}
      {showScheduleDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card border border-border rounded-lg w-full max-w-md p-6">
            <p className="text-sm font-bold text-foreground mb-4">Schedule New Automation</p>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Automation name"
                className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <select className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50">
                <option>Select frequency...</option>
                <option>Hourly</option>
                <option>Daily</option>
                <option>Weekly</option>
                <option>Monthly</option>
              </select>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setShowScheduleDialog(false)}
                  className="flex-1 px-3 py-2 text-xs font-bold rounded-lg border border-border text-foreground hover:bg-muted transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowScheduleDialog(false)}
                  className="flex-1 px-3 py-2 text-xs font-bold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
