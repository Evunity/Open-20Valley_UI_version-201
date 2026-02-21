/**
 * Topology Visualization Context
 * Provides synchronized access to graph across all views
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  TopologyGraph,
  TopologyNode,
  ViewSyncState,
  HealthState,
  Vendor,
  Technology,
  generateUnifiedTopologyGraph
} from '../utils/unifiedTopologyGraph';
import {
  TopologyGraphService,
  initializeGraphService,
  getGraphService
} from '../services/topologyGraphService';

interface TopologyContextType {
  // Graph data
  graph: TopologyGraph | null;
  service: TopologyGraphService | null;

  // View state
  selectedNode: TopologyNode | null;
  expandedNodes: Set<string>;
  visibleNodes: TopologyNode[];

  // Zoom and navigation
  zoomLevel: number;
  viewportBounds?: { minLat: number; maxLat: number; minLng: number; maxLng: number };

  // Filters
  filters: {
    healthStates: HealthState[];
    vendors: Vendor[];
    technologies: Technology[];
    hasAlarms: boolean;
    automationLocked: boolean;
  };

  // Actions
  selectNode: (nodeId: string | null) => void;
  expandNode: (nodeId: string) => Promise<TopologyNode[]>;
  collapseNode: (nodeId: string) => void;
  setZoomLevel: (level: number, bounds?: ViewSyncState['viewportBounds']) => Promise<void>;
  applyFilters: (filters: Partial<TopologyContextType['filters']>) => void;
  getNodeContext: (nodeId: string) => any;
  getImpactChain: (nodeId: string) => TopologyNode[];
  loadRegion: (nodeId: string) => Promise<void>;

  // Statistics
  stats: {
    totalVisible: number;
    totalLoaded: number;
    totalAlarms: number;
    avgUtilization: number;
  };

  // Performance
  performance: {
    lastRegionLoadTime: number;
    lastZoomTime: number;
    lastExpandTime: number;
  };
}

const TopologyContext = createContext<TopologyContextType | undefined>(undefined);

interface TopologyProviderProps {
  children: ReactNode;
  preloadedGraph?: TopologyGraph;
}

/**
 * Topology Context Provider
 * Initialize graph and provide synchronized access
 */
export const TopologyProvider: React.FC<TopologyProviderProps> = ({
  children,
  preloadedGraph
}) => {
  const [graph, setGraph] = useState<TopologyGraph | null>(preloadedGraph || null);
  const [service, setService] = useState<TopologyGraphService | null>(null);
  const [selectedNode, setSelectedNodeState] = useState<TopologyNode | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [visibleNodes, setVisibleNodes] = useState<TopologyNode[]>([]);
  const [zoomLevel, setZoomLevelState] = useState(1);
  const [viewportBounds, setViewportBounds] = useState<ViewSyncState['viewportBounds']>();
  const [filters, setFilters] = useState<TopologyContextType['filters']>({
    healthStates: ['healthy', 'degraded', 'down'],
    vendors: [],
    technologies: [],
    hasAlarms: false,
    automationLocked: false
  });
  const [stats, setStats] = useState({
    totalVisible: 0,
    totalLoaded: 0,
    totalAlarms: 0,
    avgUtilization: 0
  });
  const [performance, setPerformance] = useState({
    lastRegionLoadTime: 0,
    lastZoomTime: 0,
    lastExpandTime: 0
  });

  // Initialize graph on mount
  useEffect(() => {
    if (!graph) {
      const newGraph = generateUnifiedTopologyGraph();
      setGraph(newGraph);
    }
  }, [graph]);

  // Initialize service when graph is ready
  useEffect(() => {
    if (graph && !service) {
      const newService = initializeGraphService(graph);
      setService(newService);
      setVisibleNodes(newService.getVisibleNodes());
    }
  }, [graph, service]);

  // Update visible nodes when service state changes
  const updateVisibleNodes = useCallback(() => {
    if (service) {
      setVisibleNodes(service.getVisibleNodes());
      const newStats = service.getStatistics();
      setStats(newStats);
      const perfMetrics = service.getPerformanceMetrics();
      setPerformance({
        lastRegionLoadTime: perfMetrics.lastRegionLoadTime,
        lastZoomTime: perfMetrics.lastZoomTime,
        lastExpandTime: perfMetrics.lastExpandTime
      });
    }
  }, [service]);

  const selectNode = useCallback((nodeId: string | null) => {
    if (!service) return;

    if (nodeId) {
      service.selectNode(nodeId);
      const node = service.getNodeContext(nodeId);
      setSelectedNodeState(node?.node || null);
    } else {
      setSelectedNodeState(null);
    }

    updateVisibleNodes();
  }, [service, updateVisibleNodes]);

  const expandNode = useCallback(async (nodeId: string) => {
    if (!service) return [];

    const children = await service.expandNode(nodeId);
    setExpandedNodes(new Set(service.getViewState().expandedNodeIds));
    updateVisibleNodes();
    return children;
  }, [service, updateVisibleNodes]);

  const collapseNode = useCallback((nodeId: string) => {
    if (!service) return;

    const viewState = service.getViewState();
    viewState.expandedNodeIds.delete(nodeId);
    setExpandedNodes(new Set(viewState.expandedNodeIds));
    updateVisibleNodes();
  }, [service, updateVisibleNodes]);

  const handleSetZoomLevel = useCallback(async (level: number, bounds?: ViewSyncState['viewportBounds']) => {
    if (!service) return;

    setZoomLevelState(level);
    if (bounds) setViewportBounds(bounds);

    await service.handleZoom(level, bounds);
    updateVisibleNodes();
  }, [service, updateVisibleNodes]);

  const applyFilters = useCallback((newFilters: Partial<TopologyContextType['filters']>) => {
    if (!service) return;

    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);

    service.applyFilters({
      healthStates: updatedFilters.healthStates,
      vendors: updatedFilters.vendors,
      technologies: updatedFilters.technologies,
      hasAlarms: updatedFilters.hasAlarms,
      automationLocked: updatedFilters.automationLocked
    });

    updateVisibleNodes();
  }, [service, filters, updateVisibleNodes]);

  const getNodeContext = useCallback((nodeId: string) => {
    if (!service) return null;
    return service.getNodeContext(nodeId);
  }, [service]);

  const getImpactChain = useCallback((nodeId: string) => {
    if (!service) return [];
    return service.getImpactChain(nodeId);
  }, [service]);

  const loadRegion = useCallback(async (nodeId: string) => {
    if (!service) return;
    await service.loadRegion(nodeId);
    updateVisibleNodes();
  }, [service, updateVisibleNodes]);

  const value: TopologyContextType = {
    graph,
    service,
    selectedNode,
    expandedNodes,
    visibleNodes,
    zoomLevel,
    viewportBounds,
    filters,
    selectNode,
    expandNode,
    collapseNode,
    setZoomLevel: handleSetZoomLevel,
    applyFilters,
    getNodeContext,
    getImpactChain,
    loadRegion,
    stats,
    performance
  };

  return (
    <TopologyContext.Provider value={value}>
      {children}
    </TopologyContext.Provider>
  );
};

/**
 * Hook to access topology context
 */
export const useTopology = (): TopologyContextType => {
  const context = useContext(TopologyContext);
  if (!context) {
    throw new Error('useTopology must be used within TopologyProvider');
  }
  return context;
};

/**
 * Hook to get a specific node
 */
export const useNode = (nodeId: string | null) => {
  const { service, visibleNodes } = useTopology();

  if (!nodeId) return null;
  return visibleNodes.find(n => n.id === nodeId);
};

/**
 * Hook to get node with context (ancestors, children, siblings, impact)
 */
export const useNodeContext = (nodeId: string | null) => {
  const { getNodeContext } = useTopology();

  if (!nodeId) return null;
  return getNodeContext(nodeId);
};

/**
 * Hook for lazy loading children on expand
 */
export const useExpandableNode = (nodeId: string) => {
  const { expandNode, collapseNode, expandedNodes } = useTopology();
  const [children, setChildren] = useState<TopologyNode[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const toggle = useCallback(async () => {
    if (expandedNodes.has(nodeId)) {
      collapseNode(nodeId);
      setChildren([]);
    } else {
      setIsLoading(true);
      const loaded = await expandNode(nodeId);
      setChildren(loaded);
      setIsLoading(false);
    }
  }, [nodeId, expandNode, collapseNode, expandedNodes]);

  return {
    isExpanded: expandedNodes.has(nodeId),
    children,
    isLoading,
    toggle
  };
};

/**
 * Hook for map viewport filtering
 */
export const useMapViewport = () => {
  const { setZoomLevel, viewportBounds, zoomLevel, loadRegion } = useTopology();

  return {
    zoom: zoomLevel,
    bounds: viewportBounds,
    setZoom: setZoomLevel,
    loadRegion
  };
};

/**
 * Hook for node selection and impact analysis
 */
export const useNodeSelection = () => {
  const { selectNode, selectedNode, getImpactChain } = useTopology();
  const [impactChain, setImpactChain] = useState<TopologyNode[]>([]);

  useEffect(() => {
    if (selectedNode) {
      setImpactChain(getImpactChain(selectedNode.id));
    } else {
      setImpactChain([]);
    }
  }, [selectedNode, getImpactChain]);

  return {
    selected: selectedNode,
    impactChain,
    selectNode,
    clearSelection: () => selectNode(null)
  };
};

/**
 * Hook for performance monitoring
 */
export const usePerformanceMonitoring = () => {
  const { performance, stats } = useTopology();

  return {
    regionLoadTime: performance.lastRegionLoadTime,
    zoomTime: performance.lastZoomTime,
    expandTime: performance.lastExpandTime,
    visibleNodeCount: stats.totalVisible,
    totalAlarms: stats.totalAlarms,
    avgUtilization: stats.avgUtilization,
    isPerformant: {
      regionLoad: performance.lastRegionLoadTime < 2000,
      zoom: performance.lastZoomTime < 300,
      expand: performance.lastExpandTime < 200
    }
  };
};
