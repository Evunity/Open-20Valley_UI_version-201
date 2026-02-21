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
export interface AlarmKPI {
  label: string;
  value: string;
  status: 'healthy' | 'warning' | 'critical';
  trend: string;
}

export function generateAlarmKPIs(filters: any): AlarmKPI[] {
  return [
    { label: "Total Alarms", value: Math.floor(Math.random() * 500 + 100).toString(), status: "warning", trend: "↑ 12%" },
    { label: "Critical Alarms", value: Math.floor(Math.random() * 50 + 10).toString(), status: "critical", trend: "↑ 5%" },
    { label: "Acknowledged", value: Math.floor(Math.random() * 100 + 50).toString() + "%", status: "healthy", trend: "↑ 8%" },
    { label: "Avg Duration", value: Math.floor(Math.random() * 3 + 1) + "h", status: "warning", trend: "↓ 3%" }
  ];
}

export function generateAlarmHealthIndex(filters: any): number {
  return Math.floor(Math.random() * 40 + 60);
}

export function generateAlarmTrendData(filters: any): any[] {
  const data = [];
  for (let i = 0; i < 24; i++) {
    data.push({
      time: `${i}:00`,
      critical: Math.floor(Math.random() * 30),
      major: Math.floor(Math.random() * 50),
      minor: Math.floor(Math.random() * 80)
    });
  }
  return data;
}

export function generateAlarmDistributionByVendor(filters: any): any[] {
  return [
    { name: "Huawei", value: Math.floor(Math.random() * 300 + 100) },
    { name: "Ericsson", value: Math.floor(Math.random() * 250 + 80) },
    { name: "Nokia", value: Math.floor(Math.random() * 200 + 60) },
    { name: "OpenRAN", value: Math.floor(Math.random() * 150 + 40) }
  ];
}

export function generateAlarmDistributionByTechnology(filters: any): any[] {
  return [
    { name: "4G", value: Math.floor(Math.random() * 300 + 100) },
    { name: "5G", value: Math.floor(Math.random() * 250 + 80) },
    { name: "3G", value: Math.floor(Math.random() * 100 + 30) },
    { name: "2G", value: Math.floor(Math.random() * 80 + 20) }
  ];
}

export function generateAlarmDistributionByRegion(filters: any): any[] {
  return [
    { name: "Cairo", value: Math.floor(Math.random() * 200 + 50) },
    { name: "Alexandria", value: Math.floor(Math.random() * 150 + 40) },
    { name: "Giza", value: Math.floor(Math.random() * 120 + 30) },
    { name: "Port Said", value: Math.floor(Math.random() * 100 + 20) }
  ];
}

export function generateAlarmDistributionByCluster(filters: any): any[] {
  return [
    { name: "East Cluster", value: Math.floor(Math.random() * 200 + 50) },
    { name: "West Cluster", value: Math.floor(Math.random() * 180 + 45) },
    { name: "North Cluster", value: Math.floor(Math.random() * 150 + 40) },
    { name: "South Cluster", value: Math.floor(Math.random() * 120 + 30) }
  ];
}

export interface AlarmInsight {
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
  action?: string;
}

export function generateAlarmInsights(filters: any): AlarmInsight[] {
  return [
    {
      title: "High Critical Alarm Rate",
      description: "Critical alarms increased by 25% in the last hour",
      severity: "critical",
      action: "View Details"
    },
    {
      title: "Vendor-Specific Issue",
      description: "Ericsson RAN reporting unusual alarm patterns",
      severity: "warning",
      action: "Investigate"
    },
    {
      title: "Cluster Performance",
      description: "East Cluster showing improvement in alarm reduction",
      severity: "info",
      action: "View Trend"
    }
  ];
}
