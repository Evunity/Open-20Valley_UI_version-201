import React, { useState } from 'react';
import { Search, Filter, ChevronDown, Clock, User } from 'lucide-react';

interface ParameterExplorerProps {
  selectedTarget: any;
  onTargetChange: (target: any) => void;
}

interface Parameter {
  name: string;
  currentValue: string;
  defaultValue: string;
  category: 'RF' | 'Transport' | 'IP' | 'Power' | 'System';
  lastModified: string;
  modifiedBy: string;
  description: string;
}

const MOCK_PARAMETERS: Parameter[] = [
  {
    name: 'TX Power',
    currentValue: '40',
    defaultValue: '43',
    category: 'RF',
    lastModified: '2024-12-02 14:30',
    modifiedBy: 'Engineer.A',
    description: 'Transmit power level in dBm'
  },
  {
    name: 'Cell Barring',
    currentValue: 'False',
    defaultValue: 'False',
    category: 'RF',
    lastModified: '2024-11-15 09:00',
    modifiedBy: 'System',
    description: 'Whether cell is barred from access'
  },
  {
    name: 'DL Bandwidth',
    currentValue: '20',
    defaultValue: '20',
    category: 'Transport',
    lastModified: '2024-10-20 16:45',
    modifiedBy: 'Engineer.B',
    description: 'Downlink bandwidth in MHz'
  },
  {
    name: 'IP Address',
    currentValue: '192.168.1.100',
    defaultValue: '192.168.1.1',
    category: 'IP',
    lastModified: '2024-12-01 11:20',
    modifiedBy: 'Network.Admin',
    description: 'Management IP address'
  },
  {
    name: 'Power Supply Status',
    currentValue: 'Active',
    defaultValue: 'Standby',
    category: 'Power',
    lastModified: '2024-11-30 08:00',
    modifiedBy: 'System',
    description: 'Primary power supply status'
  }
];

export const ParameterExplorer: React.FC<ParameterExplorerProps> = ({ selectedTarget }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [expandedParam, setExpandedParam] = useState<string | null>(null);

  const categories = ['RF', 'Transport', 'IP', 'Power', 'System'] as const;

  const filteredParams = MOCK_PARAMETERS.filter(param => {
    const matchesSearch = param.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         param.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || param.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col h-full gap-4 p-4">
      {/* Search & Filter */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search parameters by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex gap-2">
          <Filter className="w-5 h-5 text-gray-400 self-center" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Parameters List */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {filteredParams.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-gray-500">
            <p className="text-sm">No parameters found matching your criteria</p>
          </div>
        ) : (
          filteredParams.map((param) => (
            <div key={param.name} className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setExpandedParam(expandedParam === param.name ? null : param.name)}
                className="w-full p-3 bg-white hover:bg-gray-50 flex items-center justify-between transition"
              >
                <div className="text-left flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900">{param.name}</p>
                    <span className={`text-xs px-2 py-1 rounded font-semibold ${
                      param.category === 'RF' ? 'bg-purple-100 text-purple-800' :
                      param.category === 'Transport' ? 'bg-blue-100 text-blue-800' :
                      param.category === 'IP' ? 'bg-green-100 text-green-800' :
                      param.category === 'Power' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {param.category}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{param.description}</p>
                </div>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition ${
                  expandedParam === param.name ? 'rotate-180' : ''
                }`} />
              </button>

              {expandedParam === param.name && (
                <div className="p-4 bg-gray-50 border-t border-gray-200 space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-semibold text-gray-700 mb-1">Current Value</p>
                      <p className="text-sm font-mono bg-white border border-gray-200 rounded px-3 py-2">
                        {param.currentValue}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-700 mb-1">Default Value</p>
                      <p className="text-sm font-mono bg-white border border-gray-200 rounded px-3 py-2">
                        {param.defaultValue}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-600">Last Modified</p>
                        <p className="text-sm font-semibold text-gray-900">{param.lastModified}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-600">Modified By</p>
                        <p className="text-sm font-semibold text-gray-900">{param.modifiedBy}</p>
                      </div>
                    </div>
                  </div>

                  {param.currentValue !== param.defaultValue && (
                    <div className="p-2 bg-amber-50 border border-amber-200 rounded">
                      <p className="text-xs text-amber-800">
                        <strong>⚠️</strong> This parameter has been modified from default
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-sm text-blue-900">
          Showing <strong>{filteredParams.length}</strong> of <strong>{MOCK_PARAMETERS.length}</strong> parameters
        </p>
      </div>
    </div>
  );
};
