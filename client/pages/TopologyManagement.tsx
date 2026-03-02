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
import { EnhancedGeospatialMap } from '../components/EnhancedGeospatialMap';
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
  const [showLayerPanel, setShowLayerPanel] = useState(false);
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

  const toggleNode = (id: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedNodes(newExpanded);
  };

  const renderMapView = () => (
    <div className="w-full h-full flex flex-col gap-4 p-4 bg-background dark:bg-background overflow-y-auto">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-bold text-foreground">Global Geospatial Map - MENA Network</h2>
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
              topology={visibleNodes}
              selectedCountry={selectedCountry}
              selectedTenant={selectedTenant}
              onCountryChange={setSelectedCountry}
              onTenantChange={setSelectedTenant}
            />
          )}

          {showExportPanel && (
            <ExportPanel
              topology={visibleNodes}
              currentView="geospatial-map"
              filters={{ country: selectedCountry, tenant: selectedTenant }}
            />
          )}
        </div>

        {/* Main map area */}
        <div className="col-span-3">
          <EnhancedGeospatialMap
            topology={visibleNodes}
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
          <PredictiveRiskHighlight topology={visibleNodes} isEnabled={showPredictiveRisks} />
        </div>
      )}
    </div>
  );

  const renderTreeView = () => {
    const renderNode = (obj: typeof visibleNodes[0], level: number) => (
      <div key={obj.id} style={{ marginLeft: `${level * 16}px` }} className="mb-1">
        <button
          onClick={() => {
            if (obj.childrenIds.length > 0) {
              if (expandedNodes.has(obj.id)) {
                // Collapse
              } else {
                expandNode(obj.id);
              }
            }
            selectNode(obj.id);
          }}
          className="w-full text-left px-2 py-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition flex items-center gap-2 text-sm"
        >
          <span className={expandedNodes.has(obj.id) && obj.childrenIds.length > 0 ? 'rotate-90' : ''}>
            {obj.childrenIds.length > 0 ? '▶' : '•'}
          </span>
          <span className={`px-1.5 py-0.5 rounded text-xs font-semibold ${
            obj.healthState === 'healthy' ? 'bg-green-100 dark:bg-green-950 text-green-800 dark:text-green-300' :
            obj.healthState === 'degraded' ? 'bg-yellow-100 dark:bg-yellow-950 text-yellow-800 dark:text-yellow-300' :
            'bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300'
          }`}>
            {obj.type}
          </span>
          <span className="font-medium text-foreground">{obj.name}</span>
          <span className="ml-auto text-xs text-gray-500 dark:text-gray-500">{obj.alarmSummary.critical + obj.alarmSummary.major} alarms</span>
        </button>
        {expandedNodes.has(obj.id) && obj.childrenIds.length > 0 && (
          <div>
            {obj.childrenIds.map(childId => {
              const child = visibleNodes.find(o => o.id === childId);
              return child ? renderNode(child, level + 1) : null;
            })}
          </div>
        )}
      </div>
    );

    const roots = visibleNodes.filter(o => !o.parentId);
    return (
      <div className="w-full flex flex-col h-full gap-4 p-4 bg-background dark:bg-background overflow-y-auto">
        <h2 className="text-lg font-bold text-foreground">Hierarchical Tree View</h2>
        <div className="flex-1 bg-card rounded-lg border border-border p-4 overflow-y-auto">
          {roots.length > 0 ? roots.map(root => renderNode(root, 0)) : (
            <p className="text-sm text-gray-600">No nodes visible with current filters</p>
          )}
        </div>
      </div>
    );
  };

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
    <div className="flex flex-col h-screen bg-background">
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
      <div className="flex-1 overflow-hidden">
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
              <p className="text-muted-foreground">Visible: <strong>{stats.totalVisible}</strong> | Alarms: <strong>{stats.totalAlarms}</strong></p>
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
