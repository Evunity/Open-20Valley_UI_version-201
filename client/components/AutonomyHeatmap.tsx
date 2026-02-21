import React from 'react';
import { Activity, TrendingUp } from 'lucide-react';
import { generateMockHeatmapData } from '../utils/automationData';

export const AutonomyHeatmap: React.FC = () => {
  const heatmapData = generateMockHeatmapData();

  const maxCount = Math.max(...heatmapData.map(d => d.automationCount));
  const maxLastHour = Math.max(...heatmapData.map(d => d.lastHour));

  const getHeatColor = (count: number) => {
    const percentage = count / maxCount;
    if (percentage >= 0.75) return 'bg-red-500';
    if (percentage >= 0.5) return 'bg-orange-500';
    if (percentage >= 0.25) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const totalAutomations = heatmapData.reduce((sum, d) => sum + d.automationCount, 0);
  const avgSuccessRate = Math.round(
    heatmapData.reduce((sum, d) => sum + d.successRate, 0) / heatmapData.length
  );
  const totalLastHour = heatmapData.reduce((sum, d) => sum + d.lastHour, 0);

  return (
    <div className="flex flex-col h-full gap-4 p-4 bg-gray-50 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Activity className="w-5 h-5 text-blue-600" />
        <h2 className="text-lg font-bold text-gray-900">Autonomy Heatmap</h2>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <p className="text-xs text-gray-600 font-semibold">Total Automations</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{totalAutomations}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <p className="text-xs text-gray-600 font-semibold">Avg Success Rate</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{avgSuccessRate}%</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <p className="text-xs text-gray-600 font-semibold">Last Hour</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{totalLastHour}</p>
        </div>
      </div>

      {/* Heatmap */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <p className="text-xs font-semibold text-gray-700 mb-4">Geographic Distribution</p>
        <div className="space-y-3">
          {heatmapData.map((data, idx) => (
            <div key={idx}>
              {/* Region header */}
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-900">{data.region}</h3>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-gray-600">
                    <strong>{data.automationCount}</strong> automations
                  </span>
                  <span className="text-green-600 font-bold">{data.successRate}%</span>
                </div>
              </div>

              {/* Heatmap bar */}
              <div className="flex gap-1 mb-2">
                {/* Activity bar */}
                <div className="flex-1">
                  <div className="flex items-end gap-1 h-16 bg-gray-50 p-1 rounded border border-gray-200">
                    {[...Array(12)].map((_, i) => {
                      const intensity = (i + 1) * (data.automationCount / 60);
                      const percentage = intensity / 10;
                      return (
                        <div
                          key={i}
                          className={`flex-1 rounded-sm ${getHeatColor(
                            intensity * 10
                          )} opacity-${Math.round(percentage * 10) * 10 || 10}`}
                          style={{
                            height: `${Math.max(Math.min(percentage * 100, 100), 5)}%`,
                            opacity: Math.min(percentage, 1)
                          }}
                          title={`${Math.round(intensity)} executions`}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Inline stats */}
                <div className="w-20 flex flex-col gap-1">
                  <div className="text-center">
                    <p className="text-xs text-gray-600 font-semibold">Last Hour</p>
                    <p className="text-sm font-bold text-gray-900">{data.lastHour}</p>
                  </div>
                </div>
              </div>

              {/* Success rate bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition ${
                    data.successRate >= 95
                      ? 'bg-green-500'
                      : data.successRate >= 85
                      ? 'bg-amber-500'
                      : 'bg-red-500'
                  }`}
                  style={{ width: `${data.successRate}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Heat Legend */}
      <div className="bg-white rounded-lg border border-gray-200 p-3">
        <p className="text-xs font-semibold text-gray-700 mb-2">Heat Legend</p>
        <div className="flex gap-3 flex-wrap">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-green-500" />
            <span className="text-xs text-gray-700">Low Activity</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-yellow-500" />
            <span className="text-xs text-gray-700">Medium Activity</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-orange-500" />
            <span className="text-xs text-gray-700">High Activity</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-red-500" />
            <span className="text-xs text-gray-700">Peak Activity</span>
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <TrendingUp className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold text-blue-900">Geographic Insights</p>
            <ul className="text-xs text-blue-800 mt-1 space-y-1">
              <li>✓ <strong>Giza</strong> leads with {heatmapData[2].automationCount} active automations</li>
              <li>✓ <strong>Cairo</strong> maintains highest success rate at {heatmapData[0].successRate}%</li>
              <li>✓ All regions operating above 85% success threshold</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
