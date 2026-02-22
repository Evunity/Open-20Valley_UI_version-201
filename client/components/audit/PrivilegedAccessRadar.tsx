import { Lock, AlertTriangle, TrendingUp } from 'lucide-react';

export default function PrivilegedAccessRadar() {
  const privilegedActions = [
    { action: 'Privilege Escalation', user: 'rf_engineer', time: '14:32:15', status: 'authorized', tool: 'MFA', impact: 'high' },
    { action: 'System Configuration Change', user: 'ops_manager', time: '13:45:22', status: 'authorized', tool: 'Approval Workflow', impact: 'medium' },
    { action: 'Unauthorized Data Export', user: 'transport_analyst', time: '12:15:08', status: 'blocked', tool: 'DLP Policy', impact: 'high' },
    { action: 'Admin User Creation', user: 'system_admin', time: '10:30:45', status: 'authorized', tool: 'MFA + Approval', impact: 'critical' }
  ];

  return (
    <div className="space-y-8">
      {/* Description */}
      <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-6">
        <h3 className="font-bold text-foreground mb-2 flex items-center gap-2">
          <Lock className="w-5 h-5 text-red-600" />
          Privileged Access Radar
        </h3>
        <p className="text-sm text-muted-foreground">
          Track all admin-level actions, privilege escalations, and policy violations. Detect and alert on unauthorized access attempts.
        </p>
      </div>

      {/* Privileged Actions Today */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4">Privileged Actions - Today</h3>

        <div className="space-y-3">
          {privilegedActions.map((action, idx) => (
            <div key={idx} className="p-4 bg-muted/30 rounded-lg border border-border/30">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <p className="text-sm font-bold text-foreground">{action.action}</p>
                  <p className="text-xs text-muted-foreground mt-1">User: <span className="font-mono">{action.user}</span> • Time: {action.time}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded font-semibold flex-shrink-0 ${
                  action.status === 'authorized' ? 'bg-green-500/20 text-green-700' : 'bg-red-500/20 text-red-700'
                }`}>
                  {action.status.toUpperCase()}
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <span className="px-2 py-1 bg-muted rounded text-muted-foreground">Control: {action.tool}</span>
                <span className={`px-2 py-1 bg-muted rounded ${
                  action.impact === 'critical' ? 'text-red-700' :
                  action.impact === 'high' ? 'text-orange-700' :
                  'text-yellow-700'
                }`}>
                  Impact: {action.impact.toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Access Control Policies */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4">Privilege Access Controls</h3>

        <div className="space-y-3">
          <div className="p-3 bg-muted/30 rounded-lg border border-border/30">
            <p className="text-sm font-semibold text-foreground mb-1">✓ Multi-Factor Authentication</p>
            <p className="text-xs text-muted-foreground">All privilege escalations require MFA verification</p>
          </div>

          <div className="p-3 bg-muted/30 rounded-lg border border-border/30">
            <p className="text-sm font-semibold text-foreground mb-1">✓ Approval Workflow</p>
            <p className="text-xs text-muted-foreground">Config changes require approval from 2 admins</p>
          </div>

          <div className="p-3 bg-muted/30 rounded-lg border border-border/30">
            <p className="text-sm font-semibold text-foreground mb-1">✓ Data Loss Prevention</p>
            <p className="text-xs text-muted-foreground">Bulk exports flagged and logged for audit</p>
          </div>

          <div className="p-3 bg-muted/30 rounded-lg border border-border/30">
            <p className="text-sm font-semibold text-foreground mb-1">✓ Time-Based Access</p>
            <p className="text-xs text-muted-foreground">Admin access disabled during non-business hours unless approved</p>
          </div>
        </div>
      </div>

      {/* Policy Violations */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-600" />
          Recent Policy Violations
        </h3>

        <div className="space-y-3">
          <div className="p-4 bg-orange-500/5 border border-orange-500/20 rounded-lg">
            <p className="text-sm font-bold text-orange-700 mb-1">Automation Override Without Approval</p>
            <p className="text-xs text-muted-foreground">
              User 'ops_manager' manually overrode Load Balancing automation policy at 14:32:45. No approval workflow triggered.
            </p>
          </div>

          <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-lg">
            <p className="text-sm font-bold text-red-700 mb-1">Unauthorized Export Attempt</p>
            <p className="text-xs text-muted-foreground">
              User attempted to bulk export Alarm Summary dataset. Blocked by DLP policy. Incident logged for investigation.
            </p>
          </div>
        </div>
      </div>

      {/* Role Summary */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4">Active Privileged Roles</h3>

        <div className="space-y-2">
          {[
            { role: 'System Admin', count: 1, users: 'system_admin' },
            { role: 'Operations Admin', count: 1, users: 'ops_manager' },
            { role: 'RF Admin (Temporary)', count: 1, users: 'rf_engineer (escalated)' },
            { role: 'Automation Editor', count: 3, users: 'Multiple...' }
          ].map((role, idx) => (
            <div key={idx} className="p-3 bg-muted/30 rounded-lg border border-border/30 flex items-center justify-between text-sm">
              <span className="font-medium text-foreground">{role.role}</span>
              <span className="text-xs text-muted-foreground">{role.count} active • {role.users}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
