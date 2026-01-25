import { ChevronRight, ChevronDown } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import FilterPanel from "@/components/FilterPanel";
import { useGlobalFilters } from "@/hooks/useGlobalFilters";
import { cn } from "@/lib/utils";

export default function NetworkNew() {
  const { filters } = useGlobalFilters();
  const [expandedRegions, setExpandedRegions] = useState<string[]>(["NA"]);
  const [expandedClusters, setExpandedClusters] = useState<string[]>(["NA-1"]);

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
    <div className="space-y-8 pb-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-sm">
        <Link to="/" className="text-primary hover:text-primary/80 transition-colors font-medium">
          Dashboard
        </Link>
        <span className="text-muted-foreground">/</span>
        <span className="text-muted-foreground">Network Status</span>
      </div>

      {/* Header */}
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-foreground">Network & Infrastructure</h1>
          <p className="text-muted-foreground">
            Hierarchical view of your infrastructure organized by Region → Cluster → Site
          </p>
        </div>
        <FilterPanel showTimeRange={true} />
      </div>

      {/* Network Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card-elevated rounded-xl border border-border/50 p-6">
          <p className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
            Total Regions
          </p>
          <p className="text-3xl font-bold text-foreground mb-2">5</p>
          <p className="text-xs text-muted-foreground">Global coverage</p>
        </div>
        <div className="card-elevated rounded-xl border border-border/50 p-6">
          <p className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
            Total Clusters
          </p>
          <p className="text-3xl font-bold text-foreground mb-2">12</p>
          <p className="text-xs text-muted-foreground">Distributed systems</p>
        </div>
        <div className="card-elevated rounded-xl border border-border/50 p-6">
          <p className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
            Total Sites
          </p>
          <p className="text-3xl font-bold text-foreground mb-2">47</p>
          <p className="text-xs text-muted-foreground">Operational sites</p>
        </div>
        <div className="card-elevated rounded-xl border border-border/50 p-6">
          <p className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
            Infrastructure Health
          </p>
          <p className="text-3xl font-bold text-status-healthy mb-2">98%</p>
          <p className="text-xs text-muted-foreground">Overall uptime</p>
        </div>
      </div>

      {/* Network Hierarchy */}
      <div className="card-elevated rounded-xl border border-border/50 p-6">
        <div className="mb-6 space-y-1">
          <h2 className="text-2xl font-bold text-foreground">Infrastructure Hierarchy</h2>
          <p className="text-sm text-muted-foreground">Click to expand regions and clusters</p>
        </div>
        <div className="space-y-2">
          {regions.map((region) => (
            <div key={region.id}>
              {/* Region */}
              <button
                onClick={() => toggleRegion(region.id)}
                className="w-full flex items-center gap-3 p-3 hover:bg-muted rounded-lg transition-colors text-left"
              >
                {expandedRegions.includes(region.id) ? (
                  <ChevronDown className="w-4 h-4 flex-shrink-0 text-foreground" />
                ) : (
                  <ChevronRight className="w-4 h-4 flex-shrink-0 text-foreground" />
                )}
                <div
                  className={cn(
                    "w-2.5 h-2.5 rounded-full flex-shrink-0",
                    getStatusBgColor(region.status)
                  )}
                ></div>
                <span className="font-semibold text-foreground">{region.name}</span>
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
                          <ChevronDown className="w-4 h-4 flex-shrink-0 text-foreground" />
                        ) : (
                          <ChevronRight className="w-4 h-4 flex-shrink-0 text-foreground" />
                        )}
                        <div
                          className={cn(
                            "w-2 h-2 rounded-full flex-shrink-0",
                            getStatusBgColor(cluster.status)
                          )}
                        ></div>
                        <span className="text-sm font-medium text-foreground">{cluster.name}</span>
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
                              <div
                                className={cn(
                                  "w-1.5 h-1.5 rounded-full",
                                  getStatusBgColor(site.status)
                                )}
                              ></div>
                              <span className="text-sm text-foreground">{site.name}</span>
                              <span
                                className={cn(
                                  "ml-auto text-xs font-medium",
                                  getStatusColor(site.status)
                                )}
                              >
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

      {/* Region Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {regions.map((region) => (
          <div key={region.id} className="card-elevated rounded-xl border border-border/50 p-6">
            <div className="flex items-start justify-between mb-4">
              <h3 className="font-semibold text-foreground">{region.name}</h3>
              <div className={cn("w-3 h-3 rounded-full", getStatusBgColor(region.status))}></div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Clusters</span>
                <span className="font-semibold text-foreground">{region.clusters.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Sites</span>
                <span className="font-semibold text-foreground">
                  {region.clusters.reduce((acc, c) => acc + c.sites.length, 0)}
                </span>
              </div>
              <div className="border-t border-border pt-3 flex justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <span className={cn("font-semibold", getStatusColor(region.status))}>
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
