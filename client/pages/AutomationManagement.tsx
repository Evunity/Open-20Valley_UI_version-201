import React, { useState } from 'react';
import { Eye, Hammer, Lock, Plus, Settings, Brain, Lightbulb, Shield, Map, TrendingUp, Search, Play, Pause, Calendar, Pencil, Trash2, Copy } from 'lucide-react';
import { AutomationCommandCenter } from '../components/AutomationCommandCenter';
import { AutomationBuilder } from '../components/AutomationBuilder';
import { WorkflowBuilder } from '../components/WorkflowBuilder';
import { RunbookDesigner } from '../components/RunbookDesigner';
import { TriggerEngine } from '../components/TriggerEngine';
import { PreExecutionSimulation } from '../components/PreExecutionSimulation';
import { ExecutionOrchestrator } from '../components/ExecutionOrchestrator';
import { AIDecisionHub } from '../components/AIDecisionHub';
import { ModelGovernance } from '../components/ModelGovernance';
import { ClosedLoopValidation } from '../components/ClosedLoopValidation';
import { LearningEngine } from '../components/LearningEngine';
import { TrustScoring } from '../components/TrustScoring';
import { HumanInLoopDialog } from '../components/HumanInLoopDialog';
import { AutonomyHeatmap } from '../components/AutonomyHeatmap';
import { generateMockPolicies } from '../utils/automationData';

type SuperDomain = 'awareness' | 'design' | 'execution';
type WorkspaceType =
  | 'command_center'
  | 'ai_hub'
  | 'impact_engine'
  | 'learning_engine'
  | 'trust_scoring'
  | 'builder'
  | 'workflow_library'
  | 'runbook'
  | 'policy'
  | 'orchestrator'
  | 'governance'
  | 'heatmap';

interface WorkspaceTab {
  id: WorkspaceType;
  label: string;
  domain: SuperDomain;
}

const WORKSPACES: WorkspaceTab[] = [
  // Awareness Layer
  { id: 'command_center', label: 'Command Center', domain: 'awareness' },
  { id: 'ai_hub', label: 'AI Decision Hub', domain: 'awareness' },
  { id: 'impact_engine', label: 'Impact & Learning', domain: 'awareness' },
  { id: 'learning_engine', label: 'Learning Engine', domain: 'awareness' },
  { id: 'trust_scoring', label: 'Trust Score', domain: 'awareness' },
  // Design Layer
  { id: 'builder', label: 'Builder', domain: 'design' },
  { id: 'workflow_library', label: 'Saved Workflows', domain: 'design' },
  { id: 'runbook', label: 'Runbook Designer', domain: 'design' },
  { id: 'policy', label: 'Policy & Guardrails', domain: 'design' },
  // Execution Layer
  { id: 'orchestrator', label: 'Orchestrator', domain: 'execution' },
  { id: 'governance', label: 'Model Governance', domain: 'execution' },
  { id: 'heatmap', label: 'Autonomy Heatmap', domain: 'execution' }
];

const DOMAINS = [
  { id: 'awareness', icon: Eye, label: 'Awareness', color: 'text-blue-600', bgColor: 'bg-blue-50' },
  { id: 'design', icon: Hammer, label: 'Design', color: 'text-purple-600', bgColor: 'bg-purple-50' },
  { id: 'execution', icon: Lock, label: 'Execution', color: 'text-emerald-600', bgColor: 'bg-emerald-50' }
];

interface PolicyForm {
  name: string;
  description: string;
  approvalRequired: boolean;
  constraints: string[];
}

interface SavedRunbook {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

type WorkflowStatus = 'draft' | 'active' | 'inactive';
type WorkflowDay = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

interface WorkflowSchedule {
  enabled: boolean;
  daysOfWeek: WorkflowDay[];
  startTime: string;
  endTime: string;
  timezone: string;
}

interface SavedWorkflowRecord {
  id: string;
  name: string;
  description: string;
  status: WorkflowStatus;
  createdAt: string;
  updatedAt: string;
  triggerType: string;
  nodeCount: number;
  schedule: WorkflowSchedule;
  owner: string;
  lastRun?: string;
  nextRun?: string;
  definition: any;
}

export const AutomationManagement: React.FC = () => {
  const [activeDomain, setActiveDomain] = useState<SuperDomain>('awareness');
  const [activeWorkspace, setActiveWorkspace] = useState<WorkspaceType>('command_center');
  const [showBuilder, setShowBuilder] = useState(false);
  const [showRunbook, setShowRunbook] = useState(false);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [showPolicyDialog, setShowPolicyDialog] = useState(false);
  const [policies, setPolicies] = useState(generateMockPolicies());
  const [runbooks, setRunbooks] = useState<SavedRunbook[]>([]);
  const [savedWorkflows, setSavedWorkflows] = useState<SavedWorkflowRecord[]>([]);
  const [workflowSearch, setWorkflowSearch] = useState('');
  const [workflowStatusFilter, setWorkflowStatusFilter] = useState<'all' | WorkflowStatus>('all');
  const [editingWorkflowId, setEditingWorkflowId] = useState<string | null>(null);
  const [deleteWorkflowId, setDeleteWorkflowId] = useState<string | null>(null);
  const [scheduleWorkflowId, setScheduleWorkflowId] = useState<string | null>(null);
  const [policyForm, setPolicyForm] = useState<PolicyForm>({
    name: '',
    description: '',
    approvalRequired: false,
    constraints: []
  });
  const [currentConstraint, setCurrentConstraint] = useState('');

  const defaultSchedule: WorkflowSchedule = {
    enabled: false,
    daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    startTime: '09:00',
    endTime: '18:00',
    timezone: 'UTC',
  };

  const getScheduleSummary = (schedule: WorkflowSchedule, status: WorkflowStatus) => {
    if (status === 'inactive') return 'Inactive';
    if (!schedule.enabled) return 'Active: Daily, 24h';
    const dayText = schedule.daysOfWeek.length === 7 ? 'Daily' : schedule.daysOfWeek.join(', ');
    return `Scheduled: ${dayText}, ${schedule.startTime}-${schedule.endTime}`;
  };

  const workflowBeingEdited = editingWorkflowId
    ? savedWorkflows.find((wf) => wf.id === editingWorkflowId)
    : null;

  const filteredWorkflows = savedWorkflows.filter((workflow) => {
    const matchesSearch = workflow.name.toLowerCase().includes(workflowSearch.toLowerCase());
    const matchesStatus = workflowStatusFilter === 'all' || workflow.status === workflowStatusFilter;
    return matchesSearch && matchesStatus;
  });
  const workflowForSchedule = savedWorkflows.find((workflow) => workflow.id === scheduleWorkflowId);
  const workflowForDelete = savedWorkflows.find((workflow) => workflow.id === deleteWorkflowId);

  const domainWorkspaces = WORKSPACES.filter(w => w.domain === activeDomain);
  const currentDomain = DOMAINS.find(d => d.id === activeDomain);

  const renderWorkspaceContent = () => {
    switch (activeWorkspace) {
      case 'command_center':
        return <AutomationCommandCenter onActivitySelect={(a) => console.log(a)} />;

      case 'ai_hub':
        return <AIDecisionHub onDecisionApprove={(d) => console.log(d)} onDecisionReject={(d) => console.log(d)} />;

      case 'impact_engine':
        return <ClosedLoopValidation />;

      case 'builder':
        return showBuilder ? (
          <WorkflowBuilder
            initialWorkflow={workflowBeingEdited?.definition}
            onSave={(workflow) => {
              const triggerNode = workflow.nodes.find((node: any) => node.type === 'trigger');
              const now = new Date().toISOString();
              setSavedWorkflows((previous) => {
                const existing = previous.find((item) => item.id === workflow.id);
                const baseRecord: SavedWorkflowRecord = {
                  id: workflow.id,
                  name: workflow.name,
                  description: workflow.description || 'No description provided',
                  status: workflow.active ? 'active' : existing?.status || 'draft',
                  createdAt: existing?.createdAt || now,
                  updatedAt: now,
                  triggerType: triggerNode?.label || triggerNode?.type || 'Manual Trigger',
                  nodeCount: workflow.nodes.length,
                  schedule: existing?.schedule || defaultSchedule,
                  owner: existing?.owner || 'Automation Operator',
                  lastRun: existing?.lastRun,
                  nextRun: existing?.nextRun,
                  definition: workflow,
                };

                if (existing) {
                  return previous.map((item) => (item.id === workflow.id ? baseRecord : item));
                }
                return [baseRecord, ...previous];
              });
              setShowBuilder(false);
              setEditingWorkflowId(null);
              setActiveWorkspace('workflow_library');
            }}
            onCancel={() => {
              setShowBuilder(false);
              setEditingWorkflowId(null);
            }}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-4 bg-background">
            <div className="text-center max-w-md">
              <div className="text-5xl mb-4">🔧</div>
              <h2 className="text-lg font-bold text-foreground mb-2">Workflow Builder</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Create visual automation workflows with drag-and-drop nodes, connections, and configurations.
              </p>
              <button
                onClick={() => setShowBuilder(true)}
                className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition flex items-center gap-2 mx-auto"
              >
                <Plus className="w-4 h-4" />
                Create Workflow
              </button>
            </div>
          </div>
        );

      case 'runbook':
        return showRunbook ? (
          <RunbookDesigner
            onSave={(runbook) => {
              setRunbooks(prev => [...prev, {
                id: runbook.id,
                name: runbook.name,
                description: runbook.description,
                createdAt: runbook.createdAt
              }]);
              setShowRunbook(false);
              alert('✓ Runbook saved successfully!');
            }}
            onCancel={() => setShowRunbook(false)}
          />
        ) : (
          <div className="flex-1 overflow-y-auto p-4 bg-background dark:bg-background">
            <div className="max-w-5xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-foreground">Runbook Designer</h2>
                <button
                  onClick={() => setShowRunbook(true)}
                  className="px-6 py-2.5 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 transition flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  New Runbook
                </button>
              </div>

              {runbooks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center max-w-md mx-auto">
                  <Settings className="w-16 h-16 text-purple-400 dark:text-purple-600 mx-auto mb-4 opacity-50" />
                  <p className="text-sm text-muted-foreground">
                    Build complex workflows with parallel branches, conditionals, and retries
                  </p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {runbooks.map(runbook => (
                    <div
                      key={runbook.id}
                      className="bg-card rounded-lg border border-border p-4 hover:border-gray-300 dark:hover:border-gray-600 transition"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-sm font-bold text-foreground">{runbook.name}</h3>
                          <p className="text-xs text-muted-foreground mt-1">{runbook.description}</p>
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                          {new Date(runbook.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 'workflow_library':
        return (
          <div className="flex-1 overflow-y-auto p-4 bg-background">
            <div className="max-w-6xl mx-auto space-y-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-foreground">Workflow Library</h2>
                  <p className="text-xs text-muted-foreground">Manage saved workflows, lifecycle state, and working-hour schedules.</p>
                </div>
                <button
                  onClick={() => {
                    setEditingWorkflowId(null);
                    setShowBuilder(true);
                    setActiveWorkspace('builder');
                  }}
                  className="px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  New Workflow
                </button>
              </div>

              <div className="bg-card border border-border rounded-lg p-3 flex flex-col md:flex-row gap-2 md:items-center">
                <div className="flex items-center gap-2 flex-1">
                  <Search className="w-4 h-4 text-muted-foreground" />
                  <input
                    value={workflowSearch}
                    onChange={(e) => setWorkflowSearch(e.target.value)}
                    placeholder="Search workflow by name..."
                    className="w-full bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <select
                  value={workflowStatusFilter}
                  onChange={(e) => setWorkflowStatusFilter(e.target.value as any)}
                  className="px-2 py-1.5 rounded border border-border bg-background text-xs"
                >
                  <option value="all">All statuses</option>
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="bg-card border border-border rounded-lg overflow-hidden">
                <div className="grid grid-cols-12 gap-2 px-3 py-2 text-[11px] font-semibold text-muted-foreground border-b border-border bg-muted/30">
                  <div className="col-span-3">Workflow</div>
                  <div className="col-span-1">Status</div>
                  <div className="col-span-1">Trigger</div>
                  <div className="col-span-1">Nodes</div>
                  <div className="col-span-3">Schedule</div>
                  <div className="col-span-1">Updated</div>
                  <div className="col-span-2 text-right">Actions</div>
                </div>
                {filteredWorkflows.length === 0 ? (
                  <div className="p-8 text-center text-sm text-muted-foreground">
                    No saved workflows yet. Save one from Builder to manage it here.
                  </div>
                ) : (
                  filteredWorkflows.map((workflow) => (
                    <div key={workflow.id} className="grid grid-cols-12 gap-2 px-3 py-2.5 border-b border-border/60 text-xs items-center hover:bg-muted/20">
                      <div className="col-span-3 min-w-0">
                        <p className="font-semibold text-foreground truncate">{workflow.name}</p>
                        <p className="text-muted-foreground truncate">{workflow.description}</p>
                      </div>
                      <div className="col-span-1">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-semibold ${
                          workflow.status === 'active'
                            ? 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300'
                            : workflow.status === 'inactive'
                              ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}>
                          {workflow.status}
                        </span>
                      </div>
                      <div className="col-span-1 text-muted-foreground">{workflow.triggerType}</div>
                      <div className="col-span-1 text-muted-foreground">{workflow.nodeCount}</div>
                      <div className="col-span-3 text-muted-foreground">{getScheduleSummary(workflow.schedule, workflow.status)}</div>
                      <div className="col-span-1 text-muted-foreground">{new Date(workflow.updatedAt).toLocaleDateString()}</div>
                      <div className="col-span-2 flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            setEditingWorkflowId(workflow.id);
                            setShowBuilder(true);
                            setActiveWorkspace('builder');
                          }}
                          className="p-1.5 rounded border border-border hover:bg-muted"
                          title="Open/Edit"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setSavedWorkflows((prev) => prev.map((item) => item.id === workflow.id ? { ...item, status: item.status === 'active' ? 'inactive' : 'active' } : item))}
                          className="p-1.5 rounded border border-border hover:bg-muted"
                          title="Activate/Deactivate"
                        >
                          {workflow.status === 'active' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => setScheduleWorkflowId(workflow.id)}
                          className="p-1.5 rounded border border-border hover:bg-muted"
                          title="Schedule"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setSavedWorkflows((prev) => [{ ...workflow, id: `workflow_${Date.now()}`, name: `${workflow.name} (Copy)`, status: 'draft', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, ...prev])}
                          className="p-1.5 rounded border border-border hover:bg-muted"
                          title="Duplicate"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteWorkflowId(workflow.id)}
                          className="p-1.5 rounded border border-destructive/40 text-destructive hover:bg-destructive/10"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        );

      case 'policy':
        return (
          <div className="flex-1 overflow-y-auto p-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-foreground">Automation Policies</h2>
                <button
                  onClick={() => {
                    setShowPolicyDialog(true);
                    setPolicyForm({ name: '', description: '', approvalRequired: false, constraints: [] });
                    setCurrentConstraint('');
                  }}
                  className="px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> New Policy
                </button>
              </div>

              <div className="grid gap-3">
                {policies.map(policy => (
                  <div
                    key={policy.id}
                    className="bg-card rounded-lg border border-border p-4 hover:border-gray-300 dark:hover:border-gray-600 transition"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-sm font-bold text-foreground">{policy.name}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{policy.description}</p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          policy.approvalRequired
                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                            : 'bg-green-100 dark:bg-green-950 text-green-800 dark:text-green-300'
                        }`}
                      >
                        {policy.approvalRequired ? 'Approval Required' : 'Auto-Approved'}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {policy.constraints.map((constraint, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-1 rounded"
                        >
                          {constraint}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'orchestrator':
        return <ExecutionOrchestrator />;

      case 'governance':
        return <ModelGovernance />;

      case 'learning_engine':
        return <LearningEngine onRecommendationApply={(id, rec) => console.log(id, rec)} />;

      case 'trust_scoring':
        return <TrustScoring />;

      case 'heatmap':
        return <AutonomyHeatmap />;

      default:
        return null;
    }
  };

  return (
    <div className="automation-theme flex flex-col h-screen bg-background">
      {/* Domain Navigation */}
      <div className="bg-card border-b border-border px-6 py-3 flex gap-2">
        {DOMAINS.map(domain => {
          const Icon = domain.icon;
          return (
            <button
              key={domain.id}
              onClick={() => {
                setActiveDomain(domain.id as SuperDomain);
                setActiveWorkspace(WORKSPACES.find(w => w.domain === domain.id)?.id || 'command_center');
              }}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2 ${
                activeDomain === domain.id
                  ? `${domain.bgColor} ${domain.color} border-2 border-current`
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              <Icon className="w-4 h-4" />
              {domain.label}
            </button>
          );
        })}
      </div>

      {/* Workspace Tabs */}
      <div className="bg-muted/50 border-b border-border px-6 overflow-x-auto">
        <div className="flex gap-1">
          {domainWorkspaces.map(workspace => (
            <button
              key={workspace.id}
              onClick={() => setActiveWorkspace(workspace.id)}
              className={`px-4 py-3 text-sm font-medium transition border-b-2 ${
                activeWorkspace === workspace.id
                  ? 'bg-card text-blue-600 dark:text-blue-400 border-b-blue-600 dark:border-b-blue-400'
                  : 'text-muted-foreground border-b-transparent hover:bg-card/70'
              }`}
            >
              {workspace.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden flex">
        {renderWorkspaceContent()}
      </div>

      {/* Schedule Editor Modal */}
      {workflowForSchedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg bg-card border border-border rounded-lg p-5 space-y-4">
            <div>
              <h3 className="text-base font-bold text-foreground">Schedule Workflow</h3>
              <p className="text-xs text-muted-foreground mt-1">{workflowForSchedule.name}</p>
            </div>

            <label className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={workflowForSchedule.schedule.enabled}
                onChange={(e) => {
                  const enabled = e.target.checked;
                  setSavedWorkflows((prev) =>
                    prev.map((item) =>
                      item.id === workflowForSchedule.id
                        ? { ...item, schedule: { ...item.schedule, enabled }, updatedAt: new Date().toISOString() }
                        : item
                    )
                  );
                }}
              />
              Enable scheduling window
            </label>

            <div>
              <p className="text-xs font-semibold text-foreground mb-2">Days of Week</p>
              <div className="grid grid-cols-7 gap-1">
                {(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as WorkflowDay[]).map((day) => {
                  const selected = workflowForSchedule.schedule.daysOfWeek.includes(day);
                  return (
                    <button
                      key={day}
                      onClick={() => {
                        setSavedWorkflows((prev) =>
                          prev.map((item) => {
                            if (item.id !== workflowForSchedule.id) return item;
                            const days = selected
                              ? item.schedule.daysOfWeek.filter((d) => d !== day)
                              : [...item.schedule.daysOfWeek, day];
                            return { ...item, schedule: { ...item.schedule, daysOfWeek: days }, updatedAt: new Date().toISOString() };
                          })
                        );
                      }}
                      className={`px-2 py-1 rounded text-xs border ${selected ? 'bg-primary text-primary-foreground border-primary' : 'bg-background border-border text-muted-foreground'}`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Start Time</label>
                <input
                  type="time"
                  value={workflowForSchedule.schedule.startTime}
                  onChange={(e) =>
                    setSavedWorkflows((prev) =>
                      prev.map((item) =>
                        item.id === workflowForSchedule.id
                          ? { ...item, schedule: { ...item.schedule, startTime: e.target.value }, updatedAt: new Date().toISOString() }
                          : item
                      )
                    )
                  }
                  className="w-full px-2 py-1.5 rounded border border-border bg-background text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">End Time</label>
                <input
                  type="time"
                  value={workflowForSchedule.schedule.endTime}
                  onChange={(e) =>
                    setSavedWorkflows((prev) =>
                      prev.map((item) =>
                        item.id === workflowForSchedule.id
                          ? { ...item, schedule: { ...item.schedule, endTime: e.target.value }, updatedAt: new Date().toISOString() }
                          : item
                      )
                    )
                  }
                  className="w-full px-2 py-1.5 rounded border border-border bg-background text-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">Timezone</label>
              <input
                type="text"
                value={workflowForSchedule.schedule.timezone}
                onChange={(e) =>
                  setSavedWorkflows((prev) =>
                    prev.map((item) =>
                      item.id === workflowForSchedule.id
                        ? { ...item, schedule: { ...item.schedule, timezone: e.target.value }, updatedAt: new Date().toISOString() }
                        : item
                    )
                  )
                }
                className="w-full px-2 py-1.5 rounded border border-border bg-background text-sm"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button onClick={() => setScheduleWorkflowId(null)} className="px-3 py-1.5 rounded border border-border text-sm hover:bg-muted">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {workflowForDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md bg-card border border-border rounded-lg p-5 space-y-4">
            <div>
              <h3 className="text-base font-bold text-foreground">Delete Workflow</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Are you sure you want to delete <span className="font-semibold text-foreground">{workflowForDelete.name}</span>? This cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2">
              <button onClick={() => setDeleteWorkflowId(null)} className="px-3 py-1.5 rounded border border-border text-sm hover:bg-muted">
                Cancel
              </button>
              <button
                onClick={() => {
                  setSavedWorkflows((prev) => prev.filter((item) => item.id !== workflowForDelete.id));
                  setDeleteWorkflowId(null);
                }}
                className="px-3 py-1.5 rounded bg-destructive text-destructive-foreground text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Human-in-Loop Approval Dialog */}
      <HumanInLoopDialog
        isOpen={showApprovalDialog}
        context={{
          automationName: 'Cell Outage Recovery',
          action: 'Restart DU – Cluster East',
          blastRadius: 182,
          affectedRegions: ['Cairo', 'Giza', 'Alexandria'],
          confidence: 94,
          rollbackReady: true,
          estimatedDuration: 45
        }}
        onApprove={() => {
          setShowApprovalDialog(false);
          alert('✓ Automation approved and executing...');
        }}
        onReject={() => {
          setShowApprovalDialog(false);
          alert('✗ Automation execution cancelled');
        }}
        onClose={() => setShowApprovalDialog(false)}
      />

      {/* New Policy Dialog */}
      {showPolicyDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card border border-border rounded-lg w-full max-w-md p-6 space-y-4 shadow-lg">
            <div>
              <h2 className="text-lg font-bold text-foreground">Create New Policy</h2>
              <p className="text-xs text-muted-foreground mt-1">Define automation constraints and approvals</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-foreground block mb-1">Policy Name</label>
                <input
                  type="text"
                  value={policyForm.name}
                  onChange={(e) => setPolicyForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Production Restrictions"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1">Description</label>
                <textarea
                  value={policyForm.description}
                  onChange={(e) => setPolicyForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe this policy..."
                  rows={2}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-xs font-bold text-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={policyForm.approvalRequired}
                    onChange={(e) => setPolicyForm(prev => ({ ...prev, approvalRequired: e.target.checked }))}
                    className="rounded border-border"
                  />
                  Require Approval for Execution
                </label>
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-2">Constraints</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={currentConstraint}
                    onChange={(e) => setCurrentConstraint(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && currentConstraint.trim()) {
                        setPolicyForm(prev => ({
                          ...prev,
                          constraints: [...prev.constraints, currentConstraint]
                        }));
                        setCurrentConstraint('');
                      }
                    }}
                    placeholder="Add constraint (press Enter)..."
                    className="flex-1 px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <button
                    onClick={() => {
                      if (currentConstraint.trim()) {
                        setPolicyForm(prev => ({
                          ...prev,
                          constraints: [...prev.constraints, currentConstraint]
                        }));
                        setCurrentConstraint('');
                      }
                    }}
                    className="px-3 py-2 bg-primary text-primary-foreground text-sm font-bold rounded-lg hover:bg-primary/90 transition"
                  >
                    Add
                  </button>
                </div>

                {policyForm.constraints.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {policyForm.constraints.map((constraint, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-1 rounded flex items-center gap-1"
                      >
                        {constraint}
                        <button
                          onClick={() => {
                            setPolicyForm(prev => ({
                              ...prev,
                              constraints: prev.constraints.filter((_, i) => i !== idx)
                            }));
                          }}
                          className="hover:text-gray-900 dark:hover:text-gray-100 font-bold"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setShowPolicyDialog(false)}
                className="px-4 py-2 text-xs font-bold rounded-lg border border-border text-foreground hover:bg-muted transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (policyForm.name.trim()) {
                    const newPolicy = {
                      id: `policy_${Date.now()}`,
                      name: policyForm.name,
                      description: policyForm.description,
                      approvalRequired: policyForm.approvalRequired,
                      constraints: policyForm.constraints
                    };
                    setPolicies(prev => [...prev, newPolicy]);
                    setShowPolicyDialog(false);
                    alert('✓ Policy created successfully!');
                  } else {
                    alert('Please enter a policy name');
                  }
                }}
                className="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-lg hover:bg-primary/90 transition"
              >
                Create Policy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
