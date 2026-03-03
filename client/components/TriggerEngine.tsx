import React, { useState } from 'react';
import {
  Plus, Trash2, Edit2, Save, X, Shield, AlertCircle, CheckCircle,
  Copy, Settings, Power, Eye, EyeOff
} from 'lucide-react';
import { cn } from '@/lib/utils';

type PolicyType = 'scope-limit' | 'approval-required' | 'time-window' | 'resource-limit' | 'impact-threshold';
type PolicyStatus = 'active' | 'disabled' | 'scheduled';

interface Policy {
  id: string;
  name: string;
  type: PolicyType;
  description: string;
  status: PolicyStatus;
  priority: 'low' | 'medium' | 'high' | 'critical';
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
  appliedTo: string[]; // automation IDs or types
  impact: 'low' | 'medium' | 'high';
}

const POLICY_TYPES: Record<PolicyType, { icon: string; description: string; color: string }> = {
  'scope-limit': {
    icon: '🎯',
    description: 'Limit action scope to specific infrastructure',
    color: 'bg-blue-100 dark:bg-blue-950 border-blue-300 dark:border-blue-700'
  },
  'approval-required': {
    icon: '👤',
    description: 'Require human approval before execution',
    color: 'bg-purple-100 dark:bg-purple-950 border-purple-300 dark:border-purple-700'
  },
  'time-window': {
    icon: '⏰',
    description: 'Only execute during specific time windows',
    color: 'bg-amber-100 dark:bg-amber-950 border-amber-300 dark:border-amber-700'
  },
  'resource-limit': {
    icon: '📊',
    description: 'Limit resource usage per execution',
    color: 'bg-green-100 dark:bg-green-950 border-green-300 dark:border-green-700'
  },
  'impact-threshold': {
    icon: '⚠️',
    description: 'Stop if predicted impact exceeds threshold',
    color: 'bg-red-100 dark:bg-red-950 border-red-300 dark:border-red-700'
  }
};

export const TriggerEngine: React.FC = () => {
  const [policies, setPolicies] = useState<Policy[]>([
    {
      id: 'policy_1',
      name: 'Critical Sites Protection',
      type: 'scope-limit',
      description: 'Prevent automations from affecting Tier-1 sites without approval',
      status: 'active',
      priority: 'critical',
      conditions: { excludeSites: ['Site-01', 'Site-02'] },
      actions: ['require_approval'],
      createdAt: new Date().toLocaleString(),
      lastModified: new Date().toLocaleString(),
      createdBy: 'Admin'
    }
  ]);

  const [guardrails, setGuardrails] = useState<Guardrail[]>([
    {
      id: 'guard_1',
      name: 'Traffic Impact Safeguard',
      description: 'Stop automation if traffic drops > 30%',
      enabled: true,
      rules: ['traffic_change < -30%', 'alert_threshold_exceeded'],
      appliedTo: ['*'],
      impact: 'high'
    }
  ]);

  const [editingPolicy, setEditingPolicy] = useState<Policy | null>(null);
  const [newPolicy, setNewPolicy] = useState<Partial<Policy> | null>(null);
  const [selectedPolicyId, setSelectedPolicyId] = useState<string | null>(null);

  const handleAddPolicy = () => {
    if (!newPolicy || !newPolicy.name || !newPolicy.type) return;

    const policy: Policy = {
      id: `policy_${Date.now()}`,
      name: newPolicy.name,
      type: newPolicy.type,
      description: newPolicy.description || '',
      status: 'active',
      priority: 'medium',
      conditions: {},
      actions: [],
      createdAt: new Date().toLocaleString(),
      lastModified: new Date().toLocaleString(),
      createdBy: 'Current User'
    };

    setPolicies([...policies, policy]);
    setNewPolicy(null);
    setEditingPolicy(null);
  };

  const deletePolicy = (id: string) => {
    setPolicies(policies.filter(p => p.id !== id));
    if (selectedPolicyId === id) setSelectedPolicyId(null);
  };

  const duplicatePolicy = (id: string) => {
    const policy = policies.find(p => p.id === id);
    if (!policy) return;

    const newPolicy: Policy = {
      ...policy,
      id: `policy_${Date.now()}`,
      name: `${policy.name} (Copy)`,
      createdAt: new Date().toLocaleString(),
      lastModified: new Date().toLocaleString()
    };

    setPolicies([...policies, newPolicy]);
  };

  const togglePolicy = (id: string) => {
    setPolicies(policies.map(p =>
      p.id === id
        ? { ...p, status: p.status === 'active' ? 'disabled' : 'active', lastModified: new Date().toLocaleString() }
        : p
    ));
  };

  const selectedPolicy = policies.find(p => p.id === selectedPolicyId);

  return (
    <div className="w-full h-full flex flex-col bg-background">
      <div className="flex flex-col lg:flex-row gap-4 p-4 flex-1 overflow-hidden">
        {/* Policies List */}
        <div className="lg:w-96 flex flex-col border border-border rounded-lg bg-card overflow-hidden">
          <div className="p-4 border-b border-border">
            <p className="text-sm font-bold text-foreground mb-3">Automation Policies</p>
            <button
              onClick={() => setNewPolicy({})}
              className="w-full px-3 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition flex items-center justify-center gap-2"
            >
              <Plus className="w-3 h-3" /> Create Policy
            </button>
          </div>

          {/* New Policy Form */}
          {newPolicy && (
            <div className="p-4 border-b border-border space-y-3 bg-muted/50">
              <div>
                <label className="text-xs font-bold text-foreground block mb-1">Policy Name</label>
                <input
                  type="text"
                  value={newPolicy.name || ''}
                  onChange={(e) => setNewPolicy({ ...newPolicy, name: e.target.value })}
                  placeholder="e.g., Critical Sites Protection"
                  className="w-full px-2 py-1.5 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1">Policy Type</label>
                <select
                  value={newPolicy.type || ''}
                  onChange={(e) => setNewPolicy({ ...newPolicy, type: e.target.value as PolicyType })}
                  className="w-full px-2 py-1.5 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="">Select type...</option>
                  {Object.entries(POLICY_TYPES).map(([key, val]) => (
                    <option key={key} value={key}>{val.icon} {key.toUpperCase()}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1">Description</label>
                <textarea
                  value={newPolicy.description || ''}
                  onChange={(e) => setNewPolicy({ ...newPolicy, description: e.target.value })}
                  placeholder="What does this policy enforce?"
                  className="w-full px-2 py-1.5 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  rows={2}
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleAddPolicy}
                  disabled={!newPolicy.name || !newPolicy.type}
                  className="flex-1 px-2 py-1.5 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Create
                </button>
                <button
                  onClick={() => {
                    setNewPolicy(null);
                    setEditingPolicy(null);
                  }}
                  className="flex-1 px-2 py-1.5 text-xs font-semibold rounded-lg border border-border text-foreground hover:bg-muted transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Policies List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {policies.length === 0 ? (
              <div className="p-4 text-center text-xs text-muted-foreground">
                No policies created yet. Click "Create Policy" to add one.
              </div>
            ) : (
              policies.map(policy => (
                <button
                  key={policy.id}
                  onClick={() => setSelectedPolicyId(policy.id)}
                  className={cn(
                    'w-full p-3 rounded-lg border-2 transition text-left',
                    selectedPolicyId === policy.id
                      ? 'border-primary bg-primary/10'
                      : `border-border ${POLICY_TYPES[policy.type].color}`
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-foreground truncate">{policy.name}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{POLICY_TYPES[policy.type].icon} {policy.type}</p>
                    </div>
                    <span
                      className={cn(
                        'text-xs font-bold px-2 py-1 rounded flex-shrink-0',
                        policy.status === 'active'
                          ? 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300'
                          : 'bg-muted text-muted-foreground'
                      )}
                    >
                      {policy.status}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Policy Details */}
        {selectedPolicy && (
          <div className="flex-1 flex flex-col border border-border rounded-lg bg-card overflow-hidden">
            <div className="p-4 border-b border-border">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-lg font-bold text-foreground">{selectedPolicy.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {POLICY_TYPES[selectedPolicy.type].description}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => togglePolicy(selectedPolicy.id)}
                    className={cn(
                      'px-3 py-1.5 text-xs font-semibold rounded-lg transition flex items-center gap-1',
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
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Description */}
              <div>
                <p className="text-xs font-bold text-foreground mb-2">Description</p>
                <p className="text-sm text-muted-foreground">{selectedPolicy.description}</p>
              </div>

              {/* Priority & Type */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-bold text-foreground mb-1">Priority</p>
                  <span className={cn(
                    'inline-block px-2 py-1 text-xs font-bold rounded',
                    selectedPolicy.priority === 'critical' && 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300',
                    selectedPolicy.priority === 'high' && 'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300',
                    selectedPolicy.priority === 'medium' && 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300',
                    selectedPolicy.priority === 'low' && 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                  )}>
                    {selectedPolicy.priority.toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground mb-1">Type</p>
                  <p className="text-sm text-foreground">{selectedPolicy.type.toUpperCase().replace('-', ' ')}</p>
                </div>
              </div>

              {/* Metadata */}
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

              {/* Actions List */}
              {selectedPolicy.actions.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-foreground mb-2">Applied Actions</p>
                  <div className="space-y-1">
                    {selectedPolicy.actions.map((action, idx) => (
                      <div key={idx} className="text-xs bg-muted/50 px-2 py-1 rounded flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-status-healthy" />
                        {action}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="border-t border-border p-4 flex gap-2">
              <button
                onClick={() => duplicatePolicy(selectedPolicy.id)}
                className="flex-1 px-3 py-2 text-xs font-semibold rounded-lg border border-border text-foreground hover:bg-muted transition flex items-center justify-center gap-1"
              >
                <Copy className="w-3 h-3" /> Duplicate
              </button>
              <button
                onClick={() => deletePolicy(selectedPolicy.id)}
                className="flex-1 px-3 py-2 text-xs font-semibold rounded-lg bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900 transition flex items-center justify-center gap-1"
              >
                <Trash2 className="w-3 h-3" /> Delete
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Guardrails Section */}
      <div className="border-t border-border p-4 bg-muted/30">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            <p className="text-sm font-bold text-foreground">Guardrails ({guardrails.length})</p>
          </div>
          <button
            className="px-3 py-1 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition flex items-center gap-1"
          >
            <Plus className="w-3 h-3" /> Add Guardrail
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {guardrails.map(guard => (
            <div key={guard.id} className="bg-card border border-border rounded-lg p-3">
              <div className="flex items-start justify-between mb-2">
                <p className="text-xs font-bold text-foreground">{guard.name}</p>
                {guard.enabled ? (
                  <CheckCircle className="w-3 h-3 text-status-healthy" />
                ) : (
                  <div className="w-3 h-3 rounded-full border border-muted-foreground" />
                )}
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
