import React, { useState } from 'react';
import { Plus, Copy, Trash2, Play, Tag, Lock, AlertTriangle, Zap, Clock } from 'lucide-react';

interface ScriptLibraryProps {
  selectedTarget: any;
  onTargetChange: (target: any) => void;
}

interface ScriptParameter {
  name: string;
  type: 'string' | 'number' | 'enum';
  description: string;
  default?: string;
  options?: string[];
}

interface Script {
  id: string;
  name: string;
  description: string;
  category: 'RF Optimization' | 'Transport Tuning' | 'IP Configuration' | 'Emergency Recovery' | 'Audit Script';
  vendor: string;
  commands: string[];
  parameters: ScriptParameter[];
  requiredPermissions: string[];
  riskLevel: 'low' | 'medium' | 'high';
  rollbackInstructions: string;
  created: string;
  lastModified: string;
  executionCount: number;
  successRate: number;
}

const SCRIPT_CATEGORIES = ['RF Optimization', 'Transport Tuning', 'IP Configuration', 'Emergency Recovery', 'Audit Script'] as const;

const MOCK_SCRIPTS: Script[] = [
  {
    id: '1',
    name: 'Reset Cell Parameters',
    description: 'Reset cell to default configuration',
    category: 'RF Optimization',
    vendor: 'Huawei',
    commands: ['LST CELL:ID={CELL_ID};', 'GET CELLPOWER;', 'SET TXPOWER:{VALUE};'],
    parameters: [
      { name: 'CELL_ID', type: 'string', description: 'Cell identifier', default: '1001' },
      { name: 'VALUE', type: 'number', description: 'TX Power in dBm', default: '43' }
    ],
    requiredPermissions: ['RF_MODIFY', 'BULK_EXECUTE'],
    riskLevel: 'medium',
    rollbackInstructions: 'Execute rollback script RESTORE_TX_POWER with original values',
    created: '2024-11-15',
    lastModified: '2024-12-01',
    executionCount: 45,
    successRate: 96.5
  },
  {
    id: '2',
    name: 'Enable Cell Barring',
    description: 'Temporarily bar a cell from service',
    category: 'Emergency Recovery',
    vendor: 'Nokia',
    commands: ['configure', 'set cell parameters ID={CELL_ID}', 'enable barring duration={DURATION}'],
    parameters: [
      { name: 'CELL_ID', type: 'string', description: 'Cell to bar' },
      { name: 'DURATION', type: 'enum', description: 'Barring duration', options: ['1h', '4h', '8h', '24h'] }
    ],
    requiredPermissions: ['EMERGENCY_ACCESS'],
    riskLevel: 'high',
    rollbackInstructions: 'Manually disable barring with DISABLE_BARRING command',
    created: '2024-10-20',
    lastModified: '2024-11-28',
    executionCount: 12,
    successRate: 100
  },
  {
    id: '3',
    name: 'Transport Link Health Check',
    description: 'Comprehensive transport link diagnostics',
    category: 'Transport Tuning',
    vendor: 'Ericsson',
    commands: ['show transport interfaces', 'show link statistics', 'check optical power'],
    parameters: [
      { name: 'LINK_ID', type: 'string', description: 'Link identifier' }
    ],
    requiredPermissions: ['TRANSPORT_VIEW'],
    riskLevel: 'low',
    rollbackInstructions: 'No rollback needed - read-only operation',
    created: '2024-11-01',
    lastModified: '2024-12-02',
    executionCount: 156,
    successRate: 99.2
  }
];

export const ScriptLibrary: React.FC<ScriptLibraryProps> = () => {
  const [scripts, setScripts] = useState<Script[]>(MOCK_SCRIPTS);
  const [selectedScript, setSelectedScript] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const [showExecution, setShowExecution] = useState<string | null>(null);
  const [parameters, setParameters] = useState<Record<string, string>>({});

  const filteredScripts = selectedCategory
    ? scripts.filter(s => s.category === selectedCategory)
    : scripts;

  const getRiskColor = (level: string) => {
    const colors = {
      low: 'bg-green-100 text-green-800 border-green-300',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      high: 'bg-red-100 text-red-800 border-red-300'
    };
    return colors[level as keyof typeof colors] || colors.low;
  };

  const executeScript = (scriptId: string) => {
    const script = scripts.find(s => s.id === scriptId);
    if (script) {
      // Initialize parameters
      const params: Record<string, string> = {};
      script.parameters.forEach(p => {
        params[p.name] = p.default || '';
      });
      setParameters(params);
      setShowExecution(scriptId);
    }
  };

  const runScript = () => {
    // Execute with parameters
    const script = scripts.find(s => s.id === showExecution);
    if (script) {
      const cmd = script.commands.join('; ');
      let finalCmd = cmd;
      Object.entries(parameters).forEach(([key, value]) => {
        finalCmd = finalCmd.replace(`{${key}}`, value);
      });
      console.log('Executing:', finalCmd);
      alert(`Script executed with parameters:\n${finalCmd}`);
      setShowExecution(null);
    }
  };

  return (
    <div className="flex flex-col h-full gap-4 p-4">
      {/* Header */}
      <div className="flex gap-4">
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create New Script
        </button>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        >
          <option value="">All Categories</option>
          {SCRIPT_CATEGORIES.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {showForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Script Name</label>
              <input type="text" placeholder="e.g., Reset Cell Configuration" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                {SCRIPT_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
            <textarea placeholder="What does this script do?" rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Vendor</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                <option>Huawei</option>
                <option>Nokia</option>
                <option>Ericsson</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Risk Level</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Required Permissions</label>
              <input type="text" placeholder="e.g., RF_MODIFY, BULK_EXECUTE" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
          </div>

          <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold">
            Create Script
          </button>
        </div>
      )}

      {/* Scripts List */}
      <div className="space-y-2 flex-1 overflow-y-auto">
        {filteredScripts.map((script) => (
          <div key={script.id}>
            <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-gray-900">{script.name}</p>
                    <span className={`text-xs px-2 py-0.5 rounded border font-semibold ${getRiskColor(script.riskLevel)}`}>
                      {script.riskLevel}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{script.description}</p>

                  <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap mt-2">
                    <div className="flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      {script.category}
                    </div>
                    <div>• {script.vendor}</div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Modified {script.lastModified}
                    </div>
                    <div>• {script.executionCount} executions</div>
                    <div className="text-green-600 font-semibold">{script.successRate}% success</div>
                  </div>

                  {script.parameters.length > 0 && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-blue-600">
                      <Zap className="w-3 h-3" />
                      {script.parameters.length} parameterized variable{script.parameters.length > 1 ? 's' : ''}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => executeScript(script.id)}
                    className="p-2 hover:bg-blue-100 rounded transition"
                    title="Run script"
                  >
                    <Play className="w-4 h-4 text-blue-600" />
                  </button>
                  <button className="p-2 hover:bg-gray-200 rounded transition" title="Copy script">
                    <Copy className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    className="p-2 hover:bg-red-100 rounded transition"
                    title="Delete script"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>

              {/* Commands */}
              <div className="bg-gray-800 text-green-400 rounded p-2 text-xs font-mono max-h-20 overflow-y-auto mb-2">
                {script.commands.map((cmd, i) => (
                  <div key={i}>{cmd}</div>
                ))}
              </div>

              {/* Permissions & Rollback */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 bg-blue-50 rounded flex items-start gap-1">
                  <Lock className="w-3 h-3 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-blue-900">Permissions:</p>
                    <p className="text-blue-700">{script.requiredPermissions.join(', ')}</p>
                  </div>
                </div>
                <div className="p-2 bg-amber-50 rounded flex items-start gap-1">
                  <AlertTriangle className="w-3 h-3 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-amber-900">Rollback:</p>
                    <p className="text-amber-700">{script.rollbackInstructions}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Execution Form */}
            {showExecution === script.id && (
              <div className="border-t-2 border-blue-500 bg-blue-50 p-4 rounded-b-lg">
                <h4 className="font-semibold text-gray-900 mb-3">Execute Script with Parameters</h4>

                {script.parameters.length > 0 ? (
                  <div className="space-y-3 mb-3">
                    {script.parameters.map(param => (
                      <div key={param.name}>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                          {param.name}
                          <span className="text-xs text-gray-500 ml-1">({param.type})</span>
                        </label>
                        <p className="text-xs text-gray-600 mb-1">{param.description}</p>
                        {param.type === 'enum' ? (
                          <select
                            value={parameters[param.name] || ''}
                            onChange={(e) => setParameters({ ...parameters, [param.name]: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          >
                            {param.options?.map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type={param.type === 'number' ? 'number' : 'text'}
                            value={parameters[param.name] || param.default || ''}
                            onChange={(e) => setParameters({ ...parameters, [param.name]: e.target.value })}
                            placeholder={param.default}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-600 mb-3">No parameters required</p>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={runScript}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
                  >
                    <Play className="w-4 h-4 inline mr-2" />
                    Execute Script
                  </button>
                  <button
                    onClick={() => setShowExecution(null)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
