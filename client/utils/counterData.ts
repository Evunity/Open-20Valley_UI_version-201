/**
 * Counter Data for Analytics
 * Defines counter categories and derived counter calculations
 */

export type CounterCategory = "Radio" | "Traffic" | "Control plane" | "Transport";

export interface Counter {
  id: string;
  name: string;
  category: CounterCategory;
  description: string;
  unit: string;
  vendor?: string;
  technology?: string;
  domain?: string;
}

export interface DerivedCounter {
  id: string;
  name: string;
  description: string;
  category: CounterCategory;
  formula: string; // Human-readable formula
  formulaTree: FormulaNode;
  unit: string;
}

export interface FormulaNode {
  type: "operator" | "counter" | "number";
  operator?: "+" | "-" | "*" | "/" | "%";
  children?: FormulaNode[];
  counterId?: string;
  counterName?: string;
  value?: number;
}

// Base counters
export const COUNTERS: Counter[] = [
  // Radio counters
  {
    id: "radio_001",
    name: "Total RRC Setup Attempts",
    category: "Radio",
    description: "Total number of RRC connection setup attempts",
    unit: "count",
    technology: "4G/5G",
  },
  {
    id: "radio_002",
    name: "Successful RRC Setups",
    category: "Radio",
    description: "Number of successful RRC connection setups",
    unit: "count",
    technology: "4G/5G",
  },
  {
    id: "radio_003",
    name: "Radio Link Failures",
    category: "Radio",
    description: "Number of radio link failures detected",
    unit: "count",
    technology: "4G/5G",
  },
  {
    id: "radio_004",
    name: "Handover Attempts",
    category: "Radio",
    description: "Total handover attempts performed",
    unit: "count",
    technology: "4G/5G",
  },
  {
    id: "radio_005",
    name: "Successful Handovers",
    category: "Radio",
    description: "Number of successful handovers",
    unit: "count",
    technology: "4G/5G",
  },

  // Traffic counters
  {
    id: "traffic_001",
    name: "Total Call Attempts",
    category: "Traffic",
    description: "Total number of call setup attempts",
    unit: "count",
  },
  {
    id: "traffic_002",
    name: "Successful Calls",
    category: "Traffic",
    description: "Number of successfully established calls",
    unit: "count",
  },
  {
    id: "traffic_003",
    name: "Call Drops",
    category: "Traffic",
    description: "Number of dropped calls",
    unit: "count",
  },
  {
    id: "traffic_004",
    name: "Data Sessions",
    category: "Traffic",
    description: "Total data sessions created",
    unit: "count",
  },
  {
    id: "traffic_005",
    name: "Data Bytes Transmitted",
    category: "Traffic",
    description: "Total bytes transmitted in data sessions",
    unit: "MB",
  },

  // Control plane counters
  {
    id: "cp_001",
    name: "S1 Setup Requests",
    category: "Control plane",
    description: "S1 interface setup requests",
    unit: "count",
    technology: "4G",
  },
  {
    id: "cp_002",
    name: "S1 Setup Failures",
    category: "Control plane",
    description: "S1 setup failures",
    unit: "count",
    technology: "4G",
  },
  {
    id: "cp_003",
    name: "X2 Handovers",
    category: "Control plane",
    description: "X2 interface handovers",
    unit: "count",
    technology: "4G",
  },
  {
    id: "cp_004",
    name: "GTP Tunnels Created",
    category: "Control plane",
    description: "GTP tunnels created for bearers",
    unit: "count",
  },

  // Transport counters
  {
    id: "transport_001",
    name: "Backhaul Packets Transmitted",
    category: "Transport",
    description: "Packets sent over backhaul link",
    unit: "count",
  },
  {
    id: "transport_002",
    name: "Backhaul Packets Received",
    category: "Transport",
    description: "Packets received on backhaul link",
    unit: "count",
  },
  {
    id: "transport_003",
    name: "Backhaul Bytes In",
    category: "Transport",
    description: "Bytes received on backhaul",
    unit: "MB",
  },
  {
    id: "transport_004",
    name: "Backhaul Bytes Out",
    category: "Transport",
    description: "Bytes transmitted on backhaul",
    unit: "MB",
  },
  {
    id: "transport_005",
    name: "Link Errors",
    category: "Transport",
    description: "Number of transmission errors detected",
    unit: "count",
  },
];

// Derived counters with formulas
export const DERIVED_COUNTERS: DerivedCounter[] = [
  {
    id: "derived_001",
    name: "Call Drop Rate (%)",
    description: "Percentage of calls that were dropped",
    category: "Traffic",
    formula: "(Call Drops / Total Call Attempts) × 100",
    formulaTree: {
      type: "operator",
      operator: "%",
      children: [
        {
          type: "operator",
          operator: "/",
          children: [
            { type: "counter", counterId: "traffic_003", counterName: "Call Drops" },
            { type: "counter", counterId: "traffic_001", counterName: "Total Call Attempts" },
          ],
        },
        { type: "number", value: 100 },
      ],
    },
    unit: "%",
  },
  {
    id: "derived_002",
    name: "RRC Setup Success Rate (%)",
    description: "Percentage of successful RRC connection setups",
    category: "Radio",
    formula: "(Successful RRC Setups / Total RRC Setup Attempts) × 100",
    formulaTree: {
      type: "operator",
      operator: "%",
      children: [
        {
          type: "operator",
          operator: "/",
          children: [
            { type: "counter", counterId: "radio_002", counterName: "Successful RRC Setups" },
            { type: "counter", counterId: "radio_001", counterName: "Total RRC Setup Attempts" },
          ],
        },
        { type: "number", value: 100 },
      ],
    },
    unit: "%",
  },
  {
    id: "derived_003",
    name: "Handover Success Rate (%)",
    description: "Percentage of successful handovers",
    category: "Radio",
    formula: "(Successful Handovers / Handover Attempts) × 100",
    formulaTree: {
      type: "operator",
      operator: "%",
      children: [
        {
          type: "operator",
          operator: "/",
          children: [
            { type: "counter", counterId: "radio_005", counterName: "Successful Handovers" },
            { type: "counter", counterId: "radio_004", counterName: "Handover Attempts" },
          ],
        },
        { type: "number", value: 100 },
      ],
    },
    unit: "%",
  },
  {
    id: "derived_004",
    name: "Call Success Rate (%)",
    description: "Percentage of calls successfully established",
    category: "Traffic",
    formula: "(Successful Calls / Total Call Attempts) × 100",
    formulaTree: {
      type: "operator",
      operator: "%",
      children: [
        {
          type: "operator",
          operator: "/",
          children: [
            { type: "counter", counterId: "traffic_002", counterName: "Successful Calls" },
            { type: "counter", counterId: "traffic_001", counterName: "Total Call Attempts" },
          ],
        },
        { type: "number", value: 100 },
      ],
    },
    unit: "%",
  },
  {
    id: "derived_005",
    name: "Radio Link Failure Rate (%)",
    description: "Percentage of radio link failures",
    category: "Radio",
    formula: "(Radio Link Failures / Total RRC Setup Attempts) × 100",
    formulaTree: {
      type: "operator",
      operator: "%",
      children: [
        {
          type: "operator",
          operator: "/",
          children: [
            { type: "counter", counterId: "radio_003", counterName: "Radio Link Failures" },
            { type: "counter", counterId: "radio_001", counterName: "Total RRC Setup Attempts" },
          ],
        },
        { type: "number", value: 100 },
      ],
    },
    unit: "%",
  },
];

/**
 * Filter counters by category
 */
export const getCountersByCategory = (category: CounterCategory): Counter[] => {
  return COUNTERS.filter((c) => c.category === category);
};

/**
 * Search counters
 */
export const searchCounters = (query: string): Counter[] => {
  const lower = query.toLowerCase();
  return COUNTERS.filter(
    (c) =>
      c.name.toLowerCase().includes(lower) ||
      c.description.toLowerCase().includes(lower) ||
      c.id.toLowerCase().includes(lower)
  );
};

/**
 * Get all counter categories
 */
export const getAllCategories = (): CounterCategory[] => {
  return ["Radio", "Traffic", "Control plane", "Transport"];
};

/**
 * Format formula tree as string
 */
export const formatFormulaTree = (node: FormulaNode): string => {
  if (node.type === "number") {
    return String(node.value);
  }
  if (node.type === "counter") {
    return node.counterName || node.counterId || "";
  }
  if (node.type === "operator" && node.children) {
    const parts = node.children.map((child) => formatFormulaTree(child)).join(` ${node.operator} `);
    return `(${parts})`;
  }
  return "";
};
