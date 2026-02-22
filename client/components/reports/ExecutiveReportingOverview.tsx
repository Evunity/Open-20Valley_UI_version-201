import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CheckCircle, AlertTriangle, TrendingUp, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ExecutiveReportingOverview() {
  // Reporting Reliability Score
  const reliabilityData = {
    score: 99.2,
    status: 'Trusted',
    pipelineHealth: 98.5,
    dataFreshness: 99.1,
    failureRate: 0.9,
    schemaStability: 99.8
  };

  // SLA Reporting Coverage
  const slaData = [
    { name: 'On-Time', value: 94, color: '#22c55e' },
    { name: 'Delayed <1h', value: 4, color: '#f59e0b' },
    { name: 'Missed', value: 2, color: '#ef4444' }
  ];

  // Data Freshness Index
  const freshnessData = [
    { dataset: 'Transport KPI', status: 'on-time', time: 0, delay: 0 },
    { dataset: 'RF Parameters', status: 'on-time', time: 0, delay: 0 },
    { dataset: 'Power Metrics', status: 'on-time', time: 0, delay: 0 },
    { dataset: 'Alarm Summary', status: 'delayed', time: 47, delay: 47 },
    { dataset: 'Revenue Report', status: 'on-time', time: 0, delay: 0 },
    { dataset: 'Compliance Data', status: 'on-time', time: 0, delay: 0 }
  ];

  // Trend data
  const trendData = [
    { month: 'Jan', reliability: 98.5, coverage: 92 },
    { month: 'Feb', reliability: 98.8, coverage: 93 },
    { month: 'Mar', reliability: 99.0, coverage: 94 },
    { month: 'Apr', reliability: 99.2, coverage: 95 },
    { month: 'May', reliability: 99.2, coverage: 94 },
    { month: 'Jun', reliability: 99.2, coverage: 96 }
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl p-8">
        <h3 className="text-lg font-bold text-foreground mb-2">
          Is our operational intelligence reliable enough to run the business?
        </h3>
        <p className="text-sm text-muted-foreground">
          This control tower instantly answers whether your reporting infrastructure can support strategic decisions.
        </p>
      </div>

      {/* Executive KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Reporting Reliability Score */}
        <div className="rounded-xl border border-border/50 p-6 bg-card/50">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Reporting Reliability Score</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-foreground">{reliabilityData.score}</span>
                <span className="text-sm text-muted-foreground">%</span>
              </div>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <div className="pt-4 border-t border-border/50">
            <p className="text-xs font-semibold text-green-600">Status: {reliabilityData.status}</p>
          </div>
        </div>

        {/* Pipeline Health */}
        <div className="rounded-xl border border-border/50 p-6 bg-card/50">
          <p className="text-sm text-muted-foreground mb-1">Pipeline Health</p>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-4xl font-bold text-foreground">{reliabilityData.pipelineHealth}</span>
            <span className="text-sm text-muted-foreground">%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full" 
              style={{ width: `${reliabilityData.pipelineHealth}%` }}
            />
          </div>
        </div>

        {/* Data Freshness */}
        <div className="rounded-xl border border-border/50 p-6 bg-card/50">
          <p className="text-sm text-muted-foreground mb-1">Data Freshness Index</p>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-4xl font-bold text-foreground">{reliabilityData.dataFreshness}</span>
            <span className="text-sm text-muted-foreground">%</span>
          </div>
          <p className="text-xs text-orange-600 font-semibold">Transport KPI: 47 min delay detected</p>
        </div>

        {/* Schema Stability */}
        <div className="rounded-xl border border-border/50 p-6 bg-card/50">
          <p className="text-sm text-muted-foreground mb-1">Schema Stability</p>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-4xl font-bold text-foreground">{reliabilityData.schemaStability}</span>
            <span className="text-sm text-muted-foreground">%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-purple-500 h-2 rounded-full" 
              style={{ width: `${reliabilityData.schemaStability}%` }}
            />
          </div>
        </div>
      </div>

      {/* SLA Coverage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-border/50 p-6 bg-card/50">
          <h4 className="font-bold text-foreground mb-6">SLA Reporting Coverage</h4>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={slaData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {slaData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value}%`} />
            </PieChart>
          </ResponsiveContainer>
          <p className="text-xs text-muted-foreground mt-4">
            94% of required regulatory reports delivered on-time. Massive enterprise differentiator.
          </p>
        </div>

        {/* Reliability Trend */}
        <div className="rounded-xl border border-border/50 p-6 bg-card/50">
          <h4 className="font-bold text-foreground mb-6">6-Month Reliability Trend</h4>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" style={{ fontSize: '12px' }} />
              <YAxis stroke="hsl(var(--muted-foreground))" style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Line 
                type="monotone" 
                dataKey="reliability" 
                stroke="#3b82f6" 
                dot={false}
                strokeWidth={2}
                name="Reliability %"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Data Freshness Alerts */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h4 className="font-bold text-foreground mb-4">Freshness Status by Dataset</h4>
        <div className="space-y-3">
          {freshnessData.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-3">
                {item.status === 'on-time' ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-orange-600" />
                )}
                <span className="text-sm font-medium text-foreground">{item.dataset}</span>
              </div>
              <div className="text-right">
                {item.delay > 0 ? (
                  <span className="text-sm text-orange-600 font-semibold">{item.delay} min delay</span>
                ) : (
                  <span className="text-sm text-green-600 font-semibold">On-time</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Key Insights */}
      <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-6">
        <h4 className="font-bold text-foreground mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-600" />
          Strategic Implications
        </h4>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold mt-0.5">•</span>
            <span>Your reporting infrastructure is <strong className="text-foreground">enterprise-grade stable</strong> - safe to build strategic decisions on this foundation</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold mt-0.5">•</span>
            <span>Address Transport KPI delay (47 min) immediately - this dataset informs critical capacity planning</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold mt-0.5">•</span>
            <span>94% SLA coverage enables regulatory confidence - maintain this for compliance audits</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
