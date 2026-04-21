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

interface PaletteItemDefinition {
  type: string;
  compatibleCategories: DataCategory[];
  purpose: string;
}

interface BlockDefinition {
  id: string;
  blockType: string;
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
const DATA_SOURCES = [
  "Alarm KPI Dataset",
  "Automation Executions",
  "AI Decision Outcomes",
  "Scheduler Jobs",
  "Network KPI Counters",
  "Transport KPI Dataset",
  "Inventory Dataset",
];

const PALETTE_ITEMS: PaletteItemDefinition[] = [
  { type: "KPI Card", compatibleCategories: ["KPI", "Performance", "SLA"], purpose: "Show current KPI value and trend." },
  { type: "Alarm Trend", compatibleCategories: ["Alarm", "Risk"], purpose: "Show alarm count trend over time." },
  { type: "Automation Summary", compatibleCategories: ["Automation", "Scheduler"], purpose: "Track automation runs and outcomes." },
  { type: "AI Performance Panel", compatibleCategories: ["AI", "Risk"], purpose: "Track model prediction and confidence quality." },
  { type: "Scheduler Activity Table", compatibleCategories: ["Scheduler", "Automation"], purpose: "List schedule executions and failures." },
  { type: "Heatmap", compatibleCategories: ["KPI", "Capacity"], purpose: "Visualize hotspot concentration by scope." },
  { type: "SLA Block", compatibleCategories: ["SLA", "Performance"], purpose: "Track SLA compliance status by scope." },
  { type: "Risk Panel", compatibleCategories: ["Risk", "AI"], purpose: "Summarize highest operational risk signals." },
];

const CATEGORY_FILTER_HINTS: Record<DataCategory, string> = {
  KPI: "Examples: KPI Name, Threshold, Vendor, Technology",
  Alarm: "Examples: Severity, Alarm Code, Status, Vendor",
  Automation: "Examples: Workflow Name, Trigger Type, Status",
  AI: "Examples: Model, Prediction Status, Confidence Band",
  Scheduler: "Examples: Job Type, Schedule Status, Frequency",
  Inventory: "Examples: Object Type, Lifecycle Status, Vendor",
  Performance: "Examples: Throughput Band, Utilization Range, Region",
  SLA: "Examples: SLA Type, Breach State, Service Tier",
  Risk: "Examples: Risk Level, Impact Domain, Severity",
  Capacity: "Examples: Capacity Group, Usage Band, Saturation State",
};

const DEFAULT_SCOPE: BlockScope = {
  tenant: "",
  region: "",
  site: "",
  cluster: "",
  vendor: "",
  technology: "",
  cell: "",
};

const EMPTY_BLOCK = (blockType: string): BlockDefinition => ({
  id: `blk-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
  blockType,
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

const isSourceDefined = (source: DataSourceInfo) =>
  source.sourceName.trim().length > 0 &&
  source.dataFreshness.trim().length > 0 &&
  source.latency.trim().length > 0;

const isRenderable = (block: BlockDefinition) =>
  block.dataCategory.trim().length > 0 &&
  isSourceDefined(block.dataSource) &&
  block.metric.trim().length > 0 &&
  isScopeDefined(block.scope) &&
  isTimeDefined(block);

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
  const [activePaletteItemType, setActivePaletteItemType] = useState(PALETTE_ITEMS[0].type);
  const [blocks, setBlocks] = useState<BlockDefinition[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

  const selectedBlock = useMemo(
    () => blocks.find((block) => block.id === selectedBlockId) ?? null,
    [blocks, selectedBlockId],
  );

  const activePaletteItem = useMemo(
    () => PALETTE_ITEMS.find((item) => item.type === activePaletteItemType) ?? PALETTE_ITEMS[0],
    [activePaletteItemType],
  );

  const reportDataSummary = useMemo(() => {
    const configuredBlocks = blocks.filter(isRenderable);
    const unique = (items: string[]) => Array.from(new Set(items.filter((item) => item.trim().length > 0)));
    const sourceNames = unique(configuredBlocks.map((block) => block.dataSource.sourceName));
    const timeWindows = unique(configuredBlocks.map((block) => block.timeWindow));
    const granularities = unique(configuredBlocks.map((block) => block.timeGranularity));
    const filters = unique(configuredBlocks.map((block) => block.filters));
    const scopes = configuredBlocks.map((block) =>
      `${block.scope.tenant || "-"} / ${block.scope.region || "-"} / ${block.scope.site || "-"} / ${block.scope.vendor || "-"} / ${block.scope.technology || "-"}`,
    );

    return {
      configuredCount: configuredBlocks.length,
      sourceNames,
      timeWindows,
      granularities,
      filters,
      scopes: unique(scopes),
    };
  }, [blocks]);

  const addBlockToCanvas = () => {
    const nextBlock = EMPTY_BLOCK(activePaletteItem.type);
    setBlocks((prev) => [nextBlock, ...prev]);
    setSelectedBlockId(nextBlock.id);
    toast({ title: "Block added", description: "Configure Block Type, Data Category, Source, Scope, Time, Filters, Aggregation and Visualization." });
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
              key={item.type}
              onClick={() => setActivePaletteItemType(item.type)}
              className={cn(
                "w-full rounded-lg border px-2.5 py-2 text-left",
                activePaletteItemType === item.type ? "border-primary bg-primary/10" : "border-border hover:bg-muted/30",
              )}
            >
              <p className={cn("text-[12px] font-semibold", activePaletteItemType === item.type ? "text-primary" : "text-foreground")}>{item.type}</p>
              <p className="text-[10px] text-muted-foreground">Category: {item.compatibleCategories.join(", ")}</p>
              <p className="text-[10px] text-muted-foreground">Purpose: {item.purpose}</p>
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
            <button onClick={() => toast({ title: "Report saved", description: "Only fully configured blocks are considered ready for publish." })} className="rounded-lg bg-primary px-2.5 py-1.5 text-xs font-semibold text-primary-foreground"><Save className="mr-1 inline h-3.5 w-3.5" />Save</button>
          </div>
        </div>

        <section className="mb-3 rounded-xl border border-border bg-muted/20 p-3 text-[11px]">
          <p className="mb-2 text-xs font-semibold">Report Data Summary</p>
          <p>Configured Blocks: {reportDataSummary.configuredCount} / {blocks.length}</p>
          <p>Active Data Sources: {reportDataSummary.sourceNames.join(" | ") || "None configured"}</p>
          <p>Active Scope Selections: {reportDataSummary.scopes.join(" | ") || "None configured"}</p>
          <p>Active Time Windows: {reportDataSummary.timeWindows.join(" | ") || "None configured"}</p>
          <p>Active Granularity: {reportDataSummary.granularities.join(" | ") || "None configured"}</p>
          <p>Active Filters: {reportDataSummary.filters.join(" | ") || "None configured"}</p>
        </section>

        {blocks.length === 0 && (
          <div className="rounded-xl border-2 border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
            Add a block from the left panel. A block only renders after Data Category, Data Source, Metric, Scope, Time Window, and Time Granularity are defined.
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
                    <p className="text-sm font-semibold">Block: {block.blockType}</p>
                    <p className="text-[11px] text-muted-foreground">Category: {block.dataCategory || "Not set"} · Visualization: {block.visualization}</p>
                  </div>
                  <span className={cn("rounded px-2 py-0.5 text-[11px] font-semibold", valid ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700")}>{valid ? "Renderable" : "Blocked"}</span>
                </div>

                <div className="grid gap-2 text-[11px] md:grid-cols-2">
                  <div className="rounded border border-border p-2">
                    <p className="font-semibold text-muted-foreground">Block Data Contract</p>
                    <p>Block Type: {block.blockType}</p>
                    <p>Category: {block.dataCategory || "Not set"}</p>
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
                    Cannot render block: Data Category, Data Source, Metric, complete scope, Time Window, Time Granularity, and Aggregation are required.
                  </div>
                ) : (
                  <div className="mt-2 rounded border border-green-400/50 bg-green-50 px-2 py-1.5 text-[11px] text-green-800">
                    Block: {block.blockType} · Category: {block.dataCategory} · Source: {block.dataSource.sourceName} · Time: {block.timeWindow} ({block.timeGranularity}) · Aggregation: {block.aggregation} · Filters: {block.filters || "None"}
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
            <section className="rounded-lg border border-border bg-background p-2">
              <p className="mb-2 text-[11px] font-semibold text-muted-foreground">1) Block Type *</p>
              <select value={selectedBlock.blockType} onChange={(e) => updateBlock("blockType", e.target.value)} className="h-9 w-full rounded border border-border bg-background px-2 text-sm">
                {PALETTE_ITEMS.map((item) => <option key={item.type} value={item.type}>{item.type}</option>)}
              </select>
            </section>

            <label className="block">
              <p className="mb-1 text-[11px]">2) Data Category *</p>
              <select value={selectedBlock.dataCategory} onChange={(e) => updateBlock("dataCategory", e.target.value as DataCategory)} className="h-9 w-full rounded border border-border bg-background px-2 text-sm">
                <option value="">Select Data Category</option>
                {DATA_CATEGORIES.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>

            <section className="rounded-lg border border-border bg-background p-2">
              <p className="mb-2 text-[11px] font-semibold text-muted-foreground">3) Data Source *</p>
              <div className="space-y-2">
                <label className="block"><p className="mb-1 text-[11px]">Source Name</p><select value={selectedBlock.dataSource.sourceName} onChange={(e) => updateSource("sourceName", e.target.value)} className="h-9 w-full rounded border border-border bg-background px-2 text-sm"><option value="">Select Data Source</option>{DATA_SOURCES.map((item) => <option key={item}>{item}</option>)}</select></label>
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
              <p className="mb-2 text-[11px] font-semibold text-muted-foreground">4) Scope *</p>
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
              <p className="mb-2 text-[11px] font-semibold text-muted-foreground">5) Time Definition *</p>
              <div className="space-y-2">
                <label className="block"><p className="mb-1 text-[11px]">Time Window</p><select value={selectedBlock.timeWindow} onChange={(e) => updateBlock("timeWindow", e.target.value)} className="h-9 w-full rounded border border-border bg-background px-2 text-sm"><option value="">Select</option>{TIME_WINDOWS.map((item) => <option key={item}>{item}</option>)}</select></label>
                <label className="block"><p className="mb-1 text-[11px]">Time Granularity</p><select value={selectedBlock.timeGranularity} onChange={(e) => updateBlock("timeGranularity", e.target.value)} className="h-9 w-full rounded border border-border bg-background px-2 text-sm"><option value="">Select</option>{GRANULARITIES.map((item) => <option key={item}>{item}</option>)}</select></label>
              </div>
            </section>

            <section className="rounded-lg border border-border bg-background p-2">
              <p className="mb-2 text-[11px] font-semibold text-muted-foreground">6) Filters</p>
              <label className="block">
                <p className="mb-1 text-[11px]">Filters</p>
                <input value={selectedBlock.filters} onChange={(e) => updateBlock("filters", e.target.value)} className="h-9 w-full rounded border border-border px-2 text-sm" />
              </label>
              <p className="mt-1 text-[10px] text-muted-foreground">
                {selectedBlock.dataCategory ? CATEGORY_FILTER_HINTS[selectedBlock.dataCategory] : "Select a data category to see suggested filters."}
              </p>
            </section>

            <section className="rounded-lg border border-border bg-background p-2">
              <p className="mb-2 text-[11px] font-semibold text-muted-foreground">7) Aggregation / Granularity *</p>
              <div className="space-y-2">
                <label className="block"><p className="mb-1 text-[11px]">Aggregation</p><select value={selectedBlock.aggregation} onChange={(e) => updateBlock("aggregation", e.target.value)} className="h-9 w-full rounded border border-border bg-background px-2 text-sm"><option value="">Select</option>{AGGREGATIONS.map((item) => <option key={item}>{item}</option>)}</select></label>
              </div>
            </section>

            <label className="block">
              <p className="mb-1 text-[11px]">8) Visualization Type *</p>
              <select value={selectedBlock.visualization} onChange={(e) => updateBlock("visualization", e.target.value as VisualizationType)} className="h-9 w-full rounded border border-border bg-background px-2 text-sm">
                {VISUALIZATIONS.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>

            <section className="rounded-lg border border-border bg-muted/20 p-2 text-[11px]">
              <p className="mb-1 font-semibold text-muted-foreground">Block Summary</p>
              <p>Block: {selectedBlock.blockType}</p>
              <p>Category: {selectedBlock.dataCategory || "Not set"}</p>
              <p>Source: {selectedBlock.dataSource.sourceName || "Not set"}</p>
              <p>Scope: {scopeSummary(selectedBlock.scope)}</p>
              <p>Time Window: {selectedBlock.timeWindow || "Not set"}</p>
              <p>Granularity: {selectedBlock.timeGranularity || "Not set"}</p>
              <p>Aggregation: {selectedBlock.aggregation || "Not set"}</p>
              <p>Filters: {selectedBlock.filters || "None"}</p>
            </section>
          </div>
        )}
      </aside>
    </section>
  );
}
