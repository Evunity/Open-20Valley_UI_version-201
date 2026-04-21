export interface ReportsSection {
  id: string;
  label: string;
  path: string;
  description: string;
}

export const REPORTS_SECTIONS: ReportsSection[] = [
  {
    id: "create-report",
    label: "Create Report",
    path: "/reports-module/create-report",
    description: "Build a report with scope, filters, columns, schedule, and delivery.",
  },
  {
    id: "reports-list",
    label: "Reports List",
    path: "/reports-module/reports-list",
    description: "Manage saved reports and operational actions.",
  },
  {
    id: "run-history",
    label: "Run History",
    path: "/reports-module/run-history",
    description: "Track execution history, outputs, and failures.",
  },
];

export const DEFAULT_REPORTS_SECTION = REPORTS_SECTIONS[0];
