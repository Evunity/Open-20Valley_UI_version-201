/**
 * Export Utilities for Analytics
 * Handles CSV and Excel exports with full metadata
 */

import * as XLSX from "xlsx";

export type ExportFormat = "csv" | "excel";
export type ExportScope = "chart" | "table" | "page" | "dataset" | "comparison";

export interface ExportMetadata {
  tenant: string;
  user: string;
  timeRange: {
    from: string;
    to: string;
  };
  filters: Record<string, any>;
  kpiDefinitions?: Array<{
    id: string;
    name: string;
    unit: string;
  }>;
  objectScope: string;
  timestamp: string;
  title: string;
  scope: ExportScope;
}

export interface ExportData {
  metadata: ExportMetadata;
  rows: Array<Record<string, any>>;
  columns: Array<{
    key: string;
    label: string;
  }>;
}

/**
 * Generate export metadata
 */
export const generateMetadata = (
  title: string,
  scope: ExportScope,
  timeRange: { from: string; to: string },
  filters: Record<string, any>,
  kpis?: Array<{ id: string; name: string; unit: string }>,
  objectScope: string = "Network"
): ExportMetadata => {
  return {
    tenant: "Default Tenant", // Should come from context
    user: "Current User", // Should come from auth context
    timeRange,
    filters,
    kpiDefinitions: kpis,
    objectScope,
    timestamp: new Date().toISOString(),
    title,
    scope,
  };
};

/**
 * Format metadata as header rows for Excel/CSV
 */
const formatMetadataRows = (metadata: ExportMetadata): Array<Record<string, string>> => {
  return [
    { "Export Information": "Value" },
    { "Export Information": "" },
    { "Title": metadata.title },
    { "Scope": metadata.scope },
    { "Object Scope": metadata.objectScope },
    { "User": metadata.user },
    { "Tenant": metadata.tenant },
    { "Generated": new Date(metadata.timestamp).toLocaleString() },
    { "Export Information": "" },
    { "Time Range": `${metadata.timeRange.from} to ${metadata.timeRange.to}` },
    { "Export Information": "" },
    { "Filters": JSON.stringify(metadata.filters, null, 2) },
    { "Export Information": "" },
  ];
};

/**
 * Export to CSV
 */
export const exportToCSV = async (
  data: ExportData,
  filename?: string
): Promise<void> => {
  return new Promise((resolve) => {
    const metadataRows = formatMetadataRows(data.metadata);
    const allRows = [...metadataRows, {}, ...data.rows];

    const csvContent = [
      // Headers
      data.columns.map((c) => `"${c.label}"`).join(","),
      // Data
      ...allRows.map((row) =>
        data.columns
          .map((col) => {
            const value = row[col.key];
            if (value === undefined || value === null) return '""';
            const stringValue = String(value).replace(/"/g, '""');
            return `"${stringValue}"`;
          })
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      filename || `${data.metadata.title}_${Date.now()}.csv`
    );
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    resolve();
  });
};

/**
 * Export to Excel with formatted sheets
 */
export const exportToExcel = async (
  data: ExportData,
  filename?: string
): Promise<void> => {
  return new Promise((resolve) => {
    const wb = XLSX.utils.book_new();

    // Metadata sheet
    const metadataSheet: Array<Record<string, string>> = [
      { "Export Metadata": "" },
      { "Title": data.metadata.title },
      { "Scope": data.metadata.scope },
      { "Object Scope": data.metadata.objectScope },
      { "User": data.metadata.user },
      { "Tenant": data.metadata.tenant },
      {
        "Generated":
          new Date(data.metadata.timestamp).toLocaleString(),
      },
      { "": "" },
      {
        "Time Range":
          `${data.metadata.timeRange.from} to ${data.metadata.timeRange.to}`,
      },
    ];

    if (data.metadata.kpiDefinitions && data.metadata.kpiDefinitions.length > 0) {
      metadataSheet.push({ "": "" });
      metadataSheet.push({ "KPI Definitions": "" });
      data.metadata.kpiDefinitions.forEach((kpi) => {
        metadataSheet.push({
          "KPI": kpi.name,
          "Unit": kpi.unit,
          "ID": kpi.id,
        });
      });
    }

    metadataSheet.push({ "": "" });
    metadataSheet.push({ "Filters Applied": JSON.stringify(data.metadata.filters, null, 2) });

    const metaWs = XLSX.utils.json_to_sheet(metadataSheet, {
      header: ["Export Metadata", "Value"],
    });
    XLSX.utils.book_append_sheet(wb, metaWs, "Metadata");

    // Data sheet
    const dataWs = XLSX.utils.json_to_sheet(data.rows);
    XLSX.utils.sheet_add_aoa(
      dataWs,
      [[data.columns.map((c) => c.label)]],
      { origin: "A1" }
    );
    XLSX.utils.book_append_sheet(wb, dataWs, data.metadata.title);

    // Write file
    XLSX.writeFile(
      wb,
      filename || `${data.metadata.title}_${Date.now()}.xlsx`
    );

    resolve();
  });
};

/**
 * Check if export is large and may need async handling
 */
export const isLargeExport = (rowCount: number): boolean => {
  // Consider exports with more than 50,000 rows as large
  return rowCount > 50000;
};

/**
 * Simulate async export with progress tracking
 */
export const exportAsync = async (
  data: ExportData,
  format: ExportFormat,
  filename?: string,
  onProgress?: (progress: number) => void
): Promise<void> => {
  const totalSteps = 100;
  let currentStep = 0;

  // Simulate processing
  for (let i = 0; i < 30; i++) {
    await new Promise((resolve) => setTimeout(resolve, 50));
    currentStep = Math.round((i / 30) * 50);
    onProgress?.(currentStep);
  }

  // Perform actual export
  currentStep = 50;
  onProgress?.(currentStep);

  if (format === "csv") {
    await exportToCSV(data, filename);
  } else {
    await exportToExcel(data, filename);
  }

  currentStep = 100;
  onProgress?.(currentStep);
};

/**
 * Validate export data
 */
export const validateExportData = (data: ExportData): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!data.metadata.title) errors.push("Export title is required");
  if (!data.metadata.tenant) errors.push("Tenant information is missing");
  if (!data.columns || data.columns.length === 0) errors.push("No columns defined");
  if (!data.rows || data.rows.length === 0) errors.push("No data rows to export");

  return {
    valid: errors.length === 0,
    errors,
  };
};
