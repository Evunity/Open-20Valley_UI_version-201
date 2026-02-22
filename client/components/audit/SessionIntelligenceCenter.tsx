import { Users, Activity, AlertTriangle } from 'lucide-react';

export default function SessionIntelligenceCenter() {
  const sessions = [
    { user: 'rf_engineer', login: '2024-03-11 08:32 UTC', ip: '192.168.1.105', device: 'Laptop-MacBook', actions: 24, duration: '6h 42m', status: 'active', riskLevel: 'high' },
    { user: 'ops_manager', login: '2024-03-11 07:15 UTC', ip: '192.168.1.108', device: 'Desktop-Windows', actions: 18, duration: '7h 58m', status: 'active', riskLevel: 'low' },
    { user: 'transport_analyst', login: '2024-03-10 14:20 UTC', ip: '192.168.2.230', device: 'Laptop-Windows', actions: 45, duration: '22h 15m', status: 'idle', riskLevel: 'medium' }
  ];

  return (
    <div className="space-y-8">
      {/* Description */}
      <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-6">
        <h3 className="font-bold text-foreground mb-2 flex items-center gap-2">
          <Users className="w-5 h-5 text-green-600" />
          Session Intelligence Center
        </h3>
        <p className="text-sm text-muted-foreground">
          Monitor active user sessions, track behavioral patterns, and detect anomalies in real-time.
        </p>
      </div>

      {/* Active Sessions */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4">Active Sessions</h3>

        <div className="space-y-3">
          {sessions.map((session, idx) => (
            <div key={idx} className="p-4 bg-muted/30 rounded-lg border border-border/30">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <p className="text-sm font-bold text-foreground">{session.user}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Logged in: {session.login} • From: {session.ip} ({session.device})
                  </p>
                </div>
                <span className={`text-xs px-2 py-1 rounded font-semibold ${
                  session.riskLevel === 'high' ? 'bg-red-500/20 text-red-700' :
                  session.riskLevel === 'medium' ? 'bg-yellow-500/20 text-yellow-700' :
                  'bg-green-500/20 text-green-700'
                }`}>
                  {session.riskLevel.toUpperCase()} RISK
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-xs mb-3">
                <div>
                  <p className="text-muted-foreground">Actions</p>
                  <p className="font-bold text-foreground">{session.actions}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Duration</p>
                  <p className="font-bold text-foreground">{session.duration}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <p className={`font-bold ${session.status === 'active' ? 'text-green-600' : 'text-gray-600'}`}>
                    {session.status.toUpperCase()}
                  </p>
                </div>
              </div>

              {session.riskLevel !== 'low' && (
                <div className="p-2 bg-orange-500/5 border border-orange-500/20 rounded text-xs text-orange-700">
                  Unusual activity pattern detected. Review actions and behavioral anomalies.
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Behavioral Patterns */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Behavioral Analysis
        </h3>

        <div className="space-y-3">
          <div className="p-3 bg-muted/30 rounded-lg border border-border/30">
            <p className="text-sm font-semibold text-foreground mb-1">rf_engineer - Unusual Pattern</p>
            <p className="text-xs text-muted-foreground">
              Escalated to admin role at 14:32. Unusual for this user. 6 privileged actions executed within 45 minutes.
            </p>
          </div>

          <div className="p-3 bg-muted/30 rounded-lg border border-border/30">
            <p className="text-sm font-semibold text-foreground mb-1">transport_analyst - Long Session</p>
            <p className="text-xs text-muted-foreground">
              Connected for 22+ hours continuously. Unusual for typical shift patterns. Review access logs.
            </p>
          </div>
        </div>
      </div>

      {/* Risk Indicators */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-600" />
          Session Risk Indicators
        </h3>

        <div className="space-y-2 text-sm">
          <label className="flex items-center gap-2 p-2 cursor-pointer hover:bg-muted/30 rounded transition-colors">
            <input type="checkbox" defaultChecked />
            <span>Escalation to admin role</span>
          </label>
          <label className="flex items-center gap-2 p-2 cursor-pointer hover:bg-muted/30 rounded transition-colors">
            <input type="checkbox" defaultChecked />
            <span>Access from unusual IP address</span>
          </label>
          <label className="flex items-center gap-2 p-2 cursor-pointer hover:bg-muted/30 rounded transition-colors">
            <input type="checkbox" defaultChecked />
            <span>Bulk data export or query</span>
          </label>
          <label className="flex items-center gap-2 p-2 cursor-pointer hover:bg-muted/30 rounded transition-colors">
            <input type="checkbox" />
            <span>Failed login attempts</span>
          </label>
          <label className="flex items-center gap-2 p-2 cursor-pointer hover:bg-muted/30 rounded transition-colors">
            <input type="checkbox" />
            <span>Off-hours access</span>
          </label>
        </div>
      </div>
    </div>
  );
}
