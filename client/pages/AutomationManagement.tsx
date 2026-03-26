import React, { useState } from 'react';
import { Eye, Hammer, Lock, Plus, Settings, Brain, Lightbulb, Shield, Map, TrendingUp } from 'lucide-react';
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

export const AutomationManagement: React.FC = () => {
  const [activeDomain, setActiveDomain] = useState<SuperDomain>('awareness');
  const [activeWorkspace, setActiveWorkspace] = useState<WorkspaceType>('command_center');
  const [showBuilder, setShowBuilder] = useState(false);
  const [showRunbook, setShowRunbook] = useState(false);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [showPolicyDialog, setShowPolicyDialog] = useState(false);
  const [policies, setPolicies] = useState(generateMockPolicies());
  const [runbooks, setRunbooks] = useState<SavedRunbook[]>([]);
  const [policyForm, setPolicyForm] = useState<PolicyForm>({
    name: '',
    description: '',
    approvalRequired: false,
    constraints: []
  });
  const [currentConstraint, setCurrentConstraint] = useState('');

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
            onSave={() => {
              setShowBuilder(false);
              alert('✓ Automation workflow saved successfully!');
            }}
            onCancel={() => setShowBuilder(false)}
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
