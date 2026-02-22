import React, { useState } from 'react';
import { Save, RotateCcw, AlertTriangle, Clock, Globe, Type } from 'lucide-react';

interface SystemSettings {
  systemName: string;
  timezone: string;
  dateTimeFormat: string;
  defaultLanguage: string;
  maintenanceMode: boolean;
}

interface KillSwitch {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  riskLevel: 'critical' | 'high' | 'medium';
  lastTriggered?: string;
  approvalRequired: boolean;
}

export default function SystemConfiguration() {
  const [settings, setSettings] = useState<SystemSettings>({
    systemName: 'OSS Platform',
    timezone: 'UTC',
    dateTimeFormat: 'YYYY-MM-DD HH:mm:ss',
    defaultLanguage: 'English',
    maintenanceMode: false
  });

  const [killSwitches, setKillSwitches] = useState<KillSwitch[]>([
    {
      id: 'automation-kill',
      name: 'Disable All Automations',
      description: 'Stops all automation executions immediately',
      enabled: false,
      riskLevel: 'critical',
      lastTriggered: '2024-01-15 03:22 UTC',
      approvalRequired: true
    },
    {
      id: 'command-kill',
      name: 'Disable Command Execution',
      description: 'Blocks all commands from Command Center',
      enabled: false,
      riskLevel: 'critical',
      lastTriggered: '2024-01-10 14:45 UTC',
      approvalRequired: true
    },
    {
      id: 'report-kill',
      name: 'Disable Report Generation',
      description: 'Prevents report generation and scheduling',
      enabled: false,
      riskLevel: 'high',
      approvalRequired: true
    },
    {
      id: 'export-kill',
      name: 'Disable External Exports',
      description: 'Blocks all data exports to external systems',
      enabled: false,
      riskLevel: 'high',
      lastTriggered: '2024-01-08 09:15 UTC',
      approvalRequired: true
    },
    {
      id: 'readonly-kill',
      name: 'Force System Read-Only',
      description: 'Makes entire system read-only, no modifications allowed',
      enabled: false,
      riskLevel: 'critical',
      approvalRequired: true
    }
  ]);

  const [savedStatus, setSavedStatus] = useState<string | null>(null);

  const handleSettingChange = (field: keyof SystemSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleKillSwitchToggle = (id: string) => {
    setKillSwitches(prev =>
      prev.map(ks =>
        ks.id === id
          ? {
              ...ks,
              enabled: !ks.enabled,
              lastTriggered: !ks.enabled ? new Date().toLocaleString('sv-SE') + ' UTC' : ks.lastTriggered
            }
          : ks
      )
    );
  };

  const handleSave = () => {
    setSavedStatus('Settings saved successfully');
    setTimeout(() => setSavedStatus(null), 3000);
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical':
        return 'text-red-600 bg-red-50';
      case 'high':
        return 'text-orange-600 bg-orange-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="p-8 space-y-8">
      {/* General Platform Settings */}
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Globe className="w-6 h-6 text-blue-600" />
            General Platform Settings
          </h2>
          <p className="text-gray-500 text-sm mt-1">Configure core system behavior and localization</p>
        </div>

        <div className="space-y-4">
          {/* System Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">System Name</label>
            <input
              type="text"
              value={settings.systemName}
              onChange={(e) => handleSettingChange('systemName', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter system name"
            />
            <p className="text-xs text-gray-500 mt-1">Displayed in browser title and header</p>
          </div>

          {/* Timezone */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Default Timezone</label>
            <select
              value={settings.timezone}
              onChange={(e) => handleSettingChange('timezone', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>UTC</option>
              <option>America/New_York</option>
              <option>America/Chicago</option>
              <option>America/Denver</option>
              <option>America/Los_Angeles</option>
              <option>Europe/London</option>
              <option>Europe/Paris</option>
              <option>Asia/Tokyo</option>
              <option>Asia/Singapore</option>
              <option>Australia/Sydney</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">Used for log timestamps and scheduled jobs</p>
          </div>

          {/* Date/Time Format */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Date/Time Format</label>
            <select
              value={settings.dateTimeFormat}
              onChange={(e) => handleSettingChange('dateTimeFormat', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>YYYY-MM-DD HH:mm:ss</option>
              <option>DD/MM/YYYY HH:mm:ss</option>
              <option>MM/DD/YYYY HH:mm:ss</option>
              <option>YYYY-MM-DDTHH:mm:ssZ (ISO 8601)</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">Format for date/time display across the platform</p>
          </div>

          {/* Language */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Default Language</label>
            <select
              value={settings.defaultLanguage}
              onChange={(e) => handleSettingChange('defaultLanguage', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>English</option>
              <option>Spanish</option>
              <option>French</option>
              <option>German</option>
              <option>Chinese (Simplified)</option>
              <option>Japanese</option>
            </select>
          </div>

          {/* Maintenance Mode */}
          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div>
                <h3 className="font-semibold text-gray-900">Maintenance Mode</h3>
                <p className="text-sm text-gray-500 mt-1">
                  When enabled:
                  <br />• Prevents automation execution
                  <br />• Prevents script execution
                  <br />• Allows read-only viewing only
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.maintenanceMode}
                  onChange={(e) => handleSettingChange('maintenanceMode', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Global Kill Switches */}
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            Global Kill Switches (Emergency Controls)
          </h2>
          <p className="text-gray-500 text-sm mt-1">Critical controls for major incidents - use with caution</p>
        </div>

        <div className="space-y-3">
          {killSwitches.map(ks => (
            <div
              key={ks.id}
              className={`p-4 rounded-lg border ${
                ks.enabled ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className={`font-semibold ${ks.enabled ? 'text-red-900' : 'text-gray-900'}`}>
                      {ks.name}
                    </h4>
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${getRiskColor(ks.riskLevel)}`}>
                      {ks.riskLevel.toUpperCase()}
                    </span>
                    {ks.approvalRequired && (
                      <span className="text-xs font-semibold px-2 py-1 rounded bg-yellow-50 text-yellow-700">
                        Approval Required
                      </span>
                    )}
                  </div>
                  <p className={`text-sm ${ks.enabled ? 'text-red-700' : 'text-gray-600'}`}>
                    {ks.description}
                  </p>
                  {ks.lastTriggered && (
                    <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Last triggered: {ks.lastTriggered}
                    </p>
                  )}
                </div>

                <label className="relative inline-flex items-center cursor-pointer ml-4">
                  <input
                    type="checkbox"
                    checked={ks.enabled}
                    onChange={() => handleKillSwitchToggle(ks.id)}
                    className="sr-only peer"
                  />
                  <div className={`w-11 h-6 rounded-full peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 transition-colors ${
                    ks.enabled ? 'bg-red-600' : 'bg-gray-300'
                  } peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
                </label>
              </div>
            </div>
          ))}
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
