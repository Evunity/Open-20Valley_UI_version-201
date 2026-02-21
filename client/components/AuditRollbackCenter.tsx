import React, { useState } from 'react';
import { RotateCcw, Eye, Download, Filter } from 'lucide-react';

interface AuditRollbackCenterProps {
  selectedTarget: any;
  onTargetChange: (target: any) => void;
}

interface AuditEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  object: string;
  status: 'completed' | 'failed' | 'rolled-back';
  changeDetails: string;
  reversible: boolean;
}

const MOCK_AUDIT: AuditEntry[] = [
  {
    id: '1',
    timestamp: '2024-12-02 14:32',
    user: 'Engineer.A',
    action: 'Modified TX Power',
    object: 'Cairo-Site-1',
    status: 'completed',
    changeDetails: 'TX Power: 43 → 40 dBm',
    reversible: true
  },
  {
    id: '2',
    timestamp: '2024-12-02 13:45',
    user: 'Engineer.B',
    action: 'Bulk Config Update',
    object: 'Cairo Region',
    status: 'completed',
    changeDetails: '12 sites updated',
    reversible: true
  },
  {
    id: '3',
    timestamp: '2024-12-02 12:10',
    user: 'System',
    action: 'Automation Execution',
    object: 'Dubai-Cluster-1',
    status: 'rolled-back',
    changeDetails: 'Failed validation check',
    reversible: false
  }
];

export const AuditRollbackCenter: React.FC<AuditRollbackCenterProps> = () => {
  const [entries] = useState<AuditEntry[]>(MOCK_AUDIT);
  const [selectedEntry, setSelectedEntry] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState('today');

  return (
    <div className="flex flex-col h-full gap-4 p-4">
      {/* Filters */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Date Range</label>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="all">All Time</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Action Type</label>
          <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
            <option>All Actions</option>
            <option>Modifications</option>
            <option>Rollbacks</option>
            <option>Bulk Changes</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">User</label>
          <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
            <option>All Users</option>
            <option>Engineer.A</option>
            <option>Engineer.B</option>
            <option>System</option>
          </select>
        </div>
      </div>

      {/* Audit Log */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {entries.map((entry) => (
          <div
            key={entry.id}
            onClick={() => setSelectedEntry(selectedEntry === entry.id ? null : entry.id)}
            className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{entry.action}</p>
                <p className="text-sm text-gray-600">{entry.object}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded font-semibold ${
                entry.status === 'completed' ? 'bg-green-100 text-green-800' :
                entry.status === 'failed' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {entry.status}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-600">
              <div>{entry.timestamp} • {entry.user}</div>
              {entry.reversible && (
                <div className="flex items-center gap-1 text-blue-600">
                  <RotateCcw className="w-3 h-3" />
                  Reversible
                </div>
              )}
            </div>

            {selectedEntry === entry.id && (
              <div className="mt-3 pt-3 border-t border-gray-200 space-y-3">
                <div className="p-3 bg-gray-50 rounded">
                  <p className="text-xs font-semibold text-gray-700 mb-1">Change Details</p>
                  <p className="text-sm font-mono text-gray-900">{entry.changeDetails}</p>
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-semibold text-sm flex items-center justify-center gap-2 transition">
                    <Eye className="w-4 h-4" />
                    View Full Details
                  </button>
                  {entry.reversible && (
                    <button className="flex-1 px-3 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 font-semibold text-sm flex items-center justify-center gap-2 transition">
                      <RotateCcw className="w-4 h-4" />
                      Rollback
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Export */}
      <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-semibold flex items-center justify-center gap-2 transition">
        <Download className="w-4 h-4" />
        Export Audit Log
      </button>
    </div>
  );
};
