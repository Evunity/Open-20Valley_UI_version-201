import { useMemo, useState } from "react";
import { Pause, Play, RotateCcw, Settings, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import SearchableDropdown from "@/components/SearchableDropdown";
import { cn } from "@/lib/utils";

type ViewTab = "Scheduling" | "Distribution";
type ScheduleStatus = "Ready" | "Waiting" | "Retry #2" | "Paused";
type Wave = "Wave 1" | "Wave 2" | "Wave 3";

interface ScheduleRow {
  id: string;
  reportName: string;
  schedule: string;
  wave: Wave;
  dependencies: string;
  nextRun: string;
  status: ScheduleStatus;
  channel: string;
}

const INITIAL_ROWS: ScheduleRow[] = [
  { id: "s1", reportName: "Daily NOC Summary", schedule: "Daily · 06:00", wave: "Wave 1", dependencies: "Alarm KPI Dataset", nextRun: "Apr 12, 06:00", status: "Ready", channel: "Email + Dashboard" },
  { id: "s2", reportName: "Weekly SLA Compliance", schedule: "Weekly · Mon 08:30", wave: "Wave 2", dependencies: "Transport KPI + SLA Events", nextRun: "Apr 13, 08:30", status: "Waiting", channel: "Email" },
  { id: "s3", reportName: "Regulatory Compliance Pack", schedule: "Monthly · Day 1", wave: "Wave 3", dependencies: "Regulatory Evidence Vault", nextRun: "May 01, 07:00", status: "Retry #2", channel: "Secure Share" },
  { id: "s4", reportName: "Vendor Scorecard Q1", schedule: "Quarterly · 09:00", wave: "Wave 2", dependencies: "Vendor Performance Mart", nextRun: "Apr 20, 09:00", status: "Ready", channel: "Dashboard" },
  { id: "s5", reportName: "Transport Health Report", schedule: "Daily · 07:15", wave: "Wave 1", dependencies: "Transport KPI Dataset", nextRun: "Apr 12, 07:15", status: "Waiting", channel: "Email + Teams" },
];

const DEFAULT_FORM = {
  reportName: "Daily NOC Summary",
  scheduleType: "Daily · 06:00",
  wave: "Wave 1",
  dependency: "Alarm KPI Dataset",
  nextRun: "Apr 12, 06:00",
  distribution: "Email + Dashboard",
  status: "Ready",
};

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl rounded-xl border border-border bg-card shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h3 className="text-sm font-semibold">{title}</h3>
          <button onClick={onClose} className="rounded-lg px-2 py-1 text-xs hover:bg-muted">Close</button>
        </div>
        <div className="max-h-[75vh] overflow-auto p-4">{children}</div>
      </div>
    </div>
  );
}

export default function SchedulingOrchestrator() {
  const { toast } = useToast();
  const [tab, setTab] = useState<ViewTab>("Scheduling");
  const [rows, setRows] = useState(INITIAL_ROWS);
  const [newScheduleOpen, setNewScheduleOpen] = useState(false);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [detailsRow, setDetailsRow] = useState<ScheduleRow | null>(null);

  const distributionSummary = useMemo(
    () => [
      { channel: "Email", count: rows.filter((r) => r.channel.includes("Email")).length },
      { channel: "Dashboard", count: rows.filter((r) => r.channel.includes("Dashboard")).length },
      { channel: "Secure Share", count: rows.filter((r) => r.channel.includes("Secure")).length },
      { channel: "Teams", count: rows.filter((r) => r.channel.includes("Teams")).length },
    ],
    [rows],
  );

  const updateRowStatus = (id: string, nextStatus: ScheduleStatus) => {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, status: nextStatus } : row)));
  };

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="inline-flex rounded-xl border border-border bg-card p-1">
          {(["Scheduling", "Distribution"] as ViewTab[]).map((item) => (
            <button
              key={item}
              onClick={() => setTab(item)}
              className={cn("rounded-lg px-3 py-1.5 text-xs font-semibold", tab === item ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}
            >
              {item}
            </button>
          ))}
        </div>
        <button onClick={() => setNewScheduleOpen(true)} className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">New Schedule</button>
      </div>

      {tab === "Scheduling" ? (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border bg-muted/20">
                  {["Report Name", "Schedule", "Wave", "Dependencies", "Next Run", "Status", "Actions"].map((h) => (
                    <th key={h} className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-border/70 last:border-b-0">
                    <td className="px-3 py-2.5 text-[12px] font-medium">{row.reportName}</td>
                    <td className="px-3 py-2.5 text-[12px] text-muted-foreground">{row.schedule}</td>
                    <td className="px-3 py-2.5">
                      <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-semibold", row.wave === "Wave 1" ? "border-blue-600/30 bg-blue-500/10 text-blue-700" : row.wave === "Wave 2" ? "border-purple-600/30 bg-purple-500/10 text-purple-700" : "border-amber-600/30 bg-amber-500/10 text-amber-700")}>{row.wave}</span>
                    </td>
                    <td className="px-3 py-2.5 text-[12px] text-muted-foreground">{row.dependencies}</td>
                    <td className="px-3 py-2.5 text-[12px] text-muted-foreground">{row.nextRun}</td>
                    <td className="px-3 py-2.5">
                      <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-semibold", row.status === "Ready" ? "border-emerald-600/30 bg-emerald-500/10 text-emerald-700" : row.status === "Waiting" ? "border-slate-600/30 bg-slate-500/10 text-slate-700" : row.status === "Retry #2" ? "border-rose-600/30 bg-rose-500/10 text-rose-700" : "border-amber-600/30 bg-amber-500/10 text-amber-700")}>{row.status}</span>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1">
                        <button onClick={() => { updateRowStatus(row.id, "Ready"); toast({ title: "Run initiated", description: `${row.reportName} queued for immediate execution.` }); }} className="rounded border border-border p-1.5 hover:bg-muted/30" title="Run now"><Play className="h-3.5 w-3.5" /></button>
                        <button onClick={() => { if (row.status === "Retry #2") { updateRowStatus(row.id, "Ready"); toast({ title: "Retry successful", description: `${row.reportName} moved to Ready.` }); } else { toast({ title: "Retry not needed", description: `${row.reportName} is not in retry state.` }); } }} className="rounded border border-border p-1.5 hover:bg-muted/30" title="Retry"><RotateCcw className="h-3.5 w-3.5" /></button>
                        <button onClick={() => { updateRowStatus(row.id, row.status === "Paused" ? "Ready" : "Paused"); }} className="rounded border border-border p-1.5 hover:bg-muted/30" title="Pause/Resume">{row.status === "Paused" ? <Zap className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}</button>
                        <button onClick={() => setDetailsRow(row)} className="rounded border border-border p-1.5 hover:bg-muted/30" title="Settings"><Settings className="h-3.5 w-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card p-3">
          <h3 className="mb-2 text-sm font-semibold">Distribution Channels</h3>
          <div className="space-y-2">
            {distributionSummary.map((item) => (
              <div key={item.channel} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                <p className="text-sm">{item.channel}</p>
                <span className="text-xs text-muted-foreground">{item.count} schedules</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {newScheduleOpen && (
        <Modal title="New Schedule" onClose={() => setNewScheduleOpen(false)}>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <label className="space-y-1"><span className="text-xs font-semibold text-muted-foreground">Report Name</span><input value={form.reportName} onChange={(e) => setForm((p) => ({ ...p, reportName: e.target.value }))} className="h-9 w-full rounded-xl border border-border px-3 text-sm" /></label>
            <div><span className="mb-1 block text-xs font-semibold text-muted-foreground">Schedule Type</span><SearchableDropdown label="" compact multiSelect={false} options={["Daily · 06:00", "Weekly · Mon 08:30", "Monthly · Day 1"]} selected={[form.scheduleType]} onChange={(v) => setForm((p) => ({ ...p, scheduleType: v[0] ?? p.scheduleType }))} dropdownId="schedule-form-type" /></div>
            <div><span className="mb-1 block text-xs font-semibold text-muted-foreground">Wave</span><SearchableDropdown label="" compact multiSelect={false} options={["Wave 1", "Wave 2", "Wave 3"]} selected={[form.wave]} onChange={(v) => setForm((p) => ({ ...p, wave: v[0] ?? p.wave }))} dropdownId="schedule-form-wave" /></div>
            <label className="space-y-1"><span className="text-xs font-semibold text-muted-foreground">Dependency</span><input value={form.dependency} onChange={(e) => setForm((p) => ({ ...p, dependency: e.target.value }))} className="h-9 w-full rounded-xl border border-border px-3 text-sm" /></label>
            <label className="space-y-1"><span className="text-xs font-semibold text-muted-foreground">Next Run</span><input value={form.nextRun} onChange={(e) => setForm((p) => ({ ...p, nextRun: e.target.value }))} className="h-9 w-full rounded-xl border border-border px-3 text-sm" /></label>
            <label className="space-y-1"><span className="text-xs font-semibold text-muted-foreground">Distribution Channel</span><input value={form.distribution} onChange={(e) => setForm((p) => ({ ...p, distribution: e.target.value }))} className="h-9 w-full rounded-xl border border-border px-3 text-sm" /></label>
            <div className="md:col-span-2"><span className="mb-1 block text-xs font-semibold text-muted-foreground">Status</span><SearchableDropdown label="" compact multiSelect={false} options={["Ready", "Waiting", "Retry #2"]} selected={[form.status]} onChange={(v) => setForm((p) => ({ ...p, status: v[0] ?? p.status }))} dropdownId="schedule-form-status" /></div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button onClick={() => setNewScheduleOpen(false)} className="rounded-lg border border-border px-3 py-1.5 text-xs">Cancel</button>
            <button
              onClick={() => {
                setRows((prev) => [
                  {
                    id: `s-${Date.now()}`,
                    reportName: form.reportName,
                    schedule: form.scheduleType,
                    wave: form.wave as Wave,
                    dependencies: form.dependency,
                    nextRun: form.nextRun,
                    status: form.status as ScheduleStatus,
                    channel: form.distribution,
                  },
                  ...prev,
                ]);
                setNewScheduleOpen(false);
                toast({ title: "Schedule created", description: `${form.reportName} has been added.` });
              }}
              className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
            >
              Create
            </button>
          </div>
        </Modal>
      )}

      {detailsRow && (
        <Modal title={`Schedule Details · ${detailsRow.reportName}`} onClose={() => setDetailsRow(null)}>
          <div className="space-y-2 text-sm">
            <p><strong>Schedule:</strong> {detailsRow.schedule}</p>
            <p><strong>Wave:</strong> {detailsRow.wave}</p>
            <p><strong>Dependencies:</strong> {detailsRow.dependencies}</p>
            <p><strong>Next Run:</strong> {detailsRow.nextRun}</p>
            <p><strong>Distribution:</strong> {detailsRow.channel}</p>
          </div>
        </Modal>
      )}
    </section>
  );
}
