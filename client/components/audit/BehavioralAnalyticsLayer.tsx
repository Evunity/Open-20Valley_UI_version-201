import { TrendingUp, AlertTriangle, Zap } from 'lucide-react';

export default function BehavioralAnalyticsLayer() {
  const anomalies = [
    { user: 'rf_engineer', anomaly: 'Escalation to admin role', severity: 'high', probability: 94, baseline: 'Never escalates', context: 'Authorized via MFA for emergency' },
    { user: 'transport_analyst', anomaly: 'Long session duration (22+ hours)', severity: 'medium', probability: 78, baseline: 'Typical: 8h', context: 'Unusual for shift pattern' },
    { user: 'api_client_external', anomaly: 'Rate limit exceeded (500 req/min)', severity: 'high', probability: 99, baseline: 'Typical: 50 req/min', context: 'Blocked - possible DoS attempt' }
  ];

  return (
    <div className="space-y-8">
      {/* Description */}
      <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-xl p-6">
        <h3 className="font-bold text-foreground mb-2 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-indigo-600" />
          Behavioral Analytics Layer
        </h3>
        <p className="text-sm text-muted-foreground">
          ML-powered anomaly detection to identify unusual behavioral patterns, insider threats, and suspicious activities.
        </p>
      </div>

      {/* Active Anomalies */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4">Detected Anomalies (Real-Time)</h3>

        <div className="space-y-4">
          {anomalies.map((anomaly, idx) => (
            <div key={idx} className={`p-4 rounded-lg border ${
              anomaly.severity === 'high'
                ? 'bg-red-500/5 border-red-500/20'
                : 'bg-orange-500/5 border-orange-500/20'
            }`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <p className="text-sm font-bold text-foreground">{anomaly.user}</p>
                  <p className="text-sm text-muted-foreground mt-1">{anomaly.anomaly}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded font-semibold flex-shrink-0 ${
                  anomaly.severity === 'high' ? 'bg-red-500/20 text-red-700' : 'bg-orange-500/20 text-orange-700'
                }`}>
                  {anomaly.severity.toUpperCase()}
                </span>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
                  <span className="text-xs text-muted-foreground">Anomaly Probability</span>
                  <span className="font-bold text-foreground">{anomaly.probability}%</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
                  <span className="text-xs text-muted-foreground">Baseline Behavior</span>
                  <span className="font-mono text-xs text-foreground">{anomaly.baseline}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
                  <span className="text-xs text-muted-foreground">Context</span>
                  <span className="text-xs text-foreground">{anomaly.context}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Behavioral Profiles */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4">User Behavioral Profiles</h3>

        <div className="space-y-4">
          {[
            {
              user: 'rf_engineer',
              profile: [
                { metric: 'Login Time', value: '08:00 - 18:00 UTC' },
                { metric: 'Avg Session Duration', value: '6-7 hours' },
                { metric: 'Daily Actions', value: '20-40' },
                { metric: 'Escalation Frequency', value: 'Never' },
                { metric: 'Data Export Frequency', value: 'Weekly' }
              ]
            }
          ].map((item, idx) => (
            <div key={idx} className="p-4 bg-muted/30 rounded-lg border border-border/30">
              <p className="text-sm font-bold text-foreground mb-3">{item.user}</p>
              <div className="space-y-1 text-xs">
                {item.profile.map((p, pidx) => (
                  <div key={pidx} className="flex items-center justify-between">
                    <span className="text-muted-foreground">{p.metric}</span>
                    <span className="font-mono text-foreground">{p.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Insider Threat Scoring */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-600" />
          Insider Threat Risk Scores
        </h3>

        <div className="space-y-3">
          {[
            { user: 'rf_engineer', score: 34, risk: 'moderate', factors: 'Privilege escalation (today)' },
            { user: 'ops_manager', score: 12, risk: 'low', factors: 'Normal behavior' },
            { user: 'transport_analyst', score: 45, risk: 'elevated', factors: 'Unusual session duration' },
            { user: 'api_client_external', score: 87, risk: 'critical', factors: 'Rate limit abuse attempt' }
          ].map((item, idx) => (
            <div key={idx} className="p-3 bg-muted/30 rounded-lg border border-border/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-foreground">{item.user}</span>
                <span className={`text-xs px-2 py-1 rounded font-semibold ${
                  item.score > 70 ? 'bg-red-500/20 text-red-700' :
                  item.score > 40 ? 'bg-orange-500/20 text-orange-700' :
                  'bg-green-500/20 text-green-700'
                }`}>
                  {item.risk.toUpperCase()}
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 mb-1">
                <div 
                  className={`h-2 rounded-full ${
                    item.score > 70 ? 'bg-red-600' :
                    item.score > 40 ? 'bg-orange-600' :
                    'bg-green-600'
                  }`}
                  style={{ width: `${item.score}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">Risk Factors: {item.factors}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ML Model Insights */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-600" />
          ML Model Insights
        </h3>

        <div className="space-y-3 text-sm">
          <div className="p-3 bg-muted/30 rounded-lg border border-border/30">
            <p className="font-semibold text-foreground mb-1">Model Accuracy</p>
            <p className="text-xs text-muted-foreground">94.2% precision in anomaly detection over 90-day window</p>
          </div>

          <div className="p-3 bg-muted/30 rounded-lg border border-border/30">
            <p className="font-semibold text-foreground mb-1">False Positive Rate</p>
            <p className="text-xs text-muted-foreground">2.8% (within acceptable range for security monitoring)</p>
          </div>

          <div className="p-3 bg-muted/30 rounded-lg border border-border/30">
            <p className="font-semibold text-foreground mb-1">Training Data</p>
            <p className="text-xs text-muted-foreground">12 months of historical activity (4.2M events)</p>
          </div>
        </div>
      </div>

      {/* Response Actions */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4">Automated Response Actions</h3>

        <div className="space-y-2">
          <label className="flex items-center gap-3 p-2 cursor-pointer hover:bg-muted/30 rounded transition-colors">
            <input type="checkbox" defaultChecked />
            <span className="text-sm text-foreground">Alert security team on high-risk anomalies</span>
          </label>
          <label className="flex items-center gap-3 p-2 cursor-pointer hover:bg-muted/30 rounded transition-colors">
            <input type="checkbox" defaultChecked />
            <span className="text-sm text-foreground">Rate-limit API clients exceeding thresholds</span>
          </label>
          <label className="flex items-center gap-3 p-2 cursor-pointer hover:bg-muted/30 rounded transition-colors">
            <input type="checkbox" />
            <span className="text-sm text-foreground">Force re-authentication for escalated access</span>
          </label>
          <label className="flex items-center gap-3 p-2 cursor-pointer hover:bg-muted/30 rounded transition-colors">
            <input type="checkbox" />
            <span className="text-sm text-foreground">Revoke access token immediately on critical anomaly</span>
          </label>
        </div>
      </div>
    </div>
  );
}
