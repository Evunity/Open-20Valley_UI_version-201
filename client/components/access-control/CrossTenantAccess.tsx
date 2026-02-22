import { GitBranch, Eye, AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import { useState } from 'react';

interface CrossTenantGrant {
  id: string;
  grantedTo: string;
  grantedFrom: string;
  mode: 'read-only' | 'operational';
  reason: string;
  approvedBy: string;
  createdAt: string;
  expiresAt: string;
  status: 'active' | 'pending' | 'expired';
  auditLog: boolean;
}

export default function CrossTenantAccess() {
  const [expandedGrant, setExpandedGrant] = useState<string>('grant-1');

  const grants: CrossTenantGrant[] = [
    {
      id: 'grant-1',
      grantedTo: 'Group Executive (Sarah)',
      grantedFrom: 'Egypt Operator + Saudi Operator',
      mode: 'read-only',
      reason: 'Aggregated KPI monitoring across all regional operators',
      approvedBy: 'Chief Technology Officer',
      createdAt: '2024-02-15',
      expiresAt: '2024-05-15',
      status: 'active',
      auditLog: true
    },
    {
      id: 'grant-2',
      grantedTo: 'Central NOC (Emergency Team)',
      grantedFrom: 'Egypt Operator',
      mode: 'operational',
      reason: 'Emergency response to major incident (INC-2024-0847)',
      approvedBy: 'Operations Director',
      createdAt: '2024-03-11',
      expiresAt: '2024-03-13',
      status: 'active',
      auditLog: true
    },
    {
      id: 'grant-3',
      grantedTo: 'Managed Service Provider',
      grantedFrom: 'Enterprise Network',
      mode: 'read-only',
      reason: 'Performance monitoring for SLA compliance',
      approvedBy: 'Enterprise Account Manager',
      createdAt: '2024-01-01',
      expiresAt: '2024-12-31',
      status: 'active',
      auditLog: true
    }
  ];

  const getModeColor = (mode: string) => {
    switch (mode) {
      case 'read-only':
        return 'bg-green-500/10 border-green-500/30 text-green-700';
      case 'operational':
        return 'bg-red-500/10 border-red-500/30 text-red-700';
      default:
        return 'bg-muted/30 border-border/30 text-muted-foreground';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-600 text-white';
      case 'pending':
        return 'bg-yellow-600 text-white';
      case 'expired':
        return 'bg-gray-600 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  return (
    <div className="space-y-8">
      {/* Description */}
      <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-xl p-6">
        <h3 className="font-bold text-foreground mb-2 flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-indigo-600" />
          Cross-Tenant Access Control
        </h3>
        <p className="text-sm text-muted-foreground">
          Manage cross-tenant access with strict controls. Access is NEVER automatic and requires explicit approval with full audit trails.
        </p>
      </div>

      {/* Core Principle */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          Core Rule: Cross-Tenant Access
        </h3>

        <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-lg mb-4">
          <p className="text-sm font-bold text-red-700">
            ⚠️ Cross-tenant access is NEVER automatic. It must be explicitly enabled with proper audit logging.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-green-500/5 border border-green-500/20 rounded-lg">
            <h4 className="font-bold text-green-700 mb-2">✓ Allowed Cases</h4>
            <ul className="space-y-1 text-xs text-green-600">
              <li>• Platform Admins</li>
              <li>• Group Executives</li>
              <li>• Central NOC (Emergency)</li>
              <li>• Managed Service Providers</li>
              <li>• Compliance/Audit teams</li>
            </ul>
          </div>
          <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-lg">
            <h4 className="font-bold text-red-700 mb-2">✗ Default Behavior</h4>
            <ul className="space-y-1 text-xs text-red-600">
              <li>• NO cross-tenant visibility</li>
              <li>• NO shared data</li>
              <li>• NO automatic escalation</li>
              <li>• NO cross-tenant commands</li>
              <li>• Full isolation enforced</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Access Modes */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4">Cross-Tenant Access Modes</h3>

        <div className="space-y-4">
          <div className="p-4 bg-green-500/5 border border-green-500/20 rounded-lg">
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-bold text-green-700">1. Read-Only Mode</h4>
              <Eye className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-xs text-green-600 mb-3">
              User can view aggregated data but cannot perform any actions.
            </p>
            <div className="text-xs text-green-600 space-y-1">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3 h-3" />
                View KPIs across tenants
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3 h-3" />
                View aggregated reports
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3 h-3" />
                View aggregated dashboards
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">✗</span>
                Cannot execute commands
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">✗</span>
                Cannot modify anything
              </div>
            </div>
            <p className="text-xs text-green-600 mt-3 font-semibold">
              Label: "Multi-Tenant Aggregated View"
            </p>
          </div>

          <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-lg">
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-bold text-red-700">2. Operational Mode (High Risk)</h4>
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <p className="text-xs text-red-600 mb-3">
              User can execute actions in other tenants. Requires approval and has strict controls.
            </p>
            <div className="text-xs text-red-600 space-y-1">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3 h-3" />
                Execute commands in other tenant
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3 h-3" />
                Modify configurations (with approval)
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3 h-3" />
                Run automation in other tenant
              </div>
            </div>
            <p className="text-xs text-red-600 mt-3">
              <span className="font-bold">Requirements:</span> Explicit approval, time limit, full audit logging, clear visual warning.
            </p>
          </div>
        </div>
      </div>

      {/* Active Grants */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4">Active Cross-Tenant Grants</h3>

        <div className="space-y-3">
          {grants.map(grant => {
            const isExpanded = expandedGrant === grant.id;
            return (
              <div key={grant.id} className={`rounded-lg border p-4 transition-colors ${getModeColor(grant.mode)}`}>
                <div
                  onClick={() => setExpandedGrant(isExpanded ? '' : grant.id)}
                  className="cursor-pointer flex items-start justify-between gap-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-foreground">{grant.grantedTo}</h4>
                      <span className={`text-xs px-2 py-0.5 rounded font-bold ${getStatusColor(grant.status)}`}>
                        {grant.status.toUpperCase()}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded border font-bold ${grant.mode === 'read-only' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                        {grant.mode === 'read-only' ? 'READ-ONLY' : 'OPERATIONAL'}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      Access to: {grant.grantedFrom}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {grant.reason}
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground text-right">
                    Expires: {grant.expiresAt}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-white/20 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground mb-2">Approval Details</p>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Approved by:</span>
                            <span className="font-semibold text-foreground">{grant.approvedBy}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Created:</span>
                            <span className="font-semibold text-foreground">{grant.createdAt}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Expires:</span>
                            <span className="font-semibold text-foreground">{grant.expiresAt}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-muted-foreground mb-2">Security Status</p>
                        <div className="flex items-center gap-2 text-xs">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-foreground">Full audit logging enabled</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-white/20">
                      <button className="flex-1 px-3 py-1.5 rounded border border-white/30 hover:bg-white/10 transition-colors text-xs font-medium">
                        View Audit Log
                      </button>
                      <button className="flex-1 px-3 py-1.5 rounded border border-red-500/30 text-red-700 hover:bg-red-500/10 transition-colors text-xs font-medium">
                        Revoke Access
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Best Practices */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4">Best Practices for Cross-Tenant Access</h3>

        <div className="space-y-3">
          <div className="p-4 bg-muted/30 rounded-lg border border-border/30">
            <p className="font-semibold text-foreground text-sm mb-2">1. Principle of Least Privilege</p>
            <p className="text-xs text-muted-foreground">
              Grant only the minimum access needed. Use Read-Only mode by default, Operational only when necessary.
            </p>
          </div>
          <div className="p-4 bg-muted/30 rounded-lg border border-border/30">
            <p className="font-semibold text-foreground text-sm mb-2">2. Time-Limited Access</p>
            <p className="text-xs text-muted-foreground">
              All grants must have explicit expiration dates. Regularly review and revoke expired access.
            </p>
          </div>
          <div className="p-4 bg-muted/30 rounded-lg border border-border/30">
            <p className="font-semibold text-foreground text-sm mb-2">3. Full Audit Trail</p>
            <p className="text-xs text-muted-foreground">
              Every cross-tenant action is logged. Immutable records for compliance and investigation.
            </p>
          </div>
          <div className="p-4 bg-muted/30 rounded-lg border border-border/30">
            <p className="font-semibold text-foreground text-sm mb-2">4. Explicit Approval</p>
            <p className="text-xs text-muted-foreground">
              Operational access requires documented approval. Maintain clear audit trail of authorization.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
