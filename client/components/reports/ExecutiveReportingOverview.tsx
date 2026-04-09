import { ArrowUpRight, Bot, CheckCircle2 } from "lucide-react";

interface PipelineHealthRow {
  dataset: string;
  source: string;
  freshness: string;
  status: "Fresh" | "Delayed";
  actionLabel: string;
}

interface ActivityEvent {
  title: string;
  timeAgo: string;
  context: string;
  actionLabel: string;
}

const PIPELINE_HEALTH_ROWS: PipelineHealthRow[] = [
  {
    dataset: "Alarm KPI Dataset",
    source: "Alarm Module",
    freshness: "2 min ago",
    status: "Fresh",
    actionLabel: "View Dataset",
  },
  {
    dataset: "Transport KPI Dataset",
    source: "Network PM",
    freshness: "47 min ago",
    status: "Delayed",
    actionLabel: "Investigate",
  },
  {
    dataset: "Revenue Correlation",
    source: "Finance BI",
    freshness: "5 min ago",
    status: "Fresh",
    actionLabel: "View Dataset",
  },
  {
    dataset: "Regulatory SLA Snapshot",
    source: "Compliance Engine",
    freshness: "9 min ago",
    status: "Fresh",
    actionLabel: "View Dataset",
  },
  {
    dataset: "QoS Degradation Signals",
    source: "RAN Analytics",
    freshness: "14 min ago",
    status: "Fresh",
    actionLabel: "View Dataset",
  },
];

const RECENT_ACTIVITY: ActivityEvent[] = [
  {
    title: "Executive summary generated",
    timeAgo: "3 min ago",
    context: "One-Click Briefing",
    actionLabel: "Open",
  },
  {
    title: "Transport KPI delay threshold breached",
    timeAgo: "11 min ago",
    context: "Pipeline Monitor",
    actionLabel: "Investigate",
  },
  {
    title: "Q2 board report scheduled",
    timeAgo: "26 min ago",
    context: "Scheduling & Distribution",
    actionLabel: "Review",
  },
  {
    title: "Regulatory annex updated",
    timeAgo: "42 min ago",
    context: "Regulatory Intelligence Hub",
    actionLabel: "View",
  },
  {
    title: "Revenue correlation dataset refreshed",
    timeAgo: "1 hr ago",
    context: "Dataset Manager",
    actionLabel: "Open",
  },
];

export default function ExecutiveReportingOverview() {
  return (
    <section className="space-y-3">
      <header className="flex items-center justify-end gap-2">
        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-600/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold tracking-[0.1em] text-emerald-700">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
          LIVE
        </span>
        <button className="rounded-md border border-primary/40 bg-primary px-3 py-1.5 text-[11px] font-semibold text-primary-foreground hover:bg-primary/90">
          One-Click Briefing
        </button>
      </header>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1.7fr_1fr]">
        <article className="overflow-hidden rounded-md border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-3.5 py-2.5">
            <h2 className="text-[13px] font-semibold text-foreground">Pipeline Health Overview</h2>
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-600/25 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
              <CheckCircle2 className="h-3 w-3" />
              All Healthy
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border bg-muted/20">
                  {["Dataset", "Source", "Freshness", "Status", "Action"].map((column) => (
                    <th
                      key={column}
                      className="px-3.5 py-2 text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground"
                    >
                      {column}
                    </th>
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
                      <span
                        className={
                          row.status === "Fresh"
                            ? "inline-flex rounded-full border border-emerald-600/25 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-700"
                            : "inline-flex rounded-full border border-amber-600/25 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-700"
                        }
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="px-3.5 py-2.5 text-[12px]">
                      <button className="inline-flex items-center gap-1 font-semibold text-primary hover:underline">
                        {row.actionLabel}
                        <ArrowUpRight className="h-3 w-3" />
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
                <div key={`${event.title}-${event.timeAgo}`} className="px-3.5 py-2.5">
                  <p className="text-[12px] font-medium leading-4 text-foreground">{event.title}</p>
                  <div className="mt-1 flex items-end justify-between gap-2">
                    <div>
                      <p className="text-[10px] text-muted-foreground">{event.timeAgo}</p>
                      <p className="text-[10px] text-muted-foreground">{event.context}</p>
                    </div>
                    <button className="text-[10px] font-semibold text-primary hover:underline">{event.actionLabel}</button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-md border border-border bg-card px-3.5 py-3">
            <div className="mb-1.5 flex items-center gap-1.5">
              <Bot className="h-3.5 w-3.5 text-primary" />
              <h3 className="text-[13px] font-semibold text-foreground">AI Predictive Insight</h3>
            </div>
            <p className="text-[12px] leading-4.5 text-muted-foreground">
              Congestion probability rising — 78% likelihood within 90 days for Cairo region.
            </p>
          </section>
        </aside>
      </div>
    </section>
  );
}
