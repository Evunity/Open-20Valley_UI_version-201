export type ObjectType = 'country' | 'region' | 'cluster' | 'site' | 'power' | 'transport' | 'ran' | 'cabinet' | 'rack' | 'shelf' | 'board' | 'rru' | 'bbu' | 'module' | 'port' | 'cell' | 'interface';
export type Vendor = 'Nokia' | 'Ericsson' | 'Huawei' | 'ZTE' | 'Unknown';
export type Technology = '2G' | '3G' | '4G' | '5G' | 'Transport' | 'IP' | 'Power';
export type HealthState = 'healthy' | 'degraded' | 'down' | 'unknown';

export interface GeoCoordinate {
  latitude: number;
  longitude: number;
}

export interface AlarmSummary {
  critical: number;
  major: number;
  minor: number;
  warning: number;
}

export interface KPISummary {
  availability: number; // 0-100
  dropRate: number;
  throughput: number;
  latency: number;
  utilization: number;
}

export interface TopologyObject {
  id: string;
  name: string;
  type: ObjectType;
  vendor?: Vendor;
  technology?: Technology;
  parentId?: string;
  childrenIds: string[];
  geoCoordinates?: GeoCoordinate;
  healthState: HealthState;
  alarmSummary: AlarmSummary;
  kpiSummary: KPISummary;
  capacity?: number;
  automationLocked: boolean;
  lastStateChange: string;
  description: string;
}

export interface DependencyLink {
  sourceId: string;
  targetId: string;
  type: 'upstream' | 'downstream' | 'peer';
  impact: string;
}

export interface TopologyContext {
  objects: Map<string, TopologyObject>;
  dependencies: DependencyLink[];
}

// Mock data generators
export function generateMockTopologyHierarchy(): TopologyObject[] {
  const objects: TopologyObject[] = [];
  let idCounter = 0;

  // Countries
  const countries = ['Egypt', 'Saudi Arabia', 'UAE'];
  const countryMap = new Map<string, string>();

  countries.forEach(country => {
    const id = `country_${idCounter++}`;
    countryMap.set(country, id);
    objects.push({
      id,
      name: country,
      type: 'country',
      childrenIds: [],
      healthState: Math.random() > 0.95 ? 'down' : 'healthy',
      alarmSummary: {
        critical: Math.floor(Math.random() * 10),
        major: Math.floor(Math.random() * 30),
        minor: Math.floor(Math.random() * 50),
        warning: Math.floor(Math.random() * 100)
      },
      kpiSummary: {
        availability: 99.5 - Math.random() * 5,
        dropRate: Math.random() * 2,
        throughput: 85 + Math.random() * 15,
        latency: 10 + Math.random() * 30,
        utilization: 40 + Math.random() * 50
      },
      automationLocked: false,
      lastStateChange: new Date(Date.now() - Math.random() * 3600000).toISOString(),
      description: `${country} network region`
    });
  });

  // Regions per country
  const regionsByCountry = {
    'Egypt': ['Cairo', 'Alexandria', 'Giza'],
    'Saudi Arabia': ['Riyadh', 'Jeddah', 'Dammam'],
    'UAE': ['Dubai', 'Abu Dhabi', 'Sharjah']
  };

  const regionMap = new Map<string, string>();
  const vendors: Vendor[] = ['Nokia', 'Ericsson', 'Huawei', 'ZTE'];

  Object.entries(regionsByCountry).forEach(([country, regions]) => {
    const countryId = countryMap.get(country)!;
    const countryObj = objects.find(o => o.id === countryId)!;

    regions.forEach(region => {
      const id = `region_${idCounter++}`;
      regionMap.set(region, id);
      countryObj.childrenIds.push(id);

      objects.push({
        id,
        name: region,
        type: 'region',
        vendor: vendors[Math.floor(Math.random() * vendors.length)],
        parentId: countryId,
        childrenIds: [],
        geoCoordinates: {
          latitude: 30 + Math.random() * 10,
          longitude: 30 + Math.random() * 20
        },
        healthState: Math.random() > 0.9 ? 'degraded' : 'healthy',
        alarmSummary: {
          critical: Math.floor(Math.random() * 5),
          major: Math.floor(Math.random() * 15),
          minor: Math.floor(Math.random() * 30),
          warning: Math.floor(Math.random() * 60)
        },
        kpiSummary: {
          availability: 99.5 - Math.random() * 5,
          dropRate: Math.random() * 1.5,
          throughput: 85 + Math.random() * 15,
          latency: 10 + Math.random() * 25,
          utilization: 40 + Math.random() * 50
        },
        automationLocked: Math.random() > 0.9,
        lastStateChange: new Date(Date.now() - Math.random() * 3600000).toISOString(),
        description: `${region} cluster region`
      });
    });
  });

  // Clusters per region (2-3 per region)
  Array.from(regionMap.entries()).forEach(([regionName, regionId]) => {
    const regionObj = objects.find(o => o.id === regionId)!;
    const clusterCount = 2 + Math.floor(Math.random() * 2);

    for (let i = 0; i < clusterCount; i++) {
      const id = `cluster_${regionName}_${i}`;
      regionObj.childrenIds.push(id);

      objects.push({
        id,
        name: `${regionName}-Cluster-${i + 1}`,
        type: 'cluster',
        vendor: regionObj.vendor,
        parentId: regionId,
        childrenIds: [],
        geoCoordinates: regionObj.geoCoordinates,
        healthState: Math.random() > 0.85 ? 'degraded' : 'healthy',
        alarmSummary: {
          critical: Math.floor(Math.random() * 3),
          major: Math.floor(Math.random() * 8),
          minor: Math.floor(Math.random() * 15),
          warning: Math.floor(Math.random() * 30)
        },
        kpiSummary: {
          availability: 99.5 - Math.random() * 4,
          dropRate: Math.random() * 1,
          throughput: 85 + Math.random() * 15,
          latency: 10 + Math.random() * 20,
          utilization: 40 + Math.random() * 50
        },
        automationLocked: false,
        lastStateChange: new Date(Date.now() - Math.random() * 1800000).toISOString(),
        description: `${regionName} cluster ${i + 1}`
      });
    }
  });

  // Sites per cluster (3-5 per cluster)
  const clusters = objects.filter(o => o.type === 'cluster');
  clusters.forEach((cluster, clusterIdx) => {
    const siteCount = 3 + Math.floor(Math.random() * 3);

    for (let i = 0; i < siteCount; i++) {
      const id = `site_${cluster.name}_${i}`;
      cluster.childrenIds.push(id);

      const siteHealth = Math.random();
      objects.push({
        id,
        name: `${cluster.name}-Site-${i + 1}`,
        type: 'site',
        vendor: cluster.vendor,
        technology: Math.random() > 0.7 ? '5G' : '4G',
        parentId: cluster.id,
        childrenIds: [],
        geoCoordinates: {
          latitude: (cluster.geoCoordinates?.latitude || 30) + (Math.random() - 0.5) * 2,
          longitude: (cluster.geoCoordinates?.longitude || 30) + (Math.random() - 0.5) * 2
        },
        healthState: siteHealth > 0.95 ? 'down' : siteHealth > 0.85 ? 'degraded' : 'healthy',
        alarmSummary: {
          critical: siteHealth > 0.95 ? Math.floor(Math.random() * 5 + 2) : Math.floor(Math.random() * 2),
          major: Math.floor(Math.random() * 5),
          minor: Math.floor(Math.random() * 10),
          warning: Math.floor(Math.random() * 20)
        },
        kpiSummary: {
          availability: 99.5 - Math.random() * 3,
          dropRate: Math.random() * 0.5,
          throughput: 85 + Math.random() * 15,
          latency: 10 + Math.random() * 15,
          utilization: 40 + Math.random() * 50
        },
        automationLocked: Math.random() > 0.95,
        lastStateChange: new Date(Date.now() - Math.random() * 900000).toISOString(),
        description: `Site ${i + 1} in ${cluster.name}`
      });
    }
  });

  return objects;
}

export function getHealthColor(state: HealthState): string {
  const colors = {
    healthy: 'bg-green-500',
    degraded: 'bg-yellow-500',
    down: 'bg-red-500',
    unknown: 'bg-gray-500'
  };
  return colors[state];
}

export function getHealthBgColor(state: HealthState): string {
  const colors = {
    healthy: 'bg-green-50 border-green-200',
    degraded: 'bg-yellow-50 border-yellow-200',
    down: 'bg-red-50 border-red-200',
    unknown: 'bg-gray-50 border-gray-200'
  };
  return colors[state];
}

export function getVendorColor(vendor?: Vendor): string {
  const colors = {
    'Nokia': 'border-blue-500',
    'Ericsson': 'border-black',
    'Huawei': 'border-red-500',
    'ZTE': 'border-orange-500',
    'Unknown': 'border-gray-300'
  };
  return colors[vendor || 'Unknown'];
}

export function getTotalAlarms(summary: AlarmSummary): number {
  return summary.critical + summary.major + summary.minor + summary.warning;
}
