import React, { useState } from 'react';
import { Plus, Copy, Trash2, Play } from 'lucide-react';

interface ScriptLibraryProps {
  selectedTarget: any;
  onTargetChange: (target: any) => void;
}

interface Script {
  id: string;
  name: string;
  description: string;
  vendor: string;
  commands: string[];
  created: string;
  lastModified: string;
}

const MOCK_SCRIPTS: Script[] = [
  {
    id: '1',
    name: 'Reset Cell Parameters',
    description: 'Reset cell to default configuration',
    vendor: 'Huawei',
    commands: ['LST CELL;', 'GET CELLPOWER;', 'SET TXPOWER:43;'],
    created: '2024-11-15',
    lastModified: '2024-12-01'
  },
  {
    id: '2',
    name: 'Enable Cell Barring',
    description: 'Temporarily bar a cell from service',
    vendor: 'Nokia',
    commands: ['configure', 'set cell parameters', 'enable barring'],
    created: '2024-10-20',
    lastModified: '2024-11-28'
  }
];

export const ScriptLibrary: React.FC<ScriptLibraryProps> = () => {
  const [scripts, setScripts] = useState<Script[]>(MOCK_SCRIPTS);
  const [selectedScript, setSelectedScript] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="flex flex-col h-full gap-4 p-4">
      {/* Header */}
      <button
        onClick={() => setShowForm(!showForm)}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold flex items-center gap-2 w-fit"
      >
        <Plus className="w-4 h-4" />
        Create New Script
      </button>

      {showForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Script Name</label>
            <input type="text" placeholder="e.g., Reset Cell Configuration" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
            <textarea placeholder="What does this script do?" rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Vendor</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                <option>Huawei</option>
                <option>Nokia</option>
                <option>Ericsson</option>
              </select>
            </div>
          </div>
          <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold">
            Create Script
          </button>
        </div>
      )}

      {/* Scripts List */}
      <div className="space-y-2 flex-1 overflow-y-auto">
        {scripts.map((script) => (
          <div key={script.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{script.name}</p>
                <p className="text-sm text-gray-600">{script.description}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {script.vendor} • Created {script.created} • Modified {script.lastModified}
                </p>
              </div>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-blue-100 rounded transition" title="Run script">
                  <Play className="w-4 h-4 text-blue-600" />
                </button>
                <button className="p-2 hover:bg-gray-200 rounded transition" title="Copy script">
                  <Copy className="w-4 h-4 text-gray-600" />
                </button>
                <button className="p-2 hover:bg-red-100 rounded transition" title="Delete script">
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              </div>
            </div>
            <div className="bg-gray-800 text-green-400 rounded p-2 text-xs font-mono max-h-24 overflow-y-auto">
              {script.commands.map((cmd, i) => (
                <div key={i}>{cmd}</div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
