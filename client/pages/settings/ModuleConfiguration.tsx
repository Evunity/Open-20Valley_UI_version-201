import React, { useState } from 'react';
import { Save, RotateCcw, Sliders, ChevronDown, ChevronUp } from 'lucide-react';

interface ModuleSettings {
  [module: string]: {
    enabled: boolean;
    settings: Record<string, any>;
  };
}

export default function ModuleConfiguration() {
  const [expandedModule, setExpandedModule] = useState<string>('alarm');
  const [moduleSettings, setModuleSettings] = useState<ModuleSettings>({
    alarm: {
      enabled: true,
      settings: {
        correlationRules: true,
        retentionDays: 90,
        severityMapping: 'default',
        stormThreshold: 100
      }
    },
    analytics: {
      enabled: true,
      settings: {
        kpiAggregationWindow: '5m',
        baselineCalculation: 'ml-based',
        confidenceThreshold: 85,
        anomalySensitivity: 'medium',
        refreshFrequency: '1m'
      }
    },
    automation: {
      enabled: true,
      settings: {
        autonomousMode: false,
        mandatoryApproval: true,
        maxObjectsPerRun: 1000,
        allowedHours: '06:00-22:00',
        rollbackAutoTrigger: true,
        aiRetrainingSchedule: 'weekly'
      }
    },
    topology: {
      enabled: true,
      settings: {
        defaultView: 'map',
        maxObjectsRendered: 5000,
        clusteringThreshold: 50,
        vendorColoring: 'enabled',
        replayRetentionDays: 30
      }
    },
    reports: {
      enabled: true,
      settings: {
        defaultFormat: 'pdf',
        maxReportSize: '100MB',
        maxScheduledReports: 50,
        allowedDelivery: ['email', 'webhook', 'sftp'],
        snapshotRetentionDays: 180
      }
    },
    commandCenter: {
      enabled: true,
      settings: {
        maxBulkExecutionSize: 500,
        commandRateLimit: '100/min',
        changeTicketRequired: true,
        dualApprovalThreshold: 'high-risk',
        executionTimeout: '300s'
      }
    }
  });

  const [savedStatus, setSavedStatus] = useState<string | null>(null);

  const handleSettingChange = (module: string, setting: string, value: any) => {
    setModuleSettings(prev => ({
      ...prev,
      [module]: {
        ...prev[module],
        settings: {
          ...prev[module].settings,
          [setting]: value
        }
      }
    }));
  };

  const handleModuleToggle = (module: string) => {
    setModuleSettings(prev => ({
      ...prev,
      [module]: {
        ...prev[module],
        enabled: !prev[module].enabled
      }
    }));
  };

  const handleSave = () => {
    setSavedStatus('Module settings saved successfully');
    setTimeout(() => setSavedStatus(null), 3000);
  };

  const modules = [
    { key: 'alarm', name: 'Alarm Module', description: 'Alarm detection, correlation, and management' },
    { key: 'analytics', name: 'Analytics Module', description: 'KPI aggregation and anomaly detection' },
    { key: 'automation', name: 'Automation & AI Module', description: 'Automation execution and AI model behavior' },
    { key: 'topology', name: 'Topology Module', description: 'Network visualization and replay' },
    { key: 'reports', name: 'Reports Module', description: 'Report generation and delivery' },
    { key: 'commandCenter', name: 'Command Center', description: 'Command execution and bulk operations' }
  ];

  return (
    <div className="p-8 space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Sliders className="w-6 h-6 text-blue-600" />
          Module Behavior Configuration
        </h2>
        <p className="text-gray-500 text-sm mt-1">Configure behavior and feature toggles for each platform module</p>
      </div>

      <div className="space-y-4">
        {modules.map(module => (
          <div key={module.key} className="border border-gray-200 rounded-lg overflow-hidden">
            {/* Module Header */}
            <button
              onClick={() => setExpandedModule(expandedModule === module.key ? '' : module.key)}
              className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 text-left">
                <label className="relative inline-flex items-center cursor-pointer" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={moduleSettings[module.key].enabled}
                    onChange={() => handleModuleToggle(module.key)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
                <div>
                  <h3 className="font-semibold text-gray-900">{module.name}</h3>
                  <p className="text-sm text-gray-600">{module.description}</p>
                </div>
              </div>
              {expandedModule === module.key ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </button>

            {/* Module Settings */}
            {expandedModule === module.key && (
              <div className="p-4 bg-white border-t border-gray-200 space-y-4">
                {module.key === 'alarm' && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Alarm Correlation Rules</label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={moduleSettings[module.key].settings.correlationRules}
                          onChange={(e) => handleSettingChange(module.key, 'correlationRules', e.target.checked)}
                          className="w-4 h-4"
                        />
                        <span className="text-sm text-gray-700">Enable automatic correlation</span>
                      </label>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Retention Duration (days)</label>
                      <input
                        type="number"
                        value={moduleSettings[module.key].settings.retentionDays}
                        onChange={(e) => handleSettingChange(module.key, 'retentionDays', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Storm Detection Threshold</label>
                      <input
                        type="number"
                        value={moduleSettings[module.key].settings.stormThreshold}
                        onChange={(e) => handleSettingChange(module.key, 'stormThreshold', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">Number of alarms/min to trigger storm detection</p>
                    </div>
                  </>
                )}

                {module.key === 'analytics' && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">KPI Aggregation Window</label>
                      <select
                        value={moduleSettings[module.key].settings.kpiAggregationWindow}
                        onChange={(e) => handleSettingChange(module.key, 'kpiAggregationWindow', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option>1m</option>
                        <option>5m</option>
                        <option>15m</option>
                        <option>1h</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Anomaly Detection Sensitivity</label>
                      <select
                        value={moduleSettings[module.key].settings.anomalySensitivity}
                        onChange={(e) => handleSettingChange(module.key, 'anomalySensitivity', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="low">Low (fewer false positives)</option>
                        <option value="medium">Medium (balanced)</option>
                        <option value="high">High (more detections)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Confidence Threshold (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={moduleSettings[module.key].settings.confidenceThreshold}
                        onChange={(e) => handleSettingChange(module.key, 'confidenceThreshold', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </>
                )}

                {module.key === 'automation' && (
                  <>
                    <div>
                      <label className="flex items-center gap-2 cursor-pointer mb-4">
                        <input
                          type="checkbox"
                          checked={moduleSettings[module.key].settings.autonomousMode}
                          onChange={(e) => handleSettingChange(module.key, 'autonomousMode', e.target.checked)}
                          className="w-4 h-4"
                        />
                        <span className="text-sm font-semibold text-gray-700">Enable Autonomous Mode</span>
                      </label>
                      <p className="text-xs text-gray-600 ml-6">Allows automations to run without approval</p>
                    </div>
                    <div>
                      <label className="flex items-center gap-2 cursor-pointer mb-4">
                        <input
                          type="checkbox"
                          checked={moduleSettings[module.key].settings.mandatoryApproval}
                          onChange={(e) => handleSettingChange(module.key, 'mandatoryApproval', e.target.checked)}
                          className="w-4 h-4"
                        />
                        <span className="text-sm font-semibold text-gray-700">Mandatory Approval Required</span>
                      </label>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Max Objects Per Automation Run</label>
                      <input
                        type="number"
                        value={moduleSettings[module.key].settings.maxObjectsPerRun}
                        onChange={(e) => handleSettingChange(module.key, 'maxObjectsPerRun', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Allowed Automation Hours</label>
                      <input
                        type="text"
                        value={moduleSettings[module.key].settings.allowedHours}
                        onChange={(e) => handleSettingChange(module.key, 'allowedHours', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., 06:00-22:00"
                      />
                      <p className="text-xs text-gray-500 mt-1">Format: HH:MM-HH:MM (24-hour)</p>
                    </div>
                  </>
                )}

                {module.key === 'topology' && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Default Map View</label>
                      <select
                        value={moduleSettings[module.key].settings.defaultView}
                        onChange={(e) => handleSettingChange(module.key, 'defaultView', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="map">Map View</option>
                        <option value="tree">Tree View</option>
                        <option value="logical">Logical View</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Max Objects Rendered</label>
                      <input
                        type="number"
                        value={moduleSettings[module.key].settings.maxObjectsRendered}
                        onChange={(e) => handleSettingChange(module.key, 'maxObjectsRendered', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </>
                )}

                {module.key === 'reports' && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Default Export Format</label>
                      <select
                        value={moduleSettings[module.key].settings.defaultFormat}
                        onChange={(e) => handleSettingChange(module.key, 'defaultFormat', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="pdf">PDF</option>
                        <option value="excel">Excel</option>
                        <option value="csv">CSV</option>
                        <option value="json">JSON</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Max Scheduled Reports Per Tenant</label>
                      <input
                        type="number"
                        value={moduleSettings[module.key].settings.maxScheduledReports}
                        onChange={(e) => handleSettingChange(module.key, 'maxScheduledReports', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </>
                )}

                {module.key === 'commandCenter' && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Max Bulk Execution Size</label>
                      <input
                        type="number"
                        value={moduleSettings[module.key].settings.maxBulkExecutionSize}
                        onChange={(e) => handleSettingChange(module.key, 'maxBulkExecutionSize', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">Maximum devices per bulk command execution</p>
                    </div>
                    <div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={moduleSettings[module.key].settings.changeTicketRequired}
                          onChange={(e) => handleSettingChange(module.key, 'changeTicketRequired', e.target.checked)}
                          className="w-4 h-4"
                        />
                        <span className="text-sm text-gray-700">Require change ticket for commands</span>
                      </label>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Dual Approval Threshold</label>
                      <select
                        value={moduleSettings[module.key].settings.dualApprovalThreshold}
                        onChange={(e) => handleSettingChange(module.key, 'dualApprovalThreshold', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="none">Disabled</option>
                        <option value="high-risk">High-Risk Configurations</option>
                        <option value="all">All Commands</option>
                      </select>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Save Button */}
      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
        >
          <Save className="w-4 h-4" />
          Save Configuration
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
