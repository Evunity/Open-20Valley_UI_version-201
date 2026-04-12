export type PermissionAction = "read" | "create" | "edit" | "delete" | "execute" | "export";

export type Role = { id: string; name: string; description?: string; isSystemRole: boolean };
export type ScopeOption = { id: string; name: string; type: "global" | "region" | "tenant" | "custom" };

export type PermissionEntry = {
  moduleKey: string;
  moduleLabel: string;
  pageKey: string;
  pageLabel: string;
  permissions: Record<PermissionAction, boolean>;
  inherited?: boolean;
  locked?: Partial<Record<PermissionAction, boolean>>;
};

export type RolePermissionMatrix = {
  roleId: string;
  scopeId: string;
  entries: PermissionEntry[];
};

const STORAGE_KEY = "access_control_roles_store_v1";
const ACTIONS: PermissionAction[] = ["read", "create", "edit", "delete", "execute", "export"];

type Store = {
  roles: Role[];
  scopes: ScopeOption[];
  matrices: RolePermissionMatrix[];
};

const DEFAULT_ROLES: Role[] = [
  { id: "platform-admin", name: "Platform Admin", description: "Full platform control", isSystemRole: true },
  { id: "rf-engineer", name: "RF Engineer", description: "RAN engineering operations", isSystemRole: false },
  { id: "noc-operator", name: "NOC Operator", description: "NOC alarm and command operations", isSystemRole: false },
  { id: "viewer", name: "Viewer", description: "Read-only monitoring", isSystemRole: true },
  { id: "group-executive", name: "Group Executive", description: "Cross-tenant executive insights", isSystemRole: false },
];

const DEFAULT_SCOPES: ScopeOption[] = [
  { id: "all-regions", name: "All Regions", type: "global" },
  { id: "north-region", name: "North Region", type: "region" },
  { id: "south-region", name: "South Region", type: "region" },
  { id: "egypt-ops", name: "Egypt Ops", type: "tenant" },
  { id: "ksa-ops", name: "KSA Ops", type: "tenant" },
];

const ENTRY_BLUEPRINT: Array<Pick<PermissionEntry, "moduleKey" | "moduleLabel" | "pageKey" | "pageLabel">> = [
  { moduleKey: "dashboard", moduleLabel: "Dashboard", pageKey: "overview", pageLabel: "Overview" },
  { moduleKey: "alarm", moduleLabel: "Alarm Management", pageKey: "view-alarms", pageLabel: "View Alarms" },
  { moduleKey: "alarm", moduleLabel: "Alarm Management", pageKey: "clear-alarms", pageLabel: "Clear Alarms" },
  { moduleKey: "topology", moduleLabel: "Topology & Network", pageKey: "map-view", pageLabel: "Map View" },
  { moduleKey: "topology", moduleLabel: "Topology & Network", pageKey: "rack-view", pageLabel: "Rack View" },
  { moduleKey: "command", moduleLabel: "Command Center", pageKey: "execute-scripts", pageLabel: "Execute Scripts" },
  { moduleKey: "command", moduleLabel: "Command Center", pageKey: "bulk-operations", pageLabel: "Bulk Operations" },
];

function delay(ms = 180) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildPermissions(roleId: string, pageKey: string): Record<PermissionAction, boolean> {
  if (roleId === "platform-admin") {
    return { read: true, create: true, edit: true, delete: true, execute: true, export: true };
  }

  if (roleId === "viewer") {
    return { read: true, create: false, edit: false, delete: false, execute: false, export: true };
  }

  if (roleId === "group-executive") {
    return { read: true, create: false, edit: false, delete: false, execute: false, export: true };
  }

  if (roleId === "rf-engineer") {
    return {
      read: true,
      create: ["execute-scripts", "bulk-operations"].includes(pageKey),
      edit: ["map-view", "rack-view", "execute-scripts"].includes(pageKey),
      delete: false,
      execute: ["execute-scripts", "bulk-operations"].includes(pageKey),
      export: ["overview", "view-alarms"].includes(pageKey),
    };
  }

  return {
    read: true,
    create: ["clear-alarms"].includes(pageKey),
    edit: ["clear-alarms"].includes(pageKey),
    delete: false,
    execute: ["clear-alarms", "execute-scripts"].includes(pageKey),
    export: ["view-alarms", "overview"].includes(pageKey),
  };
}

function defaultEntriesForRole(roleId: string): PermissionEntry[] {
  return ENTRY_BLUEPRINT.map((entry) => ({
    ...entry,
    permissions: buildPermissions(roleId, entry.pageKey),
    locked: roleId === "viewer" ? { create: true, edit: true, delete: true, execute: true } : undefined,
  }));
}

function buildDefaultStore(): Store {
  const matrices: RolePermissionMatrix[] = [];
  DEFAULT_ROLES.forEach((role) => {
    DEFAULT_SCOPES.forEach((scope) => {
      matrices.push({ roleId: role.id, scopeId: scope.id, entries: defaultEntriesForRole(role.id) });
    });
  });

  return {
    roles: DEFAULT_ROLES,
    scopes: DEFAULT_SCOPES,
    matrices,
  };
}

function loadStore(): Store {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return buildDefaultStore();
  try {
    const parsed = JSON.parse(raw) as Store;
    if (!parsed.roles?.length || !parsed.scopes?.length || !parsed.matrices?.length) return buildDefaultStore();
    return parsed;
  } catch {
    return buildDefaultStore();
  }
}

function saveStore(store: Store) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export async function getRoles(): Promise<Role[]> {
  await delay();
  return loadStore().roles;
}

export async function getScopes(): Promise<ScopeOption[]> {
  await delay();
  return loadStore().scopes;
}

export async function getRoleMatrix(roleId: string, scopeId: string): Promise<RolePermissionMatrix> {
  await delay();
  const store = loadStore();
  const found = store.matrices.find((m) => m.roleId === roleId && m.scopeId === scopeId);
  if (found) return found;

  const generated = { roleId, scopeId, entries: defaultEntriesForRole(roleId) };
  store.matrices.push(generated);
  saveStore(store);
  return generated;
}

export async function createRole(payload: {
  name: string;
  description?: string;
  baseTemplate?: string;
  initialScopeMode?: string;
  cloneFromRoleId?: string;
}): Promise<Role> {
  await delay();
  const store = loadStore();
  const name = payload.name.trim();
  if (!name) throw new Error("Role Name is required.");
  if (store.roles.some((role) => role.name.toLowerCase() === name.toLowerCase())) {
    throw new Error("Role name already exists.");
  }

  const roleId = `${name.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`;
  const newRole: Role = {
    id: roleId,
    name,
    description: payload.description?.trim() || payload.baseTemplate || payload.initialScopeMode || "Custom role",
    isSystemRole: false,
  };
  store.roles.push(newRole);

  store.scopes.forEach((scope) => {
    const sourceMatrix = payload.cloneFromRoleId
      ? store.matrices.find((m) => m.roleId === payload.cloneFromRoleId && m.scopeId === scope.id)
      : undefined;

    store.matrices.push({
      roleId,
      scopeId: scope.id,
      entries: sourceMatrix ? sourceMatrix.entries.map((entry) => ({ ...entry, permissions: { ...entry.permissions } })) : defaultEntriesForRole(roleId),
    });
  });

  saveStore(store);
  return newRole;
}

export async function patchRoleMatrix(payload: {
  roleId: string;
  scopeId: string;
  pageKey: string;
  action: PermissionAction;
  value: boolean;
}): Promise<RolePermissionMatrix> {
  await delay();
  const store = loadStore();
  const matrix = store.matrices.find((m) => m.roleId === payload.roleId && m.scopeId === payload.scopeId);
  if (!matrix) throw new Error("Matrix not found.");

  const entry = matrix.entries.find((row) => row.pageKey === payload.pageKey);
  if (!entry) throw new Error("Permission entry not found.");
  if (entry.locked?.[payload.action]) {
    throw new Error("This permission is locked by policy.");
  }

  entry.permissions[payload.action] = payload.value;
  saveStore(store);
  return matrix;
}

export async function patchModulePermissions(payload: {
  roleId: string;
  scopeId: string;
  moduleKey: string;
  value: boolean;
}): Promise<RolePermissionMatrix> {
  await delay();
  const store = loadStore();
  const matrix = store.matrices.find((m) => m.roleId === payload.roleId && m.scopeId === payload.scopeId);
  if (!matrix) throw new Error("Matrix not found.");

  matrix.entries
    .filter((entry) => entry.moduleKey === payload.moduleKey)
    .forEach((entry) => {
      ACTIONS.forEach((action) => {
        if (!entry.locked?.[action]) {
          entry.permissions[action] = payload.value;
        }
      });
    });

  saveStore(store);
  return matrix;
}
