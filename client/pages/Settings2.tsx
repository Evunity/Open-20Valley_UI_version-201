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

  // System Configuration State
  const [systemConfig, setSystemConfig] = useState({
    systemName: 'OSS Platform',
    timezone: 'UTC',
    dateFormat: 'YYYY-MM-DD HH:mm:ss',
    language: 'English',
    maintenanceMode: false
  });

  // Integration State
  const [northboundIntegrations, setNorthboundIntegrations] = useState({
    'ServiceNow ITSM': { status: 'Configured', apiKey: '', endpoint: '', enabled: true },
    'Splunk SIEM': { status: 'Configured', apiKey: '', endpoint: '', enabled: true },
    'Email Server': { status: 'Configured', apiKey: '', endpoint: '', enabled: true },
    'Webhook Endpoint': { status: 'Configured', apiKey: '', endpoint: '', enabled: true }
  });

  const [southboundIntegrations, setSouthboundIntegrations] = useState({
    'SNMP': { status: 'Active', community: 'public', port: 161, enabled: true },
    'NETCONF': { status: 'Active', port: 830, username: '', enabled: true },
    'SSH': { status: 'Active', port: 22, username: '', enabled: true },
    'REST': { status: 'Active', endpoint: '', port: 8080, enabled: true }
  });

  const [editingIntegration, setEditingIntegration] = useState<{ type: 'northbound' | 'southbound', name: string } | null>(null);

  const handleConfigChange = (field: string, value: any) => {
    setSystemConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    // Save system config to localStorage
    localStorage.setItem('systemConfig', JSON.stringify(systemConfig));
    setSavedStatus('Settings saved successfully');
    setTimeout(() => setSavedStatus(null), 3000);
  };

  const handleEditNorthbound = (name: string) => {
    setEditingIntegration({ type: 'northbound', name });
  };

  const handleConfigureSouthbound = (name: string) => {
    setEditingIntegration({ type: 'southbound', name });
  };

  const handleUpdateIntegration = (field: string, value: any) => {
    if (!editingIntegration) return;

    if (editingIntegration.type === 'northbound') {
      setNorthboundIntegrations(prev => ({
        ...prev,
        [editingIntegration.name]: {
          ...prev[editingIntegration.name as keyof typeof prev],
          [field]: value
        }
      }));
    } else {
      setSouthboundIntegrations(prev => ({
        ...prev,
        [editingIntegration.name]: {
          ...prev[editingIntegration.name as keyof typeof prev],
          [field]: value
        }
      }));
    }
  };

  const handleCloseModal = () => {
    setEditingIntegration(null);
  };

  const handleSaveIntegration = async () => {
    if (!editingIntegration) return;

    try {
      const config = editingIntegration.type === 'northbound'
        ? northboundIntegrations[editingIntegration.name as keyof typeof northboundIntegrations]
        : southboundIntegrations[editingIntegration.name as keyof typeof southboundIntegrations];

      // Save to backend
      const response = await fetch('/api/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: editingIntegration.type,
          name: editingIntegration.name,
          config
        })
      });

      if (response.ok) {
        setSavedStatus(`${editingIntegration.name} saved successfully`);
        setTimeout(() => setSavedStatus(null), 3000);
        handleCloseModal();
      }
    } catch (error) {
      console.error('Failed to save integration:', error);
    }
  };

  const tabs = [
    { id: 'system-config', label: 'System Configuration', icon: Settings },
    { id: 'module-config', label: 'Module Configuration', icon: Sliders },
    { id: 'integration', label: 'Integration Settings', icon: Zap },
    { id: 'data-retention', label: 'Data & Retention', icon: Database },
    { id: 'performance', label: 'Performance & Limits', icon: Gauge },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'automation', label: 'Automation Guardrails', icon: Shield },
    { id: 'environment', label: 'Environment & Deploy', icon: Cloud },
    { id: 'backup', label: 'Backup & Recovery', icon: RotateCcw },
    { id: 'branding', label: 'Branding & UI', icon: Palette },
    { id: 'audit', label: 'Audit & Control', icon: FileText },
    { id: 'permissions', label: 'Permissions', icon: Lock }
  ];

  return (
    <div className="settings-theme-fix flex h-full flex-col bg-background">
      {/* Tab Navigation - Horizontal Scrollable */}
      <div className="border-b border-border bg-card overflow-x-auto">
        <div className="flex px-6 min-w-max gap-1">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
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
        <div className="p-2 md:p-2 max-w-full">

          {/* 1. System Configuration */}
          {activeTab === 'system-config' && (
            <div className="space-y-2">
              <div className="space-y-2">
                {/* General Platform Settings */}
                <div className="rounded-lg border border-border bg-card p-4">
                  <h3 className="mb-2 text-xl font-semibold text-foreground">General Platform Settings</h3>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">System Name</label>
                      <input
                        type="text"
                        value={systemConfig.systemName}
                        onChange={(e) => handleConfigChange('systemName', e.target.value)}
                        className="w-full rounded-lg border border-border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 bg-card text-foreground"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">Default Timezone</label>
                      <select
                        value={systemConfig.timezone}
                        onChange={(e) => handleConfigChange('timezone', e.target.value)}
                        className="w-full rounded-lg border border-border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 bg-card text-foreground"
                      >
                        <option>UTC</option>
                        <option>America/New_York</option>
                        <option>Europe/London</option>
                        <option>Asia/Tokyo</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">System-wide Date/Time Format</label>
                      <select
                        value={systemConfig.dateFormat}
                        onChange={(e) => handleConfigChange('dateFormat', e.target.value)}
                        className="w-full rounded-lg border border-border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 bg-card text-foreground"
                      >
                        <option>YYYY-MM-DD HH:mm:ss</option>
                        <option>DD/MM/YYYY HH:mm:ss</option>
                        <option>MM/DD/YYYY HH:mm:ss</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">Default Language</label>
                      <select
                        value={systemConfig.language}
                        onChange={(e) => handleConfigChange('language', e.target.value)}
                        className="w-full rounded-lg border border-border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 bg-card text-foreground"
                      >
                        <option>English</option>
                        <option>Spanish</option>
                        <option>French</option>
                        <option>German</option>
                      </select>
                    </div>
                    <div className="border-t border-border pt-2">
                      <label className="flex items-center gap-3 p-4 rounded-lg bg-muted border border-border cursor-pointer">
                        <input
                          type="checkbox"
                          checked={systemConfig.maintenanceMode}
                          onChange={(e) => handleConfigChange('maintenanceMode', e.target.checked)}
                          className="h-4 w-4"
                        />
                        <div>
                          <p className="font-semibold text-foreground">System Maintenance Mode</p>
                          <p className="text-sm text-muted-foreground">Prevents automation & script execution, allows read-only viewing</p>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* 2. Module Configuration */}
          {activeTab === 'module-config' && (
            <div className="space-y-2">
              {/* Alarm Module */}
              <div className="rounded-lg border border-border bg-card p-4">
                <h3 className="mb-2 text-xl font-semibold text-foreground">Alarm Module Settings</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="h-4 w-4" />
                    <span className="font-semibold text-foreground">Alarm correlation rules toggle</span>
                  </label>
                  <div>
                    <label className="text-sm font-semibold text-foreground">Default alarm retention duration (days)</label>
                    <input type="number" defaultValue={90} className="mt-1 w-full rounded-lg border border-border px-4 py-2" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-foreground">Alarm storm detection thresholds</label>
                    <input type="number" defaultValue={100} className="mt-1 w-full rounded-lg border border-border px-4 py-2" placeholder="Alarms per minute" />
                  </div>
                </div>
              </div>

              {/* Analytics Module */}
              <div className="rounded-lg border border-border bg-card p-4">
                <h3 className="mb-2 text-xl font-semibold text-foreground">Analytics Module Settings</h3>
                <div className="space-y-2">
                  <div>
                    <label className="text-sm font-semibold text-foreground">Default KPI aggregation window</label>
                    <select className="mt-1 w-full rounded-lg border border-border px-4 py-2 bg-card text-foreground">
                      <option>1m</option>
                      <option>5m</option>
                      <option>15m</option>
                      <option>1h</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-foreground">Prediction confidence threshold (%)</label>
                    <input type="number" defaultValue={85} className="mt-1 w-full rounded-lg border border-border px-4 py-2" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-foreground">Anomaly detection sensitivity</label>
                    <select className="mt-1 w-full rounded-lg border border-border px-4 py-2 bg-card text-foreground">
                      <option>Low</option>
                      <option>Medium</option>
                      <option>High</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Automation Module */}
              <div className="rounded-lg border border-border bg-card p-4">
                <h3 className="mb-2 text-xl font-semibold text-foreground">Automation & AI Settings</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="h-4 w-4" />
                    <span className="font-semibold text-foreground">Autonomous mode enabled</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="h-4 w-4" />
                    <span className="font-semibold text-foreground">Mandatory approval required</span>
                  </label>
                  <div>
                    <label className="text-sm font-semibold text-foreground">Max objects per automation run</label>
                    <input type="number" defaultValue={1000} className="mt-1 w-full rounded-lg border border-border px-4 py-2" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-foreground">Allowed automation hours</label>
                    <input type="text" defaultValue="06:00-22:00" placeholder="HH:MM-HH:MM" className="mt-1 w-full rounded-lg border border-border px-4 py-2" />
                  </div>
                </div>
              </div>

              {/* Topology Settings */}
              <div className="rounded-lg border border-border bg-card p-4">
                <h3 className="mb-2 text-xl font-semibold text-foreground">Topology Settings</h3>
                <div className="space-y-2">
                  <div>
                    <label className="text-sm font-semibold text-foreground">Default map view</label>
                    <select className="mt-1 w-full rounded-lg border border-border px-4 py-2 bg-card text-foreground">
                      <option>Map</option>
                      <option>Tree</option>
                      <option>Logical</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-foreground">Max objects rendered per view</label>
                    <input type="number" defaultValue={5000} className="mt-1 w-full rounded-lg border border-border px-4 py-2" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-foreground">Historical replay retention period (days)</label>
                    <input type="number" defaultValue={30} className="mt-1 w-full rounded-lg border border-border px-4 py-2" />
                  </div>
                </div>
              </div>

              {/* Reports Settings */}
              <div className="rounded-lg border border-border bg-card p-4">
                <h3 className="mb-2 text-xl font-semibold text-foreground">Reports Settings</h3>
                <div className="space-y-2">
                  <div>
                    <label className="text-sm font-semibold text-foreground">Default export format</label>
                    <select className="mt-1 w-full rounded-lg border border-border px-4 py-2 bg-card text-foreground">
                      <option>PDF</option>
                      <option>Excel</option>
                      <option>CSV</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-foreground">Max scheduled reports per tenant</label>
                    <input type="number" defaultValue={50} className="mt-1 w-full rounded-lg border border-border px-4 py-2" />
                  </div>
                </div>
              </div>

              {/* Command Center Settings */}
              <div className="rounded-lg border border-border bg-card p-4">
                <h3 className="mb-2 text-xl font-semibold text-foreground">Command Center Settings</h3>
                <div className="space-y-2">
                  <div>
                    <label className="text-sm font-semibold text-foreground">Max bulk execution size</label>
                    <input type="number" defaultValue={500} className="mt-1 w-full rounded-lg border border-border px-4 py-2" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-foreground">Command rate limits (commands/min)</label>
                    <input type="number" defaultValue={100} className="mt-1 w-full rounded-lg border border-border px-4 py-2" />
                  </div>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="h-4 w-4" />
                    <span className="font-semibold text-foreground">Mandatory change ticket enforcement</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="h-4 w-4" />
                    <span className="font-semibold text-foreground">High-risk parameter dual approval</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* 3. Integration Settings */}
          {activeTab === 'integration' && (
            <div className="space-y-2">
              <div className="rounded-lg border border-border bg-card p-4">
                <h3 className="mb-2 text-xl font-semibold text-foreground">Northbound Integrations</h3>
                <div className="mb-6 space-y-3">
                  {Object.entries(northboundIntegrations).map(([int, config]) => (
                    <div key={int} className="flex items-center justify-between rounded-lg bg-muted p-4">
                      <div>
                        <p className="font-semibold text-foreground">{int}</p>
                        <p className="text-xs text-muted-foreground">Status: {config.status}</p>
                      </div>
                      <button
                        onClick={() => handleEditNorthbound(int)}
                        className="rounded px-3 py-1 text-sm text-primary hover:bg-primary/5 font-medium"
                      >
                        Edit
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-border bg-card p-4">
                <h3 className="mb-2 text-xl font-semibold text-foreground">Southbound Integrations (Network)</h3>
                <div className="space-y-3">
                  {Object.entries(southboundIntegrations).map(([proto, config]) => (
                    <div key={proto} className="flex items-center justify-between rounded-lg bg-muted p-4">
                      <div>
                        <p className="font-semibold text-foreground">{proto} Protocol Adapter</p>
                        <p className="text-xs text-muted-foreground">Status: {config.status}</p>
                      </div>
                      <button
                        onClick={() => handleConfigureSouthbound(proto)}
                        className="rounded px-3 py-1 text-sm text-primary hover:bg-primary/5 font-medium"
                      >
                        Configure
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Integration Edit/Configure Modal */}
              {editingIntegration && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div className="bg-card border border-border rounded-lg shadow-lg max-w-md w-full p-6 max-h-96 overflow-y-auto">
                    <h2 className="text-xl font-bold text-foreground mb-4">
                      {editingIntegration.type === 'northbound' ? 'Edit ' : 'Configure '}{editingIntegration.name}
                    </h2>

                    {editingIntegration.type === 'northbound' ? (
                      // Northbound integration form
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-semibold text-foreground block mb-1">API Endpoint</label>
                          <input
                            type="text"
                            placeholder="https://api.example.com"
                            value={northboundIntegrations[editingIntegration.name as keyof typeof northboundIntegrations].endpoint}
                            onChange={(e) => handleUpdateIntegration('endpoint', e.target.value)}
                            className="w-full rounded border border-border px-3 py-2 bg-background text-foreground text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-foreground block mb-1">API Key</label>
                          <input
                            type="password"
                            placeholder="••••••••"
                            value={northboundIntegrations[editingIntegration.name as keyof typeof northboundIntegrations].apiKey}
                            onChange={(e) => handleUpdateIntegration('apiKey', e.target.value)}
                            className="w-full rounded border border-border px-3 py-2 bg-background text-foreground text-sm"
                          />
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={northboundIntegrations[editingIntegration.name as keyof typeof northboundIntegrations].enabled}
                            onChange={(e) => handleUpdateIntegration('enabled', e.target.checked)}
                            className="h-4 w-4"
                          />
                          <span className="text-sm font-medium text-foreground">Enabled</span>
                        </label>
                      </div>
                    ) : (
                      // Southbound integration form
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-semibold text-foreground block mb-1">Port</label>
                          <input
                            type="number"
                            value={southboundIntegrations[editingIntegration.name as keyof typeof southboundIntegrations].port}
                            onChange={(e) => handleUpdateIntegration('port', parseInt(e.target.value))}
                            className="w-full rounded border border-border px-3 py-2 bg-background text-foreground text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-foreground block mb-1">Username</label>
                          <input
                            type="text"
                            placeholder="admin"
                            value={southboundIntegrations[editingIntegration.name as keyof typeof southboundIntegrations].username || ''}
                            onChange={(e) => handleUpdateIntegration('username', e.target.value)}
                            className="w-full rounded border border-border px-3 py-2 bg-background text-foreground text-sm"
                          />
                        </div>
                        {editingIntegration.name === 'SNMP' && (
                          <div>
                            <label className="text-sm font-semibold text-foreground block mb-1">Community String</label>
                            <input
                              type="text"
                              value={southboundIntegrations[editingIntegration.name as keyof typeof southboundIntegrations].community || ''}
                              onChange={(e) => handleUpdateIntegration('community', e.target.value)}
                              className="w-full rounded border border-border px-3 py-2 bg-background text-foreground text-sm"
                            />
                          </div>
                        )}
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={southboundIntegrations[editingIntegration.name as keyof typeof southboundIntegrations].enabled}
                            onChange={(e) => handleUpdateIntegration('enabled', e.target.checked)}
                            className="h-4 w-4"
                          />
                          <span className="text-sm font-medium text-foreground">Enabled</span>
                        </label>
                      </div>
                    )}

                    <div className="flex gap-2 mt-6">
                      <button
                        onClick={handleSaveIntegration}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded px-4 py-2 text-sm font-medium"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCloseModal}
                        className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-foreground rounded px-4 py-2 text-sm font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 4. Data & Retention */}
          {activeTab === 'data-retention' && (
            <div className="space-y-2">
              <div className="rounded-lg border border-border bg-card p-4">
                <h3 className="mb-2 text-xl font-semibold text-foreground">Data Retention</h3>
                <div className="space-y-2">
                  {['Alarms', 'KPIs', 'Logs', 'Audit Records', 'Automation History', 'Command Execution Logs', 'Report Snapshots'].map(dataType => (
                    <div key={dataType} className="grid grid-cols-3 gap-4 rounded-lg bg-muted p-4">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{dataType}</p>
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Retention (days)</label>
                        <input type="number" defaultValue={90} className="mt-1 w-full rounded border border-border px-3 py-1 text-sm bg-card text-foreground" />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Storage Tier</label>
                        <select className="mt-1 w-full rounded border border-border px-3 py-1 text-sm bg-card text-foreground">
                          <option>Hot</option>
                          <option>Warm</option>
                          <option>Cold</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-border bg-card p-4">
                <h3 className="mb-2 text-xl font-semibold text-foreground">Data Archiving</h3>
                <div className="space-y-2">
                  <div>
                    <label className="text-sm font-semibold text-foreground">Archive frequency</label>
                    <select className="mt-1 w-full rounded-lg border border-border px-4 py-2 bg-card text-foreground">
                      <option>Daily</option>
                      <option>Weekly</option>
                      <option>Monthly</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-foreground">Archive storage location</label>
                    <input type="text" defaultValue="s3://backups/archive" className="mt-1 w-full rounded-lg border border-border px-4 py-2 bg-card text-foreground" />
                  </div>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="h-4 w-4" />
                    <span className="font-semibold text-foreground">Archive encryption policy enabled</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* 5. Performance & Limits */}
          {activeTab === 'performance' && (
            <div className="space-y-2">
              <div className="rounded-lg border border-border bg-card p-4">
                <h3 className="mb-2 text-xl font-semibold text-foreground">Resource Limits</h3>
                <div className="space-y-2">
                  <div>
                    <label className="text-sm font-semibold text-foreground">Max concurrent automations</label>
                    <input type="number" defaultValue={50} className="mt-1 w-full rounded-lg border border-border px-4 py-2" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-foreground">Max concurrent reports</label>
                    <input type="number" defaultValue={10} className="mt-1 w-full rounded-lg border border-border px-4 py-2" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-foreground">Max concurrent scripts</label>
                    <input type="number" defaultValue={20} className="mt-1 w-full rounded-lg border border-border px-4 py-2" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-foreground">Max users per tenant</label>
                    <input type="number" defaultValue={1000} className="mt-1 w-full rounded-lg border border-border px-4 py-2" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-foreground">Max API requests per minute</label>
                    <input type="number" defaultValue={1000} className="mt-1 w-full rounded-lg border border-border px-4 py-2" />
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-card p-4">
                <h3 className="mb-2 text-xl font-semibold text-foreground">Load Protection</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="h-4 w-4" />
                    <span className="font-semibold text-foreground">Rate limiting enabled</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="h-4 w-4" />
                    <span className="font-semibold text-foreground">API throttling enabled</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="h-4 w-4" />
                    <span className="font-semibold text-foreground">Heavy query detection</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="h-4 w-4" />
                    <span className="font-semibold text-foreground">Automatic slow query logging</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* 6. Notifications */}
          {activeTab === 'notifications' && (
            <div className="space-y-2">
              <div className="rounded-lg border border-border bg-card p-4">
                <h3 className="mb-2 text-xl font-semibold text-foreground">Notification Channels</h3>
                <div className="space-y-3">
                  {['Email', 'SMS', 'In-app Notification', 'Webhook', 'Push'].map(channel => (
                    <div key={channel} className="flex items-center justify-between rounded-lg bg-muted p-4">
                      <span className="font-semibold text-foreground">{channel}</span>
                      <label className="relative inline-flex cursor-pointer items-center">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="peer h-6 w-11 rounded-full bg-muted after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-primary peer-checked:after:translate-x-full"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-border bg-card p-4">
                <h3 className="mb-2 text-xl font-semibold text-foreground">Alert/Notification Routing Defaults</h3>
                <div className="space-y-3">
                  {[
                    { alert: 'Critical alarms', route: 'NOC Team' },
                    { alert: 'Automation failure', route: 'Automation Team' },
                    { alert: 'Report failure', route: 'Report Owner' },
                    { alert: 'Security violation', route: 'Security Team' }
                  ].map(rule => (
                    <div key={rule.alert} className="grid grid-cols-2 gap-4 rounded-lg bg-muted p-4">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{rule.alert}</p>
                      </div>
                      <select className="rounded border border-border px-3 py-2 text-sm">
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
            <div className="space-y-2">
              <div className="rounded-lg border border-border bg-card p-4">
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-4 rounded-lg bg-muted">
                    <input type="checkbox" defaultChecked className="h-4 w-4" />
                    <span className="font-semibold text-foreground">No automation during blackout windows</span>
                  </label>
                  <label className="flex items-center gap-3 p-4 rounded-lg bg-muted">
                    <input type="checkbox" defaultChecked className="h-4 w-4" />
                    <span className="font-semibold text-foreground">No RF parameter changes during peak traffic hours</span>
                  </label>
                  <div className="p-4 rounded-lg bg-muted">
                    <label className="text-sm font-semibold text-foreground">Max blast radius threshold before approval required</label>
                    <input type="number" defaultValue={100} className="mt-2 w-full rounded border border-border px-3 py-2" />
                  </div>
                  <label className="flex items-center gap-3 p-4 rounded-lg bg-muted">
                    <input type="checkbox" defaultChecked className="h-4 w-4" />
                    <span className="font-semibold text-foreground">Auto-pause automation if alarm spike detected</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* 8. Environment & Deployment */}
          {activeTab === 'environment' && (
            <div className="space-y-2">
              <div className="rounded-lg border border-border bg-card p-4">
                <h3 className="mb-2 text-xl font-semibold text-foreground">Feature Flags</h3>
                <div className="space-y-3">
                  {['AI experimental features', 'New topology rendering engine', 'Beta report builder', 'Advanced scripting mode'].map(flag => (
                    <div key={flag} className="flex items-center justify-between rounded-lg bg-muted p-4">
                      <span className="font-semibold text-foreground">{flag}</span>
                      <label className="relative inline-flex cursor-pointer items-center">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="peer h-6 w-11 rounded-full bg-muted after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-primary peer-checked:after:translate-x-full"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 9. Backup & Recovery */}
          {activeTab === 'backup' && (
            <div className="space-y-2">
              <div className="rounded-lg border border-border bg-card p-4">
                <h3 className="mb-2 text-xl font-semibold text-foreground">Backup Configuration</h3>
                <div className="space-y-2">
                  <div>
                    <label className="text-sm font-semibold text-foreground">Backup frequency</label>
                    <select className="mt-1 w-full rounded-lg border border-border px-4 py-2 bg-card text-foreground">
                      <option>Hourly</option>
                      <option>Daily</option>
                      <option>Weekly</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-foreground">Backup location</label>
                    <input type="text" defaultValue="s3://backups/prod" className="mt-1 w-full rounded-lg border border-border px-4 py-2" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-foreground">Retention of backups (days)</label>
                    <input type="number" defaultValue={30} className="mt-1 w-full rounded-lg border border-border px-4 py-2" />
                  </div>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="h-4 w-4" />
                    <span className="font-semibold text-foreground">Encryption enabled</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="h-4 w-4" />
                    <span className="font-semibold text-foreground">Cross-region replication</span>
                  </label>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-card p-4">
                <h3 className="mb-2 text-xl font-semibold text-foreground">Disaster Recovery Mode</h3>
                <div className="space-y-2">
                  <div>
                    <label className="text-sm font-semibold text-foreground">Secondary site configuration</label>
                    <input type="text" defaultValue="dr-site-us-west" className="mt-1 w-full rounded-lg border border-border px-4 py-2" />
                  </div>
                  <button className="rounded-lg bg-red-600 px-6 py-2 text-white hover:bg-red-700">Manual Failover (Admin Only)</button>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="h-4 w-4" />
                    <span className="font-semibold text-foreground">DR testing mode</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* 10. Branding & UI */}
          {activeTab === 'branding' && (
            <div className="space-y-2">
              <div className="rounded-lg border border-border bg-card p-4">
                <h3 className="mb-2 text-xl font-semibold text-foreground">Branding & UI Customization</h3>
                <div className="space-y-2">
                  <div>
                    <label className="text-sm font-semibold text-foreground">Logo</label>
                    <input type="text" defaultValue="/logo.png" className="mt-1 w-full rounded-lg border border-border px-4 py-2" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-foreground">Theme color</label>
                    <div className="mt-1 flex gap-3">
                      <input type="color" defaultValue="#2563eb" className="h-10 w-20 rounded-lg" />
                      <input type="text" defaultValue="#2563eb" className="flex-1 rounded-lg border border-border px-4 py-2 font-mono" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-foreground">Environment warning banner</label>
                    <input type="text" defaultValue="PRODUCTION" className="mt-1 w-full rounded-lg border border-border px-4 py-2" placeholder="e.g., PRODUCTION" />
                  </div>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="h-4 w-4" />
                    <span className="font-semibold text-foreground">Show environment warning banner</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* 11. Audit & Change Control */}
          {activeTab === 'audit' && (
            <div className="space-y-2">
              <div className="rounded-lg border border-border bg-card p-4">
                <h3 className="mb-2 text-xl font-semibold text-foreground">Settings Audit & Change Control</h3>
                <div className="mb-6 space-y-3">
                  <p className="text-sm text-muted-foreground">Every setting change logs:</p>
                  <ul className="space-y-2 text-sm text-foreground list-disc list-inside">
                    <li>Who changed it</li>
                    <li>Old value</li>
                    <li>New value</li>
                    <li>Timestamp</li>
                    <li>Environment</li>
                    <li>Justification (if required)</li>
                  </ul>
                </div>

                <h4 className="mb-2 font-semibold text-foreground">Recent Changes</h4>
                <div className="space-y-2">
                  {[
                    { user: 'Admin User', action: 'Modified System Name', time: '2 hours ago', status: 'approved' },
                    { user: 'Integration Admin', action: 'Added Integration', time: '4 hours ago', status: 'approved' },
                    { user: 'Security Admin', action: 'Updated Kill Switch', time: '1 day ago', status: 'pending' }
                  ].map((entry, idx) => (
                    <div key={idx} className="flex items-center justify-between rounded-lg bg-muted p-3">
                      <div className="text-sm">
                        <p className="font-semibold text-foreground">{entry.action}</p>
                        <p className="text-xs text-muted-foreground">{entry.user} • {entry.time}</p>
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
            <div className="space-y-2">
              <div className="rounded-lg border border-border bg-card overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted">
                      <th className="px-6 py-3 text-left font-semibold text-foreground">Role</th>
                      <th className="px-6 py-3 text-center font-semibold text-foreground">View</th>
                      <th className="px-6 py-3 text-center font-semibold text-foreground">Edit</th>
                      <th className="px-6 py-3 text-center font-semibold text-foreground">Approve</th>
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
          <div className="mt-3 flex gap-2 border-t border-border pt-2">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
            >
              <Save className="w-4 h-4" />
              Save Settings
            </button>
            <button className="flex items-center gap-2 rounded-lg bg-gray-200 dark:bg-gray-700 px-6 py-2 text-foreground hover:bg-gray-300 dark:hover:bg-gray-600">
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
