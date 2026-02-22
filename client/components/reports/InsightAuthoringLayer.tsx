import { Lightbulb, Sparkles, BookOpen, MessageSquare } from 'lucide-react';

export default function InsightAuthoringLayer() {
  const insights = [
    {
      title: 'Traffic Congestion Alert',
      type: 'anomaly',
      description: 'Transport layer utilization exceeded 85% threshold on Cairo-Site-1 over the past 6 hours',
      recommendation: 'Action: Shift 30% of traffic to Alexandria Site to balance load and prevent degradation',
      confidence: 94
    },
    {
      title: 'RF Parameter Drift',
      type: 'deviation',
      description: 'Handover success rate decreased by 7% vs. baseline configuration',
      recommendation: 'Review: Recent parameter changes from Command Center. Rollback to previous config and retest.',
      confidence: 87
    },
    {
      title: 'Cost Optimization Opportunity',
      type: 'opportunity',
      description: 'By consolidating 4G traffic to fewer cells during off-peak hours, you can reduce power consumption',
      recommendation: 'Implement: Automated traffic consolidation policy to save ~$120K/month in power costs',
      confidence: 91
    }
  ];

  return (
    <div className="space-y-8">
      {/* AI Narrative Generation */}
      <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-xl p-6">
        <h3 className="font-bold text-foreground mb-2 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          AI-Powered Narrative Generation
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Automatically generate natural language insights and actionable recommendations from data patterns.
        </p>
        <textarea
          className="w-full px-4 py-3 rounded-lg border border-indigo-500/20 bg-indigo-500/5 text-sm text-muted-foreground font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          rows={6}
          value={`Executive Summary:
Transport network is operating near capacity limits. Immediate load balancing required.

Key Metrics:
• Average utilization: 83% (target: 70%)
• Peak hour congestion: 92% utilization
• Affected cells: Cairo-Site-1 (4G), Cairo-Site-2 (5G)

Recommendations:
1. Shift 30% of traffic to Alexandria Site [Cost: $5K implementation | Benefit: $150K/month relief]
2. Deploy traffic steering policies to distribute 5G load [Timeline: 2 days]
3. Increase backhaul capacity by 40Gbps [Timeline: 4 weeks]

Decision Impact:
Failure to act could result in service degradation affecting 2.4M subscribers.
Immediate action recommended.`}
          readOnly
        />
      </div>

      {/* Intelligence Library */}
      <div>
        <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-600" />
          Generated Insights
        </h3>

        <div className="space-y-4">
          {insights.map((insight, idx) => (
            <div
              key={idx}
              className={`rounded-xl border p-6 ${
                insight.type === 'anomaly'
                  ? 'border-red-500/20 bg-red-500/5'
                  : insight.type === 'deviation'
                    ? 'border-orange-500/20 bg-orange-500/5'
                    : 'border-green-500/20 bg-green-500/5'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-bold text-foreground">{insight.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{insight.type.toUpperCase()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Confidence</p>
                    <p className="font-bold text-foreground">{insight.confidence}%</p>
                  </div>
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" 
                    style={{
                      background: `conic-gradient(
                        ${insight.type === 'anomaly' ? '#ef4444' : insight.type === 'deviation' ? '#f59e0b' : '#22c55e'} 0deg ${insight.confidence * 3.6}deg,
                        hsl(var(--muted)) ${insight.confidence * 3.6}deg 360deg
                      )`
                    }}>
                    <div className="w-10 h-10 rounded-full bg-card flex items-center justify-center">
                      <span className="text-xs font-bold text-foreground">{insight.confidence}%</span>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-sm text-foreground mb-3">{insight.description}</p>

              <div className="bg-muted/30 p-3 rounded-lg border border-border/30 mb-3">
                <p className="text-sm font-semibold text-foreground mb-1">Recommendation:</p>
                <p className="text-sm text-muted-foreground">{insight.recommendation}</p>
              </div>

              <div className="flex gap-2">
                <button className="flex-1 px-3 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-sm font-medium">
                  Accept & Implement
                </button>
                <button className="px-3 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-sm">
                  Drill Down
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Insight Configuration */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-purple-600" />
          Configure Insight Generation
        </h3>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-foreground block mb-2">
              Insight Types to Generate
            </label>
            <div className="space-y-2">
              {[
                { name: 'Anomalies', description: 'Detect unusual patterns and deviations' },
                { name: 'Trends', description: 'Identify directional changes over time' },
                { name: 'Correlations', description: 'Find relationships between metrics' },
                { name: 'Opportunities', description: 'Suggest optimization and cost-saving actions' },
                { name: 'Risks', description: 'Alert on potential SLA violations' }
              ].map((type, idx) => (
                <label key={idx} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                  <input type="checkbox" defaultChecked className="mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{type.name}</p>
                    <p className="text-xs text-muted-foreground">{type.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-border/50">
            <label className="text-sm font-semibold text-foreground block mb-2">
              Minimum Confidence Threshold
            </label>
            <input
              type="range"
              min="50"
              max="99"
              defaultValue="80"
              className="w-full"
            />
            <p className="text-xs text-muted-foreground mt-2">Only show insights with ≥ 80% confidence</p>
          </div>
        </div>
      </div>

      {/* Smart Recommendations */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-yellow-600" />
          Next Recommended Actions
        </h3>

        <div className="space-y-3">
          <div className="p-4 bg-muted/30 rounded-lg border border-border/30">
            <p className="text-sm font-semibold text-foreground mb-1">1. Load Balancing Implementation</p>
            <p className="text-xs text-muted-foreground">Shift 30% traffic from Cairo-Site-1 to Alexandria | Est. Cost: $5K | ROI: 30x over 1 month</p>
            <button className="mt-2 text-xs px-3 py-1 bg-primary/10 text-primary rounded hover:bg-primary/20 transition-colors">
              View Details & Execute
            </button>
          </div>

          <div className="p-4 bg-muted/30 rounded-lg border border-border/30">
            <p className="text-sm font-semibold text-foreground mb-1">2. RF Parameter Tuning</p>
            <p className="text-xs text-muted-foreground">Optimize handover thresholds based on recent drift | Est. Cost: $0 (config only) | Benefit: +4% HO success</p>
            <button className="mt-2 text-xs px-3 py-1 bg-primary/10 text-primary rounded hover:bg-primary/20 transition-colors">
              Preview Changes
            </button>
          </div>

          <div className="p-4 bg-muted/30 rounded-lg border border-border/30">
            <p className="text-sm font-semibold text-foreground mb-1">3. Power Optimization</p>
            <p className="text-xs text-muted-foreground">Enable traffic consolidation during 10PM-6AM | Est. Cost: $0 | Savings: $120K/month</p>
            <button className="mt-2 text-xs px-3 py-1 bg-primary/10 text-primary rounded hover:bg-primary/20 transition-colors">
              Create Policy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
