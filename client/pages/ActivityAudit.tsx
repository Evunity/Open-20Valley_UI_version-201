import { useMemo, useState } from "react";
import { ArrowDownUp, CalendarDays, Download, Search, UserSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import SearchableDropdown from "@/components/SearchableDropdown";
import DualMonthCalendar from "@/components/DualMonthCalendar";
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

type DateRange = { start: Date | null; end: Date | null };

const EVENTS: ActivityEvent[] = [
  { id: "evt-1", timestamp: "2026-04-20T12:10:00Z", userId: "u-1", userName: "Ahmed Khalil", email: "ahmed.k@telecom.eg", tenantId: "egypt", tenantName: "Egypt Operator", roleName: "Platform Admin", module: "Access Control", actionCategory: "Authentication", action: "login", targetType: "Session", targetName: "Web Console", result: "Success", ipAddress: "10.20.10.15", deviceInfo: "Windows 11 / Chrome", sessionId: "sess-8831", details: "SSO login with MFA" },
  { id: "evt-2", timestamp: "2026-04-20T12:04:00Z", userId: "u-2", userName: "Sara Mahmoud", email: "sara.m@telecom.sa", tenantId: "ksa", tenantName: "Saudi Operator", roleName: "RF Engineer", module: "Access Control", actionCategory: "User Management", action: "reset password", targetType: "User", targetId: "u-9", targetName: "Mona Adel", result: "Success", ipAddress: "10.42.4.20", deviceInfo: "macOS / Safari", sessionId: "sess-7242", details: "Admin-triggered reset from Edit User modal" },
  { id: "evt-3", timestamp: "2026-04-20T11:58:00Z", userId: "u-3", userName: "Omar Tariq", email: "omar.t@managed.com", tenantId: "managed", tenantName: "Managed Services", roleName: "NOC Operator", module: "Alarm Management", actionCategory: "Edit", action: "modify alarm threshold", targetType: "Alarm Policy", targetId: "alm-pol-2", targetName: "Core Link Packet Loss", result: "Pending", ipAddress: "10.50.11.18", deviceInfo: "Windows 11 / Edge", sessionId: "sess-2021", details: "Awaiting approval workflow" },
  { id: "evt-4", timestamp: "2026-04-20T11:52:00Z", userId: "u-4", userName: "Layla Rashid", email: "layla.r@enterprise.net", tenantId: "enterprise", tenantName: "Enterprise Networks", roleName: "Viewer", module: "Command Center", actionCategory: "Read Access", action: "access denied event", targetType: "Automation Rule", targetId: "auto-24", targetName: "Cross-Tenant Rebalance", result: "Denied", ipAddress: "192.168.4.33", deviceInfo: "Ubuntu / Firefox", sessionId: "sess-8188", details: "Role lacks execute permission" },
  { id: "evt-5", timestamp: "2026-04-20T11:45:00Z", userId: "u-5", userName: "Nour Samir", email: "nour.s@telecom-group.com", tenantId: "group", tenantName: "Telecom Group", roleName: "Group Executive", module: "Reports", actionCategory: "Export", action: "export report", targetType: "Report", targetId: "rpt-77", targetName: "Executive KPI Weekly", result: "Success", ipAddress: "10.1.4.2", deviceInfo: "Windows 10 / Chrome", sessionId: "sess-4431", details: "CSV export" },
  { id: "evt-6", timestamp: "2026-04-20T11:40:00Z", userId: "u-1", userName: "Ahmed Khalil", email: "ahmed.k@telecom.eg", tenantId: "egypt", tenantName: "Egypt Operator", roleName: "Platform Admin", module: "Access Control", actionCategory: "Permission Change", action: "edit permissions", targetType: "Role", targetId: "rf-engineer", targetName: "RF Engineer", result: "Success", ipAddress: "10.20.10.15", deviceInfo: "Windows 11 / Chrome", sessionId: "sess-8831", details: "Granted export for Reports module" },
  { id: "evt-7", timestamp: "2026-04-20T11:33:00Z", userId: "u-2", userName: "Sara Mahmoud", email: "sara.m@telecom.sa", tenantId: "ksa", tenantName: "Saudi Operator", roleName: "RF Engineer", module: "Access Control", actionCategory: "Role Management", action: "create role", targetType: "Role", targetId: "vendor-operator", targetName: "Vendor Operator", result: "Success", ipAddress: "10.42.4.20", deviceInfo: "macOS / Safari", sessionId: "sess-7242", details: "Cloned from NOC Operator template" },
  { id: "evt-8", timestamp: "2026-04-20T11:26:00Z", userId: "u-6", userName: "Khalid N.", email: "khalid.n@enterprise.net", tenantId: "enterprise", tenantName: "Enterprise Networks", roleName: "Operations Manager", module: "Automation & AI", actionCategory: "Delete", action: "delete automation rule", targetType: "Automation Rule", targetId: "auto-4", targetName: "Auto Cell Rebalance", result: "Failed", ipAddress: "192.168.4.55", deviceInfo: "Windows 11 / Edge", sessionId: "sess-7765", details: "Validation failure: protected rule" },
  { id: "evt-9", timestamp: "2026-04-20T11:20:00Z", userId: "u-7", userName: "Mona Adel", email: "mona.a@telecom-group.com", tenantId: "group", tenantName: "Telecom Group", roleName: "Audit Lead", module: "Access Control", actionCategory: "Tenant Management", action: "assign tenant", targetType: "User", targetId: "u-11", targetName: "External Auditor", result: "Success", ipAddress: "10.1.9.5", deviceInfo: "Windows 10 / Edge", sessionId: "sess-2117", details: "Assigned read-only access to Egypt + KSA" },
  { id: "evt-10", timestamp: "2026-04-20T11:14:00Z", userId: "u-3", userName: "Omar Tariq", email: "omar.t@managed.com", tenantId: "managed", tenantName: "Managed Services", roleName: "NOC Operator", module: "Access Control", actionCategory: "Tenant Management", action: "remove tenant", targetType: "User", targetId: "u-14", targetName: "Temp Contractor", result: "Success", ipAddress: "10.50.11.18", deviceInfo: "Windows 11 / Edge", sessionId: "sess-2021", details: "Contract ended" },
  { id: "evt-11", timestamp: "2026-04-20T11:06:00Z", userId: "u-8", userName: "Reem Khaled", email: "reem.k@telecom.eg", tenantId: "egypt", tenantName: "Egypt Operator", roleName: "Policy Admin", module: "Security Policies", actionCategory: "Policy Change", action: "approval action", targetType: "Policy", targetId: "pol-32", targetName: "Data Export Guardrail", result: "Success", ipAddress: "10.20.31.6", deviceInfo: "macOS / Chrome", sessionId: "sess-0981", details: "Approved pending policy update" },
  { id: "evt-12", timestamp: "2026-04-20T11:00:00Z", userId: "u-5", userName: "Nour Samir", email: "nour.s@telecom-group.com", tenantId: "group", tenantName: "Telecom Group", roleName: "Group Executive", module: "Activity & Audit", actionCategory: "System Action", action: "cross-tenant access action", targetType: "Dashboard", targetName: "Multi-Tenant KPI Board", result: "Success", ipAddress: "10.1.4.2", deviceInfo: "Windows 10 / Chrome", sessionId: "sess-4431", details: "Read-only cross-tenant view approved" },
  { id: "evt-13", timestamp: "2026-04-20T10:55:00Z", userId: "u-9", userName: "Guest User", email: "external.audit@vendor.com", tenantId: "vendor", tenantName: "Managed Services", roleName: "Read-Only Auditor", module: "Access Control", actionCategory: "Authentication", action: "failed login", targetType: "Login", result: "Failed", ipAddress: "172.18.14.44", deviceInfo: "Windows 10 / Chrome", sessionId: "sess-9090", details: "Invalid MFA challenge" },
  { id: "evt-14", timestamp: "2026-04-20T10:50:00Z", userId: "u-10", userName: "Alaa Hassan", email: "alaa.h@telecom.eg", tenantId: "egypt", tenantName: "Egypt Operator", roleName: "NOC Engineer", module: "Access Control", actionCategory: "Authentication", action: "logout", targetType: "Session", result: "Success", ipAddress: "10.20.44.18", deviceInfo: "Windows 11 / Chrome", sessionId: "sess-3372", details: "Manual secure sign out" },
];

const TENANTS = ["Egypt Operator", "Saudi Operator", "Managed Services", "Enterprise Networks", "Telecom Group"];
const RESULTS: Array<"All Results" | ActivityResult> = ["All Results", "Success", "Failed", "Denied", "Pending"];
const PAGE_SIZE = 10;

function exportCsv(rows: ActivityEvent[]) {
  const header = ["Timestamp", "User", "Email", "Tenant", "Role", "Category", "Action", "Target", "Module", "Result", "IP/Device", "Session ID"];
  const body = rows.map((row) => [row.timestamp, row.userName, row.email, row.tenantName, row.roleName, row.actionCategory, row.action, row.targetName || row.targetType, row.module, row.result, `${row.ipAddress || "-"} / ${row.deviceInfo || "-"}`, row.sessionId || "-"]);
  const csv = [header, ...body].map((line) => line.map((cell) => `"${cell}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "activity-actions-export.csv";
  anchor.click();
  URL.revokeObjectURL(url);
}

function matchesDateRange(eventDate: string, range: DateRange) {
  const day = eventDate.slice(0, 10);
  const from = range.start ? range.start.toISOString().slice(0, 10) : "";
  const to = range.end ? range.end.toISOString().slice(0, 10) : "";
  return (!from || day >= from) && (!to || day <= to);
}

export default function ActivityAudit() {
  const [tab, setTab] = useState<ActivityTab>("all-actions");
  const [search, setSearch] = useState("");
  const [selectedTenants, setSelectedTenants] = useState<string[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [investigationUser, setInvestigationUser] = useState<string[]>([]);
  const [module, setModule] = useState("All Modules");
  const [category, setCategory] = useState<"All Categories" | ActivityCategory>("All Categories");
  const [result, setResult] = useState<"All Results" | ActivityResult>("All Results");
  const [rangeOpen, setRangeOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>({ start: null, end: null });
  const [sortKey, setSortKey] = useState<SortKey>("timestamp");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [activeRow, setActiveRow] = useState<ActivityEvent | null>(null);

  const users = useMemo(() => Array.from(new Set(EVENTS.map((event) => event.userName))), []);
  const modules = useMemo(() => ["All Modules", ...Array.from(new Set(EVENTS.map((event) => event.module)))], []);
  const categories = useMemo(() => ["All Categories", ...Array.from(new Set(EVENTS.map((event) => event.actionCategory)))], []);

  const queryEvents = useMemo(() => {
    const scopedByTab = tab === "user-investigation"
      ? investigationUser[0]
        ? EVENTS.filter((event) => event.userName === investigationUser[0])
        : []
      : EVENTS;

    const query = search.trim().toLowerCase();
    return scopedByTab.filter((event) => {
      const matchesSearch =
        !query || [event.userName, event.email, event.action, event.targetName, event.module, event.sessionId, event.tenantName].join(" ").toLowerCase().includes(query);
      const matchesTenant = selectedTenants.length === 0 || selectedTenants.includes(event.tenantName);
      const matchesUser = tab === "all-actions" ? selectedUsers.length === 0 || selectedUsers.includes(event.userName) : true;
      const matchesModule = module === "All Modules" || event.module === module;
      const matchesCategory = category === "All Categories" || event.actionCategory === category;
      const matchesResult = result === "All Results" || event.result === result;
      return matchesSearch && matchesTenant && matchesUser && matchesModule && matchesCategory && matchesResult && matchesDateRange(event.timestamp, dateRange);
    });
  }, [tab, investigationUser, search, selectedTenants, selectedUsers, module, category, result, dateRange]);

  const sortedEvents = useMemo(() => {
    const rows = [...queryEvents];
    rows.sort((a, b) => {
      const aVal = String(a[sortKey]);
      const bVal = String(b[sortKey]);
      const value = aVal.localeCompare(bVal);
      return sortDirection === "asc" ? value : -value;
    });
    return rows;
  }, [queryEvents, sortKey, sortDirection]);

  const paginatedEvents = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return sortedEvents.slice(start, start + PAGE_SIZE);
  }, [page, sortedEvents]);

  const totalPages = Math.max(1, Math.ceil(sortedEvents.length / PAGE_SIZE));

  const userSummary = useMemo(() => {
    if (tab !== "user-investigation" || !investigationUser[0] || sortedEvents.length === 0) return null;
    const latest = [...sortedEvents].sort((a, b) => b.timestamp.localeCompare(a.timestamp))[0];
    return {
      name: latest.userName,
      email: latest.email,
      role: latest.roleName,
      tenants: Array.from(new Set(sortedEvents.map((row) => row.tenantName))).join(", "),
      lastActive: latest.timestamp,
      totalActions: sortedEvents.length,
      failed: sortedEvents.filter((row) => row.result === "Failed" || row.result === "Denied").length,
      sensitive: sortedEvents.filter((row) => ["Permission Change", "Policy Change", "Tenant Management", "Delete"].includes(row.actionCategory)).length,
      lastLoginIp: sortedEvents.find((row) => row.action === "login")?.ipAddress || "-",
    };
  }, [tab, investigationUser, sortedEvents]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDirection("asc");
  };

  const dateLabel = dateRange.start && dateRange.end
    ? `${dateRange.start.toLocaleDateString()} - ${dateRange.end.toLocaleDateString()}`
    : "Select date range";

  return (
    <div className="h-full min-h-0 w-full min-w-0 bg-background p-2">
      <div className="space-y-3 rounded-xl border border-border bg-card p-3">
        <div className="flex items-center gap-2 border-b border-border pb-2">
          <button
            onClick={() => { setTab("all-actions"); setPage(1); }}
            className={cn(
              "rounded-md border px-3 py-1.5 text-xs font-semibold transition",
              tab === "all-actions"
                ? "border-primary bg-primary text-primary-foreground shadow-sm"
                : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground",
            )}
          >
            All Actions
          </button>
          <button
            onClick={() => { setTab("user-investigation"); setPage(1); }}
            className={cn(
              "rounded-md border px-3 py-1.5 text-xs font-semibold transition",
              tab === "user-investigation"
                ? "border-primary bg-primary text-primary-foreground shadow-sm"
                : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground",
            )}
          >
            User Investigation
          </button>
        </div>

        {tab === "user-investigation" && (
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
            <div className="flex items-center gap-2">
              <UserSearch className="h-4 w-4 text-primary" />
              <p className="text-xs font-semibold text-primary">Select one user to investigate.</p>
            </div>
            <div className="mt-2 max-w-md">
              <SearchableDropdown
                label="Investigation User"
                options={users}
                selected={investigationUser}
                onChange={(value) => { setInvestigationUser(value); setPage(1); }}
                multiSelect={false}
                searchable
                compact
                dropdownId="audit-investigation-user"
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-2 xl:grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_1fr]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search user, email, action, target, module, session" className="h-9 pl-9" />
          </div>

          <div className="relative">
            <Button variant="outline" className="h-9 w-full justify-start text-xs" onClick={() => setRangeOpen((prev) => !prev)}>
              <CalendarDays className="h-4 w-4" /> {dateLabel}
            </Button>
            {rangeOpen && (
              <div className="absolute left-0 top-full z-20 mt-2 w-[360px] rounded-lg border border-border bg-card p-3 shadow-lg">
                <DualMonthCalendar
                  startDate={dateRange.start}
                  endDate={dateRange.end}
                  onDateSelect={(date, isStart) => setDateRange((prev) => ({ ...prev, [isStart ? "start" : "end"]: date }))}
                  onRangeComplete={() => setRangeOpen(false)}
                />
              </div>
            )}
          </div>

          <SearchableDropdown
            label="Tenant(s)"
            options={TENANTS}
            selected={selectedTenants}
            onChange={(values) => { setSelectedTenants(values); setPage(1); }}
            searchable
            compact
            dropdownId="audit-tenant-filter"
          />

          {tab === "all-actions" ? (
            <SearchableDropdown
              label="User(s)"
              options={users}
              selected={selectedUsers}
              onChange={(values) => { setSelectedUsers(values); setPage(1); }}
              searchable
              compact
              dropdownId="audit-user-filter"
            />
          ) : (
            <div className="rounded-xl border border-border bg-muted/20 px-3 py-2 text-xs text-muted-foreground">User locked by investigation mode</div>
          )}

          <Select value={module} onValueChange={(value) => { setModule(value); setPage(1); }}>
            <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>{modules.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent>
          </Select>

          <Select value={category} onValueChange={(value) => { setCategory(value as typeof category); setPage(1); }}>
            <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>{categories.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent>
          </Select>

          <Select value={result} onValueChange={(value) => { setResult(value as typeof result); setPage(1); }}>
            <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>{RESULTS.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent>
          </Select>
        </div>

        {tab === "user-investigation" && userSummary && (
          <div className="grid grid-cols-1 gap-2 rounded-lg border border-border bg-background p-3 md:grid-cols-4 xl:grid-cols-8">
            <SummaryItem label="User" value={userSummary.name} />
            <SummaryItem label="Email" value={userSummary.email} />
            <SummaryItem label="Role" value={userSummary.role} />
            <SummaryItem label="Tenant(s)" value={userSummary.tenants} />
            <SummaryItem label="Last Active" value={new Date(userSummary.lastActive).toLocaleString()} />
            <SummaryItem label="Total Actions" value={`${userSummary.totalActions}`} />
            <SummaryItem label="Failed/Denied" value={`${userSummary.failed}`} />
            <SummaryItem label="Sensitive" value={`${userSummary.sensitive}`} />
          </div>
        )}

        {tab === "user-investigation" && !investigationUser[0] ? (
          <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Select a user in User Investigation mode to load action history.
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Showing {sortedEvents.length} actions</p>
              <Button variant="outline" size="sm" onClick={() => exportCsv(sortedEvents)}>
                <Download className="h-4 w-4" /> Export
              </Button>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full table-fixed text-sm">
                <thead className="sticky top-0 z-10 bg-muted/40">
                  <tr>
                    <HeaderCell label="Timestamp" className="w-[140px]" sortable onSort={() => toggleSort("timestamp")} />
                    <HeaderCell label="User" className="w-[130px]" sortable onSort={() => toggleSort("userName")} />
                    <HeaderCell label="Email" className="w-[170px]" />
                    <HeaderCell label="Tenant / Company" className="w-[130px]" sortable onSort={() => toggleSort("tenantName")} />
                    <HeaderCell label="Role" className="w-[120px]" />
                    <HeaderCell label="Category" className="w-[120px]" sortable onSort={() => toggleSort("actionCategory")} />
                    <HeaderCell label="Action" className="w-[160px]" />
                    <HeaderCell label="Target" className="w-[150px]" />
                    <HeaderCell label="Module" className="w-[120px]" sortable onSort={() => toggleSort("module")} />
                    <HeaderCell label="Result" className="w-[90px]" sortable onSort={() => toggleSort("result")} />
                    <HeaderCell label="IP / Device" className="w-[180px]" />
                    <HeaderCell label="Session" className="w-[100px]" />
                    <HeaderCell label="Details / View" className="sticky right-0 w-[110px] bg-muted/40" />
                  </tr>
                </thead>
                <tbody>
                  {paginatedEvents.map((event) => (
                    <tr key={event.id} className="cursor-pointer border-t border-border hover:bg-muted/20" onClick={() => setActiveRow(event)}>
                      <td className="truncate px-2 py-2 text-xs text-muted-foreground" title={new Date(event.timestamp).toLocaleString()}>{new Date(event.timestamp).toLocaleString()}</td>
                      <td className="truncate px-2 py-2 font-medium" title={event.userName}>{event.userName}</td>
                      <td className="truncate px-2 py-2 text-muted-foreground" title={event.email}>{event.email}</td>
                      <td className="truncate px-2 py-2 text-muted-foreground" title={event.tenantName}>{event.tenantName}</td>
                      <td className="truncate px-2 py-2" title={event.roleName}>{event.roleName}</td>
                      <td className="truncate px-2 py-2 text-muted-foreground" title={event.actionCategory}>{event.actionCategory}</td>
                      <td className="truncate px-2 py-2" title={event.action}>{event.action}</td>
                      <td className="truncate px-2 py-2 text-muted-foreground" title={event.targetName || event.targetType}>{event.targetName || event.targetType}</td>
                      <td className="truncate px-2 py-2 text-muted-foreground" title={event.module}>{event.module}</td>
                      <td className="px-2 py-2">
                        <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", event.result === "Success" && "bg-green-500/15 text-green-700", event.result === "Failed" && "bg-red-500/15 text-red-700", event.result === "Denied" && "bg-amber-500/15 text-amber-700", event.result === "Pending" && "bg-blue-500/15 text-blue-700")}>{event.result}</span>
                      </td>
                      <td className="truncate px-2 py-2 text-xs text-muted-foreground" title={`${event.ipAddress} / ${event.deviceInfo}`}>{event.ipAddress} / {event.deviceInfo}</td>
                      <td className="truncate px-2 py-2 font-mono text-xs text-muted-foreground" title={event.sessionId}>{event.sessionId}</td>
                      <td className="sticky right-0 bg-card px-2 py-2"><Button variant="ghost" size="sm" className="h-7 text-xs text-primary">View</Button></td>
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
          </>
        )}
      </div>

      <Dialog open={!!activeRow} onOpenChange={() => setActiveRow(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Activity Event Details</DialogTitle></DialogHeader>
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
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function HeaderCell({ label, sortable = false, onSort, className }: { label: string; sortable?: boolean; onSort?: () => void; className?: string }) {
  return (
    <th className={cn("px-2 py-2 text-left text-xs font-semibold text-muted-foreground", className)}>
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
      <p className="truncate text-xs font-semibold text-foreground" title={value}>{value}</p>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return <p><span className="text-muted-foreground">{label}:</span> {value}</p>;
}
