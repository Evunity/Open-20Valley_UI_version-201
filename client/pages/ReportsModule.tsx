import { useState, useMemo } from "react";
import { 
  FileText, BarChart3, Database, Palette, Lightbulb, Library, Clock, Send, 
  Activity, TrendingUp, Scale, AlertCircle, Plus, Download, Settings 
} from "lucide-react";
import { cn } from "@/lib/utils";
import ExecutiveReportingOverview from "@/components/reports/ExecutiveReportingOverview";
import AdvancedReportBuilder from "@/components/reports/AdvancedReportBuilder";
import DatasetManager from "@/components/reports/DatasetManager";
import VisualizationDesigner from "@/components/reports/VisualizationDesigner";
import InsightAuthoringLayer from "@/components/reports/InsightAuthoringLayer";
import ReportLibraryModule from "@/components/reports/ReportLibraryModule";
import SchedulingOrchestrator from "@/components/reports/SchedulingOrchestrator";
import DeliveryDistributionHub from "@/components/reports/DeliveryDistributionHub";
import ReliabilityCenter from "@/components/reports/ReliabilityCenter";
import ConsumptionIntelligence from "@/components/reports/ConsumptionIntelligence";
import DecisionImpactEngine from "@/components/reports/DecisionImpactEngine";
import RegulatoryIntelligenceHub from "@/components/reports/RegulatoryIntelligenceHub";
import LayoutIntelligence from "@/components/reports/LayoutIntelligence";
import SimulationPreview from "@/components/reports/SimulationPreview";
import ExecutiveOneclickBriefing from "@/components/reports/ExecutiveOneclickBriefing";
import PredictiveReporting from "@/components/reports/PredictiveReporting";
import CrossModuleIntelligence from "@/components/reports/CrossModuleIntelligence";

type IntelligenceWorkspace =
  | 'executive-overview'
  | 'report-builder'
  | 'dataset-manager'
  | 'visualization'
  | 'insights'
  | 'library'
  | 'scheduling'
  | 'delivery'
  | 'reliability'
  | 'consumption'
  | 'decision-impact'
  | 'regulatory'
  | 'layout'
  | 'simulation'
  | 'briefing'
  | 'predictive'
  | 'cross-module';

interface WorkspaceConfig {
  id: IntelligenceWorkspace;
  label: string;
  icon: React.FC<any>;
  description: string;
  criticality: 'core' | 'enterprise' | 'strategic';
  color: string;
}

const WORKSPACES: WorkspaceConfig[] = [
  {
    id: 'executive-overview',
    label: 'Executive Reporting Overview',
    icon: BarChart3,
    description: 'Leadership control tower - decision velocity dashboards',
    criticality: 'core',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'report-builder',
    label: 'Advanced Report Builder',
    icon: FileText,
    description: 'Guided + Expert modes with block-based composition',
    criticality: 'core',
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 'dataset-manager',
    label: 'Dataset Manager',
    icon: Database,
    description: 'Governed datasets with source lineage and SLA tracking',
    criticality: 'enterprise',
    color: 'from-green-500 to-emerald-500'
  },
  {
    id: 'visualization',
    label: 'Visualization Designer',
    icon: Palette,
    description: 'Drag-and-drop chart/table/heatmap creation',
    criticality: 'enterprise',
    color: 'from-orange-500 to-red-500'
  },
  {
    id: 'insights',
    label: 'Insight Authoring Layer',
    icon: Lightbulb,
    description: 'AI-powered narrative generation and recommendations',
    criticality: 'strategic',
    color: 'from-yellow-500 to-orange-500'
  },
  {
    id: 'library',
    label: 'Report Library',
    icon: Library,
    description: 'Catalog, versioning, and lineage tracking',
    criticality: 'core',
    color: 'from-indigo-500 to-blue-500'
  },
  {
    id: 'scheduling',
    label: 'Scheduling Orchestrator',
    icon: Clock,
    description: 'Trigger-based and time-based execution orchestration',
    criticality: 'enterprise',
    color: 'from-rose-500 to-pink-500'
  },
  {
    id: 'delivery',
    label: 'Delivery & Distribution Hub',
    icon: Send,
    description: 'Multi-channel delivery with compliance tracking',
    criticality: 'enterprise',
    color: 'from-cyan-500 to-blue-500'
  },
  {
    id: 'reliability',
    label: 'Reliability Center',
    icon: Activity,
    description: 'SLA monitoring, freshness, and failure intelligence',
    criticality: 'core',
    color: 'from-teal-500 to-green-500'
  },
  {
    id: 'consumption',
    label: 'Consumption Intelligence',
    icon: TrendingUp,
    description: 'Usage analytics and adoption metrics',
    criticality: 'strategic',
    color: 'from-violet-500 to-purple-500'
  },
  {
    id: 'decision-impact',
    label: 'Decision Impact Engine',
    icon: Scale,
    description: 'Outcome tracking and strategic ROI measurement',
    criticality: 'strategic',
    color: 'from-amber-500 to-orange-500'
  },
  {
    id: 'regulatory',
    label: 'Regulatory Intelligence Hub',
    icon: AlertCircle,
    description: 'Compliance, audit trails, and governance',
    criticality: 'core',
    color: 'from-red-500 to-rose-500'
  },
  {
    id: 'layout',
    label: 'Layout Intelligence',
    icon: Palette,
    description: 'Pre-built report templates and branding',
    criticality: 'enterprise',
    color: 'from-pink-500 to-rose-500'
  },
  {
    id: 'simulation',
    label: 'Simulation Preview',
    icon: AlertCircle,
    description: 'Render exact output before scheduling',
    criticality: 'enterprise',
    color: 'from-sky-500 to-blue-500'
  },
  {
    id: 'briefing',
    label: 'Executive One-Click Briefing',
    icon: Zap,
    description: 'Board-ready summary generation in seconds',
    criticality: 'strategic',
    color: 'from-amber-500 to-yellow-500'
  },
  {
    id: 'predictive',
    label: 'Predictive Reporting',
    icon: TrendingUp,
    description: 'Forward-looking AI trends and forecasts',
    criticality: 'strategic',
    color: 'from-lime-500 to-green-500'
  },
  {
    id: 'cross-module',
    label: 'Cross-Module Intelligence',
    icon: FileText,
    description: 'Strategic insights across all modules',
    criticality: 'strategic',
    color: 'from-cyan-500 to-blue-500'
  }
];

export default function ReportsModule() {
  const [activeWorkspace, setActiveWorkspace] = useState<IntelligenceWorkspace>('executive-overview');
  const [viewMode, setViewMode] = useState<'grid' | 'details'>('grid');

  const activeConfig = useMemo(
    () => WORKSPACES.find(w => w.id === activeWorkspace),
    [activeWorkspace]
  );

  const renderWorkspace = () => {
    switch (activeWorkspace) {
      case 'executive-overview':
        return <ExecutiveReportingOverview />;
      case 'report-builder':
        return <AdvancedReportBuilder />;
      case 'dataset-manager':
        return <DatasetManager />;
      case 'visualization':
        return <VisualizationDesigner />;
      case 'insights':
        return <InsightAuthoringLayer />;
      case 'library':
        return <ReportLibraryModule />;
      case 'scheduling':
        return <SchedulingOrchestrator />;
      case 'delivery':
        return <DeliveryDistributionHub />;
      case 'reliability':
        return <ReliabilityCenter />;
      case 'consumption':
        return <ConsumptionIntelligence />;
      case 'decision-impact':
        return <DecisionImpactEngine />;
      case 'regulatory':
        return <RegulatoryIntelligenceHub />;
      case 'layout':
        return <LayoutIntelligence />;
      case 'simulation':
        return <SimulationPreview />;
      case 'briefing':
        return <ExecutiveOneclickBriefing />;
      case 'predictive':
        return <PredictiveReporting />;
      case 'cross-module':
        return <CrossModuleIntelligence />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Reports Module</h1>
              <p className="text-muted-foreground">
                Enterprise Reporting | Regulatory Intelligence | Decision Acceleration | Strategic Visibility
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'details' : 'grid')}
                className="px-3 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-sm font-medium"
              >
                {viewMode === 'grid' ? 'List View' : 'Grid View'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row h-[calc(100vh-120px)]">
        {/* Workspace Navigator Sidebar */}
        <div className="w-full lg:w-64 border-b lg:border-b-0 lg:border-r border-border bg-card/50">
          <div className="p-4 space-y-2 h-full overflow-y-auto">
            <div className="mb-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Intelligence Workspaces
              </h3>
            </div>

            {/* Core workspaces */}
            <div className="space-y-1 mb-6">
              <div className="text-xs font-semibold text-muted-foreground/70 px-3 py-2">Core Platform</div>
              {WORKSPACES.filter(w => w.criticality === 'core').map(workspace => {
                const Icon = workspace.icon;
                const isActive = activeWorkspace === workspace.id;
                return (
                  <button
                    key={workspace.id}
                    onClick={() => setActiveWorkspace(workspace.id)}
                    className={cn(
                      "w-full flex items-start gap-3 px-3 py-2 rounded-lg text-sm transition-colors text-left group",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    )}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span className="flex-1">{workspace.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Enterprise workspaces */}
            <div className="space-y-1 mb-6">
              <div className="text-xs font-semibold text-muted-foreground/70 px-3 py-2">Enterprise</div>
              {WORKSPACES.filter(w => w.criticality === 'enterprise').map(workspace => {
                const Icon = workspace.icon;
                const isActive = activeWorkspace === workspace.id;
                return (
                  <button
                    key={workspace.id}
                    onClick={() => setActiveWorkspace(workspace.id)}
                    className={cn(
                      "w-full flex items-start gap-3 px-3 py-2 rounded-lg text-sm transition-colors text-left group",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    )}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span className="flex-1">{workspace.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Strategic workspaces */}
            <div className="space-y-1">
              <div className="text-xs font-semibold text-muted-foreground/70 px-3 py-2">Strategic</div>
              {WORKSPACES.filter(w => w.criticality === 'strategic').map(workspace => {
                const Icon = workspace.icon;
                const isActive = activeWorkspace === workspace.id;
                return (
                  <button
                    key={workspace.id}
                    onClick={() => setActiveWorkspace(workspace.id)}
                    className={cn(
                      "w-full flex items-start gap-3 px-3 py-2 rounded-lg text-sm transition-colors text-left group",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    )}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span className="flex-1">{workspace.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Workspace Header */}
          <div className="border-b border-border bg-card/30 px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {activeConfig && (
                  <>
                    <div className={cn(
                      "p-2 rounded-lg bg-gradient-to-br",
                      activeConfig.color
                    )}>
                      <activeConfig.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-foreground">{activeConfig.label}</h2>
                      <p className="text-sm text-muted-foreground">{activeConfig.description}</p>
                    </div>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button className="px-3 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-sm flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Export
                </button>
                <button className="px-3 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-sm flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Configure
                </button>
              </div>
            </div>
          </div>

          {/* Workspace Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-8">
              {renderWorkspace()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
