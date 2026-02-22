import React, { useState } from 'react';
import {
  Settings,
  Sliders,
  Zap,
  Database,
  Gauge,
  Bell,
  Shield,
  Cloud,
  RotateCcw,
  Palette,
  FileText,
  Lock,
  Save,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  Download,
  TestTube
} from 'lucide-react';

type TabType = 'system' | 'modules' | 'integration' | 'retention' | 'performance' | 'notifications' | 'automation' | 'environment' | 'backup' | 'branding' | 'audit' | 'permissions';

export default function Settings() {
  const [activeTab, setActiveTab] = useState<TabType>('system');
  const [savedStatus, setSavedStatus] = useState<string | null>(null);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [systemName, setSystemName] = useState('OSS Platform');
  const [timezone, setTimezone] = useState('UTC');
  const [dateFormat, setDateFormat] = useState('YYYY-MM-DD HH:mm:ss');
  const [language, setLanguage] = useState('English');

  const handleSave = () => {
    setSavedStatus('Settings saved successfully');
    setTimeout(() => setSavedStatus(null), 3000);
  };

  const tabs = [
    { id: 'system', label: 'System Configuration', icon: Settings },
    { id: 'modules', label: 'Module Configuration', icon: Sliders },
    { id: 'integration', label: 'Integration Settings', icon: Zap },
    { id: 'retention', label: 'Data & Retention', icon: Database },
    { id: 'performance', label: 'Performance & Limits', icon: Gauge },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'automation', label: 'Automation Guardrails', icon: Shield },
    { id: 'environment', label: 'Environment & Deploy', icon: Cloud },
    { id: 'backup', label: 'Backup & Recovery', icon: RotateCcw },
    { id: 'branding', label: 'Branding & UI', icon: Palette },
    { id: 'audit', label: 'Audit & Change Control', icon: FileText },
    { id: 'permissions', label: 'Permissions & Access', icon: Lock }
  ];

  return (
    <div className="flex h-full flex-col bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-8 py-6">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500">Platform Configuration, System Controls & Operational Guardrails</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 bg-white overflow-x-auto">
        <div className="flex px-8">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          {/* System Configuration */}
          {activeTab === 'system' && (
            <div className="space-y-6">
              <div>
                <h2 className="mb-4 text-2xl font-bold text-gray-900">System Configuration</h2>
                <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">System Name</label>
                    <input
                      type="text"
                      value={systemName}
                      onChange={(e) => setSystemName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Timezone</label>
                    <select
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option>UTC</option>
                      <option>America/New_York</option>
                      <option>Europe/London</option>
                      <option>Asia/Tokyo</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Date/Time Format</label>
                    <select
                      value={dateFormat}
                      onChange={(e) => setDateFormat(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option>YYYY-MM-DD HH:mm:ss</option>
                      <option>DD/MM/YYYY HH:mm:ss</option>
                      <option>MM/DD/YYYY HH:mm:ss</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Language</label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option>English</option>
                      <option>Spanish</option>
                      <option>French</option>
                      <option>German</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-4 text-xl font-bold text-gray-900">Global Kill Switches</h3>
                <div className="space-y-3">
                  {[
                    { name: 'Disable All Automations', risk: 'critical' },
                    { name: 'Disable Command Execution', risk: 'critical' },
                    { name: 'Disable Report Generation', risk: 'high' },
                    { name: 'Disable External Exports', risk: 'high' },
                    { name: 'Force System Read-Only', risk: 'critical' }
                  ].map(sw => (
                    <div key={sw.name} className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4">
                      <div>
                        <p className="font-semibold text-gray-900">{sw.name}</p>
                        <p className="text-sm text-gray-600">Emergency control - use with caution</p>
                      </div>
                      <label className="relative inline-flex cursor-pointer items-center">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="peer h-6 w-11 rounded-full bg-gray-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-red-600 peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4">
                  <input
                    type="checkbox"
                    checked={maintenanceMode}
                    onChange={(e) => setMaintenanceMode(e.target.checked)}
                    className="h-4 w-4"
                  />
                  <div>
                    <p className="font-semibold text-gray-900">Maintenance Mode</p>
                    <p className="text-sm text-gray-600">Prevents automations & scripts, allows read-only access</p>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Module Configuration */}
          {activeTab === 'modules' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">Module Configuration</h2>
              {['Alarm', 'Analytics', 'Automation', 'Topology', 'Reports', 'Command Center'].map(module => (
                <div key={module} className="rounded-lg border border-gray-200 bg-white p-6">
                  <h3 className="mb-4 font-semibold text-gray-900">{module} Module</h3>
                  <div className="space-y-3">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="h-4 w-4" />
                      <span className="text-sm text-gray-700">Enable {module}</span>
                    </label>
                    <div>
                      <label className="text-sm font-semibold text-gray-700">Configuration</label>
                      <input
                        type="text"
                        placeholder={`${module} settings...`}
                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Integration Settings */}
          {activeTab === 'integration' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Integration Settings</h2>
                <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                  <Plus className="w-4 h-4" />
                  Add Integration
                </button>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900">Northbound Integrations</h3>
                {['ServiceNow ITSM', 'Splunk SIEM', 'SMTP Email'].map(int => (
                  <div key={int} className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4">
                    <div>
                      <p className="font-semibold text-gray-900">{int}</p>
                      <p className="text-xs text-gray-500">Status: Healthy</p>
                    </div>
                    <button className="rounded p-2 text-blue-600 hover:bg-blue-50">
                      <TestTube className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900">Southbound Integrations</h3>
                {['Cisco SNMP', 'Juniper NETCONF', 'REST API'].map(int => (
                  <div key={int} className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4">
                    <div>
                      <p className="font-semibold text-gray-900">{int}</p>
                      <p className="text-xs text-gray-500">Status: Healthy</p>
                    </div>
                    <button className="rounded p-2 text-blue-600 hover:bg-blue-50">
                      <TestTube className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Data & Retention */}
          {activeTab === 'retention' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">Data & Retention Policies</h2>
              {[
                { type: 'Alarms', retention: 90 },
                { type: 'KPIs', retention: 365 },
                { type: 'Audit Logs', retention: 2555 },
                { type: 'Automation History', retention: 180 }
              ].map(policy => (
                <div key={policy.type} className="rounded-lg border border-gray-200 bg-white p-6">
                  <h3 className="mb-4 font-semibold text-gray-900">{policy.type}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-semibold text-gray-700">Retention (days)</label>
                      <input type="number" defaultValue={policy.retention} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700">Storage Tier</label>
                      <select className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2">
                        <option>Hot</option>
                        <option>Warm</option>
                        <option>Cold</option>
                      </select>
                    </div>
                  </div>
                  <label className="mt-3 flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="h-4 w-4" />
                    <span className="text-sm text-gray-700">Enable Compression</span>
                  </label>
                </div>
              ))}
            </div>
          )}

          {/* Performance & Limits */}
          {activeTab === 'performance' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">Performance & Limits</h2>
              <div className="rounded-lg border border-gray-200 bg-white p-6">
                <div className="space-y-4">
                  {[
                    { label: 'Max API Requests/min', value: 1000 },
                    { label: 'Max Concurrent Automations', value: 50 },
                    { label: 'Max Concurrent Reports', value: 10 },
                    { label: 'Query Timeout (seconds)', value: 60 }
                  ].map(limit => (
                    <div key={limit.label}>
                      <label className="text-sm font-semibold text-gray-700">{limit.label}</label>
                      <input type="number" defaultValue={limit.value} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Notifications */}
          {activeTab === 'notifications' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">Notifications & Communication</h2>
              <div className="rounded-lg border border-gray-200 bg-white p-6">
                <h3 className="mb-4 font-semibold text-gray-900">Notification Channels</h3>
                {['Email', 'Slack', 'PagerDuty', 'Webhook'].map(channel => (
                  <div key={channel} className="flex items-center justify-between rounded-lg bg-gray-50 p-3 mb-2">
                    <span className="text-sm font-semibold text-gray-700">{channel}</span>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="peer h-6 w-11 rounded-full bg-gray-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-blue-600 peer-checked:after:translate-x-full"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Automation Guardrails */}
          {activeTab === 'automation' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">Automation Guardrails</h2>
              <div className="rounded-lg border border-gray-200 bg-white p-6">
                <div className="space-y-3">
                  {[
                    'Max Concurrent Automations',
                    'Mandatory Approval for Production',
                    'Max Objects per Automation',
                    'Mandatory Change Tracking',
                    'Automatic Rollback on Failure'
                  ].map(guardrail => (
                    <label key={guardrail} className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="h-4 w-4" />
                      <span className="text-sm font-semibold text-gray-700">{guardrail}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Environment & Deployment */}
          {activeTab === 'environment' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">Environment & Deployment</h2>
              {['Production', 'Staging', 'Lab'].map(env => (
                <div key={env} className="rounded-lg border border-gray-200 bg-white p-6">
                  <h3 className="mb-4 font-semibold text-gray-900">{env} Environment</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-semibold text-gray-700">Log Level</label>
                      <select className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2">
                        <option>Info</option>
                        <option>Debug</option>
                        <option>Error</option>
                      </select>
                    </div>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="h-4 w-4" />
                      <span className="text-sm text-gray-700">Enable Auto-scaling</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Backup & Recovery */}
          {activeTab === 'backup' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">Backup & Recovery</h2>
              {['Full Daily', 'Incremental Hourly', 'Database Snapshots'].map(policy => (
                <div key={policy} className="rounded-lg border border-gray-200 bg-white p-6">
                  <h3 className="mb-4 font-semibold text-gray-900">{policy} Backup</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-semibold text-gray-700">Retention (days)</label>
                      <input type="number" defaultValue={30} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" />
                    </div>
                    <button className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                      Run Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Branding & UI */}
          {activeTab === 'branding' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">Branding & UI Configuration</h2>
              <div className="rounded-lg border border-gray-200 bg-white p-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Platform Name</label>
                    <input type="text" defaultValue="OSS Platform" className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Primary Color</label>
                    <div className="mt-1 flex gap-2">
                      <input type="color" defaultValue="#2563eb" className="h-10 w-20 rounded-lg" />
                      <input type="text" defaultValue="#2563eb" className="flex-1 rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="h-4 w-4" />
                      <span className="text-sm text-gray-700">Dark Mode</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Audit & Change Control */}
          {activeTab === 'audit' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">Audit & Change Control</h2>
              <div className="rounded-lg border border-gray-200 bg-white p-6">
                <h3 className="mb-4 font-semibold text-gray-900">Recent Changes</h3>
                <div className="space-y-2">
                  {[
                    { user: 'Admin User', action: 'Modified Kill Switch', time: '2 hours ago', status: 'approved' },
                    { user: 'Integration Admin', action: 'Added Integration', time: '4 hours ago', status: 'approved' },
                    { user: 'Security Admin', action: 'Updated Rate Limit', time: '1 day ago', status: 'pending' }
                  ].map((entry, idx) => (
                    <div key={idx} className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                      <div className="text-sm">
                        <p className="font-semibold text-gray-900">{entry.action}</p>
                        <p className="text-xs text-gray-500">{entry.user} • {entry.time}</p>
                      </div>
                      <span className={`text-xs font-semibold px-2 py-1 rounded ${
                        entry.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {entry.status.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Permissions & Access */}
          {activeTab === 'permissions' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">Permissions & Access Control</h2>
              <div className="rounded-lg border border-gray-200 bg-white overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-6 py-3 text-left font-semibold text-gray-700">Role</th>
                      <th className="px-6 py-3 text-center font-semibold text-gray-700">View</th>
                      <th className="px-6 py-3 text-center font-semibold text-gray-700">Edit</th>
                      <th className="px-6 py-3 text-center font-semibold text-gray-700">Approve</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { role: 'Platform Admin', view: true, edit: true, approve: true },
                      { role: 'Security Admin', view: true, edit: true, approve: true },
                      { role: 'Integration Admin', view: true, edit: true, approve: false },
                      { role: 'Performance Admin', view: true, edit: true, approve: false },
                      { role: 'Settings Viewer', view: true, edit: false, approve: false }
                    ].map(row => (
                      <tr key={row.role} className="border-b border-gray-200">
                        <td className="px-6 py-3 font-semibold text-gray-900">{row.role}</td>
                        <td className="px-6 py-3 text-center">
                          {row.view ? <CheckCircle className="w-4 h-4 text-green-600 mx-auto" /> : <XCircle className="w-4 h-4 text-gray-400 mx-auto" />}
                        </td>
                        <td className="px-6 py-3 text-center">
                          {row.edit ? <CheckCircle className="w-4 h-4 text-green-600 mx-auto" /> : <XCircle className="w-4 h-4 text-gray-400 mx-auto" />}
                        </td>
                        <td className="px-6 py-3 text-center">
                          {row.approve ? <CheckCircle className="w-4 h-4 text-green-600 mx-auto" /> : <XCircle className="w-4 h-4 text-gray-400 mx-auto" />}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 flex gap-3 border-t border-gray-200 pt-6">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
            >
              <Save className="w-4 h-4" />
              Save Settings
            </button>
            <button className="flex items-center gap-2 rounded-lg bg-gray-200 px-6 py-2 text-gray-700 hover:bg-gray-300">
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
          </div>

          {savedStatus && (
            <div className="mt-4 rounded-lg bg-green-50 border border-green-200 p-4 text-green-700">
              ✓ {savedStatus}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
