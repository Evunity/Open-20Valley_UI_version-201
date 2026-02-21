import React, { useState } from 'react';
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle, Lightbulb } from 'lucide-react';
import { generateMockLearningData, AutomationLearning } from '../utils/automationData';

interface LearningEngineProps {
  onRecommendationApply?: (automationId: string, recommendation: string) => void;
}

export const LearningEngine: React.FC<LearningEngineProps> = ({ onRecommendationApply }) => {
  const [learnings] = useState<AutomationLearning[]>(generateMockLearningData());
  const [selectedAutomation, setSelectedAutomation] = useState<string>(learnings[0].automationId);

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

  return (
    <div className="w-full flex flex-col h-full gap-4 p-4 bg-gray-50 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Lightbulb className="w-5 h-5 text-yellow-500" />
        <h2 className="text-lg font-bold text-gray-900">Learning Engine</h2>
      </div>

      {/* Automation Selector */}
      <div className="bg-white rounded-lg border border-gray-200 p-3">
        <p className="text-xs font-semibold text-gray-700 mb-2">Select Automation</p>
        <div className="space-y-2">
          {learnings.map(learning => (
            <button
              key={learning.automationId}
              onClick={() => setSelectedAutomation(learning.automationId)}
              className={`w-full text-left px-3 py-2 rounded-lg border-2 transition ${
                selectedAutomation === learning.automationId
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <p className="text-sm font-semibold text-gray-900">{learning.name}</p>
              <div className="flex items-center gap-2 mt-1">
                {getTrendIcon(learning.trend)}
                <span className={`text-xs font-semibold ${getTrendTextColor(learning.trend)}`}>
                  {learning.trend.charAt(0).toUpperCase() + learning.trend.slice(1)}{' '}
                  {learning.trendValue > 0 ? '+' : ''}{learning.trendValue}%
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Details */}
      {selectedData && (
        <>
          {/* Trend Card */}
          <div className={`rounded-lg border-2 p-4 ${getTrendColor(selectedData.trend)}`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-gray-900">{selectedData.name}</h3>
              <span className="flex items-center gap-1">
                {getTrendIcon(selectedData.trend)}
                <span className={`text-sm font-bold ${getTrendTextColor(selectedData.trend)}`}>
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
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-4 h-4 text-yellow-500" />
                <h3 className="text-sm font-bold text-gray-900">Tuning Recommendations</h3>
              </div>
              <div className="space-y-2">
                {selectedData.recommendations.map((rec, idx) => (
                  <div key={idx} className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-sm text-gray-900 font-medium">{rec}</p>
                    <button
                      onClick={() => onRecommendationApply?.(selectedData.automationId, rec)}
                      className="mt-2 px-3 py-1 text-xs font-semibold bg-yellow-600 text-white rounded hover:bg-yellow-700 transition"
                    >
                      Apply Recommendation
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Recommendations */}
          {selectedData.recommendations.length === 0 && (
            <div className="bg-green-50 rounded-lg border border-green-200 p-4">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold text-green-900">No Tuning Needed</p>
                  <p className="text-xs text-green-800 mt-1">
                    This automation is performing optimally. No immediate changes recommended.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Statistics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <p className="text-xs text-gray-600 font-semibold">Executions (Last 24h)</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {Math.floor(Math.random() * 500 + 100)}
              </p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <p className="text-xs text-gray-600 font-semibold">Avg Runtime</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {Math.floor(Math.random() * 50 + 15)}ms
              </p>
            </div>
          </div>
        </>
      )}

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-xs font-semibold text-blue-900 mb-1">💡 How This Works</p>
        <p className="text-xs text-blue-800">
          The Learning Engine monitors automation performance over time, detecting improvements and
          degradation. It recommends configuration tuning to optimize success rates and efficiency.
        </p>
      </div>
    </div>
  );
};
