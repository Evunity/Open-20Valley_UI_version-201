import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight, Bot, CheckCircle2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PipelineHealthRow {
  dataset: string;
  source: string;
  freshness: string;
  status: "Fresh" | "Delayed";
  actionLabel: "View Dataset" | "Investigate";
}

interface ActivityEvent {
  id: string;
  title: string;
  timeAgo: string;
  context: string;
  actionLabel: "Open" | "Investigate" | "Review" | "View";
  details: string;
}

const PIPELINE_HEALTH_ROWS: PipelineHealthRow[] = [
  { dataset: "Alarm KPI Dataset", source: "Alarm Module", freshness: "2 min ago", status: "Fresh", actionLabel: "View Dataset" },
  { dataset: "Transport KPI Dataset", source: "Network PM", freshness: "47 min ago", status: "Delayed", actionLabel: "Investigate" },
  { dataset: "Revenue Correlation", source: "Finance BI", freshness: "5 min ago", status: "Fresh", actionLabel: "View Dataset" },
  { dataset: "Regulatory SLA Snapshot", source: "Compliance Engine", freshness: "9 min ago", status: "Fresh", actionLabel: "View Dataset" },
  { dataset: "QoS Degradation Signals", source: "RAN Analytics", freshness: "14 min ago", status: "Fresh", actionLabel: "View Dataset" },
];

const RECENT_ACTIVITY: ActivityEvent[] = [
  { id: "a1", title: "Executive summary generated", timeAgo: "3 min ago", context: "One-Click Briefing", actionLabel: "Open", details: "Board deck summary generated for April operational review." },
  { id: "a2", title: "Transport KPI delay threshold breached", timeAgo: "11 min ago", context: "Pipeline Monitor", actionLabel: "Investigate", details: "Source ingestion for transport PM breached freshness SLA by 32 mins." },
  { id: "a3", title: "Q2 board report scheduled", timeAgo: "26 min ago", context: "Scheduling & Distribution", actionLabel: "Review", details: "Quarterly board report will distribute to leadership every Monday 08:00." },
  { id: "a4", title: "Regulatory annex updated", timeAgo: "42 min ago", context: "Regulatory Intelligence Hub", actionLabel: "View", details: "Annex C evidence table updated with March compliance deltas." },
  { id: "a5", title: "Revenue correlation dataset refreshed", timeAgo: "1 hr ago", context: "Dataset Manager", actionLabel: "Open", details: "Finance BI pipeline refreshed with latest billing and churn dimensions." },
];

function OverlayModal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl rounded-md border border-border bg-card shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h3 className="text-sm font-semibold">{title}</h3>
          <button onClick={onClose} className="rounded p-1 hover:bg-muted" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-[70vh] overflow-auto p-4">{children}</div>
      </div>
    </div>
  );
}

export default function ExecutiveReportingOverview() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [briefingOpen, setBriefingOpen] = useState(false);
  const [selectedDataset, setSelectedDataset] = useState<PipelineHealthRow | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<ActivityEvent | null>(null);
  const [insightOpen, setInsightOpen] = useState(false);

  const briefingSummary = useMemo(() => {
    const delayed = PIPELINE_HEALTH_ROWS.filter((row) => row.status === "Delayed");
    return {
      healthyCount: PIPELINE_HEALTH_ROWS.length - delayed.length,
      delayedCount: delayed.length,
      delayedDatasets: delayed.map((d) => d.dataset),
      keyMessage:
        delayed.length > 0
          ? `Pipeline stability is strong with ${PIPELINE_HEALTH_ROWS.length - delayed.length}/${PIPELINE_HEALTH_ROWS.length} datasets fresh. Prioritize ${delayed[0].dataset} latency recovery.`
          : "All critical reporting datasets are fresh and within SLA.",
    };
  }, []);

  const handleDatasetAction = (row: PipelineHealthRow) => {
    setSelectedDataset(row);
  };

  const openDatasetManager = (datasetName: string) => {
    navigate(`/reports-module/dataset-manager?dataset=${encodeURIComponent(datasetName)}`);
    toast({ title: "Navigated to Dataset Manager", description: `Opened with ${datasetName} selected.` });
    setSelectedDataset(null);
  };

  return (
    <section className="space-y-3">
      <header className="flex items-center justify-end gap-2">
        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-600/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold tracking-[0.1em] text-emerald-700">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />LIVE
        </span>
        <button
          onClick={() => setBriefingOpen(true)}
          className="rounded-md border border-primary/40 bg-primary px-3 py-1.5 text-[11px] font-semibold text-primary-foreground hover:bg-primary/90"
        >
          One-Click Briefing
        </button>
      </header>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1.7fr_1fr]">
        <article className="overflow-hidden rounded-md border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-3.5 py-2.5">
            <h2 className="text-[13px] font-semibold text-foreground">Pipeline Health Overview</h2>
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-600/25 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
              <CheckCircle2 className="h-3 w-3" />All Healthy
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border bg-muted/20">
                  {["Dataset", "Source", "Freshness", "Status", "Action"].map((column) => (
                    <th key={column} className="px-3.5 py-2 text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">{column}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PIPELINE_HEALTH_ROWS.map((row) => (
                  <tr key={row.dataset} className="border-b border-border/70 last:border-b-0">
                    <td className="px-3.5 py-2.5 text-[12px] font-medium text-foreground">{row.dataset}</td>
                    <td className="px-3.5 py-2.5 text-[12px] text-muted-foreground">{row.source}</td>
                    <td className="px-3.5 py-2.5 text-[12px] text-muted-foreground">{row.freshness}</td>
                    <td className="px-3.5 py-2.5 text-[12px]">
                      <span className={row.status === "Fresh" ? "inline-flex rounded-full border border-emerald-600/25 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-700" : "inline-flex rounded-full border border-amber-600/25 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-700"}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-3.5 py-2.5 text-[12px]">
                      <button onClick={() => handleDatasetAction(row)} className="inline-flex items-center gap-1 font-semibold text-primary hover:underline">
                        {row.actionLabel}<ArrowUpRight className="h-3 w-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <aside className="space-y-3">
          <section className="overflow-hidden rounded-md border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-3.5 py-2.5">
              <h3 className="text-[13px] font-semibold text-foreground">Recent Activity</h3>
              <span className="text-[11px] font-medium text-muted-foreground">12 events</span>
            </div>
            <div className="divide-y divide-border/70">
              {RECENT_ACTIVITY.map((event) => (
                <div key={event.id} className="px-3.5 py-2.5">
                  <p className="text-[12px] font-medium leading-4 text-foreground">{event.title}</p>
                  <div className="mt-1 flex items-end justify-between gap-2">
                    <div>
                      <p className="text-[10px] text-muted-foreground">{event.timeAgo}</p>
                      <p className="text-[10px] text-muted-foreground">{event.context}</p>
                    </div>
                    <button onClick={() => setSelectedActivity(event)} className="text-[10px] font-semibold text-primary hover:underline">{event.actionLabel}</button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <button onClick={() => setInsightOpen(true)} className="w-full rounded-md border border-border bg-card px-3.5 py-3 text-left hover:border-primary/40">
            <div className="mb-1.5 flex items-center gap-1.5">
              <Bot className="h-3.5 w-3.5 text-primary" />
              <h3 className="text-[13px] font-semibold text-foreground">AI Predictive Insight</h3>
            </div>
            <p className="text-[12px] leading-4.5 text-muted-foreground">Congestion probability rising — 78% likelihood within 90 days for Cairo region.</p>
          </button>
        </aside>
      </div>

      {briefingOpen && (
        <OverlayModal title="Executive One-Click Briefing" onClose={() => setBriefingOpen(false)}>
          <div className="space-y-3 text-sm">
            <p><strong>Summary:</strong> {briefingSummary.keyMessage}</p>
            <p><strong>Fresh datasets:</strong> {briefingSummary.healthyCount}</p>
            <p><strong>Delayed datasets:</strong> {briefingSummary.delayedCount}</p>
            {briefingSummary.delayedDatasets.length > 0 && <p><strong>Needs attention:</strong> {briefingSummary.delayedDatasets.join(", ")}</p>}
            <button
              onClick={() => {
                toast({ title: "Briefing generated", description: "Executive summary packaged and ready to share." });
                setBriefingOpen(false);
              }}
              className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
            >
              Generate Briefing Pack
            </button>
          </div>
        </OverlayModal>
      )}

      {selectedDataset && (
        <OverlayModal title={`${selectedDataset.actionLabel}: ${selectedDataset.dataset}`} onClose={() => setSelectedDataset(null)}>
          <div className="space-y-3 text-sm">
            <p><strong>Source:</strong> {selectedDataset.source}</p>
            <p><strong>Freshness:</strong> {selectedDataset.freshness}</p>
            <p><strong>Status:</strong> {selectedDataset.status}</p>
            <div className="flex items-center gap-2">
              <button onClick={() => openDatasetManager(selectedDataset.dataset)} className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">Open in Dataset Manager</button>
              <button onClick={() => setSelectedDataset(null)} className="rounded-md border border-border px-3 py-1.5 text-xs">Close</button>
            </div>
          </div>
        </OverlayModal>
      )}

      {selectedActivity && (
        <OverlayModal title={`Activity Details · ${selectedActivity.actionLabel}`} onClose={() => setSelectedActivity(null)}>
          <div className="space-y-2 text-sm">
            <p><strong>Event:</strong> {selectedActivity.title}</p>
            <p><strong>Time:</strong> {selectedActivity.timeAgo}</p>
            <p><strong>Context:</strong> {selectedActivity.context}</p>
            <p>{selectedActivity.details}</p>
          </div>
        </OverlayModal>
      )}

      {insightOpen && (
        <OverlayModal title="Predictive Insight Details" onClose={() => setInsightOpen(false)}>
          <div className="space-y-3 text-sm">
            <p><strong>Finding:</strong> Congestion probability rising — 78% likelihood within 90 days for Cairo region.</p>
            <p><strong>Drivers:</strong> Capacity growth, recurring PM delay spikes, and elevated outage recurrences.</p>
            <button
              onClick={() => {
                toast({ title: "Mitigation runbook opened", description: "Proactive capacity planning workflow started." });
                setInsightOpen(false);
              }}
              className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
            >
              Start Mitigation Workflow
            </button>
          </div>
        </OverlayModal>
      )}
    </section>
  );
}
