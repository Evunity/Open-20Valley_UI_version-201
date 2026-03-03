import React, { useState, useRef, useEffect } from 'react';
import {
  Plus, Trash2, Copy, Save, ZoomIn, ZoomOut, Play, Download, Upload,
  ChevronRight, Settings, X, MoreVertical, Eye, Code
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface WorkflowNode {
  id: string;
  type: 'trigger' | 'action' | 'condition' | 'api-call' | 'notification' | 'loop' | 'delay';
  label: string;
  x: number;
  y: number;
  config: Record<string, any>;
  status?: 'idle' | 'running' | 'success' | 'error';
}

interface WorkflowEdge {
  id: string;
  from: string;
  to: string;
  label?: string;
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
  trigger: { icon: '🔔', color: '#3B82F6', bgColor: 'bg-blue-100 dark:bg-blue-950' },
  action: { icon: '⚙️', color: '#8B5CF6', bgColor: 'bg-purple-100 dark:bg-purple-950' },
  condition: { icon: '❓', color: '#F59E0B', bgColor: 'bg-amber-100 dark:bg-amber-950' },
  'api-call': { icon: '🌐', color: '#06B6D4', bgColor: 'bg-cyan-100 dark:bg-cyan-950' },
  notification: { icon: '📢', color: '#EC4899', bgColor: 'bg-pink-100 dark:bg-pink-950' },
  loop: { icon: '🔄', color: '#10B981', bgColor: 'bg-green-100 dark:bg-green-950' },
  delay: { icon: '⏳', color: '#6366F1', bgColor: 'bg-indigo-100 dark:bg-indigo-950' }
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
        label: 'Start',
        x: 100,
        y: 100,
        config: {},
        status: 'idle'
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
  const [connecting, setConnecting] = useState<{ from: string; x: number; y: number } | null>(null);
  const [showNodePalette, setShowNodePalette] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const selectedNode = workflow.nodes.find(n => n.id === selectedNodeId);

  const handleAddNode = (type: keyof typeof NODE_TYPES) => {
    const newNode: WorkflowNode = {
      id: `node_${Date.now()}`,
      type: type as WorkflowNode['type'],
      label: type.charAt(0).toUpperCase() + type.slice(1),
      x: Math.random() * 400 + 200,
      y: Math.random() * 300 + 150,
      config: {},
      status: 'idle'
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
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - pan.x) / zoom;
      const y = (e.clientY - rect.top - pan.y) / zoom;

      if (draggingNode) {
        setWorkflow(prev => ({
          ...prev,
          nodes: prev.nodes.map(n =>
            n.id === draggingNode ? { ...n, x, y } : n
          ),
          updatedAt: new Date().toLocaleString()
        }));
      }

      // Update connecting line endpoint
      if (connecting) {
        setConnecting(prev => prev ? { ...prev, x, y } : null);
      }
    }
  };

  const handleCanvasMouseUp = () => {
    setDraggingNode(null);
  };

  const handleStartConnection = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    setConnecting({ from: nodeId, x: 0, y: 0 });
  };

  const handleEndConnection = (nodeId: string) => {
    if (connecting && connecting.from !== nodeId) {
      const edgeExists = workflow.edges.some(e => e.from === connecting.from && e.to === nodeId);
      if (!edgeExists) {
        const newEdge: WorkflowEdge = {
          id: `edge_${Date.now()}`,
          from: connecting.from,
          to: nodeId
        };
        setWorkflow(prev => ({
          ...prev,
          edges: [...prev.edges, newEdge],
          updatedAt: new Date().toLocaleString()
        }));
      }
    }
    setConnecting(null);
  };

  const isValidWorkflow = workflow.nodes.length > 0 && workflow.name.trim();

  return (
    <div className="w-full h-full flex flex-col bg-background overflow-hidden">
      {/* Toolbar */}
      <div className="border-b border-border bg-card px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-foreground">Workflow Builder</h2>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={workflow.name}
            onChange={(e) => setWorkflow(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Workflow name..."
            className="px-3 py-1.5 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 w-48"
          />
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

      {/* Main Content */}
      <div className="flex flex-1 gap-4 overflow-hidden p-4">
        {/* Canvas */}
        <div className="flex-1 flex flex-col gap-2 bg-muted/30 rounded-lg border border-border overflow-hidden">
          {/* Canvas Toolbar */}
          <div className="bg-card border-b border-border px-3 py-2 flex gap-2">
            <button
              onClick={() => setShowNodePalette(!showNodePalette)}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> Add Node
            </button>
            {showNodePalette && (
              <div className="flex gap-2 ml-2 pl-2 border-l border-border">
                {Object.entries(NODE_TYPES).map(([type, config]) => (
                  <button
                    key={type}
                    onClick={() => handleAddNode(type as any)}
                    className="px-2 py-1 text-xs font-bold rounded-lg border border-border text-muted-foreground hover:text-foreground transition"
                    title={type}
                  >
                    {config.icon}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Canvas */}
          <div
            ref={canvasRef}
            className="flex-1 overflow-hidden relative bg-background/50 cursor-grab active:cursor-grabbing select-none"
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            style={{
              backgroundImage: `
                linear-gradient(rgba(128, 128, 128, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(128, 128, 128, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: `${30 * zoom}px ${30 * zoom}px`,
              backgroundPosition: `${pan.x}px ${pan.y}px`
            }}
          >
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
            >
              {/* Edges */}
              {workflow.edges.map(edge => {
                const fromNode = workflow.nodes.find(n => n.id === edge.from);
                const toNode = workflow.nodes.find(n => n.id === edge.to);
                if (!fromNode || !toNode) return null;

                // Ensure coordinates are valid numbers
                const x1 = Number.isFinite(fromNode.x) ? fromNode.x + 60 : 60;
                const y1 = Number.isFinite(fromNode.y) ? fromNode.y + 40 : 40;
                const x2 = Number.isFinite(toNode.x) ? toNode.x : 0;
                const y2 = Number.isFinite(toNode.y) ? toNode.y + 40 : 40;

                return (
                  <line
                    key={edge.id}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="#9CA3AF"
                    strokeWidth="2"
                    markerEnd="url(#arrowhead)"
                  />
                );
              })}

              {/* Arrow marker */}
              <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                  <polygon points="0 0, 10 3, 0 6" fill="#9CA3AF" />
                </marker>
              </defs>

              {/* Connecting line */}
              {connecting && (() => {
                const fromNode = workflow.nodes.find(n => n.id === connecting.from);
                if (!fromNode) return null;
                const x1 = Number.isFinite(fromNode.x) ? fromNode.x + 60 : 60;
                const y1 = Number.isFinite(fromNode.y) ? fromNode.y + 40 : 40;
                const x2 = Number.isFinite(connecting.x) ? connecting.x : 0;
                const y2 = Number.isFinite(connecting.y) ? connecting.y : 0;

                return (
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="#3B82F6"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                  />
                );
              })()}
            </svg>

            {/* Nodes */}
            <div style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }} className="absolute inset-0">
              {workflow.nodes.map(node => {
                const typeConfig = NODE_TYPES[node.type];
                return (
                  <div
                    key={node.id}
                    style={{ left: node.x, top: node.y, transform: 'translate(0, 0)' }}
                    className="absolute w-32 h-20 pointer-events-auto"
                  >
                    <div
                      onClick={() => setSelectedNodeId(node.id)}
                      onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                      className={cn(
                        'w-full h-full rounded-lg border-2 flex flex-col items-center justify-center cursor-move transition hover:shadow-lg',
                        `bg-white dark:bg-gray-800 border-2`,
                        selectedNodeId === node.id ? 'border-primary shadow-lg' : 'border-gray-300 dark:border-gray-600',
                        node.status === 'running' && 'animate-pulse',
                        node.status === 'success' && 'border-green-500',
                        node.status === 'error' && 'border-red-500'
                      )}
                    >
                      <div className="text-2xl">{typeConfig.icon}</div>
                      <div className="text-xs font-bold text-center mt-1 text-foreground truncate px-1">
                        {node.label}
                      </div>
                    </div>

                    {/* Output port */}
                    <button
                      onMouseDown={(e) => handleStartConnection(e, node.id)}
                      onMouseUp={() => handleEndConnection(node.id)}
                      className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 w-3 h-3 rounded-full bg-primary border-2 border-white dark:border-gray-800 cursor-crosshair hover:scale-125 transition"
                    />
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
                <span className="text-lg">{NODE_TYPES[selectedNode.type].icon}</span>
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
                            ? { ...n, type: e.target.value as WorkflowNode['type'] }
                            : n
                        ),
                        updatedAt: new Date().toLocaleString()
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
                      placeholder="e.g., response.status === 200"
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

              {/* Connections Info */}
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs font-bold text-foreground mb-2">Connections</p>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Incoming: {workflow.edges.filter(e => e.to === selectedNodeId).length}</p>
                  <p>Outgoing: {workflow.edges.filter(e => e.from === selectedNodeId).length}</p>
                </div>
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
      <div className="border-t border-border bg-card px-4 py-3 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {workflow.nodes.length} nodes • {workflow.edges.length} connections
        </p>
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
