import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Ban, CheckCircle2, ChevronDown, ChevronRight, Plus, UserCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  createRole,
  getRoleMatrix,
  getRoles,
  getScopes,
  patchModulePermissions,
  patchRoleMatrix,
  type PermissionAction,
  type PermissionEntry,
  type Role,
  type ScopeOption,
} from "@/services/accessControlRolesService";
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
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ACTIONS: PermissionAction[] = ["read", "create", "edit", "delete", "execute", "export"];
const PERMISSION_COLUMN_CLASS = "w-[84px] min-w-[84px] whitespace-nowrap break-normal [overflow-wrap:normal]";

type ActiveTab = "roles" | "matrix" | "scoped";

export default function RolesPermissions() {
  const { toast } = useToast();

  const [tab, setTab] = useState<ActiveTab>("roles");
  const [roles, setRoles] = useState<Role[]>([]);
  const [scopes, setScopes] = useState<ScopeOption[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const [selectedScopeId, setSelectedScopeId] = useState("all-regions");
  const [entries, setEntries] = useState<PermissionEntry[]>([]);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({
    dashboard: true,
    alarm: true,
    topology: true,
    command: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [roleName, setRoleName] = useState("");
  const [description, setDescription] = useState("");
  const [baseTemplate, setBaseTemplate] = useState("");
  const [initialScopeMode, setInitialScopeMode] = useState("all-regions");
  const [cloneFromRoleId, setCloneFromRoleId] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);

  const selectedRole = roles.find((r) => r.id === selectedRoleId);

  const moduleGroups = useMemo(() => {
    const grouped = new Map<string, { label: string; rows: PermissionEntry[] }>();
    entries.forEach((entry) => {
      if (!grouped.has(entry.moduleKey)) {
        grouped.set(entry.moduleKey, { label: entry.moduleLabel, rows: [] });
      }
      grouped.get(entry.moduleKey)!.rows.push(entry);
    });
    return Array.from(grouped.entries());
  }, [entries]);

  const scopeBreakdown = useMemo(() => {
    return scopes.map((scope) => ({
      scope,
      granted: entries.reduce((sum, entry) => sum + ACTIONS.filter((action) => entry.permissions[action]).length, 0),
      total: entries.length * ACTIONS.length,
    }));
  }, [entries, scopes]);

  const loadStatic = async () => {
    const [rolesData, scopesData] = await Promise.all([getRoles(), getScopes()]);
    setRoles(rolesData);
    setScopes(scopesData);
    if (!selectedRoleId && rolesData.length > 0) setSelectedRoleId(rolesData[0].id);
  };

  const loadMatrix = async (roleId: string, scopeId: string) => {
    setLoading(true);
    setError(null);
    try {
      const matrix = await getRoleMatrix(roleId, scopeId);
      setEntries(matrix.entries);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load permission matrix.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatic().catch(() => setError("Failed to load role metadata."));
  }, []);

  useEffect(() => {
    if (!selectedRoleId || !selectedScopeId) return;
    loadMatrix(selectedRoleId, selectedScopeId);
  }, [selectedRoleId, selectedScopeId]);

  const togglePermission = async (entry: PermissionEntry, action: PermissionAction) => {
    const oldEntries = entries;
    const nextEntries = entries.map((row) =>
      row.pageKey === entry.pageKey
        ? { ...row, permissions: { ...row.permissions, [action]: !row.permissions[action] } }
        : row
    );
    setEntries(nextEntries);

    try {
      await patchRoleMatrix({
        roleId: selectedRoleId,
        scopeId: selectedScopeId,
        pageKey: entry.pageKey,
        action,
        value: nextEntries.find((row) => row.pageKey === entry.pageKey)!.permissions[action],
      });
    } catch (err) {
      setEntries(oldEntries);
      toast({
        title: "Update failed",
        description: err instanceof Error ? err.message : "Permission change failed.",
        variant: "destructive",
      });
    }
  };

  const setModulePermissions = async (moduleKey: string, value: boolean) => {
    const oldEntries = entries;
    const nextEntries = entries.map((row) =>
      row.moduleKey === moduleKey
        ? {
            ...row,
            permissions: ACTIONS.reduce((acc, action) => {
              acc[action] = row.locked?.[action] ? row.permissions[action] : value;
              return acc;
            }, {} as Record<PermissionAction, boolean>),
          }
        : row
    );
    setEntries(nextEntries);

    try {
      await patchModulePermissions({ roleId: selectedRoleId, scopeId: selectedScopeId, moduleKey, value });
    } catch (err) {
      setEntries(oldEntries);
      toast({
        title: "Module update failed",
        description: err instanceof Error ? err.message : "Unable to apply module action.",
        variant: "destructive",
      });
    }
  };

  const submitCreateRole = async () => {
    setCreateError(null);
    if (!roleName.trim()) {
      setCreateError("Role Name is required.");
      return;
    }

    try {
      const role = await createRole({
        name: roleName,
        description,
        baseTemplate: baseTemplate || undefined,
        initialScopeMode,
        cloneFromRoleId: cloneFromRoleId || undefined,
      });
      const nextRoles = [...roles, role];
      setRoles(nextRoles);
      setSelectedRoleId(role.id);
      setCreateOpen(false);
      setRoleName("");
      setDescription("");
      setBaseTemplate("");
      setInitialScopeMode("all-regions");
      setCloneFromRoleId("");
      toast({ title: "Role created", description: `${role.name} was created successfully.` });
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Unable to create role.");
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCreateOpen(true)}
          className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Create Role
        </button>
      </div>

      <div className="rounded-xl border border-border bg-card p-2">
        <div className="flex items-center gap-1">
          <TabButton active={tab === "roles"} onClick={() => setTab("roles")}>Roles</TabButton>
          <TabButton active={tab === "matrix"} onClick={() => setTab("matrix")}>Permission Matrix</TabButton>
          <TabButton active={tab === "scoped"} onClick={() => setTab("scoped")}>Scoped Permissions</TabButton>
        </div>
      </div>

      {(tab === "roles" || tab === "matrix") && (
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-[280px_1fr]">
          <section className="rounded-xl border border-border bg-card p-3">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Roles</p>
            <div className="space-y-1">
              {roles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => setSelectedRoleId(role.id)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm transition",
                    selectedRoleId === role.id ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"
                  )}
                >
                  <UserCircle2 className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{role.name}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="flex flex-col gap-2 border-b border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-sm font-semibold">
                Permission Matrix: <span className="text-primary">{selectedRole?.name ?? "-"}</span>
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Scope:</span>
                <Select value={selectedScopeId} onValueChange={setSelectedScopeId}>
                  <SelectTrigger className="h-8 w-[170px] bg-background text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {scopes.map((scope) => (
                      <SelectItem key={scope.id} value={scope.id}>{scope.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {error && (
              <div className="m-3 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-700">
                {error}
                <button onClick={() => loadMatrix(selectedRoleId, selectedScopeId)} className="ml-2 underline">Retry</button>
              </div>
            )}

            {loading ? (
              <div className="space-y-2 p-4">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <div key={idx} className="h-8 animate-pulse rounded bg-muted/50" />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto overflow-y-visible">
                <table className="w-full min-w-[760px] table-fixed text-sm">
                  <colgroup>
                    <col />
                    {ACTIONS.map((action) => (
                      <col key={`col-${action}`} style={{ width: "84px" }} />
                    ))}
                  </colgroup>
                  <thead className="bg-muted/30 text-muted-foreground">
                    <tr>
                      <th className="min-w-[220px] px-3 py-2 text-left text-xs font-semibold whitespace-nowrap break-normal [overflow-wrap:normal]">Module / Page</th>
                      {ACTIONS.map((action) => (
                        <th key={action} className={cn("px-2 py-2 text-center text-xs font-semibold capitalize", PERMISSION_COLUMN_CLASS)}>{action}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {moduleGroups.map(([moduleKey, group]) => (
                      <ModuleSection
                        key={moduleKey}
                        moduleKey={moduleKey}
                        groupLabel={group.label}
                        rows={group.rows}
                        expanded={!!expandedModules[moduleKey]}
                        onToggleExpand={() => setExpandedModules((prev) => ({ ...prev, [moduleKey]: !prev[moduleKey] }))}
                        onGrantAll={() => setModulePermissions(moduleKey, true)}
                        onClearAll={() => setModulePermissions(moduleKey, false)}
                        onTogglePermission={togglePermission}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      )}

      {tab === "scoped" && (
        <section className="rounded-xl border border-border bg-card p-4">
          <h3 className="text-sm font-semibold">Scoped Permissions</h3>
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {scopeBreakdown.map(({ scope, granted, total }) => (
              <div key={scope.id} className="rounded-md border border-border bg-background p-3">
                <p className="text-sm font-semibold text-foreground">{scope.name}</p>
                <p className="text-xs text-muted-foreground">{scope.type}</p>
                <p className="mt-2 text-xs text-foreground">{granted} / {total} permissions granted</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Role</DialogTitle>
            <DialogDescription>Create a role and initialize matrix/scoping behavior.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Field label="Role Name *">
              <input value={roleName} onChange={(e) => setRoleName(e.target.value)} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm" />
            </Field>
            <Field label="Description">
              <input value={description} onChange={(e) => setDescription(e.target.value)} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm" />
            </Field>
            <Field label="Base Template">
              <Select value={baseTemplate || "none"} onValueChange={(value) => setBaseTemplate(value === "none" ? "" : value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="Operations Template">Operations Template</SelectItem>
                  <SelectItem value="Security Template">Security Template</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Initial Scope Mode">
              <Select value={initialScopeMode} onValueChange={setInitialScopeMode}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {scopes.map((scope) => (
                    <SelectItem key={scope.id} value={scope.id}>{scope.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Clone From Existing Role">
              <Select value={cloneFromRoleId || "none"} onValueChange={(value) => setCloneFromRoleId(value === "none" ? "" : value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            {createError && <p className="text-xs text-red-600">{createError}</p>}
          </div>
          <DialogFooter>
            <button onClick={() => setCreateOpen(false)} className="h-9 rounded-md border border-input px-3 text-sm">Cancel</button>
            <button onClick={submitCreateRole} className="h-9 rounded-md bg-primary px-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90">Create</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ModuleSection({
  moduleKey,
  groupLabel,
  rows,
  expanded,
  onToggleExpand,
  onGrantAll,
  onClearAll,
  onTogglePermission,
}: {
  moduleKey: string;
  groupLabel: string;
  rows: PermissionEntry[];
  expanded: boolean;
  onToggleExpand: () => void;
  onGrantAll: () => void;
  onClearAll: () => void;
  onTogglePermission: (entry: PermissionEntry, action: PermissionAction) => void;
}) {
  return (
    <>
      <tr className="bg-muted/35 border-t border-border">
        <td className="px-3 py-2">
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <button onClick={onToggleExpand} className="rounded p-0.5 hover:bg-muted">
              {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
            {groupLabel}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="ml-auto rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground whitespace-nowrap">Actions</button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onSelect={onGrantAll}>Grant All</DropdownMenuItem>
                <DropdownMenuItem onSelect={onClearAll}>Clear All</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </td>
        {ACTIONS.map((action) => (
          <td key={`${moduleKey}-${action}`} className={cn("px-2 py-2 text-center text-muted-foreground", PERMISSION_COLUMN_CLASS)}>—</td>
        ))}
      </tr>

      {expanded && rows.map((row) => (
        <tr key={row.pageKey} className="border-t border-border hover:bg-muted/20">
          <td className="px-3 py-2">
            <div className="pl-6 text-sm text-foreground">{row.pageLabel}</div>
          </td>
          {ACTIONS.map((action) => (
            <td key={`${row.pageKey}-${action}`} className={cn("px-2 py-2 text-center", PERMISSION_COLUMN_CLASS)}>
              <PermissionCell
                granted={row.permissions[action]}
                locked={!!row.locked?.[action]}
                ariaLabel={`${row.pageLabel} ${action} permission`}
                onToggle={() => onTogglePermission(row, action)}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

function PermissionCell({ granted, locked, ariaLabel, onToggle }: { granted: boolean; locked: boolean; ariaLabel: string; onToggle: () => void }) {
  return (
    <button
      aria-label={ariaLabel}
      onClick={onToggle}
      disabled={locked}
      className="inline-flex h-7 w-7 items-center justify-center rounded-md hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
    >
      {granted ? <CheckCircle2 className="h-4.5 w-4.5 text-green-600" /> : <Ban className="h-4.5 w-4.5 text-red-600" />}
    </button>
  );
}

function TabButton({ active, children, onClick }: { active: boolean; children: ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-md px-3 py-1.5 text-xs font-semibold",
        active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
      )}
    >
      {children}
    </button>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
