import React, { useState } from 'react';
import { Save, RotateCcw, Shield, AlertTriangle, Lock } from 'lucide-react';

interface Guardrail {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  category: 'execution' | 'safety' | 'approval' | 'scope';
  config: Record<string, any>;
  risk: 'critical' | 'high' | 'medium';
}

export default function AutomationGuardrails() {
  const [guardrails, setGuardrails] = useState<Guardrail[]>([
    {
      id: 'max-concurrent',
      name: 'Max Concurrent Automations',
      description: 'Limit number of automations running simultaneously to prevent resource exhaustion',
      enabled: true,
      category: 'execution',
      risk: 'high',
      config: { maxConcurrent: 50, action: 'queue' }
    },
    {
      id: 'mandatory-approval',
      name: 'Mandatory Approval for Production',
      description: 'All automations targeting production environment require explicit approval',
      enabled: true,
      category: 'approval',
      risk: 'critical',
      config: { requireApproval: true, approverRole: 'manager', timeout: 3600 }
    },
    {
      id: 'max-scope',
      name: 'Max Objects per Automation',
      description: 'Prevent runaway automations from affecting too many devices at once',
      enabled: true,
      category: 'scope',
      risk: 'critical',
      config: { maxObjects: 1000, escalation: 'approval_required' }
    },
    {
      id: 'change-tracking',
      name: 'Mandatory Change Tracking',
      description: 'All automations must reference an approved change ticket',
      enabled: true,
      category: 'approval',
      risk: 'high',
      config: { required: true, ticketSystem: 'servicenow' }
    },
    {
      id: 'rollback-capability',
      name: 'Automatic Rollback on Failure',
      description: 'Automatically revert changes if automation execution fails or is cancelled',
      enabled: true,
      category: 'safety',
      risk: 'medium',
      config: { enabled: true, timeout: 600, retryCount: 3 }
    },
    {
      id: 'dry-run-required',
      name: 'Dry-Run Execution First',
      description: 'Execute in dry-run mode first to show predicted changes before real execution',
      enabled: true,
      category: 'safety',
      risk: 'medium',
      config: { required: true, skipIfPreviousPassed: false }
    },
    {
      id: 'time-windows',
      name: 'Allowed Execution Windows',
      description: 'Only execute automations during specified maintenance windows',
      enabled: true,
      category: 'execution',
      risk: 'medium',
      config: { windows: ['06:00-09:00', '18:00-22:00'], timezone: 'UTC', weekend: false }
    },
    {
      id: 'rate-limiting',
      name: 'Automation Rate Limiting',
      description: 'Prevent automation storms by limiting execution rate per automation',
      enabled: true,
      category: 'execution',
      risk: 'high',
      config: { maxPerHour: 10, maxPerDay: 50, cooldown: 60 }
    },
    {
      id: 'script-validation',
      name: 'Script Content Validation',
      description: 'Scan automation scripts for dangerous commands and patterns',
      enabled: true,
      category: 'safety',
      risk: 'critical',
      config: { enabled: true, blacklist: ['rm -rf', 'format', 'delete'], threshold: 'block_unsafe' }
    },
    {
      id: 'data-validation',
      name: 'Pre-Execution Data Validation',
      description: 'Validate all input data and parameters before execution',
      enabled: true,
      category: 'safety',
      risk: 'medium',
      config: { enabled: true, validateTypes: true, validateRanges: true }
    }
  ]);

  const [savedStatus, setSavedStatus] = useState<string | null>(null);

  const toggleGuardrail = (id: string) => {
    setGuardrails(prev =>
      prev.map(g => g.id === id ? { ...g, enabled: !g.enabled } : g)
    );
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'critical':
        return 'bg-red-50 border-red-200 text-red-700';
      case 'high':
        return 'bg-orange-50 border-orange-200 text-orange-700';
      case 'medium':
        return 'bg-yellow-50 border-yellow-200 text-yellow-700';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  const handleConfigChange = (id: string, configKey: string, value: any) => {
    setGuardrails(prev =>
      prev.map(g =>
        g.id === id
          ? { ...g, config: { ...g.config, [configKey]: value } }
          : g
      )
    );
  };

  const handleSave = () => {
    setSavedStatus('Automation guardrails saved successfully');
    setTimeout(() => setSavedStatus(null), 3000);
  };

  const grouped = guardrails.reduce((acc, g) => {
    if (!acc[g.category]) acc[g.category] = [];
    acc[g.category].push(g);
    return acc;
  }, {} as Record<string, Guardrail[]>);

  return (
    <div className="p-8 space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Shield className="w-6 h-6 text-blue-600" />
          Automation Guardrails
        </h2>
        <p className="text-gray-500 text-sm mt-1">Safety controls to prevent dangerous automation behavior</p>
      </div>

      {/* Critical Warning */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
        <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-red-800">
          <strong>Critical:</strong> Disabling guardrails significantly increases risk of unintended changes. The guardrails marked as "CRITICAL" are essential safety controls and should remain enabled except in extreme circumstances.
        </div>
      </div>

      {/* Guardrails by Category */}
      <div className="space-y-6">
        {Object.entries(grouped).map(([category, items]) => (
          <div key={category}>
            <h3 className="text-lg font-bold text-gray-900 mb-3 capitalize">
              {category === 'execution' && '⚙️ Execution Controls'}
              {category === 'safety' && '🛡️ Safety Controls'}
              {category === 'approval' && '✅ Approval Workflows'}
              {category === 'scope' && '📍 Scope Limits'}
            </h3>

            <div className="space-y-3">
              {items.map(guardrail => (
                <div key={guardrail.id} className={`p-4 rounded-lg border ${guardrail.enabled ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className={`font-semibold ${guardrail.enabled ? 'text-gray-900' : 'text-gray-600'}`}>
                          {guardrail.name}
                        </h4>
                        <span className={`text-xs font-semibold px-2 py-1 rounded border ${getRiskColor(guardrail.risk)}`}>
                          {guardrail.risk === 'critical' && <Lock className="w-3 h-3 inline mr-1" />}
                          {guardrail.risk.toUpperCase()}
                        </span>
                      </div>
                      <p className={`text-sm ${guardrail.enabled ? 'text-gray-600' : 'text-gray-500'}`}>
                        {guardrail.description}
                      </p>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer ml-4">
                      <input
                        type="checkbox"
                        checked={guardrail.enabled}
                        onChange={() => toggleGuardrail(guardrail.id)}
                        className="sr-only peer"
                      />
                      <div className={`w-11 h-6 rounded-full peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 transition-colors ${
                        guardrail.enabled ? 'bg-blue-600' : 'bg-gray-300'
                      } peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
                    </label>
                  </div>

                  {/* Guardrail Configuration */}
                  {guardrail.enabled && (
                    <div className="mt-4 pt-4 border-t border-gray-200 space-y-3 bg-gray-50 p-3 rounded">
                      {guardrail.id === 'max-concurrent' && (
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Max Concurrent Automations</label>
                          <input
                            type="number"
                            value={guardrail.config.maxConcurrent}
                            onChange={(e) => handleConfigChange(guardrail.id, 'maxConcurrent', parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      )}

                      {guardrail.id === 'max-scope' && (
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Max Objects per Run</label>
                          <input
                            type="number"
                            value={guardrail.config.maxObjects}
                            onChange={(e) => handleConfigChange(guardrail.id, 'maxObjects', parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      )}

                      {guardrail.id === 'time-windows' && (
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Allowed Windows (Comma-separated)</label>
                          <input
                            type="text"
                            value={guardrail.config.windows.join(', ')}
                            onChange={(e) => handleConfigChange(guardrail.id, 'windows', e.target.value.split(', '))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., 06:00-09:00, 18:00-22:00"
                          />
                          <label className="flex items-center gap-2 cursor-pointer mt-2">
                            <input
                              type="checkbox"
                              checked={!guardrail.config.weekend}
                              onChange={(e) => handleConfigChange(guardrail.id, 'weekend', !e.target.checked)}
                              className="w-4 h-4"
                            />
                            <span className="text-sm text-gray-700">Disable on weekends</span>
                          </label>
                        </div>
                      )}

                      {guardrail.id === 'rate-limiting' && (
                        <div className="space-y-2">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Max per Hour</label>
                            <input
                              type="number"
                              value={guardrail.config.maxPerHour}
                              onChange={(e) => handleConfigChange(guardrail.id, 'maxPerHour', parseInt(e.target.value))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Max per Day</label>
                            <input
                              type="number"
                              value={guardrail.config.maxPerDay}
                              onChange={(e) => handleConfigChange(guardrail.id, 'maxPerDay', parseInt(e.target.value))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      )}

                      {guardrail.id === 'mandatory-approval' && (
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Approval Timeout (seconds)</label>
                          <input
                            type="number"
                            value={guardrail.config.timeout}
                            onChange={(e) => handleConfigChange(guardrail.id, 'timeout', parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <p className="text-xs text-gray-500 mt-1">Approval requests expire after this duration</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Best Practices */}
      <div className="border border-gray-200 rounded-lg p-6 bg-blue-50">
        <h3 className="font-semibold text-gray-900 mb-3">Guardrail Best Practices</h3>
        <ul className="text-sm text-gray-700 space-y-2 list-disc list-inside">
          <li>Keep all critical guardrails enabled at all times</li>
          <li>Use dry-run execution to preview changes before applying</li>
          <li>Require approval for production automations</li>
          <li>Set reasonable rate limits based on your infrastructure capacity</li>
          <li>Define clear approval windows and authorized approvers</li>
          <li>Monitor guardrail violations for suspicious activity patterns</li>
          <li>Regularly review automation logs and rollback events</li>
        </ul>
      </div>

      {/* Save Button */}
      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
        >
          <Save className="w-4 h-4" />
          Save Guardrails
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
