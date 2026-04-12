import { useEffect, useMemo, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import { EllipsisVertical, Pencil, Plus, Search, UserRound } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import {
  createUser,
  getJitAccessRequests,
  getUserById,
  getUsersIdentity,
  patchJitAccessRequest,
  patchUser,
  patchUserStatus,
  type JitAccessRequest,
  type UserIdentityRecord,
  type UserStatus,
  type UsersIdentityFilters,
} from "@/services/accessControlUsersIdentityService";

const PAGE_SIZE = 8;

type UserDraft = {
  firstName: string;
  lastName: string;
  email: string;
  tenantNames: string[];
  primaryRoleName: string;
  status: UserStatus;
  sendInvitation: boolean;
};

const ROLES = ["Platform Admin", "RF Engineer", "NOC Operator", "Viewer", "Group Executive"];
const TENANTS = ["Egypt Operator", "Saudi Operator", "Managed Svcs", "Enterprise Networks"];

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

  const [jitRequests, setJitRequests] = useState<JitAccessRequest[]>([]);
  const [jitLoading, setJitLoading] = useState(true);

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [activeUser, setActiveUser] = useState<UserIdentityRecord | null>(null);
  const [draft, setDraft] = useState<UserDraft>({ firstName: "", lastName: "", email: "", tenantNames: [], primaryRoleName: "", status: "Pending", sendInvitation: true });
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

  const loadJit = async () => {
    setJitLoading(true);
    try {
      const data = await getJitAccessRequests();
      setJitRequests(data);
    } finally {
      setJitLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [filters]);

  useEffect(() => {
    loadJit();
  }, []);

  const totalPages = Math.max(1, Math.ceil(total / filters.pageSize));
  const start = total === 0 ? 0 : (filters.page - 1) * filters.pageSize + 1;
  const end = Math.min(total, filters.page * filters.pageSize);

  const pendingJitCount = useMemo(() => jitRequests.filter((request) => request.status === "Pending").length, [jitRequests]);

  const openAdd = () => {
    setDraft({ firstName: "", lastName: "", email: "", tenantNames: [], primaryRoleName: "", status: "Pending", sendInvitation: true });
    setFormError(null);
    setAddOpen(true);
  };

  const openEdit = (user: UserIdentityRecord) => {
    setActiveUser(user);
    setDraft({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      tenantNames: user.tenantNames,
      primaryRoleName: user.primaryRoleName,
      status: user.status,
      sendInvitation: false,
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
    if (!draft.firstName.trim() || !draft.lastName.trim() || !draft.email.trim() || draft.tenantNames.length === 0 || !draft.primaryRoleName) {
      setFormError("All required fields must be completed.");
      return;
    }

    try {
      await createUser({
        firstName: draft.firstName.trim(),
        lastName: draft.lastName.trim(),
        email: draft.email.trim(),
        tenantIds: draft.tenantNames.map((name) => name.toLowerCase().replace(/\s+/g, "-")),
        tenantNames: draft.tenantNames,
        primaryRoleId: draft.primaryRoleName.toLowerCase().replace(/\s+/g, "-"),
        primaryRoleName: draft.primaryRoleName,
        status: draft.status,
        lastLoginAt: null,
      });

      if (draft.sendInvitation) {
        toast({ title: "Invitation queued", description: `Invite sent to ${draft.email}.` });
      }
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
    if (!draft.firstName.trim() || !draft.lastName.trim() || !draft.email.trim() || draft.tenantNames.length === 0 || !draft.primaryRoleName) {
      setFormError("All required fields must be completed.");
      return;
    }

    try {
      await patchUser(activeUser.id, {
        firstName: draft.firstName.trim(),
        lastName: draft.lastName.trim(),
        email: draft.email.trim(),
        tenantIds: draft.tenantNames.map((name) => name.toLowerCase().replace(/\s+/g, "-")),
        tenantNames: draft.tenantNames,
        primaryRoleId: draft.primaryRoleName.toLowerCase().replace(/\s+/g, "-"),
        primaryRoleName: draft.primaryRoleName,
        status: draft.status,
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

  const updateJitStatus = async (requestId: string, status: JitAccessRequest["status"]) => {
    try {
      const updated = await patchJitAccessRequest(requestId, {
        status,
        approvedBy: status === "Approved" ? "Current Operator" : null,
      });
      setJitRequests((prev) => prev.map((item) => (item.id === requestId ? updated : item)));
    } catch (err) {
      toast({ title: "JIT action failed", description: err instanceof Error ? err.message : "Unable to update request.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-3">
      <button onClick={openAdd} className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
        <Plus className="h-4 w-4" />
        Add User
      </button>

      <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-xl">
          <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Search users..." className="h-9 w-full rounded-md border border-input bg-background pl-8 pr-3 text-sm" />
        </div>
        <div className="flex items-center gap-2">
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

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.8fr_1fr]">
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
                            <DropdownMenuItem onSelect={() => actionSimpleToast("Password reset requested")}>Reset Password</DropdownMenuItem>
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

        <section className="rounded-xl border border-border bg-card p-3">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold">JIT Access Requests</h3>
            <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-xs font-semibold text-red-700">{pendingJitCount}</span>
          </div>
          <div className="space-y-2">
            {jitLoading ? (
              Array.from({ length: 3 }).map((_, idx) => <div key={idx} className="h-16 animate-pulse rounded border border-border bg-muted/20" />)
            ) : jitRequests.map((request) => (
              <div key={request.id} className="rounded-md border border-border px-3 py-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold">{request.userName}</p>
                  <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold",
                    request.status === "Pending" ? "bg-amber-500/15 text-amber-700" :
                    request.status === "Approved" ? "bg-green-500/15 text-green-700" : "bg-red-500/15 text-red-700")}>{request.status}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Requesting: {request.requestedAccessText}</p>
                {request.status === "Pending" ? (
                  <p className="mt-1 text-[11px] text-primary">Duration: {request.durationText} · Reason: {request.reason}</p>
                ) : (
                  <p className="mt-1 text-[11px] text-muted-foreground">{request.status === "Approved" && request.expiresAt ? `Expires in ${minutesUntil(request.expiresAt)} min` : request.reason}</p>
                )}
                {request.status === "Pending" && (
                  <div className="mt-2 flex gap-2">
                    <button onClick={() => updateJitStatus(request.id, "Approved")} className="h-7 rounded bg-primary px-2 text-xs font-semibold text-primary-foreground">Approve</button>
                    <button onClick={() => updateJitStatus(request.id, "Denied")} className="h-7 rounded border border-input px-2 text-xs">Deny</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add User</DialogTitle>
            <DialogDescription>Create a new user identity and assign role/tenants.</DialogDescription>
          </DialogHeader>
          <UserForm draft={draft} setDraft={setDraft} />
          {formError && <p className="text-xs text-red-600">{formError}</p>}
          <DialogFooter>
            <button onClick={() => setAddOpen(false)} className="h-9 rounded-md border border-input px-3 text-sm">Cancel</button>
            <button onClick={submitAdd} className="h-9 rounded-md bg-primary px-3 text-sm font-semibold text-primary-foreground">Create User</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user profile, tenants, role, and status.</DialogDescription>
          </DialogHeader>
          <UserForm draft={draft} setDraft={setDraft} />
          {formError && <p className="text-xs text-red-600">{formError}</p>}
          <DialogFooter>
            <button onClick={() => setEditOpen(false)} className="h-9 rounded-md border border-input px-3 text-sm">Cancel</button>
            <button onClick={submitEdit} className="h-9 rounded-md bg-primary px-3 text-sm font-semibold text-primary-foreground">Save Changes</button>
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

function UserForm({ draft, setDraft }: { draft: UserDraft; setDraft: Dispatch<SetStateAction<UserDraft>> }) {
  const toggleTenant = (tenant: string) => {
    setDraft((prev) => ({
      ...prev,
      tenantNames: prev.tenantNames.includes(tenant)
        ? prev.tenantNames.filter((t) => t !== tenant)
        : [...prev.tenantNames, tenant],
    }));
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Field label="First Name *"><input value={draft.firstName} onChange={(e) => setDraft((p) => ({ ...p, firstName: e.target.value }))} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm" /></Field>
        <Field label="Last Name *"><input value={draft.lastName} onChange={(e) => setDraft((p) => ({ ...p, lastName: e.target.value }))} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm" /></Field>
      </div>
      <Field label="Email *"><input value={draft.email} onChange={(e) => setDraft((p) => ({ ...p, email: e.target.value }))} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm" /></Field>
      <Field label="Tenant Assignment(s) *">
        <div className="flex flex-wrap gap-1.5">
          {TENANTS.map((tenant) => (
            <button key={tenant} onClick={() => toggleTenant(tenant)} className={cn("rounded-full border px-2 py-1 text-xs", draft.tenantNames.includes(tenant) ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground")}>{tenant}</button>
          ))}
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
      <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
        <span className="text-xs text-muted-foreground">Send invitation email</span>
        <Switch checked={draft.sendInvitation} onCheckedChange={(checked) => setDraft((p) => ({ ...p, sendInvitation: checked }))} />
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="block space-y-1"><span className="text-xs font-semibold text-muted-foreground">{label}</span>{children}</label>;
}

function minutesUntil(dateIso: string) {
  const diff = new Date(dateIso).getTime() - Date.now();
  return Math.max(0, Math.round(diff / (60 * 1000)));
}

function formatLastLogin(lastLoginAt: string | null) {
  if (!lastLoginAt) return "Never";
  const diffMs = Date.now() - new Date(lastLoginAt).getTime();
  const hours = Math.floor(diffMs / (60 * 60 * 1000));
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
