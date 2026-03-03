import React, { useState, useRef, useEffect } from 'react';
import {
  Plus, Trash2, Copy, Save, ZoomIn, ZoomOut, Play, Download,
  ChevronRight, Settings, X, MoreVertical, Eye, Code, Grid3x3
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface WorkflowNode {
  id: string;
  type: 'trigger' | 'action' | 'condition' | 'api-call' | 'notification' | 'loop' | 'delay';
  label: string;
  x: number;
  y: number;
  config: Record<string, any>;
}

interface WorkflowEdge {
  id: string;
  from: string;
  to: string;
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  createdAt: string;
  updatedAt: string;
  active: boolean;
}

const NODE_TYPES = {
  trigger: { icon: '🔔', label: 'Trigger', color: 'bg-blue-500', bgLight: 'bg-blue-100 dark:bg-blue-950' },
  action: { icon: '⚙️', label: 'Action', color: 'bg-purple-500', bgLight: 'bg-purple-100 dark:bg-purple-950' },
  condition: { icon: '❓', label: 'Condition', color: 'bg-amber-500', bgLight: 'bg-amber-100 dark:bg-amber-950' },
  'api-call': { icon: '🌐', label: 'API Call', color: 'bg-cyan-500', bgLight: 'bg-cyan-100 dark:bg-cyan-950' },
  notification: { icon: '📢', label: 'Notify', color: 'bg-pink-500', bgLight: 'bg-pink-100 dark:bg-pink-950' },
  loop: { icon: '🔄', label: 'Loop', color: 'bg-green-500', bgLight: 'bg-green-100 dark:bg-green-950' },
  delay: { icon: '⏳', label: 'Delay', color: 'bg-indigo-500', bgLight: 'bg-indigo-100 dark:bg-indigo-950' }
};

export const WorkflowBuilder: React.FC<{ onSave?: (workflow: Workflow) => void; onCancel?: () => void }> = ({
  onSave,
  onCancel
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [workflow, setWorkflow] = useState<Workflow>({
    id: `workflow_${Date.now()}`,
    name: 'New Workflow',
    description: '',
    nodes: [
      {
        id: 'node_1',
        type: 'trigger',
        label: 'Trigger',
        x: 100,
        y: 100,
        config: {}
      }
    ],
    edges: [],
    createdAt: new Date().toLocaleString(),
    updatedAt: new Date().toLocaleString(),
    active: false
  });

  const [selectedNodeId, setSelectedNodeId] = useState<string>('node_1');
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const [connectingMode, setConnectingMode] = useState<string | null>(null);
  const [showNodePalette, setShowNodePalette] = useState(true);
  const [showPreview, setShowPreview] = useState(false);

  const selectedNode = workflow.nodes.find(n => n.id === selectedNodeId);

  const handleAddNode = (type: keyof typeof NODE_TYPES) => {
    const newNode: WorkflowNode = {
      id: `node_${Date.now()}`,
      type: type as WorkflowNode['type'],
      label: NODE_TYPES[type].label,
      x: 300,
      y: 200,
      config: {}
    };
    setWorkflow(prev => ({
      ...prev,
      nodes: [...prev.nodes, newNode],
      updatedAt: new Date().toLocaleString()
    }));
    setSelectedNodeId(newNode.id);
  };

  const handleDeleteNode = (id: string) => {
    setWorkflow(prev => ({
      ...prev,
      nodes: prev.nodes.filter(n => n.id !== id),
      edges: prev.edges.filter(e => e.from !== id && e.to !== id),
      updatedAt: new Date().toLocaleString()
    }));
    if (selectedNodeId === id) setSelectedNodeId(workflow.nodes[0]?.id || '');
  };

  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    setDraggingNode(nodeId);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (canvasRef.current && draggingNode) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - pan.x) / zoom;
      const y = (e.clientY - rect.top - pan.y) / zoom;

      setWorkflow(prev => ({
        ...prev,
        nodes: prev.nodes.map(n =>
          n.id === draggingNode ? { ...n, x: Math.max(0, x - 40), y: Math.max(0, y - 30) } : n
        ),
        updatedAt: new Date().toLocaleString()
      }));
    }
  };

  const handleCanvasMouseUp = () => {
    setDraggingNode(null);
  };

  const handleConnectClick = (fromNodeId: string) => {
    if (connectingMode === fromNodeId) {
      setConnectingMode(null);
    } else {
      setConnectingMode(fromNodeId);
    }
  };

  const handleNodeClick = (nodeId: string) => {
    if (connectingMode && connectingMode !== nodeId) {
      const edgeExists = workflow.edges.some(
        e => e.from === connectingMode && e.to === nodeId
      );
      if (!edgeExists) {
        const newEdge: WorkflowEdge = {
          id: `edge_${Date.now()}`,
          from: connectingMode,
          to: nodeId
        };
        setWorkflow(prev => ({
          ...prev,
          edges: [...prev.edges, newEdge],
          updatedAt: new Date().toLocaleString()
        }));
      }
      setConnectingMode(null);
    } else {
      setSelectedNodeId(nodeId);
    }
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
            <p className="text-xs text-muted-foreground mt-1">{workflow.nodes.length} nodes • {workflow.edges.length} connections</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom(z => Math.min(z + 0.1, 2))}
            className="p-2 hover:bg-muted rounded-lg transition"
            title="Zoom in"
          >
            <ZoomIn className="w-4 h-4 text-muted-foreground" />
          </button>
          <button
            onClick={() => setZoom(z => Math.max(z - 0.1, 0.5))}
            className="p-2 hover:bg-muted rounded-lg transition"
            title="Zoom out"
          >
            <ZoomOut className="w-4 h-4 text-muted-foreground" />
          </button>
          <div className="text-xs text-muted-foreground px-2">{Math.round(zoom * 100)}%</div>
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="p-2 hover:bg-muted rounded-lg transition"
            title="View JSON"
          >
            <Code className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex flex-1 gap-4 overflow-hidden p-4">
        {/* Left Sidebar - Node Palette */}
        <div className={cn(
          'transition-all duration-300 border border-border rounded-lg bg-card flex flex-col overflow-hidden',
          showNodePalette ? 'w-56' : 'w-0'
        )}>
          <div className="p-4 border-b border-border">
            <p className="text-sm font-bold text-foreground mb-3">Add Node</p>
            <button
              onClick={() => setShowNodePalette(false)}
              className="w-full px-3 py-2 text-xs font-bold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition flex items-center justify-center gap-2"
            >
              <X className="w-3 h-3" /> Close
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {Object.entries(NODE_TYPES).map(([type, config]) => (
              <button
                key={type}
                onClick={() => handleAddNode(type as any)}
                className={cn(
                  'w-full p-3 rounded-lg border-2 border-border transition text-left hover:shadow-md',
                  config.bgLight
                )}
              >
                <div className="text-lg mb-1">{config.icon}</div>
                <p className="text-xs font-bold text-foreground">{config.label}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 flex flex-col border border-border rounded-lg bg-background overflow-hidden relative">
          {/* Canvas Toolbar */}
          <div className="bg-card border-b border-border px-4 py-2 flex gap-2">
            <button
              onClick={() => setShowNodePalette(!showNodePalette)}
              className="px-3 py-1.5 text-xs font-bold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> Add Node
            </button>
            <div className="text-xs text-muted-foreground px-2 py-1.5">
              💡 Drag to move • Click "+" button on a node to connect, then click target node
            </div>
          </div>

          {/* Canvas */}
          <div
            ref={canvasRef}
            className="flex-1 overflow-hidden relative cursor-grab active:cursor-grabbing select-none"
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            style={{
              backgroundImage: `
                linear-gradient(rgba(128, 128, 128, 0.05) 1px, transparent 1px),
                linear-gradient(90deg, rgba(128, 128, 128, 0.05) 1px, transparent 1px)
              `,
              backgroundSize: `${30 * zoom}px ${30 * zoom}px`,
              backgroundPosition: `${pan.x}px ${pan.y}px`
            }}
          >
            {/* SVG Connections */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
            >
              {/* Edges */}
              {workflow.edges.map(edge => {
                const fromNode = workflow.nodes.find(n => n.id === edge.from);
                const toNode = workflow.nodes.find(n => n.id === edge.to);
                if (!fromNode || !toNode) return null;

                const x1 = fromNode.x + 80;
                const y1 = fromNode.y + 30;
                const x2 = toNode.x;
                const y2 = toNode.y + 30;

                return (
                  <g key={edge.id}>
                    <path
                      d={`M ${x1} ${y1} L ${(x1 + x2) / 2} ${y1} L ${(x1 + x2) / 2} ${y2} L ${x2} ${y2}`}
                      stroke="#9CA3AF"
                      strokeWidth="2"
                      fill="none"
                      markerEnd="url(#arrowhead)"
                    />
                  </g>
                );
              })}

              {/* Arrow marker */}
              <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                  <polygon points="0 0, 10 3, 0 6" fill="#9CA3AF" />
                </marker>
              </defs>
            </svg>

            {/* Nodes Container */}
            <div style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }} className="absolute inset-0">
              {workflow.nodes.map(node => {
                const typeConfig = NODE_TYPES[node.type];
                return (
                  <div
                    key={node.id}
                    style={{ left: node.x, top: node.y }}
                    className="absolute w-40 h-16 pointer-events-auto"
                  >
                    {/* Node */}
                    <div
                      onClick={() => handleNodeClick(node.id)}
                      onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                      className={cn(
                        'w-full h-full rounded-lg border-2 flex flex-col items-center justify-center cursor-move transition relative',
                        `${typeConfig.bgLight} border-2`,
                        connectingMode === node.id
                          ? 'border-blue-500 shadow-lg ring-2 ring-blue-400'
                          : selectedNodeId === node.id ? 'border-primary shadow-lg' : 'border-gray-300 dark:border-gray-600 hover:border-primary/50'
                      )}
                    >
                      <div className="text-2xl">{typeConfig.icon}</div>
                      <div className="text-xs font-bold text-center mt-0.5 text-foreground">
                        {node.label}
                      </div>
                    </div>

                    {/* Connect Button (bottom right) */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleConnectClick(node.id);
                      }}
                      title={connectingMode === node.id ? 'Click another node to complete connection' : 'Click to connect to another node'}
                      className={cn(
                        'absolute -bottom-2 -right-2 px-2 py-1 text-xs font-bold rounded-full transition shadow-md hover:scale-110',
                        connectingMode === node.id
                          ? 'bg-blue-500 text-white ring-2 ring-blue-300'
                          : 'bg-primary text-primary-foreground hover:bg-primary/90'
                      )}
                      style={{ zIndex: 10 }}
                    >
                      {connectingMode === node.id ? '✓' : '+'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Panel - Node Config */}
        {selectedNode && (
          <div className="w-80 bg-card border border-border rounded-lg p-4 flex flex-col gap-4 overflow-y-auto max-h-[calc(100vh-200px)]">
            <div>
              <p className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                <span className="text-2xl">{NODE_TYPES[selectedNode.type].icon}</span>
                {selectedNode.label}
              </p>

              {/* Node Properties */}
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">Label</label>
                  <input
                    type="text"
                    value={selectedNode.label}
                    onChange={(e) => {
                      setWorkflow(prev => ({
                        ...prev,
                        nodes: prev.nodes.map(n =>
                          n.id === selectedNodeId ? { ...n, label: e.target.value } : n
                        )
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
                            ? { ...n, type: e.target.value as WorkflowNode['type'] }
                            : n
                        )
                      }));
                    }}
                    className="w-full px-2 py-1.5 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    {Object.keys(NODE_TYPES).map(type => (
                      <option key={type} value={type}>
                        {type.toUpperCase().replace('-', ' ')}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedNode.type === 'condition' && (
                  <div>
                    <label className="text-xs font-bold text-foreground block mb-1">Condition</label>
                    <input
                      type="text"
                      placeholder="e.g., status === 'success'"
                      className="w-full px-2 py-1.5 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                )}

                {selectedNode.type === 'delay' && (
                  <div>
                    <label className="text-xs font-bold text-foreground block mb-1">Delay (ms)</label>
                    <input
                      type="number"
                      placeholder="1000"
                      defaultValue="1000"
                      className="w-full px-2 py-1.5 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs font-bold text-foreground mb-2">Position</p>
                <p className="text-xs text-muted-foreground">
                  X: {Math.round(selectedNode.x)} • Y: {Math.round(selectedNode.y)}
                </p>
              </div>

              {/* Delete Button */}
              <button
                onClick={() => handleDeleteNode(selectedNodeId)}
                className="w-full mt-4 px-3 py-2 text-xs font-bold rounded-lg bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900 transition flex items-center justify-center gap-1"
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
