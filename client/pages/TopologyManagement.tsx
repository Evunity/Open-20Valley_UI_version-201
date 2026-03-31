import React, { useState, useEffect } from 'react';
import { Map, GitBranch, Network, Box, Layers, ZoomIn, Route, Clock, Eye, EyeOff, Edit2, Activity } from 'lucide-react';
import { RackView } from '../components/RackView';
import { TransportPathView } from '../components/TransportPathView';
import { ImpactAnalysisView } from '../components/ImpactAnalysisView';
import { TimelineReplayView } from '../components/TimelineReplayView';
import { LayerSettings } from '../components/LayerControlPanel';
import { PredictiveRiskHighlight } from '../components/PredictiveRiskHighlight';
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
      <div className="flex flex-1 gap-3 p-3">
        {/* Main map area - Takes available space */}
        <div className="flex-1 min-w-0">
          <GeospatialNetworkMap
            topology={filteredNodes}
            layers={layers}
            selectedObject={selectedNode}
            onObjectSelect={(node) => selectNode(node.id)}
            showPredictiveRisks={showPredictiveRisks}
          />
        </div>

        {/* Right sidebar - Layers & Multi-Tenant Controls - Flexible width */}
        <div className="flex-shrink-0 w-64 space-y-3 overflow-y-auto max-h-[calc(100vh-250px)]">
          {/* Layers Control Panel - Inline */}
          <div className="flex flex-col bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-3">
            <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-3">Layers</h3>

            {/* Filter Layers */}
            <div className="space-y-2">
              <button
                onClick={() => setLayers({ ...layers, ranOnly: !layers.ranOnly, transportOnly: false })}
                className="w-full text-left flex items-center gap-3 p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition group"
              >
                {layers.ranOnly ? (
                  <Eye className="w-4 h-4 text-blue-600" />
                ) : (
                  <EyeOff className="w-4 h-4 text-gray-400" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">RAN Only</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">RAN equipment</p>
                </div>
                <div className={`w-5 h-5 rounded border-2 transition flex-shrink-0 ${
                  layers.ranOnly
                    ? 'bg-blue-600 border-blue-600'
                    : 'border-gray-300 dark:border-gray-600'
                }`} />
              </button>

              <button
                onClick={() => setLayers({ ...layers, transportOnly: !layers.transportOnly, ranOnly: false })}
                className="w-full text-left flex items-center gap-3 p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition group"
              >
                {layers.transportOnly ? (
                  <Eye className="w-4 h-4 text-blue-600" />
                ) : (
                  <EyeOff className="w-4 h-4 text-gray-400" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">Transport Only</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">Transport layer</p>
                </div>
                <div className={`w-5 h-5 rounded border-2 transition flex-shrink-0 ${
                  layers.transportOnly
                    ? 'bg-blue-600 border-blue-600'
                    : 'border-gray-300 dark:border-gray-600'
                }`} />
              </button>

              <button
                onClick={() => setLayers({ ...layers, alarms: !layers.alarms })}
                className="w-full text-left flex items-center gap-3 p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition group"
              >
                {layers.alarms ? (
                  <Eye className="w-4 h-4 text-blue-600" />
                ) : (
                  <EyeOff className="w-4 h-4 text-gray-400" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">Alarms</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">Active alarms</p>
                </div>
                <div className={`w-5 h-5 rounded border-2 transition flex-shrink-0 ${
                  layers.alarms
                    ? 'bg-blue-600 border-blue-600'
                    : 'border-gray-300 dark:border-gray-600'
                }`} />
              </button>
            </div>
          </div>

          {/* Multi-Tenant Control Panel */}
          <MultiTenantAwareness
            topology={filteredNodes}
            selectedCountry={selectedCountry}
            selectedTenant={selectedTenant}
            onCountryChange={setSelectedCountry}
            onTenantChange={setSelectedTenant}
          />

          {/* Export Panel */}
          {showExportPanel && (
            <ExportPanel
              topology={filteredNodes}
              currentView="geospatial-map"
              filters={{ country: selectedCountry, tenant: selectedTenant }}
            />
          )}
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
                className={`flex flex-col items-center justify-center gap-1 px-2 py-1.5 rounded-lg border-2 transition min-h-[60px] flex-1 min-w-[80px] ${
                  activeView === view.id
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-950'
                    : 'border-border hover:border-primary/40 bg-card'
                }`}
                title={view.description}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${activeView === view.id ? 'text-blue-600 dark:text-blue-400' : 'text-muted-foreground'}`} />
                <span className="text-[9px] font-semibold text-center text-foreground line-clamp-1 leading-tight whitespace-nowrap">{view.label}</span>
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
