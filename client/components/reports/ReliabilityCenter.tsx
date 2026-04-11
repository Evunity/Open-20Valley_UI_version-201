import { useMemo, useState } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type ReliabilityTab = "Reliability" | "Consumption";

interface DayFailure {
  day: string;
  failures: number;
  severity: "normal" | "warning" | "severe";
}

interface FailureIssue {
  id: string;
  day: string;
  title: string;
  context: string;
  timestamp: string;
}

const BASE_TREND: DayFailure[] = [
  { day: "Mon", failures: 0, severity: "normal" },
  { day: "Tue", failures: 1, severity: "normal" },
  { day: "Wed", failures: 1, severity: "warning" },
  { day: "Thu", failures: 0, severity: "normal" },
  { day: "Fri", failures: 2, severity: "warning" },
  { day: "Sat", failures: 3, severity: "severe" },
  { day: "Sun", failures: 1, severity: "normal" },
];

const BASE_ISSUES: FailureIssue[] = [
  { id: "i1", day: "Sat", title: "Vendor ingestion gap — Ericsson feed", timestamp: "09:42 UTC", context: "Missing 5G counters in last ingestion window." },
  { id: "i2", day: "Fri", title: "Pipeline delay — Transport KPI", timestamp: "07:18 UTC", context: "Batch delayed 22 minutes after queue congestion." },
  { id: "i3", day: "Wed", title: "Dataset corruption — Revenue Corr.", timestamp: "11:02 UTC", context: "Checksum mismatch in incremental parquet segment." },
];

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-xl rounded-xl border border-border bg-card shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h3 className="text-sm font-semibold">{title}</h3>
          <button onClick={onClose} className="rounded-lg px-2 py-1 text-xs hover:bg-muted">Close</button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

export default function ReliabilityCenter() {
  const { toast } = useToast();
  const [tab, setTab] = useState<ReliabilityTab>("Reliability");
  const [trend, setTrend] = useState(BASE_TREND);
  const [issues, setIssues] = useState(BASE_ISSUES);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [activeIssue, setActiveIssue] = useState<FailureIssue | null>(null);
  const [riskOpen, setRiskOpen] = useState(false);
  const [hovered, setHovered] = useState<DayFailure | null>(null);

  const filteredIssues = useMemo(() => (selectedDay ? issues.filter((i) => i.day === selectedDay) : issues), [issues, selectedDay]);
  const failureCount = trend.reduce((acc, item) => acc + item.failures, 0);

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="inline-flex rounded-xl border border-border bg-card p-1">
          {(["Reliability", "Consumption"] as ReliabilityTab[]).map((item) => (
            <button key={item} onClick={() => setTab(item)} className={cn("rounded-lg px-3 py-1.5 text-xs font-semibold", tab === item ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>{item}</button>
          ))}
        </div>
        <button
          onClick={() => {
            setTrend((prev) => prev.map((item) => ({ ...item, failures: Math.max(0, item.failures + (Math.random() > 0.5 ? 1 : -1)) })));
            setIssues([...BASE_ISSUES]);
            toast({ title: "Data refreshed", description: "Reliability telemetry has been reloaded." });
          }}
          className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs"
        >
          <RefreshCw className="h-3.5 w-3.5" />Refresh
        </button>
      </div>

      {tab === "Reliability" ? (
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1.35fr_1fr]">
          <article className="rounded-xl border border-border bg-card p-3">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Failure Trends (7 Days)</h3>
              <span className="rounded-full border border-rose-600/30 bg-rose-500/10 px-2 py-0.5 text-[10px] font-semibold text-rose-700">{failureCount} failures</span>
            </div>
            <div className="relative h-64 rounded-lg border border-border bg-muted/10 p-3">
              {hovered && (
                <div className="absolute left-3 top-3 rounded-md border border-border bg-background px-2 py-1 text-[10px] shadow-sm">
                  {hovered.day}: {hovered.failures} failures
                </div>
              )}
              <div className="flex h-full items-end justify-between gap-2">
                {trend.map((item) => (
                  <button
                    key={item.day}
                    onMouseEnter={() => setHovered(item)}
                    onMouseLeave={() => setHovered(null)}
                    onClick={() => setSelectedDay((prev) => (prev === item.day ? null : item.day))}
                    className="group flex h-full w-full flex-col items-center justify-end gap-1"
                  >
                    <div
                      className={cn(
                        "w-full rounded-t transition-opacity",
                        item.severity === "normal" ? "bg-emerald-500" : item.severity === "warning" ? "bg-orange-500" : "bg-red-500",
                        selectedDay && selectedDay !== item.day && "opacity-40",
                      )}
                      style={{ height: `${Math.max(16, item.failures * 42)}px` }}
                    />
                    <span className="text-[11px] text-muted-foreground">{item.day}</span>
                  </button>
                ))}
              </div>
            </div>
          </article>

          <aside className="space-y-3 rounded-xl border border-border bg-card p-3">
            <h3 className="text-sm font-semibold">Failure Intelligence</h3>
            <div className="space-y-2">
              {filteredIssues.map((issue) => (
                <div key={issue.id} className="rounded-lg border border-border px-3 py-2">
                  <p className="text-sm font-medium">{issue.title}</p>
                  <p className="text-[11px] text-muted-foreground">{issue.timestamp}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">{issue.context}</p>
                  <button onClick={() => setActiveIssue(issue)} className="mt-1 text-[11px] text-primary hover:underline">View details</button>
                </div>
              ))}
            </div>
            <button onClick={() => setRiskOpen(true)} className="w-full rounded-lg border border-amber-600/30 bg-amber-500/10 px-3 py-2 text-left">
              <p className="text-xs font-semibold text-amber-700">Silent Misinformation Risk</p>
              <p className="text-[11px] text-amber-700/90">Delayed or partial data may hide true outage severity in executive reports.</p>
            </button>
          </aside>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="mb-2 text-sm font-semibold">Consumption Snapshot</h3>
          <p className="text-xs text-muted-foreground">Executive dashboards consumed 182 report views this week. Top asset: Daily NOC Summary.</p>
        </div>
      )}

      {activeIssue && (
        <Modal title={activeIssue.title} onClose={() => setActiveIssue(null)}>
          <p className="text-sm"><strong>Timestamp:</strong> {activeIssue.timestamp}</p>
          <p className="mt-2 text-sm">{activeIssue.context}</p>
        </Modal>
      )}

      {riskOpen && (
        <Modal title="Silent Misinformation Risk" onClose={() => setRiskOpen(false)}>
          <div className="rounded-lg border border-amber-600/30 bg-amber-500/10 p-3">
            <p className="flex items-center gap-1 text-sm font-semibold text-amber-700"><AlertTriangle className="h-4 w-4" />Risk explanation</p>
            <p className="mt-1 text-sm text-amber-700/90">When ingestion is delayed, report sections may still render as healthy based on stale values. Enable freshness gates for critical KPIs.</p>
          </div>
        </Modal>
      )}
    </section>
  );
}
