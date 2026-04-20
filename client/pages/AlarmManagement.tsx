import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, MoreHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { usePlatformSettings } from "@/contexts/PlatformSettingsContext";
import { formatPlatformDateTime } from "@/utils/platformDateTime";
import { SearchBar } from "@/components/ui/search-bar";
import SearchableDropdown from "@/components/SearchableDropdown";

type Mode = "Live" | "Snapshot" | "Historical";

interface AlarmRow {
  id: string;
  severity: "Critical" | "Major" | "Minor";
  vendor: "Huawei" | "Nokia" | "Ericsson";
  alarmName: string;
  status: "Open" | "Acknowledged" | "Assigned";
  assignment: string;
  site: string;
  region: string;
  firstSeen: string;
  lastUpdated: string;
  serviceDomain: string;
  technologyLayer: string;
  description: string;
  relatedAlarmCount: number;
}

interface AlarmDetails {
  summary: string;
  timeline: string[];
  rootCause: string;
  actions: string[];
  logs: string[];
}

const ASSIGNMENT_TEAMS = [
  "NOC L1",
  "NOC L2",
  "RAN Team",
  "Transport Ops",
  "Core Ops",
  "Field Support",
  "Vendor Coordination",
  "Incident Response",
];

const INITIAL_ROWS: AlarmRow[] = [
  { id: "ALM-10021", severity: "Critical", vendor: "Ericsson", alarmName: "RAN Backhaul Link Down", status: "Open", assignment: "Unassigned", site: "Cairo-NR-01", region: "Cairo East", firstSeen: "09:20", lastUpdated: "09:41", serviceDomain: "Mobile RAN", technologyLayer: "5G / Transport", description: "Backhaul link instability detected with repeated LOS events.", relatedAlarmCount: 4 },
  { id: "ALM-10022", severity: "Major", vendor: "Huawei", alarmName: "Packet Loss Spike", status: "Assigned", assignment: "NOC L2", site: "Cairo-TR-14", region: "Cairo North", firstSeen: "09:25", lastUpdated: "09:46", serviceDomain: "IP Transport", technologyLayer: "MPLS Core", description: "Packet loss exceeded threshold on aggregation route.", relatedAlarmCount: 2 },
  { id: "ALM-10023", severity: "Minor", vendor: "Nokia", alarmName: "Cell Throughput Degradation", status: "Acknowledged", assignment: "RAN Team", site: "Giza-LTE-03", region: "Giza", firstSeen: "09:33", lastUpdated: "09:49", serviceDomain: "Mobile Data", technologyLayer: "LTE Access", description: "Throughput drift identified against seasonal baseline.", relatedAlarmCount: 1 },
  { id: "ALM-10024", severity: "Critical", vendor: "Huawei", alarmName: "Core Session Failure Burst", status: "Open", assignment: "Unassigned", site: "Core-Cairo-02", region: "Core DC", firstSeen: "09:37", lastUpdated: "09:52", serviceDomain: "Core Signaling", technologyLayer: "EPC / IMS", description: "Session setup failures spiked after signaling congestion.", relatedAlarmCount: 6 },
  { id: "ALM-10025", severity: "Major", vendor: "Ericsson", alarmName: "Congestion Threshold Breach", status: "Assigned", assignment: "Transport Ops", site: "Cairo-TR-11", region: "Cairo South", firstSeen: "09:40", lastUpdated: "09:54", serviceDomain: "Transport", technologyLayer: "Microwave Backhaul", description: "Sustained congestion above configured guardrails.", relatedAlarmCount: 3 },
  { id: "ALM-10026", severity: "Minor", vendor: "Nokia", alarmName: "Neighbor Relation Mismatch", status: "Open", assignment: "Unassigned", site: "Alex-LTE-09", region: "Alexandria", firstSeen: "09:44", lastUpdated: "09:57", serviceDomain: "RAN Optimization", technologyLayer: "LTE / SON", description: "Neighbor definitions out of sync after rollout.", relatedAlarmCount: 1 },
];

export const AlarmManagement: React.FC = () => {
  const { toast } = useToast();
  const { settings } = usePlatformSettings();
  const [mode, setMode] = useState<Mode>("Live");
  const [lastUpdated, setLastUpdated] = useState(() => formatPlatformDateTime(new Date(), settings.timezone, settings.dateTimeFormat));
  const [search, setSearch] = useState("");
  const [vendor, setVendor] = useState("All Vendors");
  const [severity, setSeverity] = useState("All Severities");
  const [tableView, setTableView] = useState("Default View");
  const [columnsView, setColumnsView] = useState("Ops Columns");
  const [rows, setRows] = useState(INITIAL_ROWS);
  const [selectedAlarmId, setSelectedAlarmId] = useState<string | null>(null);
  const [selectedAlarmIds, setSelectedAlarmIds] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<keyof AlarmRow>("firstSeen");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [panelWidth, setPanelWidth] = useState(420);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [details, setDetails] = useState<AlarmDetails | null>(null);
  const [assignSelection, setAssignSelection] = useState<string[]>([]);
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignSaving, setAssignSaving] = useState(false);
  const [actionsExpanded, setActionsExpanded] = useState(false);
  const commandBarRef = useRef<HTMLDivElement | null>(null);
  const headerCheckboxRef = useRef<HTMLInputElement | null>(null);
  const [commandBarWidth, setCommandBarWidth] = useState(0);

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
    setLastUpdated(formatPlatformDateTime(new Date(), settings.timezone, settings.dateTimeFormat));
  }, [settings.timezone, settings.dateTimeFormat]);

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

  useEffect(() => {
    if (!selectedAlarm) {
      setAssignSelection([]);
      setActionsExpanded(false);
      return;
    }
    if (selectedAlarm.assignment !== "Unassigned") {
      setAssignSelection([selectedAlarm.assignment]);
      return;
    }
    setAssignSelection([]);
  }, [selectedAlarm]);

  useEffect(() => {
    const node = commandBarRef.current;
    if (!node) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      setCommandBarWidth(entry.contentRect.width);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedAlarmId(null);
      }
    };
    document.addEventListener("keydown", onEscape);
    return () => document.removeEventListener("keydown", onEscape);
  }, []);

  const visibleAlarmIds = useMemo(() => filtered.map((row) => row.id), [filtered]);
  const selectedVisibleCount = useMemo(
    () => visibleAlarmIds.filter((id) => selectedAlarmIds.includes(id)).length,
    [selectedAlarmIds, visibleAlarmIds]
  );
  const allVisibleSelected = filtered.length > 0 && selectedVisibleCount === filtered.length;
  const isPartiallySelected = selectedVisibleCount > 0 && !allVisibleSelected;

  useEffect(() => {
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.indeterminate = isPartiallySelected;
    }
  }, [isPartiallySelected]);

  const clearSelection = () => {
    setSelectedAlarmIds([]);
  };

  const toggleSelectAllVisible = () => {
    if (allVisibleSelected) {
      setSelectedAlarmIds((prev) => prev.filter((id) => !visibleAlarmIds.includes(id)));
      return;
    }
    setSelectedAlarmIds((prev) => Array.from(new Set([...prev, ...visibleAlarmIds])));
  };

  const onRowKeyDown = (event: React.KeyboardEvent, index: number) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setSelectedAlarmId(filtered[index].id);
    }
    if (event.key === "ArrowDown" && filtered[index + 1]) setSelectedAlarmId(filtered[index + 1].id);
    if (event.key === "ArrowUp" && filtered[index - 1]) setSelectedAlarmId(filtered[index - 1].id);
  };

  const targetIds = selectedAlarmIds.length > 0 ? selectedAlarmIds : selectedAlarmId ? [selectedAlarmId] : [];
  const showColumns = commandBarWidth >= 1360;
  const showView = commandBarWidth >= 1180;
  const showSeverity = commandBarWidth >= 1000;
  const showVendor = commandBarWidth >= 840;
  const actionSlots = commandBarWidth >= 1280 ? 3 : commandBarWidth >= 1100 ? 2 : commandBarWidth >= 900 ? 1 : 0;
  const showAcknowledge = actionSlots >= 1;
  const showAssign = actionSlots >= 2;
  const showExport = actionSlots >= 3;
  const hasOverflowItems = !showVendor || !showSeverity || !showView || !showColumns || !showAcknowledge || !showAssign || !showExport;

  const handleAcknowledge = () => {
    if (settings.maintenanceMode) {
      toast({ title: "Maintenance mode", description: "Write actions are disabled while maintenance mode is enabled." });
      return;
    }
    if (targetIds.length === 0) return;
    setRows((prev) => prev.map((r) => (targetIds.includes(r.id) ? { ...r, status: "Acknowledged" } : r)));
    toast({ title: "Acknowledged", description: `${targetIds.length} alarms updated.` });
  };

  const handleAssignApply = () => {
    if (settings.maintenanceMode) {
      toast({ title: "Maintenance mode", description: "Write actions are disabled while maintenance mode is enabled." });
      return;
    }
    const selectedTeam = assignSelection[0];
    if (!selectedTeam) {
      toast({ title: "Select assignment", description: "Choose a team before applying assignment." });
      return;
    }
    if (assignSaving) return;
    setAssignSaving(true);
    setTimeout(() => {
      setRows((prev) => prev.map((r) => (targetIds.includes(r.id) ? { ...r, assignment: selectedTeam, status: "Assigned", lastUpdated: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) } : r)));
      setAssignSaving(false);
      setAssignOpen(false);
      toast({ title: "Assigned", description: `${targetIds.length} alarms assigned to ${selectedTeam}.` });
    }, 450);
  };

  const handleExport = () => {
    toast({ title: "Export started", description: `${filtered.length} alarms exported.` });
  };

  return (
    <section className="space-y-3">
      {/* Top mode controls */}
      <div className="flex items-center justify-between rounded-xl border border-border bg-card px-3 py-2">
        <div className="inline-flex rounded-lg border border-border bg-muted/20 p-1">
          {(["Live", "Snapshot", "Historical"] as Mode[]).map((m) => (
            <button key={m} onClick={() => setMode(m)} className={cn("rounded-md px-3 py-1 text-xs font-semibold transition-colors", mode === m ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>{m}</button>
          ))}
        </div>
        <button onClick={() => { setLastUpdated(formatPlatformDateTime(new Date(), settings.timezone, settings.dateTimeFormat)); toast({ title: "Refreshed", description: "Alarm table refreshed; details panel preserved." }); }} className="rounded-lg border border-border px-2.5 py-1 text-xs">Refresh · {lastUpdated}</button>
      </div>

      {/* Toolbar */}
      <div ref={commandBarRef} className="overflow-visible rounded-xl border border-border bg-card p-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <SearchBar value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search alarms..." containerClassName="min-w-[240px] max-w-[420px] flex-1" />
            {showVendor && (
              <div className="w-[160px] shrink-0">
                <Select value={vendor} onValueChange={setVendor}>
                  <SelectTrigger className="h-10 rounded-lg border-border bg-background text-sm">
                    <SelectValue placeholder="Vendor" />
                  </SelectTrigger>
                  <SelectContent>
                    {["All Vendors", "Huawei", "Nokia", "Ericsson"].map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            {showSeverity && (
              <div className="w-[160px] shrink-0">
                <Select value={severity} onValueChange={setSeverity}>
                  <SelectTrigger className="h-10 rounded-lg border-border bg-background text-sm">
                    <SelectValue placeholder="Severity" />
                  </SelectTrigger>
                  <SelectContent>
                    {["All Severities", "Critical", "Major", "Minor"].map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            {showView && (
              <div className="w-[180px] shrink-0">
                <Select value={tableView} onValueChange={setTableView}>
                  <SelectTrigger className="h-10 rounded-lg border-border bg-background text-sm">
                    <SelectValue placeholder="View" />
                  </SelectTrigger>
                  <SelectContent>
                    {["Default View", "Escalation View", "Assignment View"].map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            {showColumns && (
              <div className="w-[180px] shrink-0">
                <Select value={columnsView} onValueChange={setColumnsView}>
                  <SelectTrigger className="h-10 rounded-lg border-border bg-background text-sm">
                    <SelectValue placeholder="Columns" />
                  </SelectTrigger>
                  <SelectContent>
                    {["Ops Columns", "Minimal Columns", "Engineering Columns"].map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {targetIds.length > 0 ? (
              <>
                <button disabled={settings.maintenanceMode} onClick={handleAcknowledge} className="h-10 rounded-lg border border-border px-3 text-sm disabled:opacity-40">Acknowledge Selected ({targetIds.length})</button>
                <button disabled={settings.maintenanceMode} onClick={() => setAssignOpen(true)} className="h-10 rounded-lg border border-border px-3 text-sm disabled:opacity-40">Assign Selected ({targetIds.length})</button>
                <button onClick={clearSelection} className="h-10 rounded-lg border border-border px-3 text-sm">Clear Selection</button>
              </>
            ) : null}
            {showExport && <button onClick={handleExport} className="h-10 rounded-lg border border-border px-3 text-sm">Export</button>}
            {hasOverflowItems && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="inline-flex h-10 items-center gap-2 rounded-lg border border-border px-3 text-sm">
                    <MoreHorizontal className="h-4 w-4" /> More
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72">
                  <DropdownMenuLabel>More Controls</DropdownMenuLabel>
                  {!showVendor && (
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>Vendor</DropdownMenuSubTrigger>
                      <DropdownMenuSubContent>
                        <DropdownMenuRadioGroup value={vendor} onValueChange={setVendor}>
                          {["All Vendors", "Huawei", "Nokia", "Ericsson"].map((option) => <DropdownMenuRadioItem key={option} value={option}>{option}</DropdownMenuRadioItem>)}
                        </DropdownMenuRadioGroup>
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                  )}
                  {!showSeverity && (
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>Severity</DropdownMenuSubTrigger>
                      <DropdownMenuSubContent>
                        <DropdownMenuRadioGroup value={severity} onValueChange={setSeverity}>
                          {["All Severities", "Critical", "Major", "Minor"].map((option) => <DropdownMenuRadioItem key={option} value={option}>{option}</DropdownMenuRadioItem>)}
                        </DropdownMenuRadioGroup>
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                  )}
                  {!showView && (
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>View</DropdownMenuSubTrigger>
                      <DropdownMenuSubContent>
                        <DropdownMenuRadioGroup value={tableView} onValueChange={setTableView}>
                          {["Default View", "Escalation View", "Assignment View"].map((option) => <DropdownMenuRadioItem key={option} value={option}>{option}</DropdownMenuRadioItem>)}
                        </DropdownMenuRadioGroup>
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                  )}
                  {!showColumns && (
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>Columns</DropdownMenuSubTrigger>
                      <DropdownMenuSubContent>
                        <DropdownMenuRadioGroup value={columnsView} onValueChange={setColumnsView}>
                          {["Ops Columns", "Minimal Columns", "Engineering Columns"].map((option) => <DropdownMenuRadioItem key={option} value={option}>{option}</DropdownMenuRadioItem>)}
                        </DropdownMenuRadioGroup>
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>More Actions</DropdownMenuLabel>
                  {targetIds.length > 0 && !showAcknowledge && <DropdownMenuItem disabled={settings.maintenanceMode} onSelect={handleAcknowledge}>Acknowledge Selected ({targetIds.length})</DropdownMenuItem>}
                  {targetIds.length > 0 && !showAssign && <DropdownMenuItem disabled={settings.maintenanceMode} onSelect={() => setAssignOpen(true)}>Assign Selected ({targetIds.length})</DropdownMenuItem>}
                  {targetIds.length > 0 && <DropdownMenuItem onSelect={clearSelection}>Clear Selection</DropdownMenuItem>}
                  {!showExport && <DropdownMenuItem onSelect={handleExport}>Export</DropdownMenuItem>}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
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
                  <th className="px-2 py-1.5"><input ref={headerCheckboxRef} type="checkbox" checked={allVisibleSelected} onChange={toggleSelectAllVisible} /></th>
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
                    onClick={() => setSelectedAlarmId((prev) => (prev === row.id ? null : row.id))}
                    className={cn("border-b border-border/70 text-[12px] hover:bg-muted/15 last:border-b-0", selectedAlarmId === row.id && "bg-primary/10")}
                  >
                    <td className="px-2 py-1.5"><input type="checkbox" checked={selectedAlarmIds.includes(row.id)} onChange={(e) => { e.stopPropagation(); setSelectedAlarmIds((prev) => (prev.includes(row.id) ? prev.filter((id) => id !== row.id) : [...prev, row.id])); }} /></td>
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
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Alarm Details · {selectedAlarm.id}</h3>
                <button
                  onClick={() => setSelectedAlarmId(null)}
                  className="inline-flex h-7 w-7 items-center justify-center rounded border border-border text-muted-foreground hover:text-foreground"
                  aria-label="Close alarm details"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              {detailsLoading || !details ? (
                <p className="text-xs text-muted-foreground">Loading details…</p>
              ) : (
                <>
                  <section className="rounded-lg border border-border p-2"><p className="text-[10px] font-semibold uppercase text-muted-foreground">Summary</p><p className="mt-1 text-xs">{details.summary}</p></section>
                  <section className="rounded-lg border border-border p-2">
                    <p className="text-[10px] font-semibold uppercase text-muted-foreground">Details</p>
                    <dl className="mt-1 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                      <DetailItem label="Alarm ID" value={selectedAlarm.id} />
                      <DetailItem label="Alarm Name" value={selectedAlarm.alarmName} />
                      <DetailItem label="Severity" value={selectedAlarm.severity} />
                      <DetailItem label="Vendor" value={selectedAlarm.vendor} />
                      <DetailItem label="Site" value={selectedAlarm.site} />
                      <DetailItem label="Region / Location" value={selectedAlarm.region} />
                      <DetailItem label="Status" value={selectedAlarm.status} />
                      <DetailItem label="Assignee" value={selectedAlarm.assignment} />
                      <DetailItem label="First Seen" value={selectedAlarm.firstSeen} />
                      <DetailItem label="Last Updated" value={selectedAlarm.lastUpdated} />
                      <DetailItem label="Affected Service" value={selectedAlarm.serviceDomain} />
                      <DetailItem label="Technology / Layer" value={selectedAlarm.technologyLayer} />
                      <DetailItem label="Related Alarms" value={`${selectedAlarm.relatedAlarmCount}`} />
                    </dl>
                    <p className="mt-2 text-[10px] font-semibold uppercase text-muted-foreground">Alarm Description</p>
                    <p className="mt-1 text-xs text-foreground">{selectedAlarm.description}</p>
                  </section>
                  <section className="rounded-lg border border-border p-2">
                    <p className="text-[10px] font-semibold uppercase text-muted-foreground">Assignment</p>
                    <div className="mt-2 grid grid-cols-1 gap-2">
                      <SearchableDropdown
                        label="Assignment Team"
                        showLabel={false}
                        options={ASSIGNMENT_TEAMS}
                        selected={assignSelection}
                        onChange={setAssignSelection}
                        multiSelect={false}
                        searchable
                        compact
                        triggerPlaceholder="Search and select team"
                        dropdownId={`alarm-assign-${selectedAlarm.id}`}
                      />
                      <button
                        disabled={assignSaving || !assignSelection[0] || settings.maintenanceMode}
                        onClick={() => handleAssignApply()}
                        className="h-8 rounded border border-border px-2 text-xs disabled:opacity-40"
                      >
                        {assignSaving ? "Applying..." : "Apply Assign"}
                      </button>
                    </div>
                  </section>
                  <section className="rounded-lg border border-border p-2"><p className="text-[10px] font-semibold uppercase text-muted-foreground">Timeline</p><ul className="mt-1 list-disc space-y-1 pl-4 text-xs">{details.timeline.map((t) => <li key={t}>{t}</li>)}</ul></section>
                  <section className="rounded-lg border border-border p-2"><p className="text-[10px] font-semibold uppercase text-muted-foreground">Root Cause</p><p className="mt-1 text-xs">{details.rootCause}</p></section>
                  <section className="rounded-lg border border-border p-2">
                    <button onClick={() => setActionsExpanded((prev) => !prev)} className="flex w-full items-center justify-between text-[10px] font-semibold uppercase text-muted-foreground">
                      Actions
                      <ChevronDown className={cn("h-4 w-4 transition-transform", actionsExpanded && "rotate-180")} />
                    </button>
                    {actionsExpanded && (
                      <ul className="mt-2 list-disc pl-4 text-xs">
                        {details.actions.map((a) => <li key={a}>{a}</li>)}
                      </ul>
                    )}
                  </section>
                  <section className="rounded-lg border border-border p-2"><p className="text-[10px] font-semibold uppercase text-muted-foreground">Logs</p><ul className="mt-1 space-y-1 text-xs">{details.logs.map((l) => <li key={l} className="font-mono text-[11px]">{l}</li>)}</ul></section>
                </>
              )}
            </div>
          </aside>
        )}
      </div>

      {assignOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-4">
            <h3 className="text-sm font-semibold">Assign Selected Alarms</h3>
            <div className="mt-2">
              <SearchableDropdown
                label="Assignment Team"
                showLabel={false}
                options={ASSIGNMENT_TEAMS}
                selected={assignSelection}
                onChange={setAssignSelection}
                multiSelect={false}
                searchable
                compact
                triggerPlaceholder="Search and select team"
                dropdownId="alarm-assign-modal"
              />
            </div>
            <div className="mt-3 flex justify-end gap-2">
              <button onClick={() => setAssignOpen(false)} className="rounded border border-border px-3 py-1 text-xs">Cancel</button>
              <button disabled={settings.maintenanceMode || assignSaving || !assignSelection[0]} onClick={handleAssignApply} className="rounded bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground disabled:opacity-40">{assignSaving ? "Applying..." : "Apply"}</button>
            </div>
          </div>
        </div>
      )}

    </section>
  );
};

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-0.5">
      <dt className="text-[10px] uppercase text-muted-foreground">{label}</dt>
      <dd className="truncate text-xs text-foreground" title={value}>{value}</dd>
    </div>
  );
}
