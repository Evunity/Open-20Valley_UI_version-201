import React, { useState } from 'react';
import { Activity, TrendingDown, AlertCircle } from 'lucide-react';

interface SimulationData {
  affectedNodes: number;
  configChanges: string[];
  kpiProjection: { before: number; after: number; improvement: number }[];
  riskProbability: number;
}

interface PreExecutionSimulationProps {
  automationName?: string;
  scope?: string;
}

export const PreExecutionSimulation: React.FC<PreExecutionSimulationProps> = ({
  automationName = 'Cell Outage Recovery',
  scope = 'Cluster East'
}) => {
  const [activeTab, setActiveTab] = useState<'topology' | 'config' | 'kpi'>('topology');

  const simulationData: SimulationData = {
    affectedNodes: 23,
    configChanges: [
      'restart_timeout: 30s → 45s',
      'failover_threshold: 80% → 75%',
      'max_retries: 2 → 3'
    ],
    kpiProjection: [
      { before: 85, after: 98, improvement: 15 },
      { before: 45, after: 12, improvement: 73 },
      { before: 24, after: 2, improvement: 92 }
    ],
    riskProbability: 8.5
  };

  // Topology Canvas - Glow effect visualization
  const TopoologyCanvas = () => (
    <div className="relative w-full h-80 bg-gradient-to-b from-slate-900 to-slate-800 rounded-lg overflow-hidden border border-slate-700">
      {/* Grid background */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(100, 116, 139, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(100, 116, 139, 0.1) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      />

      {/* Nodes with glow */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 300">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Safe nodes */}
        <circle cx="100" cy="80" r="8" fill="#10b981" opacity="0.6" />
        <circle cx="150" cy="120" r="8" fill="#10b981" opacity="0.6" />
        <circle cx="80" cy="180" r="8" fill="#10b981" opacity="0.6" />

        {/* Affected nodes (with glow) */}
        <circle
          cx="220"
          cy="100"
          r="12"
          fill="#ef4444"
          opacity="0.8"
          filter="url(#glow)"
        />
        <circle
          cx="280"
          cy="140"
          r="12"
          fill="#ef4444"
          opacity="0.8"
          filter="url(#glow)"
        />
        <circle
          cx="250"
          cy="200"
          r="12"
          fill="#f97316"
          opacity="0.8"
          filter="url(#glow)"
        />

        {/* Connections */}
        <line x1="100" y1="80" x2="220" y2="100" stroke="#64748b" strokeWidth="1" opacity="0.5" />
        <line x1="150" y1="120" x2="280" y2="140" stroke="#64748b" strokeWidth="1" opacity="0.5" />
        <line x1="220" y1="100" x2="250" y2="200" stroke="#64748b" strokeWidth="1" opacity="0.5" />
      </svg>

      {/* Legend */}
      <div className="absolute bottom-3 right-3 text-xs space-y-1">
        <div className="flex items-center gap-2 text-emerald-400">
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
          <span>Safe</span>
        </div>
        <div className="flex items-center gap-2 text-orange-400">
          <div className="w-3 h-3 rounded-full bg-orange-500 animate-pulse" />
          <span>Will Change</span>
        </div>
        <div className="flex items-center gap-2 text-red-400">
          <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
          <span>Affected</span>
        </div>
      </div>
    </div>
  );

  // Config Diff
  const ConfigDiff = () => (
    <div className="space-y-2">
      {simulationData.configChanges.map((change, idx) => (
        <div
          key={idx}
          className="p-3 bg-gray-100 rounded-lg border-l-4 border-amber-500 font-mono text-xs"
        >
          <span className="text-red-600">-</span> {change.split('→')[0]}
          <br />
          <span className="text-green-600">+</span> {change.split('→')[1]}
        </div>
      ))}
    </div>
  );

  // KPI Projection Curves
  const KPIProjection = () => (
    <div className="space-y-4">
      {['Response Time (ms)', 'Error Rate (%)', 'CPU Usage (%)'].map((label, idx) => {
        const data = simulationData.kpiProjection[idx];
        const maxValue = 100;

        return (
          <div key={idx}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-gray-900">{label}</p>
              <span className="text-xs font-bold text-green-600">
                ↓ {data.improvement}%
              </span>
            </div>

            {/* Mini bar chart */}
            <div className="flex gap-2 items-end h-16 bg-gray-100 p-2 rounded">
              {/* Before */}
              <div className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-red-500 rounded-t-sm transition-all"
                  style={{ height: `${(data.before / maxValue) * 100}%` }}
                />
                <p className="text-xs mt-1 text-gray-600">{data.before}</p>
              </div>

              {/* Arrow */}
              <span className="text-gray-400">→</span>

              {/* After */}
              <div className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-green-500 rounded-t-sm transition-all"
                  style={{ height: `${(data.after / maxValue) * 100}%` }}
                />
                <p className="text-xs mt-1 text-gray-600">{data.after}</p>
              </div>

              {/* Probability band */}
              <div className="w-20 flex flex-col items-center">
                <div className="w-full h-12 bg-gradient-to-b from-green-200 to-green-50 rounded border border-green-300" />
                <p className="text-xs mt-1 text-green-700 font-semibold">±8%</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="flex flex-col h-full gap-4 p-4 bg-gray-50 overflow-y-auto">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{automationName}</h2>
            <p className="text-sm text-gray-600 mt-1">Scope: {scope}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-600 mb-1">Failure Probability</p>
            <p className={`text-2xl font-bold ${
              simulationData.riskProbability < 15
                ? 'text-green-600'
                : simulationData.riskProbability < 30
                ? 'text-amber-600'
                : 'text-red-600'
            }`}>
              {simulationData.riskProbability}%
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 bg-white rounded-lg border border-gray-200 p-2">
        {(
          [
            { id: 'topology', label: '🔗 Topology Impact', icon: Activity },
            { id: 'config', label: '⚙️ Config Changes', icon: Activity },
            { id: 'kpi', label: '📈 KPI Projections', icon: TrendingDown }
          ] as const
        ).map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === tab.id
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 bg-white rounded-lg border border-gray-200 p-4 overflow-y-auto">
        {activeTab === 'topology' && <TopoologyCanvas />}
        {activeTab === 'config' && <ConfigDiff />}
        {activeTab === 'kpi' && <KPIProjection />}
      </div>

      {/* Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold text-blue-900">Simulation Summary</p>
            <p className="text-xs text-blue-800 mt-1">
              {simulationData.affectedNodes} nodes will be affected. Estimated KPI improvement of{' '}
              <strong>
                {Math.round(
                  simulationData.kpiProjection.reduce((a, b) => a + b.improvement, 0) /
                    simulationData.kpiProjection.length
                )}
                %
              </strong>
              . Risk level: <strong>Low</strong> (8.5% failure probability)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
