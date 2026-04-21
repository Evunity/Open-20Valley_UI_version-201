export interface ReportsSection {
  id: string;
  label: string;
  path: string;
  description: string;
}

export const REPORTS_SECTIONS: ReportsSection[] = [
  {
    id: "report-creation",
    label: "Report Creation",
    path: "/reports-module/report-creation",
    description: "Unified report authoring with Guided and Visual modes.",
  },
  {
    id: "report-library",
    label: "Report Library",
    path: "/reports-module/report-library",
    description: "Catalog of published and draft reporting assets.",
  },
  {
    id: "report-history",
    label: "Report History",
    path: "/reports-module/report-history",
    description: "Execution logs, retry history, and run outcomes.",
  },
];

export const DEFAULT_REPORTS_SECTION = REPORTS_SECTIONS[0];
