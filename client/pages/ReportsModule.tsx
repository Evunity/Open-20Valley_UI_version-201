import { useMemo } from "react";
import { useParams } from "react-router-dom";
import ReportLibraryModule from "@/components/reports/ReportLibraryModule";
import ReportCreationWorkspace from "@/components/reports/ReportCreationWorkspace";
import InsightAuthoringLayer from "@/components/reports/InsightAuthoringLayer";
import ReliabilityCenter from "@/components/reports/ReliabilityCenter";
import RegulatoryIntelligenceHub from "@/components/reports/RegulatoryIntelligenceHub";
import DatasetManager from "@/components/reports/DatasetManager";
import ReportHistoryRegistry from "@/components/reports/ReportHistoryRegistry";
import SchedulingOrchestrator from "@/components/reports/SchedulingOrchestrator";
import { DEFAULT_REPORTS_SECTION } from "@/constants/reportsSections";

export default function ReportsModule() {
  const { sectionId } = useParams<{ sectionId: string }>();
  const activeSectionId = sectionId ?? DEFAULT_REPORTS_SECTION.id;

  const renderedSection = useMemo(() => {
    switch (activeSectionId) {
      case "report-viz-builder":
        return <ReportCreationWorkspace initialMode="visual" />;
      case "report-library":
        return <ReportLibraryModule />;
      case "report-creation":
        return <ReportCreationWorkspace />;
      case "insights-impact":
        return <InsightAuthoringLayer />;
      case "reliability-consumption":
        return <ReliabilityCenter />;
      case "regulatory-intelligence-hub":
        return <RegulatoryIntelligenceHub />;
      case "dataset-manager":
        return <DatasetManager />;
      case "report-history":
        return <ReportHistoryRegistry />;
      case "scheduling-distribution":
        return <SchedulingOrchestrator />;
      default:
        return <ReportCreationWorkspace />;
    }
  }, [activeSectionId]);

  return <div className="min-h-full p-4 md:p-5">{renderedSection}</div>;
}
