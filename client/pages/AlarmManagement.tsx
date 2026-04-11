import React, { useMemo, useState } from "react";
import { Activity, CheckCheck, MessageSquare, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import SearchableDropdown from "@/components/SearchableDropdown";
import { useToast } from "@/hooks/use-toast";

type Mode = "Live" | "Snapshot" | "Historical";
type ViewMode = "Grouped" | "Raw";

interface AlarmRow {
  id: string;
  severity: "Critical" | "Major" | "Minor";
  vendor: "Huawei" | "Nokia" | "Ericsson";
  alarmName: string;
  status: "Open" | "Acknowledged" | "Assigned";
  assignment: string;
  site: string;
  firstSeen: string;
}

const INITIAL_ROWS: AlarmRow[] = [
  { id: "ALM-10021", severity: "Critical", vendor: "Ericsson", alarmName: "RAN Backhaul Link Down", status: "Open", assignment: "Unassigned", site: "Cairo-NR-01", firstSeen: "09:20" },
  { id: "ALM-10022", severity: "Major", vendor: "Huawei", alarmName: "Packet Loss Spike", status: "Assigned", assignment: "NOC L2", site: "Cairo-TR-14", firstSeen: "09:25" },
  { id: "ALM-10023", severity: "Minor", vendor: "Nokia", alarmName: "Cell Throughput Degradation", status: "Acknowledged", assignment: "RAN Team", site: "Giza-LTE-03", firstSeen: "09:33" },
  { id: "ALM-10024", severity: "Critical", vendor: "Huawei", alarmName: "Core Session Failure Burst", status: "Open", assignment: "Unassigned", site: "Core-Cairo-02", firstSeen: "09:37" },
  { id: "ALM-10025", severity: "Major", vendor: "Ericsson", alarmName: "Congestion Threshold Breach", status: "Assigned", assignment: "Transport Ops", site: "Cairo-TR-11", firstSeen: "09:40" },
  { id: "ALM-10026", severity: "Minor", vendor: "Nokia", alarmName: "Neighbor Relation Mismatch", status: "Open", assignment: "Unassigned", site: "Alex-LTE-09", firstSeen: "09:44" },
];

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-xl rounded-xl border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h3 className="text-sm font-semibold">{title}</h3>
          <button onClick={onClose} className="rounded-lg px-2 py-1 text-xs hover:bg-muted">Close</button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

export const AlarmManagement: React.FC = () => {
  const { toast } = useToast();
  const [mode, setMode] = useState<Mode>("Live");
  const [lastUpdated, setLastUpdated] = useState("10:12:24");
  const [viewMode, setViewMode] = useState<ViewMode>("Grouped");
  const [search, setSearch] = useState("");
  const [vendor, setVendor] = useState("All Vendors");
  const [severity, setSeverity] = useState("All Severities");
  const [tableView, setTableView] = useState("Default View");
  const [columnsView, setColumnsView] = useState("Ops Columns");
  const [activeFilters, setActiveFilters] = useState<string[]>(["Storm + Critical"]);
  const [rows, setRows] = useState(INITIAL_ROWS);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [assignOpen, setAssignOpen] = useState(false);
  const [commentOpen, setCommentOpen] = useState(false);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [assignee, setAssignee] = useState("NOC L2");
  const [comment, setComment] = useState("");

  const filtered = useMemo(() => {
    return rows.filter((row) => {
      const q = search.toLowerCase();
      const searchOk = row.alarmName.toLowerCase().includes(q) || row.id.toLowerCase().includes(q) || row.site.toLowerCase().includes(q);
      const vendorOk = vendor === "All Vendors" || row.vendor === vendor;
      const severityOk = severity === "All Severities" || row.severity === severity;
      return searchOk && vendorOk && severityOk;
    });
  }, [rows, search, vendor, severity]);

  const kpis = {
    faultIndex: "3.2",
    critical: filtered.filter((r) => r.severity === "Critical").length,
    major: filtered.filter((r) => r.severity === "Major").length,
    minor: filtered.filter((r) => r.severity === "Minor").length,
    serviceImpact: "14 Cells",
    clearRate: "94.7%",
  };

  const toggleAll = () => {
    if (selectedIds.length === filtered.length) setSelectedIds([]);
    else setSelectedIds(filtered.map((r) => r.id));
  };

  return (
    <section className="space-y-3">
      {/* A. Top header strip */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-card px-3 py-2">
        <div className="flex items-center gap-3">
          <h1 className="text-sm font-semibold">Alarm Management</h1>
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-600/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-700"><Activity className="h-3 w-3" />Live</span>
          <span className="text-[11px] text-muted-foreground">Last updated {lastUpdated}</span>
        </div>
        <div className="flex items-center gap-1.5">
          {(["Live", "Snapshot", "Historical"] as Mode[]).map((item) => (
            <button key={item} onClick={() => setMode(item)} className={cn("rounded-lg border px-2.5 py-1 text-xs", mode === item ? "border-primary bg-primary/10 text-primary" : "border-border")}>{item}</button>
          ))}
          <button onClick={() => { setLastUpdated(new Date().toLocaleTimeString()); toast({ title: "Console refreshed", description: "Alarm console has been updated." }); }} className="rounded-lg border border-border px-2.5 py-1 text-xs">Refresh</button>
        </div>
      </div>

      {/* B. KPI summary row */}
      <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-6">
        {[["Network Fault Index", kpis.faultIndex], ["Critical", String(kpis.critical)], ["Major", String(kpis.major)], ["Minor", String(kpis.minor)], ["Service Impact", kpis.serviceImpact], ["Clear Rate", kpis.clearRate]].map(([label, value]) => (
          <article key={label} className="rounded-lg border border-border bg-card px-3 py-2">
            <p className="text-[10px] text-muted-foreground">{label}</p>
            <p className="text-lg font-semibold">{value}</p>
          </article>
        ))}
      </div>

      {/* C. Alarm storm banner */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-rose-600/30 bg-rose-500/10 px-3 py-2">
        <p className="text-xs font-semibold text-rose-700">Alarm Storm Detected — 38 alarms in 5 minutes across Cairo transport cluster</p>
        <div className="flex items-center gap-1">
          {(["Grouped", "Raw"] as ViewMode[]).map((item) => <button key={item} onClick={() => setViewMode(item)} className={cn("rounded border px-2 py-1 text-[11px]", viewMode === item ? "border-rose-600/40 bg-rose-500/20 text-rose-700" : "border-rose-600/20 text-rose-700")}>{item}</button>)}
          <button onClick={() => setAnalyticsOpen(true)} className="rounded border border-rose-600/30 px-2 py-1 text-[11px] text-rose-700">View Analytics</button>
        </div>
      </div>

      {/* E. Notice bars */}
      <div className="space-y-1.5">
        <div className="rounded-lg border border-amber-600/30 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-700">Major Incident Active — Cairo Region</div>
        <div className="flex items-center justify-between rounded-lg border border-slate-600/30 bg-slate-500/10 px-3 py-1.5 text-xs text-slate-700">
          <span>Auto-refresh failed — Last successful update at 10:07:08</span>
          <button onClick={() => { setLastUpdated(new Date().toLocaleTimeString()); toast({ title: "Refresh restored", description: "Auto-refresh resumed successfully." }); }} className="rounded border border-slate-600/30 px-2 py-0.5 text-[11px]">Retry Now</button>
        </div>
      </div>

      {/* F. Toolbar */}
      <div className="rounded-xl border border-border bg-card p-2">
        <div className="flex items-center justify-between gap-2">
          <div className="grid min-w-0 flex-1 grid-cols-[minmax(220px,1.6fr)_110px_140px_140px_140px_140px] gap-2">
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search alarms..." className="h-8 rounded-lg border border-border bg-background px-2 text-xs" />
            <button className="h-8 rounded-lg border border-border px-2 text-xs">Filters</button>
            <SearchableDropdown label="" compact multiSelect={false} options={["All Vendors", "Huawei", "Nokia", "Ericsson"]} selected={[vendor]} onChange={(v) => setVendor(v[0] ?? "All Vendors")} dropdownId="alarm-vendor" />
            <SearchableDropdown label="" compact multiSelect={false} options={["All Severities", "Critical", "Major", "Minor"]} selected={[severity]} onChange={(v) => setSeverity(v[0] ?? "All Severities")} dropdownId="alarm-severity" />
            <SearchableDropdown label="" compact multiSelect={false} options={["Default View", "Escalation View", "Assignment View"]} selected={[tableView]} onChange={(v) => setTableView(v[0] ?? "Default View")} dropdownId="alarm-views" />
            <SearchableDropdown label="" compact multiSelect={false} options={["Ops Columns", "Minimal Columns", "Engineering Columns"]} selected={[columnsView]} onChange={(v) => setColumnsView(v[0] ?? "Ops Columns")} dropdownId="alarm-columns" />
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button onClick={() => { setRows((prev) => prev.map((r) => (selectedIds.includes(r.id) ? { ...r, status: "Acknowledged" } : r))); setSelectedIds([]); }} className="rounded-lg border border-border px-2 py-1 text-xs">Acknowledge</button>
            <button onClick={() => setAssignOpen(true)} className="rounded-lg border border-border px-2 py-1 text-xs">Assign</button>
            <button onClick={() => setCommentOpen(true)} className="rounded-lg border border-border px-2 py-1 text-xs">Comment</button>
            <button onClick={() => toast({ title: "Export started", description: `${filtered.length} alarms exported.` })} className="rounded-lg border border-border px-2 py-1 text-xs">Export</button>
          </div>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-1.5 border-t border-border/70 pt-2">
          {activeFilters.map((chip) => (
            <span key={chip} className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
              {chip}
              <button onClick={() => setActiveFilters((prev) => prev.filter((f) => f !== chip))}>×</button>
            </span>
          ))}
        </div>
      </div>

      {/* G. Dense table */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border bg-muted/20">
                <th className="px-2 py-1.5"><input type="checkbox" checked={selectedIds.length === filtered.length && filtered.length > 0} onChange={toggleAll} /></th>
                {["Severity", "Alarm ID", "Vendor", "Alarm Name", "Status", "Assignment", "Site", "First Seen", "Actions"].map((h) => <th key={h} className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id} className="border-b border-border/70 hover:bg-muted/15 last:border-b-0">
                  <td className="px-2 py-1.5"><input type="checkbox" checked={selectedIds.includes(row.id)} onChange={() => setSelectedIds((prev) => (prev.includes(row.id) ? prev.filter((id) => id !== row.id) : [...prev, row.id]))} /></td>
                  <td className="px-2 py-1.5"><span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", row.severity === "Critical" ? "bg-rose-500/10 text-rose-700" : row.severity === "Major" ? "bg-amber-500/10 text-amber-700" : "bg-slate-500/10 text-slate-700")}>{row.severity}</span></td>
                  <td className="px-2 py-1.5 text-[12px] font-medium">{row.id}</td>
                  <td className="px-2 py-1.5 text-[12px]">{row.vendor}</td>
                  <td className="px-2 py-1.5 text-[12px]">{row.alarmName}</td>
                  <td className="px-2 py-1.5 text-[12px]">{row.status}</td>
                  <td className="px-2 py-1.5 text-[12px]">{row.assignment}</td>
                  <td className="px-2 py-1.5 text-[12px]">{row.site}</td>
                  <td className="px-2 py-1.5 text-[12px]">{row.firstSeen}</td>
                  <td className="px-2 py-1.5">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setAssignOpen(true)} className="rounded border border-border p-1" title="Assign"><UserPlus className="h-3 w-3" /></button>
                      <button onClick={() => setCommentOpen(true)} className="rounded border border-border p-1" title="Comment"><MessageSquare className="h-3 w-3" /></button>
                      <button onClick={() => toast({ title: "Alarm acknowledged", description: row.id })} className="rounded border border-border p-1" title="Acknowledge"><CheckCheck className="h-3 w-3" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {assignOpen && (
        <Modal title="Assign Alarms" onClose={() => setAssignOpen(false)}>
          <input value={assignee} onChange={(e) => setAssignee(e.target.value)} className="h-9 w-full rounded-xl border border-border px-3 text-sm" />
          <div className="mt-3 flex justify-end"><button onClick={() => { setRows((prev) => prev.map((r) => (selectedIds.includes(r.id) ? { ...r, assignment: assignee, status: "Assigned" } : r))); setAssignOpen(false); }} className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">Assign</button></div>
        </Modal>
      )}

      {commentOpen && (
        <Modal title="Add Comment" onClose={() => setCommentOpen(false)}>
          <textarea value={comment} onChange={(e) => setComment(e.target.value)} className="h-24 w-full rounded-xl border border-border p-2 text-sm" placeholder="Enter operational note..." />
          <div className="mt-3 flex justify-end"><button onClick={() => { setCommentOpen(false); toast({ title: "Comment added", description: "Alarm note saved." }); }} className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">Save Comment</button></div>
        </Modal>
      )}

      {analyticsOpen && (
        <Modal title="Alarm Analytics" onClose={() => setAnalyticsOpen(false)}>
          <div className="rounded-lg border border-border bg-muted/20 p-3 text-sm">
            <p className="font-medium">Storm cluster analytics</p>
            <p className="mt-1 text-muted-foreground">Correlation indicates 62% of events tied to transport backhaul instability in Cairo core links.</p>
          </div>
        </Modal>
      )}
    </section>
  );
};
