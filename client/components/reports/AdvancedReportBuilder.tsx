import { useMemo, useState } from "react";
import { AlertTriangle, Eye, Plus, Save, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import SearchableDropdown from "@/components/SearchableDropdown";

type BuilderStatus = "Draft" | "Validated" | "Open";
type ChartType = "Bar Chart" | "Line Chart" | "Donut";

interface PaletteKPI {
  name: string;
  descriptor: string;
}

interface CanvasBlock {
  id: string;
  title: string;
}

interface ConditionRule {
  id: string;
  when: string;
  action: string;
}

const KPI_ITEMS: PaletteKPI[] = [
  { name: "Call Setup Success Rate", descriptor: "Accessibility · 4G" },
  { name: "CS/PS Availability", descriptor: "Accessibility · 3G" },
  { name: "Average Cell Throughput", descriptor: "Throughput · 5G" },
  { name: "Spectral Efficiency", descriptor: "Throughput · 4G" },
  { name: "Radio Link Failure Rate", descriptor: "Latency · 4G" },
  { name: "Handover Success Rate", descriptor: "Latency · 5G" },
];

const BLOCK_CATEGORIES = [
  "Chart",
  "Table",
  "Heatmap",
  "SLA Block",
  "AI Forecast",
  "Risk Panel",
  "Automation Impact",
  "Financial Risk",
  "Topology Snapshot",
];

const DEFAULT_PARAMS = {
  region: "Cairo Region",
  vendor: "All Vendors",
  technology: "LTE, 5G NR",
  timeWindow: "Last 30 Days",
  tenant: "All Tenants",
};

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl rounded-xl border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h3 className="text-sm font-semibold">{title}</h3>
          <button onClick={onClose} className="rounded px-2 py-1 text-sm hover:bg-muted">Close</button>
        </div>
        <div className="max-h-[76vh] overflow-auto p-4">{children}</div>
      </div>
    </div>
  );
}

export default function AdvancedReportBuilder() {
  const { toast } = useToast();
  const [status, setStatus] = useState<BuilderStatus>("Draft");
  const [kpiQuery, setKpiQuery] = useState("");
  const [activePaletteItem, setActivePaletteItem] = useState<string>("KPI Card");
  const [activeChartType, setActiveChartType] = useState<ChartType>("Bar Chart");
  const [canvasBlocks, setCanvasBlocks] = useState<CanvasBlock[]>([]);
  const [selectedCanvasBlock, setSelectedCanvasBlock] = useState<string | null>(null);

  const [params, setParams] = useState(DEFAULT_PARAMS);
  const [sourceModal, setSourceModal] = useState<{ title: string; body: string } | null>(null);
  const [conditionModalOpen, setConditionModalOpen] = useState(false);
  const [conditionDraft, setConditionDraft] = useState({ when: "If Utilization > 80%", action: "Show Congestion Analysis section" });
  const [condition, setCondition] = useState<ConditionRule>({
    id: "cond-1",
    when: "If Utilization > 80%",
    action: "Show Congestion Analysis section",
  });
  const [selectedCondition, setSelectedCondition] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [simulateOpen, setSimulateOpen] = useState(false);

  const filteredKpis = useMemo(
    () => KPI_ITEMS.filter((item) => item.name.toLowerCase().includes(kpiQuery.toLowerCase())),
    [kpiQuery],
  );

  const addBlockToCanvas = () => {
    const title = activePaletteItem === "KPI Card" ? "KPI Card Block" : `${activePaletteItem} Block`;
    const next: CanvasBlock = { id: `blk-${Date.now()}`, title };
    setCanvasBlocks((prev) => [...prev, next]);
    setSelectedCanvasBlock(next.id);
    toast({ title: "Block added", description: `${title} added to report canvas.` });
  };

  return (
    <section className="grid grid-cols-1 gap-3 xl:grid-cols-[300px_minmax(0,1fr)_340px]">
      {/* Left palette */}
      <aside className="rounded-xl border border-border bg-card p-3">
        <div className="mb-3 grid grid-cols-3 gap-1.5 rounded-xl bg-muted/30 p-1">
          {(["Draft", "Validated", "Open"] as BuilderStatus[]).map((item) => (
            <button
              key={item}
              onClick={() => setStatus(item)}
              className={cn(
                "rounded-lg px-2 py-1.5 text-[11px] font-semibold",
                status === item ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {item}
            </button>
          ))}
        </div>

        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Report Blocks</p>
        <button
          onClick={() => setActivePaletteItem("KPI Card")}
          className={cn(
            "mb-2 w-full rounded-xl border px-3 py-2 text-left text-sm font-medium",
            activePaletteItem === "KPI Card" ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-muted/30",
          )}
        >
          KPI Card
        </button>

        <label className="relative mb-2 block">
          <input
            value={kpiQuery}
            onChange={(e) => setKpiQuery(e.target.value)}
            placeholder="Search KPIs..."
            className="h-9 w-full rounded-xl border border-border bg-background px-3 text-sm"
          />
        </label>
        <div className="mb-3 max-h-48 space-y-1 overflow-auto rounded-xl border border-border/70 p-1.5">
          {filteredKpis.map((item) => (
            <button
              key={item.name}
              onClick={() => setActivePaletteItem(item.name)}
              className={cn(
                "w-full rounded-lg px-2 py-2 text-left",
                activePaletteItem === item.name ? "bg-primary/10" : "hover:bg-muted/40",
              )}
            >
              <p className="text-[12px] font-medium">{item.name}</p>
              <p className="text-[10px] text-muted-foreground">{item.descriptor}</p>
            </button>
          ))}
        </div>

        <div className="space-y-1">
          {BLOCK_CATEGORIES.map((item) => (
            <button
              key={item}
              onClick={() => setActivePaletteItem(item)}
              className={cn(
                "w-full rounded-lg border px-2.5 py-1.5 text-left text-[12px]",
                activePaletteItem === item ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-muted/30",
              )}
            >
              {item}
            </button>
          ))}
        </div>

        <p className="mb-2 mt-4 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Chart Types</p>
        <div className="space-y-1.5">
          {(["Bar Chart", "Line Chart", "Donut"] as ChartType[]).map((item) => (
            <button
              key={item}
              onClick={() => setActiveChartType(item)}
              className={cn(
                "w-full rounded-lg border px-2.5 py-1.5 text-left text-[12px]",
                activeChartType === item ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-muted/30",
              )}
            >
              {item}
            </button>
          ))}
        </div>
      </aside>

      {/* Canvas */}
      <main className="rounded-xl border border-border bg-card p-4">
        <p className="mb-3 text-sm font-semibold">Report: Untitled Report</p>

        <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
          {[
            { title: "Fault Index", value: "3.2", sub: "Threshold: 2.5" },
            { title: "Total Alarms", value: "24,891", sub: "-12% reduction" },
            { title: "Clear Rate", value: "94.7%", sub: "+2.1% QoQ" },
          ].map((card) => (
            <article key={card.title} className="rounded-xl border border-border bg-background p-3">
              <p className="text-[11px] text-muted-foreground">{card.title}</p>
              <p className="mt-1 text-xl font-bold">{card.value}</p>
              <p className="text-[11px] text-muted-foreground">{card.sub}</p>
            </article>
          ))}
        </div>

        <div className="mt-3 rounded-xl border border-emerald-400/40 bg-emerald-500/10 px-3 py-2 text-[12px] text-emerald-700">
          Temporal Alignment: Auto-normalized — Hourly + Weekly + Monthly
        </div>

        <section className="mt-3 rounded-xl border border-border bg-background p-3">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Alarm Trend — Last 30 Days</h3>
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
              <span>42 data points</span>
              <span className="rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 text-primary">Multi-Source</span>
            </div>
          </div>
          <div className="relative h-52 rounded-lg border border-border/70 bg-muted/10 p-3">
            <div className="absolute right-2 top-1/2 z-10 -translate-y-1/2 text-[10px] text-muted-foreground">Threshold: 2500</div>
            <div className="absolute left-0 right-0 top-1/2 border-t border-dashed border-rose-500/80" />
            <div className="absolute left-[68%] top-0 bottom-0 border-l border-amber-500/90" />
            <div className="absolute left-[67%] top-4 rounded-md border border-amber-500/50 bg-amber-500/10 px-2 py-1 text-[10px] text-amber-700">Incident #4821</div>
            <div className="flex h-full items-end justify-between gap-1">
              {[1800, 2100, 1950, 2300, 2600, 1700, 2800, 2200, 2400, 2000, 2550, 1900].map((value, idx) => (
                <div
                  key={`${value}-${idx}`}
                  className={cn(
                    "w-full rounded-t",
                    idx === 6 ? "bg-red-500" : idx === 8 ? "bg-orange-500" : idx % 3 === 0 ? "bg-indigo-500" : "bg-blue-500",
                  )}
                  style={{ height: `${Math.max(20, value / 35)}px` }}
                />
              ))}
            </div>
          </div>
        </section>

        <button
          onClick={addBlockToCanvas}
          className="mt-3 block w-full rounded-xl border-2 border-dashed border-border px-4 py-6 text-center hover:border-primary/50 hover:bg-muted/30"
        >
          <p className="text-sm font-medium">Drag blocks here to add to report</p>
          <p className="text-[11px] text-muted-foreground">Active palette: {activePaletteItem}</p>
        </button>

        {canvasBlocks.length > 0 && (
          <div className="mt-3 space-y-2">
            {canvasBlocks.map((block) => (
              <button
                key={block.id}
                onClick={() => setSelectedCanvasBlock(block.id)}
                className={cn(
                  "w-full rounded-xl border px-3 py-2 text-left",
                  selectedCanvasBlock === block.id ? "border-primary bg-primary/10" : "border-border bg-background",
                )}
              >
                <p className="text-sm font-medium">{block.title}</p>
                <p className="text-[11px] text-muted-foreground">Mock block added from palette selection</p>
              </button>
            ))}
          </div>
        )}
      </main>

      {/* Right config */}
      <aside className="space-y-3 rounded-xl border border-border bg-card p-3">
        <div className="flex items-center justify-end gap-1.5">
          <button onClick={() => setSimulateOpen(true)} className="rounded-lg border border-border px-2.5 py-1.5 text-xs">Simulate</button>
          <button onClick={() => setPreviewOpen(true)} className="rounded-lg border border-border px-2.5 py-1.5 text-xs">Preview</button>
          <button onClick={() => toast({ title: "Report saved", description: "Untitled Report saved successfully." })} className="rounded-lg bg-primary px-2.5 py-1.5 text-xs font-semibold text-primary-foreground">Save Report</button>
        </div>

        <section className="rounded-xl border border-border bg-background p-3">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Parameters</h3>
            <button onClick={() => setParams(DEFAULT_PARAMS)} className="text-[11px] text-primary hover:underline">Reset</button>
          </div>
          <div className="space-y-2">
            <div><p className="mb-1 text-[11px]">Region</p><SearchableDropdown label="" compact multiSelect={false} options={["Cairo Region", "Alexandria Region"]} selected={[params.region]} onChange={(v) => setParams((p) => ({ ...p, region: v[0] ?? p.region }))} dropdownId="builder-param-region" /></div>
            <div><p className="mb-1 text-[11px]">Vendor</p><SearchableDropdown label="" compact multiSelect={false} options={["All Vendors", "Huawei", "Nokia", "Ericsson"]} selected={[params.vendor]} onChange={(v) => setParams((p) => ({ ...p, vendor: v[0] ?? p.vendor }))} dropdownId="builder-param-vendor" /></div>
            <div><p className="mb-1 text-[11px]">Technology</p><SearchableDropdown label="" compact multiSelect={false} options={["LTE, 5G NR", "LTE", "5G NR", "3G"]} selected={[params.technology]} onChange={(v) => setParams((p) => ({ ...p, technology: v[0] ?? p.technology }))} dropdownId="builder-param-tech" /></div>
            <div><p className="mb-1 text-[11px]">Time Window</p><SearchableDropdown label="" compact multiSelect={false} options={["Last 30 Days", "Last 7 Days", "Last 90 Days"]} selected={[params.timeWindow]} onChange={(v) => setParams((p) => ({ ...p, timeWindow: v[0] ?? p.timeWindow }))} dropdownId="builder-param-time" /></div>
            <div><p className="mb-1 text-[11px]">Tenant</p><SearchableDropdown label="" compact multiSelect={false} options={["All Tenants", "Tenant A", "Tenant B"]} selected={[params.tenant]} onChange={(v) => setParams((p) => ({ ...p, tenant: v[0] ?? p.tenant }))} dropdownId="builder-param-tenant" /></div>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-background p-3">
          <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Data Sources</h3>
          <div className="space-y-1.5 text-sm">
            <button onClick={() => setSourceModal({ title: "Alarm KPI Dataset", body: "Primary alarm source. Refreshed every 5 minutes." })} className="w-full rounded-lg border border-border px-2 py-1.5 text-left hover:bg-muted/30">Alarm KPI Dataset</button>
            <button onClick={() => setSourceModal({ title: "Automation Executions", body: "Execution outcomes and rollback telemetry stream." })} className="w-full rounded-lg border border-border px-2 py-1.5 text-left hover:bg-muted/30">Automation Executions</button>
            <button onClick={() => setSourceModal({ title: "Transport KPI (delayed)", body: "Warning: latest batch delayed by 27 minutes." })} className="flex w-full items-center justify-between rounded-lg border border-amber-500/40 bg-amber-500/10 px-2 py-1.5 text-left">
              <span>Transport KPI (delayed)</span>
              <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
            </button>
          </div>
          <div className="mt-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-2">
            <p className="text-xs font-semibold text-emerald-700">Multi-Source Fusion Active</p>
            <p className="text-[11px] text-emerald-700/90">Alarm Reduction + Automation Executions + Automation ROI</p>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-background p-3">
          <h3 className="mb-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Conditional Logic</h3>
          <p className="mb-2 text-[11px] text-muted-foreground">Show/hide report sections based on thresholds</p>
          <button
            onClick={() => {
              setSelectedCondition(true);
              setConditionDraft({ when: condition.when, action: condition.action });
              setConditionModalOpen(true);
            }}
            className={cn(
              "w-full rounded-lg border px-2 py-2 text-left",
              selectedCondition ? "border-primary bg-primary/10" : "border-border hover:bg-muted/30",
            )}
          >
            <p className="text-sm font-medium">{condition.when}</p>
            <p className="text-[11px] text-muted-foreground">{condition.action}</p>
          </button>
          <button onClick={() => { setSelectedCondition(false); setConditionDraft({ when: "If Utilization > 80%", action: "Show Congestion Analysis section" }); setConditionModalOpen(true); }} className="mt-2 text-xs text-primary hover:underline">Add condition</button>
        </section>
      </aside>

      {sourceModal && (
        <Modal title={sourceModal.title} onClose={() => setSourceModal(null)}>
          <p className="text-sm">{sourceModal.body}</p>
        </Modal>
      )}

      {conditionModalOpen && (
        <Modal title="Condition Builder" onClose={() => setConditionModalOpen(false)}>
          <div className="space-y-3">
            <label className="block">
              <p className="mb-1 text-xs font-semibold text-muted-foreground">Condition</p>
              <input value={conditionDraft.when} onChange={(e) => setConditionDraft((p) => ({ ...p, when: e.target.value }))} className="h-10 w-full rounded-xl border border-border px-3 text-sm" />
            </label>
            <label className="block">
              <p className="mb-1 text-xs font-semibold text-muted-foreground">Action</p>
              <input value={conditionDraft.action} onChange={(e) => setConditionDraft((p) => ({ ...p, action: e.target.value }))} className="h-10 w-full rounded-xl border border-border px-3 text-sm" />
            </label>
            <div className="flex justify-end gap-2">
              <button onClick={() => setConditionModalOpen(false)} className="rounded-lg border border-border px-3 py-1.5 text-xs">Cancel</button>
              <button onClick={() => { setCondition({ id: condition.id, ...conditionDraft }); setConditionModalOpen(false); toast({ title: "Condition saved", description: "Conditional logic updated." }); }} className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">Save Condition</button>
            </div>
          </div>
        </Modal>
      )}

      {previewOpen && (
        <Modal title="Report Preview" onClose={() => setPreviewOpen(false)}>
          <p className="text-sm text-muted-foreground">Preview mode with current parameters: {params.region} · {params.vendor} · {params.technology} · {params.timeWindow} · {params.tenant}</p>
        </Modal>
      )}

      {simulateOpen && (
        <Modal title="Simulation Result" onClose={() => setSimulateOpen(false)}>
          <div className="rounded-lg border border-primary/30 bg-primary/10 p-3">
            <p className="flex items-center gap-1 text-sm font-semibold text-primary"><Sparkles className="h-4 w-4" />Simulation completed</p>
            <p className="mt-1 text-sm">Forecast indicates 8.4% alarm reduction if selected logic is applied.</p>
          </div>
        </Modal>
      )}
    </section>
  );
}
