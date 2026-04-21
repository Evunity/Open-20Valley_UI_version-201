import { useMemo, useState } from "react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Copy,
  Download,
  Eye,
  MoreHorizontal,
  Pencil,
  Play,
  Trash2,
  X,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SearchBar } from "@/components/ui/search-bar";

type ReportStatus = "Active" | "Draft" | "Paused" | "Running" | "Failed";
type ReportFormat = "PDF" | "Excel" | "CSV";
type ScheduleFrequency = "Run Once" | "Daily" | "Weekly" | "Monthly";
type DeliveryMethod = "Download" | "Email" | "Library";
type RunStatus = "Success" | "Failed" | "Running";

interface ScheduleConfig {
  enabled: boolean;
  frequency: ScheduleFrequency;
  timezone: string;
  nextRun: string;
  deliveryMethod: DeliveryMethod;
  recipients: string;
  format: ReportFormat;
}

interface ScheduleHistoryEntry {
  id: string;
  changedAt: string;
  action: "created" | "updated" | "paused" | "resumed" | "removed";
  summary: string;
}

interface RunRecord {
  id: string;
  startedAt: string;
  finishedAt: string;
  duration: string;
  status: RunStatus;
  initiatedBy: string;
  outputFile: string;
  errorMessage?: string;
}

interface ReportLibraryItem {
  id: string;
  reportName: string;
  type: string;
  owner: string;
  format: ReportFormat;
  scope: string;
  filters: string;
  columns: string;
  output: string;
  status: ReportStatus;
  lastRun: string;
  latestOutput: string | null;
  schedule: ScheduleConfig;
  scheduleHistory: ScheduleHistoryEntry[];
  runHistory: RunRecord[];
}

const REPORT_TYPES = [
  "KPI Report",
  "Alarm Report",
  "Site Summary Report",
  "Inventory / Topology Report",
  "Activity / Audit Report",
  "Custom Tabular Report",
];

const OWNER_OPTIONS = ["NOC Ops", "SLA Office", "Compliance Team", "Automation CoE"];

const FORMAT_OPTIONS: ReportFormat[] = ["PDF", "Excel", "CSV"];
const FREQUENCY_OPTIONS: ScheduleFrequency[] = ["Run Once", "Daily", "Weekly", "Monthly"];
const DELIVERY_OPTIONS: DeliveryMethod[] = ["Download", "Email", "Library"];

const INITIAL_ROWS: ReportLibraryItem[] = [
  {
    id: "rpt-1001",
    reportName: "Daily NOC Summary",
    type: "KPI Report",
    owner: "NOC Ops",
    format: "PDF",
    scope: "Tenant A / Cairo / LTE",
    filters: "Severity: Critical, Major",
    columns: "Site, KPI, Value, Trend",
    output: "Dashboard + Export",
    status: "Active",
    lastRun: "2026-04-21 06:00",
    latestOutput: "Daily_NOC_Summary_2026-04-21.pdf",
    schedule: {
      enabled: true,
      frequency: "Daily",
      timezone: "UTC+02:00",
      nextRun: "2026-04-22 06:00",
      deliveryMethod: "Email",
      recipients: "noc@ops.local",
      format: "PDF",
    },
    scheduleHistory: [
      { id: "sch-1", changedAt: "2026-04-18 09:00", action: "created", summary: "Daily at 06:00 UTC+02:00 via Email" },
      { id: "sch-2", changedAt: "2026-04-20 08:45", action: "updated", summary: "Recipients updated to noc@ops.local" },
    ],
    runHistory: [
      {
        id: "run-501",
        startedAt: "2026-04-21 06:00",
        finishedAt: "2026-04-21 06:01",
        duration: "58s",
        status: "Success",
        initiatedBy: "Scheduler",
        outputFile: "Daily_NOC_Summary_2026-04-21.pdf",
      },
    ],
  },
  {
    id: "rpt-1002",
    reportName: "Weekly SLA Compliance",
    type: "Site Summary Report",
    owner: "SLA Office",
    format: "Excel",
    scope: "Tenant A / National",
    filters: "SLA Type: Transport",
    columns: "Region, SLA, Compliance %",
    output: "Tabular",
    status: "Draft",
    lastRun: "Never",
    latestOutput: null,
    schedule: {
      enabled: false,
      frequency: "Weekly",
      timezone: "UTC",
      nextRun: "",
      deliveryMethod: "Library",
      recipients: "",
      format: "Excel",
    },
    scheduleHistory: [
      { id: "sch-3", changedAt: "2026-04-12 10:10", action: "removed", summary: "Schedule removed by operator" },
    ],
    runHistory: [],
  },
];

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-4xl rounded-md border border-border bg-card shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h3 className="text-sm font-semibold">{title}</h3>
          <button onClick={onClose} className="rounded p-1 hover:bg-muted"><X className="h-4 w-4" /></button>
        </div>
        <div className="max-h-[75vh] overflow-auto p-4">{children}</div>
      </div>
    </div>
  );
}

const statusTone = (status: ReportStatus) => {
  switch (status) {
    case "Active":
      return "border-emerald-600/25 bg-emerald-500/10 text-emerald-700";
    case "Draft":
      return "border-amber-600/25 bg-amber-500/10 text-amber-700";
    case "Paused":
      return "border-slate-600/25 bg-slate-500/10 text-slate-700";
    case "Running":
      return "border-blue-600/25 bg-blue-500/10 text-blue-700";
    case "Failed":
      return "border-rose-600/25 bg-rose-500/10 text-rose-700";
  }
};

export default function ReportLibraryModule() {
  const { toast } = useToast();
  const [reports, setReports] = useState<ReportLibraryItem[]>(INITIAL_ROWS);
  const [search, setSearch] = useState("");
  const [selectedReportId, setSelectedReportId] = useState<string | null>(INITIAL_ROWS[0]?.id ?? null);
  const [page, setPage] = useState(1);

  const [editReport, setEditReport] = useState<ReportLibraryItem | null>(null);
  const [scheduleReport, setScheduleReport] = useState<ReportLibraryItem | null>(null);
  const [detailsReport, setDetailsReport] = useState<ReportLibraryItem | null>(null);
  const [historyReport, setHistoryReport] = useState<ReportLibraryItem | null>(null);
  const [menuReport, setMenuReport] = useState<ReportLibraryItem | null>(null);

  const filteredReports = useMemo(
    () =>
      reports.filter((row) => {
        const q = search.toLowerCase().trim();
        if (!q) return true;
        return (
          row.reportName.toLowerCase().includes(q) ||
          row.type.toLowerCase().includes(q) ||
          row.owner.toLowerCase().includes(q)
        );
      }),
    [reports, search],
  );

  const PAGE_SIZE = 6;
  const pageCount = Math.max(1, Math.ceil(filteredReports.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageRows = filteredReports.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const selectedReport = reports.find((report) => report.id === selectedReportId) ?? null;

  const updateReport = (id: string, updater: (report: ReportLibraryItem) => ReportLibraryItem) => {
    setReports((prev) => prev.map((row) => (row.id === id ? updater(row) : row)));
  };

  const handleRunNow = (row: ReportLibraryItem) => {
    updateReport(row.id, (report) => ({ ...report, status: "Running" }));
    toast({ title: "Run started", description: `${row.reportName} is running now.` });

    setTimeout(() => {
      const timestamp = new Date().toISOString().slice(0, 16).replace("T", " ");
      const outputName = `${row.reportName.replace(/\s+/g, "_")}_${timestamp.replace(/[: ]/g, "-")}.${row.format.toLowerCase()}`;

      updateReport(row.id, (report) => ({
        ...report,
        status: report.schedule.enabled ? "Active" : "Draft",
        lastRun: timestamp,
        latestOutput: outputName,
        runHistory: [
          {
            id: `run-${Date.now()}`,
            startedAt: timestamp,
            finishedAt: timestamp,
            duration: "42s",
            status: "Success",
            initiatedBy: "Operator",
            outputFile: outputName,
          },
          ...report.runHistory,
        ],
      }));

      toast({ title: "Run completed", description: `${row.reportName} completed. Latest output is downloadable.` });
    }, 600);
  };

  const handleDownload = (row: ReportLibraryItem) => {
    if (!row.latestOutput) return;
    const blob = new Blob([`Simulated output for ${row.reportName}`], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = row.latestOutput;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Download started", description: row.latestOutput });
  };

  const handleDuplicate = (row: ReportLibraryItem) => {
    const clone: ReportLibraryItem = {
      ...row,
      id: `rpt-${Date.now()}`,
      reportName: `${row.reportName} (Copy)`,
      status: "Draft",
      lastRun: "Never",
      latestOutput: null,
      scheduleHistory: [],
      runHistory: [],
    };
    setReports((prev) => [clone, ...prev]);
    setPage(1);
    toast({ title: "Report duplicated", description: `${clone.reportName} created as draft.` });
  };

  const handleDelete = (row: ReportLibraryItem) => {
    if (!window.confirm(`Delete report \"${row.reportName}\"?`)) return;
    setReports((prev) => prev.filter((item) => item.id !== row.id));
    setMenuReport(null);
    if (selectedReportId === row.id) setSelectedReportId(null);
    toast({ title: "Report deleted", description: `${row.reportName} was removed.` });
  };

  return (
    <section className="space-y-3">
      <div className="rounded-md border border-border bg-card p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-semibold">Report Library Management Console</p>
          <SearchBar
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by report name, type, owner"
            containerClassName="w-full min-w-[260px] max-w-[420px] h-8"
            className="text-[12px]"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-md border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border bg-muted/20">
                {[
                  "Report Name",
                  "Type",
                  "Owner",
                  "Format",
                  "Schedule",
                  "Last Run",
                  "Status",
                  "Latest Output",
                  "Actions",
                ].map((column) => (
                  <th key={column} className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">{column}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageRows.map((row) => (
                <tr key={row.id} className="border-b border-border/70 last:border-b-0 hover:bg-muted/20" onClick={() => setSelectedReportId(row.id)}>
                  <td className="px-3 py-2.5 text-[12px] font-medium">{row.reportName}</td>
                  <td className="px-3 py-2.5 text-[12px] text-muted-foreground">{row.type}</td>
                  <td className="px-3 py-2.5 text-[12px] text-muted-foreground">{row.owner}</td>
                  <td className="px-3 py-2.5 text-[12px] text-muted-foreground">{row.format}</td>
                  <td className="px-3 py-2.5 text-[12px] text-muted-foreground">{row.schedule.enabled ? `${row.schedule.frequency} · ${row.schedule.timezone}` : "Not Scheduled"}</td>
                  <td className="px-3 py-2.5 text-[12px] text-muted-foreground">{row.lastRun}</td>
                  <td className="px-3 py-2.5 text-[12px]"><span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold ${statusTone(row.status)}`}>{row.status}</span></td>
                  <td className="px-3 py-2.5 text-[12px] text-muted-foreground">{row.latestOutput ?? "No output yet"}</td>
                  <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                    <div className="flex flex-wrap items-center gap-1">
                      <button onClick={() => setEditReport(row)} className="inline-flex items-center gap-1 rounded border border-border px-2 py-1 text-[11px] hover:bg-muted/30"><Pencil className="h-3 w-3" />Edit</button>
                      <button onClick={() => handleRunNow(row)} className="inline-flex items-center gap-1 rounded border border-border px-2 py-1 text-[11px] hover:bg-muted/30"><Play className="h-3 w-3" />Run Now</button>
                      <button
                        onClick={() => handleDownload(row)}
                        disabled={!row.latestOutput}
                        className="inline-flex items-center gap-1 rounded border border-border px-2 py-1 text-[11px] hover:bg-muted/30 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Download className="h-3 w-3" />Download
                      </button>
                      <button onClick={() => setScheduleReport(row)} className="inline-flex items-center gap-1 rounded border border-border px-2 py-1 text-[11px] hover:bg-muted/30"><Calendar className="h-3 w-3" />Schedule</button>
                      <button onClick={() => setMenuReport(row)} className="rounded border border-border p-1 hover:bg-muted/30" title="More"><MoreHorizontal className="h-3.5 w-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {pageRows.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-3 py-8 text-center text-xs text-muted-foreground">No reports match the current search.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-3 py-2.5">
          <p className="text-[11px] text-muted-foreground">
            Showing {(currentPage - 1) * PAGE_SIZE + (pageRows.length ? 1 : 0)}-{(currentPage - 1) * PAGE_SIZE + pageRows.length} of {filteredReports.length}
          </p>
          <div className="flex items-center gap-1">
            <button disabled={currentPage === 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="inline-flex h-7 w-7 items-center justify-center rounded border border-border bg-background disabled:opacity-40"><ChevronLeft className="h-3.5 w-3.5" /></button>
            <span className="px-2 text-[11px]">{currentPage} / {pageCount}</span>
            <button disabled={currentPage === pageCount} onClick={() => setPage((p) => Math.min(pageCount, p + 1))} className="inline-flex h-7 w-7 items-center justify-center rounded border border-border bg-background disabled:opacity-40"><ChevronRight className="h-3.5 w-3.5" /></button>
          </div>
        </div>
      </div>

      {selectedReport && (
        <div className="rounded-md border border-border bg-card p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold">Selected Report: {selectedReport.reportName}</p>
              <p className="text-xs text-muted-foreground">Scope: {selectedReport.scope} · Filters: {selectedReport.filters}</p>
            </div>
            <div className="flex flex-wrap gap-1">
              <button onClick={() => setDetailsReport(selectedReport)} className="rounded border border-border px-2 py-1 text-[11px] hover:bg-muted/30"><Eye className="mr-1 inline h-3 w-3" />View Details</button>
              <button onClick={() => setHistoryReport(selectedReport)} className="rounded border border-border px-2 py-1 text-[11px] hover:bg-muted/30"><Clock3 className="mr-1 inline h-3 w-3" />View Run History</button>
            </div>
          </div>
        </div>
      )}

      {editReport && (
        <Modal title={`Edit Report · ${editReport.reportName}`} onClose={() => setEditReport(null)}>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <label className="block"><span className="mb-1 block text-xs font-semibold text-muted-foreground">Report Name</span><input value={editReport.reportName} onChange={(e) => setEditReport((p) => (p ? { ...p, reportName: e.target.value } : p))} className="h-9 w-full rounded border border-border bg-background px-2 text-sm" /></label>
            <label className="block"><span className="mb-1 block text-xs font-semibold text-muted-foreground">Report Type</span><select value={editReport.type} onChange={(e) => setEditReport((p) => (p ? { ...p, type: e.target.value } : p))} className="h-9 w-full rounded border border-border bg-background px-2 text-sm">{REPORT_TYPES.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label className="block"><span className="mb-1 block text-xs font-semibold text-muted-foreground">Owner</span><select value={editReport.owner} onChange={(e) => setEditReport((p) => (p ? { ...p, owner: e.target.value } : p))} className="h-9 w-full rounded border border-border bg-background px-2 text-sm">{OWNER_OPTIONS.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label className="block"><span className="mb-1 block text-xs font-semibold text-muted-foreground">Output Format</span><select value={editReport.format} onChange={(e) => setEditReport((p) => (p ? { ...p, format: e.target.value as ReportFormat } : p))} className="h-9 w-full rounded border border-border bg-background px-2 text-sm">{FORMAT_OPTIONS.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label className="block md:col-span-2"><span className="mb-1 block text-xs font-semibold text-muted-foreground">Scope</span><input value={editReport.scope} onChange={(e) => setEditReport((p) => (p ? { ...p, scope: e.target.value } : p))} className="h-9 w-full rounded border border-border bg-background px-2 text-sm" /></label>
            <label className="block md:col-span-2"><span className="mb-1 block text-xs font-semibold text-muted-foreground">Filters</span><input value={editReport.filters} onChange={(e) => setEditReport((p) => (p ? { ...p, filters: e.target.value } : p))} className="h-9 w-full rounded border border-border bg-background px-2 text-sm" /></label>
            <label className="block md:col-span-2"><span className="mb-1 block text-xs font-semibold text-muted-foreground">Columns</span><input value={editReport.columns} onChange={(e) => setEditReport((p) => (p ? { ...p, columns: e.target.value } : p))} className="h-9 w-full rounded border border-border bg-background px-2 text-sm" /></label>
            <label className="block md:col-span-2"><span className="mb-1 block text-xs font-semibold text-muted-foreground">Output / Delivery Notes</span><input value={editReport.output} onChange={(e) => setEditReport((p) => (p ? { ...p, output: e.target.value } : p))} className="h-9 w-full rounded border border-border bg-background px-2 text-sm" /></label>
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <button onClick={() => setEditReport(null)} className="rounded border border-border px-3 py-1.5 text-xs">Cancel</button>
            <button
              onClick={() => {
                if (!editReport.reportName.trim()) return;
                updateReport(editReport.id, () => editReport);
                setEditReport(null);
                toast({ title: "Report updated", description: "Configuration changes saved." });
              }}
              className="rounded bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
            >
              Save Changes
            </button>
          </div>
        </Modal>
      )}

      {scheduleReport && (
        <Modal title={`Schedule Report · ${scheduleReport.reportName}`} onClose={() => setScheduleReport(null)}>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <label className="block"><span className="mb-1 block text-xs font-semibold text-muted-foreground">Frequency</span><select value={scheduleReport.schedule.frequency} onChange={(e) => setScheduleReport((p) => (p ? { ...p, schedule: { ...p.schedule, frequency: e.target.value as ScheduleFrequency } } : p))} className="h-9 w-full rounded border border-border bg-background px-2 text-sm">{FREQUENCY_OPTIONS.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label className="block"><span className="mb-1 block text-xs font-semibold text-muted-foreground">Timezone</span><input value={scheduleReport.schedule.timezone} onChange={(e) => setScheduleReport((p) => (p ? { ...p, schedule: { ...p.schedule, timezone: e.target.value } } : p))} className="h-9 w-full rounded border border-border bg-background px-2 text-sm" /></label>
            <label className="block"><span className="mb-1 block text-xs font-semibold text-muted-foreground">Next Run</span><input value={scheduleReport.schedule.nextRun} onChange={(e) => setScheduleReport((p) => (p ? { ...p, schedule: { ...p.schedule, nextRun: e.target.value } } : p))} className="h-9 w-full rounded border border-border bg-background px-2 text-sm" placeholder="YYYY-MM-DD HH:mm" /></label>
            <label className="block"><span className="mb-1 block text-xs font-semibold text-muted-foreground">Delivery Method</span><select value={scheduleReport.schedule.deliveryMethod} onChange={(e) => setScheduleReport((p) => (p ? { ...p, schedule: { ...p.schedule, deliveryMethod: e.target.value as DeliveryMethod } } : p))} className="h-9 w-full rounded border border-border bg-background px-2 text-sm">{DELIVERY_OPTIONS.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label className="block md:col-span-2"><span className="mb-1 block text-xs font-semibold text-muted-foreground">Recipients</span><input value={scheduleReport.schedule.recipients} onChange={(e) => setScheduleReport((p) => (p ? { ...p, schedule: { ...p.schedule, recipients: e.target.value } } : p))} className="h-9 w-full rounded border border-border bg-background px-2 text-sm" placeholder="ops@domain.com; lead@domain.com" /></label>
            <label className="block"><span className="mb-1 block text-xs font-semibold text-muted-foreground">Format</span><select value={scheduleReport.schedule.format} onChange={(e) => setScheduleReport((p) => (p ? { ...p, schedule: { ...p.schedule, format: e.target.value as ReportFormat } } : p))} className="h-9 w-full rounded border border-border bg-background px-2 text-sm">{FORMAT_OPTIONS.map((item) => <option key={item}>{item}</option>)}</select></label>
            <div className="flex items-center gap-2 self-end">
              <button onClick={() => setScheduleReport((p) => (p ? { ...p, schedule: { ...p.schedule, enabled: !p.schedule.enabled } } : p))} className="rounded border border-border px-3 py-1.5 text-xs">
                {scheduleReport.schedule.enabled ? "Pause / Disable" : "Resume / Enable"}
              </button>
              <button onClick={() => setScheduleReport((p) => (p ? { ...p, schedule: { ...p.schedule, enabled: false, nextRun: "" } } : p))} className="rounded border border-border px-3 py-1.5 text-xs">
                Remove Schedule
              </button>
            </div>
          </div>

          <div className="mt-3 flex justify-end gap-2">
            <button onClick={() => setScheduleReport(null)} className="rounded border border-border px-3 py-1.5 text-xs">Cancel</button>
            <button
              onClick={() => {
                if (scheduleReport.schedule.enabled && !scheduleReport.schedule.nextRun.trim()) {
                  toast({ title: "Missing schedule", description: "Next Run is required when schedule is enabled." });
                  return;
                }
                updateReport(scheduleReport.id, () => ({
                  ...scheduleReport,
                  status: scheduleReport.schedule.enabled ? "Active" : "Paused",
                  scheduleHistory: [
                    {
                      id: `sch-${Date.now()}`,
                      changedAt: new Date().toISOString().slice(0, 16).replace("T", " "),
                      action: scheduleReport.schedule.enabled ? "updated" : "paused",
                      summary: scheduleReport.schedule.enabled
                        ? `${scheduleReport.schedule.frequency} / ${scheduleReport.schedule.nextRun || "No next run set"}`
                        : "Schedule paused/disabled",
                    },
                    ...scheduleReport.scheduleHistory,
                  ],
                }));
                setScheduleReport(null);
                toast({ title: "Schedule updated", description: "Schedule settings saved." });
              }}
              className="rounded bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
            >
              Save Schedule
            </button>
          </div>
        </Modal>
      )}

      {detailsReport && (
        <Modal title={`Report Details · ${detailsReport.reportName}`} onClose={() => setDetailsReport(null)}>
          <div className="space-y-1 text-sm">
            <p><strong>Type:</strong> {detailsReport.type}</p>
            <p><strong>Owner:</strong> {detailsReport.owner}</p>
            <p><strong>Scope:</strong> {detailsReport.scope}</p>
            <p><strong>Filters:</strong> {detailsReport.filters}</p>
            <p><strong>Columns:</strong> {detailsReport.columns}</p>
            <p><strong>Output:</strong> {detailsReport.output}</p>
            <p><strong>Schedule:</strong> {detailsReport.schedule.enabled ? `${detailsReport.schedule.frequency} / ${detailsReport.schedule.nextRun}` : "Not Scheduled"}</p>
          </div>
          <div className="mt-3">
            <p className="mb-1 text-xs font-semibold text-muted-foreground">Schedule History</p>
            <div className="space-y-1">
              {detailsReport.scheduleHistory.length === 0 && <p className="text-xs text-muted-foreground">No schedule history yet.</p>}
              {detailsReport.scheduleHistory.map((item) => (
                <div key={item.id} className="rounded border border-border px-2 py-1 text-xs">
                  <p className="font-medium">{item.action.toUpperCase()} · {item.changedAt}</p>
                  <p className="text-muted-foreground">{item.summary}</p>
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}

      {historyReport && (
        <Modal title={`Run History · ${historyReport.reportName}`} onClose={() => setHistoryReport(null)}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/20">
                  {[
                    "Run ID",
                    "Started",
                    "Finished",
                    "Duration",
                    "Status",
                    "Initiated By",
                    "Output",
                    "Error",
                  ].map((h) => (
                    <th key={h} className="px-2 py-2 font-semibold uppercase tracking-[0.06em] text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {historyReport.runHistory.map((run) => (
                  <tr key={run.id} className="border-b border-border/70 last:border-b-0">
                    <td className="px-2 py-2">{run.id}</td>
                    <td className="px-2 py-2">{run.startedAt}</td>
                    <td className="px-2 py-2">{run.finishedAt}</td>
                    <td className="px-2 py-2">{run.duration}</td>
                    <td className="px-2 py-2">{run.status}</td>
                    <td className="px-2 py-2">{run.initiatedBy}</td>
                    <td className="px-2 py-2">{run.outputFile}</td>
                    <td className="px-2 py-2">{run.errorMessage ?? "-"}</td>
                  </tr>
                ))}
                {historyReport.runHistory.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-2 py-6 text-center text-muted-foreground">No run history yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Modal>
      )}

      {menuReport && (
        <Modal title={`More Actions · ${menuReport.reportName}`} onClose={() => setMenuReport(null)}>
          <div className="space-y-2">
            <button onClick={() => { handleDuplicate(menuReport); setMenuReport(null); }} className="w-full rounded border border-border px-3 py-2 text-left text-sm hover:bg-muted/30"><Copy className="mr-2 inline h-3.5 w-3.5" />Duplicate</button>
            <button onClick={() => { setHistoryReport(menuReport); setMenuReport(null); }} className="w-full rounded border border-border px-3 py-2 text-left text-sm hover:bg-muted/30"><Clock3 className="mr-2 inline h-3.5 w-3.5" />View Run History</button>
            <button onClick={() => { updateReport(menuReport.id, (report) => ({ ...report, schedule: { ...report.schedule, enabled: !report.schedule.enabled }, status: report.schedule.enabled ? "Paused" : "Active", scheduleHistory: [{ id: `sch-${Date.now()}`, changedAt: new Date().toISOString().slice(0, 16).replace("T", " "), action: report.schedule.enabled ? "paused" : "resumed", summary: report.schedule.enabled ? "Schedule disabled from quick action" : "Schedule resumed from quick action" }, ...report.scheduleHistory] })); toast({ title: menuReport.schedule.enabled ? "Schedule disabled" : "Schedule enabled", description: menuReport.reportName }); setMenuReport(null); }} className="w-full rounded border border-border px-3 py-2 text-left text-sm hover:bg-muted/30">{menuReport.schedule.enabled ? "Disable Schedule" : "Enable Schedule"}</button>
            <button onClick={() => { setDetailsReport(menuReport); setMenuReport(null); }} className="w-full rounded border border-border px-3 py-2 text-left text-sm hover:bg-muted/30"><Clock3 className="mr-2 inline h-3.5 w-3.5" />View Schedule History</button>
            <button onClick={() => handleDelete(menuReport)} className="w-full rounded border border-rose-300 px-3 py-2 text-left text-sm text-rose-700 hover:bg-rose-50"><Trash2 className="mr-2 inline h-3.5 w-3.5" />Delete</button>
          </div>
        </Modal>
      )}
    </section>
  );
}
