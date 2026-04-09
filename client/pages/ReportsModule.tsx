import { useMemo, useState } from "react";
import {
  Activity,
  BookOpen,
  CalendarClock,
  ClipboardList,
  Database,
  FileClock,
  FilePenLine,
  FileText,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import ExecutiveReportingOverview from "@/components/reports/ExecutiveReportingOverview";
import AdvancedReportBuilder from "@/components/reports/AdvancedReportBuilder";
import ReportLibraryModule from "@/components/reports/ReportLibraryModule";
import InsightAuthoringLayer from "@/components/reports/InsightAuthoringLayer";
import ReliabilityCenter from "@/components/reports/ReliabilityCenter";
import RegulatoryIntelligenceHub from "@/components/reports/RegulatoryIntelligenceHub";
import DatasetManager from "@/components/reports/DatasetManager";
import SchedulingOrchestrator from "@/components/reports/SchedulingOrchestrator";

interface ReportNavItem {
  id:
    | "executive-overview"
    | "report-viz-builder"
    | "report-library"
    | "report-creation"
    | "insights-impact"
    | "reliability-consumption"
    | "regulatory-hub"
    | "dataset-manager"
    | "report-history"
    | "scheduling-distribution";
  label: string;
  description: string;
  icon: React.FC<any>;
}

const REPORT_NAV_ITEMS: ReportNavItem[] = [
  {
    id: "executive-overview",
    label: "Executive Reporting Overview",
    description: "Leadership-level operational reporting health.",
    icon: Activity,
  },
  {
    id: "report-viz-builder",
    label: "Report & Viz Builder",
    description: "Compose reports, charts, and narrative blocks.",
    icon: Sparkles,
  },
  {
    id: "report-library",
    label: "Report Library",
    description: "Catalog of published and draft reporting assets.",
    icon: BookOpen,
  },
  {
    id: "report-creation",
    label: "Report Creation",
    description: "Guided report setup and template-driven assembly.",
    icon: FilePenLine,
  },
  {
    id: "insights-impact",
    label: "Insights & Impact",
    description: "Narratives and downstream decision influence.",
    icon: ClipboardList,
  },
  {
    id: "reliability-consumption",
    label: "Reliability & Consumption",
    description: "Freshness, SLA health, and readership telemetry.",
    icon: ShieldCheck,
  },
  {
    id: "regulatory-hub",
    label: "Regulatory Intelligence Hub",
    description: "Compliance-aligned reporting and audit traces.",
    icon: FileText,
  },
  {
    id: "dataset-manager",
    label: "Dataset Manager",
    description: "Data source governance and lineage controls.",
    icon: Database,
  },
  {
    id: "report-history",
    label: "Report History",
    description: "Execution logs, retry history, and run outcomes.",
    icon: FileClock,
  },
  {
    id: "scheduling-distribution",
    label: "Scheduling & Distribution",
    description: "Publish cadence, subscriptions, and channel routing.",
    icon: CalendarClock,
  },
];

export default function ReportsModule() {
  const [activeSection, setActiveSection] = useState<ReportNavItem["id"]>("executive-overview");

  const activeConfig = useMemo(
    () => REPORT_NAV_ITEMS.find((item) => item.id === activeSection),
    [activeSection],
  );

  const renderContent = () => {
    switch (activeSection) {
      case "executive-overview":
        return <ExecutiveReportingOverview />;
      case "report-viz-builder":
        return <AdvancedReportBuilder />;
      case "report-library":
        return <ReportLibraryModule />;
      case "report-creation":
        return <AdvancedReportBuilder />;
      case "insights-impact":
        return <InsightAuthoringLayer />;
      case "reliability-consumption":
        return <ReliabilityCenter />;
      case "regulatory-hub":
        return <RegulatoryIntelligenceHub />;
      case "dataset-manager":
        return <DatasetManager />;
      case "report-history":
        return <ReportLibraryModule />;
      case "scheduling-distribution":
        return <SchedulingOrchestrator />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen">
        <aside className="w-[300px] border-r border-border bg-card/30">
          <div className="p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Reports Workspace
            </p>
          </div>
          <nav className="px-3 pb-4">
            <ul className="space-y-1">
              {REPORT_NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = item.id === activeSection;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => setActiveSection(item.id)}
                      className={cn(
                        "w-full rounded-md border px-3 py-2 text-left transition-colors",
                        isActive
                          ? "border-primary/30 bg-primary/10"
                          : "border-transparent hover:border-border hover:bg-muted/40",
                      )}
                    >
                      <div className="flex items-start gap-2.5">
                        <Icon
                          className={cn(
                            "mt-0.5 h-4 w-4 shrink-0",
                            isActive ? "text-primary" : "text-muted-foreground",
                          )}
                        />
                        <div>
                          <p className={cn("text-sm font-medium leading-5", isActive ? "text-primary" : "text-foreground")}>
                            {item.label}
                          </p>
                          <p className="mt-0.5 text-xs leading-4 text-muted-foreground">{item.description}</p>
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        <main className="flex-1 overflow-y-auto">
          <div className="border-b border-border bg-card/20 px-6 py-4">
            <h1 className="text-base font-semibold text-foreground">{activeConfig?.label}</h1>
            <p className="text-xs text-muted-foreground">{activeConfig?.description}</p>
          </div>
          <div className="p-6">{renderContent()}</div>
        </main>
      </div>
    </div>
  );
}
