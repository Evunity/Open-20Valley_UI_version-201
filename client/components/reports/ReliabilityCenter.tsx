import { Activity, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

export default function ReliabilityCenter() {
  const slaMetrics = [
    { name: 'Transport KPI', sla: '15 min', actual: '14 min', status: 'compliant' },
    { name: 'RF Parameters', sla: '5 min', actual: '4.8 min', status: 'compliant' },
    { name: 'Revenue Report', sla: '1 hour', actual: '47 min', status: 'compliant' },
    { name: 'Compliance Events', sla: 'Real-time', actual: 'Streaming', status: 'compliant' },
    { name: 'Power Metrics', sla: '30 min', actual: '35 min', status: 'warning' }
  ];

  const freshnessAlerts = [
    { dataset: 'Transport KPI', status: 'on-time', lastFresh: '2 min ago', threshold: '15 min' },
    { dataset: 'RF Parameters', status: 'on-time', lastFresh: '1 min ago', threshold: '5 min' },
    { dataset: 'Power Metrics', status: 'delayed', lastFresh: '38 min ago', threshold: '30 min' },
    { dataset: 'Alarm Summary', status: 'delayed', lastFresh: '47 min ago', threshold: '15 min' }
  ];

  const failureStats = [
    { type: 'Pipeline Failures', count: 3, rate: 0.5, trend: 'up' },
    { type: 'Data Quality Issues', count: 1, rate: 0.2, trend: 'down' },
    { type: 'Delivery Failures', count: 2, rate: 0.08, trend: 'stable' },
    { type: 'Schema Drift Events', count: 0, rate: 0, trend: 'down' }
  ];

  return (
    <div className="space-y-8">
      {/* Reliability Score */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-border/50 p-6 bg-card/50">
          <h3 className="font-bold text-foreground mb-4">Overall Reporting Reliability</h3>
          <div className="flex items-end justify-between">
            <div>
              <div className="text-5xl font-bold text-green-600 mb-2">99.2%</div>
              <p className="text-sm text-muted-foreground">Status: <span className="text-green-600 font-semibold">Excellent</span></p>
            </div>
            <div className="w-32 h-32 rounded-full flex items-center justify-center" 
              style={{
                background: `conic-gradient(
                  #22c55e 0deg 357.12deg,
                  hsl(var(--muted)) 357.12deg 360deg
                )`
              }}>
              <div className="w-28 h-28 rounded-full bg-card flex items-center justify-center">
                <span className="text-3xl font-bold text-foreground">99.2%</span>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-border/50 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">SLA Compliance</span>
              <span className="font-semibold text-green-600">98.5%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Data Freshness</span>
              <span className="font-semibold text-green-600">99.1%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Pipeline Health</span>
              <span className="font-semibold text-green-600">98.9%</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border/50 p-6 bg-card/50">
          <h3 className="font-bold text-foreground mb-4">Reliability Trend (30 Days)</h3>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-muted-foreground">Trend Direction</span>
                <span className="text-sm font-semibold text-green-600 flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  +0.5%
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '99%' }} />
              </div>
            </div>

            <div className="pt-3 border-t border-border/50 grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground mb-1">30-Day Avg</p>
                <p className="text-lg font-bold text-foreground">98.8%</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Current Week</p>
                <p className="text-lg font-bold text-foreground">99.2%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SLA Compliance */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          SLA Compliance Status
        </h3>

        <div className="space-y-2">
          {slaMetrics.map((metric, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border/30">
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">{metric.name}</p>
                <p className="text-xs text-muted-foreground">SLA: {metric.sla} | Actual: {metric.actual}</p>
              </div>
              {metric.status === 'compliant' ? (
                <span className="inline-block px-3 py-1 rounded text-xs font-semibold bg-green-500/10 text-green-700">
                  ✓ Compliant
                </span>
              ) : (
                <span className="inline-block px-3 py-1 rounded text-xs font-semibold bg-yellow-500/10 text-yellow-700">
                  ⚠ At Risk
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Data Freshness Alerts */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4">Data Freshness Index</h3>

        <div className="space-y-2">
          {freshnessAlerts.map((item, idx) => (
            <div key={idx} className={`p-3 rounded-lg border ${
              item.status === 'on-time'
                ? 'bg-green-500/5 border-green-500/20'
                : 'bg-orange-500/5 border-orange-500/20'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">{item.dataset}</p>
                  <p className="text-xs text-muted-foreground">Last fresh: {item.lastFresh} | Threshold: {item.threshold}</p>
                </div>
                {item.status === 'on-time' ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-orange-600" />
                )}
              </div>
              <div className="mt-2 w-full bg-muted rounded-full h-2">
                <div 
                  className={item.status === 'on-time' ? 'bg-green-500' : 'bg-orange-500'}
                  style={{ 
                    width: item.status === 'on-time' ? '60%' : '110%'
                  }} 
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Failure Analysis */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-600" />
          Failure Intelligence
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {failureStats.map((stat, idx) => (
            <div key={idx} className="p-4 bg-muted/30 rounded-lg border border-border/30">
              <div className="flex items-start justify-between mb-2">
                <p className="text-sm font-semibold text-foreground">{stat.type}</p>
                <span className={`text-xs font-semibold px-2 py-1 rounded ${
                  stat.trend === 'up' ? 'bg-red-500/10 text-red-700' :
                  stat.trend === 'down' ? 'bg-green-500/10 text-green-700' :
                  'bg-gray-500/10 text-gray-700'
                }`}>
                  {stat.trend === 'up' ? '↑' : stat.trend === 'down' ? '↓' : '→'} {stat.trend}
                </span>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Count (7d)</span>
                  <span className="font-bold text-foreground">{stat.count}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Failure Rate</span>
                  <span className="font-bold text-foreground">{stat.rate}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reliability Actions */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4">Recommended Actions</h3>

        <div className="space-y-3">
          <div className="p-4 bg-orange-500/5 border border-orange-500/20 rounded-lg">
            <p className="text-sm font-semibold text-foreground mb-2">⚠️ Power Metrics Dataset Lagging</p>
            <p className="text-sm text-muted-foreground mb-3">
              Power Metrics dataset is 5 minutes behind SLA (38 min vs 30 min threshold).
            </p>
            <button className="text-sm px-3 py-1 bg-orange-500/10 text-orange-700 rounded hover:bg-orange-500/20 transition-colors font-medium">
              Investigate & Fix
            </button>
          </div>

          <div className="p-4 bg-green-500/5 border border-green-500/20 rounded-lg">
            <p className="text-sm font-semibold text-foreground mb-2">✓ Reliability Trending Positive</p>
            <p className="text-sm text-muted-foreground">
              99.2% reliability maintained for 7 consecutive days. Continue monitoring.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
