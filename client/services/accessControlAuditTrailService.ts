export type AuditTrailTab =
  | "all"
  | "access_denied"
  | "privilege_elevation"
  | "cross_tenant"
  | "tenant_changes";

export type AuditSeverity = "info" | "warning" | "critical";

export type AuditResultType = "Active" | "Denied" | "Elevated" | "X-Tenant";

export type AuditEvent = {
  id: string;
  timestamp: string;
  user: string;
  tenant: string;
  action: string;
  module: string;
  result: AuditResultType;
  category: AuditTrailTab;
  severity: AuditSeverity;
  tenantId?: string;
  userId?: string;
  details?: string;
  metadata?: Record<string, unknown>;
};

export type AuditTrailFilters = {
  tab: AuditTrailTab;
  query: string;
  dateRange: string;
  tenantScope: string;
  severity: string;
  page: number;
  pageSize: number;
};

const STORAGE_KEY = "access_control_audit_trail_v1";

function delay(ms = 180) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const baseEvents: AuditEvent[] = [
  {
    id: "evt-1",
    timestamp: "2026-04-11T10:02:00.000Z",
    user: "Alaa Hassan",
    tenant: "Egypt Ops",
    action: "Modified alarm threshold parameter",
    module: "Alarm Management",
    result: "Active",
    category: "tenant_changes",
    severity: "info",
    details: "Updated KPI threshold from 85 to 92 for Cairo-North cluster.",
    metadata: { previousThreshold: 85, nextThreshold: 92, cluster: "Cairo-North" },
  },
  {
    id: "evt-2",
    timestamp: "2026-04-11T09:35:00.000Z",
    user: "Reem Khaled",
    tenant: "KSA Ops",
    action: "Attempted to delete automation rule",
    module: "Automation",
    result: "Denied",
    category: "access_denied",
    severity: "critical",
    details: "Denied by SoD policy: creator cannot delete active production policy.",
    metadata: { policy: "sod_creator_delete_guard", reason: "separation_of_duties" },
  },
  {
    id: "evt-3",
    timestamp: "2026-04-11T08:20:00.000Z",
    user: "Nour Samir",
    tenant: "Telecom Group",
    action: "JIT elevation: Admin access granted (2h)",
    module: "Access Control",
    result: "Elevated",
    category: "privilege_elevation",
    severity: "warning",
    details: "Temporary admin elevation approved for incident INC-4421.",
    metadata: { duration: "2h", ticket: "INC-4421", approvedBy: "Security Officer" },
  },
  {
    id: "evt-4",
    timestamp: "2026-04-10T16:55:00.000Z",
    user: "Mona Adel",
    tenant: "Telecom Group",
    action: "Cross-tenant read access to Egypt KPIs",
    module: "Analytics",
    result: "X-Tenant",
    category: "cross_tenant",
    severity: "info",
    details: "Read-only data access approved for executive analysis window.",
    metadata: { sourceTenant: "Egypt Ops", targetTenant: "Telecom Group" },
  },
  {
    id: "evt-5",
    timestamp: "2026-04-10T15:20:00.000Z",
    user: "System",
    tenant: "Telecom Group",
    action: "Auto-expired JIT session",
    module: "Access Control",
    result: "Active",
    category: "privilege_elevation",
    severity: "info",
    details: "JIT session expired after policy window elapsed.",
    metadata: { sessionId: "jit-9988", expiry: "2026-04-10T15:20:00.000Z" },
  },
];

function generateEvents(): AuditEvent[] {
  const events: AuditEvent[] = [];
  const now = Date.now();
  for (let i = 0; i < 300; i += 1) {
    const source = baseEvents[i % baseEvents.length];
    events.push({
      ...source,
      id: `${source.id}-${i}`,
      timestamp: new Date(now - i * 60 * 60 * 1000).toISOString(),
    });
  }
  return events;
}

function loadEvents(): AuditEvent[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const generated = generateEvents();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(generated));
    return generated;
  }

  try {
    const parsed = JSON.parse(raw) as AuditEvent[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : generateEvents();
  } catch {
    return generateEvents();
  }
}

function applyDateRange(events: AuditEvent[], range: string): AuditEvent[] {
  const days = range === "Last 24 Hours" ? 1 : range === "Last 30 Days" ? 30 : 7;
  const threshold = Date.now() - days * 24 * 60 * 60 * 1000;
  return events.filter((event) => new Date(event.timestamp).getTime() >= threshold);
}

export async function getAuditTrail(filters: AuditTrailFilters): Promise<{ events: AuditEvent[]; total: number }> {
  await delay();
  let events = loadEvents();

  events = events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  if (filters.tab !== "all") {
    events = events.filter((event) => event.category === filters.tab);
  }

  if (filters.query.trim()) {
    const q = filters.query.toLowerCase();
    events = events.filter((event) =>
      [event.user, event.tenant, event.action, event.module].join(" ").toLowerCase().includes(q)
    );
  }

  events = applyDateRange(events, filters.dateRange);

  if (filters.tenantScope !== "All Tenants") {
    events = events.filter((event) => event.tenant === filters.tenantScope);
  }

  if (filters.severity !== "All Severity") {
    events = events.filter((event) => event.severity === filters.severity.toLowerCase());
  }

  const total = events.length;
  const start = (filters.page - 1) * filters.pageSize;
  const end = start + filters.pageSize;
  return { events: events.slice(start, end), total };
}

export async function getAuditEventById(id: string): Promise<AuditEvent> {
  await delay();
  const found = loadEvents().find((event) => event.id === id);
  if (!found) throw new Error("Audit event not found.");
  return found;
}

export async function exportAuditTrail(filters: AuditTrailFilters): Promise<string> {
  const { events } = await getAuditTrail({ ...filters, page: 1, pageSize: 5000 });
  const header = ["Timestamp", "User", "Tenant", "Action", "Module", "Result", "Severity"];
  const rows = events.map((event) => [
    event.timestamp,
    event.user,
    event.tenant,
    event.action,
    event.module,
    event.result,
    event.severity,
  ]);
  return [header, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
}
