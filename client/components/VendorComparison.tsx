import { useState, useMemo } from "react";
import { ChevronUp, ChevronDown, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { describeMixedTechnologies, getTechnologyLabel } from "@/utils/technologyLabels";

interface VendorMetrics {
  name: string;
  successRate: number;
  dropRate: number;
  stability: number;
  volume: number;
  status: "healthy" | "degraded" | "critical";
  rank?: number;
}

interface VendorComparisonProps {
  vendors: VendorMetrics[];
  title?: string;
  showRanking?: boolean;
  selectedTechnologies?: string[];
  selectedRegions?: string[];
  isMixedEnvironment?: boolean;
}

export default function VendorComparison({
  vendors,
  title = "Vendor Comparison",
  showRanking = true,
  selectedTechnologies = [],
  selectedRegions = [],
  isMixedEnvironment = false,
}: VendorComparisonProps) {
  const [sortKey, setSortKey] = useState<string>("successRate");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Rank vendors by success rate
  const rankedVendors = useMemo(() => {
    const sorted = [...vendors].sort((a, b) => {
      const aVal = a[sortKey as keyof VendorMetrics];
      const bVal = b[sortKey as keyof VendorMetrics];

      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
      }
      return 0;
    });

    return sorted.map((v, idx) => ({
      ...v,
      rank: idx + 1,
    }));
  }, [vendors, sortKey, sortDirection]);

  const topPerformer = rankedVendors[0];
  const performanceGap =
    Math.max(...vendors.map((v) => v.successRate)) -
    Math.min(...vendors.map((v) => v.successRate));
  const avgSuccessRate =
    vendors.reduce((sum, v) => sum + v.successRate, 0) / vendors.length;

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("desc");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "text-green-600";
      case "degraded":
        return "text-yellow-600";
      case "critical":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "bg-green-50";
      case "degraded":
        return "bg-yellow-50";
      case "critical":
        return "bg-red-50";
      default:
        return "bg-gray-50";
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

  return (
    <div className="space-y-6">
      <div className="card-elevated rounded-xl border border-border/50 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">{title}</h2>
            {(selectedTechnologies.length > 0 || selectedRegions.length > 0) && (
              <p className="text-sm text-muted-foreground mt-2">
                {isMixedEnvironment ? (
                  <>
                    <span className="font-semibold">Mixed Environment:</span>{" "}
                    {selectedTechnologies.length > 0 && (
                      <>
                        Technologies: {describeMixedTechnologies(selectedTechnologies)}
                        {selectedRegions.length > 0 && " | "}
                      </>
                    )}
                    {selectedRegions.length > 0 && `Regions: ${selectedRegions.join(", ")}`}
                  </>
                ) : (
                  <>
                    {selectedTechnologies.length > 0 && (
                      <>
                        <span className="font-semibold">Technology:</span>{" "}
                        {describeMixedTechnologies(selectedTechnologies)}
                        {selectedRegions.length > 0 && " | "}
                      </>
                    )}
                    {selectedRegions.length > 0 && (
                      <>
                        <span className="font-semibold">Regions:</span>{" "}
                        {selectedRegions.join(", ")}
                      </>
                    )}
                  </>
                )}
              </p>
            )}
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary font-medium">
            {vendors.length} vendor{vendors.length !== 1 ? "s" : ""} compared
          </span>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-sm">
            <thead className="border-b border-border">
              <tr className="text-muted-foreground font-semibold">
                {showRanking && (
                  <th className="text-left py-3 px-4 w-12">Rank</th>
                )}
                <th className="text-left py-3 px-4">
                  <button
                    onClick={() => handleSort("name")}
                    className="flex items-center gap-2 hover:text-primary transition-colors"
                  >
                    Vendor
                    <SortIcon columnKey="name" />
                  </button>
                </th>
                <th className="text-right py-3 px-4">
                  <button
                    onClick={() => handleSort("successRate")}
                    className="flex items-center justify-end gap-2 w-full hover:text-primary transition-colors"
                  >
                    Success Rate
                    <SortIcon columnKey="successRate" />
                  </button>
                </th>
                <th className="text-right py-3 px-4">
                  <button
                    onClick={() => handleSort("dropRate")}
                    className="flex items-center justify-end gap-2 w-full hover:text-primary transition-colors"
                  >
                    Drop Rate
                    <SortIcon columnKey="dropRate" />
                  </button>
                </th>
                <th className="text-right py-3 px-4">
                  <button
                    onClick={() => handleSort("stability")}
                    className="flex items-center justify-end gap-2 w-full hover:text-primary transition-colors"
                  >
                    Stability
                    <SortIcon columnKey="stability" />
                  </button>
                </th>
                <th className="text-right py-3 px-4">
                  <button
                    onClick={() => handleSort("volume")}
                    className="flex items-center justify-end gap-2 w-full hover:text-primary transition-colors"
                  >
                    Volume
                    <SortIcon columnKey="volume" />
                  </button>
                </th>
                <th className="text-center py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {rankedVendors.map((vendor, idx) => (
                <tr
                  key={vendor.name}
                  className={cn(
                    "border-b border-border/50 hover:bg-muted/50 transition-colors",
                    getStatusBgColor(vendor.status)
                  )}
                >
                  {showRanking && (
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                        {vendor.rank}
                      </div>
                    </td>
                  )}
                  <td className="py-3 px-4 font-medium text-foreground">
                    {vendor.name}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="font-semibold text-foreground">
                      {vendor.successRate.toFixed(2)}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right text-muted-foreground">
                    {vendor.dropRate.toFixed(2)}%
                  </td>
                  <td className="py-3 px-4 text-right text-muted-foreground">
                    {vendor.stability.toFixed(2)}%
                  </td>
                  <td className="py-3 px-4 text-right text-muted-foreground">
                    {vendor.volume.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={cn(
                        "inline-block px-2 py-1 rounded text-xs font-semibold capitalize",
                        vendor.status === "healthy"
                          ? "bg-green-100 text-green-700"
                          : vendor.status === "degraded"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                      )}
                    >
                      {vendor.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Comparison Metrics Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-border/50">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="text-sm text-muted-foreground mb-2">Top Performer</p>
            <p className="text-2xl font-bold text-green-700">{topPerformer?.name}</p>
            <p className="text-xs text-muted-foreground mt-2">
              {topPerformer?.successRate.toFixed(2)}% success rate
            </p>
          </div>
          <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
            <p className="text-sm text-muted-foreground mb-2">
              Average Success Rate
            </p>
            <p className="text-2xl font-bold text-blue-700">
              {avgSuccessRate.toFixed(2)}%
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Across all vendors
            </p>
          </div>
          <div
            className={cn(
              "p-4 rounded-lg",
              performanceGap > 3
                ? "bg-orange-50 border border-orange-200"
                : "bg-green-50 border border-green-200"
            )}
          >
            <p className="text-sm text-muted-foreground mb-2">Performance Gap</p>
            <p
              className={cn(
                "text-2xl font-bold",
                performanceGap > 3 ? "text-orange-700" : "text-green-700"
              )}
            >
              {performanceGap.toFixed(2)}%
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              {performanceGap > 3
                ? "Significant variation detected"
                : "Good consistency"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
