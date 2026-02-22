import React, { useState } from 'react';
import { Save, RotateCcw, Database, Trash2, Plus } from 'lucide-react';

interface RetentionPolicy {
  id: string;
  dataType: string;
  description: string;
  retentionDays: number;
  archiveAfterDays: number;
  deleteAfterDays: number;
  compressionEnabled: boolean;
  tieredStorage: 'hot' | 'warm' | 'cold';
  autoCleanup: boolean;
  lastCleanupDate?: string;
  estimatedSize: string;
}

export default function DataRetentionPolicies() {
  const [policies, setPolicies] = useState<RetentionPolicy[]>([
    {
      id: 'alarms',
      dataType: 'Alarm Events',
      description: 'Individual alarm instances and history',
      retentionDays: 90,
      archiveAfterDays: 30,
      deleteAfterDays: 180,
      compressionEnabled: true,
      tieredStorage: 'hot',
      autoCleanup: true,
      lastCleanupDate: '2024-01-22 03:15 UTC',
      estimatedSize: '2.4 GB'
    },
    {
      id: 'metrics',
      dataType: 'Performance Metrics',
      description: 'KPI data, performance baselines, historical metrics',
      retentionDays: 365,
      archiveAfterDays: 90,
      deleteAfterDays: 730,
      compressionEnabled: true,
      tieredStorage: 'warm',
      autoCleanup: true,
      lastCleanupDate: '2024-01-15 02:45 UTC',
      estimatedSize: '15.8 GB'
    },
    {
      id: 'audit-logs',
      dataType: 'Audit Logs',
      description: 'User actions, configuration changes, access logs',
      retentionDays: 2555,
      archiveAfterDays: 365,
      deleteAfterDays: 2555,
      compressionEnabled: true,
      tieredStorage: 'cold',
      autoCleanup: false,
      estimatedSize: '8.2 GB'
    },
    {
      id: 'automation-history',
      dataType: 'Automation History',
      description: 'Automation executions, results, rollback logs',
      retentionDays: 180,
      archiveAfterDays: 60,
      deleteAfterDays: 365,
      compressionEnabled: true,
      tieredStorage: 'warm',
      autoCleanup: true,
      lastCleanupDate: '2024-01-20 04:22 UTC',
      estimatedSize: '5.1 GB'
    },
    {
      id: 'reports',
      dataType: 'Report Snapshots',
      description: 'Generated reports and scheduled report outputs',
      retentionDays: 180,
      archiveAfterDays: 90,
      deleteAfterDays: 365,
      compressionEnabled: true,
      tieredStorage: 'warm',
      autoCleanup: true,
      lastCleanupDate: '2024-01-18 05:30 UTC',
      estimatedSize: '3.7 GB'
    },
    {
      id: 'topology-snapshots',
      dataType: 'Topology Snapshots',
      description: 'Network topology history and replay data',
      retentionDays: 30,
      archiveAfterDays: 14,
      deleteAfterDays: 90,
      compressionEnabled: true,
      tieredStorage: 'hot',
      autoCleanup: true,
      lastCleanupDate: '2024-01-21 06:00 UTC',
      estimatedSize: '4.3 GB'
    },
    {
      id: 'raw-device-logs',
      dataType: 'Raw Device Logs',
      description: 'Syslog, SNMP traps, device-generated events',
      retentionDays: 7,
      archiveAfterDays: 3,
      deleteAfterDays: 30,
      compressionEnabled: true,
      tieredStorage: 'hot',
      autoCleanup: true,
      lastCleanupDate: '2024-01-22 02:00 UTC',
      estimatedSize: '12.5 GB'
    }
  ]);

  const [expandedPolicy, setExpandedPolicy] = useState<string>('alarms');
  const [savedStatus, setSavedStatus] = useState<string | null>(null);

  const handlePolicyChange = (id: string, field: keyof RetentionPolicy, value: any) => {
    setPolicies(prev =>
      prev.map(p =>
        p.id === id ? { ...p, [field]: value } : p
      )
    );
  };

  const handleSave = () => {
    setSavedStatus('Retention policies saved successfully');
    setTimeout(() => setSavedStatus(null), 3000);
  };

  const getTieredStorageColor = (tier: string) => {
    switch (tier) {
      case 'hot':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'warm':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'cold':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const totalSize = policies.reduce((sum, p) => {
    const numStr = p.estimatedSize.replace(' GB', '');
    return sum + parseFloat(numStr);
  }, 0).toFixed(1);

  return (
    <div className="p-8 space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Database className="w-6 h-6 text-blue-600" />
          Data & Retention Policies
        </h2>
        <p className="text-gray-500 text-sm mt-1">Configure data lifecycle, retention periods, and cleanup rules</p>
      </div>

      {/* Storage Summary */}
      <div className="grid grid-cols-4 gap-4">
        <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-600 font-semibold">Total Storage</p>
          <p className="text-2xl font-bold text-blue-900 mt-1">{totalSize} GB</p>
        </div>
        <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
          <p className="text-sm text-green-600 font-semibold">Policies Active</p>
          <p className="text-2xl font-bold text-green-900 mt-1">{policies.length}</p>
        </div>
        <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
          <p className="text-sm text-purple-600 font-semibold">Auto-Cleanup Enabled</p>
          <p className="text-2xl font-bold text-purple-900 mt-1">{policies.filter(p => p.autoCleanup).length}</p>
        </div>
        <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200">
          <p className="text-sm text-orange-600 font-semibold">Compression Enabled</p>
          <p className="text-2xl font-bold text-orange-900 mt-1">{policies.filter(p => p.compressionEnabled).length}</p>
        </div>
      </div>

      {/* Policies List */}
      <div className="space-y-3">
        {policies.map(policy => (
          <div key={policy.id} className="border border-gray-200 rounded-lg overflow-hidden bg-white">
            {/* Policy Header */}
            <button
              onClick={() => setExpandedPolicy(expandedPolicy === policy.id ? '' : policy.id)}
              className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 text-left">
                <Database className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900">{policy.dataType}</h3>
                  <p className="text-sm text-gray-600">{policy.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 ml-4">
                <div className="text-right">
                  <p className="text-xs text-gray-500">Storage Used</p>
                  <p className="text-sm font-semibold text-gray-900">{policy.estimatedSize}</p>
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded border ${getTieredStorageColor(policy.tieredStorage)}`}>
                  {policy.tieredStorage.toUpperCase()} TIER
                </span>
              </div>
            </button>

            {/* Policy Details */}
            {expandedPolicy === policy.id && (
              <div className="p-4 bg-white border-t border-gray-200 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* Retention Duration */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Hot Storage Retention (days)
                    </label>
                    <input
                      type="number"
                      value={policy.retentionDays}
                      onChange={(e) => handlePolicyChange(policy.id, 'retentionDays', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Keep data in hot storage for immediate access</p>
                  </div>

                  {/* Archive After */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Archive After (days)
                    </label>
                    <input
                      type="number"
                      value={policy.archiveAfterDays}
                      onChange={(e) => handlePolicyChange(policy.id, 'archiveAfterDays', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Move to cold storage for long-term retention</p>
                  </div>

                  {/* Delete After */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Delete After (days)
                    </label>
                    <input
                      type="number"
                      value={policy.deleteAfterDays}
                      onChange={(e) => handlePolicyChange(policy.id, 'deleteAfterDays', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Permanently delete data after retention expires</p>
                  </div>

                  {/* Tiered Storage */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Default Storage Tier
                    </label>
                    <select
                      value={policy.tieredStorage}
                      onChange={(e) => handlePolicyChange(policy.id, 'tieredStorage', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="hot">Hot (Frequently accessed)</option>
                      <option value="warm">Warm (Occasional access)</option>
                      <option value="cold">Cold (Rare access)</option>
                    </select>
                  </div>
                </div>

                {/* Toggles */}
                <div className="border-t border-gray-200 pt-4 space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={policy.compressionEnabled}
                      onChange={(e) => handlePolicyChange(policy.id, 'compressionEnabled', e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-semibold text-gray-700">Enable Compression</span>
                    <span className="text-xs text-gray-500">(Reduces storage by ~60%)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={policy.autoCleanup}
                      onChange={(e) => handlePolicyChange(policy.id, 'autoCleanup', e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-semibold text-gray-700">Enable Auto-Cleanup</span>
                    <span className="text-xs text-gray-500">(Automatically delete expired data)</span>
                  </label>
                </div>

                {/* Last Cleanup */}
                {policy.lastCleanupDate && (
                  <div className="bg-gray-50 p-3 rounded border border-gray-200">
                    <p className="text-xs text-gray-600">
                      Last cleanup: <span className="font-mono">{policy.lastCleanupDate}</span>
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lifecycle Explanation */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
        <h4 className="font-semibold text-gray-900">Data Lifecycle</h4>
        <div className="text-sm text-gray-700 space-y-2">
          <div className="flex gap-2">
            <span className="font-semibold w-20">Hot Tier:</span>
            <span>Data is in fast, readily accessible storage (SSD/NVMe)</span>
          </div>
          <div className="flex gap-2">
            <span className="font-semibold w-20">Archive:</span>
            <span>Data moves to slower, cheaper storage after hot period (HDD/Object Storage)</span>
          </div>
          <div className="flex gap-2">
            <span className="font-semibold w-20">Delete:</span>
            <span>Data is permanently removed according to compliance/legal requirements</span>
          </div>
          <div className="flex gap-2">
            <span className="font-semibold w-20">Example:</span>
            <span>Alarm event: Hot for 30 days → Archive for 150 days → Delete on day 180</span>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
        >
          <Save className="w-4 h-4" />
          Save Policies
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold">
          <RotateCcw className="w-4 h-4" />
          Reset to Defaults
        </button>
      </div>

      {/* Success Message */}
      {savedStatus && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 flex items-center gap-2">
          <div className="w-2 h-2 bg-green-600 rounded-full"></div>
          {savedStatus}
        </div>
      )}
    </div>
  );
}
