import React, { useState } from 'react';
import { Save, RotateCcw, Gauge, AlertTriangle } from 'lucide-react';

interface PerformanceSetting {
  category: string;
  settings: Record<string, { value: any; unit: string; description: string; warning: string }>;
}

export default function PerformanceLimits() {
  const [settings, setSettings] = useState<PerformanceSetting[]>([
    {
      category: 'API Rate Limiting',
      settings: {
        'api-requests-per-minute': {
          value: 1000,
          unit: 'req/min',
          description: 'Maximum API requests per minute per user',
          warning: 'Exceeding this will result in 429 Too Many Requests errors'
        },
        'bulk-operations-per-minute': {
          value: 50,
          unit: 'ops/min',
          description: 'Maximum bulk operations per minute',
          warning: 'Protects system stability during large operations'
        },
        'export-requests-per-hour': {
          value: 20,
          unit: 'exports/hr',
          description: 'Maximum data export requests per hour',
          warning: 'Prevents data exfiltration and disk I/O overload'
        },
        'webhook-delivery-rate': {
          value: 500,
          unit: 'events/min',
          description: 'Maximum webhook events sent per minute',
          warning: 'Prevents overwhelming external systems'
        }
      }
    },
    {
      category: 'Query & Search Performance',
      settings: {
        'query-timeout': {
          value: 60,
          unit: 'seconds',
          description: 'Maximum query execution time',
          warning: 'Queries exceeding this will be automatically cancelled'
        },
        'search-result-limit': {
          value: 100000,
          unit: 'records',
          description: 'Maximum records returned per search',
          warning: 'Prevents memory exhaustion on large result sets'
        },
        'max-concurrent-queries': {
          value: 100,
          unit: 'queries',
          description: 'Maximum concurrent database queries',
          warning: 'Protects database connection pool'
        },
        'aggregation-bucket-limit': {
          value: 10000,
          unit: 'buckets',
          description: 'Maximum buckets in aggregation queries',
          warning: 'Prevents excessive memory usage in analytics'
        }
      }
    },
    {
      category: 'Alarm & Event Processing',
      settings: {
        'alarm-processing-threshold': {
          value: 5000,
          unit: 'alarms/min',
          description: 'Maximum alarms processed per minute',
          warning: 'Alarms exceeding this may be dropped or queued'
        },
        'event-buffer-size': {
          value: 500000,
          unit: 'events',
          description: 'In-memory event buffer capacity',
          warning: 'Exceeding this triggers emergency flushing to disk'
        },
        'correlation-window': {
          value: 300,
          unit: 'seconds',
          description: 'Time window for alarm correlation',
          warning: 'Larger windows use more memory'
        },
        'deduplication-hash-limit': {
          value: 100000,
          unit: 'unique signatures',
          description: 'Maximum unique alarm signatures tracked',
          warning: 'Exceeding this may reduce deduplication effectiveness'
        }
      }
    },
    {
      category: 'Automation & Scripting',
      settings: {
        'script-execution-timeout': {
          value: 300,
          unit: 'seconds',
          description: 'Maximum script execution time',
          warning: 'Scripts exceeding this will be forcibly terminated'
        },
        'max-concurrent-automations': {
          value: 50,
          unit: 'automations',
          description: 'Maximum automations running simultaneously',
          warning: 'Prevents resource exhaustion'
        },
        'script-memory-limit': {
          value: 512,
          unit: 'MB',
          description: 'Maximum memory per script process',
          warning: 'Scripts exceeding this will be killed'
        },
        'automation-queue-depth': {
          value: 10000,
          unit: 'tasks',
          description: 'Maximum pending automation tasks',
          warning: 'Exceeding this may drop new automation requests'
        }
      }
    },
    {
      category: 'Topology & Visualization',
      settings: {
        'max-topology-objects': {
          value: 10000,
          unit: 'objects',
          description: 'Maximum network objects in topology view',
          warning: 'Rendering >10k objects may cause UI slowness'
        },
        'map-rendering-timeout': {
          value: 30,
          unit: 'seconds',
          description: 'Maximum time to render topology map',
          warning: 'Complex maps exceeding this will show partial view'
        },
        'topology-refresh-interval': {
          value: 5,
          unit: 'seconds',
          description: 'Minimum interval between topology updates',
          warning: 'Smaller intervals increase CPU usage'
        },
        'replay-buffer-depth': {
          value: 24,
          unit: 'hours',
          description: 'Maximum historical depth for topology replay',
          warning: 'Larger buffers consume more storage'
        }
      }
    },
    {
      category: 'Reporting & Analytics',
      settings: {
        'report-generation-timeout': {
          value: 600,
          unit: 'seconds',
          description: 'Maximum time to generate a report',
          warning: 'Reports exceeding this will be cancelled'
        },
        'max-report-data-points': {
          value: 1000000,
          unit: 'data points',
          description: 'Maximum data points per report',
          warning: 'Larger reports use more memory and disk'
        },
        'scheduled-reports-per-tenant': {
          value: 50,
          unit: 'reports',
          description: 'Maximum scheduled reports per tenant',
          warning: 'Prevents excessive background processing'
        },
        'dashboard-refresh-interval': {
          value: 60,
          unit: 'seconds',
          description: 'Minimum interval between dashboard updates',
          warning: 'Smaller intervals increase server load'
        }
      }
    }
  ]);

  const [savedStatus, setSavedStatus] = useState<string | null>(null);

  const handleSettingChange = (categoryIndex: number, settingKey: string, newValue: any) => {
    setSettings(prev => {
      const newSettings = [...prev];
      newSettings[categoryIndex].settings[settingKey].value = newValue;
      return newSettings;
    });
  };

  const handleSave = () => {
    setSavedStatus('Performance limits saved successfully');
    setTimeout(() => setSavedStatus(null), 3000);
  };

  return (
    <div className="p-8 space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Gauge className="w-6 h-6 text-blue-600" />
          Performance & Limits
        </h2>
        <p className="text-gray-500 text-sm mt-1">Configure rate limits, timeouts, thresholds, and resource allocation</p>
      </div>

      {/* Warning Box */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
        <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-yellow-800">
          <strong>Caution:</strong> Modifying these limits can impact system stability. Lower limits increase responsiveness but may drop requests. Higher limits may cause resource exhaustion. Test changes in lab environment first.
        </div>
      </div>

      {/* Settings Categories */}
      <div className="space-y-6">
        {settings.map((category, categoryIndex) => (
          <div key={category.category} className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">{category.category}</h3>
            </div>

            <div className="p-4 space-y-4">
              {Object.entries(category.settings).map(([key, setting]) => (
                <div key={key} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="mb-3">
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      {key
                        .split('-')
                        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(' ')}
                    </label>
                    <p className="text-sm text-gray-600">{setting.description}</p>
                  </div>

                  <div className="flex items-end gap-3">
                    <div className="flex-1">
                      <input
                        type="number"
                        value={setting.value}
                        onChange={(e) => handleSettingChange(categoryIndex, key, parseInt(e.target.value) || e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-700 min-w-fit">{setting.unit}</span>
                  </div>

                  {setting.warning && (
                    <div className="mt-2 flex gap-2 text-xs text-orange-700 bg-orange-50 p-2 rounded border border-orange-200">
                      <AlertTriangle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                      <span>{setting.warning}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Performance Impact Matrix */}
      <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
        <h3 className="font-semibold text-gray-900 mb-4">Understanding Performance Impact</h3>
        <div className="space-y-3 text-sm text-gray-700">
          <div className="flex gap-4">
            <div className="font-semibold text-blue-700 w-32">Higher Limits →</div>
            <div>
              Better user experience (fewer dropped requests), but increased server CPU, memory, and network usage. Risk of resource exhaustion.
            </div>
          </div>
          <div className="flex gap-4 border-t border-gray-300 pt-3">
            <div className="font-semibold text-red-700 w-32">Lower Limits →</div>
            <div>
              Better resource conservation, but increased rejection of legitimate requests. Users may see "Too Many Requests" or timeout errors.
            </div>
          </div>
          <div className="flex gap-4 border-t border-gray-300 pt-3">
            <div className="font-semibold text-green-700 w-32">Best Practice:</div>
            <div>
              Set limits based on your hardware capacity and expected peak load. Monitor system metrics (CPU, memory, disk I/O) to adjust limits as needed.
            </div>
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
          Save Limits
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
