import React, { useState } from 'react';
import {
  Plus, Trash2, Save, ZoomIn, ZoomOut, Play, Download,
  Settings, X, Eye, Code, ArrowRight, Grid3x3
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface WorkflowNode {
  id: string;
  type: 'trigger' | 'action' | 'condition' | 'api-call' | 'notification' | 'loop' | 'delay';
  label: string;
  position: number; // sequential position in workflow
  config: Record<string, any>;
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  nodes: WorkflowNode[];
  createdAt: string;
  updatedAt: string;
  active: boolean;
}

const NODE_TYPES = {
  trigger: { icon: '🔔', label: 'Trigger', color: 'bg-blue-500', description: 'Start workflow' },
  action: { icon: '⚙️', label: 'Action', color: 'bg-purple-500', description: 'Execute action' },
  condition: { icon: '❓', label: 'Condition', color: 'bg-amber-500', description: 'If-then logic' },
  'api-call': { icon: '🌐', label: 'API Call', color: 'bg-cyan-500', description: 'Call external API' },
  notification: { icon: '📢', label: 'Notify', color: 'bg-pink-500', description: 'Send notification' },
  loop: { icon: '🔄', label: 'Loop', color: 'bg-green-500', description: 'Repeat action' },
  delay: { icon: '⏳', label: 'Delay', color: 'bg-indigo-500', description: 'Wait period' }
};

export const WorkflowBuilder: React.FC<{ onSave?: (workflow: Workflow) => void; onCancel?: () => void }> = ({
  onSave,
  onCancel
}) => {
  const [workflow, setWorkflow] = useState<Workflow>({
    id: `workflow_${Date.now()}`,
    name: 'New Workflow',
    description: '',
    nodes: [
      {
        id: 'node_1',
        type: 'trigger',
        label: 'Trigger',
        position: 0,
        config: {}
      }
    ],
    createdAt: new Date().toLocaleString(),
    updatedAt: new Date().toLocaleString(),
    active: false
  });

  const [selectedNodeId, setSelectedNodeId] = useState<string>('node_1');
  const [showNodePalette, setShowNodePalette] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const selectedNode = workflow.nodes.find(n => n.id === selectedNodeId);

  const handleAddNode = (type: keyof typeof NODE_TYPES) => {
    const maxPosition = workflow.nodes.length > 0 ? Math.max(...workflow.nodes.map(n => n.position)) : -1;
    const newNode: WorkflowNode = {
      id: `node_${Date.now()}`,
      type: type as WorkflowNode['type'],
      label: NODE_TYPES[type].label,
      position: maxPosition + 1,
      config: {}
    };
    setWorkflow(prev => ({
      ...prev,
      nodes: [...prev.nodes, newNode],
      updatedAt: new Date().toLocaleString()
    }));
    setSelectedNodeId(newNode.id);
    setShowNodePalette(false);
  };

  const handleDeleteNode = (id: string) => {
    if (workflow.nodes.length <= 1) {
      alert('Workflow must have at least one node');
      return;
    }
    setWorkflow(prev => ({
      ...prev,
      nodes: prev.nodes
        .filter(n => n.id !== id)
        .map((n, idx) => ({ ...n, position: idx })),
      updatedAt: new Date().toLocaleString()
    }));
    if (selectedNodeId === id) setSelectedNodeId(workflow.nodes[0]?.id || '');
  };

  const moveNode = (id: string, direction: 'up' | 'down') => {
    const index = workflow.nodes.findIndex(n => n.id === id);
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === workflow.nodes.length - 1)) {
      return;
    }

    const newNodes = [...workflow.nodes];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newNodes[index], newNodes[targetIndex]] = [newNodes[targetIndex], newNodes[index]];

    setWorkflow(prev => ({
      ...prev,
      nodes: newNodes.map((n, idx) => ({ ...n, position: idx })),
      updatedAt: new Date().toLocaleString()
    }));
  };

  const isValidWorkflow = workflow.nodes.length > 0 && workflow.name.trim();

  return (
    <div className="w-full h-full flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <div className="border-b border-border bg-card px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div>
            <input
              type="text"
              value={workflow.name}
              onChange={(e) => setWorkflow(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Workflow name..."
              className="text-lg font-bold px-3 py-1.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <p className="text-xs text-muted-foreground mt-1">{workflow.nodes.length} nodes</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="p-2 hover:bg-muted rounded-lg transition"
            title="View JSON"
          >
            <Code className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 gap-4 overflow-hidden p-4">
        {/* Left Sidebar - Node Palette */}
        <div className="w-56 bg-card border border-border rounded-lg flex flex-col overflow-hidden">
          <div className="p-4 border-b border-border">
            <p className="text-sm font-bold text-foreground mb-3">Add Node</p>
            <button
              onClick={() => setShowNodePalette(!showNodePalette)}
              className="w-full px-3 py-2 text-xs font-bold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition flex items-center justify-center gap-2"
            >
              <Plus className="w-3 h-3" /> Add Node
            </button>
          </div>

          {showNodePalette && (
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {Object.entries(NODE_TYPES).map(([type, config]) => (
                <button
                  key={type}
                  onClick={() => handleAddNode(type as any)}
                  className="w-full p-3 rounded-lg border border-border bg-muted/50 hover:bg-muted transition text-left"
                >
                  <div className="text-lg mb-1">{config.icon}</div>
                  <p className="text-xs font-bold text-foreground">{config.label}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{config.description}</p>
                </button>
              ))}
            </div>
          )}

          {/* Nodes List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 border-t border-border">
            <p className="text-xs font-bold text-muted-foreground px-1">WORKFLOW STEPS</p>
            {workflow.nodes.map((node, idx) => {
              const nodeConfig = NODE_TYPES[node.type];
              return (
                <div key={node.id} className="space-y-1">
                  <button
                    onClick={() => setSelectedNodeId(node.id)}
                    className={cn(
                      'w-full p-3 rounded-lg border-2 transition text-left flex items-start gap-2',
                      selectedNodeId === node.id
                        ? 'border-primary bg-primary/10'
                        : 'border-border bg-muted/50 hover:border-border/80'
                    )}
                  >
                    <span className="text-lg flex-shrink-0">{nodeConfig.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-foreground truncate">{node.label}</p>
                      <p className="text-[10px] text-muted-foreground">{node.type}</p>
                    </div>
                    <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-muted text-muted-foreground flex-shrink-0">
                      {idx + 1}
                    </span>
                  </button>

                  {idx < workflow.nodes.length - 1 && (
                    <div className="flex justify-center py-1">
                      <ArrowRight className="w-4 h-4 text-muted-foreground rotate-90" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Middle - Node Flow Visualization */}
        <div className="flex-1 bg-muted/30 rounded-lg border border-border flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-start gap-4">
            {workflow.nodes.map((node, idx) => {
              const nodeConfig = NODE_TYPES[node.type];
              return (
                <div key={node.id} className="w-full max-w-xs">
                  <div
                    onClick={() => setSelectedNodeId(node.id)}
                    className={cn(
                      'p-4 rounded-lg border-2 transition cursor-pointer text-center',
                      selectedNodeId === node.id
                        ? 'border-primary bg-primary/10 shadow-lg'
                        : 'border-border bg-card hover:border-border/80'
                    )}
                  >
                    <div className="text-3xl mb-2">{nodeConfig.icon}</div>
                    <p className="text-sm font-bold text-foreground">{node.label}</p>
                    <p className="text-xs text-muted-foreground mt-1">{nodeConfig.description}</p>
                    <div className="mt-3 flex items-center justify-center gap-2">
                      <span className="text-xs font-bold px-2 py-1 rounded-full bg-muted text-muted-foreground">
                        Step {idx + 1}
                      </span>
                    </div>
                  </div>

                  {idx < workflow.nodes.length - 1 && (
                    <div className="flex justify-center py-3">
                      <ArrowRight className="w-5 h-5 text-primary rotate-90" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Panel - Node Config */}
        {selectedNode && (
          <div className="w-80 bg-card border border-border rounded-lg p-4 flex flex-col gap-4 overflow-y-auto max-h-[calc(100vh-200px)]">
            <div>
              <p className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                <span className="text-2xl">{NODE_TYPES[selectedNode.type].icon}</span>
                {selectedNode.label}
              </p>

              {/* Node Properties */}
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">Node Label</label>
                  <input
                    type="text"
                    value={selectedNode.label}
                    onChange={(e) => {
                      setWorkflow(prev => ({
                        ...prev,
                        nodes: prev.nodes.map(n =>
                          n.id === selectedNodeId ? { ...n, label: e.target.value } : n
                        ),
                        updatedAt: new Date().toLocaleString()
                      }));
                    }}
                    className="w-full px-2 py-1.5 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">Type</label>
                  <select
                    value={selectedNode.type}
                    onChange={(e) => {
                      setWorkflow(prev => ({
                        ...prev,
                        nodes: prev.nodes.map(n =>
                          n.id === selectedNodeId
                            ? {
                                ...n,
                                type: e.target.value as WorkflowNode['type'],
                                label: NODE_TYPES[e.target.value as keyof typeof NODE_TYPES].label
                              }
                            : n
                        ),
                        updatedAt: new Date().toLocaleString()
                      }));
                    }}
                    className="w-full px-2 py-1.5 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    {Object.entries(NODE_TYPES).map(([type, config]) => (
                      <option key={type} value={type}>
                        {config.label}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedNode.type === 'condition' && (
                  <div>
                    <label className="text-xs font-bold text-foreground block mb-1">Condition Expression</label>
                    <input
                      type="text"
                      placeholder="e.g., status === 'success'"
                      className="w-full px-2 py-1.5 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                )}

                {selectedNode.type === 'delay' && (
                  <div>
                    <label className="text-xs font-bold text-foreground block mb-1">Delay (milliseconds)</label>
                    <input
                      type="number"
                      placeholder="1000"
                      defaultValue="1000"
                      className="w-full px-2 py-1.5 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                )}

                {selectedNode.type === 'api-call' && (
                  <div className="space-y-2">
                    <div>
                      <label className="text-xs font-bold text-foreground block mb-1">API URL</label>
                      <input
                        type="text"
                        placeholder="https://api.example.com/endpoint"
                        className="w-full px-2 py-1.5 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-foreground block mb-1">Method</label>
                      <select className="w-full px-2 py-1.5 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50">
                        <option>GET</option>
                        <option>POST</option>
                        <option>PUT</option>
                        <option>DELETE</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Move Buttons */}
              <div className="mt-4 pt-4 border-t border-border space-y-2">
                <button
                  onClick={() => moveNode(selectedNodeId, 'up')}
                  disabled={workflow.nodes.findIndex(n => n.id === selectedNodeId) === 0}
                  className="w-full px-3 py-1.5 text-xs font-bold rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  ↑ Move Up
                </button>
                <button
                  onClick={() => moveNode(selectedNodeId, 'down')}
                  disabled={workflow.nodes.findIndex(n => n.id === selectedNodeId) === workflow.nodes.length - 1}
                  className="w-full px-3 py-1.5 text-xs font-bold rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  ↓ Move Down
                </button>
              </div>

              {/* Delete Button */}
              <button
                onClick={() => handleDeleteNode(selectedNodeId)}
                className="w-full mt-3 px-3 py-2 text-xs font-bold rounded-lg bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900 transition flex items-center justify-center gap-1"
              >
                <Trash2 className="w-3 h-3" /> Delete Node
              </button>
            </div>
          </div>
        )}
      </div>

      {/* JSON Preview */}
      {showPreview && (
        <div className="border-t border-border bg-card p-4 max-h-40 overflow-y-auto">
          <p className="text-xs font-bold text-foreground mb-2">Workflow JSON</p>
          <pre className="text-[10px] text-muted-foreground bg-muted/30 p-3 rounded-lg overflow-x-auto">
            {JSON.stringify(workflow, null, 2)}
          </pre>
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-border bg-card px-6 py-3 flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-xs font-bold rounded-lg border border-border text-foreground hover:bg-muted transition"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (isValidWorkflow) {
                onSave?.(workflow);
                alert('✓ Workflow saved successfully!');
              } else {
                alert('Please fill in the workflow name');
              }
            }}
            disabled={!isValidWorkflow}
            className={cn(
              'px-4 py-2 text-xs font-bold rounded-lg transition flex items-center gap-2',
              isValidWorkflow
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            )}
          >
            <Save className="w-3 h-3" /> Save Workflow
          </button>
        </div>
      </div>
    </div>
  );
};
