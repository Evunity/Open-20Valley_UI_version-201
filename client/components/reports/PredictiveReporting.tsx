import { TrendingUp, AlertTriangle, Lightbulb, Calendar } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea } from 'recharts';

export default function PredictiveReporting() {
  const predictions = [
    {
      metric: 'Congestion Risk - 90 Days',
      confidence: 85,
      forecast: 'High probability (72%) of exceeding capacity threshold',
      timeline: 'Between 45-60 days',
      recommendation: 'Begin capacity expansion planning now to avoid Q2 service degradation',
      severity: 'critical',
      action_required: true
    },
    {
      metric: 'Vendor Failure Rate Trend',
      confidence: 78,
      forecast: 'Huawei equipment failure rate trending up 2.1% month-over-month',
      timeline: 'Likely to exceed warranty SLA within 45 days',
      recommendation: 'Escalate to Huawei for preventive maintenance; consider unit refresh',
      severity: 'high',
      action_required: true
    },
    {
      metric: 'Revenue Impact Forecast',
      confidence: 88,
      forecast: 'Automation decisions this quarter will deliver $1.2M+ in annualized savings',
      timeline: '87% realized by Q3, full impact by Q4',
      recommendation: 'Document ROI for board reporting; accelerate additional automation initiatives',
      severity: 'positive',
      action_required: false
    },
    {
      metric: 'Customer Satisfaction Trend',
      confidence: 81,
      forecast: 'Current optimization trajectory will improve CSAT by 2.3 points',
      timeline: 'Visible improvement within 30 days of RF parameter rollout',
      recommendation: 'Prepare customer communication plan for service improvement announcement',
      severity: 'positive',
      action_required: false
    }
  ];

  const forecastData = [
    { month: 'Current', actual: 78, forecast: 78, lower: 76, upper: 80 },
    { month: 'Jan', actual: 79, forecast: 80, lower: 77, upper: 83 },
    { month: 'Feb', actual: 81, forecast: 82, lower: 78, upper: 85 },
    { month: 'Mar', actual: 84, forecast: 85, lower: 80, upper: 89 },
    { month: 'Apr', forecast: 87, lower: 82, upper: 91 },
    { month: 'May', forecast: 89, lower: 83, upper: 94 },
    { month: 'Jun', forecast: 91, lower: 85, upper: 96 }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500/10 border-red-500/20 text-red-700';
      case 'high':
        return 'bg-orange-500/10 border-orange-500/20 text-orange-700';
      case 'positive':
        return 'bg-green-500/10 border-green-500/20 text-green-700';
      default:
        return 'bg-blue-500/10 border-blue-500/20 text-blue-700';
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-500/10 to-blue-500/10 border border-indigo-500/20 rounded-xl p-6">
        <h3 className="font-bold text-foreground mb-2 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-indigo-600" />
          Predictive Reporting & Forward-Looking Analytics
        </h3>
        <p className="text-sm text-muted-foreground">
          AI-powered forecasts predict future operational challenges 30-90 days in advance, enabling proactive decision-making.
        </p>
      </div>

      {/* Active Predictions */}
      <div>
        <h3 className="font-bold text-foreground mb-4">Active Predictions (Next 90 Days)</h3>

        <div className="space-y-4">
          {predictions.map((pred, idx) => (
            <div
              key={idx}
              className={`rounded-xl border p-6 ${getSeverityColor(pred.severity)}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-bold text-foreground">{pred.metric}</h4>
                  <p className="text-sm text-muted-foreground/80 mt-1">{pred.timeline}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Confidence</p>
                    <p className="font-bold text-foreground">{pred.confidence}%</p>
                  </div>
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" 
                    style={{
                      background: `conic-gradient(
                        currentColor 0deg ${pred.confidence * 3.6}deg,
                        hsl(var(--muted)) ${pred.confidence * 3.6}deg 360deg
                      )`
                    }}>
                    <div className="w-10 h-10 rounded-full bg-card flex items-center justify-center">
                      <span className="text-xs font-bold">{pred.confidence}%</span>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-sm mb-3 font-medium">{pred.forecast}</p>

              {pred.action_required && (
                <div className="p-3 bg-current/10 rounded-lg border border-current/20 mb-3">
                  <p className="text-sm font-semibold mb-1">📋 Recommended Action:</p>
                  <p className="text-sm">{pred.recommendation}</p>
                </div>
              )}

              {!pred.action_required && (
                <div className="p-3 bg-current/10 rounded-lg border border-current/20 mb-3">
                  <p className="text-sm font-semibold mb-1">✓ Positive Forecast:</p>
                  <p className="text-sm">{pred.recommendation}</p>
                </div>
              )}

              <button className={`text-sm px-3 py-1 rounded font-medium ${
                pred.action_required
                  ? 'bg-current/20 text-current'
                  : 'bg-current/20 text-current'
              }`}>
                {pred.action_required ? 'Create Action Item' : 'View Details'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Forecast Chart */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4">Utilization Forecast (Actual vs Projected)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={forecastData}>
            <defs>
              <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" style={{ fontSize: '12px' }} />
            <YAxis stroke="hsl(var(--muted-foreground))" style={{ fontSize: '12px' }} label={{ value: '%', angle: -90, position: 'insideLeft' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
              formatter={(value) => value ? `${value}%` : 'N/A'}
            />
            <ReferenceArea x1="Current" x2="Jun" stroke="none" fill="#3b82f6" fillOpacity={0.1} label={{ value: 'Forecast Period', position: 'top' }} />
            <Line type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={2} dot={false} name="Actual" />
            <Line type="monotone" dataKey="forecast" stroke="#3b82f6" strokeWidth={2} dot={false} strokeDasharray="5 5" name="Forecast" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Prediction Confidence */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4">Prediction Accuracy Metrics</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-muted/30 rounded-lg border border-border/30 text-center">
            <p className="text-3xl font-bold text-blue-600">94.2%</p>
            <p className="text-xs text-muted-foreground mt-2">30-Day Forecast Accuracy</p>
          </div>
          <div className="p-4 bg-muted/30 rounded-lg border border-border/30 text-center">
            <p className="text-3xl font-bold text-green-600">87.6%</p>
            <p className="text-xs text-muted-foreground mt-2">90-Day Forecast Accuracy</p>
          </div>
          <div className="p-4 bg-muted/30 rounded-lg border border-border/30 text-center">
            <p className="text-3xl font-bold text-purple-600">8.2/10</p>
            <p className="text-xs text-muted-foreground mt-2">User Confidence Score</p>
          </div>
        </div>
      </div>

      {/* Prediction Methods */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-yellow-600" />
          Prediction Methodology
        </h3>

        <div className="space-y-3">
          <div className="p-4 bg-muted/30 rounded-lg border border-border/30">
            <p className="text-sm font-semibold text-foreground mb-1">Time Series Forecasting</p>
            <p className="text-xs text-muted-foreground">Analyzes 12+ months of historical KPI trends with seasonal decomposition</p>
          </div>

          <div className="p-4 bg-muted/30 rounded-lg border border-border/30">
            <p className="text-sm font-semibold text-foreground mb-1">Anomaly Acceleration Detection</p>
            <p className="text-xs text-muted-foreground">Identifies when metric drift exceeds historical patterns and projects forward</p>
          </div>

          <div className="p-4 bg-muted/30 rounded-lg border border-border/30">
            <p className="text-sm font-semibold text-foreground mb-1">Causal Analysis</p>
            <p className="text-xs text-muted-foreground">Connects external events (automation, config changes) to predicted outcomes</p>
          </div>

          <div className="p-4 bg-muted/30 rounded-lg border border-border/30">
            <p className="text-sm font-semibold text-foreground mb-1">Uncertainty Quantification</p>
            <p className="text-xs text-muted-foreground">Provides confidence intervals, not point estimates (80% ranges vs 50% point)</p>
          </div>
        </div>
      </div>

      {/* Actionable Alerts */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-orange-600" />
          Upcoming Decisions Required
        </h3>

        <div className="space-y-3">
          <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-foreground">Decision Deadline: 30 Days</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Approve capacity expansion plan to avoid Q2 congestion. After day 30, implementation cannot complete in time.
                </p>
                <button className="mt-2 text-xs px-3 py-1 bg-red-500/20 text-red-700 rounded font-medium hover:bg-red-500/30 transition-colors">
                  View Expansion Plan
                </button>
              </div>
            </div>
          </div>

          <div className="p-4 bg-orange-500/5 border border-orange-500/20 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-foreground">Action Required: 15 Days</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Huawei maintenance window needed. Schedule before failure rate exceeds SLA thresholds.
                </p>
                <button className="mt-2 text-xs px-3 py-1 bg-orange-500/20 text-orange-700 rounded font-medium hover:bg-orange-500/30 transition-colors">
                  Schedule Maintenance
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Predictive Report Scheduling */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4">Predictive Report Automation</h3>

        <p className="text-sm text-muted-foreground mb-4">
          Automatically generate and distribute predictive reports based on upcoming forecasted events:
        </p>

        <div className="space-y-3">
          <label className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-border/30 cursor-pointer hover:bg-muted/50 transition-colors">
            <input type="checkbox" defaultChecked />
            <div>
              <p className="text-sm font-medium text-foreground">When congestion risk exceeds 70%</p>
              <p className="text-xs text-muted-foreground">→ Alert VP Operations + Capacity Planning team</p>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-border/30 cursor-pointer hover:bg-muted/50 transition-colors">
            <input type="checkbox" defaultChecked />
            <div>
              <p className="text-sm font-medium text-foreground">Weekly Predictive Briefing</p>
              <p className="text-xs text-muted-foreground">→ Every Monday 8 AM to C-Level with 7-90 day forecasts</p>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-border/30 cursor-pointer hover:bg-muted/50 transition-colors">
            <input type="checkbox" />
            <div>
              <p className="text-sm font-medium text-foreground">When ROI forecast exceeds $500K</p>
              <p className="text-xs text-muted-foreground">→ Generate board briefing and send to CFO</p>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
}
