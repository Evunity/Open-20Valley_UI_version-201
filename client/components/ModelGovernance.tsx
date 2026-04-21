import React, { useState } from 'react';
import { GitBranch, RotateCcw, TrendingUp, TrendingDown, Zap, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
}

interface AIModelVersion {
  id: string;
  name: string;
  currentVersion: string;
  status: 'active' | 'staged' | 'idle' | 'deprecated';
  accuracy: number;
  uptime: number;
  executionsLastDay: number;
  successRate: number;
  lastUpdated: string;
  deployedAt: string | null;
  previousVersion: string | null;
  metrics: ModelMetrics;
  automationsCount: number;
  failureCount: number;
  trend: 'improving' | 'stable' | 'degrading';
  trendValue: number;
}

interface ModelGovernanceProps {
  onModelDeploy?: (modelId: string, version: string) => void;
  onModelRollback?: (modelId: string) => void;
}

const mockModels: AIModelVersion[] = [
  {
    id: 'model_1',
    name: 'Network Optimization AI',
    currentVersion: 'v2.4.1',
    status: 'active',
    accuracy: 94.2,
    uptime: 99.8,
    executionsLastDay: 2847,
    successRate: 92.1,
    lastUpdated: '3 days ago',
    deployedAt: '2025-02-28',
    previousVersion: 'v2.3.0',
    metrics: { accuracy: 94.2, precision: 95.1, recall: 93.2, f1Score: 94.1 },
    automationsCount: 5,
    failureCount: 45,
    trend: 'improving',
    trendValue: 2.3
  },
  {
    id: 'model_2',
    name: 'Predictive Maintenance Engine',
    currentVersion: 'v3.1.0',
    status: 'active',
    accuracy: 89.5,
    uptime: 99.2,
    executionsLastDay: 1943,
    successRate: 87.3,
    lastUpdated: '1 week ago',
    deployedAt: '2025-02-22',
    previousVersion: 'v3.0.2',
    metrics: { accuracy: 89.5, precision: 91.2, recall: 87.8, f1Score: 89.4 },
    automationsCount: 3,
    failureCount: 89,
    trend: 'stable',
    trendValue: 0.1
  },
  {
    id: 'model_3',
    name: 'Anomaly Detection System',
    currentVersion: 'v1.8.2',
    status: 'staged',
    accuracy: 91.8,
    uptime: 98.5,
    executionsLastDay: 0,
    successRate: 0,
    lastUpdated: '2 days ago',
    deployedAt: null,
    previousVersion: 'v1.7.5',
    metrics: { accuracy: 91.8, precision: 93.4, recall: 90.2, f1Score: 91.8 },
    automationsCount: 0,
    failureCount: 0,
    trend: 'improving',
    trendValue: 3.2
  },
  {
    id: 'model_4',
    name: 'Capacity Planning AI',
    currentVersion: 'v2.0.0',
    status: 'idle',
    accuracy: 93.1,
    uptime: 0,
    executionsLastDay: 0,
    successRate: 0,
    lastUpdated: '1 month ago',
    deployedAt: null,
    previousVersion: 'v1.9.8',
    metrics: { accuracy: 93.1, precision: 94.5, recall: 91.7, f1Score: 93.1 },
    automationsCount: 0,
    failureCount: 0,
    trend: 'stable',
    trendValue: 0
  },
  {
    id: 'model_5',
    name: 'Customer Churn Predictor',
    currentVersion: 'v1.5.3',
    status: 'deprecated',
    accuracy: 85.2,
    uptime: 0,
    executionsLastDay: 0,
    successRate: 0,
    lastUpdated: '3 months ago',
    deployedAt: null,
    previousVersion: null,
    metrics: { accuracy: 85.2, precision: 87.1, recall: 83.3, f1Score: 85.2 },
    automationsCount: 0,
    failureCount: 0,
    trend: 'degrading',
    trendValue: -5.2
  }
];

export const ModelGovernance: React.FC<ModelGovernanceProps> = ({
  onModelDeploy,
  onModelRollback
}) => {
  const [models, setModels] = useState<AIModelVersion[]>(mockModels);
  const [selectedModelId, setSelectedModelId] = useState<string>(models[0].id);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'staged' | 'idle' | 'deprecated'>('all');

  const filteredModels = filterStatus === 'all'
    ? models
    : models.filter(m => m.status === filterStatus);

  const selectedModel = models.find(m => m.id === selectedModelId);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700';
      case 'staged':
        return 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700';
      case 'idle':
        return 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700';
      case 'deprecated':
        return 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700';
      default:
        return 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300';
    }
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'improving') return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (trend === 'degrading') return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <TrendingUp className="w-4 h-4 text-gray-600" />;
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 93) return 'text-green-600';
    if (accuracy >= 88) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <div className="w-full flex flex-col h-full gap-4 p-4 bg-background overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground">Model Governance</h2>
        </div>
        <div className="text-xs text-muted-foreground">
          <span className="font-semibold">{models.filter(m => m.status === 'active').length}</span> Active Models
        </div>
      </div>

      {/* Status Filters */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'active', 'staged', 'idle', 'deprecated'].map(status => (
          <button
            key={status}
            onClick={() => setFilterStatus(status as any)}
            className={cn(
              'px-3 py-1 text-xs font-bold rounded-lg transition',
              filterStatus === status
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            )}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Models Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 overflow-hidden">
        {/* Models List */}
        <div className="lg:col-span-2 space-y-2 overflow-y-auto">
          {filteredModels.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <p>No models found with selected status</p>
            </div>
          ) : (
            filteredModels.map(model => (
              <button
                key={model.id}
                onClick={() => setSelectedModelId(model.id)}
                className={cn(
                  'w-full p-4 rounded-lg border-2 transition text-left hover:shadow-sm',
                  selectedModelId === model.id
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-card hover:border-border/80'
                )}
              >
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-foreground truncate">{model.name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">Version {model.currentVersion}</p>
                    </div>
                    <span
                      className={cn(
                        'px-2 py-1 text-xs font-bold rounded whitespace-nowrap flex-shrink-0',
                        getStatusColor(model.status)
                      )}
                    >
                      {model.status.toUpperCase()}
                    </span>
                  </div>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-4 gap-2 text-xs">
                    <div>
                      <p className="text-muted-foreground font-semibold">Accuracy</p>
                      <p className={cn('font-bold mt-0.5', getAccuracyColor(model.accuracy))}>
                        {model.accuracy}%
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground font-semibold">Uptime</p>
                      <p className="font-bold text-green-600 mt-0.5">{model.uptime}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground font-semibold">Executions</p>
                      <p className="font-bold text-foreground mt-0.5">{model.executionsLastDay}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground font-semibold">Trend</p>
                      <p className="font-bold text-foreground mt-0.5 flex items-center gap-1">
                        {getTrendIcon(model.trend)}
                        {model.trendValue > 0 ? '+' : ''}{model.trendValue}%
                      </p>
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Model Details */}
        {selectedModel && (
          <div className="bg-card border border-border rounded-lg p-4 flex flex-col gap-4 max-h-screen overflow-y-auto">
            <div>
              <p className="text-sm font-bold text-foreground mb-3">{selectedModel.name}</p>

              {/* Status & Version */}
              <div className="space-y-2 text-xs mb-4 pb-4 border-b border-border">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span className={cn('font-bold px-2 py-0.5 rounded', getStatusColor(selectedModel.status))}>
                    {selectedModel.status.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Current Version</span>
                  <span className="font-bold text-foreground">{selectedModel.currentVersion}</span>
                </div>
                {selectedModel.previousVersion && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Previous Version</span>
                    <span className="font-bold text-foreground">{selectedModel.previousVersion}</span>
                  </div>
                )}
              </div>

              {/* Performance Metrics */}
              <div>
                <p className="text-xs font-bold text-foreground mb-2">Performance Metrics</p>
                <div className="space-y-2 mb-4 pb-4 border-b border-border">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-muted-foreground">Accuracy</span>
                      <span className="text-xs font-bold text-foreground">{selectedModel.accuracy}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full',
                          selectedModel.accuracy >= 93 ? 'bg-green-500' : 'bg-amber-500'
                        )}
                        style={{ width: `${selectedModel.accuracy}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-muted-foreground">Precision</span>
                      <span className="text-xs font-bold text-foreground">{selectedModel.metrics.precision}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${selectedModel.metrics.precision}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-muted-foreground">Recall</span>
                      <span className="text-xs font-bold text-foreground">{selectedModel.metrics.recall}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-purple-500 rounded-full"
                        style={{ width: `${selectedModel.metrics.recall}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-muted-foreground">F1 Score</span>
                      <span className="text-xs font-bold text-foreground">{selectedModel.metrics.f1Score}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full"
                        style={{ width: `${selectedModel.metrics.f1Score}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Deployment Info */}
              <div className="text-xs space-y-2 mb-4 pb-4 border-b border-border">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Automations Using</span>
                  <span className="font-bold text-foreground">{selectedModel.automationsCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Success Rate</span>
                  <span className="font-bold text-foreground">{selectedModel.successRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Failures (24h)</span>
                  <span className="font-bold text-foreground">{selectedModel.failureCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Updated</span>
                  <span className="font-bold text-foreground">{selectedModel.lastUpdated}</span>
                </div>
              </div>

              {/* Trend */}
              <div className="bg-muted/50 rounded-lg p-2 mb-4 text-xs">
                <div className="flex items-center gap-2">
                  {getTrendIcon(selectedModel.trend)}
                  <span className="text-muted-foreground">
                    Performance is <strong>{selectedModel.trend}</strong>
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                {selectedModel.status === 'staged' && (
                  <button
                    onClick={() => onModelDeploy?.(selectedModel.id, selectedModel.currentVersion)}
                    className="w-full px-3 py-2 text-xs font-bold rounded-lg bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900 transition flex items-center justify-center gap-1"
                  >
                    <Zap className="w-3 h-3" /> Deploy to Production
                  </button>
                )}
                {selectedModel.status === 'active' && selectedModel.previousVersion && (
                  <button
                    onClick={() => onModelRollback?.(selectedModel.id)}
                    className="w-full px-3 py-2 text-xs font-bold rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900 transition flex items-center justify-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" /> Rollback to {selectedModel.previousVersion}
                  </button>
                )}
                {selectedModel.status === 'idle' && (
                  <button
                    className="w-full px-3 py-2 text-xs font-bold rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900 transition flex items-center justify-center gap-1"
                  >
                    <Settings className="w-3 h-3" /> Configure
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
