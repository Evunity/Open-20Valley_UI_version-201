import { useMemo, useState } from "react";
import { Download, FileClock, FileSpreadsheet, History, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SubmissionPoint { month: string; submitted: number; pending: number }
interface ApprovalItem { id: string; title: string; owner: string; status: "pending" | "approved" | "rejected" }

const SUBMISSIONS: SubmissionPoint[] = [
  { month: "Jan", submitted: 14, pending: 3 },
  { month: "Feb", submitted: 16, pending: 2 },
  { month: "Mar", submitted: 18, pending: 4 },
  { month: "Apr", submitted: 17, pending: 3 },
  { month: "May", submitted: 19, pending: 2 },
  { month: "Jun", submitted: 21, pending: 1 },
];

const INITIAL_APPROVALS: ApprovalItem[] = [
  { id: "ap1", title: "ETA Monthly Quality Pack", owner: "Compliance Team", status: "pending" },
  { id: "ap2", title: "Roaming Performance Dossier", owner: "Service Assurance", status: "pending" },
  { id: "ap3", title: "Data Residency Evidence", owner: "Legal Operations", status: "pending" },
];

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl rounded-md border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h3 className="text-sm font-semibold">{title}</h3>
          <button onClick={onClose} className="rounded p-1 hover:bg-muted"><X className="h-4 w-4" /></button>
        </div>
        <div className="max-h-[70vh] overflow-auto p-4">{children}</div>
      </div>
    </div>
  );
}

export default function RegulatoryIntelligenceHub() {
  const { toast } = useToast();
  const [activeMonth, setActiveMonth] = useState<SubmissionPoint>(SUBMISSIONS[5]);
  const [approvals, setApprovals] = useState<ApprovalItem[]>(INITIAL_APPROVALS);
  const [exportOpen, setExportOpen] = useState(false);
  const [evidenceModal, setEvidenceModal] = useState<"snapshot" | "investigation" | "pack" | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);

  const pendingCount = approvals.filter((a) => a.status === "pending").length;

  const approvalSummary = useMemo(() => {
    const approved = approvals.filter((a) => a.status === "approved").length;
    const rejected = approvals.filter((a) => a.status === "rejected").length;
    return { approved, rejected };
  }, [approvals]);

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-end">
        <button onClick={() => setExportOpen(true)} className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-[11px] font-semibold text-primary-foreground"><Download className="h-3.5 w-3.5" />Export Pack</button>
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1.5fr_1fr]">
        <article className="rounded-md border border-border bg-card p-3.5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-[13px] font-semibold">Compliance Submissions</h3>
            <span className="text-[11px] text-muted-foreground">Cycle view · Jan-Jun</span>
          </div>
          <div className="rounded-md border border-border bg-background p-3">
            <div className="grid h-44 grid-cols-6 items-end gap-2">
              {SUBMISSIONS.map((item) => (
                <button
                  key={item.month}
                  onClick={() => setActiveMonth(item)}
                  className={`flex h-full flex-col justify-end rounded-md px-1.5 py-1 text-center transition-colors ${activeMonth.month === item.month ? "bg-primary/10" : "hover:bg-muted/20"}`}
                >
                  <div className="mx-auto flex w-full max-w-[46px] items-end gap-1">
                    <div className="w-1/2 rounded-sm bg-primary" style={{ height: `${Math.max(14, item.submitted * 6)}px` }} />
                    <div className="w-1/2 rounded-sm bg-amber-500/80" style={{ height: `${Math.max(10, item.pending * 14)}px` }} />
                  </div>
                  <div className="mt-2 text-[10px] font-semibold">{item.month}</div>
                </button>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-4 text-[11px]">
              <div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-primary" />Submitted</div>
              <div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-amber-500/80" />Pending</div>
            </div>
            <div className="mt-3 rounded border border-border bg-muted/10 p-3 text-sm">
              <p><strong>{activeMonth.month}:</strong> {activeMonth.submitted} submitted · {activeMonth.pending} pending approvals.</p>
            </div>
          </div>
        </article>

        <aside className="space-y-3">
          <section className="rounded-md border border-border bg-card px-3.5 py-3">
            <div className="flex items-center gap-1.5">
              <History className="h-4 w-4 text-primary" />
              <h3 className="text-[13px] font-semibold">Evidence & History</h3>
            </div>
            <div className="mt-2 space-y-1.5">
              <button onClick={() => setEvidenceModal("snapshot")} className="w-full rounded border border-border px-2.5 py-1.5 text-left text-[11px] hover:bg-muted/20">View Frozen Snapshot</button>
              <button onClick={() => setEvidenceModal("investigation")} className="w-full rounded border border-border px-2.5 py-1.5 text-left text-[11px] hover:bg-muted/20">View Investigation Evidence</button>
              <button onClick={() => setEvidenceModal("pack")} className="w-full rounded border border-border px-2.5 py-1.5 text-left text-[11px] hover:bg-muted/20">Export Regulatory Pack</button>
            </div>
          </section>

          <button onClick={() => setHistoryOpen(true)} className="w-full rounded-md border border-border bg-card px-3.5 py-3 text-left hover:border-primary/40">
            <div className="flex items-center gap-1.5"><FileClock className="h-4 w-4 text-primary" /><h3 className="text-[13px] font-semibold">Report History</h3></div>
            <p className="mt-1 text-[12px] text-muted-foreground">Open filing timeline, signed versions, and full audit chain.</p>
          </button>

          <section className="rounded-md border border-border bg-card px-3.5 py-3">
            <div className="mb-2 flex items-center gap-1.5"><FileSpreadsheet className="h-4 w-4 text-primary" /><h3 className="text-[13px] font-semibold">Pending Approvals</h3></div>
            <div className="space-y-2">
              {approvals.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded border border-border/70 px-2.5 py-2">
                  <div>
                    <p className="text-[11px] font-medium leading-tight">{item.title}</p>
                    <p className="text-[10px] text-muted-foreground">{item.owner}</p>
                  </div>
                  {item.status === "pending" ? (
                    <div className="flex gap-1">
                      <button onClick={() => setApprovals((prev) => prev.map((a) => (a.id === item.id ? { ...a, status: "approved" } : a)))} className="rounded border border-emerald-600/30 bg-emerald-500/10 px-2 py-1 text-[10px] font-semibold text-emerald-700">Approve</button>
                      <button onClick={() => setApprovals((prev) => prev.map((a) => (a.id === item.id ? { ...a, status: "rejected" } : a)))} className="rounded border border-rose-600/30 bg-rose-500/10 px-2 py-1 text-[10px] font-semibold text-rose-700">Reject</button>
                    </div>
                  ) : (
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${item.status === "approved" ? "border-emerald-600/30 bg-emerald-500/10 text-emerald-700" : "border-rose-600/30 bg-rose-500/10 text-rose-700"}`}>{item.status}</span>
                  )}
                </div>
              ))}
            </div>
            <p className="mt-2 text-[10px] text-muted-foreground">{pendingCount} pending · {approvalSummary.approved} approved · {approvalSummary.rejected} rejected</p>
          </section>
        </aside>
      </div>

      {exportOpen && (
        <Modal title="Export Regulatory Pack" onClose={() => setExportOpen(false)}>
          <p className="mb-3 text-sm">Package compliance submissions, evidence artifacts, and approval logs for the selected period.</p>
          <button onClick={() => { toast({ title: "Export started", description: `Generating ${activeMonth.month} regulatory pack.` }); setExportOpen(false); }} className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">Start Export</button>
        </Modal>
      )}

      {evidenceModal && (
        <Modal title={evidenceModal === "snapshot" ? "Frozen Snapshot" : evidenceModal === "investigation" ? "Investigation Evidence" : "Export Regulatory Pack"} onClose={() => setEvidenceModal(null)}>
          <p className="text-sm">
            {evidenceModal === "snapshot" && "Immutable submission snapshot with source hash, timestamps, and signed attestations."}
            {evidenceModal === "investigation" && "Incident-linked evidence package with change logs and corrective actions."}
            {evidenceModal === "pack" && "Quick export path for regulatory bundle from Evidence & History panel."}
          </p>
        </Modal>
      )}

      {historyOpen && (
        <Modal title="Regulatory Timeline" onClose={() => setHistoryOpen(false)}>
          <ul className="space-y-2 text-sm">
            <li className="rounded border border-border p-2">Jun 04 · Export pack generated and submitted to ETA.</li>
            <li className="rounded border border-border p-2">May 29 · Evidence annex updated with roaming metrics.</li>
            <li className="rounded border border-border p-2">May 25 · Legal hold lifted for data residency bundle.</li>
          </ul>
        </Modal>
      )}
    </section>
  );
}
