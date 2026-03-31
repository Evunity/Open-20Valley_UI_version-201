import React, { useState, useCallback } from 'react';
import { Plus, Trash2, Edit2, Eye, EyeOff, Copy, AlertCircle, Check, X } from 'lucide-react';
import { TopologyObject } from '../utils/topologyData';
import { HierarchyManager, HierarchyValidator, VALID_CHILDREN } from '../utils/hierarchyManager';

interface EditableTreeViewProps {
  topology: TopologyObject[];
  editMode?: boolean;
  onEditModeChange?: (mode: boolean) => void;
  onTopologyChange?: (topology: TopologyObject[]) => void;
}

interface AddNodeModalState {
  isOpen: boolean;
  parentId: string | null;
  parentType: string | null;
}

interface RenameModalState {
  isOpen: boolean;
  nodeId: string | null;
  currentName: string;
  newName: string;
}

export const EditableTreeView: React.FC<EditableTreeViewProps> = ({
  topology,
  editMode: parentEditMode = false,
  onEditModeChange,
  onTopologyChange
}) => {
  const [editMode, setEditMode] = useState(parentEditMode);

  React.useEffect(() => {
    setEditMode(parentEditMode);
  }, [parentEditMode]);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['global']));
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [dragOverNode, setDragOverNode] = useState<string | null>(null);
  const [localTopology, setLocalTopology] = useState<TopologyObject[]>(topology);
  const [hierarchyManager, setHierarchyManager] = useState(() => new HierarchyManager(topology));
  const [addNodeModal, setAddNodeModal] = useState<AddNodeModalState>({
    isOpen: false,
    parentId: null,
    parentType: null
  });
  const [renameModal, setRenameModal] = useState<RenameModalState>({
    isOpen: false,
    nodeId: null,
    currentName: '',
    newName: ''
  });
  const [newNodeForm, setNewNodeForm] = useState({
    name: '',
    type: 'region' as const,
    vendor: 'Nokia' as const
  });
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Update local topology when props change
  React.useEffect(() => {
    setLocalTopology(topology);
    setHierarchyManager(new HierarchyManager(topology));
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

  const handleAddNode = useCallback(() => {
    if (!newNodeForm.name.trim()) {
      setError('Node name cannot be empty');
      return;
    }

    const result = hierarchyManager.addNode(
      newNodeForm.name,
      newNodeForm.type,
      addNodeModal.parentId || undefined,
      newNodeForm.vendor
    );

    if (result.success) {
      const updatedTopology = hierarchyManager.export();
      setLocalTopology(updatedTopology);
      onTopologyChange?.(updatedTopology);
      setError(null);
      setNewNodeForm({ name: '', type: 'region', vendor: 'Nokia' });
      setAddNodeModal({ isOpen: false, parentId: null, parentType: null });
    } else {
      setError(result.error || 'Failed to add node');
    }
  }, [newNodeForm, addNodeModal.parentId, hierarchyManager, onTopologyChange]);

  const handleRemoveNode = useCallback((nodeId: string) => {
    if (!window.confirm('Are you sure you want to remove this node and all its children?')) {
      return;
    }

    const result = hierarchyManager.removeNode(nodeId);
    if (result.success) {
      const updatedTopology = hierarchyManager.export();
      setLocalTopology(updatedTopology);
      onTopologyChange?.(updatedTopology);
      setError(null);
      setSelectedNodeId(null);
    } else {
      setError(result.error || 'Failed to remove node');
    }
  }, [hierarchyManager, onTopologyChange]);

  const handleRenameNode = useCallback(() => {
    if (!renameModal.nodeId) return;
    if (!renameModal.newName.trim()) {
      setError('Name cannot be empty');
      return;
    }

    const result = hierarchyManager.renameNode(renameModal.nodeId, renameModal.newName);
    if (result.success) {
      const updatedTopology = hierarchyManager.export();
      setLocalTopology(updatedTopology);
      onTopologyChange?.(updatedTopology);
      setError(null);
      setRenameModal({ isOpen: false, nodeId: null, currentName: '', newName: '' });
    } else {
      setError(result.error || 'Failed to rename node');
    }
  }, [renameModal, hierarchyManager, onTopologyChange]);

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

    // Validate the move
    const draggedNodeObj = hierarchyManager.findById(draggedNode);
    if (!draggedNodeObj) {
      setError('Source node not found');
      setDraggedNode(null);
      setDragOverNode(null);
      return;
    }

    const result = hierarchyManager.moveNode(draggedNode, targetId);
    if (result.success) {
      const updatedTopology = hierarchyManager.export();
      setLocalTopology(updatedTopology);
      onTopologyChange?.(updatedTopology);
      setError(null);
    } else {
      setError(result.error || 'Cannot move to this location');
    }

    setDraggedNode(null);
    setDragOverNode(null);
  };

  const getValidChildTypes = (nodeType: string): string[] => {
    const validTypes = VALID_CHILDREN[nodeType as any];
    return validTypes || [];
  };

  const renderNode = (nodeId: string, level: number): React.ReactNode => {
    const node = hierarchyManager.findById(nodeId);
    if (!node) return null;

    const children = hierarchyManager.getChildren(nodeId);
    const isExpanded = expandedNodes.has(nodeId);
    const isDragging = draggedNode === nodeId;
    const isDragOver = dragOverNode === nodeId;
    const isSelected = selectedNodeId === nodeId;
    const validChildTypes = getValidChildTypes(node.type);

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
            {children.length > 0 && (
              <span className="ml-auto text-xs text-gray-500 dark:text-gray-500 flex-shrink-0">
                {children.length}
              </span>
            )}
          </button>

          {/* Edit Mode Controls */}
          {editMode && nodeId !== 'global' && (
            <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
              <button
                onClick={() => setRenameModal({ isOpen: true, nodeId, currentName: node.name, newName: node.name })}
                className="p-1 hover:bg-purple-100 dark:hover:bg-purple-900 rounded transition"
                title="Rename node"
              >
                <Edit2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </button>

              {validChildTypes.length > 0 && (
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
              )}

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

      {/* Error Message */}
      {error && (
        <div className="px-4 py-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-sm text-red-700 dark:text-red-300">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-auto p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tree View Container */}
      <div className="flex-1 bg-card rounded-lg border border-border p-4 overflow-y-auto">
        {rootNodes.length > 0 ? (
          <div className="space-y-0.5">
            {rootNodes.map(root => renderNode(root.id, 0))}
          </div>
        ) : (
          <p className="text-sm text-gray-600">No nodes in hierarchy</p>
        )}
      </div>

      {/* Edit Mode Info */}
      {editMode && (
        <div className="px-3 py-2 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg text-xs text-blue-700 dark:text-blue-300">
          <strong>Edit Mode:</strong> Drag to move, hover for add/rename/remove. Changes are applied immediately.
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
                  onChange={(e) => setNewNodeForm({ ...newNodeForm, name: e.target.value })}
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
                  onChange={(e) => setNewNodeForm({ ...newNodeForm, type: e.target.value as any })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {getValidChildTypes(addNodeModal.parentType || '').map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Vendor */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1">
                  Vendor
                </label>
                <select
                  value={newNodeForm.vendor}
                  onChange={(e) => setNewNodeForm({ ...newNodeForm, vendor: e.target.value as any })}
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
                  setError(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rename Modal */}
      {renameModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-foreground mb-4">Rename Node</h3>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-foreground mb-2">
                Current Name: {renameModal.currentName}
              </label>
              <input
                type="text"
                value={renameModal.newName}
                onChange={(e) => setRenameModal({ ...renameModal, newName: e.target.value })}
                placeholder="Enter new name"
                className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground focus:ring-2 focus:ring-purple-500 outline-none"
                autoFocus
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleRenameNode}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition"
              >
                Rename
              </button>
              <button
                onClick={() => {
                  setRenameModal({ isOpen: false, nodeId: null, currentName: '', newName: '' });
                  setError(null);
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
