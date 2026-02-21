import { useMemo, useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface ContributionData {
  name: string;
  volume: number;
  percentage: number;
}

interface ContributionTableProps {
  data: Array<{
    name: string;
    count: number;
  }>;
  title: string;
  dimension: "Vendor" | "Technology";
}

export default function ContributionTable({
  data,
  title,
  dimension,
}: ContributionTableProps) {
  const [sortKey, setSortKey] = useState<"name" | "volume" | "percentage">("volume");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const tableData: ContributionData[] = useMemo(() => {
    const total = data.reduce((sum, item) => sum + item.count, 0);
    return data.map((item) => ({
      name: item.name,
      volume: item.count,
      percentage: total > 0 ? (item.count / total) * 100 : 0,
    }));
  }, [data]);

  const getSortedData = () => {
    const sorted = [...tableData].sort((a, b) => {
      let aValue: number = 0;
      let bValue: number = 0;

      if (sortKey === "name") {
        return sortDirection === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else if (sortKey === "volume") {
        aValue = a.volume;
        bValue = b.volume;
      } else {
        aValue = a.percentage;
        bValue = b.percentage;
      }

      return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
    });

    return sorted;
  };

  const handleSort = (key: "name" | "volume" | "percentage") => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("desc");
    }
  };

  const SortIcon = ({ columnKey }: { columnKey: string }) => {
    if (sortKey !== columnKey) return <div className="w-4 h-4" />;
    return sortDirection === "asc" ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    );
  };

  const sortedData = getSortedData();

  return (
    <div className="card-elevated rounded-xl border border-border/50 p-6">
      <h3 className="text-lg font-bold text-foreground mb-4">{title}</h3>
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
              <th className="px-2 md:px-4 py-2 text-right font-semibold text-foreground">
                <button
                  onClick={() => handleSort("volume")}
                  className="flex items-center justify-end gap-2 w-full hover:text-primary transition-colors"
                >
                  Call Volume
                  <SortIcon columnKey="volume" />
                </button>
              </th>
              <th className="px-2 md:px-4 py-2 text-right font-semibold text-foreground">
                <button
                  onClick={() => handleSort("percentage")}
                  className="flex items-center justify-end gap-2 w-full hover:text-primary transition-colors"
                >
                  % Contribution
                  <SortIcon columnKey="percentage" />
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row, idx) => (
              <tr
                key={idx}
                className="border-b border-border/30 hover:bg-muted/30 transition-colors"
              >
                <td className="px-2 md:px-4 py-3 font-medium text-foreground text-left">
                  {row.name}
                </td>
                <td className="px-2 md:px-4 py-3 text-right text-foreground font-medium tabular-nums">
                  {row.volume.toLocaleString()}
                </td>
                <td className="px-2 md:px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-12 bg-muted rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary/60 to-primary rounded-full transition-all"
                        style={{ width: `${Math.min(100, row.percentage)}%` }}
                      />
                    </div>
                    <span className="font-medium tabular-nums min-w-12 text-right">
                      {row.percentage.toFixed(1)}%
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
