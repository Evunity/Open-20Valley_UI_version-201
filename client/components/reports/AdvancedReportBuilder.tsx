import { useMemo, useState } from "react";
import { AlertTriangle, Eye, Plus, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type BuilderStatus = "Draft" | "Validated" | "Open";
type VisualizationType = "Bar Chart" | "Line Chart" | "Donut" | "Table" | "Heatmap";
type DataCategory = "KPI" | "Alarm" | "Automation" | "AI" | "Scheduler" | "Inventory" | "Performance" | "SLA" | "Risk" | "Capacity";

type SourceStatus = "Healthy" | "Delayed" | "Down";

interface BlockScope {
  tenant: string;
  region: string;
  site: string;
  cluster: string;
  vendor: string;
  technology: string;
  cell: string;
}

interface DataSourceInfo {
  sourceName: string;
  dataFreshness: string;
  latency: string;
  status: SourceStatus;
}

interface BlockDefinition {
  id: string;
  title: string;
  dataCategory: DataCategory | "";
  dataSource: DataSourceInfo;
  metric: string;
  scope: BlockScope;
  timeWindow: string;
  timeGranularity: string;
  aggregation: string;
  filters: string;
  visualization: VisualizationType;
}

const DATA_CATEGORIES: DataCategory[] = ["KPI", "Alarm", "Automation", "AI", "Scheduler", "Inventory", "Performance", "SLA", "Risk", "Capacity"];
const VISUALIZATIONS: VisualizationType[] = ["Bar Chart", "Line Chart", "Donut", "Table", "Heatmap"];
const TIME_WINDOWS = ["Last 24 Hours", "Last 7 Days", "Last 30 Days", "Last 90 Days", "Custom"];
const GRANULARITIES = ["5 Minutes", "15 Minutes", "Hourly", "Daily", "Weekly", "Monthly"];
const AGGREGATIONS = ["Sum", "Average", "Min", "Max", "P95", "P99", "Count"];
const SOURCE_STATUSES: SourceStatus[] = ["Healthy", "Delayed", "Down"];
const PALETTE_ITEMS = ["KPI Card", "Alarm Trend", "SLA Table", "Capacity Heatmap", "Automation Impact"];

const DEFAULT_SCOPE: BlockScope = {
  tenant: "",
  region: "",
  site: "",
  cluster: "",
  vendor: "",
  technology: "",
  cell: "",
};

const EMPTY_BLOCK = (title: string): BlockDefinition => ({
  id: `blk-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
  title,
  dataCategory: "",
  dataSource: {
    sourceName: "",
    dataFreshness: "",
    latency: "",
    status: "Healthy",
  },
  metric: "",
  scope: { ...DEFAULT_SCOPE },
  timeWindow: "",
  timeGranularity: "",
  aggregation: "",
  filters: "",
  visualization: "Bar Chart",
});

const isScopeDefined = (scope: BlockScope) =>
  Object.values(scope).every((value) => value.trim().length > 0);

const isTimeDefined = (block: BlockDefinition) =>
  block.timeWindow.trim().length > 0 &&
  block.timeGranularity.trim().length > 0 &&
  block.aggregation.trim().length > 0;

const isRenderable = (block: BlockDefinition) =>
  block.metric.trim().length > 0 && isScopeDefined(block.scope) && isTimeDefined(block);

const sourceStatusTone = (status: SourceStatus) => {
  if (status === "Healthy") return "bg-green-100 text-green-700";
  if (status === "Delayed") return "bg-amber-100 text-amber-700";
  return "bg-red-100 text-red-700";
};

const scopeSummary = (scope: BlockScope) =>
  `${scope.tenant || "-"} · ${scope.region || "-"} · ${scope.site || "-"} · ${scope.cluster || "-"} · ${scope.vendor || "-"} · ${scope.technology || "-"} · ${scope.cell || "-"}`;

export default function AdvancedReportBuilder() {
  const { toast } = useToast();
  const [status, setStatus] = useState<BuilderStatus>("Draft");
  const [activePaletteItem, setActivePaletteItem] = useState(PALETTE_ITEMS[0]);
  const [blocks, setBlocks] = useState<BlockDefinition[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

  const selectedBlock = useMemo(
    () => blocks.find((block) => block.id === selectedBlockId) ?? null,
    [blocks, selectedBlockId],
  );

  const addBlockToCanvas = () => {
    const nextBlock = EMPTY_BLOCK(`${activePaletteItem} Block`);
    setBlocks((prev) => [nextBlock, ...prev]);
    setSelectedBlockId(nextBlock.id);
    toast({ title: "Block added", description: "Configure Data Category, Source, Metric, Scope, Time, Aggregation and Visualization." });
  };

  const updateBlock = <K extends keyof BlockDefinition>(key: K, value: BlockDefinition[K]) => {
    if (!selectedBlockId) return;
    setBlocks((prev) => prev.map((block) => (block.id === selectedBlockId ? { ...block, [key]: value } : block)));
  };

  const updateScope = (key: keyof BlockScope, value: string) => {
    if (!selectedBlockId) return;
    setBlocks((prev) =>
      prev.map((block) =>
        block.id === selectedBlockId ? { ...block, scope: { ...block.scope, [key]: value } } : block,
      ),
    );
  };

  const updateSource = <K extends keyof DataSourceInfo>(key: K, value: DataSourceInfo[K]) => {
    if (!selectedBlockId) return;
    setBlocks((prev) =>
      prev.map((block) =>
        block.id === selectedBlockId
          ? { ...block, dataSource: { ...block.dataSource, [key]: value } }
          : block,
      ),
    );
  };

  return (
    <section className="grid grid-cols-1 gap-3 xl:grid-cols-[260px_minmax(0,1fr)_360px]">
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

        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Report &amp; Viz Blocks</p>
        <div className="space-y-1">
          {PALETTE_ITEMS.map((item) => (
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

        <button
          onClick={addBlockToCanvas}
          className="mt-3 inline-flex w-full items-center justify-center gap-1 rounded-lg bg-primary px-2.5 py-2 text-xs font-semibold text-primary-foreground"
        >
          <Plus className="h-3.5 w-3.5" /> Add Block
        </button>
      </aside>

      <main className="rounded-xl border border-border bg-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold">Report &amp; Viz Builder Canvas</p>
          <div className="flex items-center gap-1.5">
            <button onClick={() => toast({ title: "Preview", description: "Preview uses only fully configured blocks." })} className="rounded-lg border border-border px-2.5 py-1.5 text-xs"><Eye className="mr-1 inline h-3.5 w-3.5" />Preview</button>
            <button onClick={() => toast({ title: "Report saved", description: "Configuration saved." })} className="rounded-lg bg-primary px-2.5 py-1.5 text-xs font-semibold text-primary-foreground"><Save className="mr-1 inline h-3.5 w-3.5" />Save</button>
          </div>
        </div>

        {blocks.length === 0 && (
          <div className="rounded-xl border-2 border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
            Add a block from the left panel. A block only renders after Metric, Scope, and Time are defined.
          </div>
        )}

        <div className="space-y-3">
          {blocks.map((block) => {
            const valid = isRenderable(block);
            return (
              <article
                key={block.id}
                onClick={() => setSelectedBlockId(block.id)}
                className={cn(
                  "cursor-pointer rounded-xl border bg-background p-3",
                  selectedBlockId === block.id ? "border-primary" : "border-border",
                )}
              >
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold">{block.title}</p>
                    <p className="text-[11px] text-muted-foreground">Data Category: {block.dataCategory || "Not set"} · Visualization: {block.visualization}</p>
                  </div>
                  <span className={cn("rounded px-2 py-0.5 text-[11px] font-semibold", valid ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700")}>{valid ? "Renderable" : "Blocked"}</span>
                </div>

                <div className="grid gap-2 text-[11px] md:grid-cols-2">
                  <div className="rounded border border-border p-2">
                    <p className="font-semibold text-muted-foreground">Block Header</p>
                    <p>Source: {block.dataSource.sourceName || "Not set"}</p>
                    <p>Scope: {scopeSummary(block.scope)}</p>
                    <p>Time Window: {block.timeWindow || "Not set"}</p>
                    <p>Granularity: {block.timeGranularity || "Not set"}</p>
                    <p>Aggregation: {block.aggregation || "Not set"}</p>
                  </div>
                  <div className="rounded border border-border p-2">
                    <p className="font-semibold text-muted-foreground">Data Source Panel</p>
                    <p>Source Name: {block.dataSource.sourceName || "Not set"}</p>
                    <p>Data Freshness: {block.dataSource.dataFreshness || "Not set"}</p>
                    <p>Latency: {block.dataSource.latency || "Not set"}</p>
                    <p>
                      Status: <span className={cn("rounded px-1.5 py-0.5", sourceStatusTone(block.dataSource.status))}>{block.dataSource.status}</span>
                    </p>
                  </div>
                </div>

                {!valid ? (
                  <div className="mt-2 flex items-center gap-2 rounded border border-amber-400/50 bg-amber-50 px-2 py-1.5 text-[11px] text-amber-800">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Cannot render block: metric, complete scope, and complete time definition are required.
                  </div>
                ) : (
                  <div className="mt-2 rounded border border-green-400/50 bg-green-50 px-2 py-1.5 text-[11px] text-green-800">
                    Rendering with Metric: {block.metric} · Filters: {block.filters || "None"}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </main>

      <aside className="space-y-3 rounded-xl border border-border bg-card p-3">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Block Configuration (Required)</h3>

        {!selectedBlock && <p className="text-xs text-muted-foreground">Select a block on canvas to configure it.</p>}

        {selectedBlock && (
          <div className="space-y-3">
            <label className="block">
              <p className="mb-1 text-[11px]">Data Category *</p>
              <select value={selectedBlock.dataCategory} onChange={(e) => updateBlock("dataCategory", e.target.value as DataCategory)} className="h-9 w-full rounded border border-border bg-background px-2 text-sm">
                <option value="">Select Data Category</option>
                {DATA_CATEGORIES.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>

            <section className="rounded-lg border border-border bg-background p-2">
              <p className="mb-2 text-[11px] font-semibold text-muted-foreground">Data Source Panel *</p>
              <div className="space-y-2">
                <label className="block"><p className="mb-1 text-[11px]">Source Name</p><input value={selectedBlock.dataSource.sourceName} onChange={(e) => updateSource("sourceName", e.target.value)} className="h-9 w-full rounded border border-border px-2 text-sm" /></label>
                <label className="block"><p className="mb-1 text-[11px]">Data Freshness</p><input value={selectedBlock.dataSource.dataFreshness} onChange={(e) => updateSource("dataFreshness", e.target.value)} placeholder="e.g. 2m ago" className="h-9 w-full rounded border border-border px-2 text-sm" /></label>
                <label className="block"><p className="mb-1 text-[11px]">Latency</p><input value={selectedBlock.dataSource.latency} onChange={(e) => updateSource("latency", e.target.value)} placeholder="e.g. 120ms" className="h-9 w-full rounded border border-border px-2 text-sm" /></label>
                <label className="block"><p className="mb-1 text-[11px]">Status</p><select value={selectedBlock.dataSource.status} onChange={(e) => updateSource("status", e.target.value as SourceStatus)} className="h-9 w-full rounded border border-border bg-background px-2 text-sm">{SOURCE_STATUSES.map((s) => <option key={s}>{s}</option>)}</select></label>
              </div>
            </section>

            <label className="block">
              <p className="mb-1 text-[11px]">Metric *</p>
              <input value={selectedBlock.metric} onChange={(e) => updateBlock("metric", e.target.value)} className="h-9 w-full rounded border border-border px-2 text-sm" />
            </label>

            <section className="rounded-lg border border-border bg-background p-2">
              <p className="mb-2 text-[11px] font-semibold text-muted-foreground">Scope Panel *</p>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    ["tenant", "Tenant"],
                    ["region", "Region"],
                    ["site", "Site"],
                    ["cluster", "Cluster"],
                    ["vendor", "Vendor"],
                    ["technology", "Technology"],
                    ["cell", "Cell"],
                  ] as Array<[keyof BlockScope, string]>
                ).map(([key, label]) => (
                  <label key={key} className="block">
                    <p className="mb-1 text-[11px]">{label}</p>
                    <input value={selectedBlock.scope[key]} onChange={(e) => updateScope(key, e.target.value)} className="h-8 w-full rounded border border-border px-2 text-xs" />
                  </label>
                ))}
              </div>
            </section>

            <section className="rounded-lg border border-border bg-background p-2">
              <p className="mb-2 text-[11px] font-semibold text-muted-foreground">Time Panel *</p>
              <div className="space-y-2">
                <label className="block"><p className="mb-1 text-[11px]">Time Window</p><select value={selectedBlock.timeWindow} onChange={(e) => updateBlock("timeWindow", e.target.value)} className="h-9 w-full rounded border border-border bg-background px-2 text-sm"><option value="">Select</option>{TIME_WINDOWS.map((item) => <option key={item}>{item}</option>)}</select></label>
                <label className="block"><p className="mb-1 text-[11px]">Time Granularity</p><select value={selectedBlock.timeGranularity} onChange={(e) => updateBlock("timeGranularity", e.target.value)} className="h-9 w-full rounded border border-border bg-background px-2 text-sm"><option value="">Select</option>{GRANULARITIES.map((item) => <option key={item}>{item}</option>)}</select></label>
                <label className="block"><p className="mb-1 text-[11px]">Aggregation</p><select value={selectedBlock.aggregation} onChange={(e) => updateBlock("aggregation", e.target.value)} className="h-9 w-full rounded border border-border bg-background px-2 text-sm"><option value="">Select</option>{AGGREGATIONS.map((item) => <option key={item}>{item}</option>)}</select></label>
              </div>
            </section>

            <label className="block">
              <p className="mb-1 text-[11px]">Filters</p>
              <input value={selectedBlock.filters} onChange={(e) => updateBlock("filters", e.target.value)} className="h-9 w-full rounded border border-border px-2 text-sm" />
            </label>

            <label className="block">
              <p className="mb-1 text-[11px]">Visualization *</p>
              <select value={selectedBlock.visualization} onChange={(e) => updateBlock("visualization", e.target.value as VisualizationType)} className="h-9 w-full rounded border border-border bg-background px-2 text-sm">
                {VISUALIZATIONS.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
          </div>
        )}
      </aside>
    </section>
  );
}
