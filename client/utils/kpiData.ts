/**
 * Analytics Management Module - KPI Data Utilities
 * Defines KPI structures, domains, and mock data generation
 */

export type KPIDirection = "higher-is-better" | "lower-is-better";
export type KPIScope = "Network" | "Region" | "Cluster" | "Site" | "Node" | "Cell" | "Interface";
export type KPICategory = "Accessibility" | "Throughput" | "Latency" | "Reliability" | "Quality" | "Traffic";
export type Technology = "2G" | "3G" | "4G" | "5G" | "O-RAN";
export type Vendor = "Huawei" | "Ericsson" | "Nokia" | "ZTE" | "O-RAN";
export type Domain = "RAN" | "O-RAN" | "Transport" | "Core";

export interface KPI {
  id: string;
  name: string;
  category: KPICategory;
  technology: Technology;
  scope: KPIScope;
  vendor: Vendor;
  domain: Domain;
  unit: string;
  direction: KPIDirection;
  description: string;
}

export interface KPIValue {
  kpiId: string;
  scope: KPIScope;
  scopeLabel: string; // e.g., "Region: North", "Site: Site-01"
  value: number;
  unit: string;
  timestamp: string;
  change: number; // percentage change
  status: "healthy" | "degraded" | "critical";
}

// Mock KPI Catalog
export const KPI_CATALOG: KPI[] = [
  // RAN - Accessibility KPIs
  {
    id: "ran_accessibility_001",
    name: "Call Setup Success Rate",
    category: "Accessibility",
    technology: "4G",
    scope: "Network",
    vendor: "Ericsson",
    domain: "RAN",
    unit: "%",
    direction: "higher-is-better",
    description: "Percentage of successful call setup attempts",
  },
  {
    id: "ran_accessibility_002",
    name: "CS/PS Availability",
    category: "Accessibility",
    technology: "3G",
    scope: "Cell",
    vendor: "Huawei",
    domain: "RAN",
    unit: "%",
    direction: "higher-is-better",
    description: "Circuit-switched and Packet-switched service availability",
  },

  // RAN - Throughput KPIs
  {
    id: "ran_throughput_001",
    name: "Average Cell Throughput",
    category: "Throughput",
    technology: "5G",
    scope: "Site",
    vendor: "Nokia",
    domain: "RAN",
    unit: "Mbps",
    direction: "higher-is-better",
    description: "Average data throughput per cell",
  },
  {
    id: "ran_throughput_002",
    name: "Spectral Efficiency",
    category: "Throughput",
    technology: "4G",
    scope: "Cluster",
    vendor: "Ericsson",
    domain: "RAN",
    unit: "bps/Hz",
    direction: "higher-is-better",
    description: "Bits per second per Hertz of spectrum",
  },

  // RAN - Latency KPIs
  {
    id: "ran_latency_001",
    name: "Radio Link Failure Rate",
    category: "Latency",
    technology: "4G",
    scope: "Cell",
    vendor: "Huawei",
    domain: "RAN",
    unit: "%",
    direction: "lower-is-better",
    description: "Percentage of radio link failures",
  },
  {
    id: "ran_latency_002",
    name: "Handover Success Rate",
    category: "Latency",
    technology: "5G",
    scope: "Region",
    vendor: "Nokia",
    domain: "RAN",
    unit: "%",
    direction: "higher-is-better",
    description: "Successful handovers / total handover attempts",
  },

  // RAN - Quality KPIs
  {
    id: "ran_quality_001",
    name: "Voice Quality Index (VQI)",
    category: "Quality",
    technology: "4G",
    scope: "Network",
    vendor: "Ericsson",
    domain: "RAN",
    unit: "score",
    direction: "higher-is-better",
    description: "Voice quality measurement (1-5 scale)",
  },
  {
    id: "ran_quality_002",
    name: "CSFB Success Rate",
    category: "Quality",
    technology: "4G",
    scope: "Cell",
    vendor: "Huawei",
    domain: "RAN",
    unit: "%",
    direction: "higher-is-better",
    description: "Circuit-switched fallback success rate",
  },

  // O-RAN KPIs
  {
    id: "oran_rru_001",
    name: "RU RSSI Variation",
    category: "Quality",
    technology: "5G",
    scope: "Node",
    vendor: "O-RAN",
    domain: "O-RAN",
    unit: "dB",
    direction: "lower-is-better",
    description: "RU Received Signal Strength Indicator variation",
  },
  {
    id: "oran_du_001",
    name: "DU Processing Latency",
    category: "Latency",
    technology: "5G",
    scope: "Site",
    vendor: "O-RAN",
    domain: "O-RAN",
    unit: "ms",
    direction: "lower-is-better",
    description: "Distributed Unit processing delay",
  },
  {
    id: "oran_ric_001",
    name: "RIC Closed-Loop Convergence",
    category: "Reliability",
    technology: "5G",
    scope: "Cluster",
    vendor: "O-RAN",
    domain: "O-RAN",
    unit: "ms",
    direction: "lower-is-better",
    description: "RIC intelligence closed-loop convergence time",
  },

  // Transport KPIs
  {
    id: "transport_ip_001",
    name: "IP Link Utilization",
    category: "Traffic",
    technology: "4G",
    scope: "Interface",
    vendor: "ZTE",
    domain: "Transport",
    unit: "%",
    direction: "lower-is-better",
    description: "IP backhaul link utilization percentage",
  },
  {
    id: "transport_mpls_001",
    name: "MPLS LSP Availability",
    category: "Reliability",
    technology: "5G",
    scope: "Network",
    vendor: "Nokia",
    domain: "Transport",
    unit: "%",
    direction: "higher-is-better",
    description: "MPLS Label Switched Path availability",
  },
  {
    id: "transport_backhaul_001",
    name: "Backhaul Latency",
    category: "Latency",
    technology: "4G",
    scope: "Site",
    vendor: "Ericsson",
    domain: "Transport",
    unit: "ms",
    direction: "lower-is-better",
    description: "Backhaul network latency",
  },

  // Core KPIs
  {
    id: "core_session_001",
    name: "Session Establishment Rate",
    category: "Accessibility",
    technology: "4G",
    scope: "Network",
    vendor: "Huawei",
    domain: "Core",
    unit: "%",
    direction: "higher-is-better",
    description: "Core network session establishment success rate",
  },
  {
    id: "core_auth_001",
    name: "Authentication Success Rate",
    category: "Accessibility",
    technology: "5G",
    scope: "Network",
    vendor: "Ericsson",
    domain: "Core",
    unit: "%",
    direction: "higher-is-better",
    description: "User authentication success rate",
  },
];

// Filter KPIs by criteria
export const filterKPIs = (
  kpis: KPI[],
  criteria: {
    technologies?: Technology[];
    vendors?: Vendor[];
    domains?: Domain[];
    categories?: KPICategory[];
    scopes?: KPIScope[];
  }
): KPI[] => {
  return kpis.filter((kpi) => {
    if (criteria.technologies?.length && !criteria.technologies.includes(kpi.technology)) return false;
    if (criteria.vendors?.length && !criteria.vendors.includes(kpi.vendor)) return false;
    if (criteria.domains?.length && !criteria.domains.includes(kpi.domain)) return false;
    if (criteria.categories?.length && !criteria.categories.includes(kpi.category)) return false;
    if (criteria.scopes?.length && !criteria.scopes.includes(kpi.scope)) return false;
    return true;
  });
};

// Generate mock KPI values for different scopes
export const generateKPIValues = (
  kpi: KPI,
  scope: KPIScope,
  scopeLabel: string,
  count: number = 30
): KPIValue[] => {
  const values: KPIValue[] = [];
  const baseValue = kpi.direction === "higher-is-better" ? 95 + Math.random() * 5 : 5 + Math.random() * 5;

  for (let i = 0; i < count; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (count - i));
    const variation = (Math.random() - 0.5) * 10;
    const value = baseValue + variation;

    values.push({
      kpiId: kpi.id,
      scope,
      scopeLabel,
      value: Math.max(0, Math.min(100, value)),
      unit: kpi.unit,
      timestamp: date.toISOString().split("T")[0],
      change: variation,
      status:
        value > 90 ? "healthy" : value > 70 ? "degraded" : "critical",
    });
  }

  return values;
};

// Get available options for filters based on current selections
export const getAvailableFilterOptions = (
  kpis: KPI[] = KPI_CATALOG,
  currentFilters?: {
    technologies?: Technology[];
    vendors?: Vendor[];
    domains?: Domain[];
  }
) => {
  const filtered = filterKPIs(kpis, currentFilters || {});

  return {
    technologies: Array.from(
      new Set(filtered.map((k) => k.technology))
    ).sort(),
    vendors: Array.from(new Set(filtered.map((k) => k.vendor))).sort(),
    domains: Array.from(new Set(filtered.map((k) => k.domain))).sort(),
    categories: Array.from(new Set(filtered.map((k) => k.category))).sort(),
    scopes: Array.from(new Set(filtered.map((k) => k.scope))).sort(),
  };
};

// Mock scope labels for different levels
export const SCOPE_OPTIONS: Record<KPIScope, string[]> = {
  Network: ["Entire Network"],
  Region: ["North", "South", "East", "West", "Central"],
  Cluster: ["Cluster A", "Cluster B", "Cluster C", "Cluster D"],
  Site: ["Site-01", "Site-02", "Site-03", "Site-04", "Site-05"],
  Node: ["Node-A", "Node-B", "Node-C"],
  Cell: ["Cell-001", "Cell-002", "Cell-003", "Cell-004"],
  Interface: ["eth0", "eth1", "eth2"],
};
