import { AlertTriangle, Power, Lock, Radio, Bell, Shield, CheckCircle } from 'lucide-react';
import { useState } from 'react';

interface GlobalControl {
  id: string;
  name: string;
  description: string;
  status: 'armed' | 'disarmed' | 'triggered';
  lastTriggered?: string;
  impact: string;
  recoveryTime: string;
  requiresApproval: boolean;
  approvalLevel: string;
}

export default function GlobalSecurityControls() {
  const [expandedControl, setExpandedControl] = useState<string>('control-1');
  const [showConfirmation, setShowConfirmation] = useState<string | null>(null);

  const globalControls: GlobalControl[] = [
    {
      id: 'control-1',
      name: 'Global Automation Kill Switch',
      description: 'Instantly stops all automation across entire platform',
      status: 'armed',
      lastTriggered: '2024-02-15 09:30 (incident response)',
      impact: 'ALL automations halted immediately. Manual operation only.',
      recoveryTime: '5-10 minutes to restart and validate',
      requiresApproval: true,
      approvalLevel: 'Chief Technology Officer level only'
    },
    {
      id: 'control-2',
      name: 'Global Export Freeze',
      description: 'Prevent ALL data exports across the platform',
      status: 'armed',
      impact: 'Data exports blocked. API rejects all export requests.',
      recoveryTime: '1-2 minutes to restore',
      requiresApproval: true,
      approvalLevel: 'Chief Information Security Officer level'
    },
    {
      id: 'control-3',
      name: 'Emergency Read-Only Mode',
      description: 'System-wide switch to read-only operations only',
      status: 'armed',
      impact: 'No modifications allowed. View-only access for all users. Critical incident stabilization.',
      recoveryTime: '15-30 minutes for full recovery',
      requiresApproval: true,
      approvalLevel: 'Chief Technology Officer level only'
    },
    {
      id: 'control-4',
      name: 'AI Model Isolation',
      description: 'Disable ALL AI/ML models system-wide',
      status: 'armed',
      lastTriggered: '2024-03-01 14:15 (model validation failure)',
      impact: 'Autonomous AI decisions halted. All operations revert to manual/rule-based.',
      recoveryTime: '30-60 minutes for model validation',
      requiresApproval: false,
      approvalLevel: 'Network Operations Center Director can activate'
    },
    {
      id: 'control-5',
      name: 'Global API Rate Limiting',
      description: 'Enforce strict rate limits on all API calls',
      status: 'disarmed',
      impact: 'API requests throttled. High-volume attacks prevented.',
      recoveryTime: '5 minutes',
      requiresApproval: false,
      approvalLevel: 'NOC Operator (auto-triggers on DDoS detection)'
    },
    {
      id: 'control-6',
      name: 'Tenant Isolation Lockdown',
      description: 'Force absolute tenant isolation - prevent ALL cross-tenant access',
      status: 'armed',
      impact: 'All cross-tenant queries blocked. Each tenant operates in complete isolation.',
      recoveryTime: '10-20 minutes',
      requiresApproval: true,
      approvalLevel: 'Chief Information Security Officer level'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'armed':
        return 'bg-green-500/10 border-green-500/30 text-green-700';
      case 'disarmed':
        return 'bg-yellow-500/10 border-yellow-500/30 text-yellow-700';
      case 'triggered':
        return 'bg-red-500/10 border-red-500/30 text-red-700';
      default:
        return 'bg-muted/30 border-border/30 text-muted-foreground';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'armed':
        return 'bg-green-600 text-white';
      case 'disarmed':
        return 'bg-yellow-600 text-white';
      case 'triggered':
        return 'bg-red-600 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  return (
    <div className="space-y-8">
      {/* Description */}
      <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-6">
        <h3 className="font-bold text-foreground mb-2 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          Global Security Controls (Emergency Guardrails)
        </h3>
        <p className="text-sm text-muted-foreground">
          System-wide emergency controls used only during critical incidents to stabilize and protect the platform.
        </p>
      </div>

      {/* Critical Warning */}
      <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-red-700 text-sm mb-1">These controls affect ALL users and tenants</p>
            <p className="text-xs text-red-600">
              Activation requires high-level approval. Use only during critical security incidents, attacks, or system failures.
            </p>
          </div>
        </div>
      </div>

      {/* Control Status Dashboard */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4">Global Control Status</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          <div className="rounded-lg border border-green-500/30 bg-green-500/5 p-3">
            <p className="text-xs text-green-700 font-semibold">Armed</p>
            <p className="text-xl font-bold text-green-700">
              {globalControls.filter(c => c.status === 'armed').length}
            </p>
          </div>
          <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-3">
            <p className="text-xs text-yellow-700 font-semibold">Disarmed</p>
            <p className="text-xl font-bold text-yellow-700">
              {globalControls.filter(c => c.status === 'disarmed').length}
            </p>
          </div>
          <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-3">
            <p className="text-xs text-red-700 font-semibold">Triggered</p>
            <p className="text-xl font-bold text-red-700">
              {globalControls.filter(c => c.status === 'triggered').length}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          {globalControls.map(control => {
            const isExpanded = expandedControl === control.id;

            return (
              <div key={control.id} className={`rounded-lg border p-4 transition-colors ${getStatusColor(control.status)}`}>
                <div
                  onClick={() => setExpandedControl(isExpanded ? '' : control.id)}
                  className="cursor-pointer flex items-start justify-between gap-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-foreground">{control.name}</h4>
                      <span className={`text-xs px-2 py-0.5 rounded font-bold ${getStatusBadge(control.status)}`}>
                        {control.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{control.description}</p>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-white/20 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground mb-2">Impact</p>
                        <p className="text-xs text-foreground bg-black/10 p-3 rounded">
                          {control.impact}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-muted-foreground mb-2">Recovery Time</p>
                        <p className="text-xs text-foreground bg-black/10 p-3 rounded">
                          {control.recoveryTime}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-muted-foreground mb-2">Activation Requirements</p>
                        {control.requiresApproval ? (
                          <p className="text-xs text-red-600 font-bold">
                            ⚠️ Requires approval from: {control.approvalLevel}
                          </p>
                        ) : (
                          <p className="text-xs text-yellow-600 font-bold">
                            ⚠️ Can be activated by: {control.approvalLevel}
                          </p>
                        )}
                      </div>

                      {control.lastTriggered && (
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground mb-2">Last Triggered</p>
                          <p className="text-xs text-foreground">{control.lastTriggered}</p>
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    {control.status === 'armed' && (
                      <div className="pt-2 border-t border-white/20">
                        <button
                          onClick={() => setShowConfirmation(control.id)}
                          className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors text-sm font-medium w-full"
                        >
                          Trigger Emergency Control
                        </button>
                      </div>
                    )}

                    {control.status === 'triggered' && (
                      <div className="pt-2 border-t border-white/20">
                        <button className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors text-sm font-medium w-full">
                          Deactivate Control
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmation && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6">
          <h3 className="font-bold text-red-700 text-lg mb-4">Confirm Emergency Control Activation</h3>

          <p className="text-sm text-red-600 mb-4">
            You are about to activate a global emergency control that will affect ALL users and tenants across the entire platform.
          </p>

          <div className="p-4 bg-red-500/20 rounded-lg mb-4 border border-red-500/30">
            <p className="text-sm font-mono text-red-700">
              {globalControls.find(c => c.id === showConfirmation)?.name}
            </p>
          </div>

          <div className="space-y-2 mb-6 text-sm">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-600">This action will be logged and audited</p>
            </div>
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-600">All affected users will be notified</p>
            </div>
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-600">Recovery time may be significant</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowConfirmation(null)}
              className="flex-1 px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-sm font-medium"
            >
              Cancel
            </button>
            <button className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors text-sm font-medium">
              Confirm & Activate
            </button>
          </div>
        </div>
      )}

      {/* Control Categories */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4">Emergency Control Categories</h3>

        <div className="space-y-3">
          <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-lg">
            <p className="font-bold text-red-700 text-sm mb-2">Operational Shutdown</p>
            <p className="text-xs text-red-600">
              Stops active operations: Automation Kill Switch stops all running automations instantly.
            </p>
          </div>

          <div className="p-4 bg-orange-500/5 border border-orange-500/20 rounded-lg">
            <p className="font-bold text-orange-700 text-sm mb-2">Access Restriction</p>
            <p className="text-xs text-orange-600">
              Limits system access: Read-Only Mode prevents all modifications, freezes exports, disables APIs.
            </p>
          </div>

          <div className="p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-lg">
            <p className="font-bold text-yellow-700 text-sm mb-2">Data Protection</p>
            <p className="text-xs text-yellow-600">
              Protects data: Export Freeze prevents unauthorized data exfiltration. Tenant Isolation forces absolute separation.
            </p>
          </div>

          <div className="p-4 bg-purple-500/5 border border-purple-500/20 rounded-lg">
            <p className="font-bold text-purple-700 text-sm mb-2">System Stabilization</p>
            <p className="text-xs text-purple-600">
              Stabilizes platform: AI Model Isolation disables autonomous decisions. Rate Limiting prevents DDoS attacks.
            </p>
          </div>
        </div>
      </div>

      {/* Incident Response Procedure */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4">Emergency Response Procedure</h3>

        <div className="space-y-3">
          <div className="p-4 bg-muted/30 rounded-lg border border-border/30">
            <div className="flex items-start gap-3">
              <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                1
              </span>
              <div>
                <p className="font-bold text-foreground text-sm">Detect Incident</p>
                <p className="text-xs text-muted-foreground">
                  Security team detects critical issue (attack, data breach, system failure, etc.)
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-muted/30 rounded-lg border border-border/30">
            <div className="flex items-start gap-3">
              <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                2
              </span>
              <div>
                <p className="font-bold text-foreground text-sm">Assess Severity</p>
                <p className="text-xs text-muted-foreground">
                  Determine if global emergency control is warranted
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-muted/30 rounded-lg border border-border/30">
            <div className="flex items-start gap-3">
              <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                3
              </span>
              <div>
                <p className="font-bold text-foreground text-sm">Request Activation</p>
                <p className="text-xs text-muted-foreground">
                  Submit activation request to authorized approver with incident details
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-muted/30 rounded-lg border border-border/30">
            <div className="flex items-start gap-3">
              <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                4
              </span>
              <div>
                <p className="font-bold text-foreground text-sm">Approval & Activation</p>
                <p className="text-xs text-muted-foreground">
                  Authorized manager approves and activates control (typically within minutes)
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-muted/30 rounded-lg border border-border/30">
            <div className="flex items-start gap-3">
              <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                5
              </span>
              <div>
                <p className="font-bold text-foreground text-sm">Monitor & Stabilize</p>
                <p className="text-xs text-muted-foreground">
                  Monitor incident response. Control remains active until incident is resolved.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/30">
            <div className="flex items-start gap-3">
              <span className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                6
              </span>
              <div>
                <p className="font-bold text-foreground text-sm">Deactivate & Recovery</p>
                <p className="text-xs text-muted-foreground">
                  Once incident resolved, control is deactivated and system returns to normal operations
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Audit Trail */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4">Global Control Audit Trail</h3>

        <div className="space-y-2 text-xs">
          <div className="p-3 bg-muted/30 rounded-lg border border-border/30 font-mono">
            <p className="text-foreground">2024-03-01 14:15:00 | AI Model Isolation triggered</p>
            <p className="text-muted-foreground">Reason: ML model validation failure detected | Approved by: CTO</p>
            <p className="text-muted-foreground">Duration: 45 minutes | Deactivated: 2024-03-01 15:00:00</p>
          </div>

          <div className="p-3 bg-muted/30 rounded-lg border border-border/30 font-mono">
            <p className="text-foreground">2024-02-15 09:30:00 | Automation Kill Switch activated</p>
            <p className="text-muted-foreground">Reason: Cascading automation failure affecting revenue | Approved by: CTO</p>
            <p className="text-muted-foreground">Duration: 12 minutes | Deactivated: 2024-02-15 09:42:00</p>
          </div>

          <div className="p-3 bg-muted/30 rounded-lg border border-border/30 font-mono">
            <p className="text-foreground">2024-01-28 03:45:00 | Read-Only Mode activated</p>
            <p className="text-muted-foreground">Reason: DDoS attack with data exfiltration attempts | Approved by: CISO</p>
            <p className="text-muted-foreground">Duration: 2.5 hours | Deactivated: 2024-01-28 06:15:00</p>
          </div>
        </div>
      </div>
    </div>
  );
}
