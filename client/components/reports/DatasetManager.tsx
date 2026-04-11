import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CheckCircle2, ChevronLeft, ChevronRight, Download, Eye, FileCode2, Filter, GitBranch, Plus, Search, ShieldCheck, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import SearchableDropdown from "@/components/SearchableDropdown";

interface DatasetRow {
  id: string;
  name: string;
  source: string;
  owner: string;
  freshness: string;
  sla: string;
  certification: boolean;
  schemaVersion: string;
  lineageSummary: string;
  validationHistory: string[];
}

const INITIAL_DATASETS: DatasetRow[] = Array.from({ length: 14 }).map((_, idx) => ({
  id: `ds-${idx + 1}`,
  name: ["Alarm KPI Dataset", "Transport KPI Dataset", "Revenue Correlation", "Regulatory SLA Snapshot", "QoS Degradation Signals"][idx % 5] + (idx > 4 ? ` ${Math.ceil((idx + 1) / 5)}` : ""),
  source: ["Alarm Module", "Network PM", "Finance BI", "Compliance Engine", "RAN Analytics"][idx % 5],
  owner: ["NOC Ops", "Transport Team", "Finance BI", "Compliance Office", "RAN Engineering"][idx % 5],
  freshness: ["2 min ago", "47 min ago", "5 min ago", "9 min ago", "14 min ago"][idx % 5],
  sla: ["15 min", "30 min", "60 min", "30 min", "20 min"][idx % 5],
  certification: idx % 3 !== 0,
  schemaVersion: `v${3 + (idx % 4)}.0`,
  lineageSummary: "Source ingest → normalization → KPI aggregation → report mart",
  validationHistory: ["Null check pass", "Schema drift pass", "SLA pass"],
}));

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-3xl rounded-md border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h3 className="text-sm font-semibold">{title}</h3>
          <button onClick={onClose} className="rounded p-1 hover:bg-muted"><X className="h-4 w-4" /></button>
        </div>
        <div className="max-h-[70vh] overflow-auto p-4">{children}</div>
      </div>
    </div>
  );
}

export default function DatasetManager() {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [rows, setRows] = useState(INITIAL_DATASETS);
  const [search, setSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [certifiedOnly, setCertifiedOnly] = useState(false);
  const [ownerFilter, setOwnerFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [selected, setSelected] = useState<DatasetRow | null>(null);
  const [schemaModal, setSchemaModal] = useState<DatasetRow | null>(null);
  const [lineageModal, setLineageModal] = useState<DatasetRow | null>(null);
  const [validationModal, setValidationModal] = useState<DatasetRow | null>(null);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [page, setPage] = useState(1);

  const [newDataset, setNewDataset] = useState({ name: "", source: "Alarm Module", owner: "NOC Ops", sla: "30 min" });

  useEffect(() => {
    const datasetFromQuery = searchParams.get("dataset");
    if (!datasetFromQuery) return;
    const found = rows.find((row) => row.name.toLowerCase().includes(datasetFromQuery.toLowerCase()));
    if (found) {
      setSelected(found);
    }
  }, [searchParams, rows]);

  const filtered = useMemo(() => {
    return rows.filter((row) => {
      const q = search.toLowerCase();
      const searchOk = row.name.toLowerCase().includes(q) || row.source.toLowerCase().includes(q) || row.owner.toLowerCase().includes(q);
      const certOk = !certifiedOnly || row.certification;
      const ownerOk = ownerFilter === "all" || row.owner === ownerFilter;
      const sourceOk = sourceFilter === "all" || row.source === sourceFilter;
      return searchOk && certOk && ownerOk && sourceOk;
    });
  }, [rows, search, certifiedOnly, ownerFilter, sourceFilter]);

  const owners = Array.from(new Set(rows.map((r) => r.owner)));
  const sources = Array.from(new Set(rows.map((r) => r.source)));

  const PAGE_SIZE = 5;
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const exportVisible = () => {
    const csv = ["name,source,owner,freshness,sla,certified", ...visible.map((d) => `${d.name},${d.source},${d.owner},${d.freshness},${d.sla},${d.certification}`)].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `datasets-page-${currentPage}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Datasets exported", description: `${visible.length} rows exported.` });
  };

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-end">
        <button onClick={() => setRegisterOpen(true)} className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-[11px] font-semibold text-primary-foreground"><Plus className="h-3.5 w-3.5" />Register Dataset</button>
      </div>

      <div className="overflow-hidden rounded-md border border-border bg-card">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-3.5 py-2.5">
          <label className="relative w-full min-w-[240px] max-w-[360px]">
            <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search datasets" className="h-8 w-full rounded-md border border-border bg-background pl-7 pr-2 text-[12px]" />
          </label>

          <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
            <button onClick={() => setFiltersOpen((p) => !p)} className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2.5 py-1.5 hover:bg-muted/40"><Filter className="h-3.5 w-3.5" />Filters</button>
            <button onClick={() => setCertifiedOnly((p) => !p)} className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 ${certifiedOnly ? "border-primary/40 bg-primary/10 text-primary" : "border-border bg-background hover:bg-muted/40"}`}><ShieldCheck className="h-3.5 w-3.5" />Certified</button>
            <button onClick={() => setSchemaModal(visible[0] ?? null)} className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2.5 py-1.5 hover:bg-muted/40"><FileCode2 className="h-3.5 w-3.5" />Schema</button>
            <button onClick={exportVisible} className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2.5 py-1.5 hover:bg-muted/40"><Download className="h-3.5 w-3.5" />Export</button>
            <button onClick={() => setLineageModal(visible[0] ?? null)} className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2.5 py-1.5 hover:bg-muted/40"><GitBranch className="h-3.5 w-3.5" />Lineage</button>
            <button onClick={() => setValidationModal(visible[0] ?? null)} className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2.5 py-1.5 hover:bg-muted/40"><CheckCircle2 className="h-3.5 w-3.5" />Validation</button>
          </div>
        </div>

        {filtersOpen && (
          <div className="grid grid-cols-2 gap-2 border-b border-border bg-muted/10 px-3.5 py-2.5">
            <SearchableDropdown
              label=""
              compact
              multiSelect={false}
              options={["all", ...owners]}
              selected={ownerFilter === "all" ? [] : [ownerFilter]}
              onChange={(selected) => {
                setOwnerFilter(selected[0] ?? "all");
                setPage(1);
              }}
              placeholder="Search owner..."
            />
            <SearchableDropdown
              label=""
              compact
              multiSelect={false}
              options={["all", ...sources]}
              selected={sourceFilter === "all" ? [] : [sourceFilter]}
              onChange={(selected) => {
                setSourceFilter(selected[0] ?? "all");
                setPage(1);
              }}
              placeholder="Search source..."
            />
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border bg-muted/20">
                {["Dataset", "Source", "Owner", "Freshness", "SLA", "Certified", "Actions"].map((h) => <th key={h} className="px-3.5 py-2 text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {visible.map((row) => (
                <tr key={row.id} onClick={() => setSelected(row)} className="cursor-pointer border-b border-border/70 hover:bg-muted/20 last:border-b-0">
                  <td className="px-3.5 py-2.5 text-[12px] font-medium">{row.name}</td>
                  <td className="px-3.5 py-2.5 text-[12px] text-muted-foreground">{row.source}</td>
                  <td className="px-3.5 py-2.5 text-[12px] text-muted-foreground">{row.owner}</td>
                  <td className="px-3.5 py-2.5 text-[12px] text-muted-foreground">{row.freshness}</td>
                  <td className="px-3.5 py-2.5 text-[12px] text-muted-foreground">{row.sla}</td>
                  <td className="px-3.5 py-2.5 text-[12px]">{row.certification ? <span className="rounded-full border border-emerald-600/25 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">Certified</span> : <span className="rounded-full border border-amber-600/25 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-700">Pending</span>}</td>
                  <td className="px-3.5 py-2.5" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-1 whitespace-nowrap">
                      <button
                        onClick={() => setSelected(row)}
                        aria-label={`Open details for ${row.name}`}
                        title="Details"
                        className="inline-flex h-7 w-7 items-center justify-center rounded border border-border text-muted-foreground hover:bg-muted/20 hover:text-foreground"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setLineageModal(row)}
                        aria-label={`Open lineage for ${row.name}`}
                        title="Lineage"
                        className="inline-flex h-7 w-7 items-center justify-center rounded border border-border text-muted-foreground hover:bg-muted/20 hover:text-foreground"
                      >
                        <GitBranch className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setValidationModal(row)}
                        aria-label={`Open validation for ${row.name}`}
                        title="Validation"
                        className="inline-flex h-7 w-7 items-center justify-center rounded border border-border text-muted-foreground hover:bg-muted/20 hover:text-foreground"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-border px-3.5 py-2.5">
          <p className="text-[11px] text-muted-foreground">Showing {(currentPage - 1) * PAGE_SIZE + 1}-{(currentPage - 1) * PAGE_SIZE + visible.length} of {filtered.length} datasets</p>
          <div className="flex items-center gap-1">
            <button disabled={currentPage === 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="inline-flex h-7 w-7 items-center justify-center rounded border border-border disabled:opacity-40"><ChevronLeft className="h-3.5 w-3.5" /></button>
            <span className="text-[11px]">{currentPage}/{pageCount}</span>
            <button disabled={currentPage === pageCount} onClick={() => setPage((p) => Math.min(pageCount, p + 1))} className="inline-flex h-7 w-7 items-center justify-center rounded border border-border disabled:opacity-40"><ChevronRight className="h-3.5 w-3.5" /></button>
          </div>
        </div>
      </div>

      {registerOpen && (
        <Modal title="Register Dataset" onClose={() => setRegisterOpen(false)}>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <input value={newDataset.name} onChange={(e) => setNewDataset((p) => ({ ...p, name: e.target.value }))} placeholder="Dataset name" className="h-9 rounded-md border border-border px-2 text-sm" />
            <input value={newDataset.sla} onChange={(e) => setNewDataset((p) => ({ ...p, sla: e.target.value }))} placeholder="SLA" className="h-9 rounded-md border border-border px-2 text-sm" />
            <SearchableDropdown
              label=""
              compact
              multiSelect={false}
              options={sources}
              selected={[newDataset.source]}
              onChange={(selected) => setNewDataset((p) => ({ ...p, source: selected[0] ?? p.source }))}
              placeholder="Search source..."
            />
            <SearchableDropdown
              label=""
              compact
              multiSelect={false}
              options={owners}
              selected={[newDataset.owner]}
              onChange={(selected) => setNewDataset((p) => ({ ...p, owner: selected[0] ?? p.owner }))}
              placeholder="Search owner..."
            />
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <button onClick={() => setRegisterOpen(false)} className="rounded-md border border-border px-3 py-1.5 text-xs">Cancel</button>
            <button onClick={() => {
              if (!newDataset.name.trim()) return;
              const inserted: DatasetRow = {
                id: `ds-${Date.now()}`,
                name: newDataset.name,
                source: newDataset.source,
                owner: newDataset.owner,
                freshness: "just now",
                sla: newDataset.sla,
                certification: false,
                schemaVersion: "v1.0",
                lineageSummary: "Registered dataset lineage pending setup",
                validationHistory: ["Registration created"],
              };
              setRows((prev) => [inserted, ...prev]);
              setRegisterOpen(false);
              setPage(1);
            }} className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">Register</button>
          </div>
        </Modal>
      )}

      {selected && (
        <Modal title={`Dataset Details · ${selected.name}`} onClose={() => setSelected(null)}>
          <div className="space-y-2 text-sm">
            <p><strong>Source:</strong> {selected.source}</p>
            <p><strong>Owner:</strong> {selected.owner}</p>
            <p><strong>Freshness:</strong> {selected.freshness}</p>
            <p><strong>SLA:</strong> {selected.sla}</p>
            <p><strong>Schema:</strong> {selected.schemaVersion}</p>
            <p><strong>Certification:</strong> {selected.certification ? "Certified" : "Pending"}</p>
            <p><strong>Lineage Summary:</strong> {selected.lineageSummary}</p>
            <p><strong>Validation History:</strong> {selected.validationHistory.join(" · ")}</p>
          </div>
        </Modal>
      )}

      {schemaModal && <Modal title={`Schema · ${schemaModal.name}`} onClose={() => setSchemaModal(null)}><pre className="rounded bg-muted/20 p-3 text-xs">{`schemaVersion: ${schemaModal.schemaVersion}\nfields:\n- timestamp\n- region\n- kpi_value\n- status_flag`}</pre></Modal>}
      {lineageModal && <Modal title={`Lineage · ${lineageModal.name}`} onClose={() => setLineageModal(null)}><p className="text-sm">{lineageModal.lineageSummary}</p></Modal>}
      {validationModal && <Modal title={`Validation · ${validationModal.name}`} onClose={() => setValidationModal(null)}><ul className="list-disc space-y-1 pl-5 text-sm">{validationModal.validationHistory.map((h) => <li key={h}>{h}</li>)}</ul></Modal>}
    </section>
  );
}
