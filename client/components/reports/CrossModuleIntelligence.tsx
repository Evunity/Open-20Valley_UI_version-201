import { Link2, TrendingUp, CheckCircle, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function CrossModuleIntelligence() {
  const crossModuleInsights = [
    {
      question: 'Did automation reduce outages?',
      data: {
        automationExecutions: 287,
        alarmsReduced: 3245,
        outageMinutesAvoided: 412,
        costSaved: 145000
      },
      answer: 'YES - Strong positive correlation',
      confidence: 92,
      details: 'Every 100 automation executions prevented ~1,100 alarms and 143 minutes of downtime'
    },
    {
      question: 'Which vendor drives instability?',
      data: {
        vendorFailures: { 'Huawei': 18, 'Nokia': 6, 'Ericsson': 4, 'ZTE': 2 },
        costImpact: { 'Huawei': 87000, 'Nokia': 34000, 'Ericsson': 22000, 'ZTE': 8000 },
      },
      answer: 'Huawei - 60% of failure cost',
      confidence: 88,
      details: 'Huawei 4G equipment shows 3x higher failure rate than industry benchmark. Recommend refresh'
    },
    {
      question: 'Is congestion rising YoY?',
      data: {
        congestionEvents: { 'This Year': 34, 'Last Year': 18, 'Change': '+89%' },
        duration: { 'This Year': '142 min', 'Last Year': '68 min', 'Change': '+109%' }
      },
      answer: 'YES - Significant upward trend',
      confidence: 95,
      details: 'Peak utilization rising 3.2% month-over-month. Capacity expansion needed within 60 days'
    },
    {
      question: 'Are AI decisions improving KPIs?',
      data: {
        decisions: 14,
        successRate: '92.8%',
        totalROI: 872540,
        avgTimeToValue: '24 days'
      },
      answer: 'YES - Exceptional value creation',
      confidence: 91,
      details: '$873K realized ROI from AI automation. Scale to 20+ monthly decisions for $2M+ annual impact'
    }
  ];

  const moduleConnections = [
    {
      from: 'Automation Module',
      to: 'Alarm Management',
      metric: 'Alarms Reduced',
      value: '3,245',
      trend: '↑ 23% vs last month'
    },
    {
      from: 'Command Center',
      to: 'Performance Analytics',
      metric: 'Config Changes Applied',
      value: '87',
      trend: '↑ 12% vs last month'
    },
    {
      from: 'Topology Module',
      to: 'Alarm Management',
      metric: 'Network Load',
      value: '82% peak',
      trend: '↑ 18% YoY'
    },
    {
      from: 'Automation + Topology',
      to: 'Financial Impact',
      metric: 'Estimated Cost Savings',
      value: '$1.2M',
      trend: 'Annualized'
    }
  ];

  const vendorAnalysis = [
    { vendor: 'Huawei', failures: 18, cost: 87000, reliability: 94.2 },
    { vendor: 'Nokia', failures: 6, cost: 34000, reliability: 97.1 },
    { vendor: 'Ericsson', failures: 4, cost: 22000, reliability: 98.3 },
    { vendor: 'ZTE', failures: 2, cost: 8000, reliability: 99.1 }
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-xl p-6">
        <h3 className="font-bold text-foreground mb-2 flex items-center gap-2">
          <Link2 className="w-5 h-5 text-cyan-600" />
          Cross-Module Strategic Intelligence
        </h3>
        <p className="text-sm text-muted-foreground">
          Transform raw operational data into strategic insights by connecting analytics across all modules.
        </p>
      </div>

      {/* Strategic Questions */}
      <div className="space-y-6">
        {crossModuleInsights.map((insight, idx) => (
          <div key={idx} className="rounded-xl border border-border/50 p-6 bg-card/50">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-1">
                <h4 className="text-lg font-bold text-foreground mb-2">
                  {idx + 1}. {insight.question}
                </h4>
                <p className="text-sm font-semibold text-green-600 mb-1">{insight.answer}</p>
                <p className="text-sm text-muted-foreground">{insight.details}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Confidence</p>
                  <p className="font-bold text-foreground">{insight.confidence}%</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>

            {/* Data Visualization */}
            {idx === 0 && (
              <div className="p-4 bg-muted/30 rounded-lg border border-border/30 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Executions</p>
                  <p className="text-2xl font-bold text-foreground">{insight.data.automationExecutions}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Alarms Reduced</p>
                  <p className="text-2xl font-bold text-green-600">{insight.data.alarmsReduced}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Downtime Avoided</p>
                  <p className="text-2xl font-bold text-blue-600">{insight.data.outageMinutesAvoided}m</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Cost Saved</p>
                  <p className="text-2xl font-bold text-purple-600">${(insight.data.costSaved / 1000).toFixed(0)}K</p>
                </div>
              </div>
            )}

            {idx === 2 && (
              <div className="p-4 bg-muted/30 rounded-lg border border-border/30 grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">This Year</p>
                  <p className="text-2xl font-bold text-red-600">{insight.data.congestionEvents['This Year']}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Last Year</p>
                  <p className="text-2xl font-bold text-foreground">{insight.data.congestionEvents['Last Year']}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Change YoY</p>
                  <p className="text-2xl font-bold text-red-600">{insight.data.congestionEvents['Change']}</p>
                </div>
              </div>
            )}

            {idx === 3 && (
              <div className="p-4 bg-muted/30 rounded-lg border border-border/30 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Decisions</p>
                  <p className="text-2xl font-bold text-foreground">{insight.data.decisions}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Success Rate</p>
                  <p className="text-2xl font-bold text-green-600">{insight.data.successRate}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total ROI</p>
                  <p className="text-2xl font-bold text-purple-600">${(insight.data.totalROI / 1000).toFixed(0)}K</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Avg Time-to-Value</p>
                  <p className="text-2xl font-bold text-blue-600">{insight.data.avgTimeToValue}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Module Connection Map */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
          <Link2 className="w-5 h-5" />
          Module Integration Flows
        </h3>

        <div className="space-y-3">
          {moduleConnections.map((conn, idx) => (
            <div key={idx} className="p-4 bg-muted/30 rounded-lg border border-border/30">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-mono text-muted-foreground">{conn.from}</span>
                  <span className="text-muted-foreground">→</span>
                  <span className="text-sm font-mono text-foreground">{conn.to}</span>
                </div>
                <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">{conn.metric}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-foreground">{conn.value}</span>
                <span className="text-xs text-green-600 font-semibold">{conn.trend}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Vendor Reliability Analysis */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4">Vendor Reliability Analysis</h3>

        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={vendorAnalysis}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="vendor" stroke="hsl(var(--muted-foreground))" style={{ fontSize: '12px' }} />
            <YAxis stroke="hsl(var(--muted-foreground))" style={{ fontSize: '12px' }} yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" style={{ fontSize: '12px' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
            <Bar yAxisId="left" dataKey="failures" fill="#ef4444" name="Failures" />
            <Bar yAxisId="right" dataKey="reliability" fill="#10b981" name="Reliability %" />
          </BarChart>
        </ResponsiveContainer>

        <div className="mt-6 space-y-2">
          {vendorAnalysis.map((vendor, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border/30">
              <div className="flex items-center gap-3">
                <span className="font-medium text-foreground">{vendor.vendor}</span>
                <span className="text-xs px-2 py-1 bg-muted rounded text-muted-foreground">{vendor.failures} failures</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-foreground">${(vendor.cost / 1000).toFixed(0)}K cost impact</p>
                <p className="text-xs text-muted-foreground">{vendor.reliability}% reliability</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Strategic Recommendations */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          Cross-Module Strategic Recommendations
        </h3>

        <div className="space-y-3">
          <div className="p-4 bg-green-500/5 border border-green-500/20 rounded-lg">
            <p className="text-sm font-semibold text-green-700 mb-1">✓ Accelerate Automation Initiatives</p>
            <p className="text-sm text-muted-foreground">
              Current automation delivering $145K/month in outage avoidance. Scale to 500+ annual executions for $1.7M+ annual impact.
            </p>
          </div>

          <div className="p-4 bg-orange-500/5 border border-orange-500/20 rounded-lg">
            <p className="text-sm font-semibold text-orange-700 mb-1">⚠️ Urgent: Huawei Equipment Refresh</p>
            <p className="text-sm text-muted-foreground">
              Huawei driving 60% of failure costs. Escalate refresh cycle. Current trajectory will exceed SLA thresholds within 45 days.
            </p>
          </div>

          <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-lg">
            <p className="text-sm font-semibold text-red-700 mb-1">🚨 Critical: Capacity Planning</p>
            <p className="text-sm text-muted-foreground">
              Congestion events up 89% YoY. Peak utilization rising 3.2%/month. Board approval needed within 30 days to execute expansion.
            </p>
          </div>

          <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg">
            <p className="text-sm font-semibold text-blue-700 mb-1">ℹ️ Strategic Win: AI Decision ROI</p>
            <p className="text-sm text-muted-foreground">
              14 strategic decisions delivered $873K in realized ROI with 92.8% success rate. Document for investor/board reporting.
            </p>
          </div>
        </div>
      </div>

      {/* Report Composition */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4">Create Cross-Module Report</h3>

        <p className="text-sm text-muted-foreground mb-4">
          Build a custom report that analyzes relationships between modules:
        </p>

        <div className="space-y-3">
          <label className="flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/30 rounded transition-colors border border-border/30">
            <input type="checkbox" defaultChecked />
            <span className="text-sm text-foreground">How does Automation reduce Alarms?</span>
          </label>
          <label className="flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/30 rounded transition-colors border border-border/30">
            <input type="checkbox" defaultChecked />
            <span className="text-sm text-foreground">Which vendor impacts SLA compliance?</span>
          </label>
          <label className="flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/30 rounded transition-colors border border-border/30">
            <input type="checkbox" />
            <span className="text-sm text-foreground">What's the ROI of Topology insights?</span>
          </label>
          <label className="flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/30 rounded transition-colors border border-border/30">
            <input type="checkbox" />
            <span className="text-sm text-foreground">How do Config changes impact KPIs?</span>
          </label>
        </div>

        <button className="w-full mt-4 px-6 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium">
          Generate Cross-Module Report
        </button>
      </div>
    </div>
  );
}
