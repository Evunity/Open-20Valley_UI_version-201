import { TrendingUp, Users, Download, Eye } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ConsumptionIntelligence() {
  const usageData = [
    { month: 'Jan', downloads: 420, views: 1200, users: 45 },
    { month: 'Feb', downloads: 480, views: 1400, users: 52 },
    { month: 'Mar', downloads: 520, views: 1600, users: 58 },
    { month: 'Apr', downloads: 610, views: 1800, users: 65 },
    { month: 'May', downloads: 680, views: 2000, users: 72 },
    { month: 'Jun', downloads: 750, views: 2200, users: 80 }
  ];

  const topReports = [
    { name: 'Transport KPI', downloads: 245, views: 890, adoption: 92 },
    { name: 'Executive Dashboard', downloads: 180, views: 720, adoption: 88 },
    { name: 'RF Analysis', downloads: 145, views: 540, adoption: 76 },
    { name: 'Revenue Report', downloads: 95, views: 320, adoption: 64 },
    { name: 'Automation ROI', downloads: 85, views: 240, adoption: 58 }
  ];

  const userSegments = [
    { role: 'Operations Manager', adoption: 94, engagement: 'High', frequency: '2-3 daily' },
    { role: 'RF Engineer', adoption: 82, engagement: 'High', frequency: 'Daily' },
    { role: 'Finance Manager', adoption: 71, engagement: 'Medium', frequency: '2-3 weekly' },
    { role: 'Executive', adoption: 65, engagement: 'Medium', frequency: 'Weekly' },
    { role: 'BI Analyst', adoption: 100, engagement: 'Very High', frequency: 'Continuous' }
  ];

  return (
    <div className="space-y-8">
      {/* Consumption Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-border/50 p-4 bg-card/50">
          <p className="text-sm text-muted-foreground mb-1">Total Reports Downloaded</p>
          <p className="text-3xl font-bold text-foreground">3.5K</p>
          <p className="text-xs text-green-600 font-semibold mt-2">↑ 12% vs last month</p>
        </div>
        <div className="rounded-xl border border-border/50 p-4 bg-card/50">
          <p className="text-sm text-muted-foreground mb-1">Unique Viewers</p>
          <p className="text-3xl font-bold text-foreground">1.2K</p>
          <p className="text-xs text-green-600 font-semibold mt-2">↑ 8% vs last month</p>
        </div>
        <div className="rounded-xl border border-border/50 p-4 bg-card/50">
          <p className="text-sm text-muted-foreground mb-1">Active Users</p>
          <p className="text-3xl font-bold text-foreground">80</p>
          <p className="text-xs text-muted-foreground mt-2">Out of 120 licensed</p>
        </div>
        <div className="rounded-xl border border-border/50 p-4 bg-card/50">
          <p className="text-sm text-muted-foreground mb-1">Overall Adoption</p>
          <p className="text-3xl font-bold text-foreground">78%</p>
          <p className="text-xs text-blue-600 font-semibold mt-2">↑ Strong growth trend</p>
        </div>
      </div>

      {/* Usage Trends */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4">6-Month Usage Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={usageData}>
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
            <Line type="monotone" dataKey="downloads" stroke="#3b82f6" strokeWidth={2} dot={false} name="Downloads" />
            <Line type="monotone" dataKey="views" stroke="#8b5cf6" strokeWidth={2} dot={false} name="Views" />
            <Line type="monotone" dataKey="users" stroke="#10b981" strokeWidth={2} dot={false} name="Active Users" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Top Reports by Engagement */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-purple-600" />
          Top Reports by Engagement
        </h3>

        <div className="space-y-3">
          {topReports.map((report, idx) => (
            <div key={idx} className="p-4 bg-muted/30 rounded-lg border border-border/30">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-semibold text-foreground">{report.name}</p>
                  <p className="text-xs text-muted-foreground">
                    <Download className="w-3 h-3 inline mr-1" />
                    {report.downloads} downloads •
                    <Eye className="w-3 h-3 inline mx-1" />
                    {report.views} views
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-foreground">{report.adoption}%</p>
                  <p className="text-xs text-muted-foreground">adoption</p>
                </div>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full" 
                  style={{ width: `${report.adoption}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* User Segmentation */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          User Adoption by Role
        </h3>

        <div className="space-y-3">
          {userSegments.map((segment, idx) => (
            <div key={idx} className="p-4 bg-muted/30 rounded-lg border border-border/30">
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-foreground">{segment.role}</p>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-foreground">{segment.adoption}%</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    segment.engagement === 'Very High' ? 'bg-green-500/10 text-green-700' :
                    segment.engagement === 'High' ? 'bg-blue-500/10 text-blue-700' :
                    'bg-yellow-500/10 text-yellow-700'
                  }`}>
                    {segment.engagement}
                  </span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-2">Usage: {segment.frequency}</p>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className={segment.engagement === 'Very High' ? 'bg-green-500' : segment.engagement === 'High' ? 'bg-blue-500' : 'bg-yellow-500'}
                  style={{ width: `${segment.adoption}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Adoption Insights */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4">Adoption Insights & Recommendations</h3>

        <div className="space-y-3">
          <div className="p-4 bg-green-500/5 border border-green-500/20 rounded-lg">
            <p className="text-sm font-semibold text-foreground mb-1">✓ Strong Adoption Trend</p>
            <p className="text-sm text-muted-foreground">
              Overall adoption grew 12% month-over-month. Operations managers showing highest engagement (94% adoption).
            </p>
          </div>

          <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg">
            <p className="text-sm font-semibold text-foreground mb-1">ℹ️ Executive Adoption Opportunity</p>
            <p className="text-sm text-muted-foreground">
              Executive-level adoption at 65%. Consider tailored dashboards for C-level insights to increase engagement.
            </p>
          </div>

          <div className="p-4 bg-purple-500/5 border border-purple-500/20 rounded-lg">
            <p className="text-sm font-semibold text-foreground mb-1">💡 BI Team Dependency</p>
            <p className="text-sm text-muted-foreground">
              BI team shows 100% adoption with continuous usage. Consider leveraging them as champions for broader adoption.
            </p>
          </div>
        </div>
      </div>

      {/* Feature Usage */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4">Feature Usage Analysis</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { feature: 'Dashboard Embedding', usage: 78, trend: 'up' },
            { feature: 'Email Download', usage: 65, trend: 'up' },
            { feature: 'API Integration', usage: 42, trend: 'up' },
            { feature: 'Scheduled Delivery', usage: 58, trend: 'stable' },
            { feature: 'Custom Filters', usage: 71, trend: 'up' },
            { feature: 'Export to Excel', usage: 52, trend: 'down' }
          ].map((feat, idx) => (
            <div key={idx} className="p-3 bg-muted/30 rounded-lg border border-border/30">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-foreground">{feat.feature}</p>
                <span className={`text-xs font-semibold ${feat.trend === 'up' ? 'text-green-600' : feat.trend === 'down' ? 'text-red-600' : 'text-gray-600'}`}>
                  {feat.trend === 'up' ? '↑' : feat.trend === 'down' ? '↓' : '→'}
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full" 
                  style={{ width: `${feat.usage}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">{feat.usage}% of users</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
