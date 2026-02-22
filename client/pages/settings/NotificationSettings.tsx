import React, { useState } from 'react';
import { Save, RotateCcw, Bell, Plus, Trash2, AlertCircle } from 'lucide-react';

interface NotificationChannel {
  id: string;
  name: string;
  type: 'email' | 'webhook' | 'slack' | 'sms' | 'pagerduty';
  description: string;
  enabled: boolean;
  endpoint: string;
  retryPolicy: string;
  timeout: number;
  lastTest?: string;
}

interface NotificationRule {
  id: string;
  name: string;
  trigger: string;
  channels: string[];
  severity: 'critical' | 'high' | 'medium' | 'low';
  enabled: boolean;
}

export default function NotificationSettings() {
  const [channels, setChannels] = useState<NotificationChannel[]>([
    {
      id: 'email-ops',
      name: 'Operations Email',
      type: 'email',
      description: 'Email notifications for ops team',
      enabled: true,
      endpoint: 'ops-team@company.com',
      retryPolicy: 'exponential (3 attempts)',
      timeout: 30,
      lastTest: '2024-01-22 14:35 UTC'
    },
    {
      id: 'slack-alerts',
      name: 'Slack Alerts',
      type: 'slack',
      description: 'Critical alerts to Slack #alerts channel',
      enabled: true,
      endpoint: 'https://hooks.slack.com/services/...',
      retryPolicy: 'linear (3 attempts)',
      timeout: 15,
      lastTest: '2024-01-22 14:30 UTC'
    },
    {
      id: 'pagerduty-incidents',
      name: 'PagerDuty',
      type: 'pagerduty',
      description: 'Critical incidents to PagerDuty',
      enabled: true,
      endpoint: 'https://events.pagerduty.com/v2/enqueue',
      retryPolicy: 'exponential (5 attempts)',
      timeout: 20,
      lastTest: '2024-01-22 13:50 UTC'
    },
    {
      id: 'webhook-external',
      name: 'External Webhook',
      type: 'webhook',
      description: 'Custom webhook for external system',
      enabled: false,
      endpoint: 'https://external-system.com/webhook',
      retryPolicy: 'exponential (3 attempts)',
      timeout: 30,
    }
  ]);

  const [rules, setRules] = useState<NotificationRule[]>([
    {
      id: 'rule-1',
      name: 'Critical Alarms',
      trigger: 'Alarm severity = Critical',
      channels: ['email-ops', 'slack-alerts', 'pagerduty-incidents'],
      severity: 'critical',
      enabled: true
    },
    {
      id: 'rule-2',
      name: 'Automation Failures',
      trigger: 'Automation execution failed',
      channels: ['email-ops', 'slack-alerts'],
      severity: 'high',
      enabled: true
    },
    {
      id: 'rule-3',
      name: 'Configuration Changes',
      trigger: 'System configuration modified',
      channels: ['email-ops'],
      severity: 'medium',
      enabled: true
    },
    {
      id: 'rule-4',
      name: 'Threshold Violations',
      trigger: 'KPI threshold breached',
      channels: ['slack-alerts'],
      severity: 'high',
      enabled: true
    }
  ]);

  const [savedStatus, setSavedStatus] = useState<string | null>(null);

  const toggleChannel = (id: string) => {
    setChannels(prev => prev.map(c => c.id === id ? { ...c, enabled: !c.enabled } : c));
  };

  const toggleRule = (id: string) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  };

  const handleSave = () => {
    setSavedStatus('Notification settings saved successfully');
    setTimeout(() => setSavedStatus(null), 3000);
  };

  const getChannelIcon = (type: string) => {
    switch (type) {
      case 'email':
        return '📧';
      case 'slack':
        return '💬';
      case 'webhook':
        return '🔗';
      case 'sms':
        return '📱';
      case 'pagerduty':
        return '🚨';
      default:
        return '📢';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-50 border-red-200 text-red-700';
      case 'high':
        return 'bg-orange-50 border-orange-200 text-orange-700';
      case 'medium':
        return 'bg-yellow-50 border-yellow-200 text-yellow-700';
      case 'low':
        return 'bg-blue-50 border-blue-200 text-blue-700';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Bell className="w-6 h-6 text-blue-600" />
          Notifications & Communication
        </h2>
        <p className="text-gray-500 text-sm mt-1">Configure notification channels and delivery rules</p>
      </div>

      {/* Notification Channels */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">Notification Channels</h3>
          <button className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold">
            <Plus className="w-4 h-4" />
            Add Channel
          </button>
        </div>

        <div className="space-y-3">
          {channels.map(channel => (
            <div key={channel.id} className={`p-4 rounded-lg border ${channel.enabled ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-200'}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{getChannelIcon(channel.type)}</span>
                    <div>
                      <h4 className={`font-semibold ${channel.enabled ? 'text-gray-900' : 'text-gray-600'}`}>{channel.name}</h4>
                      <p className="text-sm text-gray-500">{channel.description}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                    <div>
                      <p className="text-xs text-gray-600">Endpoint</p>
                      <p className="text-gray-900 font-mono text-xs truncate">{channel.endpoint}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Retry Policy</p>
                      <p className="text-gray-900 text-xs">{channel.retryPolicy}</p>
                    </div>
                    {channel.lastTest && (
                      <div>
                        <p className="text-xs text-gray-600">Last Test</p>
                        <p className="text-gray-900 text-xs">{channel.lastTest}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <button className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors text-sm font-semibold">
                    Test
                  </button>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={channel.enabled}
                      onChange={() => toggleChannel(channel.id)}
                      className="sr-only peer"
                    />
                    <div className={`w-11 h-6 rounded-full peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 transition-colors ${
                      channel.enabled ? 'bg-blue-600' : 'bg-gray-300'
                    } peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
                  </label>
                  <button className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notification Rules */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">Notification Rules</h3>
          <button className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold">
            <Plus className="w-4 h-4" />
            Add Rule
          </button>
        </div>

        <div className="space-y-3">
          {rules.map(rule => (
            <div key={rule.id} className={`p-4 rounded-lg border ${getSeverityColor(rule.severity)}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <AlertCircle className="w-5 h-5" />
                    <h4 className="font-semibold">{rule.name}</h4>
                    <span className="text-xs font-semibold px-2 py-1 rounded bg-white bg-opacity-50">
                      {rule.severity.toUpperCase()}
                    </span>
                  </div>

                  <p className="text-sm mb-3">
                    <strong>Trigger:</strong> {rule.trigger}
                  </p>

                  <div>
                    <p className="text-xs font-semibold mb-2">Channels:</p>
                    <div className="flex gap-2 flex-wrap">
                      {rule.channels.map(channelId => {
                        const channel = channels.find(c => c.id === channelId);
                        return channel ? (
                          <span key={channelId} className="text-xs px-2 py-1 rounded bg-white bg-opacity-50 font-semibold">
                            {channel.name}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer ml-4">
                  <input
                    type="checkbox"
                    checked={rule.enabled}
                    onChange={() => toggleRule(rule.id)}
                    className="sr-only peer"
                  />
                  <div className={`w-11 h-6 rounded-full peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 transition-colors ${
                    rule.enabled ? 'bg-blue-600' : 'bg-gray-300'
                  } peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Global Notification Preferences</h3>
        <div className="space-y-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" defaultChecked className="w-4 h-4" />
            <span className="text-sm text-gray-700">Enable all notifications</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" defaultChecked className="w-4 h-4" />
            <span className="text-sm text-gray-700">Include debug logs in notifications</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" defaultChecked className="w-4 h-4" />
            <span className="text-sm text-gray-700">Rate limit duplicate notifications (1 per 5 minutes)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="w-4 h-4" />
            <span className="text-sm text-gray-700">Aggregate multiple alerts into single notification</span>
          </label>
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
