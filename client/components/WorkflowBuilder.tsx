import React, { useState, useRef } from 'react';
import {
  Plus, Trash2, Save, ZoomIn, ZoomOut, X, Code
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Handle {
  id: string;
  type: 'input' | 'output';
  label: string;
}

interface WorkflowNode {
  id: string;
  type: 'trigger' | 'action' | 'condition' | 'api-call' | 'notification' | 'loop' | 'delay';
  label: string;
  x: number;
  y: number;
  config: Record<string, any>;
  handles: Handle[];
}

interface WorkflowEdge {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  sourceHandleId: string;
  targetHandleId: string;
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

const getNodeHandles = (nodeType: WorkflowNode['type']): Handle[] => {
  const baseHandles: Handle[] = [];
  
  if (nodeType === 'trigger') {
    baseHandles.push({
      id: 'output_main',
      type: 'output',
      label: 'Start'
    });
  } else if (nodeType === 'condition') {
    baseHandles.push({
      id: 'input_main',
      type: 'input',
      label: 'Input'
    });
    baseHandles.push({
      id: 'output_true',
      type: 'output',
      label: 'True'
    });
    baseHandles.push({
      id: 'output_false',
      type: 'output',
      label: 'False'
    });
  } else {
    baseHandles.push({
      id: 'input_main',
      type: 'input',
      label: 'Input'
    });
    baseHandles.push({
      id: 'output_main',
      type: 'output',
      label: 'Output'
    });
  }
  
  return baseHandles;
};

export const WorkflowBuilder: React.FC<{ onSave?: (workflow: Workflow) => void; onCancel?: () => void }> = ({
  onSave,
  onCancel
}) => {
  const NODE_WIDTH = 160;
  const NODE_HEIGHT = 64;
  const HANDLE_SIZE = 12;
  const HANDLE_SIDE_OFFSET = 14;
  const HANDLE_TOP_OFFSET = 8;

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
        config: {},
        handles: getNodeHandles('trigger')
      }
    ],
    edges: [],
    createdAt: new Date().toLocaleString(),
    updatedAt: new Date().toLocaleString(),
    active: false
  });

  const [selectedNodeId, setSelectedNodeId] = useState<string>('node_1');
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const [draggingEdge, setDraggingEdge] = useState<{ fromNodeId: string; fromHandleId: string; x: number; y: number } | null>(null);
  const [showNodePalette, setShowNodePalette] = useState(true);
  const [showPreview, setShowPreview] = useState(false);

  const selectedNode = workflow.nodes.find(n => n.id === selectedNodeId);

  const getHandlePosition = (nodeId: string, handleId: string): { x: number; y: number } | null => {
    const node = workflow.nodes.find(n => n.id === nodeId);
    if (!node) return null;

    const handle = node.handles.find(h => h.id === handleId);
    if (!handle) return null;

    const inputHandles = node.handles.filter(h => h.type === 'input');
    const outputHandles = node.handles.filter(h => h.type === 'output');

    if (handle.type === 'input') {
      const index = inputHandles.indexOf(handle);
      const spacing = NODE_HEIGHT / (inputHandles.length + 1);
      return {
        x: node.x - HANDLE_SIDE_OFFSET + HANDLE_SIZE / 2,
        y: node.y + spacing * (index + 1) - HANDLE_TOP_OFFSET + HANDLE_SIZE / 2
      };
    } else {
      const index = outputHandles.indexOf(handle);
      const spacing = NODE_HEIGHT / (outputHandles.length + 1);
      return {
        x: node.x + NODE_WIDTH + HANDLE_SIDE_OFFSET - HANDLE_SIZE / 2,
        y: node.y + spacing * (index + 1) - HANDLE_TOP_OFFSET + HANDLE_SIZE / 2
      };
    }
  };

  const getSmoothEdgePath = (x1: number, y1: number, x2: number, y2: number) => {
    const delta = Math.abs(x2 - x1);
    const control = Math.max(36, Math.min(140, delta * 0.45));
    const c1x = x1 + control;
    const c2x = x2 - control;
    return `M ${x1} ${y1} C ${c1x} ${y1}, ${c2x} ${y2}, ${x2} ${y2}`;
  };

  const canConnectNodes = (sourceNodeId: string, sourceHandleId: string, targetNodeId: string, targetHandleId: string): boolean => {
    if (sourceNodeId === targetNodeId) return false;

    const sourceNode = workflow.nodes.find(n => n.id === sourceNodeId);
    const targetNode = workflow.nodes.find(n => n.id === targetNodeId);
    if (!sourceNode || !targetNode) return false;

    const sourceHandle = sourceNode.handles.find(h => h.id === sourceHandleId);
    const targetHandle = targetNode.handles.find(h => h.id === targetHandleId);
    if (!sourceHandle || !targetHandle) return false;

    if (sourceHandle.type !== 'output' || targetHandle.type !== 'input') return false;

    const edgeExists = workflow.edges.some(
      e => e.sourceNodeId === sourceNodeId && e.targetNodeId === targetNodeId && 
           e.sourceHandleId === sourceHandleId && e.targetHandleId === targetHandleId
    );
    if (edgeExists) return false;

    if (targetNode.type === 'trigger') return false;

    const checkCycle = (nodeId: string, targetId: string, visited = new Set<string>()): boolean => {
      if (nodeId === targetId) return true;
      if (visited.has(nodeId)) return false;
      visited.add(nodeId);
      
      const predecessors = workflow.edges
        .filter(e => e.targetNodeId === nodeId)
        .map(e => e.sourceNodeId);
      
      return predecessors.some(pred => checkCycle(pred, targetId, visited));
    };

    if (checkCycle(targetNodeId, sourceNodeId)) return false;

    return true;
  };

  const handleConnectNodes = (sourceNodeId: string, sourceHandleId: string, targetNodeId: string, targetHandleId: string) => {
    if (!canConnectNodes(sourceNodeId, sourceHandleId, targetNodeId, targetHandleId)) return;

    const newEdge: WorkflowEdge = {
      id: `edge_${Date.now()}`,
      sourceNodeId,
      targetNodeId,
      sourceHandleId,
      targetHandleId
    };

    setWorkflow(prev => ({
      ...prev,
      edges: [...prev.edges, newEdge],
      updatedAt: new Date().toLocaleString()
    }));
  };

  const handleAddNode = (type: keyof typeof NODE_TYPES) => {
    const nodeType = type as WorkflowNode['type'];
    const newNode: WorkflowNode = {
      id: `node_${Date.now()}`,
      type: nodeType,
      label: NODE_TYPES[type].label,
      x: 300,
      y: 200,
      config: {},
      handles: getNodeHandles(nodeType)
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
      edges: prev.edges.filter(e => e.sourceNodeId !== id && e.targetNodeId !== id),
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
          n.id === draggingNode ? { ...n, x: Math.max(0, x - 80), y: Math.max(0, y - 32) } : n
        ),
        updatedAt: new Date().toLocaleString()
      }));
    }

    if (draggingEdge) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const x = (e.clientX - rect.left - pan.x) / zoom;
        const y = (e.clientY - rect.top - pan.y) / zoom;
        setDraggingEdge(prev => prev ? { ...prev, x, y } : null);
      }
    }
  };

  const handleCanvasMouseUp = (e: React.MouseEvent) => {
    // Only deselect if clicking on the canvas background (not on edges or nodes)
    if (e.target === canvasRef.current) {
      setSelectedEdgeId(null);
    }
    setDraggingNode(null);
    setDraggingEdge(null);
  };

  const handleOutputHandleMouseDown = (nodeId: string, handleId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const pos = getHandlePosition(nodeId, handleId);
    if (pos) {
      setDraggingEdge({ fromNodeId: nodeId, fromHandleId: handleId, x: pos.x, y: pos.y });
    }
  };

  const handleInputHandleMouseUp = (nodeId: string, handleId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (draggingEdge) {
      handleConnectNodes(draggingEdge.fromNodeId, draggingEdge.fromHandleId, nodeId, handleId);
      setDraggingEdge(null);
    }
  };

  const handleNodeClick = (nodeId: string) => {
    setSelectedNodeId(nodeId);
    setSelectedEdgeId(null);
  };

  const handleDeleteEdge = (edgeId: string) => {
    setWorkflow(prev => ({
      ...prev,
      edges: prev.edges.filter(e => e.id !== edgeId),
      updatedAt: new Date().toLocaleString()
    }));
    setSelectedEdgeId(null);
  };

  const isValidWorkflow = (() => {
    if (!workflow.name.trim()) return false;
    if (workflow.nodes.length === 0) return false;
    
    const hasTrigger = workflow.nodes.some(n => n.type === 'trigger');
    if (!hasTrigger) return false;
    
    if (workflow.nodes.length > 1) {
      const connectedNodes = new Set<string>();
      connectedNodes.add(workflow.nodes.find(n => n.type === 'trigger')!.id);
      
      const traverse = (nodeId: string) => {
        const outgoing = workflow.edges.filter(e => e.sourceNodeId === nodeId);
        outgoing.forEach(edge => {
          if (!connectedNodes.has(edge.targetNodeId)) {
            connectedNodes.add(edge.targetNodeId);
            traverse(edge.targetNodeId);
          }
        });
      };
      
      traverse(workflow.nodes.find(n => n.type === 'trigger')!.id);
      
      return workflow.nodes.every(n => connectedNodes.has(n.id));
    }
    
    return true;
  })();

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
              💡 Drag to move • Drag from output handle to input handle to connect
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
              className="absolute inset-0 w-full h-full"
              style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, pointerEvents: 'auto' }}
            >
              {/* Edges */}
              {workflow.edges.map(edge => {
                const sourcePos = getHandlePosition(edge.sourceNodeId, edge.sourceHandleId);
                const targetPos = getHandlePosition(edge.targetNodeId, edge.targetHandleId);
                if (!sourcePos || !targetPos) return null;

                const x1 = sourcePos.x;
                const y1 = sourcePos.y;
                const x2 = targetPos.x;
                const y2 = targetPos.y;

                const isSelected = selectedEdgeId === edge.id;

                const pathData = getSmoothEdgePath(x1, y1, x2, y2);

                // Calculate midpoint for delete button
                const midX = (x1 + x2) / 2;
                const midY = (y1 + y2) / 2;

                return (
                  <g key={edge.id} onClick={() => { setSelectedEdgeId(edge.id); setSelectedNodeId(''); }} style={{ cursor: 'pointer' }}>
                    {/* Invisible wider path for better click area */}
                    <path
                      d={pathData}
                      stroke="transparent"
                      strokeWidth="12"
                      fill="none"
                      pointerEvents="auto"
                    />
                    {/* Visible edge */}
                    <path
                      d={pathData}
                      stroke={isSelected ? '#EF4444' : '#3B82F6'}
                      strokeWidth={isSelected ? 3 : 2}
                      fill="none"
                      strokeLinecap="round"
                      pointerEvents="none"
                    />
                    {/* Delete button on edge */}
                    {isSelected && (
                      <g>
                        {/* Background circle for delete button */}
                        <circle
                          cx={midX}
                          cy={midY}
                          r="12"
                          fill="#EF4444"
                          opacity="0.9"
                          style={{ cursor: 'pointer', pointerEvents: 'auto' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteEdge(edge.id);
                          }}
                        />
                        {/* X icon */}
                        <text
                          x={midX}
                          y={midY}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fill="white"
                          fontSize="16"
                          fontWeight="bold"
                          style={{ cursor: 'pointer', pointerEvents: 'none', userSelect: 'none' }}
                        >
                          ✕
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}

              {/* Dragging edge preview */}
              {draggingEdge && (() => {
                const startPos = getHandlePosition(draggingEdge.fromNodeId, draggingEdge.fromHandleId);
                if (!startPos) return null;

                const x1 = startPos.x;
                const y1 = startPos.y;
                const x2 = draggingEdge.x;
                const y2 = draggingEdge.y;

                const pathData = getSmoothEdgePath(x1, y1, x2, y2);

                return (
                  <path
                    d={pathData}
                    stroke="#9CA3AF"
                    strokeWidth="2"
                    fill="none"
                    strokeDasharray="5,5"
                    strokeLinecap="round"
                    pointerEvents="none"
                  />
                );
              })()}
            </svg>

            {/* Nodes Container */}
            <div style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }} className="absolute inset-0">
              {workflow.nodes.map(node => {
                const typeConfig = NODE_TYPES[node.type];
                return (
                  <div
                    key={node.id}
                    style={{ left: node.x, top: node.y }}
                    className="absolute w-40 h-16 pointer-events-auto relative"
                  >
                    {/* Input Handles (left side) */}
                    {node.handles.filter(h => h.type === 'input').map((handle, idx) => {
                      const inputHandles = node.handles.filter(h => h.type === 'input');
                      const spacing = 64 / (inputHandles.length + 1);
                      const top = spacing * (idx + 1);
                      return (
                        <button
                          key={handle.id}
                          onMouseUp={(e) => handleInputHandleMouseUp(node.id, handle.id, e)}
                          className="absolute rounded-full bg-blue-500 hover:bg-blue-400 border-3 border-white hover:border-blue-200 shadow-lg transition hover:scale-150 cursor-crosshair"
                          style={{
                            width: '12px',
                            height: '12px',
                            left: '-14px',
                            top: `${top - 8}px`,
                            zIndex: 20
                          }}
                          title={`Input: ${handle.label}`}
                        />
                      );
                    })}

                    {/* Node */}
                    <div
                      onClick={() => handleNodeClick(node.id)}
                      onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                      className={cn(
                        'w-full h-full rounded-lg border-2 flex flex-col items-center justify-center cursor-move transition relative',
                        `${typeConfig.bgLight} border-2`,
                        selectedNodeId === node.id ? 'border-primary shadow-lg' : 'border-gray-300 dark:border-gray-600 hover:border-primary/50'
                      )}
                    >
                      <div className="text-2xl">{typeConfig.icon}</div>
                      <div className="text-xs font-bold text-center mt-0.5 text-foreground">
                        {node.label}
                      </div>
                    </div>

                    {/* Output Handles (right side) */}
                    {node.handles.filter(h => h.type === 'output').map((handle, idx) => {
                      const outputHandles = node.handles.filter(h => h.type === 'output');
                      const spacing = 64 / (outputHandles.length + 1);
                      const top = spacing * (idx + 1);
                      return (
                        <button
                          key={handle.id}
                          onMouseDown={(e) => handleOutputHandleMouseDown(node.id, handle.id, e)}
                          className="absolute rounded-full bg-green-500 hover:bg-green-400 border-3 border-white hover:border-green-200 shadow-lg transition hover:scale-150 cursor-crosshair"
                          style={{
                            width: '12px',
                            height: '12px',
                            right: '-14px',
                            top: `${top - 8}px`,
                            zIndex: 20
                          }}
                          title={`Output: ${handle.label} - Drag to connect`}
                        />
                      );
                    })}
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
                      const newType = e.target.value as WorkflowNode['type'];
                      setWorkflow(prev => ({
                        ...prev,
                        nodes: prev.nodes.map(n =>
                          n.id === selectedNodeId
                            ? { ...n, type: newType, handles: getNodeHandles(newType) }
                            : n
                        ),
                        edges: prev.edges.filter(edge => {
                          if (edge.sourceNodeId === selectedNodeId || edge.targetNodeId === selectedNodeId) {
                            const sourceNode = prev.nodes.find(n => n.id === edge.sourceNodeId);
                            const targetNode = prev.nodes.find(n => n.id === edge.targetNodeId);
                            if (!sourceNode || !targetNode) return false;
                            
                            const srcNode = sourceNode.id === selectedNodeId ? { ...sourceNode, type: newType, handles: getNodeHandles(newType) } : sourceNode;
                            const tgtNode = targetNode.id === selectedNodeId ? { ...targetNode, type: newType, handles: getNodeHandles(newType) } : targetNode;
                            
                            const sourceHandle = srcNode.handles.find(h => h.id === edge.sourceHandleId);
                            const targetHandle = tgtNode.handles.find(h => h.id === edge.targetHandleId);
                            
                            return sourceHandle && targetHandle;
                          }
                          return true;
                        })
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

        {/* Right Panel - Edge Config */}
        {selectedEdgeId && !selectedNode && (
          <div className="w-80 bg-card border border-border rounded-lg p-4 flex flex-col gap-4 overflow-y-auto max-h-[calc(100vh-200px)]">
            <div>
              <p className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                🔗 Connection
              </p>

              {(() => {
                const edge = workflow.edges.find(e => e.id === selectedEdgeId);
                if (!edge) return null;

                const sourceNode = workflow.nodes.find(n => n.id === edge.sourceNodeId);
                const targetNode = workflow.nodes.find(n => n.id === edge.targetNodeId);
                const sourceHandle = sourceNode?.handles.find(h => h.id === edge.sourceHandleId);
                const targetHandle = targetNode?.handles.find(h => h.id === edge.targetHandleId);

                return (
                  <div className="space-y-3">
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <p className="text-xs font-bold text-foreground mb-2">Source Node</p>
                      <p className="text-xs text-muted-foreground">{sourceNode?.label}</p>
                      <p className="text-xs text-muted-foreground">Output: {sourceHandle?.label}</p>
                    </div>

                    <div className="text-center text-muted-foreground">↓</div>

                    <div className="bg-muted/50 p-3 rounded-lg">
                      <p className="text-xs font-bold text-foreground mb-2">Target Node</p>
                      <p className="text-xs text-muted-foreground">{targetNode?.label}</p>
                      <p className="text-xs text-muted-foreground">Input: {targetHandle?.label}</p>
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDeleteEdge(selectedEdgeId)}
                      className="w-full mt-4 px-3 py-2 text-xs font-bold rounded-lg bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900 transition flex items-center justify-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" /> Delete Connection
                    </button>
                  </div>
                );
              })()}
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
              } else {
                const errors = [];
                if (!workflow.name.trim()) errors.push('• Workflow name is required');
                if (workflow.nodes.length === 0) errors.push('• Add at least one node');
                if (!workflow.nodes.some(n => n.type === 'trigger')) errors.push('• Must have a trigger node');
                if (workflow.nodes.length > 1) {
                  const triggerNode = workflow.nodes.find(n => n.type === 'trigger');
                  if (triggerNode) {
                    const connectedNodes = new Set<string>([triggerNode.id]);
                    const traverse = (nodeId: string) => {
                      const outgoing = workflow.edges.filter(e => e.sourceNodeId === nodeId);
                      outgoing.forEach(edge => {
                        if (!connectedNodes.has(edge.targetNodeId)) {
                          connectedNodes.add(edge.targetNodeId);
                          traverse(edge.targetNodeId);
                        }
                      });
                    };
                    traverse(triggerNode.id);
                    const unconnected = workflow.nodes.filter(n => !connectedNodes.has(n.id));
                    if (unconnected.length > 0) {
                      errors.push(`• ${unconnected.length} node(s) not connected to workflow`);
                    }
                  }
                }
                alert('Cannot save workflow:\n\n' + errors.join('\n'));
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
