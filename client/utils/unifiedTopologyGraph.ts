/**
 * Unified Topology Graph Model - Single source of truth for all views
 * Hierarchy: Global → Country → Region → Cluster → Site → Node → Rack → Board → RRU → Port → Cell
 */

export type ObjectType = 'global' | 'country' | 'region' | 'cluster' | 'site' | 'node' | 'rack' | 'board' | 'rru' | 'port' | 'cell';
export type Vendor = 'Nokia' | 'Ericsson' | 'Huawei' | 'ZTE' | 'Unknown';
export type Technology = '2G' | '3G' | '4G' | '5G' | 'Transport' | 'IP' | 'Power' | 'Optical' | 'Microwave';
export type HealthState = 'healthy' | 'degraded' | 'down' | 'offline' | 'unknown';
export type TransportType = 'MPLS' | 'Fiber' | 'Microwave' | 'IP' | 'Radio';

export interface GeoCoordinate {
  latitude: number;
  longitude: number;
  altitude?: number;
}

export interface AlarmSummary {
  critical: number;
  major: number;
  minor: number;
  warning: number;
  total: number;
  lastAlarm?: string; // ISO timestamp
}

export interface KPISummary {
  availability: number; // 0-100%
  dropRate: number;
  throughput: number; // Mbps or Gbps
  latency: number; // ms
  utilization: number; // 0-100%
  powerUsage?: number; // Watts
  temperature?: number; // Celsius
  lastUpdate: string; // ISO timestamp
}

export interface CapacityMetrics {
  totalCapacity: number;
  usedCapacity: number;
  peakCapacity?: number;
  reservedCapacity?: number;
  unit: string;
}

export interface DependencyLink {
  sourceId: string;
  targetId: string;
  type: 'upstream' | 'downstream' | 'peer' | 'backup';
  impact: 'critical' | 'high' | 'medium' | 'low';
  bidirectional: boolean;
}

export interface TimeHistoryEntry {
  timestamp: string;
  state: HealthState;
  alarmCount: number;
  kpiSnapshot: Partial<KPISummary>;
}

export interface TransportInterface {
  id: string;
  name: string;
  type: TransportType;
  linkState: 'up' | 'down' | 'degraded';
  throughput: number;
  errors: number;
  opticalPower?: number;
  capacity: number;
  utilization: number;
  remoteEndpoint?: string;
}

export interface TopologyNode {
  // Identifiers
  id: string; // Global unique ID
  globalId: string; // Fully qualified path: GLOBAL/COUNTRY/REGION/CLUSTER/SITE/NODE/RACK/BOARD/RRU/PORT/CELL
  name: string;
  type: ObjectType;

  // Hierarchy
  parentId?: string;
  childrenIds: string[]; // For lazy loading: track but don't auto-expand
  
  // Location & coordinates
  geoCoordinates?: GeoCoordinate;
  country?: string;
  region?: string;
  
  // Hardware & vendor info
  vendor?: Vendor;
  technology?: Technology;
  hardwareModel?: string;
  serialNumber?: string;
  firmwareVersion?: string;
  
  // Health & status
  healthState: HealthState;
  alarmSummary: AlarmSummary;
  kpiSummary: KPISummary;
  
  // Capacity & resources
  capacity?: CapacityMetrics;
  powerMetrics?: {
    input: number;
    consumption: number;
    efficiency: number;
  };
  
  // Dependencies & relationships
  dependencies: DependencyLink[];
  transportInterfaces?: TransportInterface[];
  
  // Automation & control
  automationLocked: boolean;
  automationEligible: boolean;
  changeWindow?: { start: string; end: string };
  
  // Time tracking
  lastStateChange: string; // ISO timestamp
  lastUpdate: string; // ISO timestamp
  stateHistory: TimeHistoryEntry[];
  
  // Metadata
  description: string;
  tags: string[];
  customMetadata?: Record<string, any>;
  
  // Rendering hints
  isAggregated?: boolean; // True when this represents multiple children at zoom level
  aggregatedCount?: number; // Number of nodes represented by this aggregation
  
  // Rack-specific (for type='rack' or child 'board', 'rru')
  rackPosition?: {
    startU: number;
    endU: number;
  };
}

export interface TopologyGraph {
  nodes: Map<string, TopologyNode>;
  edges: Map<string, DependencyLink>;
  rootId?: string;
  lastUpdated: string;
  statistics: {
    totalNodes: number;
    nodesByType: Record<ObjectType, number>;
    healthDistribution: Record<HealthState, number>;
    criticalAlarmCount: number;
  };
}

export interface ViewSyncState {
  selectedNodeId: string | null;
  expandedNodeIds: Set<string>;
  visibleNodeIds: Set<string>;
  zoomLevel: number;
  viewportBounds?: {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  };
  filters: {
    healthStates: HealthState[];
    vendors: Vendor[];
    technologies: Technology[];
    hasAlarms: boolean;
    automationLocked: boolean;
  };
}

/**
 * Graph Model Generator - Creates realistic carrier-grade network topology
 */
export function generateUnifiedTopologyGraph(): TopologyGraph {
  const nodes = new Map<string, TopologyNode>();
  let nodeCounter = 0;

  const createNode = (
    name: string,
    type: ObjectType,
    parentId: string | undefined,
    config: Partial<TopologyNode> = {}
  ): TopologyNode => {
    const id = `node_${nodeCounter++}`;
    const healthStates: HealthState[] = ['healthy', 'degraded', 'down', 'offline'];

    // More varied health state distribution - worse for deeper nodes
    const randomHealth = Math.random();
    let healthState: HealthState;
    if (randomHealth > 0.87) {
      healthState = healthStates[Math.floor(Math.random() * 4)];
    } else if (randomHealth > 0.75) {
      healthState = healthStates[Math.floor(Math.random() * 2)];
    } else {
      healthState = 'healthy';
    }

    // More vendor variety - improve probability of having a vendor
    const vendors: Vendor[] = ['Nokia', 'Ericsson', 'Huawei', 'ZTE'];
    const vendor = Math.random() > 0.4 ? vendors[Math.floor(Math.random() * vendors.length)] : 'Unknown';

    // Increased alarms based on health state and node type
    const alarmMultiplier = type.includes('rack') || type.includes('board') ? 1.5 : 1;
    const healthFactor = healthState === 'down' ? 3 : healthState === 'degraded' ? 1.5 : 1;

    const node: TopologyNode = {
      id,
      globalId: `${parentId ? nodes.get(parentId)?.globalId + '/' : 'GLOBAL/'}${name}`,
      name,
      type,
      parentId,
      childrenIds: [],
      vendor,
      technology: ['2G', '3G', '4G', '5G', 'Transport', 'IP'][Math.floor(Math.random() * 6)] as Technology,
      healthState,
      alarmSummary: {
        critical: Math.floor((healthState === 'down' ? Math.random() * 7 + 2 : Math.random() * 3) * alarmMultiplier * healthFactor),
        major: Math.floor((Math.random() * 12) * alarmMultiplier * healthFactor),
        minor: Math.floor((Math.random() * 25) * alarmMultiplier * healthFactor),
        warning: Math.floor((Math.random() * 40) * alarmMultiplier * healthFactor),
        total: 0,
        lastAlarm: new Date(Date.now() - Math.random() * 7200000).toISOString()
      },
      kpiSummary: {
        availability: healthState === 'down' ? 50 + Math.random() * 30 : healthState === 'degraded' ? 95 + Math.random() * 4 : 99 + Math.random() * 1,
        dropRate: healthState === 'down' ? Math.random() * 5 : healthState === 'degraded' ? Math.random() * 2 : Math.random() * 0.5,
        throughput: 70 + Math.random() * 30,
        latency: 5 + Math.random() * 50,
        utilization: 20 + Math.random() * 70,
        lastUpdate: new Date().toISOString()
      },
      dependencies: [],
      automationLocked: Math.random() > 0.85,
      automationEligible: healthState === 'healthy',
      lastStateChange: new Date(Date.now() - Math.random() * 7200000).toISOString(),
      lastUpdate: new Date().toISOString(),
      stateHistory: [],
      description: `${type} - ${name}`,
      tags: [type, vendor],
      ...config
    };

    node.alarmSummary.total = node.alarmSummary.critical + node.alarmSummary.major + node.alarmSummary.minor + node.alarmSummary.warning;

    return node;
  };

  // Create Global node
  const globalNode = createNode('GLOBAL', 'global', undefined, {
    geoCoordinates: { latitude: 25, longitude: 40 },
    description: 'Global network topology root'
  });
  nodes.set(globalNode.id, globalNode);

  // Create Countries
  const countries = ['Egypt', 'Saudi Arabia', 'UAE'];
  const countryNodeMap: Record<string, string> = {};

  countries.forEach(country => {
    const countryNode = createNode(country, 'country', globalNode.id, {
      geoCoordinates: { latitude: 25 + Math.random() * 5, longitude: 30 + Math.random() * 20 },
      country,
      description: `${country} network region`
    });
    nodes.set(countryNode.id, countryNode);
    globalNode.childrenIds.push(countryNode.id);
    countryNodeMap[country] = countryNode.id;
  });

  // Create Regions per Country - BALANCED FOR PERFORMANCE
  const regionsByCountry: Record<string, string[]> = {
    'Egypt': ['Cairo', 'Alexandria', 'Giza', 'Aswan'],
    'Saudi Arabia': ['Riyadh', 'Jeddah', 'Dammam'],
    'UAE': ['Dubai', 'Abu Dhabi', 'Sharjah']
  };

  const regionMap: Record<string, string> = {};

  Object.entries(regionsByCountry).forEach(([countryName, regions]) => {
    const countryNode = nodes.get(countryNodeMap[countryName])!;

    regions.forEach((region, regionIdx) => {
      const regionNode = createNode(region, 'region', countryNode.id, {
        geoCoordinates: { latitude: (countryNode.geoCoordinates?.latitude || 25) + (Math.random() - 0.5) * 3, longitude: (countryNode.geoCoordinates?.longitude || 40) + (Math.random() - 0.5) * 3 },
        country: countryName,
        region,
        description: `${region} region - ${countryName}`
      });
      nodes.set(regionNode.id, regionNode);
      countryNode.childrenIds.push(regionNode.id);
      regionMap[region] = regionNode.id;
    });
  });

  // Create Clusters per Region - OPTIMIZED (3-5 clusters per region for performance)
  Object.values(regionMap).forEach(regionId => {
    const regionNode = nodes.get(regionId)!;
    const clusterCount = 3 + Math.floor(Math.random() * 3); // 3-5 clusters

    for (let i = 0; i < clusterCount; i++) {
      const clusterNode = createNode(`${regionNode.name}-Cluster-${i + 1}`, 'cluster', regionId, {
        geoCoordinates: {
          latitude: (regionNode.geoCoordinates?.latitude || 25) + (Math.random() - 0.5) * 2.5,
          longitude: (regionNode.geoCoordinates?.longitude || 40) + (Math.random() - 0.5) * 2.5
        },
        country: regionNode.country,
        region: regionNode.region,
        description: `Cluster in ${regionNode.name}`
      });
      nodes.set(clusterNode.id, clusterNode);
      regionNode.childrenIds.push(clusterNode.id);

      // Create Sites per Cluster - OPTIMIZED (6-10 sites per cluster)
      const siteCount = 6 + Math.floor(Math.random() * 5);
      for (let j = 0; j < siteCount; j++) {
        const siteNode = createNode(`${clusterNode.name}-Site-${j + 1}`, 'site', clusterNode.id, {
          geoCoordinates: {
            latitude: (clusterNode.geoCoordinates?.latitude || 25) + (Math.random() - 0.5) * 1.5,
            longitude: (clusterNode.geoCoordinates?.longitude || 40) + (Math.random() - 0.5) * 1.5
          },
          country: regionNode.country,
          region: regionNode.region,
          description: `Site in ${clusterNode.name}`
        });
        nodes.set(siteNode.id, siteNode);
        clusterNode.childrenIds.push(siteNode.id);

        // Create Nodes per Site - BALANCED (3-5 nodes per site)
        const nodeCount = 3 + Math.floor(Math.random() * 3);
        for (let k = 0; k < nodeCount; k++) {
          const rNode = createNode(`${siteNode.name}-Node-${k + 1}`, 'node', siteNode.id, {
            geoCoordinates: siteNode.geoCoordinates,
            country: regionNode.country,
            region: regionNode.region,
            description: `Node in ${siteNode.name}`
          });
          nodes.set(rNode.id, rNode);
          siteNode.childrenIds.push(rNode.id);

          // Create Racks per Node (1 rack per node)
          const rackNode = createNode(`${rNode.name}-Rack-01`, 'rack', rNode.id, {
            geoCoordinates: siteNode.geoCoordinates,
            country: regionNode.country,
            region: regionNode.region,
            capacity: { totalCapacity: 42, usedCapacity: 20 + Math.floor(Math.random() * 22), unit: 'U' },
            description: `Rack in ${rNode.name}`
          });
          nodes.set(rackNode.id, rackNode);
          rNode.childrenIds.push(rackNode.id);

          // Create Boards in Rack - BALANCED (3 boards per rack)
          const boardCount = 3;
          for (let b = 0; b < boardCount; b++) {
            const boardNode = createNode(`Board-${b + 1}`, 'board', rackNode.id, {
              geoCoordinates: siteNode.geoCoordinates,
              rackPosition: { startU: b * 7 + 1, endU: (b + 1) * 7 },
              capacity: { totalCapacity: 16, usedCapacity: Math.floor(Math.random() * 12) + 4, unit: 'ports' },
              description: `Board in ${rackNode.name}`
            });
            nodes.set(boardNode.id, boardNode);
            rackNode.childrenIds.push(boardNode.id);

            // Create RRUs (Radio Remote Units) - BALANCED (2-3 RRUs per board)
            const rruCount = 2 + Math.floor(Math.random() * 2);
            for (let r = 0; r < rruCount; r++) {
              const rruNode = createNode(`RRU-${r + 1}`, 'rru', boardNode.id, {
                geoCoordinates: siteNode.geoCoordinates,
                rackPosition: { startU: b * 7 + 1 + r * 2, endU: b * 7 + 1 + r * 2 + 1 },
                capacity: { totalCapacity: 8, usedCapacity: Math.floor(Math.random() * 6) + 2, unit: 'ports' },
                description: `RRU in ${boardNode.name}`
              });
              nodes.set(rruNode.id, rruNode);
              boardNode.childrenIds.push(rruNode.id);

              // Create Ports - BALANCED (4-6 ports per RRU)
              const portCount = 4 + Math.floor(Math.random() * 3);
              for (let p = 0; p < portCount; p++) {
                const portNode = createNode(`Port-${p + 1}`, 'port', rruNode.id, {
                  geoCoordinates: siteNode.geoCoordinates,
                  transportInterfaces: [{
                    id: `iface_${p}`,
                    name: `Port ${p + 1}`,
                    type: ['MPLS', 'Fiber', 'Microwave', 'IP', 'Radio'][Math.floor(Math.random() * 5)] as TransportType,
                    linkState: Math.random() > 0.93 ? (Math.random() > 0.5 ? 'degraded' : 'down') : 'up',
                    throughput: 1000 + Math.random() * 10000,
                    errors: Math.floor(Math.random() * 100),
                    capacity: 10000,
                    utilization: 30 + Math.random() * 60
                  }],
                  description: `Port in ${rruNode.name}`
                });
                nodes.set(portNode.id, portNode);
                rruNode.childrenIds.push(portNode.id);

                // Create Cells (leaf nodes) - BALANCED (1-2 cells per port)
                const cellCount = 1 + Math.floor(Math.random() * 2);
                for (let c = 0; c < cellCount; c++) {
                  const cellNode = createNode(`Cell-${c + 1}`, 'cell', portNode.id, {
                    geoCoordinates: siteNode.geoCoordinates,
                    description: `Cell in ${portNode.name}`,
                    technology: ['2G', '3G', '4G', '5G'][Math.floor(Math.random() * 4)] as Technology
                  });
                  nodes.set(cellNode.id, cellNode);
                  portNode.childrenIds.push(cellNode.id);
                }
              }
            }
          }
        }
      }
    }
  });

  return {
    nodes,
    edges: new Map(),
    rootId: globalNode.id,
    lastUpdated: new Date().toISOString(),
    statistics: {
      totalNodes: nodes.size,
      nodesByType: {} as Record<ObjectType, number>,
      healthDistribution: {
        healthy: 0,
        degraded: 0,
        down: 0,
        offline: 0,
        unknown: 0
      },
      criticalAlarmCount: 0
    }
  };
}

/**
 * Get node by ID with lazy loading support
 */
export function getNodeById(graph: TopologyGraph, id: string): TopologyNode | undefined {
  return graph.nodes.get(id);
}

/**
 * Get children for a node (with lazy loading hints)
 */
export function getNodeChildren(graph: TopologyGraph, nodeId: string): TopologyNode[] {
  const node = graph.nodes.get(nodeId);
  if (!node) return [];
  return node.childrenIds
    .map(childId => graph.nodes.get(childId))
    .filter((n): n is TopologyNode => !!n);
}

/**
 * Find ancestors (path from node to root)
 */
export function getNodeAncestors(graph: TopologyGraph, nodeId: string): TopologyNode[] {
  const ancestors: TopologyNode[] = [];
  let current = graph.nodes.get(nodeId);

  while (current) {
    ancestors.unshift(current);
    current = current.parentId ? graph.nodes.get(current.parentId) : undefined;
  }

  return ancestors;
}

/**
 * Calculate impact chain from a node
 */
export function getImpactChain(graph: TopologyGraph, nodeId: string, depth: number = 3): TopologyNode[] {
  const impacted = new Set<string>();
  const queue: [string, number][] = [[nodeId, 0]];

  while (queue.length > 0) {
    const [currentId, currentDepth] = queue.shift()!;
    if (currentDepth > depth) continue;

    const node = graph.nodes.get(currentId);
    if (!node) continue;

    impacted.add(currentId);
    node.childrenIds.forEach(childId => {
      if (!impacted.has(childId)) {
        queue.push([childId, currentDepth + 1]);
      }
    });
  }

  return Array.from(impacted)
    .map(id => graph.nodes.get(id))
    .filter((n): n is TopologyNode => !!n);
}
