import React, { useState } from 'react';
import { Eye, Hammer, Lock, Plus, Settings, Brain, Lightbulb, Shield, Map, TrendingUp } from 'lucide-react';
import { AutomationCommandCenter } from '../components/AutomationCommandCenter';
import { AutomationBuilder } from '../components/AutomationBuilder';
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
import { AutomationROI } from '../components/AutomationROI';
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
  | 'heatmap'
  | 'roi';

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
  { id: 'heatmap', label: 'Autonomy Heatmap', domain: 'execution' },
  { id: 'roi', label: 'ROI Panel', domain: 'execution' }
];

const DOMAINS = [
  { id: 'awareness', icon: Eye, label: 'Awareness', color: 'text-blue-600', bgColor: 'bg-blue-50' },
  { id: 'design', icon: Hammer, label: 'Design', color: 'text-purple-600', bgColor: 'bg-purple-50' },
  { id: 'execution', icon: Lock, label: 'Execution', color: 'text-emerald-600', bgColor: 'bg-emerald-50' }
];

export const AutomationManagement: React.FC = () => {
  const [activeDomain, setActiveDomain] = useState<SuperDomain>('awareness');
  const [activeWorkspace, setActiveWorkspace] = useState<WorkspaceType>('command_center');
  const [showBuilder, setShowBuilder] = useState(false);
  const [showRunbook, setShowRunbook] = useState(false);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [policies] = useState(generateMockPolicies());

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
        return (
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            {/* Trigger Engine on left */}
            <div className="w-full lg:w-1/3 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-card overflow-y-auto lg:overflow-y-auto">
              <TriggerEngine />
            </div>
            {/* Pre-Execution Simulation and Builder on right */}
            <div className="w-full lg:w-2/3 flex flex-col overflow-hidden">
              {!showBuilder && (
                <div className="flex-1 border-b border-gray-200">
                  <PreExecutionSimulation />
                </div>
              )}
              {showBuilder ? (
                <div className="flex-1 overflow-hidden">
                  <AutomationBuilder
                    onSave={() => {
                      setShowBuilder(false);
                      alert('Automation saved successfully!');
                    }}
                    onCancel={() => setShowBuilder(false)}
                  />
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center p-4 bg-gray-50">
                  <button
                    onClick={() => setShowBuilder(true)}
                    className="px-6 py-2.5 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 transition flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    New Automation
                  </button>
                </div>
              )}
            </div>
          </div>
        );

      case 'runbook':
        return showRunbook ? (
          <RunbookDesigner
            onSave={() => {
              setShowRunbook(false);
              alert('Runbook saved successfully!');
            }}
            onCancel={() => setShowRunbook(false)}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-4 bg-gray-50">
            <div className="text-center max-w-md">
              <Settings className="w-16 h-16 text-purple-400 mx-auto mb-4 opacity-50" />
              <h2 className="text-lg font-bold text-gray-900 mb-2">Runbook Designer</h2>
              <p className="text-sm text-gray-600 mb-6">
                Build complex workflows with parallel branches, conditionals, and retries
              </p>
              <button
                onClick={() => setShowRunbook(true)}
                className="px-6 py-2.5 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 transition flex items-center gap-2 mx-auto"
              >
                <Plus className="w-4 h-4" />
                New Runbook
              </button>
            </div>
          </div>
        );

      case 'policy':
        return (
          <div className="flex-1 overflow-y-auto p-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Automation Policies</h2>
                <button className="px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition flex items-center gap-1">
                  <Plus className="w-4 h-4" /> New Policy
                </button>
              </div>

              <div className="grid gap-3">
                {policies.map(policy => (
                  <div
                    key={policy.id}
                    className="bg-white rounded-lg border border-gray-200 p-4 hover:border-gray-300 transition"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-sm font-bold text-gray-900">{policy.name}</h3>
                        <p className="text-xs text-gray-600 mt-1">{policy.description}</p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          policy.approvalRequired
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {policy.approvalRequired ? 'Approval Required' : 'Auto-Approved'}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {policy.constraints.map((constraint, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
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

      case 'roi':
        return <AutomationROI />;

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Automation & AI Management</h1>
            <p className="text-sm text-gray-600 mt-1">The autonomous network control plane</p>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-600">
            <span>👁️ Awareness Layer: <strong>Read-only intelligence</strong></span>
            <span>🔨 Design Layer: <strong>Build safely</strong></span>
            <span>🔒 Execution Layer: <strong>Runtime control</strong></span>
          </div>
        </div>
      </div>

      {/* Domain Navigation */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex gap-2">
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
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {domain.label}
            </button>
          );
        })}
      </div>

      {/* Workspace Tabs */}
      <div className="bg-gray-100 border-b border-gray-200 px-6 overflow-x-auto">
        <div className="flex gap-1">
          {domainWorkspaces.map(workspace => (
            <button
              key={workspace.id}
              onClick={() => setActiveWorkspace(workspace.id)}
              className={`px-4 py-3 text-sm font-medium transition border-b-2 ${
                activeWorkspace === workspace.id
                  ? 'bg-white text-blue-600 border-b-blue-600'
                  : 'text-gray-700 border-b-transparent hover:bg-white/50'
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
    </div>
  );
};
