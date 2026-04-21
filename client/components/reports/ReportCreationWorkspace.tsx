import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Copy, Pencil, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import AdvancedReportBuilder from "@/components/reports/AdvancedReportBuilder";
import * as XLSX from "xlsx";

type CreationMode = "guided" | "visual";

interface Recipient {
  id: string;
  email: string;
  role: string;
}

interface PreviewRow {
  id: string;
  reportName: string;
  reliability: string;
  sla: string;
  delivery: string;
  dataset?: string;
  format?: string;
  schedule?: string;
  status?: string;
  owner?: string;
}

interface ReportDraft {
  mode: CreationMode;
  name: string;
  type: string;
  description: string;
  dataCategory: "KPI" | "Alarm" | "Automation" | "AI" | "Scheduler";
  dataSource: string;
  scope: {
    tenant: string;
    region: string;
    site: string;
    cluster: string;
    vendor: string;
    technology: string;
    cell: string;
  };
  filters: string[];
  timeWindow: string;
  timeGranularity: string;
  aggregation: string;
  format: "Excel" | "CSV";
  schedule: string;
  deliveryChannel: string;
}

interface RunRecord {
  id: string;
  reportName: string;
  mode: CreationMode;
  format: "Excel" | "CSV";
  status: "success";
  generatedAt: string;
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl rounded-xl border border-border bg-card shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-4 py-3"><h3 className="text-sm font-semibold">{title}</h3><button onClick={onClose} className="rounded-lg px-2 py-1 text-xs hover:bg-muted">Close</button></div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

interface ReportCreationWorkspaceProps {
  initialMode?: CreationMode;
}

export default function ReportCreationWorkspace({ initialMode = "guided" }: ReportCreationWorkspaceProps) {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [draft, setDraft] = useState<ReportDraft>({
    mode: initialMode,
    name: "",
    type: "KPI Report",
    description: "",
    dataCategory: "KPI",
    dataSource: "Unified KPI Mart",
    scope: {
      tenant: "Tenant A",
      region: "Cairo",
      site: "Cairo-NR-01",
      cluster: "North Cluster",
      vendor: "Huawei",
      technology: "LTE",
      cell: "Cell-01",
    },
    filters: ["Reliability > 90%"],
    timeWindow: "Last 30 Days",
    timeGranularity: "Daily",
    aggregation: "Average",
    format: "Excel",
    schedule: "Weekly · Fri 09:00",
    deliveryChannel: "Email (SMTP)",
  });

  useEffect(() => {
    setDraft((prev) => ({ ...prev, mode: initialMode }));
  }, [initialMode]);

  const [recipients, setRecipients] = useState<Recipient[]>([
    { id: "r1", email: "ops-team@telco.com", role: "Admin" },
    { id: "r2", email: "cto@telco.com", role: "Exec" },
    { id: "r3", email: "vendor-bo@partner.net", role: "External" },
  ]);

  const [selectedRow, setSelectedRow] = useState<string | null>(null);
  const [activeCell, setActiveCell] = useState<{ rowId: string; column: string } | null>(null);
  const [editingCell, setEditingCell] = useState<{ rowId: string; column: string } | null>(null);
  const [columns, setColumns] = useState(["#", "Report Name", "Reliability", "SLA Cov.", "Delivery Rate", "Actions"]);
  const [manageOpen, setManageOpen] = useState(false);
  const [addFilterOpen, setAddFilterOpen] = useState(false);
  const [columnPickerOpen, setColumnPickerOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [newFilter, setNewFilter] = useState("SLA Cov. >= 95%");
  const [newRecipient, setNewRecipient] = useState({ email: "", role: "Viewer" });
  const [savedReportsCount, setSavedReportsCount] = useState(0);
  const [runs, setRuns] = useState<RunRecord[]>([]);
  const [rows, setRows] = useState<PreviewRow[]>([
    { id: "p1", reportName: "Monthly Exec Summary", reliability: "98.4%", sla: "97.1%", delivery: "99.3%" },
    { id: "p2", reportName: "Quarterly Compliance", reliability: "96.8%", sla: "95.0%", delivery: "98.2%" },
    { id: "p3", reportName: "SLA Performance Report", reliability: "93.9%", sla: "91.7%", delivery: "94.8%" },
    { id: "p4", reportName: "Data Pipeline Report", reliability: "92.6%", sla: "90.2%", delivery: "93.1%" },
    { id: "p5", reportName: "Regulatory Audit", reliability: "97.9%", sla: "96.4%", delivery: "98.7%" },
    { id: "p6", reportName: "Transport Health", reliability: "94.1%", sla: "93.2%", delivery: "95.4%" },
  ]);

  const OPTIONAL_COLUMNS = ["Owner", "Dataset", "Format", "Schedule", "Status"];
  const TIME_WINDOWS = ["Last 24 Hours", "Last 7 Days", "Last 30 Days", "Last 90 Days", "Custom Range"];
  const TIME_GRANULARITIES = ["5 Minutes", "15 Minutes", "Hourly", "Daily", "Weekly", "Monthly"];
  const AGGREGATIONS = ["Count", "Sum", "Average", "Min", "Max", "Rate", "Percentage", "Latest Value", "Top N"];
  const DATA_SOURCES = [
    "Alarm Management",
    "Automation",
    "Topology",
    "Performance",
    "AI",
    "Scheduler",
  ];

  const visibleRows = rows.filter((row) => {
    return draft.filters.every((filter) => {
      const normalized = filter.toLowerCase();
      const parseThreshold = (text: string) => Number(text.replace(/[^\d.]/g, ""));
      if (normalized.includes("reliability") && normalized.includes(">")) return parseFloat(row.reliability) > parseThreshold(filter);
      if (normalized.includes("sla") && normalized.includes(">")) return parseFloat(row.sla) > parseThreshold(filter);
      if (normalized.includes("delivery") && normalized.includes(">")) return parseFloat(row.delivery) > parseThreshold(filter);
      return true;
    });
  });

  const exportRows = visibleRows.map((row, index) => {
    const base = {
      "#": index + 1,
      "Report Name": row.reportName,
      Reliability: row.reliability,
      "SLA Cov.": row.sla,
      "Delivery Rate": row.delivery,
    } as Record<string, string | number>;

    if (columns.includes("Owner")) base.Owner = row.owner ?? "Ops BI";
    if (columns.includes("Dataset")) base.Dataset = row.dataset ?? draft.dataSource;
    if (columns.includes("Format")) base.Format = row.format ?? draft.format;
    if (columns.includes("Schedule")) base.Schedule = row.schedule ?? draft.schedule;
    if (columns.includes("Status")) base.Status = row.status ?? "Ready";
    return base;
  });

  const updateReportName = (rowId: string, value: string) => {
    setRows((prev) => prev.map((row) => (row.id === rowId ? { ...row, reportName: value } : row)));
  };

  const downloadReportFile = () => {
    const reportBaseName = (draft.name || "Report").replace(/\s+/g, "_");
    if (draft.format === "Excel") {
      const worksheet = XLSX.utils.json_to_sheet(exportRows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
      const workbookArray = XLSX.write(workbook, { type: "array", bookType: "xlsx" });
      const blob = new Blob([workbookArray], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${reportBaseName}.xlsx`;
      link.click();
      URL.revokeObjectURL(url);
      toast({ title: "Download complete", description: `${reportBaseName}.xlsx generated.` });
      return;
    }

    const csvHeader = Object.keys(exportRows[0] ?? { "Report Name": "" }).join(",");
    const csvBody = exportRows
      .map((row) =>
        Object.values(row)
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\n");
    const csv = `${csvHeader}\n${csvBody}`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${reportBaseName}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast({ title: "Download complete", description: `${reportBaseName}.csv generated.` });
  };

  const generatePreviewRows = () => {
    const regionTag = draft.scope.region.slice(0, 3).toUpperCase() || "REG";
    const techTag = draft.scope.technology || "TECH";
    const seededRows: PreviewRow[] = Array.from({ length: 6 }).map((_, idx) => ({
      id: `gen-${Date.now()}-${idx}`,
      reportName: `${draft.type} ${regionTag}-${idx + 1}`,
      reliability: `${(92 + ((idx * 13) % 8)).toFixed(1)}%`,
      sla: `${(90 + ((idx * 11) % 9)).toFixed(1)}%`,
      delivery: `${(93 + ((idx * 7) % 6)).toFixed(1)}%`,
      dataset: draft.dataSource,
      format: draft.format,
      schedule: draft.schedule,
      status: "Ready",
      owner: "Ops BI",
    }));
    setRows(seededRows);
    toast({
      title: "Preview refreshed",
      description: `Preview updated using ${draft.dataCategory} · ${draft.timeWindow} · ${draft.timeGranularity}.`,
    });
  };

  const handleCreateReport = () => {
    if (!draft.name.trim()) {
      toast({ title: "Report name required", description: "Set Report Basics → Report Name before creating." });
      return;
    }
    setSavedReportsCount((prev) => prev + 1);
    toast({ title: "Report definition saved", description: `${draft.name} saved in ${draft.mode} mode.` });
  };

  const handleRunReport = () => {
    const generatedAt = new Date().toISOString().slice(0, 19).replace("T", " ");
    const run: RunRecord = {
      id: `run-${Date.now()}`,
      reportName: draft.name || "Untitled Report",
      mode: draft.mode,
      format: draft.format,
      status: "success",
      generatedAt,
    };
    setRuns((prev) => [run, ...prev]);
    toast({ title: "Run complete", description: `${run.reportName} generated in ${run.format}.` });
  };

  return (
    <section className="space-y-3">
      <div className="rounded-xl border border-border bg-card p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold">Report Creation</h3>
            <p className="text-xs text-muted-foreground">One module with two creation styles using the same report model. Saved definitions: {savedReportsCount}</p>
          </div>
          <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/20 p-1">
            <button
              onClick={() => setDraft((prev) => ({ ...prev, mode: "guided" }))}
              className={cn("rounded-md px-3 py-1.5 text-xs font-medium", draft.mode === "guided" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground")}
            >
              Guided Mode
            </button>
            <button
              onClick={() => setDraft((prev) => ({ ...prev, mode: "visual" }))}
              className={cn("rounded-md px-3 py-1.5 text-xs font-medium", draft.mode === "visual" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground")}
            >
              Visual Mode
            </button>
          </div>
        </div>
      </div>

      {draft.mode === "visual" ? (
        <div className="space-y-2">
          <div className="rounded-lg border border-border bg-card p-2 text-xs text-muted-foreground">
            Visual Mode is used for visual/legacy Report &amp; Viz Builder definitions. Saving keeps this report in <strong className="text-foreground">mode=visual</strong>.
          </div>
          <AdvancedReportBuilder />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            <section className="rounded-lg border border-border bg-card p-3">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Report Basics</p>
              <div className="space-y-2 text-xs">
                <input value={draft.name} onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value }))} placeholder="Report Name" className="h-8 w-full rounded border border-border px-2" />
                <select value={draft.type} onChange={(e) => setDraft((p) => ({ ...p, type: e.target.value }))} className="h-8 w-full rounded border border-border bg-background px-2">
                  {["KPI Report", "Alarm Report", "Site Summary Report", "Activity / Audit Report"].map((item) => <option key={item}>{item}</option>)}
                </select>
                <select value={draft.dataCategory} onChange={(e) => setDraft((p) => ({ ...p, dataCategory: e.target.value as ReportDraft["dataCategory"] }))} className="h-8 w-full rounded border border-border bg-background px-2">
                  {["KPI", "Alarm", "Automation", "AI", "Scheduler"].map((item) => <option key={item}>{item}</option>)}
                </select>
                <input value={draft.description} onChange={(e) => setDraft((p) => ({ ...p, description: e.target.value }))} placeholder="Description" className="h-8 w-full rounded border border-border px-2" />
              </div>
            </section>
            <section className="rounded-lg border border-border bg-card p-3">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Data Sources</p>
              <select value={draft.dataSource} onChange={(e) => setDraft((p) => ({ ...p, dataSource: e.target.value }))} className="h-8 w-full rounded border border-border bg-background px-2 text-xs">
                {DATA_SOURCES.map((item) => <option key={item}>{item}</option>)}
              </select>
            </section>
            <section className="rounded-lg border border-border bg-card p-3">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Scope</p>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                <select value={draft.scope.tenant} onChange={(e) => setDraft((p) => ({ ...p, scope: { ...p.scope, tenant: e.target.value } }))} className="h-8 rounded border border-border bg-background px-2"><option>Tenant A</option><option>Tenant B</option></select>
                <select value={draft.scope.region} onChange={(e) => setDraft((p) => ({ ...p, scope: { ...p.scope, region: e.target.value } }))} className="h-8 rounded border border-border bg-background px-2"><option>Cairo</option><option>Alexandria</option><option>Giza</option></select>
                <select value={draft.scope.site} onChange={(e) => setDraft((p) => ({ ...p, scope: { ...p.scope, site: e.target.value } }))} className="h-8 rounded border border-border bg-background px-2"><option>Cairo-NR-01</option><option>Alex-LTE-02</option></select>
                <select value={draft.scope.cluster} onChange={(e) => setDraft((p) => ({ ...p, scope: { ...p.scope, cluster: e.target.value } }))} className="h-8 rounded border border-border bg-background px-2"><option>North Cluster</option><option>South Cluster</option></select>
                <select value={draft.scope.vendor} onChange={(e) => setDraft((p) => ({ ...p, scope: { ...p.scope, vendor: e.target.value } }))} className="h-8 rounded border border-border bg-background px-2"><option>Huawei</option><option>Ericsson</option><option>Nokia</option></select>
                <select value={draft.scope.technology} onChange={(e) => setDraft((p) => ({ ...p, scope: { ...p.scope, technology: e.target.value } }))} className="h-8 rounded border border-border bg-background px-2"><option>LTE</option><option>5G NR</option><option>UMTS</option></select>
              </div>
            </section>
            <section className="rounded-lg border border-border bg-card p-3">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Time Definition</p>
              <div className="space-y-1.5 text-xs">
                <select value={draft.timeWindow} onChange={(e) => setDraft((p) => ({ ...p, timeWindow: e.target.value }))} className="h-8 w-full rounded border border-border bg-background px-2">{TIME_WINDOWS.map((item) => <option key={item}>{item}</option>)}</select>
                <select value={draft.timeGranularity} onChange={(e) => setDraft((p) => ({ ...p, timeGranularity: e.target.value }))} className="h-8 w-full rounded border border-border bg-background px-2">{TIME_GRANULARITIES.map((item) => <option key={item}>{item}</option>)}</select>
                <select value={draft.aggregation} onChange={(e) => setDraft((p) => ({ ...p, aggregation: e.target.value }))} className="h-8 w-full rounded border border-border bg-background px-2">{AGGREGATIONS.map((item) => <option key={item}>{item}</option>)}</select>
              </div>
            </section>
          </div>

          <div className="flex items-center justify-end gap-1.5">
            <button onClick={() => setScheduleOpen(true)} className="rounded-lg border border-border px-3 py-1.5 text-xs">Schedule</button>
            <button onClick={() => setHistoryOpen(true)} className="rounded-lg border border-border px-3 py-1.5 text-xs">Report History</button>
            <button onClick={() => navigate("/reports-module/report-history")} className="rounded-lg border border-border px-3 py-1.5 text-xs">Open Full History</button>
          </div>

          <div className="grid grid-cols-1 gap-3 xl:grid-cols-[300px_minmax(0,1fr)]">
            <aside className="space-y-3 rounded-xl border border-border bg-card p-3">
              <section className="rounded-lg border border-border bg-background p-3">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Output Format</p>
                <div className="space-y-1.5">
                  {(["Excel", "CSV"] as const).map((item) => <button key={item} onClick={() => setDraft((p) => ({ ...p, format: item }))} className={cn("w-full rounded-lg border px-2.5 py-1.5 text-left text-sm", draft.format === item ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-muted/30")}>{item}</button>)}
                </div>
              </section>

              <section className="rounded-lg border border-border bg-background p-3">
                <div className="mb-2 flex items-center justify-between"><p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Filters</p><span className="text-[10px] text-muted-foreground">{draft.filters.length} active</span></div>
                <div className="space-y-1.5">
                  {draft.filters.map((f) => (
                    <div key={f} className="flex items-center justify-between rounded-full border border-primary/30 bg-primary/10 px-2 py-1 text-[11px] text-primary">
                      <span>{f}</span>
                      <button onClick={() => setDraft((p) => ({ ...p, filters: p.filters.filter((x) => x !== f) }))}>×</button>
                    </div>
                  ))}
                </div>
                <button onClick={() => setAddFilterOpen(true)} className="mt-2 text-[11px] text-primary hover:underline">Add filter</button>
              </section>

              <section className="rounded-lg border border-border bg-background p-3">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Delivery</p>
                <div className="space-y-1.5">
                  {["Email (SMTP)", "SFTP Drop", "REST API Webhook", "Cloud Storage (S3/GCS)"].map((item) => <button key={item} onClick={() => setDraft((p) => ({ ...p, deliveryChannel: item }))} className={cn("w-full rounded-lg border px-2.5 py-1.5 text-left text-sm", draft.deliveryChannel === item ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-muted/30")}>{item}</button>)}
                </div>
              </section>

              <section className="rounded-lg border border-border bg-background p-3">
                <div className="mb-2 flex items-center justify-between"><p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Recipients</p><button onClick={() => setManageOpen(true)} className="text-[11px] text-primary hover:underline">Manage →</button></div>
                <div className="space-y-1">
                  {recipients.map((r) => <div key={r.id} className="rounded-lg border border-border px-2 py-1.5"><p className="text-[12px]">{r.email}</p><p className="text-[10px] text-muted-foreground">{r.role}</p></div>)}
                </div>
              </section>
            </aside>

            <main className="rounded-xl border border-border bg-card p-3">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-semibold">Guided Mode Preview</h3>
                <div className="flex gap-1.5">
                  <button onClick={() => setColumnPickerOpen(true)} className="inline-flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-xs"><Plus className="h-3 w-3" />Add Column</button>
                  <button onClick={generatePreviewRows} className="rounded-lg border border-border px-2.5 py-1.5 text-xs">Preview</button>
                  <button onClick={handleRunReport} className="rounded-lg border border-border px-2.5 py-1.5 text-xs">Run Report</button>
                  <button onClick={downloadReportFile} className="rounded-lg border border-border px-2.5 py-1.5 text-xs">Download {draft.format}</button>
                  <button
                    onClick={handleCreateReport}
                    className="rounded-lg bg-primary px-2.5 py-1.5 text-xs font-semibold text-primary-foreground"
                  >
                    Create
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-border bg-muted/20">{columns.map((c) => <th key={c} className="border-r border-border/80 px-2 py-1.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground last:border-r-0">{c}</th>)}</tr>
                  </thead>
                  <tbody>
                    {visibleRows.map((row, idx) => (
                      <tr key={row.id} onClick={() => setSelectedRow(row.id)} className={cn("cursor-pointer border-b border-border/80 last:border-b-0", selectedRow === row.id ? "bg-primary/5" : "hover:bg-muted/15")}>
                        {columns.map((column) => {
                          const isActive = activeCell?.rowId === row.id && activeCell.column === column;
                          const baseCellClass = cn("border-r border-border/70 px-2 py-1.5 text-[12px] last:border-r-0", isActive && "ring-1 ring-inset ring-primary");
                          if (column === "#") return <td key={`${row.id}-${column}`} className={baseCellClass} onClick={() => setActiveCell({ rowId: row.id, column })}>{idx + 1}</td>;
                          if (column === "Report Name")
                            return (
                              <td key={`${row.id}-${column}`} className={baseCellClass} onClick={() => { setActiveCell({ rowId: row.id, column }); setEditingCell({ rowId: row.id, column }); }}>
                                {editingCell?.rowId === row.id ? (
                                  <input autoFocus value={row.reportName} onChange={(e) => updateReportName(row.id, e.target.value)} onBlur={() => setEditingCell(null)} className="h-7 w-full rounded border border-border px-1.5 text-[12px]" />
                                ) : (
                                  <span className="font-medium">{row.reportName}</span>
                                )}
                              </td>
                            );
                          if (column === "Reliability") return <td key={`${row.id}-${column}`} className={cn(baseCellClass, parseFloat(row.reliability) >= 95 ? "text-emerald-700" : "text-orange-600")} onClick={() => setActiveCell({ rowId: row.id, column })}>{row.reliability}</td>;
                          if (column === "SLA Cov.") return <td key={`${row.id}-${column}`} className={cn(baseCellClass, parseFloat(row.sla) >= 95 ? "text-emerald-700" : "text-orange-600")} onClick={() => setActiveCell({ rowId: row.id, column })}>{row.sla}</td>;
                          if (column === "Delivery Rate") return <td key={`${row.id}-${column}`} className={cn(baseCellClass, parseFloat(row.delivery) >= 95 ? "text-emerald-700" : "text-orange-600")} onClick={() => setActiveCell({ rowId: row.id, column })}>{row.delivery}</td>;
                          if (column === "Owner") return <td key={`${row.id}-${column}`} className={baseCellClass} onClick={() => setActiveCell({ rowId: row.id, column })}>{row.owner ?? "Ops BI"}</td>;
                          if (column === "Dataset") return <td key={`${row.id}-${column}`} className={baseCellClass} onClick={() => setActiveCell({ rowId: row.id, column })}>{row.dataset ?? draft.dataSource}</td>;
                          if (column === "Format") return <td key={`${row.id}-${column}`} className={baseCellClass} onClick={() => setActiveCell({ rowId: row.id, column })}>{row.format ?? draft.format}</td>;
                          if (column === "Schedule") return <td key={`${row.id}-${column}`} className={baseCellClass} onClick={() => setActiveCell({ rowId: row.id, column })}>{row.schedule ?? draft.schedule}</td>;
                          if (column === "Status") return <td key={`${row.id}-${column}`} className={baseCellClass} onClick={() => setActiveCell({ rowId: row.id, column })}>{row.status ?? "Ready"}</td>;
                          return (
                            <td key={`${row.id}-${column}`} className={baseCellClass} onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-end gap-1">
                                <button onClick={() => setEditingCell({ rowId: row.id, column: "Report Name" })} className="rounded border border-border p-1" title="Edit"><Pencil className="h-3 w-3" /></button>
                                <button onClick={() => setRows((prev) => [...prev, { ...row, id: `dup-${Date.now()}`, reportName: `${row.reportName} Copy` }])} className="rounded border border-border p-1" title="Duplicate"><Copy className="h-3 w-3" /></button>
                                <button onClick={() => setRows((prev) => prev.filter((r) => r.id !== row.id))} className="rounded border border-border p-1 text-rose-600" title="Delete"><Trash2 className="h-3 w-3" /></button>
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </main>
          </div>
        </>
      )}

      {manageOpen && (
        <Modal title="Manage Recipients" onClose={() => setManageOpen(false)}>
          <div className="space-y-2">
            {recipients.map((r) => (
              <div key={r.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                <p className="text-sm">{r.email} <span className="text-xs text-muted-foreground">— {r.role}</span></p>
                <button onClick={() => setRecipients((p) => p.filter((x) => x.id !== r.id))} className="text-xs text-rose-600">Remove</button>
              </div>
            ))}
            <div className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_120px_auto]">
              <input value={newRecipient.email} onChange={(e) => setNewRecipient((p) => ({ ...p, email: e.target.value }))} placeholder="email@domain.com" className="h-9 rounded-xl border border-border px-3 text-sm" />
              <input value={newRecipient.role} onChange={(e) => setNewRecipient((p) => ({ ...p, role: e.target.value }))} className="h-9 rounded-xl border border-border px-3 text-sm" />
              <button onClick={() => { if (!newRecipient.email) return; setRecipients((p) => [...p, { id: `r-${Date.now()}`, ...newRecipient }]); setNewRecipient({ email: "", role: "Viewer" }); }} className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">Add</button>
            </div>
          </div>
        </Modal>
      )}

      {addFilterOpen && (
        <Modal title="Add Filter" onClose={() => setAddFilterOpen(false)}>
          <input value={newFilter} onChange={(e) => setNewFilter(e.target.value)} className="h-9 w-full rounded-xl border border-border px-3 text-sm" />
          <div className="mt-3 flex justify-end gap-2">
            <button onClick={() => setAddFilterOpen(false)} className="rounded-lg border border-border px-3 py-1.5 text-xs">Cancel</button>
            <button onClick={() => { setDraft((p) => ({ ...p, filters: [...p.filters, newFilter] })); setAddFilterOpen(false); }} className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">Add</button>
          </div>
        </Modal>
      )}

      {scheduleOpen && (
        <Modal title="Schedule Report" onClose={() => setScheduleOpen(false)}>
          <div className="grid grid-cols-2 gap-2">
            <select value={draft.schedule} onChange={(e) => setDraft((p) => ({ ...p, schedule: e.target.value }))} className="h-9 rounded-xl border border-border px-3 text-sm">
              <option>Run Once · Immediate</option>
              <option>Daily · 06:00</option>
              <option>Weekly · Fri 09:00</option>
              <option>Monthly · Day 1 07:00</option>
            </select>
            <select value={draft.deliveryChannel} onChange={(e) => setDraft((p) => ({ ...p, deliveryChannel: e.target.value }))} className="h-9 rounded-xl border border-border px-3 text-sm">
              <option>Email (SMTP)</option>
              <option>SFTP Drop</option>
              <option>REST API Webhook</option>
              <option>Cloud Storage (S3/GCS)</option>
            </select>
          </div>
          <div className="mt-3 flex justify-end">
            <button onClick={() => { setScheduleOpen(false); toast({ title: "Schedule updated", description: `Report schedule set to ${draft.schedule}.` }); }} className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">Save</button>
          </div>
        </Modal>
      )}

      {historyOpen && (
        <Modal title="Report Run History" onClose={() => setHistoryOpen(false)}>
          <div className="space-y-2 text-xs">
            {runs.length === 0 && <p className="text-muted-foreground">No runs yet. Use \"Run Report\" to generate execution history.</p>}
            {runs.map((run) => (
              <div key={run.id} className="rounded border border-border px-3 py-2">
                <p className="font-semibold">{run.reportName}</p>
                <p className="text-muted-foreground">{run.generatedAt} · {run.mode} · {run.format} · {run.status}</p>
              </div>
            ))}
          </div>
        </Modal>
      )}

      {columnPickerOpen && (
        <Modal title="Column Picker" onClose={() => setColumnPickerOpen(false)}>
          <div className="space-y-2">
            {OPTIONAL_COLUMNS.map((col) => {
              const checked = columns.includes(col);
              return (
                <label key={col} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => {
                      setColumns((prev) => {
                        const base = prev.filter((x) => x !== "Actions" && !OPTIONAL_COLUMNS.includes(x));
                        const optional = checked ? prev.filter((x) => OPTIONAL_COLUMNS.includes(x) && x !== col) : [...prev.filter((x) => OPTIONAL_COLUMNS.includes(x)), col];
                        return [...base, ...optional, "Actions"];
                      });
                    }}
                  />
                  {col}
                </label>
              );
            })}
          </div>
        </Modal>
      )}
    </section>
  );
}
