import React, { useState } from 'react';
import { Save, RotateCcw, RotateCcw as Recovery, HardDrive, CheckCircle, AlertCircle } from 'lucide-react';

interface BackupPolicy {
  id: string;
  name: string;
  type: 'full' | 'incremental' | 'differential';
  frequency: string;
  retention: number;
  lastRun?: string;
  nextRun: string;
  status: 'healthy' | 'warning' | 'failed';
  storageLocation: string;
  enabled: boolean;
}

interface RecoveryMetric {
  metric: string;
  value: string;
  category: 'rto' | 'rpo' | 'capacity';
}

export default function BackupRecovery() {
  const [backupPolicies, setBackupPolicies] = useState<BackupPolicy[]>([
    {
      id: 'full-daily',
      name: 'Full Daily Backup',
      type: 'full',
      frequency: 'Every day at 02:00 UTC',
      retention: 14,
      lastRun: '2024-01-22 02:05 UTC',
      nextRun: '2024-01-23 02:00 UTC',
      status: 'healthy',
      storageLocation: 's3://backup-prod/full-backups',
      enabled: true
    },
    {
      id: 'incremental-hourly',
      name: 'Incremental Hourly',
      type: 'incremental',
      frequency: 'Every hour',
      retention: 7,
      lastRun: '2024-01-22 14:00 UTC',
      nextRun: '2024-01-22 15:00 UTC',
      status: 'healthy',
      storageLocation: 's3://backup-prod/incremental',
      enabled: true
    },
    {
      id: 'database-snapshot',
      name: 'Database Snapshots',
      type: 'incremental',
      frequency: 'Every 6 hours',
      retention: 30,
      lastRun: '2024-01-22 12:00 UTC',
      nextRun: '2024-01-22 18:00 UTC',
      status: 'healthy',
      storageLocation: 's3://backup-prod/db-snapshots',
      enabled: true
    },
    {
      id: 'audit-logs-archive',
      name: 'Audit Logs Archive',
      type: 'differential',
      frequency: 'Daily at 23:00 UTC',
      retention: 2555,
      lastRun: '2024-01-22 23:05 UTC',
      nextRun: '2024-01-23 23:00 UTC',
      status: 'warning',
      storageLocation: 's3://backup-prod/audit-archive',
      enabled: true
    }
  ]);

  const [recoveryMetrics] = useState<RecoveryMetric[]>([
    { metric: 'Recovery Time Objective (RTO)', value: '4 hours', category: 'rto' },
    { metric: 'Recovery Point Objective (RPO)', value: '1 hour', category: 'rpo' },
    { metric: 'Total Backup Storage', value: '2.4 TB', category: 'capacity' },
    { metric: 'Backup Retention Period', value: '30 days average', category: 'capacity' },
    { metric: 'Average Backup Duration', value: '45 minutes', category: 'rto' },
    { metric: 'Last Successful Recovery Test', value: '2024-01-15 04:30 UTC', category: 'rto' }
  ]);

  const [savedStatus, setSavedStatus] = useState<string | null>(null);

  const togglePolicy = (id: string) => {
    setBackupPolicies(prev =>
      prev.map(p => p.id === id ? { ...p, enabled: !p.enabled } : p)
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <HardDrive className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'failed':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const handleSave = () => {
    setSavedStatus('Backup settings saved successfully');
    setTimeout(() => setSavedStatus(null), 3000);
  };

  return (
    <div className="p-8 space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <HardDrive className="w-6 h-6 text-blue-600" />
          Backup & Recovery
        </h2>
        <p className="text-gray-500 text-sm mt-1">Configure backup policies, retention, and disaster recovery</p>
      </div>

      {/* Recovery Metrics */}
      <div className="grid grid-cols-3 gap-4">
        {recoveryMetrics.slice(0, 3).map((metric, idx) => (
          <div key={idx} className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-600 font-semibold">{metric.metric}</p>
            <p className="text-2xl font-bold text-blue-900 mt-1">{metric.value}</p>
          </div>
        ))}
      </div>

      {/* SLA Summary */}
      <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Service Level Agreements (SLA)</h3>
        <div className="grid grid-cols-2 gap-6">
          {recoveryMetrics.map((metric, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">{metric.metric}</span>
              <span className="text-sm font-bold text-gray-900">{metric.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Backup Policies */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-gray-900">Backup Policies</h3>

        {backupPolicies.map(policy => (
          <div
            key={policy.id}
            className={`p-4 rounded-lg border ${getStatusColor(policy.status)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                {getStatusIcon(policy.status)}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900">{policy.name}</h4>
                    <span className="text-xs font-semibold px-2 py-1 rounded bg-gray-100 text-gray-700 capitalize">
                      {policy.type}
                    </span>
                    <span className="text-xs font-semibold px-2 py-1 rounded bg-gray-100 text-gray-700 capitalize">
                      {policy.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{policy.frequency}</p>

                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-gray-600 font-semibold">Retention</p>
                      <p className="text-gray-900">{policy.retention} days</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-semibold">Storage</p>
                      <p className="text-gray-900 font-mono text-xs truncate">{policy.storageLocation}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-semibold">Last Run</p>
                      <p className="text-gray-900 text-xs">{policy.lastRun || 'Never'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-semibold">Next Run</p>
                      <p className="text-gray-900 text-xs">{policy.nextRun}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 ml-4">
                <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-semibold">
                  Run Now
                </button>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={policy.enabled}
                    onChange={() => togglePolicy(policy.id)}
                    className="sr-only peer"
                  />
                  <div className={`w-11 h-6 rounded-full peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 transition-colors ${
                    policy.enabled ? 'bg-blue-600' : 'bg-gray-300'
                  } peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
                </label>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recovery Procedures */}
      <div className="border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Recovery className="w-5 h-5" />
          Disaster Recovery Procedures
        </h3>

        <div className="space-y-4">
          <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
            <h4 className="font-semibold text-gray-900 mb-2">1. Full System Recovery</h4>
            <p className="text-sm text-gray-700 mb-3">
              Restore entire system from most recent full backup. Used for complete system failure or data corruption.
            </p>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors font-semibold">
                Initiate Recovery
              </button>
              <button className="px-3 py-1 text-sm bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors font-semibold">
                Test Recovery
              </button>
            </div>
          </div>

          <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
            <h4 className="font-semibold text-gray-900 mb-2">2. Partial Recovery</h4>
            <p className="text-sm text-gray-700 mb-3">
              Restore specific tenant data or modules while keeping rest of system online. Requires minimal downtime.
            </p>
            <input
              type="text"
              placeholder="Enter tenant ID or module name..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm mb-2"
            />
            <button className="px-3 py-1 text-sm bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors font-semibold">
              Initiate Partial Recovery
            </button>
          </div>

          <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
            <h4 className="font-semibold text-gray-900 mb-2">3. Point-in-Time Recovery</h4>
            <p className="text-sm text-gray-700 mb-3">
              Restore system to specific point in time. Select backup and recovery timestamp.
            </p>
            <div className="flex gap-2 mb-2">
              <select className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                <option>Select backup point...</option>
                <option>2024-01-22 02:00 UTC (Full)</option>
                <option>2024-01-22 12:00 UTC (Full)</option>
                <option>2024-01-22 14:00 UTC (Incremental)</option>
              </select>
              <button className="px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors font-semibold">
                Recover to Point
              </button>
            </div>
          </div>

          <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
            <h4 className="font-semibold text-gray-900 mb-2">4. Backup Verification</h4>
            <p className="text-sm text-gray-700 mb-3">
              Automatically verify backup integrity and test recovery procedures (recommended monthly).
            </p>
            <button className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors font-semibold">
              Run Verification
            </button>
          </div>
        </div>
      </div>

      {/* Backup Storage */}
      <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Backup Storage Configuration</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Primary Storage Location</label>
            <input
              type="text"
              value="s3://backup-prod"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">AWS S3 bucket or equivalent cloud storage</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Secondary Storage (DR Region)</label>
            <input
              type="text"
              value="s3://backup-dr-us-west"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">For geographic redundancy</p>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" defaultChecked className="w-4 h-4" />
            <span className="text-sm text-gray-700">Enable encryption for backups at rest</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" defaultChecked className="w-4 h-4" />
            <span className="text-sm text-gray-700">Replicate backups to secondary region automatically</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" defaultChecked className="w-4 h-4" />
            <span className="text-sm text-gray-700">Verify backup integrity after each backup</span>
          </label>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
        >
          <Save className="w-4 h-4" />
          Save Settings
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
