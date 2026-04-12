import { useMemo, useState, type ReactNode } from "react";
import {
  ChevronDown,
  ChevronRight,
  Download,
  Ellipsis,
  Filter,
  Pencil,
  Plus,
  Search,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

type TenantType = "Parent" | "Child";
type TenantStatus = "Active" | "Suspended";
type SecurityLevel = "High" | "Medium";

interface TenantRow {
  id: string;
  name: string;
  country: string;
  type: TenantType;
  status: TenantStatus;
  users: number;
  security: SecurityLevel;
  parentId: string | null;
}

interface SummaryState {
  totalTenants: number;
  parentTenants: number;
  childTenants: number;
  activeUsers: number;
  pendingRequests: number;
}

const INITIAL_SUMMARY: SummaryState = {
  totalTenants: 12,
  parentTenants: 4,
  childTenants: 8,
  activeUsers: 847,
  pendingRequests: 3,
};

const INITIAL_TENANTS: TenantRow[] = [
  { id: "tenant_group", name: "Telecom Group", country: "Global", type: "Parent", status: "Active", users: 847, security: "High", parentId: null },
  { id: "tenant_eg", name: "Egypt Operator", country: "Egypt", type: "Child", status: "Active", users: 312, security: "High", parentId: "tenant_group" },
  { id: "tenant_sa", name: "Saudi Operator", country: "Saudi Arabia", type: "Child", status: "Active", users: 210, security: "High", parentId: "tenant_group" },
  { id: "tenant_ms", name: "Managed Services", country: "Global", type: "Child", status: "Suspended", users: 145, security: "Medium", parentId: "tenant_group" },
  { id: "tenant_en", name: "Enterprise Networks", country: "Global", type: "Child", status: "Active", users: 180, security: "High", parentId: "tenant_group" },
];

export default function TenantOverview() {
  const [summary, setSummary] = useState(INITIAL_SUMMARY);
  const [rows, setRows] = useState<TenantRow[]>(INITIAL_TENANTS);
  const [selectedTenant, setSelectedTenant] = useState("Egypt Operator");
  const [expandedParents, setExpandedParents] = useState<Record<string, boolean>>({ tenant_group: true });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | TenantStatus>("All");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [menuFor, setMenuFor] = useState<string | null>(null);

  const [newTenant, setNewTenant] = useState({
    name: "",
    country: "",
    type: "Child" as TenantType,
    status: "Active" as TenantStatus,
    users: 50,
    security: "High" as SecurityLevel,
    parentId: "tenant_group",
  });

  const securityScore = useMemo(() => {
    const points = rows.reduce((acc, row) => acc + (row.security === "High" ? 99 : 95), 0);
    return `${(points / Math.max(rows.length, 1)).toFixed(1)}%`;
  }, [rows]);

  const parentRows = useMemo(() => rows.filter((row) => row.parentId === null), [rows]);

  const visibleHierarchy = useMemo(() => {
    const matches = (row: TenantRow) => {
      const searchMatch =
        search.trim().length === 0 ||
        row.name.toLowerCase().includes(search.toLowerCase()) ||
        row.country.toLowerCase().includes(search.toLowerCase());
      const statusMatch = statusFilter === "All" || row.status === statusFilter;
      return searchMatch && statusMatch;
    };

    const ordered: TenantRow[] = [];

    parentRows.forEach((parent) => {
      const children = rows.filter((row) => row.parentId === parent.id);
      const matchingChildren = children.filter(matches);
      const parentMatch = matches(parent);

      if (parentMatch || matchingChildren.length > 0) {
        ordered.push(parent);
      }

      if (expandedParents[parent.id]) {
        ordered.push(...matchingChildren);
      }
    });

    return ordered;
  }, [expandedParents, parentRows, rows, search, statusFilter]);

  const selectorOptions = useMemo(() => rows.map((row) => row.name), [rows]);

  const toggleParent = (parentId: string) => {
    setExpandedParents((prev) => ({ ...prev, [parentId]: !prev[parentId] }));
  };

  const handleCreateTenant = () => {
    if (!newTenant.name.trim()) return;

    const tenant: TenantRow = {
      id: `tenant_${Date.now()}`,
      name: newTenant.name.trim(),
      country: newTenant.country.trim() || "Global",
      type: newTenant.type,
      status: newTenant.status,
      users: Number(newTenant.users) || 0,
      security: newTenant.security,
      parentId: newTenant.type === "Parent" ? null : newTenant.parentId || "tenant_group",
    };

    setRows((prev) => [...prev, tenant]);
    setSummary((prev) => ({
      ...prev,
      totalTenants: prev.totalTenants + 1,
      parentTenants: tenant.type === "Parent" ? prev.parentTenants + 1 : prev.parentTenants,
      childTenants: tenant.type === "Child" ? prev.childTenants + 1 : prev.childTenants,
      activeUsers: tenant.status === "Active" ? prev.activeUsers + tenant.users : prev.activeUsers,
    }));

    if (tenant.parentId) {
      setExpandedParents((prev) => ({ ...prev, [tenant.parentId!]: true }));
    }

    setSelectedTenant(tenant.name);
    setShowCreateModal(false);
    setNewTenant({
      name: "",
      country: "",
      type: "Child",
      status: "Active",
      users: 50,
      security: "High",
      parentId: "tenant_group",
    });
  };

  const exportVisibleRows = () => {
    const header = ["Tenant Name", "Country", "Type", "Status", "Users", "Security"];
    const csvRows = visibleHierarchy.map((row) => [
      row.name,
      row.country,
      row.type,
      row.status,
      String(row.users),
      row.security,
    ]);

    const csv = [header, ...csvRows].map((line) => line.map((cell) => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "tenant-hierarchy.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-[220px]">
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Tenant</label>
            <select
              value={selectedTenant}
              onChange={(e) => setSelectedTenant(e.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              {selectorOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Create Tenant
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Tenants" value={String(summary.totalTenants)} subtext={`${summary.parentTenants} Parent · ${summary.childTenants} Child`} />
        <StatCard title="Active Users" value={String(summary.activeUsers)} subtext="Across all tenants" />
        <StatCard title="Security Score" value={securityScore} subtext="Compliance: Passed" />
        <StatCard title="Pending Requests" value={String(summary.pendingRequests)} subtext="Cross-tenant access" />
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-sm font-semibold text-foreground">Tenant Hierarchy</h3>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tenants"
                className="h-9 w-44 rounded-md border border-input bg-background pl-8 pr-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
            <button
              onClick={() => setStatusFilter((prev) => (prev === "All" ? "Active" : prev === "Active" ? "Suspended" : "All"))}
              className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-2.5 text-muted-foreground hover:text-foreground"
              title={`Filter: ${statusFilter}`}
            >
              <Filter className="h-4 w-4" />
            </button>
            <button
              onClick={exportVisibleRows}
              className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-2.5 text-muted-foreground hover:text-foreground"
              title="Export"
            >
              <Download className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-muted/40 text-muted-foreground">
              <tr>
                <th className="px-4 py-2.5 text-left text-xs font-semibold">Tenant Name</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold">Country</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold">Type</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold">Status</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold">Users</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold">Security</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleHierarchy.map((row) => {
                const isParent = row.parentId === null;
                const hasChildren = rows.some((item) => item.parentId === row.id);
                return (
                  <tr key={row.id} className="border-t border-border hover:bg-muted/20">
                    <td className="px-4 py-2.5">
                      <div className={cn("flex items-center gap-2", !isParent && "pl-6") }>
                        {isParent ? (
                          <button
                            onClick={() => hasChildren && toggleParent(row.id)}
                            className="rounded p-0.5 text-muted-foreground hover:bg-muted"
                          >
                            {expandedParents[row.id] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                          </button>
                        ) : (
                          <span className="h-4 w-4 text-muted-foreground">└</span>
                        )}
                        <span className="font-medium text-foreground">{row.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">{row.country}</td>
                    <td className="px-4 py-2.5">
                      <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", row.type === "Parent" ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground")}>
                        {row.type}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", row.status === "Active" ? "bg-green-500/15 text-green-700 dark:text-green-300" : "bg-amber-500/15 text-amber-700 dark:text-amber-300")}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">{row.users}</td>
                    <td className="px-4 py-2.5">
                      <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", row.security === "High" ? "bg-primary/15 text-primary" : "bg-amber-500/15 text-amber-700 dark:text-amber-300")}>{row.security}</span>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="relative flex items-center gap-1">
                        <button
                          onClick={() => {
                            const nextName = window.prompt("Edit tenant name", row.name);
                            if (!nextName || !nextName.trim()) return;
                            setRows((prev) => prev.map((item) => item.id === row.id ? { ...item, name: nextName.trim() } : item));
                          }}
                          className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setMenuFor((prev) => prev === row.id ? null : row.id)}
                          className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                          title="More"
                        >
                          <Ellipsis className="h-4 w-4" />
                        </button>
                        {menuFor === row.id && (
                          <div className="absolute right-0 top-8 z-20 w-32 rounded-md border border-border bg-popover p-1 shadow-lg">
                            <button className="block w-full rounded px-2 py-1.5 text-left text-xs hover:bg-muted">View details</button>
                            <button
                              onClick={() => {
                                setRows((prev) =>
                                  prev.map((item) =>
                                    item.id === row.id
                                      ? { ...item, status: item.status === "Active" ? "Suspended" : "Active" }
                                      : item
                                  )
                                );
                                setMenuFor(null);
                              }}
                              className="block w-full rounded px-2 py-1.5 text-left text-xs hover:bg-muted"
                            >
                              {row.status === "Active" ? "Suspend" : "Activate"}
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="border-t border-border px-4 py-2 text-xs text-muted-foreground">
          Showing {visibleHierarchy.length} of {summary.totalTenants} tenants
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl border border-border bg-card p-4 shadow-2xl">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-sm font-semibold">Create Tenant</h4>
              <button onClick={() => setShowCreateModal(false)} className="rounded p-1 hover:bg-muted"><X className="h-4 w-4" /></button>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <Field label="Tenant Name">
                <input value={newTenant.name} onChange={(e) => setNewTenant((p) => ({ ...p, name: e.target.value }))} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm" />
              </Field>
              <Field label="Country">
                <input value={newTenant.country} onChange={(e) => setNewTenant((p) => ({ ...p, country: e.target.value }))} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm" />
              </Field>
              <Field label="Type">
                <select value={newTenant.type} onChange={(e) => setNewTenant((p) => ({ ...p, type: e.target.value as TenantType }))} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                  <option value="Parent">Parent</option>
                  <option value="Child">Child</option>
                </select>
              </Field>
              <Field label="Status">
                <select value={newTenant.status} onChange={(e) => setNewTenant((p) => ({ ...p, status: e.target.value as TenantStatus }))} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                  <option value="Active">Active</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </Field>
              <Field label="Users">
                <input type="number" value={newTenant.users} onChange={(e) => setNewTenant((p) => ({ ...p, users: Number(e.target.value) }))} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm" />
              </Field>
              <Field label="Security">
                <select value={newTenant.security} onChange={(e) => setNewTenant((p) => ({ ...p, security: e.target.value as SecurityLevel }))} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                </select>
              </Field>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setShowCreateModal(false)} className="h-9 rounded-md border border-input px-3 text-sm">Cancel</button>
              <button onClick={handleCreateTenant} className="h-9 rounded-md bg-primary px-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90">Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, subtext }: { title: string; value: string; subtext: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
      <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{subtext}</p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
