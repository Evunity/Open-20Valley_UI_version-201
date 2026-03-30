import React, { useState, useEffect } from 'react';
import { Map, GitBranch, Network, Box, Layers, ZoomIn, Route, Clock } from 'lucide-react';
import { RackView } from '../components/RackView';
import { TransportPathView } from '../components/TransportPathView';
import { ImpactAnalysisView } from '../components/ImpactAnalysisView';
import { TimelineReplayView } from '../components/TimelineReplayView';
import { LayerControlPanel, LayerSettings } from '../components/LayerControlPanel';
import { PredictiveRiskHighlight } from '../components/PredictiveRiskHighlight';
import { ExportPanel } from '../components/ExportPanel';
import { MultiTenantAwareness } from '../components/MultiTenantAwareness';
import { GeospatialNetworkMap } from '../components/GeospatialNetworkMap';
import { EditableTreeView } from '../components/EditableTreeView';
import { TopologyProvider, useTopology } from '../contexts/TopologyContext';

type ViewType = 'map' | 'tree' | 'dependency' | 'rack' | 'transport' | 'impact' | 'timeline';

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
  { id: 'timeline', label: 'Timeline', icon: Clock, description: 'Historical replay and RCA' }
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
  const [showPredictiveRisks, setShowPredictiveRisks] = useState(true);
  const [showLayerPanel, setShowLayerPanel] = useState(true);
  const [showExportPanel, setShowExportPanel] = useState(false);
  const [showTenantPanel, setShowTenantPanel] = useState(false);
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

    // Apply country/tenant filter FIRST
    if (selectedCountry) {
      filtered = filtered.filter(node => {
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
  }, [visibleNodes, selectedCountry, layers, getCountryAncestor]);


  const renderMapView = () => (
    <div className="w-full h-full flex flex-col gap-4 p-4 bg-background dark:bg-background overflow-y-auto">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-lg font-bold text-foreground">Global Geospatial Map - MENA Network</h2>
          <div className="flex gap-2 mt-1">
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
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowLayerPanel(!showLayerPanel)}
            className={`px-3 py-1 rounded text-xs font-semibold transition ${
              showLayerPanel
                ? 'bg-blue-600 text-white dark:bg-blue-700'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
            title="Toggle layer controls"
          >
            <Layers className="w-3 h-3 inline mr-1" />
            Layers
          </button>
          <button
            onClick={() => setShowTenantPanel(!showTenantPanel)}
            className={`px-3 py-1 rounded text-xs font-semibold transition ${
              showTenantPanel
                ? 'bg-blue-600 text-white dark:bg-blue-700'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
            title="Toggle tenant/country controls"
          >
            Multi-Tenant
          </button>
          <button
            onClick={() => setShowExportPanel(!showExportPanel)}
            className={`px-3 py-1 rounded text-xs font-semibold transition ${
              showExportPanel
                ? 'bg-blue-600 text-white dark:bg-blue-700'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
            title="Export options"
          >
            Export
          </button>
          <label className="flex items-center gap-2 text-xs cursor-pointer px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition">
            <input
              type="checkbox"
              checked={showPredictiveRisks}
              onChange={(e) => setShowPredictiveRisks(e.target.checked)}
              className="w-4 h-4 rounded"
            />
            <span>Predictive AI</span>
          </label>
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-4 gap-4 flex-1">
        {/* Left sidebar - Controls */}
        <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-250px)]">
          {showLayerPanel && (
            <LayerControlPanel layers={layers} onLayerChange={setLayers} />
          )}

          {showTenantPanel && (
            <MultiTenantAwareness
              topology={filteredNodes}
              selectedCountry={selectedCountry}
              selectedTenant={selectedTenant}
              onCountryChange={setSelectedCountry}
              onTenantChange={setSelectedTenant}
            />
          )}

          {showExportPanel && (
            <ExportPanel
              topology={filteredNodes}
              currentView="geospatial-map"
              filters={{ country: selectedCountry, tenant: selectedTenant }}
            />
          )}
        </div>

        {/* Main map area */}
        <div className="col-span-3">
          <GeospatialNetworkMap
            topology={filteredNodes}
            layers={layers}
            selectedObject={selectedNode}
            onObjectSelect={(node) => selectNode(node.id)}
            showPredictiveRisks={showPredictiveRisks}
          />
        </div>
      </div>

      {/* Predictive Risk Panel */}
      {showPredictiveRisks && (
        <div className="max-h-60 overflow-y-auto">
          <PredictiveRiskHighlight topology={filteredNodes} isEnabled={showPredictiveRisks} />
        </div>
      )}
    </div>
  );

  const renderTreeView = () => (
    <EditableTreeView
      topology={filteredNodes}
      onTopologyChange={(updatedTopology) => {
        // Handle topology changes if needed
        console.log('Topology updated:', updatedTopology);
      }}
    />
  );

  const renderDependencyView = () => (
    <div className="w-full h-full flex flex-col gap-4 p-4 bg-background dark:bg-background overflow-y-auto">
      <h2 className="text-lg font-bold text-foreground">Logical Dependency Graph</h2>
      <div className="flex-1 bg-card rounded-lg border border-border p-4 flex items-center justify-center">
        <div className="text-center max-w-md">
          <Network className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-3 opacity-50" />
          <p className="text-sm font-semibold text-muted-foreground mb-2">Dependency Relationships</p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mb-4">
            Visualizes upstream/downstream dependencies. Click a node to see its impact chain.
          </p>
          {selectedNode && (
            <div className="text-left bg-gray-50 dark:bg-gray-800 rounded p-3 mt-4">
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Selected: {selectedNode.name}</p>
              <p className="text-xs text-muted-foreground">
                {selectedNode.childrenIds.length} downstream dependencies
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderRackView = () => <RackView onDeviceSelect={(device) => console.log(device)} />;

  const renderTransportView = () => <TransportPathView onPathSelect={(path) => console.log(path)} />;

  const renderImpactView = () => <ImpactAnalysisView onImpactSelect={(object) => console.log(object)} />;

  const renderTimelineView = () => <TimelineReplayView onEventSelect={(event) => console.log(event)} />;

  const currentView = activeView === 'map' ? renderMapView() :
                      activeView === 'tree' ? renderTreeView() :
                      activeView === 'dependency' ? renderDependencyView() :
                      activeView === 'rack' ? renderRackView() :
                      activeView === 'transport' ? renderTransportView() :
                      activeView === 'impact' ? renderImpactView() :
                      activeView === 'timeline' ? renderTimelineView() :
                      renderMapView();

  return (
    <div className="topology-theme flex flex-col h-screen bg-background">
      {/* View Selector */}
      <div className="bg-card border-b border-border px-6 py-3">
        <div className="flex gap-2">
          {VIEWS.map(view => {
            const Icon = view.icon;
            return (
              <button
                key={view.id}
                onClick={() => setActiveView(view.id)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2 ${
                  activeView === view.id
                    ? 'bg-blue-600 text-white dark:bg-blue-700'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
                title={view.description}
              >
                <Icon className="w-4 h-4" />
                {view.label}
              </button>
            );
          })}
        </div>
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
