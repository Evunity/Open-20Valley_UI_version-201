import { useState } from "react";
import { Copy, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type InsightsTab = "Strategic Insights" | "Authoring" | "Decision Impact" | "Trend Analysis";

interface InsightItem {
  id: string;
  title: string;
  text: string;
  tag?: string;
}

const INSIGHTS: InsightItem[] = [
  { id: "i1", title: "Did automation reduce outages?", text: "Outage duration dropped 12% in clusters where closed-loop actions were enabled." },
  { id: "i2", title: "Which vendor drives instability?", text: "Ericsson cells account for 41% of recurring failure incidents over 30 days." },
  { id: "i3", title: "Is congestion rising YoY?", text: "Peak-hour congestion is +8% YoY in high-density urban sectors." },
  { id: "i4", title: "Are AI decisions improving KPIs?", text: "AI-guided remediation increased clear-rate by 2.1% quarter-over-quarter." },
  { id: "i5", title: "Congestion probability next 90 days?", text: "Forecast indicates 67% probability of elevated congestion in North Cairo.", tag: "AI Forecast" },
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

export default function InsightAuthoringLayer() {
  const { toast } = useToast();
  const [tab, setTab] = useState<InsightsTab>("Strategic Insights");
  const [briefingOpen, setBriefingOpen] = useState(false);
  const [activeInsight, setActiveInsight] = useState<InsightItem | null>(null);
  const [tone, setTone] = useState("Executive");
  const [length, setLength] = useState("Standard");
  const [prompt, setPrompt] = useState("");
  const [generated, setGenerated] = useState("Q1 vendor reliability improved in aggregate, but risk remains concentrated in transport delay windows. Prioritize Ericsson ingestion stability and congestion controls for North Cairo.");
  const [editing, setEditing] = useState(false);
  const [inserted, setInserted] = useState(false);

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="inline-flex rounded-xl border border-border bg-card p-1">
          {(["Strategic Insights", "Authoring", "Decision Impact", "Trend Analysis"] as InsightsTab[]).map((item) => (
            <button key={item} onClick={() => setTab(item)} className={cn("rounded-lg px-3 py-1.5 text-xs font-semibold", tab === item ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>{item}</button>
          ))}
        </div>
        <button onClick={() => setBriefingOpen(true)} className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">Generate Briefing</button>
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1.35fr_1fr]">
        <article className="rounded-xl border border-border bg-card p-3">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Cross-Module Intelligence</h3>
            <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">4 Insights</span>
          </div>
          <div className="space-y-2">
            {INSIGHTS.map((insight) => (
              <div key={insight.id} className="rounded-lg border border-border px-3 py-2">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{insight.title}</p>
                  {insight.tag && <span className="rounded-full border border-violet-500/40 bg-violet-500/10 px-2 py-0.5 text-[10px] font-semibold text-violet-700">{insight.tag}</span>}
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">{insight.text}</p>
                <button onClick={() => setActiveInsight(insight)} className="mt-1 text-[11px] text-primary hover:underline">Open insight details</button>
              </div>
            ))}
          </div>
        </article>

        <aside className="space-y-3 rounded-xl border border-border bg-card p-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Insight Authoring</h3>
            <span className="text-[10px] font-semibold text-primary">AI-Assisted</span>
          </div>
          <div className="rounded-lg border border-border bg-background p-3">
            <p className="text-[11px] text-muted-foreground">Report: Q1 Vendor Scorecard</p>
            <p className="mt-1 text-sm">Vendor stability improved for Nokia and Huawei cohorts, while Ericsson transport ingestion requires remediation focus.</p>
          </div>

          <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
            <h4 className="text-xs font-semibold uppercase tracking-[0.06em] text-primary">AI-Assisted Narrative</h4>
            <input value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Generate summary..." className="mt-2 h-9 w-full rounded-xl border border-border bg-background px-3 text-sm" />
            <div className="mt-2 flex flex-wrap gap-1.5">
              {["Executive", "Technical", "Regulatory"].map((item) => (
                <button key={item} onClick={() => setTone(item)} className={cn("rounded-full border px-2 py-0.5 text-[11px]", tone === item ? "border-primary/40 bg-primary/10 text-primary" : "border-border hover:bg-muted/30")}>{item}</button>
              ))}
            </div>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {["Brief", "Standard", "Detailed"].map((item) => (
                <button key={item} onClick={() => setLength(item)} className={cn("rounded-full border px-2 py-0.5 text-[11px]", length === item ? "border-primary/40 bg-primary/10 text-primary" : "border-border hover:bg-muted/30")}>{item}</button>
              ))}
            </div>
            <button
              onClick={() => {
                setGenerated(`[${tone} · ${length}] ${prompt || "Generated summary"} — Automation impact remains positive; prioritize transport lag remediation and vendor-specific anomaly guardrails.`);
                toast({ title: "Narrative generated", description: "AI-assisted summary updated." });
              }}
              className="mt-2 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
            >
              Generate
            </button>
          </div>

          <div className="rounded-lg border border-border bg-background p-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.06em]">AI Generated — Editable</p>
              <button onClick={() => setEditing((p) => !p)} className="text-[11px] text-primary hover:underline">{editing ? "Done" : "Edit"}</button>
            </div>
            {editing ? (
              <textarea value={generated} onChange={(e) => setGenerated(e.target.value)} className="mt-2 h-24 w-full rounded-xl border border-border p-2 text-sm" />
            ) : (
              <p className="mt-2 text-sm">{generated}</p>
            )}
            <div className="mt-2 flex gap-1.5">
              <button onClick={async () => { await navigator.clipboard.writeText(generated); toast({ title: "Copied", description: "Narrative copied to clipboard." }); }} className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs"><Copy className="h-3.5 w-3.5" />Copy</button>
              <button onClick={() => { setInserted(true); toast({ title: "Inserted", description: "Narrative inserted into report." }); }} className="rounded-lg bg-primary px-2.5 py-1.5 text-xs font-semibold text-primary-foreground">Insert to Report</button>
            </div>
            {inserted && <p className="mt-1 text-[11px] text-emerald-700">Inserted into Q1 Vendor Scorecard.</p>}
          </div>
        </aside>
      </div>

      {briefingOpen && (
        <Modal title="Generate Briefing" onClose={() => setBriefingOpen(false)}>
          <p className="text-sm">Strategic briefing generated from latest insights, vendor risk profile, and congestion forecast. Ready for executive review.</p>
        </Modal>
      )}

      {activeInsight && (
        <Modal title={activeInsight.title} onClose={() => setActiveInsight(null)}>
          <p className="text-sm">{activeInsight.text}</p>
        </Modal>
      )}
    </section>
  );
}
