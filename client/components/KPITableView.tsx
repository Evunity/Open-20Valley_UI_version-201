import { useState, useMemo } from "react";
import { ChevronUp, ChevronDown, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

export interface KPITableRow {
  id: string;
  name: string;
  category: string;
  value: number;
  unit: string;
  change: number; // vs previous
  status: "healthy" | "acceptable" | "degraded" | "critical";
  threshold?: {
    warning: number;
    critical: number;
  };
}

interface Column {
  key: keyof KPITableRow | "rank";
  label: string;
  visible: boolean;
  sortable?: boolean;
  width?: string;
}

interface KPITableViewProps {
  title: string;
  rows: KPITableRow[];
  columns?: Column[];
  pageSize?: number;
  onRowClick?: (row: KPITableRow) => void;
}

type SortDirection = "asc" | "desc" | null;

export default function KPITableView({
  title,
  rows,
  columns: initialColumns,
  pageSize = 10,
  onRowClick,
}: KPITableViewProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    name: true,
    category: true,
    value: true,
    change: true,
    status: true,
  });

  const defaultColumns: Column[] = initialColumns || [
    { key: "rank", label: "Rank", visible: true, sortable: false },
    { key: "name", label: "KPI Name", visible: true, sortable: true },
    { key: "category", label: "Category", visible: true, sortable: true },
    { key: "value", label: "Value", visible: true, sortable: true },
    { key: "change", label: "Change %", visible: true, sortable: true },
    { key: "status", label: "Status", visible: true, sortable: true },
  ];

  // Sort data
  const sortedRows = useMemo(() => {
    if (!sortKey || !sortDirection) return rows;

    const sorted = [...rows].sort((a, b) => {
      const aVal = a[sortKey as keyof KPITableRow];
      const bVal = b[sortKey as keyof KPITableRow];

      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
      }

      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDirection === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      return 0;
    });

    return sorted;
  }, [rows, sortKey, sortDirection]);

  // Paginate data
  const paginatedRows = useMemo(() => {
    const start = currentPage * pageSize;
    return sortedRows.slice(start, start + pageSize);
  }, [sortedRows, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedRows.length / pageSize);

  // Handle column sorting
  const handleSort = (column: string) => {
    if (sortKey === column) {
      // Cycle: asc -> desc -> null
      setSortDirection(
        sortDirection === "asc" ? "desc" : sortDirection === "desc" ? null : "asc"
      );
      if (sortDirection === "desc") {
        setSortKey(null);
      }
    } else {
      setSortKey(column);
      setSortDirection("asc");
    }
  };

  // Toggle column visibility
  const toggleColumn = (column: string) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [column]: !prev[column],
    }));
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "bg-green-50 text-green-900";
      case "acceptable":
        return "bg-blue-50 text-blue-900";
      case "degraded":
        return "bg-orange-50 text-orange-900";
      case "critical":
        return "bg-red-50 text-red-900";
      default:
        return "bg-gray-50 text-gray-900";
    }
  };

  // Get value color based on status and threshold
  const getValueColor = (value: number, status: string) => {
    switch (status) {
      case "healthy":
        return "text-green-700";
      case "acceptable":
        return "text-blue-700";
      case "degraded":
        return "text-orange-700";
      case "critical":
        return "text-red-700";
      default:
        return "text-foreground";
    }
  };

  return (
    <div className="bg-card border border-border/50 rounded-lg overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border/50 flex items-center justify-between">
        <h3 className="text-lg font-bold text-foreground">{title}</h3>

        {/* Column Visibility Toggle */}
        <div className="flex items-center gap-2">
          <div className="relative group">
            <button className="p-2 rounded hover:bg-muted transition-colors" title="Toggle columns">
              <Eye className="w-4 h-4 text-muted-foreground" />
            </button>

            {/* Dropdown */}
            <div className="absolute right-0 top-full mt-1 w-48 bg-card border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 p-2">
              {defaultColumns.map((col) => (
                <button
                  key={String(col.key)}
                  onClick={() => toggleColumn(String(col.key))}
                  className="w-full text-left px-3 py-2 rounded hover:bg-muted transition-colors text-sm flex items-center gap-2"
                >
                  <input
                    type="checkbox"
                    checked={visibleColumns[String(col.key)] ?? true}
                    onChange={() => {}}
                    className="w-4 h-4 rounded border border-border"
                  />
                  <span className="text-foreground">{col.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-sm">
          {/* Header */}
          <thead>
            <tr className="border-b border-border/50 bg-muted/30">
              {defaultColumns.map((col) => {
                if (!visibleColumns[String(col.key)]) return null;

                return (
                  <th
                    key={String(col.key)}
                    className={cn(
                      "px-6 py-3 text-left font-semibold text-foreground",
                      col.sortable && "cursor-pointer hover:bg-muted/50 transition-colors"
                    )}
                    onClick={() => col.sortable && handleSort(String(col.key))}
                  >
                    <div className="flex items-center gap-2">
                      <span>{col.label}</span>
                      {col.sortable && sortKey === String(col.key) && (
                        <>
                          {sortDirection === "asc" && <ChevronUp className="w-4 h-4" />}
                          {sortDirection === "desc" && <ChevronDown className="w-4 h-4" />}
                        </>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {paginatedRows.length > 0 ? (
              paginatedRows.map((row, idx) => (
                <tr
                  key={row.id}
                  className={cn(
                    "border-b border-border/50 hover:bg-muted/50 transition-colors",
                    onRowClick && "cursor-pointer"
                  )}
                  onClick={() => onRowClick?.(row)}
                >
                  {defaultColumns.map((col) => {
                    if (!visibleColumns[String(col.key)]) return null;

                    if (col.key === "rank") {
                      return (
                        <td key="rank" className="px-6 py-4 font-semibold text-foreground">
                          #{idx + 1 + currentPage * pageSize}
                        </td>
                      );
                    }

                    if (col.key === "status") {
                      return (
                        <td key={col.key} className="px-6 py-4">
                          <span
                            className={cn(
                              "inline-block px-3 py-1 rounded-full text-xs font-semibold",
                              getStatusColor(row[col.key])
                            )}
                          >
                            {String(row[col.key]).charAt(0).toUpperCase() +
                              String(row[col.key]).slice(1)}
                          </span>
                        </td>
                      );
                    }

                    if (col.key === "value") {
                      return (
                        <td
                          key={col.key}
                          className={cn(
                            "px-6 py-4 font-semibold",
                            getValueColor(row[col.key] as number, row.status)
                          )}
                        >
                          {(row[col.key] as number).toFixed(2)} {row.unit}
                        </td>
                      );
                    }

                    if (col.key === "change") {
                      return (
                        <td key={col.key} className="px-6 py-4">
                          <span
                            className={cn(
                              "font-semibold",
                              (row[col.key] as number) > 0
                                ? "text-green-600"
                                : (row[col.key] as number) < 0
                                  ? "text-red-600"
                                  : "text-gray-600"
                            )}
                          >
                            {(row[col.key] as number) > 0 ? "+" : ""}
                            {(row[col.key] as number).toFixed(2)}%
                          </span>
                        </td>
                      );
                    }

                    return (
                      <td key={col.key} className="px-6 py-4 text-foreground">
                        {String(row[col.key])}
                      </td>
                    );
                  })}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={Object.keys(visibleColumns).length} className="px-6 py-12 text-center text-muted-foreground">
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-border/50 flex items-center justify-between bg-muted/30">
          <p className="text-sm text-muted-foreground">
            Showing {currentPage * pageSize + 1} to{" "}
            {Math.min((currentPage + 1) * pageSize, sortedRows.length)} of {sortedRows.length}
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
              className="px-3 py-1 rounded border border-border hover:bg-background disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i)}
                  className={cn(
                    "w-8 h-8 rounded text-sm font-medium transition-colors",
                    currentPage === i
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  )}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
              disabled={currentPage === totalPages - 1}
              className="px-3 py-1 rounded border border-border hover:bg-background disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
