import { Clock, AlertCircle, CheckCircle, X, Send } from 'lucide-react';
import { useState } from 'react';

interface ElevationRequest {
  id: string;
  user: string;
  requestedRole: string;
  currentRole: string;
  reason: string;
  durationHours: number;
  status: 'pending' | 'approved' | 'expired' | 'revoked';
  requestedAt: string;
  approvedAt?: string;
  approvedBy?: string;
  expiresAt?: string;
  isActive?: boolean;
}

export default function TemporaryElevation() {
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [expandedRequest, setExpandedRequest] = useState<string>('req-1');
  const [requestForm, setRequestForm] = useState({
    role: 'admin',
    duration: 2,
    reason: ''
  });

  const elevationRequests: ElevationRequest[] = [
    {
      id: 'req-1',
      user: 'Ahmed Hassan',
      requestedRole: 'System Admin',
      currentRole: 'Operations Manager',
      reason: 'Emergency incident response - need to kill switch automation system',
      durationHours: 1,
      status: 'approved',
      requestedAt: '2024-03-11 14:30:00',
      approvedAt: '2024-03-11 14:31:00',
      approvedBy: 'Chief Technology Officer',
      expiresAt: '2024-03-11 15:31:00',
      isActive: true
    },
    {
      id: 'req-2',
      user: 'Sarah Williams',
      requestedRole: 'System Admin',
      currentRole: 'Operator',
      reason: 'Need to modify critical automation rule - approval required from manager',
      durationHours: 2,
      status: 'pending',
      requestedAt: '2024-03-11 14:45:00'
    },
    {
      id: 'req-3',
      user: 'Mohammed Ali',
      requestedRole: 'Auditor',
      currentRole: 'Operator',
      reason: 'Compliance audit of user activities',
      durationHours: 4,
      status: 'approved',
      requestedAt: '2024-03-11 13:00:00',
      approvedAt: '2024-03-11 13:05:00',
      approvedBy: 'Compliance Officer',
      expiresAt: '2024-03-11 17:00:00',
      isActive: false
    },
    {
      id: 'req-4',
      user: 'Lisa Chen',
      requestedRole: 'System Admin',
      currentRole: 'Viewer',
      reason: 'Temporary elevation for system maintenance window',
      durationHours: 3,
      status: 'approved',
      requestedAt: '2024-03-10 20:00:00',
      approvedAt: '2024-03-10 20:02:00',
      approvedBy: 'Operations Director',
      expiresAt: '2024-03-10 23:02:00',
      isActive: false
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500/10 border-green-500/30 text-green-700';
      case 'pending':
        return 'bg-yellow-500/10 border-yellow-500/30 text-yellow-700';
      case 'expired':
        return 'bg-gray-500/10 border-gray-500/30 text-gray-700';
      case 'revoked':
        return 'bg-red-500/10 border-red-500/30 text-red-700';
      default:
        return 'bg-muted/30 border-border/30 text-muted-foreground';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-600 text-white';
      case 'pending':
        return 'bg-yellow-600 text-white';
      case 'expired':
        return 'bg-gray-600 text-white';
      case 'revoked':
        return 'bg-red-600 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  return (
    <div className="space-y-8">
      {/* Description */}
      <div className="bg-orange-500/5 border border-orange-500/20 rounded-xl p-6">
        <h3 className="font-bold text-foreground mb-2 flex items-center gap-2">
          <Clock className="w-5 h-5 text-orange-600" />
          Temporary Privilege Elevation (Just-In-Time Access)
        </h3>
        <p className="text-sm text-muted-foreground">
          Request temporary elevated privileges for specific tasks. All requests require approval and auto-expire at specified time.
        </p>
      </div>

      {/* Core Principles */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4">Just-In-Time Access Principles</h3>

        <div className="space-y-3">
          <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg">
            <h4 className="font-bold text-blue-700 text-sm mb-2">✓ User Requests Elevation</h4>
            <p className="text-xs text-blue-600">
              Users cannot self-elevate privileges. They must request temporary access with a business justification.
            </p>
          </div>

          <div className="p-4 bg-purple-500/5 border border-purple-500/20 rounded-lg">
            <h4 className="font-bold text-purple-700 text-sm mb-2">✓ Manager Approval Required</h4>
            <p className="text-xs text-purple-600">
              Requests must be explicitly approved by authorized manager. Approval is logged and auditable.
            </p>
          </div>

          <div className="p-4 bg-green-500/5 border border-green-500/20 rounded-lg">
            <h4 className="font-bold text-green-700 text-sm mb-2">✓ Time-Bound Access</h4>
            <p className="text-xs text-green-600">
              All elevations auto-expire at specified time. User cannot extend without new request and approval.
            </p>
          </div>

          <div className="p-4 bg-orange-500/5 border border-orange-500/20 rounded-lg">
            <h4 className="font-bold text-orange-700 text-sm mb-2">✓ Full Audit Trail</h4>
            <p className="text-xs text-orange-600">
              All elevated actions are logged separately for compliance review and incident investigation.
            </p>
          </div>
        </div>
      </div>

      {/* Elevation Requests */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-foreground">Elevation Requests</h3>
          <button
            onClick={() => setShowNewRequest(true)}
            className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-sm font-medium flex items-center gap-1"
          >
            <Clock className="w-4 h-4" />
            Request Elevation
          </button>
        </div>

        <div className="space-y-3">
          {elevationRequests.map(req => {
            const isExpanded = expandedRequest === req.id;

            return (
              <div key={req.id} className={`rounded-lg border p-4 transition-colors ${getStatusColor(req.status)}`}>
                <div
                  onClick={() => setExpandedRequest(isExpanded ? '' : req.id)}
                  className="cursor-pointer flex items-start justify-between gap-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-foreground">{req.user}</h4>
                      <span className={`text-xs px-2 py-0.5 rounded font-bold ${getStatusBadge(req.status)}`}>
                        {req.status.toUpperCase()}
                      </span>
                      {req.isActive && (
                        <span className="text-xs px-2 py-0.5 rounded bg-green-600 text-white font-bold flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">
                      {req.currentRole} → {req.requestedRole}
                    </p>
                    <p className="text-xs text-foreground">{req.reason}</p>
                  </div>
                  <div className="text-xs text-muted-foreground text-right">
                    {req.durationHours}h
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-white/20 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground mb-2">Request Details</p>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Current Role:</span>
                            <span className="font-semibold text-foreground">{req.currentRole}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Requested Role:</span>
                            <span className="font-semibold text-foreground">{req.requestedRole}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Duration:</span>
                            <span className="font-semibold text-foreground">{req.durationHours} hours</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Requested:</span>
                            <span className="font-mono text-foreground text-xs">{req.requestedAt}</span>
                          </div>
                        </div>
                      </div>

                      {req.status !== 'pending' && (
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground mb-2">Approval Details</p>
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Approved By:</span>
                              <span className="font-semibold text-foreground">{req.approvedBy}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Approved At:</span>
                              <span className="font-mono text-foreground text-xs">{req.approvedAt}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Expires At:</span>
                              <span className="font-mono text-foreground text-xs">{req.expiresAt}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    {req.status === 'pending' && (
                      <div className="flex gap-2 pt-2 border-t border-white/20">
                        <button className="flex-1 px-3 py-1.5 rounded bg-green-600/20 text-green-700 hover:bg-green-600/30 transition-colors text-xs font-medium flex items-center justify-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Approve
                        </button>
                        <button className="flex-1 px-3 py-1.5 rounded border border-red-500/30 text-red-700 hover:bg-red-500/10 transition-colors text-xs font-medium flex items-center justify-center gap-1">
                          <X className="w-3 h-3" />
                          Deny
                        </button>
                      </div>
                    )}

                    {req.status === 'approved' && req.isActive && (
                      <div className="flex gap-2 pt-2 border-t border-white/20">
                        <button className="flex-1 px-3 py-1.5 rounded border border-white/30 hover:bg-white/10 transition-colors text-xs font-medium">
                          View Audit Log
                        </button>
                        <button className="flex-1 px-3 py-1.5 rounded border border-red-500/30 text-red-700 hover:bg-red-500/10 transition-colors text-xs font-medium flex items-center justify-center gap-1">
                          <X className="w-3 h-3" />
                          Revoke Early
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

      {/* New Request Form */}
      {showNewRequest && (
        <div className="rounded-xl border border-border/50 p-6 bg-card/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-foreground">Request Privilege Elevation</h3>
            <button
              onClick={() => setShowNewRequest(false)}
              className="p-1 hover:bg-muted rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-foreground block mb-2">Requested Role</label>
              <select
                value={requestForm.role}
                onChange={(e) => setRequestForm({ ...requestForm, role: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
              >
                <option value="admin">System Admin</option>
                <option value="manager">Operations Manager</option>
                <option value="auditor">Auditor</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold text-foreground block mb-2">Duration (hours)</label>
              <input
                type="number"
                min="1"
                max="24"
                value={requestForm.duration}
                onChange={(e) => setRequestForm({ ...requestForm, duration: parseInt(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">Max 24 hours. Access will auto-expire.</p>
            </div>

            <div>
              <label className="text-sm font-semibold text-foreground block mb-2">Business Justification</label>
              <textarea
                value={requestForm.reason}
                onChange={(e) => setRequestForm({ ...requestForm, reason: e.target.value })}
                placeholder="Explain why you need this elevated access..."
                rows={4}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
              />
            </div>

            <button className="w-full px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium flex items-center justify-center gap-2">
              <Send className="w-4 h-4" />
              Submit Request
            </button>
          </div>
        </div>
      )}

      {/* Best Practices */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          Best Practices for Elevation Requests
        </h3>

        <div className="space-y-3">
          <div className="p-4 bg-muted/30 rounded-lg border border-border/30">
            <p className="font-semibold text-foreground text-sm mb-2">1. Request Minimum Duration</p>
            <p className="text-xs text-muted-foreground">
              Only request the minimum time needed. 1-2 hours is standard for most tasks.
            </p>
          </div>

          <div className="p-4 bg-muted/30 rounded-lg border border-border/30">
            <p className="font-semibold text-foreground text-sm mb-2">2. Provide Clear Justification</p>
            <p className="text-xs text-muted-foreground">
              Explain what you need to do. Managers use this to verify legitimacy of requests.
            </p>
          </div>

          <div className="p-4 bg-muted/30 rounded-lg border border-border/30">
            <p className="font-semibold text-foreground text-sm mb-2">3. Act During Business Hours</p>
            <p className="text-xs text-muted-foreground">
              Request approval during business hours so managers can review and approve promptly.
            </p>
          </div>

          <div className="p-4 bg-muted/30 rounded-lg border border-border/30">
            <p className="font-semibold text-foreground text-sm mb-2">4. Complete Tasks Before Expiry</p>
            <p className="text-xs text-muted-foreground">
              Finish your work before elevation expires. Access is automatically revoked at expiration time.
            </p>
          </div>

          <div className="p-4 bg-muted/30 rounded-lg border border-border/30">
            <p className="font-semibold text-foreground text-sm mb-2">5. Know You're Being Watched</p>
            <p className="text-xs text-muted-foreground">
              All actions during elevated access are logged separately for audit and monitoring.
            </p>
          </div>
        </div>
      </div>

      {/* Audit Logging */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4">Audit Trail of Elevated Actions</h3>

        <p className="text-sm text-muted-foreground mb-4">
          Every action taken during elevated privilege period is tagged and logged separately:
        </p>

        <div className="space-y-2 text-xs">
          <div className="p-3 bg-muted/30 rounded-lg border border-border/30 font-mono">
            <p className="text-foreground">2024-03-11 14:32:00 | User: ahmed.hassan [ELEVATED]</p>
            <p className="text-muted-foreground">Action: Kill Switch Activated | Elevation ID: elev-req-1</p>
            <p className="text-muted-foreground">Role: System Admin (temp, expires 15:31) | Tenant: Egypt</p>
          </div>

          <div className="p-3 bg-muted/30 rounded-lg border border-border/30 font-mono">
            <p className="text-foreground">2024-03-11 14:33:15 | User: ahmed.hassan [ELEVATED]</p>
            <p className="text-muted-foreground">Action: Modified 847 Automation Rules | Elevation ID: elev-req-1</p>
            <p className="text-muted-foreground">Role: System Admin (temp) | Changes logged for audit</p>
          </div>

          <div className="p-3 bg-muted/30 rounded-lg border border-border/30 font-mono">
            <p className="text-foreground">2024-03-11 15:31:00 | User: ahmed.hassan [ELEVATION EXPIRED]</p>
            <p className="text-muted-foreground">Elevation ID: elev-req-1 | Reverted to: Operations Manager</p>
            <p className="text-muted-foreground">Summary: 2 commands executed, 847 rules modified, all logged</p>
          </div>
        </div>
      </div>
    </div>
  );
}
