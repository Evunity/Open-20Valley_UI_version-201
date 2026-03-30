import React, { useState } from 'react';
import { ArrowRight, Download, Check } from 'lucide-react';

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

const SITE_OPTIONS = ['Cairo-Site-1', 'Cairo-Site-2', 'Cairo-Site-3', 'Giza-Site-1', 'Giza-Site-2', 'Alexandria-Site-1', 'Suez-Site-1'];

const PARAMETER_OPTIONS = ['TX Power', 'DL Bandwidth', 'Cell Barring', 'IP Address', 'VLAN ID', 'RRC Idle Count', 'PDCP Count', 'Handover Rate'];

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
  },
  {
    parameter: 'RRC Idle Count',
    left: { label: 'Cairo-Site-1', value: '1250' },
    right: { label: 'Cairo-Site-1 (Time-2)', value: '1260' },
    status: 'different'
  },
  {
    parameter: 'PDCP Count',
    left: { label: 'Cairo-Site-1', value: '5600' },
    right: { label: 'Cairo-Site-1 (Time-2)', value: '5600' },
    status: 'identical'
  },
  {
    parameter: 'Handover Rate',
    left: { label: 'Cairo-Site-1', value: '2.5%' },
    right: { label: 'Cairo-Site-1 (Time-2)', value: '2.8%' },
    status: 'different'
  }
];

export const DiffView: React.FC<DiffViewProps> = () => {
  const [diffs] = useState<ConfigDiff[]>(MOCK_DIFFS);
  const [compareType, setCompareType] = useState<'different-sites' | 'same-site'>('different-sites');
  const [leftSite, setLeftSite] = useState('Cairo-Site-1');
  const [rightSite, setRightSite] = useState('Cairo-Site-2');
  const [selectedParameters, setSelectedParameters] = useState<Set<string>>(new Set(PARAMETER_OPTIONS));

  const filteredDiffs = diffs.filter(d => selectedParameters.has(d.parameter));
  const differentCount = filteredDiffs.filter(d => d.status === 'different').length;
  const identicalCount = filteredDiffs.filter(d => d.status === 'identical').length;

  const toggleParameter = (param: string) => {
    const newSelected = new Set(selectedParameters);
    if (newSelected.has(param)) {
      newSelected.delete(param);
    } else {
      newSelected.add(param);
    }
    setSelectedParameters(newSelected);
  };

  const selectAllParameters = () => {
    setSelectedParameters(new Set(PARAMETER_OPTIONS));
  };

  const clearAllParameters = () => {
    setSelectedParameters(new Set());
  };

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
      {/* Comparison Type */}
      <div className="flex gap-4">
        <button
          onClick={() => setCompareType('different-sites')}
          className={`flex-1 px-4 py-2 rounded-lg font-semibold transition border-2 ${
            compareType === 'different-sites'
              ? 'border-blue-600 bg-blue-50 text-blue-900'
              : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
          }`}
        >
          Compare Different Sites
        </button>
        <button
          onClick={() => setCompareType('same-site')}
          className={`flex-1 px-4 py-2 rounded-lg font-semibold transition border-2 ${
            compareType === 'same-site'
              ? 'border-blue-600 bg-blue-50 text-blue-900'
              : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
          }`}
        >
          Compare Within Site (Time)
        </button>
      </div>

      {/* Site Selection */}
      <div className="grid grid-cols-3 gap-4 items-end">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">{compareType === 'same-site' ? 'Site' : 'Left Site'}</label>
          <select
            value={leftSite}
            onChange={(e) => setLeftSite(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {SITE_OPTIONS.map(site => (
              <option key={site} value={site}>{site}</option>
            ))}
          </select>
        </div>

        <div className="flex justify-center">
          <ArrowRight className="w-5 h-5 text-gray-400" />
        </div>

        {compareType === 'different-sites' && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Right Site</label>
            <select
              value={rightSite}
              onChange={(e) => setRightSite(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {SITE_OPTIONS.map(site => (
                <option key={site} value={site}>{site}</option>
              ))}
            </select>
          </div>
        )}
        {compareType === 'same-site' && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Time Period</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Current vs Previous Hour</option>
              <option>Current vs Today</option>
              <option>Today vs Yesterday</option>
              <option>This Week vs Last Week</option>
            </select>
          </div>
        )}
      </div>

      {/* Parameter Selection */}
      <div className="bg-gray-50 rounded-lg p-3 space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-semibold text-gray-700">Select Parameters</label>
          <div className="flex gap-2">
            <button
              onClick={selectAllParameters}
              className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 font-semibold"
            >
              Select All
            </button>
            <button
              onClick={clearAllParameters}
              className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 font-semibold"
            >
              Clear All
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {PARAMETER_OPTIONS.map(param => (
            <label key={param} className="flex items-center gap-2 cursor-pointer hover:bg-white p-2 rounded transition">
              <input
                type="checkbox"
                checked={selectedParameters.has(param)}
                onChange={() => toggleParameter(param)}
                className="w-4 h-4 rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">{param}</span>
            </label>
          ))}
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
          <p className="text-2xl font-bold text-gray-900">{filteredDiffs.length}</p>
        </div>
      </div>

      {/* Diff List */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {selectedParameters.size === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>Please select at least one parameter to compare</p>
          </div>
        ) : (
          filteredDiffs.map((diff, i) => (
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
        ))
        )}
      </div>

      {/* Export */}
      <button className="w-full px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-semibold flex items-center justify-center gap-2 transition">
        <Download className="w-4 h-4" />
        Export Diff Report
      </button>
    </div>
  );
};
