import { useState } from 'react';
import { Plus, Trash2, Eye, Save, Code, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReportBlock {
  id: string;
  type: 'kpi' | 'chart' | 'table' | 'heatmap' | 'risk' | 'sla' | 'forecast' | 'automation' | 'financial';
  title: string;
}

export default function AdvancedReportBuilder() {
  const [builderMode, setBuilderMode] = useState<'guided' | 'expert'>('guided');
  const [blocks, setBlocks] = useState<ReportBlock[]>([
    { id: '1', type: 'kpi', title: 'KPI Summary' },
    { id: '2', type: 'chart', title: 'Trend Analysis' }
  ]);
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);

  const blockTypes = [
    { type: 'kpi' as const, label: 'KPI Cards', icon: '📊', color: 'from-blue-500 to-cyan-500' },
    { type: 'chart' as const, label: 'Charts', icon: '📈', color: 'from-purple-500 to-pink-500' },
    { type: 'table' as const, label: 'Tables', icon: '📋', color: 'from-green-500 to-emerald-500' },
    { type: 'heatmap' as const, label: 'Heatmaps', icon: '🔥', color: 'from-orange-500 to-red-500' },
    { type: 'risk' as const, label: 'Risk Panels', icon: '⚠️', color: 'from-red-500 to-rose-500' },
    { type: 'sla' as const, label: 'SLA Blocks', icon: '✓', color: 'from-green-500 to-teal-500' },
    { type: 'forecast' as const, label: 'AI Forecast', icon: '🤖', color: 'from-indigo-500 to-blue-500' },
    { type: 'automation' as const, label: 'Automation', icon: '⚙️', color: 'from-cyan-500 to-blue-500' },
    { type: 'financial' as const, label: 'Financial', icon: '💰', color: 'from-yellow-500 to-orange-500' }
  ];

  const addBlock = (type: ReportBlock['type']) => {
    const newBlock: ReportBlock = {
      id: Date.now().toString(),
      type,
      title: blockTypes.find(b => b.type === type)?.label || 'Block'
    };
    setBlocks([...blocks, newBlock]);
  };

  const removeBlock = (id: string) => {
    setBlocks(blocks.filter(b => b.id !== id));
  };

  return (
    <div className="space-y-8">
      {/* Mode Selector */}
      <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl border border-border/50">
        <span className="text-sm font-semibold text-muted-foreground">Builder Mode:</span>
        <div className="flex gap-2">
          <button
            onClick={() => setBuilderMode('guided')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all",
              builderMode === 'guided'
                ? "bg-primary text-primary-foreground"
                : "bg-background border border-border hover:bg-muted"
            )}
          >
            Guided Mode
          </button>
          <button
            onClick={() => setBuilderMode('expert')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all",
              builderMode === 'expert'
                ? "bg-primary text-primary-foreground"
                : "bg-background border border-border hover:bg-muted"
            )}
          >
            <Code className="w-4 h-4 inline mr-2" />
            Expert Mode
          </button>
        </div>
      </div>

      {/* Mode-specific instructions */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        {builderMode === 'guided' ? (
          <div>
            <h4 className="font-bold text-foreground mb-2">Guided Mode for Operators & Managers</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Step-by-step report creation with drag-and-drop block composition. Select data sources, choose visualizations, and build narrative-driven reports.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-semibold text-foreground mb-2">Data Source Fusion</p>
                <p className="text-muted-foreground">Combine intelligence: Automation Executions + Alarm Reduction = Automation ROI</p>
              </div>
              <div>
                <p className="font-semibold text-foreground mb-2">Temporal Alignment</p>
                <p className="text-muted-foreground">Auto-normalize: Hourly alarms + weekly congestion + monthly revenue (no manual reconciliation)</p>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <h4 className="font-bold text-foreground mb-2">Expert Mode for Data Engineers</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Write custom queries, define aggregation logic, and build complex parameterized reports with full control.
            </p>
            <code className="block bg-muted/50 p-3 rounded-lg text-xs font-mono text-muted-foreground mt-4 whitespace-pre-wrap">
{`SELECT 
  date_trunc('hour', timestamp) as hour,
  vendor,
  COUNT(*) as alarm_count,
  automation_executions
FROM alarms
INNER JOIN automation ON alarms.id = automation.alarm_id
GROUP BY hour, vendor
ORDER BY hour DESC`}
            </code>
          </div>
        )}
      </div>

      {/* Block Palette */}
      <div>
        <h3 className="font-bold text-foreground mb-4">Available Building Blocks</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {blockTypes.map(block => (
            <button
              key={block.type}
              onClick={() => addBlock(block.type)}
              className="group p-4 rounded-xl border border-border/50 hover:border-primary/50 hover:bg-muted/50 transition-all text-left"
            >
              <div className="text-2xl mb-2">{block.icon}</div>
              <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{block.label}</p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  addBlock(block.type);
                }}
                className="mt-2 w-full px-2 py-1 text-xs rounded bg-primary/10 text-primary opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Plus className="w-3 h-3 inline mr-1" />
                Add
              </button>
            </button>
          ))}
        </div>
      </div>

      {/* Canvas */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-foreground">Report Canvas</h3>
          <div className="flex gap-2">
            <button className="px-3 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-sm flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Preview
            </button>
            <button className="px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm flex items-center gap-2">
              <Save className="w-4 h-4" />
              Save Report
            </button>
          </div>
        </div>

        {blocks.length === 0 ? (
          <div className="border-2 border-dashed border-border rounded-xl p-12 text-center">
            <p className="text-muted-foreground mb-3">No blocks added yet</p>
            <p className="text-sm text-muted-foreground">Select blocks above to build your report</p>
          </div>
        ) : (
          <div className="space-y-4">
            {blocks.map((block, idx) => (
              <div
                key={block.id}
                onClick={() => setSelectedBlock(block.id)}
                className={cn(
                  "p-6 rounded-xl border-2 transition-all cursor-move group",
                  selectedBlock === block.id
                    ? "border-primary bg-primary/5"
                    : "border-border/50 bg-card/50 hover:border-primary/30"
                )}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Block {idx + 1}</p>
                    <h4 className="font-bold text-foreground">{block.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Type: <span className="font-mono">{block.type}</span>
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeBlock(block.id);
                    }}
                    className="p-2 rounded-lg bg-muted/50 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/10 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Mock block content */}
                <div className="mt-4 p-4 bg-muted/30 rounded-lg border border-border/30 min-h-[120px] flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Mock {block.type} visualization</p>
                    <p className="text-xs text-muted-foreground mt-1">Configure in settings →</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Parameterized Reports Section */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-600" />
          Parameterized Reports (One Template → Infinite Outputs)
        </h3>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Add dynamic parameters to create reusable templates:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xs font-semibold text-foreground mb-1">Region Parameter</p>
              <p className="text-xs text-muted-foreground">e.g., Cairo-Site-1, Cairo-Site-2, Alexandria</p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xs font-semibold text-foreground mb-1">Vendor Parameter</p>
              <p className="text-xs text-muted-foreground">e.g., Huawei, Nokia, Ericsson</p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xs font-semibold text-foreground mb-1">Technology Parameter</p>
              <p className="text-xs text-muted-foreground">e.g., 4G, 5G, Backhaul</p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xs font-semibold text-foreground mb-1">Time Window Parameter</p>
              <p className="text-xs text-muted-foreground">e.g., Daily, Weekly, Monthly</p>
            </div>
          </div>
        </div>
      </div>

      {/* Conditional Sections */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4">Conditional Intelligence Sections</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Create narrative-driven reports that show content only when conditions are met:
        </p>
        <div className="bg-muted/30 p-4 rounded-lg border border-border/30">
          <p className="text-xs font-mono text-muted-foreground">
            IF utilization &gt; 80% THEN show "congestion analysis"<br/>
            IF failures &gt; threshold THEN show "failure intelligence"<br/>
            IF revenue_trend &lt; 0 THEN show "revenue recovery plans"
          </p>
        </div>
      </div>
    </div>
  );
}
