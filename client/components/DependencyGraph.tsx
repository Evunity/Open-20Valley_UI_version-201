import React, { useState, useEffect, useRef } from 'react';
import { ZoomIn, ZoomOut, Home, Filter } from 'lucide-react';
import { TopologyObject } from '../utils/topologyData';

interface Node {
  id: string;
  label: string;
  type: string;
  x: number;
  y: number;
  level: number;
  healthState: string;
}

interface Edge {
  source: string;
  target: string;
  type: 'parent-child' | 'dependency';
}

interface DependencyGraphProps {
  topology: TopologyObject[];
  selectedNode?: TopologyObject | null;
  onNodeSelect?: (node: TopologyObject) => void;
}

export const DependencyGraph: React.FC<DependencyGraphProps> = ({
  topology,
  selectedNode,
  onNodeSelect
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [showOnlyUpstream, setShowOnlyUpstream] = useState(false);

  // Initialize graph data
  useEffect(() => {
    // Calculate hierarchy levels for each node
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

    // Create nodes
    topology.forEach((obj, idx) => {
      const level = getLevelForNode(obj);
      nodeMap.set(obj.id, {
        id: obj.id,
        label: obj.name,
        type: obj.type,
        x: Math.cos((idx / topology.length) * Math.PI * 2) * (200 + level * 80),
        y: Math.sin((idx / topology.length) * Math.PI * 2) * (200 + level * 80),
        level,
        healthState: obj.healthState
      });
    });

    // Create edges (parent-child relationships)
    const edgeList: Edge[] = [];
    topology.forEach(obj => {
      if (obj.parentId) {
        const parentExists = topology.some(n => n.id === obj.parentId);
        if (parentExists) {
          edgeList.push({
            source: obj.parentId,
            target: obj.id,
            type: 'parent-child'
          });
        }
      }
    });

    setNodes(Array.from(nodeMap.values()));
    setEdges(edgeList);
  }, [topology]);

  // Render graph using canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const rect = canvas.parentElement?.getBoundingClientRect();
    if (rect) {
      canvas.width = rect.width;
      canvas.height = rect.height;
    }

    // Clear canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Apply pan and zoom transforms
    ctx.save();
    ctx.translate(canvas.width / 2 + panX, canvas.height / 2 + panY);
    ctx.scale(zoom, zoom);

    // Filter nodes by level if needed
    const filteredNodes = filterLevel === 'all' 
      ? nodes 
      : nodes.filter(n => n.level.toString() === filterLevel);

    const filteredNodeIds = new Set(filteredNodes.map(n => n.id));

    // Filter edges
    const filteredEdges = edges.filter(
      e => filteredNodeIds.has(e.source) && filteredNodeIds.has(e.target)
    );

    // Draw edges
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    filteredEdges.forEach(edge => {
      const sourceNode = filteredNodes.find(n => n.id === edge.source);
      const targetNode = filteredNodes.find(n => n.id === edge.target);
      if (sourceNode && targetNode) {
        ctx.beginPath();
        ctx.moveTo(sourceNode.x, sourceNode.y);
        ctx.lineTo(targetNode.x, targetNode.y);
        ctx.stroke();

        // Draw arrow
        const angle = Math.atan2(targetNode.y - sourceNode.y, targetNode.x - sourceNode.x);
        const arrowSize = 8;
        ctx.fillStyle = '#94a3b8';
        ctx.beginPath();
        ctx.moveTo(targetNode.x, targetNode.y);
        ctx.lineTo(
          targetNode.x - arrowSize * Math.cos(angle - Math.PI / 6),
          targetNode.y - arrowSize * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
          targetNode.x - arrowSize * Math.cos(angle + Math.PI / 6),
          targetNode.y - arrowSize * Math.sin(angle + Math.PI / 6)
        );
        ctx.fill();
      }
    });

    // Draw nodes
    filteredNodes.forEach(node => {
      const isSelected = selectedNode?.id === node.id;
      const isHovered = hoveredNodeId === node.id;
      const radius = isSelected || isHovered ? 20 : 12;

      // Node circle
      ctx.fillStyle =
        node.healthState === 'healthy'
          ? '#10b981'
          : node.healthState === 'degraded'
          ? '#f59e0b'
          : '#ef4444';

      if (isSelected) {
        ctx.strokeStyle = '#0ea5e9';
        ctx.lineWidth = 3;
      } else if (isHovered) {
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 2;
      }

      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
      ctx.fill();

      if (isSelected || isHovered) {
        ctx.stroke();
      }

      // Node label
      ctx.fillStyle = '#1f2937';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.label.substring(0, 8), node.x, node.y + radius + 15);
    });

    ctx.restore();

    // Draw legend
    const legendX = 20;
    const legendY = 20;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(legendX - 5, legendY - 5, 150, 100);
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.strokeRect(legendX - 5, legendY - 5, 150, 100);

    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('Legend', legendX + 70, legendY + 10);

    const legendItems = [
      { color: '#10b981', label: 'Healthy' },
      { color: '#f59e0b', label: 'Degraded' },
      { color: '#ef4444', label: 'Down' }
    ];

    legendItems.forEach((item, idx) => {
      ctx.fillStyle = item.color;
      ctx.beginPath();
      ctx.arc(legendX + 10, legendY + 30 + idx * 20, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#1f2937';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(item.label, legendX + 25, legendY + 30 + idx * 20);
    });
  }, [nodes, edges, zoom, panX, panY, selectedNode, hoveredNodeId, filterLevel, topology]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - canvas.width / 2 - panX) / zoom;
    const y = (e.clientY - rect.top - canvas.height / 2 - panY) / zoom;

    // Check if click is on a node
    const filteredNodes = filterLevel === 'all' 
      ? nodes 
      : nodes.filter(n => n.level.toString() === filterLevel);

    for (const node of filteredNodes) {
      const distance = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2);
      if (distance < 20) {
        const topoNode = topology.find(t => t.id === node.id);
        if (topoNode) {
          onNodeSelect?.(topoNode);
        }
        return;
      }
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - canvas.width / 2 - panX) / zoom;
    const y = (e.clientY - rect.top - canvas.height / 2 - panY) / zoom;

    const filteredNodes = filterLevel === 'all' 
      ? nodes 
      : nodes.filter(n => n.level.toString() === filterLevel);

    for (const node of filteredNodes) {
      const distance = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2);
      if (distance < 20) {
        setHoveredNodeId(node.id);
        canvas.style.cursor = 'pointer';
        return;
      }
    }

    setHoveredNodeId(null);
    canvas.style.cursor = 'default';
  };

  return (
    <div className="w-full flex flex-col h-full gap-4 p-4 bg-background dark:bg-background overflow-hidden">
      <p className="text-xs text-muted-foreground">
        {nodes.length} nodes • {edges.length} relationships
      </p>

      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom(Math.min(zoom + 0.2, 3))}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition"
            title="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <span className="text-xs text-muted-foreground w-8 text-center">{Math.round(zoom * 100)}%</span>
          <button
            onClick={() => setZoom(Math.max(zoom - 0.2, 0.5))}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition"
            title="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={() => {
            setZoom(1);
            setPanX(0);
            setPanY(0);
          }}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition"
          title="Reset view"
        >
          <Home className="w-4 h-4" />
        </button>

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

      {/* Canvas */}
      <div className="flex-1 border border-border rounded-lg overflow-hidden bg-white dark:bg-gray-900">
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          onMouseMove={handleCanvasMouseMove}
          className="w-full h-full"
        />
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
};
