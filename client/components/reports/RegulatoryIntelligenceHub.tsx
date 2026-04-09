import { useMemo, useState } from "react";
import { Download, FileClock, ShieldAlert, X } from "lucide-react";
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
  const [predictiveOpen, setPredictiveOpen] = useState(false);
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

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1.4fr_1fr]">
        <article className="rounded-md border border-border bg-card">
          <div className="border-b border-border px-3.5 py-2.5">
            <h3 className="text-[13px] font-semibold">Compliance Submissions</h3>
          </div>
          <div className="space-y-3 px-3.5 py-3">
            <div className="grid grid-cols-6 gap-2">
              {SUBMISSIONS.map((item) => (
                <button key={item.month} onClick={() => setActiveMonth(item)} className={`rounded border px-2 py-2 text-center text-[11px] ${activeMonth.month === item.month ? "border-primary/40 bg-primary/10 text-primary" : "border-border hover:bg-muted/20"}`}>
                  <div className="font-semibold">{item.month}</div>
                  <div className="mt-1 h-10 rounded bg-muted/20 p-1">
                    <div className="h-full rounded bg-primary/30" style={{ width: `${Math.min(100, (item.submitted / 22) * 100)}%` }} />
                  </div>
                </button>
              ))}
            </div>
            <div className="rounded border border-border bg-muted/10 p-3 text-sm">
              <p><strong>{activeMonth.month} details:</strong> {activeMonth.submitted} submissions completed, {activeMonth.pending} pending.</p>
            </div>
          </div>
        </article>

        <aside className="space-y-3">
          <section className="rounded-md border border-border bg-card px-3.5 py-3">
            <h3 className="text-[13px] font-semibold">Evidence & History</h3>
            <div className="mt-2 space-y-1.5">
              <button onClick={() => setEvidenceModal("snapshot")} className="w-full rounded border border-border px-2.5 py-1.5 text-left text-[11px] hover:bg-muted/20">View Frozen Snapshot</button>
              <button onClick={() => setEvidenceModal("investigation")} className="w-full rounded border border-border px-2.5 py-1.5 text-left text-[11px] hover:bg-muted/20">View Investigation Evidence</button>
              <button onClick={() => setEvidenceModal("pack")} className="w-full rounded border border-border px-2.5 py-1.5 text-left text-[11px] hover:bg-muted/20">Export Regulatory Pack</button>
            </div>
          </section>

          <button onClick={() => setPredictiveOpen(true)} className="w-full rounded-md border border-border bg-card px-3.5 py-3 text-left hover:border-primary/40">
            <div className="flex items-center gap-1.5"><ShieldAlert className="h-4 w-4 text-primary" /><h3 className="text-[13px] font-semibold">Predictive Compliance Risk</h3></div>
            <p className="mt-1 text-[12px] text-muted-foreground">ETA filing delay risk estimated at 64% in next cycle.</p>
          </button>

          <button onClick={() => setHistoryOpen(true)} className="w-full rounded-md border border-border bg-card px-3.5 py-3 text-left hover:border-primary/40">
            <div className="flex items-center gap-1.5"><FileClock className="h-4 w-4 text-primary" /><h3 className="text-[13px] font-semibold">Report History</h3></div>
            <p className="mt-1 text-[12px] text-muted-foreground">Open the full regulatory timeline and audit chain.</p>
          </button>
        </aside>
      </div>

      <section className="rounded-md border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-3.5 py-2.5">
          <h3 className="text-[13px] font-semibold">Pending Approvals</h3>
          <span className="text-[11px] text-muted-foreground">{pendingCount} pending</span>
        </div>
        <div className="divide-y divide-border/70">
          {approvals.map((item) => (
            <div key={item.id} className="flex items-center justify-between px-3.5 py-2.5">
              <div>
                <p className="text-[12px] font-medium">{item.title}</p>
                <p className="text-[11px] text-muted-foreground">{item.owner}</p>
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
        <div className="border-t border-border px-3.5 py-2 text-[11px] text-muted-foreground">
          Approved: {approvalSummary.approved} · Rejected: {approvalSummary.rejected}
        </div>
      </section>

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

      {predictiveOpen && (
        <Modal title="Predictive Compliance Insight" onClose={() => setPredictiveOpen(false)}>
          <div className="space-y-2 text-sm">
            <p><strong>Risk:</strong> ETA filing delay probability 64%.</p>
            <p><strong>Reason:</strong> Late data freezes in last two cycles and unresolved approval backlog.</p>
            <button onClick={() => { toast({ title: "Mitigation plan launched", description: "Escalation workflow created for compliance owners." }); setPredictiveOpen(false); }} className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">Launch Mitigation Plan</button>
          </div>
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
