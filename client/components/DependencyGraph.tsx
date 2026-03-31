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
import { Home, Filter, Maximize2, Minimize2 } from 'lucide-react';
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
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const graphContainerRef = useRef<HTMLDivElement>(null);

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

        // MASSIVE spacing: 850px horizontal, 650px vertical between levels, 450px between rows
        const x = (col - itemsPerRow / 2.5) * 850;
        const y = (level * 650) + (row * 450);

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

  // Filter nodes and edges based on level - includes selected level and all descendants
  const filteredNodes = useMemo(() => {
    if (filterLevel === 'all') {
      return nodes;
    }

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

    const selectedLevelNum = parseInt(filterLevel);
    const nodeIds = new Set<string>();

    // Build a map of children for each node for efficient lookup
    const childrenMap = new Map<string, string[]>();
    topology.forEach(obj => {
      if (obj.parentId) {
        if (!childrenMap.has(obj.parentId)) {
          childrenMap.set(obj.parentId, []);
        }
        childrenMap.get(obj.parentId)!.push(obj.id);
      }
    });

    // First, add all nodes at the selected level and their descendants
    const addNodeAndDescendants = (nodeId: string) => {
      nodeIds.add(nodeId);
      // Recursively add all children
      const children = childrenMap.get(nodeId);
      if (children) {
        children.forEach(childId => addNodeAndDescendants(childId));
      }
    };

    // Find all nodes at the selected level and add them with their descendants
    topology.forEach(obj => {
      const nodeLevel = levelMap[obj.type] || 5;
      if (nodeLevel === selectedLevelNum) {
        addNodeAndDescendants(obj.id);
      }
    });

    return nodes.filter(node => nodeIds.has(node.id));
  }, [nodes, filterLevel, topology]);

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
    if (!graphContainerRef.current) return;

    try {
      if (!isFullscreen) {
        if (graphContainerRef.current.requestFullscreen) {
          await graphContainerRef.current.requestFullscreen();
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

  const handleZoomChange = useCallback((newZoom: number) => {
    setZoomLevel(newZoom);
    // Update zoom by using fitView with bounds that force the desired zoom level
    // This approach ensures the graph zooms to the desired level
    if (filteredNodes.length === 0) return;

    // Calculate viewport to achieve target zoom
    const allX = filteredNodes.map(n => n.position.x);
    const allY = filteredNodes.map(n => n.position.y);
    const centerX = (Math.max(...allX) + Math.min(...allX)) / 2;
    const centerY = (Math.max(...allY) + Math.min(...allY)) / 2;

    // Use setCenter to position at the calculated center with desired zoom
    setCenter(centerX, centerY, { zoom: newZoom, duration: 0 });
  }, [filteredNodes, setCenter]);

  return (
    <div
      ref={containerRef}
      className="w-full flex flex-col h-full gap-4 p-4 bg-background dark:bg-background overflow-hidden relative"
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
            onClick={handleFullscreen}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition"
            title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Zoom Slider */}
        <div className="flex items-center gap-2 border-r border-border pr-3">
          <label className="text-xs text-muted-foreground whitespace-nowrap">Zoom:</label>
          <input
            type="range"
            min="10"
            max="300"
            step="1"
            value={Math.round(zoomLevel * 100)}
            onChange={(e) => handleZoomChange(parseInt(e.target.value) / 100)}
            className="w-24 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            title="Zoom level"
          />
          <span className="text-xs text-muted-foreground w-10 text-right">
            {Math.round(zoomLevel * 100)}%
          </span>
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
      </div>

      {/* ReactFlow Container */}
      <div
        ref={graphContainerRef}
        className={`flex-1 border border-border rounded-lg overflow-hidden bg-white dark:bg-gray-900 ${isFullscreen ? 'fixed inset-0 z-50 rounded-none border-0' : ''}`}
      >
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
