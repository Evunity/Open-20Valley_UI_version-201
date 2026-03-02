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
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Download
} from 'lucide-react';

export default function Settings2() {
  const [activeTab, setActiveTab] = useState('system-config');
  const [savedStatus, setSavedStatus] = useState<string | null>(null);

  const handleSave = () => {
    setSavedStatus('Settings saved successfully');
    setTimeout(() => setSavedStatus(null), 3000);
  };

  const tabs = [
    { id: 'system-config', label: '1. System Configuration', icon: Settings },
    { id: 'module-config', label: '2. Module Configuration', icon: Sliders },
    { id: 'integration', label: '3. Integration Settings', icon: Zap },
    { id: 'data-retention', label: '4. Data & Retention', icon: Database },
    { id: 'performance', label: '5. Performance & Limits', icon: Gauge },
    { id: 'notifications', label: '6. Notifications', icon: Bell },
    { id: 'automation', label: '7. Automation Guardrails', icon: Shield },
    { id: 'environment', label: '8. Environment & Deploy', icon: Cloud },
    { id: 'backup', label: '9. Backup & Recovery', icon: RotateCcw },
    { id: 'branding', label: '10. Branding & UI', icon: Palette },
    { id: 'audit', label: '11. Audit & Control', icon: FileText },
    { id: 'permissions', label: '12. Permissions', icon: Lock }
  ];

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card px-8 py-8">
        <h1 className="text-4xl font-bold text-foreground">Settings Module</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">OSS-Level Master Specification - Platform Configuration, System Controls & Operational Guardrails</p>
      </div>

      {/* Tab Navigation - Horizontal Scrollable */}
      <div className="border-b border-border bg-card overflow-x-auto">
        <div className="flex px-8 min-w-max gap-1">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 border-b-2 px-4 py-4 text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
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
        <div className="p-8 max-w-6xl mx-auto">

          {/* 1. System Configuration */}
          {activeTab === 'system-config' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-foreground">1. System Configuration</h2>
              <p className="text-gray-600 dark:text-gray-400">Controls system-wide behavior and emergency controls</p>

              <div className="space-y-6">
                {/* General Platform Settings */}
                <div className="rounded-lg border border-border bg-card p-6">
                  <h3 className="mb-4 text-xl font-semibold text-foreground">4.1 General Platform Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 dark:text-gray-300 mb-2">System Name</label>
                      <input type="text" defaultValue="OSS Platform" className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-foreground" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 dark:text-gray-300 mb-2">Default Timezone</label>
                      <select className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-foreground">
                        <option>UTC</option>
                        <option>America/New_York</option>
                        <option>Europe/London</option>
                        <option>Asia/Tokyo</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 dark:text-gray-300 mb-2">System-wide Date/Time Format</label>
                      <select className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-foreground">
                        <option>YYYY-MM-DD HH:mm:ss</option>
                        <option>DD/MM/YYYY HH:mm:ss</option>
                        <option>MM/DD/YYYY HH:mm:ss</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 dark:text-gray-300 mb-2">Default Language</label>
                      <select className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-foreground">
                        <option>English</option>
                        <option>Spanish</option>
                        <option>French</option>
                        <option>German</option>
                      </select>
                    </div>
                    <div className="border-t border-border pt-4">
                      <label className="flex items-center gap-3 p-4 rounded-lg bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 cursor-pointer">
                        <input type="checkbox" className="h-4 w-4" />
                        <div>
                          <p className="font-semibold text-gray-900">System Maintenance Mode</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Prevents automation & script execution, allows read-only viewing</p>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Global Kill Switches */}
                <div className="rounded-lg border border-border bg-card p-6">
                  <h3 className="mb-4 text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    4.2 Global Kill Switches (Emergency Controls)
                  </h3>
                  <div className="space-y-3">
                    {[
                      { name: 'Disable all automation execution', risk: 'critical' },
                      { name: 'Disable command execution (Command Center)', risk: 'critical' },
                      { name: 'Disable report generation', risk: 'high' },
                      { name: 'Disable external exports', risk: 'high' },
                      { name: 'Force system read-only', risk: 'critical' }
                    ].map(sw => (
                      <div key={sw.name} className="flex items-center justify-between rounded-lg bg-gray-50 dark:bg-gray-800 dark:bg-gray-800 p-4">
                        <div>
                          <p className="font-semibold text-foreground">{sw.name}</p>
                          <p className={`text-xs font-semibold mt-1 ${sw.risk === 'critical' ? 'text-red-600' : 'text-orange-600'}`}>
                            Risk Level: {sw.risk.toUpperCase()}
                          </p>
                        </div>
                        <label className="relative inline-flex cursor-pointer items-center">
                          <input type="checkbox" className="sr-only peer" />
                          <div className="peer h-6 w-11 rounded-full bg-gray-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-red-600 peer-checked:after:translate-x-full"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. Module Configuration */}
          {activeTab === 'module-config' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-foreground">2. Module Configuration</h2>
              <p className="text-gray-600 dark:text-gray-400">Configure behavior for each platform module</p>

              {/* Alarm Module */}
              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="mb-4 text-xl font-semibold text-foreground">5.1 Alarm Module Settings</h3>
                <div className="space-y-4">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="h-4 w-4" />
                    <span className="font-semibold text-gray-700 dark:text-gray-300">Alarm correlation rules toggle</span>
                  </label>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Default alarm retention duration (days)</label>
                    <input type="number" defaultValue={90} className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Alarm storm detection thresholds</label>
                    <input type="number" defaultValue={100} className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2" placeholder="Alarms per minute" />
                  </div>
                </div>
              </div>

              {/* Analytics Module */}
              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="mb-4 text-xl font-semibold text-foreground">5.2 Analytics Module Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Default KPI aggregation window</label>
                    <select className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 bg-white dark:bg-gray-800 text-foreground">
                      <option>1m</option>
                      <option>5m</option>
                      <option>15m</option>
                      <option>1h</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Prediction confidence threshold (%)</label>
                    <input type="number" defaultValue={85} className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Anomaly detection sensitivity</label>
                    <select className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 bg-white dark:bg-gray-800 text-foreground">
                      <option>Low</option>
                      <option>Medium</option>
                      <option>High</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Automation Module */}
              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="mb-4 text-xl font-semibold text-foreground">5.3 Automation & AI Settings</h3>
                <div className="space-y-4">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="h-4 w-4" />
                    <span className="font-semibold text-gray-700 dark:text-gray-300">Autonomous mode enabled</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="h-4 w-4" />
                    <span className="font-semibold text-gray-700 dark:text-gray-300">Mandatory approval required</span>
                  </label>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Max objects per automation run</label>
                    <input type="number" defaultValue={1000} className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Allowed automation hours</label>
                    <input type="text" defaultValue="06:00-22:00" placeholder="HH:MM-HH:MM" className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2" />
                  </div>
                </div>
              </div>

              {/* Topology Settings */}
              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="mb-4 text-xl font-semibold text-foreground">5.4 Topology Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Default map view</label>
                    <select className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 bg-white dark:bg-gray-800 text-foreground">
                      <option>Map</option>
                      <option>Tree</option>
                      <option>Logical</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Max objects rendered per view</label>
                    <input type="number" defaultValue={5000} className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Historical replay retention period (days)</label>
                    <input type="number" defaultValue={30} className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2" />
                  </div>
                </div>
              </div>

              {/* Reports Settings */}
              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="mb-4 text-xl font-semibold text-foreground">5.5 Reports Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Default export format</label>
                    <select className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 bg-white dark:bg-gray-800 text-foreground">
                      <option>PDF</option>
                      <option>Excel</option>
                      <option>CSV</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Max scheduled reports per tenant</label>
                    <input type="number" defaultValue={50} className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2" />
                  </div>
                </div>
              </div>

              {/* Command Center Settings */}
              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="mb-4 text-xl font-semibold text-foreground">5.6 Command Center Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Max bulk execution size</label>
                    <input type="number" defaultValue={500} className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Command rate limits (commands/min)</label>
                    <input type="number" defaultValue={100} className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2" />
                  </div>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="h-4 w-4" />
                    <span className="font-semibold text-gray-700 dark:text-gray-300">Mandatory change ticket enforcement</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="h-4 w-4" />
                    <span className="font-semibold text-gray-700 dark:text-gray-300">High-risk parameter dual approval</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* 3. Integration Settings */}
          {activeTab === 'integration' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-900">3. Integration Settings</h2>
              <p className="text-gray-600 dark:text-gray-400">Configure external system connections</p>

              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="mb-4 text-xl font-semibold text-foreground">6.1 Northbound Integrations</h3>
                <div className="mb-6 space-y-3">
                  {['ServiceNow ITSM', 'Splunk SIEM', 'Email Server', 'Webhook Endpoint'].map(int => (
                    <div key={int} className="flex items-center justify-between rounded-lg bg-gray-50 dark:bg-gray-800 p-4">
                      <div>
                        <p className="font-semibold text-gray-900">{int}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">Status: Configured</p>
                      </div>
                      <button className="rounded px-3 py-1 text-sm text-blue-600 hover:bg-blue-50">Edit</button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="mb-4 text-xl font-semibold text-foreground">6.2 Southbound Integrations (Network)</h3>
                <div className="space-y-3">
                  {['SNMP', 'NETCONF', 'SSH', 'REST'].map(proto => (
                    <div key={proto} className="flex items-center justify-between rounded-lg bg-gray-50 dark:bg-gray-800 p-4">
                      <div>
                        <p className="font-semibold text-gray-900">{proto} Protocol Adapter</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">Status: Active</p>
                      </div>
                      <button className="rounded px-3 py-1 text-sm text-blue-600 hover:bg-blue-50">Configure</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 4. Data & Retention */}
          {activeTab === 'data-retention' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-900">4. Data & Retention Policies</h2>
              <p className="text-gray-600 dark:text-gray-400">Control how long data is stored</p>

              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="mb-4 text-xl font-semibold text-foreground">7.1 Data Retention</h3>
                <div className="space-y-4">
                  {['Alarms', 'KPIs', 'Logs', 'Audit Records', 'Automation History', 'Command Execution Logs', 'Report Snapshots'].map(dataType => (
                    <div key={dataType} className="grid grid-cols-3 gap-4 rounded-lg bg-gray-50 dark:bg-gray-800 p-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{dataType}</p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 dark:text-gray-400">Retention (days)</label>
                        <input type="number" defaultValue={90} className="mt-1 w-full rounded border border-gray-300 dark:border-gray-600 px-3 py-1 text-sm bg-white dark:bg-gray-800 text-foreground" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 dark:text-gray-400">Storage Tier</label>
                        <select className="mt-1 w-full rounded border border-gray-300 dark:border-gray-600 px-3 py-1 text-sm bg-white dark:bg-gray-800 text-foreground">
                          <option>Hot</option>
                          <option>Warm</option>
                          <option>Cold</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="mb-4 text-xl font-semibold text-foreground">7.2 Data Archiving</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Archive frequency</label>
                    <select className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 bg-white dark:bg-gray-800 text-foreground">
                      <option>Daily</option>
                      <option>Weekly</option>
                      <option>Monthly</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Archive storage location</label>
                    <input type="text" defaultValue="s3://backups/archive" className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 bg-white dark:bg-gray-800 text-foreground" />
                  </div>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="h-4 w-4" />
                    <span className="font-semibold text-gray-700 dark:text-gray-300">Archive encryption policy enabled</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* 5. Performance & Limits */}
          {activeTab === 'performance' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-900">5. Performance & System Limits</h2>
              <p className="text-gray-600 dark:text-gray-400">Prevent abuse or overload</p>

              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="mb-4 text-xl font-semibold text-foreground">8.1 Resource Limits</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Max concurrent automations</label>
                    <input type="number" defaultValue={50} className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Max concurrent reports</label>
                    <input type="number" defaultValue={10} className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Max concurrent scripts</label>
                    <input type="number" defaultValue={20} className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Max users per tenant</label>
                    <input type="number" defaultValue={1000} className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Max API requests per minute</label>
                    <input type="number" defaultValue={1000} className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2" />
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="mb-4 text-xl font-semibold text-foreground">8.2 Load Protection</h3>
                <div className="space-y-4">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="h-4 w-4" />
                    <span className="font-semibold text-gray-700 dark:text-gray-300">Rate limiting enabled</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="h-4 w-4" />
                    <span className="font-semibold text-gray-700 dark:text-gray-300">API throttling enabled</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="h-4 w-4" />
                    <span className="font-semibold text-gray-700 dark:text-gray-300">Heavy query detection</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="h-4 w-4" />
                    <span className="font-semibold text-gray-700 dark:text-gray-300">Automatic slow query logging</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* 6. Notifications */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-foreground">6. Notifications & Communication Settings</h2>
              <p className="text-gray-600 dark:text-gray-400">Define how the system communicates</p>

              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="mb-4 text-xl font-semibold text-foreground">9.1 Notification Channels</h3>
                <div className="space-y-3">
                  {['Email', 'SMS', 'In-app Notification', 'Webhook', 'Push'].map(channel => (
                    <div key={channel} className="flex items-center justify-between rounded-lg bg-gray-50 dark:bg-gray-800 p-4">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">{channel}</span>
                      <label className="relative inline-flex cursor-pointer items-center">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="peer h-6 w-11 rounded-full bg-gray-300 dark:bg-gray-600 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-blue-600 dark:peer-checked:bg-blue-500 peer-checked:after:translate-x-full"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="mb-4 text-xl font-semibold text-foreground">9.2 Alert/Notification Routing Defaults</h3>
                <div className="space-y-3">
                  {[
                    { alert: 'Critical alarms', route: 'NOC Team' },
                    { alert: 'Automation failure', route: 'Automation Team' },
                    { alert: 'Report failure', route: 'Report Owner' },
                    { alert: 'Security violation', route: 'Security Team' }
                  ].map(rule => (
                    <div key={rule.alert} className="grid grid-cols-2 gap-4 rounded-lg bg-gray-50 dark:bg-gray-800 p-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{rule.alert}</p>
                      </div>
                      <select className="rounded border border-gray-300 px-3 py-2 text-sm">
                        <option>{rule.route}</option>
                        <option>All Team</option>
                        <option>On-Call</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 7. Automation Guardrails */}
          {activeTab === 'automation' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-900">7. Automation Guardrails</h2>
              <p className="text-gray-600 dark:text-gray-400">System-wide safety rules stronger than tenant-level rules</p>

              <div className="rounded-lg border border-border bg-card p-6">
                <div className="space-y-4">
                  <label className="flex items-center gap-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <input type="checkbox" defaultChecked className="h-4 w-4" />
                    <span className="font-semibold text-gray-700 dark:text-gray-300">No automation during blackout windows</span>
                  </label>
                  <label className="flex items-center gap-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <input type="checkbox" defaultChecked className="h-4 w-4" />
                    <span className="font-semibold text-gray-700 dark:text-gray-300">No RF parameter changes during peak traffic hours</span>
                  </label>
                  <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Max blast radius threshold before approval required</label>
                    <input type="number" defaultValue={100} className="mt-2 w-full rounded border border-gray-300 px-3 py-2" />
                  </div>
                  <label className="flex items-center gap-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <input type="checkbox" defaultChecked className="h-4 w-4" />
                    <span className="font-semibold text-gray-700 dark:text-gray-300">Auto-pause automation if alarm spike detected</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* 8. Environment & Deployment */}
          {activeTab === 'environment' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-900">8. Environment & Deployment Settings</h2>
              <p className="text-gray-600 dark:text-gray-400">Control deployment modes and feature flags</p>

              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="mb-4 text-xl font-semibold text-foreground">11.1 Feature Flags</h3>
                <div className="space-y-3">
                  {['AI experimental features', 'New topology rendering engine', 'Beta report builder', 'Advanced scripting mode'].map(flag => (
                    <div key={flag} className="flex items-center justify-between rounded-lg bg-gray-50 dark:bg-gray-800 p-4">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">{flag}</span>
                      <label className="relative inline-flex cursor-pointer items-center">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="peer h-6 w-11 rounded-full bg-gray-300 dark:bg-gray-600 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-blue-600 dark:peer-checked:bg-blue-500 peer-checked:after:translate-x-full"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 9. Backup & Recovery */}
          {activeTab === 'backup' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-900">9. Backup & Recovery Settings</h2>
              <p className="text-gray-600 dark:text-gray-400">Define recovery behavior and backup policies</p>

              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="mb-4 text-xl font-semibold text-foreground">12.1 Backup Configuration</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Backup frequency</label>
                    <select className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 bg-white dark:bg-gray-800 text-foreground">
                      <option>Hourly</option>
                      <option>Daily</option>
                      <option>Weekly</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Backup location</label>
                    <input type="text" defaultValue="s3://backups/prod" className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Retention of backups (days)</label>
                    <input type="number" defaultValue={30} className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2" />
                  </div>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="h-4 w-4" />
                    <span className="font-semibold text-gray-700 dark:text-gray-300">Encryption enabled</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="h-4 w-4" />
                    <span className="font-semibold text-gray-700 dark:text-gray-300">Cross-region replication</span>
                  </label>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="mb-4 text-xl font-semibold text-foreground">12.2 Disaster Recovery Mode</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Secondary site configuration</label>
                    <input type="text" defaultValue="dr-site-us-west" className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2" />
                  </div>
                  <button className="rounded-lg bg-red-600 px-6 py-2 text-white hover:bg-red-700">Manual Failover (Admin Only)</button>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="h-4 w-4" />
                    <span className="font-semibold text-gray-700 dark:text-gray-300">DR testing mode</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* 10. Branding & UI */}
          {activeTab === 'branding' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-900">10. Branding & UI Customization</h2>
              <p className="text-gray-600 dark:text-gray-400">Configure platform branding and UI settings</p>

              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="mb-4 text-xl font-semibold text-foreground">13. Branding & UI Customization</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Logo</label>
                    <input type="text" defaultValue="/logo.png" className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Theme color</label>
                    <div className="mt-1 flex gap-3">
                      <input type="color" defaultValue="#2563eb" className="h-10 w-20 rounded-lg" />
                      <input type="text" defaultValue="#2563eb" className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-mono" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Environment warning banner</label>
                    <input type="text" defaultValue="PRODUCTION" className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2" placeholder="e.g., PRODUCTION" />
                  </div>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="h-4 w-4" />
                    <span className="font-semibold text-gray-700 dark:text-gray-300">Show environment warning banner</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* 11. Audit & Change Control */}
          {activeTab === 'audit' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-900">11. Audit & Change Control</h2>
              <p className="text-gray-600 dark:text-gray-400">Track all setting changes with full audit trail</p>

              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="mb-4 text-xl font-semibold text-foreground">14. Settings Audit & Change Control</h3>
                <div className="mb-6 space-y-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Every setting change logs:</p>
                  <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300 list-disc list-inside">
                    <li>Who changed it</li>
                    <li>Old value</li>
                    <li>New value</li>
                    <li>Timestamp</li>
                    <li>Environment</li>
                    <li>Justification (if required)</li>
                  </ul>
                </div>

                <h4 className="mb-4 font-semibold text-gray-900">Recent Changes</h4>
                <div className="space-y-2">
                  {[
                    { user: 'Admin User', action: 'Modified System Name', time: '2 hours ago', status: 'approved' },
                    { user: 'Integration Admin', action: 'Added Integration', time: '4 hours ago', status: 'approved' },
                    { user: 'Security Admin', action: 'Updated Kill Switch', time: '1 day ago', status: 'pending' }
                  ].map((entry, idx) => (
                    <div key={idx} className="flex items-center justify-between rounded-lg bg-gray-50 dark:bg-gray-800 p-3">
                      <div className="text-sm">
                        <p className="font-semibold text-foreground">{entry.action}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">{entry.user} • {entry.time}</p>
                      </div>
                      <span className={`text-xs font-semibold px-2 py-1 rounded ${
                        entry.status === 'approved' ? 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300' : 'bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300'
                      }`}>
                        {entry.status.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 12. Permissions & Access */}
          {activeTab === 'permissions' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-foreground">12. Permissions & Access Control</h2>
              <p className="text-gray-600 dark:text-gray-400">Granular admin role permissions for settings</p>

              <div className="rounded-lg border border-border bg-card overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-gray-50 dark:bg-gray-800">
                      <th className="px-6 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Role</th>
                      <th className="px-6 py-3 text-center font-semibold text-gray-700 dark:text-gray-300">View</th>
                      <th className="px-6 py-3 text-center font-semibold text-gray-700 dark:text-gray-300">Edit</th>
                      <th className="px-6 py-3 text-center font-semibold text-gray-700 dark:text-gray-300">Approve</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { role: 'Platform Admin', view: true, edit: true, approve: true },
                      { role: 'Security Admin', view: true, edit: true, approve: true },
                      { role: 'Integration Admin', view: true, edit: true, approve: false },
                      { role: 'Performance Admin', view: true, edit: true, approve: false },
                      { role: 'Read-Only Settings Viewer', view: true, edit: false, approve: false }
                    ].map(row => (
                      <tr key={row.role} className="border-b border-border">
                        <td className="px-6 py-3 font-semibold text-foreground">{row.role}</td>
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
          <div className="mt-12 flex gap-3 border-t border-border pt-6">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
            >
              <Save className="w-4 h-4" />
              Save Settings
            </button>
            <button className="flex items-center gap-2 rounded-lg bg-gray-200 dark:bg-gray-700 px-6 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600">
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
          </div>

          {savedStatus && (
            <div className="mt-4 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 p-4 text-green-700 dark:text-green-300 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              {savedStatus}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
