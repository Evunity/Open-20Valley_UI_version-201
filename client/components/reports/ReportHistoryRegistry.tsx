import { useMemo, useState } from "react";
import { Download, Eye, MoreHorizontal } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import SearchableDropdown from "@/components/SearchableDropdown";
import { cn } from "@/lib/utils";
import { SearchBar } from "@/components/ui/search-bar";

interface HistoryRow {
  id: string;
  reportName: string;
  type: string;
  dateGenerated: string;
  period: string;
  owner: string;
  format: string;
  status: "Delivered" | "Archived" | "Frozen";
}

const ROWS: HistoryRow[] = [
  { id: "h1", reportName: "Monthly SLA Compliance Pack", type: "Regulatory", dateGenerated: "2026-03-31", period: "Mar 2026", owner: "Compliance Team", format: "PDF", status: "Delivered" },
  { id: "h2", reportName: "Weekly NOC Performance Brief", type: "Operational", dateGenerated: "2026-04-07", period: "Week 14", owner: "NOC Ops", format: "PPTX", status: "Delivered" },
  { id: "h3", reportName: "Vendor Scorecard — Ericsson Q1", type: "Vendor", dateGenerated: "2026-04-01", period: "Q1 2026", owner: "Procurement BI", format: "XLSX", status: "Archived" },
  { id: "h4", reportName: "Transport KPI Regulatory Filing", type: "Regulatory", dateGenerated: "2026-04-03", period: "Mar 2026", owner: "SLA Office", format: "PDF", status: "Frozen" },
  { id: "h5", reportName: "Board Summary — Q4 2025", type: "Board", dateGenerated: "2026-01-08", period: "Q4 2025", owner: "Executive PMO", format: "PDF", status: "Archived" },
  { id: "h6", reportName: "Alarm Trend Analysis — Cairo", type: "Executive", dateGenerated: "2026-04-08", period: "Last 30 Days", owner: "Analytics CoE", format: "PPTX", status: "Delivered" },
  { id: "h7", reportName: "NOC Daily — 2025-12-20", type: "NOC Daily", dateGenerated: "2025-12-20", period: "Daily", owner: "NOC Ops", format: "HTML", status: "Archived" },
  { id: "h8", reportName: "Evidence Pack — Incident #4821", type: "Evidence", dateGenerated: "2026-04-09", period: "Incident Window", owner: "Audit Team", format: "ZIP", status: "Delivered" },
];

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl rounded-xl border border-border bg-card shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h3 className="text-sm font-semibold">{title}</h3>
          <button onClick={onClose} className="rounded-lg px-2 py-1 text-xs hover:bg-muted">Close</button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

export default function ReportHistoryRegistry() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState("Last 30 Days");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [detailRow, setDetailRow] = useState<HistoryRow | null>(null);
  const PAGE_SIZE = 8;

  const filtered = useMemo(() => {
    return ROWS.filter((row) => {
      const q = search.toLowerCase();
      const searchOk = row.reportName.toLowerCase().includes(q) || row.owner.toLowerCase().includes(q) || row.type.toLowerCase().includes(q);
      const typeOk = typeFilter === "All Types" || row.type === typeFilter;
      const statusOk = statusFilter === "All Statuses" || row.status === statusFilter;
      const dateOk = dateRange === "Last 30 Days" ? row.dateGenerated >= "2026-03-12" : dateRange === "Last 90 Days" ? row.dateGenerated >= "2026-01-12" : true;
      return searchOk && typeOk && statusOk && dateOk;
    });
  }, [search, typeFilter, statusFilter, dateRange]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const toggleAll = () => {
    if (selectedIds.length === visible.length) setSelectedIds([]);
    else setSelectedIds(visible.map((v) => v.id));
  };

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-end">
        <button onClick={() => toast({ title: "Bulk export started", description: `${selectedIds.length || visible.length} reports queued for export.` })} className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">Bulk Export</button>
      </div>

      <div className="grid grid-cols-1 gap-2 rounded-xl border border-border bg-card p-3 md:grid-cols-[1.8fr_1fr_1fr_1fr]">
        <SearchBar value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search reports by name, owner, or dataset..." containerClassName="h-9 rounded-xl" className="text-sm" />
        <SearchableDropdown label="" compact multiSelect={false} options={["Last 30 Days", "Last 90 Days", "All Time"]} selected={[dateRange]} onChange={(v) => { setDateRange(v[0] ?? "Last 30 Days"); setPage(1); }} dropdownId="history-date" />
        <SearchableDropdown label="" compact multiSelect={false} options={["All Types", "Regulatory", "Executive", "Vendor", "Board", "Operational", "NOC Daily", "Evidence"]} selected={[typeFilter]} onChange={(v) => { setTypeFilter(v[0] ?? "All Types"); setPage(1); }} dropdownId="history-type" />
        <SearchableDropdown label="" compact multiSelect={false} options={["All Statuses", "Delivered", "Archived", "Frozen"]} selected={[statusFilter]} onChange={(v) => { setStatusFilter(v[0] ?? "All Statuses"); setPage(1); }} dropdownId="history-status" />
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border bg-muted/20">
                <th className="px-3 py-2"><input type="checkbox" checked={selectedIds.length === visible.length && visible.length > 0} onChange={toggleAll} /></th>
                {["Report Name", "Type", "Date Generated", "Period", "Owner", "Format", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map((row) => (
                <tr key={row.id} onClick={() => setDetailRow(row)} className="cursor-pointer border-b border-border/70 hover:bg-muted/20 last:border-b-0">
                  <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}><input type="checkbox" checked={selectedIds.includes(row.id)} onChange={() => setSelectedIds((p) => (p.includes(row.id) ? p.filter((id) => id !== row.id) : [...p, row.id]))} /></td>
                  <td className="px-3 py-2.5 text-[12px] font-medium">{row.reportName}</td>
                  <td className="px-3 py-2.5 text-[12px]">{row.type}</td>
                  <td className="px-3 py-2.5 text-[12px] text-muted-foreground">{row.dateGenerated}</td>
                  <td className="px-3 py-2.5 text-[12px] text-muted-foreground">{row.period}</td>
                  <td className="px-3 py-2.5 text-[12px] text-muted-foreground">{row.owner}</td>
                  <td className="px-3 py-2.5 text-[12px] text-muted-foreground">{row.format}</td>
                  <td className="px-3 py-2.5">
                    <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-semibold", row.status === "Delivered" ? "border-emerald-600/30 bg-emerald-500/10 text-emerald-700" : row.status === "Archived" ? "border-slate-600/30 bg-slate-500/10 text-slate-700" : "border-violet-600/30 bg-violet-500/10 text-violet-700")}>{row.status}</span>
                  </td>
                  <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-1">
                      <button onClick={() => setDetailRow(row)} className="rounded border border-border p-1.5 hover:bg-muted/30" title="View"><Eye className="h-3.5 w-3.5" /></button>
                      <button onClick={() => toast({ title: "Download started", description: `${row.reportName} (${row.format})` })} className="rounded border border-border p-1.5 hover:bg-muted/30" title="Download"><Download className="h-3.5 w-3.5" /></button>
                      <button onClick={() => toast({ title: "More actions", description: `${row.reportName} actions opened.` })} className="rounded border border-border p-1.5 hover:bg-muted/30" title="More"><MoreHorizontal className="h-3.5 w-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-border px-3 py-2.5">
          <p className="text-[11px] text-muted-foreground">Showing 1–8 of 1,247 reports</p>
          <div className="flex items-center gap-1">
            <button disabled={currentPage === 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="rounded-lg border border-border px-2 py-1 text-xs disabled:opacity-40">Previous</button>
            {Array.from({ length: pageCount }).slice(0, 3).map((_, i) => {
              const p = i + 1;
              return <button key={p} onClick={() => setPage(p)} className={cn("rounded-lg border px-2 py-1 text-xs", p === currentPage ? "border-primary bg-primary/10 text-primary" : "border-border")}>{p}</button>;
            })}
            <button disabled={currentPage === pageCount} onClick={() => setPage((p) => Math.min(pageCount, p + 1))} className="rounded-lg border border-border px-2 py-1 text-xs disabled:opacity-40">Next</button>
          </div>
        </div>
      </div>

      {detailRow && (
        <Modal title={`Report Details · ${detailRow.reportName}`} onClose={() => setDetailRow(null)}>
          <div className="space-y-2 text-sm">
            <p><strong>Type:</strong> {detailRow.type}</p>
            <p><strong>Date Generated:</strong> {detailRow.dateGenerated}</p>
            <p><strong>Period:</strong> {detailRow.period}</p>
            <p><strong>Owner:</strong> {detailRow.owner}</p>
            <p><strong>Format:</strong> {detailRow.format}</p>
            <p><strong>Status:</strong> {detailRow.status}</p>
          </div>
        </Modal>
      )}
    </section>
  );
}
