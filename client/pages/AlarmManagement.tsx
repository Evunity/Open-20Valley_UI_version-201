import React, { useEffect, useMemo, useState } from "react";
import { CheckCheck, Download, MessageSquare, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import SearchableDropdown from "@/components/SearchableDropdown";
import { useToast } from "@/hooks/use-toast";

type Mode = "Live" | "Snapshot" | "Historical";

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

interface AlarmDetails {
  summary: string;
  timeline: string[];
  rootCause: string;
  actions: string[];
  logs: string[];
}

const INITIAL_ROWS: AlarmRow[] = [
  { id: "ALM-10021", severity: "Critical", vendor: "Ericsson", alarmName: "RAN Backhaul Link Down", status: "Open", assignment: "Unassigned", site: "Cairo-NR-01", firstSeen: "09:20" },
  { id: "ALM-10022", severity: "Major", vendor: "Huawei", alarmName: "Packet Loss Spike", status: "Assigned", assignment: "NOC L2", site: "Cairo-TR-14", firstSeen: "09:25" },
  { id: "ALM-10023", severity: "Minor", vendor: "Nokia", alarmName: "Cell Throughput Degradation", status: "Acknowledged", assignment: "RAN Team", site: "Giza-LTE-03", firstSeen: "09:33" },
  { id: "ALM-10024", severity: "Critical", vendor: "Huawei", alarmName: "Core Session Failure Burst", status: "Open", assignment: "Unassigned", site: "Core-Cairo-02", firstSeen: "09:37" },
  { id: "ALM-10025", severity: "Major", vendor: "Ericsson", alarmName: "Congestion Threshold Breach", status: "Assigned", assignment: "Transport Ops", site: "Cairo-TR-11", firstSeen: "09:40" },
  { id: "ALM-10026", severity: "Minor", vendor: "Nokia", alarmName: "Neighbor Relation Mismatch", status: "Open", assignment: "Unassigned", site: "Alex-LTE-09", firstSeen: "09:44" },
];

export const AlarmManagement: React.FC = () => {
  const { toast } = useToast();
  const [mode, setMode] = useState<Mode>("Live");
  const [lastUpdated, setLastUpdated] = useState("10:12:24");
  const [search, setSearch] = useState("");
  const [vendor, setVendor] = useState("All Vendors");
  const [severity, setSeverity] = useState("All Severities");
  const [tableView, setTableView] = useState("Default View");
  const [columnsView, setColumnsView] = useState("Ops Columns");
  const [rows, setRows] = useState(INITIAL_ROWS);
  const [selectedAlarmId, setSelectedAlarmId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<keyof AlarmRow>("firstSeen");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [panelWidth, setPanelWidth] = useState(420);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [details, setDetails] = useState<AlarmDetails | null>(null);
  const [assignInput, setAssignInput] = useState("NOC L2");
  const [commentInput, setCommentInput] = useState("");

  const selectedAlarm = rows.find((r) => r.id === selectedAlarmId) ?? null;

  const filtered = useMemo(() => {
    const out = rows.filter((row) => {
      const q = search.toLowerCase();
      const searchOk = row.alarmName.toLowerCase().includes(q) || row.id.toLowerCase().includes(q) || row.site.toLowerCase().includes(q);
      const vendorOk = vendor === "All Vendors" || row.vendor === vendor;
      const severityOk = severity === "All Severities" || row.severity === severity;
      return searchOk && vendorOk && severityOk;
    });
    out.sort((a, b) => {
      const av = String(a[sortBy]);
      const bv = String(b[sortBy]);
      return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    });
    return out;
  }, [rows, search, vendor, severity, sortBy, sortDir]);

  useEffect(() => {
    if (!selectedAlarmId) return;
    setDetailsLoading(true);
    const t = setTimeout(() => {
      setDetails({
        summary: `Alarm ${selectedAlarmId} currently ${selectedAlarm?.status ?? "Open"} in ${selectedAlarm?.site ?? "N/A"}.`,
        timeline: ["09:20 Detected by correlation engine", "09:23 Escalated to major incident queue", "09:28 Linked with transport degradation event"],
        rootCause: "Likely transport backhaul instability with vendor-side packet drops and intermittent reset behavior.",
        actions: ["Isolate affected sector links", "Trigger fallback routing profile", "Notify transport NOC and vendor bridge"],
        logs: ["[09:20:04] Threshold breach event", "[09:20:07] Alarm correlation id AC-221", "[09:22:41] Auto-assignment failed, moved to manual queue"],
      });
      setDetailsLoading(false);
    }, 300);
    return () => clearTimeout(t);
  }, [selectedAlarmId, selectedAlarm?.site, selectedAlarm?.status]);

  const onRowKeyDown = (event: React.KeyboardEvent, index: number) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setSelectedAlarmId(filtered[index].id);
    }
    if (event.key === "ArrowDown" && filtered[index + 1]) setSelectedAlarmId(filtered[index + 1].id);
    if (event.key === "ArrowUp" && filtered[index - 1]) setSelectedAlarmId(filtered[index - 1].id);
  };

  return (
    <section className="space-y-3">
      {/* Top mode controls */}
      <div className="flex items-center justify-between rounded-xl border border-border bg-card px-3 py-2">
        <div className="inline-flex rounded-lg border border-border bg-background p-1">
          {(["Live", "Snapshot", "Historical"] as Mode[]).map((m) => (
            <button key={m} onClick={() => setMode(m)} className={cn("rounded-md px-3 py-1 text-xs font-semibold", mode === m ? "bg-primary text-primary-foreground" : "text-muted-foreground")}>{m}</button>
          ))}
        </div>
        <button onClick={() => { setLastUpdated(new Date().toLocaleTimeString()); toast({ title: "Refreshed", description: "Alarm table refreshed; details panel preserved." }); }} className="rounded-lg border border-border px-2.5 py-1 text-xs">Refresh · {lastUpdated}</button>
      </div>

      {/* Toolbar */}
      <div className="rounded-xl border border-border bg-card p-2">
        <div className="flex items-center justify-between gap-2">
          <div className="grid min-w-0 flex-1 grid-cols-[minmax(220px,1.6fr)_110px_140px_140px_140px_140px] gap-2">
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search alarms..." className="h-8 rounded-lg border border-border bg-background px-2 text-xs" />
            <button className="h-8 rounded-lg border border-border px-2 text-xs">Filters</button>
            <SearchableDropdown label="" compact multiSelect={false} options={["All Vendors", "Huawei", "Nokia", "Ericsson"]} selected={[vendor]} onChange={(v) => setVendor(v[0] ?? "All Vendors")} dropdownId="alarm-vendor" />
            <SearchableDropdown label="" compact multiSelect={false} options={["All Severities", "Critical", "Major", "Minor"]} selected={[severity]} onChange={(v) => setSeverity(v[0] ?? "All Severities")} dropdownId="alarm-severity" />
            <SearchableDropdown label="" compact multiSelect={false} options={["Default View", "Escalation View", "Assignment View"]} selected={[tableView]} onChange={(v) => setTableView(v[0] ?? "Default View")} dropdownId="alarm-view" />
            <SearchableDropdown label="" compact multiSelect={false} options={["Ops Columns", "Minimal Columns", "Engineering Columns"]} selected={[columnsView]} onChange={(v) => setColumnsView(v[0] ?? "Ops Columns")} dropdownId="alarm-columns" />
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button onClick={() => selectedAlarmId && setRows((prev) => prev.map((r) => (r.id === selectedAlarmId ? { ...r, status: "Acknowledged" } : r)))} className="rounded-lg border border-border px-2 py-1 text-xs">Acknowledge</button>
            <button onClick={() => selectedAlarmId && setRows((prev) => prev.map((r) => (r.id === selectedAlarmId ? { ...r, status: "Assigned", assignment: assignInput } : r)))} className="rounded-lg border border-border px-2 py-1 text-xs">Assign</button>
            <button onClick={() => selectedAlarmId && toast({ title: "Comment saved", description: `Comment added to ${selectedAlarmId}.` })} className="rounded-lg border border-border px-2 py-1 text-xs">Comment</button>
            <button onClick={() => toast({ title: "Export started", description: `${filtered.length} alarms exported.` })} className="rounded-lg border border-border px-2 py-1 text-xs">Export</button>
          </div>
        </div>
      </div>

      {/* Master-detail split */}
      <div className="flex gap-2">
        <div className="min-w-0 flex-1 overflow-hidden rounded-xl border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border bg-muted/20">
                  {(["Severity", "Alarm ID", "Vendor", "Alarm Name", "Status", "Assignment", "Site", "First Seen"] as Array<keyof AlarmRow | "Alarm Name">).map((h) => (
                    <th
                      key={String(h)}
                      onClick={() => {
                        if (h === "Alarm Name") return;
                        setSortBy(h as keyof AlarmRow);
                        setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
                      }}
                      className="cursor-pointer px-2 py-1.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, index) => (
                  <tr
                    key={row.id}
                    tabIndex={0}
                    onKeyDown={(e) => onRowKeyDown(e, index)}
                    onClick={() => setSelectedAlarmId(row.id)}
                    className={cn("border-b border-border/70 text-[12px] hover:bg-muted/15 last:border-b-0", selectedAlarmId === row.id && "bg-primary/10")}
                  >
                    <td className="px-2 py-1.5"><span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", row.severity === "Critical" ? "bg-rose-500/10 text-rose-700" : row.severity === "Major" ? "bg-amber-500/10 text-amber-700" : "bg-slate-500/10 text-slate-700")}>{row.severity}</span></td>
                    <td className="px-2 py-1.5 font-medium">{row.id}</td>
                    <td className="px-2 py-1.5">{row.vendor}</td>
                    <td className="px-2 py-1.5">{row.alarmName}</td>
                    <td className="px-2 py-1.5">{row.status}</td>
                    <td className="px-2 py-1.5">{row.assignment}</td>
                    <td className="px-2 py-1.5">{row.site}</td>
                    <td className="px-2 py-1.5">{row.firstSeen}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {selectedAlarm && (
          <aside className="relative shrink-0 rounded-xl border border-border bg-card" style={{ width: panelWidth, minWidth: 320, maxWidth: 620 }}>
            <div
              className="absolute left-0 top-0 h-full w-1 cursor-col-resize"
              onMouseDown={(e) => {
                const startX = e.clientX;
                const startWidth = panelWidth;
                const onMove = (event: MouseEvent) => setPanelWidth(Math.max(320, Math.min(620, startWidth + (startX - event.clientX))));
                const onUp = () => { document.removeEventListener("mousemove", onMove); document.removeEventListener("mouseup", onUp); };
                document.addEventListener("mousemove", onMove);
                document.addEventListener("mouseup", onUp);
              }}
            />
            <div className="space-y-3 p-3">
              <h3 className="text-sm font-semibold">Alarm Details · {selectedAlarm.id}</h3>
              {detailsLoading || !details ? (
                <p className="text-xs text-muted-foreground">Loading details…</p>
              ) : (
                <>
                  <section className="rounded-lg border border-border p-2"><p className="text-[10px] font-semibold uppercase text-muted-foreground">Summary</p><p className="mt-1 text-xs">{details.summary}</p></section>
                  <section className="rounded-lg border border-border p-2"><p className="text-[10px] font-semibold uppercase text-muted-foreground">Timeline</p><ul className="mt-1 list-disc space-y-1 pl-4 text-xs">{details.timeline.map((t) => <li key={t}>{t}</li>)}</ul></section>
                  <section className="rounded-lg border border-border p-2"><p className="text-[10px] font-semibold uppercase text-muted-foreground">Root Cause</p><p className="mt-1 text-xs">{details.rootCause}</p></section>
                  <section className="rounded-lg border border-border p-2">
                    <p className="text-[10px] font-semibold uppercase text-muted-foreground">Actions</p>
                    <ul className="mt-1 list-disc pl-4 text-xs">{details.actions.map((a) => <li key={a}>{a}</li>)}</ul>
                    <div className="mt-2 grid grid-cols-2 gap-1">
                      <input value={assignInput} onChange={(e) => setAssignInput(e.target.value)} className="h-8 rounded border border-border px-2 text-xs" />
                      <button onClick={() => setRows((prev) => prev.map((r) => (r.id === selectedAlarm.id ? { ...r, assignment: assignInput, status: "Assigned" } : r)))} className="rounded border border-border text-xs">Apply Assign</button>
                      <input value={commentInput} onChange={(e) => setCommentInput(e.target.value)} className="h-8 rounded border border-border px-2 text-xs col-span-2" placeholder="Add comment..." />
                      <button onClick={() => toast({ title: "Comment logged", description: `Comment saved for ${selectedAlarm.id}.` })} className="rounded border border-border text-xs col-span-2">Save Comment</button>
                    </div>
                  </section>
                  <section className="rounded-lg border border-border p-2"><p className="text-[10px] font-semibold uppercase text-muted-foreground">Logs</p><ul className="mt-1 space-y-1 text-xs">{details.logs.map((l) => <li key={l} className="font-mono text-[11px]">{l}</li>)}</ul></section>
                </>
              )}
            </div>
          </aside>
        )}
      </div>
    </section>
  );
};
