import { useEffect, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import { EllipsisVertical, Pencil, Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createUser,
  getUserById,
  getUsersIdentity,
  patchUser,
  patchUserStatus,
  type UserIdentityRecord,
  type UserStatus,
  type UsersIdentityFilters,
} from "@/services/accessControlUsersIdentityService";

const PAGE_SIZE = 8;

type UserDraft = {
  firstName: string;
  lastName: string;
  email: string;
  tenantIds: string[];
  tenantNames: string[];
  primaryRoleName: string;
  status: UserStatus;
  changePassword: boolean;
  newPassword: string;
  confirmPassword: string;
};

const ROLES = ["Platform Admin", "RF Engineer", "NOC Operator", "Viewer", "Group Executive"];
const TENANT_OPTIONS = [
  { id: "egypt", name: "Egypt Operator" },
  { id: "ksa", name: "Saudi Operator" },
  { id: "managed", name: "Managed Svcs" },
  { id: "enterprise", name: "Enterprise Networks" },
];
const TENANTS = TENANT_OPTIONS.map((tenant) => tenant.name);

const statusStyle: Record<UserStatus, string> = {
  Active: "bg-green-500/15 text-green-700",
  Suspended: "bg-amber-500/15 text-amber-700",
  Pending: "bg-primary/15 text-primary",
  Disabled: "bg-red-500/15 text-red-700",
};

export default function UsersIdentityWorkspace() {
  const { toast } = useToast();

  const [filters, setFilters] = useState<UsersIdentityFilters>({
    query: "",
    tenant: "All Tenants",
    role: "All Roles",
    status: "All Status",
    page: 1,
    pageSize: PAGE_SIZE,
  });

  const [searchInput, setSearchInput] = useState("");
  const [rows, setRows] = useState<UserIdentityRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [activeUser, setActiveUser] = useState<UserIdentityRecord | null>(null);
  const [draft, setDraft] = useState<UserDraft>({
    firstName: "",
    lastName: "",
    email: "",
    tenantIds: [],
    tenantNames: [],
    primaryRoleName: "",
    status: "Pending",
    changePassword: false,
    newPassword: "",
    confirmPassword: "",
  });
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => ({ ...prev, query: searchInput, page: 1 }));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getUsersIdentity(filters);
      setRows(data.rows);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [filters]);

  const totalPages = Math.max(1, Math.ceil(total / filters.pageSize));

  const openAdd = () => {
    setDraft({
      firstName: "",
      lastName: "",
      email: "",
      tenantIds: [],
      tenantNames: [],
      primaryRoleName: "",
      status: "Pending",
      changePassword: false,
      newPassword: "",
      confirmPassword: "",
    });
    setFormError(null);
    setAddOpen(true);
  };

  const openEdit = (user: UserIdentityRecord, focusPassword = false) => {
    setActiveUser(user);
    setDraft({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      tenantIds: user.tenantIds,
      tenantNames: user.tenantNames,
      primaryRoleName: user.primaryRoleName,
      status: user.status,
      changePassword: focusPassword,
      newPassword: "",
      confirmPassword: "",
    });
    setFormError(null);
    setEditOpen(true);
  };

  const openDetails = async (userId: string) => {
    try {
      const user = await getUserById(userId);
      setActiveUser(user);
      setDetailsOpen(true);
    } catch (err) {
      toast({ title: "Failed to load user", description: err instanceof Error ? err.message : "Unable to load details.", variant: "destructive" });
    }
  };

  const submitAdd = async () => {
    setFormError(null);
    if (!draft.firstName.trim() || !draft.lastName.trim() || !draft.email.trim() || draft.tenantIds.length === 0 || !draft.primaryRoleName) {
      setFormError("All required fields must be completed.");
      return;
    }

    if (!draft.newPassword || !draft.confirmPassword) {
      setFormError("Password and Confirm Password are required.");
      return;
    }
    if (draft.newPassword !== draft.confirmPassword) {
      setFormError("Password and Confirm Password must match.");
      return;
    }
    if (draft.newPassword.length < 8) {
      setFormError("Password must be at least 8 characters.");
      return;
    }

    try {
      await createUser({
        firstName: draft.firstName.trim(),
        lastName: draft.lastName.trim(),
        email: draft.email.trim(),
        tenantIds: draft.tenantIds,
        tenantNames: draft.tenantNames,
        primaryRoleId: draft.primaryRoleName.toLowerCase().replace(/\s+/g, "-"),
        primaryRoleName: draft.primaryRoleName,
        status: draft.status,
        lastLoginAt: null,
        password: draft.newPassword,
      });

      setAddOpen(false);
      setFilters((prev) => ({ ...prev, page: 1 }));
      loadUsers();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Unable to add user.");
    }
  };

  const submitEdit = async () => {
    if (!activeUser) return;
    setFormError(null);
    if (!draft.firstName.trim() || !draft.lastName.trim() || !draft.email.trim() || draft.tenantIds.length === 0 || !draft.primaryRoleName) {
      setFormError("All required fields must be completed.");
      return;
    }

    if (draft.changePassword || draft.newPassword || draft.confirmPassword) {
      if (!draft.newPassword || !draft.confirmPassword) {
        setFormError("Both password fields are required when setting a new password.");
        return;
      }
      if (draft.newPassword !== draft.confirmPassword) {
        setFormError("New Password and Confirm Password must match.");
        return;
      }
      if (draft.newPassword.length < 8) {
        setFormError("Password must be at least 8 characters.");
        return;
      }
    }

    try {
      await patchUser(activeUser.id, {
        firstName: draft.firstName.trim(),
        lastName: draft.lastName.trim(),
        email: draft.email.trim(),
        tenantIds: draft.tenantIds,
        tenantNames: draft.tenantNames,
        primaryRoleId: draft.primaryRoleName.toLowerCase().replace(/\s+/g, "-"),
        primaryRoleName: draft.primaryRoleName,
        status: draft.status,
        ...(draft.changePassword && draft.newPassword ? { password: draft.newPassword } : {}),
      });
      setEditOpen(false);
      loadUsers();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Unable to update user.");
    }
  };

  const quickStatusToggle = async (user: UserIdentityRecord) => {
    const nextStatus: UserStatus = user.status === "Suspended" ? "Active" : "Suspended";
    try {
      await patchUserStatus(user.id, nextStatus);
      loadUsers();
    } catch (err) {
      toast({ title: "Status update failed", description: err instanceof Error ? err.message : "Unable to update user.", variant: "destructive" });
    }
  };

  const actionSimpleToast = (title: string) => toast({ title, description: "Action completed." });

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex w-full items-center gap-2 xl:max-w-[560px]">
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Search users..." className="h-9 w-full bg-background pl-8 pr-3 text-sm" />
          </div>
          <Button onClick={openAdd} size="sm" className="h-9 shrink-0">
            <Plus className="h-4 w-4" />
            Add User
          </Button>
        </div>
        <div className="flex items-center gap-2 self-start xl:self-auto">
          <Select value={filters.tenant} onValueChange={(value) => setFilters((prev) => ({ ...prev, tenant: value, page: 1 }))}>
            <SelectTrigger className="h-9 w-[132px] text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="All Tenants">All Tenants</SelectItem>
              {TENANTS.map((tenant) => <SelectItem key={tenant} value={tenant}>{tenant}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filters.role} onValueChange={(value) => setFilters((prev) => ({ ...prev, role: value, page: 1 }))}>
            <SelectTrigger className="h-9 w-[132px] text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="All Roles">All Roles</SelectItem>
              {ROLES.map((role) => <SelectItem key={role} value={role}>{role}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filters.status} onValueChange={(value) => setFilters((prev) => ({ ...prev, status: value, page: 1 }))}>
            <SelectTrigger className="h-9 w-[132px] text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="All Status">All Status</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Suspended">Suspended</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Disabled">Disabled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <section className="rounded-xl border border-border bg-card overflow-hidden">
        {error && (
          <div className="m-3 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-700">
            {error}
            <button onClick={loadUsers} className="ml-2 underline">Retry</button>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-sm">
            <thead className="bg-muted/30 text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-semibold">Name</th>
                <th className="px-3 py-2 text-left text-xs font-semibold">Email</th>
                <th className="px-3 py-2 text-left text-xs font-semibold">Tenant(s)</th>
                <th className="px-3 py-2 text-left text-xs font-semibold">Role</th>
                <th className="px-3 py-2 text-left text-xs font-semibold">Status</th>
                <th className="px-3 py-2 text-left text-xs font-semibold">Last Login</th>
                <th className="px-3 py-2 text-left text-xs font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, idx) => (
                  <tr key={idx} className="border-t border-border"><td colSpan={7} className="px-3 py-2.5"><div className="h-5 animate-pulse rounded bg-muted/40" /></td></tr>
                ))
              ) : rows.length === 0 ? (
                <tr><td colSpan={7} className="px-3 py-10 text-center text-sm text-muted-foreground">No users found for current filters.</td></tr>
              ) : rows.map((user) => (
                <tr key={user.id} className="border-t border-border hover:bg-muted/20">
                  <td className="px-3 py-2.5">
                    <button onClick={() => openDetails(user.id)} className="flex items-center gap-2 text-left">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                        {user.firstName[0]}{user.lastName[0]}
                      </span>
                      <span className="font-medium text-foreground">{user.fullName}</span>
                    </button>
                  </td>
                  <td className="px-3 py-2.5 text-muted-foreground">{user.email}</td>
                  <td className="px-3 py-2.5 text-muted-foreground">{user.tenantNames.join(", ")}</td>
                  <td className="px-3 py-2.5 text-foreground">{user.primaryRoleName}</td>
                  <td className="px-3 py-2.5"><span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", statusStyle[user.status])}>{user.status}</span></td>
                  <td className="px-3 py-2.5 text-muted-foreground">{formatLastLogin(user.lastLoginAt)}</td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(user)} className="rounded p-1.5 hover:bg-muted" title="Edit User"><Pencil className="h-4 w-4 text-muted-foreground" /></button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="rounded p-1.5 hover:bg-muted"><EllipsisVertical className="h-4 w-4 text-muted-foreground" /></button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onSelect={() => openDetails(user.id)}>View Details</DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => openEdit(user)}>Edit User</DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => quickStatusToggle(user)}>{user.status === "Suspended" ? "Reactivate User" : "Suspend User"}</DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => openEdit(user, true)}>Reset Password</DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => actionSimpleToast("Invite resent")}>Resend Invite</DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => actionSimpleToast("User removed from tenant")}>Remove from Tenant</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-border px-3 py-2 text-xs text-muted-foreground">
          <span>Showing {total === 0 ? 0 : (filters.page - 1) * PAGE_SIZE + 1}-{Math.min(total, filters.page * PAGE_SIZE)} of {total} users</span>
          <div className="flex items-center gap-2">
            <button disabled={filters.page <= 1} onClick={() => setFilters((prev) => ({ ...prev, page: prev.page - 1 }))} className="h-7 rounded border border-input px-2 disabled:opacity-40">Prev</button>
            <button disabled={filters.page >= totalPages} onClick={() => setFilters((prev) => ({ ...prev, page: prev.page + 1 }))} className="h-7 rounded border border-input px-2 disabled:opacity-40">Next</button>
          </div>
        </div>
      </section>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add User</DialogTitle>
            <DialogDescription>Create a new user identity and assign role/tenants.</DialogDescription>
          </DialogHeader>
          <UserForm draft={draft} setDraft={setDraft} mode="add" />
          {formError && <p className="text-xs text-red-600">{formError}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)} className="h-9">Cancel</Button>
            <Button onClick={submitAdd} className="h-9">Create User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user profile, tenants, role, and status.</DialogDescription>
          </DialogHeader>
          <UserForm draft={draft} setDraft={setDraft} mode="edit" />
          {formError && <p className="text-xs text-red-600">{formError}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)} className="h-9">Cancel</Button>
            <Button onClick={submitEdit} className="h-9">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>Identity and access context.</DialogDescription>
          </DialogHeader>
          {activeUser && (
            <div className="space-y-2 text-sm">
              <p><span className="text-muted-foreground">Name:</span> {activeUser.fullName}</p>
              <p><span className="text-muted-foreground">Email:</span> {activeUser.email}</p>
              <p><span className="text-muted-foreground">Tenant(s):</span> {activeUser.tenantNames.join(", ")}</p>
              <p><span className="text-muted-foreground">Role:</span> {activeUser.primaryRoleName}</p>
              <p><span className="text-muted-foreground">Status:</span> {activeUser.status}</p>
              <p><span className="text-muted-foreground">Last Login:</span> {formatLastLogin(activeUser.lastLoginAt)}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function UserForm({ draft, setDraft, mode }: { draft: UserDraft; setDraft: Dispatch<SetStateAction<UserDraft>>; mode: "add" | "edit" }) {
  const toggleTenant = (tenantId: string, tenantName: string) => {
    setDraft((prev) => {
      const exists = prev.tenantIds.includes(tenantId);
      if (exists) {
        return {
          ...prev,
          tenantIds: prev.tenantIds.filter((id) => id !== tenantId),
          tenantNames: prev.tenantNames.filter((name) => name !== tenantName),
        };
      }
      return {
        ...prev,
        tenantIds: [...prev.tenantIds, tenantId],
        tenantNames: [...prev.tenantNames, tenantName],
      };
    });
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Field label="First Name *"><Input value={draft.firstName} onChange={(e) => setDraft((p) => ({ ...p, firstName: e.target.value }))} className="h-9" /></Field>
        <Field label="Last Name *"><Input value={draft.lastName} onChange={(e) => setDraft((p) => ({ ...p, lastName: e.target.value }))} className="h-9" /></Field>
      </div>
      <Field label="Email *"><Input value={draft.email} onChange={(e) => setDraft((p) => ({ ...p, email: e.target.value }))} className="h-9" /></Field>
      <Field label="Tenant Assignments *">
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1.5">
            {TENANT_OPTIONS.map((tenant) => (
              <button
                key={tenant.id}
                type="button"
                onClick={() => toggleTenant(tenant.id, tenant.name)}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-xs transition",
                  draft.tenantIds.includes(tenant.id)
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-background text-muted-foreground hover:border-primary/50",
                )}
              >
                {tenant.name}
              </button>
            ))}
          </div>
          {draft.tenantNames.length > 0 ? (
            <p className="text-xs text-muted-foreground">Selected: {draft.tenantNames.join(", ")}</p>
          ) : (
            <p className="text-xs text-muted-foreground">Select one or more tenants.</p>
          )}
        </div>
      </Field>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Field label="Primary Role *">
          <Select value={draft.primaryRoleName || "none"} onValueChange={(value) => setDraft((p) => ({ ...p, primaryRoleName: value === "none" ? "" : value }))}>
            <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Select role</SelectItem>
              {ROLES.map((role) => <SelectItem key={role} value={role}>{role}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Status">
          <Select value={draft.status} onValueChange={(value) => setDraft((p) => ({ ...p, status: value as UserStatus }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Suspended">Suspended</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Disabled">Disabled</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </div>
      <div className="space-y-2 rounded-md border border-border px-3 py-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Password</p>
          {mode === "edit" ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-8"
              onClick={() => setDraft((prev) => ({ ...prev, changePassword: !prev.changePassword, newPassword: "", confirmPassword: "" }))}
            >
              {draft.changePassword ? "Cancel Password Change" : "Set New Password"}
            </Button>
          ) : null}
        </div>
        {mode === "add" || draft.changePassword ? (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Field label={mode === "add" ? "Password *" : "New Password *"}>
              <Input
                type="password"
                value={draft.newPassword}
                onChange={(e) => setDraft((p) => ({ ...p, newPassword: e.target.value }))}
                className="h-9"
              />
            </Field>
            <Field label="Confirm Password *">
              <Input
                type="password"
                value={draft.confirmPassword}
                onChange={(e) => setDraft((p) => ({ ...p, confirmPassword: e.target.value }))}
                className="h-9"
              />
            </Field>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">Use “Set New Password” to reset this user password.</p>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="block space-y-1"><span className="text-xs font-semibold text-muted-foreground">{label}</span>{children}</label>;
}

function formatLastLogin(lastLoginAt: string | null) {
  if (!lastLoginAt) return "Never";
  const diffMs = Date.now() - new Date(lastLoginAt).getTime();
  const hours = Math.floor(diffMs / (60 * 60 * 1000));
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
