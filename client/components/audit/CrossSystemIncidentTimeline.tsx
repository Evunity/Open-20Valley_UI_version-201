import { GitBranch, AlertTriangle } from 'lucide-react';

export default function CrossSystemIncidentTimeline() {
  const timeline = [
    { time: '14:32:15', module: 'Authentication', event: 'Privilege escalation request', status: 'success', severity: 'critical' },
    { time: '14:32:18', module: 'Command Center', event: 'Admin access granted to rf_engineer', status: 'success', severity: 'critical' },
    { time: '14:32:45', module: 'Automation', event: 'Manual override of Load Balancing policy', status: 'success', severity: 'warning' },
    { time: '14:33:02', module: 'Topology', event: 'Configuration pushed to Cairo-Site-1', status: 'success', severity: 'warning' },
    { time: '14:33:15', module: 'Analytics', event: 'Congestion metrics updated (spike detected)', status: 'success', severity: 'info' },
    { time: '14:34:20', module: 'Alarms', event: '2 alarms triggered on RF parameters', status: 'success', severity: 'warning' },
  ];

  return (
    <div className="space-y-8">
      {/* Description */}
      <div className="bg-orange-500/5 border border-orange-500/20 rounded-xl p-6">
        <h3 className="font-bold text-foreground mb-2 flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-orange-600" />
          Cross-System Incident Timeline
        </h3>
        <p className="text-sm text-muted-foreground">
          Reconstruct multi-module incidents with precise timing and causal relationships. Understand how actions in one module triggered events in others.
        </p>
      </div>

      {/* Timeline Visualization */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-6">Incident Progression: 2024-03-11 14:32 - 14:34</h3>

        <div className="space-y-4">
          {timeline.map((event, idx) => (
            <div key={idx} className="flex gap-4">
              {/* Timeline connector */}
              <div className="flex flex-col items-center">
                <div className={`w-3 h-3 rounded-full ${
                  event.severity === 'critical' ? 'bg-red-600' :
                  event.severity === 'warning' ? 'bg-orange-600' :
                  'bg-green-600'
                }`} />
                {idx < timeline.length - 1 && (
                  <div className={`w-0.5 h-12 ${
                    event.severity === 'critical' ? 'bg-red-600' :
                    event.severity === 'warning' ? 'bg-orange-600' :
                    'bg-green-600'
                  }`} />
                )}
              </div>

              {/* Event Content */}
              <div className="flex-1 pb-2">
                <p className="text-xs text-muted-foreground font-mono">{event.time}</p>
                <div className="p-3 bg-muted/30 rounded-lg border border-border/30 mt-1">
                  <p className="text-sm font-bold text-foreground">{event.module}</p>
                  <p className="text-sm text-muted-foreground">{event.event}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-xs px-2 py-0.5 rounded font-semibold ${
                      event.status === 'success' ? 'bg-green-500/20 text-green-700' : 'bg-red-500/20 text-red-700'
                    }`}>
                      {event.status.toUpperCase()}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded font-semibold ${
                      event.severity === 'critical' ? 'bg-red-500/20 text-red-700' :
                      event.severity === 'warning' ? 'bg-orange-500/20 text-orange-700' :
                      'bg-green-500/20 text-green-700'
                    }`}>
                      {event.severity.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Root Cause Analysis */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4">Root Cause Analysis</h3>

        <div className="space-y-3">
          <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-lg">
            <p className="text-sm font-bold text-red-700 mb-1">Root Cause: Manual Privilege Escalation</p>
            <p className="text-xs text-muted-foreground">
              rf_engineer initiated privilege escalation at 14:32:15, authorized via MFA. This granted admin rights to execute commands directly.
            </p>
          </div>

          <div className="p-4 bg-orange-500/5 border border-orange-500/20 rounded-lg">
            <p className="text-sm font-bold text-orange-700 mb-1">Direct Impact: Automation Override</p>
            <p className="text-xs text-muted-foreground">
              30 seconds later, the new admin user manually overrode Load Balancing automation policy, bypassing approval workflow.
            </p>
          </div>

          <div className="p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-lg">
            <p className="text-sm font-bold text-yellow-700 mb-1">Cascading Effect: Configuration Change</p>
            <p className="text-xs text-muted-foreground">
              Command center pushed configuration to network, triggering alerts in topology and alarm modules. 2-minute total latency for full impact.
            </p>
          </div>
        </div>
      </div>

      {/* Causal Graph */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4">Causal Dependency Graph</h3>

        <div className="bg-muted/30 p-6 rounded-lg border border-border/30 font-mono text-xs text-muted-foreground overflow-x-auto">
{`Privilege Escalation (14:32:15)
    ↓
Admin Access Granted (14:32:18)
    ↓
Automation Override (14:32:45)
    ├→ Config Change (14:33:02)
    │   └→ Topology Update (14:33:02)
    │       └→ Alarms Triggered (14:34:20)
    └→ Metrics Updated (14:33:15)
        └→ Analytics Spike (14:33:15)`}
        </div>
      </div>

      {/* Export Report */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <p className="text-sm text-muted-foreground mb-4">
          This timeline is suitable for postmortem analysis and compliance reporting:
        </p>
        <button className="w-full px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-sm font-medium">
          Generate Incident Report
        </button>
      </div>
    </div>
  );
}
