import React, { useState, useRef, useCallback, useLayoutEffect, useEffect } from 'react';
import {
  Plus, Trash2, Save, ZoomIn, ZoomOut, Code, PanelLeftOpen, PanelLeftClose, PanelRightClose, PanelRightOpen, Maximize2, Minimize2, ScanLine, Map
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

export const WorkflowBuilder: React.FC<{
  onSave?: (workflow: Workflow) => void;
  onCancel?: () => void;
  initialWorkflow?: Workflow;
}> = ({
  onSave,
  onCancel,
  initialWorkflow
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const canvasWorkspaceRef = useRef<HTMLDivElement>(null);
  const inputHandleRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const outputHandleRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [workflow, setWorkflow] = useState<Workflow>(() => initialWorkflow || ({
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
  }));

  const [selectedNodeId, setSelectedNodeId] = useState<string>('node_1');
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [draggingEdge, setDraggingEdge] = useState<{ fromNodeId: string; fromHandleId: string; x: number; y: number } | null>(null);
  const [showNodePalette, setShowNodePalette] = useState(true);
  const [leftPanelWidth, setLeftPanelWidth] = useState(260);
  const [rightPanelWidth, setRightPanelWidth] = useState(340);
  const [showRightPanel, setShowRightPanel] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [resizePanel, setResizePanel] = useState<'left' | 'right' | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isMiniMapDragging, setIsMiniMapDragging] = useState(false);
  const [edgeGeometry, setEdgeGeometry] = useState<Record<string, { x1: number; y1: number; x2: number; y2: number }>>({});

  useEffect(() => {
    if (initialWorkflow) {
      setWorkflow(initialWorkflow);
      setSelectedNodeId(initialWorkflow.nodes[0]?.id || '');
      setSelectedEdgeId(null);
    }
  }, [initialWorkflow]);

  useEffect(() => {
    if (selectedNodeId) {
      setShowRightPanel(true);
    } else {
      setShowRightPanel(false);
    }
  }, [selectedNodeId]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === canvasWorkspaceRef.current);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    if (!resizePanel) return;

    const handleMouseMove = (event: MouseEvent) => {
      if (!workspaceRef.current) return;
      const rect = workspaceRef.current.getBoundingClientRect();

      if (resizePanel === 'left') {
        const next = Math.min(420, Math.max(220, event.clientX - rect.left));
        setLeftPanelWidth(next);
      } else {
        const next = Math.min(480, Math.max(280, rect.right - event.clientX));
        setRightPanelWidth(next);
      }
    };

    const handleMouseUp = () => setResizePanel(null);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizePanel]);


  const selectedNode = workflow.nodes.find(n => n.id === selectedNodeId);
  const MIN_ZOOM = 0.2;
  const MAX_ZOOM = 3;

  const getNodeBounds = useCallback(() => {
    if (workflow.nodes.length === 0) {
      return { minX: -500, minY: -500, maxX: 500, maxY: 500 };
    }

    const minX = Math.min(...workflow.nodes.map((n) => n.x)) - 200;
    const maxX = Math.max(...workflow.nodes.map((n) => n.x + 160)) + 200;
    const minY = Math.min(...workflow.nodes.map((n) => n.y)) - 200;
    const maxY = Math.max(...workflow.nodes.map((n) => n.y + 64)) + 200;
    return { minX, minY, maxX, maxY };
  }, [workflow.nodes]);

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
    setIsPanning(false);
    setDraggingNode(nodeId);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
    }

    if (canvasRef.current && draggingNode) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - pan.x) / zoom;
      const y = (e.clientY - rect.top - pan.y) / zoom;

      setWorkflow(prev => ({
        ...prev,
        nodes: prev.nodes.map(n =>
          n.id === draggingNode ? { ...n, x: x - 80, y: y - 32 } : n
        ),
        updatedAt: new Date().toLocaleString()
      }));
    }

    if (draggingEdge) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setDraggingEdge(prev => prev ? { ...prev, x, y } : null);
      }
    }
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    if (e.target !== canvasRef.current) return;
    setSelectedNodeId('');
    setIsPanning(true);
    setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleCanvasMouseUp = (e: React.MouseEvent) => {
    if (isPanning) {
      setIsPanning(false);
    }

    if (e.target === canvasRef.current) {
      setSelectedEdgeId(null);
    }
    setDraggingNode(null);
    setDraggingEdge(null);
  };

  const handleOutputHandleMouseDown = (nodeId: string, handleId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    const outputHandle = outputHandleRefs.current[`${nodeId}:${handleId}`];
    if (canvasRect && outputHandle) {
      const handleRect = outputHandle.getBoundingClientRect();
      setDraggingEdge({
        fromNodeId: nodeId,
        fromHandleId: handleId,
        x: handleRect.left + handleRect.width / 2 - canvasRect.left,
        y: handleRect.top + handleRect.height / 2 - canvasRect.top
      });
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

  const recalculateEdgeGeometry = useCallback(() => {
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;

    const nextGeometry: Record<string, { x1: number; y1: number; x2: number; y2: number }> = {};

    workflow.edges.forEach((edge) => {
      const sourceHandle = outputHandleRefs.current[`${edge.sourceNodeId}:${edge.sourceHandleId}`];
      const targetHandle = inputHandleRefs.current[`${edge.targetNodeId}:${edge.targetHandleId}`];
      if (!sourceHandle || !targetHandle) return;

      const sourceRect = sourceHandle.getBoundingClientRect();
      const targetRect = targetHandle.getBoundingClientRect();

      nextGeometry[edge.id] = {
        x1: sourceRect.left + sourceRect.width / 2 - canvasRect.left,
        y1: sourceRect.top + sourceRect.height / 2 - canvasRect.top,
        x2: targetRect.left + targetRect.width / 2 - canvasRect.left,
        y2: targetRect.top + targetRect.height / 2 - canvasRect.top
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

  const handleToggleFullscreen = async () => {
    if (!canvasWorkspaceRef.current) return;
    if (document.fullscreenElement === canvasWorkspaceRef.current) {
      await document.exitFullscreen();
      return;
    }
    await canvasWorkspaceRef.current.requestFullscreen();
  };

  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleFitToScreen = useCallback(() => {
    if (!canvasRef.current || workflow.nodes.length === 0) return;

    const padding = 80;
    const { minX, minY, maxX, maxY } = getNodeBounds();

    const boundsWidth = maxX - minX;
    const boundsHeight = maxY - minY;

    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = (rect.width - padding * 2) / Math.max(boundsWidth, 1);
    const scaleY = (rect.height - padding * 2) / Math.max(boundsHeight, 1);
    const nextZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, Math.min(scaleX, scaleY)));

    setZoom(nextZoom);
    setPan({
      x: rect.width / 2 - (minX + boundsWidth / 2) * nextZoom,
      y: rect.height / 2 - (minY + boundsHeight / 2) * nextZoom
    });
  }, [getNodeBounds, workflow.nodes.length]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      const isEditing = tag === 'input' || tag === 'textarea' || target?.isContentEditable;
      if (isEditing) return;

      if ((event.key === '+' || event.key === '=') && !event.metaKey && !event.ctrlKey) {
        event.preventDefault();
        setZoom((z) => Math.min(z + 0.1, MAX_ZOOM));
      } else if (event.key === '-' && !event.metaKey && !event.ctrlKey) {
        event.preventDefault();
        setZoom((z) => Math.max(z - 0.1, MIN_ZOOM));
      } else if (event.key === '0') {
        event.preventDefault();
        setZoom(1);
        setPan({ x: 0, y: 0 });
      } else if (event.key.toLowerCase() === 'f') {
        event.preventDefault();
        handleFitToScreen();
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        setPan((prev) => ({ ...prev, y: prev.y + 40 }));
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        setPan((prev) => ({ ...prev, y: prev.y - 40 }));
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        setPan((prev) => ({ ...prev, x: prev.x + 40 }));
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        setPan((prev) => ({ ...prev, x: prev.x - 40 }));
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleFitToScreen]);


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

  const miniMapWidth = 220;
  const miniMapHeight = 140;
  const { minX, minY, maxX, maxY } = getNodeBounds();
  const mapWorldWidth = Math.max(1, maxX - minX);
  const mapWorldHeight = Math.max(1, maxY - minY);
  const miniMapScale = Math.min(miniMapWidth / mapWorldWidth, miniMapHeight / mapWorldHeight);
  const miniMapContentWidth = mapWorldWidth * miniMapScale;
  const miniMapContentHeight = mapWorldHeight * miniMapScale;
  const miniMapOffsetX = (miniMapWidth - miniMapContentWidth) / 2;
  const miniMapOffsetY = (miniMapHeight - miniMapContentHeight) / 2;
  const canvasRect = canvasRef.current?.getBoundingClientRect();
  const viewportWorldX = (-pan.x) / zoom;
  const viewportWorldY = (-pan.y) / zoom;
  const viewportWorldWidth = (canvasRect?.width || 1) / zoom;
  const viewportWorldHeight = (canvasRect?.height || 1) / zoom;

  const setPanFromMiniMapPoint = (clientX: number, clientY: number) => {
    if (!canvasRef.current) return;
    const miniMapRect = canvasRef.current.querySelector('[data-minimap="true"]')?.getBoundingClientRect();
    if (!miniMapRect) return;

    const localX = Math.max(0, Math.min(miniMapWidth, clientX - miniMapRect.left));
    const localY = Math.max(0, Math.min(miniMapHeight, clientY - miniMapRect.top));
    const worldX = (localX - miniMapOffsetX) / miniMapScale + minX;
    const worldY = (localY - miniMapOffsetY) / miniMapScale + minY;

    const canvasViewRect = canvasRef.current.getBoundingClientRect();
    setPan({
      x: canvasViewRect.width / 2 - worldX * zoom,
      y: canvasViewRect.height / 2 - worldY * zoom
    });
  };

  return (
    <div ref={workspaceRef} className="w-full h-full flex flex-col bg-background overflow-hidden">
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
            onClick={() => setZoom(z => Math.min(z + 0.1, MAX_ZOOM))}
            className="p-2 hover:bg-muted rounded-lg transition"
            title="Zoom in"
          >
            <ZoomIn className="w-4 h-4 text-muted-foreground" />
          </button>
          <button
            onClick={() => setZoom(z => Math.max(z - 0.1, MIN_ZOOM))}
            className="p-2 hover:bg-muted rounded-lg transition"
            title="Zoom out"
          >
            <ZoomOut className="w-4 h-4 text-muted-foreground" />
          </button>
          <button
            onClick={handleFitToScreen}
            className="px-2 py-1.5 text-xs hover:bg-muted rounded-lg transition"
            title="Fit to screen"
          >
            <ScanLine className="w-4 h-4 text-muted-foreground" />
          </button>
          <button
            onClick={handleResetView}
            className="px-2 py-1.5 text-xs font-semibold hover:bg-muted rounded-lg transition text-muted-foreground"
            title="Reset to 100%"
          >
            100%
          </button>
          <div className="text-xs text-muted-foreground px-2">{Math.round(zoom * 100)}%</div>
          <button
            onClick={handleToggleFullscreen}
            className="p-2 hover:bg-muted rounded-lg transition"
            title={isFullscreen ? 'Exit fullscreen' : 'Maximize canvas'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4 text-muted-foreground" /> : <Maximize2 className="w-4 h-4 text-muted-foreground" />}
          </button>
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
      <div ref={canvasWorkspaceRef} className={cn("flex flex-1 overflow-hidden p-2 gap-2", isFullscreen && "bg-background")}>
        {/* Left Sidebar - Node Palette */}
        {showNodePalette ? (
          <>
            <div
              className="border border-border rounded-lg bg-card flex flex-col overflow-hidden shrink-0"
              style={{ width: leftPanelWidth }}
            >
              <div className="p-4 border-b border-border flex items-center justify-between gap-2">
                <p className="text-sm font-bold text-foreground">Add Node</p>
                <button
                  onClick={() => setShowNodePalette(false)}
                  className="p-1.5 rounded hover:bg-muted"
                  title="Collapse add node panel"
                >
                  <PanelLeftClose className="w-4 h-4 text-muted-foreground" />
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
            <div
              className="w-1.5 rounded bg-border/70 hover:bg-primary/50 cursor-col-resize"
              onMouseDown={() => setResizePanel('left')}
              title="Resize add node panel"
            />
          </>
        ) : (
          <button
            onClick={() => setShowNodePalette(true)}
            className="self-start mt-2 p-2 border border-border rounded-lg bg-card hover:bg-muted transition"
            title="Expand add node panel"
          >
            <PanelLeftOpen className="w-4 h-4 text-muted-foreground" />
          </button>
        )}

        {/* Canvas */}
        <div className="flex-1 min-w-0 flex flex-col border border-border rounded-lg bg-background overflow-hidden relative">
          {/* Canvas Toolbar */}
          <div className="bg-card border-b border-border px-4 py-2 flex gap-2">
            {!showNodePalette && (
              <button
                onClick={() => setShowNodePalette(true)}
                className="px-3 py-1.5 text-xs font-bold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add Node
              </button>
            )}
            <div className="text-xs text-muted-foreground px-2 py-1.5">
              Drag node to move • Drag canvas background to pan • +/- zoom • 0 reset • F fit • Arrow keys pan
            </div>
          </div>

          {/* Canvas */}
          <div
            ref={canvasRef}
            className={cn(
              'flex-1 overflow-hidden relative select-none',
              isPanning ? 'cursor-grabbing' : 'cursor-grab'
            )}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseUp}
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
              style={{ pointerEvents: 'auto' }}
            >
              <defs>
                <marker
                  id="workflow-edge-arrow"
                  viewBox="0 0 10 10"
                  markerWidth="8"
                  markerHeight="8"
                  refX="10"
                  refY="5"
                  orient="auto-start-reverse"
                  markerUnits="userSpaceOnUse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#3B82F6" />
                </marker>
                <marker
                  id="workflow-edge-arrow-selected"
                  viewBox="0 0 10 10"
                  markerWidth="8"
                  markerHeight="8"
                  refX="10"
                  refY="5"
                  orient="auto-start-reverse"
                  markerUnits="userSpaceOnUse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#EF4444" />
                </marker>
              </defs>

              {/* Edges */}
              {workflow.edges.map(edge => {
                const geometry = edgeGeometry[edge.id];
                if (!geometry) return null;
                const { x1, y1, x2, y2 } = geometry;

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
                      markerEnd={isSelected ? "url(#workflow-edge-arrow-selected)" : "url(#workflow-edge-arrow)"}
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
                const outputHandle = outputHandleRefs.current[`${draggingEdge.fromNodeId}:${draggingEdge.fromHandleId}`];
                const canvasRect = canvasRef.current?.getBoundingClientRect();
                if (!outputHandle || !canvasRect) return null;
                const sourceRect = outputHandle.getBoundingClientRect();

                const x1 = sourceRect.left + sourceRect.width / 2 - canvasRect.left;
                const y1 = sourceRect.top + sourceRect.height / 2 - canvasRect.top;
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
                          ref={(el) => {
                            inputHandleRefs.current[`${node.id}:${handle.id}`] = el;
                          }}
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
                          ref={(el) => {
                            outputHandleRefs.current[`${node.id}:${handle.id}`] = el;
                          }}
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

            <div
              data-minimap="true"
              className="absolute bottom-4 right-4 w-[220px] h-[140px] bg-card/95 border border-border rounded-md shadow-lg overflow-hidden"
              onMouseDown={(event) => {
                setIsMiniMapDragging(true);
                setPanFromMiniMapPoint(event.clientX, event.clientY);
              }}
              onMouseMove={(event) => {
                if (!isMiniMapDragging) return;
                setPanFromMiniMapPoint(event.clientX, event.clientY);
              }}
              onMouseUp={() => setIsMiniMapDragging(false)}
              onMouseLeave={() => setIsMiniMapDragging(false)}
              title="Mini map navigator"
            >
              <div className="flex items-center gap-1 px-2 py-1 border-b border-border text-[10px] text-muted-foreground">
                <Map className="w-3 h-3" /> Navigator
              </div>
              <svg width={miniMapWidth} height={miniMapHeight - 24} className="block">
                {workflow.edges.map((edge) => {
                  const sourceNode = workflow.nodes.find((n) => n.id === edge.sourceNodeId);
                  const targetNode = workflow.nodes.find((n) => n.id === edge.targetNodeId);
                  if (!sourceNode || !targetNode) return null;

                  const x1 = miniMapOffsetX + (sourceNode.x + 80 - minX) * miniMapScale;
                  const y1 = miniMapOffsetY + (sourceNode.y + 32 - minY) * miniMapScale - 24;
                  const x2 = miniMapOffsetX + (targetNode.x + 80 - minX) * miniMapScale;
                  const y2 = miniMapOffsetY + (targetNode.y + 32 - minY) * miniMapScale - 24;

                  return <line key={edge.id} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#64748B" strokeWidth="1" />;
                })}

                {workflow.nodes.map((node) => {
                  const x = miniMapOffsetX + (node.x - minX) * miniMapScale;
                  const y = miniMapOffsetY + (node.y - minY) * miniMapScale - 24;
                  const width = Math.max(4, 160 * miniMapScale);
                  const height = Math.max(3, 64 * miniMapScale);

                  return (
                    <rect
                      key={node.id}
                      x={x}
                      y={y}
                      width={width}
                      height={height}
                      fill={selectedNodeId === node.id ? '#2563EB' : '#94A3B8'}
                      opacity={0.85}
                      rx="2"
                    />
                  );
                })}

                <rect
                  x={miniMapOffsetX + (viewportWorldX - minX) * miniMapScale}
                  y={miniMapOffsetY + (viewportWorldY - minY) * miniMapScale - 24}
                  width={Math.max(10, viewportWorldWidth * miniMapScale)}
                  height={Math.max(10, viewportWorldHeight * miniMapScale)}
                  fill="transparent"
                  stroke="#F97316"
                  strokeWidth="1.5"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Right Panel - Node Config */}
        {selectedNode && showRightPanel && (
          <>
          <div
            className="w-1.5 rounded bg-border/70 hover:bg-primary/50 cursor-col-resize"
            onMouseDown={() => setResizePanel('right')}
            title="Resize properties panel"
          />
          <div className="bg-card border border-border rounded-lg p-4 flex flex-col gap-4 overflow-y-auto h-full shrink-0" style={{ width: rightPanelWidth }}>
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-bold text-foreground flex items-center gap-2">
                  <span className="text-2xl">{NODE_TYPES[selectedNode.type].icon}</span>
                  {selectedNode.label}
                </p>
                <button
                  onClick={() => setShowRightPanel(false)}
                  className="p-1.5 rounded hover:bg-muted"
                  title="Collapse properties panel"
                >
                  <PanelRightClose className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

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
          </>
        )}

        {selectedNode && !showRightPanel && (
          <button
            onClick={() => setShowRightPanel(true)}
            className="self-start mt-2 p-2 border border-border rounded-lg bg-card hover:bg-muted transition"
            title="Expand properties panel"
          >
            <PanelRightOpen className="w-4 h-4 text-muted-foreground" />
          </button>
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
