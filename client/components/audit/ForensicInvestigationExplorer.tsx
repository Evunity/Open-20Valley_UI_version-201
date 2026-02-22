import { SearchCode, Download, Filter, AlertTriangle } from 'lucide-react';

export default function ForensicInvestigationExplorer() {
  return (
    <div className="space-y-8">
      {/* Description */}
      <div className="bg-purple-500/5 border border-purple-500/20 rounded-xl p-6">
        <h3 className="font-bold text-foreground mb-2 flex items-center gap-2">
          <SearchCode className="w-5 h-5 text-purple-600" />
          Forensic Investigation Explorer
        </h3>
        <p className="text-sm text-muted-foreground">
          Deep-dive analysis tools for security incidents and compliance reviews. Reconstruct events, analyze patterns, and generate forensic reports for legal discovery.
        </p>
      </div>

      {/* Investigation Search */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4">Start Investigation</h3>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-foreground block mb-2">Investigation Type</label>
            <select className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm">
              <option>Security Incident</option>
              <option>Compliance Breach</option>
              <option>Configuration Drift</option>
              <option>Data Exposure</option>
              <option>Privilege Abuse</option>
              <option>Custom Query</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-foreground block mb-2">Start Date</label>
              <input type="datetime-local" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" />
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground block mb-2">End Date</label>
              <input type="datetime-local" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-foreground block mb-2">Involved Actors</label>
            <input 
              type="text" 
              placeholder="Enter usernames, systems, or automation names..."
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
            />
          </div>

          <button className="w-full px-6 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium">
            Start Investigation
          </button>
        </div>
      </div>

      {/* Investigation Templates */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4">Forensic Report Templates</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { name: 'Incident Reconstruction', desc: 'Timeline of events leading to security incident', icon: '🔍' },
            { name: 'Chain of Custody', desc: 'Data access and modification history', icon: '🔐' },
            { name: 'Root Cause Analysis', desc: 'Determine what happened and why', icon: '🎯' },
            { name: 'Impact Assessment', desc: 'What systems/data were affected', icon: '📊' },
            { name: 'Privilege Trail', desc: 'Track all privileged actions', icon: '🔑' },
            { name: 'Behavioral Pattern', desc: 'Anomalies compared to normal activity', icon: '📈' }
          ].map((template, idx) => (
            <button
              key={idx}
              className="p-4 rounded-lg border border-border/50 hover:border-primary/50 hover:bg-muted/50 transition-all text-left group"
            >
              <span className="text-2xl mb-2 block">{template.icon}</span>
              <p className="font-bold text-foreground text-sm mb-1 group-hover:text-primary transition-colors">{template.name}</p>
              <p className="text-xs text-muted-foreground">{template.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Investigations */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4">Recent Investigations</h3>

        <div className="space-y-3">
          {[
            { name: 'Privilege Escalation - RF Engineer', date: '2024-03-11 14:32', status: 'active', findings: 'Escalation authorized via MFA' },
            { name: 'Unauthorized API Access Attempt', date: '2024-03-10 09:15', status: 'completed', findings: 'Rate limit violation - blocked' },
            { name: 'Configuration Drift Analysis', date: '2024-03-09 16:45', status: 'completed', findings: '3 parameters manual override detected' }
          ].map((inv, idx) => (
            <div key={idx} className="p-4 bg-muted/30 rounded-lg border border-border/30">
              <div className="flex items-start justify-between mb-2">
                <p className="text-sm font-bold text-foreground">{inv.name}</p>
                <span className={`text-xs px-2 py-1 rounded font-semibold ${
                  inv.status === 'active' ? 'bg-blue-500/20 text-blue-700' : 'bg-green-500/20 text-green-700'
                }`}>
                  {inv.status}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mb-2">{inv.date}</p>
              <p className="text-xs text-foreground bg-muted/50 p-2 rounded">Findings: {inv.findings}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Export and Discovery */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
          <Download className="w-5 h-5" />
          Forensic Evidence Export
        </h3>

        <p className="text-sm text-muted-foreground mb-4">
          Generate forensically sound reports suitable for legal discovery and regulatory submission:
        </p>

        <div className="space-y-2">
          <button className="w-full px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-sm font-medium text-left">
            Generate Full Incident Report (PDF)
          </button>
          <button className="w-full px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-sm font-medium text-left">
            Export Raw Event Data (JSON)
          </button>
          <button className="w-full px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-sm font-medium text-left">
            Chain of Custody Certificate
          </button>
        </div>
      </div>
    </div>
  );
}
