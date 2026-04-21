import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowDown, ArrowUp, Copy, Eye, Play, RefreshCw, Save, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { DEFAULT_REPORTS_SECTION, REPORTS_SECTIONS } from "@/constants/reportsSections";
import { useToast } from "@/hooks/use-toast";

type ReportType =
  | "KPI Report"
  | "Alarm Report"
  | "Site Summary Report"
  | "Inventory / Topology Report"
  | "Activity / Audit Report"
  | "Custom Tabular Report";

type ScheduleType = "Run Once" | "Daily" | "Weekly" | "Monthly";
type OutputFormat = "PDF" | "XLSX" | "CSV";
type LastStatus = "Success" | "Failed" | "Running" | "Scheduled";
type TriggerType = "Manual" | "Schedule" | "Retry";

interface SavedReport {
  id: string;
  name: string;
  type: ReportType;
  owner: string;
  scope: string;
  format: OutputFormat;
  schedule: ScheduleType;
  lastRun: string;
  lastStatus: LastStatus;
  scheduleEnabled: boolean;
}

interface ReportRun {
  runId: string;
  reportName: string;
  triggerType: TriggerType;
  startedAt: string;
  finishedAt: string;
  duration: string;
  status: "Success" | "Failed" | "Running";
  outputFile: string;
  initiatedBy: string;
  errorMessage: string;
}

const REPORT_TYPES: ReportType[] = [
  "KPI Report",
  "Alarm Report",
  "Site Summary Report",
  "Inventory / Topology Report",
  "Activity / Audit Report",
  "Custom Tabular Report",
];

const DATA_SOURCES = [
  "Network Performance Warehouse",
  "Alarm Events Stream",
  "Inventory CMDB",
  "Topology Graph Store",
  "Audit Log Lake",
];

const SCOPE_ENTITIES = ["Tenant", "Region", "Site", "Cluster", "Vendor", "Technology", "Cell", "User", "Module"];

const ALL_COLUMNS = [
  "Timestamp",
  "Tenant",
  "Region",
  "Site",
  "Cluster",
  "Vendor",
  "Technology",
  "Cell",
  "Module",
  "Metric",
  "Value",
  "Threshold",
  "Severity",
  "Status",
  "Owner",
  "Updated At",
  "User",
  "Action",
  "Object",
];

const DEFAULT_COLUMNS_BY_TYPE: Record<ReportType, string[]> = {
  "KPI Report": ["Timestamp", "Region", "Site", "Metric", "Value", "Status"],
  "Alarm Report": ["Timestamp", "Region", "Site", "Severity", "Status", "Owner"],
  "Site Summary Report": ["Timestamp", "Site", "Technology", "Metric", "Value", "Status"],
  "Inventory / Topology Report": ["Tenant", "Region", "Site", "Cluster", "Vendor", "Technology", "Status"],
  "Activity / Audit Report": ["Timestamp", "User", "Action", "Object", "Status"],
  "Custom Tabular Report": ["Timestamp", "Region", "Site", "Metric", "Value"],
};

const initialSavedReports: SavedReport[] = [
  {
    id: "rpt-1024",
    name: "Daily KPI Executive",
    type: "KPI Report",
    owner: "NOC Lead",
    scope: "Tenant A / Region North",
    format: "PDF",
    schedule: "Daily",
    lastRun: "2026-04-21 05:00",
    lastStatus: "Success",
    scheduleEnabled: true,
  },
  {
    id: "rpt-2038",
    name: "Critical Alarm Summary",
    type: "Alarm Report",
    owner: "Ops Manager",
    scope: "All Regions",
    format: "XLSX",
    schedule: "Daily",
    lastRun: "2026-04-21 08:30",
    lastStatus: "Failed",
    scheduleEnabled: true,
  },
  {
    id: "rpt-3077",
    name: "Weekly Site Inventory",
    type: "Inventory / Topology Report",
    owner: "Planning Team",
    scope: "Region East / Vendor Nokia",
    format: "CSV",
    schedule: "Weekly",
    lastRun: "2026-04-20 02:00",
    lastStatus: "Success",
    scheduleEnabled: false,
  },
];

const initialRunHistory: ReportRun[] = [
  {
    runId: "run-90021",
    reportName: "Daily KPI Executive",
    triggerType: "Schedule",
    startedAt: "2026-04-21 05:00:02",
    finishedAt: "2026-04-21 05:01:14",
    duration: "72s",
    status: "Success",
    outputFile: "daily-kpi-executive-2026-04-21.pdf",
    initiatedBy: "scheduler",
    errorMessage: "",
  },
  {
    runId: "run-90022",
    reportName: "Critical Alarm Summary",
    triggerType: "Schedule",
    startedAt: "2026-04-21 08:30:00",
    finishedAt: "2026-04-21 08:30:41",
    duration: "41s",
    status: "Failed",
    outputFile: "",
    initiatedBy: "scheduler",
    errorMessage: "Timeout while fetching alarm stream from region gateway.",
  },
];

function renderStatusPill(status: string) {
  const tone =
    status === "Success"
      ? "bg-green-100 text-green-700"
      : status === "Failed"
      ? "bg-red-100 text-red-700"
      : status === "Running"
      ? "bg-blue-100 text-blue-700"
      : "bg-amber-100 text-amber-700";

  return <span className={cn("rounded px-2 py-0.5 text-xs font-semibold", tone)}>{status}</span>;
}

export default function ReportsModule() {
  const { toast } = useToast();
  const { sectionId } = useParams<{ sectionId: string }>();
  const activeSectionId = sectionId ?? DEFAULT_REPORTS_SECTION.id;

  const [reportName, setReportName] = useState("Network KPI Daily Summary");
  const [reportType, setReportType] = useState<ReportType>("KPI Report");
  const [description, setDescription] = useState("Daily KPI performance summary for operations review.");
  const [dataSource, setDataSource] = useState(DATA_SOURCES[0]);
  const [scopeValues, setScopeValues] = useState<Record<string, string>>({
    Tenant: "Tenant A",
    Region: "North",
    Site: "All",
    Cluster: "All",
    Vendor: "All",
    Technology: "4G, 5G",
    Cell: "All",
    User: "All",
    Module: "RAN",
  });
  const [filters, setFilters] = useState("severity IN (Critical, Major) AND status != Closed");
  const [selectedColumns, setSelectedColumns] = useState<string[]>(DEFAULT_COLUMNS_BY_TYPE["KPI Report"]);
  const [groupBy, setGroupBy] = useState("Region");
  const [sortBy, setSortBy] = useState("Timestamp DESC");
  const [timeRange, setTimeRange] = useState("Last 24 hours");
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("PDF");
  const [schedule, setSchedule] = useState<ScheduleType>("Daily");
  const [deliveryDownload, setDeliveryDownload] = useState(true);
  const [deliveryEmail, setDeliveryEmail] = useState(true);
  const [deliveryLibrary, setDeliveryLibrary] = useState(true);
  const [recipients, setRecipients] = useState("noc.lead@company.com, ops.manager@company.com");

  const [savedReports, setSavedReports] = useState<SavedReport[]>(initialSavedReports);
  const [runHistory, setRunHistory] = useState<ReportRun[]>(initialRunHistory);

  const availableColumns = useMemo(
    () => ALL_COLUMNS.filter((column) => !selectedColumns.includes(column)),
    [selectedColumns],
  );

  const previewRows = useMemo(
    () => [
      {
        Timestamp: "2026-04-21 08:00",
        Tenant: "Tenant A",
        Region: "North",
        Site: "Site-14",
        Cluster: "Cluster-7",
        Vendor: "Nokia",
        Technology: "5G",
        Cell: "Cell-714",
        Module: "RAN",
        Metric: "Availability",
        Value: "99.72%",
        Threshold: "99.50%",
        Severity: "Info",
        Status: "Healthy",
        Owner: "Ops Team",
        "Updated At": "2026-04-21 08:05",
        User: "svc-reporter",
        Action: "Collect",
        Object: "KPI.Dataset",
      },
      {
        Timestamp: "2026-04-21 08:00",
        Tenant: "Tenant A",
        Region: "East",
        Site: "Site-21",
        Cluster: "Cluster-2",
        Vendor: "Ericsson",
        Technology: "4G",
        Cell: "Cell-221",
        Module: "RAN",
        Metric: "Drop Rate",
        Value: "0.84%",
        Threshold: "< 1.00%",
        Severity: "Minor",
        Status: "Monitor",
        Owner: "Field Ops",
        "Updated At": "2026-04-21 08:05",
        User: "svc-reporter",
        Action: "Evaluate",
        Object: "Alarm.RuleSet",
      },
    ],
    [],
  );

  const applyTypeDefaults = (nextType: ReportType) => {
    setReportType(nextType);
    setSelectedColumns(DEFAULT_COLUMNS_BY_TYPE[nextType]);
    setGroupBy(nextType === "Activity / Audit Report" ? "User" : "Region");
    setSortBy("Timestamp DESC");
    toast({ title: "Defaults applied", description: `${nextType} columns and layout defaults were loaded.` });
  };

  const addColumn = (column: string) => setSelectedColumns((prev) => [...prev, column]);
  const removeColumn = (column: string) => setSelectedColumns((prev) => prev.filter((c) => c !== column));

  const moveColumn = (index: number, direction: "up" | "down") => {
    setSelectedColumns((prev) => {
      const next = [...prev];
      const target = direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const saveDraft = () => {
    const newReport: SavedReport = {
      id: `rpt-${Math.floor(Math.random() * 9000) + 1000}`,
      name: reportName,
      type: reportType,
      owner: "Current User",
      scope: `${scopeValues.Tenant} / ${scopeValues.Region} / ${scopeValues.Site}`,
      format: outputFormat,
      schedule,
      lastRun: "-",
      lastStatus: "Scheduled",
      scheduleEnabled: true,
    };
    setSavedReports((prev) => [newReport, ...prev]);
    toast({ title: "Draft saved", description: `${reportName} saved to Reports List.` });
  };

  const runNow = (name = reportName, initiatedBy = "Current User", trigger: TriggerType = "Manual") => {
    const now = new Date();
    const startedAt = now.toISOString().slice(0, 19).replace("T", " ");
    const finishedAt = new Date(now.getTime() + 42000).toISOString().slice(0, 19).replace("T", " ");
    const outputFile = `${name.toLowerCase().replace(/\s+/g, "-")}-${now.toISOString().slice(0, 10)}.${outputFormat.toLowerCase()}`;

    const run: ReportRun = {
      runId: `run-${Math.floor(Math.random() * 90000) + 10000}`,
      reportName: name,
      triggerType: trigger,
      startedAt,
      finishedAt,
      duration: "42s",
      status: "Success",
      outputFile,
      initiatedBy,
      errorMessage: "",
    };

    setRunHistory((prev) => [run, ...prev]);
    setSavedReports((prev) =>
      prev.map((report) =>
        report.name === name
          ? { ...report, lastRun: startedAt.slice(0, 16), lastStatus: "Success" }
          : report,
      ),
    );
    toast({ title: "Run started", description: `${name} executed successfully.` });
  };

  const deleteReport = (id: string) => {
    setSavedReports((prev) => prev.filter((report) => report.id !== id));
    toast({ title: "Report deleted", description: "The report has been removed from the list." });
  };

  const toggleSchedule = (id: string) => {
    setSavedReports((prev) =>
      prev.map((report) => (report.id === id ? { ...report, scheduleEnabled: !report.scheduleEnabled } : report)),
    );
  };

  return (
    <div className="min-h-full space-y-4 p-4 md:p-5">
      <div className="rounded-lg border border-border bg-card p-4">
        <h1 className="text-xl font-bold text-foreground">Reports Module</h1>
        <p className="mt-1 text-sm text-muted-foreground">Operational reporting workflow with only Create Report, Reports List, and Run History.</p>
      </div>

      <div className="grid gap-2 md:grid-cols-3">
        {REPORTS_SECTIONS.map((section) => (
          <Link
            key={section.id}
            to={section.path}
            className={cn(
              "rounded-lg border p-3 transition",
              activeSectionId === section.id
                ? "border-primary bg-primary/10"
                : "border-border bg-card hover:border-primary/40",
            )}
          >
            <p className="text-sm font-semibold text-foreground">{section.label}</p>
            <p className="mt-1 text-xs text-muted-foreground">{section.description}</p>
          </Link>
        ))}
      </div>

      {activeSectionId === "create-report" && (
        <div className="space-y-4">
          <section className="rounded-lg border border-border bg-card p-4">
            <h2 className="text-base font-bold">1. Report Basics</h2>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <label className="space-y-1">
                <span className="text-xs font-semibold text-muted-foreground">Report Name</span>
                <input value={reportName} onChange={(e) => setReportName(e.target.value)} className="w-full rounded border border-border bg-background px-3 py-2 text-sm" />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-semibold text-muted-foreground">Report Type</span>
                <select value={reportType} onChange={(e) => applyTypeDefaults(e.target.value as ReportType)} className="w-full rounded border border-border bg-background px-3 py-2 text-sm">
                  {REPORT_TYPES.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </label>
              <label className="space-y-1 md:col-span-2">
                <span className="text-xs font-semibold text-muted-foreground">Description</span>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="w-full rounded border border-border bg-background px-3 py-2 text-sm" />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-semibold text-muted-foreground">Data Source</span>
                <select value={dataSource} onChange={(e) => setDataSource(e.target.value)} className="w-full rounded border border-border bg-background px-3 py-2 text-sm">
                  {DATA_SOURCES.map((source) => (
                    <option key={source} value={source}>{source}</option>
                  ))}
                </select>
              </label>
              <label className="space-y-1">
                <span className="text-xs font-semibold text-muted-foreground">Time Range</span>
                <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)} className="w-full rounded border border-border bg-background px-3 py-2 text-sm">
                  <option>Last 24 hours</option>
                  <option>Last 7 days</option>
                  <option>Last 30 days</option>
                  <option>Custom Range</option>
                </select>
              </label>
            </div>
          </section>

          <section className="rounded-lg border border-border bg-card p-4">
            <h2 className="text-base font-bold">2. Scope &amp; Filters</h2>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              {SCOPE_ENTITIES.map((entity) => (
                <label key={entity} className="space-y-1">
                  <span className="text-xs font-semibold text-muted-foreground">{entity}</span>
                  <input
                    value={scopeValues[entity] ?? "All"}
                    onChange={(e) => setScopeValues((prev) => ({ ...prev, [entity]: e.target.value }))}
                    className="w-full rounded border border-border bg-background px-3 py-2 text-sm"
                  />
                </label>
              ))}
              <label className="space-y-1 md:col-span-3">
                <span className="text-xs font-semibold text-muted-foreground">Filters</span>
                <textarea value={filters} onChange={(e) => setFilters(e.target.value)} rows={2} className="w-full rounded border border-border bg-background px-3 py-2 text-sm" />
              </label>
            </div>
          </section>

          <section className="rounded-lg border border-border bg-card p-4">
            <h2 className="text-base font-bold">3. Columns &amp; Layout</h2>
            <div className="mt-3 grid gap-3 lg:grid-cols-3">
              <div className="rounded border border-border p-3">
                <p className="text-xs font-semibold text-muted-foreground">Available Columns</p>
                <div className="mt-2 max-h-48 space-y-1 overflow-auto">
                  {availableColumns.map((column) => (
                    <button key={column} onClick={() => addColumn(column)} className="w-full rounded border border-border px-2 py-1 text-left text-xs hover:bg-muted">
                      + {column}
                    </button>
                  ))}
                </div>
              </div>
              <div className="rounded border border-border p-3 lg:col-span-2">
                <p className="text-xs font-semibold text-muted-foreground">Selected Columns (reorder)</p>
                <div className="mt-2 space-y-1">
                  {selectedColumns.map((column, index) => (
                    <div key={column} className="flex items-center gap-2 rounded border border-border px-2 py-1.5 text-xs">
                      <span className="w-6 text-center font-semibold text-muted-foreground">{index + 1}</span>
                      <span className="flex-1">{column}</span>
                      <button onClick={() => moveColumn(index, "up")} className="rounded border border-border p-1 hover:bg-muted"><ArrowUp className="h-3 w-3" /></button>
                      <button onClick={() => moveColumn(index, "down")} className="rounded border border-border p-1 hover:bg-muted"><ArrowDown className="h-3 w-3" /></button>
                      <button onClick={() => removeColumn(column)} className="rounded border border-border p-1 hover:bg-muted"><Trash2 className="h-3 w-3" /></button>
                    </div>
                  ))}
                </div>
              </div>
              <label className="space-y-1">
                <span className="text-xs font-semibold text-muted-foreground">Group By</span>
                <input value={groupBy} onChange={(e) => setGroupBy(e.target.value)} className="w-full rounded border border-border bg-background px-3 py-2 text-sm" />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-semibold text-muted-foreground">Sort By</span>
                <input value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full rounded border border-border bg-background px-3 py-2 text-sm" />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-semibold text-muted-foreground">Output Format</span>
                <select value={outputFormat} onChange={(e) => setOutputFormat(e.target.value as OutputFormat)} className="w-full rounded border border-border bg-background px-3 py-2 text-sm">
                  <option value="PDF">PDF</option>
                  <option value="XLSX">XLSX</option>
                  <option value="CSV">CSV</option>
                </select>
              </label>
            </div>
          </section>

          <section className="rounded-lg border border-border bg-card p-4">
            <h2 className="text-base font-bold">4. Schedule &amp; Delivery</h2>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <label className="space-y-1">
                <span className="text-xs font-semibold text-muted-foreground">Schedule</span>
                <select value={schedule} onChange={(e) => setSchedule(e.target.value as ScheduleType)} className="w-full rounded border border-border bg-background px-3 py-2 text-sm">
                  <option>Run Once</option>
                  <option>Daily</option>
                  <option>Weekly</option>
                  <option>Monthly</option>
                </select>
              </label>
              <div className="space-y-1">
                <span className="text-xs font-semibold text-muted-foreground">Delivery</span>
                <div className="rounded border border-border p-2 text-sm space-y-2">
                  <label className="flex items-center gap-2"><input type="checkbox" checked={deliveryDownload} onChange={(e) => setDeliveryDownload(e.target.checked)} /> Download</label>
                  <label className="flex items-center gap-2"><input type="checkbox" checked={deliveryEmail} onChange={(e) => setDeliveryEmail(e.target.checked)} /> Email Recipients</label>
                  <label className="flex items-center gap-2"><input type="checkbox" checked={deliveryLibrary} onChange={(e) => setDeliveryLibrary(e.target.checked)} /> Save to Library</label>
                </div>
              </div>
              {deliveryEmail && (
                <label className="space-y-1 md:col-span-2">
                  <span className="text-xs font-semibold text-muted-foreground">Recipients</span>
                  <input value={recipients} onChange={(e) => setRecipients(e.target.value)} className="w-full rounded border border-border bg-background px-3 py-2 text-sm" />
                </label>
              )}
            </div>
          </section>

          <section className="rounded-lg border border-border bg-card p-4">
            <h2 className="text-base font-bold">5. Preview &amp; Execute</h2>
            <div className="mt-3 overflow-auto rounded border border-border">
              <table className="min-w-full text-xs">
                <thead className="bg-muted/40">
                  <tr>
                    {selectedColumns.map((column) => (
                      <th key={column} className="border-b border-border px-2 py-2 text-left font-semibold">{column}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewRows.map((row, index) => (
                    <tr key={index} className="odd:bg-background even:bg-muted/10">
                      {selectedColumns.map((column) => (
                        <td key={column} className="border-b border-border px-2 py-2">{String(row[column as keyof typeof row] ?? "-")}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button onClick={saveDraft} className="inline-flex items-center gap-1 rounded border border-border bg-background px-3 py-2 text-xs font-semibold hover:bg-muted">
                <Save className="h-3.5 w-3.5" /> Save Draft
              </button>
              <button onClick={() => runNow()} className="inline-flex items-center gap-1 rounded bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90">
                <Play className="h-3.5 w-3.5" /> Run Now
              </button>
              <button onClick={() => toast({ title: "Preview refreshed", description: "Preview reflects latest scope, filters, and columns." })} className="inline-flex items-center gap-1 rounded border border-border bg-background px-3 py-2 text-xs font-semibold hover:bg-muted">
                <Eye className="h-3.5 w-3.5" /> Refresh Preview
              </button>
            </div>
          </section>
        </div>
      )}

      {activeSectionId === "reports-list" && (
        <section className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-base font-bold">Reports List</h2>
          <div className="mt-3 overflow-auto">
            <table className="min-w-full text-xs">
              <thead className="bg-muted/40">
                <tr>
                  {["Report Name", "Type", "Owner", "Scope", "Format", "Schedule", "Last Run", "Last Status", "Actions"].map((col) => (
                    <th key={col} className="border-b border-border px-2 py-2 text-left font-semibold">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {savedReports.map((report) => (
                  <tr key={report.id} className="odd:bg-background even:bg-muted/10">
                    <td className="border-b border-border px-2 py-2 font-medium">{report.name}</td>
                    <td className="border-b border-border px-2 py-2">{report.type}</td>
                    <td className="border-b border-border px-2 py-2">{report.owner}</td>
                    <td className="border-b border-border px-2 py-2">{report.scope}</td>
                    <td className="border-b border-border px-2 py-2">{report.format}</td>
                    <td className="border-b border-border px-2 py-2">{report.schedule}</td>
                    <td className="border-b border-border px-2 py-2">{report.lastRun}</td>
                    <td className="border-b border-border px-2 py-2">{renderStatusPill(report.lastStatus)}</td>
                    <td className="border-b border-border px-2 py-2">
                      <div className="flex flex-wrap gap-1">
                        <button onClick={() => toast({ title: "View report", description: report.name })} className="rounded border border-border px-2 py-1 hover:bg-muted">View</button>
                        <button onClick={() => toast({ title: "Edit report", description: `Open ${report.name} in Create Report.` })} className="rounded border border-border px-2 py-1 hover:bg-muted">Edit</button>
                        <button onClick={() => {
                          const copy: SavedReport = { ...report, id: `rpt-${Math.floor(Math.random() * 9000) + 1000}`, name: `${report.name} (Copy)` };
                          setSavedReports((prev) => [copy, ...prev]);
                        }} className="rounded border border-border px-2 py-1 hover:bg-muted inline-flex items-center gap-1"><Copy className="h-3 w-3" />Duplicate</button>
                        <button onClick={() => runNow(report.name)} className="rounded border border-border px-2 py-1 hover:bg-muted inline-flex items-center gap-1"><Play className="h-3 w-3" />Run Now</button>
                        <button onClick={() => toggleSchedule(report.id)} className="rounded border border-border px-2 py-1 hover:bg-muted">{report.scheduleEnabled ? "Disable Schedule" : "Enable Schedule"}</button>
                        <button onClick={() => deleteReport(report.id)} className="rounded border border-border px-2 py-1 text-red-600 hover:bg-red-50">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {activeSectionId === "run-history" && (
        <section className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-base font-bold">Run History</h2>
          <div className="mt-3 overflow-auto">
            <table className="min-w-full text-xs">
              <thead className="bg-muted/40">
                <tr>
                  {["Run ID", "Report Name", "Trigger Type", "Started At", "Finished At", "Duration", "Status", "Output File", "Initiated By", "Error Message", "Actions"].map((col) => (
                    <th key={col} className="border-b border-border px-2 py-2 text-left font-semibold">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {runHistory.map((run) => (
                  <tr key={run.runId} className="odd:bg-background even:bg-muted/10">
                    <td className="border-b border-border px-2 py-2 font-medium">{run.runId}</td>
                    <td className="border-b border-border px-2 py-2">{run.reportName}</td>
                    <td className="border-b border-border px-2 py-2">{run.triggerType}</td>
                    <td className="border-b border-border px-2 py-2">{run.startedAt}</td>
                    <td className="border-b border-border px-2 py-2">{run.finishedAt}</td>
                    <td className="border-b border-border px-2 py-2">{run.duration}</td>
                    <td className="border-b border-border px-2 py-2">{renderStatusPill(run.status)}</td>
                    <td className="border-b border-border px-2 py-2">{run.outputFile || "-"}</td>
                    <td className="border-b border-border px-2 py-2">{run.initiatedBy}</td>
                    <td className="border-b border-border px-2 py-2 text-red-600">{run.errorMessage || "-"}</td>
                    <td className="border-b border-border px-2 py-2">
                      <div className="flex flex-wrap gap-1">
                        <button onClick={() => toast({ title: "Run details", description: `${run.runId} for ${run.reportName}` })} className="rounded border border-border px-2 py-1 hover:bg-muted">View Run Details</button>
                        <button onClick={() => toast({ title: "Download output", description: run.outputFile || "No output file available for this run." })} className="rounded border border-border px-2 py-1 hover:bg-muted">Download Output</button>
                        <button onClick={() => runNow(run.reportName, "Current User", "Retry")} className="rounded border border-border px-2 py-1 hover:bg-muted inline-flex items-center gap-1"><RefreshCw className="h-3 w-3" />Retry Run</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
