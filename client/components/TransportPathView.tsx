import React, { useState } from 'react';
import { Link2, Route, Zap } from 'lucide-react';

type TopologyPattern = 'tree' | 'ring' | 'mesh' | 'star' | 'hybrid' | 'p2p';

interface PathHop {
  name: string;
  type: string;
  health: 'healthy' | 'degraded' | 'down';
  latency: number;
  utilization: number;
}

interface TransportPath {
  source: string;
  destination: string;
  primary: PathHop[];
  backup?: PathHop[];
  type: 'mpls' | 'microwave' | 'fiber' | 'ip';
  protectionState: 'active' | 'standby';
}

interface TransportPathViewProps {
  onPathSelect?: (path: TransportPath) => void;
}

export const TransportPathView: React.FC<TransportPathViewProps> = ({ onPathSelect }) => {
  const [topologyType, setTopologyType] = useState<TopologyPattern>('mesh');
  const [showMeshOnly, setShowMeshOnly] = useState(false);
  const [selectedPath, setSelectedPath] = useState<TransportPath | null>(null);
  const [sourceRegion, setSourceRegion] = useState('Cairo');
  const [destRegion, setDestRegion] = useState('Alexandria');

  const topologyPatterns: { id: TopologyPattern; label: string; icon: string; description: string }[] = [
    { id: 'tree', label: 'Tree', icon: '🌳', description: 'Hierarchical topology' },
    { id: 'ring', label: 'Ring', icon: '⭕', description: 'Redundant ring topology' },
    { id: 'mesh', label: 'Mesh', icon: '🕸️', description: 'Fully meshed network' },
    { id: 'star', label: 'Star', icon: '⭐', description: 'Hub-and-spoke topology' },
    { id: 'hybrid', label: 'Hybrid', icon: '🔄', description: 'Mixed topology patterns' },
    { id: 'p2p', label: 'Point-to-Point', icon: '↔️', description: 'Direct links' }
  ];

  const regions = ['Cairo', 'Alexandria', 'Giza', 'Suez', 'Mansoura'];

  // Mock transport paths
  const mockPaths: TransportPath[] = [
    {
      source: 'Cairo',
      destination: 'Alexandria',
      type: 'fiber',
      protectionState: 'active',
      primary: [
        { name: 'Cairo-Core', type: 'Router', health: 'healthy', latency: 0, utilization: 45 },
        { name: 'Giza-Hub', type: 'Optical Node', health: 'healthy', latency: 2.5, utilization: 55 },
        { name: 'Alexandria-Core', type: 'Router', health: 'healthy', latency: 5.2, utilization: 48 }
      ],
      backup: [
        { name: 'Cairo-Core', type: 'Router', health: 'healthy', latency: 0, utilization: 10 },
        { name: 'Suez-Hub', type: 'Optical Node', health: 'healthy', latency: 8.5, utilization: 8 },
        { name: 'Alexandria-Core', type: 'Router', health: 'healthy', latency: 13.7, utilization: 9 }
      ]
    },
    {
      source: 'Cairo',
      destination: 'Suez',
      type: 'microwave',
      protectionState: 'active',
      primary: [
        { name: 'Cairo-MW', type: 'Microwave', health: 'healthy', latency: 0, utilization: 72 },
        { name: 'Suez-MW', type: 'Microwave', health: 'degraded', latency: 3.1, utilization: 75 }
      ]
    }
  ];

  const selectedTransportPath = mockPaths.find(
    p => p.source === sourceRegion && p.destination === destRegion
  );

  const getProtectionIcon = (state: string) => {
    return state === 'active' ? '🟢' : '🟡';
  };

  const getLinkTypeIcon = (type: string) => {
    const icons = {
      'mpls': '🏷️',
      'microwave': '📡',
      'fiber': '🔗',
      'ip': '🌐'
    };
    return icons[type as keyof typeof icons] || '?';
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'bg-green-100 text-green-800';
      case 'degraded': return 'bg-yellow-100 text-yellow-800';
      case 'down': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="w-full h-full flex flex-col gap-4 p-4 bg-gray-50 overflow-y-auto">
      <h2 className="text-lg font-bold text-gray-900">Transport & Path Visualization</h2>

      {/* Topology Pattern Selector */}
      <div className="bg-white rounded-lg border border-gray-200 p-3">
        <p className="text-xs font-semibold text-gray-700 mb-2">Topology Pattern</p>
        <div className="grid grid-cols-6 gap-2">
          {topologyPatterns.map(pattern => (
            <button
              key={pattern.id}
              onClick={() => setTopologyType(pattern.id)}
              className={`px-2 py-2 rounded text-center transition flex flex-col items-center justify-center gap-1 ${
                topologyType === pattern.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              title={pattern.description}
            >
              <span className="text-lg">{pattern.icon}</span>
              <span className="text-xs font-semibold">{pattern.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Mesh Filter */}
      <label className="flex items-center gap-2 px-3 py-1.5 bg-white rounded border border-gray-200 text-xs cursor-pointer hover:bg-gray-50 w-fit">
        <input
          type="checkbox"
          checked={showMeshOnly}
          onChange={(e) => setShowMeshOnly(e.target.checked)}
          className="w-3 h-3 rounded"
        />
        <span className="font-semibold text-gray-700">Show Mesh Links Only</span>
      </label>

      {/* Path Trace Tool */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-bold text-gray-900 mb-3">Path Trace Tool</h3>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Source</label>
            <select
              value={sourceRegion}
              onChange={(e) => setSourceRegion(e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {regions.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Destination</label>
            <select
              value={destRegion}
              onChange={(e) => setDestRegion(e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {regions.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>

        {selectedTransportPath && (
          <div className="space-y-3">
            {/* Path Header */}
            <div className="flex items-center gap-2 pb-3 border-b border-gray-200">
              <span className="text-sm font-semibold text-gray-900">
                {selectedTransportPath.source} → {selectedTransportPath.destination}
              </span>
              <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded font-semibold">
                {getLinkTypeIcon(selectedTransportPath.type)} {selectedTransportPath.type.toUpperCase()}
              </span>
            </div>

            {/* Primary Path */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-sm font-bold ${selectedTransportPath.protectionState === 'active' ? 'text-green-700' : 'text-yellow-700'}`}>
                  {getProtectionIcon(selectedTransportPath.protectionState)} Primary Path
                </span>
              </div>
              <div className="space-y-1 ml-2">
                {selectedTransportPath.primary.map((hop, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs">
                    {idx > 0 && <span className="text-gray-400">→</span>}
                    <span className={`px-2 py-0.5 rounded font-semibold ${getHealthColor(hop.health)}`}>
                      {hop.name}
                    </span>
                    <span className="text-gray-600 text-xs">
                      {hop.latency}ms • {hop.utilization}% util
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Backup Path */}
            {selectedTransportPath.backup && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-bold text-yellow-700">
                    🟡 Backup Path (Standby)
                  </span>
                </div>
                <div className="space-y-1 ml-2">
                  {selectedTransportPath.backup.map((hop, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs">
                      {idx > 0 && <span className="text-gray-400">→</span>}
                      <span className={`px-2 py-0.5 rounded font-semibold ${getHealthColor(hop.health)}`}>
                        {hop.name}
                      </span>
                      <span className="text-gray-600 text-xs">
                        {hop.latency}ms • {hop.utilization}% util
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Summary */}
            <div className="p-2 bg-blue-50 rounded text-xs text-blue-900">
              <p className="font-semibold mb-1">Path Summary</p>
              <p>Total hops: {selectedTransportPath.primary.length + (selectedTransportPath.backup?.length || 0)}</p>
              <p>Primary latency: {selectedTransportPath.primary.reduce((sum, h) => sum + h.latency, 0).toFixed(1)}ms</p>
              <p>Link type: {selectedTransportPath.type.toUpperCase()}</p>
            </div>
          </div>
        )}
      </div>

      {/* Transport Engineer Info */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <Route className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-purple-900">
            <p className="font-semibold mb-1">For Transport Engineers:</p>
            <ul className="space-y-0.5">
              <li>• Select topology pattern to visualize network structure</li>
              <li>• Use Path Trace to view complete routes with latency/utilization</li>
              <li>• See primary and backup paths with protection status</li>
              <li>• Monitor per-hop health and congestion indicators</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
