import React, { useState } from 'react';
import { TrendingDown, CheckCircle, AlertCircle } from 'lucide-react';

interface RecoveryCurveData {
  label: string;
  data: Array<{ time: number; value: number }>;
  before: number;
  after: number;
  normal: number;
}

export const ClosedLoopValidation: React.FC = () => {
  const [selectedMetric, setSelectedMetric] = useState(0);

  const recoveryData: RecoveryCurveData[] = [
    {
      label: 'Response Time (ms)',
      data: [
        { time: 0, value: 850 },
        { time: 5, value: 820 },
        { time: 10, value: 680 },
        { time: 15, value: 420 },
        { time: 20, value: 280 },
        { time: 25, value: 180 },
        { time: 30, value: 120 },
        { time: 35, value: 95 }
      ],
      before: 850,
      after: 95,
      normal: 85
    },
    {
      label: 'Error Rate (%)',
      data: [
        { time: 0, value: 12.5 },
        { time: 5, value: 10.2 },
        { time: 10, value: 7.8 },
        { time: 15, value: 4.5 },
        { time: 20, value: 2.1 },
        { time: 25, value: 0.8 },
        { time: 30, value: 0.3 },
        { time: 35, value: 0.1 }
      ],
      before: 12.5,
      after: 0.1,
      normal: 0.05
    },
    {
      label: 'CPU Usage (%)',
      data: [
        { time: 0, value: 95 },
        { time: 5, value: 88 },
        { time: 10, value: 72 },
        { time: 15, value: 58 },
        { time: 20, value: 45 },
        { time: 25, value: 38 },
        { time: 30, value: 32 },
        { time: 35, value: 28 }
      ],
      before: 95,
      after: 28,
      normal: 25
    }
  ];

  const currentData = recoveryData[selectedMetric];

  // Find max value for scaling
  const maxValue = Math.max(...currentData.data.map(d => d.value)) * 1.1;

  // Calculate SVG path for the line chart
  const getPath = () => {
    const width = 400;
    const height = 200;
    const padding = 20;

    const points = currentData.data.map((point, idx) => {
      const x = padding + (idx / (currentData.data.length - 1)) * (width - padding * 2);
      const y = height - padding - (point.value / maxValue) * (height - padding * 2);
      return `${x},${y}`;
    });

    return points.join(' L ');
  };

  return (
    <div className="flex flex-col h-full gap-4 p-4 bg-gray-50 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center gap-2">
        <CheckCircle className="w-5 h-5 text-green-600" />
        <h2 className="text-lg font-bold text-gray-900">Closed Loop Validation</h2>
      </div>

      {/* Automation Summary */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-600 font-semibold">Automation</p>
            <p className="text-sm font-bold text-gray-900 mt-1">Restart DU – Cluster East</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 font-semibold">Execution Status</p>
            <p className="text-sm font-bold text-green-600 mt-1">✓ Completed Successfully</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 font-semibold">Duration</p>
            <p className="text-sm font-bold text-gray-900 mt-1">45 seconds</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 font-semibold">Validation</p>
            <p className="text-sm font-bold text-green-600 mt-1">✓ Validated</p>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <p className="text-xs font-semibold text-gray-700 mb-4">Recovery Timeline</p>
        <div className="flex gap-3 text-xs">
          <div className="flex flex-col items-center flex-1">
            <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold mb-2">
              1
            </div>
            <p className="font-semibold text-gray-900">Issue Detected</p>
            <p className="text-gray-600 mt-1">14:32:15 UTC</p>
          </div>
          <div className="flex-1 flex items-center pt-6">
            <div className="w-full h-1 bg-green-300" />
          </div>
          <div className="flex flex-col items-center flex-1">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold mb-2">
              2
            </div>
            <p className="font-semibold text-gray-900">Action Taken</p>
            <p className="text-gray-600 mt-1">14:32:45 UTC</p>
          </div>
          <div className="flex-1 flex items-center pt-6">
            <div className="w-full h-1 bg-green-300" />
          </div>
          <div className="flex flex-col items-center flex-1">
            <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold mb-2">
              3
            </div>
            <p className="font-semibold text-gray-900">Normalized</p>
            <p className="text-gray-600 mt-1">14:33:20 UTC</p>
          </div>
        </div>
      </div>

      {/* Recovery Curves */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 flex-1 flex flex-col">
        <p className="text-xs font-semibold text-gray-700 mb-3">KPI Recovery Curves</p>

        {/* Metric Selector */}
        <div className="flex gap-2 mb-4">
          {recoveryData.map((metric, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedMetric(idx)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                selectedMetric === idx
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {metric.label.split(' ')[0]}
            </button>
          ))}
        </div>

        {/* Chart */}
        <div className="flex-1 flex flex-col">
          <svg viewBox="0 0 420 250" className="w-full h-full mb-4">
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => (
              <g key={`grid-${idx}`}>
                <line
                  x1="20"
                  y1={250 - ratio * 210}
                  x2="400"
                  y2={250 - ratio * 210}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                />
                <text
                  x="5"
                  y={255 - ratio * 210}
                  fontSize="10"
                  fill="#9ca3af"
                  textAnchor="end"
                >
                  {Math.round(ratio * maxValue)}
                </text>
              </g>
            ))}

            {/* Normal baseline */}
            <line
              x1="20"
              y1={250 - (currentData.normal / maxValue) * 210}
              x2="400"
              y2={250 - (currentData.normal / maxValue) * 210}
              stroke="#10b981"
              strokeWidth="2"
              strokeDasharray="5,5"
            />

            {/* Recovery curve */}
            <polyline
              points={getPath()}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Before point */}
            <circle cx="20" cy={250 - (currentData.before / maxValue) * 210} r="4" fill="#ef4444" />

            {/* After point */}
            <circle cx="400" cy={250 - (currentData.after / maxValue) * 210} r="4" fill="#10b981" />

            {/* X-axis labels */}
            {[0, 10, 20, 30].map((time, idx) => (
              <text
                key={`time-${idx}`}
                x={20 + (idx / 3) * 380}
                y="245"
                fontSize="10"
                fill="#9ca3af"
                textAnchor="middle"
              >
                {time}s
              </text>
            ))}
          </svg>

          {/* Legend */}
          <div className="flex justify-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span>Before ({currentData.before})</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span>Recovery</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-0.5 bg-green-500" />
              <span>Normal ({currentData.normal})</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span>After ({currentData.after})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
          <p className="text-xs text-green-600 font-semibold">Recovery Time</p>
          <p className="text-lg font-bold text-green-700 mt-1">35s</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
          <p className="text-xs text-blue-600 font-semibold">Improvement</p>
          <p className="text-lg font-bold text-blue-700 mt-1">
            {Math.round(((currentData.before - currentData.after) / currentData.before) * 100)}%
          </p>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-center">
          <p className="text-xs text-emerald-600 font-semibold">Status</p>
          <p className="text-lg font-bold text-emerald-700 mt-1">✓ OK</p>
        </div>
      </div>

      {/* Validation Report */}
      <div className="bg-white rounded-lg border border-gray-200 p-3">
        <p className="text-xs font-semibold text-gray-700 mb-2">Validation Report</p>
        <ul className="text-xs text-gray-700 space-y-1">
          <li className="flex items-center gap-2">
            <CheckCircle className="w-3 h-3 text-green-600 flex-shrink-0" />
            All KPIs returned to normal within expected timeframe
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="w-3 h-3 text-green-600 flex-shrink-0" />
            No rollback required
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="w-3 h-3 text-green-600 flex-shrink-0" />
            13,240 subscribers affected, all recovered
          </li>
        </ul>
      </div>
    </div>
  );
};
