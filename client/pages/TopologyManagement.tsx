import React, { useState, useEffect } from 'react';
import { Map, GitBranch, Network, Box, Layers, ZoomIn, Route, Clock, Eye, EyeOff, Edit2, Activity, AlertTriangle, TrendingUp } from 'lucide-react';
import { RackView } from '../components/RackView';
import { TransportPathView } from '../components/TransportPathView';
import { ImpactAnalysisView } from '../components/ImpactAnalysisView';
import { TimelineReplayView } from '../components/TimelineReplayView';
import { LayerSettings } from '../components/LayerControlPanel';
import { ExportPanel } from '../components/ExportPanel';
import { MultiTenantAwareness } from '../components/MultiTenantAwareness';
import { GeospatialNetworkMap } from '../components/GeospatialNetworkMap';
import { EditableTreeView } from '../components/EditableTreeView';
import { DependencyGraph } from '../components/DependencyGraph';
import { PortsMetricsView } from '../components/PortsMetricsView';
import { TopologyProvider, useTopology } from '../contexts/TopologyContext';

type ViewType = 'map' | 'tree' | 'dependency' | 'rack' | 'transport' | 'impact' | 'timeline' | 'ports-metrics';

interface TopologyViewConfig {
  id: ViewType;
  label: string;
  icon: React.FC<any>;
  description: string;
}

const VIEWS: TopologyViewConfig[] = [
  { id: 'map', label: 'Geospatial Map', icon: Map, description: 'Global network map with geo coordinates' },
  { id: 'tree', label: 'Tree View', icon: GitBranch, description: 'Hierarchical network structure' },
  { id: 'dependency', label: 'Dependency Graph', icon: Network, description: 'Upstream/downstream relationships' },
  { id: 'rack', label: 'Rack View', icon: Box, description: 'Physical hardware layout with RRU/BBU binding' },
  { id: 'transport', label: 'Transport', icon: Route, description: 'Transport topology patterns and path tracing' },
  { id: 'impact', label: 'Impact Analysis', icon: Layers, description: 'Blast radius and service impact calculation' },
  { id: 'timeline', label: 'Timeline', icon: Clock, description: 'Historical replay and RCA' },
  { id: 'ports-metrics', label: 'Ports & Metrics', icon: Activity, description: 'Port performance and bandwidth metrics' }
];

/**
 * Internal component - uses topology context
 */
const TopologyManagementContent: React.FC = () => {
  const {
    selectedNode,
    selectNode,
    expandedNodes,
    expandNode,
    visibleNodes,
    zoomLevel,
    setZoomLevel,
    stats,
    performance
  } = useTopology();

  const [activeView, setActiveView] = useState<ViewType>('map');
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedTenant, setSelectedTenant] = useState<string | null>(null);
  const [selectedHierarchyLevel, setSelectedHierarchyLevel] = useState<string>('all');
  const [showPredictiveRisks, setShowPredictiveRisks] = useState(true);
  const [showExportPanel, setShowExportPanel] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [layers, setLayers] = useState<LayerSettings>({
    alarms: true,
    kpi: true,
    traffic: true,
    automation: false,
    aiPredictions: true,
    vendorOverlay: true,
    transportOnly: false,
    ranOnly: false
  });

  const hierarchyLevels: Record<string, string[]> = {
    'all': ['global', 'country', 'region', 'cluster', 'site', 'node', 'cell', 'sector', 'rru', 'bbu', 'transport', 'interface', 'port', 'board', 'shelf', 'cabinet', 'rack', 'link'],
    'global': ['global'],
    'country': ['country'],
    'region': ['region'],
    'cluster': ['cluster'],
    'site': ['site'],
    'node': ['node', 'cell', 'sector'],
    'rack': ['rack', 'board', 'shelf', 'cabinet']
  };

  // Helper function to get the country ancestor of a node
  const getCountryAncestor = React.useCallback((node: typeof visibleNodes[0]): string | null => {
    let current = node;
    while (current) {
      if (current.type === 'country') {
        return current.name;
      }
      if (!current.parentId) break;
      current = visibleNodes.find(n => n.id === current.parentId) || null;
      if (!current) break;
    }
    return null;
  }, [visibleNodes]);

  // Apply layer and tenant filters to topology
  const filteredNodes = React.useMemo(() => {
    let filtered = [...visibleNodes];

    // Apply hierarchy level filter FIRST
    if (selectedHierarchyLevel !== 'all') {
      const allowedTypes = hierarchyLevels[selectedHierarchyLevel] || hierarchyLevels['all'];
      filtered = filtered.filter(node => allowedTypes.includes(node.type));
    }

    // Apply country/tenant filter (but keep parent nodes visible)
    if (selectedCountry) {
      filtered = filtered.filter(node => {
        // Keep global, country, and region nodes always visible
        if (['global', 'country', 'region'].includes(node.type)) {
          // Only filter country nodes if they don't match
          if (node.type === 'country' && node.name !== selectedCountry) {
            return false;
          }
          return true;
        }
        // For other nodes, check if they belong to the selected country
        const nodeCountry = getCountryAncestor(node);
        return nodeCountry === selectedCountry;
      });
    }

    // Apply layer filters - these are visibility toggles
    // RAN equipment: cell, sector, site, ran, rru, bbu, cluster, region
    // Transport equipment: transport, interface, port, board, shelf, cabinet, rack
    const RAN_TYPES = ['cell', 'sector', 'site', 'ran', 'rru', 'bbu', 'cluster', 'region'];
    const TRANSPORT_TYPES = ['transport', 'interface', 'port', 'board', 'shelf', 'cabinet', 'rack', 'link'];

    if (layers.ranOnly && layers.transportOnly) {
      // Show both RAN and transport
      filtered = filtered.filter(node =>
        RAN_TYPES.includes(node.type) || TRANSPORT_TYPES.includes(node.type)
      );
    } else if (layers.ranOnly) {
      // Show only RAN equipment
      filtered = filtered.filter(node => RAN_TYPES.includes(node.type));
    } else if (layers.transportOnly) {
      // Show only transport equipment
      filtered = filtered.filter(node => TRANSPORT_TYPES.includes(node.type));
    }
    // else: show all (with country filter applied above)

    return filtered;
  }, [visibleNodes, selectedCountry, selectedHierarchyLevel, layers, getCountryAncestor, hierarchyLevels]);

  const predictiveInsights = React.useMemo(() => {
    return filteredNodes
      .filter((node) => node.type === 'cluster' || node.type === 'site')
      .map((node) => {
        const alarmPressure = node.alarmSummary.critical * 20 + node.alarmSummary.major * 10;
        const utilizationPressure = node.kpiSummary.utilization > 75 ? node.kpiSummary.utilization - 70 : 0;
        const latencyPressure = node.kpiSummary.latency > 25 ? node.kpiSummary.latency - 20 : 0;
        const riskScore = Math.min(99, Math.round(alarmPressure + utilizationPressure + latencyPressure));
        const riskLevel = riskScore >= 75 ? 'High' : riskScore >= 45 ? 'Medium' : 'Low';
        return {
          id: node.id,
          name: node.name,
          type: node.type,
          riskScore,
          riskLevel,
          utilization: node.kpiSummary.utilization,
          latency: node.kpiSummary.latency,
          timeframe: riskLevel === 'High' ? '15-30 min' : riskLevel === 'Medium' ? '30-60 min' : '1-2 hr',
          recommendation:
            riskLevel === 'High'
              ? 'Run proactive load-shift and trigger anomaly diagnostics.'
              : riskLevel === 'Medium'
                ? 'Monitor counters and pre-stage mitigation workflow.'
                : 'Keep under observation with baseline checks.',
        };
      })
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 5);
  }, [filteredNodes]);


  const renderMapView = () => (
    <div className="w-full h-full flex flex-col bg-background dark:bg-background overflow-y-auto">
      {/* Filter Status Indicators with Controls */}
      {(selectedCountry || selectedHierarchyLevel !== 'all' || layers.ranOnly || layers.transportOnly || layers.alarms || filteredNodes.length < visibleNodes.length || activeView === 'map') && (
        <div className="flex gap-2 px-4 py-2 flex-wrap items-center justify-between">
          <div className="flex gap-2 flex-wrap items-center">
            {selectedHierarchyLevel !== 'all' && (
              <span className="text-xs px-2 py-1 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded font-semibold">
                📊 Level: {selectedHierarchyLevel.charAt(0).toUpperCase() + selectedHierarchyLevel.slice(1)}
              </span>
            )}
            {selectedCountry && (
              <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded font-semibold">
                🌍 Country: {selectedCountry}
              </span>
            )}
            {layers.ranOnly && (
              <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 rounded font-semibold">
                📡 RAN Only
              </span>
            )}
            {layers.transportOnly && (
              <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 rounded font-semibold">
                🔗 Transport Only
              </span>
            )}
            {layers.alarms && (
              <span className="text-xs px-2 py-1 bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 rounded font-semibold">
                🚨 Alarms Layer
              </span>
            )}
            {filteredNodes.length < visibleNodes.length && (
              <span className="text-xs px-2 py-1 bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 rounded font-semibold">
                ✓ Filtered: {filteredNodes.length} of {visibleNodes.length} nodes
              </span>
            )}
          </div>

          {/* Controls on the same row */}
          <div className="flex gap-2 items-center">
            <select
              value={selectedHierarchyLevel}
              onChange={(e) => setSelectedHierarchyLevel(e.target.value)}
              className="h-9 px-3 rounded text-xs font-semibold bg-input text-foreground border border-border hover:border-primary/40 transition cursor-pointer"
              title="Filter by hierarchy level"
            >
              <option value="all">All Levels</option>
              <option value="global">Global</option>
              <option value="country">Country</option>
              <option value="region">Region</option>
              <option value="cluster">Cluster</option>
              <option value="site">Site</option>
              <option value="node">Node</option>
              <option value="rack">Rack</option>
            </select>

            {activeView === 'map' && (
              <>
                <button
                  onClick={() => setShowExportPanel(!showExportPanel)}
                  className={`px-3 py-1.5 h-9 flex items-center justify-center rounded text-xs font-semibold transition ${
                    showExportPanel
                      ? 'bg-blue-600 text-white dark:bg-blue-700'
                      : 'bg-input text-foreground border border-border hover:border-primary/40'
                  }`}
                  title="Export options"
                >
                  Export
                </button>
                <label className="flex items-center gap-2 h-9 text-xs cursor-pointer px-3 bg-input border border-border rounded hover:border-primary/40 transition">
                  <input
                    type="checkbox"
                    checked={showPredictiveRisks}
                    onChange={(e) => setShowPredictiveRisks(e.target.checked)}
                    className="w-4 h-4 rounded flex-shrink-0"
                  />
                  <span className="whitespace-nowrap">Predictive AI</span>
                </label>
              </>
            )}
          </div>
        </div>
      )}

      {/* Main content grid - Map fills width with responsive sidebar */}
      <div className="grid flex-1 gap-3 p-3 min-h-0 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-stretch">
        {/* Main map area - Takes available space */}
        <div className="flex-1 min-w-0 min-h-0 h-full">
          <GeospatialNetworkMap
            topology={filteredNodes}
            layers={layers}
            selectedObject={selectedNode}
            onObjectSelect={(node) => selectNode(node.id)}
            showPredictiveRisks={showPredictiveRisks}
          />
        </div>

        {/* Right sidebar - Layers & Multi-Tenant Controls - Flexible width */}
        <div className="min-h-0 h-full">
          <div className="h-full min-h-0 rounded-lg border border-border bg-card flex flex-col overflow-hidden shadow-sm">
            <div className="px-3 py-2 border-b border-border/60 bg-muted/30">
              <h3 className="font-semibold text-sm text-foreground">Geospatial Controls</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Layers, tenant awareness, and export actions</p>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-3">
              {/* Layers Control Panel - Inline */}
              <div className="flex flex-col rounded-lg border border-border/70 bg-background p-3">
                <h4 className="font-semibold text-sm text-foreground mb-3">Layers</h4>

                {/* Filter Layers */}
                <div className="space-y-2">
                  <button
                    onClick={() => setLayers({ ...layers, ranOnly: !layers.ranOnly, transportOnly: false })}
                    className="w-full text-left flex items-center gap-3 p-2 rounded hover:bg-muted/60 transition group"
                  >
                    {layers.ranOnly ? (
                      <Eye className="w-4 h-4 text-blue-600" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-muted-foreground" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">RAN Only</p>
                      <p className="text-xs text-muted-foreground truncate">RAN equipment</p>
                    </div>
                    <div className={`w-5 h-5 rounded border-2 transition flex-shrink-0 ${
                      layers.ranOnly
                        ? 'bg-blue-600 border-blue-600'
                        : 'border-border'
                    }`} />
                  </button>

                  <button
                    onClick={() => setLayers({ ...layers, transportOnly: !layers.transportOnly, ranOnly: false })}
                    className="w-full text-left flex items-center gap-3 p-2 rounded hover:bg-muted/60 transition group"
                  >
                    {layers.transportOnly ? (
                      <Eye className="w-4 h-4 text-blue-600" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-muted-foreground" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">Transport Only</p>
                      <p className="text-xs text-muted-foreground truncate">Transport layer</p>
                    </div>
                    <div className={`w-5 h-5 rounded border-2 transition flex-shrink-0 ${
                      layers.transportOnly
                        ? 'bg-blue-600 border-blue-600'
                        : 'border-border'
                    }`} />
                  </button>

                  <button
                    onClick={() => setLayers({ ...layers, alarms: !layers.alarms })}
                    className="w-full text-left flex items-center gap-3 p-2 rounded hover:bg-muted/60 transition group"
                  >
                    {layers.alarms ? (
                      <Eye className="w-4 h-4 text-blue-600" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-muted-foreground" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">Alarms</p>
                      <p className="text-xs text-muted-foreground truncate">Active alarms</p>
                    </div>
                    <div className={`w-5 h-5 rounded border-2 transition flex-shrink-0 ${
                      layers.alarms
                        ? 'bg-blue-600 border-blue-600'
                        : 'border-border'
                    }`} />
                  </button>
                </div>
              </div>

              {/* Multi-Tenant Control Panel */}
              <div className="rounded-lg border border-border/70 bg-background p-3">
                <h4 className="font-semibold text-sm text-foreground mb-3">Country & Tenant Scope</h4>
                <MultiTenantAwareness
                  topology={filteredNodes}
                  selectedCountry={selectedCountry}
                  selectedTenant={selectedTenant}
                  onCountryChange={setSelectedCountry}
                  onTenantChange={setSelectedTenant}
                />
              </div>

              {/* Predictive Insights Panel */}
              <div className="rounded-lg border border-border/70 bg-background p-3">
                <h4 className="font-semibold text-sm text-foreground mb-3">Predictive Insights</h4>
                {showPredictiveRisks ? (
                  <div className="space-y-2.5">
                    {predictiveInsights.length > 0 ? predictiveInsights.map((risk) => (
                      <div
                        key={risk.id}
                        className="rounded-lg border border-border/70 bg-card p-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate">{risk.name}</p>
                            <p className="text-xs text-muted-foreground mt-0.5 capitalize">{risk.type} • ETA {risk.timeframe}</p>
                          </div>
                          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${
                            risk.riskLevel === 'High'
                              ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                              : risk.riskLevel === 'Medium'
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300'
                          }`}>
                            {risk.riskLevel}
                          </span>
                        </div>

                        <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] text-muted-foreground">
                          <div className="rounded-md bg-muted/40 p-2">
                            <p className="text-[10px] uppercase tracking-wide">Risk Score</p>
                            <p className="text-sm font-bold text-foreground">{risk.riskScore}%</p>
                          </div>
                          <div className="rounded-md bg-muted/40 p-2">
                            <p className="text-[10px] uppercase tracking-wide">Util/Latency</p>
                            <p className="text-sm font-bold text-foreground">{risk.utilization.toFixed(0)}% / {risk.latency.toFixed(0)}ms</p>
                          </div>
                        </div>

                        <div className="mt-2 flex items-start gap-1.5 text-xs text-muted-foreground">
                          <TrendingUp className="w-3.5 h-3.5 mt-0.5 text-primary flex-shrink-0" />
                          <p>{risk.recommendation}</p>
                        </div>
                      </div>
                    )) : (
                      <div className="rounded-lg border border-dashed border-border p-3 text-xs text-muted-foreground">
                        No high-confidence predictive hotspots in the current filtered scope.
                      </div>
                    )}
                    <div className="rounded-md bg-muted/40 px-2.5 py-2 text-[11px] text-muted-foreground flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                      Predictions refresh with current filters and active map scope.
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Enable <span className="font-semibold text-foreground">Predictive AI</span> to view projected risks and hotspot insights.
                  </p>
                )}
              </div>

              {/* Export Panel */}
              {showExportPanel && (
                <div className="rounded-lg border border-border/70 bg-background p-3">
                  <h4 className="font-semibold text-sm text-foreground mb-3">Export</h4>
                  <ExportPanel
                    topology={filteredNodes}
                    currentView="geospatial-map"
                    filters={{ country: selectedCountry, tenant: selectedTenant }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTreeView = () => (
    <EditableTreeView
      topology={filteredNodes}
      editMode={editMode}
      onEditModeChange={setEditMode}
      onTopologyChange={(updatedTopology) => {
        // Handle topology changes if needed
        console.log('Topology updated:', updatedTopology);
      }}
    />
  );

  const renderDependencyView = () => (
    <DependencyGraph
      topology={filteredNodes}
      selectedNode={selectedNode}
      onNodeSelect={(node) => selectNode(node.id)}
    />
  );

  const renderRackView = () => <RackView topology={filteredNodes} onDeviceSelect={(device) => console.log(device)} />;

  const renderTransportView = () => <TransportPathView onPathSelect={(path) => console.log(path)} />;

  const renderImpactView = () => <ImpactAnalysisView onImpactSelect={(object) => console.log(object)} />;

  const renderTimelineView = () => <TimelineReplayView onEventSelect={(event) => console.log(event)} />;

  const renderPortsMetricsView = () => <PortsMetricsView topology={filteredNodes} />;

  const currentView = activeView === 'map' ? renderMapView() :
                      activeView === 'tree' ? renderTreeView() :
                      activeView === 'dependency' ? renderDependencyView() :
                      activeView === 'rack' ? renderRackView() :
                      activeView === 'transport' ? renderTransportView() :
                      activeView === 'impact' ? renderImpactView() :
                      activeView === 'timeline' ? renderTimelineView() :
                      activeView === 'ports-metrics' ? renderPortsMetricsView() :
                      renderMapView();

  return (
    <div className="topology-theme flex flex-col h-screen bg-background">
      {/* Toolbar with View Selector and Controls */}
      <div className="bg-card border-b border-border p-3 flex flex-col gap-2">
        {/* View Selector Grid */}
        <div className="flex gap-1.5 flex-wrap">
          {VIEWS.map(view => {
            const Icon = view.icon;
            return (
              <button
                key={view.id}
                onClick={() => setActiveView(view.id)}
                className={`flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 transition min-h-[180px] flex-1 min-w-[100px] ${
                  activeView === view.id
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-950'
                    : 'border-border hover:border-primary/40 bg-card'
                }`}
                title={view.description}
              >
                <Icon className={`w-6 h-6 flex-shrink-0 ${activeView === view.id ? 'text-blue-600 dark:text-blue-400' : 'text-muted-foreground'}`} />
                <span className="text-xs font-semibold text-center text-foreground line-clamp-2 leading-tight">{view.label}</span>
              </button>
            );
          })}
        </div>

        {/* Edit Mode Control (for Tree View only) */}
        {activeView === 'tree' && (
          <div className="flex gap-2 items-center justify-end">
            <button
              onClick={() => setEditMode(!editMode)}
              className={`px-3 py-1.5 h-9 flex items-center justify-center gap-2 rounded text-xs font-semibold transition ${
                editMode
                  ? 'bg-blue-600 text-white dark:bg-blue-700'
                  : 'bg-input text-foreground border border-border hover:border-primary/40'
              }`}
              title="Toggle edit mode"
            >
              {editMode ? <Edit2 className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              <span className="whitespace-nowrap">{editMode ? 'Edit Mode' : 'View Mode'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto">
        {currentView}
      </div>

      {/* Footer Info & Stats */}
      <div className="bg-card border-t border-border px-6 py-2">
        <div className="flex items-center justify-between text-xs">
          {selectedNode ? (
            <>
              <div>
                <span className="font-semibold text-foreground">{selectedNode.name}</span>
                <span className="text-muted-foreground ml-2">({selectedNode.type})</span>
                {selectedNode.vendor && <span className="text-muted-foreground ml-2">• {selectedNode.vendor}</span>}
              </div>
              <div className="flex gap-4">
                <span>Health: <strong>{selectedNode.healthState}</strong></span>
                <span>Alarms: <strong>{selectedNode.alarmSummary.critical}C/{selectedNode.alarmSummary.major}M</strong></span>
                <span>Availability: <strong>{selectedNode.kpiSummary.availability.toFixed(2)}%</strong></span>
              </div>
            </>
          ) : (
            <div className="w-full flex items-center justify-between">
              <p className="text-muted-foreground">Visible: <strong>{filteredNodes.length}</strong> | Alarms: <strong>{filteredNodes.reduce((sum, n) => sum + n.alarmSummary.critical + n.alarmSummary.major, 0)}</strong></p>
              <div className="text-xs text-gray-500 dark:text-gray-500">
                {performance.lastRegionLoadTime < 2000 && performance.lastZoomTime < 300 && performance.lastExpandTime < 200 ? (
                  <span className="text-green-600">✓ Performance optimal</span>
                ) : (
                  <span className="text-orange-600">⚠ Monitor performance</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Main export - wraps content with Topology Provider for graph-driven architecture
 */
export const TopologyManagement: React.FC = () => {
  return (
    <TopologyProvider>
      <TopologyManagementContent />
    </TopologyProvider>
  );
};
