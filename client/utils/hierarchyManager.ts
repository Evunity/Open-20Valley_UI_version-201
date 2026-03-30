import { TopologyObject } from './topologyData';

// Hierarchy levels in order
export const HIERARCHY_LEVELS = ['global', 'country', 'region', 'cluster', 'site', 'node', 'rack'] as const;
export type HierarchyLevel = typeof HIERARCHY_LEVELS[number];

// Valid parent types for each level
export const VALID_PARENTS: Record<HierarchyLevel, HierarchyLevel[]> = {
  global: [],
  country: ['global'],
  region: ['country'],
  cluster: ['region'],
  site: ['cluster'],
  node: ['site'],
  rack: ['node']
};

// Valid children types for each level
export const VALID_CHILDREN: Record<HierarchyLevel, HierarchyLevel[]> = {
  global: ['country'],
  country: ['region'],
  region: ['cluster'],
  cluster: ['site'],
  site: ['node'],
  node: ['rack'],
  rack: []
};

// Map topology types to hierarchy levels
const TYPE_TO_LEVEL: Record<string, HierarchyLevel> = {
  global: 'global',
  country: 'country',
  region: 'region',
  cluster: 'cluster',
  site: 'site',
  node: 'node',
  rack: 'rack',
  cell: 'node',
  equipment: 'node',
  link: 'node',
  transport: 'node',
  power: 'node'
};

export function getHierarchyLevel(type: string): HierarchyLevel {
  return TYPE_TO_LEVEL[type] || 'node';
}

export class HierarchyValidator {
  /**
   * Check if a type can be a child of another type
   */
  static canBeChild(childType: string, parentType: string): boolean {
    const childLevel = getHierarchyLevel(childType);
    const parentLevel = getHierarchyLevel(parentType);
    return VALID_CHILDREN[parentLevel]?.includes(childLevel) ?? false;
  }

  /**
   * Check if a type can be a parent of another type
   */
  static canBeParent(parentType: string, childType: string): boolean {
    return this.canBeChild(childType, parentType);
  }

  /**
   * Check if a node can be moved to a new parent
   */
  static canMoveTo(node: TopologyObject, newParentId: string, topology: TopologyObject[]): { valid: boolean; reason?: string } {
    if (!newParentId) {
      return { valid: false, reason: 'No parent specified' };
    }

    // Find the new parent
    const newParent = topology.find(n => n.id === newParentId);
    if (!newParent) {
      return { valid: false, reason: 'Parent not found' };
    }

    // Check if parent can have this child type
    if (!this.canBeChild(node.type, newParent.type)) {
      return {
        valid: false,
        reason: `${node.type} cannot be placed under ${newParent.type}`
      };
    }

    // Prevent circular references
    if (this.isDescendant(newParent, node.id, topology)) {
      return { valid: false, reason: 'Cannot move node under its own descendant' };
    }

    return { valid: true };
  }

  /**
   * Check if targetId is a descendant of nodeId
   */
  static isDescendant(node: TopologyObject, targetId: string, topology: TopologyObject[]): boolean {
    if (node.id === targetId) return true;
    for (const childId of node.childrenIds) {
      const child = topology.find(n => n.id === childId);
      if (child && this.isDescendant(child, targetId, topology)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Get list of valid parent types for a given type
   */
  static getValidParentTypes(type: string): string[] {
    const level = getHierarchyLevel(type);
    return VALID_PARENTS[level] as unknown as string[];
  }

  /**
   * Get list of valid child types for a given type
   */
  static getValidChildTypes(type: string): string[] {
    const level = getHierarchyLevel(type);
    return VALID_CHILDREN[level] as unknown as string[];
  }
}

export class HierarchyManager {
  private topology: TopologyObject[];

  constructor(topology: TopologyObject[]) {
    this.topology = [...topology];
  }

  /**
   * Get all nodes
   */
  getAll(): TopologyObject[] {
    return [...this.topology];
  }

  /**
   * Find a node by ID
   */
  findById(id: string): TopologyObject | undefined {
    return this.topology.find(n => n.id === id);
  }

  /**
   * Get children of a node
   */
  getChildren(nodeId: string): TopologyObject[] {
    const node = this.findById(nodeId);
    if (!node) return [];
    return node.childrenIds
      .map(id => this.findById(id))
      .filter((n): n is TopologyObject => n !== undefined);
  }

  /**
   * Get parent of a node
   */
  getParent(nodeId: string): TopologyObject | undefined {
    const node = this.findById(nodeId);
    if (!node || !node.parentId) return undefined;
    return this.findById(node.parentId);
  }

  /**
   * Add a new node
   */
  addNode(
    name: string,
    type: string,
    parentId: string | null,
    vendor?: string
  ): { success: boolean; node?: TopologyObject; error?: string } {
    // Validate parent
    if (parentId) {
      const parent = this.findById(parentId);
      if (!parent) {
        return { success: false, error: 'Parent not found' };
      }

      // Validate hierarchy
      if (!HierarchyValidator.canBeChild(type, parent.type)) {
        return {
          success: false,
          error: `${type} cannot be placed under ${parent.type}`
        };
      }
    }

    // Create new node
    const newNode: TopologyObject = {
      id: `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      type: type as any,
      vendor: vendor as any,
      parentId,
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
      description: `${name} - New node`
    };

    // Add to topology
    this.topology.push(newNode);

    // Update parent's childrenIds
    if (parentId) {
      const parent = this.findById(parentId);
      if (parent && !parent.childrenIds.includes(newNode.id)) {
        parent.childrenIds.push(newNode.id);
      }
    }

    return { success: true, node: newNode };
  }

  /**
   * Remove a node and its descendants
   */
  removeNode(nodeId: string): { success: boolean; error?: string } {
    const node = this.findById(nodeId);
    if (!node) {
      return { success: false, error: 'Node not found' };
    }

    // Collect all nodes to remove (node + descendants)
    const nodesToRemove = new Set<string>();
    const collect = (id: string) => {
      nodesToRemove.add(id);
      const n = this.findById(id);
      if (n) {
        n.childrenIds.forEach(childId => collect(childId));
      }
    };
    collect(nodeId);

    // Remove nodes from topology
    this.topology = this.topology.filter(n => !nodesToRemove.has(n.id));

    // Update parent's childrenIds
    if (node.parentId) {
      const parent = this.findById(node.parentId);
      if (parent) {
        parent.childrenIds = parent.childrenIds.filter(id => id !== nodeId);
      }
    }

    return { success: true };
  }

  /**
   * Rename a node
   */
  renameNode(nodeId: string, newName: string): { success: boolean; error?: string } {
    const node = this.findById(nodeId);
    if (!node) {
      return { success: false, error: 'Node not found' };
    }

    if (!newName.trim()) {
      return { success: false, error: 'Name cannot be empty' };
    }

    node.name = newName;
    return { success: true };
  }

  /**
   * Move a node to a new parent
   */
  moveNode(nodeId: string, newParentId: string | null): { success: boolean; error?: string } {
    const node = this.findById(nodeId);
    if (!node) {
      return { success: false, error: 'Node not found' };
    }

    if (newParentId && newParentId === nodeId) {
      return { success: false, error: 'Cannot move node to itself' };
    }

    // Validate the move
    if (newParentId) {
      const newParent = this.findById(newParentId);
      if (!newParent) {
        return { success: false, error: 'New parent not found' };
      }

      const validation = HierarchyValidator.canMoveTo(node, newParentId, this.topology);
      if (!validation.valid) {
        return { success: false, error: validation.reason };
      }
    }

    // Remove from old parent
    if (node.parentId) {
      const oldParent = this.findById(node.parentId);
      if (oldParent) {
        oldParent.childrenIds = oldParent.childrenIds.filter(id => id !== nodeId);
      }
    }

    // Add to new parent
    node.parentId = newParentId || undefined;
    if (newParentId) {
      const newParent = this.findById(newParentId);
      if (newParent && !newParent.childrenIds.includes(nodeId)) {
        newParent.childrenIds.push(nodeId);
      }
    }

    return { success: true };
  }

  /**
   * Reorder children within a parent
   */
  reorderChildren(parentId: string, childIds: string[]): { success: boolean; error?: string } {
    const parent = this.findById(parentId);
    if (!parent) {
      return { success: false, error: 'Parent not found' };
    }

    // Validate all children exist and belong to parent
    for (const childId of childIds) {
      const child = this.findById(childId);
      if (!child || child.parentId !== parentId) {
        return { success: false, error: `Invalid child: ${childId}` };
      }
    }

    parent.childrenIds = childIds;
    return { success: true };
  }

  /**
   * Get the path from root to a node
   */
  getPath(nodeId: string): TopologyObject[] {
    const path: TopologyObject[] = [];
    let current = this.findById(nodeId);

    while (current) {
      path.unshift(current);
      current = current.parentId ? this.findById(current.parentId) : undefined;
    }

    return path;
  }

  /**
   * Get all descendants of a node
   */
  getDescendants(nodeId: string): TopologyObject[] {
    const descendants: TopologyObject[] = [];
    const node = this.findById(nodeId);
    if (!node) return [];

    const collect = (id: string) => {
      const n = this.findById(id);
      if (n) {
        descendants.push(n);
        n.childrenIds.forEach(childId => collect(childId));
      }
    };

    node.childrenIds.forEach(childId => collect(childId));
    return descendants;
  }

  /**
   * Export updated topology
   */
  export(): TopologyObject[] {
    return [...this.topology];
  }

  /**
   * Validate entire hierarchy
   */
  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    for (const node of this.topology) {
      // Check parent-child relationship
      if (node.parentId) {
        const parent = this.findById(node.parentId);
        if (!parent) {
          errors.push(`Node ${node.id} has non-existent parent ${node.parentId}`);
        } else if (!HierarchyValidator.canBeChild(node.type, parent.type)) {
          errors.push(`${node.type} cannot be child of ${parent.type}`);
        }
      }

      // Check children references
      for (const childId of node.childrenIds) {
        const child = this.findById(childId);
        if (!child) {
          errors.push(`Node ${node.id} references non-existent child ${childId}`);
        } else if (child.parentId !== node.id) {
          errors.push(`Child ${childId} parentId mismatch with parent ${node.id}`);
        }
      }
    }

    return { valid: errors.length === 0, errors };
  }
}
