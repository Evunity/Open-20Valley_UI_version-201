import React, { useCallback, useEffect, useState, useMemo, useRef } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  useReactFlow,
  MarkerType,
  ConnectionMode,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Home, Filter, Maximize2, Minimize2, ZoomOut } from 'lucide-react';
import { TopologyObject } from '../utils/topologyData';
import DependencyNode from './DependencyNode';

interface DependencyGraphProps {
  topology: TopologyObject[];
  selectedNode?: TopologyObject | null;
  onNodeSelect?: (node: TopologyObject) => void;
}

const nodeTypes = {
  dependency: DependencyNode,
};

// Inner component that uses React Flow hooks
function DependencyGraphContent({
  topology,
  selectedNode,
  onNodeSelect
}: DependencyGraphProps) {
  const { fitView, getZoom, setCenter } = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [showOnlyUpstream, setShowOnlyUpstream] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize graph data
  useEffect(() => {
    const nodeMap = new Map<string, Node>();
    const getLevelForNode = (node: TopologyObject): number => {
      const levelMap: Record<string, number> = {
        global: 0,
        country: 1,
        region: 2,
        cluster: 3,
        site: 4,
        node: 5,
        cell: 5,
        equipment: 5,
        link: 5,
        rack: 6
      };
      return levelMap[node.type] || 5;
    };

    // Create nodes with MUCH larger spacing to prevent overlapping
    const nodesByLevel: Record<number, TopologyObject[]> = {};

    topology.forEach((obj) => {
      const level = getLevelForNode(obj);
      if (!nodesByLevel[level]) {
        nodesByLevel[level] = [];
      }
      nodesByLevel[level].push(obj);
    });

    let yOffset = 0;

    Object.entries(nodesByLevel).forEach(([levelStr, levelNodes]) => {
      const level = parseInt(levelStr);
      // Spread nodes across wider area
      const itemsPerRow = Math.max(1, Math.ceil(Math.sqrt(levelNodes.length)));

      levelNodes.forEach((obj, idx) => {
        const row = Math.floor(idx / itemsPerRow);
        const col = idx % itemsPerRow;

        // MASSIVE spacing: 600px horizontal, 500px vertical between nodes
        const x = (col - itemsPerRow / 2.5) * 600;
        const y = (level * 500) + (row * 350);

        nodeMap.set(obj.id, {
          id: obj.id,
          data: {
            label: obj.name,
            type: obj.type,
            health: obj.healthState,
            topology: obj,
            isSelected: selectedNode?.id === obj.id,
          },
          position: { x, y },
          type: 'dependency',
        });
      });

      yOffset = Math.max(yOffset, Object.keys(nodesByLevel).length * 500);
    });

    // Create edges
    const edgeList: Edge[] = [];
    topology.forEach((obj) => {
      if (obj.parentId) {
        const parentExists = topology.some(n => n.id === obj.parentId);
        if (parentExists) {
          edgeList.push({
            id: `${obj.parentId}-${obj.id}`,
            source: obj.parentId,
            target: obj.id,
            markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' },
            style: {
              stroke: '#94a3b8',
              strokeWidth: 2,
            },
            animated: false,
            type: 'smoothstep',
          });
        }
      }
    });

    setNodes(Array.from(nodeMap.values()));
    setEdges(edgeList);

    // Auto-fit view after render
    setTimeout(() => {
      fitView({ padding: 0.2, minZoom: 0.5, maxZoom: 2 });
    }, 100);
  }, [topology, setNodes, setEdges, fitView, selectedNode]);

  // Filter nodes and edges based on level and upstream only
  const filteredNodes = useMemo(() => {
    let result = nodes;

    // Apply level filter
    if (filterLevel !== 'all') {
      result = result.filter(node => {
        const topoObj = topology.find(t => t.id === node.id);
        if (!topoObj) return false;

        const levelMap: Record<string, number> = {
          global: 0,
          country: 1,
          region: 2,
          cluster: 3,
          site: 4,
          node: 5,
          cell: 5,
          equipment: 5,
          link: 5,
          rack: 6
        };

        return (levelMap[topoObj.type] || 5).toString() === filterLevel;
      });
    }

    // Apply upstream only filter
    if (showOnlyUpstream && selectedNode) {
      const upstreamIds = new Set<string>();

      // Find all upstream nodes (ancestors)
      const findUpstream = (nodeId: string) => {
        const topoObj = topology.find(t => t.id === nodeId);
        if (topoObj && topoObj.parentId) {
          upstreamIds.add(topoObj.parentId);
          findUpstream(topoObj.parentId);
        }
      };

      upstreamIds.add(selectedNode.id);
      findUpstream(selectedNode.id);

      result = result.filter(n => upstreamIds.has(n.id));
    }

    return result;
  }, [nodes, filterLevel, topology, showOnlyUpstream, selectedNode]);

  const filteredEdges = useMemo(() => {
    const filteredNodeIds = new Set(filteredNodes.map(n => n.id));
    return edges.filter(
      e => filteredNodeIds.has(e.source) && filteredNodeIds.has(e.target)
    );
  }, [edges, filteredNodes]);

  const handleNodeClick = useCallback((event: any, node: Node) => {
    const topoObj = topology.find(t => t.id === node.id);
    if (topoObj) {
      onNodeSelect?.(topoObj);
    }
  }, [topology, onNodeSelect]);

  const handleResetView = useCallback(() => {
    fitView({ padding: 0.2, minZoom: 0.3, maxZoom: 2, duration: 200 });
  }, [fitView]);

  const handleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;

    try {
      if (!isFullscreen) {
        if (containerRef.current.requestFullscreen) {
          await containerRef.current.requestFullscreen();
          setIsFullscreen(true);
        }
      } else {
        if (document.fullscreenElement) {
          await document.exitFullscreen();
          setIsFullscreen(false);
        }
      }
    } catch (err) {
      console.error('Fullscreen error:', err);
    }
  }, [isFullscreen]);

  const handleZoomOut = useCallback(() => {
    const currentZoom = getZoom();
    const newZoom = Math.max(0.2, currentZoom - 0.2);
    fitView({ padding: 0.2, minZoom: 0.2, maxZoom: 3, duration: 200 });
  }, [getZoom, fitView]);

  return (
    <div
      ref={containerRef}
      className={`w-full flex flex-col h-full gap-4 p-4 bg-background dark:bg-background overflow-hidden relative ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}
    >
      <p className="text-xs text-muted-foreground">
        {filteredNodes.length} nodes • {filteredEdges.length} relationships
      </p>

      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* View Controls */}
        <div className="flex items-center gap-2 border-r border-border pr-3">
          <button
            onClick={handleResetView}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition"
            title="Reset view to fit all nodes"
          >
            <Home className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition"
            title="Zoom out to see more nodes"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleFullscreen}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition"
            title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Level Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="text-xs px-2 py-1 border border-border rounded bg-background text-foreground"
          >
            <option value="all">All Levels</option>
            <option value="0">Global</option>
            <option value="1">Country</option>
            <option value="2">Region</option>
            <option value="3">Cluster</option>
            <option value="4">Site</option>
            <option value="5">Node</option>
            <option value="6">Rack</option>
          </select>
        </div>

        {/* Upstream Filter */}
        {selectedNode && (
          <label className="flex items-center gap-2 text-xs cursor-pointer bg-blue-50 dark:bg-blue-950 px-2 py-1 rounded border border-blue-200 dark:border-blue-800">
            <input
              type="checkbox"
              checked={showOnlyUpstream}
              onChange={(e) => setShowOnlyUpstream(e.target.checked)}
              className="rounded"
            />
            <span>Upstream Only</span>
          </label>
        )}
      </div>

      {/* ReactFlow Container */}
      <div className="flex-1 border border-border rounded-lg overflow-hidden bg-white dark:bg-gray-900">
        <ReactFlow
          nodes={filteredNodes}
          edges={filteredEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={handleNodeClick}
          nodeTypes={nodeTypes}
          connectionMode={ConnectionMode.Loose}
          fitView
        >
          <Background color="#cbd5e1" gap={16} />
          <Controls position="bottom-left" showInteractive={false} />
        </ReactFlow>
      </div>

      {/* Floating Info Panel - Overlay on graph */}
      {selectedNode && (
        <div className="absolute bottom-6 right-6 w-80 p-4 bg-card rounded-lg border border-border shadow-lg z-10 max-h-48 overflow-y-auto">
          <h3 className="font-bold text-foreground mb-3 text-sm">{selectedNode.name}</h3>
          <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
            <div>
              <p className="font-semibold text-foreground">Type</p>
              <p className="text-xs">{selectedNode.type}</p>
            </div>
            <div>
              <p className="font-semibold text-foreground">Health</p>
              <p className="text-xs">{selectedNode.healthState}</p>
            </div>
            <div>
              <p className="font-semibold text-foreground">Vendor</p>
              <p className="text-xs">{selectedNode.vendor || 'Unknown'}</p>
            </div>
            <div>
              <p className="font-semibold text-foreground">Alarms</p>
              <p className="text-xs">{selectedNode.alarmSummary.critical + selectedNode.alarmSummary.major}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Wrapper component to provide React Flow context
export const DependencyGraph: React.FC<DependencyGraphProps> = (props) => {
  return (
    <ReactFlowProvider>
      <DependencyGraphContent {...props} />
    </ReactFlowProvider>
  );
};

export default DependencyGraph;
