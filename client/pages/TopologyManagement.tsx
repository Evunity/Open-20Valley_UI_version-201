import React, { useState } from 'react';
import { Map, Tree, Network, Box, Layers, ZoomIn } from 'lucide-react';
import { generateMockTopologyHierarchy, TopologyObject } from '../utils/topologyData';

type ViewType = 'map' | 'tree' | 'dependency' | 'rack';

interface TopologyViewConfig {
  id: ViewType;
  label: string;
  icon: React.FC<any>;
  description: string;
}

const VIEWS: TopologyViewConfig[] = [
  { id: 'map', label: 'Geospatial Map', icon: Map, description: 'Global network map with geo coordinates' },
  { id: 'tree', label: 'Tree View', icon: Tree, description: 'Hierarchical network structure' },
  { id: 'dependency', label: 'Dependency Graph', icon: Network, description: 'Upstream/downstream relationships' },
  { id: 'rack', label: 'Site & Rack', icon: Box, description: 'Physical hardware layout' }
];

export const TopologyManagement: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewType>('map');
  const [topology] = useState<TopologyObject[]>(generateMockTopologyHierarchy());
  const [selectedObject, setSelectedObject] = useState<TopologyObject | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [zoomLevel, setZoomLevel] = useState(1);

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
    <div className="w-full h-full flex flex-col gap-4 p-4 bg-gray-50 overflow-y-auto">
      <h2 className="text-lg font-bold text-gray-900">Global Geospatial Map</h2>
      
      {/* Map Legend */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <p className="text-xs font-semibold text-gray-700 mb-3">Vendor Legend</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { vendor: 'Nokia', color: 'border-blue-500', fill: 'bg-blue-100' },
            { vendor: 'Ericsson', color: 'border-black', fill: 'bg-gray-100' },
            { vendor: 'Huawei', color: 'border-red-500', fill: 'bg-red-100' },
            { vendor: 'ZTE', color: 'border-orange-500', fill: 'bg-orange-100' }
          ].map(item => (
            <div key={item.vendor} className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded-full border-2 ${item.color} ${item.fill}`} />
              <span className="text-xs text-gray-700">{item.vendor}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Map Canvas */}
      <div className="flex-1 bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-center">
        <div className="text-center">
          <Map className="w-16 h-16 text-gray-400 mx-auto mb-3 opacity-50" />
          <p className="text-sm font-semibold text-gray-600 mb-1">Interactive Geospatial Map</p>
          <p className="text-xs text-gray-500">
            Zoomed View: {zoomLevel}x • {topology.length} network objects
          </p>
          <div className="flex gap-2 justify-center mt-3">
            <button
              onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.1))}
              className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded hover:bg-gray-200 transition"
            >
              Zoom Out
            </button>
            <button
              onClick={() => setZoomLevel(Math.min(3, zoomLevel + 0.1))}
              className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded hover:bg-gray-200 transition"
            >
              Zoom In
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTreeView = () => {
    const renderNode = (obj: TopologyObject, level: number) => (
      <div key={obj.id} style={{ marginLeft: `${level * 16}px` }} className="mb-1">
        <button
          onClick={() => {
            toggleNode(obj.id);
            setSelectedObject(obj);
          }}
          className="w-full text-left px-2 py-1.5 rounded hover:bg-gray-100 transition flex items-center gap-2 text-sm"
        >
          <span className={expandedNodes.has(obj.id) && obj.childrenIds.length > 0 ? 'rotate-90' : ''}>
            {obj.childrenIds.length > 0 ? '▶' : '•'}
          </span>
          <span className={`px-1.5 py-0.5 rounded text-xs font-semibold ${
            obj.healthState === 'healthy' ? 'bg-green-100 text-green-800' :
            obj.healthState === 'degraded' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {obj.type}
          </span>
          <span className="font-medium text-gray-900">{obj.name}</span>
          <span className="ml-auto text-xs text-gray-500">{obj.alarmSummary.critical + obj.alarmSummary.major} alarms</span>
        </button>
        {expandedNodes.has(obj.id) && obj.childrenIds.length > 0 && (
          <div>
            {obj.childrenIds.map(childId => {
              const child = topology.find(o => o.id === childId);
              return child ? renderNode(child, level + 1) : null;
            })}
          </div>
        )}
      </div>
    );

    const roots = topology.filter(o => !o.parentId);
    return (
      <div className="w-full flex flex-col h-full gap-4 p-4 bg-gray-50 overflow-y-auto">
        <h2 className="text-lg font-bold text-gray-900">Hierarchical Tree View</h2>
        <div className="flex-1 bg-white rounded-lg border border-gray-200 p-4 overflow-y-auto">
          {roots.map(root => renderNode(root, 0))}
        </div>
      </div>
    );
  };

  const renderDependencyView = () => (
    <div className="w-full h-full flex flex-col gap-4 p-4 bg-gray-50 overflow-y-auto">
      <h2 className="text-lg font-bold text-gray-900">Logical Dependency Graph</h2>
      <div className="flex-1 bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-center">
        <div className="text-center max-w-md">
          <Network className="w-16 h-16 text-gray-400 mx-auto mb-3 opacity-50" />
          <p className="text-sm font-semibold text-gray-600 mb-2">Dependency Relationships</p>
          <p className="text-xs text-gray-500 mb-4">
            Visualizes upstream/downstream dependencies. Click a node to see its impact chain.
          </p>
          {selectedObject && (
            <div className="text-left bg-gray-50 rounded p-3 mt-4">
              <p className="text-xs font-semibold text-gray-700 mb-2">Selected: {selectedObject.name}</p>
              <p className="text-xs text-gray-600">
                {selectedObject.childrenIds.length} downstream dependencies
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderRackView = () => (
    <div className="w-full h-full flex flex-col gap-4 p-4 bg-gray-50 overflow-y-auto">
      <h2 className="text-lg font-bold text-gray-900">Physical Site & Rack View</h2>
      <div className="flex-1 bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-center">
        <div className="text-center max-w-md">
          <Box className="w-16 h-16 text-gray-400 mx-auto mb-3 opacity-50" />
          <p className="text-sm font-semibold text-gray-600 mb-2">Hardware Visualization</p>
          <p className="text-xs text-gray-500 mb-4">
            Physical layout: Cabinet → Rack → Shelf → Board → RRU/BBU
          </p>
          <div className="text-left bg-gray-50 rounded p-3 mt-4 text-xs text-gray-700">
            <p className="font-semibold mb-1">Rack Features:</p>
            <ul className="space-y-0.5">
              <li>✓ Power system monitoring</li>
              <li>✓ Temperature sensors</li>
              <li>✓ Port-level packet loss</li>
              <li>✓ RRU/BBU health status</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const currentView = activeView === 'map' ? renderMapView() :
                      activeView === 'tree' ? renderTreeView() :
                      activeView === 'dependency' ? renderDependencyView() :
                      renderRackView();

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900">Topology & Network Visualization</h1>
        <p className="text-sm text-gray-600 mt-1">Single source of structural truth for network topology</p>
      </div>

      {/* View Selector */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex gap-2">
          {VIEWS.map(view => {
            const Icon = view.icon;
            return (
              <button
                key={view.id}
                onClick={() => setActiveView(view.id)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2 ${
                  activeView === view.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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

      {/* Footer Info */}
      {selectedObject && (
        <div className="bg-white border-t border-gray-200 px-6 py-3">
          <div className="flex items-center justify-between text-xs">
            <div>
              <span className="font-semibold text-gray-900">{selectedObject.name}</span>
              <span className="text-gray-600 ml-2">({selectedObject.type})</span>
              {selectedObject.vendor && <span className="text-gray-600 ml-2">• {selectedObject.vendor}</span>}
            </div>
            <div className="flex gap-4">
              <span>Health: <strong>{selectedObject.healthState}</strong></span>
              <span>Alarms: <strong>{selectedObject.alarmSummary.critical}C/{selectedObject.alarmSummary.major}M</strong></span>
              <span>Availability: <strong>{selectedObject.kpiSummary.availability.toFixed(2)}%</strong></span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
