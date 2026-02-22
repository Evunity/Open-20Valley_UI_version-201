import { Copy, ExternalLink, AlertTriangle, CheckCircle } from 'lucide-react';

export default function EventDNAPanel() {
  const eventDNA = {
    timestamp: '2024-03-11 14:32:15.847',
    actor: 'rf_engineer',
    actorId: 'USR-2847',
    ipAddress: '192.168.1.105',
    geoLocation: 'Cairo, Egypt',
    deviceFingerprint: 'MacBook-Pro-M1-Serial-XYZ123',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    sessionId: 'SESS-2024-849374',
    action: 'PRIVILEGE_ESCALATION',
    target: 'System Admin Role',
    result: 'success',
    riskScore: 94,
    beforeValues: {
      role: 'RF Engineer',
      permissions: ['Read RF', 'Read Topology', 'Write Transport']
    },
    afterValues: {
      role: 'System Admin',
      permissions: ['Full Admin Access']
    },
    linkedEvents: [
      { eventId: 'EVT-20240311-002', action: 'CONFIG_CHANGE', time: '14:32:45' },
      { eventId: 'EVT-20240311-003', action: 'AUTOMATION_OVERRIDE', time: '14:32:58' }
    ],
    riskFlags: [
      'Privilege escalation from non-admin role',
      'Unusual time of day for escalation',
      'Multiple high-risk actions within 2 minutes',
      'New geo-location for this user'
    ]
  };

  return (
    <div className="space-y-6">
      {/* Description */}
      <div className="bg-purple-500/5 border border-purple-500/20 rounded-xl p-6">
        <h3 className="font-bold text-foreground mb-2">Event DNA Panel</h3>
        <p className="text-sm text-muted-foreground">
          Full execution genetics of an event. Click any event in the stream to reveal complete DNA - perfect for forensic analysis and regulatory discovery.
        </p>
      </div>

      {/* Event Header */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm text-muted-foreground">Event ID</p>
            <p className="text-2xl font-mono font-bold text-foreground">EVT-20240311-001</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Risk Score</p>
            <p className="text-3xl font-bold text-red-600">{eventDNA.riskScore}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Action</p>
            <p className="text-sm font-semibold text-foreground">{eventDNA.action}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Target</p>
            <p className="text-sm font-semibold text-foreground">{eventDNA.target}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Result</p>
            <p className="text-sm font-semibold text-green-600">{eventDNA.result.toUpperCase()}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Session ID</p>
            <p className="text-sm font-mono text-foreground">{eventDNA.sessionId}</p>
          </div>
        </div>
      </div>

      {/* Actor DNA */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4">Actor Identity</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="p-3 bg-muted/30 rounded-lg border border-border/30">
              <p className="text-xs text-muted-foreground">Username</p>
              <p className="text-sm font-mono font-bold text-foreground">{eventDNA.actor}</p>
            </div>
            <div className="p-3 bg-muted/30 rounded-lg border border-border/30">
              <p className="text-xs text-muted-foreground">User ID</p>
              <p className="text-sm font-mono font-bold text-foreground">{eventDNA.actorId}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="p-3 bg-muted/30 rounded-lg border border-border/30">
              <p className="text-xs text-muted-foreground">IP Address</p>
              <p className="text-sm font-mono font-bold text-foreground">{eventDNA.ipAddress}</p>
            </div>
            <div className="p-3 bg-muted/30 rounded-lg border border-border/30">
              <p className="text-xs text-muted-foreground">Geo-Location</p>
              <p className="text-sm font-bold text-foreground">{eventDNA.geoLocation}</p>
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-muted/30 rounded-lg border border-border/30">
          <p className="text-xs text-muted-foreground">Device Fingerprint</p>
          <p className="text-sm font-mono text-foreground break-all">{eventDNA.deviceFingerprint}</p>
        </div>
      </div>

      {/* Before/After Values */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4">State Change</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm font-semibold text-muted-foreground mb-3">Before</p>
            <div className="space-y-2">
              {Object.entries(eventDNA.beforeValues).map(([key, value]) => (
                <div key={key} className="p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                  <p className="text-xs text-muted-foreground">{key}</p>
                  <p className="text-sm font-mono text-foreground">{typeof value === 'object' ? (value as string[]).join(', ') : value}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-muted-foreground mb-3">After</p>
            <div className="space-y-2">
              {Object.entries(eventDNA.afterValues).map(([key, value]) => (
                <div key={key} className="p-3 bg-orange-500/5 border border-orange-500/20 rounded-lg">
                  <p className="text-xs text-muted-foreground">{key}</p>
                  <p className="text-sm font-mono text-foreground">{typeof value === 'object' ? (value as string[]).join(', ') : value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Risk Flags */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-600" />
          Risk Flags
        </h3>

        <div className="space-y-2">
          {eventDNA.riskFlags.map((flag, idx) => (
            <div key={idx} className="p-3 bg-orange-500/5 border border-orange-500/20 rounded-lg flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">{flag}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Linked Events */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4">Linked Events (Causal Chain)</h3>

        <div className="space-y-2">
          {eventDNA.linkedEvents.map((event, idx) => (
            <div key={idx} className="p-3 bg-muted/30 rounded-lg border border-border/30 flex items-center justify-between">
              <div>
                <p className="text-sm font-mono font-bold text-foreground">{event.eventId}</p>
                <p className="text-xs text-muted-foreground">{event.action} • {event.time}</p>
              </div>
              <button className="p-2 rounded-lg hover:bg-muted transition-colors" title="Jump to event">
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Export for Discovery */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4">Legal Discovery Export</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Export complete event DNA with cryptographic certification for regulatory/legal use:
        </p>
        <button className="w-full px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium">
          Generate Forensically-Sound Report
        </button>
      </div>
    </div>
  );
}
