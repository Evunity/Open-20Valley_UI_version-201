import React, { useState } from 'react';
import { ChevronDown, Copy, Check, AlertCircle } from 'lucide-react';

interface BulkEditorProps {
  selectedTarget: any;
  onTargetChange: (target: any) => void;
}

interface BulkChange {
  site: string;
  parameter: string;
  oldValue: string;
  newValue: string;
  status: 'pending' | 'validated' | 'executing' | 'success' | 'failed';
  error?: string;
}

const MOCK_BULK_CHANGES: BulkChange[] = [
  { site: 'Cairo-Site-1', parameter: 'TX Power', oldValue: '43', newValue: '40', status: 'validated' },
  { site: 'Cairo-Site-2', parameter: 'TX Power', oldValue: '43', newValue: '40', status: 'validated' },
  { site: 'Giza-Site-1', parameter: 'TX Power', oldValue: '43', newValue: '40', status: 'pending' },
  { site: 'Alexandria-Site-1', parameter: 'DL Bandwidth', oldValue: '20', newValue: '25', status: 'validated' },
];

export const BulkEditor: React.FC<BulkEditorProps> = () => {
  const [content, setContent] = useState('site,parameter,old_value,new_value\nCairo-Site-1,TX Power,43,40\nCairo-Site-2,TX Power,43,40\nGiza-Site-1,TX Power,43,40');
  const [format, setFormat] = useState('csv');
  const [scope, setScope] = useState('region');
  const [changes, setChanges] = useState<BulkChange[]>(MOCK_BULK_CHANGES);
  const [showPreview, setShowPreview] = useState(false);
  const [copied, setCopied] = useState(false);

  const validateChanges = () => {
    setChanges(changes.map(c => ({ ...c, status: 'validated' })));
  };

  const dryRun = () => {
    // Simulate validation
    setChanges(changes.map((c, i) => ({
      ...c,
      status: i % 3 === 0 ? 'failed' : 'validated',
      error: i % 3 === 0 ? 'Conflict: Cell already has similar parameter' : undefined
    })));
  };

  const copyCommand = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const successCount = changes.filter(c => c.status === 'success').length;
  const failedCount = changes.filter(c => c.status === 'failed').length;
  const validatedCount = changes.filter(c => c.status === 'validated').length;

  return (
    <div className="flex flex-col h-full gap-4 p-4">
      {/* Filters & Controls */}
      <div className="grid grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Format</label>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="csv">CSV</option>
            <option value="json">JSON</option>
            <option value="yaml">YAML</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Scope</label>
          <select
            value={scope}
            onChange={(e) => setScope(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="all">All Sites</option>
            <option value="region">Selected Region</option>
            <option value="cluster">Selected Cluster</option>
            <option value="vendor">Vendor Filter</option>
            <option value="tech">Technology Filter</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Vendor Filter</label>
          <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
            <option>All Vendors</option>
            <option>Huawei</option>
            <option>Nokia</option>
            <option>Ericsson</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Technology</label>
          <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
            <option>All Technologies</option>
            <option>4G</option>
            <option>5G</option>
            <option>Transport</option>
          </select>
        </div>
      </div>

      {/* Configuration Input */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Configuration Changes ({format.toUpperCase()})</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={validateChanges}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition"
        >
          Validate Changes
        </button>
        <button
          onClick={dryRun}
          className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 font-semibold transition"
        >
          Dry Run
        </button>
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold flex items-center justify-center gap-2 transition"
        >
          <ChevronDown className={`w-4 h-4 transition ${showPreview ? 'rotate-180' : ''}`} />
          Preview
        </button>
      </div>

      {/* Diff Preview */}
      {showPreview && (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-100 px-4 py-2 font-semibold text-sm">Diff Preview (Changes to be applied)</div>
          <div className="p-4 bg-white space-y-2 max-h-48 overflow-y-auto">
            <div className="grid grid-cols-5 gap-2 text-xs font-semibold text-gray-700 mb-2">
              <div>Site</div>
              <div>Parameter</div>
              <div className="text-red-600">Old Value</div>
              <div className="text-green-600">New Value</div>
              <div>Impact</div>
            </div>
            {changes.map((change, i) => (
              <div key={i} className="grid grid-cols-5 gap-2 text-xs p-2 bg-gray-50 rounded">
                <div className="font-mono">{change.site}</div>
                <div>{change.parameter}</div>
                <div className="text-red-600 line-through font-mono">{change.oldValue}</div>
                <div className="text-green-600 font-mono font-bold">{change.newValue}</div>
                <div className={`px-2 py-0.5 rounded font-semibold ${
                  change.status === 'failed' ? 'bg-red-100 text-red-800' :
                  change.status === 'validated' ? 'bg-green-100 text-green-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {change.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Execution Table */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-100 px-4 py-2 font-semibold text-sm flex items-center justify-between">
          <span>Execution Status</span>
          <div className="flex gap-4 text-xs font-semibold">
            <span className="text-green-700">✓ {successCount}</span>
            <span className="text-red-700">✗ {failedCount}</span>
            <span className="text-blue-700">~ {validatedCount}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-2 text-left font-semibold text-gray-700">Site</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700">Parameter</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700">Old</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700">New</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700">Status</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700">Message</th>
              </tr>
            </thead>
            <tbody>
              {changes.map((change, i) => (
                <tr key={i} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-4 py-2 font-mono">{change.site}</td>
                  <td className="px-4 py-2">{change.parameter}</td>
                  <td className="px-4 py-2 font-mono text-red-600">{change.oldValue}</td>
                  <td className="px-4 py-2 font-mono text-green-600 font-bold">{change.newValue}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-0.5 rounded font-semibold ${
                      change.status === 'success' ? 'bg-green-100 text-green-800' :
                      change.status === 'failed' ? 'bg-red-100 text-red-800' :
                      change.status === 'validated' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {change.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-red-600">
                    {change.error && (
                      <div className="flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {change.error}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div>
          <p className="text-xs text-blue-600">Total Changes</p>
          <p className="text-2xl font-bold text-blue-900">{changes.length}</p>
        </div>
        <div>
          <p className="text-xs text-green-600">Ready to Execute</p>
          <p className="text-2xl font-bold text-green-900">{validatedCount}</p>
        </div>
        <div>
          <p className="text-xs text-red-600">With Errors</p>
          <p className="text-2xl font-bold text-red-900">{failedCount}</p>
        </div>
      </div>
    </div>
  );
};
