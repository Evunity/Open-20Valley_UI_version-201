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

  // Regions per country with specific geographic coordinates
  const regionsByCountry = {
    'Egypt': [
      { name: 'Cairo', lat: 30.0444, lon: 31.2357 },
      { name: 'Alexandria', lat: 31.2001, lon: 29.9187 },
      { name: 'Giza', lat: 30.0131, lon: 31.1989 },
      { name: 'Aswan', lat: 24.0889, lon: 32.9061 },
      { name: 'Suez', lat: 29.9668, lon: 32.5498 }
    ],
    'Saudi Arabia': [
      { name: 'Riyadh', lat: 24.7136, lon: 46.6753 },
      { name: 'Jeddah', lat: 21.5433, lon: 39.1725 },
      { name: 'Dammam', lat: 26.4124, lon: 50.1971 },
      { name: 'Medina', lat: 24.5247, lon: 39.5692 },
      { name: 'Mecca', lat: 21.3891, lon: 39.8579 }
    ],
    'UAE': [
      { name: 'Dubai', lat: 25.2048, lon: 55.2708 },
      { name: 'Abu Dhabi', lat: 24.4539, lon: 54.3773 },
      { name: 'Sharjah', lat: 25.3548, lon: 55.3915 },
      { name: 'Ajman', lat: 25.4164, lon: 55.4437 },
      { name: 'Ras Al Khaimah', lat: 25.7482, lon: 55.9431 }
    ]
  };

  const regionMap = new Map<string, string>();
  const vendors: Vendor[] = ['Nokia', 'Ericsson', 'Huawei', 'ZTE'];

  Object.entries(regionsByCountry).forEach(([country, regions]) => {
    const countryId = countryMap.get(country)!;
    const countryObj = objects.find(o => o.id === countryId)!;

    regions.forEach((region) => {
      const id = `region_${idCounter++}`;
      const regionName = typeof region === 'string' ? region : region.name;
      regionMap.set(regionName, id);
      countryObj.childrenIds.push(id);

      const geoCoords = typeof region === 'string'
        ? { latitude: 30 + Math.random() * 10, longitude: 30 + Math.random() * 20 }
        : { latitude: region.lat + (Math.random() - 0.5) * 0.5, longitude: region.lon + (Math.random() - 0.5) * 0.5 };

      objects.push({
        id,
        name: regionName,
        type: 'region',
        vendor: vendors[Math.floor(Math.random() * vendors.length)],
        parentId: countryId,
        childrenIds: [],
        geoCoordinates: geoCoords,
        healthState: Math.random() > 0.85 ? (Math.random() > 0.5 ? 'degraded' : 'healthy') : 'healthy',
        alarmSummary: {
          critical: Math.floor(Math.random() * 8),
          major: Math.floor(Math.random() * 15),
          minor: Math.floor(Math.random() * 25),
          warning: Math.floor(Math.random() * 40)
        },
        kpiSummary: {
          availability: 99.2 - Math.random() * 4,
          dropRate: Math.random() * 1.2,
          throughput: 88 + Math.random() * 12,
          latency: 12 + Math.random() * 20,
          utilization: 45 + Math.random() * 45
        },
        automationLocked: Math.random() > 0.85,
        lastStateChange: new Date(Date.now() - Math.random() * 3600000).toISOString(),
        description: `${regionName} regional hub`
      });
    });
  });

  // Clusters per region (3-6 per region for more data)
  Array.from(regionMap.entries()).forEach(([regionName, regionId]) => {
    const regionObj = objects.find(o => o.id === regionId)!;
    const clusterCount = 3 + Math.floor(Math.random() * 4);

    for (let i = 0; i < clusterCount; i++) {
      const id = `cluster_${regionName}_${i}`;
      regionObj.childrenIds.push(id);

      const clusterHealth = Math.random();
      const offsetLat = (Math.random() - 0.5) * 1.5;
      const offsetLon = (Math.random() - 0.5) * 1.5;

      objects.push({
        id,
        name: `${regionName}-Cluster-${i + 1}`,
        type: 'cluster',
        vendor: vendors[Math.floor(Math.random() * vendors.length)],
        parentId: regionId,
        childrenIds: [],
        geoCoordinates: {
          latitude: (regionObj.geoCoordinates?.latitude || 25) + offsetLat,
          longitude: (regionObj.geoCoordinates?.longitude || 50) + offsetLon
        },
        healthState: clusterHealth > 0.88 ? (Math.random() > 0.6 ? 'degraded' : 'healthy') : 'healthy',
        alarmSummary: {
          critical: clusterHealth > 0.88 ? Math.floor(Math.random() * 5 + 1) : Math.floor(Math.random() * 2),
          major: Math.floor(Math.random() * 10),
          minor: Math.floor(Math.random() * 20),
          warning: Math.floor(Math.random() * 35)
        },
        kpiSummary: {
          availability: 99.3 - Math.random() * 3.5,
          dropRate: Math.random() * 0.8,
          throughput: 87 + Math.random() * 13,
          latency: 11 + Math.random() * 18,
          utilization: 42 + Math.random() * 48
        },
        automationLocked: Math.random() > 0.9,
        lastStateChange: new Date(Date.now() - Math.random() * 1800000).toISOString(),
        description: `${regionName} cluster ${i + 1}`
      });
    }
  });

  // Sites per cluster (5-12 per cluster for more data)
  const clusters = objects.filter(o => o.type === 'cluster');
  clusters.forEach((cluster, clusterIdx) => {
    const siteCount = 5 + Math.floor(Math.random() * 8);
    const technologies: Technology[] = ['2G', '3G', '4G', '5G'];

    for (let i = 0; i < siteCount; i++) {
      const id = `site_${cluster.name}_${i}`;
      cluster.childrenIds.push(id);

      const siteHealth = Math.random();
      const offsetLat = (Math.random() - 0.5) * 1.2;
      const offsetLon = (Math.random() - 0.5) * 1.2;

      objects.push({
        id,
        name: `${cluster.name}-Site-${i + 1}`,
        type: 'site',
        vendor: cluster.vendor,
        technology: technologies[Math.floor(Math.random() * technologies.length)],
        parentId: cluster.id,
        childrenIds: [],
        geoCoordinates: {
          latitude: (cluster.geoCoordinates?.latitude || 25) + offsetLat,
          longitude: (cluster.geoCoordinates?.longitude || 50) + offsetLon
        },
        healthState: siteHealth > 0.93 ? 'down' : siteHealth > 0.80 ? 'degraded' : 'healthy',
        alarmSummary: {
          critical: siteHealth > 0.93 ? Math.floor(Math.random() * 7 + 2) : Math.floor(Math.random() * 3),
          major: Math.floor(Math.random() * 8),
          minor: Math.floor(Math.random() * 15),
          warning: Math.floor(Math.random() * 25)
        },
        kpiSummary: {
          availability: 99.4 - Math.random() * 3.5,
          dropRate: Math.random() * 0.6,
          throughput: 86 + Math.random() * 14,
          latency: 11 + Math.random() * 16,
          utilization: 43 + Math.random() * 47
        },
        automationLocked: Math.random() > 0.92,
        lastStateChange: new Date(Date.now() - Math.random() * 900000).toISOString(),
        description: `${cluster.name}-Site-${i + 1}`
      });
    }

    // Add transport links between sites in cluster
    if (siteCount > 1) {
      const linkCount = Math.floor(siteCount * 0.4);
      for (let l = 0; l < linkCount; l++) {
        const siteA = Math.floor(Math.random() * siteCount);
        let siteB = Math.floor(Math.random() * siteCount);
        while (siteB === siteA) siteB = Math.floor(Math.random() * siteCount);

        const id = `link_${cluster.name}_${l}`;
        const siteAId = `site_${cluster.name}_${siteA}`;
        const siteBId = `site_${cluster.name}_${siteB}`;
        const siteAObj = objects.find(o => o.id === siteAId);
        if (siteAObj) {
          siteAObj.childrenIds.push(id);
        }

        const linkHealth = Math.random();
        objects.push({
          id,
          name: `Link-${cluster.name}-${l + 1}`,
          type: 'link',
          vendor: cluster.vendor,
          technology: 'Transport',
          parentId: siteAId,
          childrenIds: [],
          geoCoordinates: {
            latitude: ((cluster.geoCoordinates?.latitude || 25) + Math.random() * 0.5),
            longitude: ((cluster.geoCoordinates?.longitude || 50) + Math.random() * 0.5)
          },
          healthState: linkHealth > 0.92 ? 'degraded' : 'healthy',
          alarmSummary: {
            critical: linkHealth > 0.92 ? Math.floor(Math.random() * 2) : 0,
            major: Math.floor(Math.random() * 3),
            minor: Math.floor(Math.random() * 8),
            warning: Math.floor(Math.random() * 15)
          },
          kpiSummary: {
            availability: 99.6 - Math.random() * 2,
            dropRate: Math.random() * 0.3,
            throughput: 90 + Math.random() * 10,
            latency: 2 + Math.random() * 5,
            utilization: 30 + Math.random() * 50
          },
          automationLocked: false,
          lastStateChange: new Date(Date.now() - Math.random() * 600000).toISOString(),
          description: `Transport link between Site-${siteA + 1} and Site-${siteB + 1}`
        });
      }
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
