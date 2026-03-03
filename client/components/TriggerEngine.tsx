import React, { useState } from 'react';
import {
  Plus, Trash2, Edit2, Save, X, Shield, AlertCircle, CheckCircle,
  Copy, Settings, Power, Eye, EyeOff, ChevronDown, Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

type PolicyType = 'scope-limit' | 'approval-required' | 'time-window' | 'resource-limit' | 'impact-threshold';
type PolicyStatus = 'active' | 'disabled' | 'scheduled';
type PolicyPriority = 'low' | 'medium' | 'high' | 'critical';

interface Policy {
  id: string;
  name: string;
  type: PolicyType;
  description: string;
  status: PolicyStatus;
  priority: PolicyPriority;
  conditions: Record<string, any>;
  actions: string[];
  createdAt: string;
  lastModified: string;
  createdBy: string;
}

interface Guardrail {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  rules: string[];
  appliedTo: string[];
  impact: 'low' | 'medium' | 'high';
}

const POLICY_TYPES: Record<PolicyType, { icon: string; description: string; color: string; templates: string[] }> = {
  'scope-limit': {
    icon: '🎯',
    description: 'Limit action scope to specific infrastructure',
    color: 'bg-blue-100 dark:bg-blue-950 border-blue-300 dark:border-blue-700',
    templates: ['Exclude critical sites', 'Limit to specific regions', 'Restrict to test environments']
  },
  'approval-required': {
    icon: '👤',
    description: 'Require human approval before execution',
    color: 'bg-purple-100 dark:bg-purple-950 border-purple-300 dark:border-purple-700',
    templates: ['Manager approval for critical changes', 'Multi-person approval', 'Approval with escalation']
  },
  'time-window': {
    icon: '⏰',
    description: 'Only execute during specific time windows',
    color: 'bg-amber-100 dark:bg-amber-950 border-amber-300 dark:border-amber-700',
    templates: ['Business hours only', 'Maintenance window only', 'Peak hours excluded']
  },
  'resource-limit': {
    icon: '📊',
    description: 'Limit resource usage per execution',
    color: 'bg-green-100 dark:bg-green-950 border-green-300 dark:border-green-700',
    templates: ['CPU limit 80%', 'Memory limit 4GB', 'Parallel execution limit']
  },
  'impact-threshold': {
    icon: '⚠️',
    description: 'Stop if predicted impact exceeds threshold',
    color: 'bg-red-100 dark:bg-red-950 border-red-300 dark:border-red-700',
    templates: ['Stop if > 100 affected nodes', 'Stop if > 5 min downtime', 'Stop if > 50% traffic impact']
  }
};

const defaultGuardrails: Guardrail[] = [
  {
    id: 'guard_1',
    name: 'Traffic Impact Safeguard',
    description: 'Stop automation if traffic drops > 30%',
    enabled: true,
    rules: ['traffic_change < -30%', 'alert_threshold_exceeded'],
    appliedTo: ['*'],
    impact: 'high'
  },
  {
    id: 'guard_2',
    name: 'CPU Spike Protection',
    description: 'Pause automation if CPU usage > 85%',
    enabled: true,
    rules: ['cpu_usage > 85%'],
    appliedTo: ['*'],
    impact: 'high'
  },
  {
    id: 'guard_3',
    name: 'Memory Threshold Guard',
    description: 'Stop if available memory < 1GB',
    enabled: true,
    rules: ['available_memory < 1GB'],
    appliedTo: ['*'],
    impact: 'medium'
  }
];

const defaultPolicies: Policy[] = [
  {
    id: 'policy_1',
    name: 'Critical Sites Protection',
    type: 'scope-limit',
    description: 'Prevent automations from affecting Tier-1 sites without approval',
    status: 'active',
    priority: 'critical',
    conditions: { excludeSites: ['Site-01', 'Site-02', 'Site-03'] },
    actions: ['require_approval', 'log_attempt'],
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    lastModified: new Date().toLocaleDateString(),
    createdBy: 'Admin'
  },
  {
    id: 'policy_2',
    name: 'Change Management Policy',
    type: 'approval-required',
    description: 'All changes to production systems require manager approval',
    status: 'active',
    priority: 'high',
    conditions: { requireApprover: ['manager', 'director'] },
    actions: ['send_notification', 'create_ticket', 'log_change'],
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    lastModified: new Date().toLocaleDateString(),
    createdBy: 'Admin'
  }
];

export const TriggerEngine: React.FC = () => {
  const [policies, setPolicies] = useState<Policy[]>(defaultPolicies);
  const [guardrails, setGuardrails] = useState<Guardrail[]>(defaultGuardrails);
  const [editingPolicy, setEditingPolicy] = useState<Policy | null>(null);
  const [newPolicy, setNewPolicy] = useState<Partial<Policy> | null>(null);
  const [selectedPolicyId, setSelectedPolicyId] = useState<string | null>(policies[0]?.id || null);
  const [showPolicyForm, setShowPolicyForm] = useState(false);
  const [selectedPolicyType, setSelectedPolicyType] = useState<PolicyType | null>(null);

  const handleAddPolicy = () => {
    if (!newPolicy || !newPolicy.name || !newPolicy.type) {
      alert('Please fill in all required fields');
      return;
    }

    const policy: Policy = {
      id: `policy_${Date.now()}`,
      name: newPolicy.name,
      type: newPolicy.type,
      description: newPolicy.description || '',
      status: 'active',
      priority: (newPolicy.priority as PolicyPriority) || 'medium',
      conditions: {},
      actions: [],
      createdAt: new Date().toLocaleDateString(),
      lastModified: new Date().toLocaleDateString(),
      createdBy: 'Current User'
    };

    setPolicies([...policies, policy]);
    setNewPolicy(null);
    setShowPolicyForm(false);
    setSelectedPolicyId(policy.id);
    alert('✓ Policy created successfully!');
  };

  const deletePolicy = (id: string) => {
    if (confirm('Are you sure you want to delete this policy?')) {
      setPolicies(policies.filter(p => p.id !== id));
      if (selectedPolicyId === id) setSelectedPolicyId(policies[0]?.id || null);
    }
  };

  const duplicatePolicy = (id: string) => {
    const policy = policies.find(p => p.id === id);
    if (!policy) return;

    const newPolicy: Policy = {
      ...policy,
      id: `policy_${Date.now()}`,
      name: `${policy.name} (Copy)`,
      createdAt: new Date().toLocaleDateString(),
      lastModified: new Date().toLocaleDateString()
    };

    setPolicies([...policies, newPolicy]);
    setSelectedPolicyId(newPolicy.id);
  };

  const togglePolicy = (id: string) => {
    setPolicies(policies.map(p =>
      p.id === id
        ? { ...p, status: p.status === 'active' ? 'disabled' : 'active', lastModified: new Date().toLocaleDateString() }
        : p
    ));
  };

  const toggleGuardrail = (id: string) => {
    setGuardrails(guardrails.map(g =>
      g.id === id ? { ...g, enabled: !g.enabled } : g
    ));
  };

  const selectedPolicy = policies.find(p => p.id === selectedPolicyId);

  return (
    <div className="w-full h-full flex flex-col bg-background overflow-hidden">
      <div className="flex flex-col lg:flex-row gap-4 p-4 flex-1 overflow-hidden">
        {/* Policies List */}
        <div className="lg:w-96 flex flex-col border border-border rounded-lg bg-card overflow-hidden">
          <div className="p-4 border-b border-border">
            <p className="text-sm font-bold text-foreground mb-3">Automation Policies ({policies.length})</p>
            <button
              onClick={() => {
                setShowPolicyForm(true);
                setSelectedPolicyType(null);
                setNewPolicy({});
              }}
              className="w-full px-3 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition flex items-center justify-center gap-2"
            >
              <Plus className="w-3 h-3" /> Create Policy
            </button>
          </div>

          {/* Policies List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {policies.length === 0 ? (
              <div className="p-4 text-center text-xs text-muted-foreground">
                No policies created yet
              </div>
            ) : (
              policies.map(policy => (
                <button
                  key={policy.id}
                  onClick={() => setSelectedPolicyId(policy.id)}
                  className={cn(
                    'w-full p-3 rounded-lg border-2 transition text-left hover:shadow-sm',
                    selectedPolicyId === policy.id
                      ? 'border-primary bg-primary/10'
                      : `border-border bg-card ${POLICY_TYPES[policy.type].color}`
                  )}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-foreground truncate">{policy.name}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{POLICY_TYPES[policy.type].icon} {policy.type.replace('-', ' ')}</p>
                    </div>
                    <span
                      className={cn(
                        'text-xs font-bold px-2 py-0.5 rounded flex-shrink-0',
                        policy.status === 'active'
                          ? 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300'
                          : 'bg-muted text-muted-foreground'
                      )}
                    >
                      {policy.status === 'active' ? '✓' : '✗'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <span className={cn(
                      'px-1.5 py-0.5 rounded text-xs font-bold',
                      policy.priority === 'critical' && 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300',
                      policy.priority === 'high' && 'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300',
                      policy.priority === 'medium' && 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300',
                      policy.priority === 'low' && 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                    )}>
                      {policy.priority.toUpperCase()}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Policy Details or Form */}
        {showPolicyForm ? (
          /* Policy Creation Form */
          <div className="flex-1 flex flex-col border border-border rounded-lg bg-card overflow-hidden">
            <div className="p-4 border-b border-border">
              <h2 className="text-lg font-bold text-foreground">Create New Policy</h2>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Step 1: Select Type */}
              {!selectedPolicyType ? (
                <div>
                  <p className="text-sm font-bold text-foreground mb-3">Step 1: Select Policy Type</p>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(POLICY_TYPES).map(([type, config]) => (
                      <button
                        key={type}
                        onClick={() => {
                          setSelectedPolicyType(type as PolicyType);
                          setNewPolicy({ ...newPolicy, type: type as PolicyType });
                        }}
                        className={cn(
                          'p-3 rounded-lg border-2 transition text-left',
                          `${config.color} hover:shadow-md`
                        )}
                      >
                        <div className="text-lg mb-1">{config.icon}</div>
                        <p className="font-bold text-xs">{type.replace('-', ' ').toUpperCase()}</p>
                        <p className="text-[10px] opacity-75 mt-1">{config.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                /* Step 2: Configure Policy */
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-bold text-foreground">Step 2: Configure Policy</p>
                    <button
                      onClick={() => {
                        setSelectedPolicyType(null);
                        setNewPolicy({});
                      }}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      ← Change Type
                    </button>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-foreground block mb-1">Policy Name *</label>
                    <input
                      type="text"
                      value={newPolicy.name || ''}
                      onChange={(e) => setNewPolicy({ ...newPolicy, name: e.target.value })}
                      placeholder="e.g., Critical Sites Protection"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-foreground block mb-1">Description</label>
                    <textarea
                      value={newPolicy.description || ''}
                      onChange={(e) => setNewPolicy({ ...newPolicy, description: e.target.value })}
                      placeholder="What does this policy enforce?"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-foreground block mb-1">Priority</label>
                    <select
                      value={newPolicy.priority || 'medium'}
                      onChange={(e) => setNewPolicy({ ...newPolicy, priority: e.target.value as PolicyPriority })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>

                  {/* Policy Type Templates */}
                  <div>
                    <label className="text-xs font-bold text-foreground block mb-2">Quick Templates</label>
                    <div className="grid grid-cols-1 gap-2">
                      {POLICY_TYPES[selectedPolicyType!].templates.map((template, idx) => (
                        <button
                          key={idx}
                          onClick={() => setNewPolicy({ ...newPolicy, name: template, description: `Policy: ${template}` })}
                          className="p-2 text-left text-xs bg-muted/50 rounded border border-border hover:bg-muted transition"
                        >
                          {template}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="border-t border-border p-4 flex gap-2">
              <button
                onClick={() => {
                  handleAddPolicy();
                }}
                disabled={!newPolicy?.name || !newPolicy?.type}
                className="flex-1 px-3 py-2 text-xs font-bold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Create Policy
              </button>
              <button
                onClick={() => {
                  setShowPolicyForm(false);
                  setNewPolicy(null);
                  setSelectedPolicyType(null);
                }}
                className="flex-1 px-3 py-2 text-xs font-bold rounded-lg border border-border text-foreground hover:bg-muted transition"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : selectedPolicy ? (
          /* Policy Details View */
          <div className="flex-1 flex flex-col border border-border rounded-lg bg-card overflow-hidden">
            <div className="p-4 border-b border-border">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-lg font-bold text-foreground">{selectedPolicy.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {POLICY_TYPES[selectedPolicy.type].description}
                  </p>
                </div>
                <button
                  onClick={() => togglePolicy(selectedPolicy.id)}
                  className={cn(
                    'px-3 py-1.5 text-xs font-semibold rounded-lg transition flex items-center gap-1 flex-shrink-0',
                    selectedPolicy.status === 'active'
                      ? 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  )}
                >
                  {selectedPolicy.status === 'active' ? '✓' : '✗'}
                  {selectedPolicy.status === 'active' ? 'Active' : 'Disabled'}
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div>
                <p className="text-xs font-bold text-foreground mb-2">Type & Priority</p>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="text-muted-foreground font-semibold">Type</p>
                    <p className="text-foreground font-bold mt-1">{selectedPolicy.type.replace('-', ' ').toUpperCase()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground font-semibold">Priority</p>
                    <p className={cn(
                      'font-bold mt-1 text-xs px-2 py-1 rounded w-fit',
                      selectedPolicy.priority === 'critical' && 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300',
                      selectedPolicy.priority === 'high' && 'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300',
                      selectedPolicy.priority === 'medium' && 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300',
                      selectedPolicy.priority === 'low' && 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                    )}>
                      {selectedPolicy.priority.toUpperCase()}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-foreground mb-2">Description</p>
                <p className="text-sm text-muted-foreground">{selectedPolicy.description}</p>
              </div>

              <div className="border-t border-border pt-4">
                <p className="text-xs font-bold text-foreground mb-2">Metadata</p>
                <div className="bg-muted/50 rounded-lg p-3 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created:</span>
                    <span className="text-foreground font-medium">{selectedPolicy.createdAt}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Modified:</span>
                    <span className="text-foreground font-medium">{selectedPolicy.lastModified}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created By:</span>
                    <span className="text-foreground font-medium">{selectedPolicy.createdBy}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="border-t border-border p-4 flex gap-2">
              <button
                onClick={() => duplicatePolicy(selectedPolicy.id)}
                className="flex-1 px-3 py-2 text-xs font-bold rounded-lg border border-border text-foreground hover:bg-muted transition flex items-center justify-center gap-1"
              >
                <Copy className="w-3 h-3" /> Duplicate
              </button>
              <button
                onClick={() => deletePolicy(selectedPolicy.id)}
                className="flex-1 px-3 py-2 text-xs font-bold rounded-lg bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900 transition flex items-center justify-center gap-1"
              >
                <Trash2 className="w-3 h-3" /> Delete
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {/* Guardrails Section */}
      <div className="border-t border-border p-4 bg-muted/30">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            <p className="text-sm font-bold text-foreground">Guardrails ({guardrails.filter(g => g.enabled).length} active)</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {guardrails.map(guard => (
            <div key={guard.id} className={cn(
              'bg-card border-2 rounded-lg p-3 transition',
              guard.enabled ? 'border-green-300 dark:border-green-700' : 'border-border opacity-60'
            )}>
              <div className="flex items-start justify-between mb-2">
                <p className="text-xs font-bold text-foreground flex-1">{guard.name}</p>
                <button
                  onClick={() => toggleGuardrail(guard.id)}
                  className={cn(
                    'px-2 py-1 text-[10px] font-bold rounded-lg transition flex-shrink-0',
                    guard.enabled
                      ? 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  {guard.enabled ? '✓' : '✗'}
                </button>
              </div>
              <p className="text-[11px] text-muted-foreground mb-2">{guard.description}</p>
              <div className="flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-amber-500" />
                <span className="text-[10px] text-muted-foreground">Impact: {guard.impact}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
