import { useMemo, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import { ChevronDown, ChevronRight, Download, EllipsisVertical, Filter, Pencil, Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type TenantType = "Parent" | "Child";
type TenantStatus = "Active" | "Suspended";
type SecurityLevel = "High" | "Medium";

type Tenant = {
  id: string;
  name: string;
  country: string;
  type: TenantType;
  status: TenantStatus;
  users: number;
  security: SecurityLevel;
  parentId: string | null;
};

type TenantDraft = {
  name: string;
  country: string;
  type: TenantType;
  status: TenantStatus;
  users: number;
  security: SecurityLevel;
  parentId: string;
};

const INITIAL_TENANTS: Tenant[] = [
  { id: "telecom-group", name: "Telecom Group", country: "Global", type: "Parent", status: "Active", users: 847, security: "High", parentId: null },
  { id: "egypt-operator", name: "Egypt Operator", country: "Egypt", type: "Child", status: "Active", users: 312, security: "High", parentId: "telecom-group" },
  { id: "saudi-operator", name: "Saudi Operator", country: "Saudi Arabia", type: "Child", status: "Active", users: 210, security: "High", parentId: "telecom-group" },
  { id: "managed-services", name: "Managed Services", country: "Global", type: "Child", status: "Suspended", users: 145, security: "Medium", parentId: "telecom-group" },
  { id: "enterprise-networks", name: "Enterprise Networks", country: "Global", type: "Child", status: "Active", users: 180, security: "High", parentId: "telecom-group" },
];

const EMPTY_DRAFT: TenantDraft = {
  name: "",
  country: "",
  type: "Child",
  status: "Active",
  users: 50,
  security: "High",
  parentId: "telecom-group",
};

export default function TenantOverview() {
  const [tenants, setTenants] = useState(INITIAL_TENANTS);
  const [selectedTenantId, setSelectedTenantId] = useState("egypt-operator");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ "telecom-group": true });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<Record<TenantStatus, boolean>>({ Active: true, Suspended: true });
  const [typeFilter, setTypeFilter] = useState<Record<TenantType, boolean>>({ Parent: true, Child: true });

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [draft, setDraft] = useState<TenantDraft>(EMPTY_DRAFT);
  const [editingTenantId, setEditingTenantId] = useState<string | null>(null);
  const [detailsTenantId, setDetailsTenantId] = useState<string | null>(null);

  const selectedTenant = useMemo(() => tenants.find((t) => t.id === selectedTenantId) ?? tenants[0], [selectedTenantId, tenants]);

  const contextTenantIds = useMemo(() => {
    if (!selectedTenant) return [];
    if (selectedTenant.parentId === null) {
      return tenants.filter((t) => t.id === selectedTenant.id || t.parentId === selectedTenant.id).map((t) => t.id);
    }
    return [selectedTenant.id];
  }, [selectedTenant, tenants]);

  const contextTenants = useMemo(
    () => tenants.filter((tenant) => contextTenantIds.includes(tenant.id)),
    [contextTenantIds, tenants]
  );

  const kpis = useMemo(() => {
    const parentCount = contextTenants.filter((t) => t.type === "Parent").length;
    const childCount = contextTenants.filter((t) => t.type === "Child").length;
    const activeUsers = contextTenants.filter((t) => t.status === "Active").reduce((sum, t) => sum + t.users, 0);
    const pendingRequests = Math.max(0, Math.round(childCount / 2));
    const securityPoints = contextTenants.reduce((sum, t) => sum + (t.security === "High" ? 99 : 95), 0);
    const score = contextTenants.length ? `${(securityPoints / contextTenants.length).toFixed(1)}%` : "0.0%";
    return {
      totalTenants: contextTenants.length,
      parentCount,
      childCount,
      activeUsers,
      pendingRequests,
      securityScore: score,
    };
  }, [contextTenants]);

  const filteredTenants = useMemo(() => {
    const text = search.toLowerCase().trim();
    return contextTenants.filter((tenant) => {
      const matchesText =
        text.length === 0 ||
        tenant.name.toLowerCase().includes(text) ||
        tenant.country.toLowerCase().includes(text) ||
        tenant.type.toLowerCase().includes(text);
      const matchesStatus = statusFilter[tenant.status];
      const matchesType = typeFilter[tenant.type];
      return matchesText && matchesStatus && matchesType;
    });
  }, [contextTenants, search, statusFilter, typeFilter]);

  const tableRows = useMemo(() => {
    const rows: Tenant[] = [];
    const parents = filteredTenants.filter((t) => t.parentId === null);

    if (parents.length === 0) {
      return filteredTenants;
    }

    parents.forEach((parent) => {
      rows.push(parent);
      if (expanded[parent.id]) {
        rows.push(...filteredTenants.filter((t) => t.parentId === parent.id));
      }
    });

    return rows;
  }, [expanded, filteredTenants]);

  const handleCreate = () => {
    if (!draft.name.trim()) return;
    const newTenant: Tenant = {
      id: `${draft.name.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`,
      name: draft.name.trim(),
      country: draft.country.trim() || "Global",
      type: draft.type,
      status: draft.status,
      users: Number(draft.users) || 0,
      security: draft.security,
      parentId: draft.type === "Parent" ? null : draft.parentId,
    };

    setTenants((prev) => [...prev, newTenant]);
    if (newTenant.parentId) setExpanded((prev) => ({ ...prev, [newTenant.parentId]: true }));
    setCreateOpen(false);
    setDraft(EMPTY_DRAFT);
  };

  const handleOpenEdit = (tenant: Tenant) => {
    setEditingTenantId(tenant.id);
    setDraft({
      name: tenant.name,
      country: tenant.country,
      type: tenant.type,
      status: tenant.status,
      users: tenant.users,
      security: tenant.security,
      parentId: tenant.parentId ?? "telecom-group",
    });
    setEditOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingTenantId) return;
    setTenants((prev) =>
      prev.map((tenant) =>
        tenant.id === editingTenantId
          ? {
              ...tenant,
              name: draft.name.trim() || tenant.name,
              country: draft.country.trim() || tenant.country,
              type: draft.type,
              status: draft.status,
              users: Number(draft.users) || tenant.users,
              security: draft.security,
              parentId: draft.type === "Parent" ? null : draft.parentId,
            }
          : tenant
      )
    );
    setEditOpen(false);
    setEditingTenantId(null);
    setDraft(EMPTY_DRAFT);
  };

  const handleRowAction = (tenant: Tenant, action: "toggle" | "delete" | "details") => {
    if (action === "toggle") {
      setTenants((prev) => prev.map((row) => (row.id === tenant.id ? { ...row, status: row.status === "Active" ? "Suspended" : "Active" } : row)));
      return;
    }

    if (action === "delete") {
      setTenants((prev) => prev.filter((row) => row.id !== tenant.id));
      return;
    }

    setDetailsTenantId(tenant.id);
    setDetailsOpen(true);
  };

  const exportCsv = () => {
    const header = ["Tenant Name", "Country", "Type", "Status", "Users", "Security"];
    const body = tableRows.map((row) => [row.name, row.country, row.type, row.status, `${row.users}`, row.security]);
    const csv = [header, ...body].map((line) => line.map((cell) => `"${cell}"`).join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "tenant-overview.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const detailsTenant = tenants.find((t) => t.id === detailsTenantId) ?? null;
  const parentOptions = tenants.filter((t) => t.parentId === null);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="w-full max-w-xs">
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Tenant</label>
            <Select value={selectedTenantId} onValueChange={setSelectedTenantId}>
              <SelectTrigger className="w-full bg-background">
                <SelectValue placeholder="Select tenant" />
              </SelectTrigger>
              <SelectContent>
                {tenants.map((tenant) => (
                  <SelectItem key={tenant.id} value={tenant.id}>
                    {tenant.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <button
            onClick={() => {
              setDraft(EMPTY_DRAFT);
              setCreateOpen(true);
            }}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Create Tenant
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard title="Total Tenants" value={`${kpis.totalTenants}`} subtext={`${kpis.parentCount} Parent · ${kpis.childCount} Child`} />
        <KpiCard title="Active Users" value={`${kpis.activeUsers}`} subtext="Across all tenants" />
        <KpiCard title="Security Score" value={kpis.securityScore} subtext="Compliance: Passed" />
        <KpiCard title="Pending Requests" value={`${kpis.pendingRequests}`} subtext="Cross-tenant access" />
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

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-2.5 text-muted-foreground hover:text-foreground">
                  <Filter className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filter Status</DropdownMenuLabel>
                <DropdownMenuCheckboxItem checked={statusFilter.Active} onCheckedChange={(checked) => setStatusFilter((prev) => ({ ...prev, Active: !!checked }))}>
                  Active
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem checked={statusFilter.Suspended} onCheckedChange={(checked) => setStatusFilter((prev) => ({ ...prev, Suspended: !!checked }))}>
                  Suspended
                </DropdownMenuCheckboxItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Filter Type</DropdownMenuLabel>
                <DropdownMenuCheckboxItem checked={typeFilter.Parent} onCheckedChange={(checked) => setTypeFilter((prev) => ({ ...prev, Parent: !!checked }))}>
                  Parent
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem checked={typeFilter.Child} onCheckedChange={(checked) => setTypeFilter((prev) => ({ ...prev, Child: !!checked }))}>
                  Child
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <button
              onClick={exportCsv}
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
              {tableRows.map((tenant) => {
                const isParent = tenant.parentId === null;
                const hasChildren = filteredTenants.some((row) => row.parentId === tenant.id);
                return (
                  <tr key={tenant.id} className="border-t border-border hover:bg-muted/20">
                    <td className="px-4 py-2.5">
                      <div className={cn("flex items-center gap-2", !isParent && "pl-6")}>
                        {isParent ? (
                          <button onClick={() => hasChildren && setExpanded((prev) => ({ ...prev, [tenant.id]: !prev[tenant.id] }))} className="rounded p-0.5 text-muted-foreground hover:bg-muted">
                            {expanded[tenant.id] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                          </button>
                        ) : (
                          <span className="h-4 w-4 text-muted-foreground">└</span>
                        )}
                        <span className="font-medium text-foreground">{tenant.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">{tenant.country}</td>
                    <td className="px-4 py-2.5">
                      <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", tenant.type === "Parent" ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground")}>
                        {tenant.type}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", tenant.status === "Active" ? "bg-green-500/15 text-green-700 dark:text-green-300" : "bg-amber-500/15 text-amber-700 dark:text-amber-300")}>
                        {tenant.status}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">{tenant.users}</td>
                    <td className="px-4 py-2.5">
                      <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", tenant.security === "High" ? "bg-primary/15 text-primary" : "bg-amber-500/15 text-amber-700 dark:text-amber-300")}>
                        {tenant.security}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleOpenEdit(tenant)} className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground" title="Edit">
                          <Pencil className="h-4 w-4" />
                        </button>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground" title="More actions">
                              <EllipsisVertical className="h-4 w-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onSelect={() => handleRowAction(tenant, "details")}>View Details</DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => handleRowAction(tenant, "toggle")}>{tenant.status === "Active" ? "Suspend" : "Activate"}</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onSelect={() => handleRowAction(tenant, "delete")}>Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="border-t border-border px-4 py-2 text-xs text-muted-foreground">Showing {tableRows.length} of {kpis.totalTenants} tenants</div>
      </div>

      <TenantDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="Create Tenant"
        description="Add a tenant to the hierarchy."
        draft={draft}
        setDraft={setDraft}
        parentOptions={parentOptions}
        onSubmit={handleCreate}
      />

      <TenantDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        title="Edit Tenant"
        description="Update tenant details."
        draft={draft}
        setDraft={setDraft}
        parentOptions={parentOptions}
        onSubmit={handleSaveEdit}
      />

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tenant Details</DialogTitle>
            <DialogDescription>Read-only tenant summary.</DialogDescription>
          </DialogHeader>
          {detailsTenant && (
            <div className="space-y-2 text-sm">
              <p><span className="text-muted-foreground">Name:</span> {detailsTenant.name}</p>
              <p><span className="text-muted-foreground">Country:</span> {detailsTenant.country}</p>
              <p><span className="text-muted-foreground">Type:</span> {detailsTenant.type}</p>
              <p><span className="text-muted-foreground">Status:</span> {detailsTenant.status}</p>
              <p><span className="text-muted-foreground">Users:</span> {detailsTenant.users}</p>
              <p><span className="text-muted-foreground">Security:</span> {detailsTenant.security}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function KpiCard({ title, value, subtext }: { title: string; value: string; subtext: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
      <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{subtext}</p>
    </div>
  );
}

function TenantDialog({
  open,
  onOpenChange,
  title,
  description,
  draft,
  setDraft,
  parentOptions,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  draft: TenantDraft;
  setDraft: Dispatch<SetStateAction<TenantDraft>>;
  parentOptions: Tenant[];
  onSubmit: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Field label="Tenant Name">
            <input value={draft.name} onChange={(e) => setDraft((prev) => ({ ...prev, name: e.target.value }))} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm" />
          </Field>
          <Field label="Country">
            <input value={draft.country} onChange={(e) => setDraft((prev) => ({ ...prev, country: e.target.value }))} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm" />
          </Field>
          <Field label="Type">
            <Select value={draft.type} onValueChange={(value) => setDraft((prev) => ({ ...prev, type: value as TenantType }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Parent">Parent</SelectItem>
                <SelectItem value="Child">Child</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Status">
            <Select value={draft.status} onValueChange={(value) => setDraft((prev) => ({ ...prev, status: value as TenantStatus }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Users">
            <input type="number" value={draft.users} onChange={(e) => setDraft((prev) => ({ ...prev, users: Number(e.target.value) || 0 }))} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm" />
          </Field>
          <Field label="Security">
            <Select value={draft.security} onValueChange={(value) => setDraft((prev) => ({ ...prev, security: value as SecurityLevel }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          {draft.type === "Child" && (
            <Field label="Parent Tenant">
              <Select value={draft.parentId} onValueChange={(value) => setDraft((prev) => ({ ...prev, parentId: value }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {parentOptions.map((tenant) => (
                    <SelectItem key={tenant.id} value={tenant.id}>{tenant.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          )}
        </div>
        <DialogFooter>
          <button onClick={() => onOpenChange(false)} className="h-9 rounded-md border border-input px-3 text-sm">Cancel</button>
          <button onClick={onSubmit} className="h-9 rounded-md bg-primary px-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90">Save</button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
