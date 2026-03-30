import { AlertTriangle, CheckCircle, TrendingUp, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ExecutiveRiskOverview() {
  const operationalRiskScore = 27;
  const riskStatus = 'Guarded';

  const riskFactors = [
    { metric: 'Failed Logins', value: 12, status: 'warning', impact: 'Medium' },
    { metric: 'Privilege Escalations', value: 2, status: 'critical', impact: 'High' },
    { metric: 'Automation Overrides', value: 1, status: 'warning', impact: 'High' },
    { metric: 'Suspicious Exports', value: 3, status: 'warning', impact: 'Medium' },
    { metric: 'API Abuse Attempts', value: 5, status: 'warning', impact: 'Medium' }
  ];

  const executiveCards = [
    {
      title: 'Privileged Actions',
      description: 'Admin-level changes',
      value: 8,
      timeframe: 'Today',
      severity: 'medium',
      trend: 'up'
    },
    {
      title: 'Policy Violations',
      description: 'Blocked or unauthorized attempts',
      value: 3,
      timeframe: 'Today',
      severity: 'high',
      trend: 'up'
    },
    {
      title: 'Automation Governance Alerts',
      description: 'Actions outside guardrails',
      value: 1,
      timeframe: 'Today',
      severity: 'critical',
      trend: 'stable'
    },
    {
      title: 'Configuration Drift',
      description: 'Deviation from baseline',
      value: 2,
      timeframe: 'This week',
      severity: 'medium',
      trend: 'stable'
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-700 bg-red-500/10';
      case 'high':
        return 'text-orange-700 bg-orange-500/10';
      case 'medium':
        return 'text-yellow-700 bg-yellow-500/10';
      case 'low':
        return 'text-green-700 bg-green-500/10';
      default:
        return 'text-blue-700 bg-blue-500/10';
    }
  };

  return (
    <div className="space-y-2">

      {/* Operational Risk Score + Executive Risk Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Risk Score Card */}
        <div className="rounded-xl border border-border/50 p-6 bg-card/50 lg:col-span-1">
          <div className="flex flex-col items-center">
            <div>
              <div className="flex items-baseline gap-1 justify-center">
                <span className="text-5xl font-bold text-orange-600">{operationalRiskScore}</span>
                <span className="text-lg text-muted-foreground">/100</span>
              </div>
              <p className="text-sm font-semibold text-orange-600 mt-2 text-center">Status: {riskStatus}</p>
            </div>
            <div className="w-32 h-32 rounded-full flex items-center justify-center mt-4"
              style={{
                background: `conic-gradient(
                  #f97316 0deg ${operationalRiskScore * 3.6}deg,
                  hsl(var(--muted)) ${operationalRiskScore * 3.6}deg 360deg
                )`
              }}>
              <div className="w-28 h-28 rounded-full bg-card flex items-center justify-center">
                <span className="text-3xl font-bold text-orange-600">{operationalRiskScore}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Executive Risk Cards */}
        <div className="lg:col-span-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {executiveCards.map((card, idx) => (
            <div
              key={idx}
              className={cn(
                "rounded-xl border p-4 transition-all",
                card.severity === 'critical'
                  ? 'bg-red-500/5 border-red-500/20'
                  : card.severity === 'high'
                    ? 'bg-orange-500/5 border-orange-500/20'
                    : 'bg-yellow-500/5 border-yellow-500/20'
              )}
            >
              <div className="mb-3">
                <h4 className="font-bold text-foreground text-sm">{card.title}</h4>
                <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
              </div>

              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-3xl font-bold text-foreground">{card.value}</span>
                <span className="text-xs text-muted-foreground">{card.timeframe}</span>
              </div>

              <div className="text-xs text-muted-foreground">
                Trend: {card.trend === 'up' ? '↑ Increasing' : '→ Stable'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Risk Assessment */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h4 className="font-bold text-foreground mb-4">Risk Assessment Summary</h4>
        <div className="space-y-3">
          {riskFactors.map((factor, idx) => (
            <div key={idx} className="p-3 bg-muted/30 rounded-lg border border-border/30">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-foreground">{factor.metric}</span>
                <span className={cn("text-xs font-bold px-2 py-1 rounded", getSeverityColor(factor.status))}>
                  {factor.value} events
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Impact: {factor.impact}</span>
                <span className={`font-semibold ${factor.status === 'critical' ? 'text-red-600' : 'text-yellow-600'}`}>
                  ↑ Trending
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Risk Thresholds and Alerts */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4">
          Active Risk Alerts
        </h3>

        <div className="space-y-3">
          <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-lg">
            <div>
              <div>
                <p className="text-sm font-semibold text-red-700">Critical: Privilege Escalation Detected</p>
                <p className="text-xs text-muted-foreground mt-1">
                  User 'rf_engineer' escalated to admin role at 14:32:15 UTC. Manual action required for policy compliance.
                </p>
                <button className="mt-2 text-xs px-3 py-1 bg-red-500/20 text-red-700 rounded hover:bg-red-500/30 transition-colors font-medium">
                  Review Action
                </button>
              </div>
            </div>
          </div>

          <div className="p-4 bg-orange-500/5 border border-orange-500/20 rounded-lg">
            <div>
              <div>
                <p className="text-sm font-semibold text-orange-700">Warning: Automation Override Detected</p>
                <button className="mt-2 text-xs px-3 py-1 bg-orange-500/20 text-orange-700 rounded hover:bg-orange-500/30 transition-colors font-medium">
                  Investigate
                </button>
              </div>
            </div>
          </div>

          <div className="p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-lg">
            <div>
              <div>
                <p className="text-sm font-semibold text-yellow-700">Notice: Configuration Drift Detected</p>
                <button className="mt-2 text-xs px-3 py-1 bg-yellow-500/20 text-yellow-700 rounded hover:bg-yellow-500/30 transition-colors font-medium">
                  View Drift
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Mitigation Actions */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4">
          Recommended Risk Mitigations
        </h3>

        <div className="space-y-2">
          <div className="p-3 bg-muted/30 rounded-lg border border-border/30 text-sm">
            <p className="font-medium text-foreground mb-1">1. Enable MFA for privileged accounts</p>
          </div>

          <div className="p-3 bg-muted/30 rounded-lg border border-border/30 text-sm">
            <p className="font-medium text-foreground mb-1">2. Implement automation override approval workflow</p>
          </div>

          <div className="p-3 bg-muted/30 rounded-lg border border-border/30 text-sm">
            <p className="font-medium text-foreground mb-1">3. Enable configuration change notifications</p>
          </div>
        </div>
      </div>
    </div>
  );
}
