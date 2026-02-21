import React from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, MapPin, Smartphone, Radio } from 'lucide-react';

interface AlarmOverviewWidgetsProps {
  faultIndex: number; // 0-100
  sitesImpacted: number;
  cellsImpacted: number;
  estimatedSubscribers: number;
  technologiesAffected: string[];
  clearRate: number; // percentage
  clearRateTrend: 'improving' | 'worsening' | 'stable';
  onWidgetClick: (widget: 'fault' | 'impact' | 'clearRate') => void;
}

export const AlarmOverviewWidgets: React.FC<AlarmOverviewWidgetsProps> = ({
  faultIndex,
  sitesImpacted,
  cellsImpacted,
  estimatedSubscribers,
  technologiesAffected,
  clearRate,
  clearRateTrend,
  onWidgetClick
}) => {
  // Determine fault index color
  const getFaultColor = (index: number) => {
    if (index >= 75) return { bg: 'bg-red-100', text: 'text-red-900', border: 'border-red-500' };
    if (index >= 50) return { bg: 'bg-orange-100', text: 'text-orange-900', border: 'border-orange-500' };
    if (index >= 25) return { bg: 'bg-yellow-100', text: 'text-yellow-900', border: 'border-yellow-500' };
    return { bg: 'bg-green-100', text: 'text-green-900', border: 'border-green-500' };
  };

  const faultColor = getFaultColor(faultIndex);

  const getClearRateColor = (rate: number) => {
    if (rate >= 80) return { bg: 'bg-green-100', text: 'text-green-900', border: 'border-green-500' };
    if (rate >= 50) return { bg: 'bg-yellow-100', text: 'text-yellow-900', border: 'border-yellow-500' };
    return { bg: 'bg-red-100', text: 'text-red-900', border: 'border-red-500' };
  };

  const clearRateColor = getClearRateColor(clearRate);

  return (
    <div className="grid grid-cols-3 gap-3 mb-3">
      {/* Network Fault Index - Main Widget */}
      <button
        onClick={() => onWidgetClick('fault')}
        className={`${faultColor.bg} ${faultColor.text} border-2 ${faultColor.border} rounded-lg p-3 text-center hover:shadow-lg transition cursor-pointer`}
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <AlertTriangle className="w-5 h-5" />
          <h3 className="text-xs font-bold">Network Fault Index</h3>
        </div>
        <div className="text-3xl font-bold">{faultIndex}</div>
        <div className="text-xs opacity-75 mt-1">Risk Level</div>
        
        {/* Visual indicator bar */}
        <div className="w-full bg-white bg-opacity-50 rounded h-2 mt-2 overflow-hidden">
          <div
            className={`h-full ${faultColor.bg} transition-all`}
            style={{ width: `${faultIndex}%` }}
          />
        </div>
      </button>

      {/* Service Impact Estimation */}
      <button
        onClick={() => onWidgetClick('impact')}
        className="bg-blue-100 border-2 border-blue-500 text-blue-900 rounded-lg p-3 hover:shadow-lg transition cursor-pointer"
      >
        <h3 className="text-xs font-bold mb-2">Service Impact</h3>
        <div className="space-y-2 text-left">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="text-xs"><span className="font-bold">{sitesImpacted}</span> Sites</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Radio className="w-3 h-3 flex-shrink-0" />
            <span className="text-xs"><span className="font-bold">{cellsImpacted}</span> Cells</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Smartphone className="w-3 h-3 flex-shrink-0" />
            <span className="text-xs"><span className="font-bold">{estimatedSubscribers}</span>K Subs</span>
          </div>
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
          {technologiesAffected.slice(0, 2).map(tech => (
            <span key={tech} className="text-xs bg-blue-200 px-2 py-1 rounded">
              {tech}
            </span>
          ))}
          {technologiesAffected.length > 2 && (
            <span className="text-xs bg-blue-200 px-2 py-1 rounded">
              +{technologiesAffected.length - 2}
            </span>
          )}
        </div>
      </button>

      {/* Clear Rate Indicator */}
      <button
        onClick={() => onWidgetClick('clearRate')}
        className={`${clearRateColor.bg} ${clearRateColor.text} border-2 ${clearRateColor.border} rounded-lg p-3 text-center hover:shadow-lg transition cursor-pointer`}
      >
        <h3 className="text-xs font-bold mb-2">Clear Rate</h3>
        <div className="text-3xl font-bold">{clearRate}%</div>
        
        {/* Trend indicator */}
        <div className="flex items-center justify-center gap-1 mt-2">
          {clearRateTrend === 'improving' && (
            <>
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-xs text-green-700 font-semibold">Improving</span>
            </>
          )}
          {clearRateTrend === 'worsening' && (
            <>
              <TrendingDown className="w-4 h-4 text-red-600" />
              <span className="text-xs text-red-700 font-semibold">Worsening</span>
            </>
          )}
          {clearRateTrend === 'stable' && (
            <>
              <div className="w-4 h-4 border-2 border-gray-600 rounded" />
              <span className="text-xs text-gray-700 font-semibold">Stable</span>
            </>
          )}
        </div>

        {/* Risk message for low clear rates */}
        {clearRate < 50 && (
          <div className="mt-2 text-xs bg-red-200 text-red-800 p-1 rounded">
            ⚠️ Low clear rate
          </div>
        )}
      </button>
    </div>
  );
};
