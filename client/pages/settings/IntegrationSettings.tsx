import React, { useState } from 'react';
import { Save, Plus, Trash2, TestTube, Eye, EyeOff, Zap } from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  type: 'northbound' | 'southbound';
  category: string;
  endpoint: string;
  authMethod: 'basic' | 'oauth' | 'api-key' | 'certificate';
  retryPolicy: string;
  timeout: number;
  encryption: 'tls-1.2' | 'tls-1.3';
  healthStatus: 'healthy' | 'warning' | 'error';
  lastHealthCheck?: string;
  enabled: boolean;
}

export default function IntegrationSettings() {
  const [activeTab, setActiveTab] = useState<'northbound' | 'southbound'>('northbound');
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: 'servicenow-itsm',
      name: 'ServiceNow ITSM',
      type: 'northbound',
      category: 'ITSM Systems',
      endpoint: 'https://company.service-now.com/api/now',
      authMethod: 'oauth',
      retryPolicy: 'exponential (3 attempts)',
      timeout: 30,
      encryption: 'tls-1.3',
      healthStatus: 'healthy',
      lastHealthCheck: '2024-01-22 14:35 UTC',
      enabled: true
    },
    {
      id: 'splunk-siem',
      name: 'Splunk SIEM',
      type: 'northbound',
      category: 'Data Lakes',
      endpoint: 'https://splunk.company.com:8088/services/collector',
      authMethod: 'api-key',
      retryPolicy: 'linear (5 attempts)',
      timeout: 45,
      encryption: 'tls-1.3',
      healthStatus: 'healthy',
      lastHealthCheck: '2024-01-22 14:33 UTC',
      enabled: true
    },
    {
      id: 'smtp-notifications',
      name: 'SMTP Email Server',
      type: 'northbound',
      category: 'Email Servers',
      endpoint: 'smtp.company.com:587',
      authMethod: 'basic',
      retryPolicy: 'exponential (3 attempts)',
      timeout: 20,
      encryption: 'tls-1.2',
      healthStatus: 'healthy',
      lastHealthCheck: '2024-01-22 14:32 UTC',
      enabled: true
    },
    {
      id: 'cisco-snmp',
      name: 'Cisco SNMP Adapter',
      type: 'southbound',
      category: 'Network Protocols',
      endpoint: '0.0.0.0:161',
      authMethod: 'basic',
      retryPolicy: 'exponential (2 attempts)',
      timeout: 10,
      encryption: 'none',
      healthStatus: 'healthy',
      lastHealthCheck: '2024-01-22 14:30 UTC',
      enabled: true
    },
    {
      id: 'juniper-netconf',
      name: 'Juniper NETCONF',
      type: 'southbound',
      category: 'Network Protocols',
      endpoint: '0.0.0.0:830',
      authMethod: 'certificate',
      retryPolicy: 'exponential (3 attempts)',
      timeout: 15,
      encryption: 'tls-1.3',
      healthStatus: 'warning',
      lastHealthCheck: '2024-01-22 14:25 UTC',
      enabled: true
    },
    {
      id: 'vendor-rest-api',
      name: 'Generic REST API Adapter',
      type: 'southbound',
      category: 'REST Protocols',
      endpoint: 'https://vendor-api.example.com',
      authMethod: 'api-key',
      retryPolicy: 'linear (3 attempts)',
      timeout: 25,
      encryption: 'tls-1.3',
      healthStatus: 'healthy',
      enabled: true
    }
  ]);

  const [showNewForm, setShowNewForm] = useState(false);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

  const filteredIntegrations = integrations.filter(int => int.type === activeTab);

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getHealthBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-700';
      case 'warning':
        return 'bg-yellow-100 text-yellow-700';
      case 'error':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const toggleIntegration = (id: string) => {
    setIntegrations(prev =>
      prev.map(int =>
        int.id === id ? { ...int, enabled: !int.enabled } : int
      )
    );
  };

  const deleteIntegration = (id: string) => {
    setIntegrations(prev => prev.filter(int => int.id !== id));
  };

  return (
    <div className="p-8 space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Zap className="w-6 h-6 text-blue-600" />
          Integration Settings
        </h2>
        <p className="text-gray-500 text-sm mt-1">Configure external system connections and adapters</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('northbound')}
          className={`px-4 py-3 font-semibold border-b-2 transition-colors ${
            activeTab === 'northbound'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Northbound Integrations
        </button>
        <button
          onClick={() => setActiveTab('southbound')}
          className={`px-4 py-3 font-semibold border-b-2 transition-colors ${
            activeTab === 'southbound'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Southbound Integrations
        </button>
      </div>

      {/* Description */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-700">
        {activeTab === 'northbound' ? (
          <div>
            <strong>Northbound Integrations:</strong> External systems that receive data (ITSM systems, NMS, data lakes, email servers, webhooks)
          </div>
        ) : (
          <div>
            <strong>Southbound Integrations:</strong> Network device adapters and protocols (SNMP, NETCONF, SSH, REST) for device communication
          </div>
        )}
      </div>

      {/* Add New Button */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowNewForm(!showNewForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
        >
          <Plus className="w-4 h-4" />
          Add Integration
        </button>
      </div>

      {/* New Integration Form */}
      {showNewForm && (
        <div className="border border-gray-300 rounded-lg p-6 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">New Integration</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Integration Name</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., ServiceNow Integration"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., ITSM Systems"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Endpoint URL / Address</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://api.example.com or 0.0.0.0:161"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Authentication Method</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Basic Auth</option>
                <option>OAuth 2.0</option>
                <option>API Key</option>
                <option>Certificate</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Timeout (seconds)</label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="30"
              />
            </div>
            <div className="col-span-2 flex gap-2">
              <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold">
                Create Integration
              </button>
              <button
                onClick={() => setShowNewForm(false)}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Integration List */}
      <div className="space-y-3">
        {filteredIntegrations.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No {activeTab === 'northbound' ? 'northbound' : 'southbound'} integrations configured
          </div>
        ) : (
          filteredIntegrations.map(integration => (
            <div
              key={integration.id}
              className={`p-4 rounded-lg border ${getHealthColor(integration.healthStatus)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900">{integration.name}</h3>
                    <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700">
                      {integration.category}
                    </span>
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${getHealthBadge(integration.healthStatus)}`}>
                      {integration.healthStatus.toUpperCase()}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm mt-3">
                    <div>
                      <p className="text-xs text-gray-600">Endpoint</p>
                      <p className="font-mono text-gray-900 text-xs">{integration.endpoint}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Authentication</p>
                      <p className="text-gray-900 text-xs capitalize">{integration.authMethod.replace('-', ' ')}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Retry Policy</p>
                      <p className="text-gray-900 text-xs">{integration.retryPolicy}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Timeout</p>
                      <p className="text-gray-900 text-xs">{integration.timeout}s</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Encryption</p>
                      <p className="text-gray-900 text-xs">{integration.encryption}</p>
                    </div>
                    {integration.lastHealthCheck && (
                      <div>
                        <p className="text-xs text-gray-600">Last Health Check</p>
                        <p className="text-gray-900 text-xs">{integration.lastHealthCheck}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <button
                    title="Test Connection"
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  >
                    <TestTube className="w-4 h-4" />
                  </button>
                  <button
                    title="Toggle Integration"
                    onClick={() => toggleIntegration(integration.id)}
                    className={`relative inline-flex items-center cursor-pointer h-6 w-11 rounded-full transition-colors ${
                      integration.enabled ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        integration.enabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    ></span>
                  </button>
                  <button
                    onClick={() => deleteIntegration(integration.id)}
                    title="Delete Integration"
                    className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Info Box */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-8">
        <h4 className="font-semibold text-gray-900 mb-2">Security Best Practices</h4>
        <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
          <li>All credentials are encrypted at rest and in transit using TLS 1.2 minimum</li>
          <li>No credentials are stored in plain text or logs</li>
          <li>Use strong authentication methods (OAuth 2.0 or certificates preferred)</li>
          <li>Test connections regularly to monitor integration health</li>
          <li>Disable unused integrations to reduce attack surface</li>
          <li>Credentials must be managed through secure credential vault</li>
        </ul>
      </div>
    </div>
  );
}
