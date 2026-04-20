import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import SearchableDropdown from './SearchableDropdown';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

type ExecutionStatusFilter = 'all' | 'validated' | 'pending' | 'failed';

const MOCK_BULK_CHANGES: BulkChange[] = [
  { site: 'Cairo-Site-1', parameter: 'TX Power', oldValue: '43', newValue: '40', status: 'validated' },
  { site: 'Cairo-Site-2', parameter: 'TX Power', oldValue: '43', newValue: '40', status: 'validated' },
  { site: 'Giza-Site-1', parameter: 'TX Power', oldValue: '43', newValue: '40', status: 'pending' },
  { site: 'Alexandria-Site-1', parameter: 'DL Bandwidth', oldValue: '20', newValue: '25', status: 'validated' },
];

export const BulkEditor: React.FC<BulkEditorProps> = () => {
  const [content, setContent] = useState('site,parameter,old_value,new_value\nCairo-Site-1,TX Power,43,40\nCairo-Site-2,TX Power,43,40\nGiza-Site-1,TX Power,43,40');
  const [selectedVendor, setSelectedVendor] = useState<string[]>([]);
  const [selectedTechnology, setSelectedTechnology] = useState<string[]>([]);
  const [changes, setChanges] = useState<BulkChange[]>(MOCK_BULK_CHANGES);
  const [executionStatusFilter, setExecutionStatusFilter] = useState<ExecutionStatusFilter>('all');

  const vendors = ['Huawei', 'Ericsson', 'Nokia', 'ZTE', 'ORAN'];
  const technologies = ['2G', '3G', '4G', '5G', 'O-RAN'];

  const contextFilteredChanges = changes.filter(change => {
    const vendorMatch = !selectedVendor.length || change.site.toLowerCase().includes(selectedVendor[0].toLowerCase());
    const techMatch = !selectedTechnology.length || change.parameter.toLowerCase().includes(selectedTechnology[0].toLowerCase());
    return vendorMatch && techMatch;
  });

  const filteredChanges = contextFilteredChanges.filter((change) => (
    executionStatusFilter === 'all' || change.status === executionStatusFilter
  ));

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

  const downloadCSVTemplate = () => {
    const template = 'site,parameter,old_value,new_value';
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(template));
    element.setAttribute('download', 'bulk-changes-template.csv');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const successCount = filteredChanges.filter(c => c.status === 'success').length;
  const failedCount = filteredChanges.filter(c => c.status === 'failed').length;
  const validatedCount = filteredChanges.filter(c => c.status === 'validated').length;
  const pendingCount = contextFilteredChanges.filter(c => c.status === 'pending').length;
  const validatedTotalCount = contextFilteredChanges.filter(c => c.status === 'validated').length;
  const failedTotalCount = contextFilteredChanges.filter(c => c.status === 'failed').length;

  return (
    <div className="flex flex-col h-full gap-4 p-4">
      {/* Filters & Controls */}
      <div className="grid grid-cols-2 gap-3">
        <SearchableDropdown
          label="Vendor"
          options={vendors}
          selected={selectedVendor}
          onChange={setSelectedVendor}
          placeholder="All Vendors"
          multiSelect={false}
          searchable={true}
          compact={true}
        />

        <SearchableDropdown
          label="Technology"
          options={technologies}
          selected={selectedTechnology}
          onChange={setSelectedTechnology}
          placeholder="All Technologies"
          multiSelect={false}
          searchable={true}
          compact={true}
        />
      </div>

      {/* Configuration Input */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold text-muted-foreground">CSV Configuration</label>
          <div className="flex items-center gap-2">
            <button
              onClick={downloadCSVTemplate}
              className="text-xs font-semibold text-muted-foreground cursor-pointer hover:text-foreground transition"
            >
              ⬇️ Download Template
            </button>
            <label className="text-xs font-semibold text-muted-foreground cursor-pointer hover:text-foreground transition">
              <input
                type="file"
                accept=".csv"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      const text = event.target?.result as string;
                      setContent(text);
                    };
                    reader.readAsText(file);
                  }
                }}
                className="hidden"
              />
              📁 Upload CSV
            </label>
          </div>
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full h-32 px-3 py-2 border border-border rounded-lg font-mono text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 bg-input text-foreground"
          placeholder="Paste CSV content or upload a file..."
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
      </div>

      {/* Execution Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <div className="bg-muted px-4 py-2 font-semibold text-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span>Execution Status</span>
            <div className="w-[220px]">
              <Select value={executionStatusFilter} onValueChange={(value) => setExecutionStatusFilter(value as ExecutionStatusFilter)}>
                <SelectTrigger className="h-8 text-xs bg-background">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses ({contextFilteredChanges.length})</SelectItem>
                  <SelectItem value="validated">Validated ({validatedTotalCount})</SelectItem>
                  <SelectItem value="pending">Pending ({pendingCount})</SelectItem>
                  <SelectItem value="failed">Failed ({failedTotalCount})</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
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
              {filteredChanges.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-xs text-muted-foreground">
                    No execution rows match the selected status filter.
                  </td>
                </tr>
              ) : (
                filteredChanges.map((change, i) => (
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Execution Monitor Summary */}
      <div className="space-y-2">
        <h3 className="text-sm font-bold text-foreground">Execution Monitor</h3>
        <div className="grid grid-cols-5 gap-2 p-3 bg-muted/30 border border-border rounded-lg">
          <div className="bg-card border border-border p-2 rounded">
            <p className="text-xs text-muted-foreground font-semibold">Total Changes</p>
            <p className="text-lg font-bold text-foreground">{filteredChanges.length}</p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-2 rounded">
            <p className="text-xs text-blue-700 dark:text-blue-300 font-semibold">Validated</p>
            <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{validatedCount}</p>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 p-2 rounded">
            <p className="text-xs text-yellow-700 dark:text-yellow-300 font-semibold">Pending</p>
            <p className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
              {filteredChanges.filter(c => c.status === 'pending').length}
            </p>
          </div>
          <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 p-2 rounded">
            <p className="text-xs text-green-700 dark:text-green-300 font-semibold">Success Rate</p>
            <p className="text-lg font-bold text-green-600 dark:text-green-400">
              {filteredChanges.length > 0
                ? ((successCount / filteredChanges.length) * 100).toFixed(0)
                : 0}%
            </p>
          </div>
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-2 rounded">
            <p className="text-xs text-red-700 dark:text-red-300 font-semibold">Failed</p>
            <p className="text-lg font-bold text-red-600 dark:text-red-400">{failedCount}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
