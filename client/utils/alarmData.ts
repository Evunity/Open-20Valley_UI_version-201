import { v4 as uuidv4 } from 'uuid';

// Severity levels with mandatory multi-signal support
export type AlarmSeverity = "critical" | "major" | "minor" | "warning" | "info" | "cleared";

export type AlarmType = "equipment" | "communications" | "quality_of_service" | "processing_error" | "environmental";

export type AlarmCategory = "accessibility" | "performance" | "configuration" | "security" | "maintenance";

export type Technology = "2G" | "3G" | "4G" | "5G" | "FTTx" | "IP" | "OpenRAN";

export type ObjectType = "site" | "node" | "cell" | "interface" | "region" | "cluster";

export type SourceSystem = "Huawei" | "Ericsson" | "Nokia" | "OpenRAN_SMO";

export type TimeMode = "live" | "snapshot" | "historical";

export type EscalationLevel = "L1" | "L2" | "L3" | "L4";

// Alarm comment interface
export interface AlarmComment {
  id: string;
  author: string;
  timestamp: string;
  text: string;
  severity?: "info" | "warning" | "critical";
}

// Object hierarchy context
export interface ObjectHierarchy {
  region?: string;
  cluster?: string;
  site?: string;
  node?: string;
  cell?: string;
  interface?: string;
}

// Core alarm interface
export interface Alarm {
  globalAlarmId: string;
  vendorAlarmId: string;
  vendorAlarmCode?: string; // Exposed in expert mode only
  tenant: string;
  sourceSystem: SourceSystem;
  severity: AlarmSeverity;
  alarmType: AlarmType;
  category: AlarmCategory;
  technologies: Technology[];
  title: string;
  description: string;
  objectType: ObjectType;
  objectName: string;
  hierarchy: ObjectHierarchy;
  assignedTeam?: string;
  escalationLevel?: EscalationLevel;
  comments: AlarmComment[];
  createdAt: string;
  updatedAt: string;
  duration: string; // e.g., "2h 15m"
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  rawVendorData?: Record<string, any>; // Exposed in expert mode only
}

// Helper type for vendor normalization
export interface VendorNormalizedAlarm {
  alarm: Alarm;
  vendorFields: {
    alarmCode: string;
    severity: string;
    type: string;
  };
}

// Mock data generation
const REGIONS = ["Cairo", "Alexandria", "Giza", "Port Said", "Suez"];
const CLUSTERS = ["East Cluster", "West Cluster", "North Cluster", "South Cluster"];
const SITES = ["CAI1022", "CAI1023", "ALX1001", "GIZ2001", "PSA3001"];
const NODES = ["Node-1", "Node-2", "Node-3", "RRH-1", "RRH-2"];
const CELLS = ["Cell-1", "Cell-2", "Cell-3", "Cell-4"];
const INTERFACES = ["IF-ETH-1", "IF-ETH-2", "IF-RADIO-1"];

const ALARM_TITLES: Record<AlarmSeverity, string[]> = {
  critical: [
    "Hardware failure detected",
    "System overload",
    "Network connectivity lost",
    "Service unavailable"
  ],
  major: [
    "High CPU utilization",
    "Memory threshold exceeded",
    "Interface down",
    "Configuration error"
  ],
  minor: [
    "Minor performance degradation",
    "Maintenance due",
    "Software update available",
    "License expiring"
  ],
  warning: [
    "Threshold approaching",
    "Unusual traffic pattern",
    "Backup failure",
    "Log space low"
  ],
  info: [
    "System started",
    "Maintenance completed",
    "Configuration updated",
    "Status changed"
  ],
  cleared: [
    "Alert cleared",
    "Issue resolved",
    "Service restored",
    "Performance normalized"
  ]
};

const SOURCE_SYSTEMS: SourceSystem[] = ["Huawei", "Ericsson", "Nokia", "OpenRAN_SMO"];
const ALARM_TYPES: AlarmType[] = ["equipment", "communications", "quality_of_service", "processing_error", "environmental"];
const ALARM_CATEGORIES: AlarmCategory[] = ["accessibility", "performance", "configuration", "security", "maintenance"];
const TECHNOLOGIES: Technology[] = ["2G", "3G", "4G", "5G", "FTTx", "IP", "OpenRAN"];
const TEAMS = ["NOC Team A", "NOC Team B", "Field Support", "Engineering"];
const ESCALATION_LEVELS: EscalationLevel[] = ["L1", "L2", "L3", "L4"];

const SAMPLE_COMMENTS = [
  "Investigating the issue",
  "Escalated to vendor",
  "Temporary workaround applied",
  "Waiting for spare parts",
  "Issue confirmed by field team"
];

function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomElements<T>(arr: T[], min: number, max: number): T[] {
  const count = Math.floor(Math.random() * (max - min + 1)) + min;
  const result: T[] = [];
  const indices = new Set<number>();
  while (indices.size < count && indices.size < arr.length) {
    indices.add(Math.floor(Math.random() * arr.length));
  }
  return Array.from(indices).map(i => arr[i]);
}

function generateDuration(): string {
  const hours = Math.floor(Math.random() * 48);
  const minutes = Math.floor(Math.random() * 60);
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

function generateTimestamp(hoursAgo: number = 0): string {
  const date = new Date();
  date.setHours(date.getHours() - hoursAgo);
  return date.toISOString();
}

export function generateMockAlarms(count: number = 50): Alarm[] {
  const alarms: Alarm[] = [];
  const severities: AlarmSeverity[] = ["critical", "major", "minor", "warning", "info"];
  const severityDistribution = [0.1, 0.2, 0.25, 0.25, 0.2]; // Distribution percentages

  let criticalCount = 0;
  let majorCount = 0;

  for (let i = 0; i < count; i++) {
    const rand = Math.random();
    let severity: AlarmSeverity;
    
    if (rand < severityDistribution[0] && criticalCount < 5) {
      severity = "critical";
      criticalCount++;
    } else if (rand < severityDistribution[0] + severityDistribution[1] && majorCount < 10) {
      severity = "major";
      majorCount++;
    } else {
      severity = getRandomElement(["minor", "warning", "info"]);
    }

    const sourceSystem = getRandomElement(SOURCE_SYSTEMS);
    const objectType = getRandomElement<ObjectType>(["site", "node", "cell", "interface"]);
    const hoursAgo = Math.floor(Math.random() * 24);
    
    const alarm: Alarm = {
      globalAlarmId: `ALARM-${uuidv4()}`,
      vendorAlarmId: `${sourceSystem}-${Math.floor(Math.random() * 10000)}`,
      vendorAlarmCode: `${sourceSystem.charAt(0)}${Math.floor(Math.random() * 999999).toString().padStart(6, "0")}`,
      tenant: "Egypt Telecom",
      sourceSystem,
      severity,
      alarmType: getRandomElement(ALARM_TYPES),
      category: getRandomElement(ALARM_CATEGORIES),
      technologies: getRandomElements(TECHNOLOGIES, 1, 2),
      title: getRandomElement(ALARM_TITLES[severity]),
      description: `${severity.toUpperCase()} alarm detected on ${objectType}`,
      objectType,
      objectName: getRandomElement(SITES),
      hierarchy: {
        region: getRandomElement(REGIONS),
        cluster: getRandomElement(CLUSTERS),
        site: getRandomElement(SITES),
        node: getRandomElement(NODES),
        cell: getRandomElement(CELLS),
        interface: getRandomElement(INTERFACES)
      },
      assignedTeam: Math.random() > 0.3 ? getRandomElement(TEAMS) : undefined,
      escalationLevel: severity === "critical" ? getRandomElement(ESCALATION_LEVELS) : 
                       severity === "major" ? (Math.random() > 0.5 ? "L2" : "L1") : undefined,
      comments: Math.random() > 0.6 ? [
        {
          id: uuidv4(),
          author: getRandomElement(TEAMS).split(" ")[2] || "Team A",
          timestamp: generateTimestamp(hoursAgo - 1),
          text: getRandomElement(SAMPLE_COMMENTS),
          severity: Math.random() > 0.7 ? "warning" : "info"
        }
      ] : [],
      createdAt: generateTimestamp(hoursAgo),
      updatedAt: generateTimestamp(Math.max(0, hoursAgo - 1)),
      duration: generateDuration(),
      acknowledged: Math.random() > 0.4,
      acknowledgedBy: Math.random() > 0.4 ? getRandomElement(TEAMS) : undefined,
      acknowledgedAt: Math.random() > 0.4 ? generateTimestamp(hoursAgo - 1) : undefined,
      rawVendorData: {
        vendorSpecificField1: `Value-${Math.random()}`,
        vendorSpecificField2: `Status-${getRandomElement(["OK", "FAULT", "WARNING"])}`,
        lastUpdated: new Date().toISOString()
      }
    };
    
    alarms.push(alarm);
  }

  return alarms;
}

// Severity utilities with multi-signal support
export function getSeverityColor(severity: AlarmSeverity): string {
  const colors: Record<AlarmSeverity, string> = {
    critical: "bg-red-600",
    major: "bg-orange-600",
    minor: "bg-yellow-500",
    warning: "bg-blue-500",
    info: "bg-gray-500",
    cleared: "bg-green-600"
  };
  return colors[severity];
}

export function getSeverityTextColor(severity: AlarmSeverity): string {
  const colors: Record<AlarmSeverity, string> = {
    critical: "text-red-600",
    major: "text-orange-600",
    minor: "text-yellow-600",
    warning: "text-blue-600",
    info: "text-gray-600",
    cleared: "text-green-600"
  };
  return colors[severity];
}

export function getSeverityIcon(severity: AlarmSeverity): string {
  const icons: Record<AlarmSeverity, string> = {
    critical: "🔴",
    major: "🟠",
    minor: "🟡",
    warning: "🔵",
    info: "⚪",
    cleared: "✅"
  };
  return icons[severity];
}

export function getSeverityBadgeClass(severity: AlarmSeverity): string {
  const classes: Record<AlarmSeverity, string> = {
    critical: "bg-red-100 text-red-800 border-red-300",
    major: "bg-orange-100 text-orange-800 border-orange-300",
    minor: "bg-yellow-100 text-yellow-800 border-yellow-300",
    warning: "bg-blue-100 text-blue-800 border-blue-300",
    info: "bg-gray-100 text-gray-800 border-gray-300",
    cleared: "bg-green-100 text-green-800 border-green-300"
  };
  return classes[severity];
}

// Vendor normalization
export function normalizeAlarm(alarm: Alarm): VendorNormalizedAlarm {
  return {
    alarm,
    vendorFields: {
      alarmCode: alarm.vendorAlarmCode || "N/A",
      severity: alarm.severity.toUpperCase(),
      type: alarm.alarmType
    }
  };
}

// Vendor field mapping (for expert mode)
export function getVendorFieldsForSource(sourceSystem: SourceSystem): string[] {
  const vendorFields: Record<SourceSystem, string[]> = {
    "Huawei": ["alarmCode", "alarmLevel", "additionalInfo"],
    "Ericsson": ["alarmCode", "eventType", "probableCause"],
    "Nokia": ["alarmCode", "alarmSeverity", "managedObject"],
    "OpenRAN_SMO": ["alarmId", "alarmType", "affectedResource"]
  };
  return vendorFields[sourceSystem] || [];
}

// Time duration calculation
export function calculateDuration(createdAt: string, updatedAt?: string): string {
  const start = new Date(createdAt);
  const end = updatedAt ? new Date(updatedAt) : new Date();
  
  const diffMs = end.getTime() - start.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return "< 1m";
  if (diffMins < 60) return `${diffMins}m`;
  
  const diffHours = Math.floor(diffMins / 60);
  const remainingMins = diffMins % 60;
  
  if (diffHours < 24) {
    return remainingMins > 0 ? `${diffHours}h ${remainingMins}m` : `${diffHours}h`;
  }
  
  const diffDays = Math.floor(diffHours / 24);
  const remainingHours = diffHours % 24;
  
  return remainingHours > 0 ? `${diffDays}d ${remainingHours}h` : `${diffDays}d`;
}

// Filter utilities
export function filterAlarms(
  alarms: Alarm[],
  filters: {
    severity?: AlarmSeverity[];
    sourceSystem?: SourceSystem[];
    technology?: Technology[];
    category?: AlarmCategory[];
    alarmType?: AlarmType[];
    assignedTeam?: string;
    acknowledged?: boolean;
    region?: string;
    site?: string;
  }
): Alarm[] {
  return alarms.filter(alarm => {
    if (filters.severity && !filters.severity.includes(alarm.severity)) return false;
    if (filters.sourceSystem && !filters.sourceSystem.includes(alarm.sourceSystem)) return false;
    if (filters.technology && !alarm.technologies.some(t => filters.technology?.includes(t))) return false;
    if (filters.category && alarm.category !== filters.category[0]) return false;
    if (filters.alarmType && alarm.alarmType !== filters.alarmType[0]) return false;
    if (filters.assignedTeam && alarm.assignedTeam !== filters.assignedTeam) return false;
    if (filters.acknowledged !== undefined && alarm.acknowledged !== filters.acknowledged) return false;
    if (filters.region && alarm.hierarchy.region !== filters.region) return false;
    if (filters.site && alarm.hierarchy.site !== filters.site) return false;
    return true;
  });
}

// Legacy functions for NetworkAlarms page compatibility
export interface AlarmKPIValue {
  value: number | string;
  unit: string;
  change: number;
  status: 'healthy' | 'warning' | 'critical';
  direction: 'up' | 'down';
}

export interface AlarmKPIs {
  active_alarms: AlarmKPIValue;
  critical_alarms: AlarmKPIValue;
  major_alarms: AlarmKPIValue;
  alarm_rate: AlarmKPIValue;
}

export function generateAlarmKPIs(filters: any): AlarmKPIs {
  return {
    active_alarms: {
      value: Math.floor(Math.random() * 500 + 100),
      unit: "alarms",
      change: Math.floor(Math.random() * 15 + 1),
      status: Math.random() > 0.5 ? "warning" : "critical",
      direction: Math.random() > 0.5 ? "up" : "down"
    },
    critical_alarms: {
      value: Math.floor(Math.random() * 50 + 10),
      unit: "alarms",
      change: Math.floor(Math.random() * 8 + 1),
      status: "critical",
      direction: "up"
    },
    major_alarms: {
      value: Math.floor(Math.random() * 100 + 30),
      unit: "alarms",
      change: Math.floor(Math.random() * 10 + 2),
      status: "warning",
      direction: Math.random() > 0.5 ? "up" : "down"
    },
    alarm_rate: {
      value: (Math.random() * 15 + 5).toFixed(2),
      unit: "alarms/h",
      change: Math.floor(Math.random() * 5 + 1),
      status: "warning",
      direction: "up"
    }
  };
}

export interface HealthIndexData {
  value: number;
  status: 'healthy' | 'degraded' | 'critical';
  change: number;
}

export function generateAlarmHealthIndex(filters: any): HealthIndexData {
  const value = Math.floor(Math.random() * 40 + 60);
  return {
    value,
    status: value >= 75 ? 'healthy' : value >= 50 ? 'degraded' : 'critical',
    change: Math.floor(Math.random() * 10 - 5)
  };
}

export function generateAlarmTrendData(filters: any): any[] {
  const data = [];
  const now = new Date();
  for (let i = 23; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
    data.push({
      timestamp: timestamp.toISOString(),
      time: `${timestamp.getHours()}:00`,
      active_alarms: Math.floor(Math.random() * 150 + 50),
      critical_alarms: Math.floor(Math.random() * 30 + 5),
      major_alarms: Math.floor(Math.random() * 50 + 15),
      minor_alarms: Math.floor(Math.random() * 80 + 20),
      clear_rate: Math.floor(Math.random() * 40 + 60)
    });
  }
  return data;
}

export function generateAlarmDistributionByVendor(filters: any): any[] {
  return [
    { name: "Huawei", active: Math.floor(Math.random() * 300 + 100), critical: Math.floor(Math.random() * 30 + 10), major: Math.floor(Math.random() * 50 + 20), avg_duration: Math.floor(Math.random() * 120 + 30), status: Math.random() > 0.5 ? "healthy" : "degraded" },
    { name: "Ericsson", active: Math.floor(Math.random() * 250 + 80), critical: Math.floor(Math.random() * 25 + 8), major: Math.floor(Math.random() * 45 + 18), avg_duration: Math.floor(Math.random() * 110 + 25), status: "healthy" },
    { name: "Nokia", active: Math.floor(Math.random() * 200 + 60), critical: Math.floor(Math.random() * 20 + 6), major: Math.floor(Math.random() * 40 + 15), avg_duration: Math.floor(Math.random() * 100 + 20), status: Math.random() > 0.5 ? "healthy" : "degraded" },
    { name: "OpenRAN", active: Math.floor(Math.random() * 150 + 40), critical: Math.floor(Math.random() * 15 + 4), major: Math.floor(Math.random() * 30 + 10), avg_duration: Math.floor(Math.random() * 90 + 15), status: "healthy" }
  ];
}

export function generateAlarmDistributionByTechnology(filters: any): any[] {
  return [
    { name: "4G", active: Math.floor(Math.random() * 300 + 100), critical: Math.floor(Math.random() * 35 + 12), major: Math.floor(Math.random() * 55 + 22) },
    { name: "5G", active: Math.floor(Math.random() * 250 + 80), critical: Math.floor(Math.random() * 30 + 10), major: Math.floor(Math.random() * 50 + 20) },
    { name: "3G", active: Math.floor(Math.random() * 100 + 30), critical: Math.floor(Math.random() * 12 + 3), major: Math.floor(Math.random() * 20 + 8) },
    { name: "2G", active: Math.floor(Math.random() * 80 + 20), critical: Math.floor(Math.random() * 8 + 2), major: Math.floor(Math.random() * 15 + 5) }
  ];
}

export function generateAlarmDistributionByRegion(filters: any): any[] {
  return [
    { name: "Cairo", active: Math.floor(Math.random() * 200 + 50), critical: Math.floor(Math.random() * 25 + 8), major: Math.floor(Math.random() * 40 + 15) },
    { name: "Alexandria", active: Math.floor(Math.random() * 150 + 40), critical: Math.floor(Math.random() * 18 + 6), major: Math.floor(Math.random() * 30 + 12) },
    { name: "Giza", active: Math.floor(Math.random() * 120 + 30), critical: Math.floor(Math.random() * 15 + 5), major: Math.floor(Math.random() * 25 + 10) },
    { name: "Port Said", active: Math.floor(Math.random() * 100 + 20), critical: Math.floor(Math.random() * 12 + 4), major: Math.floor(Math.random() * 20 + 8) }
  ];
}

export function generateAlarmDistributionByCluster(filters: any): any[] {
  return [
    { name: "East Cluster", active: Math.floor(Math.random() * 200 + 50), critical: Math.floor(Math.random() * 28 + 9), major: Math.floor(Math.random() * 45 + 18) },
    { name: "West Cluster", active: Math.floor(Math.random() * 180 + 45), critical: Math.floor(Math.random() * 25 + 8), major: Math.floor(Math.random() * 42 + 16) },
    { name: "North Cluster", active: Math.floor(Math.random() * 150 + 40), critical: Math.floor(Math.random() * 20 + 6), major: Math.floor(Math.random() * 35 + 14) },
    { name: "South Cluster", active: Math.floor(Math.random() * 120 + 30), critical: Math.floor(Math.random() * 16 + 5), major: Math.floor(Math.random() * 30 + 12) }
  ];
}

export interface AlarmInsight {
  id: string;
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
  scope: string;
  timestamp: string;
  action?: string;
}

export function generateAlarmInsights(
  trendData: any[],
  distributions: any,
  filters: any
): AlarmInsight[] {
  const now = new Date();
  const insights: AlarmInsight[] = [
    {
      id: "insight-1",
      title: "High Critical Alarm Rate",
      description: "Critical alarms increased by 25% in the last hour across all regions",
      severity: "critical",
      scope: "Network-Wide",
      timestamp: new Date(now.getTime() - 5 * 60000).toISOString(),
      action: "View Details"
    },
    {
      id: "insight-2",
      title: "Vendor-Specific Issue",
      description: "Ericsson RAN reporting unusual alarm patterns in Cairo region",
      severity: "warning",
      scope: "Cairo Region",
      timestamp: new Date(now.getTime() - 15 * 60000).toISOString(),
      action: "Investigate"
    },
    {
      id: "insight-3",
      title: "Cluster Performance",
      description: "East Cluster showing improvement in alarm reduction metrics",
      severity: "info",
      scope: "East Cluster",
      timestamp: new Date(now.getTime() - 30 * 60000).toISOString(),
      action: "View Trend"
    }
  ];

  // Filter insights based on applied filters
  return insights.length > 0 ? insights : [];
}
