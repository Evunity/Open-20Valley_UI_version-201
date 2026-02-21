/**
 * Topology Graph Service
 * Manages progressive rendering, lazy loading, and performance optimization
 */

import {
  TopologyGraph,
  TopologyNode,
  ViewSyncState,
  HealthState,
  Vendor,
  Technology,
  getNodeById,
  getNodeChildren,
  getNodeAncestors,
  getImpactChain
} from '../utils/unifiedTopologyGraph';

export interface RenderBatch {
  nodeIds: string[];
  estimatedRenderTime: number;
  priority: 'critical' | 'high' | 'normal' | 'low';
}

export interface ProgressiveRenderOptions {
  maxNodesPerBatch: number;
  batchDelayMs: number;
  prioritizeVisibleArea: boolean;
}

const DEFAULT_PROGRESSIVE_RENDER_OPTIONS: ProgressiveRenderOptions = {
  maxNodesPerBatch: 50,
  batchDelayMs: 16, // ~60fps
  prioritizeVisibleArea: true
};

export class TopologyGraphService {
  private graph: TopologyGraph;
  private viewSync: ViewSyncState;
  private loadedNodeIds: Set<string> = new Set();
  private pendingLoads: Map<string, Promise<void>> = new Map();
  private renderBatches: RenderBatch[] = [];
  private aggregationCache: Map<string, TopologyNode> = new Map();
  private performanceMetrics: {
    lastRegionLoadTime: number;
    lastZoomTime: number;
    lastExpandTime: number;
  } = {
    lastRegionLoadTime: 0,
    lastZoomTime: 0,
    lastExpandTime: 0
  };

  constructor(graph: TopologyGraph) {
    this.graph = graph;
    this.viewSync = {
      selectedNodeId: null,
      expandedNodeIds: new Set(),
      visibleNodeIds: new Set(),
      zoomLevel: 1,
      filters: {
        healthStates: ['healthy', 'degraded', 'down'],
        vendors: [],
        technologies: [],
        hasAlarms: false,
        automationLocked: false
      }
    };

    // Pre-load root
    if (this.graph.rootId) {
      this.loadedNodeIds.add(this.graph.rootId);
    }
  }

  /**
   * Load a region with progressive rendering
   * Target: <2s for initial load
   */
  async loadRegion(
    nodeId: string,
    options: ProgressiveRenderOptions = DEFAULT_PROGRESSIVE_RENDER_OPTIONS
  ): Promise<void> {
    const startTime = performance.now();

    const node = getNodeById(this.graph, nodeId);
    if (!node) return;

    // Phase 1: Load immediate children
    const childrenToLoad = node.childrenIds.slice(0, options.maxNodesPerBatch);
    await this.loadNodesProgressive(childrenToLoad, options);

    // Phase 2: Load second level (if in viewport)
    const secondLevel: string[] = [];
    childrenToLoad.forEach(childId => {
      const child = getNodeById(this.graph, childId);
      if (child) {
        secondLevel.push(...child.childrenIds.slice(0, options.maxNodesPerBatch / childrenToLoad.length));
      }
    });

    if (secondLevel.length > 0) {
      await this.loadNodesProgressive(secondLevel, options);
    }

    this.performanceMetrics.lastRegionLoadTime = performance.now() - startTime;
    console.log(`[TGS] Region loaded in ${this.performanceMetrics.lastRegionLoadTime.toFixed(0)}ms`);
  }

  /**
   * Lazy load children for a node
   * Target: <200ms for node expansion
   */
  async expandNode(nodeId: string): Promise<TopologyNode[]> {
    const startTime = performance.now();

    const node = getNodeById(this.graph, nodeId);
    if (!node) return [];

    // Check if already loaded
    if (this.viewSync.expandedNodeIds.has(nodeId)) {
      return getNodeChildren(this.graph, nodeId);
    }

    // Load children
    const children = getNodeChildren(this.graph, nodeId);
    children.forEach(child => this.loadedNodeIds.add(child.id));
    this.viewSync.expandedNodeIds.add(nodeId);

    this.performanceMetrics.lastExpandTime = performance.now() - startTime;
    console.log(`[TGS] Node expanded in ${this.performanceMetrics.lastExpandTime.toFixed(0)}ms (${children.length} children)`);

    return children;
  }

  /**
   * Handle zoom with aggregation
   * Target: <300ms zoom response
   */
  async handleZoom(zoomLevel: number, viewportBounds: ViewSyncState['viewportBounds']): Promise<void> {
    const startTime = performance.now();

    this.viewSync.zoomLevel = zoomLevel;
    this.viewSync.viewportBounds = viewportBounds;

    // Zoom out: aggregate nodes
    if (zoomLevel < 1.5) {
      await this.aggregateViewport(viewportBounds!);
    }
    // Zoom in: expand details
    else if (zoomLevel > 2) {
      await this.expandViewportDetails(viewportBounds!);
    }

    this.performanceMetrics.lastZoomTime = performance.now() - startTime;
    console.log(`[TGS] Zoom handled in ${this.performanceMetrics.lastZoomTime.toFixed(0)}ms`);
  }

  /**
   * Select a node and sync across all views
   */
  selectNode(nodeId: string): void {
    this.viewSync.selectedNodeId = nodeId;
    const node = getNodeById(this.graph, nodeId);
    if (node) {
      // Expand ancestors so path is visible
      const ancestors = getNodeAncestors(this.graph, nodeId);
      ancestors.forEach(ancestor => {
        this.viewSync.expandedNodeIds.add(ancestor.id);
        this.loadedNodeIds.add(ancestor.id);
      });
    }
  }

  /**
   * Apply filters across graph
   */
  applyFilters(filters: Partial<ViewSyncState['filters']>): void {
    this.viewSync.filters = { ...this.viewSync.filters, ...filters };
    this.updateVisibleNodes();
  }

  /**
   * Get nodes visible in current view state
   */
  getVisibleNodes(): TopologyNode[] {
    const visible: TopologyNode[] = [];
    const toVisit: string[] = [this.graph.rootId || ''];

    while (toVisit.length > 0) {
      const nodeId = toVisit.shift();
      if (!nodeId) continue;

      const node = getNodeById(this.graph, nodeId);
      if (!node) continue;

      // Check filters
      if (this.matchesFilters(node)) {
        visible.push(node);
        this.viewSync.visibleNodeIds.add(node.id);

        // Only traverse if expanded
        if (this.viewSync.expandedNodeIds.has(node.id)) {
          toVisit.push(...node.childrenIds);
        }
      }
    }

    return visible;
  }

  /**
   * Get path from node to root
   */
  getPath(nodeId: string): TopologyNode[] {
    return getNodeAncestors(this.graph, nodeId);
  }

  /**
   * Get impact chain for failure analysis
   */
  getImpactChain(nodeId: string, depth?: number): TopologyNode[] {
    return getImpactChain(this.graph, nodeId, depth);
  }

  /**
   * Get statistics for current view
   */
  getStatistics() {
    const visible = Array.from(this.viewSync.visibleNodeIds)
      .map(id => getNodeById(this.graph, id))
      .filter((n): n is TopologyNode => !!n);

    return {
      totalVisible: visible.length,
      totalLoaded: this.loadedNodeIds.size,
      healthDistribution: this.calculateHealthDistribution(visible),
      alarmCount: visible.reduce((sum, node) => sum + node.alarmSummary.total, 0),
      avgUtilization: visible.length > 0
        ? visible.reduce((sum, node) => sum + node.kpiSummary.utilization, 0) / visible.length
        : 0
    };
  }

  /**
   * Export for serialization
   */
  getViewState(): ViewSyncState {
    return { ...this.viewSync };
  }

  /**
   * Restore from saved state
   */
  async restoreViewState(state: ViewSyncState): Promise<void> {
    this.viewSync = state;
    // Re-load nodes that were loaded before
    const nodesToLoad = Array.from(state.expandedNodeIds);
    await this.loadNodesProgressive(nodesToLoad);
  }

  /**
   * Get node with full context
   */
  getNodeContext(nodeId: string) {
    const node = getNodeById(this.graph, nodeId);
    if (!node) return null;

    return {
      node,
      ancestors: getNodeAncestors(this.graph, nodeId),
      children: getNodeChildren(this.graph, nodeId),
      siblings: node.parentId
        ? getNodeChildren(this.graph, node.parentId).filter(n => n.id !== nodeId)
        : [],
      impact: getImpactChain(this.graph, nodeId, 2)
    };
  }

  // ========== Private Methods ==========

  private async loadNodesProgressive(
    nodeIds: string[],
    options: ProgressiveRenderOptions
  ): Promise<void> {
    const batches = this.createRenderBatches(nodeIds, options.maxNodesPerBatch);

    for (const batch of batches) {
      batch.nodeIds.forEach(id => this.loadedNodeIds.add(id));

      // Simulate async loading with batching
      await new Promise(resolve => setTimeout(resolve, options.batchDelayMs));
    }
  }

  private createRenderBatches(nodeIds: string[], batchSize: number): RenderBatch[] {
    const batches: RenderBatch[] = [];

    for (let i = 0; i < nodeIds.length; i += batchSize) {
      const batch = nodeIds.slice(i, i + batchSize);
      batches.push({
        nodeIds: batch,
        estimatedRenderTime: batch.length * 2, // ~2ms per node
        priority: i === 0 ? 'critical' : 'normal'
      });
    }

    return batches;
  }

  private async aggregateViewport(bounds: NonNullable<ViewSyncState['viewportBounds']>): Promise<void> {
    // Find nodes in viewport
    const nodesInViewport = Array.from(this.loadedNodeIds)
      .map(id => getNodeById(this.graph, id))
      .filter((n): n is TopologyNode => !!n && n.geoCoordinates && this.isInBounds(n.geoCoordinates, bounds));

    // Group by cluster and aggregate
    const clusterMap = new Map<string, TopologyNode[]>();
    nodesInViewport.forEach(node => {
      const clusterId = node.parentId || 'root';
      if (!clusterMap.has(clusterId)) clusterMap.set(clusterId, []);
      clusterMap.get(clusterId)!.push(node);
    });

    // Create aggregated nodes for display
    clusterMap.forEach((children, clusterId) => {
      if (children.length > 5) {
        const aggregated: TopologyNode = {
          ...children[0],
          id: `agg_${clusterId}`,
          name: `${children.length} nodes`,
          isAggregated: true,
          aggregatedCount: children.length,
          childrenIds: children.map(n => n.id)
        };
        this.aggregationCache.set(aggregated.id, aggregated);
      }
    });
  }

  private async expandViewportDetails(bounds: NonNullable<ViewSyncState['viewportBounds']>): Promise<void> {
    // Clear aggregations
    this.aggregationCache.clear();

    // Load details for nodes in viewport
    const nodesInViewport = Array.from(this.loadedNodeIds)
      .map(id => getNodeById(this.graph, id))
      .filter((n): n is TopologyNode => !!n && n.geoCoordinates && this.isInBounds(n.geoCoordinates, bounds));

    // Load their children
    const childrenToLoad: string[] = [];
    nodesInViewport.forEach(node => {
      childrenToLoad.push(...node.childrenIds.slice(0, 10));
    });

    await this.loadNodesProgressive(childrenToLoad, DEFAULT_PROGRESSIVE_RENDER_OPTIONS);
  }

  private isInBounds(
    coords: { latitude: number; longitude: number },
    bounds: NonNullable<ViewSyncState['viewportBounds']>
  ): boolean {
    return (
      coords.latitude >= bounds.minLat &&
      coords.latitude <= bounds.maxLat &&
      coords.longitude >= bounds.minLng &&
      coords.longitude <= bounds.maxLng
    );
  }

  private matchesFilters(node: TopologyNode): boolean {
    const filters = this.viewSync.filters;

    // Health state filter
    if (filters.healthStates.length > 0 && !filters.healthStates.includes(node.healthState)) {
      return false;
    }

    // Vendor filter
    if (filters.vendors.length > 0 && node.vendor && !filters.vendors.includes(node.vendor)) {
      return false;
    }

    // Technology filter
    if (filters.technologies.length > 0 && node.technology && !filters.technologies.includes(node.technology)) {
      return false;
    }

    // Alarm filter
    if (filters.hasAlarms && node.alarmSummary.total === 0) {
      return false;
    }

    // Automation locked filter
    if (filters.automationLocked && !node.automationLocked) {
      return false;
    }

    return true;
  }

  private updateVisibleNodes(): void {
    this.viewSync.visibleNodeIds.clear();
    this.getVisibleNodes(); // Populates visibleNodeIds as side effect
  }

  private calculateHealthDistribution(nodes: TopologyNode[]): Record<HealthState, number> {
    const distribution: Record<HealthState, number> = {
      healthy: 0,
      degraded: 0,
      down: 0,
      offline: 0,
      unknown: 0
    };

    nodes.forEach(node => {
      distribution[node.healthState]++;
    });

    return distribution;
  }

  /**
   * Performance diagnostics
   */
  getPerformanceMetrics() {
    return {
      ...this.performanceMetrics,
      memoryUsage: {
        loadedNodes: this.loadedNodeIds.size,
        expandedNodes: this.viewSync.expandedNodeIds.size,
        visibleNodes: this.viewSync.visibleNodeIds.size,
        aggregatedNodes: this.aggregationCache.size
      }
    };
  }
}

/**
 * Global graph service instance
 */
let graphService: TopologyGraphService | null = null;

export function initializeGraphService(graph: TopologyGraph): TopologyGraphService {
  graphService = new TopologyGraphService(graph);
  return graphService;
}

export function getGraphService(): TopologyGraphService {
  if (!graphService) {
    throw new Error('Graph service not initialized');
  }
  return graphService;
}
