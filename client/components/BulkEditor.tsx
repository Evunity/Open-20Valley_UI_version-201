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
  const [selectedVendor, setSelectedVendor] = useState('');
  const [selectedTechnology, setSelectedTechnology] = useState('');
  const [changes, setChanges] = useState<BulkChange[]>(MOCK_BULK_CHANGES);
  const [showPreview, setShowPreview] = useState(false);
  const [copied, setCopied] = useState(false);

  const filteredChanges = changes.filter(change => {
    const vendorMatch = !selectedVendor || change.site.toLowerCase().includes(selectedVendor.toLowerCase());
    const techMatch = !selectedTechnology || change.parameter.toLowerCase().includes(selectedTechnology.toLowerCase());
    return vendorMatch && techMatch;
  });

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

  const successCount = filteredChanges.filter(c => c.status === 'success').length;
  const failedCount = filteredChanges.filter(c => c.status === 'failed').length;
  const validatedCount = filteredChanges.filter(c => c.status === 'validated').length;

  return (
    <div className="flex flex-col h-full gap-4 p-4">
      {/* Filters & Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 rounded-lg border border-border bg-card">
        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-1">Vendor</label>
          <select
            value={selectedVendor}
            onChange={(e) => setSelectedVendor(e.target.value)}
            className="w-full px-3 py-1.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-input text-foreground text-sm"
          >
            <option value="">All Vendors</option>
            <option value="Huawei">Huawei</option>
            <option value="Ericsson">Ericsson</option>
            <option value="Nokia">Nokia</option>
            <option value="ZTE">ZTE</option>
            <option value="ORAN">ORAN</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-1">Technology</label>
          <select
            value={selectedTechnology}
            onChange={(e) => setSelectedTechnology(e.target.value)}
            className="w-full px-3 py-1.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-input text-foreground text-sm"
          >
            <option value="">All Technologies</option>
            <option value="2G">2G</option>
            <option value="3G">3G</option>
            <option value="4G">4G</option>
            <option value="5G">5G</option>
            <option value="ORAN">O-RAN</option>
          </select>
        </div>
      </div>

      {/* Configuration Input */}
      <div>
        <label className="block text-xs font-semibold text-muted-foreground mb-2">CSV Configuration</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full h-32 px-3 py-2 border border-border rounded-lg font-mono text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 bg-input text-foreground"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={validateChanges}
          className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-semibold transition"
        >
          Validate Changes
        </button>
        <button
          onClick={dryRun}
          className="flex-1 px-4 py-2 bg-amber-600 dark:bg-amber-700 text-white rounded-lg hover:bg-amber-700 dark:hover:bg-amber-800 font-semibold transition"
        >
          Dry Run
        </button>
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="flex-1 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 font-semibold flex items-center justify-center gap-2 transition"
        >
          <ChevronDown className={`w-4 h-4 transition ${showPreview ? 'rotate-180' : ''}`} />
          Preview
        </button>
      </div>

      {/* Diff Preview */}
      {showPreview && (
        <div className="border border-border rounded-lg overflow-hidden">
          <div className="bg-muted px-4 py-2 font-semibold text-sm">Diff Preview (Changes to be applied)</div>
          <div className="p-4 bg-background space-y-2 max-h-48 overflow-y-auto">
            <div className="grid grid-cols-5 gap-2 text-xs font-semibold text-muted-foreground mb-2">
              <div>Site</div>
              <div>Parameter</div>
              <div className="text-red-600">Old Value</div>
              <div className="text-green-600">New Value</div>
              <div>Impact</div>
            </div>
            {filteredChanges.map((change, i) => (
              <div key={i} className="grid grid-cols-5 gap-2 text-xs p-2 bg-card rounded border border-border">
                <div className="font-mono">{change.site}</div>
                <div>{change.parameter}</div>
                <div className="text-red-600 line-through font-mono">{change.oldValue}</div>
                <div className="text-green-600 font-mono font-bold">{change.newValue}</div>
                <div className={`px-2 py-0.5 rounded font-semibold ${
                  change.status === 'failed' ? 'bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300' :
                  change.status === 'validated' ? 'bg-green-100 dark:bg-green-950 text-green-800 dark:text-green-300' :
                  'bg-yellow-100 dark:bg-yellow-950 text-yellow-800 dark:text-yellow-300'
                }`}>
                  {change.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Execution Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <div className="bg-muted px-4 py-2 font-semibold text-sm flex items-center justify-between">
          <span>Execution Status</span>
          <div className="flex gap-4 text-xs font-semibold">
            <span className="text-green-600 dark:text-green-400">✓ {successCount}</span>
            <span className="text-red-600 dark:text-red-400">✗ {failedCount}</span>
            <span className="text-primary">~ {validatedCount}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-4 py-2 text-left font-semibold text-muted-foreground">Site</th>
                <th className="px-4 py-2 text-left font-semibold text-muted-foreground">Parameter</th>
                <th className="px-4 py-2 text-left font-semibold text-muted-foreground">Old</th>
                <th className="px-4 py-2 text-left font-semibold text-muted-foreground">New</th>
                <th className="px-4 py-2 text-left font-semibold text-muted-foreground">Status</th>
                <th className="px-4 py-2 text-left font-semibold text-muted-foreground">Message</th>
              </tr>
            </thead>
            <tbody>
              {filteredChanges.map((change, i) => (
                <tr key={i} className="border-b border-border hover:bg-muted/30">
                  <td className="px-4 py-2 font-mono">{change.site}</td>
                  <td className="px-4 py-2">{change.parameter}</td>
                  <td className="px-4 py-2 font-mono text-red-600 dark:text-red-400">{change.oldValue}</td>
                  <td className="px-4 py-2 font-mono text-green-600 dark:text-green-400 font-bold">{change.newValue}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-0.5 rounded font-semibold ${
                      change.status === 'success' ? 'bg-green-100 dark:bg-green-950 text-green-800 dark:text-green-300' :
                      change.status === 'failed' ? 'bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300' :
                      change.status === 'validated' ? 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300' :
                      'bg-yellow-100 dark:bg-yellow-950 text-yellow-800 dark:text-yellow-300'
                    }`}>
                      {change.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-red-600 dark:text-red-400">
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
      <div className="grid grid-cols-3 gap-3 p-3 bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-lg">
        <div>
          <p className="text-xs text-primary/70">Total Changes</p>
          <p className="text-2xl font-bold text-primary">{filteredChanges.length}</p>
        </div>
        <div>
          <p className="text-xs text-green-600 dark:text-green-400">Ready to Execute</p>
          <p className="text-2xl font-bold text-green-700 dark:text-green-400">{validatedCount}</p>
        </div>
        <div>
          <p className="text-xs text-red-600 dark:text-red-400">With Errors</p>
          <p className="text-2xl font-bold text-red-700 dark:text-red-400">{failedCount}</p>
        </div>
      </div>
    </div>
  );
};
