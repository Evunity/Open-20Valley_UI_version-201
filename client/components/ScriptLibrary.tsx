import React, { useState } from 'react';
import { Plus, Copy, Trash2, Play, Tag, AlertTriangle, Zap, Clock, Search, Download, Calendar } from 'lucide-react';
import SearchableDropdown from './SearchableDropdown';
import { IconButton } from '@/components/ui/icon-button';

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
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [showForm, setShowForm] = useState(false);
  const [showExecution, setShowExecution] = useState<string | null>(null);
  const [parameters, setParameters] = useState<Record<string, string>>({});
  const [isCreating, setIsCreating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'RF Optimization' as any,
    description: '',
    content: '',
    vendor: 'Huawei',
    riskLevel: 'low' as 'low' | 'medium' | 'high'
  });

  // Filter scripts based on search, category, and time
  const getFilteredScripts = () => {
    let filtered = scripts;

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(s => s.category === selectedCategory);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(s =>
        s.name.toLowerCase().includes(query) ||
        s.description.toLowerCase().includes(query) ||
        s.vendor.toLowerCase().includes(query) ||
        s.category.toLowerCase().includes(query)
      );
    }

    // Time filter
    if (timeFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter(s => {
        const modDate = new Date(s.lastModified);
        const diffTime = now.getTime() - modDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        switch (timeFilter) {
          case 'today':
            return diffDays === 0;
          case 'week':
            return diffDays <= 7;
          case 'month':
            return diffDays <= 30;
          default:
            return true;
        }
      });
    }

    return filtered;
  };

  const filteredScripts = getFilteredScripts();

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

  const createScript = async () => {
    // Validate form
    if (!formData.name.trim()) {
      alert('Please enter a script name');
      return;
    }
    if (!formData.description.trim()) {
      alert('Please enter a description');
      return;
    }
    if (!formData.content.trim()) {
      alert('Please enter script content');
      return;
    }

    setIsCreating(true);
    try {
      // Create new script object
      const newScript: Script = {
        id: String(scripts.length + 1),
        name: formData.name,
        description: formData.description,
        category: formData.category,
        vendor: formData.vendor,
        commands: formData.content.split('\n').filter(line => line.trim()),
        parameters: [],
        requiredPermissions: [],
        riskLevel: formData.riskLevel,
        rollbackInstructions: 'Manual rollback required',
        created: new Date().toISOString().split('T')[0],
        lastModified: new Date().toISOString().split('T')[0],
        executionCount: 0,
        successRate: 0
      };

      // Add to scripts
      setScripts([...scripts, newScript]);

      // Reset form
      setFormData({
        name: '',
        category: 'RF Optimization',
        description: '',
        content: '',
        vendor: 'Huawei',
        riskLevel: 'low'
      });
      setShowForm(false);
      alert('Script created successfully!');
    } catch (error) {
      console.error('Error creating script:', error);
      alert('Failed to create script');
    } finally {
      setIsCreating(false);
    }
  };

  const copyScript = (script: Script) => {
    try {
      const scriptJson = JSON.stringify({
        name: script.name,
        description: script.description,
        category: script.category,
        vendor: script.vendor,
        commands: script.commands,
        riskLevel: script.riskLevel,
        rollbackInstructions: script.rollbackInstructions
      }, null, 2);

      navigator.clipboard.writeText(scriptJson);
      setCopiedId(script.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Error copying script:', error);
      alert('Failed to copy script');
    }
  };

  const deleteScript = (scriptId: string) => {
    const script = scripts.find(s => s.id === scriptId);
    if (window.confirm(`Are you sure you want to delete "${script?.name}"?`)) {
      setScripts(scripts.filter(s => s.id !== scriptId));
      if (showExecution === scriptId) {
        setShowExecution(null);
      }
    }
  };

  const exportToExcel = () => {
    // Prepare data for Excel
    const excelData = filteredScripts.map(script => ({
      'Script Name': script.name,
      'Description': script.description,
      'Category': script.category,
      'Vendor': script.vendor,
      'Risk Level': script.riskLevel,
      'Created': script.created,
      'Last Modified': script.lastModified,
      'Executions': script.executionCount,
      'Success Rate (%)': script.successRate.toFixed(1),
      'Commands': script.commands.join('; '),
      'Parameters': script.parameters.map(p => `${p.name} (${p.type})`).join('; ') || 'None',
      'Permissions': script.requiredPermissions.join('; ') || 'None',
      'Rollback Instructions': script.rollbackInstructions
    }));

    // Create CSV content
    if (excelData.length === 0) {
      alert('No scripts to export');
      return;
    }

    // Get headers
    const headers = Object.keys(excelData[0]);
    const rows = excelData.map(obj => headers.map(header => {
      const value = obj[header as keyof typeof obj];
      // Escape quotes and wrap in quotes if contains comma
      const stringValue = String(value);
      return stringValue.includes(',') ? `"${stringValue.replace(/"/g, '""')}"` : stringValue;
    }));

    // Create CSV string
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Download file
    const link = document.createElement('a');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `scripts_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col h-full gap-4 p-4">
      {/* Header - Top Controls */}
      <div className="flex gap-2 items-center justify-between">
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold flex items-center gap-2 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          Create Script
        </button>

        <button
          onClick={exportToExcel}
          disabled={filteredScripts.length === 0}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          title="Export filtered scripts to CSV"
        >
          <Download className="w-4 h-4" />
          Export to Excel
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search scripts by name, description, vendor..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-3 py-2 border border-border rounded-lg bg-input text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-blue-500 outline-none transition"
        />
      </div>

      {/* Filters Row */}
      <div className="flex gap-3 items-end flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-semibold text-muted-foreground mb-1">Category</label>
          <SearchableDropdown
            label=""
            options={['All Categories', ...SCRIPT_CATEGORIES]}
            selected={selectedCategory === '' ? ['All Categories'] : [selectedCategory]}
            onChange={(selected) => {
              setSelectedCategory(selected[0] === 'All Categories' ? '' : selected[0]);
            }}
            placeholder="Select category..."
            multiSelect={false}
            searchable={true}
            compact={true}
          />
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-semibold text-muted-foreground mb-1 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            Time Filter
          </label>
          <SearchableDropdown
            label=""
            options={['All Time', 'Today', 'This Week', 'This Month']}
            selected={
              timeFilter === 'today' ? ['Today'] :
              timeFilter === 'week' ? ['This Week'] :
              timeFilter === 'month' ? ['This Month'] :
              ['All Time']
            }
            onChange={(selected) => {
              const timeMap: Record<string, 'all' | 'today' | 'week' | 'month'> = {
                'All Time': 'all',
                'Today': 'today',
                'This Week': 'week',
                'This Month': 'month'
              };
              setTimeFilter(timeMap[selected[0]] || 'all');
            }}
            placeholder="Select time range..."
            multiSelect={false}
            searchable={true}
            compact={true}
          />
        </div>

        {/* Results count */}
        <div className="px-3 py-2 bg-muted/40 rounded-lg text-xs font-semibold text-muted-foreground">
          {filteredScripts.length} script{filteredScripts.length !== 1 ? 's' : ''} found
        </div>
      </div>

      {showForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Script Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Reset Cell Configuration"
                className="w-full px-3 py-1.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <SearchableDropdown
                label="Category"
                options={[...SCRIPT_CATEGORIES]}
                selected={[formData.category]}
                onChange={(selected) => setFormData({ ...formData, category: selected[0] as any })}
                placeholder="Select category..."
                multiSelect={false}
                searchable={true}
                compact={true}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="What does this script do?"
              rows={2}
              className="w-full px-3 py-1.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-muted-foreground">Script Content</label>
              <label className="text-xs font-semibold text-primary cursor-pointer hover:text-primary/90">
                <input
                  type="file"
                  accept=".sh,.txt,.sql,.py,.js"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        const text = event.target?.result as string;
                        setFormData({ ...formData, content: text });
                      };
                      reader.readAsText(file);
                    }
                  }}
                  className="hidden"
                />
                📁 Upload Script File
              </label>
            </div>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Enter script commands, one per line..."
              rows={6}
              className="w-full px-3 py-1.5 border border-border rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <SearchableDropdown
                label="Vendor"
                options={['Huawei', 'Nokia', 'Ericsson', 'ZTE']}
                selected={[formData.vendor]}
                onChange={(selected) => setFormData({ ...formData, vendor: selected[0] })}
                placeholder="Select vendor..."
                multiSelect={false}
                searchable={true}
                compact={true}
              />
            </div>
            <div>
              <SearchableDropdown
                label="Risk Level"
                options={['Low', 'Medium', 'High']}
                selected={[formData.riskLevel === 'low' ? 'Low' : formData.riskLevel === 'medium' ? 'Medium' : 'High']}
                onChange={(selected) => {
                  const riskMap: Record<string, 'low' | 'medium' | 'high'> = {
                    'Low': 'low',
                    'Medium': 'medium',
                    'High': 'high'
                  };
                  setFormData({ ...formData, riskLevel: riskMap[selected[0]] });
                }}
                placeholder="Select risk level..."
                multiSelect={false}
                searchable={true}
                compact={true}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={createScript}
              disabled={isCreating}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed transition"
            >
              {isCreating ? 'Creating...' : 'Create Script'}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold transition"
            >
              Cancel
            </button>
          </div>
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
                  <p className="text-sm text-gray-600 mb-1 whitespace-pre-wrap break-words">{script.description}</p>

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
                  <IconButton
                    onClick={() => executeScript(script.id)}
                    variant="active"
                    title="Run script"
                  >
                    <Play />
                  </IconButton>
                  <IconButton
                    onClick={() => copyScript(script)}
                    variant={copiedId === script.id ? 'success' : 'default'}
                    title={copiedId === script.id ? 'Copied!' : 'Copy script'}
                  >
                    <Copy />
                  </IconButton>
                  <IconButton
                    onClick={() => deleteScript(script.id)}
                    variant="destructive"
                    title="Delete script"
                  >
                    <Trash2 />
                  </IconButton>
                </div>
              </div>

              {/* Commands */}
              <div className="bg-gray-800 text-green-400 rounded p-2 text-xs font-mono max-h-20 overflow-y-auto mb-2">
                {script.commands.map((cmd, i) => (
                  <div key={i}>{cmd}</div>
                ))}
              </div>

              {/* Rollback */}
              <div className="text-xs">
                <div className="p-2 surface-warning border rounded flex items-start gap-1">
                  <AlertTriangle className="w-3 h-3 text-current mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-current">Rollback:</p>
                    <p className="text-current/90">{script.rollbackInstructions}</p>
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
