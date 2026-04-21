import React, { useState } from 'react';
import { Eye, Hammer, Lock, Plus, Settings, Brain, Lightbulb, Shield, Map, TrendingUp, Play, Pause, Calendar, Pencil, Trash2, Copy, Cpu, SlidersHorizontal } from 'lucide-react';
import { AutomationCommandCenter } from '../components/AutomationCommandCenter';
import { WorkflowBuilder } from '../components/WorkflowBuilder';
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
import { SearchBar } from '@/components/ui/search-bar';

type SuperDomain = 'awareness' | 'design' | 'execution';
type WorkspaceType =
  | 'command_center'
  | 'ai_hub'
  | 'impact_engine'
  | 'learning_engine'
  | 'trust_scoring'
  | 'builder'
  | 'workflow_library'
  | 'ai_models'
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
  { id: 'builder', label: 'Automation Workflow', domain: 'design' },
  { id: 'workflow_library', label: 'Saved Workflows', domain: 'design' },
  { id: 'ai_models', label: 'AI Models', domain: 'design' },
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

interface AutomationRunbook {
  overview: string;
  purpose: string;
  prerequisites: string;
  executionNotes: string;
  rollbackPlan: string;
  escalationPath: string;
  safetyNotes: string;
  approvals: string;
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

type ModelStatus = 'draft' | 'active' | 'inactive';
interface AIModelTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  requiredFields: Array<{ key: string; label: string; type: 'text' | 'number' | 'select'; options?: string[] }>;
}

interface ConfiguredModelRecord {
  id: string;
  templateId: string;
  modelName: string;
  category: string;
  status: ModelStatus;
  schedule: WorkflowSchedule;
  inputs: Record<string, string>;
  scope: string;
  owner: string;
  createdAt: string;
  updatedAt: string;
}

export const AutomationManagement: React.FC = () => {
  const [activeDomain, setActiveDomain] = useState<SuperDomain>('awareness');
  const [activeWorkspace, setActiveWorkspace] = useState<WorkspaceType>('command_center');
  const [automationTab, setAutomationTab] = useState<'design' | 'runbook'>('design');
  const [automationDraft, setAutomationDraft] = useState({
    id: `automation_${Date.now()}`,
    name: 'New Automation',
    status: 'draft' as WorkflowStatus,
    owner: 'Automation Operator',
    version: 1,
    graphDefinition: undefined as any,
    runbook: {
      overview: '',
      purpose: '',
      prerequisites: '',
      executionNotes: '',
      rollbackPlan: '',
      escalationPath: '',
      safetyNotes: '',
      approvals: ''
    } as AutomationRunbook
  });
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [showPolicyDialog, setShowPolicyDialog] = useState(false);
  const [policies, setPolicies] = useState(generateMockPolicies());
  const [savedWorkflows, setSavedWorkflows] = useState<SavedWorkflowRecord[]>([]);
  const [workflowSearch, setWorkflowSearch] = useState('');
  const [workflowStatusFilter, setWorkflowStatusFilter] = useState<'all' | WorkflowStatus>('all');
  const [editingWorkflowId, setEditingWorkflowId] = useState<string | null>(null);
  const [deleteWorkflowId, setDeleteWorkflowId] = useState<string | null>(null);
  const [scheduleWorkflowId, setScheduleWorkflowId] = useState<string | null>(null);
  const [aiModelsTab, setAiModelsTab] = useState<'setup' | 'management'>('setup');
  const [modelSearch, setModelSearch] = useState('');
  const [selectedModelTemplateId, setSelectedModelTemplateId] = useState<string>('');
  const [configuredModels, setConfiguredModels] = useState<ConfiguredModelRecord[]>([]);
  const [modelFormInputs, setModelFormInputs] = useState<Record<string, string>>({});
  const [modelFormName, setModelFormName] = useState('');
  const [modelFormScope, setModelFormScope] = useState('Network');
  const [modelFormSchedule, setModelFormSchedule] = useState<WorkflowSchedule>({
    enabled: false,
    daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    startTime: '09:00',
    endTime: '18:00',
    timezone: 'UTC',
  });
  const [modelFormErrors, setModelFormErrors] = useState<string[]>([]);
  const [editingModelId, setEditingModelId] = useState<string | null>(null);
  const [modelManagementSearch, setModelManagementSearch] = useState('');
  const [modelStatusFilter, setModelStatusFilter] = useState<'all' | ModelStatus>('all');
  const [modelCategoryFilter, setModelCategoryFilter] = useState<'all' | string>('all');
  const [policyForm, setPolicyForm] = useState<PolicyForm>({
    name: '',
    description: '',
    approvalRequired: false,
    constraints: []
  });
  const [currentConstraint, setCurrentConstraint] = useState('');

  const aiModelTemplates: AIModelTemplate[] = [
    {
      id: 'anomaly_detection',
      name: 'Anomaly Detection',
      category: 'Detection',
      description: 'Detects abnormal KPI and alarm behavior patterns in near real time.',
      requiredFields: [
        { key: 'kpiSource', label: 'KPI Source', type: 'select', options: ['RAN KPI Stream', 'Transport KPI Stream', 'Core KPI Stream'] },
        { key: 'sensitivity', label: 'Sensitivity (1-10)', type: 'number' },
        { key: 'threshold', label: 'Anomaly Threshold', type: 'number' },
      ],
    },
    {
      id: 'forecasting',
      name: 'Traffic Forecasting',
      category: 'Forecasting',
      description: 'Forecasts future traffic and congestion risk for proactive operations.',
      requiredFields: [
        { key: 'historyWindow', label: 'History Window (days)', type: 'number' },
        { key: 'predictionHorizon', label: 'Prediction Horizon (hours)', type: 'number' },
        { key: 'dataSource', label: 'Data Source', type: 'select', options: ['Data Lake', 'Streaming Bus', 'Warehouse'] },
      ],
    },
    {
      id: 'root_cause',
      name: 'Root Cause Analyzer',
      category: 'RCA',
      description: 'Correlates alarms/KPIs to identify probable root cause with decision hints.',
      requiredFields: [
        { key: 'alarmSource', label: 'Alarm Source', type: 'select', options: ['OSS Alarm Feed', 'Unified Alarm Bus'] },
        { key: 'confidenceFloor', label: 'Minimum Confidence %', type: 'number' },
        { key: 'dependencyGraph', label: 'Dependency Graph Version', type: 'text' },
      ],
    },
    {
      id: 'recommendation',
      name: 'Optimization Recommender',
      category: 'Optimization',
      description: 'Recommends autonomous optimization actions based on policy constraints.',
      requiredFields: [
        { key: 'policyProfile', label: 'Policy Profile', type: 'select', options: ['Conservative', 'Balanced', 'Aggressive'] },
        { key: 'targetKPI', label: 'Target KPI', type: 'select', options: ['CSSR', 'Latency', 'Drop Rate', 'Throughput'] },
        { key: 'outputDestination', label: 'Output Destination', type: 'text' },
      ],
    },
  ];

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
  const selectedModelTemplate = aiModelTemplates.find((model) => model.id === selectedModelTemplateId) || null;
  const filteredModelTemplates = aiModelTemplates.filter((template) =>
    template.name.toLowerCase().includes(modelSearch.toLowerCase()) ||
    template.category.toLowerCase().includes(modelSearch.toLowerCase())
  );
  const filteredConfiguredModels = configuredModels.filter((model) => {
    const searchMatch = model.modelName.toLowerCase().includes(modelManagementSearch.toLowerCase());
    const statusMatch = modelStatusFilter === 'all' || model.status === modelStatusFilter;
    const categoryMatch = modelCategoryFilter === 'all' || model.category === modelCategoryFilter;
    return searchMatch && statusMatch && categoryMatch;
  });

  const domainWorkspaces = WORKSPACES.filter((workspace) => workspace.domain === activeDomain);

  const resetModelSetupForm = () => {
    setEditingModelId(null);
    setSelectedModelTemplateId('');
    setModelFormName('');
    setModelFormScope('Network');
    setModelFormInputs({});
    setModelFormSchedule({
      enabled: false,
      daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      startTime: '09:00',
      endTime: '18:00',
      timezone: 'UTC',
    });
    setModelFormErrors([]);
  };

  const validateModelForm = () => {
    if (!selectedModelTemplate) return ['Please select a model template.'];
    const errors: string[] = [];
    if (!modelFormName.trim()) errors.push('Model name is required.');
    selectedModelTemplate.requiredFields.forEach((field) => {
      if (!modelFormInputs[field.key]?.toString().trim()) {
        errors.push(`${field.label} is required.`);
      }
    });
    if (modelFormSchedule.enabled && (!modelFormSchedule.startTime || !modelFormSchedule.endTime)) {
      errors.push('Start and end time are required when scheduling is enabled.');
    }
    return errors;
  };

  const handleSaveModelConfiguration = () => {
    const errors = validateModelForm();
    setModelFormErrors(errors);
    if (errors.length > 0 || !selectedModelTemplate) return;

    const now = new Date().toISOString();
    const record: ConfiguredModelRecord = {
      id: editingModelId || `model_${Date.now()}`,
      templateId: selectedModelTemplate.id,
      modelName: modelFormName,
      category: selectedModelTemplate.category,
      status: editingModelId ? configuredModels.find((item) => item.id === editingModelId)?.status || 'draft' : 'draft',
      schedule: modelFormSchedule,
      inputs: modelFormInputs,
      scope: modelFormScope,
      owner: 'AI Operations Team',
      createdAt: editingModelId ? configuredModels.find((item) => item.id === editingModelId)?.createdAt || now : now,
      updatedAt: now,
    };

    setConfiguredModels((prev) => {
      if (editingModelId) {
        return prev.map((item) => (item.id === editingModelId ? record : item));
      }
      return [record, ...prev];
    });
    setAiModelsTab('management');
    resetModelSetupForm();
  };

  const renderWorkspaceContent = () => {
    switch (activeWorkspace) {
      case 'command_center':
        return <AutomationCommandCenter onActivitySelect={(a) => console.log(a)} />;

      case 'ai_hub':
        return <AIDecisionHub onDecisionApprove={(d) => console.log(d)} onDecisionReject={(d) => console.log(d)} />;

      case 'impact_engine':
        return <ClosedLoopValidation />;

      case 'builder':
        return (
          <div className="flex-1 flex flex-col bg-background overflow-hidden">
            <div className="border-b border-border bg-card px-4 py-3 flex flex-wrap items-center gap-3 justify-between">
              <div className="flex items-center gap-2">
                <input
                  value={automationDraft.name}
                  onChange={(e) => setAutomationDraft((prev) => ({ ...prev, name: e.target.value }))}
                  className="px-3 py-1.5 rounded border border-border bg-background text-sm font-semibold"
                />
                <select
                  value={automationDraft.status}
                  onChange={(e) => setAutomationDraft((prev) => ({ ...prev, status: e.target.value as WorkflowStatus }))}
                  className="px-2 py-1.5 rounded border border-border bg-background text-xs"
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <input
                  value={automationDraft.owner}
                  onChange={(e) => setAutomationDraft((prev) => ({ ...prev, owner: e.target.value }))}
                  className="px-3 py-1.5 rounded border border-border bg-background text-xs"
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (!automationDraft.graphDefinition) {
                      alert('Please save the design graph first from the Design tab.');
                      return;
                    }
                    const now = new Date().toISOString();
                    const graph = automationDraft.graphDefinition;
                    const triggerNode = graph.nodes.find((n: any) => n.handles?.every((h: any) => h.type !== 'input'));
                    setSavedWorkflows((prev) => {
                      const record: SavedWorkflowRecord = {
                        id: automationDraft.id,
                        name: automationDraft.name,
                        description: automationDraft.runbook.overview || 'Unified automation workflow',
                        status: automationDraft.status,
                        createdAt: prev.find((x) => x.id === automationDraft.id)?.createdAt || now,
                        updatedAt: now,
                        triggerType: triggerNode?.label || 'Manual Trigger',
                        nodeCount: graph.nodes.length,
                        schedule: prev.find((x) => x.id === automationDraft.id)?.schedule || defaultSchedule,
                        owner: automationDraft.owner,
                        definition: { ...graph, runbook: automationDraft.runbook, version: automationDraft.version }
                      };
                      const existing = prev.some((x) => x.id === record.id);
                      return existing ? prev.map((x) => (x.id === record.id ? record : x)) : [record, ...prev];
                    });
                  }}
                  className="px-3 py-2 rounded-lg border border-border text-xs font-semibold hover:bg-muted"
                >
                  Save Automation
                </button>
                <button
                  onClick={() => setAutomationDraft((prev) => ({ ...prev, status: 'active', version: prev.version + 1 }))}
                  className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90"
                >
                  Publish
                </button>
              </div>
            </div>
            <div className="border-b border-border bg-card px-4 py-2 flex items-center gap-2">
              <button onClick={() => setAutomationTab('design')} className={`px-3 py-1.5 text-xs rounded ${automationTab === 'design' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'}`}>Design</button>
              <button onClick={() => setAutomationTab('runbook')} className={`px-3 py-1.5 text-xs rounded ${automationTab === 'runbook' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'}`}>Runbook</button>
              <span className="text-xs text-muted-foreground ml-auto">Version {automationDraft.version}</span>
            </div>

            {automationTab === 'design' ? (
              <WorkflowBuilder
                initialWorkflow={automationDraft.graphDefinition || workflowBeingEdited?.definition}
                onSave={(workflow) => setAutomationDraft((prev) => ({ ...prev, graphDefinition: workflow }))}
                onCancel={() => {}}
              />
            ) : (
              <div className="flex-1 overflow-y-auto p-4">
                <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    ['overview', 'Automation Overview'],
                    ['purpose', 'Purpose'],
                    ['prerequisites', 'Prerequisites'],
                    ['executionNotes', 'Execution Notes'],
                    ['rollbackPlan', 'Rollback Plan'],
                    ['escalationPath', 'Escalation Path'],
                    ['safetyNotes', 'Safety Notes'],
                    ['approvals', 'Approvals / Operational Guidance'],
                  ].map(([key, label]) => (
                    <div key={key} className="bg-card border border-border rounded-lg p-3">
                      <label className="text-xs font-bold text-foreground block mb-1">{label}</label>
                      <textarea
                        value={(automationDraft.runbook as any)[key]}
                        onChange={(e) => setAutomationDraft((prev) => ({ ...prev, runbook: { ...prev.runbook, [key]: e.target.value } }))}
                        rows={4}
                        className="w-full px-2 py-1.5 text-xs rounded border border-border bg-background"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
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
                    setActiveWorkspace('builder');
                    setAutomationTab('design');
                  }}
                  className="px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  New Workflow
                </button>
              </div>

              <div className="bg-card border border-border rounded-lg p-3 flex flex-col md:flex-row gap-2 md:items-center">
                <SearchBar
                  value={workflowSearch}
                  onChange={(e) => setWorkflowSearch(e.target.value)}
                  placeholder="Search workflow by name..."
                  containerClassName="flex-1"
                />
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
                            setActiveWorkspace('builder');
                            setAutomationTab('design');
                            setAutomationDraft((prev) => ({
                              ...prev,
                              id: workflow.id,
                              name: workflow.name,
                              status: workflow.status,
                              owner: workflow.owner,
                              graphDefinition: workflow.definition,
                              runbook: workflow.definition?.runbook || prev.runbook
                            }));
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

      case 'ai_models':
        return (
          <div className="flex-1 overflow-y-auto p-4 bg-background">
            <div className="max-w-6xl mx-auto space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-foreground flex items-center gap-2"><Cpu className="w-5 h-5 text-primary" /> AI Models</h2>
                  <p className="text-xs text-muted-foreground">Configure, schedule, and manage operational AI models.</p>
                </div>
              </div>

              <div className="flex gap-1 bg-muted/40 p-1 rounded-lg w-fit">
                <button
                  onClick={() => setAiModelsTab('setup')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md ${aiModelsTab === 'setup' ? 'bg-card border border-border text-foreground' : 'text-muted-foreground'}`}
                >
                  Model Setup
                </button>
                <button
                  onClick={() => setAiModelsTab('management')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md ${aiModelsTab === 'management' ? 'bg-card border border-border text-foreground' : 'text-muted-foreground'}`}
                >
                  Model Management
                </button>
              </div>

              {aiModelsTab === 'setup' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="bg-card border border-border rounded-lg p-3 space-y-3">
                    <SearchBar
                      value={modelSearch}
                      onChange={(e) => setModelSearch(e.target.value)}
                      placeholder="Search model..."
                    />
                    <div className="space-y-2 max-h-[480px] overflow-y-auto">
                      {filteredModelTemplates.map((template) => (
                        <button
                          key={template.id}
                          onClick={() => {
                            setSelectedModelTemplateId(template.id);
                            setModelFormErrors([]);
                          }}
                          className={`w-full text-left p-3 rounded-lg border transition ${selectedModelTemplateId === template.id ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/30'}`}
                        >
                          <p className="text-sm font-semibold text-foreground">{template.name}</p>
                          <p className="text-[11px] text-muted-foreground mt-1">{template.category} • {template.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="lg:col-span-2 bg-card border border-border rounded-lg p-4 space-y-4">
                    {!selectedModelTemplate ? (
                      <div className="h-full min-h-[320px] flex items-center justify-center text-sm text-muted-foreground">
                        Select a model from the left panel to configure required inputs.
                      </div>
                    ) : (
                      <>
                        <div className="space-y-1">
                          <h3 className="text-base font-bold text-foreground">{selectedModelTemplate.name} Setup</h3>
                          <p className="text-xs text-muted-foreground">{selectedModelTemplate.description}</p>
                        </div>

                        {modelFormErrors.length > 0 && (
                          <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive space-y-1">
                            {modelFormErrors.map((error, idx) => <p key={idx}>• {error}</p>)}
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs font-semibold text-foreground block mb-1">Configured Model Name *</label>
                            <input
                              value={modelFormName}
                              onChange={(e) => setModelFormName(e.target.value)}
                              className="w-full px-3 py-2 rounded border border-border bg-background text-sm"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-foreground block mb-1">Scope *</label>
                            <select
                              value={modelFormScope}
                              onChange={(e) => setModelFormScope(e.target.value)}
                              className="w-full px-3 py-2 rounded border border-border bg-background text-sm"
                            >
                              <option>Network</option>
                              <option>Region</option>
                              <option>Cluster</option>
                              <option>Site</option>
                            </select>
                          </div>

                          {selectedModelTemplate.requiredFields.map((field) => (
                            <div key={field.key}>
                              <label className="text-xs font-semibold text-foreground block mb-1">{field.label} *</label>
                              {field.type === 'select' ? (
                                <select
                                  value={modelFormInputs[field.key] || ''}
                                  onChange={(e) => setModelFormInputs((prev) => ({ ...prev, [field.key]: e.target.value }))}
                                  className="w-full px-3 py-2 rounded border border-border bg-background text-sm"
                                >
                                  <option value="">Select...</option>
                                  {field.options?.map((option) => <option key={option}>{option}</option>)}
                                </select>
                              ) : (
                                <input
                                  type={field.type}
                                  value={modelFormInputs[field.key] || ''}
                                  onChange={(e) => setModelFormInputs((prev) => ({ ...prev, [field.key]: e.target.value }))}
                                  className="w-full px-3 py-2 rounded border border-border bg-background text-sm"
                                />
                              )}
                            </div>
                          ))}
                        </div>

                        <div className="rounded-lg border border-border p-3 space-y-3">
                          <h4 className="text-sm font-semibold text-foreground flex items-center gap-2"><SlidersHorizontal className="w-4 h-4" /> Scheduling</h4>
                          <label className="flex items-center gap-2 text-xs text-foreground">
                            <input
                              type="checkbox"
                              checked={modelFormSchedule.enabled}
                              onChange={(e) => setModelFormSchedule((prev) => ({ ...prev, enabled: e.target.checked }))}
                            />
                            Enable schedule window (disable = always active)
                          </label>
                          <div className="grid grid-cols-7 gap-1">
                            {(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as WorkflowDay[]).map((day) => {
                              const selected = modelFormSchedule.daysOfWeek.includes(day);
                              return (
                                <button
                                  key={day}
                                  onClick={() =>
                                    setModelFormSchedule((prev) => ({
                                      ...prev,
                                      daysOfWeek: selected ? prev.daysOfWeek.filter((d) => d !== day) : [...prev.daysOfWeek, day],
                                    }))
                                  }
                                  className={`px-2 py-1 rounded text-xs border ${selected ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground'}`}
                                >
                                  {day}
                                </button>
                              );
                            })}
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <input type="time" value={modelFormSchedule.startTime} onChange={(e) => setModelFormSchedule((prev) => ({ ...prev, startTime: e.target.value }))} className="px-2 py-1.5 rounded border border-border bg-background text-sm" />
                            <input type="time" value={modelFormSchedule.endTime} onChange={(e) => setModelFormSchedule((prev) => ({ ...prev, endTime: e.target.value }))} className="px-2 py-1.5 rounded border border-border bg-background text-sm" />
                            <input value={modelFormSchedule.timezone} onChange={(e) => setModelFormSchedule((prev) => ({ ...prev, timezone: e.target.value }))} className="px-2 py-1.5 rounded border border-border bg-background text-sm" placeholder="Timezone" />
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-2">
                          <button onClick={resetModelSetupForm} className="px-3 py-1.5 rounded border border-border text-sm hover:bg-muted">Reset</button>
                          <button onClick={handleSaveModelConfiguration} className="px-3 py-1.5 rounded bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90">
                            {editingModelId ? 'Update Model' : 'Save Configuration'}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="bg-card border border-border rounded-lg p-3 grid grid-cols-1 md:grid-cols-4 gap-2">
                    <SearchBar
                      value={modelManagementSearch}
                      onChange={(e) => setModelManagementSearch(e.target.value)}
                      placeholder="Search configured model..."
                      containerClassName="md:col-span-2"
                    />
                    <select value={modelStatusFilter} onChange={(e) => setModelStatusFilter(e.target.value as any)} className="px-2 py-1.5 rounded border border-border bg-background text-sm">
                      <option value="all">All status</option>
                      <option value="draft">Draft</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                    <select value={modelCategoryFilter} onChange={(e) => setModelCategoryFilter(e.target.value)} className="px-2 py-1.5 rounded border border-border bg-background text-sm">
                      <option value="all">All categories</option>
                      {[...new Set(configuredModels.map((model) => model.category))].map((cat) => <option key={cat}>{cat}</option>)}
                    </select>
                  </div>

                  <div className="bg-card border border-border rounded-lg overflow-hidden">
                    <div className="grid grid-cols-12 gap-2 px-3 py-2 text-[11px] font-semibold text-muted-foreground border-b border-border bg-muted/30">
                      <div className="col-span-3">Model</div>
                      <div className="col-span-2">Category</div>
                      <div className="col-span-1">Status</div>
                      <div className="col-span-3">Schedule</div>
                      <div className="col-span-1">Updated</div>
                      <div className="col-span-2 text-right">Actions</div>
                    </div>
                    {filteredConfiguredModels.length === 0 ? (
                      <div className="p-8 text-center text-sm text-muted-foreground">No configured models found.</div>
                    ) : (
                      filteredConfiguredModels.map((model) => (
                        <div key={model.id} className="grid grid-cols-12 gap-2 px-3 py-2.5 border-b border-border/60 text-xs items-center hover:bg-muted/20">
                          <div className="col-span-3">
                            <p className="font-semibold text-foreground">{model.modelName}</p>
                            <p className="text-muted-foreground">{model.scope} • {model.owner}</p>
                          </div>
                          <div className="col-span-2 text-muted-foreground">{model.category}</div>
                          <div className="col-span-1">
                            <span className={`px-2 py-1 rounded-full text-[10px] font-semibold ${model.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300' : model.status === 'inactive' ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'}`}>{model.status}</span>
                          </div>
                          <div className="col-span-3 text-muted-foreground">{getScheduleSummary(model.schedule, model.status === 'draft' ? 'active' : model.status)}</div>
                          <div className="col-span-1 text-muted-foreground">{new Date(model.updatedAt).toLocaleDateString()}</div>
                          <div className="col-span-2 flex items-center justify-end gap-1">
                            <button
                              onClick={() => {
                                setAiModelsTab('setup');
                                setEditingModelId(model.id);
                                setSelectedModelTemplateId(model.templateId);
                                setModelFormName(model.modelName);
                                setModelFormScope(model.scope);
                                setModelFormInputs(model.inputs);
                                setModelFormSchedule(model.schedule);
                              }}
                              className="p-1.5 rounded border border-border hover:bg-muted"
                              title="Edit model"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setConfiguredModels((prev) => prev.map((item) => item.id === model.id ? { ...item, status: item.status === 'active' ? 'inactive' : 'active', updatedAt: new Date().toISOString() } : item))}
                              className="p-1.5 rounded border border-border hover:bg-muted"
                              title="Activate/Deactivate"
                            >
                              {model.status === 'active' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              onClick={() => setConfiguredModels((prev) => prev.filter((item) => item.id !== model.id))}
                              className="p-1.5 rounded border border-destructive/40 text-destructive hover:bg-destructive/10"
                              title="Delete model"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
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
      {/* Primary Section Navigation */}
      <div className="bg-card border-b border-border rounded-lg p-4 mx-2 mt-2">
        <div className="grid grid-cols-1 gap-2 auto-rows-max md:grid-cols-3">
          {DOMAINS.map(domain => {
            const Icon = domain.icon;
            return (
              <button
                key={domain.id}
                onClick={() => {
                  setActiveDomain(domain.id as SuperDomain);
                  setActiveWorkspace(WORKSPACES.find(w => w.domain === domain.id)?.id || 'command_center');
                }}
                className={`flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 transition min-h-[180px] ${
                  activeDomain === domain.id
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-950'
                    : 'border-border hover:border-primary/40 bg-card'
                }`}
                title={domain.label}
              >
                <Icon className={`w-6 h-6 flex-shrink-0 ${activeDomain === domain.id ? 'text-blue-600 dark:text-blue-400' : 'text-muted-foreground'}`} />
                <span className="text-xs font-semibold text-center text-foreground line-clamp-2 leading-tight">{domain.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-card/40 border-b border-border rounded-lg p-3 mx-2 mt-2">
        <div
          className="grid w-full items-stretch"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}
        >
          {domainWorkspaces.map((workspace) => (
            <button
              key={workspace.id}
              onClick={() => setActiveWorkspace(workspace.id)}
              className={`w-full h-full flex items-center justify-center text-center rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                activeWorkspace === workspace.id
                  ? 'border-primary/40 bg-primary/10 text-primary'
                  : 'border-border bg-card hover:border-primary/30 text-muted-foreground hover:text-foreground'
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
