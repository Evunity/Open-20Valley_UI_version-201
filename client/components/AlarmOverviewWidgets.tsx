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
  // Determine fault index color with proper contrast
  const getFaultColor = (index: number) => {
    if (index >= 75) return { bg: 'bg-red-600', text: 'text-white', border: 'border-red-700' };
    if (index >= 50) return { bg: 'bg-orange-600', text: 'text-white', border: 'border-orange-700' };
    if (index >= 25) return { bg: 'bg-yellow-500', text: 'text-white', border: 'border-yellow-600' };
    return { bg: 'bg-green-600', text: 'text-white', border: 'border-green-700' };
  };

  const faultColor = getFaultColor(faultIndex);

  const getClearRateColor = (rate: number) => {
    if (rate >= 80) return { bg: 'bg-green-600', text: 'text-white', border: 'border-green-700' };
    if (rate >= 50) return { bg: 'bg-yellow-500', text: 'text-white', border: 'border-yellow-600' };
    return { bg: 'bg-red-600', text: 'text-white', border: 'border-red-700' };
  };

  const clearRateColor = getClearRateColor(clearRate);

  return (
    <div className="grid grid-cols-3 gap-3 mb-3">
      {/* Network Fault Index - Main Widget */}
      <button
        onClick={() => onWidgetClick('fault')}
        className={`${faultColor.bg} ${faultColor.text} border-2 ${faultColor.border} rounded p-2 text-center hover:shadow-lg transition cursor-pointer`}
      >
        <div className="flex items-center justify-center gap-1 mb-1">
          <AlertTriangle className="w-4 h-4" />
          <h3 className="text-xs font-bold whitespace-nowrap">Fault Index</h3>
        </div>
        <div className="text-2xl font-bold">{faultIndex}</div>
        <div className="text-xs opacity-90 mt-0.5">Risk</div>
        
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
        className="bg-blue-600 border-2 border-blue-700 text-white rounded p-2 hover:shadow-lg transition cursor-pointer"
      >
        <h3 className="text-xs font-bold mb-1 whitespace-nowrap">Impact</h3>
        <div className="space-y-1 text-left text-xs">
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span><span className="font-bold">{sitesImpacted}</span>S</span>
          </div>
          <div className="flex items-center gap-1">
            <Radio className="w-3 h-3 flex-shrink-0" />
            <span><span className="font-bold">{cellsImpacted}</span>C</span>
          </div>
          <div className="flex items-center gap-1">
            <Smartphone className="w-3 h-3 flex-shrink-0" />
            <span><span className="font-bold">{estimatedSubscribers}</span>K</span>
          </div>
        </div>
        <div className="mt-1 flex flex-wrap gap-0.5">
          {technologiesAffected.slice(0, 1).map(tech => (
            <span key={tech} className="text-xs bg-blue-300 text-blue-900 px-1.5 py-0.5 rounded">
              {tech}
            </span>
          ))}
        </div>
      </button>

      {/* Clear Rate Indicator */}
      <button
        onClick={() => onWidgetClick('clearRate')}
        className={`${clearRateColor.bg} ${clearRateColor.text} border-2 ${clearRateColor.border} rounded p-2 text-center hover:shadow-lg transition cursor-pointer`}
      >
        <h3 className="text-xs font-bold mb-1 whitespace-nowrap">Clear Rate</h3>
        <div className="text-2xl font-bold">{clearRate}%</div>

        {/* Trend indicator */}
        <div className="flex items-center justify-center gap-0.5 mt-1 text-xs">
          {clearRateTrend === 'improving' && (
            <>
              <TrendingUp className="w-3 h-3" />
              <span className="font-semibold">↑</span>
            </>
          )}
          {clearRateTrend === 'worsening' && (
            <>
              <TrendingDown className="w-3 h-3" />
              <span className="font-semibold">↓</span>
            </>
          )}
          {clearRateTrend === 'stable' && (
            <span className="font-semibold">→</span>
          )}
        </div>
      </button>
    </div>
  );
};
