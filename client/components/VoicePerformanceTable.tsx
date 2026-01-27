import { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface PerformanceData {
  name: string;
  calls: number;
  drops?: number;
  drop_rate: number;
  success_rate: number;
  stability?: number;
  status: string;
  priority?: "Critical" | "High" | "Medium" | "Low";
}

interface VoicePerformanceTableProps {
  data: PerformanceData[];
  title: string;
  dimension: "Vendor" | "Technology" | "Region" | "Cluster";
  onSort?: (key: string, direction: "asc" | "desc") => void;
}

export default function VoicePerformanceTable({
  data,
  title,
  dimension,
  onSort,
}: VoicePerformanceTableProps) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const handleSort = (key: string) => {
    if (sortKey === key) {
      const newDirection = sortDirection === "asc" ? "desc" : "asc";
      setSortDirection(newDirection);
      onSort?.(key, newDirection);
    } else {
      setSortKey(key);
      setSortDirection("desc");
      onSort?.(key, "desc");
    }
  };

  const getSortedData = () => {
    if (!sortKey) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortKey as keyof PerformanceData];
      const bValue = b[sortKey as keyof PerformanceData];

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      }

      return sortDirection === "asc"
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue));
    });
  };

  const getStatusColor = (status: string) => {
    if (status.includes("High quality") || status.includes("High performance"))
      return "text-status-healthy";
    if (status.includes("Degraded") || status.includes("Congested"))
      return "text-status-critical";
    return "text-status-degraded";
  };

  const getStatusBgColor = (status: string) => {
    if (status.includes("High quality") || status.includes("High performance"))
      return "bg-status-healthy/10";
    if (status.includes("Degraded") || status.includes("Congested"))
      return "bg-status-critical/10";
    return "bg-status-degraded/10";
  };

  const getPriorityColor = (priority?: string) => {
    if (!priority) return "bg-gray-100 text-gray-700";
    switch (priority) {
      case "Critical":
        return "bg-status-critical/20 text-status-critical";
      case "High":
        return "bg-status-degraded/20 text-status-degraded";
      case "Medium":
        return "bg-yellow-100 text-yellow-700";
      case "Low":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const sortedData = getSortedData();
  const SortIcon = ({ columnKey }: { columnKey: string }) => {
    if (sortKey !== columnKey) return <div className="w-4 h-4" />;
    return sortDirection === "asc" ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    );
  };

  return (
    <div className="card-elevated rounded-xl border border-border/50 p-6">
      <h3 className="text-lg font-bold text-foreground mb-4">By {dimension}</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-xs md:text-sm">
          <thead>
            <tr className="border-b border-border/50">
              <th className="px-2 md:px-4 py-2 text-left font-semibold text-foreground">
                <button
                  onClick={() => handleSort("name")}
                  className="flex items-center gap-2 hover:text-primary transition-colors"
                >
                  {dimension}
                  <SortIcon columnKey="name" />
                </button>
              </th>
              {data.some((d) => d.calls) && (
                <th className="px-4 py-3 text-right font-semibold text-foreground">
                  <button
                    onClick={() => handleSort("calls")}
                    className="flex items-center justify-end gap-2 w-full hover:text-primary transition-colors"
                  >
                    Calls
                    <SortIcon columnKey="calls" />
                  </button>
                </th>
              )}
              {data.some((d) => d.drops !== undefined) && (
                <th className="px-4 py-3 text-right font-semibold text-foreground">
                  <button
                    onClick={() => handleSort("drops")}
                    className="flex items-center justify-end gap-2 w-full hover:text-primary transition-colors"
                  >
                    Drops
                    <SortIcon columnKey="drops" />
                  </button>
                </th>
              )}
              <th className="px-4 py-3 text-right font-semibold text-foreground">
                <button
                  onClick={() => handleSort("drop_rate")}
                  className="flex items-center justify-end gap-2 w-full hover:text-primary transition-colors"
                >
                  Drop Rate
                  <SortIcon columnKey="drop_rate" />
                </button>
              </th>
              <th className="px-4 py-3 text-right font-semibold text-foreground">
                <button
                  onClick={() => handleSort("success_rate")}
                  className="flex items-center justify-end gap-2 w-full hover:text-primary transition-colors"
                >
                  Success Rate
                  <SortIcon columnKey="success_rate" />
                </button>
              </th>
              {data.some((d) => d.stability !== undefined) && (
                <th className="px-4 py-3 text-right font-semibold text-foreground">
                  <button
                    onClick={() => handleSort("stability")}
                    className="flex items-center justify-end gap-2 w-full hover:text-primary transition-colors"
                  >
                    Stability
                    <SortIcon columnKey="stability" />
                  </button>
                </th>
              )}
              <th className="px-4 py-3 text-center font-semibold text-foreground">
                <button
                  onClick={() => handleSort("status")}
                  className="flex items-center justify-center gap-2 w-full hover:text-primary transition-colors"
                >
                  Status
                  <SortIcon columnKey="status" />
                </button>
              </th>
              {data.some((d) => d.priority) && (
                <th className="px-4 py-3 text-center font-semibold text-foreground">
                  <button
                    onClick={() => handleSort("priority")}
                    className="flex items-center justify-center gap-2 w-full hover:text-primary transition-colors"
                  >
                    Priority
                    <SortIcon columnKey="priority" />
                  </button>
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row, idx) => (
              <tr
                key={idx}
                className="border-b border-border/30 hover:bg-muted/30 transition-colors"
              >
                <td className="px-4 py-3 font-medium text-foreground">{row.name}</td>
                {data.some((d) => d.calls) && (
                  <td className="px-4 py-3 text-right text-muted-foreground">
                    {row.calls.toLocaleString()}
                  </td>
                )}
                {data.some((d) => d.drops !== undefined) && (
                  <td className="px-4 py-3 text-right text-muted-foreground">
                    {row.drops ? row.drops.toLocaleString() : "-"}
                  </td>
                )}
                <td className="px-4 py-3 text-right text-muted-foreground">
                  {row.drop_rate.toFixed(2)}%
                </td>
                <td className="px-4 py-3 text-right font-medium text-foreground">
                  {row.success_rate.toFixed(2)}%
                </td>
                {data.some((d) => d.stability !== undefined) && (
                  <td className="px-4 py-3 text-right text-muted-foreground">
                    {row.stability ? row.stability.toFixed(2) + "%" : "-"}
                  </td>
                )}
                <td className="px-4 py-3 text-center">
                  <span
                    className={cn(
                      "inline-block px-2 py-1 rounded text-xs font-semibold",
                      getStatusBgColor(row.status),
                      getStatusColor(row.status)
                    )}
                  >
                    {row.status}
                  </span>
                </td>
                {data.some((d) => d.priority) && (
                  <td className="px-4 py-3 text-center">
                    {row.priority && (
                      <span className={cn("inline-block px-2 py-1 rounded text-xs font-semibold", getPriorityColor(row.priority))}>
                        {row.priority}
                      </span>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
