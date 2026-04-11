import { useState } from "react";
import { Copy, Pencil, Plus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

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

export default function ReportCreationWorkspace() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [format, setFormat] = useState<"Excel" | "CSV">("Excel");
  const [filters, setFilters] = useState<string[]>(["Reliability > 90%"]);
  const [channel, setChannel] = useState("Email (SMTP)");
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
  const [newFilter, setNewFilter] = useState("SLA Cov. >= 95%");
  const [newRecipient, setNewRecipient] = useState({ email: "", role: "Viewer" });
  const [rows, setRows] = useState<PreviewRow[]>([
    { id: "p1", reportName: "Monthly Exec Summary", reliability: "98.4%", sla: "97.1%", delivery: "99.3%" },
    { id: "p2", reportName: "Quarterly Compliance", reliability: "96.8%", sla: "95.0%", delivery: "98.2%" },
    { id: "p3", reportName: "SLA Performance Report", reliability: "93.9%", sla: "91.7%", delivery: "94.8%" },
    { id: "p4", reportName: "Data Pipeline Report", reliability: "92.6%", sla: "90.2%", delivery: "93.1%" },
    { id: "p5", reportName: "Regulatory Audit", reliability: "97.9%", sla: "96.4%", delivery: "98.7%" },
    { id: "p6", reportName: "Transport Health", reliability: "94.1%", sla: "93.2%", delivery: "95.4%" },
  ]);

  const OPTIONAL_COLUMNS = ["Owner", "Dataset", "Format", "Schedule", "Status"];

  const visibleRows = rows.filter((row) => {
    return filters.every((filter) => {
      const normalized = filter.toLowerCase();
      const parseThreshold = (text: string) => Number(text.replace(/[^\d.]/g, ""));
      if (normalized.includes("reliability") && normalized.includes(">")) return parseFloat(row.reliability) > parseThreshold(filter);
      if (normalized.includes("sla") && normalized.includes(">")) return parseFloat(row.sla) > parseThreshold(filter);
      if (normalized.includes("delivery") && normalized.includes(">")) return parseFloat(row.delivery) > parseThreshold(filter);
      return true;
    });
  });

  const updateReportName = (rowId: string, value: string) => {
    setRows((prev) => prev.map((row) => (row.id === rowId ? { ...row, reportName: value } : row)));
  };

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-end gap-1.5">
        <button onClick={() => setScheduleOpen(true)} className="rounded-lg border border-border px-3 py-1.5 text-xs">Schedule Report</button>
        <button onClick={() => navigate("/reports-module/report-history")} className="rounded-lg border border-border px-3 py-1.5 text-xs">Report History</button>
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="space-y-3 rounded-xl border border-border bg-card p-3">
          <section className="rounded-lg border border-border bg-background p-3">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Report Format</p>
            <div className="space-y-1.5">
              {(["Excel", "CSV"] as const).map((item) => <button key={item} onClick={() => setFormat(item)} className={cn("w-full rounded-lg border px-2.5 py-1.5 text-left text-sm", format === item ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-muted/30")}>{item}</button>)}
            </div>
          </section>

          <section className="rounded-lg border border-border bg-background p-3">
            <div className="mb-2 flex items-center justify-between"><p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Row Filters</p><span className="text-[10px] text-muted-foreground">{filters.length} active</span></div>
            <div className="space-y-1.5">
              {filters.map((f) => (
                <div key={f} className="flex items-center justify-between rounded-full border border-primary/30 bg-primary/10 px-2 py-1 text-[11px] text-primary">
                  <span>{f}</span>
                  <button onClick={() => setFilters((prev) => prev.filter((x) => x !== f))}>×</button>
                </div>
              ))}
            </div>
            <button onClick={() => setAddFilterOpen(true)} className="mt-2 text-[11px] text-primary hover:underline">Add filter</button>
          </section>

          <section className="rounded-lg border border-border bg-background p-3">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Delivery Channel</p>
            <div className="space-y-1.5">
              {["Email (SMTP)", "SFTP Drop", "REST API Webhook", "Cloud Storage (S3/GCS)"].map((item) => <button key={item} onClick={() => setChannel(item)} className={cn("w-full rounded-lg border px-2.5 py-1.5 text-left text-sm", channel === item ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-muted/30")}>{item}</button>)}
            </div>
          </section>

          <section className="rounded-lg border border-border bg-background p-3">
            <div className="mb-2 flex items-center justify-between"><p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Recipients</p><button onClick={() => setManageOpen(true)} className="text-[11px] text-primary hover:underline">Manage →</button></div>
            <div className="space-y-1">
              {recipients.map((r) => <div key={r.id} className="rounded-lg border border-border px-2 py-1.5"><p className="text-[12px]">{r.email}</p><p className="text-[10px] text-muted-foreground">{r.role}</p></div>)}
            </div>
            <p className="mt-2 text-[10px] text-amber-700">External recipients require DLP review</p>
          </section>
        </aside>

        <main className="rounded-xl border border-border bg-card p-3">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Report Preview</h3>
            <div className="flex gap-1.5">
              <button onClick={() => setColumnPickerOpen(true)} className="inline-flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-xs"><Plus className="h-3 w-3" />Add Column</button>
              <button onClick={() => toast({ title: "Report created", description: `${format} report is ready with ${rows.length} rows.` })} className="rounded-lg bg-primary px-2.5 py-1.5 text-xs font-semibold text-primary-foreground">Create</button>
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
                      if (column === "Dataset") return <td key={`${row.id}-${column}`} className={baseCellClass} onClick={() => setActiveCell({ rowId: row.id, column })}>{row.dataset ?? "Unified KPI Mart"}</td>;
                      if (column === "Format") return <td key={`${row.id}-${column}`} className={baseCellClass} onClick={() => setActiveCell({ rowId: row.id, column })}>{row.format ?? format}</td>;
                      if (column === "Schedule") return <td key={`${row.id}-${column}`} className={baseCellClass} onClick={() => setActiveCell({ rowId: row.id, column })}>{row.schedule ?? "Daily"}</td>;
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

          <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
            <p>{visibleRows.length} rows · {columns.length} columns</p>
            <p><span className="text-emerald-700">green</span> = &gt;= 95% · <span className="text-orange-600">orange</span> = &lt; 95% threshold</p>
            <p className="font-semibold text-foreground">Ready to export</p>
          </div>
        </main>
      </div>

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
            <button onClick={() => { setFilters((p) => [...p, newFilter]); setAddFilterOpen(false); }} className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">Add</button>
          </div>
        </Modal>
      )}

      {scheduleOpen && (
        <Modal title="Schedule Report" onClose={() => setScheduleOpen(false)}>
          <p className="text-sm">Scheduling request queued for next available wave.</p>
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
