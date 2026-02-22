import { AlertCircle, Lock, LinkIcon, CheckCircle, Info } from 'lucide-react';
import { useState } from 'react';

interface Policy {
  id: string;
  name: string;
  category: string;
  level: 'parent' | 'child';
  status: 'enforced' | 'overridable' | 'inherited';
  description: string;
  inheritedFrom?: string;
  value: string;
  appliesTo: string[];
}

export default function TenantPoliciesControl() {
  const [expandedPolicy, setExpandedPolicy] = useState<string>('policy-1');

  const policies: Policy[] = [
    {
      id: 'policy-1',
      name: 'MFA Requirement',
      category: 'Security',
      level: 'parent',
      status: 'enforced',
      description: 'All users must enable MFA for authentication',
      value: 'Mandatory',
      appliesTo: ['Egypt Operator', 'Saudi Operator', 'Enterprise Network']
    },
    {
      id: 'policy-2',
      name: 'Data Retention',
      category: 'Compliance',
      level: 'parent',
      status: 'enforced',
      description: 'Audit logs must be retained for minimum period',
      value: '7 years (NIST requirement)',
      appliesTo: ['Egypt Operator', 'Saudi Operator']
    },
    {
      id: 'policy-3',
      name: 'Automation Approval Required',
      category: 'Governance',
      level: 'parent',
      status: 'overridable',
      description: 'High-risk automations require explicit approval',
      inheritedFrom: 'Telecom Group',
      value: 'Conditional (risk-based)',
      appliesTo: ['Egypt Operator', 'Saudi Operator']
    },
    {
      id: 'policy-4',
      name: 'Export Data Limit',
      category: 'Security',
      level: 'child',
      status: 'inherited',
      description: 'Maximum data export volume per day',
      inheritedFrom: 'Telecom Group',
      value: '10 GB per day',
      appliesTo: ['Egypt Operator']
    },
    {
      id: 'policy-5',
      name: 'AI Autonomous Decisions',
      category: 'Governance',
      level: 'parent',
      status: 'enforced',
      description: 'AI models cannot make autonomous changes without approval',
      value: 'Disabled (requires approval)',
      appliesTo: ['Egypt Operator', 'Saudi Operator', 'Enterprise Network']
    },
    {
      id: 'policy-6',
      name: 'IP Allowlist',
      category: 'Security',
      level: 'child',
      status: 'inherited',
      description: 'Only allow access from specific IP ranges',
      inheritedFrom: 'Egypt Operator',
      value: '192.168.1.0/24, 10.20.30.0/24',
      appliesTo: ['Egypt Operator']
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'enforced':
        return 'bg-red-500/10 border-red-500/30 text-red-700';
      case 'overridable':
        return 'bg-yellow-500/10 border-yellow-500/30 text-yellow-700';
      case 'inherited':
        return 'bg-blue-500/10 border-blue-500/30 text-blue-700';
      default:
        return 'bg-muted/30 border-border/30 text-muted-foreground';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'enforced':
        return 'bg-red-600 text-white';
      case 'overridable':
        return 'bg-yellow-600 text-white';
      case 'inherited':
        return 'bg-blue-600 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  return (
    <div className="space-y-8">
      {/* Description */}
      <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-6">
        <h3 className="font-bold text-foreground mb-2 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-yellow-600" />
          Tenant Policies & Inheritance
        </h3>
        <p className="text-sm text-muted-foreground">
          Parent tenants enforce policies on child tenants. Child tenants see inherited policies clearly and can request overrides if allowed.
        </p>
      </div>

      {/* Policy Inheritance Model */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
          <LinkIcon className="w-4 h-4" />
          Policy Inheritance Model
        </h3>

        <div className="space-y-4">
          <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-lg">
            <div className="flex items-start gap-3 mb-2">
              <Lock className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-bold text-red-700 text-sm mb-1">Enforced Policies</h4>
                <p className="text-xs text-red-600">
                  Parent policy that MUST be followed by all children. No override possible. Examples: MFA requirement, data retention, compliance rules.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-lg">
            <div className="flex items-start gap-3 mb-2">
              <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-bold text-yellow-700 text-sm mb-1">Overridable Policies</h4>
                <p className="text-xs text-yellow-600">
                  Parent policy with default value but child can request override. Requires approval. Examples: Automation approval workflow, export limits.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg">
            <div className="flex items-start gap-3 mb-2">
              <LinkIcon className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-bold text-blue-700 text-sm mb-1">Inherited Policies</h4>
                <p className="text-xs text-blue-600">
                  Child tenant inherits parent policy and cannot override. Clearly marked as inherited. Must show "Inherited from Parent" label.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Policies List */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4">Current Policies</h3>

        <div className="space-y-3">
          {policies.map(policy => {
            const isExpanded = expandedPolicy === policy.id;
            return (
              <div key={policy.id} className={`rounded-lg border p-4 transition-colors ${getStatusColor(policy.status)}`}>
                <div
                  onClick={() => setExpandedPolicy(isExpanded ? '' : policy.id)}
                  className="cursor-pointer flex items-start justify-between gap-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-foreground">{policy.name}</h4>
                      <span className={`text-xs px-2 py-0.5 rounded font-bold ${getStatusBadge(policy.status)}`}>
                        {policy.status.toUpperCase()}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded bg-muted/50 text-muted-foreground font-bold">
                        {policy.category}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{policy.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {policy.inheritedFrom && (
                        <span className="text-xs bg-white/20 text-foreground px-2 py-1 rounded flex items-center gap-1">
                          <LinkIcon className="w-3 h-3" />
                          Inherited from: {policy.inheritedFrom}
                        </span>
                      )}
                      <span className="text-xs bg-white/20 text-foreground px-2 py-1 rounded font-mono">
                        {policy.value}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-white/20 space-y-3">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-2">Applies To</p>
                      <div className="flex flex-wrap gap-2">
                        {policy.appliesTo.map(tenant => (
                          <span key={tenant} className="text-xs bg-white/20 text-foreground px-2 py-1 rounded">
                            {tenant}
                          </span>
                        ))}
                      </div>
                    </div>

                    {policy.status === 'inherited' && (
                      <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
                        <div className="flex items-start gap-2">
                          <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-blue-600">
                            This policy is inherited from {policy.inheritedFrom}. You cannot override it directly. Contact parent administrator for changes.
                          </p>
                        </div>
                      </div>
                    )}

                    {policy.status === 'overridable' && (
                      <button className="w-full px-3 py-1.5 rounded border border-white/30 hover:bg-white/10 transition-colors text-xs font-medium">
                        Request Override
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Policy Categories */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4">Policy Categories</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { name: 'Security Policies', count: 3, examples: 'MFA, IP allowlist, encryption' },
            { name: 'Compliance Policies', count: 2, examples: 'Data retention, audit logging' },
            { name: 'Governance Policies', count: 2, examples: 'Automation approval, AI limits' },
            { name: 'Operational Policies', count: 2, examples: 'Export limits, session timeout' }
          ].map(cat => (
            <div key={cat.name} className="p-4 bg-muted/30 rounded-lg border border-border/30">
              <p className="font-bold text-foreground text-sm mb-1">{cat.name}</p>
              <p className="text-xs text-muted-foreground mb-2">{cat.count} active policies</p>
              <p className="text-xs text-muted-foreground">{cat.examples}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Data Residency & Compliance */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
          <Lock className="w-4 h-4" />
          Data Residency & Compliance Settings
        </h3>

        <p className="text-sm text-muted-foreground mb-4">
          These settings must be visible, auditable, and change-controlled per tenant.
        </p>

        <div className="space-y-3">
          <div className="p-4 bg-muted/30 rounded-lg border border-border/30">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-bold text-foreground text-sm">Data Residency Location</p>
                <p className="text-xs text-muted-foreground">Where tenant data is physically stored</p>
              </div>
              <span className="text-xs px-2 py-0.5 rounded bg-green-600 text-white font-bold flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Set
              </span>
            </div>
            <p className="text-xs font-mono text-foreground">EU Data Center (Frankfurt)</p>
          </div>

          <div className="p-4 bg-muted/30 rounded-lg border border-border/30">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-bold text-foreground text-sm">Encryption at Rest</p>
                <p className="text-xs text-muted-foreground">Encryption standard for stored data</p>
              </div>
              <span className="text-xs px-2 py-0.5 rounded bg-green-600 text-white font-bold flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Enforced
              </span>
            </div>
            <p className="text-xs font-mono text-foreground">AES-256 (NIST approved)</p>
          </div>

          <div className="p-4 bg-muted/30 rounded-lg border border-border/30">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-bold text-foreground text-sm">Encryption in Transit</p>
                <p className="text-xs text-muted-foreground">TLS/SSL version requirement</p>
              </div>
              <span className="text-xs px-2 py-0.5 rounded bg-green-600 text-white font-bold flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Enforced
              </span>
            </div>
            <p className="text-xs font-mono text-foreground">TLS 1.3 or higher (mandatory)</p>
          </div>

          <div className="p-4 bg-muted/30 rounded-lg border border-border/30">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-bold text-foreground text-sm">Regulatory Compliance Framework</p>
                <p className="text-xs text-muted-foreground">Applicable regulations</p>
              </div>
              <span className="text-xs px-2 py-0.5 rounded bg-blue-600 text-white font-bold">NIST + Local</span>
            </div>
            <p className="text-xs text-foreground">NIST CSF, Egypt Data Protection Law, ISO 27001</p>
          </div>
        </div>
      </div>

      {/* Audit Trail */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4">Policy Change Audit Trail</h3>

        <div className="space-y-2 text-xs">
          <div className="p-3 bg-muted/30 rounded-lg border border-border/30">
            <p className="font-mono text-foreground mb-1">2024-03-11 14:32:00 - MFA Requirement enforced globally</p>
            <p className="text-muted-foreground">Changed by: Chief Security Officer | Reason: Regulatory compliance</p>
          </div>
          <div className="p-3 bg-muted/30 rounded-lg border border-border/30">
            <p className="font-mono text-foreground mb-1">2024-03-10 09:15:00 - Data Retention updated to 7 years</p>
            <p className="text-muted-foreground">Changed by: Compliance Officer | Reason: NIST requirements update</p>
          </div>
          <div className="p-3 bg-muted/30 rounded-lg border border-border/30">
            <p className="font-mono text-foreground mb-1">2024-02-28 16:45:00 - Automation Approval made overridable</p>
            <p className="text-muted-foreground">Changed by: Operations Director | Reason: Allow child customization</p>
          </div>
        </div>
      </div>
    </div>
  );
}
