import React, { useState, useCallback, useMemo } from 'react';
import { Plus, Trash2, Edit2, Eye, EyeOff, Copy, AlertCircle, Check, X, Search } from 'lucide-react';
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

type ManagedNodeType = 'vendor' | 'site' | 'technology' | 'cell';

interface ManagedTreeNode {
  id: string;
  type: ManagedNodeType;
  name: string;
  parentId?: string;
  code?: string;
  description?: string;
  status?: string;
  siteCode?: string;
  location?: string;
  technologyType?: string;
  cellId?: string;
  band?: string;
}

interface ManagedNodeModalState {
  isOpen: boolean;
  mode: 'create' | 'edit';
  type: ManagedNodeType;
  nodeId?: string;
  parentId?: string;
}

const MANAGED_TREE_STORAGE_KEY = 'topology.managedTree.v1';

const AVAILABLE_NODE_TYPES = [
  'global', 'country', 'region', 'cluster', 'site', 'node',
  'cell', 'sector', 'transport', 'rack', 'rru', 'bbu'
];

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
  const [searchQuery, setSearchQuery] = useState<string>('');
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
  const [managedNodes, setManagedNodes] = useState<ManagedTreeNode[]>([]);
  const [selectedManagedNodeId, setSelectedManagedNodeId] = useState<string | null>(null);
  const [expandedManagedNodes, setExpandedManagedNodes] = useState<Set<string>>(new Set());
  const [managedNodeModal, setManagedNodeModal] = useState<ManagedNodeModalState>({
    isOpen: false,
    mode: 'create',
    type: 'vendor',
  });
  const [managedNodeForm, setManagedNodeForm] = useState({
    name: '',
    code: '',
    description: '',
    status: 'Active',
    siteCode: '',
    location: '',
    technologyType: '4G',
    cellId: '',
    band: '',
    parentId: '',
  });
  const [error, setError] = useState<string | null>(null);

  // Update local topology when props change
  React.useEffect(() => {
    setLocalTopology(topology);
    setHierarchyManager(new HierarchyManager(topology));
  }, [topology]);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(MANAGED_TREE_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as ManagedTreeNode[];
      if (Array.isArray(parsed)) {
        setManagedNodes(parsed);
      }
    } catch (e) {
      console.error('Failed to load managed tree nodes', e);
    }
  }, []);

  React.useEffect(() => {
    localStorage.setItem(MANAGED_TREE_STORAGE_KEY, JSON.stringify(managedNodes));
  }, [managedNodes]);

  // Filter topology based on search query
  const filteredTopology = useMemo(() => {
    if (!searchQuery.trim()) {
      return localTopology;
    }

    const query = searchQuery.toLowerCase();
    const matchingNodeIds = new Set<string>();
    const includeNodeIds = new Set<string>();

    // Find all nodes that match the search
    localTopology.forEach(node => {
      if (node.name.toLowerCase().includes(query) || node.type.toLowerCase().includes(query)) {
        matchingNodeIds.add(node.id);
      }
    });

    // For each matching node, include all ancestors and descendants
    matchingNodeIds.forEach(nodeId => {
      // Add the node itself
      includeNodeIds.add(nodeId);

      // Add all ancestors (parents up to root)
      let currentId: string | undefined = nodeId;
      while (currentId) {
        const node = localTopology.find(n => n.id === currentId);
        if (!node) break;
        includeNodeIds.add(node.id);
        currentId = node.parentId;
      }

      // Add all descendants (children recursively)
      const addDescendants = (id: string) => {
        const node = localTopology.find(n => n.id === id);
        if (!node) return;
        node.childrenIds.forEach(childId => {
          includeNodeIds.add(childId);
          addDescendants(childId);
        });
      };
      addDescendants(nodeId);
    });

    return localTopology.filter(node => includeNodeIds.has(node.id));
  }, [localTopology, searchQuery]);

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedNodes(newExpanded);
  };

  // Define getValidChildTypes before it's used in handleAddNode
  const getValidChildTypes = useCallback((nodeType: string | null): string[] => {
    // If no parent type specified (creating root node), only allow global or country
    if (!nodeType) {
      return ['global', 'country'];
    }

    const validTypes = VALID_CHILDREN[nodeType as any];
    if (validTypes && validTypes.length > 0) {
      return validTypes;
    }

    // No valid children for this node type
    return [];
  }, []);

  const handleAddNode = useCallback(() => {
    if (!newNodeForm.name.trim()) {
      setError('Node name cannot be empty');
      return;
    }

    if (!newNodeForm.type) {
      setError('Please select a node type');
      return;
    }

    // Validate if selected type is valid for this parent
    const validTypes = getValidChildTypes(addNodeModal.parentType);
    if (validTypes.length > 0 && !validTypes.includes(newNodeForm.type)) {
      setError(`"${newNodeForm.type}" cannot be created under "${addNodeModal.parentType}". Valid types are: ${validTypes.join(', ')}`);
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
      // Auto-expand the parent node to show the new child
      if (addNodeModal.parentId) {
        setExpandedNodes(prev => new Set(prev).add(addNodeModal.parentId));
      }
      onTopologyChange?.(updatedTopology);
      setError(null);
      setNewNodeForm({ name: '', type: 'region', vendor: 'Nokia' });
      setAddNodeModal({ isOpen: false, parentId: null, parentType: null });
    } else {
      setError(result.error || 'Failed to add node');
    }
  }, [newNodeForm, addNodeModal.parentId, addNodeModal.parentType, hierarchyManager, onTopologyChange, getValidChildTypes]);

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

  const managedChildren = useCallback((nodeId: string) => (
    managedNodes.filter((node) => node.parentId === nodeId)
  ), [managedNodes]);

  const rootManagedNodes = useMemo(
    () => managedNodes.filter((node) => node.type === 'vendor'),
    [managedNodes],
  );

  const getAllowedAddTypes = useCallback((selectedType?: ManagedNodeType): ManagedNodeType[] => {
    if (!selectedType) return ['vendor'];
    if (selectedType === 'vendor') return ['site'];
    if (selectedType === 'site') return ['technology'];
    if (selectedType === 'technology') return ['cell'];
    return [];
  }, []);

  const openManagedNodeModal = useCallback((type: ManagedNodeType, mode: 'create' | 'edit', parentId?: string, nodeId?: string) => {
    const editingNode = nodeId ? managedNodes.find((node) => node.id === nodeId) : null;
    setManagedNodeForm({
      name: editingNode?.name ?? '',
      code: editingNode?.code ?? '',
      description: editingNode?.description ?? '',
      status: editingNode?.status ?? 'Active',
      siteCode: editingNode?.siteCode ?? '',
      location: editingNode?.location ?? '',
      technologyType: editingNode?.technologyType ?? '4G',
      cellId: editingNode?.cellId ?? '',
      band: editingNode?.band ?? '',
      parentId: parentId ?? editingNode?.parentId ?? '',
    });
    setManagedNodeModal({ isOpen: true, type, mode, parentId, nodeId });
    setError(null);
  }, [managedNodes]);

  const closeManagedNodeModal = useCallback(() => {
    setManagedNodeModal({ isOpen: false, mode: 'create', type: 'vendor' });
    setManagedNodeForm({
      name: '',
      code: '',
      description: '',
      status: 'Active',
      siteCode: '',
      location: '',
      technologyType: '4G',
      cellId: '',
      band: '',
      parentId: '',
    });
  }, []);

  const upsertManagedNode = useCallback(() => {
    const name = managedNodeForm.name.trim();
    const parentId = managedNodeModal.mode === 'create' ? (managedNodeModal.parentId ?? managedNodeForm.parentId ?? '') : (managedNodeForm.parentId || managedNodeModal.parentId || '');

    if (!name) {
      setError(`${managedNodeModal.type.charAt(0).toUpperCase() + managedNodeModal.type.slice(1)} name is required.`);
      return;
    }

    if ((managedNodeModal.type === 'site' || managedNodeModal.type === 'technology' || managedNodeModal.type === 'cell') && !parentId) {
      setError(`Parent ${managedNodeModal.type === 'site' ? 'vendor' : managedNodeModal.type === 'technology' ? 'site' : 'technology'} is required.`);
      return;
    }

    const parentNode = parentId ? managedNodes.find((node) => node.id === parentId) : null;
    if (managedNodeModal.type === 'site' && parentNode?.type !== 'vendor') {
      setError('Site must be created under a vendor.');
      return;
    }
    if (managedNodeModal.type === 'technology' && parentNode?.type !== 'site') {
      setError('Technology must be created under a site.');
      return;
    }
    if (managedNodeModal.type === 'cell' && parentNode?.type !== 'technology') {
      setError('Cell must be created under a technology.');
      return;
    }

    const duplicateName = managedNodes.some((node) => (
      node.id !== managedNodeModal.nodeId &&
      node.type === managedNodeModal.type &&
      (node.parentId || '') === (parentId || '') &&
      node.name.toLowerCase() === name.toLowerCase()
    ));
    if (duplicateName) {
      setError(`Duplicate ${managedNodeModal.type} name within the same scope is not allowed.`);
      return;
    }

    if (managedNodeModal.type === 'site' && managedNodeForm.siteCode.trim()) {
      const duplicateSiteCode = managedNodes.some((node) => node.id !== managedNodeModal.nodeId && node.type === 'site' && node.siteCode?.toLowerCase() === managedNodeForm.siteCode.trim().toLowerCase());
      if (duplicateSiteCode) {
        setError('Site Code / ID must be unique.');
        return;
      }
    }

    if (managedNodeModal.type === 'cell' && managedNodeForm.cellId.trim()) {
      const duplicateCellId = managedNodes.some((node) => node.id !== managedNodeModal.nodeId && node.type === 'cell' && node.cellId?.toLowerCase() === managedNodeForm.cellId.trim().toLowerCase());
      if (duplicateCellId) {
        setError('Cell ID must be unique.');
        return;
      }
    }

    if (managedNodeModal.mode === 'edit' && managedNodeModal.nodeId) {
      setManagedNodes((prev) => prev.map((node) => (
        node.id === managedNodeModal.nodeId
          ? {
              ...node,
              name,
              parentId: parentId || undefined,
              code: managedNodeForm.code.trim() || undefined,
              description: managedNodeForm.description.trim() || undefined,
              status: managedNodeForm.status.trim() || undefined,
              siteCode: managedNodeForm.siteCode.trim() || undefined,
              location: managedNodeForm.location.trim() || undefined,
              technologyType: managedNodeForm.technologyType.trim() || undefined,
              cellId: managedNodeForm.cellId.trim() || undefined,
              band: managedNodeForm.band.trim() || undefined,
            }
          : node
      )));
      setSelectedManagedNodeId(managedNodeModal.nodeId);
    } else {
      const id = `${managedNodeModal.type}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const newNode: ManagedTreeNode = {
        id,
        type: managedNodeModal.type,
        name,
        parentId: parentId || undefined,
        code: managedNodeForm.code.trim() || undefined,
        description: managedNodeForm.description.trim() || undefined,
        status: managedNodeForm.status.trim() || undefined,
        siteCode: managedNodeForm.siteCode.trim() || undefined,
        location: managedNodeForm.location.trim() || undefined,
        technologyType: managedNodeForm.technologyType.trim() || undefined,
        cellId: managedNodeForm.cellId.trim() || undefined,
        band: managedNodeForm.band.trim() || undefined,
      };
      setManagedNodes((prev) => [...prev, newNode]);
      setSelectedManagedNodeId(id);
      if (parentId) {
        setExpandedManagedNodes((prev) => new Set(prev).add(parentId));
      }
    }

    closeManagedNodeModal();
    setError(null);
  }, [managedNodeForm, managedNodeModal, managedNodes, closeManagedNodeModal]);

  const removeManagedNode = useCallback((nodeId: string) => {
    if (!window.confirm('Delete this node and all its child entities?')) return;
    const removeIds = new Set<string>();
    const collect = (id: string) => {
      removeIds.add(id);
      managedNodes.filter((node) => node.parentId === id).forEach((child) => collect(child.id));
    };
    collect(nodeId);
    setManagedNodes((prev) => prev.filter((node) => !removeIds.has(node.id)));
    if (removeIds.has(selectedManagedNodeId || '')) {
      setSelectedManagedNodeId(null);
    }
  }, [managedNodes, selectedManagedNodeId]);

  const renderManagedNode = (node: ManagedTreeNode, level: number): React.ReactNode => {
    const children = managedChildren(node.id);
    const isExpanded = expandedManagedNodes.has(node.id);
    const allowedChildren = getAllowedAddTypes(node.type);
    const typeLabel = node.type.charAt(0).toUpperCase() + node.type.slice(1);

    return (
      <div key={node.id} style={{ marginLeft: `${level * 16}px` }} className="mb-1">
        <div className={`group flex items-center gap-2 rounded border px-2 py-1.5 ${selectedManagedNodeId === node.id ? 'border-blue-400 bg-blue-50 dark:bg-blue-950/30' : 'border-transparent hover:border-border hover:bg-muted/30'}`}>
          <button
            onClick={() => setExpandedManagedNodes((prev) => {
              const next = new Set(prev);
              if (next.has(node.id)) next.delete(node.id);
              else next.add(node.id);
              return next;
            })}
            className="h-5 w-5 text-xs text-muted-foreground"
          >
            {children.length > 0 ? (isExpanded ? '▾' : '▸') : '•'}
          </button>
          <button onClick={() => setSelectedManagedNodeId(node.id)} className="flex-1 min-w-0 text-left">
            <span className="mr-2 rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold uppercase">{node.type}</span>
            <span className="truncate text-sm font-medium">{node.name}</span>
          </button>
          <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
            {allowedChildren.length > 0 && (
              <button
                onClick={() => openManagedNodeModal(allowedChildren[0], 'create', node.id)}
                className="rounded p-1 hover:bg-blue-100 dark:hover:bg-blue-900"
                title={`Add ${allowedChildren[0]}`}
              >
                <Plus className="h-3.5 w-3.5 text-blue-600" />
              </button>
            )}
            <button onClick={() => openManagedNodeModal(node.type, 'edit', node.parentId, node.id)} className="rounded p-1 hover:bg-purple-100 dark:hover:bg-purple-900" title={`Edit ${typeLabel}`}>
              <Edit2 className="h-3.5 w-3.5 text-purple-600" />
            </button>
            <button onClick={() => removeManagedNode(node.id)} className="rounded p-1 hover:bg-red-100 dark:hover:bg-red-900" title={`Delete ${typeLabel}`}>
              <Trash2 className="h-3.5 w-3.5 text-red-600" />
            </button>
          </div>
        </div>
        {isExpanded && children.length > 0 && (
          <div className="ml-3 mt-1 border-l border-border pl-1">
            {children.map((child) => renderManagedNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const renderNode = (nodeId: string, level: number): React.ReactNode => {
    const node = hierarchyManager.findById(nodeId);
    if (!node) return null;

    // Get all children, then filter to only those in the filtered topology
    const allChildren = hierarchyManager.getChildren(nodeId);
    const children = allChildren.filter(child => filteredTopology.some(n => n.id === child.id));

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

  const rootNodes = filteredTopology.filter(n => !n.parentId || !filteredTopology.find(fn => fn.id === n.parentId));

  return (
    <div className="w-full flex flex-col h-full gap-4 p-4 bg-background dark:bg-background overflow-y-auto">
      {/* Managed Vendor/Site/Technology/Cell Tree */}
      <div className="rounded-lg border border-border bg-card p-3 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-foreground">Managed Tree (Vendor → Site → Technology → Cell)</h3>
            <p className="text-xs text-muted-foreground">Persistent hierarchy management workflow for network entities.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => openManagedNodeModal('vendor', 'create')}
              className="h-8 rounded border border-blue-300 bg-blue-50 px-2.5 text-xs font-semibold text-blue-700 hover:bg-blue-100"
            >
              + Add Vendor
            </button>
            {selectedManagedNodeId && (() => {
              const selected = managedNodes.find((node) => node.id === selectedManagedNodeId);
              const allowed = getAllowedAddTypes(selected?.type);
              return allowed.length > 0 ? (
                <button
                  onClick={() => selected && openManagedNodeModal(allowed[0], 'create', selected.id)}
                  className="h-8 rounded border border-primary/30 bg-primary/10 px-2.5 text-xs font-semibold text-primary hover:bg-primary/20"
                >
                  + Add {allowed[0].charAt(0).toUpperCase() + allowed[0].slice(1)}
                </button>
              ) : null;
            })()}
          </div>
        </div>

        <div className="rounded border border-border bg-background p-2">
          {rootManagedNodes.length === 0 ? (
            <p className="py-3 text-center text-xs text-muted-foreground">No vendors yet. Click <strong>Add Vendor</strong> to start building the tree.</p>
          ) : (
            rootManagedNodes.map((node) => renderManagedNode(node, 0))
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by name or type (e.g., Egypt, Dammam, region)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-3 py-2 border border-border rounded-lg bg-input text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-blue-500 outline-none"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-2 top-2.5 p-0.5 hover:bg-muted rounded"
            title="Clear search"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Search Results Info */}
      {searchQuery && (
        <div className="px-3 py-2 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg text-xs text-blue-700 dark:text-blue-300">
          Found <strong>{filteredTopology.length}</strong> nodes matching "<strong>{searchQuery}</strong>"
        </div>
      )}

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
          <p className="text-sm text-gray-600">
            {searchQuery ? `No nodes match your search for "${searchQuery}"` : 'No nodes in hierarchy'}
          </p>
        )}
      </div>

      {/* Edit Mode Controls */}
      {editMode && (
        <div className="space-y-2">
          <div className="px-3 py-2 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg text-xs text-blue-700 dark:text-blue-300">
            <strong>Edit Mode:</strong> Drag to move, hover for add/rename/remove. Changes are applied immediately.
          </div>
          <button
            onClick={() => {
              setAddNodeModal({
                isOpen: true,
                parentId: null,
                parentType: null
              });
            }}
            className="w-full px-3 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2"
            title="Create a root level node (e.g., global, country)"
          >
            <Plus className="w-4 h-4" />
            Create Root Node
          </button>
        </div>
      )}

      {/* Add Node Modal */}
      {addNodeModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-foreground mb-2">
              Create New Node
            </h3>
            {addNodeModal.parentType && (
              <p className="text-sm text-muted-foreground mb-4">
                Parent: <span className="font-semibold">{addNodeModal.parentType}</span>
              </p>
            )}

            <div className="space-y-4 mb-6">
              {/* Node Name */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1">
                  Node Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newNodeForm.name}
                  onChange={(e) => setNewNodeForm({ ...newNodeForm, name: e.target.value })}
                  placeholder="e.g., Egypt, Cairo, Dammam, etc."
                  className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground focus:ring-2 focus:ring-blue-500 outline-none"
                  autoFocus
                />
              </div>

              {/* Node Type */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1">
                  Node Type <span className="text-red-500">*</span>
                </label>
                {getValidChildTypes(addNodeModal.parentType || '').length === 0 ? (
                  <div className="rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-3">
                    <p className="text-sm text-red-700 dark:text-red-300 font-semibold">
                      ❌ Cannot add children to "{addNodeModal.parentType}"
                    </p>
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                      This node type doesn't support child nodes. You've reached the end of the hierarchy.
                    </p>
                  </div>
                ) : (
                  <>
                    <select
                      value={newNodeForm.type}
                      onChange={(e) => setNewNodeForm({ ...newNodeForm, type: e.target.value as any })}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="">-- Select Node Type --</option>
                      {getValidChildTypes(addNodeModal.parentType || '').map((type) => (
                        <option key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-muted-foreground mt-1">
                      Choose the type that defines this node's hierarchical level
                    </p>
                  </>
                )}
              </div>

              {/* Vendor */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1">
                  Vendor (Optional)
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

              {/* Info Message */}
              <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-3">
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  <strong>Tip:</strong> The node type determines where this node can be placed in the hierarchy. For example, create a "country" to go under "global", or "region" to go under a "country".
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleAddNode}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!newNodeForm.name.trim() || !newNodeForm.type || getValidChildTypes(addNodeModal.parentType || '').length === 0}
              >
                Create Node
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

      {/* Managed Node Modal */}
      {managedNodeModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-xl rounded-lg bg-white p-6 shadow-xl dark:bg-gray-900">
            <h3 className="mb-1 text-lg font-bold text-foreground">
              {managedNodeModal.mode === 'create' ? 'Add' : 'Edit'} {managedNodeModal.type.charAt(0).toUpperCase() + managedNodeModal.type.slice(1)}
            </h3>
            <p className="mb-4 text-xs text-muted-foreground">
              {managedNodeModal.mode === 'create'
                ? 'Create a new entity and attach it in the managed hierarchy.'
                : 'Update entity metadata and hierarchy placement.'}
            </p>

            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-foreground">
                  {managedNodeModal.type.charAt(0).toUpperCase() + managedNodeModal.type.slice(1)} Name <span className="text-red-500">*</span>
                </label>
                <input
                  value={managedNodeForm.name}
                  onChange={(e) => setManagedNodeForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm"
                  autoFocus
                />
              </div>

              {managedNodeModal.type === 'vendor' && (
                <>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-foreground">Vendor Code (Optional)</label>
                    <input value={managedNodeForm.code} onChange={(e) => setManagedNodeForm((prev) => ({ ...prev, code: e.target.value }))} className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-foreground">Status (Optional)</label>
                    <input value={managedNodeForm.status} onChange={(e) => setManagedNodeForm((prev) => ({ ...prev, status: e.target.value }))} className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm" placeholder="Active / Planned / Deprecated" />
                  </div>
                </>
              )}

              {managedNodeModal.type === 'site' && (
                <>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-foreground">Site Code / ID</label>
                    <input value={managedNodeForm.siteCode} onChange={(e) => setManagedNodeForm((prev) => ({ ...prev, siteCode: e.target.value }))} className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-foreground">Location / Region</label>
                    <input value={managedNodeForm.location} onChange={(e) => setManagedNodeForm((prev) => ({ ...prev, location: e.target.value }))} className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-foreground">Parent Vendor <span className="text-red-500">*</span></label>
                    <select value={managedNodeForm.parentId || managedNodeModal.parentId || ''} onChange={(e) => setManagedNodeForm((prev) => ({ ...prev, parentId: e.target.value }))} className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm">
                      <option value="">Select vendor</option>
                      {managedNodes.filter((node) => node.type === 'vendor').map((vendor) => <option key={vendor.id} value={vendor.id}>{vendor.name}</option>)}
                    </select>
                  </div>
                </>
              )}

              {managedNodeModal.type === 'technology' && (
                <>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-foreground">Technology Type</label>
                    <select value={managedNodeForm.technologyType} onChange={(e) => setManagedNodeForm((prev) => ({ ...prev, technologyType: e.target.value }))} className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm">
                      {['2G', '3G', '4G', '5G', 'Fiber', 'Microwave'].map((type) => <option key={type} value={type}>{type}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-foreground">Parent Site <span className="text-red-500">*</span></label>
                    <select value={managedNodeForm.parentId || managedNodeModal.parentId || ''} onChange={(e) => setManagedNodeForm((prev) => ({ ...prev, parentId: e.target.value }))} className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm">
                      <option value="">Select site</option>
                      {managedNodes.filter((node) => node.type === 'site').map((site) => <option key={site.id} value={site.id}>{site.name}</option>)}
                    </select>
                  </div>
                </>
              )}

              {managedNodeModal.type === 'cell' && (
                <>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-foreground">Cell ID</label>
                    <input value={managedNodeForm.cellId} onChange={(e) => setManagedNodeForm((prev) => ({ ...prev, cellId: e.target.value }))} className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-foreground">Band / Frequency</label>
                    <input value={managedNodeForm.band} onChange={(e) => setManagedNodeForm((prev) => ({ ...prev, band: e.target.value }))} className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm" placeholder="e.g., n78 / 1800MHz" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-foreground">Status (Optional)</label>
                    <input value={managedNodeForm.status} onChange={(e) => setManagedNodeForm((prev) => ({ ...prev, status: e.target.value }))} className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm" placeholder="Active / Planned / Down" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-foreground">Parent Technology <span className="text-red-500">*</span></label>
                    <select value={managedNodeForm.parentId || managedNodeModal.parentId || ''} onChange={(e) => setManagedNodeForm((prev) => ({ ...prev, parentId: e.target.value }))} className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm">
                      <option value="">Select technology</option>
                      {managedNodes.filter((node) => node.type === 'technology').map((technology) => <option key={technology.id} value={technology.id}>{technology.name}</option>)}
                    </select>
                  </div>
                </>
              )}

              <div>
                <label className="mb-1 block text-xs font-semibold text-foreground">Description (Optional)</label>
                <textarea
                  value={managedNodeForm.description}
                  onChange={(e) => setManagedNodeForm((prev) => ({ ...prev, description: e.target.value }))}
                  className="min-h-[72px] w-full rounded-lg border border-border bg-input px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="mt-5 flex items-center gap-2">
              <button onClick={upsertManagedNode} className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                {managedNodeModal.mode === 'create' ? 'Create' : 'Save'} {managedNodeModal.type}
              </button>
              <button onClick={closeManagedNodeModal} className="flex-1 rounded-lg bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600">
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
