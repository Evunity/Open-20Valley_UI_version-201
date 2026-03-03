import React, { useState } from 'react';
import {
  Plus, Trash2, Copy, Shield, AlertCircle, CheckCircle, Edit2, X, Save
} from 'lucide-react';
import { cn } from '@/lib/utils';

type PolicyType = 'scope-limit' | 'approval-required' | 'time-window' | 'resource-limit' | 'impact-threshold';
type PolicyStatus = 'active' | 'disabled';
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

const POLICY_TYPES: Record<PolicyType, { icon: string; description: string; color: string }> = {
  'scope-limit': {
    icon: '🎯',
    description: 'Limit action scope',
    color: 'text-blue-600'
  },
  'approval-required': {
    icon: '👤',
    description: 'Require approval',
    color: 'text-purple-600'
  },
  'time-window': {
    icon: '⏰',
    description: 'Execute at specific times',
    color: 'text-amber-600'
  },
  'resource-limit': {
    icon: '📊',
    description: 'Limit resource usage',
    color: 'text-green-600'
  },
  'impact-threshold': {
    icon: '⚠️',
    description: 'Stop if impact exceeds',
    color: 'text-red-600'
  }
};

const defaultGuardrails: Guardrail[] = [
  {
    id: 'guard_1',
    name: 'Traffic Impact Safeguard',
    description: 'Stop automation if traffic drops > 30%',
    enabled: true,
    rules: ['traffic_change < -30%'],
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
  }
];

const defaultPolicies: Policy[] = [
  {
    id: 'policy_1',
    name: 'Critical Sites Protection',
    type: 'scope-limit',
    description: 'Prevent changes to critical sites',
    status: 'active',
    priority: 'critical',
    conditions: {},
    actions: [],
    createdAt: new Date().toLocaleDateString(),
    lastModified: new Date().toLocaleDateString(),
    createdBy: 'Admin'
  }
];

export const TriggerEngine: React.FC = () => {
  const [policies, setPolicies] = useState<Policy[]>(defaultPolicies);
  const [guardrails, setGuardrails] = useState<Guardrail[]>(defaultGuardrails);
  const [activeTab, setActiveTab] = useState<'policies' | 'guardrails'>('policies');
  const [selectedPolicyId, setSelectedPolicyId] = useState<string | null>(policies[0]?.id || null);
  const [showAddPolicy, setShowAddPolicy] = useState(false);
  const [newPolicyName, setNewPolicyName] = useState('');
  const [newPolicyType, setNewPolicyType] = useState<PolicyType>('scope-limit');
  const [newPolicyDescription, setNewPolicyDescription] = useState('');
  const [newPolicyPriority, setNewPolicyPriority] = useState<PolicyPriority>('medium');

  const selectedPolicy = policies.find(p => p.id === selectedPolicyId);

  const handleAddPolicy = () => {
    if (!newPolicyName.trim()) {
      alert('Please enter a policy name');
      return;
    }

    const policy: Policy = {
      id: `policy_${Date.now()}`,
      name: newPolicyName,
      type: newPolicyType,
      description: newPolicyDescription,
      status: 'active',
      priority: newPolicyPriority,
      conditions: {},
      actions: [],
      createdAt: new Date().toLocaleDateString(),
      lastModified: new Date().toLocaleDateString(),
      createdBy: 'Current User'
    };

    setPolicies([...policies, policy]);
    setSelectedPolicyId(policy.id);
    setShowAddPolicy(false);
    setNewPolicyName('');
    setNewPolicyDescription('');
    setNewPolicyPriority('medium');
    alert('✓ Policy created successfully!');
  };

  const deletePolicy = (id: string) => {
    if (confirm('Delete this policy?')) {
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
      createdAt: new Date().toLocaleDateString()
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

  const getPriorityColor = (priority: PolicyPriority) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300';
      case 'high':
        return 'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300';
      case 'medium':
        return 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300';
      case 'low':
        return 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300';
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-background">
      <div className="flex flex-col gap-4 p-4 flex-1 overflow-hidden">
        {/* Tabs */}
        <div className="flex gap-2 border-b border-border pb-3">
          <button
            onClick={() => setActiveTab('policies')}
            className={cn(
              'px-4 py-2 text-sm font-bold border-b-2 transition',
              activeTab === 'policies'
                ? 'text-primary border-b-primary'
                : 'text-muted-foreground border-b-transparent hover:text-foreground'
            )}
          >
            Policies ({policies.length})
          </button>
          <button
            onClick={() => setActiveTab('guardrails')}
            className={cn(
              'px-4 py-2 text-sm font-bold border-b-2 transition',
              activeTab === 'guardrails'
                ? 'text-primary border-b-primary'
                : 'text-muted-foreground border-b-transparent hover:text-foreground'
            )}
          >
            Guardrails ({guardrails.filter(g => g.enabled).length} active)
          </button>
        </div>

        {/* Policies Tab */}
        {activeTab === 'policies' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 overflow-hidden">
            {/* Policies List */}
            <div className="lg:col-span-2 space-y-2 overflow-y-auto">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-bold text-foreground">Automation Policies</p>
                <button
                  onClick={() => setShowAddPolicy(true)}
                  className="px-3 py-1.5 text-xs font-bold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Add Policy
                </button>
              </div>

              {showAddPolicy && (
                <div className="bg-card border border-border rounded-lg p-4 space-y-3 mb-4">
                  <div>
                    <label className="text-xs font-bold text-foreground block mb-1">Policy Name *</label>
                    <input
                      type="text"
                      value={newPolicyName}
                      onChange={(e) => setNewPolicyName(e.target.value)}
                      placeholder="e.g., Critical Sites Protection"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-foreground block mb-1">Type</label>
                      <select
                        value={newPolicyType}
                        onChange={(e) => setNewPolicyType(e.target.value as PolicyType)}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      >
                        {Object.entries(POLICY_TYPES).map(([type, config]) => (
                          <option key={type} value={type}>
                            {config.icon} {type.replace('-', ' ')}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-foreground block mb-1">Priority</label>
                      <select
                        value={newPolicyPriority}
                        onChange={(e) => setNewPolicyPriority(e.target.value as PolicyPriority)}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-foreground block mb-1">Description</label>
                    <textarea
                      value={newPolicyDescription}
                      onChange={(e) => setNewPolicyDescription(e.target.value)}
                      placeholder="What does this policy enforce?"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      rows={2}
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={handleAddPolicy}
                      className="flex-1 px-3 py-2 text-xs font-bold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition"
                    >
                      Create Policy
                    </button>
                    <button
                      onClick={() => {
                        setShowAddPolicy(false);
                        setNewPolicyName('');
                        setNewPolicyDescription('');
                      }}
                      className="flex-1 px-3 py-2 text-xs font-bold rounded-lg border border-border text-foreground hover:bg-muted transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {policies.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-xs">
                  No policies yet. Click "Add Policy" to create one.
                </div>
              ) : (
                policies.map(policy => (
                  <div
                    key={policy.id}
                    onClick={() => setSelectedPolicyId(policy.id)}
                    className={cn(
                      'p-4 rounded-lg border-2 transition cursor-pointer hover:shadow-sm',
                      selectedPolicyId === policy.id
                        ? 'border-primary bg-primary/10'
                        : 'border-border bg-card hover:border-border/80'
                    )}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-start gap-2 flex-1">
                        <span className={cn('text-lg', POLICY_TYPES[policy.type].color)}>
                          {POLICY_TYPES[policy.type].icon}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-foreground">{policy.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{policy.description}</p>
                        </div>
                      </div>
                      <span className={cn('text-xs font-bold px-2 py-1 rounded whitespace-nowrap', getPriorityColor(policy.priority))}>
                        {policy.priority.toUpperCase()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePolicy(policy.id);
                        }}
                        className={cn(
                          'px-2 py-1 text-xs font-bold rounded transition',
                          policy.status === 'active'
                            ? 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300'
                            : 'bg-muted text-muted-foreground'
                        )}
                      >
                        {policy.status === 'active' ? '✓ Active' : '✗ Disabled'}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Policy Details */}
            {selectedPolicy && (
              <div className="bg-card border border-border rounded-lg p-4 flex flex-col gap-4 max-h-96 overflow-y-auto">
                <div>
                  <p className="text-sm font-bold text-foreground mb-3">{selectedPolicy.name}</p>

                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type:</span>
                      <span className="font-semibold text-foreground">{selectedPolicy.type.replace('-', ' ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Priority:</span>
                      <span className={cn('font-bold px-2 py-0.5 rounded text-xs', getPriorityColor(selectedPolicy.priority))}>
                        {selectedPolicy.priority.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <span className="font-semibold text-foreground">{selectedPolicy.status}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Created:</span>
                      <span className="font-semibold text-foreground">{selectedPolicy.createdAt}</span>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground mt-4 mb-4">{selectedPolicy.description}</p>

                  <div className="border-t border-border pt-3 space-y-2">
                    <button
                      onClick={() => duplicatePolicy(selectedPolicy.id)}
                      className="w-full px-3 py-2 text-xs font-bold rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 transition"
                    >
                      <Copy className="w-3 h-3 inline mr-1" /> Duplicate
                    </button>
                    <button
                      onClick={() => deletePolicy(selectedPolicy.id)}
                      className="w-full px-3 py-2 text-xs font-bold rounded-lg bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900 transition"
                    >
                      <Trash2 className="w-3 h-3 inline mr-1" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Guardrails Tab */}
        {activeTab === 'guardrails' && (
          <div className="space-y-3 flex-1 overflow-y-auto">
            <p className="text-sm font-bold text-foreground mb-3">Safety Guardrails</p>
            {guardrails.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-xs">
                No guardrails configured.
              </div>
            ) : (
              guardrails.map(guard => (
                <div
                  key={guard.id}
                  className={cn(
                    'p-4 rounded-lg border-2 transition',
                    guard.enabled ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-950/30' : 'border-border bg-muted/30 opacity-60'
                  )}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1">
                      <p className="text-sm font-bold text-foreground">{guard.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{guard.description}</p>
                    </div>
                    <button
                      onClick={() => toggleGuardrail(guard.id)}
                      className={cn(
                        'px-2 py-1 text-xs font-bold rounded transition flex-shrink-0',
                        guard.enabled
                          ? 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300'
                          : 'bg-muted text-muted-foreground'
                      )}
                    >
                      {guard.enabled ? '✓' : '✗'}
                    </button>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                    <AlertCircle className="w-3 h-3" />
                    <span>Impact: {guard.impact}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
