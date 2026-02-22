import React, { useState } from 'react';
import { Save, RotateCcw, Cloud, Plus, Trash2, GitBranch } from 'lucide-react';

interface Environment {
  id: string;
  name: string;
  type: 'production' | 'staging' | 'lab' | 'development';
  description: string;
  status: 'active' | 'maintenance' | 'degraded';
  replicas: number;
  region: string;
  kubernetesCluster: string;
  enabled: boolean;
  config: Record<string, any>;
}

export default function EnvironmentDeployment() {
  const [environments, setEnvironments] = useState<Environment[]>([
    {
      id: 'prod',
      name: 'Production',
      type: 'production',
      description: 'Live production environment',
      status: 'active',
      replicas: 3,
      region: 'us-east-1',
      kubernetesCluster: 'prod-k8s-us-east',
      enabled: true,
      config: {
        logLevel: 'info',
        retentionDays: 180,
        backupFrequency: 'hourly',
        autoScaling: true,
        maxReplicas: 10
      }
    },
    {
      id: 'staging',
      name: 'Staging',
      type: 'staging',
      description: 'Pre-production testing environment',
      status: 'active',
      replicas: 2,
      region: 'us-east-2',
      kubernetesCluster: 'staging-k8s-us-east',
      enabled: true,
      config: {
        logLevel: 'debug',
        retentionDays: 30,
        backupFrequency: 'daily',
        autoScaling: true,
        maxReplicas: 5
      }
    },
    {
      id: 'lab',
      name: 'Lab / Testing',
      type: 'lab',
      description: 'Testing and experimentation environment',
      status: 'active',
      replicas: 1,
      region: 'us-west-1',
      kubernetesCluster: 'lab-k8s-us-west',
      enabled: true,
      config: {
        logLevel: 'debug',
        retentionDays: 7,
        backupFrequency: 'weekly',
        autoScaling: false,
        maxReplicas: 2
      }
    }
  ]);

  const [savedStatus, setSavedStatus] = useState<string | null>(null);

  const handleConfigChange = (id: string, configKey: string, value: any) => {
    setEnvironments(prev =>
      prev.map(env =>
        env.id === id
          ? { ...env, config: { ...env.config, [configKey]: value } }
          : env
      )
    );
  };

  const toggleEnvironment = (id: string) => {
    setEnvironments(prev =>
      prev.map(env =>
        env.id === id ? { ...env, enabled: !env.enabled } : env
      )
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-50 border-green-200 text-green-700';
      case 'maintenance':
        return 'bg-yellow-50 border-yellow-200 text-yellow-700';
      case 'degraded':
        return 'bg-red-50 border-red-200 text-red-700';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'production':
        return 'bg-red-100 text-red-800';
      case 'staging':
        return 'bg-blue-100 text-blue-800';
      case 'lab':
        return 'bg-purple-100 text-purple-800';
      case 'development':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSave = () => {
    setSavedStatus('Environment settings saved successfully');
    setTimeout(() => setSavedStatus(null), 3000);
  };

  return (
    <div className="p-8 space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Cloud className="w-6 h-6 text-blue-600" />
          Environment & Deployment
        </h2>
        <p className="text-gray-500 text-sm mt-1">Configure environment-specific settings and deployment parameters</p>
      </div>

      {/* Deployment Info */}
      <div className="grid grid-cols-4 gap-4">
        <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-600 font-semibold">Total Environments</p>
          <p className="text-2xl font-bold text-blue-900 mt-1">{environments.length}</p>
        </div>
        <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
          <p className="text-sm text-green-600 font-semibold">Active</p>
          <p className="text-2xl font-bold text-green-900 mt-1">{environments.filter(e => e.status === 'active').length}</p>
        </div>
        <div className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg border border-yellow-200">
          <p className="text-sm text-yellow-600 font-semibold">Total Replicas</p>
          <p className="text-2xl font-bold text-yellow-900 mt-1">{environments.reduce((sum, e) => sum + e.replicas, 0)}</p>
        </div>
        <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
          <p className="text-sm text-purple-600 font-semibold">Regions</p>
          <p className="text-2xl font-bold text-purple-900 mt-1">{new Set(environments.map(e => e.region)).size}</p>
        </div>
      </div>

      {/* Environments */}
      <div className="space-y-4">
        {environments.map(env => (
          <div key={env.id} className={`rounded-lg border overflow-hidden ${env.enabled ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-200'}`}>
            {/* Header */}
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <Cloud className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={`font-semibold ${env.enabled ? 'text-gray-900' : 'text-gray-600'}`}>{env.name}</h3>
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${getTypeColor(env.type)}`}>
                      {env.type.toUpperCase()}
                    </span>
                    <span className={`text-xs font-semibold px-2 py-1 rounded border ${getStatusColor(env.status)}`}>
                      {env.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{env.description}</p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={env.enabled}
                  onChange={() => toggleEnvironment(env.id)}
                  className="sr-only peer"
                />
                <div className={`w-11 h-6 rounded-full peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 transition-colors ${
                  env.enabled ? 'bg-blue-600' : 'bg-gray-300'
                } peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
              </label>
            </div>

            {/* Details */}
            {env.enabled && (
              <div className="p-4 space-y-4 border-t border-gray-200">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-gray-600 font-semibold mb-2">Replicas</p>
                    <div className="flex items-center gap-2">
                      <button className="p-1 text-gray-600 hover:bg-gray-100 rounded">-</button>
                      <span className="text-lg font-bold text-gray-900 min-w-fit">{env.replicas}</span>
                      <button className="p-1 text-gray-600 hover:bg-gray-100 rounded">+</button>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-semibold mb-2">Region</p>
                    <p className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">{env.region}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-semibold mb-2">K8s Cluster</p>
                    <p className="text-sm font-mono bg-gray-100 px-2 py-1 rounded text-xs truncate">{env.kubernetesCluster}</p>
                  </div>
                </div>

                {/* Configuration */}
                <div className="border-t border-gray-200 pt-4 space-y-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Log Level</label>
                    <select
                      value={env.config.logLevel}
                      onChange={(e) => handleConfigChange(env.id, 'logLevel', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="error">Error only</option>
                      <option value="warn">Warnings & Errors</option>
                      <option value="info">Info & above</option>
                      <option value="debug">Debug (verbose)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Log Retention (days)</label>
                    <input
                      type="number"
                      value={env.config.retentionDays}
                      onChange={(e) => handleConfigChange(env.id, 'retentionDays', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Backup Frequency</label>
                    <select
                      value={env.config.backupFrequency}
                      onChange={(e) => handleConfigChange(env.id, 'backupFrequency', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="hourly">Hourly</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>

                  {env.config.autoScaling && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Max Auto-Scale Replicas</label>
                      <input
                        type="number"
                        value={env.config.maxReplicas}
                        onChange={(e) => handleConfigChange(env.id, 'maxReplicas', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}

                  <label className="flex items-center gap-2 cursor-pointer pt-2">
                    <input
                      type="checkbox"
                      checked={env.config.autoScaling}
                      onChange={(e) => handleConfigChange(env.id, 'autoScaling', e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-700">Enable auto-scaling</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Deployment Pipeline */}
      <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <GitBranch className="w-5 h-5" />
          Deployment Pipeline
        </h3>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="text-center flex-1">
              <div className="w-12 h-12 bg-green-100 border-2 border-green-600 rounded-full flex items-center justify-center mx-auto font-bold text-green-700 mb-2">
                1
              </div>
              <p className="font-semibold text-gray-900">Development</p>
              <p className="text-xs text-gray-600 mt-1">Code committed to feature branch</p>
            </div>
            <div className="flex-1 text-center">→</div>
            <div className="text-center flex-1">
              <div className="w-12 h-12 bg-blue-100 border-2 border-blue-600 rounded-full flex items-center justify-center mx-auto font-bold text-blue-700 mb-2">
                2
              </div>
              <p className="font-semibold text-gray-900">Lab Testing</p>
              <p className="text-xs text-gray-600 mt-1">Automated and manual testing</p>
            </div>
            <div className="flex-1 text-center">→</div>
            <div className="text-center flex-1">
              <div className="w-12 h-12 bg-purple-100 border-2 border-purple-600 rounded-full flex items-center justify-center mx-auto font-bold text-purple-700 mb-2">
                3
              </div>
              <p className="font-semibold text-gray-900">Staging</p>
              <p className="text-xs text-gray-600 mt-1">Pre-production validation</p>
            </div>
            <div className="flex-1 text-center">→</div>
            <div className="text-center flex-1">
              <div className="w-12 h-12 bg-red-100 border-2 border-red-600 rounded-full flex items-center justify-center mx-auto font-bold text-red-700 mb-2">
                4
              </div>
              <p className="font-semibold text-gray-900">Production</p>
              <p className="text-xs text-gray-600 mt-1">Live deployment</p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-300">
            <label className="flex items-center gap-2 cursor-pointer mb-3">
              <input type="checkbox" defaultChecked className="w-4 h-4" />
              <span className="text-sm font-semibold text-gray-700">Require approval before production deployment</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer mb-3">
              <input type="checkbox" defaultChecked className="w-4 h-4" />
              <span className="text-sm font-semibold text-gray-700">Automated rollback on deployment failure</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4" />
              <span className="text-sm font-semibold text-gray-700">Blue-green deployment strategy</span>
            </label>
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
