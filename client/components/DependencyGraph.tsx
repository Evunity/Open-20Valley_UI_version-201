import React, { useCallback, useEffect, useState, useMemo } from 'react';
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
import { Home, Filter } from 'lucide-react';
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
  const { fitView } = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [showOnlyUpstream, setShowOnlyUpstream] = useState(false);

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

    // Create nodes with better positioning using hierarchy
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
      const itemsPerRow = Math.max(3, Math.ceil(Math.sqrt(levelNodes.length)));
      
      levelNodes.forEach((obj, idx) => {
        const row = Math.floor(idx / itemsPerRow);
        const col = idx % itemsPerRow;
        
        const x = (col - itemsPerRow / 2) * 250;
        const y = (level * 200) + (row * 120);

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
      
      yOffset = Math.max(yOffset, Object.keys(nodesByLevel).length * 200);
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

  // Filter nodes and edges based on level
  const filteredNodes = useMemo(() => {
    if (filterLevel === 'all') {
      return nodes;
    }
    
    return nodes.filter(node => {
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
    fitView({ padding: 0.2, minZoom: 0.5, maxZoom: 2, duration: 200 });
  }, [fitView]);

  return (
    <div className="w-full flex flex-col h-full gap-4 p-4 bg-background dark:bg-background overflow-hidden">
      <p className="text-xs text-muted-foreground">
        {filteredNodes.length} nodes • {filteredEdges.length} relationships
      </p>

      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <button
            onClick={handleResetView}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition"
            title="Reset view"
          >
            <Home className="w-4 h-4" />
          </button>
        </div>

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

        <label className="flex items-center gap-2 text-xs cursor-pointer">
          <input
            type="checkbox"
            checked={showOnlyUpstream}
            onChange={(e) => setShowOnlyUpstream(e.target.checked)}
            className="rounded"
          />
          <span>Upstream Only</span>
        </label>
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
          <Controls />
        </ReactFlow>
      </div>

      {/* Info Panel */}
      {selectedNode && (
        <div className="p-4 bg-card rounded-lg border border-border">
          <h3 className="font-bold text-foreground mb-2">{selectedNode.name}</h3>
          <div className="grid grid-cols-4 gap-4 text-xs text-muted-foreground">
            <div>
              <p className="font-semibold text-foreground">Type</p>
              <p>{selectedNode.type}</p>
            </div>
            <div>
              <p className="font-semibold text-foreground">Health</p>
              <p>{selectedNode.healthState}</p>
            </div>
            <div>
              <p className="font-semibold text-foreground">Vendor</p>
              <p>{selectedNode.vendor || 'Unknown'}</p>
            </div>
            <div>
              <p className="font-semibold text-foreground">Alarms</p>
              <p>{selectedNode.alarmSummary.critical + selectedNode.alarmSummary.major}</p>
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
