import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Ban, CheckCircle2, ChevronDown, ChevronRight, Loader2, Plus, UserCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  createRole,
  getRoleMatrix,
  getRoles,
  getScopes,
  patchRoleMatrix,
  type PermissionAction,
  type PermissionEntry,
  type Role,
  type ScopeOption,
} from "@/services/accessControlRolesService";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const ACTIONS: PermissionAction[] = ["read", "create", "edit", "delete", "execute", "export"];
const PERMISSION_COLUMN_CLASS = "w-[84px] min-w-[84px] whitespace-nowrap break-normal [overflow-wrap:normal]";

export default function RolesPermissions() {
  const { toast } = useToast();

  const [roles, setRoles] = useState<Role[]>([]);
  const [scopes, setScopes] = useState<ScopeOption[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const [selectedScopeId, setSelectedScopeId] = useState("all-regions");
  const [savedEntries, setSavedEntries] = useState<PermissionEntry[]>([]);
  const [entries, setEntries] = useState<PermissionEntry[]>([]);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({
    dashboard: true,
    alarm: true,
    topology: true,
    command: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
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
      grouped.get(entry.moduleKey)?.rows.push(entry);
    });
    return Array.from(grouped.entries());
  }, [entries]);

  const isDirty = useMemo(() => JSON.stringify(entries) !== JSON.stringify(savedEntries), [entries, savedEntries]);

  const loadStatic = async () => {
    const [rolesData, scopesData] = await Promise.all([getRoles(), getScopes()]);
    const cleanedRoles = rolesData.filter((role) => role.name.trim().toLowerCase() !== "test");
    setRoles(cleanedRoles);
    setScopes(scopesData);
    if (!selectedRoleId && cleanedRoles.length > 0) setSelectedRoleId(cleanedRoles[0].id);
  };

  const loadMatrix = async (roleId: string, scopeId: string) => {
    setLoading(true);
    setError(null);
    try {
      const matrix = await getRoleMatrix(roleId, scopeId);
      setEntries(matrix.entries);
      setSavedEntries(matrix.entries);
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

  const togglePermission = (entry: PermissionEntry, action: PermissionAction) => {
    setEntries((prev) =>
      prev.map((row) =>
        row.pageKey === entry.pageKey ? { ...row, permissions: { ...row.permissions, [action]: !row.permissions[action] } } : row,
      ),
    );
  };

  const setModulePermissions = (moduleKey: string, value: boolean) => {
    setEntries((prev) =>
      prev.map((row) =>
        row.moduleKey === moduleKey
          ? {
              ...row,
              permissions: ACTIONS.reduce((acc, action) => {
                acc[action] = row.locked?.[action] ? row.permissions[action] : value;
                return acc;
              }, {} as Record<PermissionAction, boolean>),
            }
          : row,
      ),
    );
  };

  const savePermissionChanges = async () => {
    if (!selectedRoleId || !selectedScopeId || !isDirty || saving) return;
    setSaving(true);

    try {
      const prevByPage = new Map(savedEntries.map((entry) => [entry.pageKey, entry]));
      const changedCalls: Array<Promise<unknown>> = [];

      entries.forEach((entry) => {
        const prev = prevByPage.get(entry.pageKey);
        if (!prev) return;
        ACTIONS.forEach((action) => {
          if (prev.permissions[action] !== entry.permissions[action]) {
            changedCalls.push(
              patchRoleMatrix({
                roleId: selectedRoleId,
                scopeId: selectedScopeId,
                pageKey: entry.pageKey,
                action,
                value: entry.permissions[action],
              }),
            );
          }
        });
      });

      await Promise.all(changedCalls);
      setSavedEntries(entries);
      toast({ title: "Permissions saved", description: "Role permission changes were saved successfully." });
    } catch (err) {
      setEntries(savedEntries);
      toast({
        title: "Save failed",
        description: err instanceof Error ? err.message : "Unable to save permission changes.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const submitCreateRole = async () => {
    if (isCreating) return;
    setCreateError(null);
    if (!roleName.trim()) {
      setCreateError("Role Name is required.");
      return;
    }

    setIsCreating(true);
    try {
      const role = await createRole({
        name: roleName,
        description,
        baseTemplate: baseTemplate || undefined,
        initialScopeMode,
        cloneFromRoleId: cloneFromRoleId || undefined,
      });
      setRoles((prev) => [...prev, role]);
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
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Button onClick={() => setCreateOpen(true)} className="h-9">
          <Plus className="h-4 w-4" />
          Create Role
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-[280px_1fr]">
        <section className="flex min-h-0 flex-col rounded-xl border border-border bg-card p-3">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Roles</p>
          <div className="max-h-[640px] space-y-1 overflow-y-auto pr-1">
            {roles.map((role) => (
              <button
                key={role.id}
                onClick={() => setSelectedRoleId(role.id)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm transition",
                  selectedRoleId === role.id ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted",
                )}
              >
                <UserCircle2 className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{role.name}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-3">
            <h3 className="mr-auto text-sm font-semibold">
              Permission Matrix: <span className="text-primary">{selectedRole?.name ?? "-"}</span>
            </h3>
            <span className="text-xs text-muted-foreground">Scope:</span>
            <Select value={selectedScopeId} onValueChange={setSelectedScopeId}>
              <SelectTrigger className="h-8 w-[170px] bg-background text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {scopes.map((scope) => (
                  <SelectItem key={scope.id} value={scope.id}>{scope.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={() => setEntries(savedEntries)} disabled={!isDirty || saving}>Revert</Button>
            <Button size="sm" onClick={savePermissionChanges} disabled={!isDirty || saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Save Changes
            </Button>
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
                    <th className="min-w-[220px] px-3 py-2 text-left text-xs font-semibold whitespace-nowrap">Module / Page</th>
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

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Role</DialogTitle>
            <DialogDescription>Create a role and initialize matrix/scoping behavior.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Field label="Role Name *">
              <Input value={roleName} onChange={(e) => setRoleName(e.target.value)} className="h-9" />
            </Field>
            <Field label="Description">
              <Input value={description} onChange={(e) => setDescription(e.target.value)} className="h-9" />
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
            <Button variant="outline" onClick={() => setCreateOpen(false)} className="h-9" disabled={isCreating}>Cancel</Button>
            <Button onClick={submitCreateRole} className="h-9" disabled={isCreating}>
              {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Create
            </Button>
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
            <button type="button" className="ml-auto rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground" onClick={onGrantAll}>Grant All</button>
            <button type="button" className="rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground" onClick={onClearAll}>Clear All</button>
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

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
