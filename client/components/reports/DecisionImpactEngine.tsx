import { Scale, DollarSign, TrendingUp, Target } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function DecisionImpactEngine() {
  const decisions = [
    {
      title: 'Load Balancing: Shift Traffic to Alexandria',
      dateInitiated: '2024-02-15',
      expectedROI: 150000,
      actualROI: 142500,
      status: 'completed',
      timeToValue: '18 days',
      impactMetrics: [
        { metric: 'Congestion Reduced', value: '-34%', status: 'exceeded' },
        { metric: 'Customer Complaints', value: '-56%', status: 'exceeded' },
        { metric: 'Cost Savings', value: '$142.5K', status: 'on-track' }
      ]
    },
    {
      title: 'RF Parameter Optimization',
      dateInitiated: '2024-03-01',
      expectedROI: 280000,
      actualROI: null,
      status: 'in-progress',
      timeToValue: '~28 days (est.)',
      impactMetrics: [
        { metric: 'HO Success Rate', value: '+4.2%', status: 'on-track' },
        { metric: 'Network Load', value: '-8%', status: 'on-track' },
        { metric: 'Customer CSAT', value: '+3.1pt', status: 'tracking' }
      ]
    },
    {
      title: 'Power Consumption Optimization',
      dateInitiated: '2024-01-20',
      expectedROI: 450000,
      actualROI: 485320,
      status: 'completed',
      timeToValue: '24 days',
      impactMetrics: [
        { metric: 'Power Reduction', value: '-18%', status: 'exceeded' },
        { metric: 'Carbon Footprint', value: '-18%', status: 'exceeded' },
        { metric: 'Annual Cost Savings', value: '$485.3K', status: 'exceeded' }
      ]
    }
  ];

  const roiTrend = [
    { month: 'Jan', planned: 450, actual: 485, projected: 450 },
    { month: 'Feb', planned: 600, actual: 628, projected: 700 },
    { month: 'Mar', planned: 730, actual: null, projected: 850 },
    { month: 'Apr', planned: 850, actual: null, projected: 950 },
    { month: 'May', planned: 950, actual: null, projected: 1050 }
  ];

  const impactByDecision = [
    { decision: 'Load Balancing', value: 142500 },
    { decision: 'Power Optimization', value: 485320 },
    { decision: 'RF Tuning', value: 89640 },
    { decision: 'Automation', value: 156280 }
  ];

  return (
    <div className="space-y-8">
      {/* Overall Impact Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-border/50 p-4 bg-card/50">
          <p className="text-sm text-muted-foreground mb-1">Total Decision ROI</p>
          <p className="text-3xl font-bold text-green-600">$873.7K</p>
          <p className="text-xs text-muted-foreground mt-2">YTD realized value</p>
        </div>
        <div className="rounded-xl border border-border/50 p-4 bg-card/50">
          <p className="text-sm text-muted-foreground mb-1">Decisions Implemented</p>
          <p className="text-3xl font-bold text-foreground">8</p>
          <p className="text-xs text-muted-foreground mt-2">3 completed, 2 in-progress</p>
        </div>
        <div className="rounded-xl border border-border/50 p-4 bg-card/50">
          <p className="text-sm text-muted-foreground mb-1">Success Rate</p>
          <p className="text-3xl font-bold text-blue-600">87.5%</p>
          <p className="text-xs text-muted-foreground mt-2">7 of 8 met/exceeded targets</p>
        </div>
        <div className="rounded-xl border border-border/50 p-4 bg-card/50">
          <p className="text-sm text-muted-foreground mb-1">Avg Time to Value</p>
          <p className="text-3xl font-bold text-foreground">24 days</p>
          <p className="text-xs text-muted-foreground mt-2">From decision to impact</p>
        </div>
      </div>

      {/* ROI Trend */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4">Cumulative ROI Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={roiTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" style={{ fontSize: '12px' }} />
            <YAxis stroke="hsl(var(--muted-foreground))" style={{ fontSize: '12px' }} label={{ value: '$K', angle: -90, position: 'insideLeft' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
              formatter={(value) => value ? `$${value}K` : 'N/A'}
            />
            <Line type="monotone" dataKey="planned" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Planned" />
            <Line type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={2} dot={false} name="Actual (Realized)" />
            <Line type="monotone" dataKey="projected" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Projected" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Decision Tracking */}
      <div>
        <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-purple-600" />
          Decision Impact Tracking
        </h3>

        <div className="space-y-4">
          {decisions.map((decision, idx) => (
            <div key={idx} className="rounded-xl border border-border/50 p-6 bg-card/50">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h4 className="font-bold text-foreground mb-1">{decision.title}</h4>
                  <p className="text-xs text-muted-foreground">Initiated: {decision.dateInitiated}</p>
                </div>
                <span className={`inline-block px-3 py-1 rounded text-xs font-semibold ${
                  decision.status === 'completed'
                    ? 'bg-green-500/10 text-green-700'
                    : 'bg-blue-500/10 text-blue-700'
                }`}>
                  {decision.status === 'completed' ? '✓ Completed' : '⧗ In Progress'}
                </span>
              </div>

              {/* ROI Display */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-muted/30 rounded-lg border border-border/30">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Expected ROI</p>
                  <p className="text-lg font-bold text-foreground">${(decision.expectedROI / 1000).toFixed(0)}K</p>
                </div>
                {decision.actualROI && (
                  <>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Realized ROI</p>
                      <p className="text-lg font-bold text-green-600">${(decision.actualROI / 1000).toFixed(1)}K</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Time to Value</p>
                      <p className="text-lg font-bold text-foreground">{decision.timeToValue}</p>
                    </div>
                  </>
                )}
              </div>

              {/* Impact Metrics */}
              <div className="space-y-2">
                {decision.impactMetrics.map((metric, midx) => (
                  <div key={midx} className="flex items-center justify-between p-2 bg-muted/20 rounded">
                    <p className="text-sm text-muted-foreground">{metric.metric}</p>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground">{metric.value}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        metric.status === 'exceeded' ? 'bg-green-500/10 text-green-700' :
                        metric.status === 'on-track' ? 'bg-blue-500/10 text-blue-700' :
                        'bg-yellow-500/10 text-yellow-700'
                      }`}>
                        {metric.status === 'exceeded' ? 'Exceeded' : metric.status === 'on-track' ? 'On Track' : 'Tracking'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ROI by Decision */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-green-600" />
          Realized Impact by Initiative
        </h3>

        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={impactByDecision}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="decision" stroke="hsl(var(--muted-foreground))" style={{ fontSize: '12px' }} />
            <YAxis stroke="hsl(var(--muted-foreground))" style={{ fontSize: '12px' }} label={{ value: '$K', angle: -90, position: 'insideLeft' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
              formatter={(value) => [`$${(value / 1000).toFixed(0)}K`, 'ROI']}
            />
            <Bar dataKey="value" fill="#10b981" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Strategic Recommendations */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4">Strategic Insights</h3>

        <div className="space-y-3">
          <div className="p-4 bg-green-500/5 border border-green-500/20 rounded-lg">
            <p className="text-sm font-semibold text-foreground mb-1">✓ Strong ROI Track Record</p>
            <p className="text-sm text-muted-foreground">
              87.5% of decisions achieved or exceeded targets. Power optimization delivered 8% above plan.
            </p>
          </div>

          <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg">
            <p className="text-sm font-semibold text-foreground mb-1">ℹ️ Accelerate Decision Implementation</p>
            <p className="text-sm text-muted-foreground">
              24-day average time to value enables rapid iteration. Consider 2-4 week decision cycles for maximum impact.
            </p>
          </div>

          <div className="p-4 bg-purple-500/5 border border-purple-500/20 rounded-lg">
            <p className="text-sm font-semibold text-foreground mb-1">💡 Next High-Impact Opportunities</p>
            <p className="text-sm text-muted-foreground">
              Based on patterns: Automation policies ($280K+), Dynamic spectrum allocation ($350K+), ML-driven forecasting
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
