import React, { useState } from 'react';
import { ArrowRight, Download } from 'lucide-react';

interface DiffViewProps {
  selectedTarget: any;
  onTargetChange: (target: any) => void;
}

interface ConfigDiff {
  parameter: string;
  left: {
    label: string;
    value: string;
  };
  right: {
    label: string;
    value: string;
  };
  status: 'identical' | 'different' | 'missing_left' | 'missing_right';
}

const MOCK_DIFFS: ConfigDiff[] = [
  {
    parameter: 'TX Power',
    left: { label: 'Cairo-Site-1', value: '43 dBm' },
    right: { label: 'Cairo-Site-2', value: '40 dBm' },
    status: 'different'
  },
  {
    parameter: 'DL Bandwidth',
    left: { label: 'Cairo-Site-1', value: '20 MHz' },
    right: { label: 'Cairo-Site-2', value: '20 MHz' },
    status: 'identical'
  },
  {
    parameter: 'Cell Barring',
    left: { label: 'Cairo-Site-1', value: 'False' },
    right: { label: 'Cairo-Site-2', value: 'False' },
    status: 'identical'
  },
  {
    parameter: 'IP Address',
    left: { label: 'Cairo-Site-1', value: '192.168.1.100' },
    right: { label: 'Cairo-Site-2', value: '192.168.1.101' },
    status: 'different'
  },
  {
    parameter: 'VLAN ID',
    left: { label: 'Cairo-Site-1', value: '100' },
    right: { label: 'Cairo-Site-2', value: 'Not configured' },
    status: 'missing_right'
  }
];

export const DiffView: React.FC<DiffViewProps> = () => {
  const [diffs] = useState<ConfigDiff[]>(MOCK_DIFFS);
  const [compareMode, setCompareMode] = useState<'sites' | 'before_after' | 'vs_baseline'>('sites');
  const [leftObject, setLeftObject] = useState('Cairo-Site-1');
  const [rightObject, setRightObject] = useState('Cairo-Site-2');

  const differentCount = diffs.filter(d => d.status === 'different').length;
  const identicalCount = diffs.filter(d => d.status === 'identical').length;

  const getStatusColor = (status: string) => {
    const colors = {
      'identical': 'bg-green-50 border-green-200',
      'different': 'bg-red-50 border-red-200',
      'missing_left': 'bg-yellow-50 border-yellow-200',
      'missing_right': 'bg-yellow-50 border-yellow-200'
    };
    return colors[status as keyof typeof colors] || colors.identical;
  };

  return (
    <div className="flex flex-col h-full gap-4 p-4">
      {/* Comparison Mode */}
      <div className="grid grid-cols-3 gap-2">
        {['sites', 'before_after', 'vs_baseline'].map(mode => (
          <button
            key={mode}
            onClick={() => setCompareMode(mode as any)}
            className={`px-3 py-2 rounded-lg text-sm font-semibold transition border-2 ${
              compareMode === mode
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            {mode === 'sites' && 'Site A vs B'}
            {mode === 'before_after' && 'Before vs After'}
            {mode === 'vs_baseline' && 'vs Baseline'}
          </button>
        ))}
      </div>

      {/* Object Selection */}
      <div className="grid grid-cols-3 gap-4 items-end">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Left Object</label>
          <input
            type="text"
            value={leftObject}
            onChange={(e) => setLeftObject(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>

        <div className="flex justify-center">
          <ArrowRight className="w-5 h-5 text-gray-400" />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Right Object</label>
          <input
            type="text"
            value={rightObject}
            onChange={(e) => setRightObject(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>
      </div>

      {/* Diff Summary */}
      <div className="grid grid-cols-3 gap-3 p-3 bg-gray-50 rounded-lg">
        <div>
          <p className="text-xs text-green-600">Identical</p>
          <p className="text-2xl font-bold text-green-900">{identicalCount}</p>
        </div>
        <div>
          <p className="text-xs text-red-600">Different</p>
          <p className="text-2xl font-bold text-red-900">{differentCount}</p>
        </div>
        <div>
          <p className="text-xs text-gray-600">Total Parameters</p>
          <p className="text-2xl font-bold text-gray-900">{diffs.length}</p>
        </div>
      </div>

      {/* Diff List */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {diffs.map((diff, i) => (
          <div
            key={i}
            className={`border-2 rounded-lg p-3 transition ${getStatusColor(diff.status)}`}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="font-semibold text-gray-900">{diff.parameter}</p>
              <span className={`text-xs px-2 py-0.5 rounded font-semibold ${
                diff.status === 'identical' ? 'bg-green-200 text-green-800' :
                diff.status === 'different' ? 'bg-red-200 text-red-800' :
                'bg-yellow-200 text-yellow-800'
              }`}>
                {diff.status === 'identical' ? '✓ Same' :
                 diff.status === 'different' ? '✗ Different' :
                 diff.status === 'missing_left' ? 'Missing in Left' :
                 'Missing in Right'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <p className="text-xs font-semibold text-gray-700 mb-1">{diff.left.label}</p>
                <p className="text-sm font-mono bg-white p-2 rounded border border-gray-300">
                  {diff.left.value}
                </p>
              </div>

              <div className="flex items-center justify-center">
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-700 mb-1">{diff.right.label}</p>
                <p className="text-sm font-mono bg-white p-2 rounded border border-gray-300">
                  {diff.right.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Export */}
      <button className="w-full px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-semibold flex items-center justify-center gap-2 transition">
        <Download className="w-4 h-4" />
        Export Diff Report
      </button>
    </div>
  );
};
