import React, { useState } from 'react';
import { Activity, TrendingUp, AlertCircle, CheckCircle, Calendar, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RegionData {
  region: string;
  automationCount: number;
  successRate: number;
  failureRate: number;
  avgResponseTime: number;
  lastHourExecutions: number;
  trend: 'improving' | 'stable' | 'degrading';
  trendValue: number;
  alert: boolean;
}

interface HourlyData {
  hour: string;
  executions: number;
  successes: number;
  failures: number;
}

const mockRegions: RegionData[] = [
  {
    region: 'Cairo',
    automationCount: 148,
    successRate: 97.2,
    failureRate: 2.8,
    avgResponseTime: 245,
    lastHourExecutions: 234,
    trend: 'improving',
    trendValue: 2.1,
    alert: false
  },
  {
    region: 'Giza',
    automationCount: 156,
    successRate: 96.8,
    failureRate: 3.2,
    avgResponseTime: 268,
    lastHourExecutions: 198,
    trend: 'stable',
    trendValue: 0.2,
    alert: false
  },
  {
    region: 'Alexandria',
    automationCount: 124,
    successRate: 95.1,
    failureRate: 4.9,
    avgResponseTime: 312,
    lastHourExecutions: 156,
    trend: 'degrading',
    trendValue: -1.5,
    alert: true
  },
  {
    region: 'Suez',
    automationCount: 98,
    successRate: 94.5,
    failureRate: 5.5,
    avgResponseTime: 289,
    lastHourExecutions: 87,
    trend: 'stable',
    trendValue: -0.1,
    alert: false
  },
  {
    region: 'Mansoura',
    automationCount: 87,
    successRate: 96.3,
    failureRate: 3.7,
    avgResponseTime: 256,
    lastHourExecutions: 142,
    trend: 'improving',
    trendValue: 1.8,
    alert: false
  }
];

const mockHourlyData: HourlyData[] = [
  { hour: '00:00', executions: 145, successes: 141, failures: 4 },
  { hour: '01:00', executions: 98, successes: 95, failures: 3 },
  { hour: '02:00', executions: 67, successes: 65, failures: 2 },
  { hour: '03:00', executions: 45, successes: 44, failures: 1 },
  { hour: '04:00', executions: 38, successes: 37, failures: 1 },
  { hour: '05:00', executions: 52, successes: 51, failures: 1 },
  { hour: '06:00', executions: 156, successes: 152, failures: 4 },
  { hour: '07:00', executions: 234, successes: 228, failures: 6 },
  { hour: '08:00', executions: 312, successes: 304, failures: 8 },
  { hour: '09:00', executions: 287, successes: 279, failures: 8 },
  { hour: '10:00', executions: 245, successes: 238, failures: 7 },
  { hour: '11:00', executions: 218, successes: 212, failures: 6 },
  { hour: '12:00', executions: 195, successes: 190, failures: 5 },
  { hour: '13:00', executions: 187, successes: 182, failures: 5 },
  { hour: '14:00', executions: 201, successes: 195, failures: 6 },
  { hour: '15:00', executions: 223, successes: 217, failures: 6 },
  { hour: '16:00', executions: 256, successes: 249, failures: 7 },
  { hour: '17:00', executions: 289, successes: 281, failures: 8 },
  { hour: '18:00', executions: 267, successes: 259, failures: 8 },
  { hour: '19:00', executions: 234, successes: 227, failures: 7 },
  { hour: '20:00', executions: 198, successes: 192, failures: 6 },
  { hour: '21:00', executions: 156, successes: 151, failures: 5 },
  { hour: '22:00', executions: 123, successes: 119, failures: 4 },
  { hour: '23:00', executions: 87, successes: 85, failures: 2 }
];

export const AutonomyHeatmap: React.FC = () => {
  const [selectedRegion, setSelectedRegion] = useState<string>(mockRegions[0].region);
  const [viewMode, setViewMode] = useState<'regions' | 'timeline'>('regions');

  const totalAutomations = mockRegions.reduce((sum, r) => sum + r.automationCount, 0);
  const avgSuccessRate = Math.round(
    mockRegions.reduce((sum, r) => sum + r.successRate, 0) / mockRegions.length
  );
  const totalExecutions = mockHourlyData.reduce((sum, h) => sum + h.executions, 0);
  const totalFailures = mockHourlyData.reduce((sum, h) => sum + h.failures, 0);

  const getSuccessColor = (rate: number) => {
    if (rate >= 96) return 'bg-green-100 dark:bg-green-950 border-green-300 dark:border-green-700';
    if (rate >= 94) return 'bg-amber-100 dark:bg-amber-950 border-amber-300 dark:border-amber-700';
    return 'bg-red-100 dark:bg-red-950 border-red-300 dark:border-red-700';
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'improving') return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (trend === 'degrading') return <TrendingUp className="w-4 h-4 text-red-600 rotate-180" />;
    return <TrendingUp className="w-4 h-4 text-gray-600 rotate-90" />;
  };

  const maxExecutions = Math.max(...mockHourlyData.map(h => h.executions));

  return (
    <div className="w-full flex flex-col h-full gap-4 p-4 bg-background overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground">Autonomy Heatmap</h2>
        </div>
        <div className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">{avgSuccessRate}%</span> avg success rate
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-card border border-border rounded-lg p-3">
          <p className="text-xs text-muted-foreground font-semibold">Total Automations</p>
          <p className="text-2xl font-bold text-foreground mt-1">{totalAutomations}</p>
          <p className="text-xs text-muted-foreground mt-1">{mockRegions.length} regions</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-3">
          <p className="text-xs text-muted-foreground font-semibold">Executions (24h)</p>
          <p className="text-2xl font-bold text-foreground mt-1">{totalExecutions.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-1">in last 24 hours</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-3">
          <p className="text-xs text-muted-foreground font-semibold">Success Rate</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{avgSuccessRate}%</p>
          <p className="text-xs text-muted-foreground mt-1">across all regions</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-3">
          <p className="text-xs text-muted-foreground font-semibold">Failures (24h)</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{totalFailures}</p>
          <p className="text-xs text-muted-foreground mt-1">{((totalFailures / totalExecutions) * 100).toFixed(2)}% failure rate</p>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="flex gap-2 border-b border-border pb-2">
        <button
          onClick={() => setViewMode('regions')}
          className={cn(
            'px-4 py-2 text-sm font-semibold rounded-lg transition',
            viewMode === 'regions'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          )}
        >
          Geographic View
        </button>
        <button
          onClick={() => setViewMode('timeline')}
          className={cn(
            'px-4 py-2 text-sm font-semibold rounded-lg transition',
            viewMode === 'timeline'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          )}
        >
          Timeline View
        </button>
      </div>

      {/* Geographic View */}
      {viewMode === 'regions' && (
        <div className="space-y-2 flex-1 overflow-y-auto">
          {mockRegions.map((region) => (
            <div
              key={region.region}
              onClick={() => setSelectedRegion(region.region)}
              className={cn(
                'p-4 rounded-lg border-2 transition cursor-pointer',
                selectedRegion === region.region
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-card hover:border-border/80'
              )}
            >
              {/* Region Header */}
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-bold text-foreground">{region.region}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{region.automationCount} automations</p>
                </div>
                <div className="flex items-center gap-2">
                  {region.alert && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 rounded text-xs font-bold">
                      <AlertCircle className="w-3 h-3" /> Alert
                    </div>
                  )}
                  <div className={cn('text-sm font-bold px-3 py-1 rounded', region.successRate >= 96 ? 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300' : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300')}>
                    {region.successRate}%
                  </div>
                </div>
              </div>

              {/* Performance Bar */}
              <div className="mb-3">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs font-semibold text-muted-foreground">Performance</span>
                  <span className="text-xs text-muted-foreground">{region.failureRate}% failures</span>
                </div>
                <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition',
                      region.successRate >= 96
                        ? 'bg-green-500'
                        : region.successRate >= 94
                        ? 'bg-amber-500'
                        : 'bg-red-500'
                    )}
                    style={{ width: `${region.successRate}%` }}
                  />
                </div>
              </div>

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-muted/50 rounded-lg p-2 text-center">
                  <p className="text-[11px] text-muted-foreground font-semibold">Last Hour</p>
                  <p className="text-sm font-bold text-foreground mt-1">{region.lastHourExecutions}</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-2 text-center">
                  <p className="text-[11px] text-muted-foreground font-semibold">Response</p>
                  <p className="text-sm font-bold text-foreground mt-1">{region.avgResponseTime}ms</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-2 text-center">
                  <p className="text-[11px] text-muted-foreground font-semibold">Trend</p>
                  <p className="text-sm font-bold text-foreground mt-1 flex items-center justify-center gap-1">
                    {getTrendIcon(region.trend)}
                    {region.trendValue > 0 ? '+' : ''}{region.trendValue}%
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Timeline View */}
      {viewMode === 'timeline' && (
        <div className="flex-1 overflow-y-auto space-y-4">
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-sm font-bold text-foreground mb-4">24-Hour Execution Timeline</p>

            {/* Chart Container */}
            <div className="space-y-2">
              {mockHourlyData.map((data, idx) => {
                const executionHeight = (data.executions / maxExecutions) * 100;
                const successRate = Math.round((data.successes / data.executions) * 100);

                return (
                  <div key={idx} className="flex items-end gap-3">
                    {/* Time Label */}
                    <div className="w-12 text-xs font-semibold text-muted-foreground text-right">
                      {data.hour}
                    </div>

                    {/* Bar */}
                    <div className="flex-1 space-y-1">
                      <div className="h-12 bg-muted/50 rounded relative overflow-hidden flex items-end">
                        {/* Success portion */}
                        <div
                          className="bg-green-500 rounded-b"
                          style={{
                            height: `${(data.successes / maxExecutions) * 100}%`,
                            width: '100%'
                          }}
                        />
                        {/* Failure portion */}
                        <div
                          className="absolute bottom-0 bg-red-500 rounded-b"
                          style={{
                            height: `${(data.failures / maxExecutions) * 100}%`,
                            width: '100%'
                          }}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground flex justify-between px-1">
                        <span>{data.executions}</span>
                        <span className="font-bold text-green-600">{successRate}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-4 pt-4 border-t border-border flex gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-green-500" />
                <span className="text-muted-foreground">Successful Executions</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-red-500" />
                <span className="text-muted-foreground">Failed Executions</span>
              </div>
            </div>
          </div>

          {/* Timeline Insights */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-card border border-border rounded-lg p-3">
              <p className="text-xs font-bold text-foreground mb-2">Peak Activity</p>
              <p className="text-lg font-bold text-primary">08:00 - 09:00</p>
              <p className="text-xs text-muted-foreground mt-1">312 executions, 97% success</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-3">
              <p className="text-xs font-bold text-foreground mb-2">Low Activity</p>
              <p className="text-lg font-bold text-amber-600">03:00 - 04:00</p>
              <p className="text-xs text-muted-foreground mt-1">45 executions, 98% success</p>
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-primary/10 border border-primary/30 rounded-lg p-3 mt-auto">
        <p className="text-xs font-semibold text-foreground mb-1">📊 How to Use This View</p>
        <p className="text-xs text-muted-foreground">
          <strong>Geographic View:</strong> See success rates and activity by region, identify problem areas.
          <br />
          <strong>Timeline View:</strong> Identify peak activity times and performance patterns throughout the day.
        </p>
      </div>
    </div>
  );
};
