import React, { useState } from 'react';
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle, Lightbulb } from 'lucide-react';
import { generateMockLearningData, AutomationLearning } from '../utils/automationData';

interface LearningEngineProps {
  onRecommendationApply?: (automationId: string, recommendation: string) => void;
}

export const LearningEngine: React.FC<LearningEngineProps> = ({ onRecommendationApply }) => {
  const [learnings] = useState<AutomationLearning[]>(generateMockLearningData());
  const [selectedAutomation, setSelectedAutomation] = useState<string>(learnings[0].automationId);
  const [appliedRecommendations, setAppliedRecommendations] = useState<Array<{ automationId: string; rec: string; timestamp: string }>>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [rejectedRecommendations, setRejectedRecommendations] = useState<Set<string>>(new Set());

  const selectedData = learnings.find(l => l.automationId === selectedAutomation);

  const getTrendIcon = (trend: string) => {
    if (trend === 'improving') return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (trend === 'degrading') return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <CheckCircle className="w-4 h-4 text-gray-600" />;
  };

  const getTrendColor = (trend: string) => {
    if (trend === 'improving') return 'bg-green-50 border-green-200';
    if (trend === 'degrading') return 'bg-red-50 border-red-200';
    return 'bg-gray-50 border-gray-200';
  };

  const getTrendTextColor = (trend: string) => {
    if (trend === 'improving') return 'text-green-700';
    if (trend === 'degrading') return 'text-red-700';
    return 'text-gray-700';
  };

  const handleApplyRecommendation = (automationId: string, rec: string) => {
    const newRec = { automationId, rec, timestamp: new Date().toLocaleTimeString() };
    setAppliedRecommendations([newRec, ...appliedRecommendations]);
    setRejectedRecommendations(prev => {
      const next = new Set(prev);
      next.delete(`${automationId}-${rec}`);
      return next;
    });
    onRecommendationApply?.(automationId, rec);
  };

  const handleRejectRecommendation = (automationId: string, rec: string) => {
    setRejectedRecommendations(prev => new Set(prev).add(`${automationId}-${rec}`));
  };

  return (
    <div className="w-full flex flex-col h-full gap-4 p-4 bg-background overflow-y-auto">
      {/* History Button - Top Right */}
      {appliedRecommendations.length > 0 && (
        <div className="flex justify-end">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition"
          >
            History ({appliedRecommendations.length})
          </button>
        </div>
      )}

      {/* History Panel */}
      {showHistory && appliedRecommendations.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-4 space-y-2">
          <p className="text-xs font-semibold text-foreground mb-3">Applied Recommendations</p>
          {appliedRecommendations.map((item, idx) => {
            const automation = learnings.find(l => l.automationId === item.automationId);
            return (
              <div key={idx} className="p-2 bg-green-50/50 border border-green-200/50 rounded text-xs">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-green-900">{automation?.name}</p>
                    <p className="text-green-800 mt-0.5">{item.rec}</p>
                    <p className="text-green-700 text-[11px] mt-1">Applied at {item.timestamp}</p>
                  </div>
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Automation Selector - Improved with many models */}
      <div className="bg-card rounded-lg border border-border p-3">
        <label className="text-xs font-semibold text-muted-foreground mb-2 block">Select Automation Model</label>
        <select
          value={selectedAutomation}
          onChange={(e) => setSelectedAutomation(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          {learnings.map(learning => (
            <option key={learning.automationId} value={learning.automationId}>
              {learning.name} — {learning.trend.charAt(0).toUpperCase() + learning.trend.slice(1)} {learning.trendValue > 0 ? '+' : ''}{learning.trendValue}%
            </option>
          ))}
        </select>
      </div>

      {/* Details */}
      {selectedData && (
        <>
          {/* Trend Card */}
          <div className={`rounded-lg border p-4 bg-card`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-foreground">{selectedData.name}</h3>
              <span className="flex items-center gap-1">
                {getTrendIcon(selectedData.trend)}
                <span className={`text-sm font-bold`}>
                  {selectedData.trend === 'improving'
                    ? '📈 Improving'
                    : selectedData.trend === 'degrading'
                    ? '📉 Degrading'
                    : '➡️ Stable'}
                </span>
              </span>
            </div>

            {/* Success Rate */}
            <div className="mb-3">
              <p className="text-xs text-gray-700 font-semibold mb-1">Current Success Rate</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition ${
                      selectedData.successRate >= 90
                        ? 'bg-green-500'
                        : selectedData.successRate >= 75
                        ? 'bg-amber-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${selectedData.successRate}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-gray-900 w-12 text-right">
                  {selectedData.successRate}%
                </span>
              </div>
            </div>

            {/* Trend Info */}
            <p className="text-xs text-gray-700">
              {selectedData.trend === 'improving'
                ? `✓ Performance improving by ${selectedData.trendValue}% over last 7 days`
                : selectedData.trend === 'degrading'
                ? `⚠ Performance declining by ${Math.abs(selectedData.trendValue)}% - action recommended`
                : `Performance stable with minimal change`}
            </p>
          </div>

          {/* Recommendations */}
          {selectedData.recommendations.length > 0 && (
            <div className="bg-card rounded-lg border border-border p-4">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-foreground">Tuning Recommendations</h3>
              </div>
              <div className="space-y-2">
                {selectedData.recommendations
                  .filter(rec => !rejectedRecommendations.has(`${selectedData.automationId}-${rec}`))
                  .map((rec, idx) => (
                  <div key={idx} className="p-3 bg-amber-50/50 dark:bg-amber-950/30 rounded-lg border border-amber-200/50 dark:border-amber-800/50">
                    <p className="text-sm text-foreground font-medium">{rec}</p>
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleApplyRecommendation(selectedData.automationId, rec)}
                        className="flex-1 px-3 py-1 text-xs font-semibold bg-primary text-primary-foreground rounded hover:bg-primary/90 transition"
                      >
                        Apply
                      </button>
                      <button
                        onClick={() => handleRejectRecommendation(selectedData.automationId, rec)}
                        className="flex-1 px-3 py-1 text-xs font-semibold bg-muted text-muted-foreground rounded hover:bg-muted/80 transition"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Recommendations */}
          {selectedData.recommendations.filter(rec => !rejectedRecommendations.has(`${selectedData.automationId}-${rec}`)).length === 0 && (
            <div className="bg-status-healthy/10 rounded-lg border border-status-healthy/30 p-4">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-status-healthy mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold text-foreground">No Tuning Needed</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    This automation is performing optimally. No immediate changes recommended.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Statistics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-card rounded-lg border border-border p-3">
              <p className="text-xs text-muted-foreground font-semibold">Executions (Last 24h)</p>
              <p className="text-2xl font-bold text-foreground mt-1">
                {Math.floor(Math.random() * 500 + 100)}
              </p>
            </div>
            <div className="bg-card rounded-lg border border-border p-3">
              <p className="text-xs text-muted-foreground font-semibold">Avg Runtime</p>
              <p className="text-2xl font-bold text-foreground mt-1">
                {Math.floor(Math.random() * 50 + 15)}ms
              </p>
            </div>
          </div>
        </>
      )}

      {/* Info */}
      <div className="bg-primary/10 border border-primary/30 rounded-lg p-3">
        <p className="text-xs font-semibold text-foreground mb-1">💡 How This Works</p>
        <p className="text-xs text-muted-foreground">
          The Learning Engine monitors automation performance over time, detecting improvements and
          degradation. It recommends configuration tuning to optimize success rates and efficiency.
        </p>
      </div>
    </div>
  );
};
