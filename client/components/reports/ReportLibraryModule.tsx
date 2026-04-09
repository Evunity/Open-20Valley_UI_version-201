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
  Plus,
  Search,
  Tag,
} from "lucide-react";

interface ReportLibraryItem {
  id: string;
  reportName: string;
  dataset: string;
  owner: string;
  schedule: string;
  status: "Active" | "Draft" | "Legal Hold";
  usage: string;
}

const REPORT_LIBRARY_ROWS: ReportLibraryItem[] = [
  {
    id: "rpt-101",
    reportName: "Daily NOC Summary",
    dataset: "NOC Unified Events",
    owner: "NOC Ops",
    schedule: "Daily · 06:00",
    status: "Active",
    usage: "18.4K",
  },
  {
    id: "rpt-102",
    reportName: "Weekly SLA Compliance",
    dataset: "Service Assurance Ledger",
    owner: "SLA Office",
    schedule: "Weekly · Mon 08:30",
    status: "Active",
    usage: "9.1K",
  },
  {
    id: "rpt-103",
    reportName: "Vendor Scorecard Q1",
    dataset: "Vendor Performance Mart",
    owner: "Procurement BI",
    schedule: "Manual Refresh",
    status: "Draft",
    usage: "1.7K",
  },
  {
    id: "rpt-104",
    reportName: "Regulatory Pack",
    dataset: "Regulatory Evidence Vault",
    owner: "Compliance Team",
    schedule: "Monthly · Day 1",
    status: "Legal Hold",
    usage: "4.3K",
  },
  {
    id: "rpt-105",
    reportName: "Automation ROI Analysis",
    dataset: "Automation Outcome Cube",
    owner: "Automation CoE",
    schedule: "Monthly · Day 5",
    status: "Active",
    usage: "6.8K",
  },
];

const TOOLBAR_ACTIONS = [
  { label: "Filters", icon: Filter },
  { label: "Tags", icon: Tag },
  { label: "Favorites", icon: Heart },
  { label: "Export", icon: Download },
  { label: "Version History", icon: FileClock },
  { label: "Archive", icon: Archive },
];

const getStatusClassName = (status: ReportLibraryItem["status"]) => {
  switch (status) {
    case "Active":
      return "border-emerald-600/25 bg-emerald-500/10 text-emerald-700";
    case "Draft":
      return "border-amber-600/25 bg-amber-500/10 text-amber-700";
    case "Legal Hold":
      return "border-rose-600/25 bg-rose-500/10 text-rose-700";
    default:
      return "border-border bg-muted text-foreground";
  }
};

export default function ReportLibraryModule() {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-end">
        <button className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-[11px] font-semibold text-primary-foreground hover:bg-primary/90">
          <Plus className="h-3.5 w-3.5" />
          Create Report
        </button>
      </div>

      <div className="overflow-hidden rounded-md border border-border bg-card">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-3.5 py-2.5">
          <label className="relative w-full min-w-[240px] max-w-[360px]">
            <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search reports"
              className="h-8 w-full rounded-md border border-border bg-background pl-7 pr-2 text-[12px] outline-none placeholder:text-muted-foreground focus:border-primary/40"
            />
          </label>

          <div className="flex flex-wrap items-center gap-1.5">
            {TOOLBAR_ACTIONS.map(({ label, icon: Icon }) => (
              <button
                key={label}
                className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2.5 py-1.5 text-[11px] font-medium text-foreground hover:bg-muted/40"
              >
                <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border bg-muted/20">
                {["Report Name", "Dataset", "Owner", "Schedule", "Status", "Usage", "Actions"].map((column) => (
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
              {REPORT_LIBRARY_ROWS.map((row) => (
                <tr key={row.id} className="border-b border-border/70 last:border-b-0">
                  <td className="px-3.5 py-2.5 text-[12px] font-medium text-foreground">{row.reportName}</td>
                  <td className="px-3.5 py-2.5 text-[12px] text-muted-foreground">{row.dataset}</td>
                  <td className="px-3.5 py-2.5 text-[12px] text-muted-foreground">{row.owner}</td>
                  <td className="px-3.5 py-2.5 text-[12px] text-muted-foreground">{row.schedule}</td>
                  <td className="px-3.5 py-2.5 text-[12px]">
                    <span
                      className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold ${getStatusClassName(row.status)}`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="px-3.5 py-2.5 text-[12px] font-semibold text-foreground">{row.usage}</td>
                  <td className="px-3.5 py-2.5">
                    <div className="flex items-center gap-1">
                      <button className="rounded p-1 text-muted-foreground hover:bg-muted/40 hover:text-foreground" title="View report">
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      <button className="rounded p-1 text-muted-foreground hover:bg-muted/40 hover:text-foreground" title="Download report">
                        <Download className="h-3.5 w-3.5" />
                      </button>
                      <button className="rounded p-1 text-muted-foreground hover:bg-muted/40 hover:text-foreground" title="More actions">
                        <MoreHorizontal className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-3.5 py-2.5">
          <p className="text-[11px] text-muted-foreground">Showing 1-5 of 342 reports</p>

          <div className="flex items-center gap-1">
            <button className="inline-flex h-7 w-7 items-center justify-center rounded border border-border bg-background text-muted-foreground hover:bg-muted/40">
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button className="inline-flex h-7 min-w-7 items-center justify-center rounded border border-primary/40 bg-primary/10 px-2 text-[11px] font-semibold text-primary">
              1
            </button>
            <button className="inline-flex h-7 min-w-7 items-center justify-center rounded border border-border bg-background px-2 text-[11px] font-medium text-foreground hover:bg-muted/40">
              2
            </button>
            <button className="inline-flex h-7 min-w-7 items-center justify-center rounded border border-border bg-background px-2 text-[11px] font-medium text-foreground hover:bg-muted/40">
              3
            </button>
            <span className="px-1 text-[11px] text-muted-foreground">…</span>
            <button className="inline-flex h-7 min-w-7 items-center justify-center rounded border border-border bg-background px-2 text-[11px] font-medium text-foreground hover:bg-muted/40">
              69
            </button>
            <button className="inline-flex h-7 w-7 items-center justify-center rounded border border-border bg-background text-muted-foreground hover:bg-muted/40">
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
