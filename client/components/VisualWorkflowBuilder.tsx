import React, { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
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
  const outputHandleRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const inputHandleRefs = useRef<Record<string, HTMLDivElement | null>>({});

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
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [edgeGeometry, setEdgeGeometry] = useState<Record<string, { x1: number; y1: number; x2: number; y2: number }>>({});

  const buildSmoothPath = (x1: number, y1: number, x2: number, y2: number) => {
    const direction = x2 >= x1 ? 1 : -1;
    const controlOffset = Math.max(40, Math.min(Math.abs(x2 - x1) * 0.5, 160));
    const c1x = x1 + direction * controlOffset;
    const c2x = x2 - direction * controlOffset;
    return `M ${x1} ${y1} C ${c1x} ${y1}, ${c2x} ${y2}, ${x2} ${y2}`;
  };

  const recalculateEdgeGeometry = useCallback(() => {
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;

    const nextGeometry: Record<string, { x1: number; y1: number; x2: number; y2: number }> = {};

    workflow.edges.forEach((edge) => {
      const sourceHandle = outputHandleRefs.current[edge.from];
      const targetHandle = inputHandleRefs.current[edge.to];
      if (!sourceHandle || !targetHandle) return;

      const sourceRect = sourceHandle.getBoundingClientRect();
      const targetRect = targetHandle.getBoundingClientRect();

      nextGeometry[edge.id] = {
        x1: sourceRect.left + sourceRect.width / 2 - canvasRect.left,
        y1: sourceRect.top + sourceRect.height / 2 - canvasRect.top,
        x2: targetRect.left + targetRect.width / 2 - canvasRect.left,
        y2: targetRect.top + targetRect.height / 2 - canvasRect.top,
      };
    });

    setEdgeGeometry(nextGeometry);
  }, [workflow.edges]);

  useLayoutEffect(() => {
    const frame = requestAnimationFrame(recalculateEdgeGeometry);
    return () => cancelAnimationFrame(frame);
  }, [workflow.nodes, workflow.edges, zoom, pan, recalculateEdgeGeometry]);

  useEffect(() => {
    const scheduleRecalc = () => requestAnimationFrame(recalculateEdgeGeometry);
    const canvasEl = canvasRef.current;
    const observer = new ResizeObserver(scheduleRecalc);
    const mutationObserver = new MutationObserver(scheduleRecalc);

    if (canvasEl) {
      observer.observe(canvasEl);
      mutationObserver.observe(canvasEl, { childList: true, subtree: true, attributes: true });
    }

    window.addEventListener('resize', scheduleRecalc);
    return () => {
      window.removeEventListener('resize', scheduleRecalc);
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, [recalculateEdgeGeometry]);

  // Canvas interaction
  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }

    if (draggingNode) {
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
              const geometry = edgeGeometry[edge.id];
              if (!geometry) return null;
              const { x1, y1, x2, y2 } = geometry;

              return (
                <g key={edge.id}>
                  <path
                    d={buildSmoothPath(x1, y1, x2, y2)}
                    stroke="hsl(var(--primary))"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx={x2} cy={y2} r="2.5" fill="hsl(var(--primary))" />
                </g>
              );
            })}

            {/* Temporary connection line while dragging */}
            {draggingFrom && (
              <path
                d={buildSmoothPath(
                  (() => {
                    const sourceRect = outputHandleRefs.current[draggingFrom]?.getBoundingClientRect();
                    const canvasRect = canvasRef.current?.getBoundingClientRect();
                    if (!sourceRect || !canvasRect) return 0;
                    return sourceRect.left + sourceRect.width / 2 - canvasRect.left;
                  })(),
                  (() => {
                    const sourceRect = outputHandleRefs.current[draggingFrom]?.getBoundingClientRect();
                    const canvasRect = canvasRef.current?.getBoundingClientRect();
                    if (!sourceRect || !canvasRect) return 0;
                    return sourceRect.top + sourceRect.height / 2 - canvasRect.top;
                  })(),
                  mousePosition.x,
                  mousePosition.y
                )}
                stroke="hsl(var(--muted-foreground))"
                strokeWidth="2"
                strokeDasharray="5,5"
                strokeLinecap="round"
                fill="none"
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

                <div
                  ref={(el) => {
                    inputHandleRefs.current[node.id] = el;
                  }}
                  className={cn(
                    "absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-primary",
                    draggingFrom && draggingFrom !== node.id ? "bg-primary" : "bg-primary/90"
                  )}
                  onMouseUp={(e) => {
                    e.stopPropagation();
                    if (draggingFrom && draggingFrom !== node.id) {
                      connectNodes(draggingFrom, node.id);
                    }
                  }}
                />

                <div
                  ref={(el) => {
                    outputHandleRefs.current[node.id] = el;
                  }}
                  className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary border-2 border-card cursor-pointer hover:bg-primary/80"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    setDraggingFrom(node.id);
                  }}
                  title="Drag to connect"
                />
              </button>
            ))}
          </div>
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
