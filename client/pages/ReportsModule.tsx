import { useMemo } from "react";
import { useParams } from "react-router-dom";
import ReportLibraryModule from "@/components/reports/ReportLibraryModule";
import ReportCreationWorkspace from "@/components/reports/ReportCreationWorkspace";
import ReportHistoryRegistry from "@/components/reports/ReportHistoryRegistry";
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
      case "report-history":
        return <ReportHistoryRegistry />;
      default:
        return <ReportCreationWorkspace />;
    }
  }, [activeSectionId]);

  return <div className="min-h-full p-4 md:p-5">{renderedSection}</div>;
}
