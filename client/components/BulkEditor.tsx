import React, { useState } from 'react';

interface BulkEditorProps {
  selectedTarget: any;
  onTargetChange: (target: any) => void;
}

export const BulkEditor: React.FC<BulkEditorProps> = () => {
  const [content, setContent] = useState('# Bulk Configuration Editor\n# Enter CSV or JSON format\n# Site,Parameter,OldValue,NewValue\n');

  return (
    <div className="flex flex-col h-full gap-4 p-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Format</label>
          <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>CSV</option>
            <option>JSON</option>
            <option>YAML</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Scope</label>
          <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>All Sites</option>
            <option>Selected Region</option>
            <option>Selected Cluster</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Configuration Changes</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full h-96 px-3 py-2 border border-gray-300 rounded-lg font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex gap-2">
        <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold">
          Validate Bulk Change
        </button>
        <button className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold">
          Dry Run
        </button>
      </div>

      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
        <p><strong>Tip:</strong> Validate and dry-run changes before execution. Bulk operations are atomic.</p>
      </div>
    </div>
  );
};
