import React, { useState } from 'react';
import { ArrowRight, Network } from 'lucide-react';

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

  const topologyPatterns: { id: TopologyPattern; label: string; description: string }[] = [
    { id: 'tree', label: 'Tree', description: 'Hierarchical topology' },
    { id: 'ring', label: 'Ring', description: 'Redundant ring topology' },
    { id: 'mesh', label: 'Mesh', description: 'Fully meshed network' },
    { id: 'star', label: 'Star', description: 'Hub-and-spoke topology' },
    { id: 'hybrid', label: 'Hybrid', description: 'Mixed topology patterns' },
    { id: 'p2p', label: 'Point-to-Point', description: 'Direct links' }
  ];

  const regions = ['Cairo', 'Alexandria', 'Giza', 'Suez', 'Mansoura'];

  // Generate mock paths based on topology type
  const generateMockPathsForTopology = (pattern: TopologyPattern): TransportPath[] => {
    const basePaths: Record<TopologyPattern, TransportPath[]> = {
      tree: [
        {
          source: 'Cairo',
          destination: 'Alexandria',
          type: 'fiber',
          protectionState: 'active',
          primary: [
            { name: 'Cairo-Core', type: 'Router', health: 'healthy', latency: 0, utilization: 45 },
            { name: 'Cairo-Hub', type: 'Optical Node', health: 'healthy', latency: 1.2, utilization: 50 },
            { name: 'Alexandria-Core', type: 'Router', health: 'healthy', latency: 3.8, utilization: 48 }
          ]
        },
        {
          source: 'Cairo',
          destination: 'Giza',
          type: 'fiber',
          protectionState: 'active',
          primary: [
            { name: 'Cairo-Core', type: 'Router', health: 'healthy', latency: 0, utilization: 35 },
            { name: 'Giza-Access', type: 'Switch', health: 'healthy', latency: 0.5, utilization: 40 }
          ]
        }
      ],
      ring: [
        {
          source: 'Cairo',
          destination: 'Alexandria',
          type: 'fiber',
          protectionState: 'active',
          primary: [
            { name: 'Cairo-Ring-Node1', type: 'Router', health: 'healthy', latency: 0, utilization: 55 },
            { name: 'Giza-Ring-Node', type: 'Router', health: 'healthy', latency: 2.1, utilization: 58 },
            { name: 'Alexandria-Ring-Node1', type: 'Router', health: 'healthy', latency: 4.6, utilization: 52 }
          ],
          backup: [
            { name: 'Cairo-Ring-Node1', type: 'Router', health: 'healthy', latency: 0, utilization: 10 },
            { name: 'Suez-Ring-Node', type: 'Router', health: 'healthy', latency: 5.8, utilization: 12 },
            { name: 'Alexandria-Ring-Node2', type: 'Router', health: 'healthy', latency: 10.4, utilization: 11 }
          ]
        }
      ],
      mesh: [
        {
          source: 'Cairo',
          destination: 'Alexandria',
          type: 'fiber',
          protectionState: 'active',
          primary: [
            { name: 'Cairo-Mesh-Core', type: 'Router', health: 'healthy', latency: 0, utilization: 62 },
            { name: 'Alexandria-Mesh-Core', type: 'Router', health: 'healthy', latency: 3.2, utilization: 60 }
          ],
          backup: [
            { name: 'Cairo-Mesh-Core', type: 'Router', health: 'healthy', latency: 0, utilization: 58 },
            { name: 'Giza-Mesh-Node', type: 'Router', health: 'healthy', latency: 1.8, utilization: 56 },
            { name: 'Suez-Mesh-Node', type: 'Router', health: 'healthy', latency: 6.5, utilization: 54 },
            { name: 'Alexandria-Mesh-Core', type: 'Router', health: 'healthy', latency: 8.3, utilization: 55 }
          ]
        }
      ],
      star: [
        {
          source: 'Cairo',
          destination: 'Alexandria',
          type: 'fiber',
          protectionState: 'active',
          primary: [
            { name: 'Cairo-Access', type: 'Switch', health: 'healthy', latency: 0, utilization: 40 },
            { name: 'Central-Hub', type: 'Core Router', health: 'healthy', latency: 2.5, utilization: 75 },
            { name: 'Alexandria-Access', type: 'Switch', health: 'healthy', latency: 5.1, utilization: 38 }
          ]
        },
        {
          source: 'Cairo',
          destination: 'Giza',
          type: 'fiber',
          protectionState: 'active',
          primary: [
            { name: 'Cairo-Access', type: 'Switch', health: 'healthy', latency: 0, utilization: 40 },
            { name: 'Central-Hub', type: 'Core Router', health: 'healthy', latency: 2.5, utilization: 75 },
            { name: 'Giza-Access', type: 'Switch', health: 'healthy', latency: 4.8, utilization: 35 }
          ]
        }
      ],
      hybrid: [
        {
          source: 'Cairo',
          destination: 'Alexandria',
          type: 'fiber',
          protectionState: 'active',
          primary: [
            { name: 'Cairo-Core', type: 'Router', health: 'healthy', latency: 0, utilization: 48 },
            { name: 'Cairo-Hub', type: 'Optical Node', health: 'healthy', latency: 1.5, utilization: 52 },
            { name: 'Giza-Node', type: 'Router', health: 'healthy', latency: 3.2, utilization: 50 },
            { name: 'Alexandria-Core', type: 'Router', health: 'healthy', latency: 5.8, utilization: 46 }
          ],
          backup: [
            { name: 'Cairo-Core', type: 'Router', health: 'healthy', latency: 0, utilization: 15 },
            { name: 'Suez-Node', type: 'Router', health: 'degraded', latency: 6.2, utilization: 18 },
            { name: 'Alexandria-Core', type: 'Router', health: 'healthy', latency: 9.4, utilization: 16 }
          ]
        }
      ],
      p2p: [
        {
          source: 'Cairo',
          destination: 'Alexandria',
          type: 'microwave',
          protectionState: 'active',
          primary: [
            { name: 'Cairo-P2P-TX', type: 'Microwave', health: 'healthy', latency: 0, utilization: 85 },
            { name: 'Alexandria-P2P-RX', type: 'Microwave', health: 'healthy', latency: 2.4, utilization: 83 }
          ]
        },
        {
          source: 'Cairo',
          destination: 'Suez',
          type: 'ip',
          protectionState: 'active',
          primary: [
            { name: 'Cairo-BGP', type: 'BGP Router', health: 'healthy', latency: 0, utilization: 42 },
            { name: 'Suez-BGP', type: 'BGP Router', health: 'healthy', latency: 3.7, utilization: 40 }
          ]
        }
      ]
    };

    return basePaths[pattern] || [];
  };

  // Mock transport paths - use generated data based on topology
  const mockPaths = generateMockPathsForTopology(topologyType);

  const selectedTransportPath = mockPaths.find(
    p => p.source === sourceRegion && p.destination === destRegion
  );

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy':
        return 'bg-green-100 dark:bg-green-950/30 text-green-800 dark:text-green-300 border-l-4 border-l-green-600';
      case 'degraded':
        return 'bg-yellow-100 dark:bg-yellow-950/30 text-yellow-800 dark:text-yellow-300 border-l-4 border-l-yellow-600';
      case 'down':
        return 'bg-red-100 dark:bg-red-950/30 text-red-800 dark:text-red-300 border-l-4 border-l-red-600';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border-l-4 border-l-gray-400';
    }
  };

  const getProtectionBadgeColor = (state: string) => {
    return state === 'active'
      ? 'bg-green-100 dark:bg-green-950/30 text-green-800 dark:text-green-300'
      : 'bg-yellow-100 dark:bg-yellow-950/30 text-yellow-800 dark:text-yellow-300';
  };

  const getLinkTypeLabel = (type: string) => {
    const labels = {
      'mpls': 'MPLS',
      'microwave': 'Microwave',
      'fiber': 'Fiber Optic',
      'ip': 'IP/Ethernet'
    };
    return labels[type as keyof typeof labels] || 'Unknown';
  };

  return (
    <div className="w-full h-full flex flex-col gap-4 p-4 bg-background overflow-y-auto">

      {/* Topology Pattern Selector */}
      <div className="bg-card rounded-lg border border-border p-4">
        <p className="text-sm font-semibold text-foreground mb-3">Topology Pattern</p>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {topologyPatterns.map(pattern => (
            <button
              key={pattern.id}
              onClick={() => setTopologyType(pattern.id)}
              className={`px-4 py-2 rounded text-sm font-semibold transition border ${
                topologyType === pattern.id
                  ? 'bg-blue-600 text-white border-blue-700 dark:bg-blue-700'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
              title={pattern.description}
            >
              {pattern.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mesh Filter */}
      <label className="flex items-center gap-2 px-4 py-2 bg-card rounded border border-border text-sm cursor-pointer hover:bg-muted/40 w-fit">
        <input
          type="checkbox"
          checked={showMeshOnly}
          onChange={(e) => setShowMeshOnly(e.target.checked)}
          className="w-4 h-4 rounded"
        />
        <span className="font-semibold text-foreground">Show Mesh Links Only</span>
      </label>

      {/* Path Trace Tool */}
      <div className="bg-card rounded-lg border border-border p-4">
        <h3 className="text-sm font-bold text-foreground mb-4">Path Trace Tool</h3>

        {/* Route Selection */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-2">Source</label>
            <select
              value={sourceRegion}
              onChange={(e) => setSourceRegion(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {regions.map(r => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-2">Destination</label>
            <select
              value={destRegion}
              onChange={(e) => setDestRegion(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {regions.map(r => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedTransportPath && (
          <div className="space-y-4">
            {/* Route Header */}
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-foreground">{selectedTransportPath.source}</span>
                <ArrowRight className="w-4 h-4 text-gray-400" />
                <span className="font-semibold text-foreground">{selectedTransportPath.destination}</span>
              </div>
              <span className={`px-3 py-1 rounded text-xs font-semibold ${getProtectionBadgeColor(selectedTransportPath.protectionState)}`}>
                {getLinkTypeLabel(selectedTransportPath.type)} • {selectedTransportPath.protectionState === 'active' ? 'Active' : 'Standby'}
              </span>
            </div>

            {/* Primary Path */}
            <div>
              <div className="mb-3">
                <p className="text-sm font-semibold text-foreground mb-2">Primary Path</p>
                <div className="space-y-2">
                  {selectedTransportPath.primary.map((hop, idx) => (
                    <div key={idx}>
                      <div className={`px-3 py-2 rounded text-sm ${getHealthColor(hop.health)}`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold">{hop.name}</p>
                            <p className="text-xs opacity-75">{hop.type}</p>
                          </div>
                          <div className="text-right text-xs">
                            <p className="font-semibold">{hop.latency}ms latency</p>
                            <p className="opacity-75">{hop.utilization}% utilization</p>
                          </div>
                        </div>
                      </div>
                      {idx < selectedTransportPath.primary.length - 1 && (
                        <div className="flex justify-center py-1">
                          <ArrowRight className="w-4 h-4 text-gray-400" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Backup Path */}
            {selectedTransportPath.backup && (
              <div>
                <div className="mb-3">
                  <p className="text-sm font-semibold text-foreground mb-2">Backup Path</p>
                  <div className="space-y-2">
                    {selectedTransportPath.backup.map((hop, idx) => (
                      <div key={idx}>
                        <div className={`px-3 py-2 rounded text-sm ${getHealthColor(hop.health)}`}>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold">{hop.name}</p>
                              <p className="text-xs opacity-75">{hop.type}</p>
                            </div>
                            <div className="text-right text-xs">
                              <p className="font-semibold">{hop.latency}ms latency</p>
                              <p className="opacity-75">{hop.utilization}% utilization</p>
                            </div>
                          </div>
                        </div>
                        {idx < selectedTransportPath.backup!.length - 1 && (
                          <div className="flex justify-center py-1">
                            <ArrowRight className="w-4 h-4 text-gray-400" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Path Summary */}
            <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded">
              <p className="text-xs font-semibold text-foreground mb-2">Path Summary</p>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <p className="text-muted-foreground">Total Hops</p>
                  <p className="font-semibold text-foreground">{selectedTransportPath.primary.length}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Primary Latency</p>
                  <p className="font-semibold text-foreground">
                    {selectedTransportPath.primary.reduce((sum, h) => sum + h.latency, 0).toFixed(1)}ms
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Link Type</p>
                  <p className="font-semibold text-foreground">{getLinkTypeLabel(selectedTransportPath.type)}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-700 rounded-lg">
        <h4 className="text-sm font-semibold text-foreground mb-2">About Transport Paths</h4>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• Select source and destination to trace end-to-end path</li>
          <li>• View primary and backup routes with health status</li>
          <li>• Monitor per-hop latency and link utilization</li>
          <li>• Identify redundancy and failure points</li>
        </ul>
      </div>
    </div>
  );
};
