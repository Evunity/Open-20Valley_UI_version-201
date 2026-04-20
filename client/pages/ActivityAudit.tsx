import { useMemo, useState } from "react";
import { ArrowDownUp, Download, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

type ActivityResult = "Success" | "Failed" | "Denied" | "Pending";
type ActivityCategory =
  | "Authentication"
  | "User Management"
  | "Role Management"
  | "Tenant Management"
  | "Permission Change"
  | "Policy Change"
  | "Export"
  | "Create"
  | "Edit"
  | "Delete"
  | "Approval"
  | "Read Access"
  | "System Action";

type ActivityEvent = {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  email: string;
  tenantId: string;
  tenantName: string;
  roleName: string;
  module: string;
  actionCategory: ActivityCategory;
  action: string;
  targetType: string;
  targetId?: string;
  targetName?: string;
  result: ActivityResult;
  ipAddress?: string;
  deviceInfo?: string;
  sessionId?: string;
  details?: string;
  metadata?: Record<string, unknown>;
};

type ActivityTab = "all-actions" | "user-investigation";

type SortKey = "timestamp" | "userName" | "tenantName" | "module" | "actionCategory" | "result";

const EVENTS: ActivityEvent[] = [
  {
    id: "evt-1",
    timestamp: "2026-04-20T12:10:00Z",
    userId: "u-1",
    userName: "Ahmed Khalil",
    email: "ahmed.k@telecom.eg",
    tenantId: "egypt",
    tenantName: "Egypt Operator",
    roleName: "Platform Admin",
    module: "Access Control",
    actionCategory: "Authentication",
    action: "login",
    targetType: "Session",
    targetName: "Web Console",
    result: "Success",
    ipAddress: "10.20.10.15",
    deviceInfo: "Windows 11 / Chrome",
    sessionId: "sess-8831",
    details: "SSO login with MFA",
  },
  {
    id: "evt-2",
    timestamp: "2026-04-20T12:04:00Z",
    userId: "u-2",
    userName: "Sara Mahmoud",
    email: "sara.m@telecom.sa",
    tenantId: "ksa",
    tenantName: "Saudi Operator",
    roleName: "RF Engineer",
    module: "Access Control",
    actionCategory: "User Management",
    action: "reset password",
    targetType: "User",
    targetId: "u-9",
    targetName: "Mona Adel",
    result: "Success",
    ipAddress: "10.42.4.20",
    deviceInfo: "macOS / Safari",
    sessionId: "sess-7242",
    details: "Admin-triggered reset from Edit User modal",
  },
  {
    id: "evt-3",
    timestamp: "2026-04-20T11:58:00Z",
    userId: "u-3",
    userName: "Omar Tariq",
    email: "omar.t@managed.com",
    tenantId: "managed",
    tenantName: "Managed Services",
    roleName: "NOC Operator",
    module: "Alarm Management",
    actionCategory: "Edit",
    action: "modify alarm threshold",
    targetType: "Alarm Policy",
    targetId: "alm-pol-2",
    targetName: "Core Link Packet Loss",
    result: "Pending",
    ipAddress: "10.50.11.18",
    deviceInfo: "Windows 11 / Edge",
    sessionId: "sess-2021",
    details: "Awaiting approval workflow",
  },
  {
    id: "evt-4",
    timestamp: "2026-04-20T11:52:00Z",
    userId: "u-4",
    userName: "Layla Rashid",
    email: "layla.r@enterprise.net",
    tenantId: "enterprise",
    tenantName: "Enterprise Networks",
    roleName: "Viewer",
    module: "Command Center",
    actionCategory: "Read Access",
    action: "access denied event",
    targetType: "Automation Rule",
    targetId: "auto-24",
    targetName: "Cross-Tenant Rebalance",
    result: "Denied",
    ipAddress: "192.168.4.33",
    deviceInfo: "Ubuntu / Firefox",
    sessionId: "sess-8188",
    details: "Role lacks execute permission",
  },
  {
    id: "evt-5",
    timestamp: "2026-04-20T11:45:00Z",
    userId: "u-5",
    userName: "Nour Samir",
    email: "nour.s@telecom-group.com",
    tenantId: "group",
    tenantName: "Telecom Group",
    roleName: "Group Executive",
    module: "Reports",
    actionCategory: "Export",
    action: "export report",
    targetType: "Report",
    targetId: "rpt-77",
    targetName: "Executive KPI Weekly",
    result: "Success",
    ipAddress: "10.1.4.2",
    deviceInfo: "Windows 10 / Chrome",
    sessionId: "sess-4431",
    details: "CSV export",
  },
  {
    id: "evt-6",
    timestamp: "2026-04-20T11:40:00Z",
    userId: "u-1",
    userName: "Ahmed Khalil",
    email: "ahmed.k@telecom.eg",
    tenantId: "egypt",
    tenantName: "Egypt Operator",
    roleName: "Platform Admin",
    module: "Access Control",
    actionCategory: "Permission Change",
    action: "edit permissions",
    targetType: "Role",
    targetId: "rf-engineer",
    targetName: "RF Engineer",
    result: "Success",
    ipAddress: "10.20.10.15",
    deviceInfo: "Windows 11 / Chrome",
    sessionId: "sess-8831",
    details: "Granted export for Reports module",
  },
  {
    id: "evt-7",
    timestamp: "2026-04-20T11:33:00Z",
    userId: "u-2",
    userName: "Sara Mahmoud",
    email: "sara.m@telecom.sa",
    tenantId: "ksa",
    tenantName: "Saudi Operator",
    roleName: "RF Engineer",
    module: "Access Control",
    actionCategory: "Role Management",
    action: "create role",
    targetType: "Role",
    targetId: "vendor-operator",
    targetName: "Vendor Operator",
    result: "Success",
    ipAddress: "10.42.4.20",
    deviceInfo: "macOS / Safari",
    sessionId: "sess-7242",
    details: "Cloned from NOC Operator template",
  },
  {
    id: "evt-8",
    timestamp: "2026-04-20T11:26:00Z",
    userId: "u-6",
    userName: "Khalid N.",
    email: "khalid.n@enterprise.net",
    tenantId: "enterprise",
    tenantName: "Enterprise Networks",
    roleName: "Operations Manager",
    module: "Automation & AI",
    actionCategory: "Delete",
    action: "delete automation rule",
    targetType: "Automation Rule",
    targetId: "auto-4",
    targetName: "Auto Cell Rebalance",
    result: "Failed",
    ipAddress: "192.168.4.55",
    deviceInfo: "Windows 11 / Edge",
    sessionId: "sess-7765",
    details: "Validation failure: protected rule",
  },
  {
    id: "evt-9",
    timestamp: "2026-04-20T11:20:00Z",
    userId: "u-7",
    userName: "Mona Adel",
    email: "mona.a@telecom-group.com",
    tenantId: "group",
    tenantName: "Telecom Group",
    roleName: "Audit Lead",
    module: "Access Control",
    actionCategory: "Tenant Management",
    action: "assign tenant",
    targetType: "User",
    targetId: "u-11",
    targetName: "External Auditor",
    result: "Success",
    ipAddress: "10.1.9.5",
    deviceInfo: "Windows 10 / Edge",
    sessionId: "sess-2117",
    details: "Assigned read-only access to Egypt + KSA",
  },
  {
    id: "evt-10",
    timestamp: "2026-04-20T11:14:00Z",
    userId: "u-3",
    userName: "Omar Tariq",
    email: "omar.t@managed.com",
    tenantId: "managed",
    tenantName: "Managed Services",
    roleName: "NOC Operator",
    module: "Access Control",
    actionCategory: "Tenant Management",
    action: "remove tenant",
    targetType: "User",
    targetId: "u-14",
    targetName: "Temp Contractor",
    result: "Success",
    ipAddress: "10.50.11.18",
    deviceInfo: "Windows 11 / Edge",
    sessionId: "sess-2021",
    details: "Contract ended",
  },
  {
    id: "evt-11",
    timestamp: "2026-04-20T11:06:00Z",
    userId: "u-8",
    userName: "Reem Khaled",
    email: "reem.k@telecom.eg",
    tenantId: "egypt",
    tenantName: "Egypt Operator",
    roleName: "Policy Admin",
    module: "Security Policies",
    actionCategory: "Policy Change",
    action: "approval action",
    targetType: "Policy",
    targetId: "pol-32",
    targetName: "Data Export Guardrail",
    result: "Success",
    ipAddress: "10.20.31.6",
    deviceInfo: "macOS / Chrome",
    sessionId: "sess-0981",
    details: "Approved pending policy update",
  },
  {
    id: "evt-12",
    timestamp: "2026-04-20T11:00:00Z",
    userId: "u-5",
    userName: "Nour Samir",
    email: "nour.s@telecom-group.com",
    tenantId: "group",
    tenantName: "Telecom Group",
    roleName: "Group Executive",
    module: "Activity & Audit",
    actionCategory: "System Action",
    action: "cross-tenant access action",
    targetType: "Dashboard",
    targetName: "Multi-Tenant KPI Board",
    result: "Success",
    ipAddress: "10.1.4.2",
    deviceInfo: "Windows 10 / Chrome",
    sessionId: "sess-4431",
    details: "Read-only cross-tenant view approved",
  },
  {
    id: "evt-13",
    timestamp: "2026-04-20T10:55:00Z",
    userId: "u-9",
    userName: "Guest User",
    email: "external.audit@vendor.com",
    tenantId: "vendor",
    tenantName: "Managed Services",
    roleName: "Read-Only Auditor",
    module: "Access Control",
    actionCategory: "Authentication",
    action: "failed login",
    targetType: "Login",
    result: "Failed",
    ipAddress: "172.18.14.44",
    deviceInfo: "Windows 10 / Chrome",
    sessionId: "sess-9090",
    details: "Invalid MFA challenge",
  },
  {
    id: "evt-14",
    timestamp: "2026-04-20T10:50:00Z",
    userId: "u-10",
    userName: "Alaa Hassan",
    email: "alaa.h@telecom.eg",
    tenantId: "egypt",
    tenantName: "Egypt Operator",
    roleName: "NOC Engineer",
    module: "Access Control",
    actionCategory: "Authentication",
    action: "logout",
    targetType: "Session",
    result: "Success",
    ipAddress: "10.20.44.18",
    deviceInfo: "Windows 11 / Chrome",
    sessionId: "sess-3372",
    details: "Manual secure sign out",
  },
];

const TENANTS = ["All Tenants", "Egypt Operator", "Saudi Operator", "Managed Services", "Enterprise Networks", "Telecom Group"];
const RESULTS: Array<"All Results" | ActivityResult> = ["All Results", "Success", "Failed", "Denied", "Pending"];
const PAGE_SIZE = 10;

function toDateOnly(timestamp: string) {
  return timestamp.slice(0, 10);
}

function exportCsv(rows: ActivityEvent[]) {
  const header = [
    "Timestamp", "User", "Email", "Tenant", "Role", "Category", "Action", "Target", "Module", "Result", "IP/Device", "Session ID",
  ];
  const body = rows.map((row) => [
    row.timestamp,
    row.userName,
    row.email,
    row.tenantName,
    row.roleName,
    row.actionCategory,
    row.action,
    row.targetName || row.targetType,
    row.module,
    row.result,
    `${row.ipAddress || "-"} / ${row.deviceInfo || "-"}`,
    row.sessionId || "-",
  ]);
  const csv = [header, ...body].map((line) => line.map((cell) => `"${cell}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "activity-actions-export.csv";
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function ActivityAudit() {
  const [tab, setTab] = useState<ActivityTab>("all-actions");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [tenant, setTenant] = useState("All Tenants");
  const [user, setUser] = useState("All Users");
  const [module, setModule] = useState("All Modules");
  const [category, setCategory] = useState<"All Categories" | ActivityCategory>("All Categories");
  const [result, setResult] = useState<"All Results" | ActivityResult>("All Results");
  const [sortKey, setSortKey] = useState<SortKey>("timestamp");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [activeRow, setActiveRow] = useState<ActivityEvent | null>(null);

  const users = useMemo(() => ["All Users", ...Array.from(new Set(EVENTS.map((event) => event.userName)))], []);
  const modules = useMemo(() => ["All Modules", ...Array.from(new Set(EVENTS.map((event) => event.module)))], []);
  const categories = useMemo(() => ["All Categories", ...Array.from(new Set(EVENTS.map((event) => event.actionCategory)))], []);

  const scopedEvents = useMemo(() => {
    const events = tab === "user-investigation" && user !== "All Users"
      ? EVENTS.filter((event) => event.userName === user)
      : EVENTS;

    const query = search.trim().toLowerCase();
    return events.filter((event) => {
      const matchesSearch =
        !query ||
        [event.userName, event.email, event.action, event.targetName, event.module, event.sessionId, event.tenantName]
          .join(" ")
          .toLowerCase()
          .includes(query);
      const matchesTenant = tenant === "All Tenants" || event.tenantName === tenant;
      const matchesUser = user === "All Users" || event.userName === user;
      const matchesModule = module === "All Modules" || event.module === module;
      const matchesCategory = category === "All Categories" || event.actionCategory === category;
      const matchesResult = result === "All Results" || event.result === result;
      const eventDate = toDateOnly(event.timestamp);
      const matchesFrom = !dateFrom || eventDate >= dateFrom;
      const matchesTo = !dateTo || eventDate <= dateTo;
      return matchesSearch && matchesTenant && matchesUser && matchesModule && matchesCategory && matchesResult && matchesFrom && matchesTo;
    });
  }, [tab, user, search, tenant, module, category, result, dateFrom, dateTo]);

  const sortedEvents = useMemo(() => {
    const rows = [...scopedEvents];
    rows.sort((a, b) => {
      const aVal = String(a[sortKey]);
      const bVal = String(b[sortKey]);
      const value = aVal.localeCompare(bVal);
      return sortDirection === "asc" ? value : -value;
    });
    return rows;
  }, [scopedEvents, sortKey, sortDirection]);

  const paginatedEvents = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return sortedEvents.slice(start, start + PAGE_SIZE);
  }, [page, sortedEvents]);

  const totalPages = Math.max(1, Math.ceil(sortedEvents.length / PAGE_SIZE));

  const userSummary = useMemo(() => {
    if (tab !== "user-investigation" || user === "All Users") return null;
    const rows = sortedEvents;
    if (rows.length === 0) return null;
    const latest = [...rows].sort((a, b) => b.timestamp.localeCompare(a.timestamp))[0];
    const failedCount = rows.filter((row) => row.result === "Failed" || row.result === "Denied").length;
    const sensitiveCount = rows.filter((row) => ["Permission Change", "Policy Change", "Tenant Management", "Delete"].includes(row.actionCategory)).length;
    const tenantList = Array.from(new Set(rows.map((row) => row.tenantName))).join(", ");
    return {
      name: latest.userName,
      email: latest.email,
      role: latest.roleName,
      tenants: tenantList,
      lastActive: latest.timestamp,
      totalActions: rows.length,
      failedCount,
      sensitiveCount,
      lastLoginIp: rows.find((row) => row.action === "login")?.ipAddress || "-",
    };
  }, [tab, user, sortedEvents]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDirection("asc");
  };

  const resetPageOnFilter = () => setPage(1);

  return (
    <div className="h-full min-h-0 w-full min-w-0 bg-background p-2">
      <div className="space-y-3 rounded-xl border border-border bg-card p-3">
        <div className="flex items-center gap-2 border-b border-border pb-2">
          <button
            onClick={() => { setTab("all-actions"); setUser("All Users"); setPage(1); }}
            className={cn("rounded-md px-3 py-1.5 text-xs font-semibold", tab === "all-actions" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted")}
          >
            All Actions
          </button>
          <button
            onClick={() => { setTab("user-investigation"); setPage(1); }}
            className={cn("rounded-md px-3 py-1.5 text-xs font-semibold", tab === "user-investigation" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted")}
          >
            User Investigation
          </button>
        </div>

        <div className="grid grid-cols-1 gap-2 xl:grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_1fr]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => { setSearch(event.target.value); resetPageOnFilter(); }}
              placeholder="Search user, email, action, target, module, session"
              className="h-9 pl-9"
            />
          </div>
          <Input type="date" value={dateFrom} onChange={(event) => { setDateFrom(event.target.value); resetPageOnFilter(); }} className="h-9" />
          <Input type="date" value={dateTo} onChange={(event) => { setDateTo(event.target.value); resetPageOnFilter(); }} className="h-9" />
          <Select value={tenant} onValueChange={(value) => { setTenant(value); resetPageOnFilter(); }}>
            <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>{TENANTS.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={user} onValueChange={(value) => { setUser(value); resetPageOnFilter(); }}>
            <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>{users.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={module} onValueChange={(value) => { setModule(value); resetPageOnFilter(); }}>
            <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>{modules.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent>
          </Select>
          <div className="grid grid-cols-2 gap-2">
            <Select value={category} onValueChange={(value) => { setCategory(value as typeof category); resetPageOnFilter(); }}>
              <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>{categories.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={result} onValueChange={(value) => { setResult(value as typeof result); resetPageOnFilter(); }}>
              <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>{RESULTS.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>

        {tab === "user-investigation" && userSummary && (
          <div className="grid grid-cols-1 gap-2 rounded-lg border border-border bg-background p-3 md:grid-cols-4 xl:grid-cols-8">
            <SummaryItem label="User" value={userSummary.name} />
            <SummaryItem label="Email" value={userSummary.email} />
            <SummaryItem label="Role" value={userSummary.role} />
            <SummaryItem label="Tenant(s)" value={userSummary.tenants} />
            <SummaryItem label="Last Active" value={new Date(userSummary.lastActive).toLocaleString()} />
            <SummaryItem label="Total Actions" value={`${userSummary.totalActions}`} />
            <SummaryItem label="Failed/Denied" value={`${userSummary.failedCount}`} />
            <SummaryItem label="Sensitive" value={`${userSummary.sensitiveCount}`} />
          </div>
        )}

        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">Showing {sortedEvents.length} actions</p>
          <Button variant="outline" size="sm" onClick={() => exportCsv(sortedEvents)}>
            <Download className="h-4 w-4" /> Export
          </Button>
        </div>

        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[1500px] text-sm">
            <thead className="sticky top-0 z-10 bg-muted/40">
              <tr>
                <HeaderCell label="Timestamp" sortable onSort={() => toggleSort("timestamp")} />
                <HeaderCell label="User" sortable onSort={() => toggleSort("userName")} />
                <HeaderCell label="Email" />
                <HeaderCell label="Tenant / Company" sortable onSort={() => toggleSort("tenantName")} />
                <HeaderCell label="Role" />
                <HeaderCell label="Action Category" sortable onSort={() => toggleSort("actionCategory")} />
                <HeaderCell label="Action" />
                <HeaderCell label="Target Object" />
                <HeaderCell label="Module" sortable onSort={() => toggleSort("module")} />
                <HeaderCell label="Result" sortable onSort={() => toggleSort("result")} />
                <HeaderCell label="IP / Device" />
                <HeaderCell label="Session ID" />
                <HeaderCell label="Details / View" />
              </tr>
            </thead>
            <tbody>
              {paginatedEvents.map((event) => (
                <tr key={event.id} className="cursor-pointer border-t border-border hover:bg-muted/20" onClick={() => setActiveRow(event)}>
                  <td className="px-3 py-2 text-xs text-muted-foreground">{new Date(event.timestamp).toLocaleString()}</td>
                  <td className="px-3 py-2 font-medium text-foreground">{event.userName}</td>
                  <td className="px-3 py-2 text-muted-foreground">{event.email}</td>
                  <td className="px-3 py-2 text-muted-foreground">{event.tenantName}</td>
                  <td className="px-3 py-2 text-foreground">{event.roleName}</td>
                  <td className="px-3 py-2 text-muted-foreground">{event.actionCategory}</td>
                  <td className="px-3 py-2 text-foreground">{event.action}</td>
                  <td className="px-3 py-2 text-muted-foreground">{event.targetName || event.targetType}</td>
                  <td className="px-3 py-2 text-muted-foreground">{event.module}</td>
                  <td className="px-3 py-2">
                    <span className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-semibold",
                      event.result === "Success" && "bg-green-500/15 text-green-700",
                      event.result === "Failed" && "bg-red-500/15 text-red-700",
                      event.result === "Denied" && "bg-amber-500/15 text-amber-700",
                      event.result === "Pending" && "bg-blue-500/15 text-blue-700",
                    )}>{event.result}</span>
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">{event.ipAddress} / {event.deviceInfo}</td>
                  <td className="px-3 py-2 font-mono text-xs text-muted-foreground">{event.sessionId}</td>
                  <td className="px-3 py-2 text-primary underline">View</td>
                </tr>
              ))}
              {paginatedEvents.length === 0 && (
                <tr><td colSpan={13} className="px-3 py-8 text-center text-sm text-muted-foreground">No action events for current filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Page {page} of {totalPages}</span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((prev) => Math.max(1, prev - 1))}>Prev</Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}>Next</Button>
          </div>
        </div>
      </div>

      <Dialog open={!!activeRow} onOpenChange={() => setActiveRow(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Activity Event Details</DialogTitle>
          </DialogHeader>
          {activeRow && (
            <div className="grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
              <DetailRow label="Exact Action" value={activeRow.action} />
              <DetailRow label="Timestamp" value={new Date(activeRow.timestamp).toLocaleString()} />
              <DetailRow label="User" value={`${activeRow.userName} (${activeRow.email})`} />
              <DetailRow label="Tenant" value={activeRow.tenantName} />
              <DetailRow label="Role" value={activeRow.roleName} />
              <DetailRow label="Module" value={activeRow.module} />
              <DetailRow label="Action Category" value={activeRow.actionCategory} />
              <DetailRow label="Target Object" value={activeRow.targetName || activeRow.targetType} />
              <DetailRow label="Result" value={activeRow.result} />
              <DetailRow label="IP" value={activeRow.ipAddress || "-"} />
              <DetailRow label="Device" value={activeRow.deviceInfo || "-"} />
              <DetailRow label="Session ID" value={activeRow.sessionId || "-"} />
              <div className="md:col-span-2 rounded-md border border-border bg-background px-3 py-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Details / Metadata</p>
                <p className="text-sm text-foreground">{activeRow.details || "-"}</p>
                {activeRow.metadata ? <pre className="mt-1 overflow-auto text-xs">{JSON.stringify(activeRow.metadata, null, 2)}</pre> : null}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function HeaderCell({ label, sortable = false, onSort }: { label: string; sortable?: boolean; onSort?: () => void }) {
  return (
    <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">
      {sortable ? (
        <button onClick={onSort} className="inline-flex items-center gap-1 hover:text-foreground">
          {label}
          <ArrowDownUp className="h-3.5 w-3.5" />
        </button>
      ) : label}
    </th>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-border bg-card px-2 py-1.5">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-xs font-semibold text-foreground">{value}</p>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <p><span className="text-muted-foreground">{label}:</span> {value}</p>
  );
}
