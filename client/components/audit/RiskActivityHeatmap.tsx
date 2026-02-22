import { AlertTriangle, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Heatmap, Cell } from 'recharts';

export default function RiskActivityHeatmap() {
  // Hourly risk score data
  const hourlyRiskData = [
    { hour: '00:00', risk: 12, events: 8, critical: 0 },
    { hour: '01:00', risk: 8, events: 5, critical: 0 },
    { hour: '02:00', risk: 15, events: 12, critical: 1 },
    { hour: '03:00', risk: 10, events: 7, critical: 0 },
    { hour: '04:00', risk: 18, events: 15, critical: 2 },
    { hour: '05:00', risk: 22, events: 20, critical: 3 },
    { hour: '06:00', risk: 35, events: 32, critical: 5 },
    { hour: '07:00', risk: 45, events: 42, critical: 8 },
    { hour: '08:00', risk: 52, events: 48, critical: 12 },
    { hour: '09:00', risk: 68, events: 65, critical: 18 },
    { hour: '10:00', risk: 72, events: 70, critical: 22 },
    { hour: '11:00', risk: 78, events: 75, critical: 28 },
    { hour: '12:00', risk: 82, events: 80, critical: 32 },
    { hour: '13:00', risk: 85, events: 85, critical: 38 },
    { hour: '14:00', risk: 92, events: 90, critical: 45 },
    { hour: '15:00', risk: 88, events: 82, critical: 40 },
    { hour: '16:00', risk: 75, events: 68, critical: 28 },
    { hour: '17:00', risk: 65, events: 55, critical: 18 },
    { hour: '18:00', risk: 48, events: 40, critical: 10 },
    { hour: '19:00', risk: 35, events: 28, critical: 5 },
    { hour: '20:00', risk: 25, events: 18, critical: 2 },
    { hour: '21:00', risk: 18, events: 12, critical: 1 },
    { hour: '22:00', risk: 14, events: 9, critical: 0 },
    { hour: '23:00', risk: 10, events: 6, critical: 0 }
  ];

  const getRiskColor = (risk: number) => {
    if (risk >= 80) return '#dc2626'; // red
    if (risk >= 60) return '#f97316'; // orange
    if (risk >= 40) return '#fbbf24'; // amber
    if (risk >= 20) return '#84cc16'; // lime
    return '#22c55e'; // green
  };

  return (
    <div className="space-y-8">
      {/* Description */}
      <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-6">
        <h3 className="font-bold text-foreground mb-2 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          Risk Activity Heatmap
        </h3>
        <p className="text-sm text-muted-foreground">
          Visualize time-based security risk spikes. Security teams instantly detect patterns and anomalies in activity timing.
        </p>
      </div>

      {/* Hourly Heatmap */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4">Hourly Risk Score (24-Hour View)</h3>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={hourlyRiskData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" style={{ fontSize: '12px' }} />
            <YAxis stroke="hsl(var(--muted-foreground))" style={{ fontSize: '12px' }} label={{ value: 'Risk Score', angle: -90, position: 'insideLeft' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
              formatter={(value) => [`${value}/100`, '']}
            />
            <Bar dataKey="risk" fill="#3b82f6" radius={[4, 4, 0, 0]}>
              {hourlyRiskData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getRiskColor(entry.risk)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        <div className="mt-4 flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ background: '#22c55e' }} />
            <span>Low (0-20)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ background: '#84cc16' }} />
            <span>Medium (20-40)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ background: '#fbbf24' }} />
            <span>High (40-60)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ background: '#f97316' }} />
            <span>Very High (60-80)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ background: '#dc2626' }} />
            <span>Critical (80+)</span>
          </div>
        </div>
      </div>

      {/* Peak Times Analysis */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Peak Activity Analysis
        </h3>

        <div className="space-y-3">
          <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-lg">
            <p className="text-sm font-bold text-red-700 mb-1">Critical Peak: 14:00 (2 PM)</p>
            <p className="text-xs text-muted-foreground">
              Risk Score: 92/100 • 90 events logged • 45 critical actions • Privilege escalation detected
            </p>
          </div>

          <div className="p-4 bg-orange-500/5 border border-orange-500/20 rounded-lg">
            <p className="text-sm font-bold text-orange-700 mb-1">High Activity: 13:00 (1 PM)</p>
            <p className="text-xs text-muted-foreground">
              Risk Score: 85/100 • 85 events logged • 38 critical actions • Configuration changes detected
            </p>
          </div>

          <div className="p4 bg-yellow-500/5 border border-yellow-500/20 rounded-lg">
            <p className="text-sm font-bold text-yellow-700 mb-1">Elevated Activity: 08:00-12:00 (Morning Peak)</p>
            <p className="text-xs text-muted-foreground">
              Sustained high-risk activity throughout morning hours. 4-hour duration suggests coordinated actions.
            </p>
          </div>
        </div>
      </div>

      {/* Pattern Detection */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4">Behavioral Patterns Detected</h3>

        <div className="space-y-2">
          <div className="p-3 bg-muted/30 rounded-lg border border-border/30 flex items-start gap-2">
            <div className="w-2 h-2 rounded-full bg-orange-600 flex-shrink-0 mt-1.5" />
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">Business Hours Spike:</span> Risk concentrates during 08:00-17:00 window, indicating operational activity
            </p>
          </div>

          <div className="p-3 bg-muted/30 rounded-lg border border-border/30 flex items-start gap-2">
            <div className="w-2 h-2 rounded-full bg-orange-600 flex-shrink-0 mt-1.5" />
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">Midday Peak:</span> 14:00 shows abnormal concentration - possible coordinated incident or major system change
            </p>
          </div>

          <div className="p-3 bg-muted/30 rounded-lg border border-border/30 flex items-start gap-2">
            <div className="w-2 h-2 rounded-full bg-green-600 flex-shrink-0 mt-1.5" />
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">Off-Hours Quiet:</span> 22:00-06:00 shows minimal activity - normal for NOC operations
            </p>
          </div>
        </div>
      </div>

      {/* Export and Alerts */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className="px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-sm font-medium">
            Export Heatmap Report
          </button>
          <button className="px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-sm font-medium">
            Configure Risk Alerts
          </button>
        </div>
      </div>
    </div>
  );
}
