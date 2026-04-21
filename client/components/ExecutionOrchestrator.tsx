import React, { useState } from 'react';
import {
  Trash2, Power
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AutomationSchedule {
  id: string;
  name: string;
  description: string;
  schedule: string;
  frequency: 'once' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'custom';
  nextRun: string;
  lastRun: string | null;
  enabled: boolean;
  automationsCount: number;
  lastStatus: 'success' | 'error' | 'running';
}

interface AIModel {
  id: string;
  name: string;
  status: 'running' | 'stopped' | 'paused';
  automationsCount: number;
  lastActivity: string;
  uptime: number;
  executionsToday: number;
}

const mockAutomations: AutomationSchedule[] = [
  {
    id: 'auto_1',
    name: 'Cell Outage Recovery',
    description: 'Automatically detect and recover cell outages',
    schedule: 'Every 5 minutes',
    frequency: 'custom',
    nextRun: '2 minutes',
    lastRun: '2 minutes ago',
    enabled: true,
    automationsCount: 2,
    lastStatus: 'success'
  },
  {
    id: 'auto_2',
    name: 'Network Optimization',
    description: 'Optimize network performance',
    schedule: 'Every 15 minutes',
    frequency: 'custom',
    nextRun: '8 minutes',
    lastRun: '7 minutes ago',
    enabled: true,
    automationsCount: 3,
    lastStatus: 'success'
  },
  {
    id: 'auto_3',
    name: 'Capacity Planning Check',
    description: 'Review and plan capacity for next week',
    schedule: 'Daily at 2:00 AM',
    frequency: 'daily',
    nextRun: '5 hours',
    lastRun: 'Yesterday at 2:04 AM',
    enabled: false,
    automationsCount: 1,
    lastStatus: 'success'
  },
  {
    id: 'auto_4',
    name: 'Security Audit',
    description: 'Run security compliance checks',
    schedule: 'Weekly on Monday',
    frequency: 'weekly',
    nextRun: '2 days 4 hours',
    lastRun: 'Last Monday',
    enabled: false,
    automationsCount: 0,
    lastStatus: 'success'
  }
];

const mockModels: AIModel[] = [
  {
    id: 'model_1',
    name: 'Network Optimization AI',
    status: 'running',
    automationsCount: 2,
    lastActivity: '30 seconds ago',
    uptime: 99.8,
    executionsToday: 847
  },
  {
    id: 'model_2',
    name: 'Predictive Maintenance Engine',
    status: 'running',
    automationsCount: 3,
    lastActivity: '1 minute ago',
    uptime: 99.5,
    executionsToday: 623
  },
  {
    id: 'model_3',
    name: 'Anomaly Detection System',
    status: 'paused',
    automationsCount: 1,
    lastActivity: '2 hours ago',
    uptime: 98.2,
    executionsToday: 0
  },
  {
    id: 'model_4',
    name: 'Capacity Planning AI',
    status: 'stopped',
    automationsCount: 0,
    lastActivity: '1 day ago',
    uptime: 0,
    executionsToday: 0
  }
];

export const ExecutionOrchestrator: React.FC = () => {
  const [automations, setAutomations] = useState<AutomationSchedule[]>(mockAutomations);
  const [models, setModels] = useState<AIModel[]>(mockModels);
  const [activeTab, setActiveTab] = useState<'automations' | 'models'>('automations');
  const [selectedAutomation, setSelectedAutomation] = useState<string | null>(automations[0]?.id || null);

  const toggleAutomation = (id: string) => {
    setAutomations(prev =>
      prev.map(a =>
        a.id === id
          ? { ...a, enabled: !a.enabled }
          : a
      )
    );
  };

  const toggleModel = (id: string) => {
    setModels(prev =>
      prev.map(m =>
        m.id === id
          ? { ...m, status: m.status === 'running' ? 'stopped' : 'running' }
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
      case 'running':
        return 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300';
      case 'stopped':
        return 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300';
      case 'paused':
        return 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300';
      case 'success':
        return 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300';
      case 'error':
        return 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300';
      default:
        return 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300';
    }
  };

  const activeAutomations = automations.filter(a => a.enabled).length;
  const runningModels = models.filter(m => m.status === 'running').length;

  return (
    <div className="w-full flex flex-col h-full gap-2 p-3 bg-background overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between border border-border rounded-lg bg-card px-3 py-2">
        <h2 className="text-sm font-bold text-foreground">Execution Orchestrator</h2>
        <div className="flex items-center gap-3">
          <div className="text-right leading-tight">
            <p className="text-base font-bold text-primary">{activeAutomations}</p>
            <p className="text-[11px] text-muted-foreground">Active Automations</p>
          </div>
          <div className="w-px h-8 bg-border" />
          <div className="text-right leading-tight">
            <p className="text-base font-bold text-primary">{runningModels}</p>
            <p className="text-[11px] text-muted-foreground">Running Models</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 border-b border-border pb-1">
        <button
          onClick={() => setActiveTab('automations')}
          className={cn(
            'h-9 px-2.5 py-1 text-[12px] font-bold rounded-lg border transition',
            activeTab === 'automations'
              ? 'text-primary border-primary bg-primary/10'
              : 'text-muted-foreground border-border hover:text-foreground'
          )}
        >
          Automations ({automations.length})
        </button>
        <button
          onClick={() => setActiveTab('models')}
          className={cn(
            'h-9 px-2.5 py-1 text-[12px] font-bold rounded-lg border transition',
            activeTab === 'models'
              ? 'text-primary border-primary bg-primary/10'
              : 'text-muted-foreground border-border hover:text-foreground'
          )}
        >
          AI Models ({models.length})
        </button>
      </div>

      {/* Automations Tab */}
      {activeTab === 'automations' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 flex-1 overflow-hidden">
          {/* List */}
          <div className="lg:col-span-2 space-y-2 overflow-y-auto">
            {automations.map(automation => (
              <div
                key={automation.id}
                onClick={() => setSelectedAutomation(automation.id)}
                className={cn(
                  'px-3.5 py-2.5 min-h-[72px] rounded-lg border transition cursor-pointer hover:shadow-sm',
                  selectedAutomation === automation.id
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-card hover:border-border/80'
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-foreground">{automation.name}</h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                      {automation.schedule} • Next: {automation.nextRun} • Tasks: {automation.automationsCount} • {automation.enabled ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                  <span className={cn('px-2 py-1 text-xs font-bold rounded-full whitespace-nowrap', getStatusColor(automation.lastStatus))}>
                    {automation.lastStatus === 'success' && '✓'}
                    {automation.lastStatus === 'error' && '✗'}
                    {automation.lastStatus === 'running' && '▶'}
                  </span>
                </div>

                {/* Status Toggle */}
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-muted-foreground">
                    Last run: <strong>{automation.lastRun || 'Never'}</strong>
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleAutomation(automation.id);
                    }}
                    className={cn(
                      'px-3 py-1.5 text-xs font-bold rounded-lg transition',
                      automation.enabled
                        ? 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    )}
                  >
                    {automation.enabled ? '✓ Active' : '○ Inactive'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Details Panel */}
          {selectedAutomation && (
            <div className="bg-card border border-border rounded-lg p-4 flex flex-col gap-4 max-h-[calc(100vh-300px)] overflow-y-auto">
              {(() => {
                const auto = automations.find(a => a.id === selectedAutomation);
                if (!auto) return null;
                return (
                  <>
                    <div>
                      <p className="text-sm font-bold text-foreground mb-3">{auto.name}</p>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between pb-2 border-b border-border">
                          <span className="text-muted-foreground">Frequency:</span>
                          <span className="font-semibold text-foreground">{auto.frequency}</span>
                        </div>
                        <div className="flex justify-between pb-2 border-b border-border">
                          <span className="text-muted-foreground">Schedule:</span>
                          <span className="font-semibold text-foreground">{auto.schedule}</span>
                        </div>
                        <div className="flex justify-between pb-2 border-b border-border">
                          <span className="text-muted-foreground">Next Run:</span>
                          <span className="font-semibold text-foreground">{auto.nextRun}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Last Run:</span>
                          <span className="font-semibold text-foreground">{auto.lastRun || 'Never'}</span>
                        </div>
                      </div>
                    </div>

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
          {models.map(model => (
            <div
              key={model.id}
              className={cn(
                'p-4 rounded-lg border-2 transition',
                model.status === 'running' ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-950/30' : 'border-border bg-card'
              )}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-foreground">{model.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {model.automationsCount} automations • {model.executionsToday} executions today
                  </p>
                </div>
                <button
                  onClick={() => toggleModel(model.id)}
                  className={cn(
                    'px-3 py-1.5 text-xs font-bold rounded-lg transition flex-shrink-0 flex items-center gap-1',
                    model.status === 'running'
                      ? 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  )}
                >
                  <Power className="w-3 h-3" />
                  {model.status === 'running' ? 'ON' : 'OFF'}
                </button>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="bg-muted/50 rounded-lg p-2 text-center">
                  <p className="text-[11px] text-muted-foreground font-semibold">Last Activity</p>
                  <p className="text-xs font-bold text-foreground mt-1">{model.lastActivity}</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-2 text-center">
                  <p className="text-[11px] text-muted-foreground font-semibold">Uptime</p>
                  <p className="text-xs font-bold text-foreground mt-1">{model.uptime}%</p>
                </div>
                <div className={cn(
                  'rounded-lg p-2 text-center',
                  model.status === 'running' ? 'bg-green-100 dark:bg-green-900' : 'bg-muted/50'
                )}>
                  <p className="text-[11px] font-semibold">Status</p>
                  <p className="text-xs font-bold text-foreground mt-1">{model.status.toUpperCase()}</p>
                </div>
              </div>

              {/* Uptime Bar */}
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
          ))}
        </div>
      )}

    </div>
  );
};
