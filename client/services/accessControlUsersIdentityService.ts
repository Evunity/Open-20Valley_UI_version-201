export type UserStatus = "Active" | "Suspended" | "Pending" | "Disabled";

export type UserIdentityRecord = {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  tenantIds: string[];
  tenantNames: string[];
  primaryRoleId: string;
  primaryRoleName: string;
  status: UserStatus;
  lastLoginAt: string | null;
};

export type JitRequestStatus = "Pending" | "Approved" | "Denied" | "Expired";

export type JitAccessRequest = {
  id: string;
  userId: string;
  userName: string;
  requestedAccessText: string;
  targetTenantName: string;
  durationText: string;
  reason: string;
  status: JitRequestStatus;
  expiresAt?: string | null;
  approvedBy?: string | null;
  createdAt: string;
};

export type UsersIdentityFilters = {
  query: string;
  tenant: string;
  role: string;
  status: string;
  page: number;
  pageSize: number;
};

type Store = {
  users: UserIdentityRecord[];
  jitRequests: JitAccessRequest[];
};

const STORAGE_KEY = "access_control_users_identity_v1";

const DEFAULT_USERS: UserIdentityRecord[] = [
  {
    id: "user-ahmed",
    firstName: "Ahmed",
    lastName: "Khalil",
    fullName: "Ahmed Khalil",
    email: "ahmed.k@telecom.eg",
    tenantIds: ["egypt"],
    tenantNames: ["Egypt Operator"],
    primaryRoleId: "platform-admin",
    primaryRoleName: "Platform Admin",
    status: "Active",
    lastLoginAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "user-sara",
    firstName: "Sara",
    lastName: "Mahmoud",
    fullName: "Sara Mahmoud",
    email: "sara.m@telecom.sa",
    tenantIds: ["ksa"],
    tenantNames: ["Saudi Operator"],
    primaryRoleId: "rf-engineer",
    primaryRoleName: "RF Engineer",
    status: "Active",
    lastLoginAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "user-omar",
    firstName: "Omar",
    lastName: "Tariq",
    fullName: "Omar Tariq",
    email: "omar.t@telecom.eg",
    tenantIds: ["egypt", "ksa"],
    tenantNames: ["Egypt Operator", "Saudi Operator"],
    primaryRoleId: "noc-operator",
    primaryRoleName: "NOC Operator",
    status: "Active",
    lastLoginAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "user-layla",
    firstName: "Layla",
    lastName: "Rashid",
    fullName: "Layla Rashid",
    email: "layla.r@managed.com",
    tenantIds: ["managed"],
    tenantNames: ["Managed Svcs"],
    primaryRoleId: "viewer",
    primaryRoleName: "Viewer",
    status: "Suspended",
    lastLoginAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "user-khalid",
    firstName: "Khalid",
    lastName: "N.",
    fullName: "Khalid N.",
    email: "khalid.n@enterprise.net",
    tenantIds: ["enterprise"],
    tenantNames: ["Enterprise Networks"],
    primaryRoleId: "viewer",
    primaryRoleName: "Viewer",
    status: "Pending",
    lastLoginAt: null,
  },
];

const DEFAULT_JIT: JitAccessRequest[] = [
  {
    id: "jit-1",
    userId: "user-omar",
    userName: "Omar Tariq",
    requestedAccessText: "Admin access to Egypt Operator",
    targetTenantName: "Egypt Operator",
    durationText: "2 hours",
    reason: "Emergency patch",
    status: "Pending",
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
  },
  {
    id: "jit-2",
    userId: "user-sara",
    userName: "Sara Mahmoud",
    requestedAccessText: "Execute scripts in Saudi Operator",
    targetTenantName: "Saudi Operator",
    durationText: "4 hours",
    reason: "Config rollback",
    status: "Pending",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "jit-3",
    userId: "user-khalid",
    userName: "Khalid N.",
    requestedAccessText: "Admin access to Enterprise Networks",
    targetTenantName: "Enterprise Networks",
    durationText: "1 hour",
    reason: "Urgent customer escalations",
    status: "Approved",
    expiresAt: new Date(Date.now() + 45 * 60 * 1000).toISOString(),
    approvedBy: "Nour Samir",
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
];

function delay(ms = 180) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function loadStore(): Store {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return { users: DEFAULT_USERS, jitRequests: DEFAULT_JIT };

  try {
    const parsed = JSON.parse(raw) as Store;
    if (!parsed.users || !parsed.jitRequests) return { users: DEFAULT_USERS, jitRequests: DEFAULT_JIT };
    return parsed;
  } catch {
    return { users: DEFAULT_USERS, jitRequests: DEFAULT_JIT };
  }
}

function saveStore(store: Store) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export async function getUsersIdentity(filters: UsersIdentityFilters): Promise<{ rows: UserIdentityRecord[]; total: number }> {
  await delay();
  const store = loadStore();
  let rows = [...store.users];

  if (filters.query.trim()) {
    const q = filters.query.toLowerCase();
    rows = rows.filter((row) => [row.fullName, row.email, row.primaryRoleName, row.tenantNames.join(" ")].join(" ").toLowerCase().includes(q));
  }
  if (filters.tenant !== "All Tenants") {
    rows = rows.filter((row) => row.tenantNames.includes(filters.tenant));
  }
  if (filters.role !== "All Roles") {
    rows = rows.filter((row) => row.primaryRoleName === filters.role);
  }
  if (filters.status !== "All Status") {
    rows = rows.filter((row) => row.status === filters.status);
  }

  const total = rows.length;
  const start = (filters.page - 1) * filters.pageSize;
  const end = start + filters.pageSize;
  return { rows: rows.slice(start, end), total };
}

export async function createUser(payload: Omit<UserIdentityRecord, "id" | "fullName">): Promise<UserIdentityRecord> {
  await delay();
  const store = loadStore();
  const email = payload.email.trim().toLowerCase();
  if (store.users.some((user) => user.email.toLowerCase() === email)) throw new Error("Email already exists.");

  const created: UserIdentityRecord = {
    ...payload,
    id: `user-${Date.now()}`,
    email,
    fullName: `${payload.firstName} ${payload.lastName}`.trim(),
  };
  store.users.unshift(created);
  saveStore(store);
  return created;
}

export async function patchUser(
  userId: string,
  updates: Partial<UserIdentityRecord> & { password?: string; tenantId?: string; tenantName?: string },
): Promise<UserIdentityRecord> {
  await delay();
  const store = loadStore();
  const index = store.users.findIndex((user) => user.id === userId);
  if (index < 0) throw new Error("User not found.");

  const { password: _password, tenantId, tenantName, ...safeUpdates } = updates;
  const next = { ...store.users[index], ...safeUpdates };
  if (tenantId && tenantName) {
    next.tenantIds = [tenantId];
    next.tenantNames = [tenantName];
  }
  next.fullName = `${next.firstName} ${next.lastName}`.trim();
  store.users[index] = next;
  saveStore(store);
  return next;
}

export async function getUserById(userId: string): Promise<UserIdentityRecord> {
  await delay();
  const user = loadStore().users.find((row) => row.id === userId);
  if (!user) throw new Error("User not found.");
  return user;
}

export async function patchUserStatus(userId: string, status: UserStatus): Promise<UserIdentityRecord> {
  return patchUser(userId, { status });
}

export async function getJitAccessRequests(): Promise<JitAccessRequest[]> {
  await delay();
  return loadStore().jitRequests;
}

export async function patchJitAccessRequest(requestId: string, updates: Partial<JitAccessRequest>): Promise<JitAccessRequest> {
  await delay();
  const store = loadStore();
  const index = store.jitRequests.findIndex((request) => request.id === requestId);
  if (index < 0) throw new Error("JIT request not found.");

  const next = { ...store.jitRequests[index], ...updates };
  store.jitRequests[index] = next;
  saveStore(store);
  return next;
}
