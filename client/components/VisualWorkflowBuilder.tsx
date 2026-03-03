import React, { useState, useRef, useEffect } from 'react';
import {
  Plus, Trash2, Copy, Save, ZoomIn, ZoomOut, Maximize2, Circle, Square,
  Triangle, Clock, Zap, Database, GitBranch, Pause, Play, Check, X,
  ChevronDown, Settings, Download, Upload
} from 'lucide-react';
import { cn } from '@/lib/utils';

type NodeType = 'trigger' | 'action' | 'condition' | 'delay' | 'loop' | 'api' | 'notification' | 'decision';
type NodeStatus = 'idle' | 'running' | 'success' | 'error';

interface WorkflowNode {
  id: string;
  type: NodeType;
  label: string;
  x: number;
  y: number;
  config: Record<string, any>;
  status: NodeStatus;
}

interface WorkflowEdge {
  id: string;
  from: string;
  to: string;
  label?: string;
}

interface WorkflowState {
  id: string;
  name: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  isActive: boolean;
}

const NODE_CONFIGS: Record<NodeType, { icon: string; color: string; description: string }> = {
  trigger: { icon: '🔔', color: 'bg-blue-100 border-blue-300', description: 'Start point of workflow' },
  action: { icon: '⚙️', color: 'bg-purple-100 border-purple-300', description: 'Execute action' },
  condition: { icon: '❓', color: 'bg-amber-100 border-amber-300', description: 'Decision point' },
  delay: { icon: '⏱️', color: 'bg-gray-100 border-gray-300', description: 'Wait period' },
  loop: { icon: '🔄', color: 'bg-green-100 border-green-300', description: 'Repeat action' },
  api: { icon: '🌐', color: 'bg-cyan-100 border-cyan-300', description: 'API call' },
  notification: { icon: '📧', color: 'bg-pink-100 border-pink-300', description: 'Send notification' },
  decision: { icon: '⎯', color: 'bg-indigo-100 border-indigo-300', description: 'Branch logic' }
};

export const VisualWorkflowBuilder: React.FC<{
  onSave?: (workflow: WorkflowState) => void;
  onCancel?: () => void;
}> = ({ onSave, onCancel }) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const [workflow, setWorkflow] = useState<WorkflowState>({
    id: `workflow_${Date.now()}`,
    name: 'New Automation Workflow',
    nodes: [
      { id: 'node_1', type: 'trigger', label: 'Alarm Detected', x: 50, y: 100, config: {}, status: 'idle' }
    ],
    edges: [],
    isActive: false
  });

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const [draggingFrom, setDraggingFrom] = useState<string | null>(null);
  const [showNodePalette, setShowNodePalette] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [workflowName, setWorkflowName] = useState(workflow.name);

  // Canvas interaction
  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (draggingNode) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      const x = (e.clientX - rect.left - pan.x) / zoom;
      const y = (e.clientY - rect.top - pan.y) / zoom;
      
      setWorkflow(prev => ({
        ...prev,
        nodes: prev.nodes.map(n => 
          n.id === draggingNode ? { ...n, x, y } : n
        )
      }));
    }
  };

  const handleCanvasMouseUp = () => {
    setDraggingNode(null);
  };

  const handlePanZoom = (type: 'zoomin' | 'zoomout' | 'reset') => {
    if (type === 'zoomin') setZoom(z => Math.min(z + 0.2, 3));
    if (type === 'zoomout') setZoom(z => Math.max(z - 0.2, 0.5));
    if (type === 'reset') {
      setZoom(1);
      setPan({ x: 0, y: 0 });
    }
  };

  const addNode = (type: NodeType) => {
    const newNode: WorkflowNode = {
      id: `node_${Date.now()}`,
      type,
      label: `New ${type}`,
      x: 200 + Math.random() * 100,
      y: 200 + Math.random() * 100,
      config: {},
      status: 'idle'
    };
    setWorkflow(prev => ({
      ...prev,
      nodes: [...prev.nodes, newNode]
    }));
    setShowNodePalette(false);
  };

  const deleteNode = (id: string) => {
    setWorkflow(prev => ({
      ...prev,
      nodes: prev.nodes.filter(n => n.id !== id),
      edges: prev.edges.filter(e => e.from !== id && e.to !== id)
    }));
    if (selectedNode === id) setSelectedNode(null);
  };

  const duplicateNode = (id: string) => {
    const node = workflow.nodes.find(n => n.id === id);
    if (!node) return;
    
    const newNode = {
      ...node,
      id: `node_${Date.now()}`,
      x: node.x + 100,
      y: node.y + 100
    };
    setWorkflow(prev => ({
      ...prev,
      nodes: [...prev.nodes, newNode]
    }));
  };

  const connectNodes = (fromId: string, toId: string) => {
    const edgeExists = workflow.edges.some(e => e.from === fromId && e.to === toId);
    if (!edgeExists && fromId !== toId) {
      const newEdge: WorkflowEdge = {
        id: `edge_${fromId}_${toId}`,
        from: fromId,
        to: toId
      };
      setWorkflow(prev => ({
        ...prev,
        edges: [...prev.edges, newEdge]
      }));
    }
    setDraggingFrom(null);
  };

  const selectedNodeData = workflow.nodes.find(n => n.id === selectedNode);

  return (
    <div className="flex h-full bg-background">
      {/* Left Sidebar - Node Palette */}
      <div className="w-56 border-r border-border bg-card flex flex-col">
        <div className="p-3 border-b border-border">
          <p className="text-sm font-bold text-foreground mb-3">Node Library</p>
          <button
            onClick={() => setShowNodePalette(!showNodePalette)}
            className="w-full px-3 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition flex items-center justify-center gap-2"
          >
            <Plus className="w-3 h-3" /> Add Node
          </button>
        </div>

        {showNodePalette && (
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {Object.entries(NODE_CONFIGS).map(([type, config]) => (
              <button
                key={type}
                onClick={() => addNode(type as NodeType)}
                className={`w-full p-2 rounded-lg border-2 transition text-left text-xs ${config.color} hover:shadow-md`}
              >
                <div className="font-semibold">{config.icon} {type.charAt(0).toUpperCase() + type.slice(1)}</div>
                <div className="text-[11px] opacity-75 mt-0.5">{config.description}</div>
              </button>
            ))}
          </div>
        )}

        {/* Node List */}
        <div className="border-t border-border p-3 flex-1 overflow-y-auto">
          <p className="text-xs font-bold text-foreground mb-2">Nodes ({workflow.nodes.length})</p>
          <div className="space-y-1 text-xs max-h-64 overflow-y-auto">
            {workflow.nodes.map(node => (
              <button
                key={node.id}
                onClick={() => setSelectedNode(node.id)}
                className={cn(
                  "w-full p-2 rounded-lg text-left transition truncate",
                  selectedNode === node.id
                    ? 'bg-primary/20 border border-primary text-foreground font-semibold'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted border border-border'
                )}
                title={node.label}
              >
                {NODE_CONFIGS[node.type].icon} {node.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="h-12 border-b border-border bg-card px-3 flex items-center justify-between gap-2">
          <input
            type="text"
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            className="flex-1 px-2 py-1 text-xs font-semibold rounded border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          
          <div className="flex gap-1">
            <button onClick={() => handlePanZoom('zoomin')} title="Zoom In" className="p-1.5 hover:bg-muted rounded text-xs">
              <ZoomIn className="w-4 h-4" />
            </button>
            <button onClick={() => handlePanZoom('zoomout')} title="Zoom Out" className="p-1.5 hover:bg-muted rounded text-xs">
              <ZoomOut className="w-4 h-4" />
            </button>
            <button onClick={() => handlePanZoom('reset')} title="Reset" className="p-1.5 hover:bg-muted rounded text-xs">
              <Maximize2 className="w-4 h-4" />
            </button>
            
            <div className="w-px bg-border mx-1"></div>
            
            <button
              onClick={() => onSave?.({ ...workflow, name: workflowName })}
              className="px-2 py-1 text-xs font-semibold rounded bg-primary text-primary-foreground hover:bg-primary/90 transition flex items-center gap-1"
            >
              <Save className="w-3 h-3" /> Save
            </button>
            <button
              onClick={onCancel}
              className="px-2 py-1 text-xs font-semibold rounded border border-border text-foreground hover:bg-muted transition"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Canvas */}
        <div
          ref={canvasRef}
          className="flex-1 relative overflow-hidden bg-muted/20 cursor-grab active:cursor-grabbing"
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={handleCanvasMouseUp}
        >
          {/* Grid Background */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: 'linear-gradient(#ccc 1px, transparent 1px), linear-gradient(90deg, #ccc 1px, transparent 1px)',
              backgroundSize: '20px 20px',
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: '0 0'
            }}
          />

          {/* SVG for Edges */}
          <svg
            ref={svgRef}
            className="absolute inset-0 w-full h-full"
            style={{ pointerEvents: 'none' }}
          >
            {workflow.edges.map(edge => {
              const fromNode = workflow.nodes.find(n => n.id === edge.from);
              const toNode = workflow.nodes.find(n => n.id === edge.to);
              if (!fromNode || !toNode) return null;

              const x1 = (fromNode.x + 80) * zoom + pan.x;
              const y1 = (fromNode.y + 40) * zoom + pan.y;
              const x2 = toNode.x * zoom + pan.x;
              const y2 = toNode.y * zoom + pan.y;

              return (
                <g key={edge.id}>
                  <defs>
                    <marker
                      id={`arrow_${edge.id}`}
                      markerWidth="10"
                      markerHeight="10"
                      refX="9"
                      refY="3"
                      orient="auto"
                      markerUnits="strokeWidth"
                    >
                      <path d="M0,0 L0,6 L9,3 z" fill="hsl(var(--primary))" />
                    </marker>
                  </defs>
                  <path
                    d={`M ${x1} ${y1} Q ${(x1 + x2) / 2} ${(y1 + y2) / 2} ${x2} ${y2}`}
                    stroke="hsl(var(--primary))"
                    strokeWidth="2"
                    fill="none"
                    markerEnd={`url(#arrow_${edge.id})`}
                  />
                </g>
              );
            })}

            {/* Temporary connection line while dragging */}
            {draggingFrom && (
              <line
                x1={(workflow.nodes.find(n => n.id === draggingFrom)?.x ?? 0 + 80) * zoom + pan.x}
                y1={(workflow.nodes.find(n => n.id === draggingFrom)?.y ?? 0 + 40) * zoom + pan.y}
                x2={canvasRef.current?.lastChild?.getBoundingClientRect().width ?? 0}
                y2={canvasRef.current?.lastChild?.getBoundingClientRect().height ?? 0}
                stroke="hsl(var(--muted-foreground))"
                strokeWidth="2"
                strokeDasharray="5,5"
              />
            )}
          </svg>

          {/* Nodes */}
          <div style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: '0 0' }}>
            {workflow.nodes.map(node => (
              <button
                key={node.id}
                className={cn(
                  'absolute w-20 p-2 rounded-lg border-2 text-center cursor-move transition flex flex-col items-center justify-center',
                  NODE_CONFIGS[node.type].color,
                  selectedNode === node.id && 'ring-2 ring-primary ring-offset-1',
                  node.status === 'running' && 'animate-pulse',
                  node.status === 'success' && 'border-green-500',
                  node.status === 'error' && 'border-red-500'
                )}
                style={{ left: `${node.x}px`, top: `${node.y}px` }}
                onMouseDown={() => setDraggingNode(node.id)}
                onClick={() => setSelectedNode(node.id)}
              >
                <div className="text-2xl">{NODE_CONFIGS[node.type].icon}</div>
                <div className="text-xs font-bold mt-1 truncate">{node.label}</div>
              </button>
            ))}
          </div>

          {/* Output Ports - Separate from nodes */}
          <div style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: '0 0', pointerEvents: 'auto' }}>
            {workflow.nodes.map(node => (
              <div
                key={`port_${node.id}`}
                className="absolute w-3 h-3 rounded-full bg-primary border border-card cursor-pointer hover:bg-primary/80"
                style={{
                  left: `${node.x + 80}px`,
                  top: `${node.y + 32}px`,
                  pointerEvents: 'auto'
                }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  setDraggingFrom(node.id);
                }}
                title="Drag to connect"
              />
            ))}
          </div>

          {/* Connection Target Indicator */}
          {draggingFrom && (
            <div className="absolute inset-0" style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: '0 0' }} pointerEvents="none">
              {workflow.nodes.map(node => (
                node.id !== draggingFrom && (
                  <div
                    key={`target_${node.id}`}
                    className="absolute -left-3 top-1/4 w-3 h-3 rounded-full bg-primary/30 border-2 border-primary"
                    style={{ left: `${node.x - 6}px`, top: `${node.y + 16}px` }}
                    onMouseUp={() => connectNodes(draggingFrom, node.id)}
                  />
                )
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar - Node Configuration */}
      {selectedNode && selectedNodeData && (
        <div className="w-64 border-l border-border bg-card flex flex-col">
          <div className="p-3 border-b border-border flex items-center justify-between">
            <p className="text-sm font-bold text-foreground">Node Config</p>
            <button
              onClick={() => setSelectedNode(null)}
              className="p-1 hover:bg-muted rounded"
            >
              <X className="w-3 h-3" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {/* Node Type */}
            <div>
              <p className="text-xs font-bold text-foreground mb-1">Type</p>
              <p className="text-xs text-muted-foreground">{selectedNodeData.type.toUpperCase()}</p>
            </div>

            {/* Label */}
            <div>
              <p className="text-xs font-bold text-foreground mb-1">Label</p>
              <input
                type="text"
                value={selectedNodeData.label}
                onChange={(e) => {
                  setWorkflow(prev => ({
                    ...prev,
                    nodes: prev.nodes.map(n =>
                      n.id === selectedNode ? { ...n, label: e.target.value } : n
                    )
                  }));
                }}
                className="w-full px-2 py-1 text-xs rounded border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            {/* Status */}
            <div>
              <p className="text-xs font-bold text-foreground mb-1">Status</p>
              <select
                value={selectedNodeData.status}
                onChange={(e) => {
                  setWorkflow(prev => ({
                    ...prev,
                    nodes: prev.nodes.map(n =>
                      n.id === selectedNode ? { ...n, status: e.target.value as NodeStatus } : n
                    )
                  }));
                }}
                className="w-full px-2 py-1 text-xs rounded border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="idle">Idle</option>
                <option value="running">Running</option>
                <option value="success">Success</option>
                <option value="error">Error</option>
              </select>
            </div>

            {/* Quick Config Based on Type */}
            {selectedNodeData.type === 'delay' && (
              <div>
                <p className="text-xs font-bold text-foreground mb-1">Duration (seconds)</p>
                <input
                  type="number"
                  defaultValue={selectedNodeData.config.duration || 60}
                  onChange={(e) => {
                    setWorkflow(prev => ({
                      ...prev,
                      nodes: prev.nodes.map(n =>
                        n.id === selectedNode
                          ? { ...n, config: { ...n.config, duration: parseInt(e.target.value) } }
                          : n
                      )
                    }));
                  }}
                  className="w-full px-2 py-1 text-xs rounded border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            )}

            {selectedNodeData.type === 'api' && (
              <div>
                <p className="text-xs font-bold text-foreground mb-1">Endpoint URL</p>
                <input
                  type="text"
                  defaultValue={selectedNodeData.config.endpoint || ''}
                  placeholder="https://api.example.com"
                  onChange={(e) => {
                    setWorkflow(prev => ({
                      ...prev,
                      nodes: prev.nodes.map(n =>
                        n.id === selectedNode
                          ? { ...n, config: { ...n.config, endpoint: e.target.value } }
                          : n
                      )
                    }));
                  }}
                  className="w-full px-2 py-1 text-xs rounded border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="border-t border-border p-3 space-y-2">
            <button
              onClick={() => duplicateNode(selectedNode)}
              className="w-full px-2 py-1.5 text-xs font-semibold rounded-lg bg-muted text-foreground hover:bg-muted/80 transition flex items-center justify-center gap-1"
            >
              <Copy className="w-3 h-3" /> Duplicate
            </button>
            <button
              onClick={() => deleteNode(selectedNode)}
              className="w-full px-2 py-1.5 text-xs font-semibold rounded-lg bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900 transition flex items-center justify-center gap-1"
            >
              <Trash2 className="w-3 h-3" /> Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
