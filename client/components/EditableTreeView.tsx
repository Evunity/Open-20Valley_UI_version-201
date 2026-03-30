import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Eye } from 'lucide-react';
import { TopologyObject } from '../utils/topologyData';

interface EditableTreeViewProps {
  topology: TopologyObject[];
  onTopologyChange?: (topology: TopologyObject[]) => void;
}

interface AddNodeModalState {
  isOpen: boolean;
  parentId: string | null;
  parentType: string | null;
}

export const EditableTreeView: React.FC<EditableTreeViewProps> = ({
  topology,
  onTopologyChange
}) => {
  const [editMode, setEditMode] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['global']));
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [dragOverNode, setDragOverNode] = useState<string | null>(null);
  const [localTopology, setLocalTopology] = useState<TopologyObject[]>(topology);
  const [addNodeModal, setAddNodeModal] = useState<AddNodeModalState>({
    isOpen: false,
    parentId: null,
    parentType: null
  });
  const [newNodeForm, setNewNodeForm] = useState({
    name: '',
    type: 'region' as const,
    vendor: 'Nokia' as const
  });
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Update local topology when props change
  React.useEffect(() => {
    setLocalTopology(topology);
  }, [topology]);

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedNodes(newExpanded);
  };

  const getNodeById = (id: string): TopologyObject | undefined => {
    return localTopology.find(n => n.id === id);
  };

  const getChildrenOf = (parentId: string): TopologyObject[] => {
    return localTopology.filter(n => n.parentId === parentId);
  };

  const handleDragStart = (e: React.DragEvent, nodeId: string) => {
    if (!editMode) return;
    e.stopPropagation();
    setDraggedNode(nodeId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, nodeId: string) => {
    if (!editMode || !draggedNode) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverNode(nodeId);
  };

  const handleDragLeave = () => {
    setDragOverNode(null);
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    if (!editMode || !draggedNode) return;
    e.preventDefault();
    e.stopPropagation();

    if (draggedNode === targetId) {
      setDraggedNode(null);
      setDragOverNode(null);
      return;
    }

    // Find the dragged and target nodes
    const draggedNode_obj = getNodeById(draggedNode);
    const targetNode = getNodeById(targetId);

    if (!draggedNode_obj || !targetNode) return;

    // Don't allow dropping a node on itself or its children
    const isDescendant = (parentId: string, childId: string): boolean => {
      const children = getChildrenOf(parentId);
      if (children.some(c => c.id === childId)) return true;
      return children.some(c => isDescendant(c.id, childId));
    };

    if (isDescendant(draggedNode, targetId)) {
      setDraggedNode(null);
      setDragOverNode(null);
      return;
    }

    // Perform the move operation
    const updated = localTopology.map(node => {
      if (node.id === draggedNode) {
        return { ...node, parentId: targetId };
      }
      if (node.id === targetId) {
        return {
          ...node,
          childrenIds: node.childrenIds.includes(draggedNode)
            ? node.childrenIds
            : [...node.childrenIds, draggedNode]
        };
      }
      if (node.parentId === draggedNode && node.id !== draggedNode_obj.parentId) {
        return {
          ...node,
          parentId: node.parentId
        };
      }
      if (node.id === draggedNode_obj.parentId) {
        return {
          ...node,
          childrenIds: node.childrenIds.filter(id => id !== draggedNode)
        };
      }
      return node;
    });

    setLocalTopology(updated);
    onTopologyChange?.(updated);
    setDraggedNode(null);
    setDragOverNode(null);
  };

  const handleRemoveNode = (nodeId: string) => {
    if (!window.confirm('Are you sure you want to remove this node and all its children?')) {
      return;
    }

    const nodeToRemove = getNodeById(nodeId);
    if (!nodeToRemove) return;

    // Collect all nodes to remove (node + descendants)
    const nodesToRemove = new Set<string>();
    const collect = (id: string) => {
      nodesToRemove.add(id);
      getChildrenOf(id).forEach(child => collect(child.id));
    };
    collect(nodeId);

    // Update topology
    const updated = localTopology
      .filter(n => !nodesToRemove.has(n.id))
      .map(node => ({
        ...node,
        childrenIds: node.childrenIds.filter(id => !nodesToRemove.has(id))
      }));

    setLocalTopology(updated);
    onTopologyChange?.(updated);
    setSelectedNodeId(null);
  };

  const handleAddNode = () => {
    if (!newNodeForm.name.trim() || !addNodeModal.parentId) return;

    const newNode: TopologyObject = {
      id: `${newNodeForm.type}_${Date.now()}`,
      name: newNodeForm.name,
      type: newNodeForm.type,
      vendor: newNodeForm.vendor,
      parentId: addNodeModal.parentId,
      childrenIds: [],
      healthState: 'healthy',
      alarmSummary: { critical: 0, major: 0, minor: 0, warning: 0 },
      kpiSummary: {
        availability: 99.5,
        dropRate: 0,
        throughput: 90,
        latency: 15,
        utilization: 50
      },
      automationLocked: false,
      lastStateChange: new Date().toISOString(),
      description: newNodeForm.name
    };

    const updated = [
      ...localTopology.map(node =>
        node.id === addNodeModal.parentId
          ? { ...node, childrenIds: [...node.childrenIds, newNode.id] }
          : node
      ),
      newNode
    ];

    setLocalTopology(updated);
    onTopologyChange?.(updated);

    // Reset form and close modal
    setNewNodeForm({ name: '', type: 'region', vendor: 'Nokia' });
    setAddNodeModal({ isOpen: false, parentId: null, parentType: null });
  };

  const renderNode = (nodeId: string, level: number): React.ReactNode => {
    const node = getNodeById(nodeId);
    if (!node) return null;

    const children = getChildrenOf(nodeId);
    const isExpanded = expandedNodes.has(nodeId);
    const isDragging = draggedNode === nodeId;
    const isDragOver = dragOverNode === nodeId;
    const isSelected = selectedNodeId === nodeId;

    return (
      <div key={nodeId} style={{ marginLeft: `${level * 16}px` }} className="mb-0.5">
        <div
          draggable={editMode && nodeId !== 'global'}
          onDragStart={(e) => handleDragStart(e, nodeId)}
          onDragOver={(e) => handleDragOver(e, nodeId)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, nodeId)}
          className={`group flex items-center gap-1 px-2 py-1.5 rounded transition ${
            isDragOver
              ? 'bg-blue-100 dark:bg-blue-950 border-2 border-blue-500'
              : isDragging
              ? 'opacity-50 bg-gray-100 dark:bg-gray-800'
              : isSelected
              ? 'bg-blue-50 dark:bg-blue-950 border border-blue-300'
              : 'hover:bg-gray-50 dark:hover:bg-gray-800'
          } ${editMode ? 'cursor-move' : ''}`}
        >
          {/* Expand/Collapse Button */}
          <button
            onClick={() => toggleExpanded(nodeId)}
            className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-gray-600 dark:text-gray-400"
          >
            {children.length > 0 ? (
              <span className={`transition ${isExpanded ? 'rotate-90' : ''}`}>▶</span>
            ) : (
              <span className="text-gray-300">•</span>
            )}
          </button>

          {/* Node Content */}
          <button
            onClick={() => setSelectedNodeId(isSelected ? null : nodeId)}
            className="flex-1 text-left flex items-center gap-2 min-w-0"
          >
            <span
              className={`flex-shrink-0 px-1.5 py-0.5 rounded text-xs font-semibold ${
                node.healthState === 'healthy'
                  ? 'bg-green-100 dark:bg-green-950 text-green-800 dark:text-green-300'
                  : node.healthState === 'degraded'
                  ? 'bg-yellow-100 dark:bg-yellow-950 text-yellow-800 dark:text-yellow-300'
                  : 'bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300'
              }`}
            >
              {node.type}
            </span>
            <span className="font-medium text-foreground truncate">{node.name}</span>
            <span className="ml-auto text-xs text-gray-500 dark:text-gray-500 flex-shrink-0">
              {node.alarmSummary.critical + node.alarmSummary.major} alarms
            </span>
          </button>

          {/* Edit Mode Controls */}
          {editMode && nodeId !== 'global' && (
            <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
              <button
                onClick={() => {
                  setAddNodeModal({
                    isOpen: true,
                    parentId: nodeId,
                    parentType: node.type
                  });
                }}
                className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900 rounded transition"
                title="Add child node"
              >
                <Plus className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </button>
              <button
                onClick={() => handleRemoveNode(nodeId)}
                className="p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded transition"
                title="Remove node"
              >
                <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
              </button>
            </div>
          )}
        </div>

        {/* Render children if expanded */}
        {isExpanded && children.length > 0 && (
          <div className="border-l border-gray-200 dark:border-gray-700 ml-2.5 mt-0.5">
            {children.map(child => renderNode(child.id, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const rootNodes = localTopology.filter(n => !n.parentId);

  return (
    <div className="w-full flex flex-col h-full gap-4 p-4 bg-background dark:bg-background overflow-y-auto">
      {/* Header with mode toggle */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">Hierarchical Tree View</h2>
        <button
          onClick={() => setEditMode(!editMode)}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2 ${
            editMode
              ? 'bg-blue-600 text-white dark:bg-blue-700'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          {editMode ? (
            <>
              <Edit2 className="w-4 h-4" />
              Edit Mode
            </>
          ) : (
            <>
              <Eye className="w-4 h-4" />
              View Mode
            </>
          )}
        </button>
      </div>

      {/* Tree View Container */}
      <div className="flex-1 bg-card rounded-lg border border-border p-4 overflow-y-auto">
        {rootNodes.length > 0 ? (
          <div className="space-y-0.5">
            {rootNodes.map(root => renderNode(root.id, 0))}
          </div>
        ) : (
          <p className="text-sm text-gray-600">No nodes visible with current filters</p>
        )}
      </div>

      {/* Edit Mode Info */}
      {editMode && (
        <div className="px-3 py-2 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg text-xs text-blue-700 dark:text-blue-300">
          <strong>Edit Mode:</strong> Drag nodes to reorganize, hover to add/remove nodes
        </div>
      )}

      {/* Add Node Modal */}
      {addNodeModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-foreground mb-4">
              Add {addNodeModal.parentType} Child
            </h3>

            <div className="space-y-4 mb-6">
              {/* Node Name */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1">
                  Node Name
                </label>
                <input
                  type="text"
                  value={newNodeForm.name}
                  onChange={(e) =>
                    setNewNodeForm({ ...newNodeForm, name: e.target.value })
                  }
                  placeholder="Enter node name"
                  className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground focus:ring-2 focus:ring-blue-500 outline-none"
                  autoFocus
                />
              </div>

              {/* Node Type */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1">
                  Type
                </label>
                <select
                  value={newNodeForm.type}
                  onChange={(e) =>
                    setNewNodeForm({ ...newNodeForm, type: e.target.value as any })
                  }
                  className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="region">Region</option>
                  <option value="cluster">Cluster</option>
                  <option value="site">Site</option>
                  <option value="node">Node</option>
                  <option value="rack">Rack</option>
                </select>
              </div>

              {/* Vendor */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1">
                  Vendor
                </label>
                <select
                  value={newNodeForm.vendor}
                  onChange={(e) =>
                    setNewNodeForm({ ...newNodeForm, vendor: e.target.value as any })
                  }
                  className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="Nokia">Nokia</option>
                  <option value="Ericsson">Ericsson</option>
                  <option value="Huawei">Huawei</option>
                  <option value="ZTE">ZTE</option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleAddNode}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Add Node
              </button>
              <button
                onClick={() => {
                  setAddNodeModal({ isOpen: false, parentId: null, parentType: null });
                  setNewNodeForm({ name: '', type: 'region', vendor: 'Nokia' });
                }}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
