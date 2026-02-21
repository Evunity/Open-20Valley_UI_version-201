import React, { useState } from 'react';
import { Plus, Trash2, Settings, AlertCircle, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import { RunbookNode, Runbook } from '../utils/automationData';

interface RunbookDesignerProps {
  onSave?: (runbook: Runbook) => void;
  onCancel?: () => void;
}

export const RunbookDesigner: React.FC<RunbookDesignerProps> = ({ onSave, onCancel }) => {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [nodes, setNodes] = useState<RunbookNode[]>([
    {
      id: 'trigger_1',
      type: 'trigger',
      label: 'Alarm Detected',
      config: { severity: 'critical' },
      expectedRuntime: 0
    },
    {
      id: 'action_1',
      type: 'action',
      label: 'Ping Node',
      config: { timeout: 30 },
      expectedRuntime: 5
    },
    {
      id: 'decision_1',
      type: 'decision',
      label: 'Node Reachable?',
      config: {},
      expectedRuntime: 0
    },
    {
      id: 'action_2',
      type: 'action',
      label: 'Restart DU',
      config: { timeout: 60 },
      expectedRuntime: 45,
      rollbackAvailable: true
    },
    {
      id: 'action_3',
      type: 'action',
      label: 'Failover Transport',
      config: { timeout: 120 },
      expectedRuntime: 90,
      rollbackAvailable: true
    },
    {
      id: 'validation_1',
      type: 'validation',
      label: 'Validate Recovery',
      config: { checkInterval: 10 },
      expectedRuntime: 20
    }
  ]);

  const getNodeIcon = (type: RunbookNode['type']) => {
    const icons = {
      trigger: '🔔',
      action: '⚙️',
      decision: '❓',
      wait: '⏱️',
      validation: '✓'
    };
    return icons[type];
  };

  const getNodeColor = (type: RunbookNode['type']) => {
    const colors = {
      trigger: 'bg-blue-100 border-blue-300 text-blue-800',
      action: 'bg-purple-100 border-purple-300 text-purple-800',
      decision: 'bg-amber-100 border-amber-300 text-amber-800',
      wait: 'bg-gray-100 border-gray-300 text-gray-800',
      validation: 'bg-green-100 border-green-300 text-green-800'
    };
    return colors[type];
  };

  const handleAddNode = (type: RunbookNode['type']) => {
    const newNode: RunbookNode = {
      id: `${type}_${Date.now()}`,
      type,
      label: `New ${type}`,
      config: {},
      expectedRuntime: 10
    };
    setNodes([...nodes, newNode]);
  };

  const handleDeleteNode = (id: string) => {
    setNodes(nodes.filter(n => n.id !== id));
    setSelectedNode(null);
  };

  const handleNodeUpdate = (id: string, updates: Partial<RunbookNode>) => {
    setNodes(nodes.map(n => (n.id === id ? { ...n, ...updates } : n)));
  };

  const calculateTotalRuntime = () => {
    return nodes.reduce((sum, node) => sum + (node.expectedRuntime || 0), 0);
  };

  const currentNode = nodes.find(n => n.id === selectedNode);

  return (
    <div className="flex h-full gap-4 p-4 bg-gray-50">
      {/* Left: Node Palette */}
      <div className="w-48 bg-white rounded-lg border border-gray-200 p-3 flex flex-col overflow-y-auto">
        <h3 className="text-xs font-bold text-gray-900 mb-3 px-2">Node Types</h3>
        <div className="space-y-2">
          {(['trigger', 'action', 'decision', 'wait', 'validation'] as const).map(type => (
            <button
              key={type}
              onClick={() => handleAddNode(type)}
              className="w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 transition"
            >
              <Plus className="w-3 h-3" />
              <span className="capitalize">{type}</span>
            </button>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t border-gray-200">
          <p className="text-xs font-semibold text-gray-700 px-2 mb-2">Features</p>
          <ul className="text-xs text-gray-600 space-y-1 px-2">
            <li>✓ Parallel branches</li>
            <li>✓ Conditional loops</li>
            <li>✓ Retry logic</li>
            <li>✓ Timeouts</li>
            <li>✓ Fallback paths</li>
          </ul>
        </div>
      </div>

      {/* Center: Graph Canvas */}
      <div className="flex-1 bg-white rounded-lg border border-gray-200 p-4 overflow-y-auto">
        <h3 className="text-xs font-bold text-gray-900 mb-4">Runbook Graph</h3>
        <div className="flex flex-col gap-2">
          {nodes.map((node, idx) => (
            <div key={node.id}>
              <button
                onClick={() => setSelectedNode(node.id)}
                className={`w-full p-3 rounded-lg border-2 text-left transition ${
                  selectedNode === node.id
                    ? 'border-blue-600 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300'
                } ${getNodeColor(node.type)}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-lg flex-shrink-0">{getNodeIcon(node.type)}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">{node.label}</p>
                      {node.expectedRuntime && (
                        <p className="text-xs opacity-75 mt-0.5">
                          Runtime: {node.expectedRuntime}s
                          {node.rollbackAvailable && ' • Rollback: ✓'}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteNode(node.id);
                    }}
                    className="p-1 text-red-600 hover:bg-red-100 rounded transition flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </button>
              {idx < nodes.length - 1 && (
                <div className="flex justify-center py-1">
                  <div className="text-gray-400">↓</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Right: Inspector Panel */}
      <div className="w-64 bg-white rounded-lg border border-gray-200 p-4 flex flex-col overflow-y-auto">
        {currentNode ? (
          <>
            <h3 className="text-xs font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Node Inspector
            </h3>

            <div className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Label
                </label>
                <input
                  type="text"
                  value={currentNode.label}
                  onChange={(e) =>
                    handleNodeUpdate(currentNode.id, { label: e.target.value })
                  }
                  className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Type
                </label>
                <p className="text-xs text-gray-600 capitalize bg-gray-50 px-2 py-1.5 rounded border border-gray-200">
                  {currentNode.type}
                </p>
              </div>

              {currentNode.expectedRuntime !== undefined && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Expected Runtime (seconds)
                  </label>
                  <input
                    type="number"
                    value={currentNode.expectedRuntime}
                    onChange={(e) =>
                      handleNodeUpdate(currentNode.id, {
                        expectedRuntime: parseInt(e.target.value)
                      })
                    }
                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              {currentNode.rollbackAvailable !== undefined && (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="rollback"
                    checked={currentNode.rollbackAvailable}
                    onChange={(e) =>
                      handleNodeUpdate(currentNode.id, {
                        rollbackAvailable: e.target.checked
                      })
                    }
                    className="w-3 h-3 rounded"
                  />
                  <label htmlFor="rollback" className="text-xs text-gray-700">
                    Rollback available
                  </label>
                </div>
              )}

              <div className="pt-3 border-t border-gray-200 space-y-2">
                <p className="text-xs font-semibold text-gray-700">Policy Constraints</p>
                <div className="text-xs text-gray-600 space-y-1">
                  <p>✓ Max timeout: 300s</p>
                  <p>✓ Requires approval</p>
                  <p>✓ Rollback mandated</p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <AlertCircle className="w-6 h-6 text-gray-400 mb-2" />
            <p className="text-xs text-gray-600">Select a node to inspect</p>
          </div>
        )}

        {/* Summary */}
        <div className="mt-auto pt-4 border-t border-gray-200 space-y-2">
          <p className="text-xs font-semibold text-gray-700">Summary</p>
          <div className="text-xs text-gray-600 space-y-1">
            <p>Total nodes: {nodes.length}</p>
            <p>Total runtime: {calculateTotalRuntime()}s</p>
            <p>
              Rollback: {nodes.filter(n => n.rollbackAvailable).length}/{nodes.length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
