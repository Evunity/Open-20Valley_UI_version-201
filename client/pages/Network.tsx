import { ChevronRight, ChevronDown, Filter } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface FilterState {
  regions: string[];
  status: string[];
  timeRange: "24h" | "7d" | "30d";
}

export default function Network() {
  const [expandedRegions, setExpandedRegions] = useState<string[]>(["NA"]);
  const [expandedClusters, setExpandedClusters] = useState<string[]>(["NA-1"]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    regions: [],
    status: [],
    timeRange: "24h",
  });

  const toggleRegion = (id: string) => {
    setExpandedRegions((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  const toggleCluster = (id: string) => {
    setExpandedClusters((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const regions = [
    {
      id: "NA",
      name: "North America",
      status: "healthy",
      clusters: [
        {
          id: "NA-1",
          name: "Primary Cluster (NYC)",
          status: "healthy",
          sites: [
            { name: "NYC-01", status: "healthy" },
            { name: "NYC-02", status: "healthy" },
            { name: "NYC-03", status: "healthy" },
          ],
        },
        {
          id: "NA-2",
          name: "Secondary Cluster (SFO)",
          status: "healthy",
          sites: [
            { name: "SFO-01", status: "healthy" },
            { name: "SFO-02", status: "healthy" },
          ],
        },
      ],
    },
    {
      id: "EU",
      name: "Europe",
      status: "degraded",
      clusters: [
        {
          id: "EU-1",
          name: "Primary Cluster (Frankfurt)",
          status: "degraded",
          sites: [
            { name: "FRA-01", status: "healthy" },
            { name: "FRA-02", status: "degraded" },
          ],
        },
      ],
    },
    {
      id: "APAC",
      name: "Asia Pacific",
      status: "healthy",
      clusters: [
        {
          id: "APAC-1",
          name: "Cluster (Singapore)",
          status: "healthy",
          sites: [
            { name: "SNG-01", status: "healthy" },
            { name: "SNG-02", status: "healthy" },
          ],
        },
      ],
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "text-status-healthy";
      case "degraded":
        return "text-status-degraded";
      case "critical":
        return "text-status-critical";
      default:
        return "text-muted-foreground";
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "bg-status-healthy";
      case "degraded":
        return "bg-status-degraded";
      case "critical":
        return "bg-status-critical";
      default:
        return "bg-muted";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Network & Infrastructure</h1>
        <p className="text-muted-foreground">
          Hierarchical view of your infrastructure organized by Region → Cluster → Site
        </p>
      </div>

      {/* Filter Controls */}
      <div className="card-elevated p-4 space-y-4 rounded-xl border border-border/50 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium",
              showFilters
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-muted hover:bg-muted/70"
            )}
          >
            <Filter className="w-4 h-4" />
            <span>
              {filters.regions.length > 0 || filters.status.length > 0 ? `(${filters.regions.length + filters.status.length})` : "Filters"}
            </span>
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="border-t border-border pt-4 grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-2 uppercase tracking-wide">
                Region
              </label>
              <select
                multiple
                className="w-full px-2.5 py-2 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                value={filters.regions}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, (option) => option.value);
                  setFilters((prev) => ({ ...prev, regions: selected }));
                }}
              >
                <option value="NA">North America</option>
                <option value="EU">Europe</option>
                <option value="APAC">Asia Pacific</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-2 uppercase tracking-wide">
                Status
              </label>
              <select
                multiple
                className="w-full px-2.5 py-2 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                value={filters.status}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, (option) => option.value);
                  setFilters((prev) => ({ ...prev, status: selected }));
                }}
              >
                <option value="healthy">Healthy</option>
                <option value="degraded">Degraded</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-2 uppercase tracking-wide">
                Time Range
              </label>
              <select
                className="w-full px-2.5 py-2 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                value={filters.timeRange}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, timeRange: e.target.value as any }))
                }
              >
                <option value="24h">Last 24h</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
              </select>
            </div>
            <div className="md:col-span-3 flex items-end gap-2">
              <button
                onClick={() =>
                  setFilters({
                    regions: [],
                    status: [],
                    timeRange: "24h",
                  })
                }
                className="px-3 py-2 rounded-lg bg-muted hover:bg-muted/70 transition-all duration-200 text-xs font-medium"
              >
                Reset Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Network Hierarchy */}
      <div className="card-elevated p-6">
        <h2 className="font-semibold text-lg mb-4">Infrastructure Hierarchy</h2>
        <div className="space-y-2">
          {regions.map((region) => (
            <div key={region.id}>
              {/* Region */}
              <button
                onClick={() => toggleRegion(region.id)}
                className="w-full flex items-center gap-3 p-3 hover:bg-muted rounded-lg transition-colors text-left"
              >
                {expandedRegions.includes(region.id) ? (
                  <ChevronDown className="w-4 h-4 flex-shrink-0" />
                ) : (
                  <ChevronRight className="w-4 h-4 flex-shrink-0" />
                )}
                <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${getStatusBgColor(region.status)}`}></div>
                <span className="font-medium">{region.name}</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {region.clusters.length} cluster{region.clusters.length !== 1 ? "s" : ""}
                </span>
              </button>

              {/* Clusters */}
              {expandedRegions.includes(region.id) && (
                <div className="ml-6 space-y-2 mt-1">
                  {region.clusters.map((cluster) => (
                    <div key={cluster.id}>
                      <button
                        onClick={() => toggleCluster(cluster.id)}
                        className="w-full flex items-center gap-3 p-3 hover:bg-muted rounded-lg transition-colors text-left"
                      >
                        {expandedClusters.includes(cluster.id) ? (
                          <ChevronDown className="w-4 h-4 flex-shrink-0" />
                        ) : (
                          <ChevronRight className="w-4 h-4 flex-shrink-0" />
                        )}
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${getStatusBgColor(cluster.status)}`}></div>
                        <span className="text-sm">{cluster.name}</span>
                        <span className="ml-auto text-xs text-muted-foreground">
                          {cluster.sites.length} site{cluster.sites.length !== 1 ? "s" : ""}
                        </span>
                      </button>

                      {/* Sites */}
                      {expandedClusters.includes(cluster.id) && (
                        <div className="ml-6 space-y-1 mt-1">
                          {cluster.sites.map((site) => (
                            <div
                              key={site.name}
                              className="flex items-center gap-3 p-2.5 hover:bg-muted rounded-lg transition-colors"
                            >
                              <div className={`w-1.5 h-1.5 rounded-full ${getStatusBgColor(site.status)}`}></div>
                              <span className="text-sm">{site.name}</span>
                              <span className={`ml-auto text-xs font-medium ${getStatusColor(site.status)}`}>
                                {site.status.charAt(0).toUpperCase() + site.status.slice(1)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Network Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card-elevated p-6">
          <p className="text-sm font-medium text-muted-foreground">Total Regions</p>
          <h3 className="text-3xl font-bold mt-2">5</h3>
          <p className="text-xs text-muted-foreground mt-2">Global coverage</p>
        </div>
        <div className="card-elevated p-6">
          <p className="text-sm font-medium text-muted-foreground">Total Clusters</p>
          <h3 className="text-3xl font-bold mt-2">12</h3>
          <p className="text-xs text-muted-foreground mt-2">Distributed systems</p>
        </div>
        <div className="card-elevated p-6">
          <p className="text-sm font-medium text-muted-foreground">Total Sites</p>
          <h3 className="text-3xl font-bold mt-2">47</h3>
          <p className="text-xs text-muted-foreground mt-2">Operational sites</p>
        </div>
        <div className="card-elevated p-6">
          <p className="text-sm font-medium text-muted-foreground">Infrastructure Health</p>
          <h3 className="text-3xl font-bold mt-2 status-healthy">98%</h3>
          <p className="text-xs text-muted-foreground mt-2">Overall uptime</p>
        </div>
      </div>

      {/* Region Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {regions.map((region) => (
          <div key={region.id} className="card-elevated p-6">
            <div className="flex items-start justify-between mb-4">
              <h3 className="font-semibold">{region.name}</h3>
              <div className={`w-3 h-3 rounded-full ${getStatusBgColor(region.status)}`}></div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Clusters</span>
                <span className="font-medium">{region.clusters.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sites</span>
                <span className="font-medium">{region.clusters.reduce((acc, c) => acc + c.sites.length, 0)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-border">
                <span className="text-muted-foreground">Status</span>
                <span className={`font-medium ${getStatusColor(region.status)}`}>
                  {region.status.charAt(0).toUpperCase() + region.status.slice(1)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
