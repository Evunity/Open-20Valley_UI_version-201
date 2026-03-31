import React, { useState, useMemo } from 'react';
import { Activity, Zap, TrendingUp, AlertCircle, CheckCircle, BarChart3, Filter, Download } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import SearchableDropdown from './SearchableDropdown';

interface PortMetric {
  id: string;
  portName: string;
  status: 'active' | 'inactive' | 'error';
  utilization: number;
  bandwidth: number;
  packets: number;
  errors: number;
  dropped: number;
  health: number;
}

interface SiteMetrics {
  siteName: string;
  location: string;
  totalPorts: number;
  activePorts: number;
  avgUtilization: number;
  totalBandwidth: number;
  errorRate: number;
  health: number;
  ports: PortMetric[];
}

// Generate fake port metrics data
const generateFakePortMetrics = (): PortMetric[] => {
  const statuses: Array<'active' | 'inactive' | 'error'> = ['active', 'active', 'active', 'inactive', 'error'];
  return Array.from({ length: 48 }, (_, i) => ({
    id: `port-${i + 1}`,
    portName: `GE 0/${i + 1}`,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    utilization: Math.floor(Math.random() * 100),
    bandwidth: Math.floor(Math.random() * 10000),
    packets: Math.floor(Math.random() * 1000000),
    errors: Math.floor(Math.random() * 100),
    dropped: Math.floor(Math.random() * 50),
    health: Math.floor(Math.random() * 100) + 50,
  }));
};

// Generate fake site metrics data
const generateFakeSiteMetrics = (): SiteMetrics[] => {
  const sites = [
    { siteName: 'Dubai-Cluster-1', location: 'Dubai' },
    { siteName: 'Cairo-Cluster-1', location: 'Cairo' },
    { siteName: 'Riyadh-Cluster-2', location: 'Riyadh' },
    { siteName: 'Abu-Dhabi-Hub', location: 'Abu Dhabi' },
  ];

  return sites.map(site => {
    const ports = generateFakePortMetrics();
    const activePorts = ports.filter(p => p.status === 'active').length;
    const totalErrors = ports.reduce((sum, p) => sum + p.errors, 0);
    const totalPackets = ports.reduce((sum, p) => sum + p.packets, 0);
    const avgUtil = Math.round(ports.reduce((sum, p) => sum + p.utilization, 0) / ports.length);

    return {
      ...site,
      totalPorts: ports.length,
      activePorts,
      avgUtilization: avgUtil,
      totalBandwidth: ports.reduce((sum, p) => sum + p.bandwidth, 0),
      errorRate: ((totalErrors / totalPackets) * 100).toFixed(2),
      health: Math.floor(Math.random() * 30) + 70,
      ports,
    };
  });
};

// Time series data for charts
const generateTimeSeriesData = (timeRange: '24h' | '7d' | '30d' = '24h') => {
  let dataPoints = 24; // 24 hours
  let timeFormat = (i: number) => `${i}:00`;

  if (timeRange === '7d') {
    dataPoints = 7;
    timeFormat = (i: number) => {
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      return days[i % 7];
    };
  } else if (timeRange === '30d') {
    dataPoints = 30;
    timeFormat = (i: number) => `Day ${i + 1}`;
  }

  return Array.from({ length: dataPoints }, (_, i) => ({
    time: timeFormat(i),
    utilization: Math.floor(Math.random() * 80) + 20,
    bandwidth: Math.floor(Math.random() * 8000) + 1000,
    errors: Math.floor(Math.random() * 100),
    packets: Math.floor(Math.random() * 500000) + 100000,
  }));
};

export const PortsMetricsView: React.FC<{ topology?: any }> = () => {
  const [selectedSite, setSelectedSite] = useState<number>(0);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');
  
  const siteMetrics = useMemo(() => generateFakeSiteMetrics(), []);
  const timeSeriesData = useMemo(() => generateTimeSeriesData(timeRange), [timeRange]);
  const currentSite = siteMetrics[selectedSite];

  const portStatusBreakdown = useMemo(() => {
    if (!currentSite) return [];
    const active = currentSite.ports.filter(p => p.status === 'active').length;
    const inactive = currentSite.ports.filter(p => p.status === 'inactive').length;
    const error = currentSite.ports.filter(p => p.status === 'error').length;
    return [
      { name: 'Active', value: active, color: '#10b981' },
      { name: 'Inactive', value: inactive, color: '#6b7280' },
      { name: 'Error', value: error, color: '#ef4444' },
    ];
  }, [currentSite]);

  const topErrorPorts = useMemo(() => {
    if (!currentSite) return [];
    return [...currentSite.ports]
      .sort((a, b) => b.errors - a.errors)
      .slice(0, 5);
  }, [currentSite]);

  return (
    <div className="flex flex-col h-full bg-background overflow-auto">
      {/* Header */}
      <div className="bg-card border-b border-border p-4 sticky top-0 z-10">
        <div className="flex items-end gap-4 justify-between">
          {/* Left Controls: Site + Time Range */}
          <div className="flex items-end gap-4">
            {/* Site Selector */}
            <div className="w-48">
              <SearchableDropdown
                label="Site"
                options={siteMetrics.map((site) => site.siteName)}
                selected={selectedSite !== null ? [siteMetrics[selectedSite]?.siteName || ''] : []}
                onChange={(selected) => {
                  const idx = siteMetrics.findIndex(site => site.siteName === selected[0]);
                  if (idx !== -1) setSelectedSite(idx);
                }}
                placeholder="Search sites..."
                multiSelect={false}
                searchable={true}
                compact={true}
              />
            </div>

            {/* Time Range Selector */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Time Range</label>
              <div className="flex gap-1 p-1 bg-muted rounded-lg border border-border">
                {(['24h', '7d', '30d'] as const).map(range => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors cursor-pointer ${
                      timeRange === range
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-background text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Export Button */}
          <button className="h-9 flex items-center gap-2 px-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition text-xs font-semibold flex-shrink-0">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 space-y-6">
        {currentSite && (
          <>
            {/* Site Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-card border border-border/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-muted-foreground">Total Ports</span>
                  <Activity className="w-4 h-4 text-blue-500" />
                </div>
                <p className="text-2xl font-bold text-foreground">{currentSite.totalPorts}</p>
              </div>

              <div className="bg-card border border-border/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-muted-foreground">Active Ports</span>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </div>
                <p className="text-2xl font-bold text-foreground">{currentSite.activePorts}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {((currentSite.activePorts / currentSite.totalPorts) * 100).toFixed(1)}% utilization
                </p>
              </div>

              <div className="bg-card border border-border/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-muted-foreground">Avg Utilization</span>
                  <TrendingUp className="w-4 h-4 text-purple-500" />
                </div>
                <p className="text-2xl font-bold text-foreground">{currentSite.avgUtilization}%</p>
              </div>

              <div className="bg-card border border-border/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-muted-foreground">Total Bandwidth</span>
                  <Zap className="w-4 h-4 text-yellow-500" />
                </div>
                <p className="text-2xl font-bold text-foreground">{(currentSite.totalBandwidth / 1000).toFixed(1)}G</p>
              </div>

              <div className="bg-card border border-border/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-muted-foreground">Health Score</span>
                  <BarChart3 className="w-4 h-4 text-emerald-500" />
                </div>
                <p className="text-2xl font-bold text-foreground">{currentSite.health}%</p>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Utilization Trend */}
              <div className="bg-card border border-border/50 rounded-lg p-4">
                <h3 className="text-sm font-bold text-foreground mb-4">Utilization Trend</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="time" stroke="#999" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#999" style={{ fontSize: '12px' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} />
                    <Legend />
                    <Line type="monotone" dataKey="utilization" stroke="#3b82f6" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Port Status Breakdown */}
              <div className="bg-card border border-border/50 rounded-lg p-4">
                <h3 className="text-sm font-bold text-foreground mb-4">Port Status Distribution</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={portStatusBreakdown} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ${value}`} outerRadius={80} fill="#8884d8" dataKey="value">
                      {portStatusBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Bandwidth Usage */}
              <div className="bg-card border border-border/50 rounded-lg p-4">
                <h3 className="text-sm font-bold text-foreground mb-4">Bandwidth Usage (Mbps)</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="time" stroke="#999" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#999" style={{ fontSize: '12px' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} />
                    <Bar dataKey="bandwidth" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Error Trend */}
              <div className="bg-card border border-border/50 rounded-lg p-4">
                <h3 className="text-sm font-bold text-foreground mb-4">Error Rate Trend</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="time" stroke="#999" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#999" style={{ fontSize: '12px' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} />
                    <Line type="monotone" dataKey="errors" stroke="#ef4444" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Error Ports Table */}
            <div className="bg-card border border-border/50 rounded-lg p-4">
              <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                Top 5 Ports by Error Count
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left py-2 px-3 text-muted-foreground font-medium">Port Name</th>
                      <th className="text-left py-2 px-3 text-muted-foreground font-medium">Status</th>
                      <th className="text-right py-2 px-3 text-muted-foreground font-medium">Errors</th>
                      <th className="text-right py-2 px-3 text-muted-foreground font-medium">Utilization</th>
                      <th className="text-right py-2 px-3 text-muted-foreground font-medium">Packets</th>
                      <th className="text-right py-2 px-3 text-muted-foreground font-medium">Health</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topErrorPorts.map((port) => (
                      <tr key={port.id} className="border-b border-border/30 hover:bg-muted/30 transition">
                        <td className="py-2 px-3 font-mono text-foreground">{port.portName}</td>
                        <td className="py-2 px-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                            port.status === 'active' ? 'bg-green-500/10 text-green-600' :
                            port.status === 'inactive' ? 'bg-gray-500/10 text-gray-600' :
                            'bg-red-500/10 text-red-600'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              port.status === 'active' ? 'bg-green-500' :
                              port.status === 'inactive' ? 'bg-gray-500' :
                              'bg-red-500'
                            }`} />
                            {port.status}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right text-foreground font-mono">{port.errors}</td>
                        <td className="py-2 px-3 text-right text-foreground font-mono">{port.utilization}%</td>
                        <td className="py-2 px-3 text-right text-foreground font-mono">{(port.packets / 1000000).toFixed(1)}M</td>
                        <td className="py-2 px-3 text-right text-foreground font-mono">{port.health}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* All Ports Table */}
            <div className="bg-card border border-border/50 rounded-lg p-4">
              <h3 className="text-sm font-bold text-foreground mb-4">All Ports ({currentSite.totalPorts})</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left py-2 px-3 text-muted-foreground font-medium">Port</th>
                      <th className="text-left py-2 px-3 text-muted-foreground font-medium">Status</th>
                      <th className="text-right py-2 px-3 text-muted-foreground font-medium">Utilization</th>
                      <th className="text-right py-2 px-3 text-muted-foreground font-medium">Bandwidth (Mbps)</th>
                      <th className="text-right py-2 px-3 text-muted-foreground font-medium">Errors</th>
                      <th className="text-right py-2 px-3 text-muted-foreground font-medium">Dropped</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentSite.ports.map((port) => (
                      <tr key={port.id} className="border-b border-border/30 hover:bg-muted/30 transition">
                        <td className="py-2 px-3 font-mono text-foreground">{port.portName}</td>
                        <td className="py-2 px-3">
                          <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                            port.status === 'active' ? 'bg-green-500/10 text-green-600' :
                            port.status === 'inactive' ? 'bg-gray-500/10 text-gray-600' :
                            'bg-red-500/10 text-red-600'
                          }`}>
                            {port.status}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right font-mono">{port.utilization}%</td>
                        <td className="py-2 px-3 text-right font-mono">{port.bandwidth}</td>
                        <td className="py-2 px-3 text-right font-mono">{port.errors}</td>
                        <td className="py-2 px-3 text-right font-mono">{port.dropped}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PortsMetricsView;
