import React, { useState } from 'react';
import { Shield, CheckCircle, AlertCircle, TrendingUp, TrendingDown, Clock } from 'lucide-react';

interface AIModel {
  id: string;
  name: string;
  trustScore: number;
  totalActions: number;
  successCount: number;
  failureCount: number;
  degradedKPIs: number;
  triggeredAlarms: number;
  trend: 'improving' | 'stable' | 'degrading';
  trend_value: number;
  lastUpdated: string;
}

const generateMockModels = (): AIModel[] => [
  {
    id: 'model_1',
    name: 'Network Optimization AI',
    trustScore: 92,
    totalActions: 2847,
    successCount: 2621,
    failureCount: 45,
    degradedKPIs: 2,
    triggeredAlarms: 3,
    trend: 'improving',
    trend_value: 5.2,
    lastUpdated: '2 minutes ago'
  },
  {
    id: 'model_2',
    name: 'Predictive Maintenance Engine',
    trustScore: 87,
    totalActions: 1943,
    successCount: 1689,
    failureCount: 89,
    degradedKPIs: 8,
    triggeredAlarms: 12,
    trend: 'stable',
    trend_value: 0.3,
    lastUpdated: '5 minutes ago'
  },
  {
    id: 'model_3',
    name: 'Anomaly Detection System',
    trustScore: 78,
    totalActions: 1521,
    successCount: 1187,
    failureCount: 156,
    degradedKPIs: 18,
    triggeredAlarms: 31,
    trend: 'degrading',
    trend_value: -3.7,
    lastUpdated: '1 minute ago'
  },
  {
    id: 'model_4',
    name: 'Capacity Planning AI',
    trustScore: 94,
    totalActions: 523,
    successCount: 492,
    failureCount: 12,
    degradedKPIs: 1,
    triggeredAlarms: 1,
    trend: 'improving',
    trend_value: 2.1,
    lastUpdated: '3 minutes ago'
  },
];

export const TrustScoring: React.FC = () => {
  const [models] = useState<AIModel[]>(generateMockModels());
  const [selectedModelId, setSelectedModelId] = useState(models[0].id);

  const selectedModel = models.find(m => m.id === selectedModelId);

  const getTrustColor = (score: number) => {
    if (score >= 90) return { bg: 'bg-green-100 dark:bg-green-950', border: 'border-green-300 dark:border-green-800', text: 'text-green-700 dark:text-green-300' };
    if (score >= 75) return { bg: 'bg-amber-100 dark:bg-amber-950', border: 'border-amber-300 dark:border-amber-800', text: 'text-amber-700 dark:text-amber-300' };
    return { bg: 'bg-red-100 dark:bg-red-950', border: 'border-red-300 dark:border-red-800', text: 'text-red-700 dark:text-red-300' };
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'improving') return <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />;
    if (trend === 'degrading') return <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />;
    return <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
  };

  const successRate = selectedModel ? Math.round((selectedModel.successCount / selectedModel.totalActions) * 100) : 0;
  const failureRate = selectedModel ? Math.round((selectedModel.failureCount / selectedModel.totalActions) * 100) : 0;

  return (
    <div className="w-full flex flex-col h-full gap-4 p-4 bg-background overflow-y-auto">
      {/* Model Selector */}
      <div className="bg-card rounded-lg border border-border p-3">
        <label className="text-xs font-semibold text-muted-foreground mb-2 block">Select AI Model</label>
        <select
          value={selectedModelId}
          onChange={(e) => setSelectedModelId(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          {models.map(model => (
            <option key={model.id} value={model.id}>
              {model.name} — Trust: {model.trustScore}%
            </option>
          ))}
        </select>
      </div>

      {selectedModel && (
        <>
          {/* Trust Score Card */}
          <div className={`rounded-lg border-2 p-6 text-center ${getTrustColor(selectedModel.trustScore).bg} ${getTrustColor(selectedModel.trustScore).border}`}>
            <p className="text-xs text-muted-foreground font-semibold mb-2">TRUST SCORE</p>
            <div className="flex items-center justify-center gap-3">
              <div className="text-5xl font-black text-primary">{selectedModel.trustScore}</div>
              <div>
                <p className={`text-lg font-bold ${getTrustColor(selectedModel.trustScore).text}`}>
                  {selectedModel.trustScore >= 90 ? '✓ High' : selectedModel.trustScore >= 75 ? '⚠ Medium' : '✗ Low'}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  {getTrendIcon(selectedModel.trend)}
                  <span className="text-xs font-semibold text-foreground">
                    {selectedModel.trend.charAt(0).toUpperCase() + selectedModel.trend.slice(1)} {selectedModel.trend_value > 0 ? '+' : ''}{selectedModel.trend_value}%
                  </span>
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">Last updated: {selectedModel.lastUpdated}</p>
          </div>

          {/* Trust Factors Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Success Rate */}
            <div className="bg-card rounded-lg border border-border p-3">
              <p className="text-xs text-muted-foreground font-semibold mb-2">Success Rate</p>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full transition"
                    style={{ width: `${successRate}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-foreground w-10 text-right">{successRate}%</span>
              </div>
              <p className="text-xs text-muted-foreground">{selectedModel.successCount} / {selectedModel.totalActions} actions</p>
            </div>

            {/* Failure Rate */}
            <div className="bg-card rounded-lg border border-border p-3">
              <p className="text-xs text-muted-foreground font-semibold mb-2">Failure Rate</p>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-red-500 rounded-full transition"
                    style={{ width: `${failureRate}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-foreground w-10 text-right">{failureRate}%</span>
              </div>
              <p className="text-xs text-muted-foreground">{selectedModel.failureCount} failed actions</p>
            </div>

            {/* Degraded KPIs */}
            <div className="bg-card rounded-lg border border-border p-3">
              <p className="text-xs text-muted-foreground font-semibold mb-2">Degraded KPIs</p>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{selectedModel.degradedKPIs}</p>
              <p className="text-xs text-muted-foreground mt-1">Impact factor: -2 points each</p>
            </div>

            {/* Triggered Alarms */}
            <div className="bg-card rounded-lg border border-border p-3">
              <p className="text-xs text-muted-foreground font-semibold mb-2">Triggered Alarms</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{selectedModel.triggeredAlarms}</p>
              <p className="text-xs text-muted-foreground mt-1">Impact factor: -1.5 points each</p>
            </div>
          </div>

          {/* Score Breakdown */}
          <div className="bg-card rounded-lg border border-border p-4">
            <p className="text-xs font-semibold text-foreground mb-3">Score Calculation</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Base Score (from success rate)</span>
                <span className="font-semibold text-foreground">{Math.round(successRate * 0.8)}/80</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">KPI Impact Penalty</span>
                <span className="font-semibold text-red-600 dark:text-red-400">-{selectedModel.degradedKPIs * 2}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Alarm Impact Penalty</span>
                <span className="font-semibold text-red-600 dark:text-red-400">-{Math.round(selectedModel.triggeredAlarms * 1.5)}</span>
              </div>
              <div className="border-t border-border pt-2 flex items-center justify-between">
                <span className="font-semibold text-foreground">Final Score</span>
                <span className="text-lg font-bold text-primary">{selectedModel.trustScore}/100</span>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-card rounded-lg border border-border p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              <p className="text-xs font-semibold text-foreground">Recommendations</p>
            </div>
            <ul className="space-y-2 text-xs text-muted-foreground">
              {selectedModel.degradedKPIs > 5 && (
                <li className="flex gap-2">
                  <span className="flex-shrink-0">→</span>
                  <span>Review automation rules for KPI correlation patterns</span>
                </li>
              )}
              {selectedModel.failureRate > 10 && (
                <li className="flex gap-2">
                  <span className="flex-shrink-0">→</span>
                  <span>Increase manual approval threshold for this model</span>
                </li>
              )}
              {selectedModel.trend === 'improving' && (
                <li className="flex gap-2">
                  <span className="flex-shrink-0">→</span>
                  <span>Consider increasing autonomy level (improving trend detected)</span>
                </li>
              )}
              {selectedModel.trend === 'degrading' && (
                <li className="flex gap-2">
                  <span className="flex-shrink-0">→</span>
                  <span>Investigate recent changes or retrain model with updated data</span>
                </li>
              )}
              {selectedModel.trustScore < 80 && (
                <li className="flex gap-2">
                  <span className="flex-shrink-0">→</span>
                  <span>Audit recent executions for patterns in failures</span>
                </li>
              )}
            </ul>
          </div>

          {/* Info */}
          <div className="bg-primary/10 border border-primary/30 rounded-lg p-3">
            <p className="text-xs font-semibold text-foreground mb-1">🔐 How Trust Scores Work</p>
            <p className="text-xs text-muted-foreground">
              Each AI model's trust score is calculated from: (1) Success rate, (2) Failed action count, (3) Degraded KPIs caused, (4) Alarms triggered related to execution. Scores update in real-time based on latest execution data.
            </p>
          </div>
        </>
      )}
    </div>
  );
};
