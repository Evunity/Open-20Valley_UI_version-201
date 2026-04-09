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
    <section className="space-y-4">
      <header className="flex flex-wrap items-center justify-end gap-2">
        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-emerald-700">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
          LIVE
        </span>
        <button className="rounded-md border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/15">
          One-Click Briefing
        </button>
      </header>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.65fr_1fr]">
        <article className="rounded-md border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h2 className="text-sm font-semibold text-foreground">Pipeline Health Overview</h2>
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[11px] font-medium text-emerald-700">
              <CheckCircle2 className="h-3.5 w-3.5" />
              All Healthy
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  {["Dataset", "Source", "Freshness", "Status", "Action"].map((column) => (
                    <th key={column} className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PIPELINE_HEALTH_ROWS.map((row) => (
                  <tr key={row.dataset} className="border-b border-border/70 last:border-b-0">
                    <td className="px-4 py-3 text-xs font-medium text-foreground">{row.dataset}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{row.source}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{row.freshness}</td>
                    <td className="px-4 py-3 text-xs">
                      <span
                        className={
                          row.status === "Fresh"
                            ? "inline-flex rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-700"
                            : "inline-flex rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-700"
                        }
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <button className="inline-flex items-center gap-1 font-medium text-primary hover:underline">
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

        <aside className="space-y-4">
          <section className="rounded-md border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h3 className="text-sm font-semibold text-foreground">Recent Activity</h3>
              <span className="text-xs font-medium text-muted-foreground">12 events</span>
            </div>
            <div className="divide-y divide-border/70">
              {RECENT_ACTIVITY.map((event) => (
                <div key={`${event.title}-${event.timeAgo}`} className="px-4 py-3">
                  <p className="text-xs font-medium text-foreground">{event.title}</p>
                  <div className="mt-1 flex items-center justify-between gap-2">
                    <div>
                      <p className="text-[11px] text-muted-foreground">{event.timeAgo}</p>
                      <p className="text-[11px] text-muted-foreground">{event.context}</p>
                    </div>
                    <button className="text-[11px] font-semibold text-primary hover:underline">{event.actionLabel}</button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-md border border-border bg-card px-4 py-3">
            <div className="mb-2 flex items-center gap-1.5">
              <Bot className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">AI Predictive Insight</h3>
            </div>
            <p className="text-xs leading-5 text-muted-foreground">
              Congestion probability rising — 78% likelihood within 90 days for Cairo region.
            </p>
          </section>
        </aside>
      </div>
    </section>
  );
}
