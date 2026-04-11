import { useMemo, useState } from "react";
import {
  Archive,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  FileClock,
  Filter,
  Heart,
  MoreHorizontal,
  Pencil,
  Plus,
  Tag,
  X,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import SearchableDropdown from "@/components/SearchableDropdown";
import { SearchBar } from "@/components/ui/search-bar";

interface ReportLibraryItem {
  id: string;
  reportName: string;
  dataset: string;
  owner: string;
  schedule: string;
  status: "Active" | "Draft" | "Legal Hold";
  usage: number;
  tags: string[];
  favorite: boolean;
  archived?: boolean;
}

const OWNER_OPTIONS = ["NOC Ops", "SLA Office", "Procurement BI", "Compliance Team", "Automation CoE", "Finance BI"];
const DATASET_OPTIONS = ["NOC Unified Events", "Service Assurance Ledger", "Vendor Performance Mart", "Regulatory Evidence Vault", "Automation Outcome Cube"];
const TAG_OPTIONS = ["Executive", "Regulatory", "Operations", "Finance", "Automation", "Vendor"];

const INITIAL_ROWS: ReportLibraryItem[] = Array.from({ length: 18 }).map((_, idx) => {
  const templates = [
    { reportName: "Daily NOC Summary", dataset: "NOC Unified Events", owner: "NOC Ops", schedule: "Daily · 06:00", status: "Active" as const, tags: ["Operations", "Executive"] },
    { reportName: "Weekly SLA Compliance", dataset: "Service Assurance Ledger", owner: "SLA Office", schedule: "Weekly · Mon 08:30", status: "Active" as const, tags: ["Regulatory", "Operations"] },
    { reportName: "Vendor Scorecard Q1", dataset: "Vendor Performance Mart", owner: "Procurement BI", schedule: "Manual Refresh", status: "Draft" as const, tags: ["Vendor"] },
    { reportName: "Regulatory Pack", dataset: "Regulatory Evidence Vault", owner: "Compliance Team", schedule: "Monthly · Day 1", status: "Legal Hold" as const, tags: ["Regulatory"] },
    { reportName: "Automation ROI Analysis", dataset: "Automation Outcome Cube", owner: "Automation CoE", schedule: "Monthly · Day 5", status: "Active" as const, tags: ["Automation", "Finance"] },
  ][idx % 5];

  return {
    id: `rpt-${idx + 101}`,
    ...templates,
    reportName: idx > 4 ? `${templates.reportName} ${Math.ceil((idx + 1) / 5)}` : templates.reportName,
    usage: 1200 + idx * 317,
    favorite: idx % 3 === 0,
  };
});

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-3xl rounded-md border border-border bg-card shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h3 className="text-sm font-semibold">{title}</h3>
          <button onClick={onClose} className="rounded p-1 hover:bg-muted"><X className="h-4 w-4" /></button>
        </div>
        <div className="max-h-[70vh] overflow-auto p-4">{children}</div>
      </div>
    </div>
  );
}

const getStatusClassName = (status: ReportLibraryItem["status"]) => {
  switch (status) {
    case "Active":
      return "border-emerald-600/25 bg-emerald-500/10 text-emerald-700";
    case "Draft":
      return "border-amber-600/25 bg-amber-500/10 text-amber-700";
    case "Legal Hold":
      return "border-rose-600/25 bg-rose-500/10 text-rose-700";
  }
};

export default function ReportLibraryModule() {
  const { toast } = useToast();
  const [reports, setReports] = useState<ReportLibraryItem[]>(INITIAL_ROWS);
  const [search, setSearch] = useState("");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<"all" | ReportLibraryItem["status"]>("all");
  const [ownerFilter, setOwnerFilter] = useState("all");
  const [datasetFilter, setDatasetFilter] = useState("all");
  const [scheduleFilter, setScheduleFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showTags, setShowTags] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showVersion, setShowVersion] = useState(false);
  const [activeReport, setActiveReport] = useState<ReportLibraryItem | null>(null);
  const [menuReport, setMenuReport] = useState<ReportLibraryItem | null>(null);
  const [page, setPage] = useState(1);

  const [newReport, setNewReport] = useState({ reportName: "", dataset: DATASET_OPTIONS[0], owner: OWNER_OPTIONS[0], schedule: "Weekly · Fri 09:00", status: "Draft" as ReportLibraryItem["status"] });

  const filteredReports = useMemo(() => {
    return reports.filter((row) => {
      if (row.archived) return false;
      const q = search.toLowerCase();
      const searchOk = row.reportName.toLowerCase().includes(q) || row.dataset.toLowerCase().includes(q) || row.owner.toLowerCase().includes(q);
      const statusOk = statusFilter === "all" || row.status === statusFilter;
      const ownerOk = ownerFilter === "all" || row.owner === ownerFilter;
      const datasetOk = datasetFilter === "all" || row.dataset === datasetFilter;
      const scheduleOk = scheduleFilter.trim() === "" || row.schedule.toLowerCase().includes(scheduleFilter.toLowerCase());
      const tagsOk = selectedTags.length === 0 || selectedTags.every((t) => row.tags.includes(t));
      const favoriteOk = !favoritesOnly || row.favorite;
      return searchOk && statusOk && ownerOk && datasetOk && scheduleOk && tagsOk && favoriteOk;
    });
  }, [reports, search, statusFilter, ownerFilter, datasetFilter, scheduleFilter, selectedTags, favoritesOnly]);

  const PAGE_SIZE = 5;
  const pageCount = Math.max(1, Math.ceil(filteredReports.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageRows = filteredReports.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const exportVisibleRows = (format: "csv" | "json") => {
    if (pageRows.length === 0) {
      toast({ title: "Nothing to export", description: "No visible rows on this page." });
      return;
    }

    const content =
      format === "json"
        ? JSON.stringify(pageRows, null, 2)
        : ["reportName,dataset,owner,schedule,status,usage", ...pageRows.map((r) => `${r.reportName},${r.dataset},${r.owner},${r.schedule},${r.status},${r.usage}`)].join("\n");

    const blob = new Blob([content], { type: format === "json" ? "application/json" : "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `report-library-page-${currentPage}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Export complete", description: `Exported ${pageRows.length} rows as ${format.toUpperCase()}.` });
  };

  const archiveTarget = activeReport ?? pageRows[0] ?? null;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-end">
        <button onClick={() => setShowCreate(true)} className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-[11px] font-semibold text-primary-foreground hover:bg-primary/90">
          <Plus className="h-3.5 w-3.5" />Create Report
        </button>
      </div>

      <div className="overflow-hidden rounded-md border border-border bg-card">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-3.5 py-2.5">
          <SearchBar
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search reports"
            containerClassName="w-full min-w-[240px] max-w-[360px] h-8"
            className="text-[12px]"
          />

          <div className="flex flex-wrap items-center gap-1.5">
            <button onClick={() => setShowFilters((p) => !p)} className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2.5 py-1.5 text-[11px] font-medium hover:bg-muted/40"><Filter className="h-3.5 w-3.5" />Filters</button>
            <button onClick={() => setShowTags((p) => !p)} className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2.5 py-1.5 text-[11px] font-medium hover:bg-muted/40"><Tag className="h-3.5 w-3.5" />Tags</button>
            <button onClick={() => setFavoritesOnly((p) => !p)} className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-[11px] font-medium ${favoritesOnly ? "border-primary/40 bg-primary/10 text-primary" : "border-border bg-background hover:bg-muted/40"}`}><Heart className="h-3.5 w-3.5" />Favorites</button>
            <button onClick={() => exportVisibleRows("csv")} className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2.5 py-1.5 text-[11px] font-medium hover:bg-muted/40"><Download className="h-3.5 w-3.5" />Export</button>
            <button onClick={() => setShowVersion(true)} className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2.5 py-1.5 text-[11px] font-medium hover:bg-muted/40"><FileClock className="h-3.5 w-3.5" />Version History</button>
            <button
              onClick={() => {
                if (!archiveTarget) return;
                setReports((prev) => prev.map((r) => (r.id === archiveTarget.id ? { ...r, archived: true } : r)));
                toast({ title: "Report archived", description: `${archiveTarget.reportName} moved to archive.` });
                setActiveReport(null);
              }}
              className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2.5 py-1.5 text-[11px] font-medium hover:bg-muted/40"
            ><Archive className="h-3.5 w-3.5" />Archive</button>
          </div>
        </div>

        {showFilters && (
          <div className="grid grid-cols-2 gap-2 border-b border-border bg-muted/15 px-3.5 py-2.5 md:grid-cols-4">
            <SearchableDropdown
              label=""
              compact
              multiSelect={false}
              options={["all", "Active", "Draft", "Legal Hold"]}
              selected={statusFilter === "all" ? [] : [statusFilter]}
              onChange={(selected) => { setStatusFilter((selected[0] as ReportLibraryItem["status"]) ?? "all"); setPage(1); }}
            />
            <SearchableDropdown
              label=""
              compact
              multiSelect={false}
              options={["all", ...OWNER_OPTIONS]}
              selected={ownerFilter === "all" ? [] : [ownerFilter]}
              onChange={(selected) => { setOwnerFilter(selected[0] ?? "all"); setPage(1); }}
            />
            <SearchableDropdown
              label=""
              compact
              multiSelect={false}
              options={["all", ...DATASET_OPTIONS]}
              selected={datasetFilter === "all" ? [] : [datasetFilter]}
              onChange={(selected) => { setDatasetFilter(selected[0] ?? "all"); setPage(1); }}
            />
            <input value={scheduleFilter} onChange={(e) => { setScheduleFilter(e.target.value); setPage(1); }} placeholder="Schedule contains..." className="h-8 rounded-md border border-border bg-background px-2 text-xs" />
          </div>
        )}

        {showTags && (
          <div className="flex flex-wrap gap-1.5 border-b border-border bg-muted/15 px-3.5 py-2.5">
            {TAG_OPTIONS.map((tag) => (
              <button key={tag} onClick={() => { toggleTag(tag); setPage(1); }} className={`rounded-full border px-2 py-0.5 text-[11px] ${selectedTags.includes(tag) ? "border-primary/40 bg-primary/10 text-primary" : "border-border bg-background hover:bg-muted/40"}`}>{tag}</button>
            ))}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border bg-muted/20">
                {["Report Name", "Dataset", "Owner", "Schedule", "Status", "Usage", "Actions"].map((column) => (
                  <th key={column} className="px-3.5 py-2 text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">{column}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageRows.map((row) => (
                <tr key={row.id} onClick={() => setActiveReport(row)} className="cursor-pointer border-b border-border/70 last:border-b-0 hover:bg-muted/20">
                  <td className="px-3.5 py-2.5 text-[12px] font-medium text-foreground">{row.reportName}</td>
                  <td className="px-3.5 py-2.5 text-[12px] text-muted-foreground">{row.dataset}</td>
                  <td className="px-3.5 py-2.5 text-[12px] text-muted-foreground">{row.owner}</td>
                  <td className="px-3.5 py-2.5 text-[12px] text-muted-foreground">{row.schedule}</td>
                  <td className="px-3.5 py-2.5 text-[12px]"><span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold ${getStatusClassName(row.status)}`}>{row.status}</span></td>
                  <td className="px-3.5 py-2.5 text-[12px] font-semibold text-foreground">{row.usage.toLocaleString()}</td>
                  <td className="px-3.5 py-2.5" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-1">
                      <button onClick={() => setActiveReport(row)} className="rounded p-1 text-muted-foreground hover:bg-muted/40 hover:text-foreground" title="View"><Eye className="h-3.5 w-3.5" /></button>
                      <button onClick={() => toast({ title: "Edit mode", description: `Editing ${row.reportName}` })} className="rounded p-1 text-muted-foreground hover:bg-muted/40 hover:text-foreground" title="Edit"><Pencil className="h-3.5 w-3.5" /></button>
                      <button onClick={() => exportVisibleRows("json")} className="rounded p-1 text-muted-foreground hover:bg-muted/40 hover:text-foreground" title="Download"><Download className="h-3.5 w-3.5" /></button>
                      <button onClick={() => setMenuReport(row)} className="rounded p-1 text-muted-foreground hover:bg-muted/40 hover:text-foreground" title="More"><MoreHorizontal className="h-3.5 w-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {pageRows.length === 0 && <tr><td colSpan={7} className="px-3.5 py-6 text-center text-xs text-muted-foreground">No reports match current filters.</td></tr>}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-3.5 py-2.5">
          <p className="text-[11px] text-muted-foreground">Showing {(currentPage - 1) * PAGE_SIZE + (pageRows.length ? 1 : 0)}-{(currentPage - 1) * PAGE_SIZE + pageRows.length} of {filteredReports.length} reports</p>
          <div className="flex items-center gap-1">
            <button disabled={currentPage === 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="inline-flex h-7 w-7 items-center justify-center rounded border border-border bg-background text-muted-foreground disabled:opacity-40"><ChevronLeft className="h-3.5 w-3.5" /></button>
            <span className="px-2 text-[11px]">{currentPage} / {pageCount}</span>
            <button disabled={currentPage === pageCount} onClick={() => setPage((p) => Math.min(pageCount, p + 1))} className="inline-flex h-7 w-7 items-center justify-center rounded border border-border bg-background text-muted-foreground disabled:opacity-40"><ChevronRight className="h-3.5 w-3.5" /></button>
          </div>
        </div>
      </div>

      {showCreate && (
        <Modal title="Create Report" onClose={() => setShowCreate(false)}>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <input value={newReport.reportName} onChange={(e) => setNewReport((p) => ({ ...p, reportName: e.target.value }))} placeholder="Report name" className="h-9 rounded-md border border-border bg-background px-2 text-sm" />
            <SearchableDropdown
              label=""
              compact
              multiSelect={false}
              options={DATASET_OPTIONS}
              selected={[newReport.dataset]}
              onChange={(selected) => setNewReport((p) => ({ ...p, dataset: selected[0] ?? p.dataset }))}
            />
            <SearchableDropdown
              label=""
              compact
              multiSelect={false}
              options={OWNER_OPTIONS}
              selected={[newReport.owner]}
              onChange={(selected) => setNewReport((p) => ({ ...p, owner: selected[0] ?? p.owner }))}
            />
            <SearchableDropdown
              label=""
              compact
              multiSelect={false}
              options={["Draft", "Active", "Legal Hold"]}
              selected={[newReport.status]}
              onChange={(selected) => setNewReport((p) => ({ ...p, status: (selected[0] as ReportLibraryItem["status"]) ?? p.status }))}
            />
            <input value={newReport.schedule} onChange={(e) => setNewReport((p) => ({ ...p, schedule: e.target.value }))} placeholder="Schedule" className="h-9 rounded-md border border-border bg-background px-2 text-sm md:col-span-2" />
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <button onClick={() => setShowCreate(false)} className="rounded-md border border-border px-3 py-1.5 text-xs">Cancel</button>
            <button
              onClick={() => {
                if (!newReport.reportName.trim()) return;
                const added: ReportLibraryItem = {
                  id: `rpt-${Date.now()}`,
                  ...newReport,
                  usage: 0,
                  tags: ["Operations"],
                  favorite: false,
                };
                setReports((prev) => [added, ...prev]);
                setShowCreate(false);
                setPage(1);
                toast({ title: "Report created", description: `${added.reportName} added to library.` });
              }}
              className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
            >
              Save Report
            </button>
          </div>
        </Modal>
      )}

      {showVersion && (
        <Modal title="Version History" onClose={() => setShowVersion(false)}>
          <div className="space-y-2 text-sm">
            {(activeReport ? [activeReport] : pageRows.slice(0, 2)).map((row) => (
              <div key={row.id} className="rounded-md border border-border p-3">
                <p className="font-medium">{row.reportName}</p>
                <p className="text-xs text-muted-foreground">v5 · Schema enrichment · 2 days ago</p>
                <p className="text-xs text-muted-foreground">v4 · KPI threshold update · 10 days ago</p>
              </div>
            ))}
          </div>
        </Modal>
      )}

      {activeReport && (
        <Modal title={`Report Details · ${activeReport.reportName}`} onClose={() => setActiveReport(null)}>
          <div className="space-y-2 text-sm">
            <p><strong>Dataset:</strong> {activeReport.dataset}</p>
            <p><strong>Owner:</strong> {activeReport.owner}</p>
            <p><strong>Schedule:</strong> {activeReport.schedule}</p>
            <p><strong>Status:</strong> {activeReport.status}</p>
            <p><strong>Usage:</strong> {activeReport.usage.toLocaleString()}</p>
            <button onClick={() => setReports((prev) => prev.map((r) => r.id === activeReport.id ? { ...r, favorite: !r.favorite } : r))} className="rounded-md border border-border px-3 py-1.5 text-xs">{activeReport.favorite ? "Remove Favorite" : "Add Favorite"}</button>
          </div>
        </Modal>
      )}

      {menuReport && (
        <Modal title={`Actions · ${menuReport.reportName}`} onClose={() => setMenuReport(null)}>
          <div className="space-y-2">
            <button onClick={() => { setReports((p) => p.map((r) => r.id === menuReport.id ? { ...r, archived: true } : r)); setMenuReport(null); }} className="w-full rounded-md border border-border px-3 py-2 text-left text-sm hover:bg-muted/30">Archive this report</button>
            <button onClick={() => { setReports((p) => p.map((r) => r.id === menuReport.id ? { ...r, favorite: !r.favorite } : r)); setMenuReport(null); }} className="w-full rounded-md border border-border px-3 py-2 text-left text-sm hover:bg-muted/30">Toggle favorite</button>
            <button onClick={() => { toast({ title: "Duplicated", description: `${menuReport.reportName} copied as draft.` }); setMenuReport(null); }} className="w-full rounded-md border border-border px-3 py-2 text-left text-sm hover:bg-muted/30">Duplicate as draft</button>
          </div>
        </Modal>
      )}
    </section>
  );
}
