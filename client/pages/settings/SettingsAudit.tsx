import React, { useState } from 'react';
import { FileText, Filter, Download, Clock, Shield } from 'lucide-react';

interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  section: string;
  oldValue?: string;
  newValue: string;
  environment: string;
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
  requiresApproval: boolean;
  status: 'approved' | 'pending' | 'denied';
  approvedBy?: string;
  justification?: string;
}

export default function SettingsAudit() {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    {
      id: 'log-1',
      timestamp: '2024-01-22 14:32 UTC',
      user: 'Admin User (Mohammed Haitham)',
      action: 'Modified Global Kill Switch',
      section: 'System Configuration',
      oldValue: 'Disable Export: False',
      newValue: 'Disable Export: True',
      environment: 'production',
      riskLevel: 'critical',
      requiresApproval: true,
      status: 'approved',
      approvedBy: 'Security Admin (John Smith)',
      justification: 'Data breach incident - preventing unauthorized data export'
    },
    {
      id: 'log-2',
      timestamp: '2024-01-22 13:15 UTC',
      user: 'Integration Admin',
      action: 'Added Integration',
      section: 'Integration Settings',
      newValue: 'Splunk SIEM endpoint configured',
      environment: 'production',
      riskLevel: 'medium',
      requiresApproval: false,
      status: 'approved'
    },
    {
      id: 'log-3',
      timestamp: '2024-01-22 11:45 UTC',
      user: 'Performance Admin',
      action: 'Updated Rate Limit',
      section: 'Performance & Limits',
      oldValue: 'API requests/min: 1000',
      newValue: 'API requests/min: 1500',
      environment: 'staging',
      riskLevel: 'medium',
      requiresApproval: false,
      status: 'approved'
    },
    {
      id: 'log-4',
      timestamp: '2024-01-21 18:20 UTC',
      user: 'Security Admin',
      action: 'Attempted to disable automation approval',
      section: 'Automation Guardrails',
      oldValue: 'Mandatory approval: True',
      newValue: 'Mandatory approval: False',
      environment: 'production',
      riskLevel: 'critical',
      requiresApproval: true,
      status: 'denied',
      justification: 'Too risky - rejected by system'
    },
    {
      id: 'log-5',
      timestamp: '2024-01-21 16:00 UTC',
      user: 'Platform Admin',
      action: 'Changed Data Retention',
      section: 'Data & Retention',
      oldValue: 'Audit logs retention: 2555 days',
      newValue: 'Audit logs retention: 1825 days',
      environment: 'production',
      riskLevel: 'critical',
      requiresApproval: true,
      status: 'pending',
      justification: 'Cost reduction initiative'
    },
    {
      id: 'log-6',
      timestamp: '2024-01-20 10:30 UTC',
      user: 'Integration Admin',
      action: 'Updated ITSM Integration',
      section: 'Integration Settings',
      oldValue: 'Timeout: 30s',
      newValue: 'Timeout: 45s',
      environment: 'production',
      riskLevel: 'low',
      requiresApproval: false,
      status: 'approved'
    }
  ]);

  const [filterSection, setFilterSection] = useState<string>('all');
  const [filterRisk, setFilterRisk] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredLogs = auditLogs.filter(log => {
    const sectionMatch = filterSection === 'all' || log.section === filterSection;
    const riskMatch = filterRisk === 'all' || log.riskLevel === filterRisk;
    const statusMatch = filterStatus === 'all' || log.status === filterStatus;
    return sectionMatch && riskMatch && statusMatch;
  });

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical':
        return 'bg-red-50 border-red-200 text-red-700';
      case 'high':
        return 'bg-orange-50 border-orange-200 text-orange-700';
      case 'medium':
        return 'bg-yellow-50 border-yellow-200 text-yellow-700';
      case 'low':
        return 'bg-green-50 border-green-200 text-green-700';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'denied':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-600" />
          Settings Audit & Change Control
        </h2>
        <p className="text-gray-500 text-sm mt-1">Track all changes to system settings with full audit trail and approval history</p>
      </div>

      {/* High-Risk Settings Warning */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex gap-3">
          <Shield className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-red-800">
            <strong>High-Risk Settings Requiring Approval:</strong>
            <ul className="mt-2 list-disc list-inside space-y-1 text-xs">
              <li>Disabling automation approval requirements</li>
              <li>Reducing audit log retention below compliance threshold</li>
              <li>Increasing bulk operation limits</li>
              <li>Disabling global kill switches</li>
              <li>Modifying data retention below legal requirements</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Filter className="w-4 h-4" />
          Filter Audit Logs
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Section</label>
            <select
              value={filterSection}
              onChange={(e) => setFilterSection(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="all">All Sections</option>
              <option value="System Configuration">System Configuration</option>
              <option value="Module Configuration">Module Configuration</option>
              <option value="Integration Settings">Integration Settings</option>
              <option value="Data & Retention">Data & Retention</option>
              <option value="Performance & Limits">Performance & Limits</option>
              <option value="Notification Settings">Notification Settings</option>
              <option value="Automation Guardrails">Automation Guardrails</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Risk Level</label>
            <select
              value={filterRisk}
              onChange={(e) => setFilterRisk(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="all">All Levels</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="all">All Statuses</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending Approval</option>
              <option value="denied">Denied</option>
            </select>
          </div>
        </div>
      </div>

      {/* Audit Logs */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">{filteredLogs.length} Change Records</h3>
          <button className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold">
            <Download className="w-4 h-4" />
            Export Audit Log
          </button>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="p-6 text-center text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
            No audit logs matching selected filters
          </div>
        ) : (
          filteredLogs.map(log => (
            <div key={log.id} className={`p-4 rounded-lg border ${getRiskColor(log.riskLevel)}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4" />
                    <h4 className="font-semibold text-gray-900">{log.action}</h4>
                    <span className="text-xs font-semibold px-2 py-1 rounded bg-gray-100 text-gray-700">
                      {log.section}
                    </span>
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${getStatusColor(log.status)}`}>
                      {log.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{log.user}</p>

                  <div className="grid grid-cols-2 gap-4 text-sm mt-2">
                    <div>
                      <p className="text-xs font-semibold text-gray-700">Timestamp</p>
                      <p className="text-gray-900 font-mono text-xs">{log.timestamp}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-700">Environment</p>
                      <p className="text-gray-900 capitalize text-xs">{log.environment}</p>
                    </div>
                  </div>

                  {log.oldValue && (
                    <div className="mt-3 bg-white bg-opacity-50 p-2 rounded text-xs">
                      <p className="font-semibold text-gray-900">Old Value:</p>
                      <p className="font-mono text-gray-700">{log.oldValue}</p>
                    </div>
                  )}

                  <div className="mt-2 bg-white bg-opacity-50 p-2 rounded text-xs">
                    <p className="font-semibold text-gray-900">New Value:</p>
                    <p className="font-mono text-gray-700">{log.newValue}</p>
                  </div>

                  {log.justification && (
                    <div className="mt-2 bg-white bg-opacity-50 p-2 rounded text-xs">
                      <p className="font-semibold text-gray-900">Justification:</p>
                      <p className="text-gray-700">{log.justification}</p>
                    </div>
                  )}

                  {log.status === 'approved' && log.approvedBy && (
                    <div className="mt-2 bg-white bg-opacity-50 p-2 rounded text-xs">
                      <p className="font-semibold text-gray-900">Approved by:</p>
                      <p className="text-gray-700">{log.approvedBy}</p>
                    </div>
                  )}
                </div>

                <div className="ml-4">
                  {log.status === 'pending' && log.requiresApproval && (
                    <div className="flex gap-2">
                      <button className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors font-semibold">
                        Approve
                      </button>
                      <button className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors font-semibold">
                        Deny
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Audit Requirements */}
      <div className="border border-gray-200 rounded-lg p-6 bg-blue-50">
        <h3 className="text-lg font-bold text-gray-900 mb-3">Audit Requirements</h3>
        <div className="space-y-2 text-sm text-gray-700">
          <div className="flex gap-2">
            <span className="font-semibold">✓ Every change logged:</span>
            <span>Who, when, what changed, old and new values</span>
          </div>
          <div className="flex gap-2">
            <span className="font-semibold">✓ Critical settings require approval:</span>
            <span>High-risk changes must be reviewed and authorized</span>
          </div>
          <div className="flex gap-2">
            <span className="font-semibold">✓ Change justification:</span>
            <span>Users must provide business reason for changes</span>
          </div>
          <div className="flex gap-2">
            <span className="font-semibold">✓ Immutable audit trail:</span>
            <span>All changes permanently recorded, cannot be deleted</span>
          </div>
          <div className="flex gap-2">
            <span className="font-semibold">✓ Change notification:</span>
            <span>Relevant stakeholders notified of critical changes</span>
          </div>
        </div>
      </div>
    </div>
  );
}
